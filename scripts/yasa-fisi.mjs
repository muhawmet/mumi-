#!/usr/bin/env node
// YASA FİŞİ — tek kanondan kare-başı okuma planı derler.
//
// ────────────────────────────────────────────────────────────────────────────
// NEDEN VAR
//
// `agents/PROMPT-YASASI.md` 1186 satır ve büyüyor. Bir kare yazılmadan önce TAMAMI
// okunamaz — bugünkü çözüm ajanın "o gün okumuş olmasına" güveniyor, yani yasanın
// uygulanması RASTLANTISAL. Ölçülmüş sonucu Mami'nin kendi cümlesi: *"özgür olduğumuz
// tarlada çit çektik, içinde takılıyoruz"* — okunamayacak kadar büyüyen yasa çite dönüşür.
//
// Üç bilinen seçenek de kötüydü: (i) yasayı BÖL → iki kanon doğar, biri bayatlar;
// (ii) KISALT → ölçülmüş bilgi kaybı; (iii) BIRAK → uygulanma rastlantısal kalır.
//
// DÖRDÜNCÜSÜ: yasa tek kalır, bu araç ondan **kare-özel bir OKUMA PLANI** derler.
// Fiş yasanın kopyası DEĞİLDİR — satır aralığı ve gerekçe taşır. İkinci kanon doğmaz,
// çünkü fişte hüküm yoktur: hüküm hep kaynaktadır.
//
// ────────────────────────────────────────────────────────────────────────────
// DRIFT KAPISI — bu dosyanın en önemli parçası
//
// Bu depoda 10 kez ölçülen kusur sınıfı: *doğrulayıcı, ölçtüğü şeyin YERLEŞİMİNİ
// varsayıyor ve sessizce yeşil kalıyor.* Bir başlık eşleme tablosu tam olarak bu
// riski taşır — yasadaki başlık yeniden adlandırılınca tablo sessizce boş döner.
//
// O yüzden: eşleşmeyen HER kalıp ÖLÜMCÜL HATADIR. Fiş üretilmez, hata basılır.
// Boş fiş "temiz" değildir; boş fiş "tablo bayatladı" demektir.
//
// Kullanım:
//   node scripts/yasa-fisi.mjs --register=edu --yuz --yazi --cocuk
//   node scripts/yasa-fisi.mjs --register=edu --motion --kati
//   node scripts/yasa-fisi.mjs --kare <dosya>        (özellikleri metinden çıkarır)
// ────────────────────────────────────────────────────────────────────────────

import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const YASA_YOLU = join(KOK, 'agents', 'PROMPT-YASASI.md');

// ---------------------------------------------------------------------------
// 1. Yasayı bölümlere ayır
// ---------------------------------------------------------------------------
export function bolumleriCikar(metin) {
  const satirlar = metin.split('\n');
  const bolumler = [];
  satirlar.forEach((l, i) => {
    const m = /^(#{2,3})\s+(.*)$/.exec(l);
    if (!m) return;
    bolumler.push({ seviye: m[1].length, baslik: m[2].trim(), bas: i + 1, son: null });
  });
  bolumler.forEach((b, i) => {
    b.son = i + 1 < bolumler.length ? bolumler[i + 1].bas - 1 : satirlar.length;
  });
  return bolumler;
}

// ---------------------------------------------------------------------------
// 2. KOŞUL → BAŞLIK tablosu
//
// `kalip` bir RegExp'tir ve yasadaki GERÇEK başlığa vurmak ZORUNDADIR — vurmazsa
// araç durur. `nedenFise` satırı fişte görünür: ajan neden okuduğunu bilir.
// ---------------------------------------------------------------------------
export const TABLO = [
  // — HER KAREDE —
  { id: 'ruh', kalip: /^ANİMASYONUN İZİN VERDİĞİ/i, hep: true,
    neden: '§0 — gerçek-video refleksini kesen sınama. AYRICALIK satırı buradan yazılır.' },
  { id: 'cit', kalip: /^İKİ TÜR ÇİT VAR/i, hep: true,
    neden: 'Hangi yasak FİZİK (kalır), hangisi ZİHNİYET (sökülür).' },
  { id: 'kistas', kalip: /§1a — KISTAS SIRASI/i, hep: true,
    neden: 'Çatışmada hangi kıstas kazanır — tek kaynak.' },
  { id: 'template', kalip: /^2\. START-FRAME TEMPLATE/i, kosul: (f) => !f.motion,
    neden: 'Slot sırası bağlayıcı.' },
  { id: 'yukum-ayricalik', kalip: /§2ø⁺ — YÜKÜM ve AYRICALIK/i, kosul: (f) => !f.motion,
    neden: 'Kapının NE SORDUĞU — 16 kusurun 8\'i YÜKÜM satırıyla kesiliyordu.' },
  { id: 'fikir', kalip: /§2ø — FİKİR/i, kosul: (f) => !f.motion,
    neden: 'Yasa TABANDIR, tavan değil.' },
  { id: 'feda', kalip: /§2c — FEDA/i, kosul: (f) => !f.motion,
    neden: 'Her şeyin okunduğu kare AI karesidir.' },
  { id: 'motor-davranis', kalip: /§2b — MOTORUN ÖLÇÜLEN DAVRANIŞI/i, kosul: (f) => !f.motion,
    neden: 'Motorun ölçülmüş tepkileri — ton değil davranış yaz.' },

  // — KOŞULLU —
  { id: 'plan-karari', kalip: /§2a — PLAN KARARI/i, kosul: (f) => !f.motion,
    neden: 'Slotlar dolu ama kare çirkin olabilir.' },
  { id: 'revize-madeni', kalip: /§2d — REVİZE MADENİ/i, kosul: (f) => !f.motion,
    neden: '54 karenin 30\'u geri geldi — kusur madeni.' },
  { id: 'kalici-kilit', kalip: /^Kalıcı kilitler/i, kosul: (f) => !f.motion,
    neden: 'Her karede geçerli kilitler.' },
  { id: 'tag', kalip: /^@tag disiplini/i, kosul: (f) => f.tag,
    neden: '@handle taşıyan kare — kimliği yeniden tarif etme.' },
  { id: 'kavram-isik', kalip: /^Kavram izi çizilir/i, kosul: (f) => f.kavram,
    neden: 'Kavram OK olarak değil IŞIK olarak çizilir.' },
  { id: 'kapsam-edu', kalip: /^🔴 KAPSAM/i, kosul: (f) => f.register === 'edu',
    neden: 'Bu dört kısıt YALNIZ EDU\'da geçerli.' },

  // REAL register
  { id: 'real', kalip: /^2R\. REAL REGISTER/i, kosul: (f) => f.register === 'real',
    neden: 'REAL start-frame farkları.' },
  { id: 'real-uclu', kalip: /^REAL'in kendi zorunlu üçlüsü/i, kosul: (f) => f.register === 'real',
    neden: 'Motorun varsayılan plastiğini kıran karşı-terimler.' },
  { id: 'real-text', kalip: /^REAL'de TEXT slotu/i, kosul: (f) => f.register === 'real' && f.yazi,
    neden: 'REAL\'de yazı farklı yazılır.' },
  { id: 'real-kamera', kalip: /^REAL'in kamera zarfı/i, kosul: (f) => f.register === 'real',
    neden: 'REAL kamera sınırları.' },

  // Motion
  { id: 'motion-template', kalip: /^3\. MOTION TEMPLATE/i, kosul: (f) => f.motion,
    neden: 'Kling 3.0 i2v şablonu.' },
  { id: 'motion-yapamaz', kalip: /3ø\. KLING 3\.0'IN YAPAMADIĞI/i, kosul: (f) => f.motion,
    neden: 'Kredi ölçümüyle bulunmuş üç sınır.' },
  { id: 'motion-degisim', kalip: /3a\. KLİPTE BİR ŞEY DEĞİŞMELİ/i, kosul: (f) => f.motion,
    neden: 'Motion\'ın §11\'i — klipte bir şey değişmeli.' },
  { id: 'motion-kamera', kalip: /3b\. KAMERA/i, kosul: (f) => f.motion,
    neden: '"slowly push in" yasak.' },
  { id: 'motion-real', kalip: /3R\. REAL register — motion/i, kosul: (f) => f.motion && f.register === 'real',
    neden: 'REAL motion farkları.' },
  { id: 'konusan', kalip: /^Konuşan klip/i, kosul: (f) => f.motion && f.yuz,
    neden: 'Konuşan klip çatalı kapandı.' },

  // Referans
  { id: 'ref-envanter', kalip: /§4a — REFERANS ENVANTERİ/i, kosul: (f) => f.referans,
    neden: 'Referans envanteri ilk iştir.' },
];

// ---------------------------------------------------------------------------
// 3. Özellikleri metinden çıkar
// ---------------------------------------------------------------------------
export function ozellikCikar(metin, temel = {}) {
  const f = { register: 'edu', motion: false, ...temel };
  if (metin) {
    f.yuz = f.yuz ?? /@[a-zçğıöşü]+\d*|\b(her|his|their) (face|cheek|brow)\b|\b(girl|boy|child|teacher|woman|man)\b/i.test(metin);
    f.yazi = f.yazi ?? (/^TEXT\s*:/im.test(metin) && !/^TEXT\s*:\s*(YOK|none|no text)\s*$/im.test(metin));
    f.cocuk = f.cocuk ?? /\b(girl|boy|child|schoolgirl|pupil|student)\b|@mira|@dara|@efe/i.test(metin);
    f.tag = f.tag ?? /@[a-zçğıöşü]+\d*/i.test(metin);
    f.kavram = f.kavram ?? /glow of light|concept light|kavram ışığı/i.test(metin);
    f.kati = f.kati ?? /\b(metal|glass|brass|steel|rigid|solid)\b/i.test(metin);
    f.referans = f.referans ?? false;
  }
  return f;
}

// ---------------------------------------------------------------------------
// 4. Fişi derle — eşleşmeyen kalıp ÖLÜMCÜL
// ---------------------------------------------------------------------------
export function fisDerle(yasaMetni, ozellik) {
  const bolumler = bolumleriCikar(yasaMetni);
  const eksik = [];
  const secilen = [];

  for (const kural of TABLO) {
    const bulunan = bolumler.find((b) => kural.kalip.test(b.baslik));
    if (!bulunan) { eksik.push(kural.id + ' → ' + kural.kalip); continue; }
    const gerekli = kural.hep === true || (kural.kosul ? kural.kosul(ozellik) : false);
    if (!gerekli) continue;
    secilen.push({ ...kural, ...bulunan, satirSayisi: bulunan.son - bulunan.bas + 1 });
  }

  if (eksik.length) {
    const e = new Error(
      'YASA FİŞİ DERLENEMEDİ — tablo bayatladı. Yasadaki başlık(lar) bulunamadı:\n  '
      + eksik.join('\n  ')
      + '\n\nBu SESSİZ GEÇİLMEZ: boş/eksik fiş "temiz" demek değil, "tablo yasayla uyuşmuyor" demektir.\n'
      + 'Yasadaki başlık yeniden adlandırıldıysa scripts/yasa-fisi.mjs TABLO kaydını güncelle.');
    e.eksik = eksik;
    throw e;
  }
  return secilen;
}

export function fisYaz(secilen, ozellik, yasaHash, yasaSatirSayisi) {
  const toplam = secilen.reduce((a, b) => a + b.satirSayisi, 0);
  const oran = Math.round((toplam / yasaSatirSayisi) * 100);
  const acik = Object.entries(ozellik)
    .filter(([, v]) => v === true).map(([k]) => k).join(' · ') || '(yok)';

  const L = [];
  L.push('# YASA FİŞİ — bu kare için okuma planı');
  L.push('');
  L.push(`> kaynak: \`agents/PROMPT-YASASI.md\` · **hash \`${yasaHash.slice(0, 12)}\`** · ${yasaSatirSayisi} satır`);
  L.push(`> register: **${(ozellik.register || 'edu').toUpperCase()}** · özellikler: ${acik}`);
  L.push(`> okunacak: **${toplam} satır** (yasanın %${oran}'i) · ${secilen.length} bölüm`);
  L.push('>');
  L.push('> ⚠ Bu fiş yasanın KOPYASI değildir, OKUMA PLANIDIR — hüküm hep kaynaktadır.');
  L.push('> Hash değişmişse fiş geçersizdir: yeniden derle.');
  L.push('');
  L.push('| # | bölüm | satır | neden bu karede |');
  L.push('|---|---|---|---|');
  secilen.forEach((s, i) => {
    L.push(`| ${i + 1} | ${s.baslik.replace(/\|/g, '\\|').slice(0, 58)} | \`${s.bas}-${s.son}\` | ${s.neden} |`);
  });
  L.push('');
  L.push('**Okuma komutu (tek satır):**');
  L.push('```');
  L.push(secilen.map((s) => `${s.bas}-${s.son}`).join(','));
  L.push('```');
  return L.join('\n');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function bayrak(argv, ad) {
  const t = argv.find((a) => a === `--${ad}` || a.startsWith(`--${ad}=`));
  if (!t) return undefined;
  return t.includes('=') ? t.split('=').slice(1).join('=') : true;
}

const dogrudanCagrildi = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (dogrudanCagrildi) {
  const argv = process.argv.slice(2);
  if (!existsSync(YASA_YOLU)) {
    process.stderr.write(`YASA BULUNAMADI: ${YASA_YOLU}\n`); process.exit(2);
  }
  const yasa = readFileSync(YASA_YOLU, 'utf8');
  const hash = createHash('sha256').update(yasa).digest('hex');

  const kareYolu = bayrak(argv, 'kare');
  let kareMetni = null;
  if (typeof kareYolu === 'string') {
    if (!existsSync(kareYolu)) { process.stderr.write(`KARE DOSYASI YOK: ${kareYolu}\n`); process.exit(2); }
    kareMetni = readFileSync(kareYolu, 'utf8');
  }

  const temel = { register: (bayrak(argv, 'register') || 'edu').toString().toLowerCase() };
  for (const k of ['yuz', 'yazi', 'cocuk', 'tag', 'kavram', 'kati', 'motion', 'referans']) {
    if (bayrak(argv, k) === true) temel[k] = true;
  }
  const ozellik = ozellikCikar(kareMetni, temel);

  try {
    const secilen = fisDerle(yasa, ozellik);
    process.stdout.write(fisYaz(secilen, ozellik, hash, yasa.split('\n').length) + '\n');
  } catch (e) {
    process.stderr.write('\n🔴 ' + e.message + '\n\n');
    process.exit(1);
  }
}
