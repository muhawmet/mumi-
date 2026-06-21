import { test, expect } from '@playwright/test';

/**
 * Helper: navigate to root with a clean persisted state, BUT keep localStorage
 * intact on subsequent reloads (so we can test the persistence itself).
 */
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

test('app boots and renders Brief stage with Phase 0 cards', async ({ page }) => {
  await freshGoto(page);
  await expect(page.getByText('STAGE 1 · BRIEF')).toBeVisible();
  // Panel title is rendered .toUpperCase() — match the literal uppercased string.
  await expect(page.getByText('PHASE 0 — HAZIR BAŞLANGIÇ')).toBeVisible();
  await expect(page.getByText('Premium Reklam')).toBeVisible();
  await expect(page.getByText('Eğitim · Aras & Defne')).toBeVisible();
});

test('Phase 0 preset wires world and lets us complete the full flow', async ({ page }) => {
  await freshGoto(page);

  await page.getByText('Eğitim · Aras & Defne').click();
  await page.getByRole('button', { name: /Reçeteye geç/ }).click();
  await expect(page.getByText('STAGE 2 · REÇETE')).toBeVisible();

  await page.getByRole('button', { name: /Timeline'a geç/ }).click();
  await expect(page.getByText('STAGE 3 · TIMELINE')).toBeVisible();
  await expect(page.getByText(/Üretime hazır/i)).toBeVisible();

  await page.getByRole('button', { name: /BATCH ÜRET/ }).click();

  await expect(page.getByText('SAHNELER (5)')).toBeVisible();
  await expect(page.getByText('Sahne 1 · Intro')).toBeVisible();
  await expect(page.getByText('Sahne 5 · Resolution')).toBeVisible();

  await expect(page.getByText('IMAGE PROMPT').first()).toBeVisible();
  await expect(page.getByText('PACING ARCI')).toBeVisible();
});

test('SOURCE: prefix triggers the live beat preview', async ({ page }) => {
  await freshGoto(page);
  const topic = page.locator('textarea').first();
  await topic.fill('SOURCE:\nilk beat\nikinci beat\nüçüncü beat');
  await expect(page.getByText(/SOURCE BOUND · 3 BEAT/i)).toBeVisible();
  await expect(page.getByText('source-001')).toBeVisible();
  await expect(page.getByText('source-003')).toBeVisible();
});

test('keyboard shortcut ⌘/Ctrl+Enter advances the step', async ({ page }) => {
  await freshGoto(page);
  await page.getByText('Eğitim · Aras & Defne').click();
  await page.keyboard.press('Meta+Enter');
  await expect(page.getByText('STAGE 2 · REÇETE')).toBeVisible();
});

test('per-scene override persists across reloads', async ({ page }) => {
  await freshGoto(page);
  await page.getByText('Eğitim · Aras & Defne').click();
  await page.getByRole('button', { name: /Reçeteye geç/ }).click();
  await page.getByRole('button', { name: /Timeline'a geç/ }).click();
  await page.getByRole('button', { name: /BATCH ÜRET/ }).click();
  await expect(page.getByText('Sahne 1 · Intro')).toBeVisible();

  await page.getByRole('button', { name: /DÜZENLE/ }).first().click();
  const editor = page.locator('textarea').last();
  await editor.fill('MY CUSTOM PROMPT — locked by the user');
  await page.getByRole('button', { name: /^KAYDET$/ }).click();
  await expect(page.getByText(/EDITED/i)).toBeVisible();

  // Reload WITHOUT wiping localStorage — persist should restore the override.
  await page.goto('/');
  await expect(page.getByText(/EDITED/i)).toBeVisible();
  await expect(page.getByText(/MY CUSTOM PROMPT — locked by the user/)).toBeVisible();
});
