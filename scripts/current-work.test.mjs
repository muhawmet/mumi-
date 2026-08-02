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
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { KIT, scanDeliverables } from './current-work.mjs';

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

describe('canlı repo — ölçülmüş kusur geri gelmesin', () => {
  const DESTEK = 'agents/COMMAND-INBOX/5. Sınıf - Destek ve Hareket Sistemi';

  it.skipIf(!existsSync(join(REPO, DESTEK)))(
    'Destek ve Hareket: 41 kare PROMPTLAR/ altında ve kayıt onu GÖRÜR',
    () => {
      expect(scanDeliverables(REPO, DESTEK).PROMPTLAR).toBe(true);
    },
  );
});
