// Browser proof: drive the app end-to-end and capture final-desktop screenshots.
// Usage: node scripts/final-shots.mjs   (starts its own vite server)
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { mkdirSync } from 'fs';

const OUT = 'output/playwright';
const URL = 'http://localhost:5173';
const VO = [
  'Işık yaprağa çarptığında görünmez bir fabrika çalışmaya başlar.',
  'Kloroplastların içindeki klorofil, güneş ışığını yakalar ve enerjiye çevirir.',
  'Su kökten yukarı tırmanır, karbondioksit gözeneklerden içeri süzülür.',
  'Bu üç malzeme birleşir ve ortaya şeker ile oksijen çıkar.',
  'Yani her nefesin, bir yaprağın sessiz emeğidir.',
].join(' ');

const shot = async (page, name) => {
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${name}-final-desktop.png` });
  console.log(`✓ ${name}`);
};
const cmdEnter = async (page) => {
  await page.keyboard.press('Meta+Enter');
  await page.waitForTimeout(1200);
};

async function main() {
  mkdirSync(OUT, { recursive: true });
  const server = spawn('npm', ['run', 'dev'], { stdio: 'ignore', detached: false });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  for (let i = 0; i < 30; i++) {
    try { await page.goto(URL, { timeout: 2000 }); break; }
    catch { await page.waitForTimeout(1000); }
  }
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(1500);

  // Drive real state through the dev-exposed store (window.__mamilas).
  const act = (code) => page.evaluate(code);
  await act(`(() => {
    const st = window.__mamilas;
    st.setState({ projectTopic: ${JSON.stringify('Fotosentez: Işığın Şekere Dönüşen Yolculuğu')} });
    st.getState().setRawSource(${JSON.stringify(VO)});
    st.getState().decodeRawSource();
    st.getState().ingestRawSource();
  })()`);
  await page.waitForTimeout(800);
  await shot(page, 'dashboard');

  // 2 — Recipe: pick first world card via real UI click
  await act(`window.__mamilas.setState({ currentStep: 'recipe' })`);
  await page.waitForTimeout(1000);
  const worldCard = page.locator('text=Pixar 3D').first();
  if (await worldCard.isVisible().catch(() => false)) {
    await worldCard.click();
    await page.waitForTimeout(800);
  }
  await shot(page, 'recipe');

  // 3 — Scenes
  await act(`window.__mamilas.setState({ currentStep: 'scenes' })`);
  await shot(page, 'scenes');

  // 4 — Timeline (+ generate)
  await act(`window.__mamilas.setState({ currentStep: 'timeline' })`);
  await page.waitForTimeout(600);
  await act(`window.__mamilas.getState().generateScenes()`);
  await page.waitForTimeout(2500);
  await shot(page, 'timeline');

  // 5 — QA cabinet
  await act(`window.__mamilas.setState({ currentStep: 'qa' })`);
  await page.waitForTimeout(9000); // let a few voices speak
  await shot(page, 'qa');

  // 6 — Director step
  await act(`window.__mamilas.setState({ currentStep: 'director' })`);
  await shot(page, 'director');

  await browser.close();
  server.kill();
  console.log('DONE');
}

main().catch((err) => { console.error(err); process.exit(1); });
