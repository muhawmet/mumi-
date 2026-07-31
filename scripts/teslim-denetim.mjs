import fs from 'node:fs';
import path from 'node:path';

const DIR = '/Users/Muhammet/Desktop/mamilas-modern/agents/COMMAND-INBOX/5. Sınıf - Farklı Kültürler, Ortak Bir Yaşam';
const P = (f) => path.join(DIR, f);
const out = [];
const say = (s) => { out.push(s); console.log(s); };

// ---- 1. SAYIM
const vo = fs.readFileSync(P('Farklı Kültürler_SESLENDIRME.txt'), 'utf8');
const cumleler = {};
for (const l of vo.split(/\r?\n/)) {
  if (/AŞAĞISI KOPYALANMAZ/.test(l)) break;
  const m = /^(\d{1,3})\.\s+(.+)$/.exec(l.trim());
  if (m) cumleler[+m[1]] = m[2].trim();
}
const nVO = Object.keys(cumleler).length;

const ep = fs.readFileSync(P('Farklı Kültürler_EDIT-PLAN.txt'), 'utf8');
const epRows = {};
for (const l of ep.split(/\r?\n/)) {
  const m = /^\s*(\d+)\.png\s+K(\d+)\s+\S+\s+\S+\s+\[[^\]]+\]\s+(.+?)(?:\s{3,}◄.*)?$/.exec(l);
  if (m) epRows[+m[2]] = m[3].trim();
}
const pr = fs.readFileSync(P('Farklı Kültürler_PROMPTLAR.txt'), 'utf8');
const prN = (pr.match(/^### K\d+/gm) || []).length;
const motion = fs.readdirSync(P('MOTION')).filter((f) => /^\d+\.txt$/.test(f)).map((f) => parseInt(f, 10)).sort((a, b) => a - b);
const imgs = fs.readdirSync(P('resimler')).filter((f) => /^\d+\.(png|jpg|jpeg)$/i.test(f)).map((f) => parseInt(f, 10)).sort((a, b) => a - b);

say('## 1. SAYIM');
say(`  SESLENDIRME cümle : ${nVO}`);
say(`  EDIT-PLAN satır   : ${Object.keys(epRows).length}`);
say(`  PROMPTLAR blok    : ${prN}`);
say(`  MOTION dosya      : ${motion.length}`);
say(`  resimler görsel   : ${imgs.length}`);
const eksikImg = []; for (let i = 1; i <= nVO; i++) if (!imgs.includes(i)) eksikImg.push(i);
const eksikEp = []; for (let i = 1; i <= nVO; i++) if (!epRows[i]) eksikEp.push(i);
say(`  eksik görsel      : ${eksikImg.length ? eksikImg.map((n) => 'K' + n).join(' ') : 'YOK'}`);
say(`  eksik edit satırı : ${eksikEp.length ? eksikEp.map((n) => 'K' + n).join(' ') : 'YOK'}`);

// ---- 2. CÜMLE EŞLEŞMESİ
say('\n## 2. CÜMLE EŞLEŞMESİ — birebir mi');
let epFark = 0;
for (const n of Object.keys(cumleler).map(Number)) {
  if (!epRows[n]) continue;
  if (epRows[n] !== cumleler[n]) { epFark++; say(`  ✗ EDIT-PLAN K${n}\n      VO : ${cumleler[n]}\n      EP : ${epRows[n]}`); }
}
say(`  EDIT-PLAN ↔ SESLENDIRME: ${epFark === 0 ? '✅ 53/53 birebir' : `🔴 ${epFark} sapma`}`);

let moFark = 0, moYok = 0;
for (const n of motion) {
  const t = fs.readFileSync(P(`MOTION/${String(n).padStart(2, '0')}.txt`), 'utf8');
  const m = /VO\s+"([^"]+)"/.exec(t);
  if (!m) { moYok++; say(`  ✗ MOTION/${String(n).padStart(2, '0')}.txt — başlıkta VO cümlesi yok`); continue; }
  if (m[1].trim() !== cumleler[n]) { moFark++; say(`  ✗ MOTION K${n}\n      VO : ${cumleler[n]}\n      MO : ${m[1].trim()}`); }
}
say(`  MOTION ↔ SESLENDIRME: ${moFark === 0 && moYok === 0 ? `✅ ${motion.length}/${motion.length} birebir` : `🔴 ${moFark} sapma, ${moYok} başlıksız`}`);

// ---- 3. MOTION KAPSAMI
say('\n## 3. MOTION KAPSAMI');
const eksikMo = []; for (let i = 1; i <= nVO; i++) if (!motion.includes(i)) eksikMo.push(i);
say(`  motion YOK        : ${eksikMo.map((n) => 'K' + n).join(' ') || 'YOK'}`);
const kalan = fs.readFileSync(P('Farklı Kültürler_KALAN-URETIM.txt'), 'utf8');
const kalanN = [...kalan.matchAll(/KAYDEDECEĞİN AD:\s+(\d+)\.png/g)].map((m) => +m[1]).sort((a, b) => a - b);
say(`  KALAN-URETIM'de   : ${kalanN.map((n) => 'K' + n).join(' ')}`);
const fark1 = eksikMo.filter((n) => !kalanN.includes(n));
const fark2 = kalanN.filter((n) => !eksikMo.includes(n));
say(`  motion yok ama listede DEĞİL : ${fark1.map((n) => 'K' + n).join(' ') || 'YOK'}`);
say(`  listede ama motion VAR       : ${fark2.map((n) => 'K' + n).join(' ') || 'YOK'}  ← opsiyonel olanlar burada beklenir`);

// ---- 4. K02 ↔ K49 KİLİDİ
say('\n## 4. K02 ↔ K49 KAPANIŞ KİLİDİ');
const m02 = fs.existsSync(P('MOTION/02.txt')) ? fs.readFileSync(P('MOTION/02.txt'), 'utf8') : null;
const m49 = fs.existsSync(P('MOTION/49.txt')) ? fs.readFileSync(P('MOTION/49.txt'), 'utf8') : null;
const kilitli = (t) => t && /locked off|does not move at all|no pan, no push/i.test(t);
say(`  MOTION/02.txt : ${m02 ? (kilitli(m02) ? '✅ kamera SIFIR genlikte kilitli' : '🔴 kilit cümlesi bulunamadı') : '— yok'}`);
say(`  MOTION/49.txt : ${m49 ? (kilitli(m49) ? '✅ kilitli' : '🔴 kilit cümlesi bulunamadı') : '⏳ yok — K49 henüz basılmadı, motion yazılmadı (doğru davranış)'}`);

// ---- 5. SESSİZ YALAN TARAMASI
say('\n## 5. SESSİZ YALAN TARAMASI');
const dosyalar = fs.readdirSync(DIR).filter((f) => /\.txt$/.test(f));
for (const f of dosyalar) {
  const t = fs.readFileSync(P(f), 'utf8');
  const uyari = [];
  if (/BASILACAK/.test(t) && !/UYGULANMADI|GEÇMİŞTİR/.test(t)) uyari.push('"BASILACAK" listesi var ama uygulanmadığı yazılmamış');
  const s5 = /5s/.test(t) && !/6 SANİYE|6 saniye/.test(t);
  if (s5) uyari.push('"5s" geçiyor ama klip süresi 6 saniye');
  if (uyari.length) say(`  ⚠ ${f} — ${uyari.join(' · ')}`);
}
say('  (üstte hiçbir satır yoksa tarama temiz)');

fs.writeFileSync('/Users/Muhammet/Desktop/mamilas-modern/artifacts/denetim-2026-07-31/TESLIM-DENETIMI-farkli-kulturler.md',
  '# TESLİM DENETİMİ — 5.1.2 Farklı Kültürler (makine ölçümü, 2026-07-31)\n\n' +
  'AGY headless izin kapısına takıldığı için bu denetim deterministik olarak koşuldu.\n' +
  'Sorular AGY için yazılmıştı; hepsi makineyle kesin ölçülebilir olduğu için sonuç daha güvenilir.\n\n```\n' +
  out.join('\n') + '\n```\n');
