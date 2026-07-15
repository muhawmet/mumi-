// Design tour: her stage'i ?scene=force ile screenshot'la + portre yakın planları.
// Çalıştır: cd ~/Desktop/mamilas-modern && node scripts/design-tour-shots.mjs
// Çıktı: output/design-tour/ (TOUR_OUT env ile değiştirilebilir). Port 5178 boş olmalı.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const OUT = process.env.TOUR_OUT || 'output/design-tour';
const PORT = 5178;
const URL = `http://localhost:${PORT}/?scene=force`;
const VO = [
  'Işık yaprağa çarptığında görünmez bir fabrika çalışmaya başlar.',
  'Kloroplastların içindeki klorofil, güneş ışığını yakalar ve enerjiye çevirir.',
  'Su kökten yukarı tırmanır, karbondioksit gözeneklerden içeri süzülür.',
  'Bu üç malzeme birleşir ve ortaya şeker ile oksijen çıkar.',
  'Yani her nefesin, bir yaprağın sessiz emeğidir.',
].join(' ');

const shot = async (page, name, wait = 1200) => {
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
  await shot(page, '00-dashboard-fresh', 800); // sakin mod kanıtı: toast yok, rozet var

  const act = (code) => page.evaluate(code);
  await act(`(() => {
    const st = window.__mamilas;
    st.setState({ projectTopic: ${JSON.stringify('Fotosentez: Işığın Şekere Dönüşen Yolculuğu')} });
    st.getState().setRawSource(${JSON.stringify(VO)});
    st.getState().decodeRawSource();
    st.getState().ingestRawSource();
  })()`);
  await shot(page, '01-dashboard', 2000);

  // Recipe: dünya kartı gerçek tıklama
  await act(`window.__mamilas.setState({ currentStep: 'recipe' })`);
  await page.waitForTimeout(1400);
  const worldCard = page.locator('text=Pixar 3D').first();
  if (await worldCard.isVisible().catch(() => false)) {
    await worldCard.click();
    await page.waitForTimeout(900);
  }
  await shot(page, '02-recipe');

  await act(`window.__mamilas.setState({ currentStep: 'scenes' })`);
  await shot(page, '03-scenes', 3000); // scene=force + yazılımsal WebGL: ekran geç oturur

  await act(`window.__mamilas.setState({ currentStep: 'timeline' })`);
  await page.waitForTimeout(700);
  await act(`window.__mamilas.getState().generateScenes()`);
  await page.waitForTimeout(2500);
  await shot(page, '04-timeline');

  await act(`window.__mamilas.setState({ currentStep: 'qa' })`);
  await page.waitForTimeout(9000); // sesler konuşsun
  await shot(page, '05-qa', 500);

  // Toast yakın planı (varsa)
  const toast = page.locator('[data-testid="thought-toast"]').first();
  if (await toast.isVisible().catch(() => false)) {
    await toast.screenshot({ path: `${OUT}/06-toast-closeup.png` });
    console.log('✓ 06-toast-closeup');
  } else console.log('· toast yok, atlandı');

  // Rozet → çekmece (InnerVoice drawer) yakın planı
  const badge = page.locator('[data-testid="thought-badge"]');
  if (await badge.isVisible().catch(() => false)) {
    await badge.click();
    await page.waitForTimeout(900);
    const drawer = page.locator('[data-testid="thought-drawer"]');
    if (await drawer.isVisible().catch(() => false)) {
      await drawer.screenshot({ path: `${OUT}/07-drawer-closeup.png` });
      console.log('✓ 07-drawer-closeup');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(600);
    }
  } else console.log('· rozet yok, çekmece atlandı');

  await act(`window.__mamilas.setState({ currentStep: 'director' })`);
  await shot(page, '08-director', 1500);

  // Akvaryum modu (chrome gizli, saf diorama)
  const aqToggle = page.locator('.ml-aquarium-toggle');
  if (await aqToggle.isVisible().catch(() => false)) {
    await aqToggle.click();
    await shot(page, '09-aquarium', 2000);
    await aqToggle.click();
    await page.waitForTimeout(600);
  } else console.log('· akvaryum toggle yok');

  await browser.close();
  server.kill();
  console.log('DONE');
}

main().catch((err) => { console.error(err); process.exit(1); });
