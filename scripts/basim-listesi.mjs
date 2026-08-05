#!/usr/bin/env node
// BASIM LİSTESİ — bir projenin motion bloklarını sürümler arasından çözüp
// tek, sıralı, basıma hazır liste üretir.
//
// ────────────────────────────────────────────────────────────────────────────
// NEDEN VAR — ölçülmüş vaka (Destek ve Hareket, 2026-08-05)
//
// Kayıt "MOTION 52/52 TAMAM" diyordu. Diskte gerçek durum şuydu:
//   · kök `<Proje>_MOTION.txt` **byte-byte** `ESKI-cansiz-yedek.txt` ile aynıydı —
//     yani yedek alınmış, ASIL DOSYA YENİLENMEMİŞTİ
//   · yeni motion'lar yalnız `MOTION/` altındaki S*-YENI ve M-* dosyalarında yaşıyordu
//   · 52 karenin 49'unun yeni sürümü vardı, 3'ünde (K24 K32 K49) yoktu
//   · K16'nın İKİ yeni sürümü vardı (M-A + S2-YENI)
// Mami sabah kök dosyadan bassaydı, ölçülmüş kusurlu seti (44 klip durarak bitiyor,
// 39'u `already` ile açılıyor) yakacaktı.
//
// Bu araç o kararı ELLE VERMEYİ bırakır: sürüm önceliği DOSYA ZAMANIDIR (objektif),
// boşluk ve çakışma AÇIKÇA raporlanır, sessizce seçilmez.
//
// ⚠ Bu araç HÜKÜM VERMEZ: hiçbir dosyayı silmez, üzerine yazmaz. Ayrı bir
// `_BASIM-LISTESI.txt` üretir. Hangi sürümün doğru olduğu Mami'nin kararıdır —
// araç yalnız kararı GÖRÜNÜR yapar.
//
// Kullanım:
//   node scripts/basim-listesi.mjs "<proje klasörü>"            (rapor)
//   node scripts/basim-listesi.mjs "<proje klasörü>" --yaz      (dosyayı da üret)
// ────────────────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const BLOK_BAS = /^###?\s*(K\d+(?:-[A-ZÇĞİÖŞÜ]+)?)\s*(\|[^\n]*)?$/gim;

/** Bir metindeki motion bloklarını {kare, etiket, govde} olarak ayırır. */
export function bloklariAyir(metin) {
  const bloklar = [];
  const eslesme = [...metin.matchAll(BLOK_BAS)];
  eslesme.forEach((m, i) => {
    const bas = m.index;
    const son = i + 1 < eslesme.length ? eslesme[i + 1].index : metin.length;
    const ham = m[1].toUpperCase();
    const kare = Number.parseInt(ham.replace(/^K/, ''), 10);
    // ⚠ SIFIR DOLGUSU NORMALİZE EDİLİR: `K01` ile `K1` AYNI karedir. Ölçüldü (2026-08-05):
    // etiketi ham kullanınca Hücre ve Farklı Kültürler'de K01-K09 "BOŞ KARE" göründü —
    // 53 blok çözülmüşken 9 kare eksik raporlandı. Bu deponun 11 kez ölçülen kusur sınıfı,
    // yine doğrulayıcının kendi elinden: anahtarın BİÇİMİNİ varsaymak.
    const sonek = ham.replace(/^K\d+/, '');
    const etiket = 'K' + kare + sonek;
    bloklar.push({
      etiket,
      ham,
      kare,
      alternatif: /-/.test(etiket),
      baslik: (m[0] || '').trim(),
      govde: metin.slice(bas, son).trim(),
    });
  });
  return bloklar;
}

/** Proje klasöründeki bütün motion kaynaklarını zaman sırasıyla toplar. */
export function kaynaklariTopla(projeDir) {
  const adaylar = [];
  const ekle = (yol) => {
    if (!existsSync(yol) || !yol.toLowerCase().endsWith('.txt')) return;
    const st = statSync(yol);
    if (!st.isFile()) return;
    const metin = readFileSync(yol, 'utf8');
    const bloklar = bloklariAyir(metin);
    if (!bloklar.length) return;
    const hash = createHash('sha256').update(metin).digest('hex');
    adaylar.push({ yol, ad: basename(yol), zaman: st.mtimeMs, bloklar, hash });
  };

  for (const f of readdirSync(projeDir)) {
    if (/_MOTION\.txt$/i.test(f) || /MOTION.*\.txt$/i.test(f)) ekle(join(projeDir, f));
  }
  // MOTION/ ve BİR SEVİYE altındaki klasörler (örn. MOTION/_ESKI-SURUM/).
  // Eski sürümler kök dizinden karantinaya alınınca (2026-08-05) geri düşüş kaynağı da
  // kapanmış ve K24/K32/K49 "BOŞ KARE" görünmüştü. Alt klasör taranır ama adı yedek/eski
  // olan dosyalar `coz()` tarafından zaten düşürülür — yani buradan gelen içerik YALNIZ
  // geri düşüş olarak kullanılır, canlı sürüm sayılmaz.
  const alt = join(projeDir, 'MOTION');
  if (existsSync(alt) && statSync(alt).isDirectory()) {
    for (const f of readdirSync(alt)) {
      const yol = join(alt, f);
      if (statSync(yol).isDirectory()) {
        for (const g of readdirSync(yol)) ekle(join(yol, g));
      } else ekle(yol);
    }
  }
  return adaylar.sort((a, b) => a.zaman - b.zaman);
}

/**
 * Kare başına EN YENİ kaynağı seçer.
 * `yedek`/`eski` adı taşıyan dosyalar aday listesinden DÜŞÜRÜLÜR — adları
 * zaten emekli olduklarını söylüyor, ama zamanları en yeni olabilir (yedek
 * sonradan alınır). Ölçülmüş vaka: ESKI-cansiz-yedek.txt 17:49 ile en yeniydi.
 */
export function coz(kaynaklar) {
  const adaDusen = kaynaklar.filter((k) => /(yedek|eski|backup|old)/i.test(k.ad));

  // İÇERİK KİMLİĞİ — adı temiz ama içeriği yedekle BYTE-EŞ olan dosya da düşer.
  // Ölçülmüş vaka: kök `<Proje>_MOTION.txt`, `ESKI-cansiz-yedek.txt` ile byte-eşti ve
  // mtime'ı DAHA YENİYDİ (yedek sonradan alınmış, asıl dosya yenilenmemiş). Yalnız
  // zamana bakan bir çözücü tam da eski seti "en yeni" diye seçiyordu — yani araç
  // Mami'ye kusurlu seti bastıracaktı. Zaman bir sinyaldir, kimlik bir kanıttır.
  const dusenHash = new Set(adaDusen.map((k) => k.hash));
  const icerikDusen = kaynaklar.filter((k) => !adaDusen.includes(k) && dusenHash.has(k.hash));
  const dusen = [...adaDusen, ...icerikDusen];
  const canli = kaynaklar.filter((k) => !dusen.includes(k));

  const secim = new Map();      // etiket → {blok, kaynak}
  const catisma = new Map();    // etiket → [kaynak adları]
  for (const k of canli) {
    for (const b of k.bloklar) {
      if (secim.has(b.etiket)) catisma.set(b.etiket, [...(catisma.get(b.etiket) || [secim.get(b.etiket).kaynak]), k.ad]);
      secim.set(b.etiket, { blok: b, kaynak: k.ad, zaman: k.zaman });  // sonraki = daha yeni
    }
  }
  // GERİ DÜŞÜŞ — canlı sürümü olmayan kare için eski sürüm alınır ve İŞARETLENİR.
  // Basım listesinde BOŞLUK bırakmak, işaretli eski sürümden beterdir: Mami sırayı
  // takip ederken boşluğu fark etmeyebilir, işareti fark eder.
  const eskiden = new Set();
  for (const k of dusen) {
    for (const b of k.bloklar) {
      if (secim.has(b.etiket)) continue;
      secim.set(b.etiket, { blok: b, kaynak: k.ad, zaman: k.zaman, eski: true });
      eskiden.add(b.etiket);
    }
  }

  return { secim, catisma, dusen, canli, eskiden };
}

export function rapor(projeDir) {
  const kaynaklar = kaynaklariTopla(projeDir);
  if (!kaynaklar.length) return { hata: 'motion kaynağı bulunamadı', kaynaklar: [] };
  const { secim, catisma, dusen, canli, eskiden } = coz(kaynaklar);

  const anaKareler = [...secim.values()].filter((s) => !s.blok.alternatif).map((s) => s.blok.kare);
  const enBuyuk = Math.max(...anaKareler);
  const bos = [];
  for (let k = 1; k <= enBuyuk; k += 1) if (!secim.has('K' + k)) bos.push(k);

  // Yalnız DÜŞÜRÜLEN kaynakta olan kareler — "yenisi yok" uyarısı
  const sadeceEski = [...eskiden];

  return { kaynaklar, canli, dusen, secim, catisma, bos, sadeceEski, enBuyuk };
}

export function listeYaz(r, projeAdi) {
  const etiketler = [...r.secim.keys()].sort((a, b) => {
    const ka = Number.parseInt(a.replace(/^K/, ''), 10);
    const kb = Number.parseInt(b.replace(/^K/, ''), 10);
    return ka - kb || a.localeCompare(b, 'tr');
  });
  const L = [];
  L.push(`${projeAdi} — BASIM LİSTESİ`);
  L.push('='.repeat(72));
  L.push(`Kare: ${etiketler.length} blok · kaynak sürüm: ${r.canli.length} dosya`);
  L.push('Sürüm önceliği DOSYA ZAMANIDIR; yedek/eski adlı dosyalar düşürüldü.');
  if (r.bos.length) L.push(`⚠ BOŞ KARE (hiçbir kaynakta yok): ${r.bos.join(', ')}`);
  if (r.sadeceEski.length) L.push(`🔴 ESKİ SÜRÜMLE DOLDURULDU: ${r.sadeceEski.join(', ')} — yenisi YAZILMADI, blok içinde de işaretli`);
  for (const [e, k] of r.catisma) L.push(`⚠ ÇAKIŞMA ${e}: ${[...new Set(k)].join(' → ')} (en yeni seçildi)`);
  L.push('='.repeat(72));
  L.push('');
  for (const e of etiketler) {
    const s = r.secim.get(e);
    L.push(`>>> ${e}   [kaynak: ${s.kaynak}]${s.eski ? '   🔴 ESKİ SÜRÜM — yenisi yazılmadı, kusurlu sette' : ''}`);
    L.push(s.blok.govde);
    L.push('');
    L.push('-'.repeat(72));
    L.push('');
  }
  return L.join('\n');
}

// ---------------------------------------------------------------------------
const dogrudan = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (dogrudan) {
  const dir = process.argv[2];
  if (!dir || !existsSync(dir)) {
    process.stderr.write('kullanım: node scripts/basim-listesi.mjs "<proje klasörü>" [--yaz]\n');
    process.exit(2);
  }
  const r = rapor(dir);
  if (r.hata) { process.stderr.write(`🔴 ${r.hata}: ${dir}\n`); process.exit(1); }
  const ad = basename(dir);

  process.stdout.write(`\n${ad}\n${'─'.repeat(Math.min(72, ad.length + 8))}\n`);
  process.stdout.write(`kaynak dosya : ${r.canli.length} canlı`
    + (r.dusen.length ? ` · ${r.dusen.length} yedek/eski (düşürüldü: ${r.dusen.map((d) => d.ad).join(', ')})` : '') + '\n');
  process.stdout.write(`çözülen blok : ${r.secim.size}\n`);
  if (r.bos.length) process.stdout.write(`🔴 BOŞ KARE   : ${r.bos.join(', ')}\n`);
  if (r.sadeceEski.length) process.stdout.write(`⚠  yalnız eski: ${r.sadeceEski.join(', ')}\n`);
  for (const [e, k] of r.catisma) process.stdout.write(`⚠  çakışma ${e}: ${[...new Set(k)].join(' → ')} (en yeni seçildi)\n`);

  if (process.argv.includes('--yaz')) {
    const hedef = join(dir, `${ad}_BASIM-LISTESI.txt`);
    writeFileSync(hedef, listeYaz(r, ad), 'utf8');
    process.stdout.write(`\n✅ yazıldı: ${hedef}\n`);
  } else {
    process.stdout.write('\n(dosya üretmek için --yaz)\n');
  }
}
