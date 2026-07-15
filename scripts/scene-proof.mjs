// T1 kanıtı: ?scene=force 6 stage + akvaryum establish + geçiş ara-karesi + Slenderman luminance bandı.
// Çalıştır: node scripts/scene-proof.mjs   (port 5179 boş olmalı)
// Slenderman testi: establish kadrajında zemin+duvar+≥3 nesne ışıkta seçilmeli;
// luminance %4-%12 bandı otomatik ölçülür, görsel muayene insan gözüyle yapılır.
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const OUT = process.env.PROOF_OUT || 'output/scene-proof';
const PORT = 5179;
const URL = `http://localhost:${PORT}/?scene=force`;
const STEPS = ['dashboard', 'director', 'recipe', 'scenes', 'timeline', 'qa'];

async function luminanceOf(page, path) {
  const b64 = readFileSync(path).toString('base64');
  return page.evaluate(async (data) => {
    const img = new Image();
    img.src = `data:image/jpeg;base64,${data}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 320; c.height = 200; // örnekleme yeter
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, 320, 200);
    const d = ctx.getImageData(0, 0, 320, 200).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    return sum / (d.length / 4) / 255;
  }, b64);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const server = spawn('npm', ['run', 'dev', '--', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  for (let i = 0; i < 30; i++) {
    try { await page.goto(URL, { timeout: 2000 }); break; } catch { await page.waitForTimeout(1000); }
  }
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(3000);

  // Akvaryum establish: Slenderman testi karesi (chrome kapalı, saf sahne)
  await page.locator('.ml-aquarium-toggle').click();
  await page.waitForTimeout(3500); // kamera otursun, doku/gölge yerleşsin
  const establishPath = `${OUT}/t1-establish-aquarium.jpg`;
  await page.screenshot({ path: establishPath, type: 'jpeg', quality: 88 });
  const lum = await luminanceOf(page, establishPath);
  console.log(`establish luminance: ${(lum * 100).toFixed(1)}%`);
  // V4 altın-saat bandı (eski "karanlık atölye" 4-12% obsolete — sahne artık canlı/parlak).
  // Sahne ne kapkara (WebGL kırık) ne beyaz-yanık olmalı; canlı altın-saat ~%18-%55.
  if (lum < 0.15 || lum > 0.6) {
    console.error(`✗ LUMINANCE TESTİ: canlı altın-saat %15-%60 bandı dışında (${(lum * 100).toFixed(1)}%)`);
    process.exitCode = 1;
  } else {
    console.log('✓ luminance bandı OK — görsel muayene (gök+deniz+güneş+çerçeveler) insan gözüyle');
  }
  await page.locator('.ml-aquarium-toggle').click();
  await page.waitForTimeout(800);

  // 6 stage turu
  for (const step of STEPS) {
    await page.evaluate((s) => { window.__mamilas.setState({ currentStep: s }); }, step);
    await page.waitForTimeout(2600);
    await page.screenshot({ path: `${OUT}/t1-${step}.jpg`, type: 'jpeg', quality: 82 });
    console.log(`✓ t1-${step}`);
  }

  // Geçiş ara-karesi: recipe→scenes tıklamasından 120ms sonra — boş cam OLMAMALI
  await page.evaluate(() => { window.__mamilas.setState({ currentStep: 'recipe' }); });
  await page.waitForTimeout(2200);
  await page.evaluate(() => { window.__mamilas.setState({ currentStep: 'scenes' }); });
  await page.waitForTimeout(120);
  await page.screenshot({ path: `${OUT}/t1-transition-midframe.jpg`, type: 'jpeg', quality: 82 });
  console.log('✓ t1-transition-midframe');

  await browser.close();
  server.kill();
  console.log('DONE');
}

main().catch((err) => { console.error(err); process.exit(1); });
