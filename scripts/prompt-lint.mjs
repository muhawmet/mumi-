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
//     ayrım net: Üreme %100 · Sürtünme %100 · Sabit Sürat %23 · **Bileşke %21** (11/52 farklı
//     blok; 52/52 NEGATIVE var) → K34/K38 ok ucu, K19/K21 yüze düşen ışık.
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
//   Bileşke   → `neg` 52/52 GÖRÜLÜR (`FIREWALL NEGATIVE:` yazıyor) ama kare-özel %21; STYLE 148-243.
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
// TÜR SÖZLEŞMESİ — tek tanım scripts/prompt-turu.mjs'te; buraya kopyalanmaz (PROMPT-YASASI §0.4).
import { lintTur, TURLER, promptTuru, parseReferansBloklari, dosyaRolu } from './prompt-turu.mjs';

// NEGATIVE'in adı başına göre değişiyor ama görevi değişmiyor. Slot sayacı ile korpus
// ölçeri ayrı desen taşıdığında Bileşke'nin `FIREWALL NEGATIVE:` satırları 52/52 kapsamda
// görünürken neg-ozel kanıtından kayboldu; aynı körlüğün tekrar etmemesi için kök tek yerde.
const NEGATIVE_PREFIX_SOURCE = '(?:(?:FRAME|FIREWALL|GLOBAL|WORLD)\\s+)?NEGATIVE';
// Eski teslimlerde kuyruk aynı fiziksel satıra da yazılmıştır; satır başına bağlanmak
// `STYLE: … FIREWALL NEGATIVE:` biçimini kaçırır. Boşluk sınırı, sıradan metindeki
// "negative" kelimesini etiket sanmadan iki yazımın da aynı slot olduğunu korur.
const NEGATIVE_LINE_RE = new RegExp(`(?:^|\\s)${NEGATIVE_PREFIX_SOURCE}\\s*:`, 'im');
const NEGATIVE_BLOCK_RE = new RegExp(
  `(?:^|\\s)${NEGATIVE_PREFIX_SOURCE}\\s*:([\\s\\S]*?)(?=\\n[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ ]{2,}:|$)`,
  'im',
);

const SLOTS = [
  {
    key: 'lens',
    // 2026-08-05 · SARI'ya indirildi (ARINDIRMA §4 SÖK tablosu). Sayısal lens bir İFADE
    // beklentisidir: yokluğunda motorun kırıldığı ölçülmedi, yalnız "NB2 sayıyı okur" gözlemi
    // var — ki bu lensi ZORUNLU kılmaz, yalnız yazıldığında işe yaradığını söyler. Altın
    // standart lensi yazıyor; onu yazmayan bir kare bu yüzden basılamaz hale gelemez.
    warnOnly: true,
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
    // 2026-08-05 · SARI'ya indirildi: bu kural bir İFADE bekliyor, ölçülmüş bir motor
    // kırılması değil. Üretim engeli olamaz — kanon: docs/ai/PROMPT-SISTEMI-ARINDIRMA.md.
    warnOnly: true,
    label: 'REAL ten/yüzey gerçeği (gözenek, mikro-doku)',
    test: (b) => /(micro-?texture|pore|microtexture|real pore|skin micro)/i.test(b),
    why: 'REAL negatifi "NO plastic AI-smooth skin" der; pozitifi yazılmazsa motor plastik cilt basıyor.',
    registers: ['REAL'],
    needsIf: (b) => hasHuman(b) || /\b(professional|product)\b/i.test(b),
  },
  {
    key: 'fstop',
    // 2026-08-05 · SARI (ARINDIRMA §4 SÖK). Kanıtsız kelime beklentisi — REAL bloğu
    // 181/181 karede bir kez bile ateşlemedi, yani hiç sınanmadı.
    warnOnly: true,
    label: 'sayısal diyafram (f/x)',
    test: (b) => /\bf\/\d/i.test(b),
    why: 'REAL dünyaların render yasası diyaframı sayıyla yazar (f/4-f/8 ürün, f/2.8 bağlam, f/8 mimari).',
    registers: ['REAL'],
  },
  {
    key: 'karsi-terim',
    // 2026-08-05 · SARI (ARINDIRMA §4 SÖK). Altı sabit terimden birini ZORUNLU kılıyordu —
    // ifade dayatmasının en saf hali. Ölçen yazar değildir.
    warnOnly: true,
    label: 'photoreal karşı-terimleri (negative fill / motivated / grain)',
    test: (b) => /(negative fill|motivated light|film grain|35\s*mm film|black flag|bounce card)/i.test(b),
    why: 'Motorun varsayılanı "parlak ticari plastik"; mined `photoreal` maddesi onu kıran tek şey.',
    registers: ['REAL'],
  },
  {
    key: 'canli',
    // 2026-08-05 · SARI'ya indirildi: bu kural bir İFADE bekliyor, ölçülmüş bir motor
    // kırılması değil. Üretim engeli olamaz — kanon: docs/ai/PROMPT-SISTEMI-ARINDIRMA.md.
    warnOnly: true,
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
    // 2026-08-05 · SARI'ya indirildi: bu kural bir İFADE bekliyor, ölçülmüş bir motor
    // kırılması değil. Üretim engeli olamaz — kanon: docs/ai/PROMPT-SISTEMI-ARINDIRMA.md.
    warnOnly: true,
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
  // ═══ İKİ POZİTİF SLOT (2026-08-05) — kapının NE SORDUĞUNU değiştirir ═════════════
  //
  // Ölçülmüş sebep: Hücre'de `FİKİR:` 53/53, `PLAN:` 53/53, `FEDA:` 53/53 — kapı EKSİKSİZ
  // dolu ve yine 16 kusur geçti (8'i VO uyuşmazlığı). Yani kapının DOLULUĞU hiçbir şey
  // açıklamıyor; açıklayan tek şey kapının NE SORDUĞU. §2ø bugün "bu kareye neden bakılır"
  // diye soruyor — "bu kare cümlenin kaç yükümlülüğünü taşıyor" ve "bunu neden animasyon
  // yapıyor" diye sormuyor.
  //
  // Bu iki slot YASAK DEĞİL, ÜRETİCİ. Mami'nin teşhisi (2026-08-04): "özgür olduğumuz
  // tarlada çit çektik". Codex'in teşhisi: "sistem iyi film üretmek için değil, ölçülmüş
  // hatalara yakalanmamak için optimize olmuş — çit yönetmenin yerine geçti." Bir sistemin
  // yasak sayısını artırmak onu iyileştirmiyor; SORDUĞU SORUYU değiştirmek iyileştiriyor.
  //
  // KAPSAM: yalnız `FİKİR:` taşıyan blokta aranır. Ölçüldü — Hücre 15/15, Birlikte 54/54,
  // Üreme 0/50, Sabit Sürat 0/44. Yani yeni şablon ailesi zorunlu tutulur, eski teslimler
  // olmayan bir satır yüzünden kırmızıya boğulmaz.
  // ⚠ İKİSİ DE SARI — ve bu cesaretsizlik değil, bu deponun kendi kuralı: KIRMIZI
  // "kanıtlı eksik" demektir. Bu satırlar korpusta HİÇ yok, dolayısıyla "yokluğu kusur
  // üretiyor" henüz ÖLÇÜLMEDİ. Kırmızıya çekmek, ölçülmemiş bir metriği duvar yapmak olurdu
  // (STYLE_MAX_WORDS tam olarak böyle düşürüldü).
  // Ayrıca ölçüldü: KIRMIZI yapınca A5 doğal kontrolü ters döndü — aynı projenin ZENGİN
  // şablonlu iyi sürümü (V2, kare-özel STYLE 7/57) cezalanıp kötü sürümün (V1, tek STYLE
  // 53/57) altına düştü. Yeni bir satırı zorunlu tutmak, o satırı kullanan şablonu
  // cezalandırıyorsa ölçüm yönü bozulmuş demektir.
  //
  // 🔴 TERFİ ÖLÇÜTÜ (yazılı, unutulmasın): sonraki videonun AYRICALIK/YÜKÜM taşıyan
  // kareleri ile taşımayanları arasında revize oranı farkı ölçülür. Fark yönü doğruysa
  // ikisi de KIRMIZI'ya çıkar. Fark yoksa satır SİLİNİR — çünkü o zaman yalnız bir tören.
  {
    key: 'ayricalik',
    label: 'AYRICALIK satırı (bunu neden ANİMASYON anlatıyor)',
    warnOnly: true,
    needsIf: (b) => /^\s*FİKİR\s*:/im.test(b),
    test: (b) => /^\s*AYRICALIK\s*:\s*\S{12,}/im.test(b),
    why: 'ANİMASYONUN RUHU (§0) bugün düzyazı bir ricadır, kapısı yoktur — ve ölçüldü ki '
      + 'çit yönetmenin yerine geçiyor (23 Nisan\'ı anlatmak için kareye takvim yaprağı '
      + 'konmuş: kamerayla çekilebilecek nesne aramak). Sınama: "Bu kareyi gerçek kamerayla '
      + 'çekebilir miydim? EVET ise, animasyon olduğu için yapabileceğim daha iyi bir şey '
      + 'var mı?" AYRICALIK satırı o daha iyi şeyi ADIYLA yazar — imkânsız kamera, ölçek '
      + 'yalanı, madde geçişi, zamanın esnemesi, kavramın kendi maddesinden doğması. '
      + 'Her karede bağırmak gerekmez: "bu kare taşıyıcıdır, ayrıcalık K__\'de" de meşru bir '
      + 'cevaptır — ama YAZILMASI zorunludur, çünkü yazılmayan ayrıcalık düşünülmemiştir.',
  },
  {
    key: 'yukum',
    label: 'YÜKÜM satırı (VO\'nun her yükümlülüğü karede nerede)',
    warnOnly: true,
    needsIf: (b) => /^\s*FİKİR\s*:/im.test(b),
    test: (b) => /^\s*YÜKÜM\s*:\s*\S{12,}/im.test(b),
    why: 'Hücre\'nin 16 kusurunun 8\'i (yarısı) VO cümlesinin bir yan-cümlesinin karede '
      + 'karşılığı olmamasından doğdu. Örnek ölçüldü — K45 VO\'su "soğanda vardı, MİRA\'NIN '
      + 'HÜCRESİNDE HİÇ YOKTU" diyor; FİKİR satırı cümlenin ikinci yarısını hiç anmıyor ve '
      + 'kare tek taraflı geldi. FİKİR bir SEZGİdir; YÜKÜM bir SAYIMdır: VO\'daki her '
      + 'nicelik / konum / ölçek / karşıtlık / sahiplik sözcüğü tek tek karede nerede '
      + 'karşılandığıyla eşleşir. Biçim: VO\'nun her nicelik/konum/karşıtlık sözcüğünün karede '
      + 'sayılabilir · "Mira\'nınkinde hiç yoktu" → sağ yarı, sıfır yeşil cisim`',
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
    // 2026-08-05 · SARI'ya indirildi: bu kural bir İFADE bekliyor, ölçülmüş bir motor
    // kırılması değil. Üretim engeli olamaz — kanon: docs/ai/PROMPT-SISTEMI-ARINDIRMA.md.
    warnOnly: true,
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
    // 2026-08-05 · SARI (Codex/Terra karşı-denetimi). Kırmızı kalma gerekçesi "iki temiz setin
    // ortak paydası"ydı — bu bir korelasyon, ölçülmüş motor kırılması değil; ne güvenlik ne
    // süreklilik kilidi. Üstelik kural fiilen UYKUDA: Hücre 53/53, Bileşke 52/52 — NEGATIVE
    // zaten her yerde var, yani kırmızılığı hiçbir şeyi tutmuyor.
    // 🔴 GERİ ALMA KOŞULU: NEGATIVE'siz basılmış bir kare ölçülür ve kusuru NEGATIVE'in
    // yokluğuna bağlanabilirse KIRMIZI'ya döner. O ölçüm yapılana kadar sarı.
    warnOnly: true,
    label: 'NEGATIVE slotu',
    // Bileşke `FIREWALL NEGATIVE:` yazıyor — eski desen onu göremiyordu ve 52/52 karesi
    // "NEGATIVE yok" diye kırmızı alıyordu; oysa hepsinde negatif VAR (Codex denetimi).
    test: (b) => NEGATIVE_LINE_RE.test(b),
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
    // 2026-08-05 · SARI: kendi yorumu "hiçbiri hatalı değildi, hepsi AYNIYDI" diyor. Ajan baksın, üretim durmasın.
    level: 'sari',
    // Tekdüzelik imzası. Üreme'de yazı taşıyan 14 karenin 14'ünde birebir bu kalıp vardı;
    // hiçbiri "hatalı" değildi, hepsi AYNIYDI — ve tekrar kurguda monotonluk olarak çıkıyor.
    // Kelime avı değil: bu üçlü, sahneye ait olmayan bir etiketin sahneye çakıldığı andır.
    hit: (b) => /blocky[^.]{0,80}\braised\b|\braised\b[^.]{0,40}\bdimensional\b/i.test(b),
    fix: 'GEREKEN: harfin TAŞIYICISI o sahnenin kendi maddesinden gelsin — hangi nesne ve '
      + 'hangi tipografi, SENİN kararın. Ölçülen kusur bir üslup tercihi değil TEKRAR: '
      + '"blocky raised dimensional" öbeği on dört karede aynı hamleyle çıktı ve havada '
      + 'duran bir kavram kelimesi gibi okundu.',
  },
  {
    key: 'saffron',
    hit: (b) => /\bsaffron\b/i.test(b),
    fix: 'GEREKEN: rengi baharat/çiçek adı KULLANMADAN yaz — NB2 "saffron"u safran ÇİÇEĞİ '
      + 'çiziyor (Bileşke\'de 6 kare lotus/turuncu çiçek). Hangi kelime, senin kararın.',
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
    fix: 'GEREKEN: kuvvet ışığı bir IŞIK OLAYI olarak yazılsın, bir nesne olarak değil — isim '
      + 'olarak "bloom" ve çiçek/parçacık komşuluğu taç yaprağı doğuruyor. Cümle senin.',
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
    // 2026-08-05 · SARI: kanıtsız iki kelimelik yasak. Ajan baksın, üretim durmasın.
    level: 'sari',
    hit: (b) => /\bclean (table|desk|surface)\b/i.test(b),
    fix: 'giydirilmiş yüzey — "clean table" void doğuruyor',
  },
  {
    key: 'real-stil-sifati',
    // 2026-08-05 · SARI: yasaklı sıfat/imza adı listesi. Ajan baksın, üretim durmasın.
    level: 'sari',
    hit: (b) => /\b(teal[- ]orange|premium commercial look|deakins lighting|cinematic lens)\b/i.test(b),
    fix: 'fiziksel malzeme gerçeği yaz — stil sıfatı ve imza adı REAL negatif kilidinde yasak',
    registers: ['REAL'],
  },

  // ═══ 2026-08-04 · DÖRT ÖLÇÜLMÜŞ TUZAK ═══════════════════════════════════════
  // Mami: "60 start frame veriyorsan 41 revize veriyorsun, 2-3 kere baştan üretmiş
  // gibi oluyorum." O 41'in çoğu üç kaynaktan geldi ve üçü de basılmadan ÖNCE
  // metinde görülebilirdi. Bu dördü yapıyı değil ANLAMI ölçer.

  {
    key: 'govde-isik-celiskisi',
    // Ölçüldü (Destek K48): gövde "nearly dark science room" ve "kadrajın dörtte üçü
    // ışıksızdır" diyordu, aynı bloğun LIGHT satırı "bright and open" diyordu.
    // Motor GÖVDEYİ dinledi: ölçülen ortalama parlaklık 56, sekans ortalaması 100-116.
    // Aynı sınıf D bloğunun tamamında vardı ve toplu temizlikte GÖZDEN KAÇTI.
    hit: (b) => {
      const govde = b.replace(/^(STYLE|LIGHT AND PALETTE|TEXT|NEGATIVE)\s*:[\s\S]*?$/gim, '');
      const karanlik = /\b(nearly dark|dark(ened)? (room|interior|classroom|kitchen|space)|dimly lit|in near darkness|unlit (room|interior)|three[- ]quarters? of the frame is unlit)\b/i.test(govde)
        || /kadrajın dörtte üçü ışıksız|okunmaz karanlığa|karanlıkta kalır/i.test(govde);
      if (!karanlik) return false;
      const isikSatiri = (b.match(/^LIGHT AND PALETTE\s*:.*$/im) || [''])[0]
        + (b.match(/^STYLE\s*:.*$/im) || [''])[0];
      return /\b(bright and open|high-?key|fully lit|never a dark interior|airy)\b/i.test(isikSatiri);
    },
    fix: 'GÖVDE ile LIGHT satırı çelişiyor: gövde karanlık oda istiyor, LIGHT aydınlık. '
      + 'Motor gövdeyi dinliyor (K48: ölçülen parlaklık 56, sekans ortalaması 100-116). '
      + 'Gövdedeki karanlık cümlesini sök — yasak listesi: nearly dark / dimly lit / '
      + 'three-quarters unlit / kadrajın dörtte üçü ışıksız',
  },

  {
    key: 'siluet-alt-govde',
    // Ölçüldü İKİ KEZ (Destek K10 ve K29): etek/elbise + çömelme-diz-oturma + alçak
    // kamera aynı karede olunca müşteri "muhafazakâr revize" istiyor. Kadraj kilidi
    // (kadraj kilidi (belden aşağısının görünmediğini yazan biçim)) TEK BAŞINA yetmiyor — yerden bakan bir
    // kamerada çömelmiş gövdeyi belden kırpmak fiziksel olarak imkânsız, motor
    // çelişkiyi her şeyi göstererek çözüyor. Çözüm kırpma değil OKLÜZYON.
    hit: (b) => {
      const cocuk = /@mira|@dara|@efe|@ali|\b(girl|schoolgirl|child)\b/i.test(b);
      const etek = /\b(skirt|pinafore|dress|hem)\b/i.test(b);
      const poz = /\b(crouch|crouched|crouches|squat|kneel|kneels|kneeling|sits? (down|on the floor)|seated on the (floor|bench|worktop)|knees drawn|foot up on)\b/i.test(b);
      const alcak = /\b(camera (set )?(almost )?down on the (floor|ground)|low angle|from below|looking up at (her|him)|at (floor|ground) level|knee height)\b/i.test(b);
      if (!(cocuk && etek && poz && alcak)) return false;
      // OKLÜZYON yazılmışsa temiz — kırpma değil, önünde duran nesne
      return !/\b(occlud|behind the (base|bench|worktop|table|drum|case)|the (base|bench|worktop|table) (stands|runs|crosses) between the camera and)\b/i.test(b);
    },
    fix: 'Çocuk + etek + çömelme/diz + alçak kamera = muhafazakâr revize (iki kez ölçüldü). '
      + 'kadraj kilidi (belden aşağısının görünmediğini yazan biçim) TEK BAŞINA yetmez — '
      + 'kırpma değil OKLÜZYON gerekir: '
      + 'alt gövdeyi kamerayla arasına giren bir nesne (kaide, tezgâh, tepsi) KAPATSIN, '
      + 'ya da poz değişsin (ayakta, profilden)',
  },

  {
    key: 'adsiz-nesne',
    // Ölçüldü (Destek K08): prompt "an upright shape stands on a stand" demiş, nesneyi
    // ADIYLA çağırmamış — motor kendi kütüphanesinden KAFASIZ TERZİ MANKENİ doldurdu,
    // karanlıkta duran başsız insan gövdesi olarak. Adı konmayan her nesne motorun.
    // ⚠ İKİ MUAFİYET (2026-08-05, iki kırmızı elle okununca ölçüldü). Tuzağın hedefi
    // ADSIZ nesnedir ("an upright shape stands on a stand" → motor kafasız manken
    // doldurdu). Nesne ADLANDIRILMIŞSA kusur yoktur:
    //   · "the dark mass OF THE NEST"        → ad hemen yanında (Hayvanlarda K39)
    //   · "the big moulded piece READ AS a dark silhouette" → özne adlı, bu yalnız
    //     onun NASIL OKUNDUĞUNU söylüyor (Denetleyici K25)
    // Muafiyet yazılmazsa iyi yazılmış kare kusurlu görünür ve ajan onu "düzeltmeye"
    // iter — ölçümün kendisini çürüten sınıf.
    hit: (b) => {
      const re = /\b(an?|the|some) (upright|standing|tall|dark|looming|waiting|mysterious) (shape|form|figure|silhouette|thing|mass|object)\b/gi;
      let m;
      while ((m = re.exec(b))) {
        const sonra = b.slice(m.index + m[0].length, m.index + m[0].length + 90);
        const once = b.slice(Math.max(0, m.index - 90), m.index);
        if (/^\s+of\s+(the|a|an|его|his|her|its)\b/i.test(sonra)) continue;   // "mass OF THE nest"
        if (/\bread(s|ing)?\s+as\s*$/i.test(once)) continue;                   // "…piece READ AS a dark silhouette"
        if (/@[a-zçğıöşü]/i.test(b.slice(m.index, m.index + 80))) continue;    // @handle ile çağrılmış
        return true;
      }
      return false;
    },
    fix: 'Nesneyi ADIYLA çağır. "an upright shape" yazıldığında motor kütüphanesinden '
      + 'kafasız terzi mankeni doldurdu (K08). Adı konmayan nesne motorundur — '
      + 'GEREKEN: nesnenin ADI yazılsın — @handle ya da açık ad. Adı konmayan nesne motorundur.',
  },

  {
    key: 'yonsuz-isin',
    // SARI: Sabit Sürat korpusunda 12 kare bu deseni taşıyor ve o set regresyon
    // çıpasında "temiz setin tabanı" olarak duruyor. Desen gerçek bir risktir
    // (müşteri K30 için "anlamsız olmuş" dedi) ama tek başına kanıtlı eksik değil —
    // ajanın tek geçişte bakacağı yer.
    level: 'sari',
    // Ölçüldü (Sabit Sürat K30, müşteri "anlamsız olmuş" dedi): prompt "the bright
    // straight cool-blue heading-beam" demiş; "straight" motora YÖN söylemiyor ve
    // motor oku 90 derece DİKEY, gökyüzüne bakar hâlde çizdi — oysa VO yatay
    // düzlemde yer değiştirmeyi anlatıyordu.
    // ⚠ DAR TUTULDU (aynı gün, ilk hâli 25 sahte alarm verdi): bir ışık NESNENİN
    // İÇİNDE ya da BİR YÜZEY BOYUNCA yazılmışsa yönü zaten nesne veriyor — kemikteki
    // kor, omurgadaki halka dizisi, maket üstündeki çizgi TEMİZDİR. Kusur yalnız
    // ışık BOŞLUKTA serbest duran bir ok/ışın olduğunda doğuyor.
    hit: (b) => {
      const re = /\b(beam|arrow|heading-beam)\b/gi; let m;
      while ((m = re.exec(b))) {
        const seg = b.slice(Math.max(0, m.index - 130), m.index + 130);
        // nesneye ya da yüzeye bağlıysa yön zaten belli — temiz
        if (/\b(inside|within|through the (bone|shaft|wall|cage)|along the (bone|shaft|spine|rib|belly|curve|edge|surface|pavement|floor|ground|road|street|bench|desk|table|column)|in the disc gaps?|around the (axis|ball|joint|pin))\b/i.test(seg)) continue;
        // yatay/yer hizası açıkça yazılmışsa temiz
        if (/\b(flat along|parallel to the (ground|floor|road|surface)|at (ground|floor|bench|desk) level|horizontal|never rising|never (tilt|point)\w* up)\b/i.test(seg)) continue;
        // sun beam / window beam gerçek gün ışığıdır, kavram oku değil
        if (/\b(sun|window|daylight|morning|corridor|volumetric)\s*[- ]?\w*\s*(beam|shaft)/i.test(seg)) continue;
        // toz/zerre bir IŞIK HUZMESİNİN içinde dönüyorsa o gün ışığıdır, kavram oku değil
        if (/\b(dust|motes?)\b[^.]{0,60}\bbeam\b|\bbeam\b[^.]{0,60}\b(dust|motes?)\b/i.test(seg)) continue;
        return true;
      }
      return false;
    },
    fix: '"straight" motora YÖN söylemiyor — Sürat K30\'da ok 90 derece DİKEY çıktı, '
      + 'müşteri "anlamsız olmuş" dedi. GEREKEN: ışığın nereye yaslandığı yazılsın — '
      + 'hangi yüzeye paralel gittiği ve havaya yükselmediği. Cümleyi sen kurarsın.',
  },

  {
    key: 'islak-goz',
    // 2026-08-05 · GERİ SARI'YA İNDİRİLDİ (aynı gün kırmızıya çıkarılmıştı).
    // Sebep tek ve ölçülmüş: kırmızıya çıkarıldığı hâliyle ALTIN STANDARDI (Hücre D-K45-K53)
    // kırmızı yapıyor. Arkasındaki korelasyon gerçek (18/20 karakter karesi vs 4/33 organel
    // karesi, iki tur "plastik") ama kural o korelasyonu KELİME VARLIĞIYLA yakalıyor ve
    // şaheserin kendi kullanımını ayırt edemiyor. Ölçüm kalır, üretim engeli kalkar.
    level: 'sari',
    // 🔴 2026-08-05: SARI → KIRMIZI. Eski gerekçe birebir şuydu: *"altın standart Üreme
    // (0 revize almış iş) 50 karenin 1'inde bu ifadeyi taşıyor; kırmızıya çekmek altın
    // standardı yalancı çıkarırdı."* O gerekçenin dayandığı ÇIPA ÇÜRÜK ÇIKTI — Üreme'nin
    // `_revize.txt`'i diskte **31 revize bloğu** taşıyor. Yani kural, olmayan bir
    // kusursuzluğu korumak için gevşetilmişti.
    //
    // KIRMIZI'yı hak eden kanıt: ifade Hücre'nin karakter karelerinin 18/20'sinde vardı
    // (organel karelerinde 4/33) ve Mami İKİ TUR "plastik" dedi; sonra teslim metninden
    // 77 yerden söküldü. Bu gece kaynağı da kapatıldı (`SURGERY_DATA.json` render_law +
    // dna), yani yeni prompt'lar bu cümleyi artık miras ALMIYOR — kırmızı yalnız elle
    // yazılan nüksü yakalar.
    // ⚠ Bilinen tek karşı-örnek: Üreme'de 1/50 kare. O karenin teni gözle denetlenmedi;
    // "temiz karşı-örnek" değil, "bakılmamış kare" sayılır. Geri alınabilir tek satır.
    // Ölçüldü (Hücre madeni, 2026-08-04): "wet dual-point catchlights in the eyes"
    // karakter karelerinin 18/20'sinde, organel karelerinde 4/33. Mami'nin iki tur
    // boyunca "plastik" dediği şeyin kaynağı bu tek cümleydi; 77 yerden söküldü.
    // ⚠ DARALTILDI (2026-08-05, KIRMIZI'ya çekilirken ölçüldü). Eski desen `wet … catchlight`
    // ikilisini her yerde arıyordu ve Üreme K11'de YANLIŞ ALARM verdi: cümle gözle değil
    // SU/CAM harfleriyle ilgiliydi — *"jade-tinted water-matter … with wet catchlights
    // running along the strokes"*. Islak parlama camda, suda, seramikte MEŞRUDUR; kusur
    // yalnız GÖZDE doğar. Bu, bu dosyanın iki kez yaşadığı sınıfın aynısı (`surface`
    // içindeki `face`, `sheen-free`). Kural artık göz komşuluğu istiyor.
    hit: (b) => {
      if (/\bdual-?point catchlights?\b/i.test(b)) return true;  // bu kalıp yalnız göz için yazılır
      const re = /\bcatchlights?\b/gi; let m;
      while ((m = re.exec(b))) {
        const seg = b.slice(Math.max(0, m.index - 90), m.index + 90);
        if (!/\bwet\b/i.test(seg)) continue;
        if (/\b(eyes?|iris|pupils?|gaze|eyeball)\b/i.test(seg)) return true;
      }
      return false;
    },
    fix: 'PLASTİK TEN buradan geliyor (18/20 karakter karesi vs 4/33 organel karesi). '
      + 'GEREKEN: parlaklığın SINIRI yazılsın — yansımanın gözde kalıp tende BİTTİĞİ. '
      + 'Tenin nasıl okuduğu senin cümlen.',
  },

  {
    key: 'isik-yuzu-disliyor',
    // 2026-08-05 · SARI: KENDİ KANITININ "doğal" dediği karede ateşliyor (Hücre K07) — kalibrasyonu bozuk. Ajan baksın, üretim durmasın.
    level: 'sari',
    // PLASTİK TENİN İKİNCİ VE DAHA BÜYÜK SEBEBİ (Hücre madeni, 2026-08-04).
    //
    // Ölçüm 5/5 tutarlı: kavram ışığını yüzün DIŞINDA bırakan üç kare (K12 K13 K49)
    // plastik okundu; yüzü ışığın İÇİNE sokan iki kare (K07 K14) doğal okundu.
    //
    // Mekanizma: "ışık yüzüne ULAŞMAZ" bir NEGATİFTİR. Motor negatiften karanlık
    // üretmiyor — yüzü ortam dolgusuna bırakıyor, ortam dolgusunun da gradyanı,
    // terminatörü ve yönü yok. Yani "yüzü ışıktan koru" cümlesi teni plastikleştiriyor.
    //
    // Kusur ışığın azlığında değil, karanlığın YAZILMAMASINDA. Bu yüzden kural
    // "dışlama cümlesi var mı" diye değil, "dışlama var ama karanlık ÇAPASI yok mu"
    // diye soruyor: terminatör, sıçrama, negative fill, gölge tarafı yazılmışsa TEMİZ.
    //
    // ⚠ §5øø İLE ÇELİŞMEZ — KELİME ÇAKIŞMASI VAR, OKUMADAN ÖNCE BUNU OKU.
    // `agents/worlds/pixar_3d_edu.md` "çocuğun yüzü hiçbir karede gölgeye atılmaz" diyor
    // ve `reaches nothing else` kalıbını bu dünyada yasaklıyor. Bu kural ONA KARŞI DEĞİL:
    //   YASAK  = yüz OKUNMAZ hale gelir (siluet, kapalı siyah, düz ambiyans)
    //   ZORUNLU = yüz MODELLENİR (terminatör + ADLANDIRILMIŞ sıçrama; yüz okunur kalır)
    // Altın kanıt K07'nin kendi cümlesi ikisini birden söylüyor: "Her face turns dark
    // against the sun but stays fully modelled, three-dimensional and readable... carried
    // entirely by the warm bounce coming back off the sunlit wall." İki yasa da aynı
    // düşmanı hedefliyor: DÜZ, GRADYANSIZ YÜZ. Bu kural asla "yüzü karart" demez.
    //
    // KORPUS KALİBRASYONU (2026-08-04, gerçek `lintBlock` yolundan ölçüldü — 247 kare):
    //   Üreme                              0/50  %0   ⚠ "0 revize" DEĞİL — bkz. aşağıda
    //   Sabit Sürat                        0/44  %0
    //   Sürtünme                           0/31  %0
    //   Hücre A (karakter ağırlıklı)       8/15  %53   ← Mami iki tur "plastik" dedi
    //   Farklı Kültürler                  35/53  %66   ← müşteri revizesi
    //   Birlikte Daha Güçlüyüz            48/54  %89   ← 30/54 revize
    // Eşik bu boşluğun içine kuruldu (%0 ile %53 arası boş), sayıya değil.
    //
    // 🔴 ÇIPA DÜZELTİLDİ (2026-08-05). Bu dosyanın altı yerinde "Üreme = 0 revize almış
    // altın standart" yazıyordu ve YANLIŞTI: diskteki `Eşeyli ve Eşeysiz Üreme_revize.txt`
    // **31 revize bloğu** taşıyor. Ama kalibrasyon ÇÖKMÜYOR, çünkü o 31 revizenin sınıfı
    // ölçüldü: süreklilik · kostüm kilidi · dünya kilidi · cam kopyası · @gul durum kilidi —
    // **hiçbiri ışık ya da ten sınıfında değil.** Bu tuzağın ölçtüğü kusur sınıfında Üreme
    // gerçekten temiz; ateşlediği üç proje ise tam da "plastik"/"düz imaj" şikâyeti alanlar.
    // Ders: bir eşiği kalibre ederken çıpanın SAYISI değil, çıpanın O KUSUR SINIFINDAKİ
    // durumu ölçülür. "Sıfır revize" hiçbir zaman kalite etiketi değildi (CLAUDE.md).
    //
    // İKİ YÖN DE DOĞRULANDI — korelasyon değil, mekanizma:
    //   Üreme   : dışlama cümlesi  0/50 · karanlık çapası 28/50
    //   Birlikte: dışlama cümlesi 49/54 · karanlık çapası  0/54
    // Yani altın standart karanlığı YAZIYOR, 30 revize alan iş ışığı DIŞLIYOR. Bu, kelime
    // sayısı gibi ters dönen bir metrik değil (bkz. STYLE_MAX_WORDS'ün SARI'ya düşüşü).
    //
    // ⚠ KAPSAM: "insan yüzü var + hiç karanlık çapası yok" kuralı KURULMADI — Üreme'nin
    // 50 karesinin 22'sinde de çapa yok ve o iş ten/ışık sınıfında sıfır revize aldı. Yani çapa her karede
    // zorunlu değil; kusur yalnız DIŞLAMA ile birlikte doğuyor.
    hit: (b) => {
      // 1) Karede insan yüzü var mı? (@handle ya da açık yüz sözcüğü)
      const insanVar = /@[a-zçğıöşü]+\d*/i.test(b)
        || /\b(her|his|their) (face|cheek|cheekbone|brow|jaw|profile)\b/i.test(b)
        || /\b(girl|boy|child|teacher|student|woman|man)\b/i.test(b);
      if (!insanVar) return false;

      // 2) Işığı DIŞLAYAN cümle var mı — VE o cümle YÜZE Mİ AİT?
      //
      // ⚠ DARALTILDI (2026-08-05, basılmamış iki projede 25 kırmızı çıkınca ölçüldü).
      // İlk hâli "blokta insan var + herhangi bir yerde dışlama cümlesi var" diye
      // ateşliyordu ve YANLIŞ ALARM veriyordu. Gerçek vaka (Denetleyici K02):
      //   "it reaches nothing in the upper half of the back wall, nothing on the ceiling
      //    and nothing on the top edge of the clock's wooden case"
      // Bu ODANIN kararmasıdır ve dünya kartının MEŞRU saydığı şeydir (§5øø ayrımı:
      // oda karartılabilir, YÜZ karartılamaz). Kusur yalnız dışlama YÜZE ait olduğunda
      // doğuyor — o yüzden her dışlama eşleşmesinin PENCERESİNDE yüz sözcüğü aranır.
      // ⚠ SAHİPLİK ŞARTI (2026-08-05, üçüncü daraltma — 13 kırmızı elle okununca ölçüldü).
      // Bu korpusta `face` çoğu zaman NESNE YÜZEYİ demek, insan yüzü değil:
      //   "the branded face of the timber box" · "the stencilled face of the sign"
      //   "the faded face of the seed packet" · "the milk skin"
      // Bu dosyanın kendi tarihinde aynı sınıf iki kez yaşandı (`surface` içindeki `face`,
      // `handle` içindeki `hand`) ve \b sınırıyla çözüldü sanıldı — çözülmedi, çünkü sorun
      // sınırda değil ANLAMDA. İnsan yüzü bu korpusta HER ZAMAN sahipli yazılır:
      // "her face" · "his jaw" · "@mira3's face". Nesne yüzeyi ise "face OF the ...".
      // ⚠ `\b` ALTERNASYONUN BAŞINA KONMAZ: `@` sözcük karakteri değildir, `\b@` hiçbir
      // zaman eşleşmez ve @handle seçeneği sessizce ölür (ölçüldü — kendi kırmızı-kanıtı
      // fixture'ım düştü, yani kural @mira3's face'i göremiyordu). Sınır kelime
      // seçeneklerinin içine taşındı.
      const YUZ = /(?:\b(?:her|his|their)|@[a-zçğıöşü]+\d*'?s?)\s+(face|cheeks?|cheekbones?|skin|brow|jaw|forehead|chin|eyes?|features?|head|profile)\b/i;
      const DISLAMA = [
        /\b(reaches|touches|lifts|falls on|catches)\s+(nothing|none)\b/gi,
        /\b(not|never)\s+@[a-zçğıöşü]+\d*'?s?\s+\w+/gi,
        /\b(out of|outside of|beyond|clear of|away from)\s+the\s+[\w-]{0,24}\s*light\b/gi,
        /\b(stays?|remains?|sits?)\s+in\s+the\s+[^.]{0,30}\b(shade|ambient|fill)\b/gi,
        /\bno light (falls|reaches|lands)\b/gi,
        /\bdoes not reach\b/gi,
      ];
      let disla = false;
      for (const re of DISLAMA) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(b))) {
          // Dışlama cümlesinin kendi cümle penceresi — yüz burada geçiyor mu?
          const seg = b.slice(Math.max(0, m.index - 110), m.index + m[0].length + 110);
          if (YUZ.test(seg)) { disla = true; break; }
        }
        if (disla) break;
      }
      if (!disla) return false;

      // 3) KARANLIK ÇAPASI yazılmış mı? Yazılmışsa kusur yok — karanlık modellenmiş demektir.
      // ⚠ ÇAPA LİSTESİ GENİŞLETİLDİ (2026-08-05, dördüncü daraltma). Kalan 5 kırmızı ELLE
      // okununca kusurun promptta DEĞİL bu listede olduğu görüldü: kareler karanlığın
      // taşıyıcısını yazmıştı, ama benim tanımadığım biçimlerde —
      //   "opened only by the broad cold fill off the fogged glass"
      //   "opened only by a low warm bounce rising off the stove side of the room"
      //   "stay in cool violet shade lifted by sky bounce alone"
      //   "leaving one bright rim along his left jaw"
      // Dar bir çapa listesi, İYİ YAZILMIŞ kareyi kusurlu gösterir ve ajanı onları
      // "düzeltmeye" iter — ölçümün kendisini çürüten sınıf. Kural: karanlığın taşıyıcısı
      // ADLANDIRILMIŞSA çapa vardır; hangi fiille yazıldığı serbesttir.
      const capa = /\bterminator\b/i.test(b)
        || /\b(bounce|bounced) (light|back|off)\b/i.test(b)
        || /\b(opened|lifted|carried|held|softened|filled)\s+(only\s+)?by\b[^.]{0,70}\b(bounce|fill|sky|reflect\w*|glow|wall|surface|counter|glass|snow|sand)\b/i.test(b)
        || /\bleav\w*\s+(one|a|the)\b[^.]{0,50}\brim\b/i.test(b)
        || /\b(cold|warm|low|soft)\s+(fill|bounce)\s+(off|from)\b/i.test(b)
        || /\bcarried (only )?by\b[^.]{0,60}\b(bounce|reflect|wall|surface|floor)\b/i.test(b)
        || /\bnegative fill\b|\bblack flag\b/i.test(b)
        || /\b(shadow|dark) side\b/i.test(b)
        || /\bfalls? into (shadow|its own dark)\b/i.test(b)
        || /\bdarkest value\b/i.test(b)
        || /\bstop against each other\b/i.test(b)
        || /\bcatchlight[^.]{0,40}\blit eye only\b/i.test(b);
      return !capa;
    },
    fix: 'PLASTİK TENİN ASIL SEBEBİ (5/5 ölçüldü: K12 K13 K49 plastik · K07 K14 doğal). '
      + 'Işığın nereye ULAŞMADIĞINI yazma — karanlığın nerede DURDUĞUNU yaz. '
      + 'Motor negatiften karanlık üretmiyor, yüzü gradyansız ortam dolgusuna bırakıyor. '
      + 'KUSUR: ışığın yüze ULAŞMADIĞINI yazmak bir negatiftir. GEREKEN: karanlığın nerede '
      + 'DURDUĞU — terminatörün yüzden nereden geçtiği, gölge tarafını neyin taşıdığı. '
      + 'Cümle senin; ölçen yalnız bu bilginin eksik olduğunu söyler.',
  },
];

// STYLE bloğu kelime tavanı — ARTIK SARI (2026-08-02, yön ölçümü).
//
// Neden düştü: duvar yanlış sayıya kalibreydi ve ölçümün YÖNÜNÜ ters çeviriyordu.
// Yorumda "altın standart Üreme 86-116" yazıyordu; diskteki gerçek dosya **86-152**.
// Sonuç ölçüldü: Üreme'nin (31 revize · süreklilik sınıfı) 14 kırmızısının **13'ü** yalnız bu duvardan geliyordu,
// buna karşılık Birlikte (30/54 revize) 90 kelimede sabit durduğu için **0 kırmızı** alıyordu.
// Yani uzunluk, revize ile TERS korelasyon veriyordu — `kareOzelOran` ile aynı sınıf, aynı
// hüküm: doğrulanmamış (burada: ters doğrulanmış) metrik kırmızı yakmaz. Ölçülür, basılır, SARI.
const STYLE_MAX_WORDS = 110;

// STYLE TEKRARI — bu duvarın YERİNE geçen ölçüm (2026-08-02).
//
// Kanıt (diskten, 146 teslim dosyası tarandı): aynı STYLE bloğunun kaç karede BİREBİR
// tekrar ettiği revizeyle aynı yönde gidiyor ve arada TEMİZ BİR BOŞLUK var —
//   ≤2 tekrar : Üreme 50 karede maxRep **2** (31 revize · süreklilik sınıfı) · Sabit Sürat 44'te 2 · Kütle 27'de 1 ·
//               Hücre/Destek/Bitkiler (aktif iş) hepsinde 1
//   ≥4 tekrar : Birlikte **54/54** (30 revize) · Farklı Kültürler 53/53 · Sorunları V1 53/53 ·
//               Sürtünme 31/31 · Bileşke 24/52 · Bizi Bir Arada 22/33
// Korpusta maxRep=3 olan tek dosya var (Kuvvet, 45 karenin 3'ü) — yani eşiği 3 ya da 4 yapmak
// tek bir projeyi bile yer değiştirmiyor. Eşik bu boşluğun içine kuruldu, sayıya değil.
//
// `styleVariants` 2026-07-29'dan beri HESAPLANIYORDU ama hiçbir kural okumuyordu: ölçülen ama
// hüküm vermeyen sinyal, hüküm veren yanlış sinyalden daha pahalıdır — çünkü doğrusu elinizdeyken
// yanlışına bakıyorsunuz demektir.
//
// Ayarlanabilir: `MAMILAS_STYLE_TEKRAR=<n>` ortam değişkeni eşiği değiştirir (n<2 → kural kapanır).
const STYLE_TEKRAR_MIN = (() => {
  const n = Number.parseInt(process.env.MAMILAS_STYLE_TEKRAR ?? '', 10);
  return Number.isFinite(n) && n >= 2 ? n : 3;
})();
const STYLE_TEKRAR_KAPALI = Number.parseInt(process.env.MAMILAS_STYLE_TEKRAR ?? '', 10) < 2;
const STYLE_TEKRAR_NEDEN =
  'Her kare kendi malzemesini taşır — `dunya-kilidi.mjs` çıktısını olduğu gibi yapıştırma. '
  + 'O kuyruk bir BAŞLANGIÇTIR: o karenin ışığı, yüzeyi ve paleti karenin kendi cümlesiyle yazılır. '
  + 'Ölçüldü: STYLE tek sürümde donan üç iş (Birlikte 54/54 → 30 revize, Farklı Kültürler 53/53, '
  + 'Sürtünme 31/31) ile karesi kendi STYLE\'ını taşıyan altın standart (Üreme 49 sürüm / 50 kare → '
  + 'ten/ışık sınıfında sıfır revize) arasındaki tek yapısal fark budur.';
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
 * 🔴 2026-08-03 — NESNE PARÇASI, İNSAN PARÇASI DEĞİL.
 * `face` ve `skin` bu metinlerde çoğunlukla YÜZEY adıdır: "the rear face of the cord",
 * "the front face of the plate", "the skin on the milk". Aynı kusur bir kez `nearSkin`'de
 * onarılmıştı (dosyanın kendi yorumu: *"`face` → **surface** içinde eşleşti"*), ikizi
 * `hasHuman`'da duruyordu: 14 karelik bir blokta **4 sahte kırmızı** — kedi karesi, maket
 * karesi ve çaydanlık karesi "karede insan var" sayılıp ten kilidi istendi.
 * Hafızadaki *"lint rol görmüyor · 50 karede 19 yanlış alarm"* kusurunun kök nedeni budur.
 */
// ⚠ Desen, ORGANI DA yutmalı: "the model's left cheek" içinde yalnız "the model's" silinirse
// geriye "left cheek" kalır ve tetikleyici olarak durur. Sahibi nesne olan her beden-parçası
// adı, araya sıfat girse bile birlikte düşer.
const YUZEY_DEGIL = /\b(?:the|its|a|that)\s+(?:model|mannequin|figure|bust|dummy|doll|statue)(?:'|’)s\s+(?:\w+\s+){0,2}(?:cheek|face|skin|jaw|brow|temple|forehead|neck|shoulder|hand)\b|\bthe model(?:'|’)s\b|\bits face\b|\bpale skin\b|\b(?:rear|front|top|bottom|outer|inner|far|near|upper|lower|flat|curved|cut|end|side)\s+face\b|\bface\s+of\s+(?:the|its|that|this)\b|\bskin\s+(?:on|of)\s+(?:the|its|that)\b|\b(?:milk|paint|pudding|soup|cream)\s+skin\b|\bcheek\s+of\s+(?:the|its)\b/gi;

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
  const temiz = fb.replace(OLUMSUZ_YUZ, ' ').replace(EL_DEGIL, ' ').replace(COCUK_DEGIL, ' ').replace(YUZEY_DEGIL, ' ');

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
// 🔴 2026-08-03 eklendi: `KARE-ÖZEL YASAK:` de bir YASAK satırıdır ve içi "no child, no person,
// no bare skin" gibi cümlelerle doludur. Gövdede sayıldığı için `hasHuman` insansız karelerde
// (kedi, maket, çaydanlık) "karede insan var" sanıp ten kilidi istiyordu — 14 karelik bir blokta
// 4 sahte kırmızı. Bu, hafızadaki "lint rol görmüyor · 50 karede 19 yanlış alarm" kusurunun
// kök nedeni: YASAK cümlesi VARLIK kanıtı sayılıyordu.
const TAIL_RE = /^(STYLE|LIGHT AND PALETTE|TEXT|NEGATIVE|KARE[- ]ÖZEL)\s*/im;
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
      // OLUMSUZLANMIŞ SAYI İDDİA DEĞİLDİR (2026-08-02, ölçüldü). Altın standart Üreme'nin
      // K48/K50'sinde şu cümle var: "**no two letters** are made of the same substance" —
      // bu bir harf SAYIMI değil, bir tasarım kuralı. Linter onu "ÇEŞİTLİLİK iki harf" iddiası
      // sanıp KIRMIZI basıyordu: ten/ışık sınıfında temiz işin STYLE dışındaki TEK kırmızısı buydu ve
      // sahteydi. `nearSkin`/`hasHuman` derslerinin üçüncü tekrarı — kelimenin VARLIĞI değil
      // NE YAPTIĞI ölçülür.
      const once = seg.slice(Math.max(0, m.index - 14), m.index);
      if (/\b(no|not|neither|nor)\s+$/i.test(once)) continue;
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
// 🔴 2026-08-03: `K35–K38 @mutfak` gibi BLOK ÖZET satırları kare başlığı sanılıyordu ve
// dosya başına 24 HAYALET kare üretiyordu — bütün slotları boş çıkan, hiç var olmamış kareler.
// Sonuç: yeşil bir dosya 28 kırmızıyla kapıyı kilitliyordu. Kusur dosyada değil ölçümdedir.
// Ayırt edici: gerçek kare başlığı TEK numara taşır; özet satırı bir ARALIK yazar (K35–K38,
// K35-K38, K35 – K38). Aralık deseni başlık sayılmaz.
const ARALIK_RE = /^(?:#{1,6}\s*)?(?:K|KARE|Kare)\s*\d{1,3}\s*[-–—]\s*(?:K|KARE|Kare)?\s*\d{1,3}\b/;
const HEAD_RE_RAW = /^(?:#{1,6}\s*)?(?:K|KARE|Kare|SAHNE|Sahne|SHOT|Shot)\s*[-–—]?\s*\d{1,3}(?!\()\b/;
const HEAD_RE = { test: (s) => HEAD_RE_RAW.test(s) && !ARALIK_RE.test(s) };
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
  //    yalnız 11 ayrı blok vardı. Satırın varlığı değil, farklı olması ölçülür.
  // 🔴 2026-08-03: kare-özel yasak AYRI BİR SLOTTA da yazılabiliyor (`KARE-ÖZEL YASAK:`) ve
  //    lint onu görmüyordu → global kuyruğu paylaşan 14 kare "%7 kare-özel" diye kırmızı yandı,
  //    oysa her karenin kendi yasağı vardı, sadece başka satırdaydı. Ölçülen şey satırın ADI
  //    değil, o karenin kendi bozulma yolunun kapatılıp kapatılmadığıdır.
  const negs = frames.map((f) => {
    const m = f.body.match(NEGATIVE_BLOCK_RE);
    const ozel = f.body.match(/^KARE[- ]ÖZEL(?:\s+YASAK)?\s*:([\s\S]*?)(?=\n[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ ]{2,}:|$)/im);
    const parca = [m ? m[1] : '', ozel ? ozel[1] : ''].filter(Boolean).join(' ').trim();
    return parca ? parca.replace(/\s+/g, ' ') : null;
  });
  const withNeg = negs.filter(Boolean);
  const negOzel = withNeg.length ? new Set(withNeg).size / withNeg.length : 0;

  // 3) STYLE bloğu kaç farklı sürümde? (Kütle: ilk 8 kare 81-91 kelime, kalan 27'si 23-30 →
  //    aynı filmde iki lehçe. Tek dosyada bile bölünme oluyor.)
  const styles = frames.map((f) => styleBlock(f.body) ?? '').filter(Boolean);
  const styleWordCounts = styles.map((s) => s.split(/\s+/).length);
  const styleVariants = new Set(styles.map((s) => s.replace(/\s+/g, ' '))).size;

  // 3b) STYLE TEKRARI — `styleVariants` bir SAYIYDI ve hiçbir kural onu okumuyordu. Sayı tek
  //     başına hüküm veremez (49 sürüm / 50 kare ile 46 / 54 aynı sağlıkta değil); hüküm veren
  //     şey AYNI bloğun kaç karede tekrar ettiğidir. Kare kare bilinmesi gerekir, çünkü kırmızı
  //     dosyaya değil KAREYE yazılır — 54/54 ile 3/45 aynı rapor satırı olamaz.
  const styleSayim = new Map();
  for (const s of styles.map((x) => x.replace(/\s+/g, ' ').trim())) {
    if (s) styleSayim.set(s, (styleSayim.get(s) ?? 0) + 1);
  }
  const styleTekrar = new Map([...styleSayim].filter(([, n]) => n >= STYLE_TEKRAR_MIN));
  const styleMaxRepeat = styleSayim.size ? Math.max(...styleSayim.values()) : 0;
  const styleTekrarKare = [...styleTekrar.values()].reduce((a, b) => a + b, 0);

  return {
    frames: frames.length,
    kareOzelOran,
    negOzel,
    negVar: withNeg.length,
    styleVariants,
    styleMin: styleWordCounts.length ? Math.min(...styleWordCounts) : 0,
    styleMax: styleWordCounts.length ? Math.max(...styleWordCounts) : 0,
    styleTekrar,          // Map<normalize edilmiş STYLE, kaç karede>
    styleMaxRepeat,       // en çok tekrar eden STYLE kaç karede
    styleTekrarKare,      // eşiği aşan bloklara ait toplam kare sayısı
    styleTekrarEsik: STYLE_TEKRAR_MIN,
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
    // 2026-08-05 · TÜR SÖZLEŞMESİ BAĞLANDI (scripts/prompt-turu.mjs, PROMPT-YASASI §0.4).
    // Ölçülen kusur: bu dal TEK kontrol yapıp dönüyordu, yani bir edit'e dünya kuyruğu ya da
    // kamera kararı sızsa linter HİÇ görmüyordu. Sızdı: @efe edit'i 709 karakterlik STYLE +
    // LIGHT AND PALETTE + 191 kelimelik global NEGATIVE taşıyor.
    // Sözleşme burada YAZILMAZ, İTHAL EDİLİR — ikinci kopya iki gerçek üretir.
    for (const k of lintTur(body, { tur: TURLER.EDIT }).kirmizi) {
      problems.push({ kind: 'tur', key: k.key, level: 'kirmizi', msg: k.msg, why: 'PROMPT-YASASI §0.4 — referans-edit yalnız DELTA taşır.' });
    }
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
    if (t.hit(fb)) problems.push({ kind: 'trap', key: t.key, level: t.level || 'kirmizi', msg: `tuzak: ${t.key}`, why: `→ ${t.fix}` });
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
      // SARI, kırmızı DEĞİL (2026-08-02). Bkz. STYLE_MAX_WORDS yorumu: uzunluk revizeyle ters
      // korelasyon veriyor — altın standart 86-152 kelime yazıp ten/ışık sınıfında sıfır revize aldı, 90 kelimede donan
      // iş 30 revize aldı. Uzunluk bir bakılacak yerdir, kanıtlı eksik değildir.
      problems.push({ kind: 'style', key: 'style-uzun', level: 'sari',
        msg: `STYLE ${w} kelime (hedef ≤${STYLE_MAX_WORDS})`,
        why: 'DOĞRULANMAMIŞ metrik: altın standart 86-152 kelimeyle ten/ışık sınıfında sıfır revize aldı (toplamda 31 revize bloğu — süreklilik sınıfı). Uzunluk tek başına '
          + 'kusur değil — uzunluğun İÇİ boilerplate ise kusur. Ajan gözle baksın; hüküm `style-tekrar`da.' });
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

  const metrics = corpusMetrics(blocks);

  // STYLE TEKRARI — korpus ölçümü, ama hüküm KAREYE yazılır. Tek "(DOSYA GENELİ)" satırı
  // 54/54 ile 3/45'i aynı gösterirdi; sayı burada bilginin kendisidir.
  // Bu blok kirmizi/sari ayrımından ÖNCE koşmak ZORUNDA: sonra koşarsa yalnız sarı listesinde
  // duran bir kare kırmızı problem alır ama kırmızı listesine hiç girmez — sessizce kaybolur.
  if (metrics && !STYLE_TEKRAR_KAPALI && metrics.styleTekrar.size) {
    blocks.forEach((b, i) => {
      if (rows[i].kind !== 'frame') return;
      const s = (styleBlock(b.body) ?? '').replace(/\s+/g, ' ').trim();
      const n = s ? metrics.styleTekrar.get(s) : undefined;
      if (!n) return;
      rows[i].problems.push({
        // ⚠ 2026-08-03: bu kural bir kez SARI'ya indirilmek istendi ("kuyruk yapıştırılıyorsa
        // STYLE aynı olur") ve `prompt-lint.test.mjs` A5 duvarı bunu ÇÜRÜTTÜ — haklı olarak.
        // Ölçüm: Birlikte Daha Güçlüyüz 54/54 karede birebir aynı STYLE taşıyordu ve **30/54
        // revize** aldı; Eşeyli 49/50 FARKLI STYLE ile ten/ışık sınıfında sıfır revize. Yani aynılık gerçekten
        // kötü sonuçla ilişkili. Çelişki sanılan şey uygulama hatasıydı:
        //   DÜNYA OMURGASI birebir yapıştırılır + MALZEME o karenin maddesiyle STYLE satırına
        //   EKLENİR → satırlar zaten farklı çıkar ve kural sağlanır.
        // Malzemeyi gövdeye koyup STYLE'ı çıplak bırakmak bu kuralı ihlal eder ve etmelidir.
        // Ayrıntı: agents/AJAN-BRIEF.md §A5.
        // 2026-08-05 · SARI. Arkasındaki korelasyon GERÇEK (donmuş STYLE ↔ 30/54 revize) ama kural
        // bir VEKİL: asıl istenen "kuyruk yapıştırma"ydı ve o T2'de kalktı — `dunya-kilidi.mjs`
        // artık kart basıyor. Ölçüm kalır, YASAK kalkar: kalıp yoğunluğu bir gözlemdir.
        kind: 'korpus', key: 'style-tekrar', level: 'sari',
        msg: `STYLE bloğu ${n} karede BİREBİR aynı (eşik ${STYLE_TEKRAR_MIN}+) — `
          + `omurga aynı kalır ama MALZEME cümlesi STYLE satırına kareye özel eklenmeli`,
        why: STYLE_TEKRAR_NEDEN,
      });
    });
  }

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
    // 2026-08-05 · KOD HATASI ONARILDI: yorum ve `level` alanı 'sari' diyordu ama satır
    // `kirmizi.push` ile gidiyordu → `bad` sayısına giriyor, gate.sh:252 commit'i bloke
    // ediyordu. Kural kendi belgelediği seviyede değildi; artık sarıda.
    sari.push({ head: '(DOSYA GENELİ)', kind: 'korpus', problems: [{
      // 2026-08-05 · SARI: benzersizlik ORANI ölçüyor, yani aynılığı. Kare-özel negatif artık
      // varsayılan (T2); bu satır bir gözlem olarak kalır, üretimi engellemez.
      kind: 'korpus', key: 'neg-ozel', level: 'sari',
      msg: `NEGATIVE ${metrics.negVar} karede var ama yalnız %${Math.round(metrics.negOzel * 100)}'i kare-özel`,
      why: 'Bileşke\'nin 52/52 karesinde NEGATIVE vardı, kare-özel 11/52 → K34/K38 ok ucu, K19/K21 yüze düşen ışık. Global kuyruk tek başına yetmiyor.' }] });
  }

  // `bad` geriye dönük uyumluluk için KIRMIZI'yı taşır (kapanis-hasadi.mjs bunu sayıyor).
  return { path, register, total: blocks.length, rows, bad: kirmizi, sari, counts, metrics, olculmeyen: OLCULMEYEN };
}

/**
 * REFERANS DOSYASI ÖLÇENİ (2026-08-05).
 *
 * Ölçülen kusur: `--all` taraması `_REFERANSLAR` ve `_REFERANS-PROMPTLARI` dosyalarını
 * BİLEREK atlıyordu (satır 1300 civarı) ve referans blokları `blockKind !== 'frame'`
 * olduğu için kuyruk tekrarını denetleyen iki kurala da görünmüyordu. Sonuç: referans
 * bloklarında %55-63 birebir yapıştırma tam da ölçülmeyen yerde birikti.
 *
 * Bu ölçen sahne slotlarını UYGULAMAZ — bir plaka lens/canlı üçlü/derinlik taşımak zorunda
 * değildir. Yalnız tür sözleşmesini ölçer.
 */
export function lintReferansFile(path) {
  const text = readFileSync(path, 'utf8');
  const bloklar = parseReferansBloklari(text);
  const satirlar = [];
  for (const b of bloklar) {
    const { tur, kirmizi, sari } = lintTur(b.tam, { dosyaRolu: 'referans' });
    satirlar.push({ handle: b.handle, satir: b.satir, tur, kirmizi, sari: sari ?? [] });
  }
  return {
    path,
    total: bloklar.length,
    bloklar: satirlar,
    bad: satirlar.filter((r) => r.kirmizi.length),
    warn: satirlar.filter((r) => !r.kirmizi.length && r.sari.length),
  };
}

export {
  SLOTS, TRAPS, parseBlocks, lintBlock, blockKind, corpusMetrics, styleBlock, OLCULMEYEN,
  STYLE_MAX_WORDS, STYLE_TEKRAR_MIN,
};

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
      + `STYLE ${r.metrics.styleVariants} sürüm (${r.metrics.styleMin}-${r.metrics.styleMax} kelime) · `
      + `en çok tekrar ${r.metrics.styleMaxRepeat} kare`);
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
        // Teslim setinin prompt OLMAYAN parçaları. Bu liste ad-tabanlıdır ve olması gereken
        // budur: burada ad bir TAHMİN değil, teslim biçiminin kendi sözleşmesidir
        // (PROMPT-YASASI §5 slot adları). Yerleşim tahmini yapan seçici kör olur — o ayrı şey.
        //
        // KALAN-URETIM / YAPILACAK-REVIZE / revize: üretim çeteleleri. İçlerinde prompt
        // ALINTISI geçtiği için içerik tarayıcısı bunları kare dosyası sanıyordu; 2026-08-03'te
        // "Farklı Kültürler" Biten/ altına taşınınca kapı bir NOT satırını ("K44 — TEMİZ.
        // İstenen düzeltme oldu…") kare sanıp yedi slotu birden eksik buldu ve commit'i bloke
        // etti. Çete dosyası kare basmaz; ölçülmesi yanlış alarmdır.
        if (/_(MOTION|EDIT-PLAN|SESLENDIRME|SUNO|REFERANSLAR|KALAN-URETIM|YAPILACAK-REVIZE|revize)\b/i.test(e.name)) continue;
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
