const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: false, userDataDir: './perfil_chrome_robo', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://meli.la/2TLCdqp', { waitUntil: 'networkidle2' });
  console.log('Chegou na url:', page.url());
  
  const btn = await page.$('::-p-xpath(//a[contains(., "Ir para produto")] | //button[contains(., "Ir para produto")])');
  if (btn) {
      const href = await page.evaluate(el => el.href, btn);
      console.log('HREF do botao:', href);
      
      if (href && !href.includes('javascript:')) {
          await page.goto(href, { waitUntil: 'networkidle2' });
      } else {
          await Promise.all([
             page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
             btn.click()
          ]);
      }
      
      console.log('URL depois do clique/goto:', page.url());
      
      const title = await page.evaluate(() => document.querySelector('.ui-pdp-title')?.innerText || 'NAO ACHOU TITULO');
      console.log('TITULO:', title);
  } else {
      console.log('Nao achou botao.');
  }
  
  await browser.close();
})();
