import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { DATA, toWorldPacket, splitRenderLawPhysics } from './pure';
import { buildImagePromptQualityContract, buildMotionPromptQualityContract } from './agentProtocol';

/**
 * BRAIN M6 — Sistem QA hardening: ölçülmüş red-line'lar regresyon matrisi.
 *
 * Kaynak: [[mamilas-brain-intelligence-mined]] QA JURY bölümü. Bunlar eski hatta
 * GERÇEK karelerle ölçülmüş kusurların kalıcı kilitleri:
 *  - Render lock İNCELTİLMEZ: 1250→598 kelime A/B'de ölçülebilir kalite kaybı
 *    (kare stok fotoğrafa kaydı). "Kısaltma" kozmetik değil regresyon.
 *  - Prop:fizik ayrımı geri kaçmaz (M2 kilidi sistemik seviyede).
 *  - Palet-liste-duotone + world-lock-figürlü + FACT_REQUIRED token jüri kartlarında yaşar.
 *  - Kontrat kanonu (mined JSON) sessizce boşaltılamaz.
 */

describe('red-line: render-lock inceltme yasağı (1250→598 regresyonu)', () => {
  it('fizik-yoğun dünyaların renderPhysics toplam kütlesi taban altına düşemez', () => {
    // M2 ölçümü: 5/46 dünyadan envanter ayrıldıktan SONRA kalan fizik kütlesi.
    // Bu taban, gelecekte bir "kısaltma/temizlik" PR'ının fizik gövdesini sessizce
    // boşaltmasına karşı kilittir (dünya başına bilinen değerin %90'ı).
    // Sol düzeltmesi: tabanlar GERÇEK ölçümün tam %90'ı (gevşek taban ciddi inceltmeyi geçirir —
    // ilk deakins tabanı 1000/2687 = %37 idi). Ölçüm 2026-07-16, toWorldPacket gerçek çıktısı.
    const floors: Record<string, number> = {
      one_piece_toei: 1503,       // ölçüm 1670
      naruto_shinobi_world: 1178, // 1309
      bleach_soul_world: 927,     // 1031
      cyberpunk_neon_noir: 1354,  // 1505
      claymation_aardman: 1078,   // 1198
      deakins_naturalist: 2418,   // 2687 — kontrol kolu, en fizik-yoğun dünya
    };
    for (const [id, floor] of Object.entries(floors)) {
      const w = DATA.worlds.find((x) => x.id === id)!;
      const pk = toWorldPacket(w);
      expect(pk.renderPhysics.length, `${id} renderPhysics inceldi`).toBeGreaterThanOrEqual(floor);
    }
  });

  it('hiçbir dünyanın render_law fizik gövdesi boşalmaz (46/46 canlılık)', () => {
    for (const w of DATA.worlds) {
      const pk = toWorldPacket(w);
      expect(pk.renderPhysics.trim().length, `${w.id} renderPhysics boş`).toBeGreaterThan(80);
    }
  });
});

describe('red-line: prop/fizik ayrımı geri kaçmaz (M2 sistemik kilidi)', () => {
  it('bilinen prop-laden dünyalarda envanter cümlesi renderPhysics\'e geri sızmaz (M2\'nin 5/5 dünyası)', () => {
    const leaks: Record<string, RegExp> = {
      one_piece_toei: /wanted[- ]poster|caravel|pennant|figurehead/i,
      naruto_shinobi_world: /village facade|rope bridge|paper seal/i,
      cyberpunk_neon_noir: /vending machine|crt monitor/i,
      bleach_soul_world: /fortress-city|wooden-alley slum|paper lantern/i,
      claymation_aardman: /painted cardboard walls|fabric curtains|wire-and-foam trees/i,
    };
    for (const [id, re] of Object.entries(leaks)) {
      const w = DATA.worlds.find((x) => x.id === id)!;
      const pk = toWorldPacket(w);
      expect(pk.renderPhysics, `${id} prop geri sızdı`).not.toMatch(re);
      // Ve envanter kaybolmadı — vocabularyExamples kanalında yaşıyor:
      expect(pk.vocabularyExamples, `${id} envanter kayboldu`).toMatch(re);
    }
  });

  it('splitRenderLawPhysics deterministik — aynı law aynı ayrımı verir', () => {
    const w = DATA.worlds.find((x) => x.id === 'one_piece_toei')!;
    const a = splitRenderLawPhysics(w.render_law || '');
    const b = splitRenderLawPhysics(w.render_law || '');
    expect(a).toEqual(b);
  });
});

describe('red-line: kontrat kanonu sessizce boşaltılamaz', () => {
  const MINED = JSON.parse(readFileSync('agents/promptQuality.mined.json', 'utf8'));

  it('mined JSON bölümleri asgari madde sayısını korur (silme kırmızı verir)', () => {
    expect(MINED.universal.length).toBeGreaterThanOrEqual(5);
    expect(MINED.animation.length).toBeGreaterThanOrEqual(2);
    expect(MINED.photoreal.length).toBeGreaterThanOrEqual(1);
    expect(MINED.engine.nano_banana_2.length).toBeGreaterThanOrEqual(1);
    expect(MINED.motionUniversal.length).toBeGreaterThanOrEqual(6);
    expect(MINED.motionEngine.kling.length).toBeGreaterThanOrEqual(2);
  });

  it('kritik madenler TAM METİNLE kilitli — anlamsız-madde-değişimi kırmızı verir (Sol: smoke yetmez)', () => {
    // Sayı + magic-string kilidi, aynı sayıda anlamsız maddeyle boşaltmaya açıktı.
    // Bu kilit her kritik madde CÜMLESİNİ tam taşır: metin değişirse test kırmızı,
    // değişiklik bilinçliyse test de bilinçli güncellenir (silme değil).
    const texts = [
      ...MINED.universal, ...MINED.animation, ...MINED.photoreal,
      ...MINED.engine.nano_banana_2, ...MINED.motionUniversal, ...MINED.motionEngine.kling,
    ].map((c: { text: string }) => c.text);
    const mustCarry = [
      '2D-medium law: the prompt states WHICH surfaces carry flat-cel treatment (the figure) versus which surfaces are painted or photoreal (the background) — the gap between them IS the style; a franchise or brand name never substitutes for this physical split.',
      'The palette is written as a closed hue/color list instead of a saturation/contrast/bias regime — closed lists collapse to duotone in the engine.',
      'Still-lips law: every mouth in frame stays closed and motionless; voice-over is a separate ElevenLabs layer and never enters this clip.',
      'Physics-First Motion: camera and subject movement is written in the physical vocabulary of mass and cadence (organic handheld drift, macro lens breathing, heavy object momentum, step-printed stutter earned by the world) — never as an abstract camera command.',
      'A sound is named instead of physically described ("explosion sound", "dramatic music") — write the physics of the sound or leave the audio line out.',
      'Detail triad: the frame carries one environmental-pressure detail on a body or surface, one micro-action or physiological event, and one concrete optical event of light or material behaviour (never a mood adjective).',
      'The prompt closes as a clean motion-ready still, half a second before one concrete named physical event.',
      'Camera grammar comes early and numeric: a numeric lens and f-stop (e.g. "locked 40mm at seated eye level, f/8 deep focus") — never a vague "cinematic lens".',
      'The prompt opens from an observable frame inventory: every moving or protected element it names is visibly present in the APPROVE start frame — nothing is invented off-frame.',
    ];
    for (const clause of mustCarry) {
      expect(texts, clause.slice(0, 60)).toContain(clause);
    }
  });

  it('image parite matrisi: animasyon + photoreal + tanımsız dünya + engine\'siz vakalar TS↔runner byte-eş', async () => {
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    const { pathToFileURL } = require('node:url');
    const { resolve } = require('node:path');
    const runner = await import(pathToFileURL(resolve('scripts/mamilas-command.mjs')).href);
    const cases = [
      { world: { group: 'ANIMATION_BOLD_CEL' }, imageModel: 'nano_banana_2' },
      { world: { group: 'CINEMATIC_REAL' }, imageModel: 'nano_banana_2' },
      { world: { group: 'CINEMATIC_REAL' }, imageModel: 'flux' },
      { world: null, imageModel: undefined },
    ] as const;
    for (const args of cases) {
      const ts = buildImagePromptQualityContract(args as any);
      const rn = runner.__testBuildImagePromptQualityContract(args);
      expect(JSON.stringify(rn), JSON.stringify(args)).toBe(JSON.stringify(ts));
    }
  });
});

describe('red-line: jüri kartları ölçülmüş yasaları taşır (kart drift kilidi)', () => {
  it('image-jury kartı: FACT_REQUIRED + suppressed disiplini + interpretation tutarlılığı', () => {
    const card = readFileSync('agents/roles/image-jury.md', 'utf8');
    expect(card).toMatch(/FACT_REQUIRED/);
    expect(card).toMatch(/suppress/i);
    expect(card).toMatch(/interpretation/);
  });

  it('frame-jury kartı: world-lock FİGÜRLÜ kareyle test edilir + 2D-medium piksel kontrolü + FACT_REQUIRED', () => {
    // Maden yasası: "insan üslubun turnusol kâğıdıdır" — figürsüz establishing plate ile
    // dünya kilidi test edilmez. Bu yasa KARE gören jürinin işi (prompt jürisi kare görmez).
    const card = readFileSync('agents/roles/frame-jury.md', 'utf8');
    expect(card).toMatch(/FIGURED frame|figür/i);
    expect(card).toMatch(/litmus/i);
    expect(card).toMatch(/2D-medium split/);
    expect(card).toMatch(/FACT_REQUIRED/);
  });

  it('motion-jury kartı: inventory + still-lips + tetikleyici taraması + override disiplini', () => {
    const card = readFileSync('agents/roles/motion-jury.md', 'utf8');
    expect(card).toMatch(/inventory/i);
    expect(card).toMatch(/still-lips/i);
    expect(card).toMatch(/trigger word/i);
    expect(card).toMatch(/overridePolicy/);
  });

  it('motion kontratı kling-dışı motorlarda da evrensel yasaları taşır', () => {
    for (const model of ['runway_gen4', 'seedance', 'veo_3', undefined]) {
      const c = buildMotionPromptQualityContract({ videoModel: model as any });
      const req = c.requiredEvidence.join(' ');
      expect(req, String(model)).toMatch(/mass and cadence/i);
      expect(req, String(model)).toMatch(/still.?lips/i);
      expect(c.rejectIf.join(' '), String(model)).toMatch(/dialogue/i);
    }
  });
});
