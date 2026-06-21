/**
 * P3 Golden Tests — MAMILAS NEW
 * Kapsam: 5/20/80 yoğunluk, visible-text lock, motion-without-image gate,
 * handoff packet contract, SOURCE binding, semantic uniqueness.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL_REGISTRY = JSON.parse(readFileSync(path.join(ROOT, 'public/model-registry.json'), 'utf8'));
const MUSIC_REGISTRY  = JSON.parse(readFileSync(path.join(ROOT, 'public/music-registry.json'), 'utf8'));

// ─── DOM shim (same pattern as app.test.mjs) ─────────────────────────────────
class FakeClassList {
  constructor(initial = '') { this.values = new Set(initial.split(/\s+/).filter(Boolean)); }
  add(...n)     { n.forEach(x => this.values.add(x)); }
  remove(...n)  { n.forEach(x => this.values.delete(x)); }
  contains(n)   { return this.values.has(n); }
  toggle(n, f)  { f = f === undefined ? !this.values.has(n) : f; f ? this.values.add(n) : this.values.delete(n); return f; }
}

class FakeElementParent {
  constructor() { this.header = { children: [], appendChild(c) { this.children.push(c); } }; this.classList = new FakeClassList(); }
  querySelector(sel) { return sel === '.prompt-header' ? this.header : null; }
}

class FakeElement {
  constructor({ id = '', className = '', value = '', attributes = {}, provider = null } = {}) {
    this.id = id; this.className = className;
    this.classList = new FakeClassList(className);
    this.value = value; this.attributes = { ...attributes };
    this.children = []; this.dataset = {}; this.style = {};
    this.innerHTML = ''; this.innerText = ''; this.textContent = '';
    this.onclick = null; this.onchange = null; this.disabled = false;
    this.selectedOptions = provider ? [{ parentElement: { label: provider } }] : [];
    this.parentElement = new FakeElementParent();
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  setAttribute(name, val) { this.attributes[name] = val; }
  appendChild(c) { this.children.push(c); return c; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  click() { if (typeof this.onclick === 'function') return this.onclick(); }
}

function createHarness({ topic = 'Kesirler', scenes = '3', storage = new Map() } = {}) {
  const elements = new Map();
  const defaults = {
    'project-topic':   { value: topic },
    'project-class':   { value: 'Eğitim / Konu Anlatımı' },
    'project-scenes':  { value: String(scenes) },
    'image-model':     { value: 'Nano Banana Pro', provider: 'GOOGLE' },
    'video-model':     { value: '3.0', provider: 'KLING' },
  };
  const ids = [
    'ref-container', 'world-filters', 'world-container', 'btn-batch-generate',
    'table-body', 'detail-cards-container', 'detail-empty-state', 'detail-title',
    'detail-image-prompt', 'detail-motion-prompt', 'detail-suno-prompt',
    'detail-vo-prompt', 'health-dot', 'health-text', 'btn-export-json',
    'btn-import-json', 'file-import-json', 'slider-val-display', 'batch-btn-count',
    'project-character', ...Object.keys(defaults),
  ];
  ids.forEach(id => elements.set(id, new FakeElement({ id, ...(defaults[id] || {}) })));

  const charButtons = [
    new FakeElement({ className: 'char-btn active', attributes: { 'data-char': 'Aras' } }),
  ];
  const claudeButton = new FakeElement({ className: 'copy-claude-btn' });
  const listeners = new Map();

  const document = {
    body: new FakeElement(),
    createElement: () => new FakeElement(),
    getElementById:    id  => elements.get(id) ?? null,
    querySelector:     sel => sel === '.copy-claude-btn' ? claudeButton : null,
    querySelectorAll:  sel => sel === '.char-btn' ? charButtons : [],
    addEventListener: (type, fn) => listeners.set(type, fn),
  };

  const context = {
    alert: () => {}, console,
    document,
    fetch: async url => url === '/model-registry.json'
      ? { ok: true, json: async () => MODEL_REGISTRY }
      : url === '/music-registry.json'
        ? { ok: true, json: async () => MUSIC_REGISTRY }
        : { ok: true, json: async () => ({ status: 'ok' }) },
    FileReader: class {},
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) },
    navigator: { clipboard: { writeText: async () => {} } },
    open: () => null, setTimeout, window: {},
  };
  context.window = context;
  return { context: vm.createContext(context), elements, listeners, claudeButton };
}

function boot(harness) {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const src = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(src, harness.context, { filename: 'public/app.js' });
  harness.listeners.get('DOMContentLoaded')();
}

function getScenes(ctx) {
  return JSON.parse(JSON.stringify(vm.runInContext('STATE.scenes', ctx)));
}

// ─── 5-SCENE DENSITY ─────────────────────────────────────────────────────────
test('5-scene batch: exact count, non-empty image prompts, unique fingerprints', async () => {
  const h = createHarness({ topic: 'Kesirler', scenes: '5' });
  boot(h);
  await h.elements.get('btn-batch-generate').click();

  const scenes = getScenes(h.context);
  assert.equal(scenes.length, 5, 'must produce exactly 5 scenes');

  const fingerprints = new Set(scenes.map(s => s.semanticFingerprint));
  assert.equal(fingerprints.size, 5, '5 scenes must have 5 unique fingerprints');

  for (const s of scenes) {
    assert.ok(s.imagePrompt && s.imagePrompt.length > 30,
      `scene ${s.id} imagePrompt too short: "${s.imagePrompt?.slice(0, 40)}"`);
  }
});

// ─── 20-SCENE DENSITY ────────────────────────────────────────────────────────
test('20-scene batch: unique semantic prompts (no number-only diffs)', async () => {
  const h = createHarness({ topic: 'Fotosentez', scenes: '20' });
  boot(h);
  await h.elements.get('btn-batch-generate').click();

  const scenes = getScenes(h.context);
  assert.equal(scenes.length, 20, 'must produce exactly 20 scenes');

  const normalised = scenes.map(s => s.imagePrompt.replace(/\d+/g, '#'));
  assert.equal(new Set(normalised).size, 20, '20 prompts must differ semantically, not just numerically');

  const fps = scenes.map(s => s.semanticFingerprint);
  assert.equal(new Set(fps).size, 20, '20 unique fingerprints required');
});

// ─── 80-SCENE DENSITY ────────────────────────────────────────────────────────
test('80-scene batch: no crash, first ≠ last prompt', async () => {
  const h = createHarness({ topic: 'Canlılar ve Çevre', scenes: '80' });
  boot(h);
  await h.elements.get('btn-batch-generate').click();

  const scenes = getScenes(h.context);
  assert.equal(scenes.length, 80, 'must produce exactly 80 scenes');

  const first = scenes[0].imagePrompt.replace(/\d+/g, '#');
  const last  = scenes[79].imagePrompt.replace(/\d+/g, '#');
  assert.notEqual(first, last, 'scene 1 and scene 80 must be semantically different');
});

// ─── MOTION LOCKED WITHOUT IMAGE ─────────────────────────────────────────────
test('motion-without-image: fresh batch scenes have no motionPrompt (gate holds)', async () => {
  const h = createHarness({ topic: 'Newton Yasaları', scenes: '5' });
  boot(h);
  await h.elements.get('btn-batch-generate').click();

  const scenes = getScenes(h.context);
  for (const s of scenes) {
    assert.ok(!s.motionPrompt,
      `scene ${s.id} must not have motionPrompt before image approval`);
  }
});

test('motion UI button disabled until after batch generation', async () => {
  const h = createHarness({ scenes: '3' });
  boot(h);

  const motionHeader = h.elements.get('detail-motion-prompt').parentElement.header;
  assert.equal(motionHeader.children.length, 1, 'motion header must have 1 button');
  assert.equal(motionHeader.children[0].disabled, true, 'motion button must be disabled pre-batch');

  await h.elements.get('btn-batch-generate').click();
  assert.equal(motionHeader.children[0].disabled, true,
    'motion button must stay disabled after batch (needs image hash first)');
});

// ─── SOURCE BINDING ───────────────────────────────────────────────────────────
test('SOURCE-prefixed topic binds scenes to SOURCE_BOUND status', async () => {
  const topic = 'SOURCE:\nKesir bir bütünü eş parçalara ayırır.\nPay ve payda farklı görev taşır.\nEş kesirler aynı miktarı gösterebilir.';
  const h = createHarness({ topic, scenes: '3' });
  boot(h);
  await h.elements.get('btn-batch-generate').click();

  const scenes = getScenes(h.context);
  assert.deepEqual(
    scenes.map(s => s.sceneArchitecture.source.status),
    ['SOURCE_BOUND', 'SOURCE_BOUND', 'SOURCE_BOUND'],
    'all scenes must be SOURCE_BOUND for SOURCE: input'
  );
  assert.ok(scenes[1].imagePrompt.includes('source-002'),
    'scene 2 must reference source-002 in its prompt');
});

// ─── HANDOFF PACKET CONTRACT ──────────────────────────────────────────────────
test('handoffPackets: resolveCurrentVersion=true and draft.canonical=false on all roles', async () => {
  const h = createHarness({ scenes: '3' });
  boot(h);
  await h.elements.get('btn-batch-generate').click();

  const packets = vm.runInContext(
    'JSON.parse(JSON.stringify(STATE.scenes[0].handoffPackets))',
    h.context
  );

  assert.ok(Array.isArray(packets) && packets.length === 3,
    `expected 3 handoff packets (IMAGE/MOTION/SUNO), got ${packets?.length}`);

  for (const packet of packets) {
    assert.strictEqual(packet.resolveCurrentVersion, true,
      `${packet.role} packet must have resolveCurrentVersion=true (D6 anti-grounding contract)`);
    assert.strictEqual(packet.draft?.canonical, false,
      `${packet.role} packet draft must be explicitly canonical=false`);
  }
});

// ─── TABLE RENDER SANITY ──────────────────────────────────────────────────────
test('renderTable: rows have scene-row class, no literal <tr> in innerHTML', async () => {
  const rows = [];
  const h = createHarness({ scenes: '5' });

  // intercept createElement to capture tr elements
  const origCreate = h.context.document.createElement.bind(h.context.document);
  h.context.document.createElement = tag => {
    const el = origCreate(tag);
    if (tag === 'tr') rows.push(el);
    return el;
  };

  boot(h);
  await h.elements.get('btn-batch-generate').click();
  vm.runInContext('renderTable()', h.context);

  assert.ok(rows.length >= 5, `expected ≥5 rows, got ${rows.length}`);
  for (const row of rows) {
    assert.ok(row.className.includes('scene-row'),
      `row must have class scene-row, got "${row.className}"`);
    assert.ok(!/<\s*tr[\s>]/i.test(row.innerHTML || ''),
      'row innerHTML must not contain literal <tr>');
  }
});

// ─── APPLYAGENTRESULT GATE ────────────────────────────────────────────────────
test('applyAgentResult: MOTION packet with proof does not return MISSING_PROOF block', async () => {
  const h = createHarness({ scenes: '3' });
  boot(h);
  await h.elements.get('btn-batch-generate').click();

  const result = vm.runInContext(`
    (function() {
      const scene = STATE.scenes[0];
      return JSON.parse(JSON.stringify(applyAgentResult({
        packetId:    scene.packetId,
        projectId:   STATE.projectId,
        sceneId:     scene.id,
        role:        'MOTION',
        finalPrompt: 'slow pan across clay surface — 85mm, shallow DOF',
        proof:       'image hash abc123 confirmed by vision-AI',
        negatives:   [],
      })));
    })()
  `, h.context);

  const blocked = result.status === 'BLOCKED' && result.code === 'MISSING_PROOF';
  assert.ok(!blocked,
    `MOTION packet with valid proof should not be MISSING_PROOF blocked. Got: ${JSON.stringify(result)}`);
});
