#!/usr/bin/env node
/**
 * ogrendim.mjs — OTURUM İÇİ HÜKÜM DEFTERİ
 *
 * NEDEN VAR (Mami, 2026-08-07):
 *   "sana verdiğimi neden anlık bir hafızaya yazmayasın, bitince de 'kanka bunları
 *    öğrendim, hangileri kalsın' dersin; ben '1-3 boş, diğerleri must' derim, ana bir
 *    yere alırsın, sohbete başlayınca yüklenir onlar."
 *
 * Kapatılan dikiş: bir hüküm oturum İÇİNDE veriliyor ama yalnız Claude'un bağlamında
 * yaşıyor. O an açılan ajanlar ancak elle taşınırsa görüyor, /clear'da ise tamamen
 * kayboluyor. Bu araç hükmü DÜŞTÜĞÜ AN diske yazar, oturum sonunda numaralı liste
 * hâlinde Mami'ye sunar ve yalnız onun tuttuklarını kalıcı yere taşır.
 *
 * NEDEN `agents/lessons/CANDIDATES-*` DEĞİL: o hat proje sonunda TOPLU hasat yapıyordu;
 * ölçüldü, 115 aday birikti ve 7'si onaylandı. Bu hat oturum sonunda, hüküm TAZEYKEN,
 * tek tuşla ayıklanır. Fark toplu-vs-taze farkıdır.
 *
 * KULLANIM
 *   node scripts/ogrendim.mjs yaz "<hüküm>" [--kanit "<ölçüm>"] [--bolum motion|prompt|dunya|cuzdan|kod]
 *   node scripts/ogrendim.mjs sor                       ← numaralı liste, Mami'ye sunulur
 *   node scripts/ogrendim.mjs tasi --at 1,3             ← 1 ve 3 düşer, kalanı OLCULENLER'e girer
 *   node scripts/ogrendim.mjs tasi --tut 2,4,5          ← yalnız bunlar girer, kalanı düşer
 *   node scripts/ogrendim.mjs temizle                   ← defteri boşalt (taşımadan)
 *
 * 🔴 KALICI YERE YALNIZ MAMİ'NİN SEÇTİĞİ GİRER. Otomatik promote YOK — çöp hüküm
 *    sistemi zehirler ve bu repoda bir kez ölçüldü.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFTER = join(ROOT, 'artifacts', 'ogrendiklerim.md');
const KALICI = join(ROOT, 'agents', 'OLCULENLER.md');
// TAM ARŞİV (Mami, 2026-08-07: "bir de ogrenenler_all yap, onu da genel görürüm, arada
// kendim törpülerim"). Buraya HER hüküm yazılır — ana hafızaya taşınan da, düşürülen de.
// Otomatik yüklenmez, tavanı yoktur, hiçbir şey silinmez. Ana hafıza DAR olmak zorunda
// (her oturum onu yükler); arşiv GENİŞ olmak zorunda (hiçbir ölçüm kaybolmasın).
// Düşürülen bir madde bir gün gerekirse buradan geri alınır.
const ARSIV = join(ROOT, 'agents', 'OGRENENLER-ALL.md');

const BOLUMLER = {
  motion: '## MOTION VE KLİP',
  prompt: '## PROMPT YAZIMI',
  dunya: '## DÜNYA SEÇİMİ',
  cuzdan: '## CÜZDAN',
  kod: '## KOD VE DOĞRULAYICI',
};

const argv = process.argv.slice(2);
const cmd = argv[0];
const flag = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };

const BAS = `# ÖĞRENDİKLERİM — oturum içi hüküm defteri

> Bu dosya **taslaktır.** Buraya bir hüküm düştüğü an yazılır; oturum sonunda Mami'ye
> numaralı liste hâlinde sunulur ve **yalnız onun tuttukları** \`agents/OLCULENLER.md\`'ye
> taşınır. Otomatik promote YOK.

`;

function oku() {
  if (!existsSync(DEFTER)) return [];
  const t = readFileSync(DEFTER, 'utf8');
  const out = [];
  for (const blok of t.split(/\n(?=- \[)/)) {
    const m = blok.match(/^- \[(\w+)\]\s+([\s\S]+?)(?:\n\s+kanıt:\s*([\s\S]+))?$/);
    if (m) out.push({ bolum: m[1], hukum: m[2].trim(), kanit: (m[3] || '').trim() });
  }
  return out;
}

function yazDefter(list) {
  mkdirSync(dirname(DEFTER), { recursive: true });
  const govde = list.map((x) => `- [${x.bolum}] ${x.hukum}` + (x.kanit ? `\n  kanıt: ${x.kanit}` : '')).join('\n\n');
  writeFileSync(DEFTER, BAS + govde + (govde ? '\n' : ''), 'utf8');
}

if (cmd === 'yaz') {
  const hukum = argv[1];
  if (!hukum || hukum.startsWith('--')) { console.error('kullanım: ogrendim.mjs yaz "<hüküm>" [--kanit "..."] [--bolum motion]'); process.exit(2); }
  const bolum = flag('bolum') || 'prompt';
  if (!BOLUMLER[bolum]) { console.error(`bölüm geçersiz. Seçenekler: ${Object.keys(BOLUMLER).join(' · ')}`); process.exit(2); }
  const list = oku();
  list.push({ bolum, hukum, kanit: flag('kanit') || '' });
  yazDefter(list);
  console.log(`✍️  deftere yazıldı (#${list.length} · ${bolum}) — oturum sonunda sorulacak.`);
  process.exit(0);
}

if (cmd === 'sor' || !cmd) {
  const list = oku();
  if (!list.length) { console.log('defter boş — bu oturumda yazılmış hüküm yok.'); process.exit(0); }
  console.log(`\n📓 BU OTURUMDA ÖĞRENDİKLERİM — ${list.length} madde`);
  console.log('   Hangileri kalsın? Düşecekleri söyle, gerisi kalıcı yere geçer.\n');
  list.forEach((x, i) => {
    console.log(`${String(i + 1).padStart(2)}. [${x.bolum}] ${x.hukum}`);
    if (x.kanit) console.log(`    kanıt: ${x.kanit}`);
  });
  console.log(`\n   node scripts/ogrendim.mjs tasi --at 1,3      (1 ve 3 düşer)`);
  console.log(`   node scripts/ogrendim.mjs tasi --tut 2,4,5   (yalnız bunlar kalır)`);
  process.exit(0);
}

if (cmd === 'tasi') {
  const list = oku();
  if (!list.length) { console.log('defter boş.'); process.exit(0); }
  const at = (flag('at') || '').split(',').map((n) => parseInt(n, 10)).filter(Boolean);
  const tut = (flag('tut') || '').split(',').map((n) => parseInt(n, 10)).filter(Boolean);
  if (!at.length && !tut.length) { console.error('--at ya da --tut ver. Hangisinin kalacağını MAMİ söyler.'); process.exit(2); }

  const kalan = list.filter((_, i) => (tut.length ? tut.includes(i + 1) : !at.includes(i + 1)));
  const dusen = list.length - kalan.length;
  if (!kalan.length) { console.log(`hiçbiri taşınmadı (${dusen} madde düştü).`); yazDefter([]); process.exit(0); }

  if (!existsSync(KALICI)) { console.error(`❌ ${KALICI} yok — kalıcı yer kurulmamış.`); process.exit(2); }
  let kal = readFileSync(KALICI, 'utf8');

  // Mevcut en yüksek madde numarasını bul, oradan devam et.
  const nums = [...kal.matchAll(/^(\d+)\.\s/gm)].map((m) => parseInt(m[1], 10));
  let sira = nums.length ? Math.max(...nums) : 0;

  for (const x of kalan) {
    sira += 1;
    const satir = `${sira}. ${x.hukum}` + (x.kanit ? `\n    *(${x.kanit})*` : '') + '\n';
    const baslik = BOLUMLER[x.bolum];
    if (kal.includes(baslik)) {
      // Bölümün SONUNA ekle: bir sonraki '## ' başlığından hemen önce.
      const i = kal.indexOf(baslik) + baslik.length;
      const j = kal.indexOf('\n## ', i);
      const kes = j === -1 ? kal.length : j;
      kal = kal.slice(0, kes).replace(/\s*$/, '\n') + satir + kal.slice(kes);
    } else {
      kal = kal.replace(/\s*$/, '\n') + `\n${baslik}\n\n` + satir;
    }
  }
  writeFileSync(KALICI, kal, 'utf8');

  // Arşive HEPSİ yazılır — taşınan da, düşen de. Hiçbir ölçüm kaybolmaz.
  const dusenler = list.filter((x) => !kalan.includes(x));
  const bugun = new Date().toISOString().slice(0, 10);
  let ars = existsSync(ARSIV) ? readFileSync(ARSIV, 'utf8') : `# ÖĞRENENLER — TAM ARŞİV

> Buraya **her hüküm** yazılır: ana hafızaya (\`agents/OLCULENLER.md\`) taşınan da,
> Mami'nin düşürdüğü de. Bu dosya **otomatik yüklenmez**, tavanı yoktur, hiçbir şey
> silinmez. Ana hafıza DAR olmak zorunda çünkü her oturum onu yükler; arşiv GENİŞ
> olmak zorunda çünkü bir ölçüm bugün gereksizken yarın gerekebilir.
>
> Mami arada bakar ve törpüler. Düşmüş bir maddeyi geri almak isterse kaynağı burasıdır.
`;
  ars = ars.replace(/\s*$/, '\n') + `\n## ${bugun}\n\n`;
  for (const x of kalan) ars += `- ✅ **ANA HAFIZAYA** · [${x.bolum}] ${x.hukum}` + (x.kanit ? `\n  kanıt: ${x.kanit}` : '') + '\n';
  for (const x of dusenler) ars += `- ⬇️ düşürüldü (Mami) · [${x.bolum}] ${x.hukum}` + (x.kanit ? `\n  kanıt: ${x.kanit}` : '') + '\n';
  writeFileSync(ARSIV, ars, 'utf8');

  yazDefter([]);
  console.log(`✅ ${kalan.length} madde kalıcı yere taşındı → agents/OLCULENLER.md`);
  if (dusen) console.log(`   ${dusen} madde düştü (Mami kararı).`);
  console.log(`   Defter boşaltıldı. Yeni oturum bunları ilk mesajda bilecek.`);
  console.log(`   📚 Hepsi (taşınan + düşen) arşive de yazıldı → agents/OGRENENLER-ALL.md`);
  process.exit(0);
}

if (cmd === 'temizle') { yazDefter([]); console.log('defter boşaltıldı (taşınmadı).'); process.exit(0); }

console.error(`kullanım:
  node scripts/ogrendim.mjs yaz "<hüküm>" [--kanit "..."] [--bolum motion|prompt|dunya|cuzdan|kod]
  node scripts/ogrendim.mjs sor
  node scripts/ogrendim.mjs tasi --at 1,3   |   --tut 2,4,5
  node scripts/ogrendim.mjs temizle`);
process.exit(2);
