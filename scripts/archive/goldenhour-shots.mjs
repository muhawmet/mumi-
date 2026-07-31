// Golden-Hour 3D shell kalıcı kanıt scripti — 6 adım yürüyüşü + world-adaptif matris. PNG SADECE.
// Usage: node scripts/goldenhour-shots.mjs   (kendi vite sunucusunu açar/kapatır)
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const OUT = process.env.PROOF_OUT || 'output/goldenhour';
const PORT = 5179;
const URL = `http://localhost:${PORT}/?scene=force`;
const STEPS = ['dashboard', 'director', 'recipe', 'scenes', 'timeline', 'qa'];
const WORLDS = ['__default__', 'ghibli_hayao', 'one_piece_toei', 'kurzgesagt_edu', 'noir_high_contrast', 'sports_energy_real'];
const VO = [
  'Işık yaprağa çarptığında görünmez bir fabrika çalışmaya başlar.',
  'Kloroplastların içindeki klorofil, güneş ışığını yakalar ve enerjiye çevirir.',
  'Su kökten yukarı tırmanır, karbondioksit gözeneklerden içeri süzülür.',
  'Bu üç malzeme birleşir ve ortaya şeker ile oksijen çıkar.',
  'Yani her nefesin, bir yaprağın sessiz emeğidir.',
].join(' ');

let server;
async function main() {
  mkdirSync(OUT, { recursive: true });
  server = spawn('npm', ['run', 'dev', '--', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  for (let i = 0; i < 30; i++) {
    try { await page.goto(URL, { timeout: 2000 }); break; }
    catch { await page.waitForTimeout(1000); }
  }
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(3500);

  // SECTION A — 6-adım yürüyüş: gerçekçi bir proje tohumla, adım adım kaydet.
  await page.evaluate((vo) => {
    const st = window.__mamilas;
    st.setState({ projectTopic: 'Fotosentez: Işığın Şekere Dönüşen Yolculuğu' });
    st.getState().setRawSource(vo);
    st.getState().decodeRawSource();
    st.getState().ingestRawSource();
  }, VO);
  await page.waitForTimeout(800);

  let n = 1;
  for (const step of STEPS) {
    await page.evaluate((s) => window.__mamilas.setState({ currentStep: s }), step);
    if (step === 'recipe') {
      await page.waitForTimeout(1000);
      const worldCard = page.locator('text=Pixar 3D').first();
      if (await worldCard.isVisible().catch(() => false)) {
        await worldCard.click();
        await page.waitForTimeout(800);
      }
    } else if (step === 'timeline') {
      await page.waitForTimeout(600);
      await page.evaluate(() => window.__mamilas.getState().generateScenes());
      await page.waitForTimeout(2500);
    } else if (step === 'qa') {
      await page.waitForTimeout(3000);
    } else {
      await page.waitForTimeout(900);
    }
    const label = String(n).padStart(2, '0');
    await page.screenshot({ path: `${OUT}/step-${label}-${step}.png`, type: 'png' });
    console.log('shot', `step-${label}-${step}`);
    n++;
  }

  // SECTION B — world-adaptif matris: chrome gizle, dünya dünya sahneyi kaydet.
  await page.locator('.ml-aquarium-toggle').click();
  await page.waitForTimeout(2500);
  for (const w of WORLDS) {
    await page.evaluate((id) => {
      window.__mamilas.setState({ selectedWorldId: id === '__default__' ? null : id });
    }, w);
    await page.waitForTimeout(3000); // eased fog + sky regen otursun
    await page.screenshot({ path: `${OUT}/world-${w}.png`, type: 'png' });
    if (w === '__default__') {
      await page.screenshot({
        path: `${OUT}/world-__default__-sky.png`,
        type: 'png',
        clip: { x: 950, y: 130, width: 560, height: 360 },
      });
    }
    console.log('shot', `world-${w}`);
  }

  await browser.close();
  server.kill();
  console.log(`DONE goldenhour — ${STEPS.length + WORLDS.length + 1} PNG → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  if (server) server.kill();
  process.exit(1);
});
