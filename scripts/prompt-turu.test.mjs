// PROMPT TÜRÜ — KIRMIZI FIXTURE'LAR.
//
// Ölçülen kusur: sistemin tek bir "prompt" kavramı vardı. `reference-plate` diye bir tür
// yoktu, `reference-edit` linterde tek kontrol alıp dönüyordu, ve referans dosyası kuyruk
// tekrarını denetleyen kurallara yapısal olarak görünmezdi.
//
// Her test kural GEVŞERSE düşer. Ayrıca yanlış alarmın kendisi de test edilir: bu turun
// konusu "ölçen yaratıcı karar vermesin" olduğu için, temiz bir bloğa kırmızı basmak
// eksik ölçmek kadar ağır bir kusurdur.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  TURLER, promptTuru, lintTur, parseReferansBloklari, dosyaRolu,
} from './prompt-turu.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const oku = (y) => readFileSync(resolve(REPO, y), 'utf8');

const AKTIF_REF = 'agents/COMMAND-INBOX/6. Sınıf - Denetleyici ve Düzenleyici Sistemler/_ESKI/Denetleyici ve Düzenleyici_REFERANS-PROMPTLARI.txt';
const ALTIN_KARE = 'agents/COMMAND-INBOX/Biten/5. Sınıf - Hücre ve Organelleri/PROMPTLAR/A-K01-K15.txt';

const KUYRUK = [
  'STYLE: Feature-animation 3D CGI in the RenderMan lineage, subsurface scattering.',
  'LIGHT AND PALETTE: shadows read as deep cool indigo, midtones warm burnt orange.',
  'NEGATIVE: NO hard-black shadow; NO 2D cel shading; NO photoreal capture.',
].join('\n');

const EDIT_GOVDESI = 'Keep this exact character — the same face, the same hair.\n'
  + 'Change only the clothing, to a winter-morning indoor outfit.\n'
  + 'He now wears a thick hand-knitted crew-neck sweater in deep brick red.';

const PLAKA_GOVDESI = 'TAŞIR    : kimlik (tür · desen · boyut)\n'
  + 'TAŞIMAZ  : poz · kadraj · zemin · aydınlatma yönü\n-----\n'
  + 'A single Anatolian tabby house cat sits calmly in three-quarter view on a plain '
  + 'warm-neutral surface, its whole body inside the frame.';

describe('tür tanıma', () => {
  it('koruma cümlesi olan blok EDİT sayılır', () => {
    expect(promptTuru(EDIT_GOVDESI)).toBe(TURLER.EDIT);
  });

  it('düz zemin + TAŞIR taşıyan blok PLAKA sayılır', () => {
    expect(promptTuru(PLAKA_GOVDESI)).toBe(TURLER.PLAKA);
  });

  it('kamera + olay taşıyan blok SAHNE sayılır', () => {
    const sahne = '35mm lens at f/4, adult chest height, straight-on wide view. '
      + '@efe stands in the doorway with his right palm laid flat on the wooden jamb.';
    expect(promptTuru(sahne)).toBe(TURLER.SAHNE);
  });

  it('EDİT imzası PLAKA imzasını YENER — bir edit nesne de tarif eder', () => {
    // Sıra kusuru olsaydı @efe edit'i plaka sayılır ve kuyruk kuralı hiç koşmazdı.
    expect(promptTuru(`${PLAKA_GOVDESI}\nChange only the clothing.`)).toBe(TURLER.EDIT);
  });

  it('dosya rolü motion ise tür motion\'dır (ikinci ölçen devreye girmez)', () => {
    expect(promptTuru('anything at all', { dosyaRolu: 'motion' })).toBe(TURLER.MOTION);
  });

  it('dosya adından rol çıkarımı', () => {
    expect(dosyaRolu('X_REFERANS-PROMPTLARI.txt')).toBe('referans');
    expect(dosyaRolu('proje/MOTION/S1.txt')).toBe('motion');
    expect(dosyaRolu('PROMPTLAR/A-K01.txt')).toBe('promptlar');
  });
});

describe('EDİT DELTA-ONLY — asıl duvar', () => {
  it('edit\'e dünya kuyruğu sızarsa KIRMIZI', () => {
    const { kirmizi } = lintTur(`${EDIT_GOVDESI}\n${KUYRUK}`);
    expect(kirmizi.map((k) => k.key)).toContain('edit-dunya-kuyrugu');
    expect(kirmizi[0].msg).toMatch(/STYLE · LIGHT AND PALETTE · NEGATIVE/);
  });

  it('kuyruğun TEK satırı bile sızsa KIRMIZI', () => {
    const { kirmizi } = lintTur(`${EDIT_GOVDESI}\nLIGHT AND PALETTE: shadows read as deep indigo.`);
    expect(kirmizi.map((k) => k.key)).toContain('edit-dunya-kuyrugu');
  });

  it('edit\'e kamera kararı sızarsa KIRMIZI', () => {
    const { kirmizi } = lintTur(`${EDIT_GOVDESI}\n85mm lens at f/4.0, full body centred.`);
    expect(kirmizi.map((k) => k.key)).toContain('edit-kamera');
  });

  it('koruma cümlesi olmayan "edit" KIRMIZI', () => {
    const { kirmizi } = lintTur('use this referenced image and make it winter.');
    expect(kirmizi.map((k) => k.key)).toContain('edit-koruma-cumlesi');
  });

  it('temiz delta-only edit kırmızı ÜRETMEZ (yanlış alarm da kusurdur)', () => {
    expect(lintTur(EDIT_GOVDESI).kirmizi).toEqual([]);
  });
});

describe('PLAKA sözleşmesi', () => {
  it('TAŞIMAZ satırı olmayan plaka SARI — kırmızı DEĞİL', () => {
    // 2026-08-05: kırmızıydı, SARI'ya indirildi. Gerekçe ölçüldü: TAŞIR/TAŞIMAZ sözleşmesi
    // bugün doğdu ve 11 CANLI projede yok. Kırmızı yapmak bitmiş işleri kilitlerdi — aynı
    // karar `ced8ff5`'te de böyle verilmişti. Yeni ref'te beklenir, eskiye yasak olmaz.
    const eksik = PLAKA_GOVDESI.replace(/^TAŞIMAZ.*$/mu, '');
    const r = lintTur(eksik, { tur: TURLER.PLAKA });
    expect(r.kirmizi).toEqual([]);
    expect(r.sari.map((k) => k.key)).toContain('plaka-tasimaz');
  });

  it('TAŞIMAZ taşıyan plaka temiz — ne kırmızı ne sarı', () => {
    const r = lintTur(PLAKA_GOVDESI, { tur: TURLER.PLAKA });
    expect(r.kirmizi).toEqual([]);
    expect(r.sari).toEqual([]);
  });

  it('plakada dünya kuyruğu KIRMIZI DEĞİL — plaka kendi dünyasını taşıyabilir', () => {
    // Bilerek: yasak yalnız EDİT'e konur. Plaka tek başına basılır ve dünyayı taşıması meşrudur.
    // (Kuyruğun plakada BİREBİR olması ayrı bir konudur ve T2'nin işidir, yasak değil ölçüm.)
    expect(lintTur(`${PLAKA_GOVDESI}\n${KUYRUK}`, { tur: TURLER.PLAKA }).kirmizi).toEqual([]);
  });
});

describe('SAHNE karesine tür yasağı KONULMAZ', () => {
  it('sahne karesi hiçbir tür kırmızısı almaz — yaratıcı alan Claude\'undur', () => {
    const sahne = `35mm lens at f/4. @efe stands in the doorway.\n${KUYRUK}`;
    expect(lintTur(sahne, { tur: TURLER.SAHNE }).kirmizi).toEqual([]);
  });
});

// 2026-08-07: AKTIF_REF yolu `_ESKI/` altına çevrildi. Sebep, bu dosyanın kendi yorumunda
// yazılı kusur sınıfının aynısı: fikstür olarak CANLI bir üretim dosyası kullanılıyordu.
// Denetleyici projesi sıfırdan yazıma açılınca (kahraman @efe → @mira) dosya arşive taşındı
// ve altı test hedefini kaybetti — testin ölçtüğü şey ayrıştırıcının BİÇİM körlüğü olmasına
// rağmen, kırmızıyı üretim işi tetikledi. Arşiv nüshası donmuştur; fikstür orada yaşar.
describe('GERÇEK DOSYALAR — sabit değil, diskteki artefact ölçülüyor', () => {
  it('aktif referans dosyası BEŞ blok olarak parse edilir (basım sırası listesi blok sayılmaz)', () => {
    const bloklar = parseReferansBloklari(oku(AKTIF_REF));
    expect(bloklar).toHaveLength(5);
    expect(bloklar.map((b) => b.handle)).toEqual(['@kedi', '@maket', '@mutfak', '@koridor', '@efe']);
    for (const b of bloklar) expect(b.govde.length, `${b.handle} gövdesiz`).toBeGreaterThan(500);
  });

  it('başlık ve gövde AYNI blokta kalır — ayrılırsa ölçüm yalan söyler', () => {
    const efe = parseReferansBloklari(oku(AKTIF_REF)).find((b) => b.handle === '@efe');
    expect(efe.tam).toMatch(/^TAŞIMAZ\s*:/mu);        // sözleşme başlıkta
    expect(efe.tam).toMatch(/^STYLE\s*:/mu);          // kuyruk gövdede
  });

  it('@efe referans-EDİT olarak tanınır ve dünya kuyruğu taşıdığı için KIRMIZI', () => {
    const efe = parseReferansBloklari(oku(AKTIF_REF)).find((b) => b.handle === '@efe');
    const { tur, kirmizi } = lintTur(efe.tam, { dosyaRolu: 'referans' });
    expect(tur).toBe(TURLER.EDIT);
    expect(kirmizi.map((k) => k.key)).toContain('edit-dunya-kuyrugu');
  });

  it('dört plakanın dördü de tür sözleşmesinden TEMİZ geçer (yanlış alarm yok)', () => {
    const plakalar = parseReferansBloklari(oku(AKTIF_REF)).filter((b) => b.handle !== '@efe');
    for (const p of plakalar) {
      const { tur, kirmizi } = lintTur(p.tam, { dosyaRolu: 'referans' });
      expect(tur, `${p.handle} yanlış sınıflandı`).toBe(TURLER.PLAKA);
      expect(kirmizi, `${p.handle} yanlış alarm: ${kirmizi.map((k) => k.key).join()}`).toEqual([]);
    }
  });

  it('ALTIN STANDART sahne kareleri tür ölçeninden sıfır kırmızı alır', () => {
    const bloklar = oku(ALTIN_KARE).split(/^-{5,}$/mu).filter((b) => /^STYLE\s*:/mu.test(b));
    expect(bloklar.length).toBeGreaterThan(5);
    for (const b of bloklar) {
      expect(promptTuru(b, { dosyaRolu: 'promptlar' })).toBe(TURLER.SAHNE);
      expect(lintTur(b, { dosyaRolu: 'promptlar' }).kirmizi).toEqual([]);
    }
  });
});

describe('PLATFORM — CRLF sapma üretmez', () => {
  it('CRLF ve LF aynı türü ve aynı kırmızıyı verir', () => {
    const lf = `${EDIT_GOVDESI}\n${KUYRUK}`;
    const crlf = lf.replace(/\n/gu, '\r\n');
    expect(promptTuru(crlf)).toBe(promptTuru(lf));
    expect(lintTur(crlf).kirmizi.map((k) => k.key)).toEqual(lintTur(lf).kirmizi.map((k) => k.key));
  });
});

// ---------------------------------------------------------------------------
// BEŞ GERÇEK BAŞLIK BİÇİMİ (2026-08-05).
//
// Ölçülen kusur: ayrıştırıcı ilk sürümde TEK biçim tanıyordu ve 15 referans dosyasının 13'ü
// SIFIR blok verdi — yani ölçen, repodaki referansların %87'sine KÖRDÜ ve sessizce yeşil
// kalıyordu. Bu, bu repoda sekiz kez ölçülmüş kusur sınıfının kendisi: doğrulayıcı, ölçtüğü
// şeyin YERLEŞİMİNİ varsayıyor. Kusur "yeni işlerde dene" denince ortaya çıktı.
describe('ayrıştırıcı beş gerçek biçimi de görür — sessiz sıfır YOK', () => {
  const BICIMLER = [
    ['Denetleyici (numaralı + ==== )', 'agents/COMMAND-INBOX/6. Sınıf - Denetleyici ve Düzenleyici Sistemler/_ESKI/Denetleyici ve Düzenleyici_REFERANS-PROMPTLARI.txt'],
    ['Eşeyli (numarasız + ----- )', 'agents/COMMAND-INBOX/Biten/6. Sınıf - Eşeyli ve Eşeysiz Üreme/Eşeyli ve Eşeysiz Üreme_REFERANSLAR.txt'],
    ['Hücre (İngilizce giriş)', 'agents/COMMAND-INBOX/Biten/5. Sınıf - Hücre ve Organelleri/Hücre ve Organelleri_REFERANSLAR.txt'],
    ['Kuvvet (markdown ### )', 'agents/COMMAND-INBOX/Biten/Kuvvet ve Kuvvetin Ölçülmesi/Kuvvet ve Kuvvetin Ölçülmesi_REFERANSLAR.txt'],
  ];

  it.each(BICIMLER)('%s → en az bir blok bulunur', (_ad, yol) => {
    const bloklar = parseReferansBloklari(oku(yol));
    expect(bloklar.length, `${yol} SIFIR blok verdi — ayrıştırıcı bu biçime kör`).toBeGreaterThan(0);
    for (const b of bloklar) expect(b.handle).toMatch(/^@/u);
  });

  it('ENVANTER SATIRI blok sayılmaz — açık yazar işareti şart', () => {
    // `1. @maket — 14 karede dönüyor…` başlık desenine uyar ama motora giden metni yoktur.
    // Ölçüldü: eşik yalnız UZUNLUK olduğunda bu satır sahte bir @kedi bloğu üretti.
    const bloklar = parseReferansBloklari(oku(BICIMLER[0][1]));
    expect(bloklar.map((b) => b.handle)).toEqual(['@kedi', '@maket', '@mutfak', '@koridor', '@efe']);
  });
});
