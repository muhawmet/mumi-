#!/usr/bin/env node
// MAMILAS MOTION LİNTERİ — klip promptunun ölçeni.
//
// NEDEN VAR (2026-07-31): `prompt-lint.mjs` START FRAME'i ölçüyor ve bugün `gate.sh`'a duvar
// olarak bağlandı. **Motion'ın hiçbir ölçeni yoktu.** Aynı linter bir motion dosyasına
// uygulanınca 8 yanlış kırmızı veriyor (lens, ten kilidi, STYLE, TEXT arıyor — motion'da
// bunların hiçbiri yok; zaten `fileKind()` o dosyayı tanıyıp erken çıkıyor). Bugün Claude
// motion'ı grep ile ölçmeye çalıştı ve **üç kez yanlış alarm** verdi:
//   · `writes` aradı → "Nobody **writes**, traces or forms a letter" KİLİDİNİ kusur saydı
//   · yay cümlesi aradı → "comes out looking… and **ends** seeing" desenini kaçırdı
//   · `a second` aradı → "without a **second** hand" (Efe 50) saat cümlesi sanıldı
// Ölçülmeyen ders buharlaşıyor; grep'le ölçülen ders yalan söylüyor. Bu araç ikisini de kapatır.
//
// ---------------------------------------------------------------------------
// KALİBRASYON — iki gerçek korpusla, 2026-07-31'de diskten ölçüldü. Tahmin YOK.
//   EFE   57 dosya · `6. Sınıf - Sorunları Birlikte Çözüyoruz/MOTION/`   (temiz olmalı)
//   ALTIN 50 dosya · `Biten/6. Sınıf - Eşeyli ve Eşeysiz Üreme/MOTION/`  (kanıtlı iyi)
//
// 🔴 ÖLÇÜMÜN İLK BULGUSU — brief'in üç kırmızısı ALTIN STANDARDI kırmızıya boğuyordu.
// Yasa (§3) sayıları kelimenin KENDİSİNİ sayarak yazılmış; linter İŞİ ölçmek zorunda:
//
//   | brief'in istediği kırmızı | ham ölçüm (altın) | ne yapıldı |
//   |---|---|---|
//   | `Camera:` cümlesi yok      | **22/50** kırmızı | AİLE'ye çevrildi: `Camera:` · `The camera …` · `Camera pulls back` → **1/50**. Altın 02-10 kamerayı "The camera begins…" diye yazıyor; yasa 28/50 derken *sözcüğü* saymış, *işi* değil. |
//   | kuyruk birebir değil       | **14/50** kırmızı | ÇEKİRDEK kırmızı (`Silent clip, no audio, no dialogue` + whip-pan cümlesi = 50/50 ve 57/57), ağız/dudak kaydı SARI. |
//   | kelime <180 / >225         | **16/50** kırmızı | 180-225 SARI'ya indi, kırmızı 160-250'ye açıldı. Altın bandı 166-243 ve o iş TUTTU. |
//   | kamera cümlesi son yarıda  | **24/50** ilk yarıda | SARI. Altın bilerek kamerayla AÇILIYOR (kreyn açılışları). |
//
// Kırmızı bırakılan sekiz kuralın iki korpustaki toplam ateşi: EFE 0/57 · ALTIN 1/50.
// O tek dosya `Eşeyli/MOTION/01.txt` ve **gerçekten** iki kuralı birden çiğniyor:
// "…and **half a second later** he follows her…" (yasa §3'ün "1/50" ölçümünün ta kendisi) ve
// kamerayı ilk cümlenin içine kaynatmış ("…and the camera cranes down…" — kendi cümlesi yok).
// `prompt-lint.test.mjs`'in altın standardı 14 kırmızı ile çivilemesi gibi, burada da
// **ölçülen sayı çivilenir, sıfır değil.** Sıfıra zorlamak, kanıtı silmek olurdu.
// ---------------------------------------------------------------------------
//
// ÜÇ KAT — prompt-lint ile aynı sözleşme:
//   KIRMIZI  kanıtlı eksik. İki korpusta ateşi ölçüldü; sahte alarm vermiyor.
//   SARI     kusur İDDİASI DEĞİL — ajanın tek geçişte bakacağı yer. Kırılgan desenler burada.
//   KAPSAM   ölçülmeyenlerin açık listesi. "Yeşil" tek başına "temiz" demek değildir.
//
//   node scripts/motion-lint.mjs <dosya|klasör>          # klasörse içindeki tüm *.txt
//   node scripts/motion-lint.mjs <hedef> --strict        # kırmızı varsa exit 1 (kapı için)
//   node scripts/motion-lint.mjs <hedef> --kisa          # kapsam satırını basma
//
// `lintMotionFile` dışa açıktır — ikinci kopya ölçüm yazılmaz (prompt-lint'in `lintFile` deseni).

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

// ---------------------------------------------------------------------------
// PARSER — iki biçim de okunur.
//   (a) tek klip dosyası  `MOTION/01.txt`      → tek blok
//   (b) birleştirilmiş     `*_MOTION.txt`      → `### K<n>` başlıklarıyla ayrılmış N blok
// Prompt METNİ `-----` ayraçları arasındadır; ayraç yoksa KAMERA NİYETİ satırından DURUM'a kadar.
// BOM ve CRLF burada temizlenir — Windows birincil ortam, ham okuma dört kez sessiz no-op üretti.
// ---------------------------------------------------------------------------
// Blok başlığı. Teslim sözleşmesi (`PROMPT-YASASI §5`): `### K<n> | <süre> · VO "<cümle>"`.
// ⚠ 2026-08-05'te ölçüldü: `#` işareti İSTEĞE BAĞLI yazılmıştı ve bu, dosya sonundaki not
// bölümündeki DÜZ CÜMLEYİ başlık sanıyordu — `K5 (uzanan kol yok ama kitap yazısı kilidi),
// K7 (kol ve açık el) — üçünde de` (S1-KANON:125). O sahte başlık bir hayalet klip doğurdu:
// 3 kelimelik, kamerasız, kuyruksuz → dosya KIRMIZI. Yani ölçen, olmayan bir klibi ölçüp
// gerçek işi bloke ediyordu. Kusur metinde değil ÖLÇENDEYDİ.
// `#`'siz biçim korunuyor (eski dosyalar `K01` diye açıyor) ama artık BAŞLIK GİBİ durmalı:
// numaradan sonra satır biter ya da `|` · `·` · `:` gelir. Düz cümle `K5 (` ile devam eder.
// ⚠ İKİNCİ DARALTMA (Codex Sol, NARROW hükmü): ilk onarım yalnız `#`'siz düz cümleyi
// eledi, ama `# K52'de kamera sabitti` gibi YORUM satırları hâlâ başlık sayılıyordu —
// `#` vardı, numaradan sonrası serbestti. Gerçek başlık numaradan sonra `|` · `·` · `:`
// taşır ya da orada biter (`K01`). Yorum ise kelimeyle devam eder.
const HEAD_RE = /^#{0,6}\s*K\s*\d{1,3}\s*(?:[|·:]|$)/;

export function parseMotionBlocks(text) {
  const src = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const lines = src.split('\n');
  const heads = [];
  lines.forEach((l, i) => { if (HEAD_RE.test(l.trim())) heads.push(i); });

  // Başlıksız tek klip dosyası da okunabilmeli: tüm metin tek blok sayılır.
  const spans = heads.length
    ? heads.map((s, i) => [s, i + 1 < heads.length ? heads[i + 1] : lines.length])
    : [[-1, lines.length]];

  return spans.map(([s, e]) => {
    const head = s >= 0 ? lines[s].trim().replace(/^#+\s*/, '').slice(0, 90) : '(başlıksız)';
    const raw = lines.slice(s + 1, e).join('\n');
    const parts = raw.split(/^-{3,}[ \t]*$/m);
    let para;
    if (parts.length >= 2) {
      // İlk ayraçtan sonraki ilk DOLU parça prompt metnidir.
      para = parts.slice(1).map((p) => p.trim()).find((p) => p.length > 40) ?? '';
    } else {
      para = raw.replace(/^KAMERA NİYETİ:.*$/im, '')
        .replace(/^(DURUM|REVİZE|REVIZE):[\s\S]*$/im, '').trim();
    }
    // Prompt tek paragraftır; kazara kalan DURUM/REVİZE kuyruğu ölçüme girmez.
    para = para.replace(/^(DURUM|REVİZE|REVIZE):[\s\S]*$/im, '').trim();
    return {
      head,
      para,
      niyet: (raw.match(/^KAMERA NİYETİ:.*$/im) ?? [''])[0],
      // T5 — blok DURUMU. `YENİDEN-BASIM` (üretim tarafının zaten kullandığı işaret) ya da
      // `MOTION INTENT` taşıyan blok bir TESLİM DEĞİLDİR: kare henüz doğmamıştır, yazılan
      // şey niyettir ve motora gitmez.
      intent: /YENİDEN[- ]?BASIM|MOTION\s+INTENT/i.test(raw),
      // Kare kimliği: `frame: images/12.png · sha256:abc123…`
      frame: raw.match(/^\s*frame:\s*(\S+)[^\S\n]*(?:·|\|)?[^\S\n]*sha256:\s*([0-9a-f]{6,})/im),
    };
  }).filter((b) => b.para.length > 40);
}

const kelimeSayisi = (p) => p.split(/\s+/).filter(Boolean).length;

// Cümlelere böl — `Camera:` iki nokta taşıdığı için nokta/noktalı virgül tabanlı bölme kullanılır.
const cumleler = (p) => p.split(/(?<=[.;])\s+/).map((s) => s.trim()).filter(Boolean);

/**
 * Kamera KENDİ CÜMLESİ olarak yazılmış mı, ve nerede başlıyor?
 * AİLE — üçü de altın standartta kanıtlı ve üçü de aynı işi görüyor:
 *   "Camera: a low dolly runs with him…"        (Efe 57/57, altın 28/50)
 *   "The camera begins favouring the sparrow…"  (altın 05 — yasa bunu saymamıştı)
 *   "Camera pulls back and arcs gently…"        (altın 49)
 * Cümle İÇİNE kaynatılmış kamera ("…and the camera cranes down…", altın 01) SAYILMAZ —
 * yasanın "kamera paragrafın başına kaynatılınca gövde donuyor" hükmü tam olarak budur.
 */
export function kameraCumlesi(para) {
  const ss = cumleler(para);
  let idx = -1, off = 0, found = null;
  let acc = 0;
  for (const s of ss) {
    const i = para.indexOf(s, acc);
    acc = (i === -1 ? acc : i) + s.length;
    if (/^(Camera:|The camera\b|Camera\s+[a-z]+)/.test(s)) { idx = ss.indexOf(s); off = i; found = s; }
  }
  if (!found) return null;
  return { cumle: found, oran: para.length ? off / para.length : 0, sira: idx };
}

// ---------------------------------------------------------------------------
// KIRMIZI KURALLAR — her biri iki korpusta ölçüldü. Yanına yazılan sayı ateş sayısıdır.
// ---------------------------------------------------------------------------

// Saat cümlesi. DAR tutuldu ve dar olması ÖLÇÜLDÜ: geniş hali (`a second`) Efe 50'deki
// "holding it without a **second** hand" cümlesini saat sandı — bugünün üçüncü yanlış alarmı.
// Aranan şey SANİYE + SIRA'dır; "a moment later" (altın 24) saniye yazmaz, o SARI bile değil.
const SAAT_RE = /\bhalf a (second|beat)\b|\b(a|one|two|three|four|five|\d+)\s+seconds?\s+(later|after)\b|\bafter (half )?a second\b|\bwithin (half )?a second\b|\bfor (half )?a second\b/i;

// Sabit kuyruğun İKİ ÇEKİRDEĞİ. İkisi de iki korpusta 107/107 — yani gerçekten sabit.
const KUYRUK_SES = /Silent clip,\s*no audio,\s*no dialogue/i;
const KUYRUK_KAMERA = /No whip-pan,\s*no shake,\s*no snap-zoom,\s*no camera warp\s*\./i;

/**
 * Kamera kilidi KOŞULLUDUR (2026-08-03). Yalnız iki sınıfta zorunlu:
 *  · ekranda okunan HARF var — taşıyıcı ya da kamera oynayınca harf eriyor (ölçüldü)
 *  · KATI/MEKANİK gövde kadrajda — mikroskop, vida, dişli, cam lam: hızlı kamera = warp
 * Organik, yazısız, insansız karede kilit yoktur; orada kamera akıp geçebilir.
 */
const YAZI_IZI = /\b(letters?|lettering|word|words|spell|re-spell|respell|printed|stamped|engraved|typeface|glif|caption)\b/i;
// ⚠ "rigid solid" BURAYA GİRMEZ: o bir kilit cümlesidir, nesne işareti değil — bir tuğla ya da
// bir soğan için de yazılıyor. Aranan şey OPTİK/MEKANİK aygıt: warp riski oradan doğuyor.
const KATI_IZI = /\b(instrument|microscope|eyepiece|objective (collar|ring)|turret|nosepiece|focus (wheel|knob)|knob|screw|gear|cog|glass slide|slide glass|cover glass)\b/i;
const kameraKilidiGerekli = (p) => YAZI_IZI.test(p) || KATI_IZI.test(p);
// Ağız/dudak kaydı AİLEDİR ve kırmızı DEĞİL: altın 7 dosyada hiç yazmamış, Efe 19 bilerek
// "no lip movement, jaw held" yazmış (karede ağız açık; "mouth closed" yazmak §3ø morph riski).
const KUYRUK_AGIZ = /(mouths? closed|no lip movement|lips? stay|never (move to speak|form a word)|no speech shapes|jaw held)/i;
const KUYRUK_KANON = 'Silent clip, no audio, no dialogue, mouth closed, no lip movement.';

// Kelime bandı. Hedef 190-215 (altın ortalaması 202, Efe 203-215 aralığında duruyor).
// KIRMIZI duvarı bilerek DIŞARIDA: altın standardın kendi bandı 166-243 ve o iş tuttu.
// 160/250 = "bugüne kadar kanıtlı iyi çıkmış hiçbir dosyanın olmadığı yer".
const KELIME_KIRMIZI_ALT = 160, KELIME_KIRMIZI_UST = 250;
const KELIME_SARI_ALT = 180, KELIME_SARI_UST = 225;

// Metronom. `At first` ile AÇILIP `By the end` ile kapanan iskelet — Mira'da 52/54, altında 18/50
// (ama altında hiçbiri ikisini BİRDEN kullanmıyor: 0/50). Donmuş takvim burada başlıyor.
const AT_FIRST_ACILIS = /^(At first|At the start|At the top of the clip)\b/i;
const BY_THE_END = /\bBy the end\b/i;

// Yazma fiilleri (§3ø: "hiçbir kalemle yazı işini beceremiyor Kling 3.0").
// ⚠ `writing` BİLEREK YOK ve bu ölçüldü: ilk sürümde eklenmişti ve üç sahte kırmızı verdi —
// "a week of **writing**" (Efe 18), "the misted **writing** never rotates" (altın 07),
// "the hand**writing** never skews" (altın 47). Üçü de İSİM, üçü de zaten DURAN yazıyı
// kilitleyen cümle. Aranan şey harf ÜRETEN fiildir; ismin varlığı hiçbir şey kanıtlamaz.
const YAZMA_RE = /\b(writes|traces|tracing|signs his|signs her)\b|\bthe tip moves\b|\bletters? forms?\b/gi;
// ⚠ YASAK CÜMLESİNİN KENDİSİ TEMİZDİR. Bugün grep tam burada yanlış alarm verdi:
// Efe 33 "Nobody **writes**, traces or forms a letter" yazıyor — bu KİLİDİN TA KENDİSİ.
const YAZMA_OLUMSUZ = /\b(nobody|no one|no hand|nothing|never|not|no pencil|no pen|no chalk|no brush|no finger)\b/i;

// Donmuş gövde yığını (§3a: 34 klibin 26'sında "donuk iskelet üzerinde eriyen yüz ve eller").
const DONMUS = ['stays exactly', 'does not move', 'keeps the same'];

const KIRMIZI_KURALLAR = [
  {
    key: 'saat',
    hit: (p) => SAAT_RE.test(p),
    msg: (p) => `saat cümlesi: "${(p.match(SAAT_RE) ?? [''])[0]}"`,
    why: 'Motor saniyeyi TAKVİM sanıp SNAP atıyor. Ölçüm: altın 1/50, reddedilen set 16/54; '
      + 'sıçramalar 1.6s-3.5s arasında kümeleniyor. Yerine sebep bağlacı: "Then… — at that instant…", '
      + '"when he arrives there", "Finally". Hiçbir yere saniye yazılmaz.',
  },
  {
    key: 'kamera-yok',
    hit: (p) => !kameraCumlesi(p),
    msg: () => 'kamera KENDİ CÜMLESİ olarak yok',
    why: 'Ölçüm: altın 49/50 kameraya ayrı cümle veriyor ("Camera:" · "The camera begins…" · '
      + '"Camera pulls back…"), reddedilen set 0/54. Kamera gövde cümlesinin içine kaynatılınca '
      + 'gövde donuyor. Kamera bir oyuncudur: nereden başlar, neyi sıyırır, nerede tam durur.',
  },
  {
    key: 'kuyruk',
    // 🔴 2026-08-03'te DARALDI. Eskiden kamera kilidi 53/53 klipte zorunluydu; iki bitmiş film
    // baştan sona ölçüldü ve bedeli çıktı: kilit her klibi DURDURARAK bitiriyor, yani film klip
    // sayısı kadar kez duruyor — Mami'nin "kurgu çok basic" hükmünün kök nedeni bu.
    // Kilit yazıyı ve katı gövdeyi gerçekten kurtarıyor (21/21 Türkçe yazı kusursuz çıktı),
    // ama o kareler ~12 tane; kalan 41'de bedava değil, filmin akışına mal oluyor.
    // Sessizlik yarısı HER klipte kalır — o EDU iş akışı yasasıdır, kamera tercihi değil.
    hit: (p) => !KUYRUK_SES.test(p) || (kameraKilidiGerekli(p) && !KUYRUK_KAMERA.test(p)),
    msg: (p) => 'sabit kuyruk bozuk — '
      + [!KUYRUK_SES.test(p) && '"Silent clip, no audio, no dialogue" yok',
         kameraKilidiGerekli(p) && !KUYRUK_KAMERA.test(p)
           && 'bu klip ekranda YAZI ya da KATI/MEKANİK gövde taşıyor, "No whip-pan, no shake, '
              + 'no snap-zoom, no camera warp." zorunlu']
        .filter(Boolean).join(' · '),
    why: 'Sessizlik iki korpusun 107/107 dosyasında var ve EDU iş akışı yasasıdır (VO ayrı '
      + 'ElevenLabs katmanı). Kamera kilidi ise KOŞULLU: yalnız harf ya da katı/mekanik gövde '
      + 'taşıyan karede warp duvarıdır; yazısız organik karede kamera kesimin içinden akıp '
      + 'geçebilir ve klip hareket hâlinde bitebilir.',
  },
  {
    key: 'metronom',
    hit: (p) => AT_FIRST_ACILIS.test(p) && BY_THE_END.test(p),
    msg: () => '"At first" açılışı + "By the end" kapanışı — donmuş iskelet',
    why: 'Aynı metronom 54 kez = tarif değil TAKVİM. Ölçüm: reddedilen sette "At first" iskeleti '
      + '52/54; altın standartta ikisi BİRDEN 0/50. Yay yazılır, şablon değil.',
  },
  {
    key: 'yazma-fiili',
    hit: (p) => yazmaHitleri(p).length > 0,
    msg: (p) => `yazma fiili: ${yazmaHitleri(p).map((h) => `"${h}"`).join(', ')}`,
    why: '§3ø — Kling 3.0 hiçbir kalemle yazı işini beceremiyor. Karede yazan el varsa motion\'da '
      + 'o el DURUR: kalem kâğıda değmiş kalır ya da bırakılmıştır. (Yasak cümlesinin kendisi — '
      + '"Nobody writes", "no hand traces" — temiz sayılır; bugün grep tam burada yanıldı.)',
  },
  {
    key: 'donmus-govde',
    hit: (p) => DONMUS.filter((d) => new RegExp(d, 'i').test(p)).length >= 3,
    msg: (p) => `donmuş gövde yığını: ${DONMUS.filter((d) => new RegExp(d, 'i').test(p)).map((d) => `"${d}"`).join(' + ')}`,
    why: '§3a, kliple ölçüldü: 34 klibin 26\'sında (%76) "donuk iskelet üzerinde eriyen yüz ve eller". '
      + 'Motora yapması yasaklanınca yapabildiği tek şeyi yapıyor. Gövde TEK SÜREKLİ DOĞAL JEST yapar.',
  },
];

function yazmaHitleri(para) {
  const out = [];
  let m;
  YAZMA_RE.lastIndex = 0;
  while ((m = YAZMA_RE.exec(para))) {
    // Aynı cümle içinde geriye bak — olumsuzlama varsa bu KİLİTTİR, kusur değil.
    const bas = Math.max(0, para.lastIndexOf('.', m.index) + 1);
    const onceki = para.slice(bas, m.index);
    if (YAZMA_OLUMSUZ.test(onceki)) continue;
    // "…, traces or forms a letter" — olumsuzlama ilk fiile bağlı, virgülle ayrılmış kardeşleri
    // de kapsar. `Nobody writes, traces…` cümlesinde `traces` de temizdir.
    out.push(m[0]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// SARI KURALLAR — kusur iddiası DEĞİL. Kırılgan desenler burada yaşar; ateş oranı ölçülüp
// mesaja YAZILDI, çünkü hata payını söylemeyen sarı sessiz bir kırmızıdır.
// ---------------------------------------------------------------------------

// Adı konulmuş yay (§3 madde 3): "he begins comparing and ends having decided".
// AİLE geniş tutuldu ve yine de kırılgan: altın standartta 14/50 ateşliyor, Efe'de 0/57.
// Bu yüzden KIRMIZI DEĞİL — desenin kendisi bugün üç kez yanıldı.
const YAY_BASLA = '(begins?|began|opens?|opened|starts?|started|arrives?|comes? (in|out|forward)|hangs?|holds?|is one step)';
const YAY_BITIS = '(ends?|ended|ending|finishes|finishing|no longer|where it began|settles? (into|onto|back|facing)|settling|easing into|has (arrived|decided|found)|works? it out|resolves? into|locks? in|arrived)';
const YAY_RE = new RegExp(`\\b${YAY_BASLA}\\b[\\s\\S]{0,400}?\\b${YAY_BITIS}\\b`, 'i');

// Kilit cümlesi bütçesi (§3 madde 6): TEK cümle, en çok ~45 kelime.
const KILIT_ISARET = /\b(never|nothing|nobody|no one|do NOT|does not|stays|holds its|rigid|frozen|no new|exactly (one|two|three|four))\b/;

// Çiçek tuzağı. ⚠ OLUMSUZLAMA KORUMASI ZORUNLU: altın standart bir ÜREME dersidir ve
// 9/50 dosyada "never becomes a flower, petal or flame" yazıyor — o cümle KİLİDİN kendisi.
// Korumasız hali 9 sahte sarı üretiyordu.
const CICEK_RE = /\b(bloom|blooms|saffron|blossom|blossoms|petal|petals|radiance)\b/gi;
const CICEK_OLUMSUZ = /\b(never|no|not|nothing|nobody)\b/i;

const SARI_KURALLAR = [
  {
    key: 'yay-yok',
    hit: (p) => !YAY_RE.test(p),
    msg: () => 'adı konulmuş yay cümlesi bulunamadı',
    why: 'DESEN KIRILGAN — GÖZLE DOĞRULA. Bugün üç kez yanlış alarm verdi ("comes out looking… and '
      + 'ends seeing", "arrives… and ends as"); altın standardın 14/50 dosyasında da ateşliyor. '
      + 'Aranan şey kelime değil: klip DUYGUSUNU söyleyen cümle var mı — "he works it out", '
      + '"the row begins alert and ends with one of them asleep under her". Yoksa klip mekaniktir.',
  },
  // 🔴 BURADA BİR KURAL YOK VE YOKLUĞU KASITLI — `kamera-erken`.
  // Yasa kamera cümlesini "paragrafın sonuna yakın" ister ve brief konumun ÖLÇÜLMESİNİ istedi.
  // Ölçüldü — ve iki kanıtlı-iyi korpus birbirini yalanlıyor: kamera cümlesi ilk yarıda
  // **Efe 0/57 · altın 25/50**. Altın standart bilerek kamerayla AÇIYOR (kreyn açılışları:
  // "The camera begins favouring the sparrow on the rail and then travels with his look…").
  // Yarısında ateşleyen bir sarı, sarı değil GÜRÜLTÜDÜR; prompt-lint'te `kareOzelOran` tam
  // bu sebeple (iyi seti ters yönde işaretlemesi) kırmızıdan düşürülmüştü. Konum ÖLÇÜLÜR ve
  // kapsam satırında BASILIR (`kamera son yarıda: N/M`), ama hüküm vermez.
  {
    // 🔴 2026-08-05'te KIRMIZI'DAN DÜŞTÜ. Duvar bir varsayıma dayanıyordu ve varsayım
    // gerçek klip kanıtıyla çürütüldü: Destek'te basılan 6 bozuk klibin eski motion
    // metinleri 208 · 215 · 248 · 215 · 212 · 215 kelimeydi — BEŞİ hedef bandın tam
    // içinde ve altısı da bozuldu. Yani bant kusuru YAKALAMIYOR; kusurun sebebi
    // olduğu ise hiç gösterilmedi. Kök neden ölçüldü ve başka: kareye VO'nun SONUCU
    // çizilmiş, motorun 5 saniyede yapacak işi kalmamış, boşluğu morph'la doldurmuş.
    //
    // Duvar bırakılsaydı bedeli somuttu: 52 prompt, kanıtsız bir sayıya ulaşmak için
    // şişirilecekti — yani tek ölçümden üç değişiklik doğuracaktı. Bu repoda ölçülmüş
    // ana kusur sınıfı tam olarak budur.
    //
    // SARI kalıyor çünkü bant BİLGİ taşıyor: kanıtlı iyi çıkmış hiçbir dosya bu
    // aralığın dışında değil (altın 166-243, Efe 203-215). Yani dışarısı "kanıtsız
    // bölge"dir, "yasak bölge" değil. Kırmızıya ancak canary klip kanıtı çıkarsa döner.
    key: 'kelime-bandi',
    hit: (p) => { const w = kelimeSayisi(p); return w < KELIME_KIRMIZI_ALT || w > KELIME_KIRMIZI_UST; },
    msg: (p) => `paragraf ${kelimeSayisi(p)} kelime — kanıtlı korpusun dışında `
      + `(${KELIME_KIRMIZI_ALT}-${KELIME_KIRMIZI_UST}; hedef 190-215, sınanmamış hipotez)`,
    why: 'Kanıtlı iyi çıkmış hiçbir dosya bu aralığın dışında değil (altın 166-243, Efe 203-215) — '
      + 'ama bandın KUSURA SEBEP olduğu gösterilmedi: 6 bozuk klibin 5\'i bandın içindeydi. '
      + 'Bu yüzden sarı. Kelime sayısını tutturmak için motion ŞİŞİRİLMEZ; ajan yalnız '
      + '"bu klip gerçekten anlatılabilecek her şeyi anlattı mı" diye bir kez bakar.',
  },
  {
    key: 'kilit-uzun',
    hit: (p) => uzunKilitler(p).length > 0,
    msg: (p) => `kilit cümlesi ${uzunKilitler(p).join('/')} kelime (bütçe ~45)`,
    why: 'Reddedilen sette yasak cümleleri paragrafın %35\'iydi; motora izin verilen alan kalmayınca '
      + 'kendi hareketini uyduruyor. Kısa kilit = sakin klip. (Altın 11/50, Efe 8/57 — sınırda çalışan '
      + 'dosyalar var, o yüzden sarı.)',
  },
  {
    key: 'at-first',
    hit: (p) => AT_FIRST_ACILIS.test(p) && !BY_THE_END.test(p),
    msg: () => '"At first" ile açılıyor — metronomun yarısı',
    why: 'Tek başına kusur değil (altın 8/50 böyle açıyor ve o iş tuttu). "By the end" ile birleşirse '
      + 'KIRMIZI olur. Ajan bir sonraki klibin de aynı kelimeyle açmadığını doğrulasın: '
      + 'aynı metronom art arda = takvim.',
  },
  {
    key: 'refleks-kamera',
    hit: (p) => /slow(ly)? push(es|ing)? in|push(es|ing)? in slowly|a slow push-?in/i.test(p),
    msg: () => 'refleks kamera: "slow push in"',
    why: '§3b, Mami: "öyle sıkıcı slowly push in istemiyorum — Disney filmi edasında kamera." '
      + 'Push-in yalnız push-in\'in KENDİSİ o anın olayıysa (anlama, fark etme, itiraf) meşru — '
      + 'o zaman bile hızlanıp yerleşir, sabit sürünmez.',
  },
  {
    key: 'cicek',
    hit: (p) => cicekHitleri(p).length > 0,
    msg: (p) => `çiçek tuzağı: ${cicekHitleri(p).map((h) => `"${h}"`).join(', ')}`,
    why: 'Kavram ışığı IŞIK kalmalı — NB2/Kling "bloom"/"saffron"u taç yaprağına çeviriyor. '
      + '(Olumsuzlanmış hali temiz sayılır: "never becomes a flower, petal or flame" kilidin kendisidir '
      + '— korumasız hali altın standartta 9 sahte sarı üretiyordu.)',
  },
  {
    key: 'kesik-figur',
    hit: (p) => /(cut by the frame|cropped by the frame|a pair of (shoes|legs|feet|hands))/i.test(p),
    msg: (p) => `kadrajdan kesik figür: "${(p.match(/(cut by the frame|cropped by the frame|a pair of (shoes|legs|feet|hands))/i) ?? [''])[0]}"`,
    why: 'Kesilmiş uzuv motorun en sık erittiği yerdir; klip boyunca kadraj kayınca gövdesiz parça '
      + 'yeniden eklemlenmeye çalışıyor. Figür ya kadrajın içindedir ya hiç yoktur.',
  },
  {
    key: 'kuyruk-agiz',
    hit: (p) => KUYRUK_SES.test(p) && !KUYRUK_AGIZ.test(p),
    msg: () => 'kuyrukta ağız/dudak kaydı yok',
    why: 'Kanonik biçim: "' + KUYRUK_KANON + '" Sapma KIRMIZI DEĞİL — altın standart 7/50 dosyada '
      + 'hiç yazmamış, Efe 19 ise bilerek "no lip movement, jaw held" yazmış (karede ağız açık; '
      + '"mouth closed" yazmak çene kapanması = §3ø morph riski). Saptıysan GEREKÇESİ yazılsın.',
  },
];

function uzunKilitler(para) {
  return cumleler(para)
    .filter((s) => KILIT_ISARET.test(s) && !KUYRUK_KAMERA.test(s) && !KUYRUK_SES.test(s))
    .map(kelimeSayisi)
    .filter((w) => w > 45);
}

function cicekHitleri(para) {
  const out = [];
  let m;
  CICEK_RE.lastIndex = 0;
  while ((m = CICEK_RE.exec(para))) {
    const bas = Math.max(0, para.lastIndexOf('.', m.index) + 1);
    if (CICEK_OLUMSUZ.test(para.slice(bas, m.index))) continue;
    out.push(m[0]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// KAPSAM — linterin ölçemedikleri. Bu liste olmadan "yeşil" bir yalandır.
// ---------------------------------------------------------------------------
export const OLCULMEYEN = [
  'klibin gerçekten iyi olup olmayacağı — bu ölçen YAPIYA bakar, klibe değil (klip için: scripts/motion-qc.mjs)',
  'yay cümlesinin ANLAMLI olup olmadığı — deseni bulmak, duygunun adının konduğu anlamına gelmez',
  'kilidin O KARENİN gerçek bozulma yolunu kapatıp kapatmadığı (genel-geçer korku listesi de kilit gibi görünür)',
  'yazı taşıyan nesnenin gerçekten sabit tutulup tutulmadığı (§3ø: taşıyıcı oynayınca harf eriyor — KİTAP 3.6s, GİDA 1.0s)',
  '190-215 kelime bandının doğruluğu — Kling\'in RESMİ kılavuzu 60 altını öneriyor, aradaki fark bu makinede SINANMADI',
  'kamera niyetinin karede fiziksel olarak mümkün olup olmadığı (kare görülmeden bilinemez)',
  '@tag ile kimlik sabitlenmiş mi (yasa 24/50 vs 6/54 ölçtü; tagsız insan = motorun uydurduğu yüz)',
  'kamera cümlesinin KONUMU — ölçülüp basılıyor ama hüküm vermiyor: iki kanıtlı-iyi korpus '
    + 'birbirini yalanlıyor (ilk yarıda Efe 0/57 · altın 25/50, kreyn açılışları)',
];

// ---------------------------------------------------------------------------
// BLOK VE DOSYA LİNTİ
// ---------------------------------------------------------------------------
export function lintMotionBlock(para) {
  const problems = [];
  for (const r of KIRMIZI_KURALLAR) {
    if (r.hit(para)) problems.push({ key: r.key, level: 'kirmizi', msg: r.msg(para), why: r.why });
  }
  for (const r of SARI_KURALLAR) {
    if (r.hit(para)) problems.push({ key: r.key, level: 'sari', msg: r.msg(para), why: r.why });
  }
  return problems;
}

/**
 * T5 — FİNAL MOTION KARE KİMLİĞİ.
 * Final blok `frame: <yol> · sha256:<hex>` taşımalı; taşıyorsa yol diskte VAR olmalı ve
 * sha gerçekten o dosyanın olmalı. Yani "kareyi gördüm" bir cümle değil, bir MAKBUZ.
 * Kare değişirse (revize basıldı) sha tutmaz ve blok doğal olarak bayatlar.
 */
export function frameProblemi(b, path) {
  if (!b.frame) {
    // ⚠ NEDEN SARI, NEDEN KIRMIZI DEĞİL (2026-08-05 kararı, gerekçesi burada kalsın):
    // Kural KIRMIZI yazılsaydı aktif projenin 48 bloğu aynı anda kırmızıya döner ve her
    // commit kilitlenirdi — yani ölçen, ölçtüğü işi durdururdu. Damgalamak da tek başıma
    // verebileceğim bir karar değil: `S7-REVIZE-KARELER` dosyasının kareleri revize mi
    // yoksa eski mi, bunu üretim tarafı bilir. Tahmin edilen bir imza, imzasızlıktan
    // KÖTÜDÜR — yalan söyleyen bir makbuz olur.
    //
    // Bu yüzden ayrım şudur: **imza YOKSA sarı, imza VARSA ve YALAN SÖYLÜYORSA kırmızı.**
    // Yani kimse damgalamak zorunda değil, ama damgalayan doğru damgalamak zorunda.
    // Canary'nin 8 karesi gerçek onaylı karelerle damgalanınca bu kural KIRMIZI'ya döner —
    // o zaman tek satırlık bir değişiklik, bugün ise 48 bloğu kilitleyen bir duvar.
    return [{
      level: 'sari',
      key: 'frame-imza',
      msg: 'final motion kare kimliği taşımıyor (`frame: <yol> · sha256:<hex>`)',
      why: 'Yasa "görmediğin kareye motion yazma" diyordu ama hiçbir şey ölçmüyordu — teslim '
        + 'dosyalarında tek bir kare yolu yoktu, "gördüm" iddiası doğrulanamayan bir cümleydi. '
        + 'Kare henüz yoksa blok `🔴 MOTION INTENT` olur ve motora gitmez; final motion ancak '
        + 'gerçek kare açıldıktan sonra yazılır. Damga: node scripts/frame-imza.mjs <dosya>',
    }];
  }
  const [, rel, sha] = b.frame;
  const abs = resolve(dirname(path), '..', rel.replace(/^\.\//, ''));
  if (!existsSync(abs)) {
    return [{
      level: 'kirmizi',
      key: 'frame-yok',
      msg: `kare diskte yok: ${rel}`,
      why: 'Kimlik uydurulamaz. Yol yanlışsa motion görülmemiş bir kareye yazılmış demektir.',
    }];
  }
  const gercek = createHash('sha256').update(readFileSync(abs)).digest('hex').slice(0, sha.length);
  if (gercek !== sha.toLowerCase()) {
    return [{
      level: 'kirmizi',
      key: 'frame-bayat',
      msg: `kare DEĞİŞMİŞ — sha tutmuyor (${rel}: ${sha.slice(0, 8)}… ≠ ${gercek.slice(0, 8)}…)`,
      why: 'Kare yeniden basıldı ama motion eski kareye göre yazılmış. Bu tam olarak yasanın '
        + '"revize edilmiş kare de dahil" dediği hâldir: yeni kare açılıp motion yeniden yazılır.',
    }];
  }
  return [];
}

export function lintMotionFile(path) {
  const blocks = parseMotionBlocks(readFileSync(path, 'utf8'));
  const rows = blocks.map((b) => ({
    head: b.head,
    kelime: kelimeSayisi(b.para),
    // T5 — İKİ KADEMELİ TESLİM.
    //
    // `🔴 MOTION INTENT` / `YENİDEN-BASIM` bloğu bir teslim değil, bir NİYETTİR: kare
    // bozuk ya da henüz basılmamış, yazılan şey motora gitmiyor. Ona kelime/kuyruk/kamera
    // kuralı koşturmak, olmayan bir teslimi ölçmek olurdu — motion-lint'in `S1-KANON:125`
    // hayaletiyle aynı sınıf hata. O yüzden içerik kuralları ATLANIR.
    //
    // Buna karşılık FİNAL motion, gerçek onaylı karenin kimliğini TAŞIMAK ZORUNDADIR.
    // Yasa zaten yazılıydı (`PROMPT-YASASI:817` *"görmediğin kareye motion yazma, revize
    // edilmiş kare de dahil"*) ama hiçbir şey ölçmüyordu: teslim edilen dosyalarda tek bir
    // kare yolu yoktu ve "kareyi gördüm" iddiası serbest metin olarak yazılıyordu.
    // Mekanizma zaten vardı (`mamilas-command.mjs:850` SHA-256 üretiyor) — İCRAAT hattına
    // hiç bağlanmamıştı. Bu satır o bağlantıdır, yeni bir API değil.
    intent: b.intent,
    problems: b.intent ? [] : lintMotionBlock(b.para).concat(frameProblemi(b, path)),
  }));
  const bad = rows.filter((r) => r.problems.some((p) => p.level === 'kirmizi'));
  const sari = rows.filter((r) => !r.problems.some((p) => p.level === 'kirmizi')
    && r.problems.some((p) => p.level === 'sari'));

  const ws = rows.map((r) => r.kelime).sort((a, b) => a - b);
  const kams = blocks.map((b) => kameraCumlesi(b.para));
  const camli = kams.filter(Boolean).length;
  // Konum ÖLÇÜLÜR ve basılır ama hüküm vermez — sebebi SARI_KURALLAR içindeki nota yazılı
  // (Efe 0/57 · altın 25/50: iki kanıtlı-iyi korpus birbirini yalanlıyor).
  const camSonda = kams.filter((k) => k && k.oran >= 0.5).length;

  return {
    path,
    total: rows.length,
    rows,
    bad,
    sari,
    metrics: rows.length
      ? { kelimeMin: ws[0], kelimeMax: ws.at(-1), kelimeOrta: ws[Math.floor(ws.length / 2)],
          kameraCumlesi: `${camli}/${rows.length}`, kameraSonda: `${camSonda}/${rows.length}`,
          ...acilisTekduzeligi(blocks).metrik }
      : null,
    dosyaSorunlari: acilisTekduzeligi(blocks).problems,
    olculmeyen: OLCULMEYEN,
  };
}

/**
 * AÇILIŞ TEKDÜZELİĞİ — dosya düzeyinde ölçülür, blok düzeyinde değil.
 *
 * 2026-08-05, Mami: *"sahneleri düşünmeden düz yazdı, o kadar güzel yazıyorduk sonra bunu
 * yapması korkunç."* Ölçüldü ve haklıydı: bitmiş setin **52/52 bloğu AYNI üç kelimeyle
 * açılıyordu** (`The clip opens…`), 49/52'sinde `already` vardı. Kamera cümleleri 52/52
 * benzersizdi — yani yazan KAMERAYI düşünmüş, SAHNEYİ düşünmemişti.
 *
 * Ve `motion-lint` o dosyaya **kırmızı 0** demişti. Çünkü ölçen kuyruğa, saate, kamera
 * cümlesine ve kelimeye bakıyordu; hiçbiri şablonu görmüyor. Yeşil ışık yanlış güven verdi.
 *
 * ⚠ BU KURAL KELİME AVLAMAZ. `already` yasaklamak bu repoda çürütülmüş bir yaklaşım
 * (`HASAT-MORPH-KOKU:42` — *"already kusur değil BELİRTİdir; kelime düzeltilseydi aynı
 * klipler yeniden basılırdı"*). Ölçülen şey TEKDÜZELİK: hangi kelime olduğu değil, aynı
 * kalıbın kaç blokta tekrarlandığı. Şablon, düşünülmemişliğin imzasıdır.
 *
 * Blok düzeyine yazılmadı çünkü tek bir blok tekdüze olamaz — tekdüzelik ancak SET'te vardır.
 */
// KALİBRASYON — üç gerçek setle, 2026-08-05'te diskten ölçüldü. Tahmin YOK.
//   · Destek ve Hareket (Mami: "sahneleri düşünmeden düz yazdı")   52/52 = %100
//   · Sorunları Birlikte Çözüyoruz (Efe — TUTMUŞ iş)               46/57 = %81
//   · Eşeyli ve Eşeysiz Üreme (altın standart)                     24/50 = %48
//
// İlk eşik %60 yazılmıştı ve KANITLI İYİ bir korpusa (Efe, %81) sahte alarm verdi.
// Sahte alarm ölçümün kendisini çöpe atar — Mami kırmızıya bakmayı bırakır. Eşik %90'a
// çıkarıldı: kanıtlı hiçbir iyi set orada değil, kötü set ise tam orada.
//
// ⚠ VE BUNUN ANLAMI ŞU: tekdüze açılış TEK BAŞINA kötülüğün kanıtı DEĞİLDİR. Tutmuş bir
// set de %81 tekdüze. Bu kural yalnız UÇ hâli yakalar (%90+), yani "her klip istisnasız
// aynı cümleyle başlıyor" hâlini. Asıl kusur başka yerdedir ve bu ölçen onu görmez.
export function acilisTekduzeligi(blocks, { esik = 0.9, azBlok = 6 } = {}) {
  const paras = blocks.map((b) => b.para).filter(Boolean);
  if (paras.length < azBlok) return { problems: [], metrik: {} };
  const anahtar = (p) => p.split(/\s+/).slice(0, 3).join(' ').toLowerCase().replace(/[^a-zçğıöşü ]/g, '');
  const say = {};
  for (const p of paras) { const k = anahtar(p); say[k] = (say[k] ?? 0) + 1; }
  const [kalip, adet] = Object.entries(say).sort((a, b) => b[1] - a[1])[0];
  const oran = adet / paras.length;
  const metrik = { acilisTekrar: `${adet}/${paras.length}`, acilisKalip: kalip };
  if (oran < esik) return { problems: [], metrik };
  return {
    metrik,
    problems: [{
      level: 'kirmizi',
      key: 'acilis-tekduze',
      msg: `açılış TEKDÜZE — ${adet}/${paras.length} blok aynı üç kelimeyle başlıyor: "${kalip}…"`,
      why: 'Şablon, düşünülmemişliğin imzasıdır. Ölçüldü (Destek ve Hareket, 2026-08-05): '
        + '52/52 blok aynı açılışı taşıyordu, kamera cümleleri ise 52/52 benzersizdi — yazan '
        + 'kamerayı düşünmüş, SAHNEYİ düşünmemişti. O dosyaya bu ölçen "kırmızı 0" demişti. '
        + 'Kural kelime avlamaz: hangi kelime olduğu değil, aynı kalıbın kaç blokta '
        + 'tekrarlandığı ölçülür. Her klip kendi olayından doğar; ortak bir cümleden değil.',
    }],
  };
}

export { KIRMIZI_KURALLAR, SARI_KURALLAR };

// ---------------------------------------------------------------------------
// RAPOR — prompt-lint ile AYNI biçim. `kırmızı: N/M` satırını gate.sh parse ediyor.
// ---------------------------------------------------------------------------
function report(r, { kapsam = true } = {}) {
  const name = r.path.split(/[\\/]/).pop();
  console.log(`\n━━ ${name} — ${r.total} klip`);
  if (!r.total) {
    console.log('  (klip bulunamadı: "### K<n> …" başlığı + "-----" ayraçlı paragraf bekleniyor)');
    return;
  }
  if (r.metrics) {
    console.log(`  kapsam: kelime ${r.metrics.kelimeMin}-${r.metrics.kelimeMax} (orta ${r.metrics.kelimeOrta}, hedef 190-215) · `
      + `kamera cümlesi ${r.metrics.kameraCumlesi} (son yarıda ${r.metrics.kameraSonda})`);
  }

  // Tekrar eden kusuru satır satır dağıtmak sinyali gömer — aynı sınıf tek satırda toplanır.
  const topla = (rows, lvl) => {
    const m = new Map();
    for (const row of rows) {
      for (const p of row.problems.filter((x) => x.level === lvl)) {
        if (!m.has(p.key)) m.set(p.key, { why: p.why, msgs: new Set(), heads: [] });
        const g = m.get(p.key);
        g.msgs.add(p.msg);
        g.heads.push(row.head);
      }
    }
    return [...m].sort((a, b) => b[1].heads.length - a[1].heads.length);
  };

  for (const [, g] of topla(r.bad, 'kirmizi')) {
    const msg = g.msgs.size === 1 ? [...g.msgs][0] : `${[...g.msgs][0]} (+${g.msgs.size - 1} varyant)`;
    console.log(`  ✗ ${msg} — ${g.heads.length} klip`);
    console.log(`    ${g.why}`);
    if (g.heads.length <= 6) for (const h of g.heads) console.log(`      ▸ ${h.slice(0, 76)}`);
  }

  if (r.sari.length) {
    console.log(`  — sarı (${r.sari.length} klip · kusur iddiası DEĞİL, ajan tek geçişte baksın):`);
    for (const [, g] of topla(r.sari, 'sari')) {
      const msg = g.msgs.size === 1 ? [...g.msgs][0] : `${[...g.msgs][0]} (+${g.msgs.size - 1} varyant)`;
      console.log(`      ? ${msg} — ${g.heads.length} klip${g.heads.length <= 5 ? ` (${g.heads.map((h) => h.slice(0, 20)).join(', ')})` : ''}`);
    }
  }

  // DOSYA DÜZEYİ SORUNLAR — tek blok taşıyamaz, ancak SET'te vardır (açılış tekdüzeliği).
  // Kırmızı sayısına EKLENİR: `gate.sh` bu satırı parse ediyor ve dosya düzeyi bir kusur
  // görünmez kalırsa kapı yine yanlış yeşil verir — bu tam olarak bugün olan şeydi.
  const dosyaK = (r.dosyaSorunlari ?? []).filter((p) => p.level === 'kirmizi');
  for (const p of dosyaK) {
    console.log(`  ✗ ${p.msg}`);
    console.log(`    ${p.why}`);
  }

  const toplamK = r.bad.length + dosyaK.length;
  console.log(`  ${toplamK ? '⚠️' : '✅'} kırmızı: ${toplamK}/${r.total}${r.sari.length ? ` · sarı: ${r.sari.length}` : ''}`);

  if (kapsam) {
    console.log('  ölçülmeyen (yeşil ≠ temiz):');
    for (const o of r.olculmeyen) console.log(`      · ${o}`);
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const ARGS = process.argv.slice(2);
  const STRICT = ARGS.includes('--strict');
  const NO_KAPSAM = ARGS.includes('--kisa');
  const hedefler = ARGS.filter((a) => !a.startsWith('--'));

  if (!hedefler.length) {
    console.error('kullanım: node scripts/motion-lint.mjs <dosya|klasör> [--strict] [--kisa]');
    process.exit(2);
  }

  const targets = [];
  for (const h of hedefler) {
    if (!existsSync(h)) { console.error(`yok: ${h}`); process.exit(2); }
    if (statSync(h).isDirectory()) {
      for (const e of readdirSync(h).sort()) if (/\.txt$/i.test(e)) targets.push(join(h, e));
    } else targets.push(h);
  }

  let bad = 0, sari = 0, klip = 0;
  const setBloklari = [];
  for (const t of targets) {
    const r = lintMotionFile(t);
    report(r, { kapsam: !NO_KAPSAM && targets.length === 1 });
    bad += r.bad.length + (r.dosyaSorunlari ?? []).filter((p) => p.level === 'kirmizi').length;
    sari += r.sari.length; klip += r.total;
    // SET kapsamı için ham blokları biriktir (aşağı bak).
    if (!/TASLAK/.test(readFileSync(t, 'utf8').split('\n', 1)[0] ?? '')) {
      setBloklari.push(...parseMotionBlocks(readFileSync(t, 'utf8')));
    }
  }

  // ── SET DÜZEYİ ─────────────────────────────────────────────────────────────
  // Açılış tekdüzeliği tek DOSYADA görünmez, SETTE görünür. Teslim biçimi klip başına
  // bir dosya olduğu için (`01.txt`…`52.txt`) dosya düzeyi ölçüm bu kusuru yapısal olarak
  // kaçırıyordu: her dosyada 1 blok var, 1 blok tekdüze olamaz. Ölçüldü (2026-08-05):
  // bitmiş sette 52/52 blok `The clip opens…` ile açıyordu ve ölçen "kırmızı 0" diyordu.
  if (setBloklari.length > 1) {
    const { problems, metrik } = acilisTekduzeligi(setBloklari);
    if (metrik.acilisTekrar) console.log(`\nSET kapsamı: açılış tekrarı ${metrik.acilisTekrar} · en sık kalıp "${metrik.acilisKalip}…"`);
    for (const p of problems) {
      console.log(`  ✗ ${p.msg}`);
      console.log(`    ${p.why}`);
      bad += 1;
    }
  }

  console.log(`\n${bad ? '⚠️' : '✅'} kırmızı: ${bad}/${klip} · sarı: ${sari}`);
  if (targets.length > 1 && !NO_KAPSAM) {
    console.log('ölçülmeyen (yeşil ≠ temiz):');
    for (const o of OLCULMEYEN) console.log(`  · ${o}`);
  }
  if (STRICT && bad) process.exit(1);
}
