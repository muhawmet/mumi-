import { describe, expect, test } from 'vitest';
import { buildImageAuthorContext } from './agentProtocol';
import { DATA, toWorldPacket } from './pure';

/**
 * BRAIN M2 — render_law prop/fizik ayrımı (KUSUR-C).
 *
 * Ölçülmüş kusur: 19/46 dünyanın render_law'ı 3+ somut nesne adı taşıyor ve
 * `renderPhysics` tüm law'ı kopyaladığı için prop kareye sızıyor (One Piece
 * karesine korsan gemisi + WANTED afişleri girdi — TASK-00 / core-prompt-path.md).
 *
 * Yasa: "Render law FİZİKTEN yapılmışsa güvenle taşınır. PROP'tan yapılmışsa sızar."
 * Çözüm: `renderPhysics` yalnız fizik cümlelerini taşır; somut-nesne-envanteri
 * cümleleri `vocabularyExamples`'a düşer (zaten "yaratıcı referans, prop emri değil"
 * etiketli kanal — commandExport.ts:460). render_law TOPTAN SİLİNMEZ (A2 pilotu
 * bunu denedi, kare stok fotoğrafa kaydı); kararsız cümle fizik tarafında kalır.
 */

describe('renderPhysics prop/fizik ayrımı', () => {
  test('one_piece_toei: renderPhysics fizik taşır, ayakta-duran prop taşımaz', () => {
    const w = DATA.worlds.find((x) => x.id === 'one_piece_toei')!;
    const pk = toWorldPacket(w);
    // Prop nesneleri renderPhysics'te set-emri olarak DURMAMALI:
    expect(pk.renderPhysics.toLowerCase()).not.toMatch(/wanted[- ]poster|caravel|pennant|hull|figurehead/);
    // Fizik korunmalı (boşaltma yok — line/cel/perspective fiziği yerinde):
    expect(pk.renderPhysics.length).toBeGreaterThan(120);
    expect(pk.renderPhysics.toLowerCase()).toMatch(/outline|cel|silhouette/);
    expect(pk.renderPhysics.toLowerCase()).toMatch(/perspective|horizon/);
  });

  test('deakins_naturalist: fizik-saf dünya olduğu gibi kalır', () => {
    const w = DATA.worlds.find((x) => x.id === 'deakins_naturalist')!;
    const pk = toWorldPacket(w);
    expect(pk.renderPhysics.toLowerCase()).toMatch(/contrast|falloff|photon|grain|motivated/);
  });

  test('deakins_naturalist: fizik cümleleri kaybolmaz (boşaltma yasağı)', () => {
    const w = DATA.worlds.find((x) => x.id === 'deakins_naturalist')!;
    const pk = toWorldPacket(w);
    // Deakins law'ının bel kemiği maddeleri — hepsi fizik, hepsi kalmalı:
    const t = pk.renderPhysics.toLowerCase();
    expect(t).toMatch(/single motivated source/);
    expect(t).toMatch(/negative fill/);
    expect(t).toMatch(/contrast ratio/);
    expect(t).toMatch(/grain/);
  });

  test('prop cümleleri kaybolmaz — vocabularyExamples kanalına düşer', () => {
    const w = DATA.worlds.find((x) => x.id === 'one_piece_toei')!;
    const pk = toWorldPacket(w);
    // Ayrılan prop cümlesi (wanted-poster/caravel envanteri) yaratıcı-referans
    // kanalında YAŞAMALI — veri silinmez, kanal değişir:
    expect(pk.vocabularyExamples.toLowerCase()).toMatch(/wanted[- ]poster|caravel/);
    // Mevcut example_injection içeriği korunur (varsa):
    if ((w.example_injection || '').trim()) {
      expect(pk.vocabularyExamples).toContain((w.example_injection || '').trim());
    }
  });

  test('legacyRenderLaw hâlâ birebir korunur (M2 buna dokunmaz)', () => {
    for (const w of DATA.worlds) {
      const pk = toWorldPacket(w);
      expect(pk.legacyRenderLaw).toBe((w.render_law || '').trim());
    }
  });

  test('image_author role context vocabularyExamples kanalını GÖRÜR (Sol M2 #1 — görünmez kanal yasağı)', () => {
    // Ayrılan envanter cümleleri "yaratıcı referans" kanalına düşer; o kanal gerçek
    // role context'ine girmezse cümleler opsiyonelleşmez, GÖRÜNMEZ olur (= dolaylı silme).
    const w = DATA.worlds.find((x) => x.id === 'one_piece_toei')!;
    const pk = toWorldPacket(w);
    const command = {
      commandId: 'test-cmd',
      baseDecision: { locks: {}, engine: { imageModel: 'nano_banana_2' }, mode: 'test' },
      lifecycle: { protocol: { name: 'p', hash: 'h' }, storyboardHash: 'sb', mamiDirectives: [] },
      worldPacket: pk,
      scenes: [{ id: 1, phaseName: 'HOOK', durationSec: 5, architecture: {}, sceneBrief: 'beat', prompts: {} }],
    };
    const ctx = buildImageAuthorContext(command, 1);
    expect(ctx.world?.vocabularyExamples).toBeTruthy();
    expect(String(ctx.world?.vocabularyExamples).toLowerCase()).toMatch(/wanted[- ]poster|caravel/);
  });

  test('46 world: renderPhysics benzersiz ve boşalmamış kalır', () => {
    const all = DATA.worlds.map((w) => toWorldPacket(w));
    const set = new Set(all.map((p) => p.renderPhysics));
    expect(set.size).toBe(46);
    for (const p of all) {
      expect(p.renderPhysics.length, `${p.id} renderPhysics boşaldı`).toBeGreaterThan(120);
    }
  });
});
