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
    console.log('Acessando hub de afiliados...');
    await page.goto('https://www.mercadolivre.com.br/afiliados/hub?is_affiliate=true#menu-user', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Rola um pouco
    await page.evaluate(() => window.scrollBy(0, 1000));
    await new Promise(r => setTimeout(r, 5000));
    
    const html = await page.evaluate(() => document.body.innerHTML);
    fs.writeFileSync('affiliate_hub.html', html);
    console.log('HTML dumped successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

dumpHTML();
