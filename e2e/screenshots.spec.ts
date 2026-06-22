import { test } from '@playwright/test';
import fs from 'fs';

test('take UI screenshots', async ({ page }) => {
  // Ensure screenshots directory exists
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  // 1. Dashboard
  await page.goto('/');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/01-dashboard.png', fullPage: true });

  // 2. Select preset and go to Recipe
  await page.getByText('Eğitim / Açıklayıcı').click();
  await page.getByRole('button', { name: /Reçeteye geç/ }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/02-recipe.png', fullPage: true });

  // 3. Go to Scenes
  await page.getByRole('button', { name: /Sahneler'e geç/ }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/03-scenes.png', fullPage: true });

  // 4. Go to Timeline
  await page.getByRole('button', { name: /İleri → Timeline/ }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/04-timeline.png', fullPage: true });
});
