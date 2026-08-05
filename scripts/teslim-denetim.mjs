#!/usr/bin/env node
// MAMILAS TESLİM DENETİMİ — bir teslim setinin kendi sözleşmesine uyup uymadığını ölçer.
//
// ÖNCEKİ SÜRÜMÜN KUSURU (2026-08-02 ölçümü) — bu yorum silinmiyor çünkü sınıf tekrar eder:
//   · `process.argv`'ye HİÇ dokunmuyordu (grep -c = 0). Argüman verilse de yok sayılıyordu.
//   · Hedef proje `:4`'te MUTLAK STRING SABİTTİ. Yani `node teslim-denetim.mjs "<başka proje>"`
//     çağrısı sessizce Farklı Kültürler'i ölçüyor ve **doğru görünen yanlış bir sayı** basıyordu.
//     20 proje dizininin 19'una "53 kare" diyordu.
//   · Blok başlığı regexi tam `^### K\d+` idi. Hücre / Bitkilerde Üreme / Destek ve Hareket
//     `# K01 — "VO"` biçiminde yazılmıştı → hardcode kaldırılsa bile o üç derste **0** derdi.
//   Yani doğrulayıcı üreticiyle aynı sözleşmeyi konuşmuyordu ve bunu HİÇ SÖYLEMİYORDU.
//   Sessizce yanlış cevap veren bir doğrulayıcı, olmayan doğrulayıcıdan kötüdür: birincisine
//   güvenilir.
//
// BU SÜRÜMÜN YASASI:
//   1. Hedef argümandan gelir. Argüman yoksa `--all` ile bütün COMMAND-INBOX yürünür.
//   2. İki teslim biçimi de tanınır; TANINMAYAN biçim **0 kare demek yerine "BİÇİM TANINMADI"**
//      der ve KIRMIZI olur. Ölçememek temiz değildir.
//   3. Kare sayısı ↔ VO cümle sayısı uyuşmazlığı KIRMIZI'dır. Destek ve Hareket'te 41 kare
//      yazılmış, VO 52 cümleydi — K42-K52 hiç yoktu ve bunu bugüne kadar hiçbir şey söylemedi.
//   4. Hiçbir yola, hiçbir proje adına, hiçbir çıktı dizinine gömülü sabit YOK.
//
// Kullanım:
//   node scripts/teslim-denetim.mjs --all                 # bütün projeler, özet tablo
//   node scripts/teslim-denetim.mjs "<proje yolu>"        # tek proje, ayrıntılı
//   node scripts/teslim-denetim.mjs --all --strict        # kırmızı varsa exit 1
//   node scripts/teslim-denetim.mjs <proje> --rapor <yol> # raporu dosyaya da yaz

import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// Klasör adı yasası TEK yerde yaşar. İkinci kopya yazılırsa iki gerçek doğar.
import { IMAGE_DIR_ALIASES } from './current-work.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, '..');
export const INBOX = join(ROOT, 'agents', 'COMMAND-INBOX');

// Proje OLMAYAN kaplar — bunlar altında proje ARANIR, kendileri proje değildir.
const KAP = new Set(['Biten', 'DENEME', 'Bekleyen']);

// ── BAŞLIK LEHÇELERİ ─────────────────────────────────────────────────────────
// prompt-lint.mjs:546 ile AYNI aile. İki doğrulayıcı aynı hattı iki farklı sözleşmeyle
// okuduğu için bu kusur doğdu; artık aynı aileyi okuyorlar.
// 2026-08-02 ölçümü: teslim başlığı İKİ değil **BEŞ** lehçede yazılmış. Aynı sistem, aynı
// hat, beş ayrı yazım — çünkü biçim hiçbir yerde sözleşme değil, gelenekti:
//   B1  `### K01 | VO1 "…"`              (Farklı Kültürler, Bileşke Kuvvet)
//   B2  `# K01 — "…"`                    (Hücre, Bitkilerde Üreme, Destek ve Hareket)
//   B3  `K01 [MİRA]  |  VO 1: "…"`       (Kuvvetlerin Güç Birliği)
//   B4  `Sahne 1 — "…" (start frame)`    (5. Sürtünme)
//   B5  `Kare 1 — "…" (start frame)`     (Kütle ve Ağırlık)
// Beşi de tanınır. Tanınmayan bir altıncısı çıkarsa 0 DENMEZ, "BİÇİM TANINMADI" denir.
export const LEHCELER = [
  { ad: 'B1 (### K<n> | VO)', re: /^###\s*K\s*(\d{1,3})\b/gm },
  { ad: 'B2 (# K<n> — "VO")', re: /^#\s*K\s*(\d{1,3})\s*[—–-]/gm },
  { ad: 'B3/B4/B5 (K|Kare|Sahne|Shot <n>)', re: /^(?:#{1,6}\s*)?(?:K|KARE|SAHNE|SHOT)\s*[-–—]?\s*(\d{1,3})\s*(?=[—–|:.[\s]|$)/gim },
];

export function kareleriSay(metin) {
  for (const l of LEHCELER) {
    l.re.lastIndex = 0;
    const nolar = [...metin.matchAll(l.re)].map((m) => Number(m[1]));
    if (nolar.length) return { lehce: l.ad, nolar: [...new Set(nolar)].sort((a, b) => a - b) };
  }
  return { lehce: null, nolar: [] };
}

// ── DOSYA BULMA ──────────────────────────────────────────────────────────────
const listele = (d) => (existsSync(d) ? readdirSync(d) : []);
const dosyaMi = (p) => existsSync(p) && statSync(p).isFile();
const dizinMi = (p) => existsSync(p) && statSync(p).isDirectory();

function bul(dizin, desen) {
  return listele(dizin).filter((f) => desen.test(f)).map((f) => join(dizin, f)).filter(dosyaMi);
}

/** Klasördeki numaralı start frame'ler: `12.png` → 12. Sıralı, tekrarsız değil (ham). */
export function kareNumaralari(dizin) {
  return listele(dizin)
    .filter((f) => /^\d+\.(png|jpe?g)$/i.test(f))
    .map((f) => parseInt(f, 10))
    .sort((a, b) => a - b);
}

/**
 * START FRAME KLASÖRÜ — kanonik ad `images` (current-work.mjs IMAGES_DIR), eski adlar okunur.
 *
 * TUZAK (bu yorum silinmiyor): yeni rutin HER projeye BOŞ bir `images/` açar. Ada göre ilk
 * eşleşmeyi alan eski kod o boş klasörü seçip 53 karelik `resimler/`i gölgeler ve
 * "görsel yok: 1-53" derdi — yani doğrulayıcı OLMAYAN bir kusuru Mami'ye bildirirdi.
 * Kıstas ad değil İÇERİK: numaralı kare taşıyan klasör kazanır.
 *
 * BOŞ İSKELET ≠ KUSUR: hiçbir adayda kare yoksa `null` döner, "0 kare" DEĞİL. Ölçüldü —
 * `[]` dönmek `if (p.resimler)` dalını açıyor ve prompt fazındaki üç projeye
 * "🟡 görsel yok: K1-K52" basıyordu. Rutin gereği klasör kare inmeden ÖNCE doğar; onun
 * boşluğunu bulgu saymak, sistemin kendi iskeletini kusur diye Mami'ye bildirmektir.
 * Kısmi kapsama (10 kare inmiş, 52 gerekiyor) hâlâ SARI — orası gerçek eksik.
 */
export function resimDizinSec(proje) {
  const adaylar = [];
  for (const ad of IMAGE_DIR_ALIASES) {
    const d = altDizin(proje, [ad]);           // altDizin büyük/küçük harf duyarsız
    if (d && !adaylar.includes(d)) adaylar.push(d); // `resimler` ve `Resimler` aynı diski gösterir
  }
  if (!adaylar.length) return null;
  const iyi = adaylar.reduce((a, d) => (kareNumaralari(d).length > kareNumaralari(a).length ? d : a));
  return kareNumaralari(iyi).length ? iyi : null;
}

function altDizin(dizin, adlar) {
  for (const a of adlar) {
    const p = listele(dizin).find((f) => f.toLowerCase() === a.toLowerCase());
    if (p && dizinMi(join(dizin, p))) return join(dizin, p);
  }
  return null;
}

// KANONİK SEÇİM — türev dosya asıl dosyayı GÖLGELEMEZ.
// Ölçülen kusur (2026-08-02): `_SESLENDIRME.*` deseni alfabetik ilk eşleşmeyi alıyordu ve
// `..._SESLENDIRME-S1.txt` (tek sekans, 488B) ile `..._SESLENDIRME-TEK-BLOK.txt` (numarasız
// tek paragraf) asıl `..._SESLENDIRME.txt`'yi eziyordu → VO sayısı 0 ya da 1 çıkıyordu.
// Aynı sınıf `_REVİZE-PROMPTLAR` için de geçerli: revize dosyası aslıyla toplanırsa sayım şişer.
// Kural: sonek TAŞIMAYAN dosya kanoniktir; yoksa türevlere düşülür ve bu SÖYLENİR.
export function kanonikSec(dosyalar, ad) {
  const tam = (uzanti) => new RegExp(`(?:^|[^A-ZÇĞİÖŞÜ-])_?${ad}\\.${uzanti}$`, 'i');
  // `.txt` ÖNCE denenir: teslim yasası (§5) teslim setini `.txt` olarak tanımlıyor, `.md`
  // nüshası çalışma kalıntısıdır. Alfabetik seçim `.md`'yi öne alıyordu ve iki dosyalı
  // projelerde yanlış nüsha ölçülüyordu.
  return dosyalar.find((f) => tam('txt').test(basename(f)))
      ?? dosyalar.find((f) => tam('md').test(basename(f)))
      ?? dosyalar[0] ?? null;
}

// PROMPT DOSYASI ADIYLA DEĞİL İÇERİĞİYLE BULUNUR.
//
// Terra 5.6 ikinci gözde ölçtü ve haklıydı: ada bakan arama YANLIŞ BULGU üretti.
// `Kütle ve Ağırlık`'ta `_PROMPTLAR.txt` 8 kare taşıyor, kalan 27 kare
// `_CODEX-KALAN-START-FRAMELER.txt` adlı AYRI dosyada. Ada bakan denetçi "prompt setinin
// 27'si yok" dedi ve bu Mami'ye YANLIŞ BULGU olarak bildirildi. Kayıp yoktu, ad farklıydı.
// Doğru kıstas `prompt-lint.mjs:815-824`'te zaten vardı: dosyayı ADINDAN değil İÇERİĞİNDEN
// tanı — `STYLE:` / `NEGATIVE:` / `FRAME NEGATIVE` taşıyan her dosya bir prompt kaynağıdır.
// Teslim ve motion dosyaları elenir, çünkü onlar başka bir sözleşmenin parçası.
const PROMPT_ICERIK = /^STYLE:|^NEGATIVE:|FRAME NEGATIVE/m;
const PROMPT_DEGIL = /_MOTION|_EDIT-PLAN|_SESLENDIRME|_SUNO|_REFERANSLAR|_ENZIM|KAYNAK-METIN/i;

export function promptTasiyanlar(proje, promptDizin) {
  const adaylar = [...bul(proje, /\.(txt|md)$/i), ...(promptDizin ? bul(promptDizin, /\.(txt|md)$/i) : [])];
  return adaylar.filter((f) => {
    if (PROMPT_DEGIL.test(basename(f))) return false;
    try { return PROMPT_ICERIK.test(readFileSync(f, 'utf8')); } catch { return false; }
  });
}

export function tesliminParcalari(proje) {
  const promptDizin = altDizin(proje, ['PROMPTLAR']);
  const motionDizin = altDizin(proje, ['MOTION']);
  const resimDizin = resimDizinSec(proje);
  const promptHepsi = bul(proje, /_PROMPTLAR.*\.(txt|md)$/i);
  const promptKanonik = kanonikSec(promptHepsi, 'PROMPTLAR');
  return {
    vo: kanonikSec(bul(proje, /_SESLENDIRME.*\.(txt|md)$/i), 'SESLENDIRME'),
    voTurevMi: (() => {
      const h = bul(proje, /_SESLENDIRME.*\.(txt|md)$/i);
      return h.length > 0 && !/_SESLENDIRME\.(txt|md)$/i.test(basename(kanonikSec(h, 'SESLENDIRME') ?? ''));
    })(),
    editPlan: kanonikSec(bul(proje, /_EDIT-PLAN.*\.(txt|md)$/i), 'EDIT-PLAN'),
    promptBirlesik: promptKanonik ? [promptKanonik] : [],
    promptTurev: promptHepsi.filter((f) => f !== promptKanonik).map((f) => basename(f)),
    promptKaynaklari: promptTasiyanlar(proje, promptDizin),
    promptBlok: promptDizin ? bul(promptDizin, /\.(txt|md)$/i) : [],
    motionBirlesik: (() => { const k = kanonikSec(bul(proje, /_MOTION.*\.(txt|md)$/i), 'MOTION'); return k ? [k] : []; })(),
    motionBlok: motionDizin ? bul(motionDizin, /\.(txt|md)$/i) : [],
    resimler: resimDizin ? kareNumaralari(resimDizin) : null,
    suno: bul(proje, /_SUNO.*\.(txt|md)$/i)[0] ?? null,
    referanslar: bul(proje, /_REFERANSLAR.*\.(txt|md)$/i)[0] ?? null,
    kabaKurgu: bul(proje, /KABA-KURGU.*\.xml$/i)[0] ?? null,
  };
}

// ── VO ───────────────────────────────────────────────────────────────────────
// SESLENDIRME'NİN KENDİSİ İKİ BİÇİMDE YAZILIYOR (2026-08-02 ölçümü) — ve bu, teslim
// hattındaki üçüncü sessiz sözleşme kaymasıdır:
//   · NUMARALI  : `1. cümle` satırları. Kare↔VO eşliği ölçülebilir.
//   · TEK BLOK  : ElevenLabs v3 için numarasız düzyazı ("Numara YOK, etiket YOK, madde YOK —
//                 v3 noktalama ve paragraf boşluğundan nefes alır"). Cümle NUMARASI yok.
// Tek blokta cümle saymak bir TAHMİN olurdu; tahmine kırmızı bağlanmaz. Ölçemediğimizi
// söyleriz (K6), uydurmayız.
export function voBicimi(yol) {
  if (!yol) return { bicim: 'yok', cumleler: {} };
  const metin = readFileSync(yol, 'utf8');
  const cumleler = {};
  for (const l of metin.split(/\r?\n/)) {
    if (/AŞAĞISI KOPYALANMAZ/.test(l)) break;
    const m = /^(\d{1,3})\.\s+(.+)$/.exec(l.trim());
    if (m) cumleler[Number(m[1])] = m[2].trim();
  }
  // Üç ve daha az numaralı satır bir liste değil, düzyazıda geçen "1. paragraf" gibi bir
  // andıçtır — Bizi Bir Arada Tutan Değerler'de tam olarak bu oldu ve VO 1 sayıldı.
  if (Object.keys(cumleler).length > 3) return { bicim: 'numarali', cumleler };
  if (metin.replace(/\s+/g, '').length > 400) return { bicim: 'tek-blok', cumleler: {} };
  return { bicim: 'bos', cumleler: {} };
}

export function voCumleleri(yol) {
  return voBicimi(yol).cumleler;
}

// ── TEK PROJE ÖLÇÜMÜ ─────────────────────────────────────────────────────────
export function projeyiOlc(proje) {
  const p = tesliminParcalari(proje);
  const bulgu = [];
  const kirmizi = (s) => bulgu.push({ renk: 'KIRMIZI', s });
  const sari = (s) => bulgu.push({ renk: 'SARI', s });

  // ── §4a.1 REF SÖZLEŞMESİ — her @handle TAŞIR + TAŞIMAZ taşır (2026-08-05) ──
  //
  // Envanterin üç kovası bir ref'in NE OLDUĞUNU söylüyordu, NEYİ SIZDIRDIĞINI değil.
  // Ölçülmüş kusur (`CANDIDATES-plastik-mesafe-yasasi.md:15-18`): plastikliğin kaynağı
  // referans sayfasının KENDİ KADRAJI — ayak kadrajda 7/7 kötü karede var, 0/4 iyi karede
  // yok. Karakter ref'i kimliği taşırken tam-boy stüdyo pozunu da ithal ediyor.
  //
  // SARI, kırmızı değil: 14 canlı `_REFERANSLAR.txt`'in çoğu bu alanları taşımıyor ve
  // hepsini bir anda kırmızıya çevirmek çalışan projeleri kilitlerdi. İyi dosyalar bunu
  // ZATEN elle yazmış (Bileşke:30-37 KİMLİK/DURUM bölüşümü, Denetleyici:17-28 kadraj
  // kilidi) — yani sözleşme icat değil, en iyi pratiğin adının konması.
  if (p.referanslar) {
    let refMetin = '';
    try { refMetin = readFileSync(p.referanslar, 'utf8'); } catch { refMetin = ''; }
    const handleSayi = new Set((refMetin.match(/@[a-zçğıöşü][\w-]*/gi) ?? []).map((h) => h.toLowerCase())).size;
    if (handleSayi > 0) {
      const tasir = /^\s*TAŞIR\s*:/im.test(refMetin);
      const tasimaz = /^\s*TAŞIMAZ\s*:/im.test(refMetin);
      if (!tasimaz) {
        sari(`REF SÖZLEŞMESİ EKSİK — ${handleSayi} @handle var ama TAŞIMAZ satırı yok`
          + `${tasir ? ' (TAŞIR yazılmış, TAŞIMAZ yazılmamış)' : ''}. `
          + 'Ref neyi SIZDIRMAYACAĞI yazılmazsa kendi kadrajını sahneye ithal eder — '
          + 'ölçüldü: ayak kadrajda 7/7 kötü kare, 0/4 iyi kare. §4a.1');
      }
    }
  }

  const { bicim: voBicim, cumleler } = voBicimi(p.vo);
  const nVO = Object.keys(cumleler).length;

  // Kareler: İÇERİĞİNDEN tanınan HER prompt kaynağı sayılır — adı ne olursa olsun.
  // (Adına bakan önceki sürüm Kütle ve Ağırlık'ta 27 kareyi "yok" sandı; kalan kareler
  // `_CODEX-KALAN-START-FRAMELER.txt` adlı dosyadaydı.)
  const promptDosyalar = p.promptKaynaklari.length
    ? p.promptKaynaklari
    : (p.promptBirlesik.length ? p.promptBirlesik : p.promptBlok);
  const kareNo = new Set();
  let promptMetniVar = false;
  // Lehçe etiketi BASKIN olanı gösterir, ilk rastlananı değil — çok dosyalı projede ilk
  // dosyanın lehçesi setin tamamını temsil etmiyor ve rapor yanıltıcı oluyordu.
  const lehceSayac = new Map();
  for (const f of promptDosyalar) {
    const t = readFileSync(f, 'utf8');
    if (PROMPT_ICERIK.test(t)) promptMetniVar = true;
    const r = kareleriSay(t);
    if (r.lehce) {
      lehceSayac.set(r.lehce, (lehceSayac.get(r.lehce) ?? 0) + r.nolar.length);
      r.nolar.forEach((n) => kareNo.add(n));
    }
  }
  const lehce = [...lehceSayac.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const nKare = kareNo.size;

  // ── K1: ölçemediğini SÖYLE ────────────────────────────────────────────────
  if (!p.vo) sari('SESLENDIRME dosyası yok — kare/VO eşliği ölçülemedi');
  else if (p.voTurevMi) sari(`kanonik _SESLENDIRME.txt yok, türev dosya ölçüldü: ${basename(p.vo)}`);
  if (voBicim === 'tek-blok') {
    sari('VO numarasız TEK BLOK (ElevenLabs v3 biçimi) — cümle numarası yok, kare↔VO eşliği ÖLÇÜLEMEDİ');
  } else if (voBicim === 'bos') {
    sari('SESLENDIRME dosyası var ama içinde ölçülebilir metin yok');
  }
  if (p.promptTurev?.length) sari(`ölçüme GİRMEYEN prompt türevi: ${p.promptTurev.join(' · ')}`);
  if (!promptDosyalar.length) {
    sari('PROMPTLAR dosyası yok — bu proje henüz prompt aşamasına gelmemiş olabilir');
  } else if (!nKare) {
    kirmizi(
      promptMetniVar
        ? `BİÇİM TANINMADI — dosyada prompt metni VAR (STYLE:/NEGATIVE:) ama hiçbir kare başlığı okunamadı. ` +
          `Tanınan lehçeler: ${LEHCELER.map((l) => l.ad).join(' · ')}`
        : 'PROMPTLAR dosyası okundu ama ne kare başlığı ne prompt metni var — dosya boş ya da başka bir şey',
    );
  }

  // ── VO KAPSAMI — sayı eşitliği DEĞİL, örtme ───────────────────────────────
  //
  // İlk sürüm "kare sayısı ≠ VO sayısı → KIRMIZI" diyordu ve YANLIŞTI. Ölçüldü
  // (Kuvvetlerin Güç Birliği): başlıklar `K24 [WORLD/eller] | VO 32: "…"` biçiminde —
  // **bir kare birden çok VO cümlesi taşıyabiliyor.** 52 kare / 69 VO orada kusur değil,
  // tasarım. Sayıya bakan bir kural o projeyi haksız yere kırmızıya boğardı; ve haksız
  // kırmızı, ölçmemekten beter (prompt-lint dersi: 19 yanlış alarm → insan bakmayı bıraktı).
  //
  // Gerçek sözleşme: HER VO CÜMLESİ bir kare tarafından örtülmeli. Üç kanıt yolu, sırayla:
  //   1. başlık VO NUMARASI beyan ediyorsa (`VO 32`) → örtülen küme oradan okunur
  //   2. başlık VO METNİNİ tırnak içinde taşıyorsa → metin eşleştirilir
  //   3. hiçbiri yoksa → K numarası = VO numarası varsayılır, ama hüküm SARI'dır (kanıt yok)
  if (nVO && nKare) {
    // İKİ KANIT DA TOPLANIR VE BİRLEŞTİRİLİR — birini seçip ötekini atmak yanlış alarm üretti:
    //   · Hücre'de düzyazıda geçen üç "VO 39" andıcı numara beyanı sanıldı, metin eşleştirmesi
    //     devre dışı kaldı ve 53 karelik sağlam bir set "50 cümle örtülmemiş" diye kırmızıya döndü.
    //   · Kuvvetlerin Güç Birliği'nde `VO 32-34` gibi ARALIK yazımı tek numara sanıldı.
    // Kanıtın azı yanlış hüküm verir; ikisini de topla, birleşimi kullan.
    // VO BEYANI ÜÇ YAZIMDA GELİYOR ve üçü de okunmalı:
    //   `VO 32`    tek cümle
    //   `VO 32-34` aralık  (tire / en-dash)
    //   `VO 5+6`   birleşim (+ / & / virgül) — Kuvvetlerin Güç Birliği'nde 16 başlık böyle
    // Terra 5.6 bunu KRİTİK olarak bildirdi ve haklıydı: `+` okunmadığı için o projede
    // "17/69 cümlenin karesi yok" denmişti ve bu Mami'ye YANLIŞ BULGU olarak gitti.
    // Açık 17, tam olarak `+` çiftlerinin ikinci üyeleriydi. Kayıp yoktu.
    const beyanVO = new Set();
    for (const f of promptDosyalar) {
      const t = readFileSync(f, 'utf8');
      for (const m of t.matchAll(/\bVO\s*(\d{1,3})((?:\s*[-–—+&,]\s*\d{1,3})*)/g)) {
        const bas = Number(m[1]);
        beyanVO.add(bas);
        for (const p2 of (m[2] ?? '').matchAll(/([-–—+&,])\s*(\d{1,3})/g)) {
          const n = Number(p2[2]);
          // Aralık yalnız TİRE ile açılır; `+`/`&`/`,` yalnız o tek numarayı ekler.
          // Ayrıca aralık genişliği 8'le sınırlı: Terra'nın gösterdiği sömürü yolu tek kareye
          // `VO 1-19` yazıp bütün VO'yu örtülmüş göstermekti. Geniş aralık artık ÖRTMEZ, UYARIR.
          if (p2[1].match(/[-–—]/) && n > bas && n - bas <= 8) { for (let i = bas; i <= n; i++) beyanVO.add(i); }
          else beyanVO.add(n);
        }
      }
    }
    const sadeles = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const metinVO = new Set();
    const tersIndeks = new Map();
    for (const [no, c] of Object.entries(cumleler)) tersIndeks.set(sadeles(c), Number(no));
    for (const f of promptDosyalar) {
      // 2026-08-05 · `{20,}` eşiği KALDIRILDI (Codex/Terra karşı-denetimi). Kısa ama geçerli
      // VO cümleleri sessizce elenip "VO ÖRTÜLMEMİŞ" sahte kırmızısı üretiyordu: Hayvanlarda
      // Üreme K41 → "Buna kuluçka denir." = 19 karakter, karesi VARDI ama denetçi göremedi.
      // Eşleşme zaten kanonik VO cümlesine tam normalize edilerek yapılıyor (`tersIndeks`),
      // yani uzunluk süzgeci koruma değil, kör nokta üretiyordu.
      for (const m of readFileSync(f, 'utf8').matchAll(/"([^"\n]+)"/g)) {
        const no = tersIndeks.get(sadeles(m[1]));
        if (no) metinVO.add(no);
      }
    }

    const ortulen = new Set([...beyanVO, ...metinVO]);
    const kanitlar = [];
    if (beyanVO.size) kanitlar.push(`VO numarası ${beyanVO.size}`);
    if (metinVO.size) kanitlar.push(`VO metni ${metinVO.size}`);

    if (ortulen.size) {
      const acik = [];
      for (let i = 1; i <= nVO; i++) if (!ortulen.has(i)) acik.push(i);
      if (acik.length) {
        kirmizi(`VO ÖRTÜLMEMİŞ — ${acik.length}/${nVO} cümlenin karesi yok: ${ozetAralik(acik)}  (kanıt: ${kanitlar.join(' + ')}, ${nKare} kare)`);
      }
      // ÖRTME SÖMÜRÜSÜ KAPISI (Terra 5.6): tek kareye "VO 1-19 · VO 20-38" yazarak bütün
      // VO'yu örtülmüş göstermek mümkündü. Kare başına ortalama 3'ten çok VO düşüyorsa bu
      // bir teslim değil bir iddiadır — kırmızı vermeyiz (meşru olabilir) ama SÖYLERİZ.
      if (nKare && ortulen.size / nKare > 3) {
        sari(`kare başına ${(ortulen.size / nKare).toFixed(1)} VO örtülüyor — örtme iddiası kareyle orantısız, gözle bak`);
      }
    } else if (nKare !== nVO) {
      sari(`kare ${nKare} / VO ${nVO} — başlıklar VO numarası ya da metni taşımadığı için ÖRTME kanıtlanamadı, yalnız sayı karşılaştırıldı`);
    }
  }

  // Numara sürekliliği: 1..max arasında delik varsa numaralar kaymış olabilir.
  if (nKare) {
    const enBuyuk = Math.max(...kareNo);
    const delik = [];
    for (let i = 1; i <= enBuyuk; i++) if (!kareNo.has(i)) delik.push(i);
    if (delik.length && !(nVO && nKare !== nVO)) {
      sari(`kare numaralarında delik: ${ozetAralik(delik)} (1..${enBuyuk} bekleniyordu)`);
    }
  }

  // ── Görsel ↔ kare ──────────────────────────────────────────────────────────
  if (p.resimler) {
    const hedef = nVO || nKare;
    const eksik = [];
    for (let i = 1; i <= hedef; i++) if (!p.resimler.includes(i)) eksik.push(i);
    if (eksik.length) sari(`görsel yok: ${ozetAralik(eksik)} (${p.resimler.length}/${hedef})`);
  }

  // ── EDIT-PLAN ↔ VO birebir mi ─────────────────────────────────────────────
  let epSatir = 0;
  if (p.editPlan) {
    const epRows = {};
    for (const l of readFileSync(p.editPlan, 'utf8').split(/\r?\n/)) {
      // 2026-08-05 · `🔴 …` meta eki de kesiliyor (Codex/Terra). EDIT-PLAN'da 15 satır
      // `🔴 UZUN ÜRET` soneki taşıyor; eski desen yalnız ◄ ekini atıyordu ve o 15 satır
      // "EDIT-PLAN ↔ SESLENDIRME ayrışıyor" sahte kırmızısını üretiyordu. Aynı temizlik
      // `kaba-kurgu.mjs`'te de yapıldı — orada gerçek bir kurgu kusuruydu (Whisper eşleme).
      const m = /^\s*(\d+)\.(?:png|jpe?g)\s+K(\d+)\s+\S+\s+\S+\s+\[[^\]]+\]\s+(.+?)(?:\s{2,}(?:◄|🔴).*)?$/u.exec(l);
      if (m) epRows[Number(m[2])] = m[3].trim();
    }
    epSatir = Object.keys(epRows).length;
    let fark = 0;
    for (const n of Object.keys(cumleler).map(Number)) {
      if (epRows[n] && epRows[n] !== cumleler[n]) fark++;
    }
    if (fark) kirmizi(`EDIT-PLAN ↔ SESLENDIRME ${fark} satırda ayrışıyor — kesim yanlış cümleye oturur`);
    if (nVO && epSatir && epSatir !== nVO) sari(`EDIT-PLAN ${epSatir} satır / VO ${nVO} cümle`);
  }

  // ── MOTION ↔ VO ───────────────────────────────────────────────────────────
  const motionDosyalar = p.motionBlok.length ? p.motionBlok : p.motionBirlesik;
  let motionSayi = 0;
  if (motionDosyalar.length) {
    let fark = 0;
    for (const f of motionDosyalar) {
      const t = readFileSync(f, 'utf8');
      // 2026-08-05 · İKİ KEZ DEĞİŞTİ, İKİNCİSİ ONARIM.
      // (1) Eski hâli metnin HERHANGİ bir yerindeki `VO "..."` geçişini blok sanıyordu ve
      //     yeniden-basım açıklama satırlarını sayıp sahte kırmızı üretiyordu.
      // (2) 🔴 Onu düzeltmek için konan desen HEM başlığı HEM VO'yu AYNI SATIRDA arıyordu ve
      //     meşru iki-satırlı lehçeyi tümden kaçırdı. Sol/xhigh gerçek diski taradı:
      //     643 gerçek motion vardı, denetçi 521 raporluyordu — **122 motion sessizce kayıp.**
      //     (Bitkiler 53→4 · Değerler 34→1 · Bileşke 52→36 · Kuvvet 48→32 · Sabit Sürat 44→36)
      //     Üstelik `Math.max(1, 0)` sıfırı 1 diye raporlayıp kaybı gizliyordu.
      // Onarım: blok = BAŞLIK satırıdır (`K<n>` + ayraç); VO o satırda ya da sonraki iki
      // satırda aranır. Beş lehçe de tanınır: `### K1 | .. | VO ".."` · `# K1 — ".."` ·
      // iki satırlı `K1 | ..` + `VO1 ".."` · `VO5+6 ".."` · `VO2a ".."`.
      const satirlar = t.split('\n');
      const bloklar = [];
      for (let i = 0; i < satirlar.length; i++) {
        if (!/^#{0,6}\s*K\d+\s*(?:\||—|–|-\s)/.test(satirlar[i])) continue;
        const pencere = satirlar.slice(i, i + 3).join('\n');
        const vo = pencere.match(/VO\s*[\d+ab/]*\s*"([^"]+)"/);
        bloklar.push(vo ? vo[1].trim() : '');
      }
      // ⚠ Math.max KALDIRILDI: sıfır blok bir gerçektir, 1 diye raporlanamaz.
      motionSayi += bloklar.length;
      if (!bloklar.length) sari(`motion dosyası SIFIR blok verdi: ${basename(f)} — biçim tanınmadı`);
      const no = Number(basename(f).replace(/\D+/g, '')) || null;
      if (no && cumleler[no] && bloklar.length === 1 && bloklar[0] !== cumleler[no]) fark++;
    }
    if (fark) kirmizi(`MOTION ↔ SESLENDIRME ${fark} klipte ayrışıyor`);

    // MOTION > KARE → yasa ihlali. `faz-icraat.md`: "Görmediğin kareye motion yazma."
    // Bir klibin motion'ı varsa start-frame prompt'u da olmalı. Ölçüldü (Kütle ve Ağırlık,
    // BİTEN proje): 35 motion dosyası, PROMPTLAR'da 8 kare — prompt setinin 27'si teslim
    // dosyasında yok. Hiçbir doğrulayıcı bunu söylememişti.
    if (nKare && motionSayi > nKare) {
      kirmizi(`MOTION KARESİZ — ${motionSayi} motion / ${nKare} kare prompt'u. Yasa: görmediğin kareye motion yazılmaz.`);
    }
  }

  return {
    proje: proje.replace(`${ROOT}/`, ''),
    ad: basename(proje),
    nVO, nKare, lehce, epSatir,
    motionSayi,
    resim: p.resimler ? p.resimler.length : null,
    parcalar: {
      REFERANSLAR: !!p.referanslar, PROMPTLAR: !!promptDosyalar.length, EDIT_PLAN: !!p.editPlan,
      MOTION: !!motionDosyalar.length, SESLENDIRME: !!p.vo, SUNO: !!p.suno, KABA_KURGU: !!p.kabaKurgu,
    },
    bulgu,
    kirmiziSayi: bulgu.filter((b) => b.renk === 'KIRMIZI').length,
  };
}

// `1 2 3 7 8` → `1-3 7-8`. Uzun listeler okunmaz hâle geliyordu.
export function ozetAralik(nolar) {
  if (!nolar.length) return '';
  const parcalar = [];
  let bas = nolar[0], onceki = nolar[0];
  for (const n of nolar.slice(1)) {
    if (n === onceki + 1) { onceki = n; continue; }
    parcalar.push(bas === onceki ? `K${bas}` : `K${bas}-K${onceki}`);
    bas = onceki = n;
  }
  parcalar.push(bas === onceki ? `K${bas}` : `K${bas}-K${onceki}`);
  return parcalar.join(' ');
}

// ── PROJE KEŞFİ ──────────────────────────────────────────────────────────────
export function projeleriBul(inbox = INBOX) {
  const cikti = [];
  for (const ad of listele(inbox)) {
    const p = join(inbox, ad);
    if (!dizinMi(p)) continue;
    if (KAP.has(ad)) {
      for (const alt of listele(p)) if (dizinMi(join(p, alt))) cikti.push(join(p, alt));
      continue;
    }
    cikti.push(p);
  }
  return cikti.sort();
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const calistirilan = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (calistirilan) {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const hepsi = argv.includes('--all');
  const raporIdx = argv.indexOf('--rapor');
  const raporYolu = raporIdx >= 0 ? argv[raporIdx + 1] : null;
  const hedefler = argv.filter((a, i) => !a.startsWith('--') && i !== raporIdx + 1);

  let projeler;
  if (hepsi) projeler = projeleriBul();
  else if (hedefler.length) projeler = hedefler.map((h) => resolve(h));
  else {
    process.stdout.write('kullanım: node scripts/teslim-denetim.mjs (--all | <proje yolu…>) [--strict] [--rapor <yol>]\n');
    process.exit(2);
  }

  const satirlar = [];
  const yaz = (s) => { satirlar.push(s); process.stdout.write(`${s}\n`); };

  let toplamKirmizi = 0;
  const sonuclar = [];
  for (const proje of projeler) {
    if (!dizinMi(proje)) { yaz(`🔴 proje dizini yok: ${proje}`); toplamKirmizi++; continue; }
    const r = projeyiOlc(proje);
    sonuclar.push(r);
    toplamKirmizi += r.kirmiziSayi;
  }

  yaz(`[teslim] ${sonuclar.length} proje ölçüldü · KIRMIZI ${toplamKirmizi}`);
  yaz('');
  yaz('  proje                                              VO  kare  motion  görsel  lehçe');
  for (const r of sonuclar) {
    const ad = r.ad.length > 48 ? `${r.ad.slice(0, 45)}…` : r.ad.padEnd(48);
    yaz(`  ${ad} ${String(r.nVO).padStart(3)} ${String(r.nKare).padStart(5)} ${String(r.motionSayi).padStart(7)} ${String(r.resim ?? '—').padStart(7)}  ${r.lehce ?? '—'}`);
  }

  for (const r of sonuclar) {
    if (!r.bulgu.length) continue;
    yaz(`\n  ── ${r.ad} ──`);
    for (const b of r.bulgu) yaz(`  ${b.renk === 'KIRMIZI' ? '🔴' : '🟡'} ${b.s}`);
    const eksikParca = Object.entries(r.parcalar).filter(([, v]) => !v).map(([k]) => k);
    if (eksikParca.length) yaz(`  ·  eksik teslim parçası: ${eksikParca.join(' · ')}`);
  }

  yaz('');
  yaz('  KAPSAM — bu ölçümün GÖRMEDİĞİ şeyler (yeşil ≠ temiz):');
  yaz('    · prompt KALİTESİ ölçülmez — o prompt-lint.mjs\'in işi, bu script yalnız BİÇİM ve SAYIM bakar.');
  yaz('    · görselin İÇERİĞİ o kareye ait mi ölçülmez; yalnız N.png dosyasının VAR olduğu ölçülür.');
  yaz('    · VO metni ile karenin ANLAMCA eşliği ölçülmez (yasa §2ø — insan hükmü).');
  yaz('    · DENEME/ ve Bekleyen/ altındaki yarım işler de sayılır; eksik olmaları normaldir.');

  if (raporYolu) {
    writeFileSync(resolve(raporYolu), `# TESLİM DENETİMİ (makine ölçümü)\n\n\`\`\`\n${satirlar.join('\n')}\n\`\`\`\n`);
    process.stdout.write(`\n[teslim] rapor yazıldı: ${raporYolu}\n`);
  }

  process.exit(strict && toplamKirmizi ? 1 : 0);
}
