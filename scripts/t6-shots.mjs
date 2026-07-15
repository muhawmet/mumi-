// T6 kanıt kareleri: Director kapalı (deck) + açık (dedup) + QA (akış/canlı ray),
// hem 1600 hem 1280 genişlikte (akvaryum toggle × header CTA çakışma kontrolü).
// Çalıştır: cd ~/Desktop/mamilas-modern && node scripts/t6-shots.mjs
// Çıktı: reports/t6/ (T6_OUT ile değiştirilebilir). Port 5178 boş olmalı.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const OUT = process.env.T6_OUT || 'reports/t6';
const PORT = 5178;
const URL = `http://localhost:${PORT}/`;
const VO = [
  'Işık yaprağa çarptığında görünmez bir fabrika çalışmaya başlar.',
  'Kloroplastların içindeki klorofil, güneş ışığını yakalar ve enerjiye çevirir.',
  'Su kökten yukarı tırmanır, karbondioksit gözeneklerden içeri süzülür.',
  'Bu üç malzeme birleşir ve ortaya şeker ile oksijen çıkar.',
  'Yani her nefesin, bir yaprağın sessiz emeğidir.',
].join(' ');

const shot = async (page, name, wait = 1000) => {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 82 });
  console.log(`✓ ${name}`);
};

async function main() {
  mkdirSync(OUT, { recursive: true });
  const server = spawn('npm', ['run', 'dev', '--', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  for (let i = 0; i < 30; i++) {
    try { await page.goto(URL, { timeout: 2000 }); break; }
    catch { await page.waitForTimeout(1000); }
  }
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(2500);

  const act = (code) => page.evaluate(code);

  // Sahneleri kur (QA sesleri için içerik lazım)
  await act(`(() => {
    const st = window.__mamilas;
    st.setState({ projectTopic: ${JSON.stringify('Fotosentez: Işığın Şekere Dönüşen Yolculuğu')} });
    st.getState().setRawSource(${JSON.stringify(VO)});
    st.getState().decodeRawSource();
    st.getState().ingestRawSource();
    st.getState().generateScenes();
  })()`);
  await page.waitForTimeout(2000);

  // ── Director KAPALI (deck) ─────────────────────────────
  await act(`window.__mamilas.setState({ currentStep: 'director', phase0PresetId: null })`);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await shot(page, 'director-closed-1600', 1600);
  // 'SERBEST YOL' son kartını kanıtla: main'i aşağı kaydır
  await page.evaluate(() => { const m = document.querySelector('.ml-main'); if (m) m.scrollTo(0, 99999); });
  await shot(page, 'director-closed-free-1600', 900);
  await page.evaluate(() => { const m = document.querySelector('.ml-main'); if (m) m.scrollTo(0, 0); });
  await page.setViewportSize({ width: 1280, height: 900 });
  await shot(page, 'director-closed-1280', 1200);

  // ── Director AÇIK (dedup) ──────────────────────────────
  await act(`window.__mamilas.setState({
    currentStep: 'director',
    phase0PresetId: 'product_brand',
    selectedWorldId: 'deakins_naturalist',
    selectedPaletteId: 'golden_dust_epic',
    selectedRefIds: ['cinedna_golden']
  })`);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await shot(page, 'director-open-1600', 1400);
  await page.setViewportSize({ width: 1280, height: 900 });
  await shot(page, 'director-open-1280', 1000);

  // ── QA (akış + canlı ray) ──────────────────────────────
  await act(`window.__mamilas.setState({ currentStep: 'qa' })`);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await shot(page, 'qa-early-1600', 3000);   // ilk sesler — sol kolonda queued kartlar görünür
  await shot(page, 'qa-late-1600', 9000);    // tüm sesler konuştu
  await page.setViewportSize({ width: 1280, height: 900 });
  await shot(page, 'qa-1280', 1500);         // akvaryum toggle × 'Timeline'a Dön' CTA çakışması

  await browser.close();
  server.kill();
  console.log('DONE →', OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
