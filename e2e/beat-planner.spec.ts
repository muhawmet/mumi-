import { test, expect } from '@playwright/test';

test('Beat Planner renders and mode switch changes numbers', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Use a preset to quickly set up valid state
  await page.click('button:has-text("Premium Reklam")');

  // Fill in the brief
  await page.fill('textarea[placeholder*="Örn. 3. sınıf"]', 'Bu bir e2e testi için kısa bir brief. İçinde üç cümle var. Bu da son cümle.');
  
  // Ingest
  await page.click('button:has-text("Decode + Kayıpsız Ingest")');
  
  // Go to recipe step
  await page.click('button:has-text("Reçeteye geç →")');

  // Recipe Step
  // Select a valid reference DNA to pass the gate
  await page.locator('select').first().selectOption('pixar_dimensional');
  
  // Wait for the button to be enabled (readiness passed).
  await page.click('button:has-text("Sahneler\'e geç →")');

  // Verify scenes step renders
  await expect(page.locator('h2:has-text("Sahneler & Beat Planner")')).toBeVisible();

  // Check initial mode
  const limitText = await page.locator('text=Limit:').textContent();
  expect(limitText).toContain('3s - 6s - 9s'); // Dengeli defaults

  // Switch to Ekonomik
  await page.click('button:has-text("Ekonomik")');
  const newLimitText = await page.locator('text=Limit:').textContent();
  expect(newLimitText).toContain('3.5s - 7s - 11s');
});
