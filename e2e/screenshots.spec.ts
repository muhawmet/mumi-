import { test, expect } from '@playwright/test';
import fs from 'fs';

test('take UI screenshots', async ({ page }) => {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  // Clear localStorage to start with a clean state
  await page.goto('/');
  await page.evaluate(() => {
    try {
      localStorage.removeItem('mamilas-studio-v1');
    } catch {
      /* ignore */
    }
  });
  await page.reload();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/01-dashboard.png', fullPage: true });

  await page.getByText('Eğitim / Açıklayıcı').click();
  await page.getByRole('button', { name: /Reçeteye geç/ }).click();
  
  // Wait for stage 2
  await expect(page.getByText('STAGE 2 · REÇETE')).toBeVisible();
  await page.waitForTimeout(500);

  const searchInput = page.getByPlaceholder('DNA, id, özellik ara...');

  // Search and add One Piece
  await searchInput.fill('luffy');
  await expect(page.getByText('One Piece — Sunny Adventure Grammar')).toBeVisible({ timeout: 5000 });
  const onePieceDetay = page.getByRole('button', { name: 'Detay: One Piece — Sunny Adventure Grammar' });
  await onePieceDetay.locator('xpath=..').getByRole('button', { name: 'Ekle' }).click();
  
  // Search and add Violet-like reference
  await searchInput.fill('violet');
  await expect(page.getByText('Violet-like Light Elegance Grammar (IP-safe)')).toBeVisible({ timeout: 5000 });
  const violetDetay = page.getByRole('button', { name: 'Detay: Violet-like Light Elegance Grammar (IP-safe)' });
  await violetDetay.locator('xpath=..').getByRole('button', { name: 'Ekle' }).click();

  // Clear search
  await searchInput.fill('');
  await page.waitForTimeout(500);

  // Change palette to Pastel Soft
  try {
    const paletteBtn = page.getByRole('button', { name: 'Pastel Soft' });
    await paletteBtn.click({ timeout: 2000 });
  } catch (e) {
    // ignore if it doesn't exist
  }

  // Click on the active reference slot at the top to open the details view
  await page.getByText('One Piece — Sunny Adventure Grammar').first().click();
  await page.waitForTimeout(1000);

  // Take screenshot of the recipe page showing One Piece detail view
  await page.screenshot({ path: 'screenshots/02-recipe.png', fullPage: true });

  await page.getByRole('button', { name: /Sahneler'e geç/ }).click();
  await expect(page.getByText('STAGE 3 · SAHNELER')).toBeVisible();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/03-scenes.png', fullPage: true });

  await page.getByRole('button', { name: /İleri → Timeline/ }).click();
  await expect(page.getByText('STAGE 4 · TIMELINE')).toBeVisible();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/04-timeline.png', fullPage: true });
});
