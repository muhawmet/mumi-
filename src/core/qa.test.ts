import { expect, test, describe } from 'vitest';
import { evaluateDirectorCabinet, renderLockTextFor, exportGateStatus, type QATip } from './qa';
import { buildCommandJSON } from './commandExport';
import { generateBatch } from './pure';
import { buildProductionExport } from './productionExport';
import type { StudioState, Scene } from '../store/useStudioStore';
import type { SourceIntegrityReport } from './source';
import { ingestSource } from './source';

// Prompt fixtures are PROMPT_SURGEON-clean: triad complete (subject+light+camera),
// no hex, no AI-slop, no i2v trigger residue, hygienic NEGATIVE line.
function cleanImagePrompt(n: number): string {
  return `Dominant element: subject ${n}. Light: soft window key light, grounded shadows. Camera/vantage: 35mm eye-level medium composition.`;
}
// T5 — FIXTURE GERÇEK ÇIKTIYA BAĞLANDI. Bu fixture eskiden 'Moving element:' ve
// 'Event:' satırları basıyordu; buildMotionPrompt bu etiketleri FAZ2'den beri HİÇ
// basmıyor (brain.test.ts bunu ayrıca garanti eder). Yani qa.test.ts elle yazdığı
// bir yalanı doğruluyor, brain.test.ts aynı anda tersini garanti ediyordu.
// Fixture artık gerçek builder'ın şeklini taşır (Camera / Motion brief + source beat /
// Rhythm / Engine grammar / NEGATIVE) ve bu şekil aşağıdaki 'fixture ↔ gerçek çıktı
// sözleşmesi' testiyle gerçek generateBatch çıktısına KİLİTLİDİR — sapan fixture = kırmızı test.
// Kaynak beat'ler sahneden sahneye FARKLI (gerçek batch'te de öyle) → CHECK 6/6b sessiz.
const FIXTURE_BEATS: Record<number, string> = {
  1: 'the potter centers the clay on the wheel',
  2: 'the rim rises between steady fingers',
  3: 'the finished bowl rests on the drying shelf',
};
function cleanMotionPrompt(n: number): string {
  return `[${n}] MOTION (i2v · plays the approved start frame)\n` +
    `Camera: slow push-in on subject ${n}. ` +
    `Motion brief (Claude yazar): source beat "${FIXTURE_BEATS[n] || `beat ${n}`}" [SOURCE — do not render as on-screen text; narration only]. ` +
    `Rhythm: gentle; everything settles naturally into a stable 1-1.5s final hold. ` +
    `Engine grammar (Kling 3): one continuous action, plain present tense. ` +
    `Everything not named stays exactly as the start frame shows.\n` +
    `NEGATIVE: morphing, warping, flicker.`;
}

function createMockState(overrides: Partial<StudioState> = {}): StudioState {
  const scenes: Scene[] = [
    {
      id: 1,
      architecture: {
        source: { status: 'OK', sourceId: '1', exactText: 'text', notice: null },
        beat: 'orient',
        dominantSubject: 'subject 1',
        event: 'event 1',
        imageVantage: '35mm eye-level medium-wide',
        semanticFingerprint: '123'
      },
      imagePrompt: cleanImagePrompt(1),
      motionPrompt: cleanMotionPrompt(1),
      voiceOver: 'vo 1',
      sunoBrief: 'suno 1',
      durationSec: 3.0,
      duration: { sec: 3.0, usable: 3.0, ok: true, level: 'OK', shots: 1, perShot: 3.0, message: '' },
      intensity: 0.5,
      phaseName: 'Intro',
      handoff: { IMAGE: {} as any, MOTION: {} as any, SUNO: {} as any },
      onScreenText: null
    },
    {
      id: 2,
      architecture: {
        source: { status: 'OK', sourceId: '2', exactText: 'text 2', notice: null },
        beat: 'orient',
        dominantSubject: 'subject 2',
        event: 'event 2',
        imageVantage: '50mm eye-level close',
        semanticFingerprint: '456'
      },
      imagePrompt: cleanImagePrompt(2),
      motionPrompt: cleanMotionPrompt(2),
      voiceOver: 'vo 2',
      sunoBrief: 'suno 2',
      durationSec: 3.5,
      duration: { sec: 3.5, usable: 3.5, ok: true, level: 'OK', shots: 1, perShot: 3.5, message: '' },
      intensity: 0.6,
      phaseName: 'Build-up',
      handoff: { IMAGE: {} as any, MOTION: {} as any, SUNO: {} as any },
      onScreenText: null
    },
    {
      id: 3,
      architecture: {
        source: { status: 'OK', sourceId: '3', exactText: 'text 3', notice: null },
        beat: 'orient',
        dominantSubject: 'subject 3',
        event: 'event 3',
        imageVantage: '85mm high close',
        semanticFingerprint: '789'
      },
      imagePrompt: cleanImagePrompt(3),
      motionPrompt: cleanMotionPrompt(3),
      voiceOver: 'vo 3',
      sunoBrief: 'suno 3',
      durationSec: 3.0,
      duration: { sec: 3.0, usable: 3.0, ok: true, level: 'OK', shots: 1, perShot: 3.0, message: '' },
      intensity: 0.7,
      phaseName: 'Climax',
      handoff: { IMAGE: {} as any, MOTION: {} as any, SUNO: {} as any },
      onScreenText: null
    }
  ];

  return {
    selectedProjectId: 'education',
    projectTopic: 'Test Topic',
    projectClass: 'ANIMATION_EDU',
    sceneCount: 3,
    cast: '',
    location: '',
    subject: 'Test Subject',
    recipeScenes: [],
    selectedWorldId: 'paper_craft_popup',
    selectedPropId: 'none',
    selectedRefIds: [],
    activePreviewRefId: '',
    selectedPaletteId: 'native_world',
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
    brandKitLock: '',
    mood: '',
    cameraEnergy: '',
    timeLight: '',
    transition: '',
    musicVibe: '',
    pov: '',
    signature: '',
    leitmotif: '',
    tempoCurve: '',
    phase0PresetId: '',
    directorChoices: {},
    directorBrief: '',
    voSyncMode: 'FREE',
    osTextMode: 'AUTO',
    rawSource: 'Test source',
    sourceBeats: [],
    sourceReport: { ok: true, coverage: 100, rawHash: 'hash', reconHash: 'hash', rawChars: 100, sceneChars: 100, segments: 1 },
    agentBrief: '',
    agentPackets: null,
    selectedSceneId: null,
    isGenerating: false,
    lastError: null,
    beatMode: 'Dengeli',
    workingMode: 'Standart',
    beatKeeps: {},
    beatAnalysis: null,
    beatHistory: [],
    personalMode: false,
    currentStep: 'qa',
    scenes,
    ...overrides
  } as unknown as StudioState;
}

// ——— Hostile-firewall yardımcıları ———
// Tasarım (faz2_framework.test.ts:125 ile tutarlı): guard bağlamları (negative_lock
// verbatim, agentBrief '**Avoid:**' satırı, example_injection 'AVOID:' kuyruğu,
// prompt 'Negative:'/'NEGATIVE:' bölümleri) yasak isimleri MEŞRU olarak taşır.
// Firewall'un iddiası: isimler POZİTİF (motora bir şey ÇİZDİREN) metne sızmaz.
// Bu yardımcılar export objesini o pozitif metne indirger.
function positiveTextOfLine(line: string): string {
  // Satırın tamamı yasak-enumerasyonu: "NO Luffy, NO Zoro, ..." / madde imli NO
  if (/^\s*[-•*]?\s*NO /.test(line)) return '';
  // Guard işaretinden sonrası yasak-enumerasyonu — işarete KADARki pozitif kısım kalır
  let cut = line.length;
  for (const re of [/\*\*Avoid:\*\*/, /\bAVOID:/, /\bNegative:/, /\bNEGATIVE:/]) {
    const i = line.search(re);
    if (i >= 0 && i < cut) cut = i;
  }
  return line.slice(0, cut);
}

function collectPositiveStrings(node: unknown, path: string, out: Array<{ path: string; text: string }>): void {
  if (typeof node === 'string') {
    out.push({ path, text: node.split('\n').map(positiveTextOfLine).join('\n') });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectPositiveStrings(v, `${path}[${i}]`, out));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (/negative/i.test(k)) continue; // negative_lock vb. guard dalları — verbatim tasarım
      collectPositiveStrings(v, `${path}.${k}`, out);
    }
  }
}

describe('Director Cabinet Evidence-Based QA', () => {

  test('deterministic output', () => {
    const state = createMockState();
    const result1 = evaluateDirectorCabinet(state);
    const result2 = evaluateDirectorCabinet(state);
    expect(result1).toEqual(result2);
  });

  test('every returned tip has evidence.length > 0', () => {
    const state = createMockState();
    const tips = evaluateDirectorCabinet(state);
    expect(tips.length).toBeGreaterThan(0);
    for (const tip of tips) {
      expect(tip.evidence.length).toBeGreaterThan(0);
    }
  });

  test('generic-fallback detection fires on a scene containing "teaching mechanism"', () => {
    const state = createMockState();
    state.scenes[0].architecture.dominantSubject = 'a teaching mechanism';
    const tips = evaluateDirectorCabinet(state);
    const cTip = tips.find(t => t.skill === 'conceptualization')!;
    expect(cTip.success).toBe(false);
    expect(cTip.sceneIds).toContain(1);
    expect(cTip.evidence.some(e => e.includes('teaching mechanism'))).toBe(true);
  });

  test('unreadable-text check fires (onScreenText + 2.0s duration)', () => {
    const state = createMockState();
    state.scenes[0].onScreenText = 'some text';
    state.scenes[0].durationSec = 2.0;
    const tips = evaluateDirectorCabinet(state);
    const vcTip = tips.find(t => t.skill === 'visual_calculus')!;
    expect(vcTip.success).toBe(false);
    expect(vcTip.sceneIds).toContain(1);
    expect(vcTip.evidence.some(e => e.includes('okunamaz'))).toBe(true);
  });

  test('volition fails when encyclopedia fails', () => {
    const state = createMockState();
    state.sourceReport = { ok: false, coverage: 50, rawHash: 'a', reconHash: 'b', rawChars: 100, sceneChars: 50, segments: 1 };
    const tips = evaluateDirectorCabinet(state);

    const eTip = tips.find(t => t.skill === 'encyclopedia')!;
    expect(eTip.success).toBe(false);

    const vTip = tips.find(t => t.skill === 'volition')!;
    expect(vTip.success).toBe(false);
    expect(vTip.evidence.some(e => e.includes('Encyclopedia kontrolleri başarısız'))).toBe(true);
  });

  // sourceIntegrity(): coverage bozuk kaynakta bir UZUNLUK ORANIna düşer
  // (source.ts: reconstructed.length / rawVault.length). Aynı uzunlukta ama
  // tamamen farklı bir metin → ok=false ama coverage=100. QA yalnız coverage'a
  // baktığı sürece bozuk kaynak "Kaynak bütünlüğü %100" yazıp export'u açıyordu.
  // Otorite coverage değil, ok/hash eşitliğidir.
  test('encyclopedia fails when source is corrupt even though coverage reads 100', () => {
    const state = createMockState();
    state.sourceReport = { ok: false, coverage: 100, rawHash: 'a', reconHash: 'b', rawChars: 100, sceneChars: 100, segments: 1 };
    const tips = evaluateDirectorCabinet(state);

    const eTip = tips.find(t => t.skill === 'encyclopedia')!;
    expect(eTip.success).toBe(false);
    expect(eTip.evidence.some(e => /bütünlüğü bozuk|hash/i.test(e))).toBe(true);

    // Kapı gerçekten kapanmalı — kanıt export firewall'ından geçsin.
    expect(exportGateStatus(tips).blocked).toBe(true);
  });

  test('volition passes on a clean state', () => {
    const state = createMockState();
    const tips = evaluateDirectorCabinet(state);
    const vTip = tips.find(t => t.skill === 'volition')!;
    expect(vTip.success).toBe(true);
  });

  test('Export firewall: Persona flavors do not leak into production JSON', () => {
    const state = createMockState();
    const tips = evaluateDirectorCabinet(state);

    const cmdState = state as any;
    const cmd = buildCommandJSON(cmdState);
    const prod = buildProductionExport(cmdState);

    const cmdStr = JSON.stringify(cmd);
    const prodStr = JSON.stringify(prod);

    // PROMPT_SURGEON's distinctive persona strings are part of the firewall too.
    const forbidden = ["Sire", "Kim ve Harry", "Inland", "Volition", "Cabinet", "halüsinasyon", "Neşter", "ameliyat", "prompt_surgeon", "kanıyor"];

    // KANIT ÖN-KOŞULU (vacuity kilidi): persona dili tips metinlerinde GERÇEKTEN
    // üretiliyor — "kaynak yok, sızıntı da yok" trivially-pass'ini keser. Temiz
    // state'te cerrahın success-personası deterministik olarak 'Neşter' taşır.
    const tipText = tips.map(t => t.text).join(' ');
    expect(tipText, "Cerrah success-persona metni ('Neşter…') tips'te yok — firewall'un tarayacağı kaynak kayboldu").toMatch(/Neşter/i);
    const present = forbidden.filter(f => tipText.toLowerCase().includes(f.toLowerCase()));
    expect(present.length, 'Yasaklı persona dilinin HİÇBİRİ tips\'te üretilmiyor — test vacuous').toBeGreaterThan(0);

    for (const f of forbidden) {
      expect(cmdStr.toLowerCase().includes(f.toLowerCase())).toBe(false);
      expect(prodStr.toLowerCase().includes(f.toLowerCase())).toBe(false);
    }

    for (const tip of tips) {
      if (tip.text.length > 12) {
        const substring = tip.text.substring(0, 13);
        expect(cmdStr).not.toContain(substring);
        expect(prodStr).not.toContain(substring);
      }
    }
  });

  test('Export firewall: IP character names do not leak into production JSON', () => {
    const state = createMockState();
    const cmdState = state as any;
    const cmd = buildCommandJSON(cmdState);
    const prod = buildProductionExport(cmdState);

    const cmdStr = JSON.stringify(cmd).toLowerCase();
    const prodStr = JSON.stringify(prod).toLowerCase();

    // These names are used in UI as avatars/advisors. They MUST NOT enter the generated brief or recipe.
    // Word-boundary tarama: substring hali kırılgandı ('nami' ⊂ 'dynamic',
    // 'levi' ⊂ 'television' — fixture kelime seçimine göre yalancı kırmızı).
    const forbidden = ["luffy", "tanjiro", "ichigo", "zoro", "sanji", "rengoku", "tengen", "killua", "jinwoo", "levi", "gojo", "naruto"];

    for (const f of forbidden) {
      const re = new RegExp(`\\b${f}\\b`, 'i');
      expect(re.test(cmdStr), `'${f}' cmd export'unda geçiyor`).toBe(false);
      expect(re.test(prodStr), `'${f}' prod export'unda geçiyor`).toBe(false);
    }
  });

  test('Export firewall (hostile, gerçek generateBatch): One Piece isimleri pozitif prompt/export bağlamına sızmaz', () => {
    // Mock-state kolu vacuous'tu: temiz fixture'dan 'luffy' zaten hiçbir yoldan
    // üretilemez, firewall kodu silinse de test geçerdi. Bu kol GERÇEK üretim
    // çıktısını koşturur — export guard bağlamında isimler bilfiil VARKEN
    // pozitif bağlamın temiz kaldığını kanıtlar.
    const IP_NAMES = /\b(luffy|zoro|nami|sanji|chopper|robin|franky|brook|shanks|straw hat|jolly roger)\b/i;
    const out = generateBatch({
      projectTopic: 'Fırtınada rota bulmak', projectClass: 'STYLIZED_PREMIUM', sceneCount: 3, cast: '',
      selectedWorldId: 'one_piece_toei', selectedPropId: 'none',
      selectedRefIds: ['one_piece_sunny_adventure', 'onepiece_grandline_scale'],
      selectedPaletteId: 'native_world', selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3',
    } as any);
    expect(out.status, 'gerçek batch üretilemedi — hostile kol kanıtsız kalır').toBe('GENERATED');
    expect(out.scenes.length).toBeGreaterThan(0);

    // (a) Sahne-pozitif bağlam: Negative bölümleri hariç prompt metni isim taşımaz.
    for (const s of out.scenes) {
      const imgPos = (s.imagePrompt || '').split(/\bNegative:/)[0];
      const motPos = (s.motionPrompt || '').split(/\nNEGATIVE:/)[0];
      expect(IP_NAMES.test(imgPos), `Sahne ${s.id} imagePrompt POZİTİF bağlamında IP ismi: '${imgPos.match(IP_NAMES)?.[0]}'`).toBe(false);
      expect(IP_NAMES.test(motPos), `Sahne ${s.id} motionPrompt POZİTİF bağlamında IP ismi: '${motPos.match(IP_NAMES)?.[0]}'`).toBe(false);
    }

    // (c) Firewall MEKANİZMASI kanıtı: image Negative bölümü scrub'lanmış —
    // scrubImageNegatives (brain.ts) isim-enumerasyonunu 'copied characters'
    // jeneriğine indirir. Jenerik VAR + isim YOK = scrub gerçekten koştu.
    const negSection = (out.scenes[0].imagePrompt || '').split(/\bNegative:/)[1];
    expect(negSection, 'imagePrompt Negative bölümü yok — scrub kanıtı kurulamıyor').toBeDefined();
    expect(negSection, 'scrubImageNegatives jeneriği kayıp — scrub koşmamış olabilir').toContain('copied characters');
    expect(IP_NAMES.test(negSection!), `image Negative bölümünde IP ismi kaldı: '${negSection!.match(IP_NAMES)?.[0]}'`).toBe(false);

    // (b) Export-pozitif bağlam: guard dalları (negative_lock, Avoid/AVOID/Negative
    // satır kuyrukları) atlanır, kalan TÜM string değerler isim taşımamalı.
    const state = createMockState({
      selectedWorldId: 'one_piece_toei', projectClass: 'STYLIZED_PREMIUM',
      selectedRefIds: ['one_piece_sunny_adventure', 'onepiece_grandline_scale'],
      videoModel: 'kling_3',
    } as Partial<StudioState>);
    state.scenes = out.scenes as any;
    state.sceneCount = out.scenes.length;
    (state as any).agentBrief = (out as any).agentBrief ?? '';
    const cmd = buildCommandJSON(state as any);
    const prod = buildProductionExport(state as any);

    // Anti-vacuity: HAM export isimleri guard bağlamında BİLFİİL taşıyor
    // (negative_lock verbatim tasarımı) — yani tarama evreni gerçekten dolu.
    expect(/\bluffy\b/i.test(JSON.stringify(cmd)), 'export guard bağlamı bile isimsiz — hostile kol vacuous, senaryo yanlış kurulmuş').toBe(true);

    for (const [name, obj] of [['cmd', cmd], ['prod', prod]] as const) {
      const positives: Array<{ path: string; text: string }> = [];
      collectPositiveStrings(obj, name, positives);
      expect(positives.length, `${name} pozitif string evreni boş — walker kırık`).toBeGreaterThan(0);
      const leaks: string[] = [];
      for (const p of positives) {
        const m = p.text.match(IP_NAMES);
        if (m) {
          const i = p.text.search(IP_NAMES);
          leaks.push(`${p.path}: …${p.text.slice(Math.max(0, i - 70), i + 40)}…`);
        }
      }
      expect(leaks, `IP ismi POZİTİF export bağlamına sızdı:\n${leaks.join('\n')}`).toEqual([]);
    }
  });

});

describe('PROMPT SURGEON (7th voice — prompt linting)', () => {

  const surgeonOf = (state: StudioState) => evaluateDirectorCabinet(state).find(t => t.skill === 'prompt_surgeon')!;
  const volitionOf = (state: StudioState) => evaluateDirectorCabinet(state).find(t => t.skill === 'volition')!;

  test('REGRESSION — the brain\'s own generated prompts pass the surgeon clean', () => {
    // The surgeon must never block the app's real output (hex used to leak via
    // paletteLight, and the image Negative line names '4K' as a prohibition).
    for (const worldId of ['pixar_3d_edu', 'ghibli_hayao', 'demon_slayer_ufotable']) {
      const out = generateBatch({
        projectTopic: 'Su Döngüsü', projectClass: 'EĞİTİM_01', sceneCount: 3, cast: '',
        selectedWorldId: worldId, selectedPropId: 'none',
        selectedRefIds: ['kubrick_one_point'], selectedPaletteId: 'native_world',
        selectedMusicId: '', imageModel: 'nano_banana_2', videoModel: 'seedance_2',
      } as any);
      const state = createMockState({ selectedWorldId: worldId, videoModel: 'seedance_2' } as Partial<StudioState>);
      state.scenes = out.scenes as any;
      state.sceneCount = out.scenes.length;
      const ps = surgeonOf(state);
      expect(ps.success, `${worldId}: ${ps.evidence.join(' | ')}`).toBe(true);
    }
  });

  test('clean prompts → no findings, success, volition unblocked', () => {
    const state = createMockState();
    const ps = surgeonOf(state);
    expect(ps).toBeDefined();
    expect(ps.success).toBe(true);
    expect(ps.evidence.length).toBeGreaterThan(0);
    expect(volitionOf(state).success).toBe(true);
  });

  test('CHECK 1 — hex leak in motionPrompt → medium finding with FIX, blocks volition', () => {
    const state = createMockState();
    state.scenes[0].motionPrompt = state.scenes[0].motionPrompt.replace('Rhythm:', 'Palette drifts toward #FF0000 accent. Rhythm:');
    const ps = surgeonOf(state);
    expect(ps.success).toBe(false);
    expect(ps.level).toBe('Medium');
    expect(ps.sceneIds).toContain(1);
    expect(ps.evidence.some(e => e.includes('#FF0000'))).toBe(true);
    expect(ps.evidence.some(e => e.startsWith('FIX (Sahne 1)') && e.includes('#FF0000'))).toBe(true);
    const v = volitionOf(state);
    expect(v.success).toBe(false);
    expect(v.text).toContain('prompt_surgeon');
  });

  test('CHECK 1 — 8-digit #RRGGBBAA hex leak is caught', () => {
    // Eski HEX_RE'nin \b çapası 8-haneliyi HİÇ eşleştirmiyordu (6'lı alternatif
    // #FF0000'ı yer, '0'dan '8'e boundary yok → fail) → Translation Law ihlali
    // QA'dan sessizce geçiyordu.
    const state = createMockState();
    state.scenes[0].imagePrompt += ' Accent glow #FF000080 over the rim.';
    const ps = surgeonOf(state);
    expect(ps.success).toBe(false);
    expect(ps.level).toBe('Medium');
    expect(ps.sceneIds).toContain(1);
    expect(ps.evidence.some(e => e.includes('#FF000080'))).toBe(true);
    // FIX satırı ham hex'i çeviri diye geri yankılamamalı — anlamlı ışık dili vermeli.
    expect(ps.evidence.some(e => e.includes("→ '#FF000080'"))).toBe(false);
    expect(ps.evidence.some(e => e.startsWith('FIX (Sahne 1)') && e.includes("'#FF000080' → '"))).toBe(true);
  });

  test('CHECK 1 — 4-digit #RGBA hex leak is caught', () => {
    const state = createMockState();
    state.scenes[0].motionPrompt = state.scenes[0].motionPrompt.replace('Rhythm:', 'Palette drifts toward #F00A accent. Rhythm:');
    const ps = surgeonOf(state);
    expect(ps.success).toBe(false);
    expect(ps.level).toBe('Medium');
    expect(ps.evidence.some(e => e.includes('#F00A'))).toBe(true);
  });

  test('CHECK 1 — FIX line speaks the same light language as the prompt path (hexToLightWords, tek kaynak)', () => {
    // Palette Translation Law tek sözlükten konuşur: QA'nın FIX çevirisi,
    // buildImagePrompt'un palet dilini üreten brain.hexToLightWords ile aynı olmalı.
    // (#FFC93C → 'vivid warm amber'; ayrışık bir QA sözlüğü 'saturated warm orange' derdi.)
    const state = createMockState();
    state.scenes[0].imagePrompt += ' Accent glow of #FFC93C over the rim.';
    const ps = surgeonOf(state);
    expect(ps.success).toBe(false);
    expect(ps.evidence.some(e => e.startsWith('FIX (Sahne 1)') && e.includes("'#FFC93C' → 'vivid warm amber light'"))).toBe(true);
  });

  test('CHECK 1 — hex inside the render-lock block of imagePrompt is exempt', () => {
    const state = createMockState({ selectedWorldId: 'ghibli_hayao' } as Partial<StudioState>);
    // World data no longer carries raw hex (Translation Law) — the lock block is
    // clean by contract. First half proves a lock-prefixed prompt passes untouched;
    // second half proves hex outside the lock is still flagged.
    const lock = renderLockTextFor(state);
    // Vacuity kilidi: renderLockTextFor '' dönerse (world lookup kırık) testin iki
    // yarısı da lock'suz prompt'la sessizce geçiyordu — boş lock artık patlar.
    expect(lock.trim().length, 'renderLockTextFor boş döndü — exemption hiç denenmiyor, test vacuous').toBeGreaterThan(0);
    expect(lock).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    state.scenes[0].imagePrompt = `${lock}\n${cleanImagePrompt(1)}`;
    const ps = surgeonOf(state);
    expect(ps.evidence.some(e => e.includes('hex'))).toBe(false);
    expect(ps.success).toBe(true);

    // ...but the same hex OUTSIDE the lock block is flagged.
    state.scenes[0].imagePrompt = `${lock}\n${cleanImagePrompt(1)} Accent rim of #3A2418.`;
    const ps2 = surgeonOf(state);
    expect(ps2.success).toBe(false);
    expect(ps2.evidence.some(e => e.includes('#3A2418') && e.includes('Sahne 1'))).toBe(true);
    // Strip hassasiyeti kanıtı: hex bulgusu SADECE lock-dışı hex'i işaret etmeli —
    // bulgu satırında '#3A2418' dışında hex yok, lock metninden parça da yok
    // (strip kodu bozulup lock taransaydı bulgu lock bağlamı taşırdı).
    const hexLine = ps2.evidence.find(e => e.includes('Ham hex sızıntısı'));
    expect(hexLine, 'Ham hex sızıntısı bulgusu bekleniyordu').toBeDefined();
    const hexesInFinding = [...(hexLine!.match(/#[0-9a-fA-F]{3,8}/g) ?? [])];
    expect(hexesInFinding, `Bulgu birden fazla/yanlış hex işaret ediyor: ${hexesInFinding.join(', ')}`).toEqual(['#3A2418']);
    const lockFragment = lock.slice(0, 40);
    expect(ps2.evidence.some(e => e.includes(lockFragment)), 'Bulgu kanıtı lock metninden parça taşıyor — strip şüpheli').toBe(false);
  });

  test('CHECK 2 — AI-slop stacking → medium finding with FIX', () => {
    const state = createMockState();
    state.scenes[1].imagePrompt += ' masterpiece, ultra-detailed, trending on artstation, 8k.';
    const ps = surgeonOf(state);
    expect(ps.success).toBe(false);
    expect(ps.level).toBe('Medium');
    expect(ps.sceneIds).toContain(2);
    expect(ps.evidence.some(e => e.includes('masterpiece') && e.includes('AI-slop'))).toBe(true);
    expect(ps.evidence.some(e => e.startsWith('FIX (Sahne 2)'))).toBe(true);
  });

  test('CHECK 2 — extended slop lexicon: stunning / ultra realistic / cinematic lighting flagged', () => {
    const state = createMockState();
    state.scenes[0].imagePrompt += ' stunning, ultra realistic, cinematic lighting.';
    const ps = surgeonOf(state);
    expect(ps.success).toBe(false);
    expect(ps.level).toBe('Medium');
    expect(ps.sceneIds).toContain(1);
    expect(ps.evidence.some(e => e.includes("'stunning'"))).toBe(true);
    expect(ps.evidence.some(e => e.includes("'ultra realistic'"))).toBe(true);
    expect(ps.evidence.some(e => e.includes("'cinematic lighting'"))).toBe(true);
  });

  test('CHECK 2 — Engine grammar sentence is exempt from the slop scan', () => {
    // Motor lehçesi metni (Veo 'cinematic grammar', Hailuo 'dynamic clarity' ailesi)
    // model çıktısı değil motor YASASI — grammar cümlesi slop taramasına girmez.
    const state = createMockState();
    state.scenes[0].motionPrompt = state.scenes[0].motionPrompt.replace(
      'Engine grammar (Kling 3): one continuous action, plain present tense. ',
      'Engine grammar (Kling 3): avoid stunning filler; one continuous action, plain present tense. ');
    const ps = surgeonOf(state);
    expect(ps.evidence.some(e => e.includes('AI-slop dolgu tespit edildi'))).toBe(false);
    expect(ps.success).toBe(true);

    // ...ama AYNI token grammar cümlesinin DIŞINDA flag'lenir.
    const state2 = createMockState();
    state2.scenes[0].motionPrompt = state2.scenes[0].motionPrompt.replace(
      'Rhythm: gentle', 'Rhythm: stunning, gentle');
    const ps2 = surgeonOf(state2);
    expect(ps2.success).toBe(false);
    expect(ps2.evidence.some(e => e.includes('AI-slop') && e.includes("'stunning'"))).toBe(true);
  });

  test('CHECK 2 — image Negative tail naming slop words stays exempt', () => {
    const state = createMockState();
    state.scenes[0].imagePrompt += '\nNegative: empty adjectives (cinematic, dynamic, stunning, 4K); flat slide.';
    const ps = surgeonOf(state);
    expect(ps.evidence.some(e => e.includes('AI-slop dolgu tespit edildi'))).toBe(false);
    expect(ps.success).toBe(true);
  });

  test('CHECK 2 — render-lock text is exempt from the slop scan (imgSansLock)', () => {
    const state = createMockState({ selectedWorldId: 'ghibli_hayao' } as Partial<StudioState>);
    const lock = renderLockTextFor(state);
    state.scenes[0].imagePrompt = `${lock}\n${cleanImagePrompt(1)}`;
    const ps = surgeonOf(state);
    expect(ps.evidence.some(e => e.includes('AI-slop dolgu tespit edildi'))).toBe(false);
    expect(ps.success).toBe(true);
  });

  test('CHECK 3 — triad: missing subject/light/camera legs listed in one finding', () => {
    const state = createMockState();
    state.scenes[2].imagePrompt = 'A quiet field of drifting dust.';
    const ps = surgeonOf(state);
    expect(ps.success).toBe(false);
    expect(ps.level).toBe('Medium');
    expect(ps.sceneIds).toContain(3);
    const triadLine = ps.evidence.find(e => e.includes('Triad eksik'))!;
    expect(triadLine).toContain('özne');
    expect(triadLine).toContain('ışık');
    expect(triadLine).toContain('kamera');
    expect(ps.evidence.some(e => e.startsWith('FIX (Sahne 3)') && e.includes('Dominant element'))).toBe(true);
    // exactly one triad finding for the scene (legs are merged, not separate findings)
    expect(ps.evidence.filter(e => e.includes('Triad eksik')).length).toBe(1);
  });

  test('CHECK 4 — trigger-word residue is low severity and does NOT block volition', () => {
    const state = createMockState();
    state.scenes[0].motionPrompt = state.scenes[0].motionPrompt
      .replace('Rhythm: gentle;', 'Rhythm: the fold suddenly begins to settle;');
    const ps = surgeonOf(state);
    expect(ps.success).toBe(false);
    expect(ps.level).toBe('Easy');
    expect(ps.evidence.some(e => e.includes("'suddenly'") && e.includes("'begins to'"))).toBe(true);
    expect(ps.evidence.some(e => e.startsWith('FIX (Sahne 1)'))).toBe(true);
    expect(volitionOf(state).success).toBe(true);
  });

  test('CHECK 4 — trigger words in NEGATIVE line and Engine grammar sentence are exempt', () => {
    const state = createMockState();
    state.scenes[0].motionPrompt =
      `[1] MOTION (i2v · plays the approved start frame)\n` +
      `Camera: slow push-in on subject 1. ` +
      `Motion brief (Claude yazar): source beat "${FIXTURE_BEATS[1]}" [SOURCE — narration only]. ` +
      `Rhythm: gentle; everything settles naturally into a stable 1-1.5s final hold. ` +
      `Engine grammar (Kling 3): never write ready to, suddenly or begins to; state one continuous action. ` +
      `Everything not named stays exactly as the start frame shows.\n` +
      `NEGATIVE: morphing, suddenly appears, transforms mid-shot, flicker.`;
    const ps = surgeonOf(state);
    expect(ps.evidence.some(e => e.includes('tetik kelimesi kalıntısı'))).toBe(false);
    expect(ps.evidence.some(e => e.startsWith('FIX'))).toBe(false);
    expect(ps.success).toBe(true);
  });

  test('CHECK 5 — NEGATIVE duplicate items → low finding with deduped paste-ready FIX', () => {
    const state = createMockState();
    state.scenes[0].motionPrompt = state.scenes[0].motionPrompt
      .replace('NEGATIVE: morphing, warping, flicker.', 'NEGATIVE: morphing, warping, Morphing, flicker.');
    const ps = surgeonOf(state);
    expect(ps.success).toBe(false);
    expect(ps.level).toBe('Easy');
    expect(ps.evidence.some(e => e.includes('mükerrer') && e.includes("'morphing'"))).toBe(true);
    expect(ps.evidence.some(e => e.startsWith('FIX (Sahne 1): NEGATIVE: morphing, warping, flicker'))).toBe(true);
    expect(volitionOf(state).success).toBe(true);
  });

  test('CHECK 5 — NEGATIVE with more than 18 items → low finding', () => {
    const state = createMockState();
    const items = Array.from({ length: 20 }, (_, i) => `bad-thing-${i + 1}`).join(', ');
    state.scenes[0].motionPrompt = state.scenes[0].motionPrompt
      .replace('NEGATIVE: morphing, warping, flicker.', `NEGATIVE: ${items}.`);
    const ps = surgeonOf(state);
    expect(ps.success).toBe(false);
    expect(ps.level).toBe('Easy');
    expect(ps.evidence.some(e => e.includes('şişkin') && e.includes('20 madde'))).toBe(true);
    expect(volitionOf(state).success).toBe(true);
  });

  // ===== CHECK 6 / 6b — ÖLÜ KOD SÖKÜLDÜ, NİYET GERÇEK YÜZEYE KABLOLANDI (T5) =====
  // ESKİDEN: check'ler 'Moving element:' / 'Event:' etiketlerini arıyordu. FAZ2'de banka
  // söküldü; buildMotionPrompt bu etiketleri ARTIK HİÇ BASMIYOR. Testler elle yazılmış
  // fixture'larla yeşil tutuluyordu — brain.test.ts ise aynı anda TERSİNİ garanti ediyordu.
  // ŞİMDİ: CHECK 6 = motora giden MOTION GÖVDESİ klonu, CHECK 6b = taşınan KAYNAK BEAT klonu.
  // İkisi de gerçek çıktının yüzeyine bakar; ikisi de gerçek generateBatch ile kırmızıya düşer.

  test('CHECK 6 — klonlanmış motion gövdesi (≥2 sahne birebir aynı) → Medium, volition bloke', () => {
    const state = createMockState();
    // İki sahneye AYNI motion gövdesi — sadece sahne adresi farklı.
    state.scenes[1].motionPrompt = state.scenes[0].motionPrompt.replace('[1]', '[2]');
    const ps = surgeonOf(state);
    expect(ps.success).toBe(false);
    expect(ps.level).toBe('Medium');
    expect(ps.evidence.some(e => e.includes('Klonlanmış MOTION'))).toBe(true);
    expect(ps.sceneIds?.length).toBeGreaterThanOrEqual(2);
    expect(volitionOf(state).success).toBe(false);
  });

  test('CHECK 6 — sahne adresi ([N]) klonu MASKELEYEMEZ (adres içerik değildir)', () => {
    const state = createMockState();
    state.scenes[1].motionPrompt = state.scenes[0].motionPrompt.replace('[1]', '[2]');
    // İki gövde sadece '[1]' vs '[2]' ile ayrışıyor — string olarak farklı ama motor için AYNI.
    expect(state.scenes[0].motionPrompt).not.toBe(state.scenes[1].motionPrompt);
    const ps = surgeonOf(state);
    expect(ps.evidence.some(e => e.includes('Klonlanmış MOTION')), 'adres soyulmadı → klon kaçtı').toBe(true);
  });

  test('CHECK 6 — gövdeler gerçekten farklıysa klon bulgusu YOK', () => {
    const state = createMockState();
    const ps = surgeonOf(state);
    expect(ps.success, ps.evidence.join('\n')).toBe(true);
    expect(ps.evidence.some(e => e.includes('Klonlanmış MOTION'))).toBe(false);
    expect(ps.evidence.some(e => e.includes('Klonlanmış KAYNAK BEAT'))).toBe(false);
  });

  // FALSE-POSITIVE KAPISI 1 — parantez İÇİ ANLAM TAŞIR, silinemez.
  // İlk yazdığım normalizasyon parantez içini komple soyuyordu (ölü TR-graft kırıntısı
  // mirası). Denetçi ajan gösterdi: "(gece)" vs "(gündüz)" klon sayılıp MEŞRU senaryonun
  // export'unu bloklardı. Prompt yolunda soyulacak makine kırıntısı YOK (ölçüm: 0/8).
  test('CHECK 6b — parantezle ayrışan MEŞRU beatler klon sayılmamalı (gece vs gündüz)', () => {
    const state = createMockState();
    state.scenes[0].motionPrompt = state.scenes[0].motionPrompt
      .replace(FIXTURE_BEATS[1], 'Kubbe yavaşça çöker (gece, ay ışığında)');
    state.scenes[1].motionPrompt = state.scenes[1].motionPrompt
      .replace(FIXTURE_BEATS[2], 'Kubbe yavaşça çöker (gündüz, güneşte)');
    const ps = surgeonOf(state);
    expect(ps.evidence.some(e => e.includes('Klonlanmış KAYNAK BEAT')),
      `parantez içi anlam silindi → meşru sahneler klon sayıldı:\n${ps.evidence.join('\n')}`).toBe(false);
    expect(ps.success).toBe(true);
  });

  // FALSE-POSITIVE KAPISI 2 — normalizasyon TÜRKÇE HARFİ ÖĞÜTMEMELİ.
  // '\w' Türkçe tanımaz: 'çöker'→'ker', 'yavaşça'→'yava a'. Bu, FARKLI iki Türkçe beat'i
  // aynı çekirdeğe çökertip klon sanıyordu. '\p{L}' + 'u' bayrağı bunu kapatır.
  test('CHECK 6b — farklı Türkçe beatler harf öğütülmesi yüzünden klon sayılmamalı', () => {
    const state = createMockState();
    state.scenes[0].motionPrompt = state.scenes[0].motionPrompt
      .replace(FIXTURE_BEATS[1], 'Çöken kubbe göğe savrulur');
    state.scenes[1].motionPrompt = state.scenes[1].motionPrompt
      .replace(FIXTURE_BEATS[2], 'Şişen kabuk yavaşça çatlar');
    const ps = surgeonOf(state);
    expect(ps.evidence.some(e => e.includes('Klonlanmış KAYNAK BEAT')),
      `Türkçe harfler öğütülüp iki farklı beat aynı çekirdeğe çöktü:\n${ps.evidence.join('\n')}`).toBe(false);
    expect(ps.success).toBe(true);
  });

  test('CHECK 6b — aynı KAYNAK BEAT + farklı kamera → gövde çakışmasa bile yakalanır', () => {
    const state = createMockState();
    // Kamera havuzu tesadüfen ayırırsa gövde birebir çakışmaz; ama iki plan AYNI olayı anlatır.
    // Ölçüm: topic-only batch'te gövde klonu 27/30 dünyada, beat klonu 30/30 dünyada — beat kontrolü
    // kameranın maskelediği 3 dünyayı da yakalar. Kök neden budur.
    state.scenes[1].motionPrompt = state.scenes[1].motionPrompt
      .replace(FIXTURE_BEATS[2], FIXTURE_BEATS[1]);
    // Gövdeler farklı (kamera satırı ayrı) ama beat aynı:
    expect(state.scenes[0].motionPrompt).not.toBe(state.scenes[1].motionPrompt);
    const ps = surgeonOf(state);
    expect(ps.success, `aynı beat iki sahnede geçti:\n${ps.evidence.join('\n')}`).toBe(false);
    expect(ps.level).toBe('Medium');
    expect(ps.evidence.some(e => e.includes('Klonlanmış KAYNAK BEAT'))).toBe(true);
    expect(ps.evidence.some(e => e.includes('Klonlanmış MOTION')), 'gövdeler farklı, MOTION klonu bildirilmemeli').toBe(false);
    expect(volitionOf(state).success).toBe(false);
  });

  test('CHECK 6b — meşru farklı beatler klon sayılmamalı', () => {
    const state = createMockState();
    const ps = surgeonOf(state);
    expect(ps.evidence.some(e => e.includes('Klonlanmış KAYNAK BEAT'))).toBe(false);
    expect(ps.success).toBe(true);
  });

  // ===== FIXTURE ↔ GERÇEK ÇIKTI SÖZLEŞMESİ =====
  // brain.test.ts ile qa.test.ts'in birbirinin ZIDDINI doğrulamasını yapısal olarak imkânsız kılar.
  test('SÖZLEŞME — fixture motion prompt GERÇEK buildMotionPrompt çıktısının şeklini taşır', () => {
    const out = generateBatch({
      projectTopic: 'El yapımı seramik atölyesinin hikâyesi',
      projectClass: 'ULTRAREAL_COMMERCIAL',
      sceneCount: 3,
      selectedWorldId: 'deakins_naturalist',
      selectedPropId: 'none',
      selectedRefIds: [],
      selectedPaletteId: 'native_world',
      selectedMusicId: '',
      imageModel: 'flux',
      videoModel: 'kling_3',
    } as any);
    const real = String(out.scenes[0].motionPrompt);
    const fixture = cleanMotionPrompt(1);

    // 1) Gerçek çıktı ölü etiketleri BASMIYOR (brain.test.ts'in garantisi) …
    expect(real).not.toContain('Moving element:');
    expect(real).not.toContain('Event:');
    // 2) … ve fixture de basmıyor. Çelişki BİTTİ: iki test dosyası aynı gerçeği söylüyor.
    expect(fixture).not.toContain('Moving element:');
    expect(fixture).not.toContain('Event:');
    // 3) Cerrahın BAKTIĞI yüzeyler her ikisinde de var — check'ler ölü değil, canlı.
    for (const anchor of ['MOTION (i2v', 'Camera:', 'source beat "', 'Rhythm:', 'NEGATIVE:']) {
      expect(real, `gerçek çıktıda '${anchor}' yok — cerrahın yüzeyi kaydı`).toContain(anchor);
      expect(fixture, `fixture'da '${anchor}' yok — fixture gerçekten saptı`).toContain(anchor);
    }
  });

  // ===== GERÇEK ÇIKTIYLA KAPI DENEYİ (fixture değil) =====
  // Aynı dünya, aynı motor; TEK fark Mami'nin girdisi. Check site'in yazdığı string'e değil
  // Mami'nin senaryosuna bakıyorsa: sağlıklı girdi YEŞİL, bozuk girdi KIRMIZI olmalı.
  const realBatch = (raw: string | null, sceneCount: number) => generateBatch({
    projectTopic: 'Yanardağ nasıl patlar?',
    projectClass: 'ders',
    sceneCount,
    ...(raw ? { rawSource: raw, sourceBeats: ingestSource(raw) } : {}),
    selectedWorldId: 'pixar_3d_edu',
    selectedPropId: 'none',
    selectedRefIds: [],
    selectedPaletteId: 'native_world',
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
  } as any);

  const HEALTHY_SCRIPT = [
    'Magma yerin derinliklerinde erimiş kaya olarak birikir.',
    'Basınç yükselir, gazlar kayanın içinde sıkışır.',
    'Kabuk incelir, ilk çatlaklar yüzeyde belirir.',
    'Kubbe çöker ve kül sütunu göğe fırlar.',
  ].join('\n');

  test('KAPI (gerçek generateBatch) — sağlıklı N-beat senaryo → cerrah klon bulgusu ÜRETMEZ', () => {
    const out = realBatch(HEALTHY_SCRIPT, 4);
    const state = createMockState({ selectedWorldId: 'pixar_3d_edu', videoModel: 'kling_3' } as Partial<StudioState>);
    state.scenes = out.scenes as any;
    state.sceneCount = out.scenes.length;
    // Her sahne kendi beat'ini taşır → gövdeler de beatler de farklı.
    const beats = out.scenes.map((s: any) => (String(s.motionPrompt).match(/source beat "(.*?)"/) || [, ''])[1]);
    expect(new Set(beats).size, 'sağlıklı senaryoda her sahne kendi beat\'ini taşımalı').toBe(out.scenes.length);
    const ps = surgeonOf(state);
    expect(ps.evidence.some(e => e.includes('Klonlanmış MOTION')), ps.evidence.join('\n')).toBe(false);
    expect(ps.evidence.some(e => e.includes('Klonlanmış KAYNAK BEAT')), ps.evidence.join('\n')).toBe(false);
  });

  test('KAPI (gerçek generateBatch) — rawSource YOK (store default) → 8 sahne aynı beat\'i taşır, cerrah KIRMIZI', () => {
    // Bu, ölü CHECK 6'nın kaçırdığı gerçek üretim hasarı: store default rawSource:'' ile
    // üretilen batch'te tek beat 8 sahneye kopyalanır. Ölçüm: 30 dünyanın 27'sinde ≥2 sahne
    // BİREBİR AYNI motion gövdesi basıyor. Eski (ölü) cerrah buna "steril" raporu veriyordu.
    const out = realBatch(null, 8);
    const state = createMockState({ selectedWorldId: 'pixar_3d_edu', videoModel: 'kling_3' } as Partial<StudioState>);
    state.scenes = out.scenes as any;
    state.sceneCount = out.scenes.length;

    const beats = out.scenes.map((s: any) => (String(s.motionPrompt).match(/source beat "(.*?)"/) || [, ''])[1]);
    expect(new Set(beats).size, 'topic-only batch tek beat\'i 8 sahneye kopyalamalı (ölçülen davranış)').toBe(1);

    const ps = surgeonOf(state);
    expect(ps.success, 'cerrah 8 klon sahneye TEMİZ raporu veriyor — check yine ölü').toBe(false);
    expect(ps.level).toBe('Medium');
    // RED'i veren CHECK 6'dır: ≥2 sahnenin motora giden talimatı birebir aynı (pixar: 1+4, 3+8).
    expect(ps.evidence.some(e => e.includes('Klonlanmış MOTION'))).toBe(true);
    expect(volitionOf(state).success).toBe(false);
  });

  test('KAPI SINIRI — kaynak YOKken (UNSOURCED_TOPIC_INPUT) CHECK 6b beat tekrarını suçlamaz', () => {
    // Mami henüz senaryo girmediyse pure.ts tek konu cümlesini her sahneye kopyalar ve durumu
    // açıkça 'UNSOURCED_TOPIC_INPUT' ilan eder. Bu EKSİK SENARYO'dur — kaynak katmanı
    // (conceptualization/encyclopedia) zaten bildirir ve export'u blokluyor. Beat tekrarını
    // burada 'monoton motion' diye ikinci kez suçlamak yanlış adrese fatura keser.
    const out = realBatch(null, 3);
    expect((out.scenes[0] as any).architecture.source.status).toBe('UNSOURCED_TOPIC_INPUT');
    const state = createMockState({ selectedWorldId: 'pixar_3d_edu', videoModel: 'kling_3' } as Partial<StudioState>);
    state.scenes = out.scenes as any;
    state.sceneCount = out.scenes.length;
    const ps = surgeonOf(state);
    // 3 sahne aynı beat'i taşır ama kameralar ayrı → gövde çakışmaz → cerrah motion'ı suçlamaz.
    expect(ps.evidence.some(e => e.includes('Klonlanmış KAYNAK BEAT')), 'kaynaksız batch beat klonu diye suçlandı').toBe(false);
    expect(ps.evidence.some(e => e.includes('Klonlanmış MOTION')), ps.evidence.join('\n')).toBe(false);
  });

  test('REGRESSION — brain real output (deakins_naturalist + kling_3) passes surgeon after fix', () => {
    const out = generateBatch({
      projectTopic: 'El yapımı seramik atölyesinin hikâyesi',
      projectClass: 'ULTRAREAL_COMMERCIAL',
      sceneCount: 3,
      selectedWorldId: 'deakins_naturalist',
      selectedPropId: 'none',
      selectedRefIds: [],
      selectedPaletteId: 'native_world',
      selectedMusicId: '',
      imageModel: 'flux',
      videoModel: 'kling_3',
    } as any);
    // Build a minimal state for the surgeon
    const state = createMockState({ selectedWorldId: 'deakins_naturalist', videoModel: 'kling_3' } as Partial<StudioState>);
    state.scenes = out.scenes as any;
    state.sceneCount = out.scenes.length;
    const ps = surgeonOf(state);
    expect(ps.success, `deakins_naturalist: ${ps.evidence.join(' | ')}`).toBe(true);
    // Specifically confirm no clone finding
    expect(ps.evidence.some(e => e.toLowerCase().includes('klonlanmış'))).toBe(false);
  });

  test('Export firewall extension: PROMPT_SURGEON persona (success AND failure) never leaks into exports', () => {
    const state = createMockState();
    // force both slop (medium) and trigger (low) findings so the failure persona text is generated
    state.scenes[0].imagePrompt += ' masterpiece, 8k.';
    state.scenes[1].motionPrompt = state.scenes[1].motionPrompt.replace('the fold settles', 'the fold suddenly settles');
    const tips = evaluateDirectorCabinet(state);
    const ps = tips.find(t => t.skill === 'prompt_surgeon')!;
    expect(ps.success).toBe(false);

    const cmdStr = JSON.stringify(buildCommandJSON(state as any)).toLowerCase();
    const prodStr = JSON.stringify(buildProductionExport(state as any)).toLowerCase();
    const forbidden = ['neşter', 'ameliyat', 'kanıyor', 'prompt_surgeon', 'steril'];
    for (const f of forbidden) {
      expect(cmdStr).not.toContain(f);
      expect(prodStr).not.toContain(f);
    }
    for (const tip of tips) {
      if (tip.text.length > 12) {
        const substring = tip.text.substring(0, 13).toLowerCase();
        expect(cmdStr).not.toContain(substring);
        expect(prodStr).not.toContain(substring);
      }
    }
  });

  test('Export firewall (hostile, gerçek generateBatch): failure-persona dili tips\'te üretilir ama export\'a sızmaz', () => {
    // Mock-fixture kolunun tamamlayıcısı: GERÇEK üretim sahneleri + kasıtlı slop
    // enjeksiyonu ile failure-persona bilfiil ÜRETİLİR, sonra export taranır.
    const out = generateBatch({
      projectTopic: 'Fırtınada rota bulmak', projectClass: 'STYLIZED_PREMIUM', sceneCount: 3, cast: '',
      selectedWorldId: 'one_piece_toei', selectedPropId: 'none',
      selectedRefIds: ['one_piece_sunny_adventure', 'onepiece_grandline_scale'],
      selectedPaletteId: 'native_world', selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3',
    } as any);
    expect(out.status, 'gerçek batch üretilemedi').toBe('GENERATED');
    const state = createMockState({
      selectedWorldId: 'one_piece_toei', projectClass: 'STYLIZED_PREMIUM', videoModel: 'kling_3',
    } as Partial<StudioState>);
    state.scenes = out.scenes as any;
    state.sceneCount = out.scenes.length;

    // Cerrahı düşürecek kasıtlı-kirli enjeksiyon: motion'ın POZİTİF kısmına slop
    // (imagePrompt sonuna eklemek Negative-bölgesine düşer ve muaf kalırdı).
    state.scenes[0].motionPrompt = state.scenes[0].motionPrompt.replace('Camera:', 'Camera: masterpiece, ultra-detailed');
    expect(state.scenes[0].motionPrompt, 'enjeksiyon tutmadı — Camera: satırı bulunamadı').toContain('masterpiece');

    const tips = evaluateDirectorCabinet(state);
    const ps = tips.find(t => t.skill === 'prompt_surgeon')!;
    expect(ps.success, 'slop enjeksiyonu cerrahı düşürmedi — failure-persona hiç üretilmedi, sızıntı kolu vacuous').toBe(false);

    // Kaynak kanıtı: failure-persona dili gerçekten var.
    const tipText = tips.map(t => t.text).join(' ').toLowerCase();
    for (const f of ['neşter', 'kanıyor', 'ameliyat']) {
      expect(tipText.includes(f), `'${f}' failure-persona metninde bekleniyordu ama yok`).toBe(true);
    }

    // Sızıntı kontrolü: persona dili gerçek-sahneli exportların hiçbir yerinde yok.
    const cmdStr = JSON.stringify(buildCommandJSON(state as any)).toLowerCase();
    const prodStr = JSON.stringify(buildProductionExport(state as any)).toLowerCase();
    for (const f of ['neşter', 'ameliyat', 'kanıyor', 'prompt_surgeon', 'steril', 'halüsinasyon']) {
      expect(cmdStr.includes(f), `'${f}' cmd export'una sızdı`).toBe(false);
      expect(prodStr.includes(f), `'${f}' prod export'una sızdı`).toBe(false);
    }
  });

});

// ---------------------------------------------------------------------------
// QA'nın yeniden kurduğu render-lock, imagePrompt'a GÖMÜLEN lock ile aynı
// olmalı — dosyanın kendi sözü: "Mirror buildImagePrompt's still-frame
// transforms so the reconstructed block matches the lock text actually
// embedded in imagePrompt."
//
// reconcileAspectRatio (path'in dikey sözleşmesi dünyanın yatay oranını ezer)
// buildImagePrompt'a eklendi ama buraya eklenmedi: QA, motora hiç gitmeyen
// "2.39:1"li bir metni doğruluyordu. Sessiz kırık — testi yoktu.
describe('renderLockTextFor — gerçek prompt\'taki lock ile aynı olmalı', () => {
  const reelsState = {
    projectClass: 'SOCIAL_REELS_REALISM',
    selectedWorldId: 'chivo_naturalist_handheld',
    selectedPropId: 'none',
    cast: '',
  } as never as Parameters<typeof renderLockTextFor>[0];

  test('dikey path\'te QA lock\'u da 9:16 taşır, yatay oranı taşımaz', () => {
    const lock = renderLockTextFor(reelsState);
    expect(lock, 'QA motora hiç gitmeyen bir metni doğruluyor').not.toMatch(/2\.39:1/);
    expect(lock).toMatch(/9:16/);
  });

  test('yatay path\'te dünyanın oranı korunur', () => {
    const docState = { ...reelsState, projectClass: 'DOCUMENTARY_REALISM' } as typeof reelsState;
    expect(renderLockTextFor(docState)).toMatch(/1\.85:1 or 2\.39:1/);
  });
});

// Export gate: the Cabinet already computes which voices carry a blocking-level
// failure, but nothing consumed that signal — a red-line FAIL could be exported
// anyway. exportGateStatus makes it a reusable predicate the QA screen can gate on.
describe('exportGateStatus — red-line FAIL blocks export, advisory does not', () => {
  const tip = (over: Partial<QATip>): QATip => ({
    skill: 'encyclopedia', level: 'Medium', success: true, text: '', evidence: [], ...over,
  });

  test('a blocking-level (Challenging) failure blocks and names the offending tips', () => {
    const gate = exportGateStatus([
      tip({ skill: 'visual_calculus', level: 'Easy', success: true }),
      tip({ skill: 'encyclopedia', level: 'Challenging', success: false }),
    ]);
    expect(gate.blocked).toBe(true);
    expect(gate.blocking.map((t) => t.skill)).toContain('encyclopedia');
  });

  test('all-pass leaves export open with nothing blocking', () => {
    const gate = exportGateStatus([
      tip({ skill: 'visual_calculus', level: 'Medium', success: true }),
      tip({ skill: 'drama', level: 'Godly', success: true }),
    ]);
    expect(gate.blocked).toBe(false);
    expect(gate.blocking).toEqual([]);
  });

  test('an Easy/Trivial failure is advisory only — never blocks', () => {
    const gate = exportGateStatus([
      tip({ skill: 'drama', level: 'Easy', success: false }),
      tip({ skill: 'inland_empire', level: 'Trivial', success: false }),
    ]);
    expect(gate.blocked).toBe(false);
    expect(gate.blocking).toEqual([]);
  });
});
