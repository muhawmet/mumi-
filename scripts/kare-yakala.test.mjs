// KARE-YAKALA + BASIM-KUYRUĞU — davranış kilitleri.
//
// Bu iki araç Mami'nin ELİNİN yerine geçiyor: inen PNG'yi kuyruğun sıradaki numarasıyla
// projeye alıyor. Yanlış numara ya da sessiz üzerine yazma, 5-8 dakikalık kredi yakılmış
// bir kareyi geri dönüşsüz siler — bu depoda geri alınamayan tek kayıp sınıfı budur.
// Aşağıdaki testler tam olarak o iki riski çiviler.

import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readdirSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { taraProje, bekleyenSayisi, sonrakiKare, projeListesi } from './basim-kuyrugu.mjs';
import { kareAdi, gorselMi, adaylar, yakala, argAyir, indirmeKlasoru } from './kare-yakala.mjs';

/** Sahte repo: agents/COMMAND-INBOX/<proje>/PROMPTLAR + basılı kareler. */
function repo({ proje = 'Test Projesi', promptlar = {}, basili = [], kareDirAdi = 'images' } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'kare-yakala-'));
  const kok = join(root, 'agents', 'COMMAND-INBOX', proje);
  mkdirSync(join(kok, 'PROMPTLAR'), { recursive: true });
  for (const [ad, icerik] of Object.entries(promptlar)) writeFileSync(join(kok, 'PROMPTLAR', ad), icerik, 'utf8');
  if (basili.length) {
    mkdirSync(join(kok, kareDirAdi), { recursive: true });
    for (const n of basili) writeFileSync(join(kok, kareDirAdi, `${n}.png`), 'x', 'utf8');
  }
  return { root, kok, proje };
}

function indirmeKlasoruSahte(dosyalar) {
  const dir = mkdtempSync(join(tmpdir(), 'indirme-'));
  for (const [ad, [icerik, saniye]] of Object.entries(dosyalar)) {
    writeFileSync(join(dir, ad), icerik, 'utf8');
    if (saniye) utimesSync(join(dir, ad), saniye, saniye);
  }
  return dir;
}

const PROMPT = ['### K01 | VO1 "a"', 'gövde', '### K02 | VO2 "b"', 'gövde',
  '### K03 | VO3 "c"', 'gövde'].join('\n');

describe('basim-kuyrugu — kuyruk diskten türer, kayda sormaz', () => {
  it('basılı olmayan kareler sırayla bekler; basılan kuyruktan DÜŞER', () => {
    const { root, proje } = repo({ promptlar: { 'A.txt': PROMPT }, basili: [2] });
    const r = taraProje(proje, root);
    expect(r.yazili.size).toBe(3);
    expect(r.basili.has(2)).toBe(true);
    expect(r.bekleyen).toEqual([1, 3]);
    expect(sonrakiKare(proje, root)).toBe(1);
    expect(bekleyenSayisi(root, proje)).toBe(2);
  });

  it('ARALIK satırı (K35–K38) kare sayılmaz — blok özeti hayalet kare üretemez', () => {
    const { root, proje } = repo({ promptlar: { 'A.txt': '### K35–K38 @mutfak\nözet\n### K35 | VO\ngövde' } });
    expect([...taraProje(proje, root).yazili.keys()]).toEqual([35]);
  });

  it('eski klasör adı `resimler` de BASILI sayılır — tek ada güvenmek 53 kareyi kuyruğa sokmuştu', () => {
    const { root, proje } = repo({ promptlar: { 'A.txt': PROMPT }, basili: [1, 2, 3], kareDirAdi: 'resimler' });
    expect(taraProje(proje, root).bekleyen).toEqual([]);
    expect(bekleyenSayisi(root, proje)).toBe(0);
  });

  it('proje diskte yoksa 0 DEĞİL null döner — "kuyruk boş" ile "iş yok" karıştırılamaz', () => {
    const { root } = repo({ promptlar: { 'A.txt': PROMPT } });
    expect(bekleyenSayisi(root, 'Olmayan İş')).toBeNull();
    expect(projeListesi(root, 'Olmayan İş')).toEqual([]);
  });
});

describe('kare-yakala — saf parçalar', () => {
  it('uzantı KAYNAKTAN gelir, uydurulmaz', () => {
    expect(kareAdi(23, 'Gemini_x.png')).toBe('23.png');
    expect(kareAdi(7, 'nb2 output.JPG')).toBe('7.jpg');
    expect(kareAdi(7, 'garip.webp')).toBe('7.png');
  });

  it('yarım indirme ALINMAZ — `x.png.crdownload` kardeşi varsa dosya hazır değildir', () => {
    const dir = indirmeKlasoruSahte({
      'a.png': ['tam', 1000],
      'b.png': ['yarım', 2000],
      'b.png.crdownload': ['', 2000],
      'not.txt': ['', 3000],
    });
    const liste = adaylar(dir).map((c) => c.ad);
    expect(liste).toEqual(['a.png']);
    expect(gorselMi('not.txt')).toBe(false);
    expect(gorselMi('.DS_Store')).toBe(false);
  });

  it('adaylar YENİDEN ESKİYE sıralanır ve `sonra` eşiği eski dosyaları eler', () => {
    const dir = indirmeKlasoruSahte({ 'eski.png': ['x', 1000], 'yeni.png': ['x', 5000] });
    expect(adaylar(dir).map((c) => c.ad)).toEqual(['yeni.png', 'eski.png']);
    expect(adaylar(dir, 2000 * 1000).map((c) => c.ad)).toEqual(['yeni.png']);
  });

  it('argAyir `--x y` ve `--x=y` biçimlerinin ikisini de okur', () => {
    expect(argAyir(['--kuru', '--sonraki', '23']).sonraki).toBe(23);
    expect(argAyir(['--sonraki=23', '--izle']).izle).toBe(true);
    expect(argAyir(['--proje=Bileşke Kuvvet']).proje).toBe('Bileşke Kuvvet');
  });

  it('verilmeyen indirme klasörü uydurulmaz — olmayan yol null döner', () => {
    expect(indirmeKlasoru(join(tmpdir(), 'kesinlikle-yok-' + Date.now()))).toBeNull();
  });
});

describe('kare-yakala — taşıma', () => {
  it('inen dosya kuyruğun SIRADAKİ numarasını alır ve kaynak klasörden kalkar', () => {
    const { root, kok, proje } = repo({ promptlar: { 'A.txt': PROMPT }, basili: [1] });
    const dir = indirmeKlasoruSahte({ 'Gemini_Generated_Image_x7k2p.png': ['png', 1000] });
    const r = yakala(join(dir, 'Gemini_Generated_Image_x7k2p.png'), { root, proje });
    expect(r.ok).toBe(true);
    expect(r.n, 'K1 basılı, sıradaki K2').toBe(2);
    expect(existsSync(join(kok, 'images', '2.png'))).toBe(true);
    expect(readdirSync(dir)).toEqual([]);
    expect(taraProje(proje, root).bekleyen, 'kuyruk kendiliğinden kısalır').toEqual([3]);
  });

  it('🔴 ÜZERİNE YAZMAZ — hedef varsa DURUR ve kaynağı yerinde bırakır', () => {
    const { root, proje } = repo({ promptlar: { 'A.txt': PROMPT }, basili: [1] });
    const dir = indirmeKlasoruSahte({ 'yeni.png': ['png', 1000] });
    const r = yakala(join(dir, 'yeni.png'), { root, proje, sonraki: 1 });
    expect(r.ok).toBe(false);
    expect(r.sebep).toMatch(/ZATEN VAR/);
    expect(readdirSync(dir), 'kaynak silinmemeli').toEqual(['yeni.png']);
  });

  it('--kuru hiçbir dosyaya dokunmaz ama ne yapacağını söyler', () => {
    const { root, kok, proje } = repo({ promptlar: { 'A.txt': PROMPT } });
    const dir = indirmeKlasoruSahte({ 'yeni.png': ['png', 1000] });
    const r = yakala(join(dir, 'yeni.png'), { root, proje, kuru: true });
    expect(r.ok).toBe(true);
    expect(r.n).toBe(1);
    expect(readdirSync(dir)).toEqual(['yeni.png']);
    expect(existsSync(join(kok, 'images')), 'kuru koşu klasör bile açmaz').toBe(false);
  });

  it('kuyrukta bekleyen yoksa numara UYDURULMAZ — elle --sonraki istenir', () => {
    const { root, proje } = repo({ promptlar: { 'A.txt': PROMPT }, basili: [1, 2, 3] });
    const dir = indirmeKlasoruSahte({ 'yeni.png': ['png', 1000] });
    const r = yakala(join(dir, 'yeni.png'), { root, proje });
    expect(r.ok).toBe(false);
    expect(r.sebep).toMatch(/--sonraki/);
  });
});
