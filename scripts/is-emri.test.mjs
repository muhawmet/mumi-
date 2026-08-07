// İŞ EMRİ — omurganın sınavı: bir koşu yarıda kesilince YENİ bir oturum onu devralabiliyor mu?
// Bu test dosyayı gerçekten diske yazar (geçici dizine), çünkü ölçülen kusur tam olarak
// "bellekte doğru, diskte yok" sınıfındandır.

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  ASAMALAR, IsEmriError, denemeKaydet, emirOku, emirYaz, karne,
  sekansHaritasi, siradakiEylem, yeniEmir,
} from './is-emri.mjs';

let dizin;
let yol;

beforeEach(() => {
  dizin = mkdtempSync(path.join(tmpdir(), 'is-emri-'));
  yol = path.join(dizin, 'proje.json');
});
afterEach(() => rmSync(dizin, { recursive: true, force: true }));

describe('iş emri — omurga', () => {
  it('kare sayısından shot listesi kurar ve sekansları dağıtır', () => {
    const emir = yeniEmir('Test Projesi', 5, { sekans: 'S1:1-2,S2:3-5' });
    expect(emir.shots).toHaveLength(5);
    expect(emir.shots.map((s) => s.sekans)).toEqual(['S1', 'S1', 'S2', 'S2', 'S2']);
    expect(emir.shots.every((s) => s.asama === 'yazildi')).toBe(true);
  });

  it('sekans verilmezse omurga yine kurulur — S0 taşıyıcıdır, hata değil', () => {
    expect([...sekansHaritasi(undefined, 3).values()]).toEqual(['S0', 'S0', 'S0']);
  });

  it('bozuk sekans biçimi SESSİZ geçmez', () => {
    expect(() => sekansHaritasi('S1', 3)).toThrow(IsEmriError);
    expect(() => sekansHaritasi('S1:5-2', 5)).toThrow(IsEmriError);
  });

  it('YAZILAN İŞ EMRİ DİSKTEN AYNEN GERİ OKUNUR — otonomluğun tek şartı', () => {
    const emir = yeniEmir('Devir Sınavı', 3, { simdi: '2026-08-07T00:00:00.000Z' });
    denemeKaydet(emir, {
      kare: 1, asama: 'basim', motor: 'nano_banana_flash', cuzdan: 'magnific',
      kredi: 75, sonuc: 'kabul', simdi: '2026-08-07T00:01:00.000Z',
    });
    emirYaz(emir, { yol });

    // Yeni "oturum": hiçbir şey bellekte taşınmıyor, yalnız dosya var.
    const devralinan = emirOku('Devir Sınavı', { yol });
    expect(devralinan.shots[0].asama).toBe('onaylandi');
    expect(devralinan.shots[0].basim[0].kredi).toBe(75);
    expect(siradakiEylem(devralinan)).toEqual({ eylem: 'bas', kareler: [2, 3] });
  });

  it('atomik yazım geçici dosya bırakmaz', () => {
    emirYaz(yeniEmir('Atomik', 1), { yol });
    expect(existsSync(`${yol}.tmp`)).toBe(false);
    expect(JSON.parse(readFileSync(yol, 'utf8')).proje).toBe('Atomik');
  });

  it('RED aşamayı İLERLETMEZ — bir sonraki denemeyi doğurur', () => {
    const emir = yeniEmir('Recreate', 1);
    denemeKaydet(emir, { kare: 1, asama: 'basim', sonuc: 'red', kusur: 'yazi' });
    expect(emir.shots[0].asama).toBe('basildi');
    expect(karne(emir).ilkBasimTutmaOrani).toBe(0);

    denemeKaydet(emir, { kare: 1, asama: 'basim', sonuc: 'kabul' });
    expect(emir.shots[0].asama).toBe('onaylandi');
    expect(emir.shots[0].basim.map((d) => d.deneme)).toEqual([1, 2]);
    // İlk deneme tutmadı — oran hâlâ 0. Kuzey yıldızı "sonunda tuttu"yu ödüllendirmez.
    expect(karne(emir).ilkBasimTutmaOrani).toBe(0);
  });

  it('kuzey yıldızı ilk basımda tutan kareyi sayar', () => {
    const emir = yeniEmir('Oran', 4);
    denemeKaydet(emir, { kare: 1, asama: 'basim', sonuc: 'kabul' });
    denemeKaydet(emir, { kare: 2, asama: 'basim', sonuc: 'kabul' });
    denemeKaydet(emir, { kare: 3, asama: 'basim', sonuc: 'kabul' });
    denemeKaydet(emir, { kare: 4, asama: 'basim', sonuc: 'red' });
    expect(karne(emir).ilkBasimTutmaOrani).toBe(0.75);
  });

  it('harcanan krediyi basım ve klip üstünden toplar', () => {
    const emir = yeniEmir('Kredi', 2);
    denemeKaydet(emir, { kare: 1, asama: 'basim', kredi: 75, sonuc: 'kabul' });
    denemeKaydet(emir, { kare: 1, asama: 'klip', kredi: 450, sonuc: 'kabul' });
    denemeKaydet(emir, { kare: 2, asama: 'basim', kredi: 75, sonuc: 'red' });
    expect(karne(emir).harcananKredi).toBe(600);
  });

  it('olmayan kareye ve bilinmeyen aşamaya kayıt SESSİZ geçmez', () => {
    const emir = yeniEmir('Kapı', 2);
    expect(() => denemeKaydet(emir, { kare: 9, asama: 'basim', sonuc: 'kabul' })).toThrow(IsEmriError);
    expect(() => denemeKaydet(emir, { kare: 1, asama: 'kurgu', sonuc: 'kabul' })).toThrow(IsEmriError);
    expect(() => denemeKaydet(emir, { kare: 1, asama: 'basim', sonuc: 'belki' })).toThrow(IsEmriError);
  });

  it('sıradaki eylem üretim sırasını takip eder', () => {
    const emir = yeniEmir('Sıra', 2);
    expect(siradakiEylem(emir).eylem).toBe('bas');

    denemeKaydet(emir, { kare: 1, asama: 'basim', sonuc: 'red' });
    denemeKaydet(emir, { kare: 2, asama: 'basim', sonuc: 'kabul' });
    expect(siradakiEylem(emir).eylem).toBe('onay-bekliyor');

    denemeKaydet(emir, { kare: 1, asama: 'basim', sonuc: 'kabul' });
    expect(siradakiEylem(emir)).toEqual({ eylem: 'klip-bas', kareler: [1, 2] });

    // Klip kabul edilse bile sıra KURGUYA geçmez — denetim ayrı bir aşamadır ve atlanamaz.
    denemeKaydet(emir, { kare: 1, asama: 'klip', sonuc: 'kabul' });
    denemeKaydet(emir, { kare: 2, asama: 'klip', sonuc: 'kabul' });
    expect(siradakiEylem(emir)).toEqual({ eylem: 'denetle', kareler: [1, 2] });
  });

  it('aşama sırası geriye gitmez — sözlük donuktur', () => {
    expect(ASAMALAR).toEqual(['yazildi', 'basildi', 'onaylandi', 'klip', 'denetlendi', 'kesildi']);
  });
});
