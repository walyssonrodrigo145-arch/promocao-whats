const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const VPS_ENDPOINT = 'https://promo.wrmusicpro.com.br/collector/receive-offer';
const MAX_OFFERS_TO_SCRAPE = 5;

async function runScraper() {
  console.log('🤖 Garimpeiro em Lote Iniciado (Modo Varredura de Ofertas)!');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: './perfil_chrome_robo',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    console.log('🔎 Acessando a página central de Ofertas do Dia do Mercado Livre...');
    await page.goto('https://www.mercadolivre.com.br/ofertas', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    console.log('👀 Mapeando todos os links de produtos em promoção na tela...');
    
    // Rola a página multiplas vezes para forçar o carregamento de imagens e links (Mercado Livre usa muuuuito lazy load)
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 1000));
      await new Promise(r => setTimeout(r, 1000));
    }

    const productLinks = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a'));
      const uniqueUrls = new Set();
      
      for (const link of allLinks) {
        const href = link.href;
        if (!href) continue;
        
        // Verifica se é um produto real (Qualquer URL do ML que tenha 'MLB' no código do produto ou '/p/')
        if (href.includes('MLB') || href.includes('/p/')) {
          // Bloqueia links de filtro e categorias
          if (!href.includes('_Loja_') && !href.includes('ofertas?') && !href.includes('/c/')) {
            // Remove o tracking do Mercado Livre para ficar uma URL limpa
            const cleanUrl = href.split('?')[0].split('#')[0];
            uniqueUrls.add(cleanUrl);
          }
        }
      }
      return Array.from(uniqueUrls);
    });

    if (productLinks.length === 0) {
      throw new Error('Nenhum link de oferta encontrado na página inicial!');
    }

    const linksToProcess = productLinks.slice(0, MAX_OFFERS_TO_SCRAPE);
    console.log(`✅ Incrível! O robô localizou ${productLinks.length} links válidos.`);
    console.log(`🔥 Separando os ${linksToProcess.length} primeiros para envio à VPS...\n`);

    for (let i = 0; i < linksToProcess.length; i++) {
      const currentUrl = linksToProcess[i];
      console.log(`🛒 [Oferta ${i + 1}/${linksToProcess.length}] Acessando: ${currentUrl}`);
      
      try {
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        const offerDetails = await page.evaluate(() => {
          const titleEl = document.querySelector('h1.ui-pdp-title');
          const title = titleEl ? titleEl.innerText : 'Oferta do Dia';
          
          const priceMeta = document.querySelector('meta[itemprop="price"]');
          let price = priceMeta ? parseFloat(priceMeta.getAttribute('content')) : 0;
          if (!price) {
            const priceFraction = document.querySelector('.ui-pdp-price__second-line .andes-money-amount__fraction');
            if (priceFraction) price = parseFloat(priceFraction.innerText.replace('.', '').replace(',', '.'));
          }

          const imgEl = document.querySelector('.ui-pdp-gallery__figure img');
          const pictureUrl = imgEl ? imgEl.src : '';
          
          const urlMatch = window.location.href.match(/MLB-?\d+/);
          const id = urlMatch ? urlMatch[0].replace('-', '') : 'MLB000000';

          return { id, title, price, pictureUrl, permalink: window.location.href };
        });

        console.log(`📦 Extraído: ${offerDetails.title} (R$ ${offerDetails.price})`);
        console.log('🚀 Enviando pacote para o Cérebro IA (VPS)...');
        
        const response = await fetch(VPS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(offerDetails)
        });

        const result = await response.json().catch(() => null);
        console.log(`✅ A VPS confirmou o recebimento (Status HTTP ${response.status})!`);
        
      } catch (err) {
        console.error(`❌ Falha técnica ao raspar a oferta ${i + 1}: ${err.message}`);
      }
      
      await new Promise(r => setTimeout(r, 2000));
      console.log('--------------------------------------------------');
    }

    console.log('\n🎉 SUCESSO! Varredura em Lote finalizada!');

  } catch (error) {
    console.error('\n❌ Erro Geral no Garimpo:', error.message);
  } finally {
    console.log('🧹 Encerrando as atividades do Robô e fechando as telas...');
    await browser.close();
    console.log('🏁 Operação Concluída.');
  }
}

runScraper();
