import { chromium } from 'playwright';
import { exec } from 'child_process';

async function takeScreenshots() {
  console.log('Starting vite server...');
  const server = exec('npm run dev');
  
  // Wait for server to boot
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);
  console.log('Taking Step 1 screenshot...');
  await page.screenshot({ path: 'screenshot-1-dashboard.png', fullPage: true });

  // Advance to Recipe
  await page.keyboard.down('Meta');
  await page.keyboard.press('Enter');
  await page.keyboard.up('Meta');
  await page.waitForTimeout(1000);
  console.log('Taking Step 2 screenshot...');
  await page.screenshot({ path: 'screenshot-2-recipe.png', fullPage: true });

  // Advance to Timeline (need to select a world first, we'll try keyboard shortcut if default is set, otherwise click a preset)
  // The tests use locator('text=Eğitim - 3D Kil').click()
  const worldCard = page.locator('text=Eğitim - 3D Kil').first();
  if (await worldCard.isVisible()) {
    await worldCard.click();
    await page.waitForTimeout(500);
  }
  
  await page.keyboard.down('Meta');
  await page.keyboard.press('Enter');
  await page.keyboard.up('Meta');
  await page.waitForTimeout(1500); // Wait for generation
  console.log('Taking Step 3 screenshot...');
  await page.screenshot({ path: 'screenshot-3-timeline.png', fullPage: true });

  await browser.close();
  server.kill();
  console.log('Done.');
}

takeScreenshots().catch(console.error);
