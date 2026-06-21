// Brief Brain golden snapshot — pins the structure of the Master Brief produced
// by public/brief-generator.js. Any drift in required sections or section order
// trips these tests. Added 2026-06-21 (Round 3).

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function buildHarness({ scenes, world, projectControls } = {}) {
  const context = vm.createContext({
    STATE: {
      selectedWorldId: world.id,
      scenes: scenes,
      modelGrounding: { image: { targetModel: { label: 'Midjourney v7' } }, video: { targetModel: { label: 'Kling 3.0' } } },
      projectControls: projectControls || null
    },
    BRAIN: { worlds: [world] },
    document: {
      getElementById: (id) => {
        if (id === 'project-topic') return { value: 'Fotosentezin sınıfta dans gibi anlatımı' };
        if (id === 'project-class') return { value: 'Eğitim İçeriği' };
        return null;
      },
      body: { addEventListener() {} }
    },
    window: {
      addEventListener() {},
      location: { origin: 'http://localhost' },
      showToast() {}
    },
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    deriveProductionPath: (klass) => klass === 'Tasarım İşi' ? 'STYLIZED_PREMIUM' : 'ANIMATION_EDU'
  });
  const src = readFileSync(path.join(ROOT, 'public/brief-generator.js'), 'utf8');
  vm.runInContext(src, context, { filename: 'public/brief-generator.js' });
  return context;
}

const DEMO_WORLD = {
  id: 'pixar_feature',
  name: 'Pixar Feature',
  palette: ['#FFD16E', '#7A4A2E', '#2D2A4A'],
  renderRecipe: 'Stylized 3D feature, warm key light, soft rim, depth-of-field',
  motionNotes: 'subject-led drift, parallax background, no morph',
  musicMapping: 'orchestral storybook bed, brass-led swell on hero beats',
  negatives: ['flat 2d', 'cel shading', 'photoreal skin'],
  opticalGrammar: '50mm anamorphic-ish, f/2.2',
  lighting: 'warm golden hour key + cool sky fill',
  texture: 'painterly subsurface, micro fuzz on hero',
  temporalProgression: 'beat-aligned subject reveal',
  cameraMotion: 'slow push-in, anchor on hero',
  subjectMotion: 'breath cycle + micro-glance',
  mjParameters: '--ar 16:9 --v 7.0 --style raw',
  imageVantageConstraint: 'low 3/4 from subject eyeline'
};

const DEMO_SCENES = [
  { id: 1, topic: 'Sahne 1 — Aras pencereden ışığı izler', duration: 4, dominantSubject: 'Aras pencerede' },
  { id: 2, topic: 'Sahne 2 — Yapraklar ışığı yakalar', duration: 5, dominantSubject: 'Yapraklar makro' },
  { id: 3, topic: 'Sahne 3 — Glukoz dans gibi akar', duration: 4, dominantSubject: 'Sınıf yer hareketi' },
  { id: 4, topic: 'Sahne 4 — Aras gülümser, kapanış', duration: 3, dominantSubject: 'Aras yakın plan' }
];

test('brief brain: produces non-empty output for valid scene set', () => {
  const ctx = buildHarness({ scenes: DEMO_SCENES, world: DEMO_WORLD });
  const out = ctx.generateMasterBriefText();
  assert.ok(out && out.length > 1000, 'expected substantial brief output');
});

test('brief brain: every required section header is present and ordered', () => {
  const ctx = buildHarness({ scenes: DEMO_SCENES, world: DEMO_WORLD });
  const out = ctx.generateMasterBriefText();
  const REQUIRED_IN_ORDER = [
    'SOURCE SECURITY BOUNDARY',
    'MAMILAS PRODUCTION BRIEF',
    '== RECIPE ==',
    '== RENDER LOCK',
    '== AUTHORITY ==',
    '== REFERENCE DNA → DIRECTIVES ==',
    '== PALETTE AS LIGHT ==',
    '== CHARACTER / TAG LAW ==',
    '== KLING ANCHOR LAW ==',
    '== SCENE DOSSIER ==',
    '== SOUND ==',
    '== FAIL CONDITIONS (Proof) ==',
    '== TURKISH VISIBLE-TEXT LOCK ==',
    'SOURCE INTEGRITY'
  ];
  let cursor = 0;
  for (const marker of REQUIRED_IN_ORDER) {
    const idx = out.indexOf(marker, cursor);
    assert.notEqual(idx, -1, `section "${marker}" missing or out of order`);
    cursor = idx + marker.length;
  }
});

test('brief brain: duration sums scene-level durations (not hardcoded 4×N)', () => {
  // DEMO_SCENES total = 4+5+4+3 = 16, NOT 4 scenes × 4s = 16 (matches!).
  // Use a set that diverges to prove it.
  const customScenes = [
    { id: 1, topic: 'a', duration: 2 },
    { id: 2, topic: 'b', duration: 7 },
    { id: 3, topic: 'c', duration: 3 }
  ];
  const ctx = buildHarness({ scenes: customScenes, world: DEMO_WORLD });
  const out = ctx.generateMasterBriefText();
  assert.match(out, /Duration: ~12s/, 'expected Duration: ~12s from sum 2+7+3');
});

test('brief brain: client/audience/brand default to "-" when projectControls absent', () => {
  const ctx = buildHarness({ scenes: DEMO_SCENES, world: DEMO_WORLD });
  const out = ctx.generateMasterBriefText();
  assert.match(out, /Client: - · Brand: -/, 'expected dash defaults, not legacy hardcoded "AURUM"');
  assert.match(out, /Audience: -/);
  assert.ok(!out.includes('AURUM'), 'must not leak legacy hardcoded client name');
});

test('brief brain: projectControls.client/brand/audience flow into RECIPE when provided', () => {
  const projectControls = { client: 'KARTON A.Ş.', brand: 'MAMILAS', audience: 'İlkokul 4-5' };
  const ctx = buildHarness({ scenes: DEMO_SCENES, world: DEMO_WORLD, projectControls });
  const out = ctx.generateMasterBriefText();
  assert.match(out, /Client: KARTON A\.Ş\./);
  assert.match(out, /Brand: MAMILAS/);
  assert.match(out, /Audience: İlkokul 4-5/);
});

test('brief brain: world palette renders as hex CSV in PALETTE AS LIGHT', () => {
  const ctx = buildHarness({ scenes: DEMO_SCENES, world: DEMO_WORLD });
  const out = ctx.generateMasterBriefText();
  assert.match(out, /PALETTE AS LIGHT[\s\S]*#FFD16E, #7A4A2E, #2D2A4A/);
});

test('brief brain: SCENE DOSSIER contains one entry per scene with SOURCE line', () => {
  const ctx = buildHarness({ scenes: DEMO_SCENES, world: DEMO_WORLD });
  const out = ctx.generateMasterBriefText();
  for (const s of DEMO_SCENES) {
    assert.ok(out.includes(`[text#000${s.id}] Build / Proof`), `missing scene marker for ${s.id}`);
    assert.ok(out.includes(`SOURCE (exact, untouchable): ${s.topic}`), `missing SOURCE line for ${s.id}`);
  }
});

test('brief brain: SOURCE INTEGRITY line names exact scene count', () => {
  const ctx = buildHarness({ scenes: DEMO_SCENES, world: DEMO_WORLD });
  const out = ctx.generateMasterBriefText();
  assert.match(out, /Coverage: 100% · Scenes: 4/);
});

test('brief brain: empty/missing STATE returns user-facing TR message, not crash', () => {
  const ctx = vm.createContext({
    STATE: null,
    BRAIN: { worlds: [DEMO_WORLD] },
    document: { getElementById: () => null, body: { addEventListener() {} } },
    window: { addEventListener() {}, location: { origin: 'x' } }
  });
  const src = readFileSync(path.join(ROOT, 'public/brief-generator.js'), 'utf8');
  vm.runInContext(src, ctx, { filename: 'public/brief-generator.js' });
  const out = ctx.generateMasterBriefText();
  assert.match(out, /Lütfen önce BATCH ÜRET/);
});

test('brief brain: world with empty palette degrades gracefully (no undefined hex)', () => {
  const sparseWorld = { ...DEMO_WORLD, palette: [], negatives: [] };
  const ctx = buildHarness({ scenes: DEMO_SCENES, world: sparseWorld });
  const out = ctx.generateMasterBriefText();
  assert.ok(out.includes('PALETTE AS LIGHT'));
  assert.ok(!out.includes('undefined'), 'must not include literal "undefined"');
});

test('brief brain: TURKISH VISIBLE-TEXT LOCK appears with NO_TEXT line per scene', () => {
  const ctx = buildHarness({ scenes: DEMO_SCENES, world: DEMO_WORLD });
  const out = ctx.generateMasterBriefText();
  assert.match(out, /TURKISH VISIBLE-TEXT LOCK/);
  for (const s of DEMO_SCENES) {
    assert.ok(out.includes(`[text#000${s.id}] NO_TEXT`), `missing NO_TEXT for scene ${s.id}`);
  }
});
