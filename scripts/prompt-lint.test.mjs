// PROMPT LİNTERİ — davranış kilitleri.
//
// NEDEN VAR: `prompt-lint.mjs` başlığında bir SÖZLEŞME yazılı ("Kanıtla sınanır … Bunlardan
// biri tutmuyorsa linter yanlıştır, prompt değil") ama o sözleşme hiçbir yerde KOŞMUYORDU —
// yani bir ricaydı. Linter 2026-07-29'da altı kez değişti (üç bağımsız denetim bulgusu);
// yedinci değişiklik sessizce bozabilirdi. Bu dosya ricayı duvara çevirir.
//
// İki kat:
//   A1 · GERÇEK KORPUS — 2026-07-29'da diskten ölçülmüş sayılar. Kırılması DOĞRUDUR:
//        ya linter bayatladı, ya teslim dosyası değişti. İkisi de bilinmek istenen şeydir.
//   A2 · SAHTE ALARM REGRESYONLARI — her `it` bir denetim bulgusudur. Sahte alarm ölçümün
//        kendisini çöpe atar (Mami kırmızıya bakmayı bırakır); bu yüzden tek tek çivilenir.
//
// NOT: `src/core/` DONUK — bu dosya bilerek `scripts/` altında (icraat fazı yasası).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { lintFile, lintBlock, parseBlocks, fileKind } from './prompt-lint.mjs';

const INBOX = new URL('../agents/COMMAND-INBOX/', import.meta.url).pathname;

// Kırmızı problemlerin anahtarları — testler kelimeye değil KUSUR SINIFINA bakar.
const kirmiziKeys = (problems) => problems.filter((p) => p.level === 'kirmizi').map((p) => p.key);
const kirmiziVar = (problems, key) => kirmiziKeys(problems).includes(key);

// ---------------------------------------------------------------------------
// A1 · REGRESYON ÇIPASI — diskteki gerçek teslim dosyaları.
// Bu dört dosya linterin "kanıt" cümlesinin ta kendisidir: Üreme altın standart,
// Sürtünme sahte-alarm mayın tarlası, Bileşke kanıtlı kusurlu, Sabit Sürat temiz.
// ---------------------------------------------------------------------------
describe('A1 · gerçek korpus regresyon çıpası', () => {
  it('Üreme (50 kare): temas 50/50 · text-hece 14/14 · NEGATIVE kare-özel %100 — altın standart', () => {
    const r = lintFile(
      join(INBOX, '6. Sınıf - Eşeyli ve Eşeysiz Üreme', 'Eşeyli ve Eşeysiz Üreme_PROMPTLAR.md'),
      'EDU');
    expect(r.total).toBe(50);
    expect(r.bad.length).toBe(13);
    expect(r.counts.temas).toBe('50/50');
    expect(r.counts['text-hece']).toBe('14/14');
    expect(r.metrics.negOzel).toBe(1);
  });

  it('Sürtünme (31 kare): canlı üçlü 31/31 SUSAR, derinlik 1/31 KIRMIZI kalır, STYLE 125 kelime', () => {
    const r = lintFile(
      join(INBOX, 'Biten', '5. Sürtünme', '5. Sınıf - Sürtünme_PROMPTLAR.txt'), 'EDU');
    expect(r.total).toBe(31);
    // `canli` sahteydi (83 sahte alarmın kaynağı) → tam kapsam.
    expect(r.counts.canli).toBe('31/31');
    // `derinlik` gerçekti → kırmızı kalmalı.
    expect(r.counts.derinlik).toBe('1/31');
    expect(r.metrics.negOzel).toBe(1);
    // 31 karede birebir aynı blok: tek sürüm, 125 kelime (tavan 110 → kırmızı, ve öyle kalmalı).
    expect(r.metrics.styleMax).toBe(125);
  });

  it('Bileşke (52 kare): NEGATIVE 52/52 GÖRÜLÜR ama kare-özel %0 · temas 0/52', () => {
    const r = lintFile(
      join(INBOX, 'Biten', '6. Sınıf - Kuvvetlerin Güç Birliği', 'Bileşke Kuvvet_PROMPTLAR.txt'),
      'EDU');
    expect(r.total).toBe(52);
    // `FIREWALL NEGATIVE:` biçimi tanınmalı — eski desen 52/52'ye sahte kırmızı basıyordu.
    expect(r.counts.neg).toBe('52/52');
    // Temas gerçekten yok: K33/34/35/50 havada yüzdü, revizede "floating in mid-air".
    expect(r.counts.temas).toBe('0/52');
    expect(r.metrics.negOzel).toBe(0);
  });

  it('Sabit Sürat (44 kare): 6 kırmızı blok — temiz setin tabanı', () => {
    const r = lintFile(
      join(INBOX, 'Biten', 'Sabit Sürat ve Hız', 'Sabit Sürat ve Hız_PROMPTLAR.txt'), 'EDU');
    expect(r.total).toBe(44);
    expect(r.bad.length).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// A2 · SAHTE ALARM REGRESYONLARI — her biri ölçülmüş bir denetim bulgusu.
// ---------------------------------------------------------------------------
describe('A2 · sahte alarm regresyonları', () => {
  it('"Three physics beats" canlı üçlü AİLESİNDENDİR — 83 sahte alarmın kaynağıydı', () => {
    expect(kirmiziVar(lintBlock('Three physics beats: a, b, c.', 'EDU'), 'canli')).toBe(false);
  });

  it('ahşap yüzeyde `sheen` MEŞRU — tuzak ateşlemez', () => {
    expect(kirmiziVar(lintBlock('wood shows grain with satin-varnish sheen', 'EDU'), 'sheen-tende'))
      .toBe(false);
  });

  it('TENDE `sheen` ölümcül — tuzak ateşler (yoksa linter körleşir, yalnız gürültü susmaz)', () => {
    expect(kirmiziVar(lintBlock("the satin sheen along his cheek's skin", 'EDU'), 'sheen-tende'))
      .toBe(true);
  });

  it('"sheen-free" substring tuzağı ateşlemez — olumsuzlama hit sayılıyordu (Kuvvet K11)', () => {
    expect(kirmiziVar(
      lintBlock('waxed paper reads with a faint sheen-free crinkle', 'EDU'), 'sheen-tende')).toBe(false);
  });

  it('`face` deseni **surface** içinde eşleşmez — bugünkü en sinsi kusur, kalıcı kilit', () => {
    // Sınırsız /face/ "surface" içinde tutuyordu: ahşap/taş YÜZEYİNİN sheen'i TEN kusuru
    // sayılıyordu ve `hasHuman` insansız kareye ten kilidi soruyordu. İkisi de sessiz yanlış pozitif.
    const p = lintBlock('light bounces off the polished surface', 'EDU');
    expect(kirmiziVar(p, 'sheen-tende')).toBe(false);
    expect(kirmiziVar(p, 'ten')).toBe(false);
  });

  it('"No person enters the frame" karesine ten kilidi SORULMAZ (Kütle: 13 kare, 13 sahte alarm)', () => {
    expect(kirmiziVar(lintBlock('No person enters the frame.', 'EDU'), 'ten')).toBe(false);
  });

  it('kanonik glow cümlesi bloom-çiçek tuzağını ateşlemez (Sabit Sürat K33 — sıfır kusur)', () => {
    expect(kirmiziVar(
      lintBlock('blooms into a soft round warm-golden glow of light', 'EDU'), 'bloom-cicek')).toBe(false);
  });

  it('isim olarak `bloom` + parçacık komşuluğu ATEŞLER (Sürtünme S4 — taç yaprağı doğuruyor)', () => {
    expect(kirmiziVar(
      lintBlock('a soft golden bloom and a scatter of rising sparkle particles', 'EDU'),
      'bloom-cicek')).toBe(true);
  });

  it('adlandırılmış mekânlı "negative space" void tuzağını ateşlemez (Sürtünme S2 — temiz)', () => {
    expect(kirmiziVar(
      lintBlock('warm negative space (a plain morning-lit kitchen wall)', 'EDU'), 'void')).toBe(false);
  });

  it('yalnız bırakılmış "negative space" ATEŞLER (S23 — boş void doğurdu)', () => {
    expect(kirmiziVar(lintBlock('isolated against warm negative space', 'EDU'), 'void')).toBe(true);
  });

  it('temas ailesi: "contact plane" ve "surfaces MUST touch" kırmızı üretmez (Sürtünme S8)', () => {
    expect(kirmiziVar(lintBlock('their contact plane touching', 'EDU'), 'temas')).toBe(false);
    expect(kirmiziVar(lintBlock('the surfaces MUST touch', 'EDU'), 'temas')).toBe(false);
  });

  it('heceleme YAZILMIŞSA text-hece susar — "200 g" küçük harfli birim de ekran yazısıdır', () => {
    expect(kirmiziVar(
      lintBlock('TEXT: "200 g" — digits, then a space, then lowercase g', 'EDU'), 'text-hece')).toBe(false);
  });

  it('heceleme YOKSA text-hece KIRMIZI — yoksa "R = ON"/"KOLKALSIRI" sınıfı geri gelir', () => {
    expect(kirmiziVar(lintBlock('TEXT: "200 g"', 'EDU'), 'text-hece')).toBe(true);
  });

  it('referans-edit bloğu slot TAŞIMAZ — her birine 8 alarm basılıyordu (Kuvvet K31/K38)', () => {
    expect(lintBlock('Use this referenced image, change ONLY: the shirt colour.', 'EDU')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// A3 · DOSYA TİPİ — `_PROMPTLAR.md` adı taşıyan bir MOTION dosyası start-frame gibi
// lintlenince 58 karede style 0/58, text 0/58 çıkıyordu. Kusur dosyada değil, dosyanın
// YANLIŞ DOSYA olmasındaydı; tip kararı blok başına değil DOSYA başına verilir.
// ---------------------------------------------------------------------------
describe('A3 · dosya tipi', () => {
  const kindOf = (p) => fileKind(parseBlocks(readFileSync(p, 'utf8')));

  it('Kuvvet ve Kuvvetin Ölçülmesi_PROMPTLAR.md → motion-dosyasi, 58 bloğun 58\'i motion', () => {
    const p = join(INBOX, 'Biten', 'Kuvvet ve Kuvvetin Ölçülmesi',
      'Kuvvet ve Kuvvetin Ölçülmesi_PROMPTLAR.md');
    expect(kindOf(p)).toBe('motion-dosyasi');
    const r = lintFile(p, 'EDU');
    expect(r.total).toBe(58);
    expect(r.rows.every((x) => x.kind === 'motion')).toBe(true);

    // ONARILDI (2026-07-29, ajan denetiminden doğdu): `lintBlock()` blok tipini dosya tipinden
    // DEĞİL kendi sezgisinden türetiyordu; motion dosyasının 28 bloğu hâlâ start-frame
    // ölçütleriyle lintleniyor ve `bad` kirleniyordu. CLI'da görünmüyordu (`report()` motion
    // dosyasında erken çıkıyor) ama `lintFile`'ı IMPORT eden kapanış hasadı kirli sayıyı
    // görüyordu — "kapı kurulu, kapı sağır" sınıfının linterin KENDİ içindeki örneği.
    // `lintFile` artık `fk`'yi `lintBlock`'a geçiriyor. Bu satır regresyon çıpasıdır:
    // 0'dan sapması, aynı sağırlığın geri geldiği anlamına gelir.
    expect(r.bad.length).toBe(0);
  });

  it('start-frame teslimleri frame-dosyasi çıkar', () => {
    expect(kindOf(join(INBOX, 'Biten', '5. Sürtünme', '5. Sınıf - Sürtünme_PROMPTLAR.txt')))
      .toBe('frame-dosyasi');
    expect(kindOf(join(INBOX, 'Biten', 'Sabit Sürat ve Hız', 'Sabit Sürat ve Hız_PROMPTLAR.txt')))
      .toBe('frame-dosyasi');
    expect(kindOf(join(INBOX, '6. Sınıf - Eşeyli ve Eşeysiz Üreme',
      'Eşeyli ve Eşeysiz Üreme_PROMPTLAR.md'))).toBe('frame-dosyasi');
  });
});

// ---------------------------------------------------------------------------
// A4 · KAPSAM SÖZLEŞMESİ — "yeşil ≠ temiz". Linter ne ölçemediğini SÖYLEMEK zorundadır;
// bu liste silinirse yeşil bir yalana döner ("kapı kuruldu ≠ kapı ateşliyor").
// ---------------------------------------------------------------------------
describe('A4 · kapsam beyanı', () => {
  it('her raporda ölçülmeyenler listesi var ve BOŞ DEĞİL', () => {
    const r = lintFile(
      join(INBOX, 'Biten', 'Sabit Sürat ve Hız', 'Sabit Sürat ve Hız_PROMPTLAR.txt'), 'EDU');
    expect(Array.isArray(r.olculmeyen)).toBe(true);
    expect(r.olculmeyen.length).toBeGreaterThan(0);
  });
});
