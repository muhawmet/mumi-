// KANIT DOKUSU ÜRETİCİ — yalnız yerel doğrulama için. ÇIKTILARI COMMIT ETME.
// Kullanım: node scripts/make-proof-textures.mjs  → sonra: rm public/assets3d/*.webp
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const SLOTS = [
  ['card-hero-archetype', 1024, 1448], ['card-detective-archetype', 1024, 1448],
  ['card-arcane-archetype', 1024, 1448], ['card-explorer-archetype', 1024, 1448],
  ['table-top', 1024, 1024], ['floor-disc', 2048, 2048],
  ['backdrop-sky', 2048, 1024], ['logo-card', 1024, 1448],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, w, h] of SLOTS) {
  const dataUrl = await page.evaluate(([name, w, h]) => {
    const c = Object.assign(document.createElement('canvas'), { width: w, height: h });
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#3a2f1a'); grad.addColorStop(1, '#141210'); // palet-içi, düşük value
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(214,168,79,0.7)'; g.font = `${Math.round(w / 14)}px monospace`;
    g.textAlign = 'center'; g.fillText(name, w / 2, h / 2); // slot adı = "bu bir proof"
    return c.toDataURL('image/webp', 0.9);
  }, [name, w, h]);
  writeFileSync(`public/assets3d/${name}.webp`, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log(`✓ proof: ${name}.webp (${w}×${h})`);
}
await browser.close();
