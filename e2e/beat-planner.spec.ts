import { test, expect } from '@playwright/test';

async function freshGoto(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    try {
      localStorage.removeItem('mamilas-studio-v1');
    } catch {
      /* ignore */
    }
  });
  await page.reload();
}

test('Beat Planner renders and mode switch changes numbers', async ({ page }) => {
  await freshGoto(page);

  await page.getByTestId('raw-source-input').fill('Birinci kaynak cümlesi. İkinci kaynak cümlesi. Üçüncü kaynak cümlesi.');
  await page.getByRole('button', { name: 'Decode + Kayıpsız Ingest' }).click();
  await expect(page.getByTestId('source-right-rail')).toContainText('PASS');

  // Use a preset to quickly set up valid state and enter the Director step.
  await page.getByRole('button', { name: 'Eğitim / Açıklayıcı' }).click();
  
  // Go to recipe step
  await page.getByRole('button', { name: /Reçeteye geç/ }).click();

  // Recipe Step
  // Select a valid reference DNA to pass the gate
  await page.getByRole('button', { name: 'Ekle' }).first().click();
  
  // Wait for the button to be enabled (readiness passed).
  await page.getByRole('button', { name: /Sahneler'e geç/ }).click();

  // Verify scenes step renders
  await expect(page.getByRole('heading', { name: 'Beat Planner & Storyboard' })).toBeVisible();

  // Check initial mode (Dengeli defaults)
  const limit = page.getByText(/Limit:/).first();
  await expect(limit).toContainText('3s');
  await expect(limit).toContainText('max 9s');

  // Switch to Ekonomik — the limits must change
  await page.getByRole('button', { name: 'Ekonomik' }).click();
  await expect(limit).toContainText('3.5s');
  await expect(limit).toContainText('max 11s');
});
