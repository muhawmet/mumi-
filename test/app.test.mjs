import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL_REGISTRY = JSON.parse(readFileSync(path.join(ROOT, 'public/model-registry.json'), 'utf8'));
const MUSIC_REGISTRY = JSON.parse(readFileSync(path.join(ROOT, 'public/music-registry.json'), 'utf8'));

function readSelectGroups(html, selectId) {
  const selectMatch = html.match(new RegExp(`<select[^>]+id=["']${selectId}["'][^>]*>([\\s\\S]*?)<\\/select>`));
  assert.ok(selectMatch, `missing select ${selectId}`);
  const groups = {};
  for (const groupMatch of selectMatch[1].matchAll(/<optgroup\s+label="([^"]+)"[^>]*>([\s\S]*?)<\/optgroup>/g)) {
    groups[groupMatch[1]] = [...groupMatch[2].matchAll(/<option(?:\s+[^>]*)?>([^<]+)<\/option>/g)]
      .map(match => match[1].trim());
  }
  return groups;
}

class FakeClassList {
  constructor(initial = '') {
    this.values = new Set(initial.split(/\s+/).filter(Boolean));
  }

  add(...names) {
    names.forEach(name => this.values.add(name));
  }

  remove(...names) {
    names.forEach(name => this.values.delete(name));
  }

  contains(name) {
    return this.values.has(name);
  }
}

class FakeElement {
  constructor({ id = '', className = '', value = '', attributes = {}, provider = null } = {}) {
    this.id = id;
    this.className = className;
    this.classList = new FakeClassList(className);
    this.value = value;
    this.attributes = { ...attributes };
    this.children = [];
    this.dataset = {};
    this.style = {};
    this.innerHTML = '';
    this.innerText = '';
    this.onclick = null;
    this.onchange = null;
    this.listeners = new Map();
    this.parentElement = new FakeElementParent();
    this.selectedOptions = provider ? [{ parentElement: { label: provider } }] : [];
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  getAttribute(name) {
    return this.attributes[name] ?? null;
  }

  addEventListener(type, listener) {
    let arr = this.listeners.get(type) || [];
    arr.push(listener);
    this.listeners.set(type, arr);
  }

  dispatchEvent(event) {
    if (!event.target) event.target = this;
    const list = this.listeners.get(event.type) || [];
    list.forEach(listener => listener.call(this, event));
  }

  click() {
    if (typeof this.onclick === 'function') return this.onclick({ target: this });
    const list = this.listeners.get('click') || [];
    list.forEach(listener => listener.call(this, { target: this }));
    return undefined;
  }

  remove() {}
}

class FakeElementParent {
  constructor() {
    this.classList = new FakeClassList();
    this.header = {
      children: [],
      appendChild(child) {
        this.children.push(child);
        return child;
      }
    };
  }

  querySelector(selector) {
    return selector === '.prompt-header' ? this.header : null;
  }
}

function createBrowserHarness({ storage = new Map() } = {}) {
  const elements = new Map();
  const defaults = {
    'project-topic': { value: 'Kesirler' },
    'project-class': { value: 'Eğitim / Konu Anlatımı' },
    'project-scenes': { value: '3' },
    'image-model': { value: 'Nano Banana Pro', provider: 'GOOGLE' },
    'video-model': { value: '3.0', provider: 'KLING' }
  };

  const ids = [
    'cascade-world', 'cascade-prop', 'cascade-reference', 'cascade-palette', 'cascade-music',
    'btn-batch-generate', 'table-body', 'detail-cards-container', 'detail-empty-state', 'detail-title',
    'detail-image-prompt', 'detail-motion-prompt', 'detail-suno-prompt',
    'detail-vo-prompt', 'health-dot', 'health-text', 'btn-export-json',
    'btn-import-json', 'file-import-json', ...Object.keys(defaults)
  ];

  ids.forEach(id => elements.set(id, new FakeElement({ id, ...defaults[id] })));

  const charButtons = [
    new FakeElement({ className: 'char-btn active', attributes: { 'data-char': 'Aras' } }),
    new FakeElement({ className: 'char-btn', attributes: { 'data-char': 'Defne' } })
  ];
  const claudeButton = new FakeElement({ className: 'copy-claude-btn' });
  const listeners = new Map();

  const document = {
    body: new FakeElement(),
    createElement: () => new FakeElement(),
    getElementById: id => elements.get(id) ?? null,
    querySelector: selector => selector === '.copy-claude-btn' ? claudeButton : null,
    querySelectorAll: selector => selector === '.char-btn' ? charButtons : [],
    addEventListener: (type, listener) => listeners.set(type, listener)
  };

  const context = {
    alert: () => {},
    console,
    document,
    fetch: async url => url === '/model-registry.json'
      ? { ok: true, json: async () => MODEL_REGISTRY }
      : url === '/music-registry.json'
        ? { ok: true, json: async () => MUSIC_REGISTRY }
        : { ok: true, json: async () => ({ status: 'ok' }) },
    FileReader: class {},
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value)
    },
    navigator: { clipboard: { writeText: async () => {} } },
    open: () => null,
    setTimeout,
    window: {},
    location: { origin: 'http://localhost' },
    Event: class Event { constructor(type) { this.type = type; } },
    MASTER_REFERENCES: [{ id: 'arcane', category: 'animation', name: 'Arcane', worldId: 'arcane_painterly', dna: { mood: 'dark', linework: 'painterly' } }]
  };
  context.window = context;

  return { context: vm.createContext(context), elements, listeners, claudeButton, charButtons, storage };
}

test('JavaScript sources pass Node syntax checks', () => {
  for (const file of [
    'public/ab-tester.js',
    'public/api.js',
    'public/app.js',
    'public/audio-engine.js',
    'public/brain.js',
    'public/brief-generator.js',
    'public/pacing-graph.js',
    'public/references.js',
    'public/timeline-exporter.js',
    'server.js'
  ]) {
    assert.doesNotThrow(() => execFileSync(process.execPath, ['--check', file], {
      cwd: ROOT,
      stdio: 'pipe'
    }), `${file} must parse`);
  }
});

test('app starts and renders its initial DOM without throwing', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();

  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  assert.equal(typeof harness.listeners.get('DOMContentLoaded'), 'function');
  assert.doesNotThrow(() => harness.listeners.get('DOMContentLoaded')());

  assert.ok(harness.elements.get('cascade-reference').children.length > 0);
  await Promise.resolve();
});

test('primary generation and JSON controls receive event bindings', () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();

  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  harness.listeners.get('DOMContentLoaded')();

  assert.equal(typeof harness.elements.get('btn-batch-generate').onclick, 'function');
  assert.equal(harness.elements.get('btn-batch-generate').dataset.actionBound, 'true');
  assert.equal(typeof harness.elements.get('btn-export-json').onclick, 'function');
  assert.equal(harness.elements.get('btn-export-json').dataset.actionBound, 'true');
  assert.equal(typeof harness.elements.get('btn-import-json').onclick, 'function');
  assert.equal(harness.elements.get('btn-import-json').dataset.actionBound, 'true');
  assert.equal(typeof harness.elements.get('file-import-json').onchange, 'function');
});

test('batch renders valid scene table rows with the expected class', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();

  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  harness.listeners.get('DOMContentLoaded')();
  await harness.elements.get('btn-batch-generate').click();

  const rows = harness.elements.get('table-body').children;
  assert.equal(rows.length, 3);
  assert.ok(rows.every(row => row.className.split(/\s+/).includes('scene-row')));
  assert.ok(rows.every(row => !row.innerHTML.includes('< td') && typeof row.innerHTML === 'string'));
});

test('20-scene batch has zero semantic prompt duplicates', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();
  harness.elements.get('project-scenes').value = '20';

  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  harness.listeners.get('DOMContentLoaded')();
  await harness.elements.get('btn-batch-generate').click();

  const scenes = vm.runInContext(`STATE.scenes.map(scene => ({
    prompt: scene.imagePrompt,
    fingerprint: scene.semanticFingerprint
  }))`, harness.context);
  const promptsWithoutNumbers = scenes.map(scene => scene.prompt.replace(/\d+/g, '#'));

  assert.equal(scenes.length, 20);
  assert.equal(new Set(scenes.map(scene => scene.prompt)).size, 20);
  assert.equal(new Set(promptsWithoutNumbers).size, 20, 'difference must be semantic, not scene numbering');
  assert.equal(new Set(scenes.map(scene => scene.fingerprint)).size, 20);
  assert.ok(scenes.every(scene => scene.prompt.includes('Project topic: Kesirler')));
});

test('scene architecture carries source status, beat, subject, and one event', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();

  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  harness.listeners.get('DOMContentLoaded')();
  await harness.elements.get('btn-batch-generate').click();

  const scenes = JSON.parse(JSON.stringify(vm.runInContext('STATE.scenes', harness.context)));
  assert.equal(scenes.length, 3);
  for (const scene of scenes) {
    assert.equal(scene.sceneArchitecture.source.status, 'UNSOURCED_TOPIC_INPUT');
    assert.equal(scene.sceneArchitecture.source.sourceId, null);
    assert.match(scene.sceneArchitecture.source.notice, /^UNSOURCED:/);
    assert.equal(typeof scene.sceneArchitecture.beat, 'string');
    assert.ok(scene.sceneArchitecture.beat.length > 0);
    assert.equal(typeof scene.sceneArchitecture.dominantSubject, 'string');
    assert.ok(scene.sceneArchitecture.dominantSubject.includes('Kesirler'));
    assert.equal(typeof scene.sceneArchitecture.event, 'string');
    assert.ok(scene.sceneArchitecture.event.length > 0);
    assert.match(scene.imagePrompt, /Source status: UNSOURCED_TOPIC_INPUT/);
  }
});

test('SOURCE-prefixed input binds exact source beats to scene dossiers', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();
  harness.elements.get('project-topic').value = 'SOURCE:\nKesir bir bütünü eş parçalara ayırır.\nPay ve payda farklı görev taşır.\nEş kesirler aynı miktarı gösterebilir.';

  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  harness.listeners.get('DOMContentLoaded')();
  await harness.elements.get('btn-batch-generate').click();

  const scenes = JSON.parse(JSON.stringify(vm.runInContext('STATE.scenes', harness.context)));
  assert.deepEqual(
    scenes.map(scene => scene.sceneArchitecture.source.status),
    ['SOURCE_BOUND', 'SOURCE_BOUND', 'SOURCE_BOUND']
  );
  assert.deepEqual(
    scenes.map(scene => scene.sceneArchitecture.source.sourceId),
    ['source-001', 'source-002', 'source-003']
  );
  assert.equal(scenes[0].sceneArchitecture.source.exactText, 'Kesir bir bütünü eş parçalara ayırır.');
  assert.equal(scenes[1].sceneArchitecture.source.exactText, 'Pay ve payda farklı görev taşır.');
  assert.equal(scenes[2].sceneArchitecture.source.exactText, 'Eş kesirler aynı miktarı gösterebilir.');
  assert.ok(scenes[0].imagePrompt.includes('source-001 — Kesir bir bütünü eş parçalara ayırır.'));
  assert.ok(scenes[1].imagePrompt.includes('source-002 — Pay ve payda farklı görev taşır.'));
  assert.ok(scenes[2].imagePrompt.includes('source-003 — Eş kesirler aynı miktarı gösterebilir.'));
});

test('Claude and motion actions are bound or explicitly disabled', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();

  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  harness.listeners.get('DOMContentLoaded')();

  assert.equal(harness.claudeButton.disabled, true);
  assert.equal(harness.claudeButton.onclick, null);

  const motionHeader = harness.elements.get('detail-motion-prompt').parentElement.header;
  assert.equal(motionHeader.children.length, 1);
  assert.equal(typeof motionHeader.children[0].onclick, 'function');
  assert.equal(motionHeader.children[0].dataset.actionBound, 'true');
  assert.equal(motionHeader.children[0].disabled, true);

  await harness.elements.get('btn-batch-generate').click();
  assert.equal(harness.claudeButton.disabled, false);
  assert.equal(typeof harness.claudeButton.onclick, 'function');
  assert.equal(harness.claudeButton.dataset.actionBound, 'true');
  assert.equal(motionHeader.children[0].disabled, true);
});

test('model registry passes approved targets to agents without claiming version grounding', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const grounded = createBrowserHarness();
  vm.runInContext(brainSrc, grounded.context, { filename: 'public/brain.js' });
  vm.runInContext(source, grounded.context, { filename: 'public/app.js' });
  grounded.listeners.get('DOMContentLoaded')();
  const generated = await grounded.elements.get('btn-batch-generate').click();

  assert.equal(generated.status, 'GENERATED');
  const groundedState = JSON.parse(JSON.stringify(vm.runInContext('STATE.modelGrounding', grounded.context)));
  assert.equal(groundedState.status, 'TARGETS_REGISTERED_AGENT_VERSION_REQUIRED');
  assert.equal(groundedState.resolveCurrentVersion, true);
  assert.equal(groundedState.image.status, 'TARGET_REGISTERED');
  assert.equal(groundedState.image.resolveCurrentVersion, true);
  assert.equal(groundedState.image.registryVersion, MODEL_REGISTRY.registryVersion);
  assert.equal(groundedState.image.registryRole, 'ADVISORY_TARGET_CATALOG');
  assert.equal(groundedState.image.targetModel.provider, 'GOOGLE');
  assert.equal(groundedState.image.targetModel.label, 'Nano Banana Pro');
  assert.equal(Object.hasOwn(groundedState.image.targetModel, 'version'), false);

  const unknown = createBrowserHarness();
  unknown.elements.get('image-model').value = 'Imagined 99';
  vm.runInContext(brainSrc, unknown.context, { filename: 'public/brain.js' });
  vm.runInContext(source, unknown.context, { filename: 'public/app.js' });
  unknown.listeners.get('DOMContentLoaded')();
  const blocked = await unknown.elements.get('btn-batch-generate').click();

  assert.equal(blocked.status, 'BLOCKED');
  assert.equal(blocked.code, 'MODEL_TARGET_UNREGISTERED');
  assert.equal(vm.runInContext('STATE.scenes.length', unknown.context), 0);
});

test('model registry advertises an immutable, advisory-only catalog shape', () => {
  assert.equal(MODEL_REGISTRY.role, 'ADVISORY_TARGET_CATALOG');
  assert.ok(MODEL_REGISTRY.registryVersion);
  for (const bucket of ['image', 'video']) {
    assert.ok(MODEL_REGISTRY[bucket], `${bucket} bucket present`);
    for (const [provider, labels] of Object.entries(MODEL_REGISTRY[bucket])) {
      assert.ok(Array.isArray(labels) && labels.length > 0, `${bucket}.${provider} has at least one label`);
      labels.forEach((l) => assert.equal(typeof l, 'string', `${bucket}.${provider} label is string`));
    }
  }
});

test('Final Brief hierarchy keeps Reference DNA subordinate to world and recipe', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();
  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  harness.listeners.get('DOMContentLoaded')();

  vm.runInContext(`selectReference('arcane')`, harness.context);
  await harness.elements.get('btn-batch-generate').click();
  const scene = JSON.parse(JSON.stringify(vm.runInContext('STATE.scenes[0]', harness.context)));

  assert.deepEqual(scene.finalBrief.authority, ['SOURCE', 'WORLD', 'RECIPE', 'REFERENCE_DNA', 'PALETTE_ACCENT']);
  assert.equal(scene.finalBrief.world.id, 'arcane_painterly');
  assert.equal(scene.finalBrief.recipe.id, 'world-native');
  assert.equal(scene.finalBrief.referenceDNA.status, 'ACTIVE_SUBORDINATE');
  assert.deepEqual(scene.finalBrief.referenceDNA.suppressedFields, ['palette', 'texture', 'lighting']);
  assert.ok(scene.imagePrompt.indexOf(scene.finalBrief.world.renderRecipe) < scene.imagePrompt.indexOf('Teaching recipe:'));
  assert.ok(scene.imagePrompt.indexOf('Teaching recipe:') < scene.imagePrompt.indexOf('Reference DNA (subordinate):'));
  assert.ok(scene.imagePrompt.indexOf('Reference DNA (subordinate):') < scene.imagePrompt.indexOf('Palette accent:'));

  const mismatch = JSON.parse(JSON.stringify(vm.runInContext(`
    buildFinalBriefContext(createSceneArchitecture('Kesirler', 1, BRAIN.worlds.find(world => world.id === 'paper_diorama')), BRAIN.worlds.find(world => world.id === 'paper_diorama'), 'arcane', 'ANIMATION_EDU')
  `, harness.context)));
  assert.equal(mismatch.referenceDNA.status, 'SUPPRESSED_WORLD_MISMATCH');
  assert.deepEqual(mismatch.referenceDNA.directives, {});
});

test('D6 handoff envelopes are source-bound, locked, and explicitly non-canonical drafts', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();
  harness.elements.get('project-topic').value = 'SOURCE: Kesir bir bütünün eş parçalarını gösterir.\nPay üstte, payda altta yer alır.';
  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  harness.listeners.get('DOMContentLoaded')();
  await harness.elements.get('btn-batch-generate').click();

  const scene = JSON.parse(JSON.stringify(vm.runInContext('STATE.scenes[0]', harness.context)));
  assert.equal(scene.handoffPackets.length, 3);
  assert.deepEqual(scene.handoffPackets.map(packet => packet.role), ['IMAGE', 'MOTION', 'SUNO']);
  for (const packet of scene.handoffPackets) {
    assert.equal(packet.packetVersion, '1.0.0');
    assert.match(packet.projectId, /^scene-[0-9a-f]{8}$/);
    assert.match(packet.sourceHash, /^scene-[0-9a-f]{8}$/);
    assert.equal(packet.scene.sourceId, 'source-001');
    assert.equal(packet.scene.exactSourceBeat, 'Kesir bir bütünün eş parçalarını gösterir.');
    assert.ok(packet.scene.intent);
    assert.ok(packet.scene.dominantSubject);
    assert.ok(packet.scene.event);
    assert.equal(packet.scene.continuity.characterLock, 'Aras');
    assert.equal(packet.world.id, 'arcane_painterly');
    assert.match(packet.world.camera, /\b(35|50|85)mm\b/);
    assert.equal(packet.locks.visibleText, 'NO_UNSOURCED_VISIBLE_TEXT');
    assert.equal(packet.resolveCurrentVersion, true);
    assert.equal(Object.hasOwn(packet.targetModel, 'version'), false);
    assert.equal(packet.registryHint.claim, packet.role === 'SUNO'
      ? 'MUSIC_STYLE_ONLY_NOT_MODEL_VERSION_GROUNDING'
      : 'TARGET_ONLY_NOT_VERSION_GROUNDING');
    assert.equal(packet.draft.canonical, false);
    assert.ok(Array.isArray(packet.negatives.global));
    assert.ok(Array.isArray(packet.negatives.world));
    assert.ok(Array.isArray(packet.negatives.perScene));
    assert.ok(Array.isArray(packet.warnings));
  }
  assert.equal(scene.canonicalPrompt, '');
  assert.ok(scene.draftPrompt);
});

test('scene pack export-import-export round-trip is lossless', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();
  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  harness.listeners.get('DOMContentLoaded')();
  await harness.elements.get('btn-batch-generate').click();

  const first = JSON.parse(JSON.stringify(vm.runInContext('createScenePack()', harness.context)));
  first.externalRoot = { keep: true, revision: 7 };
  first.scenes[0].externalSceneField = { vendor: 'vision-ai', confidence: 0.91 };
  first.scenes[0].motionPrompt = 'Camera locked. One fraction tile moves into place and holds.';
  first.scenes[0].negatives = ['morphing', 'extra tile'];
  first.scenes[1].negatives = ['text drift'];

  const serialized = JSON.stringify(first);
  const result = JSON.parse(JSON.stringify(vm.runInContext(`applyScenePack(${serialized})`, harness.context)));
  const second = JSON.parse(JSON.stringify(vm.runInContext('createScenePack()', harness.context)));

  assert.equal(result.status, 'IMPORTED');
  assert.equal(result.updated, 3);
  assert.deepEqual(second.externalRoot, first.externalRoot);
  assert.deepEqual(second.scenes[0].externalSceneField, first.scenes[0].externalSceneField);
  assert.equal(second.scenes[0].motionPrompt, first.scenes[0].motionPrompt);
  assert.deepEqual(second.scenes[0].negatives, first.scenes[0].negatives);
  assert.deepEqual(second.scenes[1].negatives, first.scenes[1].negatives);
  assert.deepEqual(second.handoffPackets.map(packet => packet.packetId), first.handoffPackets.map(packet => packet.packetId));
  assert.deepEqual(second.scenes[0].handoffPackets[0].negatives.perScene, first.scenes[0].negatives);
  assert.deepEqual(second.scenes[1].handoffPackets[0].negatives.perScene, first.scenes[1].negatives);
  assert.equal(second.scenes[0].sceneArchitecture.source.status, 'UNSOURCED_TOPIC_INPUT');
  assert.equal(second.scenes.length, first.scenes.length);
});

test('agent JSON return fills canonical role fields, proof, negatives, and unlocks motion losslessly', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();
  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  harness.listeners.get('DOMContentLoaded')();
  await harness.elements.get('btn-batch-generate').click();

  const packets = JSON.parse(JSON.stringify(vm.runInContext('STATE.scenes[0].handoffPackets', harness.context)));
  const imagePacket = packets.find(packet => packet.role === 'IMAGE');
  const motionPacket = packets.find(packet => packet.role === 'MOTION');
  const sunoPacket = packets.find(packet => packet.role === 'SUNO');
  const agentReturn = {
    contract: 'MAMILAS_D6_AGENT_RETURN',
    externalReceipt: { preserve: true, vendor: 'custom-gpt' },
    agentResults: [
      {
        packetId: imagePacket.packetId,
        projectId: imagePacket.projectId,
        sceneId: 1,
        role: 'IMAGE',
        finalPrompt: 'Canonical image prompt grounded live by the receiving agent.',
        perSceneNegatives: ['duplicate subject', 'text drift'],
        proof: { status: 'PASS', modelResolved: 'live-agent-value' },
        externalAgentField: { keep: 9 }
      },
      {
        packetId: motionPacket.packetId,
        projectId: motionPacket.projectId,
        sceneId: 1,
        role: 'MOTION',
        output: { finalPrompt: 'Locked 35mm camera; one tile moves, settles, and holds.' },
        perSceneNegatives: ['morphing'],
        proof: { status: 'PASS', approvedImageChecked: true }
      },
      {
        packetId: sunoPacket.packetId,
        projectId: sunoPacket.projectId,
        sceneId: 1,
        role: 'SUNO',
        finalPrompt: 'Canonical SUNO prompt grounded live by the receiving agent.'
      }
    ]
  };
  const result = JSON.parse(JSON.stringify(vm.runInContext(`applyScenePack(${JSON.stringify(agentReturn)})`, harness.context)));
  const scene = JSON.parse(JSON.stringify(vm.runInContext('STATE.scenes[0]', harness.context)));
  const exported = JSON.parse(JSON.stringify(vm.runInContext('createScenePack()', harness.context)));

  assert.equal(result.status, 'IMPORTED');
  assert.equal(result.updated, 3);
  assert.equal(scene.canonicalPrompt, agentReturn.agentResults[0].finalPrompt);
  assert.equal(scene.imagePrompt, agentReturn.agentResults[0].finalPrompt);
  assert.equal(scene.motionPrompt, agentReturn.agentResults[1].output.finalPrompt);
  assert.equal(scene.canonicalSunoPrompt, agentReturn.agentResults[2].finalPrompt);
  assert.equal(scene.imageStatus, 'done');
  assert.equal(scene.videoStatus, 'done');
  assert.deepEqual(scene.perSceneNegatives, ['morphing']);
  assert.deepEqual(scene.proof, agentReturn.agentResults[1].proof);
  assert.ok(scene.draftPrompt);
  assert.deepEqual(exported.externalReceipt, agentReturn.externalReceipt);
  assert.deepEqual(exported.agentResults, agentReturn.agentResults);
  assert.deepEqual(exported.scenes[0].agentResults.IMAGE.externalAgentField, { keep: 9 });
});

test('agent return rejects packet mismatches without changing canonical fields', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();
  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  harness.listeners.get('DOMContentLoaded')();
  await harness.elements.get('btn-batch-generate').click();
  const result = JSON.parse(JSON.stringify(vm.runInContext(`applyScenePack({
    role: 'IMAGE', sceneId: 1, packetId: 'wrong-packet', finalPrompt: 'Must not apply'
  })`, harness.context)));

  assert.equal(result.status, 'IMPORTED_WITH_BLOCKS');
  assert.equal(result.results[0].code, 'PACKET_ID_MISMATCH');
  assert.equal(vm.runInContext('STATE.scenes[0].canonicalPrompt', harness.context), '');
});

test('full project controls and selection survive reload', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const storage = new Map();
  const first = createBrowserHarness({ storage });
  first.elements.get('project-topic').value = 'Kesirler ve oranlar';
  first.elements.get('project-class').value = 'Tasarım İşi';
  first.elements.get('project-scenes').value = '20';
  first.elements.get('image-model').value = 'Imagen 4';
  first.elements.get('video-model').value = '3.0 Omni';

  vm.runInContext(brainSrc, first.context, { filename: 'public/brain.js' });
  vm.runInContext(source, first.context, { filename: 'public/app.js' });
  first.listeners.get('DOMContentLoaded')();
  vm.runInContext(`selectReference('arcane')`, first.context);
  first.charButtons[1].click();
  await first.elements.get('btn-batch-generate').click();
  vm.runInContext('STATE.selectedSceneId = 2; saveState()', first.context);

  const second = createBrowserHarness({ storage });
  vm.runInContext(brainSrc, second.context, { filename: 'public/brain.js' });
  vm.runInContext(source, second.context, { filename: 'public/app.js' });
  second.listeners.get('DOMContentLoaded')();

  assert.equal(second.elements.get('project-topic').value, 'Kesirler ve oranlar');
  assert.equal(second.elements.get('project-class').value, 'Tasarım İşi');
  assert.equal(second.elements.get('project-scenes').value, '20');
  assert.equal(second.elements.get('image-model').value, 'Imagen 4');
  assert.equal(second.elements.get('video-model').value, '3.0 Omni');
  const restored = JSON.parse(JSON.stringify(vm.runInContext(`({
    selectedWorldId: STATE.selectedWorldId,
    selectedRefId: STATE.selectedRefId,
    character: STATE.character,
    selectedSceneId: STATE.selectedSceneId,
    sceneCount: STATE.scenes.length
  })`, second.context)));
  assert.deepEqual(restored, {
    selectedWorldId: 'arcane_painterly',
    selectedRefId: 'arcane',
    character: 'Defne',
    selectedSceneId: 2,
    sceneCount: 20
  });
});

test('camera is scene-specific lens language and never legacy motion/composition text', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();
  harness.elements.get('project-scenes').value = '20';
  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  harness.listeners.get('DOMContentLoaded')();
  await harness.elements.get('btn-batch-generate').click();

  const cameras = JSON.parse(JSON.stringify(vm.runInContext('STATE.scenes.map(scene => scene.sceneArchitecture.imageVantage)', harness.context)));
  assert.equal(cameras.length, 20);
  assert.ok(cameras.every(camera => /\b(35|50|85)mm\b/.test(camera)));
  assert.ok(cameras.every(camera => !/push|dolly|drift|slide|snap/i.test(camera)));
  assert.equal(vm.runInContext(`BRAIN.worlds.some(world => Object.hasOwn(world, 'camera'))`, harness.context), false);
});

test('authority and photoreal-versus-clay contradiction gate are deterministic', () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();
  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  const gate = JSON.parse(JSON.stringify(vm.runInContext(`validateBriefCompatibility({
    path: 'ULTRAREAL_COMMERCIAL',
    world: BRAIN.worlds.find(world => world.id === 'clay_diorama'),
    recipe: { id: 'clay' }
  })`, harness.context)));

  assert.equal(gate.status, 'BLOCKED');
  assert.deepEqual(gate.authority, ['SOURCE', 'WORLD', 'RECIPE', 'REFERENCE_DNA', 'PALETTE_ACCENT']);
  assert.deepEqual(gate.findings.map(finding => finding.code), ['REGISTER_CONTAMINATION', 'WORLD_PATH_MISMATCH']);
});

test('music briefs carry knowledge provenance or explicit BLOCKED status', async () => {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const source = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const harness = createBrowserHarness();
  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(source, harness.context, { filename: 'public/app.js' });
  harness.listeners.get('DOMContentLoaded')();
  await harness.elements.get('btn-batch-generate').click();
  const grounded = JSON.parse(JSON.stringify(vm.runInContext('STATE.scenes[0]', harness.context)));

  assert.equal(grounded.musicGrounding.status, 'GROUNDED');
  assert.equal(grounded.musicGrounding.sourceRef, 'brain/04_SUNO.md:100');
  assert.match(grounded.sunoBrief, /^\[MUSIC SOURCE: brain\/04_SUNO\.md:100;/);
  assert.match(grounded.sunoBrief, /Intro/);

  const blocked = JSON.parse(JSON.stringify(vm.runInContext(`resolveMusicMapping(MUSIC_REGISTRY, 'arcane_edu')`, harness.context)));
  assert.equal(blocked.status, 'BLOCKED');
  assert.equal(blocked.code, 'MUSIC_MAPPING_UNGROUNDED');
  assert.match(vm.runInContext(`buildSunoBrief(1, 3, resolveMusicMapping(MUSIC_REGISTRY, 'arcane_edu'))`, harness.context), /^BLOCKED: MUSIC_MAPPING_UNGROUNDED/);
});

test('every grounded music mapping exists verbatim at its declared knowledge line', () => {
  const lines = readFileSync(path.join(ROOT, 'brain/04_SUNO.md'), 'utf8').split('\n');
  for (const [worldId, mapping] of Object.entries(MUSIC_REGISTRY.mappings)) {
    const lineNumber = Number(mapping.sourceRef.split(':').at(-1));
    assert.ok(Number.isInteger(lineNumber) && lineNumber > 0, `${worldId} has invalid sourceRef`);
    assert.ok(lines[lineNumber - 1].includes(mapping.text), `${worldId} is not grounded at ${mapping.sourceRef}`);
  }
});

test('server advertises an exact URL, PID, version, and health identity', async t => {
  const serverModule = await import(path.join(ROOT, 'server.js'));
  const server = serverModule.default.startServer({ host: '127.0.0.1', port: 0 });
  t.after(() => server.close());
  await once(server, 'listening');

  const { port } = server.address();
  const response = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/api/health`, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    }).on('error', reject);
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), {
    status: 'ok',
    app: 'mamilas-new',
    version: '1.0.0',
    pid: process.pid
  });
});
