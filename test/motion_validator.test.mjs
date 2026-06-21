// motion-validator: motion prompt'unun image'da olmayan obje icat etmediğini doğrular.
import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(path.join(ROOT, 'public/motion-validator.js'), 'utf8');

function loadValidator() {
  const ctx = { window: {}, module: { exports: {} } };
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: 'public/motion-validator.js' });
  return ctx.window.validateMotionAgainstImage;
}

test('motion-validator: faithful play of the frame is OK', () => {
  const v = loadValidator();
  const img = 'A young boy in a watercolor classroom watering a small green plant on the windowsill, soft afternoon light.';
  const motion = 'Camera slowly pushes towards the boy and the plant on the windowsill; the leaves sway slightly.';
  const r = v(img, motion);
  assert.equal(r.ok, true, 'expected ok with no foreign nouns; got: ' + JSON.stringify(r.foreign));
});

test('motion-validator: invented objects in motion are flagged', () => {
  const v = loadValidator();
  const img = 'A young boy in a watercolor classroom watering a small green plant on the windowsill.';
  const motion = 'Camera dollies past a sleeping dragon while a sparkling spaceship lands behind the boy.';
  const r = v(img, motion);
  assert.equal(r.ok, false);
  assert.ok(r.foreign.includes('dragon') || r.foreign.includes('sleeping'),
    'expected dragon flagged, got: ' + JSON.stringify(r.foreign));
  assert.ok(r.foreign.includes('spaceship'),
    'expected spaceship flagged, got: ' + JSON.stringify(r.foreign));
});

test('motion-validator: pan/zoom/dolly verbs are not flagged as foreign', () => {
  const v = loadValidator();
  const img = 'A wide cinematic shot of a desert at golden hour, a lone traveler with a backpack.';
  const motion = 'Pan slowly left while pulling out to a wider frame; dolly back as the traveler walks.';
  const r = v(img, motion);
  assert.equal(r.ok, true, 'camera verbs should be allowed; got foreign: ' + JSON.stringify(r.foreign));
});
