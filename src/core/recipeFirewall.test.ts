import { describe, expect, it } from 'vitest';
import { DATA, generateBatch, type BriefInput } from './pure';
import { ingestSource } from './source';

// ─────────────────────────────────────────────────────────────────────────────
// THE FOURTH OPENING OF THE COPYRIGHT GATE.
//
// The gate has been re-opened four times, each by a NEW field that reached the prompt with
// nobody screening it: anchor → refDna → referenceDNA.refs[] → handoff.refDNAs[]. Those were
// reference prose, and they were closed at the data gate (pure.ts DATA).
//
// This one was different, and worse: it was MAMI'S OWN FREE TEXT. Wiring the recipe's
// subject / location / scene notes into agentBrief and project.json (the right fix — those
// decisions were dying silently) sent them down the prompt path through NO firewall.
// Measured on real generateBatch output before this gate existed:
//   subject "Spider-Verse tarzında bir sahne olsun"  → final_brief.md, raw
//   director_note "Bunu Attack on Titan gibi çiz"     → final_brief.md, raw
//   location "Apple Store, İstanbul"                  → project.json, live commercial brand
//   vo "Renk #FF00AA olsun"                           → raw hex on the prompt path
//
// The rule is the one `cast` already follows and states in its own comment: NEVER silently
// rewrite what Mami authored. Cutting a word out leaves a mutilated sentence and a still-
// recognisable franchise. STOP, name the terms, let him re-author. He is in the loop; he
// fixes it in one sentence, and the export never carries the leak.
// ─────────────────────────────────────────────────────────────────────────────

const RAW_SOURCE = 'Su buharlaşır. Bulut olur. Yağmur düşer.';

function run(extra: Partial<BriefInput>) {
  const sourceBeats = ingestSource(RAW_SOURCE);
  return generateBatch({
    rawSource: RAW_SOURCE,
    sourceBeats,
    projectTopic: 'Su Döngüsü',
    projectClass: 'ANIMATION_EDU',
    sceneCount: 3,
    cast: '',
    selectedWorldId: 'clay',
    selectedPropId: 'native_world',
    selectedRefIds: [],
    selectedPaletteId: DATA.palettes[0].id,
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
    ...extra,
  } as BriefInput);
}

/**
 * Everything that reaches an agent or an engine: the brief and every prompt. NOT the
 * contractGate findings — those deliberately quote the offending term back to Mami so he
 * knows what to re-author. The warning naming the leak is not the leak.
 */
const everythingEmitted = (result: ReturnType<typeof run>) =>
  JSON.stringify({ brief: result.agentBrief, scenes: result.scenes, packets: result.agentPackets });

describe('the doctor own free text goes through the copyright firewall', () => {
  it('blocks a work title in the subject instead of shipping it', () => {
    const result = run({ subject: 'Spider-Verse tarzında bir sahne olsun' });

    expect(result.status).toBe('BLOCKED');
    expect(result.contractGate?.findings.map((f) => f.code)).toContain('RECIPE_IP_LEAK');
    // It names the term, so Mami knows exactly what to re-author.
    expect(result.contractGate?.findings.find((f) => f.code === 'RECIPE_IP_LEAK')?.message).toMatch(
      /spider-verse/i,
    );
    // And nothing shipped.
    expect(everythingEmitted(result)).not.toMatch(/Spider-Verse/i);
  });

  it('blocks a work title in a scene note (the director note the agent obeys)', () => {
    const result = run({
      recipeScenes: [{ id: 1, vo: '', event: '', director_note: 'Bunu Attack on Titan gibi çiz', motion_seed: '', turkish_labels: [], avoid: [] }],
    });

    expect(result.status).toBe('BLOCKED');
    expect(everythingEmitted(result)).not.toMatch(/attack on titan/i);
  });

  it('blocks a live commercial brand in the location', () => {
    const result = run({ location: 'One Piece temalı bir kafe, İstanbul' });

    expect(result.status).toBe('BLOCKED');
    expect(everythingEmitted(result)).not.toMatch(/one piece/i);
  });

  it('blocks a raw hex in a scene note — the palette reaches the engine as light, never as #RRGGBB', () => {
    const result = run({
      recipeScenes: [{ id: 1, vo: 'Renk #FF00AA olsun', event: '', director_note: '', motion_seed: '', turkish_labels: [], avoid: [] }],
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.contractGate?.findings.map((f) => f.code)).toContain('RECIPE_RAW_HEX');
    expect(everythingEmitted(result)).not.toMatch(/#FF00AA/i);
  });

  it('the firewall does not silently rewrite — it stops and names the term', () => {
    const result = run({ subject: 'Spider-Verse tarzında bir sahne olsun' });
    const message = result.contractGate?.findings.find((f) => f.code === 'RECIPE_IP_LEAK')?.message ?? '';
    // A mutilated sentence ("… tarzında bir sahne olsun" with the name excised) would be
    // worse than a block: still wrong, and now incoherent. The gate must refuse, not edit.
    expect(message).toMatch(/yazın|yeniden/i);
  });

  // The gate must not become a wall Mami cannot walk through. Legitimate craft prose — the
  // whole point of wiring these fields — passes untouched and reaches the brief.
  it('lets honest craft prose through, verbatim', () => {
    const result = run({
      subject: 'Bakır işleyen bir zanaatkârın sabrı',
      location: 'Ankara, bir demirci atölyesi',
      recipeScenes: [{ id: 1, vo: '', event: '', director_note: 'Kalın kontur, ofset baskı kayması, yarım-ton nokta dokusu', motion_seed: '', turkish_labels: [], avoid: [] }],
    });

    expect(result.status).toBe('GENERATED');
    expect(result.agentBrief).toContain('Ankara, bir demirci atölyesi');
    expect(result.agentBrief).toContain('ofset baskı kayması');
  });

  // A world title is not a franchise. The studio name stays (it points at a pipeline); the
  // WORK name goes. This is the line MEMORY draws, and the gate must draw it too.
  it('does not block a studio name — the world must still read as itself', () => {
    const result = run({ subject: 'Pixar kalitesinde bir eğitim sahnesi' });
    expect(result.status).toBe('GENERATED');
  });

  // ── P1 — THE FIFTH OPENING: directorBrief ──────────────────────────────────
  // directorBrief is Mami's own free creative direction and reaches buildImagePrompt
  // (`Director mandate:`) + the export verbatim. It went through NO firewall — exactly
  // the class this gate was built to close. Same rule as subject/scene notes: STOP and
  // name the term, never silently rewrite.
  it('P1: blocks a work title in directorBrief instead of shipping it', () => {
    const result = run({ directorBrief: 'Spider-Verse tarzında olsun, gölgeler morda' });
    expect(result.status).toBe('BLOCKED');
    expect(result.contractGate?.findings.map((f) => f.code)).toContain('RECIPE_IP_LEAK');
    expect(everythingEmitted(result)).not.toMatch(/spider-verse/i);
  });

  it('P1: blocks raw hex in directorBrief — it reaches the engine as light, never as #RRGGBB', () => {
    const result = run({ directorBrief: 'Gölgeler #FF00AA morunda parlasın' });
    expect(result.status).toBe('BLOCKED');
    expect(result.contractGate?.findings.map((f) => f.code)).toContain('RECIPE_RAW_HEX');
    expect(everythingEmitted(result)).not.toMatch(/#FF00AA/i);
  });

  it('P1: honest directorBrief prose passes untouched', () => {
    const result = run({ directorBrief: 'Sıcak anahtar ışık, özneye yakın, sakin tempo' });
    expect(result.status).toBe('GENERATED');
  });

  // ── P2 — brandKitLock: THIRD-PARTY IP / HEX ONLY ───────────────────────────
  // brandKitLock deliberately carries the CUSTOMER'S OWN brand (commercial exemption) —
  // so the commercial-brand check must NOT fire on it. But a FOREIGN franchise or a raw
  // hex typed here has no screen at all today, and reaches the prompt ("Brand kit lock:").
  // Screen only protected third-party IP/work + raw hex; the customer's own brand stays.
  it('P2: blocks a foreign franchise name in brandKitLock', () => {
    const result = run({ brandKitLock: 'Naruto Uzumaki logo, turuncu pelerin' });
    expect(result.status).toBe('BLOCKED');
    expect(result.contractGate?.findings.map((f) => f.code)).toContain('RECIPE_IP_LEAK');
    expect(everythingEmitted(result)).not.toMatch(/naruto/i);
  });

  it('P2: blocks raw hex in brandKitLock', () => {
    const result = run({ brandKitLock: 'Logo rengi #FF00AA olacak' });
    expect(result.status).toBe('BLOCKED');
    expect(result.contractGate?.findings.map((f) => f.code)).toContain('RECIPE_RAW_HEX');
    expect(everythingEmitted(result)).not.toMatch(/#FF00AA/i);
  });

  // ── Hex length parity (garanti denetçi bulgusu) ────────────────────────────
  // Gate yalnız 6-haneli hex tarıyordu; kod tabanının geri kalanı (qa.ts HEX_RE,
  // brain.hexToLightWords, mjs) 3/4/6/8-hane kabul ediyor. 3-hane (#F0A) ve 8-hane
  // (#FF00AAFF) gate'i geçip export'a sızıyordu. Tüm doctorText alanları için geçerli.
  it('P-hex: blocks 3-digit hex (#F0A) — codebase-wide parity', () => {
    const result = run({ directorBrief: 'Gölgeler #F0A tonunda' });
    expect(result.status).toBe('BLOCKED');
    expect(result.contractGate?.findings.map((f) => f.code)).toContain('RECIPE_RAW_HEX');
    expect(everythingEmitted(result)).not.toMatch(/#F0A\b/i);
  });

  it('P-hex: blocks 8-digit hex (#FF00AAFF) in a scene note', () => {
    const result = run({
      recipeScenes: [{ id: 1, vo: 'Aksan #FF00AAFF olsun', event: '', director_note: '', motion_seed: '', turkish_labels: [], avoid: [] }],
    });
    expect(result.status).toBe('BLOCKED');
    expect(result.contractGate?.findings.map((f) => f.code)).toContain('RECIPE_RAW_HEX');
    expect(everythingEmitted(result)).not.toMatch(/#FF00AAFF/i);
  });

  // The whole point of brandKitLock: the customer's OWN brand must pass. A plain brand-kit
  // instruction with no third-party IP and no hex is legitimate and reaches the brief.
  it('P2: the customer own brand-kit instruction passes untouched', () => {
    const result = run({ brandKitLock: 'Marka logosu sağ alt köşede, kurumsal lacivert tonlarda' });
    expect(result.status).toBe('GENERATED');
  });
});
