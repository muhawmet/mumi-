import { test, expect } from '@playwright/test';

test('Beat Planner renders and mode switch changes numbers', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Use a preset to quickly set up valid state
  await page.click('button:has-text("Ürün / Marka Filmi")');

  // Fill in the brief
  await page.fill('textarea[placeholder*="Örn. 3. sınıf"]', 'Bu bir e2e testi için kısa bir brief. İçinde üç cümle var. Bu da son cümle.');
  
  // Ingest
  await page.click('button:has-text("Decode + Kayıpsız Ingest")');
  
  // Go to recipe step
  await page.click('button:has-text("Reçeteye geç →")');

  // Recipe Step
  // Select a valid reference DNA to pass the gate
  await page.getByRole('button', { name: 'Ekle' }).first().click();
  
  // Wait for the button to be enabled (readiness passed).
  await page.click('button:has-text("Sahneler\'e geç →")');

  // Verify scenes step renders
  await expect(page.getByRole('heading', { name: 'Beat Planner & Storyboard' })).toBeVisible();

  // Check initial mode (Dengeli defaults)
  const limit = page.locator('text=Limit:').first();
  await expect(limit).toContainText('3s');
  await expect(limit).toContainText('max 9s');

  // Switch to Ekonomik — the limits must change
  await page.click('button:has-text("Ekonomik")');
  await expect(limit).toContainText('3.5s');
  await expect(limit).toContainText('max 11s');
});
