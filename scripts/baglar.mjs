#!/usr/bin/env node
// MAMILAS BAĞ DENETİMİ — belgelerdeki her dosya/satır atfı gerçekten var mı?
//
// NEDEN VAR (2026-08-02 ölçümü): Yasa, skill ve hafıza metinleri birbirine dosya:satır ile
// atıfta bulunuyor ve bu atıfların HİÇBİRİ doğrulanmıyordu. Tek bir katmanda (skill parkı)
// elle bakınca 10 kırık atıf çıktı — üçü yanlış satır numarası, üçü var olmayan skill adı,
// biri hiç olmayan dizin. Kod değişiyor, atıf donuyor; okuyan ajan yanlış yere bakıyor.
//
// Bu K1'in aracıdır: "düzyazıda iddia edilen ama makinede kontrol edilmeyen sözleşme bir
// sözleşme değil, bir alışkanlıktır."
//
// NE ÖLÇER — üç sınıf, üçü de sert:
//   YOK        : atıf edilen dosya yok
//   SATIR-YOK  : dosya var ama o satır yok (dosya kısaldı, atıf donmuş)
//   BOŞ-DİZİN  : atıf edilen dizin var ama boş (metin "burada X var" diyorsa yalan)
//
// NE ÖLÇMEZ (ve bunu her koşuda SÖYLER — K6): atfın anlamca doğru olup olmadığını.
// `brain.ts:506` var olabilir ama orada `dnaDirectives` olmayabilir. Satır numarası
// doğrulanır, içeriği doğrulanmaz. Bu sınır KAPSAM satırında yazılıdır.
//
// Kullanım:
//   node scripts/baglar.mjs                 # canlı yüzeyleri tara, rapor bas
//   node scripts/baglar.mjs --strict        # kırık varsa exit 1 (kapı için)
//   node scripts/baglar.mjs --kisa          # yalnız kırıkları bas
//   node scripts/baglar.mjs <dosya…>        # yalnız verilen md dosyalarını tara

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { dirname, join, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, '..');

// ── TARANAN YÜZEYLER ─────────────────────────────────────────────────────────
// Canlı kanon taranır. Arşiv taranmaz ve bu bir tercih değil ölçüm: arşiv tanımı gereği
// eski hâli anlatır, oradaki atıfın bugün kırık olması kusur DEĞİLDİR (CLAUDE.md:31).
export const TARANAN = ['docs', 'agents', '.claude', '.agents', 'src/core'];
export const TARANMAYAN = [
  'node_modules', '.git', 'dist', 'output', 'reports', 'coverage',
  'artifacts',                      // arşiv — otorite değil
  'docs/ai/archive',                // eski yasa sürümleri
  'docs/ai/sync',                   // ~/.claude aynası; kaynağı canlı dosya
  'docs/superpowers',               // dış kütüphane
  'agents/COMMAND-INBOX',           // teslim çıktısı; sözleşmesi teslim-denetim'in işi
  'agents/EN-IYI-ORNEKLER',         // örnek korpus
  '.claude/.buddy-state',
];

// Kök dizindeki tek tek dosyalar da kanondur.
export const KOK_DOSYALAR = ['CLAUDE.md', 'AGENTS.md', 'README.md'];

// TARİHLİ KAYIT = arşiv sınıfı. Adında tarih taşıyan bir belge bir ANI anlatır; oradaki atfın
// bugün kırık olması kusur DEĞİLDİR — dosya taşınmış olabilir ve kayıt doğru kalmalıdır.
// Aynı gerekçe ders adayları ve hasat çıktıları için de geçerli: ikisi de o günün fotoğrafı.
// Bu bir susturma değil ayrım — kaç dosyanın bu yüzden atlandığı KAPSAM satırında basılır.
export const TARIHLI = /(?:^|[-_/])(?:20\d\d-\d\d-\d\d)|\/(?:CANDIDATES|HASAT)-/;

// GEREKÇELİ İSTİSNA — bir atıf bilerek var olmayan bir hedefi gösteriyorsa (üretimde oluşan
// çıktı dizini gibi) satırın kendisine gerekçe yazılır: <!-- bag-yok: neden -->
// Sessiz susturma YOK: gerekçesiz istisna kabul edilmez, gerekçeliler ayrı sayılır ve listelenir.
export const ISTISNA = /<!--\s*bag-yok:\s*([^>]*?)\s*-->/;
export const ISTISNA_TAVAN = 6;   // bir markörün örtebileceği en çok satır (sömürü kapısı)

// ── ATIF ÇIKARIMI ────────────────────────────────────────────────────────────
// Üç desen. Hepsi tutucu: bir şey yol GÖRÜNMÜYORSA atıf sayılmaz. Yanlış alarm,
// hiç ölçmemekten daha zararlıdır (ölçüldü: prompt-lint 50 karede 19 yanlış alarm
// verdiği için insan lint'e bakmayı bıraktı).

const MD_LINK = /\[[^\]]*\]\(([^)\s]+)\)/g;          // [ad](yol)
const KOD_YOL = /`([^`\n]+?)`/g;                      // `yol` ya da `yol:123`
const CIPLAK = /(?:^|[\s(])((?:\.{1,2}\/|~\/)?(?:[A-Za-z0-9._-]+\/)+[A-Za-z0-9._-]+\.[A-Za-z0-9]{1,5}(?::\d{1,6})?)/g;

// Repo kökündeki gerçek girişler — "yol mu, laf mı" ayrımının ÇAPASI budur.
// Neden böyle: ilk koşuda 100 "kırık"ın ~70'i yanlış alarmdı — `f/2.8` diyaframdı,
// `Vite/React/Three.js` ürün adı listesiydi, `0.28/0.82` orandı, `MOTION/` kısaltmaydı.
// Yanlış alarm hiç ölçmemekten daha zararlıdır: ölçüldü, prompt-lint 50 karede 19 yanlış
// alarm verdiği için insan lint'e bakmayı bıraktı. Bu yüzden kıstas SERT — bir atıf ancak
// ilk parçası repo kökünde GERÇEKTEN varsa yol sayılır. Bedeli KAPSAM satırında yazılı:
// kökte olmayan bir dizine yapılan kırık atıf (README'nin `knowledge/`si gibi) görülmez.
let _kokCache = null;
export function kokGirisleri(root = ROOT) {
  if (_kokCache) return _kokCache;
  try { _kokCache = new Set(readdirSync(root)); } catch { _kokCache = new Set(); }
  return _kokCache;
}

export function yolMu(s, root = ROOT) {
  if (!s) return false;
  let t = s.trim();
  if (!t || t.length > 200) return false;
  if (t.startsWith('@')) t = t.slice(1);                      // CLAUDE.md import sözdizimi
  if (/^(https?|mailto|tel|data):/i.test(t)) return false;    // dış bağ — kapsam dışı
  if (t.startsWith('#')) return false;                        // sayfa içi çapa
  if (/[*?<>|"]/.test(t)) return false;                       // glob/şablon — atıf değil
  if (/[…]|\.\.\./.test(t)) return false;                     // elenmiş yol (`~/…/memory/`) — ölçülemez
  if (/\s/.test(t)) return false;
  const yol = t.split(':')[0];
  if (KOK_DOSYALAR.includes(yol)) return true;
  if (!yol.includes('/')) return false;
  if (!(/\.[A-Za-z0-9]{1,5}$/.test(yol) || yol.endsWith('/'))) return false;

  // ÇAPA: mutlak / ev / göreli ön ek, ya da ilk parça repo kökünde var.
  if (yol.startsWith('~/') || yol.startsWith('/') || yol.startsWith('./') || yol.startsWith('../')) return true;
  if (yol.startsWith('memory/')) return true;              // aşağıdaki HAFIZA_KOK'e çözülür
  const ilk = yol.split('/')[0];
  return kokGirisleri(root).has(ilk);
}

// `memory/...` REPODA DEĞİL, canlı hafızada yaşar.
// Terra 5.6 ikinci gözde yakaladı: skill metinleri `memory/mamilas-nb2-hata-katalogu.md`
// diye atıfta bulunuyor, repoda `memory/` diye bir dizin YOK, ve çapa kuralı bu atıfları
// "yol bile değil" diye eleyip **sessizce kapsam dışına atıyordu**. Yani "KIRIK 0" o
// atıfları hiç ölçmemişti. Kapsamın dışında kalan şey temiz sayılmaz (K6) — çözülür.
export const HAFIZA_KOK = join(
  homedir(), '.claude', 'projects', '-Users-Muhammet-Desktop-mamilas-modern', 'memory',
);

export function atiflariCikar(metin) {
  const bulunan = new Map();   // yol → { satir, gerekce }
  const satirlar = metin.split(/\r?\n/);

  // Kod bloklarının İÇİ de taranır: yasa ve skill metinleri örnek komutları ``` içine
  // koyuyor ve o komutlar gerçek yol taşıyor (ölçüldü: mamilas-ref'in kırık atıflarının
  // ikisi kod bloğundaydı).
  // Gerekçe markörü PARAGRAFI kapsar: yazıldığı satırdan sonraki BOŞ SATIRA kadar.
  // Tek satırlık pencere yetmiyordu — bir hüküm üç satıra yayıldığında markör yalnız ilk
  // satırı örtüyor, ikinci satırdaki atıf kırık sayılıyordu. Kapsam paragraftır çünkü
  // gerekçe cümleye değil HÜKME yazılır. Boş satır geçilince gerekçe DÜŞER — sessizce
  // sayfanın kalanına yayılmaz.
  // TAVAN VAR: bir markör en çok ISTISNA_TAVAN satır örtebilir. Terra 5.6 sömürü yolunu
  // gösterdi — boş satır koymadan uzun bir blok yazıp onlarca kırık atfı tek gerekçeyle
  // susturmak mümkündü. Gerekçe bir HÜKME yazılır, bir sayfaya değil.
  const gerekceler = new Array(satirlar.length).fill(null);
  let aktif = null;
  let kalan = 0;
  satirlar.forEach((satir, i) => {
    const m = satir.match(ISTISNA);
    if (m) { aktif = m[1]; kalan = ISTISNA_TAVAN; gerekceler[i] = aktif; return; }
    if (!satir.trim() || kalan <= 0) { aktif = null; return; }
    kalan--;
    gerekceler[i] = aktif;
  });

  satirlar.forEach((satir, i) => {
    const no = i + 1;
    const g = gerekceler[i];
    const ekle = (ham) => {
      const t = ham.trim().replace(/[.,;:)]+$/, (son) => (/^:\d+$/.test(son) ? son : ''));
      if (!yolMu(t)) return;
      if (!bulunan.has(t)) bulunan.set(t, { satir: no, gerekce: g });
    };
    for (const m of satir.matchAll(MD_LINK)) ekle(m[1]);
    for (const m of satir.matchAll(KOD_YOL)) ekle(m[1]);
    for (const m of satir.matchAll(CIPLAK)) ekle(m[1]);
  });

  return [...bulunan.entries()].map(([yol, v]) => ({ yol, satir: v.satir, gerekce: v.gerekce }));
}

// ── ÇÖZÜMLEME ────────────────────────────────────────────────────────────────
export function cozumle(atif, mdDosyaMutlak, root = ROOT) {
  const [hamYol, hamSatir] = ayir(atif.yol);
  const satirNo = hamSatir ? Number(hamSatir) : null;

  const adaylar = [];
  if (hamYol.startsWith('memory/')) {
    adaylar.push(join(HAFIZA_KOK, hamYol.slice('memory/'.length)));
  } else if (hamYol.startsWith('~/')) {
    adaylar.push(join(homedir(), hamYol.slice(2)));
  } else if (isAbsolute(hamYol)) {
    adaylar.push(hamYol);
  } else {
    // Önce repo kökü (belgelerin ezici çoğunluğu kök-göreli yazıyor), sonra dosyanın dizini.
    adaylar.push(resolve(root, hamYol));
    adaylar.push(resolve(dirname(mdDosyaMutlak), hamYol));
  }

  const vurgu = adaylar.find((p) => existsSync(p));
  if (!vurgu) return { ...atif, durum: 'YOK', hedef: adaylar[0], satirNo };

  const st = statSync(vurgu);
  if (st.isDirectory()) {
    const icerik = readdirSync(vurgu);
    if (!icerik.length) return { ...atif, durum: 'BOŞ-DİZİN', hedef: vurgu, satirNo };
    return { ...atif, durum: 'OK', hedef: vurgu, satirNo: null };
  }

  if (satirNo != null) {
    const n = readFileSync(vurgu, 'utf8').split(/\r?\n/).length;
    if (satirNo > n) {
      return { ...atif, durum: 'SATIR-YOK', hedef: vurgu, satirNo, dosyaSatir: n };
    }
  }
  return { ...atif, durum: 'OK', hedef: vurgu, satirNo };
}

// `yol:123` ve `yol:12-24` ayrıştırması. Aralıkta SON satır ölçülür — belge "şu satırlar"
// diyorsa aralığın sonu dosyanın içinde olmalı. Windows sürücü harfi (`C:\...`) satır sanılmaz.
export function ayir(s) {
  const t = s.startsWith('@') ? s.slice(1) : s;
  const m = t.match(/^(.*?):(\d{1,6})(?:[-–](\d{1,6}))?$/);
  if (!m) return [t, null];
  return [m[1], m[3] ?? m[2]];
}

// ── YÜRÜYÜCÜ ─────────────────────────────────────────────────────────────────
export const atlananTarihli = [];

export function mdDosyalari(root = ROOT) {
  const cikti = [];
  atlananTarihli.length = 0;
  const disla = (rel) => TARANMAYAN.some((d) => rel === d || rel.startsWith(`${d}/`));

  const yuru = (dizin) => {
    let girisler;
    try { girisler = readdirSync(dizin, { withFileTypes: true }); } catch { return; }
    for (const g of girisler) {
      const mutlak = join(dizin, g.name);
      const rel = relative(root, mutlak).split('\\').join('/');
      if (disla(rel)) continue;
      if (g.isDirectory()) yuru(mutlak);
      else if (g.name.toLowerCase().endsWith('.md')) {
        if (TARIHLI.test(`/${rel}`)) { atlananTarihli.push(rel); continue; }
        cikti.push(mutlak);
      }
    }
  };

  for (const d of TARANAN) {
    const p = join(root, d);
    if (existsSync(p)) yuru(p);
  }
  for (const f of KOK_DOSYALAR) {
    const p = join(root, f);
    if (existsSync(p)) cikti.push(p);
  }
  return cikti.sort();
}

export function denetle(dosyalar, root = ROOT) {
  const kirik = [];
  const gerekceli = [];
  let toplamAtif = 0;
  for (const d of dosyalar) {
    let metin;
    try { metin = readFileSync(d, 'utf8'); } catch { continue; }
    for (const a of atiflariCikar(metin)) {
      toplamAtif++;
      const r = cozumle(a, d, root);
      if (r.durum === 'OK') continue;
      const kayit = { ...r, kaynak: relative(root, d).split('\\').join('/') };
      // Gerekçeli istisna KIRIK sayılmaz ama SAKLANMAZ — ayrı listede, gerekçesiyle basılır.
      (a.gerekce ? gerekceli : kirik).push(kayit);
    }
  }
  return { kirik, gerekceli, toplamAtif, dosyaSayisi: dosyalar.length };
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const calistirilan = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (calistirilan) {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const kisa = argv.includes('--kisa');
  const hedefler = argv.filter((a) => !a.startsWith('--'));

  const dosyalar = hedefler.length ? hedefler.map((h) => resolve(h)) : mdDosyalari();
  const { kirik, gerekceli, toplamAtif, dosyaSayisi } = denetle(dosyalar);

  const sinif = (d) => kirik.filter((k) => k.durum === d);
  const yaz = (s) => process.stdout.write(`${s}\n`);

  yaz(`[bag] ${dosyaSayisi} md dosyası · ${toplamAtif} atıf · KIRIK ${kirik.length} · gerekçeli ${gerekceli.length}`);

  for (const d of ['YOK', 'SATIR-YOK', 'BOŞ-DİZİN']) {
    const grup = sinif(d);
    if (!grup.length) continue;
    yaz(`\n  ── ${d} (${grup.length}) ──`);
    for (const k of grup) {
      const ek = k.durum === 'SATIR-YOK' ? `  (dosya ${k.dosyaSatir} satır)` : '';
      yaz(`  ${k.kaynak}:${k.satir}  →  ${k.yol}${ek}`);
    }
  }

  if (gerekceli.length) {
    yaz(`\n  ── GEREKÇELİ İSTİSNA (${gerekceli.length}) — kırık değil, ama saklanmıyor ──`);
    for (const k of gerekceli) yaz(`  ${k.kaynak}:${k.satir}  →  ${k.yol}  ·  ${k.gerekce}`);
  }

  if (!kisa) {
    yaz('');
    yaz('  KAPSAM — bu ölçümün GÖRMEDİĞİ şeyler (yeşil ≠ temiz):');
    yaz('    · atfın ANLAMI doğrulanmaz — brain.ts:506 var olabilir ama orada o fonksiyon olmayabilir.');
    yaz('    · taranmayan yüzeyler: ' + TARANMAYAN.join(' · '));
    yaz(`    · tarihli kayıt olduğu için atlanan ${atlananTarihli.length} dosya (arşiv sınıfı — bir ANI anlatır):`);
    for (const a of atlananTarihli) yaz(`        ${a}`);
    yaz('    · http bağları, sayfa içi çapalar ve şablon/glob içeren yollar atıf sayılmaz.');
    yaz('    · ilk parçası repo kökünde olmayan yol atıf sayılmaz (yanlış alarm kıstası).');
    yaz('    · yalnız .md taranır; .ts/.mjs yorumlarındaki atıflar kapsam dışı.');
  }

  if (kirik.length === 0) yaz('\n[bag] ✅ canlı belgelerde kırık atıf yok.');
  process.exit(strict && kirik.length ? 1 : 0);
}
