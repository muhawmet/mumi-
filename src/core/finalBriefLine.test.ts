import { describe, expect, test } from 'vitest';
import { buildCommandJSON } from './commandExport';
import { applyAgentPrompt, effectivePrompt, type Scene } from '../store/useStudioStore';
import { sha256Hex } from './contract';

/**
 * MACRO 3 — Site → taşınabilir final brief → command → ajan final prompt hattı.
 *
 * Kabul: Mami hiçbir API kullanmadan bir projeden brief alır, command'de ajana verir, ajanın
 * yazdığı final prompt'u geri kaydeder. Site final prompt üretmez; ajanın metni site tarafından
 * üretilmiş GÖRÜNMEZ. Receipt hangi brief/command hash'inden yazıldığını taşır.
 */

function cmdState(extra: Record<string, unknown> = {}) {
  return {
    selectedProjectId: 'p1',
    projectTopic: 'Termos filmi',
    projectClass: 'PRODUCT_HERO',
    sceneCount: 3,
    cast: '',
    selectedWorldId: 'product_brand_real',
    selectedPropId: '',
    selectedRefIds: ['product_macro'],
    selectedPaletteId: 'native_world',
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
    brandKitLock: '',
    mood: '', cameraEnergy: '', timeLight: '', transition: '', musicVibe: '',
    pov: '', signature: '', leitmotif: '', tempoCurve: '',
    directorBrief: '4–5 sahneye anlamlı yazı koy, ürün yazısını sen yerleştir.',
    rawSource: 'Mat siyah termos sabah masada; buhar ve kapak mekanizması görünür.',
    sourceBeats: [{ sourceId: 'source-001', exactText: 'Mat siyah termos sabah masada; buhar ve kapak mekanizması görünür.', hash: 'x' }],
    sourceReport: null,
    beatMode: 'auto',
    workingMode: 'studio',
    beatKeeps: {},
    beatAnalysis: null,
    scenes: [],
    agentBrief: '',
    agentPackets: null,
    ...extra,
  } as never;
}

describe('taşınabilir brief — site kararı + WorldPacket + raw source + Mami notu taşır', () => {
  const cmd = buildCommandJSON(cmdState()) as any;

  test('command taşınabilir kimlik (içerik-hash) taşır — timestamp türevi değil', () => {
    expect(cmd.commandId).toMatch(/^mamilas-[0-9a-f]{64}$/);
  });

  test('raw source ve Mami serbest notu brief\'e DEĞİŞMEDEN ulaşır', () => {
    expect(cmd.baseDecision.source.rawSource).toContain('Mat siyah termos');
    expect(cmd.creativeControls.directorBrief).toBe('4–5 sahneye anlamlı yazı koy, ürün yazısını sen yerleştir.');
  });

  test('WorldPacket brief içinde taşınır (ajana fizik), ama PROMPT DEĞİLDİR', () => {
    expect(cmd.worldPacket).toBeTruthy();
    expect(cmd.worldPacket.id).toBe('product_brand_real');
    expect(cmd.worldPacket.renderPhysics.length).toBeGreaterThan(20);
    expect(cmd.worldPacket.paletteAsLight).not.toMatch(/#[0-9A-Fa-f]{6}\b/);
    expect(cmd.worldPacket.legacyRenderLaw.length).toBeGreaterThan(20); // render_law korunur
    // Paket bir prompt bandı taşımaz.
    expect(JSON.stringify(cmd.worldPacket)).not.toMatch(/\[DIRECTOR TASK\]/);
  });

  test('command sözleşmesi ajana "prompt\'u SEN yaz" ve "Mami direktifini uygula" der', () => {
    const contract = cmd.commands.contract.join('\n');
    expect(contract).toMatch(/dominant element'i SEN yaz/);
    expect(contract).toMatch(/WORLD PACKET yaratıcı MALZEMEDİR, prompt değildir/);
    expect(contract).toMatch(/MAMI DİREKTİFİ/);
  });

  test('site prompt üretmez: prompts.image bir BRIEF, prompts.motion NULL (kare öncesi)', () => {
    // scenes boş verildi; sözleşme yine de motion'ı kare-kapılı tutar.
    expect(cmd.commands.contract.join('\n')).toMatch(/prompts\.image bir BRIEF'tir/);
  });
});

describe('ajan çıktısı geri alınır — receipt hangi command\'den yazıldığını taşır', () => {
  const cmd = buildCommandJSON(cmdState()) as any;

  const baseScene: Scene = {
    id: 1,
    architecture: {} as never,
    imagePrompt: 'SITE BRIEF: dominant element brief (bitmiş prompt değil)',
    motionPrompt: '',
    voiceOver: '',
    sunoBrief: '',
    durationSec: 5,
    duration: {} as never,
    intensity: 50,
    phaseName: 'Intro',
    handoff: { IMAGE: { draft: {} }, MOTION: {}, SUNO: {} } as never,
    onScreenText: null,
  };

  const AGENT_PROMPT =
    'Matte black thermos on a morning desk, 85mm macro, motivated window key, diegetic "MAMILAS THERMO" laser-etched on the body — agent-authored final prompt.';

  test('ajan-yazımı final prompt import edilince effectivePrompt onu döndürür (site metni değil)', () => {
    const s = applyAgentPrompt(baseScene, AGENT_PROMPT, cmd.commandId, 'paste');
    expect(effectivePrompt(s)).toBe(AGENT_PROMPT);
    expect(effectivePrompt(s)).not.toBe(baseScene.imagePrompt);
  });

  test('receipt: finalPrompt + fromCommandId + promptHash taşır (karara hash\'le bağlı)', () => {
    const s = applyAgentPrompt(baseScene, AGENT_PROMPT, cmd.commandId, 'import');
    expect(s.promptReceipt).toBeDefined();
    expect(s.promptReceipt!.finalPrompt).toBe(AGENT_PROMPT);
    expect(s.promptReceipt!.fromCommandId).toBe(cmd.commandId);
    expect(s.promptReceipt!.promptHash).toBe(sha256Hex(AGENT_PROMPT));
    expect(s.promptReceipt!.source).toBe('import');
  });

  test('boş geri-alım override VE receipt\'i temizler', () => {
    const s = applyAgentPrompt(baseScene, AGENT_PROMPT, cmd.commandId);
    const cleared = applyAgentPrompt(s, '', cmd.commandId);
    expect(cleared.userImagePrompt).toBeUndefined();
    expect(cleared.promptReceipt).toBeUndefined();
    expect(effectivePrompt(cleared)).toBe(baseScene.imagePrompt);
  });
});
