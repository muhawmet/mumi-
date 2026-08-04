// YASA FİŞİ — davranış kilitleri.
//
// Bu araç bir EŞLEME TABLOSU taşıyor ve eşleme tabloları bu depoda ölçülmüş en tehlikeli
// şeydir: yasadaki başlık yeniden adlandırılınca tablo sessizce boş döner ve fiş "temiz"
// görünür. On kez ölçülen kusur sınıfı bu. Aşağıdaki ilk test o riski duvara çevirir.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bolumleriCikar, fisDerle, fisYaz, ozellikCikar, TABLO, YASA_YOLU } from './yasa-fisi.mjs';

const YASA = readFileSync(decodeURIComponent(fileURLToPath(new URL('file://' + YASA_YOLU))), 'utf8');

describe('yasa-fişi · DRIFT KAPISI', () => {
  it('KIRMIZI KANITI: başlık bulunamazsa SESSİZ GEÇMEZ, hata fırlatır', () => {
    const sahteYasa = '## Alakasız başlık\n\nmetin\n\n### Başka bir şey\n\nmetin\n';
    expect(() => fisDerle(sahteYasa, { register: 'edu' })).toThrow(/tablo bayatladı/i);
  });

  it('hata mesajı EKSİK KALIPLARI adıyla sayar (sessiz yeşil değil, adresli kırmızı)', () => {
    try {
      fisDerle('## hiçbir şey\n', { register: 'edu' });
      throw new Error('fisDerle hata fırlatmalıydı');
    } catch (e) {
      expect(e.eksik).toBeDefined();
      expect(e.eksik.length).toBe(TABLO.length);
      expect(e.message).toMatch(/boş\/eksik fiş "temiz" demek değil/i);
    }
  });

  it('GERÇEK YASA: tablodaki HER kalıp gerçek bir başlığa vuruyor', () => {
    // Bu test yasayla tablo arasındaki bağı canlı tutar. Yasadaki bir başlık yeniden
    // adlandırıldığı an burası kırmızı yanar — fiş sessizce eksilmez.
    const bolumler = bolumleriCikar(YASA);
    const vurmayan = TABLO.filter((k) => !bolumler.some((b) => k.kalip.test(b.baslik)));
    expect(vurmayan.map((k) => k.id)).toEqual([]);
  });
});

describe('yasa-fişi · seçim', () => {
  it('start-frame fişi motion bölümlerini TAŞIMAZ', () => {
    const s = fisDerle(YASA, { register: 'edu', motion: false });
    expect(s.some((x) => x.id.startsWith('motion-'))).toBe(false);
    expect(s.some((x) => x.id === 'template')).toBe(true);
  });

  it('motion fişi start-frame şablonunu TAŞIMAZ ama motion bölümlerini taşır', () => {
    const s = fisDerle(YASA, { register: 'edu', motion: true });
    expect(s.some((x) => x.id === 'template')).toBe(false);
    expect(s.some((x) => x.id === 'motion-degisim')).toBe(true);
  });

  it('§0 ANİMASYONUN RUHU ve §1a KISTAS her fişte var (register/motion fark etmez)', () => {
    for (const oz of [{ register: 'edu' }, { register: 'real' }, { register: 'edu', motion: true }]) {
      const ids = fisDerle(YASA, oz).map((x) => x.id);
      expect(ids, JSON.stringify(oz)).toContain('ruh');
      expect(ids, JSON.stringify(oz)).toContain('kistas');
    }
  });

  it('REAL register REAL bölümlerini açar, EDU açmaz', () => {
    expect(fisDerle(YASA, { register: 'real' }).some((x) => x.id === 'real-uclu')).toBe(true);
    expect(fisDerle(YASA, { register: 'edu' }).some((x) => x.id === 'real-uclu')).toBe(false);
  });

  it('ASIL İŞ: fiş yasanın YARISINDAN AZINI seçiyor — yoksa hiçbir işe yaramaz', () => {
    const toplamSatir = YASA.split('\n').length;
    for (const oz of [{ register: 'edu' }, { register: 'edu', motion: true }]) {
      const okunacak = fisDerle(YASA, oz).reduce((a, b) => a + b.satirSayisi, 0);
      expect(okunacak, JSON.stringify(oz)).toBeLessThan(toplamSatir * 0.5);
      expect(okunacak, 'fiş boş olamaz').toBeGreaterThan(50);
    }
  });
});

describe('yasa-fişi · özellik çıkarımı ve çıktı', () => {
  it('metinden @handle ve TEXT slotunu okur', () => {
    const f = ozellikCikar('[2 ÖZNE] — @mira3 lifts the jar\nTEXT: "HÜCRE"\n');
    expect(f.tag).toBe(true);
    expect(f.yazi).toBe(true);
  });

  it('TEXT: YOK yazan kare yazı taşımaz sayılır', () => {
    expect(ozellikCikar('TEXT: YOK\n').yazi).toBe(false);
  });

  it('çıktı KAYNAK HASH taşır — fiş bayatladığında anlaşılsın', () => {
    const s = fisDerle(YASA, { register: 'edu' });
    const out = fisYaz(s, { register: 'edu' }, 'abc123def456789', 1000);
    expect(out).toMatch(/hash `abc123def456`/);
    expect(out).toMatch(/OKUMA PLANIDIR/);
  });
});
