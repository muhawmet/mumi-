#!/usr/bin/env node
// PROMPT TÜRÜ — sözleşme ve sınıflandırıcı.
//
// Kanon: agents/PROMPT-YASASI.md §0.7 · plan: docs/ai/PROMPT-SISTEMI-ARINDIRMA.md
//
// NEDEN VAR — ölçüldü (2026-08-05):
// Sistemin tek bir "prompt" kavramı vardı ve üç ayrı iş aynı kurallara sokuluyordu.
// Sonucu diskte görünür:
//  · `reference-plate` diye bir tür YOKTU; plaka, sahne karesiyle aynı slot bataryasına giriyordu.
//  · `reference-edit` linterde TEK kontrol alıp `return` ediyordu — bir edit'e dünya kuyruğu,
//    kamera satırı ya da karakter tarifi sızsa hiçbir şey görmüyordu. Sızdı: @efe edit'i
//    709 karakterlik STYLE + LIGHT AND PALETTE + 191 kelimelik global NEGATIVE taşıyor.
//  · Referans dosyası, kuyruk tekrarını denetleyen iki kurala YAPISAL OLARAK görünmezdi
//    (`blockKind !== 'frame'`), ve %55-63 birebir yapıştırma tam orada birikti.
//
// BU MODÜL PROMPT YAZMAZ. Ne kelime ekler, ne kelime önerir, ne stil/kamera seçer.
// Yalnız şunu söyler: bu blok hangi türdür, ve o türün TAŞIYAMAYACAĞI bir şey taşıyor mu.

/** Üç tür. Dördüncüsü `motion` — o kendi ölçenine (motion-lint.mjs) aittir. */
export const TURLER = {
  SAHNE: 'scene-start-frame',
  PLAKA: 'reference-plate',
  EDIT: 'reference-edit',
  MOTION: 'motion',
};

/**
 * Referans-EDİT imzası. Kaynak: gerçek dosyalar + PROMPT-YASASI.md:279-280.
 * Bir edit "bu görüntüyü koru, YALNIZ şunu değiştir" der; bu cümle olmadan edit değildir.
 */
export const EDIT_IMZASI = [
  /\bchange\s+only\b/i,
  /\bkeep\s+everything\s+else\s+identical\b/i,
  /\buse\s+th(is|e)\s+referenced\s+image\b/i,
  /\bkeep\s+this\s+exact\s+character\b/i,
  /SIFIRDAN\s+ÜRETİLMEYECEK/i,
  /referans-edit/i,
];

/** Kimlik plakası imzası — nesneyi/kişiyi TANITAN, sahnesiz blok. */
export const PLAKA_IMZASI = [
  /^TAŞIR\s*:/mu,
  /\bplain\s+(uninterrupted\s+)?(warm-neutral\s+)?background\b/i,
  /\bon\s+a\s+plain\s+warm-neutral\s+surface\b/i,
  /\bno\s+room,\s*no\s+furniture\b/i,
];

/** Dünya kuyruğunun üç satırı. Bir EDİT'te bunların HİÇBİRİ olamaz. */
export const KUYRUK_SATIRLARI = [
  { ad: 'STYLE', re: /^STYLE\s*:/mu },
  { ad: 'LIGHT AND PALETTE', re: /^LIGHT AND PALETTE\s*:/mu },
  { ad: 'NEGATIVE', re: /^(?:FRAME |FIREWALL |GLOBAL |WORLD )?NEGATIVE\s*:/mu },
];

/** Kamera kararı imzası — objektif/diyafram/kadraj mesafesi. */
export const KAMERA_RE = /\b\d{2,3}\s*mm\b|\blens\s+at\s+f\/|\bf\/\d/i;

/** Motion imzası — prompt-lint ile AYNI aile; ikinci kopya değil, tek tanım burada. */
export const MOTION_RE = /\bthe clip (opens|begins)\b|\bcamera (pushes|pulls|orbits|dollies|tracks|cranes)\b|^KAMERA NİYETİ\s*:/im;

const herhangi = (liste, metin) => liste.some((re) => re.test(metin));

/**
 * Bir bloğun türünü söyler. Sıra ÖNEMLİ: edit imzası en spesifik olandır ve önce sorulur,
 * çünkü bir edit metni plaka gibi de okunabilir (ikisi de nesne tarif eder).
 *
 * @param {string} govde blok metni
 * @param {{dosyaRolu?: 'promptlar'|'referans'|'motion'}} secenekler dosya adı ipucu (zorunlu değil)
 */
export function promptTuru(govde, secenekler = {}) {
  const metin = String(govde ?? '').replace(/\r\n/g, '\n');
  if (secenekler.dosyaRolu === 'motion') return TURLER.MOTION;
  if (herhangi(EDIT_IMZASI, metin)) return TURLER.EDIT;

  const kuyrukVar = KUYRUK_SATIRLARI.some((k) => k.re.test(metin));
  if (!kuyrukVar && MOTION_RE.test(metin)) return TURLER.MOTION;

  if (herhangi(PLAKA_IMZASI, metin)) return TURLER.PLAKA;
  if (secenekler.dosyaRolu === 'referans') return TURLER.PLAKA;
  return TURLER.SAHNE;
}

/**
 * TÜR SÖZLEŞMESİ — her türün TAŞIYAMAYACAĞI şeyler.
 *
 * ⚠ Burada "taşımalı" listesi BİLEREK yok. Bir türün ne taşıyacağına Claude karar verir;
 * sözleşme yalnız türler arası SIZINTIYI engeller. Yasak listesi büyütülmez: buraya bir
 * madde ancak diskte ölçülmüş bir sızıntıyla girer.
 */
export const TUR_SOZLESMESI = {
  [TURLER.EDIT]: {
    aciklama: 'Referans-edit yalnız DELTA taşır: "bu görüntüyü kullan, YALNIZ şunu değiştir".',
    tasiyamaz: [
      {
        key: 'edit-dunya-kuyrugu',
        bul: (m) => KUYRUK_SATIRLARI.filter((k) => k.re.test(m)).map((k) => k.ad),
        mesaj: (bulunan) => `referans-edit dünya kuyruğu taşıyor (${bulunan.join(' · ')}) — `
          + 'edit kaynak görüntüyü KORUR; dünyayı, ışığı ve global negatifi yeniden kurmak '
          + 'kaynağı yeniden ışıklandırmaktır',
      },
      {
        key: 'edit-kamera',
        bul: (m) => (KAMERA_RE.test(m) ? [m.match(KAMERA_RE)[0]] : []),
        mesaj: (bulunan) => `referans-edit kamera kararı taşıyor (${bulunan[0]}) — `
          + 'kadraj ve objektif kaynağın kendisinden gelir, edit onu değiştiremez',
      },
    ],
    zorunlu: [
      {
        key: 'edit-koruma-cumlesi',
        test: (m) => /\bkeep\b[\s\S]{0,80}\b(identical|the same|exact)\b/i.test(m)
          || /\bchange\s+only\b/i.test(m),
        mesaj: 'referans-edit\'te koruma cümlesi yok — neyin DEĞİŞMEYECEĞİ yazılmazsa '
          + 'motor her şeyi yeniden üretir',
      },
    ],
  },

  [TURLER.PLAKA]: {
    aciklama: 'Referans plakası yeniden kullanılabilir DNA taşır; sahnenin kadrajını ve olayını taşımaz.',
    // ⚠ BURASI BİLEREK BOŞ. İlk denemede bir `plaka-sahne-olayi` kuralı yazıldı (fiil arıyordu)
    // ve DÖRT plakanın İKİSİNDE yanlış alarm verdi: "a dark stone counter RUNS along the near
    // wall" bir sahne olayı değil, bir mimari tariftir. Yanlış alarm da kusurdur ve bu turun
    // konusu tam olarak "ölçen yaratıcı karar vermesin"dir — kural yamanmadı, SİLİNDİ.
    // Plakanın sahne taşıyıp taşımadığı bir ANLAM sorusudur; onu Claude okur, ölçen değil.
    tasiyamaz: [],
    zorunlu: [
      {
        key: 'plaka-tasimaz',
        test: (m) => /^TAŞIMAZ\s*:/mu.test(m),
        mesaj: 'plakada TAŞIMAZ satırı yok — neyin sahneye SIZMAYACAĞI yazılmazsa '
          + 'plakanın kendi kadrajı ithal oluyor (ölçüldü: ayak kadrajda 7/7 kötü kare, 0/4 iyi)',
      },
    ],
  },

  [TURLER.SAHNE]: {
    aciklama: 'Sahne karesi hikâye anını, kompozisyonu, ışığı, malzemeyi ve KARE-ÖZEL negatifi taşır.',
    tasiyamaz: [],
    zorunlu: [],
  },

  [TURLER.MOTION]: {
    aciklama: 'Motion kendi ölçenine aittir (scripts/motion-lint.mjs).',
    tasiyamaz: [],
    zorunlu: [],
  },
};

/**
 * Bir bloğu KENDİ TÜRÜNÜN sözleşmesine göre ölçer.
 * Estetik hüküm vermez; yalnız tür sızıntısı ve türün zorunlu alanı.
 */
export function lintTur(govde, secenekler = {}) {
  const metin = String(govde ?? '').replace(/\r\n/g, '\n');
  const tur = secenekler.tur ?? promptTuru(metin, secenekler);
  const sozlesme = TUR_SOZLESMESI[tur] ?? { tasiyamaz: [], zorunlu: [] };
  const kirmizi = [];

  for (const kural of sozlesme.tasiyamaz) {
    const bulunan = kural.bul(metin);
    if (bulunan.length) kirmizi.push({ key: kural.key, msg: kural.mesaj(bulunan) });
  }
  for (const kural of sozlesme.zorunlu) {
    if (!kural.test(metin)) kirmizi.push({ key: kural.key, msg: kural.mesaj });
  }
  return { tur, kirmizi };
}

/**
 * Referans dosyasını bloklara ayırır.
 *
 * ⚠ BİR REFERANS BLOĞU İKİ PARÇADIR ve ayrılırsa ölçüm YALAN söyler:
 *   başlık bölümü → TAŞIR / TAŞIMAZ / KAPSAM / KAYNAK (sözleşme)
 *   `-----` sonrası → motora giden prompt gövdesi (kuyruk buradadır)
 * İkisi ayrı ölçülürse "TAŞIMAZ yok" ve "kuyruk var" ayrı bloklara düşer; ikisi de yanlış olur.
 * Ölçüldü: ilk denemede tam bu oldu.
 *
 * @returns {Array<{handle: string|null, baslik: string, tam: string, govde: string, satir: number}>}
 */
export function parseReferansBloklari(metin) {
  const satirlar = String(metin ?? '').replace(/\r\n/g, '\n').split('\n');
  // Başlık: `1 · @kedi — EV KEDİSİ` ya da `5 · @efe — GARDIROP VARYANTI (…)`
  const BASLIK_RE = /^\s*\d+\s*[·.\-]\s*(@[a-z0-9çğıöşü_-]+)\s*[—–-]/iu;
  const baslangic = [];
  for (let i = 0; i < satirlar.length; i += 1) {
    const m = BASLIK_RE.exec(satirlar[i]);
    if (m) baslangic.push({ i, handle: m[1].toLowerCase(), baslik: satirlar[i].trim() });
  }
  const bloklar = [];
  for (let n = 0; n < baslangic.length; n += 1) {
    const bas = baslangic[n];
    // Bir sonraki başlığın ÜSTÜNDEKİ `====` çizgisine kadar; yoksa dosya sonuna kadar.
    let son = n + 1 < baslangic.length ? baslangic[n + 1].i : satirlar.length;
    while (son > bas.i + 1 && /^\s*[=]{5,}\s*$/u.test(satirlar[son - 1])) son -= 1;
    const tam = satirlar.slice(bas.i, son).join('\n');
    const ayrac = tam.search(/^-{5,}$/mu);
    const govde = ayrac >= 0 ? tam.slice(ayrac).replace(/^-{5,}$/mu, '').trim() : '';
    // Gövdesi olmayan satır bir BLOK DEĞİLDİR. Aynı dosyada `1. @maket — 14 karede dönüyor…`
    // biçiminde bir BASIM SIRASI listesi var; başlık desenine uyuyor ama motora giden metni
    // yok. Ölçüldü: ilk denemede o dört satır dört sahte blok üretti ve dördü de kırmızı yandı.
    if (!govde) continue;
    bloklar.push({ handle: bas.handle, baslik: bas.baslik, tam, govde, satir: bas.i + 1 });
  }
  return bloklar;
}

/** Dosya adından rol tahmini — ipucu, hüküm değil. */
export function dosyaRolu(dosyaAdi = '') {
  const ad = dosyaAdi.toLowerCase();
  if (/_referans-promptlari|_referanslar/.test(ad)) return 'referans';
  if (/[/\\]motion[/\\]|_motion/.test(ad)) return 'motion';
  return 'promptlar';
}
