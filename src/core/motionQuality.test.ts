import { describe, it, expect } from 'vitest';
import { buildMotionPromptQualityContract } from './agentProtocol';
import { buildMotionPrompt } from './brain';

/**
 * BRAIN M5 — Motion Author + Motion Jury zekâsı.
 *
 * Madenlenmiş yasalar ([[mamilas-brain-intelligence-mined]] MOTION bölümü):
 *  - Physics-First Motion: jenerik pan/zoom/dolly YOK — kütle/kadans dili
 *    (organic handheld drift, macro lens breathing, heavy object momentum).
 *  - No-dialogue-ever: Kling'e diyalog/dudak yazılmaz; VO ayrı ElevenLabs katmanı;
 *    still-lips mutlak.
 *  - SFX omurgası: shot başına 2-4 somut diegetik ses kaynağı (Kling native audio —
 *    "patlama sesi" değil sesin FİZİĞİ).
 *  - Scrub QUOTED source'a da uygulanır (ölçülmüş gap: ham beat "Motion brief:"
 *    alıntısı olarak akarken klingScrub'ı baypasliyordu — 4/90 gerçek çıktı).
 */

describe('klingScrub quoted source gap (ölçülmüş — Sol düzeltmeli tasarım)', () => {
  it('kaynak alıntısı VERBATIM kalır (sessiz scrub yok) ama tetikleyici uyarısıyla işaretlenir', () => {
    // Sol P1 dersi: kod alıntıyı silerse anlamı katleder ("the seed and above the soil, growth.")
    // ve "kullanıcının cümlesini sessizce scrub etme" yasasını çiğner. Doğru katman: brief kaynak
    // sadakati taşır; tetikleyici temizliği AJANIN final yazımında (kontrat + jüri zorlar).
    const src = 'Suddenly the seed transforms and then appears above the soil, ready to trigger growth.';
    const out = buildMotionPrompt(
      1,
      { subject: '', event: '', matched: false },
      'locked 35mm eye-level',
      { motion: 'event completes by ~70%, confident final hold', perRef: [], refDna: '' } as any,
      5,
      'kling_3',
      null,
      src,
      '',
    );
    const quoted = out.match(/source beat "([^"]*)"/)?.[1] ?? '';
    // Verbatim — anlam ve nedensellik korunur:
    expect(quoted).toBe(src);
    // Ama işaret açık: alıntıdaki tetikleyiciler final prompt'a geçemez (ajan sözleşmesi):
    expect(out).toMatch(/i2v trigger words inside this quote.*must NOT survive/i);
  });
});

describe('buildMotionPromptQualityContract — engine-aware motion kontratı', () => {
  it('Physics-First: jenerik pan/zoom/dolly rejectIf; kütle/kadans dili requiredEvidence', () => {
    const c = buildMotionPromptQualityContract({ videoModel: 'kling_3' });
    expect(c.rejectIf.join(' ')).toMatch(/pan\/zoom\/dolly|generic camera-move verb/i);
    expect(c.requiredEvidence.join(' ')).toMatch(/mass and cadence|handheld drift|lens breathing|momentum/i);
  });

  it('no-dialogue-ever: diyalog/dudak hareketi rejectIf; still-lips requiredEvidence', () => {
    const c = buildMotionPromptQualityContract({ videoModel: 'kling_3' });
    expect(c.rejectIf.join(' ')).toMatch(/dialogue|lip|mouth movement/i);
    expect(c.requiredEvidence.join(' ')).toMatch(/still.?lips|mouths? (stay|remain)/i);
  });

  it('SFX omurgası: 2-4 somut diegetik ses; ses adı değil fiziği', () => {
    const c = buildMotionPromptQualityContract({ videoModel: 'kling_3' });
    expect(c.requiredEvidence.join(' ')).toMatch(/2.?4 (concrete )?diegetic/i);
    expect(c.rejectIf.join(' ')).toMatch(/named sound effect|physics of the sound|sound is named instead/i);
  });

  it('frame-inventory + tek hareketli öğe evrensel maddeler', () => {
    const c = buildMotionPromptQualityContract({ videoModel: 'kling_3' });
    expect(c.requiredEvidence.join(' ')).toMatch(/inventory/i);
    expect(c.requiredEvidence.join(' ')).toMatch(/one single|single-action|one moving element/i);
  });

  it('kontrat deterministik ve overridePolicy taşıyor (ürün yasası #5)', () => {
    const a = buildMotionPromptQualityContract({ videoModel: 'kling_3' });
    const b = buildMotionPromptQualityContract({ videoModel: 'kling_3' });
    expect(a).toEqual(b);
    expect(a.overridePolicy).toMatch(/never inferred by code/i);
  });

  it('engine ailesi fallback: kling_3 / kling_o3 / kling_3_turbo hepsi SFX omurgasını alır; kling-dışı almaz', () => {
    for (const model of ['kling_3', 'kling_o3', 'kling_3_turbo', 'kling']) {
      const c = buildMotionPromptQualityContract({ videoModel: model });
      expect(c.requiredEvidence.join(' '), model).toMatch(/diegetic/i);
    }
    const nonKling = buildMotionPromptQualityContract({ videoModel: 'runway_gen4' });
    expect(nonKling.requiredEvidence.join(' ')).not.toMatch(/diegetic/i);
    // Evrensel maddeler yine de var:
    expect(nonKling.requiredEvidence.join(' ')).toMatch(/mass and cadence/i);
  });

  it('TS ↔ runner PARİTE: birden çok engine vakasında byte-eş motion kontratı', async () => {
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    const { pathToFileURL } = require('node:url');
    const { resolve } = require('node:path');
    const runner = await import(pathToFileURL(resolve('scripts/mamilas-command.mjs')).href);
    expect(runner.__testBuildMotionPromptQualityContract, 'runner export etmeli').toBeTruthy();
    for (const model of ['kling_3', 'kling_o3', 'runway_gen4', undefined]) {
      const ts = buildMotionPromptQualityContract({ videoModel: model });
      const rn = runner.__testBuildMotionPromptQualityContract({ videoModel: model });
      expect(JSON.stringify(rn), String(model)).toBe(JSON.stringify(ts));
    }
  });
});
