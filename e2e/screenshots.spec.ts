import { test, expect } from '@playwright/test';
import fs from 'fs';

test('take UI screenshots', async ({ page }) => {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  // Robust way to clean localStorage
  await page.goto('/');
  await page.waitForLoadState('load');
  try {
    await page.evaluate(() => {
      localStorage.removeItem('mamilas-studio-v1');
    });
  } catch (e) {
    // ignore
  }
  await page.goto('/');
  await page.waitForLoadState('load');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/01-dashboard.png', fullPage: true });

  // Preset click → DirectorStep immediately.
  await page.getByText('Eğitim / Açıklayıcı').click();

  // From DirectorStep navigate to RecipeStep.
  // The preset pre-selects world + palette + 3 ref DNAs (pixar_dimensional,
  // arcane_clay_hybrid, kurzgesagt_clarity) so no manual ref selection is required.
  await page.getByRole('button', { name: /Reçeteye geç/ }).click();
  // Preset açıkken Yönetmen araya girer → Reçete 3, Sahneler 4, Timeline 5.
  await expect(page.getByText('STAGE 3 · REÇETE')).toBeVisible();
  await page.waitForTimeout(500);

  // Verify refs are active via the command strip.
  await expect(page.getByText(/3\/3 kilit/)).toBeVisible();

  // Take screenshot of the recipe page.
  await page.screenshot({ path: 'screenshots/02-recipe.png', fullPage: true });

  // Navigate to Scenes via sidebar (avoids aquarium-toggle overlay on header CTA).
  await page.locator('.ml-step-btn').filter({ hasText: 'Sahneler' }).click();
  await expect(page.getByText('STAGE 4 · SAHNELER')).toBeVisible();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/03-scenes.png', fullPage: true });

  // Navigate to Timeline via sidebar.
  await page.locator('.ml-step-btn').filter({ hasText: 'Timeline' }).click();
  await expect(page.getByText('STAGE 5 · TIMELINE')).toBeVisible();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/04-timeline.png', fullPage: true });
});
