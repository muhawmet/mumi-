import { expect, test } from '@playwright/test';

/**
 * 3D katmanı asla 2D pipeline UI'ını bloke etmez.
 *
 * Headless Chromium yazılımsal WebGL (SwiftShader) kullanır — bu renderer'da
 * PostFX + shadows + sürekli frameloop ana thread'i >1sn aç bırakıp step
 * geçişini süresiz kilitliyordu (kanıt: 50ms interval → ~1200ms drift).
 * Çözüm: software renderer "WebGL yok" gibi ele alınır → SceneLayer mount olmaz.
 */

test('software WebGL renderer düşer ve uygulama akıcı kalır', async ({ page }) => {
  await page.goto('/');
  // SwiftShader → auto-fallback: katman hiç mount olmamalı.
  await expect(page.getByTestId('scene-layer')).toHaveCount(0);
  // MACRO 4 — konuşan-karakter Disco katmanı (thought-badge/thought-dock) KALDIRILDI; Mami tek
  // Yönetmen deneyimi görür. Asıl garanti: 3D olmadan sidebar navigasyonu güvenilir çalışır.
  await expect(page.locator('.ml-sidebar')).toBeVisible();
  await page.locator('.ml-step-btn').filter({ hasText: 'Reçete' }).click();
  // Sidebar tıklaması step'i değiştirdi — reçete adımının içeriği göründü (3D bloklaması yok).
  await expect(page.getByText(/STAGE \d+ · REÇETE/)).toBeVisible();
});

test('?scene=force ile sahne zorla mount olur', async ({ page }) => {
  await page.goto('/?scene=force');
  // Software olsa bile force → mount. Sonrasında tıklama YOK: SwiftShader çok yavaş.
  await expect(page.getByTestId('scene-layer')).toHaveCount(1);
});
