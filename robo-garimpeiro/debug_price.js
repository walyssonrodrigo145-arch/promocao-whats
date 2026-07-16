const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: false, userDataDir: './perfil_temp', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://produto.mercadolivre.com.br/MLB-1473758753-kit-10-cuecas-boxer-lupo-algodo-confortavel-box-masculina-_JM', { waitUntil: 'networkidle2' });
  
  await page.waitForSelector('.ui-pdp-title', { timeout: 10000 }).catch(() => {});
  
  const priceBlock = await page.evaluate(() => {
     return document.querySelector('.ui-pdp-price')?.innerHTML || document.querySelector('.ui-pdp-container__row--price')?.innerHTML || 'NOT_FOUND';
  });
  console.log('priceBlock:', priceBlock);

  await browser.close();
})();
