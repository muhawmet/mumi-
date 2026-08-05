// DIŞ GÖZ launcher — ezber değil kod. Bu test dış araçları/usage'ı çağırmaz;
// `--kuru` ile Mami'ye GÖSTERİLEN komutu ve sessiz AGY geçişinin kırmızı kaldığını ölçer.

import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInvocation, parseAgyResponse } from './dis-goz.mjs';

const SCRIPT = fileURLToPath(new URL('./dis-goz.mjs', import.meta.url));
const MEDIA = fileURLToPath(new URL('./__fixtures__/canary/kare.png', import.meta.url));
const PROMPT = fileURLToPath(new URL('./__fixtures__/canary/OKUMA.txt', import.meta.url));

function dry(args) {
  return execFileSync('node', [SCRIPT, ...args, '--kuru'], { encoding: 'utf8' });
}

describe('dış göz launcher', () => {
  it('her alt komutta --kuru doğru motor ve zorunlu bayrakları gösterir', () => {
    const is = dry(['is', 'mekanik işi doğrula']);
    expect(is).toContain('gpt-5.6-terra');
    expect(is).toContain('model_reasoning_effort=\\"high\\"');
    expect(is).toContain('-s workspace-write');

    const cur = dry(['cur', 'Bu iddia çürütülebilir.']);
    expect(cur).toContain('gpt-5.6-sol');
    expect(cur).toContain('model_reasoning_effort=\\"xhigh\\"');
    expect(cur).toContain('-s read-only');
    expect(cur).toContain('DOĞRULA ya da ÇÜRÜT');

    const ara = dry(['ara', 'Müfredat araştırması']);
    expect(ara).toContain('--output-format json');
    expect(ara).toContain('gemini-3.6-flash-high');

    const gor = dry(['gor', MEDIA, 'Neyi görüyorsun?']);
    expect(gor).toContain('--output-format json');
    expect(gor).toContain(MEDIA);

    const kare = dry(['kare', PROMPT, path.join('/tmp', 'dis-goz-kuru.png')]);
    expect(kare).toContain('--output-format json');
    expect(kare).toContain('/tmp/dis-goz-kuru.png');
  });

  it('var olmayan medya yolunu AGY çalıştırılmadan reddeder', () => {
    expect(() => buildInvocation(['gor', '/tmp/dis-goz-bu-medya-yok.mp4', 'Ne görüyorsun?']))
      .toThrow(/diskte yok; AGY çalıştırılmadı/);
  });

  it('AGY SUCCESS + boş response durumunu başarısızlık sayar', () => {
    expect(() => parseAgyResponse('{"status":"SUCCESS","response":"   "}'))
      .toThrow(/BAŞARISIZLIK/);
  });
});
