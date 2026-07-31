// T3 Brief screenshots: empty state + PASS state + Phase 0 grid
// Usage: node scripts/t3-brief-shots.mjs  (requires vite server running on 5173)
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const URL = 'http://localhost:5173';
const OUT = 'reports';

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  // — Screenshot (a): Brief empty state —
  await page.goto(URL, { timeout: 30000, waitUntil: 'networkidle' });
  await page.evaluate(() => {
    try { localStorage.removeItem('mamilas-studio-v1'); } catch {}
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/t3-brief-empty.png`, fullPage: false });
  console.log('✓ t3-brief-empty.png saved');

  // — Screenshot (b): Brief with ingested source (PASS) —
  await page.evaluate(() => {
    try { localStorage.removeItem('mamilas-studio-v1'); } catch {}
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const raw = 'Öğrenciler için su döngüsü dersi. Buhar yükselir gökyüzüne! Yağmur olarak geri döner.';
  await page.getByTestId('raw-source-input').fill(raw);
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Decode + Kayıpsız Ingest' }).click();
  // Wait for PASS to appear in the right rail
  await page.getByTestId('source-right-rail').getByText('PASS').waitFor({ timeout: 8000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/t3-brief-pass.png`, fullPage: false });
  console.log('✓ t3-brief-pass.png saved');

  // — Screenshot (c): Phase 0 grid close-up (fallback icons) —
  await page.evaluate(() => {
    try { localStorage.removeItem('mamilas-studio-v1'); } catch {}
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  // Panel title DOM'da toUpperCase'li render olur; subtitle dönüşümsüz — onu hedefle.
  const phase0 = page.locator('section').filter({ hasText: 'Tek tıkla world + class + scene count' }).first();
  await phase0.screenshot({ path: `${OUT}/t3-phase0-grid.png` });
  console.log('✓ t3-phase0-grid.png saved');

  await browser.close();
  console.log('DONE');
}

main().catch((err) => { console.error(err); process.exit(1); });
