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
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  lintFile, lintBlock, parseBlocks, fileKind, STYLE_TEKRAR_MIN, SLOTS, TRAPS,
} from './prompt-lint.mjs';

// Sentetik kare dosyaları için — repo'ya dosya bırakmaz.
const TMP = mkdtempSync(join(tmpdir(), 'prompt-lint-'));

// ⚠ `.pathname` KULLANMA. Windows'ta `file:///C:/...` → `/C:/Mamilas/...` verir (baştaki
// eğik çizgiyle) ve `join` bunu `C:\C:\Mamilas\...` yapar — 21 test tek bir sebeple
// kırmızıydı ve kapı Mami'nin birincil makinesinde hiç yeşile dönemiyordu. Doğrusu
// `fileURLToPath`; üretim betikleri (kapanis-hasadi.mjs) zaten onu kullanıyor.
const INBOX = fileURLToPath(new URL('../agents/COMMAND-INBOX/', import.meta.url));

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
      // ⚠ `.md` DEĞİL `.txt`. Aynı klasördeki `_PROMPTLAR.md` **bayat**: yazı yasası (§11a/b/c)
      // yazılmadan önceki sürüm — 14 yazılı kare, harf karakteri tarif edilmemiş. Yeniden yazım
      // Windows'ta yapıldı ve push edilemediği için bu çıpa 54 commit boyunca eski dosyayı
      // ölçtü. Altın standart, Mami'nin GERÇEKTEN bastığı 50 karenin dosyasıdır: `.txt`.
      join(INBOX, 'Biten', '6. Sınıf - Eşeyli ve Eşeysiz Üreme', 'Eşeyli ve Eşeysiz Üreme_PROMPTLAR.txt'),
      'EDU');
    expect(r.total).toBe(50);
    // 13 → 5 (2026-07-29, Sol denetimi): `hasHuman` insan kelimelerini SINIRSIZ arıyordu ve
    // `face` **surface** içinde, `child` **child-clear readability** içinde eşleşiyordu; üstelik
    // "no face, eyes or cartoon mouth" diyen NEGATİF cümle "yüz var" sayılıyordu. Bu, Codex'in
    // `nearSkin`'de yakaladığı kusurun ikiziydi — biri onarılmış, öteki atlanmıştı.
    // Kalan 5'in beşinde de gerçekten insan var (@efe / hand) ve negatif ten kilidi gerçekten yok.
    // 2 → 14: sayı ARTTI ama iş İYİLEŞTİ — çünkü ölçülen dosya değişti. Yeniden yazımda
    // yazı taşıyan kare 14'ten 25'e çıktı (§11c: cimrilik de kusurdur), yani lintin sorduğu
    // soru sayısı da arttı. Kapsam satırı bunu gösteriyor: text-hece 25/25 · tasiyici 25/25.
    //
    // 14 → 0 (2026-08-02, YÖN ONARIMI). Bu çıpanın kendisi kusurun kanıtıydı: **0 revize** almış
    // altın standart, en çok revize alan işten (Birlikte, 30/54 revize, 0 kırmızı) DAHA KÖTÜ
    // ölçülüyordu. 14'ün 13'ü `style-uzun` duvarındandı — o duvar yanlış sayıya kalibreydi
    // (yasa "86-116" diyordu, diskteki gerçek dosya 86-152) ve SARI'ya indi. Kalan 1'i
    // `hece-sayi` SAHTE ALARMIYDI: "**no two** letters are made of the same substance" bir
    // tasarım kuralı, harf sayımı değil. Sıfır burada "ölçülmedi" demek değil — kapsam satırı
    // 11 slotun 11'inde tam ve `sarı: 16` duruyor.
    expect(r.bad.length).toBe(0);
    // Ve kırmızıyı ne verdiyse ONUN sebebi ölçülmüş olmalı: altın standardın hiçbir karesi
    // STYLE'ını üç kez tekrar etmiyor (49 sürüm / 50 kare, en çok tekrar 2).
    expect(r.metrics.styleMaxRepeat).toBe(2);
    expect(r.counts.temas).toBe('50/50');
    expect(r.counts['text-hece']).toBe('25/25');
    expect(r.counts['text-tasiyici']).toBe('25/25');
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

  it('Sabit Sürat (44 kare): 3 kırmızı blok — temiz setin tabanı', () => {
    // 4 → 3 (2026-08-05). ⚠ İLK AÇIKLAMASI YANLIŞTI, Codex/Terra karşı-denetimi düzeltti:
    // düşüşün sebebi `lens`/`fstop`/`karsi-terim`in SARI'ya inmesi DEĞİL. Sabit Sürat EDU'dur;
    // `lens` bu sette zaten 44/44 karşılanıyordu, `fstop` ve `karsi-terim` ise yalnız REAL'de
    // uygulanıyor — yani üçü de bu dosyada hiç ateşlemiyordu.
    // GERÇEK SEBEP: `neg-ozel` kuralı `level: 'sari'` taşıdığı hâlde `kirmizi.push` ile
    // gidiyordu (dispatch hatası) ve kırmızı sayısını sahte biçimde bir artırıyordu. O onarıldı.
    // Kalan 3 kırmızının hepsi GERÇEK ve hepsi `text-hece` — aşağıda çivilendi ki bu sayı
    // bir daha "neyin düştüğü belirsiz" biçimde değişmesin.
    // 7 → 6 (2026-08-02): `style-uzun` SARI'ya indi; 116 kelimelik tek karesi kırmızıdan düştü.
    // 6 → 4 (2026-08-05): `text-tasiyici` SARI'ya indi. O kural bir İFADE bekliyordu
    // (harfin taşıyıcı malzemesinin yazılması) ve kendi yorumu bunu anti-monotonluk olarak
    // tarif ediyordu — estetik bir tercih, ölçülmüş bir motor kırılması değil.
    // Kalan 6 gerçek: `text-tasiyici` 5 kare + NEGATIVE kare-özel %23. Sabit Sürat'ın STYLE'ı
    // 41 sürüm / 44 kare — yeni `style-tekrar` kuralı burada ATEŞLEMEZ, ve etmemeli.
    const r = lintFile(
      join(INBOX, 'Biten', 'Sabit Sürat ve Hız', 'Sabit Sürat ve Hız_PROMPTLAR.txt'), 'EDU');
    expect(r.total).toBe(44);
    // 6 → 5: `hasHuman` düzeltmesi (bkz. Üreme çıpası). 5 → 7: yeni `text-tasiyici` slotu
    // iki karede gerçekten eksik — Sabit Sürat §11b'den (harf, taşıdığı nesnenin malzemesidir)
    // önce yazıldı, yazı VAR ama harfin nasıl var olduğu yazılmamış. Sahte alarm değil, çağ farkı.
    expect(r.bad.length).toBe(3);
    // ÇİVİ (2026-08-05): yalnız SAYIYA bakan bir çıpa, sayı aynı kalıp SEBEBİ değişince
    // sessizce yeşil kalır — bu repoda sekiz kez ölçülmüş kusur sınıfı. Üçünün de `text-hece`
    // olduğu ve `neg-ozel`in kırmızı dizisine SIZMADIĞI ayrıca çivileniyor.
    // ⚠ `bad` bir BLOK listesidir ve blokların `problems` dizisi sarıları da taşır —
    // süzmeden sayarsan sarı anahtarlar kırmızı sanılır (bu çivi ilk yazımda tam buna düştü).
    const kirmiziAnahtarlar = r.bad
      .flatMap((b) => (b.problems || []))
      .filter((p) => p.level !== 'sari' && !p.warnOnly)
      .map((p) => p.key);
    expect([...new Set(kirmiziAnahtarlar)]).toEqual(['text-hece']);
    expect(kirmiziAnahtarlar).not.toContain('neg-ozel');
    expect(r.metrics.styleMaxRepeat).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// A5 · ÖLÇÜMÜN YÖNÜ — KALIP YOĞUNLUĞU, "kalite" DEĞİL (2026-08-02 · dürüst adı 2026-08-05).
//
// ⚠ 2026-08-05'te bu bloğun İDDİASI daraltıldı, ölçümü değil.
// Eskiden yön KIRMIZI SAYISI üzerinden kuruluyordu ve o sayı büyük ölçüde iki kuralla
// (`style-tekrar`, `neg-ozel`) taşınıyordu. İkisi SARI'ya indi — çünkü ölçtükleri şey
// AYNILIK, ve aynılığın sebebi kuyruk yapıştırmaktı; kuyruk T2'de kalktı.
// Ama korelasyon GERÇEK: donmuş STYLE ↔ 30/54 revize, kare-özel STYLE ↔ 0 revize.
// O yüzden test silinmedi: yön artık VEKİL (kırmızı sayısı) yerine DOĞRUDAN ölçüm
// (`styleMaxRepeat`) üzerinden çiviliyor. Bu daha dürüst ve daha dayanıklı.
//
// Bir duvarın "kurulu" olması onu doğru yapmaz. 2026-08-02'de ölçüldü ki prompt-lint kaliteyi
// değil `dunya-kilidi.mjs`'in yapıştırdığı KUYRUĞA UYUMU ölçüyordu — yani araç kendi
// yapıştırdığını ölçüyordu. Sonuç ters bir sıralamaydı ve tersliği kimse görmüyordu, çünkü
// hiçbir test iki işi YAN YANA koymuyordu. Bu blok tam olarak onu yapar: yön bir hükümdür ve
// hüküm çivilenir. Bu testler kırmızıysa lint yanlıştır, prompt değil.
// ---------------------------------------------------------------------------
describe('A5 · ölçümün yönü — altın standart EN AZ, en çok revize alan iş EN ÇOK kırmızı', () => {
  // ⚠ Yol KODA GÖMÜLMEZ. Bu satır bir kez gömüldü ve 2026-08-03'te kapıyı kırmızıya düşürdü:
  // Mami "Farklı Kültürler"i bitirip `Biten/` altına SÜRÜKLEDİ ve test o anda kırıldı. Yani
  // duvar, işin bitmesini kusur sayıyordu. Bu, bu repoda tekrar eden kusur sınıfının aynısı —
  // doğrulayıcı, ölçtüğü şeyin YERLEŞİMİNİ varsayıyor (teslim-denetim adla arıyordu,
  // baglar uzantıyı kesiyordu, gate.sh prompt dalı desenle arıyordu).
  // Doğrusu: proje NEREDEYSE orada bulunur — aktif klasörde de, Biten/ altında da.
  const bul = (proje, dosya) => {
    for (const aday of [join(INBOX, proje, dosya), join(INBOX, 'Biten', proje, dosya)]) {
      if (existsSync(aday)) return aday;
    }
    throw new Error(`A5: "${proje}/${dosya}" ne aktif klasörde ne Biten/ altında bulunamadı — ` +
      'proje silinmiş ya da adı değişmiş olabilir; testi güncelle, yolu gömme.');
  };

  const UREME = bul('6. Sınıf - Eşeyli ve Eşeysiz Üreme',
    'Eşeyli ve Eşeysiz Üreme_PROMPTLAR.txt');                       // 50 kare · 0 revize
  const BIRLIKTE = bul('5. Sınıf - Birlikte Daha Güçlüyüz',
    'Birlikte Daha Güçlüyüz_PROMPTLAR.txt');                        // 54 kare · 30 revize
  const KULTURLER = bul('5. Sınıf - Farklı Kültürler, Ortak Bir Yaşam',
    'Farklı Kültürler_PROMPTLAR.txt');                              // 53 kare

  it('YÖN: kalıp yoğunluğu revize sayısıyla aynı yöne gidiyor', () => {
    const ureme = lintFile(UREME, 'EDU');
    const birlikte = lintFile(BIRLIKTE, 'EDU');
    const kulturler = lintFile(KULTURLER, 'EDU');
    // DOĞRUDAN ölçüm: aynı STYLE bloğunun en çok kaç karede tekrarlandığı.
    // Üreme (0 revize) 2 · Farklı Kültürler 53 · Birlikte (30/54 revize) 54.
    expect(ureme.metrics.styleMaxRepeat).toBeLessThan(kulturler.metrics.styleMaxRepeat);
    expect(kulturler.metrics.styleMaxRepeat).toBeLessThanOrEqual(birlikte.metrics.styleMaxRepeat);
    expect(ureme.metrics.styleMaxRepeat).toBe(2);
    expect(kulturler.metrics.styleMaxRepeat).toBe(53);
    expect(birlikte.metrics.styleMaxRepeat).toBe(54);
    // STYLE sürüm sayısı da aynı yönü söyler ve daha okunur: 49 sürüm ↔ 1 sürüm.
    expect(ureme.metrics.styleVariants).toBe(49);
    expect(birlikte.metrics.styleVariants).toBe(1);
    // 🔴 ALTIN STANDART ÜRETİMİ ENGELLENMEZ: kırmızı SIFIR kalmak zorunda.
    expect(ureme.bad.length).toBe(0);
  });

  it('style-tekrar: Birlikte 54/54 karede BİREBİR aynı STYLE → 54 SARI (ölçülüyor, engellemiyor)', () => {
    const r = lintFile(BIRLIKTE, 'EDU');
    expect(r.metrics.styleVariants).toBe(1);
    expect(r.metrics.styleMaxRepeat).toBe(54);
    // Kural KAYBOLMADI — SARI'ya indi. Buradan da düşerse ölçüm körleşir.
    const tumSatirlar = [...r.bad, ...r.sari];
    const tekrar = tumSatirlar.filter((row) =>
      row.problems.some((p) => p.key === 'style-tekrar' && p.level === 'sari'));
    expect(tekrar.length).toBe(54);
    // Ve artık HİÇBİR karede kırmızı olarak görünmüyor.
    const kirmiziTekrar = r.bad.filter((row) =>
      row.problems.some((p) => p.key === 'style-tekrar' && p.level === 'kirmizi'));
    expect(kirmiziTekrar.length).toBe(0);
  });

  it('style-uzun artık KIRMIZI DEĞİL — yasa 86-116 diyordu, altın standart 86-152 yazıp 0 revize aldı', () => {
    const r = lintFile(UREME, 'EDU');
    expect(r.metrics.styleMax).toBe(152);
    const kirmiziKeyler = r.bad.flatMap((row) => kirmiziKeys(row.problems));
    expect(kirmiziKeyler).not.toContain('style-uzun');
    // Ama ÖLÇÜLMEYE devam ediyor — sarıdan da düşerse duvar körleşir, ölçüm kaybolur.
    const sariKeyler = r.sari.flatMap((row) => row.problems.map((p) => p.key));
    expect(sariKeyler).toContain('style-uzun');
  });

  it('DOĞAL KONTROL: aynı projenin iki sürümü — tek STYLE 53/57, kare-özel STYLE 7/57', () => {
    // Sorunları Birlikte Çözüyoruz iki sürüm halinde diskte duruyor (ikisi de aynı commit'te
    // eklendi, git sıra vermiyor — iddia edilen tek şey ÖLÇÜM). İçerik, kare sayısı ve dünya
    // aynı; değişen tek yapısal şey STYLE'ın kare-özel yazılıp yazılmadığı. Lint bunu görmek
    // ZORUNDA — iki sürümü aynı gösteriyorsa ölçtüğü şey kalite değildir.
    const v1 = lintFile(join(INBOX, 'Biten', '6. Sınıf - Sorunları Birlikte Çözüyoruz',
      'Sorunları Birlikte Çözüyoruz_PROMPTLAR.txt'), 'EDU');
    const v2 = lintFile(join(INBOX, 'Biten', '6. Sınıf - Sorunları Birlikte Çözüyoruz',
      'Sorunları Birlikte Çözüyoruz_PROMPTLAR-V2.txt'), 'EDU');
    expect(v1.metrics.styleMaxRepeat).toBe(53);
    expect(v2.metrics.styleMaxRepeat).toBe(7);
    // 2026-08-05: kıyas KIRMIZI SAYISINDAN metriğe çevrildi. Kırmızı sayısı artık bu farkı
    // taşımıyor (ikisi de ~0) çünkü aynılık kuralı SARI'ya indi — ama ölçüm hâlâ iki sürümü
    // ayırt ediyor ve ayırt etmek zorunda: 53 tekrar ↔ 7 tekrar, 1 sürüm ↔ 46 sürüm.
    expect(v1.metrics.styleVariants).toBe(1);
    expect(v2.metrics.styleVariants).toBe(46);
  });
});

// ---------------------------------------------------------------------------
// A6 · style-tekrar SAHTE ALARM VERMEZ.
//
// "Yanlış alarm bu duvarı çöpe çevirir" — ölçüldü, prompt-lint 50 karede 19 sahte alarm verince
// insan lint'e bakmayı bıraktı. Yeni kural o riski taşıyamaz. Kural regex sezgisi DEĞİL, birebir
// eşitlik sayımı; ve eşik, korpusta ölçülmüş bir BOŞLUĞUN içine kuruldu: 146 teslim dosyasında
// en çok tekrar ya **≤2** ya **≥4** — arada tek dosya var (Kuvvet, 45 karenin 3'ü). Yani eşiği
// 3 ya da 4 yapmak hiçbir projeyi yer değiştirmiyor.
// ---------------------------------------------------------------------------
describe('A6 · style-tekrar sahte alarm regresyonları', () => {
  const tekrarKirmizi = (r) => r.bad.filter((row) =>
    row.problems.some((p) => p.key === 'style-tekrar')).length;

  it('AKTİF ÜRETİM (Hücre · Destek · Bitkiler — 106 kare) tek bir sahte alarm almaz', () => {
    // Bunlar bugünkü yasayla yazılmış, henüz basılmamış kareler. Yeni kuralın onlara kırmızı
    // basması, kuralın kendisinin yanlış olduğu anlamına gelirdi.
    const dosyalar = [
      ['5. Sınıf - Hücre ve Organelleri', 'A-K01-K15.txt'],
      ['5. Sınıf - Hücre ve Organelleri', 'B-K16-K30.txt'],
      ['5. Sınıf - Hücre ve Organelleri', 'C-K31-K44.txt'],
      ['5. Sınıf - Hücre ve Organelleri', 'D-K45-K53.txt'],
      ['5. Sınıf - Destek ve Hareket Sistemi', 'A-K01-K14.txt'],
      ['5. Sınıf - Destek ve Hareket Sistemi', 'B-K15-K28.txt'],
      ['5. Sınıf - Destek ve Hareket Sistemi', 'C-K29-K41.txt'],
      ['6. Sınıf - Bitkilerde Üreme ve Tohumun Çimlenmesi', 'A-K01-K14.txt'],
    ];
    // ⚠ YOL GÖMÜLMEZ. Bu blok bir kez gömdü ve 2026-08-03'te kırıldı: Mami "Bitkilerde Üreme"yi
    // bitirip `Biten/` altına aldı, dosya aynı yerde durmadı, test ENOENT verdi. Aynı kusur
    // A5'te bir gün önce onarılmıştı ve buraya taşınmamıştı — bu repoda beşinci tekrar.
    // Proje NEREDEYSE orada aranır; hiçbir yerde yoksa bu bir kusur DEĞİL, iş kapanmış olabilir —
    // o dosya atlanır ama en az bir dosya ölçülmüş olmalı, yoksa test sahte yeşile döner.
    const bul = (proje, dosya) => {
      for (const aday of [join(INBOX, proje, 'PROMPTLAR', dosya),
                          join(INBOX, 'Biten', proje, 'PROMPTLAR', dosya)]) {
        if (existsSync(aday)) return aday;
      }
      return null;
    };
    let olculen = 0;
    for (const [proje, dosya] of dosyalar) {
      const yol = bul(proje, dosya);
      if (!yol) continue;                     // proje silinmiş/yeniden adlandırılmış olabilir
      olculen += 1;
      const r = lintFile(yol, 'EDU');
      expect(`${proje}/${dosya}: ${tekrarKirmizi(r)}`).toBe(`${proje}/${dosya}: 0`);
    }
    expect(olculen, 'hiçbir aktif üretim dosyası bulunamadı — ölçüm körelmiş olabilir')
      .toBeGreaterThan(3);
  });

  it('EŞİK ALTI susar: aynı STYLE 2 karede varsa kırmızı YOK', () => {
    const kare = (n, style) => `### K0${n}\n50mm lens, a hand rests in contact with the table, `
      + `depth in three layers — near plane soft. Three things are alive in the frame.\n`
      + `STYLE: ${style}\nNEGATIVE: no text.\n`;
    const p = join(TMP, 'esik-alti.txt');
    writeFileSync(p, kare(1, 'aynı kuyruk') + kare(2, 'aynı kuyruk') + kare(3, 'başka kuyruk'));
    const r = lintFile(p, 'EDU');
    expect(r.metrics.styleMaxRepeat).toBe(2);
    expect(tekrarKirmizi(r)).toBe(0);
  });

  it('EŞİKTE ateşler: aynı STYLE 3 karede varsa üçü de kırmızı', () => {
    const kare = (n, style) => `### K0${n}\n50mm lens, a hand rests in contact with the table, `
      + `depth in three layers — near plane soft. Three things are alive in the frame.\n`
      + `STYLE: ${style}\nNEGATIVE: no text.\n`;
    const p = join(TMP, 'esikte.txt');
    writeFileSync(p, kare(1, 'aynı kuyruk') + kare(2, 'aynı kuyruk') + kare(3, 'aynı kuyruk'));
    const r = lintFile(p, 'EDU');
    expect(tekrarKirmizi(r)).toBe(3);
  });

  it('MOTION dosyasında ATEŞLEMEZ — motion bloğunun STYLE\'ı yoktur, kural onu görmemeli', () => {
    const r = lintFile(join(INBOX, 'Biten', 'Kuvvet ve Kuvvetin Ölçülmesi',
      'Kuvvet ve Kuvvetin Ölçülmesi_PROMPTLAR.md'), 'EDU');
    expect(r.bad.length).toBe(0);
  });

  it('EŞİK AYARLANABİLİR olmalı — sabit sayı bir hüküm, ayar bir seçenek', () => {
    expect(STYLE_TEKRAR_MIN).toBe(3);   // varsayılan; MAMILAS_STYLE_TEKRAR ile değişir
  });
});

// ---------------------------------------------------------------------------
// A7 · heceleme sahte alarmı — altın standardın STYLE dışındaki tek kırmızısıydı ve sahteydi.
// ---------------------------------------------------------------------------
describe('A7 · heceleme sayımı: olumsuzlanmış sayı iddia değildir', () => {
  it('"no two letters are made of the same substance" KIRMIZI VERMEZ (Üreme K48/K50)', () => {
    expect(kirmiziVar(lintBlock(
      'TEXT: the word "ÇEŞİTLİLİK" — a ten-letter word; no two letters are made of the same '
      + 'substance, and each letter stands one clear space apart.', 'EDU'), 'hece-sayi')).toBe(false);
  });

  it('gerçek YANLIŞ sayım hâlâ KIRMIZI — guard kuralı köreltmedi', () => {
    expect(kirmiziVar(lintBlock(
      'TEXT: "KÜTLE" — two letters, one clear space between each letter', 'EDU'),
    'hece-sayi')).toBe(true);
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

  // Sol denetimi 2026-07-29 — dördü de Üreme'nin (altın standart) sahte kırmızısıydı.
  // Ders: bu metinlerde bir kelimenin VARLIĞI hiçbir şey kanıtlamaz; NE YAPTIĞI kanıtlar.
  it('"@efe\'s bedroom" MEKÂN sahipliğidir — insan varlığı DEĞİL (K20)', () => {
    expect(kirmiziVar(lintBlock(
      "quarter view along the wooden study desk in @efe's bedroom, where three plain glass vessels stand",
      'EDU'), 'ten')).toBe(false);
  });

  it('"@efe\'s face" GÖVDE parçasıdır — insan VARDIR (K15, tek gerçek kırmızı)', () => {
    expect(kirmiziVar(lintBlock(
      "@efe's face is a very soft warm blur far behind the glass", 'EDU'), 'ten')).toBe(true);
  });

  it('"a hand\'s width" ÖLÇÜ birimidir, "hand-knitted" bileşik sıfattır — insan değil (K22/K41/K42)', () => {
    expect(kirmiziVar(lintBlock("lies separately a hand's width off on the same sand", 'EDU'), 'ten')).toBe(false);
    expect(kirmiziVar(lintBlock('an armchair with a hand-knitted blanket over its back', 'EDU'), 'ten')).toBe(false);
  });

  it('"child-safe" / "child-clear readability" bileşiktir — insan değil (K22, STYLE kuyruğu)', () => {
    expect(kirmiziVar(lintBlock('healthy tissue simply ending, calm and child-safe', 'EDU'), 'ten')).toBe(false);
  });

  it('deniz yıldızının KOLU insan uzvu değildir — `arm`/`head` GÖVDE listesinde yok (K22)', () => {
    expect(kirmiziVar(lintBlock('one single arm that has come away from it lies on the sand', 'EDU'), 'ten')).toBe(false);
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
    expect(kindOf(join(INBOX, 'Biten', '6. Sınıf - Eşeyli ve Eşeysiz Üreme',
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

// ---------------------------------------------------------------------------
// A5 · IŞIK YÜZÜ DIŞLIYOR — plastik tenin ölçülmüş İKİNCİ sebebi (2026-08-04).
//
// Hücre madeni: kavram ışığını yüzün DIŞINDA bırakan üç kare (K12 K13 K49) plastik,
// yüzü ışığın İÇİNE sokan iki kare (K07 K14) doğal — 5/5. Mekanizma: "ışık yüzüne
// ulaşmaz" bir NEGATİFTİR, motor negatiften karanlık üretmiyor, yüzü gradyansız
// ortam dolgusuna bırakıyor.
//
// ⚠ İLK ÖLÇÜMÜM SAHTE ÇIKTI: `parseBlocks` {head, body} nesnesi döndürürken onu string
// sandım ve regex "[object Object]" üzerinde koştu → 0/289 diye yanlış bir YEŞİL verdi.
// Bu testler o yüzden GERÇEK `lintBlock` yolundan geçer; kuralın kopyası yeniden yazılmaz.
// ---------------------------------------------------------------------------
describe('A5 · isik-yuzu-disliyor', () => {
  const govde = (ic) => [
    'A wide morning kitchen, @mira3 at the counter with the window behind her.',
    ic,
    'STYLE: soft matte gouache surfaces, warm morning palette.',
    'LIGHT AND PALETTE: one window key, warm bounce off the plaster wall.',
    'TEXT: YOK',
    'NEGATIVE: no extra people, no lettering anywhere.',
  ].join('\n');

  const anahtarlar = (b) => {
    const r = lintBlock(b, 'edu');
    return (Array.isArray(r) ? r : (r?.problems ?? [])).map((p) => p.key);
  };

  it('KIRMIZI KANITI: dışlama cümlesi var + karanlık çapası YOK → ateşler', () => {
    const b = govde('The key reaches nothing else — not @mira3\'s face, which stays in the '
      + 'room\'s warm morning shade while she looks down at the board.');
    expect(anahtarlar(b)).toContain('isik-yuzu-disliyor');
  });

  it('SUSMA KANITI: aynı dışlama + terminatör yazılmışsa ateşlemez', () => {
    const b = govde('The key reaches nothing else — not @mira3\'s face; the terminator falls '
      + 'as one soft curved line down her cheek so the near side sits well under, carried only '
      + 'by warm bounce off the sunlit wall and never lifted by any fill.');
    expect(anahtarlar(b)).not.toContain('isik-yuzu-disliyor');
  });

  it('SUSMA KANITI: insan yoksa hiç bakmaz (organel karesi dışlama yazabilir)', () => {
    const b = [
      'A single amber mitochondrion fills the frame, the light rising through its wall.',
      'The shaft reaches nothing else in the field — the slide edge stays unlit.',
      'STYLE: translucent amber membrane, matte grey-violet granules.',
      'LIGHT AND PALETTE: cool-white transmitted shaft from beneath.',
      'TEXT: YOK',
      'NEGATIVE: never cut open, never sectioned.',
    ].join('\n');
    expect(anahtarlar(b)).not.toContain('isik-yuzu-disliyor');
  });

  it('KORPUS AYRIMI: altın standart (Üreme) bu tuzaktan TEMİZ geçer', () => {
    const r = lintFile(join(INBOX, 'Biten', '6. Sınıf - Eşeyli ve Eşeysiz Üreme',
      'Eşeyli ve Eşeysiz Üreme_PROMPTLAR.txt'), 'EDU');
    const hepsi = JSON.stringify(r);
    expect(hepsi.includes('isik-yuzu-disliyor'),
      'ALTIN STANDART bu tuzağı ateşlerse tuzak yanlıştır, prompt değil').toBe(false);
  });
});

// ---------------------------------------------------------------------------
// A9 · LİNTER PROMPT YAZMAZ (2026-08-05).
//
// Ölçülen kusur: linter kırmızının yanına YAZILACAK İNGİLİZCE CÜMLEYİ koyuyordu.
// En açık örneği `isik-yuzu-disliyor` idi:
//   YAZMA: "the light reaches nothing of her face" · YAZ: "the terminator falls as one soft
//   curved line down her cheek so the near side sits well under, carried only by warm bounce…"
// Yani ölçen, sahnenin ışığını yönetmenin yerine seçiyordu — ve tam bu kural ALTIN STANDARDIN
// (Hücre) kendi kanıtında "doğal" diye geçen K07 karesinde kırmızı yanıyordu.
//
// Bu blok, hazır cümlenin geri gelmesi hâlinde düşer. Ölçüt: bir kural metni içinde
// TIRNAK İÇİNDE 6+ kelimelik İngilizce öbek = yapıştırılabilir prompt cümlesi.
describe('A9 · linter denetçidir, prompt yazarı değildir', () => {
  const KURAL_METINLERI = () => {
    const metinler = [];
    for (const s of SLOTS) metinler.push([`slot:${s.key}`, `${s.label ?? ''} ${s.why ?? ''}`]);
    for (const t of TRAPS) metinler.push([`trap:${t.key}`, `${t.fix ?? ''} ${t.msg ? '' : ''}`]);
    return metinler;
  };

  /** Tırnak içinde 6+ kelime, çoğu ASCII harf → yapıştırılabilir İngilizce öbek. */
  const HAZIR_CUMLE = /"([A-Za-z][A-Za-z0-9,;:'\- ]{28,})"/g;

  it('hiçbir kural metni yapıştırılabilir İngilizce prompt cümlesi VERMEZ', () => {
    const suclular = [];
    for (const [ad, metin] of KURAL_METINLERI()) {
      for (const m of String(metin).matchAll(HAZIR_CUMLE)) {
        const kelime = m[1].trim().split(/\s+/).length;
        if (kelime >= 6) suclular.push(`${ad} → "${m[1].slice(0, 60)}…" (${kelime} kelime)`);
      }
    }
    expect(suclular, 'ölçen prompt cümlesi veriyor — mekanizmayı yaz, cümleyi Claude kurar').toEqual([]);
  });

  it('ALTIN STANDART bugünkü linter\'dan KIRMIZI ALMAZ — kalibrasyonun tek gerçek sınaması', () => {
    // 2026-08-05 ölçümü: Hücre 4 dosyada 5 kırmızı alıyordu (A 3/15 · C 1/14 · D 1/9) ve
    // ateşleyen kural `isik-yuzu-disliyor`du. Bir ölçüm aracının şaheseri reddetmesi,
    // kalibrasyonunun bozulduğunun tanımıdır.
    const HUCRE = join(INBOX, 'Biten', '5. Sınıf - Hücre ve Organelleri', 'PROMPTLAR');
    for (const dosya of ['A-K01-K15.txt', 'B-K16-K30.txt', 'C-K31-K44.txt', 'D-K45-K53.txt']) {
      const r = lintFile(join(HUCRE, dosya), 'EDU');
      expect(r.total, `${dosya} parse edilemedi`).toBeGreaterThan(5);
      expect(r.bad.map((b) => b.head.slice(0, 40)), `${dosya} kırmızı verdi`).toEqual([]);
    }
  });
});
