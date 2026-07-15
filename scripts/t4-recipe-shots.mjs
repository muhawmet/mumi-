// T4 Reçete galeri kanıtları: galeri + materyal/palet + TEKNİK KANIT (vite 5173 açık olmalı)
// Reçete'ye SIDEBAR'dan gidilir — preset akışı DEĞİL (bilinen preset/director e2e bug'ı o yolu kirletiyor).
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const URL = 'http://localhost:5173';
const OUT = 'reports';

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await page.goto(URL, { timeout: 30000, waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('mamilas-studio-v1'); } catch {} });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // — (a) Galeri: world kartları + detay hero —
  await page.getByRole('button', { name: /Reçete/ }).first().click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/t4-recipe-gallery.png`, fullPage: false });
  console.log('✓ t4-recipe-gallery.png');

  // — (b) One Piece seç → materyal UYUMSUZ durumları + palet adları —
  const onePiece = page.locator('.recipe-world-button').filter({ hasText: 'One Piece' }).first();
  if (await onePiece.count()) {
    await onePiece.click();
    await page.waitForTimeout(600);
  }
  const matCard = page.locator('.recipe-material-card').first();
  await matCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/t4-recipe-materials.png`, fullPage: false });
  console.log('✓ t4-recipe-materials.png');

  // — (c) TEKNİK KANIT parşömeni açık —
  const drawer = page.locator('summary').filter({ hasText: 'TEKNİK KANIT' }).first();
  await drawer.scrollIntoViewIfNeeded();
  await drawer.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/t4-recipe-teknik-kanit.png`, fullPage: false });
  console.log('✓ t4-recipe-teknik-kanit.png');

  await browser.close();
  console.log('DONE');
}

main().catch((err) => { console.error(err); process.exit(1); });
