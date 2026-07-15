import { expect, test } from '@playwright/test';

/**
 * Akvaryum modu tüm chrome'u (sidebar + sağ rail) gizler, çıkışta geri getirir.
 *
 * MACRO 4 — konuşan-karakter Disco katmanı (thought-badge/toast/dock) KALDIRILDI; bu test artık
 * chrome görünürlüğünü doğrular (aquarium'un gerçek işi), persona toast'larını değil.
 */
test('akvaryum modu tüm chrome\'u gizler, çıkışta geri getirir', async ({ page }) => {
  await page.goto('/');
  // Başlangıç: chrome görünür (sidebar + sağ rail).
  await expect(page.locator('.ml-sidebar')).toBeVisible();
  await expect(page.getByTestId('source-right-rail')).toBeVisible();

  // Akvaryum modu → chrome gizlenir.
  await page.getByRole('button', { name: 'AKVARYUM MODU' }).click();
  await expect(page.getByTestId('source-right-rail')).not.toBeVisible();

  // Menüleri aç → chrome geri gelir.
  await page.getByRole('button', { name: 'MENÜLERİ AÇ' }).click();
  await expect(page.getByTestId('source-right-rail')).toBeVisible();
});
