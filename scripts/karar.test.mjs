// KARAR YÜZEYİ — insan kapısının sınavı.
// Ölçülen kusur: rapor duvarının içine gömülen teklif OKUNMAMIŞ sayılıyor. Bu yüzden test
// iki şeyi kilitler: (1) ekran BEŞ maddeyi geçmiyor, (2) bloke eden madde paradan ve
// öğrenmeden ÖNCE geliyor — sıra yanlışsa yüzey işini yapmamıştır.

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { EKRAN_TAVANI, ONCELIK, bekleyenDersSayisi, ekran, kalemleriTopla, main, usage } from './karar.mjs';

const shot = (n, asama, basim = [], klip = []) => ({ n, sekans: 'S1', asama, elementler: [], basim, klip, not: '' });
const red = (kusur) => ({ deneme: 1, motor: 'nb2', cuzdan: 'magnific', kredi: 60, sonuc: 'red', kusur });
const kabul = () => ({ deneme: 2, motor: 'nb2', cuzdan: 'magnific', kredi: 60, sonuc: 'kabul', kusur: null });

let emirDizin;
let dersDizin;
let isKaydi;
beforeEach(() => {
  const kok = mkdtempSync(path.join(tmpdir(), 'karar-'));
  isKaydi = path.join(kok, "yok-current-work.json");
  emirDizin = path.join(kok, 'is-emri');
  dersDizin = path.join(kok, 'lessons');
  mkdirSync(emirDizin, { recursive: true });
  mkdirSync(dersDizin, { recursive: true });
});
afterEach(() => rmSync(path.dirname(emirDizin), { recursive: true, force: true }));

const yazEmir = (proje, shots) =>
  writeFileSync(path.join(emirDizin, `${proje}.json`), JSON.stringify({ surum: 1, proje, shots }));

describe('karar yüzeyi — boş hal', () => {
  it('bekleyen yoksa bunu AÇIKÇA söyler, iş uydurmaz', () => {
    const cikti = main([], { emirDizin, dersDizin, isKaydi });
    expect(cikti).toContain('senden bekleyen bir şey YOK');
  });
});

describe('karar yüzeyi — öncelik', () => {
  it('onay bekleyen kare BLOKE önceliğinde gelir', () => {
    yazEmir('Kuvvet', [shot(1, 'basildi', [red('yazi')])]);
    const [k] = kalemleriTopla({ emirDizin, dersDizin, isKaydi });
    expect(k.oncelik).toBe(ONCELIK.bloke);
    expect(k.baslik).toContain('onayını bekliyor');
  });

  it('bloke eden madde öğrenmeden ÖNCE sıralanır', () => {
    yazEmir('A', [shot(1, 'basildi', [red('yazi')])]);
    writeFileSync(path.join(dersDizin, 'ONAY-BEKLEYEN.md'), '# x');
    const kalemler = kalemleriTopla({ emirDizin, dersDizin, isKaydi });
    expect(kalemler[0].oncelik).toBe(ONCELIK.bloke);
    expect(kalemler[kalemler.length - 1].oncelik).toBe(ONCELIK.ogrenme);
  });

  it('onaylı kare klip beklerken CANARY hatırlatması taşır', () => {
    yazEmir('A', [shot(1, 'onaylandi', [kabul()])]);
    const k = kalemleriTopla({ emirDizin, dersDizin, isKaydi }).find((x) => x.baslik.includes('klip bekliyor'));
    expect(k.gerekce).toContain('6\'sı bozuk');
  });

  it('üç vuruş dolunca öğrenme maddesi doğar', () => {
    for (const p of ['A', 'B', 'C']) yazEmir(p, [shot(1, 'onaylandi', [red('plastik'), kabul()])]);
    const k = kalemleriTopla({ emirDizin, dersDizin, isKaydi }).find((x) => x.baslik.includes('üç vuruşu'));
    expect(k.detay).toContain('plastik');
    expect(k.oncelik).toBe(ONCELIK.ogrenme);
  });
});

describe('karar yüzeyi — ekran tavanı', () => {
  it('BEŞ maddeyi geçmez ve kalanın SAYISINI söyler', () => {
    for (let i = 0; i < 8; i += 1) yazEmir(`P${i}`, [shot(1, 'basildi', [red('yazi')])]);
    const kalemler = kalemleriTopla({ emirDizin, dersDizin, isKaydi });
    expect(kalemler.length).toBeGreaterThan(EKRAN_TAVANI);

    const cikti = ekran(kalemler);
    expect((cikti.match(/onayını bekliyor/g) ?? [])).toHaveLength(EKRAN_TAVANI);
    expect(cikti).toContain('altıncı madde okunmuyor');
  });

  it('--json yalnız tavan kadar kalem verir ama toplamı bildirir', () => {
    // 7 proje × 7 onay maddesi + aynı kusur 7 ayrı işte tekrar ettiği için 1 üç-vuruş maddesi.
    for (let i = 0; i < 7; i += 1) yazEmir(`P${i}`, [shot(1, 'basildi', [red('yazi')])]);
    const veri = JSON.parse(main(['--json'], { emirDizin, dersDizin, isKaydi }));
    expect(veri.toplam).toBe(8);
    expect(veri.kalemler).toHaveLength(EKRAN_TAVANI);
    expect(veri.kalemler.every((k) => k.oncelik === ONCELIK.bloke)).toBe(true);
  });
});

describe('karar yüzeyi — her madde tuşa iniyor', () => {
  it('her kalemde seçenek ve gerekçe var — açık uçlu madde yok', () => {
    yazEmir('A', [shot(1, 'basildi', [red('yazi')]), shot(2, 'onaylandi', [kabul()])]);
    for (const k of kalemleriTopla({ emirDizin, dersDizin, isKaydi })) {
      expect(k.secenekler.length).toBeGreaterThanOrEqual(2);
      expect(k.gerekce.length).toBeGreaterThan(10);
    }
  });

  it('ders dosyalarını sayar', () => {
    writeFileSync(path.join(dersDizin, 'CANDIDATES-x.md'), '#');
    writeFileSync(path.join(dersDizin, 'ONAY-BEKLEYEN.md'), '#');
    writeFileSync(path.join(dersDizin, 'APPROVED.md'), '#');
    expect(bekleyenDersSayisi({ dizin: dersDizin })).toBe(2);
  });

  it('--yardim kullanımı basar', () => {
    expect(main(['--yardim'], { emirDizin, dersDizin, isKaydi })).toBe(usage());
  });
});
