// DIŞ GÖZ launcher — ezber değil kod. Bu test dış araçları/usage'ı çağırmaz;
// `--kuru` ile Mami'ye GÖSTERİLEN komutu ve sessiz AGY geçişinin kırmızı kaldığını ölçer.

import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInvocation, parseAgyResponse, parseCodexResponse } from './dis-goz.mjs';

const SCRIPT = fileURLToPath(new URL('./dis-goz.mjs', import.meta.url));
const MEDIA = fileURLToPath(new URL('./__fixtures__/canary/kare.png', import.meta.url));
const PROMPT = fileURLToPath(new URL('./__fixtures__/canary/OKUMA.txt', import.meta.url));

function dry(args) {
  return execFileSync('node', [SCRIPT, ...args, '--kuru'], { encoding: 'utf8' });
}

describe('dış göz launcher', () => {
  it('her alt komutta --kuru doğru motor ve zorunlu bayrakları gösterir', () => {
    const is = dry(['is', 'mekanik işi doğrula']);
    expect(is).toContain("'gpt-5.6-terra'");
    expect(is).toContain("'model_reasoning_effort=\"high\"'");
    expect(is).toContain("'-s' 'workspace-write'");
    expect(is).toContain('Windows PowerShell');

    const cur = dry(['cur', 'Bu iddia çürütülebilir.']);
    expect(cur).toContain("'gpt-5.6-sol'");
    expect(cur).toContain("'model_reasoning_effort=\"xhigh\"'");
    expect(cur).toContain("'-s' 'read-only'");
    expect(cur).toContain('DOĞRULA ya da ÇÜRÜT');

    const ara = dry(['ara', 'Müfredat araştırması']);
    expect(ara).toContain("'--output-format' 'json'");
    expect(ara).toContain('gemini-3.6-flash-high');

    const gor = dry(['gor', MEDIA, 'Neyi görüyorsun?']);
    expect(gor).toContain("'--output-format' 'json'");
    expect(gor).toContain(MEDIA);

    const kare = dry(['kare', PROMPT, path.join('/tmp', 'dis-goz-kuru.png')]);
    expect(kare).toContain("'--output-format' 'json'");
    expect(kare).toContain('/tmp/dis-goz-kuru.png');
  });

  it('kuru çıktı görevdeki shell sözdizimini POSIX tek tırnakla etkisizleştirir', () => {
    const task = "'$(touch /tmp/dis-goz-pwned)' ve `id`";
    const output = dry(['is', task]);
    expect(output).toContain("printf %s ''\\''$(touch /tmp/dis-goz-pwned)'\\'' ve `id`'");
    expect(output).not.toContain(`printf %s \"${task}\"`);
  });

  it('review görevi Codex alt-komutu değil stdin görevidir', () => {
    const invocation = buildInvocation(['is', 'review']);
    expect(invocation.args).toContain('-');
    expect(invocation.args).not.toContain('review');
    expect(invocation.stdin).toBe('review');
    expect(invocation.cwd).toBe(path.resolve(path.dirname(SCRIPT), '..'));
  });

  it('var olmayan medya yolunu AGY çalıştırılmadan reddeder', () => {
    expect(() => buildInvocation(['gor', '/tmp/dis-goz-bu-medya-yok.mp4', 'Ne görüyorsun?']))
      .toThrow(/diskte yok; AGY çalıştırılmadı/);
  });

  it('var olan kare hedefini üzerine yazmadan reddeder', () => {
    expect(() => buildInvocation(['kare', PROMPT, MEDIA]))
      .toThrow(/zaten var; üzerine yazılmaz/);
  });

  it('kare hedefi yalnız yeni .png/.jpg normal dosya yolu olabilir', () => {
    expect(() => buildInvocation(['kare', PROMPT, '/private/tmp/dis-goz-yanlis.txt']))
      .toThrow(/yalnız .png veya .jpg/);
    expect(() => buildInvocation(['kare', PROMPT, path.dirname(MEDIA)]))
      .toThrow(/hedefi dizin olamaz/);
  });

  it('AGY SUCCESS + boş response durumunu başarısızlık sayar', () => {
    expect(() => parseAgyResponse('{"status":"SUCCESS","response":"   "}'))
      .toThrow(/BAŞARISIZLIK/);
  });

  it('Codex boş veya yalnız boşluk stdout döndürürse başarısız sayar', () => {
    expect(() => parseCodexResponse(' \n\t ')).toThrow(/BAŞARISIZLIK/);
  });
});

// `gor --film` tam motion raporunu açar. Ölçülen kusur (2026-08-05): AGY sekiz ondalık saniye
// uydurdu, ffmpeg o bantta sıfır kesim buldu — 1 FPS örneklemede o çözünürlük fiziksel olarak yok.
// Bu yüzden şablonun kendisi ondalığı YASAKLAR ve kesim noktasını AGY'ye SORDURMAZ.
describe('gor --film — motion raporu ve cetvel kilidi', () => {
  it('sekiz başlığı da taşır', () => {
    const cikti = dry(['gor', MEDIA, 'morphing var mı', '--film']);
    for (const baslik of ['GENEL İZLENİM', 'MORPHING', 'FİZİK', 'KİMLİK SÜREKLİLİĞİ',
      'KAMERA', 'YAZI', 'TEMİZ ARALIK', 'HÜKÜM']) {
      expect(cikti).toContain(baslik);
    }
  });

  it('ONDALIK SANİYEYİ açıkça yasaklar ve sebebini yazar', () => {
    const cikti = dry(['gor', MEDIA, 'x', '--film']);
    expect(cikti).toContain('ONDALIK SANİYE YAZMA');
    expect(cikti).toContain('saniyede bir kare');
  });

  it('KESİM NOKTASINI AGY\'ye sordurmaz — onu hakem belirler', () => {
    expect(dry(['gor', MEDIA, 'x', '--film'])).toContain('KESİM NOKTASI VERME');
  });

  it('--film olmadan kısa tarif prompt\'u kalır', () => {
    const cikti = dry(['gor', MEDIA, 'x']);
    expect(cikti).not.toContain('GENEL İZLENİM');
    expect(cikti).toContain('saniye altı kesinlik uydurma');
  });

  it('--film argüman sayımını bozmaz ve yalnız gor ile çalışır', () => {
    expect(() => buildInvocation(['gor', MEDIA, 'x', '--film'])).not.toThrow();
    expect(() => buildInvocation(['ara', 'konu', '--film'])).toThrow(/yalnız `gor`/);
  });
});
