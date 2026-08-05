// DIRECTOR CONTEXT — seçki gerçekten KÜÇÜK mü, ve derleyici YAZAR mı?
//
// Bu betiğin varlık sebebi bağlam dolmasıydı: ölçüldü, aynı dünyada dört lehçe doğdu.
// O yüzden testlerin işi "çalışıyor mu" değil, **sınırlar tutuyor mu**.

import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { derle, ilgiliDersler } from './director-context.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const AKTIF = '5. Sınıf - Destek ve Hareket Sistemi';
const varAktif = existsSync(join(ROOT, 'agents/COMMAND-INBOX', AKTIF));

describe('ilgiliDersler — tavan ve sıralama', () => {
  const banka = Array.from({ length: 30 }, (_, i) => `- ders ${i} — kaynak: X · 2026-01-01 · Mami onayı`);

  it('TAVAN aşılamaz — banka 30 olsa da en fazla 6 ders gelir', () => {
    expect(ilgiliDersler(banka.join('\n'), {})).toHaveLength(6);
  });

  it('anahtar geçen ders ÖNE gelir — ilgisiz banka satırı seçkiyi doldurmaz', () => {
    const b = ['- alakasız bir ders', '- @mira4 hakkında kritik ders', '- başka bir şey'].join('\n');
    const s = ilgiliDersler(b, { anahtarlar: ['@mira4'] });
    expect(s[0]).toContain('@mira4');
  });

  it('worldId eşleşmesi anahtardan DAHA ağır basar', () => {
    const b = ['- @mira4 dersi', '- pixar_3d_edu dünyasının dersi'].join('\n');
    const s = ilgiliDersler(b, { worldId: 'pixar_3d_edu', anahtarlar: ['@mira4'] });
    expect(s[0]).toContain('pixar_3d_edu');
  });

  it('boş banka çökmez', () => {
    expect(ilgiliDersler(null, {})).toEqual([]);
    expect(ilgiliDersler('', {})).toEqual([]);
  });
});

describe.skipIf(!varAktif)('derle — canlı proje üzerinde', () => {
  it('dünya ve register Enzim\'den OKUNUR, uydurulmaz', () => {
    const { parcalar } = derle(AKTIF);
    expect(parcalar.worldId).toBe('pixar_3d_edu');
    expect(parcalar.register).toBe('EDU');
  });

  it('canary kilidi yoksa bunu AÇIKÇA söyler — sessiz boşluk yok', () => {
    const { govde, parcalar } = derle(AKTIF);
    if (!parcalar.canaryLock) {
      expect(govde).toContain('üretim fazı açılamaz');
    }
  });

  it('precedent dizini yoksa "YOK" YAZILIR — boş bırakıp kontrol edilmiş gibi görünmez', () => {
    const { govde } = derle(AKTIF);
    if (!existsSync(join(ROOT, 'agents/precedents'))) {
      expect(govde).toContain('Precedent gerçek kare/klipten doğar');
    }
  });

  it('KIRMIZI FIXTURE: derleyici PROMPT YAZMAZ — çıktıda motor lehçesi olmamalı', () => {
    // Derleyicinin yazar hâline gelmesi bu mimarinin tek ölümcül kayması olurdu.
    // Bu test onu çivilemek için var: çıktı YALNIZ artefact aktarımıdır.
    const { govde } = derle(AKTIF);
    // Kendi ÜRETTİĞİ (aktarmadığı) satırlarda motor lehçesi geçmemeli.
    const kendiSatirlari = govde.split('\n').filter((l) => l.startsWith('#') || l.startsWith('- ') || l.startsWith('> '));
    const yasak = /\b(Camera:|STYLE:|NEGATIVE:|shot on|cinematic lighting|photorealistic)\b/i;
    expect(kendiSatirlari.filter((l) => yasak.test(l))).toEqual([]);
  });

  it('seçki KÜÇÜK kalır — ders sayısı tavanı aşmaz ve kaç ders elendiği YAZILIR', () => {
    const { govde, parcalar } = derle(AKTIF);
    expect(parcalar.dersSayi).toBeLessThanOrEqual(6);
    if (parcalar.dersToplam > parcalar.dersSayi) {
      expect(govde).toContain('sessiz kırpma değil');
    }
  });

  it('hash DETERMİNİSTİK — aynı disk, aynı sha', () => {
    expect(derle(AKTIF).hash).toBe(derle(AKTIF).hash);
    expect(derle(AKTIF).govde).toContain('context-sha256:');
  });

  it('olmayan proje sessizce boş dönmez, HATA verir', () => {
    expect(() => derle('böyle-bir-proje-yok-xyz')).toThrow(/bulunamadı/);
  });
});
