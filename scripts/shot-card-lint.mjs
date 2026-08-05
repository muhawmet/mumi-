#!/usr/bin/env node
// SHOT CARD LINT — prompttan ÖNCEKİ düşüncenin MEKANİK denetimi.
//
// ─────────────────────────────────────────────────────────────────────────────
// NEDEN VAR
//
// Bu repoda altı kez ölçüldü: bir kusur sınıfına karşı YASA yazmak o sınıfı KAPATMIYOR.
// "İNSAN KOY, KOL KOYMA" (§2d.1) yazılıyken gövdesiz kol üç projede tekrar etti;
// "slow push-in YASAK" (§3b) yazılıyken 45/53 ve 34/50 push-in çıktı. Yasa bir DİLEK'tir.
// Shot Card bir KONTROL'dür: düşünceyi diske yazdırır, ve yazılmayan düşünce görünür olur.
//
// 2026-08-05, AGY gerçek klipleri izledi ve teşhisi ÇÜRÜTTÜ. Yazılı kök neden
// (`_LEHCE-YASASI:18`) *"kliplerin yapacak bir işi yoktu"* diyordu; AGY üç klipte de
// *"olay klip boyunca gerçekleşiyor"* dedi. Gerçek kusur: **iş YANLIŞ ÖZNEYE verilmişti.**
// Mami'nin "plastik" dediği karede kız duruyor, KATI OLMASI GEREKEN ahşap kukla
// bacaklarını büküyordu. Bu yüzden `KAHRAMAN` ve `DEĞİŞİM` alanları bu ölçende
// birbirine bağlıdır — kartın en pahalı satırı budur.
//
// ─────────────────────────────────────────────────────────────────────────────
// SINIR — bu ölçen NE ÖLÇMEZ (yasa: makine kadrajı ve duyguyu ölçmeye çalışmaz)
//
// Kadrajın güzel olup olmadığını · sahnenin duygusunu · kahramanın DOĞRU seçilip
// seçilmediğini · fikrin iyi olup olmadığını ölçmez ve ölçmeye çalışmaz. Onu Mami ve
// yönetmen düşünür. Buradaki her kural MEKANİKTİR: alan dolu mu, iki alan birbirini
// yalanlıyor mu, atıf gerçek mi.
//
// Kullanım:
//   node scripts/shot-card-lint.mjs <dosya|dizin> [--vo <_SESLENDIRME dosyası>]

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

// ---------------------------------------------------------------------------
// SÖZLEŞME — 11 alan, sırası bağlayıcı değil ama VARLIĞI zorunlu.
// ---------------------------------------------------------------------------
export const ALANLAR = [
  'VO YÜKÜMÜ', 'FİKİR', 'AYRICALIK', 'KAHRAMAN', 'BAŞLANGIÇ',
  'DEĞİŞİM', 'MOTION HAZIR', 'KAMERA', 'REF ROLLERİ', 'RİSK', 'SÜREKLİLİK',
];

// Kart başlığı: `K12` ya da `### K12 | 5s · VO "<cümle>"`. Motion sözleşmesiyle AYNI
// biçim — iki ölçen iki farklı başlık dili konuşursa ajan hangisini yazacağını bilemez.
const HEAD_RE = /^(?:#{1,6}\s*K\s*\d{1,3}\b|K\s*\d{1,3}\s*(?:[|·:]|$))/;

// Boş sayılan doldurmalar. `—` ve `?` bir cevap değildir; kartı doldurmuş göstermek için
// yazılan işaret, kartın kendisini yalanlar.
const BOS_RE = /^\s*(|[-—–]+|\?+|yok|tbd|belirsiz|\.\.\.)\s*$/i;

// ⚠ TÜRKÇE SINIR TUZAĞI — bu repoda daha önce ölçüldü (`\b`/@ regex kusuru).
// JS'te `u` bayrağı olmadan `\w` = [A-Za-z0-9_]; yani `ş ç ğ ı ö ü` KELİME KARAKTERİ
// SAYILMAZ. `\bbitmiş\b` deseninin sondaki `\b`'si `ş` ile `,` arasında sınır bulamaz
// ve HİÇ EŞLEŞMEZ. Bu satır önce o yanlışla yazıldı ve iki fixture birden düştü —
// kural doğruydu, sınırı yanlıştı. Türkçe harf sınıfı açıkça yazılır.
const TR = 'a-zA-ZçğıöşüÇĞİÖŞÜ';
const trKelime = (govde) => new RegExp(`(?:^|[^${TR}])(?:${govde})(?![${TR}])`, 'i');

// ⚠ TÜRKÇE BÜYÜK HARF TUZAĞI — aynı sınıfın İKİNCİ varyantı, canlı kartta yakalandı.
// JS'in `i` bayrağı `I↔i` eşler ama `İ↔i` EŞLEMEZ (U+0130 ayrı bir harf). Yani kartta
// `BİTMİŞ` yazan bir satır `/bitmiş/i` desenine takılmıyordu: K11 başka bir kelimeyle
// (`çoktan`) yakalandı, K37 AYNI ÇELİŞKİYİ taşıyıp SESSİZCE geçti. Ölçen yeşil görünüp
// kusuru kaçırıyordu — bu repoda sekiz kez ölçülmüş kusur sınıfının ta kendisi.
// Çözüm: karşılaştırmadan önce Türkçe-farkında küçültme.
const trKucuk = (s) => String(s ?? '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();

// BAŞLANGIÇ alanında "olay bitmiş" beyanı.
const BITMIS_RE = trKelime('bitmiş|bitti|olmuş|olmuştu|tamamlanmış|tamamlandı|çoktan');
// MOTION HAZIR alanında olumlu beyan.
const HAZIR_EVET_RE = new RegExp(`^\\s*(?:evet|var|hazır|olur|mümkün|başlayabilir)(?![${TR}])`, 'i');

// RİSK sözlüğü — yasa maddeleriyle eşleşen kapalı liste. Uydurma risk adı, riski
// yönetilebilir olmaktan çıkarır (hangi yasa maddesine bağlanacağı bilinmez).
export const RISK_SOZLUGU = ['yazı', 'anatomi', 'katı nesne', 'mekanik', 'morph', 'süre', 'kamera', 'yok'];

// Kamera hareketi izleri — hareket varsa gerekçe beklenir ("gerekçesizse sabit").
const KAMERA_HAREKET_RE = trKelime('dolly|pan|tilt|push|pull|crane|track|zoom|kayar|kayıyor|yaklaşır|uzaklaşır|döner|yürür');
const KAMERA_GEREKCE_RE = trKelime('çünkü|için|amacıyla|böylece|sebebi|nedeni|olduğundan');

// Türkçe ekleri kabaca atan gövdeleyici — tam bir morfoloji değil, ÖRTÜŞME arar.
const KOK = (w) => w.toLowerCase()
  .replace(/[^a-zçğıöşü@]/g, '')
  .replace(/(lerin|ların|ları|leri|lar|ler|nın|nin|nun|nün|ını|ini|unu|ünü|ın|in|un|ün|ya|ye|da|de|ta|te|dan|den|tan|ten|a|e|ı|i|u|ü)$/,'');
const KELIMELER = (s) => String(s).split(/[\s,;./()]+/).map(KOK).filter((w) => w.length >= 3);

// ---------------------------------------------------------------------------
export function parseShotCards(text) {
  const lines = String(text).replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
  const heads = [];
  lines.forEach((l, i) => { if (HEAD_RE.test(l.trim())) heads.push(i); });
  if (!heads.length) return [];
  return heads.map((s, i) => {
    const e = i + 1 < heads.length ? heads[i + 1] : lines.length;
    const head = lines[s].trim().replace(/^#+\s*/, '');
    const govde = lines.slice(s + 1, e);
    const alanlar = {};
    for (const ad of ALANLAR) {
      // `ALAN : değer` — iki nokta öncesi boşluk serbest, alan adı büyük harf duyarsız.
      const re = new RegExp(`^\\s*${ad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:(.*)$`, 'im');
      const hit = govde.join('\n').match(re);
      alanlar[ad] = hit ? hit[1].trim() : null;
    }
    return { head, alanlar, kare: (head.match(/K\s*(\d{1,3})/) ?? [])[1] ?? '?' };
  });
}

/** VO cümlesi başlıkta tırnak içinde geçiyorsa çıkarır. */
const voCumlesi = (head) => (head.match(/VO\s*["“](.+?)["”]/) ?? [])[1] ?? null;

// ---------------------------------------------------------------------------
export function lintShotCard(kart, { voMetni = null } = {}) {
  const p = [];
  const kirmizi = (key, msg, why) => p.push({ level: 'kirmizi', key, msg, why });
  const sari = (key, msg, why) => p.push({ level: 'sari', key, msg, why });
  const A = kart.alanlar;

  // 1 — DOLULUK. Kartın işi düşünceyi görünür kılmak; boş alan düşünülmemiş demektir.
  const eksik = ALANLAR.filter((ad) => A[ad] === null);
  const bos = ALANLAR.filter((ad) => A[ad] !== null && BOS_RE.test(A[ad]) && ad !== 'RİSK' && ad !== 'SÜREKLİLİK');
  if (eksik.length) {
    kirmizi('alan-eksik', `alan yok: ${eksik.join(' · ')}`,
      'Kartın 11 satırı sözleşmedir. Eksik satır "düşünülmedi" demektir ve prompt o boşluğu '
      + 'uydurmayla doldurur — motorun morph üretmesiyle aynı mekanizma.');
  }
  if (bos.length) {
    kirmizi('alan-bos', `alan doldurulmuş gibi ama boş: ${bos.join(' · ')}`,
      '`—` ya da `?` bir cevap değildir. Kartı dolu göstermek için konan işaret kartın '
      + 'kendisini yalanlar; ölçen dolu sanır, okuyan ajan boş bulur.');
  }

  // 2 — ÇELİŞKİ. Kartın en sert kuralı: olay bitmişse motion ondan doğamaz.
  if (A['BAŞLANGIÇ'] && A['MOTION HAZIR']
      && BITMIS_RE.test(trKucuk(A['BAŞLANGIÇ'])) && HAZIR_EVET_RE.test(trKucuk(A['MOTION HAZIR']))) {
    kirmizi('celiski-esik',
      'BAŞLANGIÇ olayı BİTMİŞ diyor ama MOTION HAZIR EVET diyor',
      'Olmuş bir olay canlandırılamaz. Motorun 5 saniyede yapacak işi kalmayınca boşluğu '
      + 'kendi uydurur. Ya start frame olayın ÖNCESİNE çekilir, ya kareden hâlâ '
      + 'yapılabilecek küçük ama GERÇEK bir olay bulunur.');
  }

  // 3 — RİSK SÖZLÜĞÜ. Kapalı liste: risk bir yasa maddesine bağlanabilmeli.
  if (A['RİSK'] && !BOS_RE.test(A['RİSK'])) {
    const bilinmeyen = A['RİSK'].split(/[·,;/]+/).map((s) => s.trim().toLowerCase()).filter(Boolean)
      .filter((r) => !RISK_SOZLUGU.some((s) => r.includes(s)));
    if (bilinmeyen.length) {
      kirmizi('risk-sozluk', `sözlük dışı risk: ${bilinmeyen.join(' · ')}`,
        `Geçerli riskler: ${RISK_SOZLUGU.join(' · ')}. Uydurma risk adı hangi yasa maddesine `
        + 'bağlanacağı bilinmediği için yönetilemez; kart risk yazdığını sanır, kimse karşılamaz.');
    }
  }

  // 4 — VO ATFI GERÇEK Mİ. Kart kaynağa bağlı değilse kendi kendine konuşuyordur.
  const vo = voCumlesi(kart.head);
  if (vo && voMetni) {
    const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').replace(/["“”'']/g, '').trim();
    if (!norm(voMetni).includes(norm(vo).slice(0, 40))) {
      kirmizi('vo-yok', `başlıktaki VO cümlesi seslendirmede bulunamadı: "${vo.slice(0, 50)}…"`,
        'Kart kaynağa bağlı olmalı. Seslendirmede olmayan bir cümleye kare yazmak, '
        + 'kaynakta olmayan gerçeği uydurmakla aynı sınıftır.');
    }
  }

  // 5 — KAHRAMAN ↔ DEĞİŞİM (SARI). AGY'nin 2026-08-05'te bulduğu kusur.
  //     Kadrajın baskın öğesi X ise, klip sonundaki görünür değişim X'i ilgilendirmeli.
  //     SARI çünkü ifade biçimi serbesttir ve örtüşme kaçabilir — hüküm ajanındır.
  if (A['KAHRAMAN'] && A['DEĞİŞİM'] && !BOS_RE.test(A['KAHRAMAN']) && !BOS_RE.test(A['DEĞİŞİM'])) {
    const k = new Set(KELIMELER(A['KAHRAMAN']));
    const ortak = KELIMELER(A['DEĞİŞİM']).some((w) => k.has(w));
    if (!ortak) {
      sari('kahraman-degisim',
        'DEĞİŞİM, KAHRAMAN\'da geçen hiçbir öğeyi anmıyor',
        'Ölçüldü (AGY, 2026-08-05): "plastik" hükmü hareketsizlikten değil, hareketin YANLIŞ '
        + 'ÖZNEYE gitmesinden doğdu — kız dururken katı ahşap kukla bacaklarını büktü. '
        + 'Kadrajın kahramanı değişmiyorsa klip ya ölüdür ya da yanlış şeyi anlatır.');
    }
  }

  // 6 — KAMERA GEREKÇESİ (SARI). "Gerekçesizse sabit" — yasa böyle diyor.
  if (A['KAMERA'] && !BOS_RE.test(A['KAMERA'])
      && KAMERA_HAREKET_RE.test(A['KAMERA']) && !KAMERA_GEREKCE_RE.test(A['KAMERA'])) {
    sari('kamera-gerekce',
      'kamera hareket ediyor ama gerekçesi yazılmamış',
      'Refleks kamera bu repoda ölçülmüş bir kusur: 45/53 ve 34/50 klipte "slow push-in". '
      + 'Hareketin bir sebebi yoksa kamera SABİT olmalı; sebep varsa yazılır ve motion onu taşır.');
  }

  // 7 — SÜREKLİLİK ATFI (SARI). Süreklilik kusurlarının tamamı tek-kare kapsamında doğdu.
  if (A['SÜREKLİLİK'] && !BOS_RE.test(A['SÜREKLİLİK']) && !/K\s*\d{1,3}/i.test(A['SÜREKLİLİK'])) {
    sari('sureklilik-atif',
      'SÜREKLİLİK komşu kareyi (K<n>) anmıyor',
      'Ölçüldü: süreklilik kusurlarının TAMAMI tek-kare kapsamında doğdu — Eşeyli\'de beş '
      + 'ardışık kare gülü saksıdan bardağa geri döndürdü, hiçbiri diğerini okumamıştı.');
  }

  return p;
}

// ---------------------------------------------------------------------------
export const OLCULMEYEN = [
  'kadrajın güzel olup olmadığı — bu ölçen SÖZLEŞMEYE bakar, estetiğe değil',
  'kahramanın DOĞRU seçilip seçilmediği (yalnız DEĞİŞİM ile tutarlılığı ölçülür)',
  'fikrin iyi olup olmadığı · sahnenin duygusu · animasyon ayrıcalığının gerçekten kullanılıp kullanılmadığı',
  'ref rollerinin o dünyada geçerli olup olmadığı (ref sözleşmesinin işi)',
  'riskin GERÇEKTEN karşılanıp karşılanmadığı — kart riski adlandırır, prompt karşılar',
];

const dosyalar = (hedef) => (statSync(hedef).isDirectory()
  ? readdirSync(hedef).filter((f) => /\.(md|txt)$/i.test(f)).sort().map((f) => join(hedef, f))
  : [hedef]);

function main() {
  const argv = process.argv.slice(2);
  const hedef = argv.find((a) => !a.startsWith('--'));
  if (!hedef || !existsSync(hedef)) {
    process.stdout.write('kullanım: node scripts/shot-card-lint.mjs <dosya|dizin> [--vo <seslendirme.txt>]\n');
    process.exit(1);
  }
  const voArg = argv[argv.indexOf('--vo') + 1];
  const voMetni = argv.includes('--vo') && voArg && existsSync(voArg) ? readFileSync(voArg, 'utf8') : null;

  let toplamK = 0; let toplam = 0; let toplamS = 0;
  for (const f of dosyalar(hedef)) {
    const kartlar = parseShotCards(readFileSync(f, 'utf8'));
    if (!kartlar.length) continue;
    process.stdout.write(`\n━━ ${basename(f)} — ${kartlar.length} kart\n`);
    for (const kart of kartlar) {
      const ps = lintShotCard(kart, { voMetni });
      toplam += 1;
      const k = ps.filter((x) => x.level === 'kirmizi');
      const s = ps.filter((x) => x.level === 'sari');
      if (k.length) toplamK += 1;
      if (s.length) toplamS += 1;
      for (const x of k) process.stdout.write(`  ✗ K${kart.kare}: ${x.msg}\n      ${x.why}\n`);
      for (const x of s) process.stdout.write(`  ⚠ K${kart.kare}: ${x.msg}\n      ${x.why}\n`);
    }
  }
  process.stdout.write(`\n⚠️ kırmızı: ${toplamK}/${toplam} · sarı: ${toplamS}\n`);
  process.stdout.write('ölçülmeyen (yeşil ≠ temiz):\n');
  for (const o of OLCULMEYEN) process.stdout.write(`  · ${o}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
