const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

(async () => {
  console.log("Starting server...");
  const server = spawn('node', ['server.js'], { env: { ...process.env, PORT: 3000 } });
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 10000 });
    
    console.log("Capturing Dashboard (Desktop)...");
    await page.setViewport({width: 1440, height: 900});
    await page.screenshot({path: 'ssler/01_dashboard_desktop.png', fullPage: true});

    console.log("Capturing Dashboard (Mobile closed)...");
    await page.setViewport({width: 390, height: 844});
    await page.reload({ waitUntil: 'networkidle0' });
    await page.screenshot({path: 'ssler/02_dashboard_mobile.png', fullPage: false});

    console.log("Capturing Dashboard (Mobile drawer open)...");
    await page.evaluate(() => document.getElementById('studio-sidebar').classList.add('open'));
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({path: 'ssler/03_dashboard_mobile_open.png', fullPage: false});
    
  } catch (e) {
    console.error("Puppeteer Error:", e);
  } finally {
    await browser.close();
    server.kill();
    process.exit(0);
  }
})();
