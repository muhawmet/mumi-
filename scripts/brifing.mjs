#!/usr/bin/env node
// BRİFİNG — plan modunun soru mimarisi. Otonom stüdyonun KAPISI.
//
// Mami'nin emri (2026-08-07): *"her işe başladığımda plan moduna geçsin, MAMILAS sitesini
// böyle egale ediyoruz. Planda öyle sorular sorman lazım ki kafam rahat 'anlamış, bitirir işi'
// diyebileyim."*
//
// NEDEN BU ORGAN VAR:
// Site bir FORM'du — alanları Mami dolduruyordu, sistem tarif üretiyordu. Bu organ formun
// tersidir: **cevapları ÖLÇÜMDEN türetip Mami'ye yalnız SEÇTİRİR.** Açık uçlu soru telefonda
// ve DEHB'de maliyetlidir; seçilebilir soru tek tuştur.
//
// Bu script SORMAZ ve YAZMAZ. Kaynağı ve repo durumunu okuyup **sorulacak soruları,
// önerilen cevapları ve her önerinin GEREKÇESİNİ** üretir. Soruyu Claude sorar, hükmü Mami verir.
//
//   node scripts/brifing.mjs "<kaynak.json|kaynak.txt>" [--proje "<ad>"] [--json]
//
// Altı kilit kapanmadan tek kare yazılmaz. Sıra rastgele değil: her cevap bir sonrakini daraltır.

import { existsSync, readFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const RAF_YOLU = path.join(REPO_ROOT, 'artifacts', 'element-rafi.json');

export class BrifingError extends Error {}
const fail = (mesaj) => { throw new BrifingError(mesaj); };

// ─── Ölçülmüş sabitler ────────────────────────────────────────────────────────
// Türkçe anlatım hızı. Ölçüm: Kütle projesinde plan 3:33 tahmin etti, gerçek VO 3:00 çıktı —
// yani kelime→saniye çevirimi sistematik olarak UZUN tahmin ediyordu. Bu sayı o sapmayla
// kalibre edildi ve YİNE DE tahmindir: gerçek VO indiği an ANIMATIC-0 bunu ezer.
export const KELIME_HIZI = 2.6;

/** Kaynağın duygusal rejimini ele veren kelimeler. Çatışma İCAT EDİLMEZ — müşteri revizesi. */
export const CATISMA_ISARETLERI = ['yalnız', 'dışla', 'ön yargı', 'önyargı', 'kavga', 'üzgün', 'ağla', 'korku', 'reddet', 'alay'];
export const OLUMLU_ISARETLER = ['gülümse', 'birlikte', 'paylaş', 'yardım', 'sevin', 'kutla', 'dost', 'el ele', 'başar'];

/** Pahalı risk sınıfları — canary seti bunlardan kurulur. Hepsi kareyle ölçülmüş kusurlar. */
export const RISK_SINIFLARI = Object.freeze([
  { ad: 'yazı', desen: /["“][^"”]{2,40}["”]|yaz[ıi]yor|tabela|levha|pankart|afiş|pano|defter|kitap/i,
    gerekce: 'Yazı, taşıyıcısı hareket ettiği an eriyor; duran yüzey şart. 56 klipte ölçüldü.' },
  { ad: 'anatomi', desen: /\bel\b|parmak|avuç|yüz yakın|portre|kucak|sarıl/i,
    gerekce: 'Donuk gövde = eriyen yüz. 34 klibin 26\'sında (%76) aynı kusur.' },
  { ad: 'mekanik', desen: /dişli|çark|pusula|kronometre|terazi|makine|mekaniz|vida|kaldıraç/i,
    gerekce: 'Katı/mekanik nesne motion\'da warp yiyor — geometri eriyor.' },
  { ad: 'kamera', desen: /dolly|orbit|whip|zoom|kaydır|döner kamera|takip çekim/i,
    gerekce: 'Güçlü kamera hareketi hem yazıyı hem kimliği bozuyor.' },
  { ad: 'kalabalık', desen: /kalabalık|sınıf dolusu|herkes|topluluk|grup halinde/i,
    gerekce: 'NB2 figür sayısı arttıkça kimliği kaybediyor; figür KESİLMEZ, SAYISI azaltılır.' },
]);

// ─── Türetimler ───────────────────────────────────────────────────────────────

// ─── .docx okuma — bağımlılıksız ──────────────────────────────────────────────
// Mami'nin kaynakları Word dosyası. Bugüne kadar bunlar ELLE metne çevriliyordu
// (`_HAZIRLIK/*.md`). Elle adım, atlanabilen adımdır. docx bir ZIP'tir; `word/document.xml`
// tek girdi olarak açılır. `unzip`/PowerShell'e bağlanmıyoruz — ortam varsayımı bu repoda
// dört kez sessiz no-op üretti.

/** ZIP merkezi dizininden tek bir girdiyi çıkarır. Yoksa null döner — sessiz boş metin ÜRETMEZ. */
export function zipGirdisi(tampon, aranan) {
  let eocd = -1;
  for (let i = tampon.length - 22; i >= 0 && i > tampon.length - 66_000; i -= 1) {
    if (tampon.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd === -1) return null;

  let ofset = tampon.readUInt32LE(eocd + 16);
  const adet = tampon.readUInt16LE(eocd + 10);
  for (let n = 0; n < adet; n += 1) {
    if (tampon.readUInt32LE(ofset) !== 0x02014b50) return null;
    const yontem = tampon.readUInt16LE(ofset + 10);
    const sikisik = tampon.readUInt32LE(ofset + 20);
    const adUzunluk = tampon.readUInt16LE(ofset + 28);
    const ekUzunluk = tampon.readUInt16LE(ofset + 30);
    const yorumUzunluk = tampon.readUInt16LE(ofset + 32);
    const yerelOfset = tampon.readUInt32LE(ofset + 42);
    const ad = tampon.toString('utf8', ofset + 46, ofset + 46 + adUzunluk);

    if (ad === aranan) {
      if (tampon.readUInt32LE(yerelOfset) !== 0x04034b50) return null;
      const yAd = tampon.readUInt16LE(yerelOfset + 26);
      const yEk = tampon.readUInt16LE(yerelOfset + 28);
      const bas = yerelOfset + 30 + yAd + yEk;
      const veri = tampon.subarray(bas, bas + sikisik);
      return yontem === 8 ? inflateRawSync(veri) : Buffer.from(veri);
    }
    ofset += 46 + adUzunluk + ekUzunluk + yorumUzunluk;
  }
  return null;
}

/** WordprocessingML → düz metin. Paragraf ve satır sonları korunur; biçim atılır. */
export function docxMetni(xml) {
  return String(xml)
    .replace(/<w:tab\b[^>]*\/>/g, '\t')
    .replace(/<w:br\b[^>]*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function kaynakOku(yol) {
  if (!existsSync(yol)) fail(`kaynak yok: ${yol}`);
  if (yol.toLowerCase().endsWith('.docx')) {
    const xml = zipGirdisi(readFileSync(yol), 'word/document.xml');
    if (!xml) fail(`.docx açılamadı (word/document.xml yok): ${yol}`);
    const metin = docxMetni(xml);
    if (!metin) fail(`.docx boş çıktı: ${yol} — sessiz boş brifing üretmiyorum`);
    return { ham: metin, veri: null, metin };
  }
  const ham = readFileSync(yol, 'utf8');
  if (yol.endsWith('.json')) {
    try {
      const veri = JSON.parse(ham);
      return { ham, veri, metin: JSON.stringify(veri) };
    } catch {
      fail(`kaynak JSON bozuk: ${yol}`);
    }
  }
  return { ham, veri: null, metin: ham };
}

/** Kaynağın tonu KİLİTTİR: olumlu ve çatışmasız kaynak, olumlu ve çatışmasız teslim edilir. */
export function tonOlc(metin) {
  const kucuk = String(metin).toLocaleLowerCase('tr');
  const say = (liste) => liste.filter((k) => kucuk.includes(k)).length;
  const catisma = say(CATISMA_ISARETLERI);
  const olumlu = say(OLUMLU_ISARETLER);
  const rejim = catisma > olumlu ? 'gerilimli' : catisma === 0 ? 'çatışmasız' : 'karışık';
  return { rejim, catisma, olumlu };
}

export function riskTara(metin) {
  return RISK_SINIFLARI
    .filter((r) => r.desen.test(metin))
    .map((r) => ({ ad: r.ad, gerekce: r.gerekce }));
}

export function sureTahmini(metin) {
  const kelime = String(metin).trim().split(/\s+/).filter(Boolean).length;
  const saniye = Math.round(kelime / KELIME_HIZI);
  return { kelime, saniye, biçim: `${Math.floor(saniye / 60)}:${String(saniye % 60).padStart(2, '0')}` };
}

export function rafOku(yol = RAF_YOLU) {
  if (!existsSync(yol)) return { elementler: [], kaynak: null };
  try {
    const veri = JSON.parse(readFileSync(yol, 'utf8'));
    return { elementler: veri.elementler ?? [], kaynak: veri.guncellendi ?? null };
  } catch {
    return { elementler: [], kaynak: null };
  }
}

/**
 * 🔴 SÜREKLİLİK BİR EŞİKTİR, İSİM LİSTESİ DEĞİL. Mami (2026-08-07): *"her şeyde de 2-3'ten
 * fazla görünüyorsa videoda devamlılık olur, üretiriz başta. Mesela kediyse `@kedi` diye
 * üretiriz; sonra bir videoda kedi kullanırsak onu kullanırsın."*
 *
 * Türkçe eklemeli bir dil: "kedi / kediyi / kedinin" ayrı token. Bu yüzden gövde tahmini
 * KABA yapılıyor — ilk dört harfe göre kümeleniyor. Dört, beş değil: Türkçe kökler kısa ve
 * beş harfte "kedi" kendi çekimlerinden ayrı düşüyordu (ölçüldü). Bu bir dilbilim iddiası
 * DEĞİL, bir ÖNERİ yüzeyi: liste Mami'ye gider, eleme onundur.
 */
export const ELEMENT_ESIGI = 3;
export const GOVDE_UZUNLUK = 4;
// İki grup: (a) dilin taşıyıcı kelimeleri, (b) SENARYO ZANAATININ kelimeleri. İkincisi kritik —
// senaryo dosyasında "sahne", "görsel", "kapanış" doğal olarak onlarca kez geçiyor ve eşiği
// geçiyor, ama hiçbiri çizilebilir bir öğe değil. Filtrelenmezse liste gürültüye boğuluyor.
export const DURAK_KELIMELER = new Set([
  've', 'ile', 'bir', 'bu', 'şu', 'için', 'gibi', 'daha', 'çok', 'ama', 'ancak', 'sonra',
  'önce', 'kadar', 'her', 'hepsi', 'kendi', 'olan', 'olarak', 'diye', 'değil', 'yok', 'var',
  'ben', 'sen', 'biz', 'siz', 'onlar', 'şey', 'zaman', 'olur', 'oldu', 'yapar', 'eder',
  // senaryo zanaatı
  'sahne', 'sahnede', 'plan', 'kare', 'video', 'saniye', 'çekim', 'kamera', 'görüntü',
  'görsel', 'metin', 'yazı', 'ekran', 'ses', 'müzik', 'anlatıcı', 'seslendirme', 'efekt',
  'giriş', 'kapanış', 'bölüm', 'başlık', 'açıklama', 'konu', 'ders', 'ünite', 'sınıf',
  'öğrenci', 'öğretmen', 'not', 'örnek', 'soru', 'cevap', 'süre', 'geçiş',
]);
/** Aday listesi bir öneri yüzeyi; uzunsa okunmuyor. Tavan konur ve kalanın sayısı söylenir. */
export const ADAY_TAVANI = 12;

export function tekrarEdenler(metin, { esik = ELEMENT_ESIGI } = {}) {
  const tokenlar = String(metin).toLocaleLowerCase('tr')
    .split(/[^a-zçğıöşü]+/i)
    .filter((t) => t.length >= 4 && !DURAK_KELIMELER.has(t));

  const kume = new Map();
  for (const t of tokenlar) {
    const govde = t.slice(0, GOVDE_UZUNLUK);
    const kayit = kume.get(govde) ?? { govde, adet: 0, bicimler: new Set() };
    kayit.adet += 1;
    kayit.bicimler.add(t);
    kume.set(govde, kayit);
  }

  return [...kume.values()]
    .filter((k) => k.adet >= esik)
    .map((k) => ({
      ad: [...k.bicimler].sort((a, b) => a.length - b.length)[0],
      adet: k.adet,
      bicimler: [...k.bicimler],
    }))
    .sort((a, b) => b.adet - a.adet);
}

/**
 * Kaynakta geçen tekrar eden öğeleri rafla eşler. Rafta olmayan = üretilecek element.
 * Eşleşme KELİME SINIRINDA yapılır — substring eşleşmesi `iye`yi "sahibiye"nin içinde bulup
 * yanlış rafa bağlıyordu; yanlış eşleşme yanlış referans, yanlış referans yanlış kimlik demek.
 */
export function elementEslestir(metin, elementler) {
  const kucuk = String(metin).toLocaleLowerCase('tr');
  const rafta = elementler.filter((e) => {
    const ad = String(e.ad).toLocaleLowerCase('tr');
    return new RegExp(`(^|[^a-zçğıöşü])${ad}([^a-zçğıöşü]|$)`, 'i').test(kucuk);
  });
  const raftaAdlar = new Set(rafta.map((e) => String(e.ad).toLocaleLowerCase('tr')));
  const tumAdaylar = tekrarEdenler(metin).filter((t) => !raftaAdlar.has(t.ad));
  return {
    rafta,
    rafSayisi: elementler.length,
    adaylar: tumAdaylar.slice(0, ADAY_TAVANI),
    adayToplam: tumAdaylar.length,
  };
}

// ─── Soru mimarisi ────────────────────────────────────────────────────────────
// Her kilit tek soru, her soru seçilebilir, her önerinin arkasında ÖLÇÜM var.
// "Kafam rahat" hissi buradan doğar: Mami neyin neden önerildiğini tek satırda görür.

export function sorulariKur(kaynak, { proje, raf = rafOku() } = {}) {
  const metin = kaynak.metin;
  const ton = tonOlc(metin);
  const riskler = riskTara(metin);
  const sure = sureTahmini(metin);
  const element = elementEslestir(metin, raf.elementler);

  return [
    {
      kilit: 0,
      baslik: 'KAYNAK VE TON',
      soru: `Kaynağın duygusal rejimi **${ton.rejim}** görünüyor. Teslim de aynı rejimde mi kalsın?`,
      kanit: `çatışma işareti ${ton.catisma} · olumlu işaret ${ton.olumlu}`,
      gerekce: 'Müşteri revizesi (2026-08-04): kaynakta olmayan gerilim icat edilmişti. Kaynağın tonu dünya kilidi kadar bağlayıcı.',
      secenekler: [
        { etiket: `Aynı kalsın (${ton.rejim})`, onerilen: true, aciklama: 'Kaynağa sadık. Gerilim çatışmadan değil MERAKTAN doğar.' },
        { etiket: 'Daha sıcak / daha olumlu', aciklama: 'Kaynaktan bir tık yumuşak.' },
        { etiket: 'Daha ağır / dramatik', aciklama: '⚠ Kaynakta yoksa karakterlere kusur yüklemek demek — ölçülmüş revize sebebi.' },
      ],
    },
    {
      kilit: 1,
      baslik: 'DÜNYA VE REGISTER',
      soru: 'Hangi dünyada ve hangi register\'da çalışıyoruz?',
      kanit: 'aday dünyalar `node scripts/dunya-onerisi.mjs` ile listelenir',
      gerekce: 'Register bilinmeden kare yazılmaz: EDU\'nun "sıcak mat ten"i REAL\'de o dünyanın kendi negatifini ihlal ediyor.',
      secenekler: [
        { etiket: 'EDU (pixar_3d_edu)', onerilen: true, aciklama: 'Çocuk eğitim materyalinin ölçülmüş varsayılanı; akıllı tahta, Türk cast.' },
        { etiket: 'REAL', aciklama: 'Fotogerçekçi. §2R/§3R şablonları geçerli olur.' },
        { etiket: 'STY (üsluplu)', aciklama: 'Fiziksel medyum seçilir (boya, yüzey, doku) — motor üslubu değil MEDYUMU dinliyor.' },
      ],
    },
    {
      kilit: 2,
      baslik: 'CAST VE ELEMENT',
      soru: [
        element.rafta.length
          ? `Rafta eşleşen ${element.rafta.length} element: **${element.rafta.map((e) => e.ad).join(', ')}**.`
          : `Rafta (${element.rafSayisi} element) bu kaynakla eşleşen çıkmadı.`,
        element.adaylar.length
          ? `Kaynakta ${ELEMENT_ESIGI}+ kez geçen ${element.adayToplam} aday var, en sık ${Math.min(8, element.adaylar.length)}\'i: **${element.adaylar.slice(0, 8).map((a) => `@${a.ad} (${a.adet})`).join(' · ')}**. Hangileri element olsun? (Liste ham — soyut kelimeler de düşüyor, eleme senin.)`
          : `Kaynakta ${ELEMENT_ESIGI}+ kez tekrar eden öğe çıkmadı.`,
      ].join(' '),
      kanit: element.rafSayisi ? `element rafı: ${element.rafSayisi} kayıt · eşik ${ELEMENT_ESIGI}+ tekrar` : 'element rafı boş ya da indekslenmemiş',
      gerekce: 'Süreklilik bir isim listesi değil, bir EŞİK: bir öğe videoda 3+ kez görünüyorsa element olur — karakter, hayvan, nesne, mekân fark etmez. Referanssız basılan karede Efe 12 yaşında çocuk yerine ~35\'lik yetişkin geldi.',
      secenekler: [
        { etiket: 'Raftakiler + adayları bas', onerilen: element.adaylar.length > 0, aciklama: 'Eşiği geçen her öğe 1:1 element olur, rafa yazılır; sonraki videolarda bedava gelir.' },
        { etiket: 'Yalnız raftakileri kullan', onerilen: element.adaylar.length === 0 && element.rafta.length > 0, aciklama: 'Yeni kredi yanmaz; bu videoda eşiği geçen yeni öğe yok.' },
        { etiket: 'Adayları ben eleyeyim', aciklama: 'Liste sana gelir, hangisi element olacağını sen seçersin — ham listede soyut kelimeler de var.' },
        // Ne raf eşleşmesi ne aday varsa dürüst öneri budur. Öneri boş kalırsa Mami tek tuşla
        // karar veremez; kapı işini yapmamış olur.
        { etiket: 'Tekrar eden öğe yok — element katmanını atla', onerilen: element.adaylar.length === 0 && element.rafta.length === 0, aciklama: 'Gerçekten tek seferlik iş; boşuna element basılmaz.' },
      ],
    },
    {
      kilit: 3,
      baslik: 'ŞEKİL VE RİTİM',
      soru: `Kaynak ~${sure.kelime} kelime → tahmini **${sure.biçim}**. Hedef şekil bu mu?`,
      kanit: `${sure.kelime} kelime ÷ ${KELIME_HIZI} kelime/sn`,
      gerekce: 'Tahmin sistematik olarak uzun çıkıyor (Kütle: plan 3:33, gerçek 3:00). Gerçek VO indiği an ANIMATIC-0 bu sayıyı ezer.',
      secenekler: [
        { etiket: `Bu uzunluk (${sure.biçim})`, onerilen: true, aciklama: 'Kaynak neyse o. Kesin süre gerçek VO ile netleşir.' },
        { etiket: 'Daha kısa — 60-90 sn', aciklama: 'Portfolyo parçası için yoğunlaştırılmış hâl.' },
        { etiket: 'Sekans omurgasını birlikte kuralım', aciklama: '`/mamilas-studyo` açılır: soru → kanıt → dönüşüm → köprü.' },
      ],
    },
    {
      kilit: 4,
      baslik: 'RİSK VE CANARY',
      soru: riskler.length
        ? `Bu kaynakta ${riskler.length} pahalı risk sınıfı var: **${riskler.map((r) => r.ad).join(' · ')}**. Canary seti bunlardan kurulsun mu?`
        : 'Kaynakta bilinen pahalı risk sınıfı görünmüyor. Canary yalnız intro + dünya testi olsun mu?',
      kanit: riskler.length ? riskler.map((r) => `${r.ad}: ${r.gerekce}`).join('\n') : 'risk taraması temiz',
      gerekce: 'Canary\'siz basılan 6 klibin 6\'sı bozuk çıktı. Kilit dosyası yoksa üretim fazı KODLA reddediliyor.',
      secenekler: [
        { etiket: '2 dünya canary → onay → 6 risk canary', onerilen: true, aciklama: 'Önce ucuz dünya testi; dünya yanlışsa 6 pahalı kare hiç basılmaz.' },
        { etiket: 'Tek seferde 8 canary', aciklama: 'Daha hızlı, dünya yanlışsa 8 karelik zarar.' },
        { etiket: 'Canary\'yi atla', aciklama: '⚠ Ölçülmüş sonuç: 6/6 bozuk. Yalnız bilinen ve daha önce basılmış bir dünyada.' },
      ],
    },
    {
      kilit: 5,
      baslik: 'BÜTÇE VE CÜZDAN',
      soru: 'Hangi cüzdandan harcanacak?',
      kanit: 'gerçek fiyat `node scripts/rota.mjs fiyat` ile kredi yakmadan okunur',
      gerekce: 'Mami\'nin kuralı: önce Magnific kredisi bitirilir; Higgsfield daha pahalı, ekstra araç olarak durur.',
      secenekler: [
        { etiket: 'Magnific (ana hat)', onerilen: true, aciklama: 'NB2 kare + Kling 3.0 klip + 3 referans. Varsayılan.' },
        { etiket: 'Higgsfield (ekstra)', aciklama: 'Element referansı ve 4k gerektiğinde. Daha pahalı — bilerek seçilir.' },
        { etiket: 'Karışık — kare Magnific, klip Higgsfield', aciklama: 'Yalnız ölçülmüş bir gerekçe varsa.' },
      ],
    },
  ].map((s) => ({ ...s, proje: proje ?? null }));
}

export function markdown(sorular, kaynakYolu) {
  const satirlar = [
    '# BRİFİNG — plan modu kilit görüşmesi',
    '',
    `> Kaynak: \`${kaynakYolu}\``,
    '> Altı kilit kapanmadan tek kare yazılmaz. Her önerinin arkasında ölçüm var.',
    '',
  ];
  for (const s of sorular) {
    satirlar.push(`## KİLİT ${s.kilit} — ${s.baslik}`, '', s.soru, '');
    for (const o of s.secenekler) {
      satirlar.push(`- ${o.onerilen ? '**◉**' : '○'} **${o.etiket}** — ${o.aciklama}`);
    }
    satirlar.push('', `*kanıt:* ${s.kanit}`, `*neden:* ${s.gerekce}`, '');
  }
  satirlar.push('---', '',
    'Kilitler kapanınca sırayla: `is-emri.mjs ac` → referans envanteri → `dunya-kilidi.mjs` →',
    'kare yazımı → `prompt-lint.mjs` → canary → `CANARY-LOCK` → üretim.');
  return satirlar.join('\n');
}

export function usage() {
  return [
    'BRİFİNG — plan modunun soru mimarisi (otonom stüdyonun kapısı)',
    '',
    '  node scripts/brifing.mjs "<kaynak.json|kaynak.txt>" [--proje "<ad>"] [--json]',
    '',
    'Çıktı: altı kilit, her biri seçilebilir cevaplarla ve ölçülmüş gerekçeyle.',
    'Script SORMAZ — soruyu Claude sorar, hükmü Mami verir.',
  ].join('\n');
}

export function main(argv) {
  const konum = argv.filter((a) => !a.startsWith('--'));
  if (!konum.length) return usage();
  const i = argv.indexOf('--proje');
  const proje = i === -1 ? undefined : argv[i + 1];
  const kaynak = kaynakOku(konum[0]);
  const sorular = sorulariKur(kaynak, { proje });
  return argv.includes('--json') ? JSON.stringify(sorular, null, 2) : markdown(sorular, konum[0]);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(main(process.argv.slice(2)));
  } catch (hata) {
    if (hata instanceof BrifingError) { console.error(`❌ ${hata.message}`); process.exit(2); }
    throw hata;
  }
}
