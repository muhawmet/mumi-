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
  await page.getByRole('button', { name: 'Kayıpsız Ingest' }).click();
  await expect(page.getByTestId('source-right-rail')).toContainText('PASS');

  // The preset click navigates immediately to DirectorStep.
  await page.getByRole('button', { name: 'Eğitim / Açıklayıcı' }).click();

  // From DirectorStep, navigate to RecipeStep.
  // The preset already sets world + palette + 3 refs — no manual ref selection needed.
  await page.getByRole('button', { name: /Reçeteye geç/ }).click();
  // Preset açıkken Yönetmen adımı araya girer → Reçete STAGE 3 (appLayoutSteps.test.ts).
  await expect(page.getByText('STAGE 3 · REÇETE')).toBeVisible();

  // The aquarium-toggle (fixed, right: 364, top: 18) overlaps the RecipeStep
  // header CTA — use the sidebar step-button instead.
  await page.locator('.ml-step-btn').filter({ hasText: 'Sahneler' }).click();

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
