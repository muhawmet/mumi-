// MOTION LİNTERİ — davranış kilitleri.
//
// NEDEN VAR: `motion-lint.mjs` başlığında bir SÖZLEŞME yazılı ("kırmızı bırakılan kuralların
// iki korpustaki toplam ateşi: EFE 0/57 · ALTIN 1/50"). Yazılı sözleşme koşmuyorsa bir ricadır —
// `prompt-lint.test.mjs`'in doğduğu ders bu dosyada tekrarlanır.
//
// İki kat:
//   A1 · GERÇEK KORPUS — 2026-07-31'de diskten ölçülmüş sayılar. Kırılması DOĞRUDUR: ya linter
//        bayatladı, ya teslim dosyası değişti. İkisi de bilinmek istenen şeydir.
//   A2 · SAHTE ALARM REGRESYONLARI — her `it` bir ölçüm bulgusudur. Sahte alarm ölçümün
//        kendisini çöpe atar (Mami kırmızıya bakmayı bırakır); bu yüzden tek tek çivilenir.
//
// NOT: `src/core/` DONUK — bu dosya bilerek `scripts/` altında (icraat fazı yasası).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  lintMotionFile, lintMotionBlock, parseMotionBlocks, kameraCumlesi, OLCULMEYEN,
} from './motion-lint.mjs';

// ⚠ `.pathname` KULLANMA — Windows'ta `file:///C:/…` → `/C:/…` verir ve `join` onu
// `C:\C:\…` yapar. (prompt-lint.test.mjs'de 21 test tek bir sebeple kırmızıydı.)
const INBOX = fileURLToPath(new URL('../agents/COMMAND-INBOX/', import.meta.url));
const EFE = join(INBOX, '6. Sınıf - Sorunları Birlikte Çözüyoruz', 'MOTION');
const ALTIN = join(INBOX, 'Biten', '6. Sınıf - Eşeyli ve Eşeysiz Üreme', 'MOTION');

const kirmiziKeys = (ps) => ps.filter((p) => p.level === 'kirmizi').map((p) => p.key);
const kirmiziVar = (ps, key) => kirmiziKeys(ps).includes(key);

const dosyaNo = (n) => String(n).padStart(2, '0') + '.txt';
const klasorLint = (dir, n) => {
  const out = [];
  for (let i = 1; i <= n; i++) out.push(lintMotionFile(join(dir, dosyaNo(i))));
  return out;
};

// Sentetik örnekler GERÇEK bir temiz klipten türetilir — uydurma taban, uydurma sonuç verir.
const temizParagraf = () => parseMotionBlocks(readFileSync(join(EFE, '01.txt'), 'utf8'))[0].para;

// ---------------------------------------------------------------------------
// A1 · GERÇEK KORPUS — iki teslim seti.
// ---------------------------------------------------------------------------
describe('A1 · gerçek korpus regresyon çıpası', () => {
  it('Efe (57 klip): kırmızı 0 — bugünün teslim seti temiz geçmeli', () => {
    const rs = klasorLint(EFE, 57);
    expect(rs.length).toBe(57);
    expect(rs.every((r) => r.total === 1)).toBe(true);
    const kirmizi = rs.flatMap((r) => r.bad);
    // Kırmızı çıkarsa hangi dosya olduğu görünsün — çıplak `0` beklentisi teşhis vermiyor.
    expect(kirmizi.map((b) => `${b.head}: ${b.problems.map((p) => p.key).join(',')}`)).toEqual([]);
  });

  it('Altın standart (50 klip): kırmızı YALNIZ 01.txt — ve o dosya yasanın kendi ölçümüdür', () => {
    const rs = klasorLint(ALTIN, 50);
    expect(rs.length).toBe(50);
    const kirmiziIdx = rs.map((r, i) => (r.bad.length ? i + 1 : null)).filter(Boolean);
    // "Altın standart 0 kırmızı vermeli" hedefi ÖLÇÜMLE ÇELİŞTİ ve ölçüm kazandı:
    // yasa §3 zaten `half a second later` için "altın 1/50" yazıyor. O 1, tam olarak bu dosya.
    // Aynı dosya kamerayı ilk cümlenin içine kaynatmış ("…and the camera cranes down…"),
    // yani ikinci kuralı da çiğniyor. Sıfıra zorlamak kanıtı silmek olurdu — `prompt-lint`
    // altın standardı 14 kırmızıyla çiviliyor, aynı disiplin.
    expect(kirmiziIdx).toEqual([1]);
    expect(kirmiziKeys(rs[0].bad[0].problems).sort()).toEqual(['kamera-yok', 'saat']);
  });

  it('altın standardın kalan 49 klibi TEK kırmızı bile vermez', () => {
    const rs = klasorLint(ALTIN, 50).slice(1);
    expect(rs.flatMap((r) => r.bad.flatMap((b) => b.problems.map((p) => p.key)))).toEqual([]);
  });

  it('birleştirilmiş `*_MOTION.txt` tek klip dosyalarıyla AYNI sonucu verir', () => {
    const r = lintMotionFile(join(INBOX, '6. Sınıf - Sorunları Birlikte Çözüyoruz',
      'Sorunları Birlikte Çözüyoruz_MOTION.txt'));
    expect(r.total).toBe(57);
    expect(r.bad.length).toBe(0);
    // Kelime ölçümü de aynı kalmalı: ayraç/başlık artığı paragrafa karışırsa burada patlar.
    const tekil = klasorLint(EFE, 57).map((x) => x.rows[0].kelime);
    expect(r.rows.map((x) => x.kelime)).toEqual(tekil);
  });
});

// ---------------------------------------------------------------------------
// A2 · BİLEREK BOZUK — kural gerçekten ateşliyor mu? Ateşlemeyen kural bir süstür.
// ---------------------------------------------------------------------------
describe('A2 · bilerek bozuk örnekler kırmızı verir', () => {
  it('`half a second later` → saat kırmızısı (motor saniyeyi takvim sanıp SNAP atıyor)', () => {
    const p = temizParagraf().replace('Then the narrow blade',
      'Then, half a second later, the narrow blade');
    expect(kirmiziVar(lintMotionBlock(p), 'saat')).toBe(true);
  });

  it('kamera cümlenin İÇİNE kaynatılmışsa → kamera-yok kırmızısı', () => {
    // "Camera: a low dolly runs…" ayrı cümlesi kaldırılıp önceki cümleye bağlanır.
    const p = temizParagraf().replace(' Camera: a low dolly', ', and the camera runs a low dolly');
    expect(kameraCumlesi(p)).toBe(null);
    expect(kirmiziVar(lintMotionBlock(p), 'kamera-yok')).toBe(true);
  });

  it('kuyruğun ses çekirdeği eksikse → kuyruk kırmızısı', () => {
    const p = temizParagraf().replace('Silent clip, no audio, no dialogue, ', '');
    expect(kirmiziVar(lintMotionBlock(p), 'kuyruk')).toBe(true);
  });

  it('kuyruğun kamera çekirdeği eksikse → kuyruk kırmızısı', () => {
    const p = temizParagraf().replace('No whip-pan, no shake, no snap-zoom, no camera warp.', '');
    expect(kirmiziVar(lintMotionBlock(p), 'kuyruk')).toBe(true);
  });

  it('`At first` açılışı + `By the end` kapanışı → metronom kırmızısı', () => {
    const p = 'At first he waits. ' + temizParagraf() + ' By the end he has arrived.';
    expect(kirmiziVar(lintMotionBlock(p), 'metronom')).toBe(true);
  });

  it('gerçek yazma fiili → yazma kırmızısı (§3ø: Kling hiçbir kalemle yazamıyor)', () => {
    expect(kirmiziVar(lintMotionBlock('He writes the word on the page.'), 'yazma-fiili')).toBe(true);
    expect(kirmiziVar(lintMotionBlock('The tip moves along the line.'), 'yazma-fiili')).toBe(true);
  });

  it('donmuş gövde yığını (3 kalıp bir arada) → kırmızı — %76 kusurun sebebi', () => {
    const p = 'His body stays exactly as it is, the chair does not move, and the room keeps the same shape.';
    expect(kirmiziVar(lintMotionBlock(p), 'donmus-govde')).toBe(true);
    // İKİ kalıp yığın değildir; ikisi normal kilit yazımıdır.
    const iki = 'His body stays exactly as it is and the chair does not move.';
    expect(kirmiziVar(lintMotionBlock(iki), 'donmus-govde')).toBe(false);
  });

  it('kelime duvarı: Kling\'in resmi 60-kelime tavsiyesi kırmızı verir, 260 kelime de', () => {
    const kisa = 'The clip opens with him walking. Camera: a slow dolly. '
      + 'Silent clip, no audio, no dialogue, mouth closed, no lip movement. '
      + 'No whip-pan, no shake, no snap-zoom, no camera warp.';
    expect(kirmiziVar(lintMotionBlock(kisa), 'kelime-bandi')).toBe(true);
    const uzun = temizParagraf() + ' ' + Array(60).fill('the light drifts across').join(' ');
    expect(kirmiziVar(lintMotionBlock(uzun), 'kelime-bandi')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// A3 · SAHTE ALARM REGRESYONLARI — üçü de bugün grep'in düştüğü çukur.
// ---------------------------------------------------------------------------
describe('A3 · sahte alarm regresyonları', () => {
  it('`Nobody writes` YASAK CÜMLESİDİR, kusur değil — grep bugün tam burada yanıldı (Efe 33)', () => {
    const p = 'A clear gap of air stays between their faces as he nods. '
      + 'Nobody writes, traces or forms a letter anywhere in the shot.';
    expect(kirmiziVar(lintMotionBlock(p), 'yazma-fiili')).toBe(false);
  });

  it('`no hand traces` / `never writes` de temizdir', () => {
    expect(kirmiziVar(lintMotionBlock('No hand traces a line on the board.'), 'yazma-fiili')).toBe(false);
    expect(kirmiziVar(lintMotionBlock('The pencil never writes and never leaves the page.'), 'yazma-fiili')).toBe(false);
  });

  it('`writing` İSİMDİR — üç sahte kırmızının kaynağıydı (Efe 18, altın 07 ve 47)', () => {
    expect(kirmiziVar(lintMotionBlock('he closes a week of writing and ends looking at it'), 'yazma-fiili')).toBe(false);
    expect(kirmiziVar(lintMotionBlock('so the misted writing never rotates or skews'), 'yazma-fiili')).toBe(false);
    expect(kirmiziVar(lintMotionBlock('the page square to the lens so the handwriting never skews'), 'yazma-fiili')).toBe(false);
  });

  it('`without a second hand` SAAT DEĞİLDİR — bugünkü üçüncü yanlış alarm (Efe 50)', () => {
    expect(kirmiziVar(lintMotionBlock("the bent elbow holding it without a second hand"), 'saat')).toBe(false);
  });

  it('`a moment later` saniye yazmaz — kırmızı vermez (altın 24, kanıtlı iyi klip)', () => {
    expect(kirmiziVar(lintMotionBlock('a moment later the farther piece answers'), 'saat')).toBe(false);
  });

  it('kamera cümlesi AİLEDİR: `The camera begins…` ve `Camera pulls back…` de sayılır', () => {
    // Altın 02-10 kamerayı böyle yazıyor; yasa 28/50 derken SÖZCÜĞÜ saymıştı, İŞİ değil.
    expect(kameraCumlesi('He waits. The camera begins favouring the sparrow on the rail.')).toBeTruthy();
    expect(kameraCumlesi('He waits. Camera pulls back and arcs gently leftward.')).toBeTruthy();
    expect(kameraCumlesi('He waits. Camera: a low dolly runs with him.')).toBeTruthy();
    // Cümle İÇİNE kaynatılmış kamera SAYILMAZ — yasanın kusuru tam olarak budur.
    expect(kameraCumlesi('The clip opens high and the camera cranes down and arcs right.')).toBe(null);
  });

  it('olumsuzlanmış çiçek kilidi SARI bile vermez — altın 9/50 dosyada bu cümle var', () => {
    const p = 'The glow stays a soft round golden light and never becomes a flower, petal or flame.';
    expect(lintMotionBlock(p).some((x) => x.key === 'cicek')).toBe(false);
  });

  it('kuyruk varyantı (`jaw held`) KIRMIZI DEĞİL, SARI bile değil — Efe 19 bilerek böyle yazdı', () => {
    const p = temizParagraf().replace('mouth closed, no lip movement.', 'no lip movement, jaw held as given.');
    expect(kirmiziVar(lintMotionBlock(p), 'kuyruk')).toBe(false);
    expect(lintMotionBlock(p).some((x) => x.key === 'kuyruk-agiz')).toBe(false);
  });

  it('kuyrukta ağız kaydı HİÇ yoksa SARI (kırmızı değil — altın 7/50 böyle)', () => {
    const p = temizParagraf().replace('mouth closed, no lip movement.', '');
    expect(kirmiziVar(lintMotionBlock(p), 'kuyruk')).toBe(false);
    expect(lintMotionBlock(p).some((x) => x.key === 'kuyruk-agiz' && x.level === 'sari')).toBe(true);
  });

  it('tek başına `At first` SARI kalır, KIRMIZI olmaz (altın 8/50 böyle açıyor)', () => {
    const p = 'At first ' + temizParagraf();
    expect(kirmiziVar(lintMotionBlock(p), 'metronom')).toBe(false);
    expect(lintMotionBlock(p).some((x) => x.key === 'at-first' && x.level === 'sari')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// A4 · BİÇİM VE SÖZLEŞME
// ---------------------------------------------------------------------------
describe('A4 · biçim ve kapsam sözleşmesi', () => {
  it('BOM ve CRLF okunur — Windows birincil ortam, ham okuma dört kez sessiz no-op üretti', () => {
    const ham = readFileSync(join(EFE, '01.txt'), 'utf8');
    const bozuk = '\uFEFF' + ham.replace(/\n/g, '\r\n');
    const bloklar = parseMotionBlocks(bozuk);
    expect(bloklar.length).toBe(1);
    expect(bloklar[0].para).not.toMatch(/[\r\uFEFF]/);
    expect(lintMotionBlock(bloklar[0].para).filter((p) => p.level === 'kirmizi')).toEqual([]);
  });

  it('DURUM/REVİZE kuyruğu ve KAMERA NİYETİ satırı prompt metnine karışmaz', () => {
    const b = parseMotionBlocks(readFileSync(join(EFE, '01.txt'), 'utf8'))[0];
    expect(b.para).not.toMatch(/DURUM:|REVİZE:|KAMERA NİYETİ:/);
    expect(b.niyet).toMatch(/^KAMERA NİYETİ:/);
  });

  it('kapsam listesi var ve BOŞ DEĞİL — "yeşil ≠ temiz" bu listeyle birlikte okunur', () => {
    const r = lintMotionFile(join(EFE, '01.txt'));
    expect(Array.isArray(r.olculmeyen)).toBe(true);
    expect(r.olculmeyen.length).toBeGreaterThan(0);
    expect(OLCULMEYEN.some((o) => /SINANMADI|sınanmadı/i.test(o))).toBe(true);
  });
});
