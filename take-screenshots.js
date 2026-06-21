const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

(async () => {
  const server = spawn('node', ['server.js'], { env: { ...process.env, PORT: 3000 } });
  
  // Wait for server to boot
  await new Promise(r => setTimeout(r, 1000));
  
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Desktop Dashboard
    await page.setViewport({width: 1440, height: 900});
    await page.goto('http://localhost:3000', {waitUntil: 'networkidle0'});
    await page.screenshot({path: 'ssler/01_dashboard.png'});
    
    // Ingest View
    await page.evaluate(() => switchView('ingest'));
    await new Promise(r => setTimeout(r, 300)); //(300);
    await page.screenshot({path: 'ssler/02_ingest.png'});
    
    // Recipe View
    await page.evaluate(() => switchView('recipe'));
    await new Promise(r => setTimeout(r, 300)); //(300);
    await page.screenshot({path: 'ssler/03_recipe.png'});

    // Ref DNA View
    await page.evaluate(() => switchView('refdna'));
    await new Promise(r => setTimeout(r, 300)); //(300);
    await page.screenshot({path: 'ssler/04_refdna.png'});
    
    // Timeline View
    await page.evaluate(() => switchView('timeline'));
    await new Promise(r => setTimeout(r, 300)); //(300);
    await page.screenshot({path: 'ssler/05_timeline.png'});
    
    await browser.close();
    server.kill();
    console.log('Screenshots captured!');
    process.exit(0);
  } catch(e) {
    console.error(e);
    server.kill();
    process.exit(1);
  }
})();
