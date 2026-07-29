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
// Buna karşılık eski linter, revizeyi öngören iki şeyi HİÇ ölçmüyordu:
//   · **negatifin KARE-ÖZELLİĞİ** — satırın varlığı ölçülüyordu, işi ölçülmüyordu. Ölçüldüğünde
//     ayrım net: Üreme %100 · Sürtünme %100 · Sabit Sürat %23 · **Bileşke %0** (52/52 karede
//     NEGATIVE var ama hepsi aynı) → K34/K38 ok ucu, K19/K21 yüze düşen ışık.
//   · **STYLE kelime tavanı** — `\Z` JS'te yok (Perl kalıntısı), regex sessizce kırıktı ve tavan
//     HİÇ ateşlemiyordu. Ölçüldüğünde: Üreme 86-116 · Sabit Sürat 68-116 · Sürtünme 125 ·
//     **Bileşke 148-243**. Revize sırasıyla birebir aynı yönde.
//
// ÖLÇÜLDÜ VE DÜŞTÜ — `kare-özel oran` (Codex denetimi 2026-07-29): 52 revize alan Bileşke %97,
// az revize alan Sürtünme %47 veriyor; yani TERS yönde. Ayrıca eşik dosya uzunluğuna duyarlı
// (aynı dosya 10 karede %35, 52 karede %97). SARI'ya düşürüldü — doğrulanmamış metrik kırmızı yakmaz.
//
// YENİ SÖZLEŞME — üç kat, ve linter ne ölçemediğini SÖYLER:
//   KIRMIZI  kanıtlı eksik — slot ailesinin hiçbir üyesi yok, ya da sayılabilir bir kural kırık.
//   SARI     linter karar veremiyor — ajanın tek geçişinde bakılacak. Kusur İDDİASI DEĞİL.
//   KAPSAM   ölçülmeyenlerin açık listesi. "Yeşil" demek "temiz" demek değildir; bu satır olmadan
//            yeşil bir yalandır ("kapı kuruldu ≠ kapı ateşliyor" — dört taramada tekrar eden kök kusur).
//
// Kanıtla sınanır (2026-07-29 ölçümü):
//   Sürtünme  → `canlı üçlü` 31/31 ve `sheen` SUSAR (ikisi de sahteydi); `derinlik` 1/31 ve
//               `ten` 0/25 KIRMIZI kalır (ikisi de gerçekti); STYLE 125 kelime.
//   Bileşke   → `neg` 52/52 GÖRÜLÜR (`FIREWALL NEGATIVE:` yazıyor) ama kare-özel %0; STYLE 148-243.
//   Üreme     → temas 50/50 · text-hece 14/14 · NEGATIVE kare-özel %100 (altın standart).
//   Kuvvet .md→ 58/58 MOTION olarak tanınır ve start-frame ölçütleriyle lintlenmez.
// Bunlardan biri tutmuyorsa linter yanlıştır, prompt değil.
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
    //   "their contact plane touching" · "the surfaces MUST touch"  (Sürtünme S8 — Codex yakaladı)
    test: (b) => /(rests? in contact|contact shadow|contact seam|contact plane|rests? (on|against)[^.]{0,70}contact|surfaces? (must )?touch|touching seam|(does not|doesn't) float|not floating|weighted shadow|anchors? (him|her|it|them|the [a-z]+)[^.]{0,50}to the (ground|floor|surface|table|desk))/i.test(b),
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
    key: 'text-tasiyici',
    label: 'TEXT harf karakteri (malzeme ya da tasarım)',
    // `text-hece` yazının DOĞRU çıkmasını ölçüyor; bu slot NEREDE yaşadığını ölçüyor.
    // İkisi ayrı kusur: Üreme'nin 50 karesinde imla 50/50 temizdi (heceleme tuttu) ama
    // yazılı 14 karenin 14'ü AYNI hamleydi — "kabartma boyutlu parlayan harfler masada".
    // Lint o sırada yeşildi, çünkü tekdüzelik hiçbir kurala görünmüyordu (2026-07-28,
    // Mami: "paso tahtaya çakıyorsun yazıyı"). Yasa §11a/§11b.
    //
    // İki meşru yol var (§11a) ve ikisi de serbest: (a) yazı sahnenin kendi nesnesinde
    // yaşar — o nesnenin baskısı/el yazısı/damgası yazılır; (b) o ana yakışacak biçimde
    // TASARLANMIŞ ekran yazısı — nesne şart değil ama harfin nasıl var olduğu yine yazılır.
    // Ortak koşul: harf karakteri tarif edilmiş olsun.
    //
    // Sözlük iki koldan bakar, çünkü tasarlanmış yazının "malzemesi" bir yazı tipi adı değil
    // bir MADDE olabiliyor ("tide-worn damp sea-sand matter with pebbled grain"). Dar sözlük
    // doğru yazılmış kareyi kırmızı verdi, o yüzden ikinci ve üçüncü kol eklendi.
    test: (b) => {
      const t = (b.match(/^TEXT:.*$/im) || [''])[0];
      return /\b(printed|offset|handwritten|hand-written|pencil|ink|stamped|embossed|engraved|chalked|serif|sans|typewriter|marker|felt-tip|letterpress|thermal|scrawl|painted|stencil|etched|woven|carved|typograph|letterform|typeface|glyph|strokes?|counters?|terminals?)\b/i.test(t)
        || /\b(built|made|formed|cut|shaped|woven|wiped|drawn)\b[^.]{0,60}\b(as|of|from|out of|through)\b/i.test(t)
        || /\b(matter|grain|texture|fibre|fiber|material)\b/i.test(t);
    },
    why: 'Yazı ya sahnenin kendi nesnesinde yaşar ya da o ana yakışacak biçimde tasarlanır — '
      + 'ikisi de serbest, ama harfin NASIL var olduğu yazılmazsa ajan boşluğu tek alışkanlıkla '
      + 'dolduruyor: Üreme\'de yazılı 14 karenin 14\'ü "kabartma parlayan harfler masada".',
    needsIf: (b) => bearsText(b),
  },
  {
    key: 'neg',
    label: 'NEGATIVE slotu',
    // Bileşke `FIREWALL NEGATIVE:` yazıyor — eski desen onu göremiyordu ve 52/52 karesi
    // "NEGATIVE yok" diye kırmızı alıyordu; oysa hepsinde negatif VAR (Codex denetimi).
    test: (b) => /^(FRAME |FIREWALL |GLOBAL |WORLD )?NEGATIVE\s*:/im.test(b) || /(FRAME|FIREWALL) NEGATIVE/i.test(b),
    why: 'İki temiz setin ortak paydası: Sürtünme 31/31 inline, Sabit Sürat 44/44.',
  },
];

// ---------------------------------------------------------------------------
// TUZAKLAR — artık BAĞLAMLI. Bir kelime tek başına kusur değildir; kusur onun nereye
// yazıldığıdır. Eski linter bunu ayırmadığı için tek başına ~100 sahte alarm üretiyordu.
// ---------------------------------------------------------------------------
// \b ZORUNLU: sınırsız `face` deseni **surface** kelimesinin içinde eşleşiyordu — yani ahşap/taş
// YÜZEYİNİN sheen'ini TEN kusuru sayıyordu (Codex denetimi, 2026-07-29). Sessiz yanlış pozitif,
// ölçümün kendisini çürüten sınıf. `hand` da `handle`/`handheld` içinde tutuyordu.
const SKIN = /\b(skin|cheek|face|facial|complexion|forehead|chin|hands?)\b/i;

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
    key: 'tekduzelik-yazi',
    // Tekdüzelik imzası. Üreme'de yazı taşıyan 14 karenin 14'ünde birebir bu kalıp vardı;
    // hiçbiri "hatalı" değildi, hepsi AYNIYDI — ve tekrar kurguda monotonluk olarak çıkıyor.
    // Kelime avı değil: bu üçlü, sahneye ait olmayan bir etiketin sahneye çakıldığı andır.
    hit: (b) => /blocky[^.]{0,80}\braised\b|\braised\b[^.]{0,40}\bdimensional\b/i.test(b),
    fix: 'sahneye ait TAŞIYICI seç (tohum paketi, fidan etiketi, defter sayfası, kavanoz '
      + 'kapağı, emaye kadran) ya da o ana tasarlanmış tipografi yaz — "blocky raised '
      + 'dimensional" havada duran kavram kelimesidir, on dört karede aynı hamle çıktı',
  },
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
// Yasa (§2) ≤90 kelime der; linter 110'da kırmızı yakar. Fark BİLEREK var ve ölçüldü:
// altın standart Üreme'nin STYLE'ı 86-116 kelime ve o iş tuttu. 90'da kırmızı yakmak Mami'nin
// EN İYİ işini kırmızıya boğardı — sahte alarm ölçümü çöpe atar. 110 = yasanın hedefi + altın
// standarttan ölçülmüş tolerans. Hedef hâlâ 90; 110 duvarın yeri.
// Bu satırı 90'a çekmeden önce Üreme'yi lintle: kaç kare kırmızıya düşüyor, gör.
const STYLE_MAX_WORDS = 110;
// Kare-özel oran alt sınırı. Bileşke %35 → %65 revize. Sürtünme %51 → çok daha az.
const KARE_OZEL_MIN = 0.45;

// ---------------------------------------------------------------------------
// YARDIMCILAR
// ---------------------------------------------------------------------------

// "No person enters the frame" diyen kare ten kilidi istemez. Kütle CODEX'te 13 kare böyle;
// eski linter on üçüne birden "ten kilidi YOK" basıyordu — on üçü de sahteydi.
const INSANSIZ = /\bno (person|human|people|figure|one)\b[^.]{0,40}\b(enters?|in the frame|visible|present)|without any (person|human)/i;
// 2026-07-29 (Sol denetimi): bu, Codex'in `nearSkin`'de yakaladığı kusurun İKİZİYDİ — orayı
// `\b` ile onarıp burayı atlamışım. Ölçüldü, Üreme'nin (altın standart) 13 karesi bu yüzden
// kırmızı alıyordu:
//   · `face` → **surface** içinde eşleşiyordu ("rests in contact with its surface", ×3)
//   · `face` → "**no face**, eyes or cartoon mouth" — yüz YOK diyen negatif, "yüz var" sayılıyordu
//   · `child` → "**child-clear** readability" (prop ölçeği hakkında bir STYLE cümlesi)
// Üç düzeltme: (1) kelime sınırı zorunlu, (2) yalnız KARE-ÖZEL gövde taranır — STYLE kuyruğu
// her karede aynıdır ve meşru olarak "child-clear"/"never on skin" taşır, (3) olumsuzlanmış
// bağlam ("no face", "without a face") insan saymaz.
// @tag tek başına insan DEĞİLDİR: @mikroskop, @amip, @defter de tag'lidir.
const INSAN_KELIME = /\b(child|children|boy|girl|teacher|woman|man|men|student|kid|kids|people|person)\b/i;
const OLUMSUZ_YUZ = /\bno (face|human|person|people)\b|\bwithout (a )?(face|person)\b/i;

// Gövde parçası ≠ mekân. `@efe's face` KAREDE VAR demektir; `@efe's bedroom` yalnız mekânın
// kime ait olduğunu söyler — Efe orada değildir. Sol denetimi 2026-07-29 bu ayrımı ölçtü.
// `arm` ve `head` BİLEREK yok: deniz yıldızının kolu (K22), koltuğun kolu, masanın başı —
// çok anlamlı sözcük insan varlığı kanıtlamaz. Ölçüldü, dördüncü turda çıktı.
const GOVDE = /(face|cheek|skin|eyes?|hair|shoulders?|fingers?|hands?|gaze|smile|brow|chin)/i;

// `hand` kelimesinin İNSAN ELİ OLMADIĞI kanıtlı bağlamlar — hepsi gerçek korpustan:
//   "a hand's width off"      (ölçü birimi, K22)
//   "hand-knitted blanket"    (bileşik sıfat, K41/K42)
//   handheld · handle · handful · handmade · by hand
// Bunlar taramadan ÖNCE silinir; yoksa insansız kare "insan var" sayılır.
// `child` bileşikleri de insan DEĞİL: "child-safe" (yaranın görünümü), "child-clear readability"
// (prop ölçeği), "child-eye height" / "child's eye-line" (kamera yüksekliği). Üçü de gerçek korpustan.
const COCUK_DEGIL = /\bchild(?:['’]s)?[- ](?:safe|clear|eye|eyes|height|friendly|sized|scale|line)\b|\bchild-eye\b/gi;
const EL_DEGIL = /\bhand(?:['’]s)?[- ](?:width|length|span|breadth|knitted|painted|made|held|woven|blown|carved|stitched)\b|\bhand(?:ful|held|le|les|ling|made|writing|written)\b|\bby hand\b/gi;

/**
 * Karede İNSAN var mı? Kelime avlamaz — VARLIK arar.
 *
 * Bu fonksiyon bugün ÜÇ KEZ yanlış çıktı ve üçünde de aynı sebeple: sınırsız kelime eşleştirme.
 *   1. `face` → **surface** içinde eşleşti (Codex yakaladı, nearSkin'de onarıldı)
 *   2. aynı kusur burada duruyordu — `\b` eklendi (Sol yakaladı)
 *   3. `\b` yetmedi: `hand's width` · `hand-knitted` · `@efe's bedroom` hâlâ insan sayılıyordu
 *      (Sol yine yakaladı — Üreme'nin 5 kırmızısının 4'ü sahteydi)
 * Ders: bu metinlerde bir kelimenin VARLIĞI hiçbir şey kanıtlamaz; kanıtlayan şey NE YAPTIĞIDIR.
 */
const hasHuman = (b) => {
  const fb = frameBody(b);
  if (INSANSIZ.test(fb)) return false;
  const temiz = fb.replace(OLUMSUZ_YUZ, ' ').replace(EL_DEGIL, ' ').replace(COCUK_DEGIL, ' ');

  // (a) Çıplak insan ismi — "two children watch", "the teacher leans in".
  if (INSAN_KELIME.test(temiz)) return true;

  // (b) @tag + insan fiili — "@efe stands", "@anne works at the counter".
  // Pencere DAR ve araya virgül/yeni özne girmemeli: "@efe's bedroom, where three glass vessels
  // **stand**" cümlesinde fiil vazolara aittir, Efe'ye değil — geniş pencere onu insan sayıyordu.
  if (/@[a-zçğıöşü][a-z0-9çğıöşü_-]*(?:\s+(?:the|a|an|his|her|now|still|just|quietly|slowly)){0,3}\s+(?:stands?|sits?|gazes?|looks?|smiles?|holds?|leans?|walks?|kneels?|reaches?|watches?|points?|whispers?|breathes?|crouch(?:es)?|lifts?|pushes?|presses?|works?|turns?)\b/i.test(temiz)) return true;

  // (c) @tag'in GÖVDE parçası — "@efe's face is a soft warm blur" (K15: gerçekten karede).
  //     Mekân sahipliği ("@efe's bedroom") buraya GİRMEZ.
  if (new RegExp("@[a-zçğıöşü][a-z0-9çğıöşü_-]*['’]s\\s+" + GOVDE.source, 'i').test(temiz)) return true;

  // (d) Tag'siz çıplak gövde parçası — "a small hand presses the glass".
  return new RegExp("\\b(?:a|the|his|her|their|one)\\s+(?:small\\s+|large\\s+|open\\s+)?" + GOVDE.source + "\\b", 'i').test(temiz);
};


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
  // Sürtünme STYLE / LIGHT AND PALETTE / NEGATIVE'i AYNI SATIRDA yazıyor. Satır tabanlı kesim
  // tek başına kuyruğu da sayıyor ve STYLE'ı 126 yerine 199 kelime gösteriyordu — kelime tavanı
  // ölçümü, ölçtüğünü sandığı şeyi ölçmüyordu. Satır İÇİNDEKİ etiketten de kesilir.
  return out.join(' ').split(/\s(?=(?:LIGHT AND PALETTE|TEXT|NEGATIVE|FRAME NEGATIVE|FIREWALL NEGATIVE)\s*:)/)[0].trim();
}

// Kare ekranda yazı taşıyor mu? Tırnak içinde 2+ karakterlik BÜYÜK harfli öbek (Türkçe dahil)
// ya da açık "on-screen text: <...>" talimatı. "no on-screen text" / "clean plate" taşımaz.
function bearsText(b) {
  if (/(clean plate|no on-?screen text|no visible text|no caption)/i.test(b) && !/"[^"]{2,}"/.test(b)) return false;
  // Yalnız TAMAMEN büyük harfli öbek aramak `"200 g"` gibi gerçek ekran yazılarını kaçırıyordu
  // (Kütle K—, Codex denetimi). Sayı + küçük harfli birim de ekran yazısıdır ve hecelenmelidir.
  return /"[A-ZÇĞİÖŞÜ0-9][A-ZÇĞİÖŞÜ0-9 =.,:+\/-]{1,}"/.test(b)
    || /"\s*\d+([.,]\d+)?\s*[a-zA-ZÇĞİÖŞÜçğıöşü]{1,4}\s*"/.test(b);
}

// ---------------------------------------------------------------------------
// HECELEME DOĞRULAMASI — talimatın KENDİSİ doğru mu?
//
// `text-hece` slotu hecelemenin VARLIĞINI ölçüyor. Ama yanlış heceleme yokluktan beterdir:
// motoru aktif olarak yanlış yönlendirir. Ölçülmüş vaka — Kütle K10:
//   TEXT: "DEĞİŞMEZ" — eight letters, second letter capital Ğ
// D-E-Ğ-İ-Ş-M-E-Z → sekiz harf DOĞRU, ama Ğ **üçüncü** harf. Slot tam da glif hatasını önlemek
// için var ve içindeki sayı denetlenmiyordu. Aynı dosyanın K13/K17/K31/K32 sayımları doğru —
// yani hata sistematik değil, DENETİMSİZ. Bu deterministik olarak ölçülebilir; ölçülüyor.
// ---------------------------------------------------------------------------
const SAYI_KELIME = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20,
};
const SIRA_KELIME = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8,
  ninth: 9, tenth: 10, eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15,
};
const sayiya = (t) => (/^\d+$/.test(t) ? Number(t) : SAYI_KELIME[t.toLowerCase()]);

/** Türkçe dahil harf sayısı — boşluk, tire ve noktalama sayılmaz.
 *  NFC ZORUNLU: macOS dosya metni Türkçe harfleri ayrışık yazıyor (Ç = C + birleşen çengel),
 *  normalize edilmezse `Ç` iki karakter sayılır ve linter kendi sahte alarmını üretir. */
const harfler = (s) => [...s.normalize('NFC')].filter((c) => /[\p{L}\p{N}]/u.test(c));

/**
 * Tırnak içindeki her yazıyı bulur, ardından gelen ~220 karakterde harf sayısı ve sıralı harf
 * iddialarını sınar. Çok kelimeli yazılarda ("VEJETATİF ÜREME — two words, the first a nine-letter
 * word …") iddia TEK KELİMEYE ait olabilir; bu yüzden hem tam metin hem de kelimeler denenir ve
 * HERHANGİ biri tutuyorsa iddia doğru sayılır. Yanlış alarm, ölçümü çöpe atar.
 */
function heceHatalari(body) {
  const out = [];
  const quoteRe = /"([^"]{2,60})"/g;
  let q;
  while ((q = quoteRe.exec(body))) {
    const yazi = q[1];
    if (!/[\p{L}]/u.test(yazi)) continue;
    // Segment BİR SONRAKİ TIRNAĞA KADAR kesilir: yoksa bir yazının iddiası ötekine karışıyor
    // ve linter kendi sahte alarmını üretiyor (ilk koşuda "KÜTLE" için başka bir kelimenin
    // "second letter" iddiası okundu). Ölçümün kendisi de ölçülür.
    const ham = body.slice(q.index + q[0].length, q.index + q[0].length + 220);
    const seg = ham.split('"')[0];
    const adaylar = [yazi, ...yazi.split(/[\s—–-]+/)].map((w) => w.normalize('NFC')).filter((w) => harfler(w).length);

    // "<n> letters" / "<n>-letter word"
    const cntRe = /\b(\d+|[a-z]+)[\s-]letters?\b/gi;
    let m;
    while ((m = cntRe.exec(seg))) {
      const n = sayiya(m[1]);
      if (!n) continue;
      if (!adaylar.some((w) => harfler(w).length === n)) {
        out.push(`"${yazi}" için "${m[0].trim()}" yazıyor — gerçek harf sayısı `
          + adaylar.map((w) => `${w}=${harfler(w).length}`).join(', '));
      }
    }

    // "the <sıra> letter ... <harf>"  (ör. "whose eighth letter is a capital İ")
    const ordRe = /\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth)\s+letter\b([\s\S]{0,60})/gi;
    while ((m = ordRe.exec(seg))) {
      const k = SIRA_KELIME[m[1].toLowerCase()];
      // Nitelik kelimesi ZORUNLU. Sınırsız `([\p{L}])\b` İngilizce "a" artikelini harf iddiası
      // sanıyordu — ilk koşuda birinci sahte alarm buydu.
      const m2 = m[2].normalize('NFC');
      const harfM = m2.match(/\b(?:capital|uppercase|lowercase|small|dotted|dotless)\s+(?:capital\s+|letter\s+)?([\p{L}])/u)
        ?? m2.match(/\bletter\s+"?([\p{Lu}])"?/u);
      if (!k || !harfM) continue;
      const iddia = harfM[1].normalize('NFC').toLocaleUpperCase('tr');
      const tutuyor = adaylar.some((w) => {
        const h = harfler(w);
        return h.length >= k && h[k - 1].toLocaleUpperCase('tr') === iddia;
      });
      if (!tutuyor) {
        // SARI: iddia yanlış OLABİLİR ama emin olamayız — yazarlar harfi sırasından ÖNCE de
        // yazıyor ("SABİT carries a dotted capital İ as its **fourth letter**"), bu da ileri
        // taramayı yanıltıyor. Ölçüldü: korpusta iki ordinal alarmın ikisi de sahteydi ve
        // ikisi de Mami'nin ÇALIŞAN işindeydi. Bugünün dersi kendi kodumda geçerli —
        // sahte alarm veren kontrol kırmızı yakmaz. Harf SAYISI kontrolü kırmızı kalır.
        out.push(`SARI:"${yazi}" için "${m[1]} letter ... ${iddia}" yazıyor — gerçekte `
          + adaylar.map((w) => {
            const h = harfler(w);
            return `${w}[${k}]=${h.length >= k ? h[k - 1] : '—'}`;
          }).join(', '));
      }
    }
  }
  return out;
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
const MOTION_RE = /\b(dolly|push in|pull back|pan (left|right)|tilt (up|down)|orbit|handheld drift|settle into|hold on|slow zoom|glid(e|ing)|drift(s|ing)? (in|across)|cran(e|ing)|track(s|ing) (left|right|with))\b/i;
const MOTION_STAY_RE = /(everything else stays|only the [a-z@ ]+ changes|no re-render|identity change|do not alter|do not warp|stays exactly as the frame)/i;

// Blok tipi tek bloga bakarak kesin bilinemez — DOSYA tipi bilinir. Yasa §2 her start-frame'e
// `STYLE:` kuyrugu koyar; bes gercek teslim dosyasinin hepsinde 100% karede var. Bir dosyada
// HIC `STYLE:` yoksa o dosya start-frame dosyasi DEGILDIR. Blok-basina sezgi Kuvvet
// `_PROMPTLAR.md` dosyasinda 58 blogun 51'ini kaciriyordu (Codex denetimi, 2026-07-29).
export function fileKind(blocks) {
  const withStyle = blocks.filter((b) => /^STYLE\s*:/im.test(b.body)).length;
  return (blocks.length >= 3 && withStyle === 0) ? 'motion-dosyasi' : 'frame-dosyasi';
}

function blockKind(body, fk = 'frame-dosyasi') {
  if (fk === 'motion-dosyasi') return 'motion';
  if (REF_EDIT_RE.test(body)) return 'ref-edit';
  const hasStyle = /^STYLE\s*:/im.test(body);
  if (!hasStyle && (MOTION_RE.test(body) || MOTION_STAY_RE.test(body))) return 'motion';
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
function lintBlock(body, register = 'EDU', fk = 'frame-dosyasi') {
  const problems = [];
  // `fk` ZORUNLU olarak taşınır: lintFile dosyayı `motion-dosyasi` ilan etse bile bu çağrı onu
  // geçirmediği sürece lintBlock kendi blok-başına sezgisine düşüyor ve MOTION_RE'ye takılmayan
  // bloklar start-frame ölçütleriyle lintleniyordu. CLI'da görünmüyordu (report erken çıkıyor)
  // ama `lintFile`'ı IMPORT eden kapanis-hasadi.mjs kirli `bad` sayısını görüyordu — yani
  // "kapı kurulu, kapı sağır" sınıfının kendisi, hem de bu dosyanın içinde. (Ajan denetimi.)
  const kind = blockKind(body, fk);

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

  // Heceleme talimatinin KENDISI dogru mu? Yanlis heceleme yokluktan beterdir.
  for (const h of heceHatalari(frameBody(body) + '\n' + (body.match(/^TEXT:[\s\S]*?$/im)?.[0] ?? ''))) {
    const sari = h.startsWith('SARI:');
    problems.push({ kind: 'hece', key: sari ? 'hece-sira' : 'hece-sayi', level: sari ? 'sari' : 'kirmizi',
      msg: `heceleme ${sari ? 'ŞÜPHELİ' : 'YANLIŞ'} — ${h.replace(/^SARI:/, '')}`,
      why: 'Slot glif hatasını önlemek için var; içindeki sayı yanlışsa motoru AKTİF olarak yanlış yönlendirir (Kütle K10: "DEĞİŞMEZ — second letter Ğ", oysa Ğ üçüncü harf).' });
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
  const fk = fileKind(parsed);
  const blocks = parsed.map((b) => ({ ...b, kind: blockKind(b.body, fk) }));
  const rows = blocks.map((b) => ({ head: b.head, kind: b.kind, problems: lintBlock(b.body, register, fk) }));

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
  // `kareOzelOran` KIRMIZI DEĞİL — bilgidir. Kanıtla sınandı ve DÜŞTÜ (Codex denetimi 2026-07-29):
  // 52 revize alan Bileşke %97, az revize alan Sürtünme %47 veriyor — yani revizeyi TERS yönde
  // "öngörüyor". Ayrıca eşik (cümlenin blokların %80'inde tekrarı) dosya uzunluğuna duyarlı:
  // aynı dosya ilk 10 karede %35, 20 karede %62, 52 karede %97 çıkıyor. Doğrulanmamış bir metriği
  // kırmızı yakmak, tam da bu linterde söktüğümüz hastalık olurdu. Ölçülüp basılır, hüküm vermez.
  if (metrics && metrics.kareOzelOran < KARE_OZEL_MIN) {
    sari.push({ head: '(DOSYA GENELİ)', kind: 'korpus', problems: [{
      kind: 'korpus', key: 'kare-ozel', level: 'sari',
      msg: `kare-özel oran %${Math.round(metrics.kareOzelOran * 100)} — boilerplate ağır olabilir`,
      why: 'DOĞRULANMAMIŞ metrik: revize sayısıyla korelasyonu ölçülmedi, dosya uzunluğuna duyarlı. Ajan gözle baksın.' }] });
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

  // Tekrar eden kusuru 45 satıra dağıtmak sinyali gömer: okunmayan rapor olmayan rapordur.
  // Aynı kusur sınıfı TEK satırda toplanır; kaç karede olduğu sayıyla verilir.
  // Beş ya da daha az kareyi ilgilendiren kusur tek tek gösterilir — orada kare adı bilgidir.
  const sinif = new Map();
  for (const row of r.bad) {
    for (const p of row.problems.filter((x) => x.level === 'kirmizi')) {
      const k = p.key;
      if (!sinif.has(k)) sinif.set(k, { why: p.why, msgs: new Set(), heads: [] });
      const g = sinif.get(k);
      g.msgs.add(p.msg);
      g.heads.push(row.head);
    }
  }
  for (const [, g] of [...sinif].sort((a, b) => b[1].heads.length - a[1].heads.length)) {
    const msg = g.msgs.size === 1 ? [...g.msgs][0] : `${[...g.msgs][0]} (+${g.msgs.size - 1} varyant)`;
    console.log(`  ✗ ${msg} — ${g.heads.length} kare`);
    console.log(`    ${g.why}`);
    if (g.heads.length <= 5) for (const h of g.heads) console.log(`      ▸ ${h.slice(0, 76)}`);
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
