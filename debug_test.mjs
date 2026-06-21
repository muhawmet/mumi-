import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = process.cwd();

class FakeClassList {
  constructor(className = '') { this.classes = new Set(className.split(' ').filter(Boolean)); }
  add(c) { this.classes.add(c); }
  remove(c) { this.classes.delete(c); }
  toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); }
  contains(c) { return this.classes.has(c); }
}

class FakeElement {
  constructor({ id, className, attributes = {}, value, provider } = {}) {
    this.id = id;
    this.classList = new FakeClassList(className);
    this.attributes = attributes;
    this.value = value ?? '';
    this.children = [];
    this.listeners = new Map();
    this.style = {};
    this.dataset = {};
    this.selectedOptions = provider ? [{ parentElement: { label: provider } }] : [];
  }
  appendChild(child) { this.children.push(child); return child; }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name] ?? null; }
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

const elements = new Map();
elements.set('cascade-reference', new FakeElement({ id: 'cascade-reference' }));
const charButtons = [];

const document = {
  body: new FakeElement(),
  createElement: () => new FakeElement(),
  getElementById: id => elements.get(id) ?? null,
  querySelector: () => null,
  querySelectorAll: () => charButtons,
  addEventListener: () => {}
};

const context = vm.createContext({
  console,
  document,
  fetch: async () => ({ ok: true, json: async () => ({}) }),
  window: { AudioEngine: null },
  FileReader: class {},
  localStorage: { getItem: () => null, setItem: () => {} },
  navigator: { clipboard: { writeText: async () => {} } },
  Event: class { constructor(type) { this.type = type; } },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  Math,
  parseInt,
  Date,
  JSON,
  Object,
  Array,
  Set,
  Map,
  String,
  Number,
  Boolean,
  Promise
});

const taxSrc = readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8');
const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\nconst tax = ' + taxSrc + '; BRAIN.taxonomy = tax; BRAIN.worlds = tax.worlds || tax;';
const appSrc = readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');

vm.runInContext(brainSrc, context);
try {
  vm.runInContext(appSrc, context);
} catch(e) {
  console.log("APP.JS THREW:", e);
}

const ref = elements.get('cascade-reference');
console.log("cascade-reference length before initUI:", ref.children.length);

try {
  vm.runInContext("initUI()", context);
} catch(e) {
  console.log("initUI THREW:", e);
}

console.log("cascade-reference length after initUI:", ref.children.length);

