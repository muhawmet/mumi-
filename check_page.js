const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    const content = await page.evaluate(() => {
        return {
           btnText: document.querySelector('.custom-select-trigger')?.textContent,
           hasSelects: document.querySelectorAll('select.studio-select').length,
           hasTriggers: document.querySelectorAll('.custom-select-trigger').length,
           mobBar: document.querySelector('.mob-bar') !== null
        }
    });
    console.log("DOM CHECK:", content);
  } catch(e) {
    console.log("PUPPETEER ERR:", e);
  }
  await browser.close();
  process.exit(0);
})();
