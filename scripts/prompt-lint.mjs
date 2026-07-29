#!/usr/bin/env node
// MAMILAS PROMPT LİNTERİ — yasayı belgeden DUVARA çevirir.
//
// Neden var (2026-07-27 ölçümü): kazanan biçim yazılı olmadığı sürece çürüyor.
// Sabit Sürat'ta 44/44 karede duran temas cümlesi, bir sonraki videonun ilk 8 karesinde
// 2/8'e düştü. Yasa `agents/PROMPT-YASASI.md`'ye yazıldı — ama okunmayan yasa da bir ricadır.
// Bu script ricayı ölçüme çevirir: kare kare, hangi slot eksik.
//
//   node scripts/prompt-lint.mjs <dosya._PROMPTLAR.txt>     # tek dosya
//   node scripts/prompt-lint.mjs --all                      # COMMAND-INBOX'taki hepsi
//   node scripts/prompt-lint.mjs <dosya> --strict           # eksik varsa exit 1 (hook/kapı için)
//
// ---------------------------------------------------------------------------
// 2026-07-29 YENİDEN YAZIM — sebebi ölçüldü, tahmin değil.
//
// Eski linter KALIBI arıyordu, İŞLEVİ değil. Üç bağımsız ajan aynı kusuru buldu:
//   · `canlı üçlü` regexi yalnız "three things are alive" arıyordu — Sürtünme ve Bileşke
//     52+31 karede "Three physics beats:" yazmıştı. **83 sahte alarm.**
//   · `sheen` tuzağı bağlam körüydü — ahşapta/taşta/buzda MEŞRU, tende ölümcül.
//     Sürtünme'de 31 alarmın 29'u, Sabit Sürat'ta 5'in 5'i sahte. "sheen-free" bile hit veriyordu.
//   · Referans-edit blokları (§1 madde 19, "change ONLY") slot taşımaz — linter her birine
//     8 alarm birden basıyordu.
//   · `_PROMPTLAR.md` adı taşıyan bir MOTION dosyası start-frame gibi lintlendi: 58 karede
//     style 0/58, text 0/58. Kusur dosyada değil, dosyanın yanlış dosya olmasındaydı.
// Sahte alarm ölçümün kendisini çöpe atar: Mami kırmızıya bakmayı bırakır ve gerçek kusur
// gürültüye gömülür (`mamilas-lint-rol-koru`: Üreme'de 7 tuzak hitinin 7'si sahte).
//
// Buna karşılık eski linter, revizeyi en iyi öngören iki şeyi HİÇ ölçmüyordu:
//   · **kare-özel oran** — Bileşke 52/52 karede birebir aynı 196-269 kelimelik STYLE bloğunu
//     taşıyor, kare-özel oran ~%35 → %65 revize. Sürtünme %51 → çok daha az. Tek sayı, en güçlü sinyal.
//   · **negatifin kare-özelliği** — Bileşke'nin 52 karesinin 52'sinde NEGATIVE VAR, ama
//     kare-özel yalnız 2/52. Satırın varlığı ölçülüyordu, işi ölçülmüyordu.
//
// YENİ SÖZLEŞME — üç kat, ve linter ne ölçemediğini SÖYLER:
//   KIRMIZI  kanıtlı eksik — slot ailesinin hiçbir üyesi yok, ya da sayılabilir bir kural kırık.
//   SARI     linter karar veremiyor — ajanın tek geçişinde bakılacak. Kusur İDDİASI DEĞİL.
//   KAPSAM   ölçülmeyenlerin açık listesi. "Yeşil" demek "temiz" demek değildir; bu satır olmadan
//            yeşil bir yalandır ("kapı kuruldu ≠ kapı ateşliyor" — dört taramada tekrar eden kök kusur).
//
// Kanıtla sınanır: Sürtünme'de `canlı üçlü` ve `sheen` SUSMALI (ikisi de sahteydi), ama
// `temas` 26/31 ve `derinlik` 30/31 KIRMIZI kalmalı (ikisi de gerçekti). Bileşke'de
// kare-özel oran ~%35 raporlanmalı. Bunlardan biri tutmuyorsa linter yanlıştır, prompt değil.
// ---------------------------------------------------------------------------

// `lintFile` / `SLOTS` dışa açıktır: kapanış hasadı (scripts/kapanis-hasadi.mjs) aynı ölçümü
// kullanır. Yasa iki yerde ölçülmez — ikinci kopya bu fazda söktüğümüz hastalığın kendisi.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// ---------------------------------------------------------------------------
// SLOT TANIMLARI — kaynağı agents/PROMPT-YASASI.md §2. Her kontrol bir YETENEĞİ ölçer,
// kelime avlamaz: aranan şey ifadenin kendisi değil, o slotun karede yapılmış olması.
// Bu yüzden her `test` bir İFADE AİLESİDİR — korpusta kanıtlanmış eşdeğerler kabul edilir.
// ---------------------------------------------------------------------------
const SLOTS = [
  {
    key: 'lens',
    label: 'lens/kamera (sayısal, başta)',
    test: (b) => /\b\d{2,3}\s*mm\b/i.test(b),
    why: 'NB2 sayısal lensi okur; "cinematic lens" okumaz.',
  },
  {
    key: 'handle',
    label: '@handle (karakter/hero-prop)',
    test: (b) => /@[a-zçğıöşü][a-z0-9çğıöşü_-]*/i.test(b),
    why: 'Kimlik tag ile taşınır; tarif edilmez. Tag\'siz tekrar eden prop her karede başka çıkar.',
    // Eski hali `soft:true` + `needsIf` yoktu → prompt-lint.mjs:167 yüzünden ASLA ateşlemiyordu:
    // ölü slot, karneye giriyor ama hiçbir şey ölçmüyordu. Artık SARI: insan/nesne geçen karede
    // tag yoksa ajan baksın. Kesin hüküm veremeyiz — kavram karesinde tag gerekmeyebilir.
    warnOnly: true,
    needsIf: (b) => /\b(child|children|boy|girl|teacher|woman|man|student|kid)\b/i.test(b),
  },
  {
    key: 'ten',
    label: 'ten kilidi — NEGATİF yarısı (mat, yeşil/gri değil)',
    // "subsurface-style honey-warm skin" POZİTİF yarıdır ve tek başına yetmiyor: Sürtünme
    // 31/31 karede pozitifi yazmış, negatifi hiç yazmamış, ve S3/S18'de tam tersini
    // ("satin sheen along his cheek's skin") yazmış. Bileşke'de `warm matte tan` 0/52 →
    // revizede "Mira's skin is GREEN" iki kez. Aranan negatif kilidin kendisidir.
    test: (b) => /(matte\s+\w*\s*(tan\s+)?skin|warm matte tan|never tinted (green|grey|gray)|low specular|no green (or grey )?(cast|tint))/i.test(b),
    why: 'Yokluğunda yeşil/gri cilt çıkıyor (Bileşke K14, K39 — revizede birebir yazılı).',
    registers: ['EDU', 'STY'],
    needsIf: (b) => hasHuman(b),
  },
  {
    key: 'ten-real',
    label: 'REAL ten/yüzey gerçeği (gözenek, mikro-doku)',
    test: (b) => /(micro-?texture|pore|microtexture|real pore|skin micro)/i.test(b),
    why: 'REAL negatifi "NO plastic AI-smooth skin" der; pozitifi yazılmazsa motor plastik cilt basıyor.',
    registers: ['REAL'],
    needsIf: (b) => hasHuman(b) || /\b(professional|product)\b/i.test(b),
  },
  {
    key: 'fstop',
    label: 'sayısal diyafram (f/x)',
    test: (b) => /\bf\/\d/i.test(b),
    why: 'REAL dünyaların render yasası diyaframı sayıyla yazar (f/4-f/8 ürün, f/2.8 bağlam, f/8 mimari).',
    registers: ['REAL'],
  },
  {
    key: 'karsi-terim',
    label: 'photoreal karşı-terimleri (negative fill / motivated / grain)',
    test: (b) => /(negative fill|motivated light|film grain|35\s*mm film|black flag|bounce card)/i.test(b),
    why: 'Motorun varsayılanı "parlak ticari plastik"; mined `photoreal` maddesi onu kıran tek şey.',
    registers: ['REAL'],
  },
  {
    key: 'canli',
    label: 'canlı üçlü (karede yaşayan 3 şey)',
    // AİLE — hepsi korpusta kanıtlı ve hepsi aynı işi görüyor:
    //   "Three things are alive in the frame"  (Sabit Sürat 44/44, Kütle 8/8)
    //   "Three physics beats:"                 (Sürtünme 31/31, Bileşke 52/52)
    // Eski regex ikincisini görmüyordu → tek başına 83 sahte alarm.
    test: (b) => /(three things are alive|alive in the frame|three (physics|motion|life|movement) beats)/i.test(b),
    why: 'Motion fazının canlandıracağı hareketi önceden kilitler.',
  },
  {
    key: 'derinlik',
    label: 'üç katman derinlik',
    test: (b) => /(depth in three layers|three layers\s*[—–-]|near plane|foreground[\s\S]{0,90}(bokeh|blur|soft-?focus|out-of-focus))/i.test(b),
    why: 'Kare-özel yazılmazsa void/kopuk kadraj doğuyor (Bileşke K8, K11).',
  },
  {
    key: 'temas',
    label: 'temas / yerçekimi cümlesi',
    // AİLE — kanonik biçim + korpusta işi gören eşdeğerleri:
    //   "rests in contact ... contact shadow"                    (kanonik)
    //   "rests against the hand in real contact, not floating"   (Kuvvet K20)
    //   "rests on the page in contact with a soft weighted shadow — it does not float" (K45)
    //   "a firm short shadow anchors him to the ground"          (Sürtünme S21)
    test: (b) => /(rests? in contact|contact shadow|rests? (on|against)[^.]{0,70}contact|(does not|doesn't) float|not floating|weighted shadow|anchors? (him|her|it|them|the [a-z]+)[^.]{0,50}to the (ground|floor|surface|table|desk))/i.test(b),
    why: 'EN NET KANIT: Bileşke 0/52 → K33/34/35/50 havada yüzdü; revizede "floating in mid-air" tamiri.',
  },
  {
    key: 'style',
    label: 'STYLE kuyruğu',
    test: (b) => /^STYLE:/im.test(b),
    why: 'Dünya kilidi. ≤90 kelime olmalı — uzunluk kare-özel oranı düşürüyor.',
  },
  {
    key: 'text',
    label: 'TEXT slotu (ekran yazısı talimatı)',
    // Satır başı `TEXT:` kanonik, ama Sürtünme "On-screen Turkish text:" ile aynı işi görüyor.
    // Konum değil İŞ ölçülür. Gerçek kusur ayrı slotta: `text-hece`.
    test: (b) => /^TEXT:/im.test(b) || /on-?screen (turkish )?text|clean plate\s*[—–-]\s*no on-?screen text|no on-?screen text/i.test(b),
    why: 'Yokluğunda 11 karede bozuk/İngilizce tabela + "R = 0 N"→"R = ON" (Bileşke 0/52).',
  },
  {
    key: 'text-hece',
    label: 'yazı taşıyan karede HARF HARF heceleme + diakritik',
    // Bu slot eski linterde HİÇ yoktu — oysa revizenin %35'i yazı/rakam sınıfı.
    // Yalnız yazı TAŞIYAN karede sorulur (tırnak içinde büyük harfli Türkçe öbek).
    test: (b) => /\b(letters?|digits?|dotted capital|dotless|diacritic|umlaut|cedilla|breve|one clear space|separate[d]? by a space)\b/i.test(b),
    why: 'Sabit Sürat: heceleme VAR → 13 yazılı karenin 12\'si ilk seferde doğru. '
      + 'Bileşke: heceleme YOK (19/19) → "R = ON", "KOLKALSIRI", "ETKİSİ ETKİSİ".',
    needsIf: (b) => bearsText(b),
  },
  {
    key: 'neg',
    label: 'NEGATIVE slotu',
    test: (b) => /^NEGATIVE:/im.test(b) || /FRAME NEGATIVE/i.test(b),
    why: 'İki temiz setin ortak paydası: Sürtünme 31/31 inline, Sabit Sürat 44/44.',
  },
];

// ---------------------------------------------------------------------------
// TUZAKLAR — artık BAĞLAMLI. Bir kelime tek başına kusur değildir; kusur onun nereye
// yazıldığıdır. Eski linter bunu ayırmadığı için tek başına ~100 sahte alarm üretiyordu.
// ---------------------------------------------------------------------------
const SKIN = /(skin|cheek|face|complexion|forehead|nose|chin|hand)/i;

// `w` kelimesi metinde SKIN'e `win` karakter içinde mi geçiyor?
function nearSkin(body, w, win = 70) {
  const re = new RegExp(`\\b${w}\\b`, 'gi');
  let m;
  while ((m = re.exec(body))) {
    const seg = body.slice(Math.max(0, m.index - win), m.index + w.length + win);
    if (SKIN.test(seg)) return true;
  }
  return false;
}

const TRAPS = [
  {
    key: 'saffron',
    hit: (b) => /\bsaffron\b/i.test(b),
    fix: 'warm golden — NB2 "saffron"u safran ÇİÇEĞİ çiziyor (Bileşke\'de 6 kare lotus/turuncu çiçek)',
  },
  {
    key: 'bloom-cicek',
    // `bloom` fiil olarak ve arkasından kanonik ifade gelirse TEMİZ:
    //   "each step-mark blooms into a soft round warm-golden glow of light" (Sabit Sürat K33 — sıfır kusur)
    // İsim olarak, ya da çiçek/parçacık bağlamında TEHLİKELİ:
    //   "soft golden bloom and a scatter of rising sparkle particles" (Sürtünme S4)
    hit: (b) => {
      const re = /\bblooms?\b/gi; let m;
      while ((m = re.exec(b))) {
        const after = b.slice(m.index, m.index + 90);
        if (/blooms?\s+(into|across|along|over)[^.]{0,60}glow of light/i.test(after)) continue; // kanonik
        const seg = b.slice(Math.max(0, m.index - 90), m.index + 90);
        if (/(saffron|petal|flower|blossom|scatter|particles?|drifting|rising)/i.test(seg)) return true;
        if (/\b(a|the|soft|warm|golden)\s+\w*\s*blooms?\b/i.test(seg)) return true; // isim kullanımı
      }
      return false;
    },
    fix: '"a soft round warm-golden glow of light" — isim olarak "bloom" ve çiçek/parçacık komşuluğu taç yaprağı doğuruyor',
  },
  {
    key: 'sheen-tende',
    // Ahşap/taş/buz/cam/meyve yüzeyinde `sheen` MEŞRU ve gereklidir. Tende ölümcül.
    // "sheen-free" (Kuvvet K11) substring hit veriyordu — \b sınırı + olumsuzlama koruması.
    hit: (b) => /\bsheen-free\b/i.test(b) ? false : nearSkin(b, 'sheen'),
    fix: 'tende sheen = plastik/yağlı surat. Yüzeyde (ahşap, taş, buz, cam, saten) serbest; tende ASLA',
  },
  {
    key: 'void',
    // "negative space" adlandırılmış mekânla birlikte yazılmışsa void doğurmuyor:
    //   "warm negative space (a plain morning-lit kitchen wall)" (Sürtünme S2 — temiz)
    // Tek başına bırakılmışsa doğuruyor: S23.
    hit: (b) => {
      const re = /\bnegative space\b/gi; let m;
      while ((m = re.exec(b))) {
        const after = b.slice(m.index, m.index + 140);
        if (/[(,][^.]{0,120}\b(wall|room|kitchen|classroom|board|shelf|shelves|window|floor|table|desk|背)\b/i.test(after)) continue;
        return true;
      }
      return false;
    },
    fix: 'mekânı ADLANDIR — "negative space" tek başına boş void doğuruyor; parantez içinde duvar/oda yazılırsa temiz',
  },
  {
    key: 'clean-table',
    hit: (b) => /\bclean (table|desk|surface)\b/i.test(b),
    fix: 'giydirilmiş yüzey — "clean table" void doğuruyor',
  },
  {
    key: 'real-stil-sifati',
    hit: (b) => /\b(teal[- ]orange|premium commercial look|deakins lighting|cinematic lens)\b/i.test(b),
    fix: 'fiziksel malzeme gerçeği yaz — stil sıfatı ve imza adı REAL negatif kilidinde yasak',
    registers: ['REAL'],
  },
];

// STYLE bloğu kelime tavanı (yasa §0: 269 kelime → %65 revize; 88 kelime → %14).
const STYLE_MAX_WORDS = 110;
// Kare-özel oran alt sınırı. Bileşke %35 → %65 revize. Sürtünme %51 → çok daha az.
const KARE_OZEL_MIN = 0.45;

// ---------------------------------------------------------------------------
// YARDIMCILAR
// ---------------------------------------------------------------------------

// "No person enters the frame" diyen kare ten kilidi istemez. Kütle CODEX'te 13 kare böyle;
// eski linter on üçüne birden "ten kilidi YOK" basıyordu — on üçü de sahteydi.
const INSANSIZ = /\bno (person|human|people|figure|one)\b[^.]{0,40}\b(enters?|in the frame|visible|present)|without any (person|human)/i;
const hasHuman = (b) =>
  INSANSIZ.test(b) ? false
    : (/@[a-zçğıöşü]/i.test(b) || /\b(child|children|boy|girl|teacher|woman|man|hand|face|student|kid|people)\b/i.test(b));

// STYLE / LIGHT AND PALETTE / TEXT / NEGATIVE kuyruğu her karede AYNIDIR ve meşru olarak
// "skin", "sheen", "negative space" gibi kelimeler taşır. Tuzaklar bu kuyrukta aranırsa
// ölçülen şey kare değil boilerplate olur — Sürtünme'de 31 sahte `sheen` alarmının kaynağı buydu.
// Tuzak taraması yalnız KARE-ÖZEL gövdede yapılır.
const TAIL_RE = /^(STYLE|LIGHT AND PALETTE|TEXT|NEGATIVE)\s*:/im;
function frameBody(b) {
  const lines = b.split(/\r?\n/);
  const i = lines.findIndex((l) => TAIL_RE.test(l));
  return i === -1 ? b : lines.slice(0, i).join('\n');
}

// `\Z` JavaScript'te yok (Perl/Python kalıntısı) — düz "Z" harfi olarak eşleşiyordu, bu yüzden
// kuyruksuz dosyalarda STYLE bloğu HİÇ çıkarılamıyor ve kelime tavanı sessizce ölçülmüyordu.
// Satır tabanlı çıkarım: `STYLE:` satırından, bir sonraki BÜYÜK HARFLİ etiket satırına kadar.
function styleBlock(b) {
  const lines = b.split(/\r?\n/);
  const i = lines.findIndex((l) => /^STYLE\s*:/i.test(l.trim()));
  if (i === -1) return null;
  const out = [lines[i].replace(/^\s*STYLE\s*:/i, '')];
  for (let j = i + 1; j < lines.length; j++) {
    if (/^[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ ]{2,}\s*:/.test(lines[j].trim())) break;
    out.push(lines[j]);
  }
  return out.join(' ').trim();
}

// Kare ekranda yazı taşıyor mu? Tırnak içinde 2+ karakterlik BÜYÜK harfli öbek (Türkçe dahil)
// ya da açık "on-screen text: <...>" talimatı. "no on-screen text" / "clean plate" taşımaz.
function bearsText(b) {
  if (/(clean plate|no on-?screen text|no visible text|no caption)/i.test(b) && !/"[^"]{2,}"/.test(b)) return false;
  return /"[A-ZÇĞİÖŞÜ0-9][A-ZÇĞİÖŞÜ0-9 =.,:+\/-]{1,}"/.test(b);
}

// Bir kural bu register'da geçerli mi? `registers` yoksa üçünde de geçerlidir.
const appliesTo = (rule, register) => !rule.registers || rule.registers.includes(register);

// ---------------------------------------------------------------------------
// BLOK TİPİ — her blok start-frame değildir. Yanlış tipe slot sormak sahte alarmdır.
// ---------------------------------------------------------------------------

// Referans-edit bloğu (§1 madde 19): "Use this referenced image, change ONLY: <fix>".
// Slot taşımaz, taşımamalıdır. Eski linter her birine 8 alarm birden basıyordu (Kuvvet K31/K38).
const REF_EDIT_RE = /(SIFIRDAN ÜRETİLMEYECEK|change ONLY|use this referenced image|referans[- ]edit|referansı ver|keep everything else identical)/i;

// Motion bloğu: kamera hareketi fiilleri + "everything else stays" ailesi, STYLE yok.
const MOTION_RE = /\b(dolly|push in|pull back|pan (left|right)|tilt (up|down)|orbit|handheld drift|settle into|hold on|slow zoom)\b/i;
const MOTION_STAY_RE = /(everything else stays|only the [a-z ]+ changes|no re-render|identity change|do not alter)/i;

function blockKind(body) {
  if (REF_EDIT_RE.test(body)) return 'ref-edit';
  const hasStyle = /^STYLE:/im.test(body);
  if (!hasStyle && MOTION_RE.test(body) && MOTION_STAY_RE.test(body)) return 'motion';
  return 'frame';
}

// ---------------------------------------------------------------------------
// PARSER
// ---------------------------------------------------------------------------
// Teslim biçimi projeden projeye değişiyor (ölçüldü 2026-07-27: `### K01 | VO1 …` ·
// `K01 [MİRA] | VO 1: …` · `Sahne 14` · `Kare 8 —`) ve ayraç bazen başlığı sarıyor, bazen
// gövdeyi. Bu yüzden ayraca değil KARE BAŞLIĞINA çıpalanır: iki başlık arası gövdedir.
// `(?!\()` — dosya sonundaki kesim notu (`K36(S40+41) K38(S43+44)…`) kare başlığı sanılıyordu.
const HEAD_RE = /^(?:#{1,6}\s*)?(?:K|KARE|Kare|SAHNE|Sahne|SHOT|Shot)\s*[-–—]?\s*\d{1,3}(?!\()\b/;
const NOISE_RE = /^(?:[-=_]{4,}|#{4,}.*)\s*$/;

function parseBlocks(text) {
  const lines = text.split(/\r?\n/);
  const heads = [];
  lines.forEach((l, i) => { if (HEAD_RE.test(l.trim())) heads.push(i); });
  const out = [];
  for (let h = 0; h < heads.length; h++) {
    const start = heads[h];
    const end = h + 1 < heads.length ? heads[h + 1] : lines.length;
    const body = lines.slice(start + 1, end).filter((l) => !NOISE_RE.test(l.trim())).join('\n');
    out.push({ head: lines[start].trim().replace(/^#+\s*/, '').slice(0, 90), body });
  }
  return out;
}

// ---------------------------------------------------------------------------
// KORPUS ÖLÇÜMÜ — tek kareye bakarak görülemeyen iki şey. Eski linterde HİÇ yoktu,
// oysa revizeyi en iyi öngören sinyal bunlar.
// ---------------------------------------------------------------------------
function corpusMetrics(blocks) {
  const frames = blocks.filter((b) => b.kind === 'frame');
  if (frames.length < 2) return null;

  // 1) KARE-ÖZEL ORAN — blokların ≥%80'inde birebir tekrar eden cümleler boilerplate'tir.
  //    Kare-özel oran = boilerplate olmayan karakter / toplam karakter.
  const sentCount = new Map();
  const split = (t) => t.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => s.length > 25);
  for (const f of frames) {
    for (const s of new Set(split(f.body))) sentCount.set(s, (sentCount.get(s) ?? 0) + 1);
  }
  const boiler = new Set([...sentCount].filter(([, n]) => n >= frames.length * 0.8).map(([s]) => s));
  let own = 0, all = 0;
  for (const f of frames) {
    for (const s of split(f.body)) { all += s.length; if (!boiler.has(s)) own += s.length; }
  }
  const kareOzelOran = all ? own / all : 1;

  // 2) NEGATİFİN KARE-ÖZELLİĞİ — Bileşke'nin 52/52 karesinde NEGATIVE VARDI, ama
  //    kare-özel yalnız 2/52. Satırın varlığı değil, farklı olması ölçülür.
  const negs = frames.map((f) => {
    const m = f.body.match(/(?:^NEGATIVE:|FRAME NEGATIVE[:—–-]?)([\s\S]*?)(?=\n[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ ]{2,}:|$)/im);
    return m ? m[1].trim().replace(/\s+/g, ' ') : null;
  });
  const withNeg = negs.filter(Boolean);
  const negOzel = withNeg.length ? new Set(withNeg).size / withNeg.length : 0;

  // 3) STYLE bloğu kaç farklı sürümde? (Kütle: ilk 8 kare 81-91 kelime, kalan 27'si 23-30 →
  //    aynı filmde iki lehçe. Tek dosyada bile bölünme oluyor.)
  const styles = frames.map((f) => styleBlock(f.body) ?? '').filter(Boolean);
  const styleWordCounts = styles.map((s) => s.split(/\s+/).length);
  const styleVariants = new Set(styles.map((s) => s.replace(/\s+/g, ' '))).size;

  return {
    frames: frames.length,
    kareOzelOran,
    negOzel,
    negVar: withNeg.length,
    styleVariants,
    styleMin: styleWordCounts.length ? Math.min(...styleWordCounts) : 0,
    styleMax: styleWordCounts.length ? Math.max(...styleWordCounts) : 0,
  };
}

// ---------------------------------------------------------------------------
// BLOK LİNTİ
// ---------------------------------------------------------------------------
function lintBlock(body, register = 'EDU') {
  const problems = [];
  const kind = blockKind(body);

  // Referans-edit bloğu slot taşımaz — §1 madde 19 bunu EMREDİYOR. Tek kontrolü:
  // "change ONLY" gerçekten TEK şey mi değiştiriyor? (Kuvvet K31/K38 dört şeyi birden
  // değiştiriyordu; NB2'nin tek geçişte dördünü tutması güvenilir değil.)
  if (kind === 'ref-edit') {
    const m = body.match(/change ONLY:?([\s\S]{0,300})/i);
    if (m) {
      const n = (m[1].match(/\band\b|[;+]|,\s*(?=[a-z])/gi) ?? []).length;
      if (n >= 3) {
        problems.push({ kind: 'refedit', key: 'refedit', level: 'sari',
          msg: `referans-edit tek geçişte ~${n + 1} değişiklik istiyor`,
          why: 'NB2 tek geçişte 3+ eşzamanlı değişikliği güvenilir tutmuyor; en olası kayıp etiket/rakam. Böl.' });
      }
    }
    return problems;
  }
  if (kind === 'motion') {
    problems.push({ kind: 'tip', key: 'tip', level: 'sari',
      msg: 'bu blok MOTION promptu, start-frame değil',
      why: 'Start-frame slotları burada aranmaz. Dosya yanlış dosya olabilir (bkz. Kuvvet _PROMPTLAR.md).' });
    return problems;
  }

  for (const s of SLOTS) {
    if (!appliesTo(s, register)) continue;
    if (s.needsIf && !s.needsIf(body)) continue;  // bu karede gerekmiyor
    if (s.test(body)) continue;
    problems.push({
      kind: 'slot', key: s.key, level: s.warnOnly ? 'sari' : 'kirmizi',
      msg: `${s.label} YOK`, why: s.why,
    });
  }

  // Tuzaklar YALNIZ kare-özel gövdede aranır — kuyruk her karede aynıdır ve meşru olarak
  // "sheen"/"skin"/"negative space" taşır. Kuyruğu taramak kareyi değil boilerplate'i ölçmektir.
  const fb = frameBody(body);
  for (const t of TRAPS) {
    if (!appliesTo(t, register)) continue;
    if (t.hit(fb)) problems.push({ kind: 'trap', key: t.key, level: 'kirmizi', msg: `tuzak: ${t.key}`, why: `→ ${t.fix}` });
  }

  const style = styleBlock(body);
  if (style) {
    const w = style.split(/\s+/).filter(Boolean).length;
    if (w > STYLE_MAX_WORDS) {
      problems.push({ kind: 'style', key: 'style-uzun', level: 'kirmizi',
        msg: `STYLE ${w} kelime (tavan ${STYLE_MAX_WORDS})`,
        why: 'Kalıp büyüdükçe kare-özel oran düşüyor; %35 oran → %65 revize (Bileşke, ölçüldü).' });
    }
  }
  return problems;
}

// Linterin ölçemedikleri — "yeşil" bu listeyle birlikte okunur, yoksa yeşil bir yalandır.
const OLCULMEYEN = [
  'yazının motorda doğru RENDER edilip edilmeyeceği (heceleme yazılıysa risk düşer, sıfırlanmaz)',
  'harf sayımının DOĞRULUĞU (Kütle K10: "DEĞİŞMEZ — second letter Ğ" — Ğ üçüncü harf, sayım yanlıştı)',
  'tekrar eden propun tag\'lenip tag\'lenmediği (@elma 0 kez çağrıldı, tartı 2 karede 2 model)',
  'kadran/ölçek/rakam gerçeği (0-15 N alette "40 N" okutuldu; tüy 15 N\'lik yayı kıpırdatmaz)',
  'VO cümlesi ile karenin birebir örtüşmesi (öznenin kaybolması: astronotun ağırlığı → askıda kutu)',
  'cast etnisite/yaş kilidi (arka plan kalabalığı adsız bırakılırsa motor kendi kastını kuruyor)',
  'iki karenin birbirinin aynı olması (Sabit Sürat K13≈K14, kurguda 5 sn duruyor)',
];

export function lintFile(path, register = 'EDU') {
  const text = readFileSync(path, 'utf8');
  const parsed = parseBlocks(text);
  const blocks = parsed.map((b) => ({ ...b, kind: blockKind(b.body) }));
  const rows = blocks.map((b) => ({ head: b.head, kind: b.kind, problems: lintBlock(b.body, register) }));

  const kirmizi = rows.filter((r) => r.problems.some((p) => p.level === 'kirmizi'));
  const sari = rows.filter((r) => !r.problems.some((p) => p.level === 'kirmizi') && r.problems.length);

  const frames = blocks.filter((b) => b.kind === 'frame');
  const counts = {};
  for (const s of SLOTS) {
    if (!appliesTo(s, register)) continue;
    const uygulanan = frames.filter((b) => !s.needsIf || s.needsIf(b.body));
    if (!uygulanan.length) continue;               // bu dosyada hiç sorulmadı → karneye girmez
    counts[s.key] = `${uygulanan.filter((b) => s.test(b.body)).length}/${uygulanan.length}`;
  }

  const metrics = corpusMetrics(blocks);
  if (metrics && metrics.kareOzelOran < KARE_OZEL_MIN) {
    kirmizi.push({ head: '(DOSYA GENELİ)', kind: 'korpus', problems: [{
      kind: 'korpus', key: 'kare-ozel', level: 'kirmizi',
      msg: `kare-özel oran %${Math.round(metrics.kareOzelOran * 100)} (alt sınır %${KARE_OZEL_MIN * 100})`,
      why: 'Bileşke %35 → 52 karenin 34\'ü revize (%65). Boilerplate büyüdükçe kare kendi sahnesini anlatmayı bırakıyor.' }] });
  }
  if (metrics && metrics.negVar >= 3 && metrics.negOzel < 0.5) {
    kirmizi.push({ head: '(DOSYA GENELİ)', kind: 'korpus', problems: [{
      kind: 'korpus', key: 'neg-ozel', level: 'kirmizi',
      msg: `NEGATIVE ${metrics.negVar} karede var ama yalnız %${Math.round(metrics.negOzel * 100)}'i kare-özel`,
      why: 'Bileşke\'nin 52/52 karesinde NEGATIVE vardı, kare-özel 2/52 → K34/K38 ok ucu, K19/K21 yüze düşen ışık. Global kuyruk tek başına yetmiyor.' }] });
  }

  // `bad` geriye dönük uyumluluk için KIRMIZI'yı taşır (kapanis-hasadi.mjs bunu sayıyor).
  return { path, register, total: blocks.length, rows, bad: kirmizi, sari, counts, metrics, olculmeyen: OLCULMEYEN };
}

export { SLOTS, TRAPS, parseBlocks, lintBlock, blockKind, corpusMetrics, OLCULMEYEN };

function report(r, { kapsam = true } = {}) {
  const name = r.path.split(/[\\/]/).pop();
  const kinds = r.rows.reduce((a, x) => (a[x.kind] = (a[x.kind] ?? 0) + 1, a), {});
  const tip = Object.entries(kinds).map(([k, n]) => `${n} ${k}`).join(' · ');
  console.log(`\n━━ ${name} — ${r.total} blok (${tip}) · register ${r.register}`);
  if (!r.total) { console.log('  (blok bulunamadı: "### K.." / "Sahne N" başlığı bekleniyor)'); return; }

  if (kinds.motion && kinds.motion >= r.total * 0.5) {
    console.log(`  ⛔ Bu dosya bir MOTION dosyası, start-frame dosyası değil — start-frame ölçütleriyle lintlenemez.`);
    return;
  }

  const cov = Object.entries(r.counts).map(([k, v]) => `${k} ${v}`).join(' · ');
  if (cov) console.log(`  kapsam: ${cov}`);
  if (r.metrics) {
    console.log(`  korpus: kare-özel %${Math.round(r.metrics.kareOzelOran * 100)} · `
      + `NEGATIVE kare-özel %${Math.round(r.metrics.negOzel * 100)} · `
      + `STYLE ${r.metrics.styleVariants} sürüm (${r.metrics.styleMin}-${r.metrics.styleMax} kelime)`);
  }

  for (const row of r.bad) {
    console.log(`  ▸ ${row.head}`);
    for (const p of row.problems.filter((p) => p.level === 'kirmizi')) console.log(`      ✗ ${p.msg}\n        ${p.why}`);
  }
  if (r.sari.length) {
    console.log(`  — sarı (${r.sari.length} blok · kusur iddiası DEĞİL, ajan tek geçişte baksın):`);
    const grup = {};
    for (const row of r.sari) for (const p of row.problems) (grup[p.msg] ??= []).push(row.head.slice(0, 24));
    for (const [msg, heads] of Object.entries(grup)) {
      console.log(`      ? ${msg} — ${heads.length} blok${heads.length <= 4 ? ` (${heads.join(', ')})` : ''}`);
    }
  }
  console.log(`  ${r.bad.length ? '⚠️' : '✅'} kırmızı: ${r.bad.length}/${r.total}${r.sari.length ? ` · sarı: ${r.sari.length}` : ''}`);

  if (kapsam) {
    console.log('  ölçülmeyen (yeşil ≠ temiz):');
    for (const o of r.olculmeyen) console.log(`      · ${o}`);
  }
}

// CLI — yalnız doğrudan çalıştırıldığında. `import` edildiğinde (kapanış hasadı) sessiz kalır.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const ARGS = process.argv.slice(2);
  const STRICT = ARGS.includes('--strict');
  const ALL = ARGS.includes('--all');
  const NO_KAPSAM = ARGS.includes('--kisa');
  // Varsayılan EDU: bugüne kadarki 181 karenin 181'i EDU. Varsayılanı sessizce REAL yapmak,
  // ölçülmemiş bir yasayı ölçülmüş sanmak olurdu.
  const REG = (ARGS.find((a) => a.startsWith('--register='))?.split('=')[1] ?? 'edu').toUpperCase();
  if (!['REAL', 'EDU', 'STY'].includes(REG)) {
    console.error(`bilinmeyen register: ${REG} (REAL | EDU | STY — src/core/brain.ts)`);
    process.exit(2);
  }
  const files = ARGS.filter((a) => !a.startsWith('--'));

  const targets = [];
  if (ALL) {
    const root = join(process.cwd(), 'agents', 'COMMAND-INBOX');
    // Eski glob yalnız `*_PROMPTLAR.(txt|md)` idi → üretimin dörtte üçü görünmüyordu:
    // sidecar dosyalar (`*CODEX-KALAN-START-FRAMELER.txt`, K09-K35) ve tekil kare klasörleri
    // (`PROMPTLAR/01.md` … 50 dosya) hiç taranmadı. Artık ADA değil İÇERİĞE bakılır.
    const walk = (dir) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) { walk(p); continue; }
        if (!/\.(txt|md)$/i.test(e.name)) continue;
        if (/_(MOTION|EDIT-PLAN|SESLENDIRME|SUNO|REFERANSLAR)\b/i.test(e.name)) continue;
        let head = '';
        try { head = readFileSync(p, 'utf8'); } catch { continue; }
        if (/^STYLE:/im.test(head) || /^NEGATIVE:/im.test(head) || /FRAME NEGATIVE/i.test(head)) targets.push(p);
      }
    };
    if (existsSync(root)) walk(root);
  } else {
    targets.push(...files);
  }

  if (!targets.length) {
    console.error('kullanım: node scripts/prompt-lint.mjs <dosya> [--strict] [--kisa] [--register=real|edu|sty]  ya da  --all');
    process.exit(2);
  }

  let bad = 0;
  for (const t of targets) {
    if (!existsSync(t)) { console.error(`yok: ${t}`); bad++; continue; }
    const r = lintFile(t, REG);
    report(r, { kapsam: !NO_KAPSAM && targets.length === 1 });
    bad += r.bad.length;
  }

  console.log(`\n${bad ? '⚠️' : '✅'} toplam kırmızı blok: ${bad}`);
  if (STRICT && bad) process.exit(1);
}
