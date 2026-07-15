
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function loginML() {
  console.log('==============================================');
  console.log('       TELA DE LOGIN DO MERCADO LIVRE         ');
  console.log('==============================================');
  console.log('1. O navegador vai abrir.');
  console.log('2. Faca o seu login no Mercado Livre.');
  console.log('3. Assim que terminar e estiver na pagina inicial logado, pode FECHAR o navegador.');
  console.log('Sua sessao sera salva para o robo usar sozinho depois!\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: './perfil_chrome_robo',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  await page.goto('https://www.mercadolivre.com.br/hub/login');
  
  // Fica aguardando infinitamente até o usuário fechar o navegador
  await new Promise(() => {});
}

loginML();

