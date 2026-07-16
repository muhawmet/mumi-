import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { buildImagePromptQualityContract, CONTRACT_OVERRIDE_POLICY, IMAGE_PROMPT_QUALITY_CONTRACT } from './agentProtocol';
import { DATA } from './pure';

/**
 * BRAIN M4 — Image Author + Jury zekâsı (KUSUR-D).
 *
 * Madenlenmiş yasalar ([[mamilas-brain-intelligence-mined]]) nesir duvarı değil,
 * ölçülebilir kontrat maddesi olur: `requiredEvidence[]` (jüri kanıt arar) +
 * `rejectIf[]` (jüri reddeder). Kontrat dünya/engine-aware üretilir.
 *
 * Override (ürün yasası #5) KOD DEĞİL AJAN işidir — Sol kritik bulgusu: kod doğal
 * dilden polarite çıkaramaz ("yarım saniye önce patlama olsun" maddeyi İSTEYEN
 * direktiftir). Kontrat `overridePolicy` taşır; Author çatışan maddeyi
 * `suppressedContext`e yazar, Jury APPLIED direktifle çatışan maddeyi enforce etmez.
 */

const w = (id: string) => DATA.worlds.find((x) => x.id === id)!;

describe('buildImagePromptQualityContract — dünya/engine-aware kontrat', () => {
  it('temel kontrat korunur (statik çekirdek maddeler kaybolmaz)', () => {
    const c = buildImagePromptQualityContract({ world: w('deakins_naturalist'), imageModel: 'nano_banana_2' });
    for (const item of IMAGE_PROMPT_QUALITY_CONTRACT.requiredEvidence) {
      expect(c.requiredEvidence).toContain(item);
    }
    for (const item of IMAGE_PROMPT_QUALITY_CONTRACT.rejectIf) {
      expect(c.rejectIf).toContain(item);
    }
  });

  it('nano_banana_2: sayısal lens+f-stop kamera grameri requiredEvidence olur', () => {
    const c = buildImagePromptQualityContract({ world: w('deakins_naturalist'), imageModel: 'nano_banana_2' });
    expect(c.requiredEvidence.join(' ')).toMatch(/numeric lens.*f-stop|f-stop.*numeric lens/i);
  });

  it('animasyon dünyası: 2D-plastik yasası — figür-cel vs boyalı arka plan ayrımı zorunlu', () => {
    const c = buildImagePromptQualityContract({ world: w('one_piece_toei'), imageModel: 'nano_banana_2' });
    const all = c.requiredEvidence.join(' ');
    expect(all).toMatch(/flat-cel|cel/i);
    expect(all).toMatch(/painted|photoreal background|background/i);
    // Stil sıfatı değil fiziksel malzeme:
    expect(c.rejectIf.join(' ')).toMatch(/physical material|franchise|style adjective/i);
  });

  it('foto-gerçek dünya: anti-sheen counter-terms requiredEvidence olur', () => {
    const c = buildImagePromptQualityContract({ world: w('deakins_naturalist'), imageModel: 'nano_banana_2' });
    expect(c.requiredEvidence.join(' ')).toMatch(/negative fill|motivated light|film grain|skin micro-texture/i);
  });

  it('evrensel madenler: detay üçlüsü + self-contained + half-a-second-before + banned empties', () => {
    const c = buildImagePromptQualityContract({ world: w('one_piece_toei'), imageModel: 'nano_banana_2' });
    const req = c.requiredEvidence.join(' ');
    const rej = c.rejectIf.join(' ');
    expect(req).toMatch(/environmental pressure.*micro-action.*optical|detail triad/i);
    expect(req).toMatch(/self-contained|previous scene/i);
    expect(req).toMatch(/half a second before/i);
    expect(rej).toMatch(/4K|masterpiece|cinematic|stunning/i);
  });

  it('palet-rejim yasası: kapalı renk listesi rejectIf olur (duotone çökmesi)', () => {
    const c = buildImagePromptQualityContract({ world: w('one_piece_toei'), imageModel: 'nano_banana_2' });
    expect(c.rejectIf.join(' ')).toMatch(/closed (hue|color) list|duotone/i);
  });

  it('override yasası kontratta AJAN talimatı olarak taşınır — kod keyword bastırması YAPMAZ', () => {
    const c = buildImagePromptQualityContract({ world: w('one_piece_toei'), imageModel: 'nano_banana_2' });
    // Politika: direktif kazanır, suppression ajan muhakemesi, receipt'te görünür, kod tahmin etmez.
    expect(c.overridePolicy).toBe(CONTRACT_OVERRIDE_POLICY);
    expect(c.overridePolicy).toMatch(/never a universal lock|never universal locks/i);
    expect(c.overridePolicy).toMatch(/suppressedContext/);
    expect(c.overridePolicy).toMatch(/never inferred by code/i);
    // Kod bastırmadığı için tüm madenler aktif kalır — polarite yanlış-pozitifi imkânsız:
    expect(c.requiredEvidence.join(' ')).toMatch(/half a second before/i);
  });

  it('kontrat deterministik ve exact sıralı (statik çekirdek önce, madenler JSON sırasıyla)', () => {
    const a = buildImagePromptQualityContract({ world: w('one_piece_toei'), imageModel: 'nano_banana_2' });
    const b = buildImagePromptQualityContract({ world: w('one_piece_toei'), imageModel: 'nano_banana_2' });
    expect(a).toEqual(b);
    // Çekirdek maddeler başta ve sırası korunur:
    expect(a.requiredEvidence.slice(0, IMAGE_PROMPT_QUALITY_CONTRACT.requiredEvidence.length))
      .toEqual([...IMAGE_PROMPT_QUALITY_CONTRACT.requiredEvidence]);
    expect(a.rejectIf.slice(0, IMAGE_PROMPT_QUALITY_CONTRACT.rejectIf.length))
      .toEqual([...IMAGE_PROMPT_QUALITY_CONTRACT.rejectIf]);
  });

  it('TS ↔ runner PARİTE: mamilas-command.mjs aynı dünya/engine için byte-eş kontrat üretir', async () => {
    // Kontrat sceneContextHash'in parçası — iki yüzey ıraksarsa her command stale olur.
    // commandRuntime testleri bunu dolaylı ölçüyor; burada DOĞRUDAN kilitliyoruz.
    const require = createRequire(import.meta.url);
    const { pathToFileURL } = require('node:url');
    const { resolve } = require('node:path');
    const runner = await import(pathToFileURL(resolve('scripts/mamilas-command.mjs')).href);
    // runner buildImagePromptQualityContract'ı export etmiyor; imageContext üzerinden ölçmek
    // tam command ister — bu yüzden runner modülünün ürettiği kontratı sentetik command'le alıyoruz.
    const world = { group: w('one_piece_toei').group };
    const tsContract = buildImagePromptQualityContract({ world, imageModel: 'nano_banana_2' });
    const runnerContract = runner.__testBuildImagePromptQualityContract
      ? runner.__testBuildImagePromptQualityContract({ world, imageModel: 'nano_banana_2' })
      : null;
    expect(runnerContract, 'runner __testBuildImagePromptQualityContract export etmeli').toBeTruthy();
    expect(JSON.stringify(runnerContract)).toBe(JSON.stringify(tsContract));
  });
});
