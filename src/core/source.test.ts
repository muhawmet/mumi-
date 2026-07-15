import { describe, expect, it } from 'vitest';
import SURGERY from './SURGERY_DATA.json';
import {
  decodeBrief,
  ingestSource,
  extractProductionDossierSource,
  autoGroupBeats,
  sourceIntegrity,
  durationBudgetSourceBeats,
  sourceSceneBudget,
} from './source';

describe('decodeBrief', () => {
  const plainSources = [
    '3. sınıf öğrencileri için su döngüsü dersi: buharlaşma ve yoğuşma.',
    'Premium telefon kılıfı reklamı; packshot, logo stabil ve makro yüzey zorunlu.',
    'One Piece Elbaf tarzı dev ada macerası',
    'Mimari salon kapısı açılır mermer iç mekan ışık',
    'kısa',
  ];

  it.each(plainSources)('plain raw source never infers path/world/ref/palette: %s', (source) => {
    const decoded = decodeBrief(source);
    const neutral = decodeBrief('');
    expect({ path: decoded.path, project: decoded.project }).toEqual({ path: neutral.path, project: neutral.project });
    expect(decoded.confidence).toBe('fallback');
    expect(decoded.reason).toContain('kaynak kelimelerinden');
  });

  it('word count cannot change confidence or creative selection', () => {
    const short = decodeBrief('ürün');
    const long = decodeBrief(Array.from({ length: 80 }, () => 'ürün reklamı packshot').join(' '));
    expect({ path: short.path, project: short.project, confidence: short.confidence })
      .toEqual({ path: long.path, project: long.project, confidence: long.confidence });
  });

  it('a protected franchise name in raw source cannot select that franchise world', () => {
    expect(decodeBrief('One Piece Naruto Demon Slayer').project.world).not.toMatch(/one_piece|naruto|demon_slayer/);
  });

  it('reads path, world and palette from a pasted MAMILAS production dossier', () => {
    const decoded = decodeBrief([
      '# MAMILAS PRODUCTION DOSSIER',
      '- **Path:** ANIMATION_EDU',
      '- **World:** One Piece — Toei Bold-Cel',
      '### Palette as Light',
      'Vibrant Education — shadow #1D3557, mid #F4C430.',
      '[1] ~3s',
      'SOURCE (exact, untouchable): Grup nedir?',
    ].join('\n'));
    expect(decoded.path).toBe('ANIMATION_EDU');
    expect(decoded.project.world).toBe('one_piece_toei');
    expect(decoded.project.palette).toBe('vibrant_edu');
  });

  it('returns only IDs that exist and agree in SURGERY_DATA', () => {
    const decoded = decodeBrief('Belediye için 23 Nisan kamusal etkinlik filmi.');
    const project = SURGERY.projects.find((item) => item.id === decoded.project.id);
    expect(SURGERY.paths.some((item) => item.id === decoded.path)).toBe(true);
    expect(project?.path).toBe(decoded.path);
    expect(SURGERY.worlds.some((item) => item.id === decoded.project.world)).toBe(true);
    expect(decoded.project.ref).toBe('');
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

  it('never orphans a trailing closing quote into its own beat', () => {
    // "…büyüyecek!" → the terminator "!" closes the sentence, but the closing
    // quote " must ride WITH that sentence, not spill into a single-char beat.
    const quoted = 'Öğretmen dedi: "Bu 10 sayısı sihirli bir şeye dönüşecek!" Sınıf sustu.';
    const beats = ingestSource(quoted);
    // Losslessness first — every character must survive.
    expect(beats.map((b) => b.exactText).join('')).toBe(quoted);
    // No beat may consist solely of closing punctuation / whitespace.
    for (const b of beats) {
      expect(/^[\s"'”’»)\]]+$/u.test(b.exactText)).toBe(false);
    }
    // The quote closes with the sentence it belongs to.
    expect(beats.some((b) => b.exactText.includes('dönüşecek!"'))).toBe(true);
  });

  it('extracts exact SOURCE lines from a pasted production dossier before ingesting', () => {
    const dossier = [
      '# MAMILAS PRODUCTION DOSSIER',
      '[1] ~6s',
      'SOURCE (exact, untouchable): Peki hiç düşündün mü?',
      'CONCEPT: old generic concept',
      '[2] ~5s',
      'SOURCE (exact, untouchable):  "Biliyor muydun ki aynı anda ailenin üyesisin?"',
      'CONCEPT: old generic concept',
    ].join('\n');
    const extracted = extractProductionDossierSource(dossier);
    expect(extracted?.rawSource).toBe('Peki hiç düşündün mü? "Biliyor muydun ki aynı anda ailenin üyesisin?"');
    expect(extracted?.beats).toHaveLength(2);
    expect(ingestSource(dossier)).toEqual(extracted?.beats);
    expect(sourceIntegrity(extracted!.rawSource, extracted!.beats).coverage).toBe(100);
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

  it('budgets a 65s-ish Turkish VO into about 13 scenes instead of atom scenes', () => {
    const raw = [
      ...Array.from({ length: 43 }, (_, i) => `Öğrenci kavramı ${i + 1}.`),
      ...Array.from({ length: 8 }, (_, i) => `Ders ${i + 1}.`),
    ].join(' ');
    const atoms = ingestSource(raw);
    const budget = sourceSceneBudget(raw, 'Dengeli');
    const grouped = durationBudgetSourceBeats(raw, 'Dengeli', atoms);

    expect(atoms).toHaveLength(51);
    expect(budget.estimatedVoSeconds).toBeGreaterThanOrEqual(60);
    expect(budget.estimatedVoSeconds).toBeLessThanOrEqual(65);
    expect(budget.targetSceneCount).toBe(13);
    expect(grouped).toHaveLength(13);
    expect(grouped).not.toHaveLength(25);
    expect(grouped.map((beat) => beat.exactText).join('')).toBe(raw);
    expect(sourceIntegrity(raw, grouped).coverage).toBe(100);
  });

  it('scene budget is model-aware: wider engine window → longer per-scene VO budget, fewer scenes', () => {
    const raw = [
      ...Array.from({ length: 43 }, (_, i) => `Öğrenci kavramı ${i + 1}.`),
      ...Array.from({ length: 8 }, (_, i) => `Ders ${i + 1}.`),
    ].join(' ');

    // No model → exact legacy Kling-baseline numbers stay untouched.
    const legacy = sourceSceneBudget(raw, 'Dengeli');
    expect(legacy.usableVoSecondsPerScene).toBe(5);

    // kling_o3 (15s window, 2026-07 web-verified: Kling 3.0 native 3-15s): 5 * 15/9 = 8.3s.
    const o3 = sourceSceneBudget(raw, 'Dengeli', undefined, 'kling_o3');
    expect(o3.usableVoSecondsPerScene).toBe(8.3);
    expect(o3.targetSceneCount).toBeLessThan(legacy.targetSceneCount);

    // runway_gen4 (14s window): 5 * 14/9 = 7.8s per scene — narrower than o3's
    // 15s window since 2026-07, so it needs at least as many scenes as o3.
    const runway = sourceSceneBudget(raw, 'Dengeli', undefined, 'runway_gen4');
    expect(runway.usableVoSecondsPerScene).toBe(7.8);
    expect(runway.targetSceneCount).toBeGreaterThanOrEqual(o3.targetSceneCount);

    // Explicit kling (9s baseline) === legacy behaviour.
    const kling = sourceSceneBudget(raw, 'Dengeli', undefined, 'kling');
    expect(kling.usableVoSecondsPerScene).toBe(5);
    expect(kling.targetSceneCount).toBe(legacy.targetSceneCount);

    // Grouping honours the model budget and stays lossless.
    const atoms = ingestSource(raw);
    const groupedO3 = durationBudgetSourceBeats(raw, 'Dengeli', atoms, 'kling_o3');
    expect(groupedO3.length).toBeLessThan(durationBudgetSourceBeats(raw, 'Dengeli', atoms).length);
    expect(groupedO3.map((beat) => beat.exactText).join('')).toBe(raw);
    expect(sourceIntegrity(raw, groupedO3).coverage).toBe(100);
  });

  it('avoids starting grouped scenes with stranded Turkish conjunctions', () => {
    const raw = [
      'Toplum birlikte yaşar.',
      'Ve kurallar bu yaşamı düzenler.',
      'Çocuklar haklarını öğrenir.',
      'Ama sorumluluklarını da fark eder.',
      'Kamuoyu ortak sesi duyurur.',
      'Sonra kararlar daha görünür olur.',
      'STK gönüllü katkı sağlar.',
      'Medya bilgiyi yayar.',
      'Hukuk hakları korur.',
      'Vatandaş sözünü söyler.',
    ].join(' ');
    const grouped = durationBudgetSourceBeats(raw, 'Dengeli', ingestSource(raw));

    expect(grouped.length).toBeGreaterThan(1);
    expect(grouped.map((beat) => beat.exactText).join('')).toBe(raw);
    expect(grouped.some((beat) => /^(Ve|Ama|Çünkü|Fakat|Sonra)\b/u.test(beat.exactText.trim()))).toBe(false);
  });

  it('never merges ordinal sequence intros ("Beşinci unsur…") with the preceding sentence', () => {
    // Each ordinal marker introduces a NEW visual concept — a new start frame.
    // Merging them produces a scene where Kling's start frame can't represent both ideas.
    const raw = [
      'Vatandaşlık katılımı beş unsurdan oluşur.',
      'Birinci unsur, hukuktur.',
      'İkinci unsur, kamuoyudur.',
      'Üçüncü unsur, medyadır.',
      'Dördüncü unsur, sivil toplum kuruluşlarıdır.',
      'Beşinci unsur, siyasi partilerdir.',
      'Bu beş unsur birbirinden bağımsız değildir.',
    ].join(' ');
    const grouped = autoGroupBeats(raw, 'Dengeli');
    expect(grouped.map((b) => b.exactText).join('')).toBe(raw);
    expect(sourceIntegrity(raw, grouped).coverage).toBe(100);
    // Each ordinal sentence must be in its own scene, not merged with the one before it
    const ordinalPattern = /^(Birinci|İkinci|Üçüncü|Dördüncü|Beşinci)\s+unsur/u;
    for (const beat of grouped) {
      if (ordinalPattern.test(beat.exactText.trim())) {
        // ordinal intro must start a new beat, not be appended to a previous one
        expect(beat.exactText.trim()).toMatch(ordinalPattern);
      }
    }
  });

  it('keeps listed educational concepts as separate dominant scene ideas', () => {
    const raw = [
      'Bu derste toplumsal katılım yollarını tanırız.',
      'HUKUK hakları ve kuralları korur.',
      'KAMUOYU ortak düşünceyi görünür yapar.',
      'MEDYA bilgiyi topluma ulaştırır.',
      'STK gönüllü katılımı örgütler.',
      'SİYASİ PARTİ çözüm önerilerini temsil eder.',
      'Bu grupların her biri katılımı güçlendirir.',
    ].join(' ');
    const grouped = durationBudgetSourceBeats(raw, 'Dengeli', ingestSource(raw));
    const conceptPattern = /HUKUK|KAMUOYU|MEDYA|STK|SİYASİ PARTİ/gu;
    const conceptGroups = grouped.filter((beat) => {
      conceptPattern.lastIndex = 0;
      return conceptPattern.test(beat.exactText);
    });

    expect(sourceSceneBudget(raw, 'Dengeli').targetSceneCount).toBeLessThan(5);
    expect(conceptGroups).toHaveLength(5);
    for (const beat of conceptGroups) {
      const matches = beat.exactText.match(conceptPattern) || [];
      expect(matches).toHaveLength(1);
    }
    expect(grouped.map((beat) => beat.exactText).join('')).toBe(raw);
    expect(sourceIntegrity(raw, grouped).coverage).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// A NUMBER'S PERIOD IS NOT A SENTENCE'S PERIOD.
//
// "17. yüzyıl Osmanlı Bursa'sında kandil yanar." split into TWO beats — "17." and
// "yüzyıl Osmanlı…" — and the first became a whole SCENE whose entire source was "17.".
// A scene, an image prompt and a motion draft, all for a number. Turkish ordinals are
// everywhere in exactly the material Mami writes: "3. sınıf", "20. yüzyıl", "1. Dünya
// Savaşı", "2. Meşrutiyet".
describe('ordinals do not end a sentence', () => {
  it('a Turkish ordinal is glued to the sentence it belongs to', () => {
    const beats = ingestSource("17. yüzyıl Osmanlı Bursa'sında kandil yanar. El ipliği geçirir.");
    expect(beats.length, 'the ordinal became its own beat').toBe(2);
    expect(beats[0].exactText).toContain('17.');
    expect(beats[0].exactText).toContain('yüzyıl');
    expect(beats[0].exactText.trim()).not.toBe('17.');
  });

  it('works for the ordinals Mami actually types', () => {
    for (const src of ['3. sınıf öğrencileri deneyi yapar.', '1. Dünya Savaşı başlar.', '20. yüzyıl değişir.']) {
      const beats = ingestSource(src);
      expect(beats.length, `"${src}" split on its ordinal`).toBe(1);
    }
  });

  it('a real sentence boundary still splits', () => {
    expect(ingestSource('Su ısınır. Buhar yükselir.').length).toBe(2);
  });

  it('losslessness survives the glue — every character is still there', () => {
    const src = "17. yüzyıl Osmanlı Bursa'sında kandil yanar. El ipliği geçirir.";
    expect(ingestSource(src).map((b) => b.exactText).join('')).toBe(src);
  });
});
