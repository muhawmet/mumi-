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

export function tesliminParcalari(proje) {
  const promptDizin = altDizin(proje, ['PROMPTLAR']);
  const motionDizin = altDizin(proje, ['MOTION']);
  const resimDizin = altDizin(proje, ['resimler', 'Resimler']);
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
    promptBlok: promptDizin ? bul(promptDizin, /\.(txt|md)$/i) : [],
    motionBirlesik: (() => { const k = kanonikSec(bul(proje, /_MOTION.*\.(txt|md)$/i), 'MOTION'); return k ? [k] : []; })(),
    motionBlok: motionDizin ? bul(motionDizin, /\.(txt|md)$/i) : [],
    resimler: resimDizin
      ? listele(resimDizin).filter((f) => /^\d+\.(png|jpe?g)$/i.test(f)).map((f) => parseInt(f, 10)).sort((a, b) => a - b)
      : null,
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

  const { bicim: voBicim, cumleler } = voBicimi(p.vo);
  const nVO = Object.keys(cumleler).length;

  // Kareler: birleşik dosya varsa o, yoksa blok dosyalarının birleşimi.
  const promptDosyalar = p.promptBirlesik.length ? p.promptBirlesik : p.promptBlok;
  let lehce = null;
  const kareNo = new Set();
  let promptMetniVar = false;
  for (const f of promptDosyalar) {
    const t = readFileSync(f, 'utf8');
    if (/^STYLE:|^NEGATIVE:|FRAME NEGATIVE/m.test(t)) promptMetniVar = true;
    const r = kareleriSay(t);
    if (r.lehce) { lehce ??= r.lehce; r.nolar.forEach((n) => kareNo.add(n)); }
  }
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
    const beyanVO = new Set();
    for (const f of promptDosyalar) {
      const t = readFileSync(f, 'utf8');
      for (const m of t.matchAll(/\bVO\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?/g)) {
        const bas = Number(m[1]);
        const son = m[2] ? Number(m[2]) : bas;
        if (son >= bas && son - bas < 20) for (let i = bas; i <= son; i++) beyanVO.add(i);
        else beyanVO.add(bas);
      }
    }
    const sadeles = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const metinVO = new Set();
    const tersIndeks = new Map();
    for (const [no, c] of Object.entries(cumleler)) tersIndeks.set(sadeles(c), Number(no));
    for (const f of promptDosyalar) {
      for (const m of readFileSync(f, 'utf8').matchAll(/"([^"\n]{20,})"/g)) {
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
      const m = /^\s*(\d+)\.(?:png|jpe?g)\s+K(\d+)\s+\S+\s+\S+\s+\[[^\]]+\]\s+(.+?)(?:\s{3,}◄.*)?$/.exec(l);
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
      const bloklar = [...t.matchAll(/VO\s*\d*\s*"([^"]+)"/g)].map((m) => m[1].trim());
      motionSayi += Math.max(1, bloklar.length);
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
