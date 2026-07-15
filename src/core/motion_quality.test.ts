import { describe, expect, it } from 'vitest';
import { buildMotionPrompt, dnaDirectives, type Concept } from './brain';

// FAZ2: konsept motoru söküldü. Motion prompt banka Moving element/Event türetmez;
// WHAT'ı Claude yazar. Sinematografi çerçevesi (Camera + Motion brief + Rhythm +
// Engine grammar + frame-gate + NEGATIVE + SPLIT NOTE) korunur.
const CONCEPT: Concept = { subject: '', event: '', matched: false };
const SRC = 'Savaşçı son düşmanıyla karanlık sokakta yüzleşir.';

describe('motion prompt quality (FAZ2 çerçeve sözleşmesi)', () => {
  it('builds a substantial motion prompt from path-native v2 directives', () => {
    const dna = dnaDirectives([], 'STY');
    const motion = buildMotionPrompt(1, CONCEPT, dna.camera, dna, 8, undefined, null, SRC);

    // structural contract: header + sections present
    expect(motion).toContain('MOTION (i2v · plays the approved start frame)');
    expect(motion).toContain('Camera:');
    // banka Moving element/Event söküldü → Claude Motion brief taşır
    expect(motion).not.toContain('Moving element:');
    expect(motion).not.toContain('Event:');
    expect(motion).toContain('Motion brief (Claude yazar)');
    expect(motion).toContain('Rhythm:');
    expect(motion).toContain('Engine grammar');
    expect(motion).toContain('Everything not named stays exactly as the start frame shows');
    expect(motion).toContain('NEGATIVE:');

    // negative section must include core anti-morph terms
    expect(motion).toContain('morphing');
    expect(motion).toContain('warping');
    expect(motion).toContain('style or material drift');

    // scene id appears as bracket prefix
    expect(motion).toMatch(/^\[1\]/);
  });

  it('includes final hold in rhythm section', () => {
    const dna = dnaDirectives([], 'STY');
    const motion = buildMotionPrompt(1, CONCEPT, dna.camera, dna, 8, undefined, null, SRC);
    expect(motion).toContain('final hold');
  });

  it('emits SPLIT NOTE when scene duration exceeds engine window', () => {
    const dna = dnaDirectives([], 'STY');
    const motionLong = buildMotionPrompt(1, CONCEPT, dna.camera, dna, 30, undefined, null, SRC);
    expect(motionLong).toContain('SPLIT NOTE');
    // short duration does NOT emit split note
    const motionShort = buildMotionPrompt(1, CONCEPT, dna.camera, dna, 5, undefined, null, SRC);
    expect(motionShort).not.toContain('SPLIT NOTE');
  });

  // 2026-07-10: metin artık "overlay" değil — start frame'deki bir YÜZEYE yazılı bir
  // nesnedir (Mami'nin editörü yok, üstüne katman konacak bir aşama da yok). Kling'e
  // "overlay" demek onu kaydırılabilir serbest bir katman sanmaya davet ediyordu.
  it('includes visibleText protection line when the frame bakes text into a surface', () => {
    const dna = dnaDirectives([], 'STY');
    const motion = buildMotionPrompt(1, CONCEPT, dna.camera, dna, 8, undefined, 'KUZEY', SRC);
    expect(motion).toContain("Start frame carries 'KUZEY' written on a surface inside the scene");
    expect(motion).toMatch(/moves only as its surface moves/i);
    expect(motion).toMatch(/preserve character-for-character/i);
    expect(motion).not.toMatch(/overlay/i);
  });

  it('adventure source text: motion brief verbatim kaynağı taşır (banka öznesi türetmez)', () => {
    const dna = dnaDirectives([], 'STY');
    const src = 'Büyük deniz macerasında ekip birlikte gider.';
    const motion = buildMotionPrompt(1, CONCEPT, dna.camera, dna, 8, undefined, null, src);
    expect(motion).toContain('Motion brief (Claude yazar)');
    expect(motion).toContain(src);
  });

  it('urban darkness source: motion brief verbatim kaynağı taşır', () => {
    const dna = dnaDirectives([], 'STY');
    const src = 'Karanlık kentsel atmosferde duman ve gerilim şehri kaplar.';
    const motion = buildMotionPrompt(1, CONCEPT, dna.camera, dna, 8, undefined, null, src);
    expect(motion).toContain('Motion brief (Claude yazar)');
    expect(motion).toContain(src);
  });
});
