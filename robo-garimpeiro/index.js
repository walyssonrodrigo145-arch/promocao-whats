const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cron = require('node-cron');
const fs = require('fs');
puppeteer.use(StealthPlugin());

const VPS_ENDPOINT = 'https://promo.wrmusicpro.com.br/collector/receive-offer';
const MAX_OFFERS_TO_SCRAPE = 10;
const HISTORY_FILE = './historico_produtos.json';

let isRunning = false;

async function runScraper() {
  if (isRunning) {
    console.log('⏳ O robô já está em execução no momento. Pulando este ciclo.');
    return;
  }
  
  isRunning = true;
  console.log('\n🤖 [START] Garimpeiro de Afiliados Iniciado!');
  
  const browser = await puppeteer.launch({
    headless: false, // <- TEM QUE SER FALSE. O Mercado Livre bloqueia o modo fantasma!
    defaultViewport: null,
    userDataDir: './perfil_chrome_robo',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
  });
  
  // Garantir permissão para ler/escrever na área de transferência (Clipboard)
  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://www.mercadolivre.com.br', ['clipboard-read', 'clipboard-write']);

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    console.log('🔎 Acessando a Central de Afiliados do Mercado Livre...');
    await page.goto('https://www.mercadolivre.com.br/afiliados/hub?is_affiliate=true#menu-user', { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('👀 Aguardando o carregamento da lista de produtos (carregando um lote grande)...');
    
    // Rola a página para forçar o carregamento dos itens da lista
    for (let i = 0; i < 15; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await new Promise(r => setTimeout(r, 1000));
    }

    // Carregar histórico
    let history = [];
    if (fs.existsSync(HISTORY_FILE)) {
      try { history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); } catch (e) {}
    }

    // Procura todos os botões que contenham a palavra "Compartilhar"
    const shareButtons = await page.$$('::-p-xpath(//button[contains(translate(., "COMPARTILHAR", "compartilhar"), "compartilhar") or contains(., "Compartilhar")])');
    
    if (shareButtons.length === 0) {
      throw new Error('Nenhum botão de Compartilhar foi encontrado na tela de afiliados! Verifique se a página carregou os produtos corretamente.');
    }

    console.log(`✅ Incrível! O robô localizou ${shareButtons.length} botões de compartilhamento na tela.`);
    console.log(`🔥 Procurando ${MAX_OFFERS_TO_SCRAPE} produtos INÉDITOS para enviar...\n`);

    let processedCount = 0;
    let btnIndex = 0;

    while (processedCount < MAX_OFFERS_TO_SCRAPE && btnIndex < shareButtons.length) {
      const currentIndex = btnIndex;
      btnIndex++;
      
      try {
        // Obter os botões novamente porque a DOM pode ter se atualizado após o modal fechar
        const currentButtons = await page.$$('::-p-xpath(//button[contains(translate(., "COMPARTILHAR", "compartilhar"), "compartilhar") or contains(., "Compartilhar")])');
        if (!currentButtons[currentIndex]) continue;
        
        // Heurística à prova de balas para obter informações do produto
        const productInfo = await page.evaluate((btn) => {
          let curr = btn;
          let card = null;
          // Sobe na árvore DOM até achar o container que tem a foto do produto
          while (curr && curr !== document.body) {
              if (curr.querySelector('img')) {
                  card = curr;
                  break;
              }
              curr = curr.parentElement;
          }
          
          let title = "Oferta Imperdível";
          let pictureUrl = "";
          let price = 0.01;
          
          if (card) {
              const img = card.querySelector('img');
              if (img) {
                  pictureUrl = img.src;
                  title = img.alt || "Oferta Imperdível";
              }
              
              // Tenta pegar o preço exato usando seletores precisos do ML
              const currentPriceEl = card.querySelector('.poly-price__current .andes-money-amount__fraction, .andes-price-display__fraction, .andes-money-amount__fraction');
              if (currentPriceEl) {
                  const numStr = currentPriceEl.innerText.replace(/\./g, '');
                  const p = parseFloat(numStr);
                  if (!isNaN(p) && p > 0) price = p;
              }

              // Busca textos na caixa para achar o título (geralmente texto > 15 chars)
              const allElements = Array.from(card.querySelectorAll('*'));
              for (const el of allElements) {
                  const t = el.innerText ? el.innerText.trim() : '';
                  if (t.length > 15 && !t.includes('Compartilhar') && !t.includes('R$') && title === "Oferta Imperdível") {
                      title = t;
                  }
                  // Fallback para preço apenas se o seletor falhar, ignorando parcelamentos (x) e mantendo o menor preço
                  if (price === 0.01 && t.includes('R$') && !t.toLowerCase().includes('x')) {
                      const num = t.replace(/[^0-9,]/g, '').replace(',', '.');
                      if (num) {
                          const p = parseFloat(num);
                          if (p > 0) price = p;
                      }
                  }
              }
          }
          return { title, pictureUrl, price };
        }, currentButtons[currentIndex]);

        if (productInfo.title && productInfo.title !== "Oferta Imperdível") {
            // Verificar no histórico
            if (history.includes(productInfo.title)) {
                console.log(`⏭️  Pulando: "${productInfo.title}" (já foi postado antes).`);
                continue;
            }
        }

        console.log(`\n🛒 [Oferta Inédita ${processedCount + 1}/${MAX_OFFERS_TO_SCRAPE}] Acionando botão de Compartilhar...`);
        console.log(`📦 Extraído da Tela: ${productInfo.title} (R$ ${productInfo.price})`);

        // 1. Clicar em Compartilhar e Interceptar a Rede!
        let interceptedLink = null;
        const responseHandler = async (response) => {
            try {
                if (response.request().resourceType() === 'fetch' || response.request().resourceType() === 'xhr') {
                    const text = await response.text();
                    const match = text.match(/https?:\/\/(?:www\.)?(?:mercadolivre\.com\.br\/sec|meli\.la)\/[a-zA-Z0-9_-]+/i);
                    if (match) interceptedLink = match[0];
                }
            } catch (e) {}
        };
        page.on('response', responseHandler);

        await currentButtons[currentIndex].click();
        
        // Aguarda a resposta da rede gerar o link
        for (let j = 0; j < 10; j++) {
            await new Promise(r => setTimeout(r, 400));
            if (interceptedLink) break;
        }
        
        page.off('response', responseHandler);

        let finalLink = interceptedLink;

        // Fallback: Se a rede falhar, tentaremos copiar via botão (que também já deve estar na tela agora)
        if (!finalLink) {
           console.log("⚠️ Link não encontrado na rede. Tentando extrair do botão Copiar...");
           const copyButtons = await page.$$('::-p-xpath(//button[contains(., "Copiar link")])');
           if (copyButtons.length > 0) {
             await copyButtons[0].click();
             await new Promise(r => setTimeout(r, 1000));
             finalLink = await page.evaluate(async () => {
                try { return await navigator.clipboard.readText(); } catch (e) { return null; }
             });
           }
        }

        if (!finalLink || !finalLink.includes('http')) {
           console.log("❌ Falha crítica: O link não pôde ser gerado ou copiado.");
           await page.keyboard.press('Escape');
           continue;
        }

        const offerDetails = {
           id: finalLink.split('/').pop() || 'MLB',
           title: productInfo.title,
           price: productInfo.price || 0.01,
           pictureUrl: productInfo.pictureUrl,
           permalink: finalLink // AQUI VAI O SEU LINK CURTO COMISSIONADO!
        };

        console.log(`🔗 Link de Afiliado Capturado: ${offerDetails.permalink}`);
        console.log('🚀 Enviando pacote para o Cérebro IA (VPS)...');
        
        const response = await fetch(VPS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(offerDetails)
        });

        const result = await response.json().catch(() => null);
        console.log(`✅ A VPS confirmou o recebimento (Status HTTP ${response.status})!`);
        
        // Salva no histórico para não repetir
        if (productInfo.title && productInfo.title !== "Oferta Imperdível") {
           history.push(productInfo.title);
        }
        
        // Fechar o modal
        await page.keyboard.press('Escape');
        
        processedCount++;

        // Atraso de segurança de 1 minuto para o WhatsApp não banir por SPAM
        if (processedCount < MAX_OFFERS_TO_SCRAPE) {
           console.log('⏳ Pausa de segurança de 1 MINUTO para evitar bloqueio por SPAM no WhatsApp...');
           await new Promise(r => setTimeout(r, 60000));
        }

      } catch (err) {
        console.error(`❌ Falha técnica ao processar a oferta na posição ${currentIndex + 1}: ${err.message}`);
        await page.keyboard.press('Escape'); // Tentar limpar a tela em caso de erro
      }
      
      console.log('--------------------------------------------------');
    }

    // Salva o arquivo de histórico
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');

    console.log(`\n🎉 SUCESSO! Varredura de Afiliados finalizada. ${processedCount} produtos inéditos processados!`);

  } catch (error) {
    console.error('\n❌ Erro Geral no Garimpo:', error.message);
  } finally {
    console.log('🧹 Encerrando as atividades do Robô e fechando as telas...');
    await browser.close();
    console.log('🏁 Operação Concluída.');
    isRunning = false;
  }
}

// Configuração do Agendador (Cron)
// Padrão do cron: "Minuto Hora Dia Mes Dia_da_semana"
const SCHEDULE_REGULAR = '0 8,10,12,14,16,18,20 * * *';
const SCHEDULE_TESTE = '15 0 * * *'; // Horário de teste (00:15)

console.log('====================================================');
console.log('🕒 ROBÔ GARIMPEIRO ATIVADO NO MODO 24/7');
console.log('📅 Horários agendados: 08h, 10h, 12h, 14h, 16h, 18h e 20h');
console.log('🛠️  Horário extra de teste ativado: 00:15');
console.log('⚠️  Deixe esta janela preta aberta (se fechar, ele para de rodar).');
console.log('====================================================\n');
console.log('💤 Aguardando pacientemente o próximo horário...');

cron.schedule(SCHEDULE_REGULAR, () => {
  runScraper();
});

cron.schedule('15 00 * * *', () => {
  console.log('⏰ Horário de TESTE atingido (00:15)! Iniciando...');
  runScraper();
});

cron.schedule('10 12 * * *', () => {
  console.log('⏰ Horário de TESTE atingido (12:10)! Iniciando...');
  runScraper();
});

// ============================================================================
// LABORATORY QUEUE POLLING
// Verifica a cada 5 segundos se a equipe enviou algum link lá no painel da VPS
// ============================================================================

async function pollLaboratoryTasks() {
  if (isRunning) return; // Não interrompe se o garimpo estiver rodando

  try {
    const res = await fetch('https://promo.wrmusicpro.com.br/collector/laboratory/pending-tasks');
    if (!res.ok) return;
    const { task } = await res.json();
    
    if (task && task.id) {
       console.log(`\n🛎️ [LABORATÓRIO] Nova tarefa recebida da equipe! URL: ${task.url}`);
       isRunning = true;
       await processLaboratoryTask(task);
       isRunning = false;
    }
  } catch (e) {
    // Falhas de rede na verificação silenciosa são ignoradas
  }
}

async function processLaboratoryTask(task) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // <- TEM QUE SER FALSE. ML bloqueia modo fantasma.
      defaultViewport: null,
      userDataDir: './perfil_chrome_robo',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    let finalUrl = task.url;

    // Se for um link cru do ML (e não um link já encurtado meli.la), o robô gera o link de afiliado primeiro
    if (finalUrl.includes('mercadolivre.com.br') && !finalUrl.includes('meli.la')) {
        console.log(`[LABORATÓRIO] Link cru detectado. Acessando Gerador de Links de Afiliado...`);
        try {
            await page.goto('https://www.mercadolivre.com.br/afiliados/linkbuilder#hub', { waitUntil: 'networkidle2', timeout: 30000 });
            
            // Espera a caixa de texto para inserir a URL aparecer
            await page.waitForSelector('textarea', { timeout: 15000 });
            console.log(`[LABORATÓRIO] Colando a URL original...`);
            await page.type('textarea', finalUrl);
            
            // Procura e clica no botão "Gerar"
            const btnGerar = await page.$('::-p-xpath(//button[contains(., "Gerar")])');
            if (btnGerar) {
                console.log(`[LABORATÓRIO] Clicando em Gerar...`);
                await btnGerar.click();
                
                // Espera o botão "Copiar" aparecer como sinal de sucesso
                await page.waitForSelector('::-p-xpath(//button[contains(., "Copiar")])', { timeout: 15000 });
                
                // Dá 1 segundinho extra pro React renderizar o link na tela
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Extrai o link encurtado gerado caçando em todo o HTML
                const generatedLink = await page.evaluate(() => {
                    // Tenta achar em inputs primeiro
                    const inputs = document.querySelectorAll('input');
                    for (let input of inputs) {
                        if (input.value && input.value.includes('meli.la')) {
                            return input.value;
                        }
                    }
                    // Se não achar, procura em todo o HTML da página
                    const html = document.body.innerHTML;
                    const match = html.match(/https?:\/\/meli\.la\/[a-zA-Z0-9]+/);
                    return match ? match[0] : null;
                });
                
                if (generatedLink) {
                    console.log(`[LABORATÓRIO] ✅ Link convertido com sucesso para: ${generatedLink}`);
                    finalUrl = generatedLink; // Substitui o link original pelo link de afiliado!
                } else {
                    console.log(`[LABORATÓRIO] ⚠️ Falha ao ler o link gerado na tela.`);
                }
            } else {
                console.log(`[LABORATÓRIO] ⚠️ Botão "Gerar" não encontrado.`);
            }
        } catch (linkErr) {
            console.error(`[LABORATÓRIO] ⚠️ Erro ao tentar gerar link de afiliado: ${linkErr.message}. Continuando com link original.`);
        }
    }

    console.log(`[LABORATÓRIO] Acessando link final do produto: ${finalUrl}`);
    await page.goto(finalUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Aguarda um pouco pro React renderizar o corpo da página (seja produto ou vitrine)
    await new Promise(r => setTimeout(r, 2000));

    // Se for vitrine (meli.la -> social), clica no produto principal
    if (page.url().includes('/social/')) {
        console.log(`[LABORATÓRIO] Detectada vitrine (/social/). Procurando botão 'Ir para produto'...`);
        
        // Tenta achar o botão azul "Ir para produto"
        const btnIrParaProduto = await page.$('::-p-xpath(//a[contains(., "Ir para produto")] | //button[contains(., "Ir para produto")])');
        
        if (btnIrParaProduto) {
           console.log(`[LABORATÓRIO] Botão 'Ir para produto' encontrado! Redirecionando...`);
           const href = await page.evaluate(el => el.href, btnIrParaProduto);
           if (href) {
               await page.goto(href, { waitUntil: 'networkidle2', timeout: 30000 });
           } else {
               await Promise.all([
                  page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
                  btnIrParaProduto.click()
               ]);
           }
        } else {
           console.log(`[LABORATÓRIO] Botão não encontrado. Acessando o primeiro produto da lista...`);
           const firstProduct = await page.$('.poly-card__content a');
           if (firstProduct) {
              const pHref = await page.evaluate(el => el.href, firstProduct);
              if (pHref) {
                  await page.goto(pHref, { waitUntil: 'networkidle2', timeout: 30000 });
              } else {
                  await Promise.all([
                     page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
                     firstProduct.click()
                  ]);
              }
           }
        }
    }
    // Espera o título do produto carregar (garante que a página renderizou)
    await page.waitForSelector('.ui-pdp-title', { timeout: 10000 }).catch(() => {});

    const data = await page.evaluate(() => {
       const title = document.querySelector('.ui-pdp-title')?.innerText || '';
       
       // Estratégia 1: Tentar pegar o preço exato do Meta Tag (Schema.org)
       let priceMeta = document.querySelector('meta[itemprop="price"]')?.content;
       let price = parseFloat(priceMeta);
       
       // Estratégia 2: Pegar da div principal de preço promocional (ignorando o valor original riscado)
       if (!price || isNaN(price)) {
           const priceStr = document.querySelector('.ui-pdp-price__second-line .andes-money-amount__fraction')?.innerText || 
                            document.querySelector('.andes-money-amount__fraction')?.innerText || '0';
           price = parseFloat(priceStr.replace(/\./g, ''));
       }

       // Estratégia 3: Pegar o valor original riscado e desconto
       let originalPrice = null;
       let discountPercentage = null;
       const origNode = document.querySelector('s.andes-money-amount') || document.querySelector('.ui-pdp-price__original-value.andes-money-amount');
       if (origNode) {
           const frac = origNode.querySelector('.andes-money-amount__fraction')?.innerText.replace(/\./g, '') || '0';
           const cents = origNode.querySelector('.andes-money-amount__cents')?.innerText || '00';
           originalPrice = parseFloat(`${frac}.${cents}`);
       }
       const discountNode = document.querySelector('.ui-pdp-price__main-container .ui-pdp-label-as-pill');
       if (discountNode && discountNode.innerText.includes('%')) {
           discountPercentage = discountNode.innerText.trim();
       }

       const img = document.querySelector('.ui-pdp-gallery__figure__image')?.src || '';
       return { title, price, originalPrice, discountPercentage, pictureUrl: img };
    });

    data.permalink = finalUrl;

    console.log(`[LABORATÓRIO] Dados extraídos: ${data.title} (R$ ${data.price})`);

    if (!data.title) throw new Error("Não foi possível extrair o título. Página inválida ou bloqueada.");

    await fetch('https://promo.wrmusicpro.com.br/collector/laboratory/submit-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        taskId: task.id, 
        scrapedData: { ...data, permalink: finalUrl } 
      })
    });
    console.log(`[LABORATÓRIO] Tarefa ${task.id} devolvida para a VPS com sucesso!`);

  } catch (err) {
    console.error(`[LABORATÓRIO] Erro ao processar tarefa: ${err.message}`);
    await fetch('https://promo.wrmusicpro.com.br/collector/laboratory/submit-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        taskId: task.id, 
        scrapedData: { error: err.message } 
      })
    });
  } finally {
    if (browser) {
        try {
            const pages = await browser.pages();
            for (const p of pages) {
                await p.close().catch(() => {});
            }
        } catch (e) {}
        await browser.close();
    }
  }
}

// Inicia o Polling de 5 em 5 segundos
setInterval(pollLaboratoryTasks, 5000);
console.log('📡 Listener do Laboratório ativado (Polling VPS a cada 5s)...');
