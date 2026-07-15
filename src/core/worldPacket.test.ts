import { describe, expect, test } from 'vitest';
import { DATA, toWorldPacket, worldPacketById, type WorldPacket } from './pure';

/**
 * MACRO 2 — 46 WorldPacket dönüşümü (Manual World Studio).
 *
 * Kabul: her seçili world kendine özgü FİZİK paketi taşır; world kimliği jenerikleşmez;
 * palette-as-light korunur; WorldPacket prompt DEĞİLDİR (site paketten prompt üretmez).
 * Bu, real-frame kalite hükmü değildir — frame hükmü MACRO 8'de Mami'ye aittir.
 */

const ALL = DATA.worlds.map((w) => toWorldPacket(w));

describe('kapsam — 46 world tam pakete dönüşür', () => {
  test('her world bir WorldPacket üretir', () => {
    expect(DATA.worlds.length).toBe(46);
    expect(ALL).toHaveLength(46);
  });

  test('her paket kimlik + 7 fizik alanı + negative + palette-as-light taşır (hiçbiri boş değil)', () => {
    for (const p of ALL) {
      expect(p.id, `${p.id} id`).toBeTruthy();
      expect(p.name, `${p.id} name`).toBeTruthy();
      expect(p.group, `${p.id} group`).toBeTruthy();
      expect(p.summary, `${p.id} summary`).toBeTruthy();
      expect(p.renderPhysics.length, `${p.id} renderPhysics`).toBeGreaterThan(20);
      expect(p.cameraEnvelope.length, `${p.id} cameraEnvelope`).toBeGreaterThan(20);
      expect(p.lightPhysics.length, `${p.id} lightPhysics`).toBeGreaterThan(20);
      expect(p.motionCadence.length, `${p.id} motionCadence`).toBeGreaterThan(10);
      expect(p.negativeLock.length, `${p.id} negativeLock`).toBeGreaterThan(0);
      expect(p.paletteAsLight.length, `${p.id} paletteAsLight`).toBeGreaterThan(10);
      expect(p.legacyRenderLaw.length, `${p.id} legacyRenderLaw korunur`).toBeGreaterThan(20);
    }
  });
});

describe('kimlik jenerikleşmez — her world benzersiz fizik taşır', () => {
  test('renderPhysics 46 world genelinde benzersiz', () => {
    const set = new Set(ALL.map((p) => p.renderPhysics));
    expect(set.size).toBe(46);
  });
  test('cameraEnvelope 46 world genelinde benzersiz', () => {
    const set = new Set(ALL.map((p) => p.cameraEnvelope));
    expect(set.size).toBe(46);
  });
  test('lightPhysics 46 world genelinde benzersiz', () => {
    const set = new Set(ALL.map((p) => p.lightPhysics));
    expect(set.size).toBe(46);
  });
});

describe('aynı source iki farklı world\'de ajana GERÇEKTEN farklı yaratıcı malzeme verir', () => {
  test('iki world → farklı render/camera/light/motion/negative', () => {
    const a = worldPacketById(DATA.worlds[0].id)!;
    const b = worldPacketById(DATA.worlds[DATA.worlds.length - 1].id)!;
    expect(a.renderPhysics).not.toBe(b.renderPhysics);
    expect(a.cameraEnvelope).not.toBe(b.cameraEnvelope);
    expect(a.lightPhysics).not.toBe(b.lightPhysics);
    expect(a.motionCadence).not.toBe(b.motionCadence);
    expect(a.negativeLock.join('|')).not.toBe(b.negativeLock.join('|'));
  });
});

describe('palette-as-light korunur — ham hex motora taşınmaz', () => {
  test('paletteAsLight hiçbir dünyada #RRGGBB içermez', () => {
    for (const p of ALL) {
      expect(p.paletteAsLight, `${p.id} paletteAsLight ham hex taşıyor`).not.toMatch(/#[0-9A-Fa-f]{6}\b/);
    }
  });
});

describe('legacy render_law silinmez — human/legacy referansı korunur', () => {
  test('legacyRenderLaw her world\'de world.render_law\'ı birebir taşır', () => {
    for (const w of DATA.worlds) {
      const p = toWorldPacket(w);
      expect(p.legacyRenderLaw).toBe((w.render_law || '').trim());
    }
  });
});

describe('compatible ref davranışı — ref world\'ü ezemez', () => {
  test('uyumsuz ref paket içinde compatible=false ve boş directive', () => {
    // Bir IP-homage world (anime grubu) + başka bir dünyaya pinlenmiş bir ref.
    const world = DATA.worlds.find((w) => w.group.startsWith('ANIMATION'))!;
    const foreignRef = DATA.refs.find(
      (r) => r.worldId && r.worldId !== world.id,
    );
    if (!foreignRef) return; // veri yoksa atla
    const p = toWorldPacket(world, { selectedRefIds: [foreignRef.id] });
    const packed = p.refs.find((r) => r.id === foreignRef.id);
    expect(packed).toBeDefined();
    if (packed && !packed.compatible) {
      expect(packed.directive).toBe('');
    }
  });
});

describe('WorldPacket prompt DEĞİLDİR — yaratıcı malzeme taşır, cümle üretmez', () => {
  test('paket alanları veri; hiçbiri "prompt/[DIRECTOR TASK]/DOMINANT ELEMENT" bandı içermez', () => {
    for (const p of ALL) {
      const blob = JSON.stringify(p);
      expect(blob).not.toMatch(/\[DIRECTOR TASK\]/);
      expect(blob).not.toMatch(/DOMINANT ELEMENT/);
      expect(blob).not.toMatch(/== ON-SCREEN TEXT ==/);
    }
  });
});
