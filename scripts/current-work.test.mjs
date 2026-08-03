// TESLIM TARAMASI — ADA DEĞİL İÇERİĞE bakıyor mu.
//
// Var oluş sebebi (2026-08-02 ölçümü): `scanDeliverables` teslimi yalnız dosya adı sonekiyle
// arıyordu (`['_promptlar.txt','_promptlar.md']`). Üretimin gerçek yerleşimi ise
// `<proje>/PROMPTLAR/A-K01-K14.txt`. Sonuç ölçüldü: `5. Sınıf - Destek ve Hareket Sistemi`in
// 41 karesi DİSKTE DURURKEN kayıtta PROMPTLAR:false görünüyordu — ve o kaydı SessionStart
// `[durum]` bloğu ile `kapat` kapısı okuyor. Kayıt var olan işi eksik ilan ediyordu.
//
// Bu testler o körlüğün geri gelmesini engeller. Canlı repo iddiası (Destek ve Hareket) ile
// sentetik fixture birlikte duruyor: fixture mekanizmayı, canlı repo GERÇEĞİ ölçer.

import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { KIT, scanDeliverables, ensureImagesDir, IMAGES_DIR, IMAGE_DIR_ALIASES } from './current-work.mjs';
import { readFileSync } from 'node:fs';

const REPO = resolve(import.meta.dirname, '..');

/** Sentetik proje: yalnız istenen yerleşim yazılır, gerisi yok. */
function fixture(kur) {
  const kok = mkdtempSync(join(tmpdir(), 'mamilas-teslim-'));
  const proje = join(kok, 'proje');
  mkdirSync(proje, { recursive: true });
  kur(proje);
  return { kok, rel: 'proje' };
}

describe('scanDeliverables — teslim ADA değil İÇERİĞE göre bulunur', () => {
  it('PROMPTLAR/ klasör biçimini görür (ad soneki hiç yokken)', () => {
    const { kok, rel } = fixture((p) => {
      const d = join(p, 'PROMPTLAR');
      mkdirSync(d);
      writeFileSync(join(d, 'A-K01-K14.txt'), 'K01\nSTYLE: pixar 3d\nNEGATIVE: yok\n');
    });
    try {
      expect(scanDeliverables(kok, rel).PROMPTLAR).toBe(true);
    } finally { rmSync(kok, { recursive: true, force: true }); }
  });

  it('PROMPTLAR/ klasörü İMZASIZ dosya taşıyorsa teslim SAYILMAZ', () => {
    // Boş klasör ya da not dosyası "prompt var" demek değildir; ölçüm içeriğe bakar.
    const { kok, rel } = fixture((p) => {
      const d = join(p, 'PROMPTLAR');
      mkdirSync(d);
      writeFileSync(join(d, 'NOT.txt'), 'buraya yazacagim\n');
    });
    try {
      expect(scanDeliverables(kok, rel).PROMPTLAR).toBe(false);
    } finally { rmSync(kok, { recursive: true, force: true }); }
  });

  it('eski ad sözleşmesi (`*_PROMPTLAR.txt`) bozulmadan çalışır', () => {
    const { kok, rel } = fixture((p) => {
      writeFileSync(join(p, 'Deneme_PROMPTLAR.txt'), 'icerik onemsiz — AD sozlesmesi\n');
    });
    try {
      expect(scanDeliverables(kok, rel).PROMPTLAR).toBe(true);
    } finally { rmSync(kok, { recursive: true, force: true }); }
  });

  it('`_revize.txt` prompt imzası taşısa da PROMPTLAR sayılmaz', () => {
    // İçerik taramasının ilk tuzağı: revize dosyası prompt imzasının aynısını taşır.
    // Onu prompt saymak, kaydı ikinci kez yalancı yapardı.
    const { kok, rel } = fixture((p) => {
      writeFileSync(join(p, 'Deneme_revize.txt'), 'K03\nSTYLE: pixar 3d\nNEGATIVE: yok\n');
    });
    try {
      const r = scanDeliverables(kok, rel);
      expect(r.revize).toBe(true);
      expect(r.PROMPTLAR).toBe(false);
    } finally { rmSync(kok, { recursive: true, force: true }); }
  });

  it('MOTION/ klasörü KAMERA NİYETİ imzasıyla tanınır', () => {
    const { kok, rel } = fixture((p) => {
      const d = join(p, 'MOTION');
      mkdirSync(d);
      writeFileSync(join(d, '01.txt'), '### K1 | 10s\nKAMERA NİYETİ: acilis kreyni\n');
    });
    try {
      expect(scanDeliverables(kok, rel).MOTION).toBe(true);
    } finally { rmSync(kok, { recursive: true, force: true }); }
  });

  it('proje dizini yoksa her parça false — çökme yok', () => {
    const r = scanDeliverables(REPO, 'agents/COMMAND-INBOX/BOYLE-BIR-PROJE-YOK');
    for (const k of KIT) expect(r[k.key]).toBe(false);
  });
});

// START FRAME KLASÖR RUTİNİ (Mami, 2026-08-03) — proje `images/` ile DOĞAR.
// Sonradan elle açılan klasör açılmıyor: diskte üç ad (resimler/Resimler/hiç) tam bu yüzden doğdu.
describe('ensureImagesDir — iskelet rutini', () => {
  it('klasörü ve .gitkeep\'i açar (git boş klasör taşımaz)', () => {
    const d = mkdtempSync(join(tmpdir(), 'cw-img-'));
    const dir = ensureImagesDir(d);
    expect(dir).toBe(join(d, IMAGES_DIR));
    expect(existsSync(join(dir, '.gitkeep'))).toBe(true);
    rmSync(d, { recursive: true, force: true });
  });

  it('idempotent — ikinci çağrı mevcut kareleri SİLMEZ', () => {
    const d = mkdtempSync(join(tmpdir(), 'cw-img-'));
    const dir = ensureImagesDir(d);
    writeFileSync(join(dir, '1.png'), 'kare');
    ensureImagesDir(d);
    expect(readFileSync(join(dir, '1.png'), 'utf8')).toBe('kare');
    rmSync(d, { recursive: true, force: true });
  });

  it('kanonik ad `images`, eski adlar okuma listesinde kalır', () => {
    expect(IMAGES_DIR).toBe('images');
    expect(IMAGE_DIR_ALIASES[0]).toBe('images');
    expect(IMAGE_DIR_ALIASES).toContain('resimler');
    expect(IMAGE_DIR_ALIASES).toContain('Resimler');
  });
});

describe('canlı repo — ölçülmüş kusur geri gelmesin', () => {
  const DESTEK = 'agents/COMMAND-INBOX/5. Sınıf - Destek ve Hareket Sistemi';

  // Rutin ancak DİSKTE varsa rutindir. Aktif projelerin hepsinde `images/` olmalı.
  //
  // ⚠ Bu blok önce SABİT bir proje listesi taşıyordu ve proje BAŞINA bir test üretiyordu.
  // 2026-08-03'te kırıldı: Mami "Farklı Kültürler"i bitirip `Biten/` altına sürükledi, o
  // projenin testi `skipIf` ile atlandı ve kapı yalnız GEÇEN testi saydığı için toplam düştü
  // (gate.sh:70) → commit BLOKE oldu. Yani duvar, işin BİTMESİNİ kusur sayıyordu.
  // Doğrusu: liste diskten okunur ve TEK test içinde dönülür — proje sayısı değişince test
  // sayısı oynamaz, ama kapsam aynı kalır. Yeni proje açıldığında da kendiliğinden kapsanır.
  const AKTIF_DISI = new Set(['Biten', 'Bekleyen', 'DENEME']);
  const aktifProjeler = () => {
    const kok = join(REPO, 'agents/COMMAND-INBOX');
    if (!existsSync(kok)) return [];
    return readdirSync(kok, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !AKTIF_DISI.has(d.name) && !d.name.startsWith('.'))
      .map((d) => d.name)
      .sort();
  };

  it('her AKTİF projede images/ + .gitkeep var (liste diskten okunur, gömülmez)', () => {
    const projeler = aktifProjeler();
    // Ölçüm gerçekten koşuyor mu — boş liste sahte yeşil üretmesin.
    expect(projeler.length).toBeGreaterThan(0);
    const eksik = projeler.filter(
      (ad) => !existsSync(join(REPO, 'agents/COMMAND-INBOX', ad, IMAGES_DIR, '.gitkeep')),
    );
    expect(eksik, `images/.gitkeep eksik: ${eksik.join(' · ')}`).toEqual([]);
  });


  it.skipIf(!existsSync(join(REPO, DESTEK)))(
    'Destek ve Hareket: 41 kare PROMPTLAR/ altında ve kayıt onu GÖRÜR',
    () => {
      expect(scanDeliverables(REPO, DESTEK).PROMPTLAR).toBe(true);
    },
  );
});
