const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
puppeteer.use(StealthPlugin());

async function dumpHTML() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: './perfil_chrome_robo',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    console.log('Acessando página do produto...');
    await page.goto('https://produto.mercadolivre.com.br/MLB-3559381665-teclado-e-mouse-sem-fio-dell-km3322w-preto-_JM', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Espera o título carregar
    await page.waitForSelector('.ui-pdp-title');
    
    const html = await page.evaluate(() => document.body.innerHTML);
    fs.writeFileSync('product.html', html);
    console.log('Product HTML dumped successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

dumpHTML();
