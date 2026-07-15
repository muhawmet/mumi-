// T5 Sahneler/Timeline kanıt kareleri
// Flow: Brief ingest → Reçete (sidebar) → Sahneler (sidebar) → Timeline (sidebar)
//       → boş durum → AJAN PAKETİNİ DERLE → şerit → detay panel
// Viewport: 1600×1000 (t4 ile aynı)
// Usage: node scripts/t5-scenes-shots.mjs  (vite dev server 5173'te açık olmalı)
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const URL = 'http://localhost:5173';
const OUT = 'reports';

// Realistic multi-paragraph Turkish educational source text (fotosentez)
const SOURCE_TEXT = `Fotosentez, bitkiler ve bazı mikroorganizmalar tarafından gerçekleştirilen, güneş ışığını kimyasal enerjiye dönüştürme sürecidir. Bu süreç, klorofil adı verilen yeşil pigment sayesinde kloroplastlarda gerçekleşir.

Bitkiler, karbondioksit ve suyu alarak güneş enerjisi yardımıyla glikoz üretir. Bu işlem sırasında oksijen serbest bırakılır. Oluşan glikoz, bitkinin büyümesi ve gelişmesi için enerji kaynağı olarak kullanılır.

Fotosentez iki aşamada gerçekleşir: ışığa bağımlı ve ışıktan bağımsız reaksiyonlar. Işığa bağımlı aşamada su molekülleri parçalanır ve ATP ile NADPH üretilir. Calvin döngüsü olarak bilinen ikinci aşamada ise karbondioksit glikoza dönüştürülür.

Bu süreç, dünyadaki yaşamın temel taşı olup oksijen gazının atmosferdeki kaynağını oluşturmaktadır. Besin zincirinin başlangıç noktası olan fotosentez, tüm ekosistemler için vazgeçilmezdir.`;

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  // — Fresh start: clear localStorage —
  await page.goto(URL, { timeout: 30000, waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('mamilas-studio-v1'); } catch {} });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // — Step 1: Go to Reçete via sidebar and select first world card —
  await page.locator('.ml-step-btn', { hasText: 'Reçete' }).click();
  await page.waitForTimeout(1500);
  // Select first world card
  const worldBtn = page.locator('.recipe-world-button').first();
  await worldBtn.waitFor({ timeout: 8000 });
  await worldBtn.click();
  await page.waitForTimeout(600);
  console.log('✓ Reçete: ilk world seçildi');

  // — Step 2: Go to Brief via sidebar → ingest source text —
  await page.locator('.ml-step-btn', { hasText: 'Brief' }).click();
  await page.waitForTimeout(1000);

  // Clear any existing text and fill the raw source input
  const rawInput = page.getByTestId('raw-source-input');
  await rawInput.waitFor({ timeout: 8000 });
  await rawInput.fill(SOURCE_TEXT);
  await page.waitForTimeout(400);

  // Click Decode + Kayıpsız Ingest
  await page.getByRole('button', { name: 'Decode + Kayıpsız Ingest' }).click();

  // Wait for PASS state in the right rail
  await page.getByTestId('source-right-rail').getByText('PASS').waitFor({ timeout: 12000 });
  await page.waitForTimeout(600);
  console.log('✓ Brief: kaynak ingest PASS');

  // — Step 3: Go to Sahneler via sidebar → storyboard screenshot —
  await page.locator('.ml-step-btn', { hasText: 'Sahneler' }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/t5-storyboard.png`, fullPage: false });
  console.log('✓ t5-storyboard.png');

  // — Step 4: Go to Timeline via sidebar → EMPTY state screenshot —
  await page.locator('.ml-step-btn', { hasText: 'Timeline' }).click();
  await page.waitForTimeout(1500);
  // Verify empty state: "Motor bekliyor" h1
  await page.getByRole('heading', { name: /Motor bekliyor/i }).waitFor({ timeout: 8000 });
  await page.screenshot({ path: `${OUT}/t5-timeline-empty.png`, fullPage: false });
  console.log('✓ t5-timeline-empty.png');

  // — Step 5: Click AJAN PAKETİNİ DERLE → wait for film strip —
  // Use the button visible in the empty state panel (or the header button)
  const compileBtn = page.getByRole('button', { name: /AJAN PAKETİNİ DERLE/i }).first();
  await compileBtn.click();

  // Wait for film strip to appear: "FİLM ŞERİDİ" label appears in the strip
  await page.getByText('FİLM ŞERİDİ').waitFor({ timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/t5-timeline-strip.png`, fullPage: false });
  console.log('✓ t5-timeline-strip.png');

  // — Step 6: Click one strip frame → detail panel screenshot —
  // The strip frames are buttons with title "Sahne N · Phase · Ns"
  const firstFrame = page.locator('button[title*="Sahne 1"]').first();
  if (await firstFrame.count()) {
    await firstFrame.click();
  } else {
    // Fallback: click the first strip frame button (inside the film strip)
    const stripBtn = page.locator('.FilmStrip button, [title*="Sahne"]').first();
    if (await stripBtn.count()) {
      await stripBtn.click();
    } else {
      // Second fallback: click the first scene in the left list panel
      const sceneListBtn = page.locator('.timeline-layout button').first();
      await sceneListBtn.click();
    }
  }
  await page.waitForTimeout(800);

  // Wait for TEKNİK KANIT · EN block to appear in the detail panel
  await page.getByText('TEKNİK KANIT · EN').waitFor({ timeout: 8000 });
  await page.screenshot({ path: `${OUT}/t5-timeline-detail.png`, fullPage: false });
  console.log('✓ t5-timeline-detail.png');

  await browser.close();
  console.log('DONE — 4 PNG üretildi: t5-storyboard, t5-timeline-empty, t5-timeline-strip, t5-timeline-detail');
}

main().catch((err) => { console.error(err); process.exit(1); });
