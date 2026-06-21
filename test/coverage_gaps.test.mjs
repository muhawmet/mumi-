import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL_REGISTRY = JSON.parse(readFileSync(path.join(ROOT, 'public/model-registry.json'), 'utf8'));
const MUSIC_REGISTRY = JSON.parse(readFileSync(path.join(ROOT, 'public/music-registry.json'), 'utf8'));

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
  toggle(name) {
    if (this.values.has(name)) {
      this.values.delete(name);
      return false;
    } else {
      this.values.add(name);
      return true;
    }
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
    this._innerHTML = '';
    this.innerText = '';
    this.onclick = null;
    this.onchange = null;
    this.listeners = new Map();
    this.parentElement = new FakeElementParent();
    this.selectedOptions = provider ? [{ parentElement: { label: provider } }] : [];
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(val) {
    this._innerHTML = val;
    if (!val) {
      this.children = [];
    }
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
    }
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

  closest(selector) {
    const match = (el) => {
      if (!el) return false;
      if (selector.startsWith('#')) return el.id === selector.slice(1);
      if (selector.startsWith('.')) return el.classList.contains(selector.slice(1));
      return false;
    };
    let current = this;
    while (current) {
      if (match(current)) return current;
      current = current.parentElement;
    }
    return null;
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
      },
      querySelector() {
        return null;
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
    'btn-import-json', 'file-import-json', 'btn-api-save', 'btn-export-xml', 'btn-ab-test',
    'btn-sound-toggle', 'btn-focus-toggle', 'slider-val-display', 'batch-btn-count',
    'cinematic-loader', 'btn-master-brief', 'pacing-graph', ...Object.keys(defaults)
  ];

  ids.forEach(id => elements.set(id, new FakeElement({ id, ...defaults[id] })));

  const charButtons = [
    new FakeElement({ className: 'char-btn active', attributes: { 'data-char': 'Aras' } }),
    new FakeElement({ className: 'char-btn', attributes: { 'data-char': 'Defne' } })
  ];
  const claudeButton = new FakeElement({ className: 'copy-claude-btn' });
  const listeners = new Map();
  const body = new FakeElement();

  const document = {
    body,
    createElement: () => new FakeElement(),
    getElementById: id => elements.get(id) ?? null,
    querySelector: selector => selector === '.copy-claude-btn' ? claudeButton : null,
    querySelectorAll: selector => selector === '.char-btn' ? charButtons : [],
    addEventListener: (type, listener) => {
      let arr = listeners.get(type) || [];
      arr.push(listener);
      listeners.set(type, arr);
    }
  };

  const alerts = [];
  const toasts = [];
  const contextListeners = new Map();
  const context = {
    alert: (msg) => { alerts.push(msg); },
    showToast: (msg, type) => { toasts.push({ msg, type }); },
    toasts,
    console,
    document,
    fetch: async url => {
      if (context.fetchShouldFail) {
        throw new Error('Network Connection Error');
      }
      return url === '/model-registry.json'
        ? { ok: true, json: async () => MODEL_REGISTRY }
        : url === '/music-registry.json'
          ? { ok: true, json: async () => MUSIC_REGISTRY }
          : { ok: true, json: async () => ({ status: 'ok' }) };
    },
    FileReader: class {
      readAsText(file) {
        const event = { target: { result: file.contents } };
        if (typeof this.onload === 'function') {
          this.onload(event);
        }
      }
    },
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value)
    },
    navigator: {
      clipboard: {
        writeText: async (text) => {
          context.clipboardContent = text;
        }
      }
    },
    clipboardContent: '',
    open: () => null,
    setTimeout,
    window: {},
    location: { origin: 'http://localhost' },
    parent: null,
    Event: class Event { constructor(type) { this.type = type; } },
    addEventListener: (type, listener) => {
      let arr = contextListeners.get(type) || [];
      arr.push(listener);
      contextListeners.set(type, arr);
    },
    dispatchEvent: (event) => {
      event.target = context;
      const list = contextListeners.get(event.type) || [];
      list.forEach(listener => listener(event));
    },
    MASTER_REFERENCES: [
      { id: 'arcane', category: 'animation', name: 'Arcane', worldId: 'arcane_painterly', dna: { mood: 'dark', linework: 'painterly' } },
      { id: 'ref_anime_demon_slayer_sun', name: 'Demon Slayer - Sun Breathing', category: 'anime', autoPalette: 'vibrant_crimson_gold', autoMusic: 'epic_orchestral' }
    ],
    // Mocks for exportTimelineXML and Blob dependencies
    Blob: class FakeBlob {
      constructor(content, options) {
        this.content = content;
        this.options = options;
      }
    },
    URL: {
      createObjectURL: (blob) => `blob:mock-url-${Math.random()}`,
      revokeObjectURL: () => {}
    },
    // Spies/Stubs for globals
    saveProjectToDisk: async (state) => {
      context.saveProjectToDiskCalls.push(state);
      if (context.saveShouldFail) {
        throw new Error("Save Error");
      }
    },
    saveProjectToDiskCalls: [],
    saveShouldFail: false,
    fetchShouldFail: false,
    alerts
  };
  context.window = context;
  context.parent = context; // default same origin, matching window

  return { context: vm.createContext(context), elements, listeners, claudeButton, charButtons, storage, alerts, toasts, contextListeners, body };
}

function boot(harness) {
  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';
  const appSrc = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
  const abTesterSrc = readFileSync(path.join(ROOT, 'public/ab-tester.js'), 'utf8');
  const exporterSrc = readFileSync(path.join(ROOT, 'public/timeline-exporter.js'), 'utf8');

  vm.runInContext(brainSrc, harness.context, { filename: 'public/brain.js' });
  vm.runInContext(appSrc, harness.context, { filename: 'public/app.js' });
  harness.context.showToast = (msg, type) => { harness.toasts.push({ msg, type }); };
  harness.context.window.showToast = harness.context.showToast;
  vm.runInContext(abTesterSrc, harness.context, { filename: 'public/ab-tester.js' });
  vm.runInContext(exporterSrc, harness.context, { filename: 'public/timeline-exporter.js' });

  const domListeners = harness.listeners.get('DOMContentLoaded') || [];
  domListeners.forEach(listener => listener());
}

// ─── TEST CASES ──────────────────────────────────────────────────────────────

test('Cascade UI auto-locks autoPalette and autoMusic when changing cascade-reference', () => {
  const h = createBrowserHarness();
  boot(h);

  const cascadeRef = h.elements.get('cascade-reference');
  const cascadePalette = h.elements.get('cascade-palette');
  const cascadeMusic = h.elements.get('cascade-music');

  cascadeRef.value = 'ref_anime_demon_slayer_sun';
  cascadeRef.dispatchEvent(new h.context.Event('change'));

  assert.equal(cascadePalette.value, 'vibrant_crimson_gold');
  assert.equal(cascadeMusic.value, 'epic_orchestral');
  assert.equal(vm.runInContext('STATE.selectedRefId', h.context), 'ref_anime_demon_slayer_sun');
});

test('buildVoiceOver correctly returns design defaults when project-class is Tasarım İşi', async () => {
  const h = createBrowserHarness();
  boot(h);

  h.elements.get('project-class').value = 'Tasarım İşi';
  h.elements.get('project-topic').value = 'Yeni Tasarım Projesi';

  await h.elements.get('btn-batch-generate').click();
  const scenes = vm.runInContext('STATE.scenes', h.context);
  assert.ok(scenes[0].voiceOver.includes('Introduce Yeni Tasarım Projesi visually.'));
});

test('btn-sound-toggle and btn-focus-toggle event listeners correctly update state and classes', () => {
  const h = createBrowserHarness();
  boot(h);

  const btnSound = h.elements.get('btn-sound-toggle');
  const btnFocus = h.elements.get('btn-focus-toggle');

  // Verify sound toggle sets global boolean
  assert.equal(h.context.isSoundOn, true);
  btnSound.click();
  assert.equal(h.context.isSoundOn, false);
  btnSound.click();
  assert.equal(h.context.isSoundOn, true);

  // Verify focus toggle adds focus-mode class to body
  assert.equal(h.body.classList.contains('focus-mode'), false);
  btnFocus.click();
  assert.equal(h.body.classList.contains('focus-mode'), true);
  btnFocus.click();
  assert.equal(h.body.classList.contains('focus-mode'), false);
});

test('loadModelRegistry failure error flow in generateBatch sets modelGrounding to PROMPT_REGISTRY_UNAVAILABLE', async () => {
  const h = createBrowserHarness();
  h.context.fetchShouldFail = true;
  boot(h);

  const result = await h.elements.get('btn-batch-generate').click();
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.code, 'PROMPT_REGISTRY_UNAVAILABLE');
  assert.equal(vm.runInContext('STATE.modelGrounding.status', h.context), 'BLOCKED');
  assert.equal(vm.runInContext('STATE.modelGrounding.code', h.context), 'PROMPT_REGISTRY_UNAVAILABLE');
});

test('btn-api-save successfully saves project to disk via saveProjectToDisk', async () => {
  const h = createBrowserHarness();
  boot(h);

  const btnApiSave = h.elements.get('btn-api-save');
  await h.elements.get('btn-batch-generate').click(); // populate scenes and state

  assert.equal(h.context.saveProjectToDiskCalls.length, 0);
  assert.equal(h.alerts.length, 0);

  // Click the save button and wait for the click listener promise to resolve
  // To test async click handlers, we can wait a little
  await btnApiSave.click();
  await new Promise(resolve => setTimeout(resolve, 10));

  assert.equal(h.context.saveProjectToDiskCalls.length, 1);
  assert.equal(h.context.saveProjectToDiskCalls[0].version, '1.0.0');
  const successToast = h.toasts.find(t => t.type === 'success' && /kaydedildi/i.test(t.msg));
  assert.ok(successToast, 'expected success toast about save');
});

test('btn-api-save failure flow surfaces error toast', async () => {
  const h = createBrowserHarness();
  boot(h);

  h.context.saveShouldFail = true;
  const btnApiSave = h.elements.get('btn-api-save');
  await h.elements.get('btn-batch-generate').click();

  await btnApiSave.click();
  await new Promise(resolve => setTimeout(resolve, 10));

  assert.equal(h.context.saveProjectToDiskCalls.length, 1);
  const errorToast = h.toasts.find(t => t.type === 'error' && /kaydedilemedi/i.test(t.msg));
  assert.ok(errorToast, 'expected error toast about save failure');
});

test('btn-export-xml clicks and runs exportTimelineXML without throwing', async () => {
  const h = createBrowserHarness();
  boot(h);

  const btnExportXml = h.elements.get('btn-export-xml');
  await h.elements.get('btn-batch-generate').click();

  assert.doesNotThrow(() => {
    btnExportXml.click();
  });
});

test('btn-ab-test clicks and runs generateABTestBrief to console', async () => {
  const h = createBrowserHarness();
  boot(h);

  const btnAbTest = h.elements.get('btn-ab-test');
  await h.elements.get('btn-batch-generate').click();

  let logOutput = [];
  const originalLog = console.log;
  console.log = (...args) => logOutput.push(args.join(' '));

  try {
    btnAbTest.click();
  } finally {
    console.log = originalLog;
  }

  const abToast = h.toasts.find(t => /a\/b test/i.test(t.msg));
  assert.ok(abToast, 'expected toast about A/B test');
  assert.ok(logOutput.length > 0);
  assert.ok(logOutput[0].includes('A/B Test Brief'));
});

test('applyScenePack blocks completely invalid or empty data structure', () => {
  const h = createBrowserHarness();
  boot(h);

  const result = vm.runInContext('applyScenePack(null)', h.context);
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.code, 'INVALID_SCENE_PACK');

  const result2 = vm.runInContext('applyScenePack({})', h.context);
  assert.equal(result2.status, 'BLOCKED');
  assert.equal(result2.code, 'INVALID_SCENE_PACK');
});

test('applyAgentResult blocks invalid or empty finalPrompt', async () => {
  const h = createBrowserHarness();
  boot(h);

  await h.elements.get('btn-batch-generate').click();

  const result = vm.runInContext('applyAgentResult({ sceneId: 1, role: "IMAGE", finalPrompt: "" })', h.context);
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.code, 'INVALID_AGENT_RESULT');

  const result2 = vm.runInContext('applyAgentResult({ sceneId: 1, role: "IMAGE", finalPrompt: 123 })', h.context);
  assert.equal(result2.status, 'BLOCKED');
  assert.equal(result2.code, 'INVALID_AGENT_RESULT');
});

test('importScenePack rejects corrupt file contents', () => {
  const h = createBrowserHarness();
  boot(h);

  const fileInput = h.elements.get('file-import-json');

  let toastLogs = [];
  h.context.showToast = (msg, type) => {
    toastLogs.push({ msg, type });
  };

  const file = {
    name: 'corrupt.json',
    contents: 'invalid-json'
  };

  const event = { target: { files: [file] } };
  fileInput.onchange(event);

  assert.ok(toastLogs.some(log => log.msg.includes('Geçersiz veya bozuk JSON dosyası.') && log.type === 'error'));
});

test('checkHealth sets health-dot to online and health-text to online message when API is healthy', async () => {
  const h = createBrowserHarness();
  boot(h);

  const dot = h.elements.get('health-dot');
  const text = h.elements.get('health-text');

  dot.classList.remove('online');
  dot.classList.add('offline');
  text.innerText = 'Bilinmiyor';

  h.context.checkHealth();

  await new Promise(resolve => setTimeout(resolve, 10));

  assert.ok(dot.classList.contains('online'));
  assert.ok(!dot.classList.contains('offline'));
  assert.equal(text.innerText, 'MAMILAS PRO (Bağlı)');
});

test('checkHealth sets health-dot to offline and health-text to offline message when API fetch fails or response is not ok', async () => {
  const h = createBrowserHarness();
  h.context.fetchShouldFail = true;
  boot(h);

  const dot = h.elements.get('health-dot');
  const text = h.elements.get('health-text');

  dot.classList.add('online');
  dot.classList.remove('offline');
  text.innerText = 'Bilinmiyor';

  h.context.checkHealth();

  await new Promise(resolve => setTimeout(resolve, 10));

  assert.ok(dot.classList.contains('offline'));
  assert.ok(!dot.classList.contains('online'));
  assert.equal(text.innerText, 'MAMILAS PRO (Offline)');

  // Case B: Fetch returns non-ok response
  h.context.fetchShouldFail = false;
  const originalFetch = h.context.fetch;
  h.context.fetch = async (url) => {
    if (url === '/api/health') {
      return { ok: false };
    }
    return originalFetch(url);
  };

  dot.classList.add('online');
  dot.classList.remove('offline');
  text.innerText = 'Bilinmiyor';

  h.context.checkHealth();

  await new Promise(resolve => setTimeout(resolve, 10));

  assert.ok(dot.classList.contains('offline'));
  assert.ok(!dot.classList.contains('online'));
  assert.equal(text.innerText, 'MAMILAS PRO (Offline)');
});

test('checkHealth initializes AudioEngine if it is defined and not already initialized', async () => {
  const h = createBrowserHarness();
  boot(h);

  let initCalled = false;
  h.context.AudioEngine = {
    initialized: false,
    init() {
      initCalled = true;
    }
  };

  h.context.checkHealth();

  await new Promise(resolve => setTimeout(resolve, 10));

  assert.ok(initCalled);
  assert.ok(h.context.AudioEngine.initialized);
});

test('generateBatch transitions cinematic-loader style display to flex and then back to none on success and error', async () => {
  // Case A: Success
  const hSuccess = createBrowserHarness();
  boot(hSuccess);

  const loaderSuccess = hSuccess.elements.get('cinematic-loader');
  const displaysSuccess = [];
  Object.defineProperty(loaderSuccess.style, 'display', {
    get() { return this._display; },
    set(val) {
      displaysSuccess.push(val);
      this._display = val;
    },
    configurable: true
  });

  await hSuccess.elements.get('btn-batch-generate').click();
  assert.deepEqual(displaysSuccess, ['flex', 'none']);

  // Case B: Error (fetch fails)
  const hError = createBrowserHarness();
  hError.context.fetchShouldFail = true;
  boot(hError);

  const loaderError = hError.elements.get('cinematic-loader');
  const displaysError = [];
  Object.defineProperty(loaderError.style, 'display', {
    get() { return this._display; },
    set(val) {
      displaysError.push(val);
      this._display = val;
    },
    configurable: true
  });

  await hError.elements.get('btn-batch-generate').click();
  assert.deepEqual(displaysError, ['flex', 'none']);
});

test('btn-api-save transitions innerText to Kaydediliyor... and back to API Kaydet', async () => {
  const h = createBrowserHarness();
  boot(h);

  const btnApiSave = h.elements.get('btn-api-save');
  await h.elements.get('btn-batch-generate').click();

  const texts = [];
  btnApiSave._innerText = 'API Kaydet';
  Object.defineProperty(btnApiSave, 'innerText', {
    get() { return this._innerText; },
    set(val) {
      texts.push(val);
      this._innerText = val;
    },
    configurable: true
  });

  // Trigger click (success flow)
  await btnApiSave.click();
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.deepEqual(texts, ['Kaydediliyor...', 'API Kaydet']);

  // Trigger click (failure flow)
  texts.length = 0;
  h.context.saveShouldFail = true;
  await btnApiSave.click();
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.deepEqual(texts, ['Kaydediliyor...', 'API Kaydet']);
});

test('api.js saveProjectToDisk and loadProjectFromDisk behavior under success and failure', async () => {
  const h = createBrowserHarness();
  boot(h);

  // Load api.js
  const apiSrc = readFileSync(path.join(ROOT, 'public/api.js'), 'utf8');
  vm.runInContext(apiSrc, h.context, { filename: 'public/api.js' });

  // Verify saveProjectToDisk success
  const sampleData = { val: 42 };
  let fetchBody, fetchMethod, fetchUrl;
  h.context.fetch = async (url, options) => {
    fetchUrl = url;
    fetchMethod = options.method;
    fetchBody = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({ success: true, id: fetchBody.id })
    };
  };

  const saveRes = await h.context.saveProjectToDisk(sampleData);
  assert.ok(saveRes.success);
  assert.ok(saveRes.id.startsWith('project-'));
  assert.equal(fetchMethod, 'POST');
  assert.equal(fetchUrl, `/api/projects/${saveRes.id}`);
  assert.equal(fetchBody.val, 42);

  // Verify saveProjectToDisk failure (fetch returns not ok)
  h.context.fetch = async () => {
    return { ok: false, statusText: 'Bad Request' };
  };
  await assert.rejects(
    async () => h.context.saveProjectToDisk(sampleData),
    /Failed to save project: Bad Request/
  );

  // Verify loadProjectFromDisk success
  h.context.fetch = async (url) => {
    fetchUrl = url;
    return {
      ok: true,
      json: async () => ({ id: '123', val: 99 })
    };
  };
  const loadRes = await h.context.loadProjectFromDisk('123');
  assert.equal(loadRes.val, 99);
  assert.equal(fetchUrl, '/api/projects/123');

  // Verify loadProjectFromDisk 404 project not found
  h.context.fetch = async () => {
    return { ok: false, status: 404, statusText: 'Not Found' };
  };
  await assert.rejects(
    async () => h.context.loadProjectFromDisk('unknown'),
    /Project not found/
  );

  // Verify loadProjectFromDisk general failure
  h.context.fetch = async () => {
    return { ok: false, status: 500, statusText: 'Internal Error' };
  };
  await assert.rejects(
    async () => h.context.loadProjectFromDisk('error-id'),
    /Failed to load project: Internal Error/
  );
});

test('brief-generator.js creates correct briefs, handles parent iframe messaging, and responds to extension status messages', async () => {
  const h = createBrowserHarness();
  boot(h);

  // Load brief-generator.js
  const briefGenSrc = readFileSync(path.join(ROOT, 'public/brief-generator.js'), 'utf8');
  vm.runInContext(briefGenSrc, h.context, { filename: 'public/brief-generator.js' });

  const btnBrief = h.elements.get('btn-master-brief');

  // Case 1: Clicks without generating scenes first
  h.body.dispatchEvent({ type: 'click', target: btnBrief });
  assert.ok(h.toasts.some(t => t.msg.includes('Lütfen önce BATCH ÜRET') && t.type === 'error'));

  // Clear toasts and generate scenes
  h.toasts.length = 0;
  await h.elements.get('btn-batch-generate').click();

  // Case 2: Clicks with scenes (window === window.parent)
  h.body.dispatchEvent({ type: 'click', target: btnBrief });
  await new Promise(r => setTimeout(r, 10));
  assert.ok(h.context.clipboardContent.includes('MAMILAS PRODUCTION BRIEF'));
  assert.ok(h.toasts.some(t => t.msg.includes('MASTER FINAL BRIEF kopyalandı!')));

  // Case 3: Clicks with scenes (window !== window.parent)
  h.toasts.length = 0;
  h.context.parent = {
    postMessage(data, origin) {
      h.context.postedMessageData = data;
    }
  };

  h.body.dispatchEvent({ type: 'click', target: btnBrief });
  assert.ok(h.toasts.some(t => t.msg.includes('Claude.ai sekmesine gönderiliyor...') && t.type === 'warning'));
  assert.equal(h.context.postedMessageData.type, 'MAMILAS_INJECT_CLAUDE');
  assert.ok(h.context.postedMessageData.payload.includes('MAMILAS PRODUCTION BRIEF'));

  // Case 4: Event listener for extension result message
  h.toasts.length = 0;
  h.context.dispatchEvent({
    type: 'message',
    source: h.context.parent,
    data: {
      type: 'MAMILAS_INJECT_RESULT',
      success: true
    }
  });
  assert.ok(h.toasts.some(t => t.msg.includes('Başarıyla Claude.ai paneline enjekte edildi! ✅')));

  h.toasts.length = 0;
  h.context.dispatchEvent({
    type: 'message',
    source: h.context.parent,
    data: {
      type: 'MAMILAS_INJECT_RESULT',
      success: false,
      error: 'Timeout'
    }
  });
  assert.ok(h.toasts.some(t => t.msg.includes('Claude.ai enjeksiyonu başarısız: Timeout') && t.type === 'error'));
});

test('pacing-graph.js draws empty state and scene bar graph elements correctly', async () => {
  const h = createBrowserHarness();
  boot(h);

  // Load pacing-graph.js
  const pacingGraphSrc = readFileSync(path.join(ROOT, 'public/pacing-graph.js'), 'utf8');
  vm.runInContext(pacingGraphSrc, h.context, { filename: 'public/pacing-graph.js' });

  const pacingGraphEl = h.elements.get('pacing-graph');

  // Case A: Empty scenes list
  h.context.drawPacingGraph([]);
  const emptyWrapper = pacingGraphEl.children[0];
  assert.equal(emptyWrapper.children[0].innerText, '[ NO SCENES GENERATED ]');

  // Case B: Drawn scenes graph
  await h.elements.get('btn-batch-generate').click();
  const scenes = vm.runInContext('STATE.scenes', h.context);
  h.context.drawPacingGraph(scenes);

  const wrapper = pacingGraphEl.children[0];
  // Verify matching number of children (bars) for 3 scenes
  assert.equal(wrapper.children.length, 3);

  // Verify tooltips and mouseenter/mouseleave hover interactions
  const firstBarContainer = wrapper.children[0];
  const bar = firstBarContainer.children[0];
  const tooltip = firstBarContainer.children[1];

  assert.equal(tooltip.style.visibility, 'hidden');
  assert.equal(tooltip.style.opacity, '0');

  // Simulate mouseenter
  bar.onmouseenter();
  assert.equal(tooltip.style.visibility, 'visible');
  assert.equal(tooltip.style.opacity, '1');
  assert.equal(bar.style.transform, 'scaleY(1.1)');

  // Simulate mouseleave
  bar.onmouseleave();
  assert.equal(tooltip.style.visibility, 'hidden');
  assert.equal(tooltip.style.opacity, '0');
  assert.equal(bar.style.transform, 'scaleY(1)');
});
