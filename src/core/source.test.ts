import { describe, expect, it } from 'vitest';
import SURGERY from './SURGERY_DATA.json';
import { decodeBrief, ingestSource, autoGroupBeats, sourceIntegrity } from './source';

describe('decodeBrief', () => {
  it('chooses the education path when curriculum signals are present', () => {
    const decoded = decodeBrief('3. sınıf öğrencileri için su döngüsü dersi: buharlaşma ve yoğuşma.');
    expect(decoded.path).toBe('ANIMATION_EDU');
    expect(decoded.project.id).toBe('education');
    expect(decoded.reason).toContain('Müfredat koruması');
  });

  it('chooses a specific commercial path when its evidence is stronger', () => {
    const decoded = decodeBrief('Premium telefon kılıfı reklamı; packshot, logo stabil ve makro yüzey zorunlu.');
    expect(decoded.path).toBe('PRODUCT_HERO');
    expect(decoded.project.id).toBe('product_hero');
  });

  it('returns only IDs that exist and agree in SURGERY_DATA', () => {
    const decoded = decodeBrief('Belediye için 23 Nisan kamusal etkinlik filmi.');
    const project = SURGERY.projects.find((item) => item.id === decoded.project.id);
    expect(SURGERY.paths.some((item) => item.id === decoded.path)).toBe(true);
    expect(project?.path).toBe(decoded.path);
    expect(SURGERY.worlds.some((item) => item.id === decoded.project.world)).toBe(true);
    expect(SURGERY.refs.some((item) => item.id === decoded.project.ref)).toBe(true);
    expect(SURGERY.palettes.some((item) => item.id === decoded.project.palette)).toBe(true);
  });
});

describe('ingestSource and sourceIntegrity', () => {
  const raw = 'Öğretmen: Su ısınır.\n\nÖğrenci: Buhar yükselir!  Sonra ne olur?';

  it('tiles the raw source without losing punctuation or whitespace', () => {
    const beats = ingestSource(raw);
    expect(beats.length).toBe(3);
    expect(beats.map((beat) => beat.exactText).join('')).toBe(raw);
    expect(beats.map((beat) => beat.sourceId)).toEqual(['source-001', 'source-002', 'source-003']);
    expect(beats[1].exactText.startsWith('\n\n')).toBe(true);
  });

  it('is deterministic for the same raw source', () => {
    expect(ingestSource(raw)).toEqual(ingestSource(raw));
  });

  it('reports 100% and equal hashes on a lossless round-trip', () => {
    const report = sourceIntegrity(raw, ingestSource(raw));
    expect(report.ok).toBe(true);
    expect(report.coverage).toBe(100);
    expect(report.rawHash).toBe(report.reconHash);
  });

  it('reports less than 100% when a beat is dropped', () => {
    const beats = ingestSource(raw);
    const report = sourceIntegrity(raw, beats.slice(0, -1));
    expect(report.ok).toBe(false);
    expect(report.coverage).toBeLessThan(100);
    expect(report.rawHash).not.toBe(report.reconHash);
  });
});

describe('autoGroupBeats', () => {
  const longSource = Array.from(
    { length: 16 },
    (_, i) => `Kısa cümle ${i + 1}.`,
  ).join(' ');

  it('groups granular atoms into fewer thematic beats', () => {
    const atoms = ingestSource(longSource);
    const grouped = autoGroupBeats(longSource, 'Dengeli');
    expect(grouped.length).toBeGreaterThan(0);
    expect(grouped.length).toBeLessThan(atoms.length);
  });

  it('stays lossless — grouped beats reconstruct the raw source exactly', () => {
    const grouped = autoGroupBeats(longSource, 'Dengeli');
    expect(grouped.map((b) => b.exactText).join('')).toBe(longSource);
    expect(sourceIntegrity(longSource, grouped).coverage).toBe(100);
  });

  it('renumbers source ids sequentially', () => {
    const grouped = autoGroupBeats(longSource, 'Dengeli');
    expect(grouped.map((b) => b.sourceId)).toEqual(
      grouped.map((_, i) => `source-${String(i + 1).padStart(3, '0')}`),
    );
  });

  it('is deterministic and respects beat mode (Ekonomik groups at least as hard as Hassas)', () => {
    expect(autoGroupBeats(longSource, 'Dengeli')).toEqual(autoGroupBeats(longSource, 'Dengeli'));
    const eko = autoGroupBeats(longSource, 'Ekonomik').length;
    const hassas = autoGroupBeats(longSource, 'Hassas').length;
    expect(eko).toBeLessThanOrEqual(hassas);
  });

  it('leaves a single atom untouched', () => {
    const grouped = autoGroupBeats('Tek cümle.', 'Dengeli');
    expect(grouped).toHaveLength(1);
    expect(grouped[0].exactText).toBe('Tek cümle.');
  });
});
