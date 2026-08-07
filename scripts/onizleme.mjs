#!/usr/bin/env node
/**
 * onizleme.mjs — AJAN GÖZÜ İÇİN YARI ÇÖZÜNÜRLÜK ÖNİZLEMESİ
 *
 * NEDEN VAR (ölçüldü 2026-08-07, Mami: "usage için en sağlam fikri bulmak lazım
 * HİÇ KALİTEDEN KAYBETMEDEN"):
 *
 * Bir motion turunda beş sekans ajanı toplam 1.027.638 token yaktı ve bununla
 * 54 paragraf (~15k token) üretti — harcamanın %98,5'i OKUMAYA gitti.
 * Kırılımın büyük bir dilimi karelerdi: kareler 2752×1536 basılıyor ve Claude'un
 * görü maliyeti alanla doğru orantılı (≈ genişlik×yükseklik/750):
 *
 *     2752×1536  →  ~5.640 token/kare  ×54  =  ~304.000 token
 *     1376× 768  →  ~1.410 token/kare  ×54  =  ~ 76.000 token      (aynı içerik)
 *
 * Yani **linear yarıya inmek maliyeti dörtte bire indiriyor.**
 *
 * KALİTE KAYBI NEDEN YOK — bu iddia keyfi değil, işe bağlı:
 * Motion yazarken kareden okunan şeyler kadraj, yerleşim, ışık yönü, hâlihazırda
 * kımıldayan öğeler ve gövde sayısıdır; hepsi 1376×768'de tamamen görünür.
 * 1376'da KAYBOLAN tek şey diakritik ve ince yazı ayrıntısıdır — ve bu repoda
 * zaten ayrı bir yasa var: "yazı hükmü tam çözünürlüklü kırpmadan verilir"
 * (2026-08-07, iki kez küçültülmüş görüntüden yanlış hüküm verildi).
 * Bu yüzden önizleme yazı taşıyan kareyi ELEMEZ, sadece işaretler: o kareler
 * tam çözünürlükten açılır.
 *
 * KULLANIM
 *   node scripts/onizleme.mjs "<proje klasörü>" [--genislik 1376] [--kuru]
 *
 * ÇIKTI
 *   <proje>/images/_ONIZLEME/<n>.jpg   ← ajanların okuyacağı kareler
 *   ve token tasarrufunun ÖLÇÜSÜ (tahmin değil, piksel alanından hesap).
 *
 * ffmpeg kullanılır: hem macOS hem Windows'ta var ve bu repoda zaten bağımlılık
 * (kare-cek, motion-qc, kaba-kurgu onu koşuyor). `sips` BİLEREK kullanılmadı —
 * mac-only olurdu ve bu repoda "araç ortam varsayarsa sessiz no-op olur" kuralı
 * dört kez ölçülmüş bir kusur sınıfıdır.
 */

import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const argv = process.argv.slice(2);
const KURU = argv.includes('--kuru');
const gi = argv.indexOf('--genislik');
const HEDEF_GENISLIK = gi >= 0 && argv[gi + 1] ? parseInt(argv[gi + 1], 10) : 1376;
const projeArg = argv.find((a) => !a.startsWith('--') && a !== String(HEDEF_GENISLIK));

if (!projeArg) {
  console.error('kullanım: node scripts/onizleme.mjs "<proje klasörü>" [--genislik 1376] [--kuru]');
  process.exit(2);
}

const PROJE = resolve(projeArg);
const IMG = join(PROJE, 'images');
if (!existsSync(IMG)) {
  console.error(`❌ images/ yok: ${IMG}`);
  process.exit(2);
}

/** Claude görü maliyeti ≈ alan/750 token. Kaynak: Anthropic görü belgeleri. */
const tokenTahmini = (w, h) => Math.round((w * h) / 750);

function olcu(dosya) {
  try {
    const out = execFileSync('ffprobe', [
      '-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height', '-of', 'csv=p=0', dosya,
    ], { encoding: 'utf8' }).trim();
    const [w, h] = out.split(',').map((n) => parseInt(n, 10));
    return Number.isFinite(w) && Number.isFinite(h) ? { w, h } : null;
  } catch { return null; }
}

const kareler = readdirSync(IMG)
  .filter((f) => /\.(png|jpg|jpeg)$/i.test(f))
  .filter((f) => !f.startsWith('.'))
  .sort();

if (!kareler.length) {
  console.error(`❌ ${IMG} altında kare yok.`);
  process.exit(2);
}

const CIKTI = join(IMG, '_ONIZLEME');
if (!KURU && !existsSync(CIKTI)) mkdirSync(CIKTI, { recursive: true });

let eskiTok = 0;
let yeniTok = 0;
let yazildi = 0;
let atlandi = 0;
const buyukler = [];

for (const f of kareler) {
  const kaynak = join(IMG, f);
  if (statSync(kaynak).isDirectory()) continue;
  const b = olcu(kaynak);
  if (!b) { console.error(`⚠ ölçülemedi, atlandı: ${f}`); continue; }

  const eski = tokenTahmini(b.w, b.h);
  eskiTok += eski;

  if (b.w <= HEDEF_GENISLIK) {
    // Zaten küçük — küçültmek kayıp olur, olduğu gibi sayılır.
    yeniTok += eski;
    atlandi += 1;
    continue;
  }

  const oran = HEDEF_GENISLIK / b.w;
  const yh = Math.round(b.h * oran);
  yeniTok += tokenTahmini(HEDEF_GENISLIK, yh);
  if (eski > 4000) buyukler.push(f);

  if (!KURU) {
    const hedef = join(CIKTI, f.replace(/\.(png|jpg|jpeg)$/i, '.jpg'));
    execFileSync('ffmpeg', [
      '-y', '-loglevel', 'error', '-i', kaynak,
      '-vf', `scale=${HEDEF_GENISLIK}:-2:flags=lanczos`,
      '-q:v', '3', hedef,
    ]);
    yazildi += 1;
  }
}

const kazanc = eskiTok - yeniTok;
const yuzde = eskiTok ? Math.round((kazanc / eskiTok) * 100) : 0;

console.log(`\n📐 ÖNİZLEME — ${kareler.length} kare · hedef genişlik ${HEDEF_GENISLIK}px`);
console.log(`   tam çözünürlük okuması : ${eskiTok.toLocaleString('tr-TR')} token`);
console.log(`   önizleme okuması       : ${yeniTok.toLocaleString('tr-TR')} token`);
console.log(`   🔴 AJAN BAŞINA KAZANÇ  : ${kazanc.toLocaleString('tr-TR')} token (%${yuzde})`);
if (atlandi) console.log(`   (${atlandi} kare zaten ${HEDEF_GENISLIK}px altında — küçültülmedi)`);
if (!KURU) console.log(`\n✅ yazıldı: ${yazildi} dosya → ${CIKTI}`);
else console.log(`\n(kuru koşu — hiçbir dosya yazılmadı)`);

console.log(`
⚠ KULLANIM KURALI — bu araç yasayı EZMEZ:
   · Motion yazarken ajan _ONIZLEME/ okur.
   · YAZI taşıyan kare ve anatomi hükmü gereken kare TAM ÇÖZÜNÜRLÜKTEN açılır.
     (Ölçüldü 2026-08-07: küçültülmüş görüntüden iki kez yanlış "diakritik yok" hükmü verildi.)
   · Kare kalitesi hakkında MAMİ'YE sunulan hiçbir görüntü önizlemeden gelmez.`);
