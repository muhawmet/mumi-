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

  await page.getByRole('button', { name: /Sahneler'e geç/ }).click();
  await page.getByRole('button', { name: /İleri → Timeline/ }).click();
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
  const topic = page.getByLabel('Proje konusu');
  await topic.fill('SOURCE:\nilk beat\nikinci beat\nüçüncü beat');
  await expect(page.getByText(/SOURCE BOUND · 3 BEAT/i)).toBeVisible();
  await expect(page.getByText('source-001')).toBeVisible();
  await expect(page.getByText('source-003')).toBeVisible();
});

test('Phase A decodes and losslessly ingests a curriculum brief', async ({ page }) => {
  await freshGoto(page);
  const raw = 'Öğrenciler için su döngüsü dersi. Buhar yükselir!';
  await page.getByTestId('raw-source-input').fill(raw);

  const summary = page.getByTestId('decode-summary');
  await expect(summary).toContainText('ANIMATION_EDU');
  await expect(summary).toContainText('Aras + Defne Education');

  await page.getByRole('button', { name: 'Decode + Kayıpsız Ingest' }).click();
  await expect(page.getByTestId('source-integrity-report')).toContainText('100%');
  await expect(page.getByTestId('source-beat')).toHaveCount(2);
  await expect(page.getByTestId('source-right-rail')).toContainText('PASS');
  await expect(page.getByTestId('source-right-rail')).toContainText('100%');
});

test('Phase A invalidates stale ingest and blocks progression after source edits', async ({ page }) => {
  await freshGoto(page);
  await page.getByTestId('raw-source-input').fill('Birinci kaynak cümlesi. İkinci kaynak cümlesi.');
  await page.getByRole('button', { name: 'Decode + Kayıpsız Ingest' }).click();
  await expect(page.getByTestId('source-right-rail')).toContainText('PASS');

  await page.getByTestId('raw-source-input').fill('Kaynak sonradan değiştirildi.');
  await expect(page.getByTestId('source-right-rail')).toContainText('FAIL');
  await expect(page.getByRole('button', { name: /Reçeteye geç/ })).toBeDisabled();
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
  await page.getByRole('button', { name: /Sahneler'e geç/ }).click();
  await page.getByRole('button', { name: /İleri → Timeline/ }).click();
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

test('design preset produces an honest static IMAGE-only delivery', async ({ page }) => {
  await freshGoto(page);
  await page.getByRole('button', { name: /DESIGN · 7/ }).click();
  await page.getByText('Ürün Postu').click();
  await page.getByRole('button', { name: /Reçeteye geç/ }).click();
  await page.getByRole('button', { name: /Sahneler'e geç/ }).click();
  await page.getByRole('button', { name: /İleri → Timeline/ }).click();

  await expect(page.getByText('STAGE 3 · DESIGN TESLİMİ')).toBeVisible();
  await page.getByRole('button', { name: /TASARIM ÜRET/ }).click();
  await expect(page.getByText('1 tasarım kartı')).toBeVisible();
  await expect(page.getByText('Tasarım 1', { exact: true })).toBeVisible();
  await expect(page.getByText('HANDOFF PAKETLERİ (1)')).toBeVisible();
  await expect(page.getByText('Motion prompt (Kling)')).toHaveCount(0);
  await expect(page.getByText('Suno brief')).toHaveCount(0);
});

test('Proje Kasası saves the active project and restores it after a change + reload', async ({ page }) => {
  await freshGoto(page);

  await page.getByLabel('Proje konusu').fill('Kasa Test Konusu');
  await page.getByTestId('vault-name').fill('Kayıt #1');
  await page.getByTestId('vault-save').click();

  const list = page.getByTestId('vault-list');
  await expect(list).toContainText('Kayıt #1');

  // mutate the live project, then restore from the vault
  await page.getByLabel('Proje konusu').fill('Bambaşka Konu');
  await page.getByRole('button', { name: 'Yükle' }).first().click();
  await expect(page.getByLabel('Proje konusu')).toHaveValue('Kasa Test Konusu');

  // vault survives a reload (persisted)
  await page.reload();
  await expect(page.getByTestId('vault-list')).toContainText('Kayıt #1');

  // delete clears it
  await page.getByRole('button', { name: 'Sil' }).first().click();
  await expect(page.getByText('Kasa boş — kaydettiğin projeler burada listelenir.')).toBeVisible();
});
