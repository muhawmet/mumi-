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
// ────────────────────────────────────────────────────────────────────────────
// --csv — NB2 BATCH ÇIKIŞI (2026-08-05)
//
// Neden: kare basımı elle yapılıyor ve video başına ~700 UI el hareketi ölçüldü. NB2'nin
// List/batch node'u `n,prompt,refs` sütunlu bir tabloyu toplu alır — ama ancak metin
// KARE-ÖZEL ise. Kareye özel gövdenin yanına her seferinde aynı dünya kuyruğunu (STYLE ·
// LIGHT AND PALETTE · NEGATIVE) yapıştırmak batch'i şişirir ve zaten style alanına BİR KEZ
// girecek metni 71 kez tekrarlar.
//
// Bu yüzden kuyruk TAHMİNLE değil ÖLÇÜMLE ayrılır: bir cümle blokların ≥%80'inde BİREBİR
// geçiyorsa kuyruktur ve CSV'ye girmez; geçmiyorsa kareye özeldir ve KALIR. "STYLE satırı
// varsa hepsini at" demek, Bileşke Kuvvet'te ölçülen 63 STYLE varyantının (malzeme kareye
// göre değişiyor) tamamını çöpe atardı.
//
// Kullanım:
//   node scripts/basim-listesi.mjs "<proje klasörü>"            (motion raporu)
//   node scripts/basim-listesi.mjs "<proje klasörü>" --yaz      (motion listesini üret)
//   node scripts/basim-listesi.mjs "<proje klasörü>" --csv      (NB2 batch CSV → stdout)
//   node scripts/basim-listesi.mjs "<proje klasörü>" --csv --yaz(CSV + kuyruk dosyaya)
// ────────────────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { KUYRUK_SATIRLARI } from './prompt-turu.mjs';

// 🔴 2026-08-05 ÖLÇÜMÜ: bu desen `#` SAYISINI varsayıyordu (`##` şart) ve tek-`#` biçimini
// HİÇ görmüyordu. Diskte sayıldı — `# K27 — "..."` biçimi 24 canlı dosyada kullanılıyor ve
// hepsinde ayrıştırıcı SIFIR blok veriyordu: Hücre (altın standart, 53 kare), Destek ve
// Hareket (52), Bitkilerde Üreme'nin MOTION klasörünün TAMAMI (53 blok) ve Denetleyici'nin
// 56 karesi. `basim-listesi Bitkilerde` çağrısı "motion kaynağı bulunamadı" diyordu — oysa
// dosyalar diskte duruyordu. Bu deponun sekiz kez ölçülmüş kusur sınıfı: doğrulayıcı,
// ölçtüğü şeyin YERLEŞİMİNİ (burada: başlığın BİÇİMİNİ) varsayıyor ve sessizce boş dönüyor.
// Genişletme ÖLÇÜLEREK yapıldı: `#` tamamen serbest bırakılınca (`#{0,6}`) EDIT-PLAN ve SUNO
// dosyaları da blok üretti (52 ve 8 sahte blok) — o yüzden en az bir `#` ŞART, ve başlık
// kuyruğu yalnız gerçek ayraçla (`|` `—` `–` `:`) başlayabilir.
const BLOK_BAS = /^#{1,6}[ \t]*(K\d+(?:-[A-ZÇĞİÖŞÜ]+)?)[ \t]*(?:[|—–:][^\n]*)?$/gim;

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

/**
 * Kaynak rolleri. `motion` eski ve VARSAYILAN davranıştır (Kling blokları);
 * `promptlar` NB2 start-frame bloklarını okur ve yalnız `--csv` tarafından istenir.
 * ⚠ İkisi ASLA karışmaz: bir CSV'ye motion bloğu düşmesi, Mami'nin batch node'una
 * kamera hareketi yapıştırması demektir.
 */
export const ROLLER = {
  motion: {
    kokDesen: (f) => /_MOTION\.(txt|md)$/i.test(f) || /MOTION.*\.txt$/i.test(f),
    altKlasor: 'MOTION',
  },
  promptlar: {
    kokDesen: (f) => /_PROMPTLAR\.(txt|md)$/i.test(f),
    altKlasor: 'PROMPTLAR',
    // Referans plakaları ve referans-edit'ler start-frame DEĞİLDİR (bkz. prompt-turu.mjs:
    // üç ayrı tür, üç ayrı sözleşme). Aynı K numarasını taşıdıkları için batch'e girerlerse
    // gerçek kareyi gölgelerler — canlı örnek: Denetleyici/PROMPTLAR/_REFERANS-EDIT.txt.
    disla: (f) => /referans/i.test(f),
  },
};

/** Proje klasöründeki bütün kaynakları zaman sırasıyla toplar (varsayılan rol: motion). */
export function kaynaklariTopla(projeDir, { rol = 'motion' } = {}) {
  const kural = ROLLER[rol] ?? ROLLER.motion;
  const adaylar = [];
  // KÖR DOSYA — okundu ama SIFIR blok verdi. Sessiz sıfır bu deponun ölçülmüş kusurudur:
  // 13/15 referans dosyası hiç blok vermiyordu ve ölçen sessizce yeşil kalıyordu.
  const kor = [];
  const ekle = (yol) => {
    if (!existsSync(yol) || !/\.(txt|md)$/i.test(yol)) return;
    const st = statSync(yol);
    if (!st.isFile()) return;
    if (kural.disla?.(basename(yol))) return;
    const metin = readFileSync(yol, 'utf8');
    const bloklar = bloklariAyir(metin);
    if (!bloklar.length) { kor.push(basename(yol)); return; }
    const hash = createHash('sha256').update(metin).digest('hex');
    adaylar.push({ yol, ad: basename(yol), zaman: st.mtimeMs, bloklar, hash });
  };

  for (const f of readdirSync(projeDir)) {
    if (kural.kokDesen(f)) ekle(join(projeDir, f));
  }
  // <ROL>/ ve BİR SEVİYE altındaki klasörler (örn. MOTION/_ESKI-SURUM/).
  // Eski sürümler kök dizinden karantinaya alınınca (2026-08-05) geri düşüş kaynağı da
  // kapanmış ve K24/K32/K49 "BOŞ KARE" görünmüştü. Alt klasör taranır ama adı yedek/eski
  // olan dosyalar `coz()` tarafından zaten düşürülür — yani buradan gelen içerik YALNIZ
  // geri düşüş olarak kullanılır, canlı sürüm sayılmaz.
  const alt = join(projeDir, kural.altKlasor);
  if (existsSync(alt) && statSync(alt).isDirectory()) {
    for (const f of readdirSync(alt)) {
      const yol = join(alt, f);
      if (statSync(yol).isDirectory()) {
        for (const g of readdirSync(yol)) ekle(join(yol, g));
      } else ekle(yol);
    }
  }
  const sirali = adaylar.sort((a, b) => a.zaman - b.zaman);
  // Diziye iliştirilir, döndürülen şekli DEĞİŞTİRMEZ — mevcut çağıranlar (`rapor`, testler)
  // aynen çalışır, ama körlük artık raporlanabilir.
  sirali.kor = kor;
  return sirali;
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

export function rapor(projeDir, { rol = 'motion' } = {}) {
  const kaynaklar = kaynaklariTopla(projeDir, { rol });
  if (!kaynaklar.length) {
    return { hata: `${rol} kaynağı bulunamadı`, kaynaklar: [], kor: kaynaklar.kor ?? [] };
  }
  const { secim, catisma, dusen, canli, eskiden } = coz(kaynaklar);

  const anaKareler = [...secim.values()].filter((s) => !s.blok.alternatif).map((s) => s.blok.kare);
  const enBuyuk = Math.max(...anaKareler);
  const bos = [];
  for (let k = 1; k <= enBuyuk; k += 1) if (!secim.has('K' + k)) bos.push(k);

  // Yalnız DÜŞÜRÜLEN kaynakta olan kareler — "yenisi yok" uyarısı
  const sadeceEski = [...eskiden];

  return { kaynaklar, canli, dusen, secim, catisma, bos, sadeceEski, enBuyuk, kor: kaynaklar.kor ?? [] };
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

// ===========================================================================
// CSV — NB2 batch node çıkışı
// ===========================================================================

/** Bir parça blokların bu oranında BİREBİR geçiyorsa dünya kuyruğudur, kareye özel değildir. */
export const KUYRUK_ESIK = 0.8;

/** Kuyruk etiketleri — tanım `prompt-turu.mjs`ten ithal, ikinci kopya YAZILMAZ. */
const KUYRUK_ETIKET_RE = new RegExp(
  `^((?:FRAME |FIREWALL |GLOBAL |WORLD )?(?:${KUYRUK_SATIRLARI.map((k) => k.ad).join('|')}))\\s*:\\s*`,
  'iu',
);

/** `@handle` — karakter sınıfı prompt-turu.mjs'teki ile aynı. */
const HANDLE_RE = /@[a-z0-9çğıöşü_-]+/giu;

/** Cümle/madde sınırı. NEGATIVE `;` ile, gövde `.` ile ayrılır — ikisi de parçadır. */
const PARCA_AYRAC = /(?<=[.;!?])[ \t]+/u;

/**
 * Blok gövdesinden MOTORA GİDEN metni çıkarır.
 * Teslim biçimi (PROMPT-YASASI §5): başlık + Türkçe yönetmen notu · `-----` · motor metni ·
 * `-----`. Notu CSV'ye koymak, motora Türkçe niyet metni yapıştırmak olurdu.
 */
export function motoraGiden(govde) {
  const satirlar = String(govde ?? '').replace(/\r\n/g, '\n').split('\n');
  const ayrac = [];
  satirlar.forEach((l, i) => { if (/^\s*-{4,}\s*$/u.test(l)) ayrac.push(i); });
  if (!ayrac.length) {
    // Ayraçsız blok: yalnız başlık satırı düşer. Ayraçsızlık RAPORLANIR — sessizce
    // Türkçe not sızdırmaktansa görünür bir uyarı yeğdir.
    return { metin: satirlar.slice(1).join('\n').trim(), ayracli: false };
  }
  const bas = ayrac[0] + 1;
  const son = ayrac.find((i) => i >= bas) ?? satirlar.length;
  return { metin: satirlar.slice(bas, son).join('\n').trim(), ayracli: true };
}

/** Bir satırı kuyruk etiketi + parçalara ayırır. Etiket frekansa GİRMEZ. */
export function satirParcala(satir) {
  const m = satir.match(KUYRUK_ETIKET_RE);
  const govde = m ? satir.slice(m[0].length) : satir;
  return {
    etiket: m ? m[1].toUpperCase() : null,
    parcalar: govde.split(PARCA_AYRAC).map((s) => s.trim()).filter(Boolean),
  };
}

/**
 * Blokları kare-özel gövde ile ortak dünya kuyruğuna AYIRIR.
 *
 * Ölçüm mantığı: yalnız kuyruk etiketli satırların (STYLE · LIGHT AND PALETTE · NEGATIVE)
 * parçaları sayılır; blokların ≥%80'inde birebir geçen parça kuyruğa gider, geçmeyen
 * kareye özeldir ve CSV'de KALIR. Etiketsiz satırlara (sahne gövdesi, TEXT) DOKUNULMAZ —
 * onlar zaten kare-özeldir ve "yüzde" ile budanmaları yaratıcı karara müdahale olurdu.
 *
 * @param {Array<{etiket:string, kare:number, metin:string}>} bloklar
 */
export function kuyrugaAyir(bloklar, esikOran = KUYRUK_ESIK) {
  const N = bloklar.length;
  const esik = Math.max(2, Math.ceil(N * esikOran));
  const sayac = new Map();
  const blokParcalari = new Map();
  const cozulmus = bloklar.map((b) => ({
    ...b,
    satirlar: String(b.metin).split('\n').map((l) => ({ ham: l, ...satirParcala(l) })),
  }));

  for (const b of cozulmus) {
    const gorulen = new Set();   // aynı blokta tekrar eden parça bir kez sayılır
    for (const s of b.satirlar) {
      if (!s.etiket) continue;
      for (const p of s.parcalar) gorulen.add(`${s.etiket} :: ${p}`);
    }
    blokParcalari.set(b.etiket, gorulen);
    for (const k of gorulen) sayac.set(k, (sayac.get(k) ?? 0) + 1);
  }

  // ESIGIN ALTINDA kalan en yaygin parca — "ortak kuyruk yok" hukmunun GEREKCESI.
  // Olculdu 2026-08-05: Denetleyici'de en yaygin kuyruk 32/56 karede (%57) geciyor, yani
  // proje IKI LEHCE tasiyor (32 kare ilk basim, 24 kare yeniden basim). Bu bir kusur degil
  // bir GERCEK; olcen sebebi soylemeden "kuyruk bulunamadi" derse esik korlemesine dusurulur.
  let enYaygin = { sayi: 0, parca: null };
  for (const [k, v] of sayac) if (v < esik && v > enYaygin.sayi) enYaygin = { sayi: v, parca: k };

  const kuyrukSirasi = new Map();   // etiket → düşen parçalar (ilk görülme sırasıyla)
  const ciktilar = [];
  let hamToplam = 0;
  let kalanToplam = 0;

  for (const b of cozulmus) {
    const kalanSatirlar = [];
    for (const s of b.satirlar) {
      if (!s.etiket) { if (s.ham.trim()) kalanSatirlar.push(s.ham.trim()); continue; }
      const kalan = [];
      for (const p of s.parcalar) {
        if ((sayac.get(`${s.etiket} :: ${p}`) ?? 0) >= esik) {
          if (!kuyrukSirasi.has(s.etiket)) kuyrukSirasi.set(s.etiket, []);
          const dizi = kuyrukSirasi.get(s.etiket);
          if (!dizi.includes(p)) dizi.push(p);
        } else kalan.push(p);
      }
      // Etiket, kareye özel bir şey kaldıysa GERİ KONUR: NB2 hangi alanın kısıtı
      // olduğunu etiketten okur; etiketsiz kalan "no hard black outline" havada asılı kalır.
      if (kalan.length) kalanSatirlar.push(`${s.etiket}: ${kalan.join(' ')}`);
    }
    const metin = kalanSatirlar.join(' ').replace(/\s+/gu, ' ').trim();
    hamToplam += b.metin.length;
    kalanToplam += metin.length;
    ciktilar.push({ etiket: b.etiket, kare: b.kare, n: b.n ?? b.kare, prompt: metin, refs: refleriCek(metin) });
  }

  const kuyruk = [...kuyrukSirasi.entries()].map(([etiket, parcalar]) => `${etiket}: ${parcalar.join(' ')}`);

  // KAPSAM — kuyruk KAÇ karede eksiksiz vardı. Style alanına bir kez yapıştırılan metin,
  // onu taşımayan karelere de uygulanır; hangi karelerin kendi lehcesini kaybedecegi
  // SESSIZ KALAMAZ. (Bu araç hüküm vermez: sayıyı basar, kararı Mami verir.)
  const dusenler = [...kuyrukSirasi.entries()].flatMap(([e, ps]) => ps.map((p) => `${e} :: ${p}`));
  const kuyrukEksik = cozulmus
    .filter((b) => dusenler.some((d) => !blokParcalari.get(b.etiket).has(d)))
    .map((b) => b.etiket);

  // LEHÇE GRUPLARI — kuyruk satırları birebir aynı olan kareler bir gruptur.
  // "%0 düştü" çıktısının TEK dürüst açıklaması budur ve ölçülmüş bir vakası var:
  // Denetleyici'nin 56 karesinin 32'si tek bir kuyruk taşıyor, 24'ü (2026-08-05 yeniden
  // basımı) kendi satırını yazıyor — yani ortak kuyruk YOK ve bu bir KARAR, bir kusur değil.
  // Grup sayısı basılmazsa Mami "%0" görüp aracı bozuk sanır.
  // Ölçüm ETİKET BAŞINA yapılır: bütün kuyruğu tek imzada toplamak her kareyi kendi
  // grubuna atardı (NEGATIVE zaten kare-özeldir) ve sayı hiçbir şey anlatmazdı.
  const lehceler = [];
  for (const k of KUYRUK_SATIRLARI) {
    const sayim = new Map();
    let tasiyan = 0;
    for (const b of cozulmus) {
      for (const s of b.satirlar) {
        if (s.etiket !== k.ad.toUpperCase()) continue;
        tasiyan += 1;
        sayim.set(s.ham.trim(), (sayim.get(s.ham.trim()) ?? 0) + 1);
      }
    }
    if (!tasiyan) continue;
    const enBuyuk = Math.max(...sayim.values());
    lehceler.push({ etiket: k.ad, tasiyan, surum: sayim.size, enBuyuk });
  }

  return { satirlar: ciktilar, kuyruk, esik, N, hamToplam, kalanToplam, enYaygin, kuyrukEksik, lehceler };
}

/** Metindeki @handle'lar — ilk görülme sırasıyla, tekrarsız. */
export function refleriCek(metin) {
  const out = [];
  for (const m of String(metin ?? '').matchAll(HANDLE_RE)) {
    const h = m[0].toLowerCase();
    if (!out.includes(h)) out.push(h);
  }
  return out;
}

/** RFC4180 alan kaçışlaması — virgül, tırnak ve satır sonu taşıyan metinler var. */
export function csvAlan(deger) {
  const t = String(deger ?? '');
  return /[",\r\n]/u.test(t) ? `"${t.replace(/"/gu, '""')}"` : t;
}

/**
 * CSV metni. Sütunlar: `n,prompt,refs`.
 * ⚠ `prompt` TEK SATIRDIR: satır sonu taşıyan bir alan RFC4180'e uygun olsa da batch
 * node'larının yarısı satırı orada böler. Kaybolan bilgi yok — kuyruk etiketleri
 * (`TEXT:` `NEGATIVE:`) satır içinde çıpa olarak duruyor.
 */
export function csvUret(ayrilmis) {
  const L = ['n,prompt,refs'];
  for (const s of ayrilmis.satirlar) {
    L.push([csvAlan(s.n ?? s.etiket), csvAlan(s.prompt), csvAlan(s.refs.join(' '))].join(','));
  }
  return L.join('\n') + '\n';
}

/** `--csv` ucu: çözülmüş seçimden CSV + kuyruk + ölçüm üretir. */
export function csvHazirla(r, esikOran = KUYRUK_ESIK) {
  const bloklar = [...r.secim.entries()]
    // `n` sütunu diskteki kare dosyasının adıyla AYNI olmalı (`23.png`) — alternatif blok
    // (`K45-ALT`) sayı değildir, etiketiyle yazılır ve batch'te ayırt edilir.
    .map(([etiket, s]) => ({
      etiket,
      kare: s.blok.kare,
      n: s.blok.alternatif ? etiket : s.blok.kare,
      ...motoraGiden(s.blok.govde),
      kaynak: s.kaynak,
    }))
    .sort((a, b) => a.kare - b.kare || a.etiket.localeCompare(b.etiket, 'tr'));
  const ayracsiz = bloklar.filter((b) => !b.ayracli).map((b) => b.etiket);
  const bos = bloklar.filter((b) => !b.metin.trim()).map((b) => b.etiket);
  const ayrilmis = kuyrugaAyir(bloklar, esikOran);
  return { ...ayrilmis, csv: csvUret(ayrilmis), ayracsiz, bosGovde: bos };
}

// ---------------------------------------------------------------------------
const dogrudan = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (dogrudan) {
  const dir = process.argv[2];
  if (!dir || !existsSync(dir)) {
    process.stderr.write('kullanım: node scripts/basim-listesi.mjs "<proje klasörü>" [--yaz] [--csv]\n');
    process.exit(2);
  }
  const CSV = process.argv.includes('--csv');
  const YAZ = process.argv.includes('--yaz');
  const ad = basename(dir);

  // ── CSV: NB2 batch çıkışı. Kaynak PROMPTLAR'dır (start-frame), MOTION değil. ────────
  if (CSV) {
    const r = rapor(dir, { rol: 'promptlar' });
    if (r.hata) {
      process.stderr.write(`🔴 ${r.hata}: ${dir}\n`);
      if (r.kor?.length) process.stderr.write(`   (okundu ama SIFIR blok verdi: ${r.kor.join(', ')})\n`);
      process.exit(1);
    }
    const ei = process.argv.indexOf('--kuyruk-esik');
    const esikOran = ei >= 0 ? Number(process.argv[ei + 1]) : KUYRUK_ESIK;
    if (!(esikOran > 0 && esikOran <= 1)) {
      process.stderr.write('🔴 --kuyruk-esik 0 ile 1 arasında bir oran olmalı (örn. 0.5)\n');
      process.exit(2);
    }
    const c = csvHazirla(r, esikOran);
    const yuzde = c.hamToplam ? Math.round(100 - (c.kalanToplam / c.hamToplam) * 100) : 0;

    // Ölçüm ve kuyruk STDERR'e gider: `--csv > dosya.csv` yönlendirmesi bozulmasın.
    const e = (s) => process.stderr.write(`${s}\n`);
    e(`\n[csv] ${ad}`);
    e(`  kare      : ${c.N} · kaynak ${r.canli.length} dosya`
      + (r.dusen.length ? ` · ${r.dusen.length} yedek/eski düşürüldü` : ''));
    e(`  kuyruk    : ${c.satirlar.length ? yuzde : 0}% düştü (${c.hamToplam} → ${c.kalanToplam} karakter) · eşik ${c.esik}/${c.N} karede birebir`);
    for (const k of c.kuyruk) e(`     · ${k.slice(0, 60).replace(/\s+/gu, ' ')}…  (${k.length} karakter)`);
    // LEHÇE — "%0 düştü" sessiz bir no-op gibi görünmesin diye HER ZAMAN basılır.
    for (const g of c.lehceler) {
      e(`  ${g.etiket.padEnd(18)}: ${g.surum} sürüm · en yaygını ${g.enBuyuk}/${c.N} karede`
        + ` · ${g.tasiyan}/${c.N} kare bu satırı taşıyor`);
    }
    if (!c.kuyruk.length) {
      e('     ⚠ ORTAK KUYRUK YOK — CSV tam gövdeyi taşır (kayıp değil, yalnız daha uzun).');
      if (c.enYaygin.parca) {
        e(`       en yaygın parça ${c.enYaygin.sayi}/${c.N} karede (%${Math.round((c.enYaygin.sayi / c.N) * 100)})`
          + ` — eşik ${c.esik}. Proje birden çok lehçe taşıyor olabilir.`);
        e('       kararı Mami verir: --kuyruk-esik 0.5 eşiği düşürür, ama kuyruğu TAŞIMAYAN kareler');
        e('       style alanından o metni yine de yer — bu bir kalite kararıdır, ölçüm değil.');
      }
    }
    if (c.kuyruk.length && c.kuyrukEksik.length) {
      e(`     🔴 KUYRUĞU EKSİK TAŞIYAN ${c.kuyrukEksik.length} KARE: ${c.kuyrukEksik.slice(0, 12).join(', ')}`
        + `${c.kuyrukEksik.length > 12 ? ' …' : ''}`);
      e('        style alanına bir kez yapıştırılan metin bu karelere de uygulanır — kendi lehçelerini kaybederler.');
    }
    if (r.bos.length) e(`  🔴 BOŞ KARE : ${r.bos.join(', ')}`);
    if (r.sadeceEski.length) e(`  ⚠ yalnız eski sürüm: ${r.sadeceEski.join(', ')}`);
    if (c.ayracsiz.length) e(`  ⚠ ayraçsız blok (Türkçe not sızmış olabilir): ${c.ayracsiz.join(', ')}`);
    if (c.bosGovde.length) e(`  🔴 GÖVDESİ BOŞ: ${c.bosGovde.join(', ')}`);
    if (r.kor?.length) e(`  ⚠ sıfır blok veren dosya: ${r.kor.join(', ')}`);
    for (const [et, k] of r.catisma) e(`  ⚠ çakışma ${et}: ${[...new Set(k)].join(' → ')} (en yeni seçildi)`);

    if (YAZ) {
      const csvYol = join(dir, `${ad}_BASIM.csv`);
      const kuyYol = join(dir, `${ad}_BASIM-KUYRUK.txt`);
      writeFileSync(csvYol, c.csv, 'utf8');
      writeFileSync(kuyYol, [
        `${ad} — BATCH KUYRUĞU (style alanına BİR KEZ yapıştırılır, CSV'de YOK)`,
        `${c.N} karenin en az ${c.esik}'inde BİREBİR geçen parçalar. Kareye özel kalanlar CSV'de.`,
        '='.repeat(72), '', ...c.kuyruk.map((k) => `${k}\n`),
      ].join('\n'), 'utf8');
      e(`\n✅ ${csvYol}`);
      e(`✅ ${kuyYol}`);
    } else {
      process.stdout.write(c.csv);
      e('\n(dosyaya yazmak için --yaz · kuyruk metni yalnız --yaz ile dosyalanır)');
    }
    process.exit(0);
  }

  const r = rapor(dir);
  if (r.hata) { process.stderr.write(`🔴 ${r.hata}: ${dir}\n`); process.exit(1); }

  process.stdout.write(`\n${ad}\n${'─'.repeat(Math.min(72, ad.length + 8))}\n`);
  process.stdout.write(`kaynak dosya : ${r.canli.length} canlı`
    + (r.dusen.length ? ` · ${r.dusen.length} yedek/eski (düşürüldü: ${r.dusen.map((d) => d.ad).join(', ')})` : '') + '\n');
  process.stdout.write(`çözülen blok : ${r.secim.size}\n`);
  if (r.bos.length) process.stdout.write(`🔴 BOŞ KARE   : ${r.bos.join(', ')}\n`);
  if (r.sadeceEski.length) process.stdout.write(`⚠  yalnız eski: ${r.sadeceEski.join(', ')}\n`);
  for (const [e, k] of r.catisma) process.stdout.write(`⚠  çakışma ${e}: ${[...new Set(k)].join(' → ')} (en yeni seçildi)\n`);

  if (YAZ) {
    const hedef = join(dir, `${ad}_BASIM-LISTESI.txt`);
    writeFileSync(hedef, listeYaz(r, ad), 'utf8');
    process.stdout.write(`\n✅ yazıldı: ${hedef}\n`);
  } else {
    process.stdout.write('\n(dosya üretmek için --yaz)\n');
  }
}
