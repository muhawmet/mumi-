// SHOT CARD LINT — KIRMIZI FIXTURE'LAR.
//
// Bu dosyadaki her test, kural KALKARSA ya da GEVŞERSE düşecek biçimde yazıldı.
// Repo yasası: "yeşil test tek başına kanıt değildir" — o yüzden her kuralın hem
// ateşlediği hem ateşlemediği hâl çivileniyor (sahte alarm da bir kusurdur).

import { describe, expect, it } from 'vitest';
import {
  parseShotCards, lintShotCard, ALANLAR, RISK_SOZLUGU, OLCULMEYEN,
} from './shot-card-lint.mjs';

/** Sözleşmeye tam uyan kart — testler bunun ÜSTÜNE tek bir sapma bindirir. */
const temizKart = (uzerine = {}) => {
  const alan = {
    'VO YÜKÜMÜ': 'Kuklanın kendi başına duramadığı görünmeli',
    'FİKİR': 'Destek olmayan gövde çöker',
    'AYRICALIK': 'Çöküş anı gerçek bir kuklada tekrarlanamaz, animasyon tekrarlar',
    'KAHRAMAN': 'ahşap kukla',
    'BAŞLANGIÇ': 'kukla masaya yeni oturtuldu, el henüz çekilmedi',
    'DEĞİŞİM': 'kukla yana devrilir ve masada durur',
    'MOTION HAZIR': 'evet — el çekilince ağırlık merkezi kayar',
    'KAMERA': 'sabit, çünkü çöküşün kendisi olay',
    'REF ROLLERİ': 'kimlik @mira4 · mekân @atolye · malzeme ahşap',
    'RİSK': 'katı nesne · morph',
    'SÜREKLİLİK': 'K3ten masa düzenini alır, K5e devrilmiş kuklayı bırakır',
    ...uzerine,
  };
  const govde = ALANLAR.map((ad) => `${ad}: ${alan[ad] ?? ''}`).join('\n');
  return `### K4 | 5s · VO "Kukla olduğu yerde yığıldı."\n${govde}\n`;
};

const kart = (metin) => parseShotCards(metin)[0];
const keys = (ps, lvl) => ps.filter((p) => p.level === lvl).map((p) => p.key);

describe('parseShotCards — sözleşme okunuyor mu', () => {
  it('11 alanı da bulur ve kare numarasını çıkarır', () => {
    const k = kart(temizKart());
    expect(k.kare).toBe('4');
    for (const ad of ALANLAR) expect(k.alanlar[ad], `alan okunamadı: ${ad}`).toBeTruthy();
  });

  it('birden çok kartı ayırır', () => {
    const iki = `${temizKart()}\n${temizKart().replace('K4', 'K5')}`;
    expect(parseShotCards(iki)).toHaveLength(2);
  });

  it('not satırı başlık SANILMAZ — motion-lint ile aynı hayalet kusuru', () => {
    // 2026-08-05: motion-lint'te `K5 (uzanan kol yok…)` düz cümlesi başlık sayılıp
    // hayalet klip doğurmuştu. Aynı hata burada tekrarlanmasın.
    const m = `${temizKart()}\nNOTLAR\nK5 (uzanan kol yok ama kitap kilidi), K7 (açık el)\n`;
    expect(parseShotCards(m)).toHaveLength(1);
  });
});

describe('KIRMIZI — kanıtlı eksikler', () => {
  it('temiz kart hiç kırmızı vermez (sahte alarm yok)', () => {
    expect(keys(lintShotCard(kart(temizKart())), 'kirmizi')).toEqual([]);
  });

  it('FIXTURE · BAŞLANGIÇ "bitmiş" + MOTION HAZIR "evet" → KIRMIZI', () => {
    // Planın birebir istediği fixture. Kartın en sert kuralı budur:
    // olmuş bir olay canlandırılamaz.
    const ps = lintShotCard(kart(temizKart({
      'BAŞLANGIÇ': 'kukla çoktan yığılmış, çöküş bitmiş',
      'MOTION HAZIR': 'evet',
    })));
    expect(keys(ps, 'kirmizi')).toContain('celiski-esik');
  });

  it('aynı çelişki YALNIZ biri varsa ateşlemez', () => {
    const bitmisAmaHazirDegil = lintShotCard(kart(temizKart({
      'BAŞLANGIÇ': 'çöküş bitmiş',
      'MOTION HAZIR': 'hayır — kareden gerçek olay çıkmıyor, YENİDEN-BASIM',
    })));
    expect(keys(bitmisAmaHazirDegil, 'kirmizi')).not.toContain('celiski-esik');
  });

  it('FIXTURE · eksik alan → KIRMIZI', () => {
    const m = temizKart().split('\n').filter((l) => !l.startsWith('AYRICALIK:')).join('\n');
    expect(keys(lintShotCard(kart(m)), 'kirmizi')).toContain('alan-eksik');
  });

  it('FIXTURE · `—` ile doldurulmuş alan boş sayılır → KIRMIZI', () => {
    const ps = lintShotCard(kart(temizKart({ 'FİKİR': '—' })));
    expect(keys(ps, 'kirmizi')).toContain('alan-bos');
  });

  it('FIXTURE · sözlük dışı risk → KIRMIZI', () => {
    const ps = lintShotCard(kart(temizKart({ 'RİSK': 'ışık patlaması · vibe' })));
    expect(keys(ps, 'kirmizi')).toContain('risk-sozluk');
    // Sözlükteki her terim temiz geçmeli — kapalı liste sahte alarm vermemeli.
    for (const r of RISK_SOZLUGU) {
      expect(keys(lintShotCard(kart(temizKart({ 'RİSK': r }))), 'kirmizi'), `sahte alarm: ${r}`)
        .not.toContain('risk-sozluk');
    }
  });

  it('FIXTURE · başlıktaki VO seslendirmede yoksa → KIRMIZI', () => {
    const yok = lintShotCard(kart(temizKart()), { voMetni: 'Bambaşka bir cümle var burada.' });
    expect(keys(yok, 'kirmizi')).toContain('vo-yok');
    const var_ = lintShotCard(kart(temizKart()), { voMetni: 'Kukla olduğu yerde yığıldı.' });
    expect(keys(var_, 'kirmizi')).not.toContain('vo-yok');
  });
});

describe('SARI — ajanın tek geçişte bakacağı yerler', () => {
  it('FIXTURE · DEĞİŞİM kahramanı anmıyorsa → SARI (AGY 2026-08-05 bulgusu)', () => {
    // Mami'nin "plastik" dediği kusurun kart karşılığı: kadrajın kahramanı Mira
    // ama değişen şey kuklanın bacağı. Hareket YANLIŞ ÖZNEYE gitmiş.
    const ps = lintShotCard(kart(temizKart({
      'KAHRAMAN': '@mira4',
      'DEĞİŞİM': 'kuklanın bacakları bükülür',
    })));
    expect(keys(ps, 'sari')).toContain('kahraman-degisim');
  });

  it('kahraman DEĞİŞİM içinde geçiyorsa sarı YOK — sahte alarm regresyonu', () => {
    const ps = lintShotCard(kart(temizKart({
      'KAHRAMAN': 'ahşap kukla',
      'DEĞİŞİM': 'kukla yana devrilir',
    })));
    expect(keys(ps, 'sari')).not.toContain('kahraman-degisim');
  });

  it('FIXTURE · gerekçesiz kamera hareketi → SARI', () => {
    const ps = lintShotCard(kart(temizKart({ 'KAMERA': 'yavaş push-in' })));
    expect(keys(ps, 'sari')).toContain('kamera-gerekce');
    const gerekceli = lintShotCard(kart(temizKart({
      'KAMERA': 'push-in, çünkü fark ediş anı burada',
    })));
    expect(keys(gerekceli, 'sari')).not.toContain('kamera-gerekce');
  });

  it('FIXTURE · SÜREKLİLİK komşu kare anmıyorsa → SARI', () => {
    const ps = lintShotCard(kart(temizKart({ 'SÜREKLİLİK': 'masa düzeni aynı kalır' })));
    expect(keys(ps, 'sari')).toContain('sureklilik-atif');
  });
});

describe('ölçülmeyen listesi — kapı kendi körlüğünü söyler', () => {
  it('estetik ve kahraman SEÇİMİ açıkça ölçülmeyen sayılır', () => {
    const hepsi = OLCULMEYEN.join(' ').toLowerCase();
    expect(hepsi).toContain('kadraj');
    expect(hepsi).toContain('duygu');
    expect(OLCULMEYEN.length).toBeGreaterThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// TÜRKÇE BÜYÜK HARF TUZAĞI — canlı kartta yakalandı (2026-08-05).
// JS'in `i` bayrağı `İ↔i` eşlemiyor: `BİTMİŞ` yazan bir kart çelişki kuralından
// SESSİZCE kaçıyordu. K11 başka bir kelimeyle yakalandı, K37 aynı çelişkiyle geçti.
// ---------------------------------------------------------------------------
describe('Türkçe büyük harf — sessiz kaçış kapandı', () => {
  const kartMetni = (bas, hazir) => {
    const alan = {
      'VO YÜKÜMÜ': 'x', 'FİKİR': 'x', 'AYRICALIK': 'x', 'KAHRAMAN': 'kukla',
      'BAŞLANGIÇ': bas, 'DEĞİŞİM': 'kukla devrilir', 'MOTION HAZIR': hazir,
      'KAMERA': 'sabit', 'REF ROLLERİ': 'kimlik @a', 'RİSK': 'morph',
      'SÜREKLİLİK': 'K3ten alır',
    };
    return `### K9 | 5s · VO "z"\n${ALANLAR.map((a) => `${a}: ${alan[a]}`).join('\n')}\n`;
  };

  it('BÜYÜK harfli `BİTMİŞ` de yakalanır — küçük harfli kadar', () => {
    const buyuk = lintShotCard(parseShotCards(kartMetni('olay BİTMİŞ sayılır', 'evet'))[0]);
    expect(buyuk.filter((p) => p.key === 'celiski-esik')).toHaveLength(1);
  });

  it('BÜYÜK harfli `EVET` de yakalanır', () => {
    const buyuk = lintShotCard(parseShotCards(kartMetni('olay bitmiş', 'EVET — olur'))[0]);
    expect(buyuk.filter((p) => p.key === 'celiski-esik')).toHaveLength(1);
  });

  it('çelişki yoksa büyük harf sahte alarm vermez', () => {
    const temiz = lintShotCard(parseShotCards(kartMetni('olay ÖNCESİ', 'EVET'))[0]);
    expect(temiz.filter((p) => p.key === 'celiski-esik')).toHaveLength(0);
  });
});
