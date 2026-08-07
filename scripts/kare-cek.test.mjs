// KARE ÇEK — hakem ayağının sınavı. ffmpeg çağrılmaz; ölçülen şey ARALIK MATEMATİĞİ ve
// `--kuru` ile gösterilen komut. Asıl kusur (AGY'nin uydurduğu ondalık saniye) burada
// aralığın doğru kareye çevrilmesiyle kapanıyor — yanlış aralık, yanlış kanıt demektir.

import { describe, expect, it } from 'vitest';
import { KareCekError, DONMA_ESIGI, araligiCoz, komut, main, usage, yavgOku, zamanNoktalari } from './kare-cek.mjs';

describe('kare çek — aralık', () => {
  it('saniye ve dakika:saniye biçimlerini çözer', () => {
    expect(araligiCoz('53-58')).toEqual({ bas: 53, son: 58 });
    expect(araligiCoz('1:03-1:08')).toEqual({ bas: 63, son: 68 });
    expect(araligiCoz('53-58.5')).toEqual({ bas: 53, son: 58.5 });
  });

  it('tek sayı verilirse 1 saniyelik pencere açar', () => {
    expect(araligiCoz('55')).toEqual({ bas: 55, son: 56 });
  });

  it('ters ya da bozuk aralık SESSİZ geçmez', () => {
    expect(() => araligiCoz('58-53')).toThrow(KareCekError);
    expect(() => araligiCoz('53-53')).toThrow(KareCekError);
    expect(() => araligiCoz('elli')).toThrow(KareCekError);
  });
});

describe('kare çek — dağılım', () => {
  it('kareleri aralığa EŞİT dağıtır ve uçları dahil eder', () => {
    expect(zamanNoktalari(53, 58, 6)).toEqual([53, 54, 55, 56, 57, 58]);
  });

  it('ondalık aralıkta da uçları tutar', () => {
    const n = zamanNoktalari(2, 3, 5);
    expect(n[0]).toBe(2);
    expect(n[n.length - 1]).toBe(3);
    expect(n).toHaveLength(5);
  });

  it('tek kare fark ölçemez — reddeder', () => {
    expect(() => zamanNoktalari(1, 2, 1)).toThrow(KareCekError);
  });
});

describe('kare çek — cetvel', () => {
  it('signalstats çıktısından son YAVG değerini okur', () => {
    const ham = 'lavfi.signalstats.YAVG=12.500\nlavfi.signalstats.YAVG=0.181\n';
    expect(yavgOku(ham)).toBe(0.181);
  });

  it('YAVG yoksa null döner — uydurulmuş sıfır basmaz', () => {
    expect(yavgOku('hiçbir şey')).toBeNull();
  });

  it('donma eşiği koda gömülü ve md5 DEĞİL — sıkıştırma gürültüsü donmayı gizleyemesin', () => {
    expect(DONMA_ESIGI).toBeGreaterThan(0);
    expect(DONMA_ESIGI).toBeLessThan(2);
  });
});

describe('kare çek — kuru koşu', () => {
  it('--kuru koşmadan kuracağı ffmpeg komutlarını basar', () => {
    const cikti = komut('/f/film.mp4', { bas: 53, son: 58 }, 3, {});
    expect(cikti).toContain('-ss 53');
    expect(cikti).toContain('-ss 58');
    expect(cikti.split('\n')).toHaveLength(3);
  });

  it('--ses istenince transkript adımlarını da gösterir', () => {
    const cikti = komut('/f/film.mp4', { bas: 10, son: 12 }, 2, { ses: true });
    expect(cikti).toContain('whisper-cli');
    expect(cikti).toContain('-ar 16000');
  });

  it('argümansız çağrı kullanımı basar, patlamaz', () => {
    expect(main([])).toBe(usage());
  });

  it('film verilip aralık verilmezse durur — sessiz varsayılan yok', () => {
    expect(() => main(['/f/film.mp4'])).toThrow(KareCekError);
  });
});
