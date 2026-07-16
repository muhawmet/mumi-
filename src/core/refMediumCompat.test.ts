import { describe, expect, it } from 'vitest';
import { DATA, generateBatch, refCompatibleWithWorld, toWorldPacket } from './pure';
import { stripTemporalForStill } from './brain';
import { buildCommandJSON } from './commandExport';
import { ingestSource, sourceIntegrity } from './source';

// ============================================================================
// HARD-FIX 2026-07-16 — rapor D maddeleri (MAMILAS-YERLESIK-YONETMEN raporu).
// Gerçek üretimde ölçülen kusur: Hades-tabanlı 2D ref photoreal product world'e
// "flat 2D illustration / ink-comic" emri taşıdı; world aynı promptta cartoon'u
// yasaklıyordu. Bu testler ÜRETİLEN paketi ölçer, builder sabitini değil.
// ============================================================================

const realWorld = () => DATA.worlds.find((w) => w.id === 'fincher_precision')!;
const animationWorld = () => DATA.worlds.find((w) => w.group === 'ANIMATION_STYLIZED')!;

const STYLIZED_ORPHAN_CAT_RE = /^(2D Animation|Animation Auteur|Animation \/|Anime \/ Shonen|Story DNA|Stylized Premium)/;

describe('madde 18 — worldId olmayan ref evrensel DEĞİL: medium uyumu ölçülür', () => {
  it('worldId taşımayan stilize/animation ref photoreal host ile UYUMSUZ', () => {
    const stylizedOrphans = DATA.refs.filter((r) => !r.worldId && STYLIZED_ORPHAN_CAT_RE.test(r.cat));
    expect(stylizedOrphans.length).toBeGreaterThan(0);
    const host = realWorld();
    for (const ref of stylizedOrphans) {
      expect(refCompatibleWithWorld(ref, host.id), `${ref.id} (${ref.cat}) ${host.id} photoreal host'a sızmamalı`).toBe(false);
    }
  });

  it('worldId taşımayan photoreal-medium ref photoreal host ile uyumlu KALIR', () => {
    const photorealOrphans = DATA.refs.filter(
      (r) => !r.worldId && /^(Cinematography|Documentary|Product \/ Macro|Real Setup|Commercial \/|Fashion|Fine Art|Architecture|Sports)/.test(r.cat),
    );
    expect(photorealOrphans.length).toBeGreaterThan(0);
    const host = realWorld();
    for (const ref of photorealOrphans) {
      expect(refCompatibleWithWorld(ref, host.id), `${ref.id} (${ref.cat}) photoreal host'ta meşru kalmalı`).toBe(true);
    }
  });

  it('worldId taşımayan stilize ref ANIMATION host ile uyumlu kalır (medium eşleşiyor)', () => {
    const ref = DATA.refs.find((r) => !r.worldId && r.cat === '2D Animation')!;
    expect(refCompatibleWithWorld(ref, animationWorld().id)).toBe(true);
  });

  it('kendi dünyasına pinli ref davranışı DEĞİŞMEZ (regresyon)', () => {
    const pinned = DATA.refs.find((r) => r.worldId)!;
    expect(refCompatibleWithWorld(pinned, pinned.worldId!)).toBe(true);
  });

  it('CINEMATIC_REAL→CINEMATIC_REAL cross-world davranışı DEĞİŞMEZ (regresyon)', () => {
    const cinematicPinned = DATA.refs.find((r) => {
      const home = DATA.worlds.find((w) => w.id === r.worldId);
      return home?.group === 'CINEMATIC_REAL';
    });
    if (!cinematicPinned) return;
    const otherReal = DATA.worlds.find((w) => w.group === 'CINEMATIC_REAL' && w.id !== cinematicPinned.worldId)!;
    expect(refCompatibleWithWorld(cinematicPinned, otherReal.id)).toBe(true);
  });
});

describe('madde 22 — still temporal filtre çoğul/tire varyantları', () => {
  it('"smear frames" (çoğul) da süzülür', () => {
    const text = 'Bold cel discipline holds the figure. Smear frames painted not motion-blurred carry the action. Line grammar stays clean.';
    const out = stripTemporalForStill(text);
    expect(out).not.toMatch(/smear frames/i);
    expect(out).toMatch(/Bold cel discipline/);
  });

  it('"smear-frame" (tireli) de süzülür', () => {
    const text = 'The figure reads instantly. Smear-frame transitions blur every limb into streaks. Palette stays regime-bound.';
    const out = stripTemporalForStill(text);
    expect(out).not.toMatch(/smear-frame/i);
  });

  it('forbid cümlesi korunur (yasak adlandırma meşru kalır)', () => {
    const text = 'Forbid smear frames and motion blur in the start frame.';
    expect(stripTemporalForStill(text)).toMatch(/Forbid smear frames/);
  });
});

// Gerçek generateBatch + buildCommandJSON yolu — fixture değil (kanıt disiplini).
function realCommandWith(refIds: string[]) {
  const rawSource = 'Disk plakası sabit hızda döner. Okuma kafası iz üzerinde konumlanır.';
  const sourceBeats = ingestSource(rawSource);
  const sourceReport = sourceIntegrity(rawSource, sourceBeats);
  const base = {
    rawSource,
    sourceBeats,
    projectTopic: 'Sabit Disk',
    projectClass: 'PRODUCT_HERO',
    sceneCount: 2,
    cast: '',
    selectedWorldId: 'fincher_precision',
    selectedPropId: 'none',
    selectedRefIds: refIds,
    selectedPaletteId: '',
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
  };
  const generated = generateBatch(base);
  expect(generated.status).toBe('GENERATED');
  return buildCommandJSON({
    ...base,
    selectedProjectId: 'product_hero',
    brandKitLock: '',
    mood: '', cameraEnergy: '', timeLight: '', transition: '', musicVibe: '',
    pov: '', signature: '', leitmotif: '', tempoCurve: '',
    directorBrief: '',
    sourceReport,
    beatMode: 'Dengeli',
    workingMode: 'Standart',
    beatKeeps: {},
    beatAnalysis: null,
    scenes: generated.scenes,
    agentBrief: '',
    agentPackets: generated.agentPackets ?? { idea: '', image: '', motion: '', suno: '', proof: '' },
  } as never);
}

describe('madde 20/21 — command kanalları tek gerçeklik taşır', () => {
  it('uyumsuz ref command top-level referenceDNA.refs içinde AKTİF DNA olarak kalmaz', () => {
    const incompatible = DATA.refs.find((r) => !r.worldId && r.cat === '2D Animation')!;
    const command = realCommandWith([incompatible.id]);
    const entry = (command as any).referenceDNA?.refs?.find((r: any) => r.id === incompatible.id);
    // Ya hiç girmez ya da açıkça suppressed işaretiyle ve DNA'sız girer — iki gerçeklik yok.
    if (entry) {
      expect(entry.suppressed, `${incompatible.id} suppressed işareti taşımalı`).toBe(true);
      expect(entry.dna ?? '').toBe('');
      expect(entry.use ?? '').toBe('');
    }
  });

  it('Apple markası refDna kanalından da scrub edilir (kanal asimetrisi kapandı)', () => {
    const apple = DATA.refs.find((r) => r.id === 'apple_object_worship');
    if (!apple) return; // veri değişirse sahte kırmızı üretme
    const command = realCommandWith([apple.id]);
    for (const scene of (command as any).scenes ?? []) {
      expect(scene.refDna ?? '').not.toMatch(/\bapple\b/i);
    }
    const topRefs = (command as any).referenceDNA?.refs ?? [];
    for (const entry of topRefs) {
      expect(`${entry.dna ?? ''} ${entry.use ?? ''} ${entry.anchor ?? ''}`).not.toMatch(/\bapple\b/i);
    }
  });
});

describe('madde 23 — imageVantage world lens envelope yasasından geçer', () => {
  it('Chivo (max 35mm) dünyasında round-robin havuzun 50/85mm istekleri clamp edilir', () => {
    const result = generateBatch({
      projectTopic: 'Belediye tanıtımı', projectClass: 'LIVE_ACTION_CORPORATE', sceneCount: 3,
      cast: 'orta yaşlı belediye çalışanı',
      selectedWorldId: 'chivo_naturalist_handheld', selectedPropId: 'none',
      selectedRefIds: [], selectedPaletteId: '', selectedMusicId: '',
      imageModel: 'nano_banana_2', videoModel: 'kling_3',
    });
    expect(result.status).toBe('GENERATED');
    for (const scene of result.scenes) {
      const vantage = (scene as any).architecture.imageVantage as string;
      // World lens envelope 14-35mm: 50mm/85mm vantage'da yaşayamaz.
      expect(vantage, `sahne ${scene.id}: ${vantage}`).not.toMatch(/\b(50|85)mm\b/);
    }
  });
});

describe('madde 18 worldPacket yüzeyi — uyumsuz orphan ref packet refs listesinde compatible:false', () => {
  it('2D orphan ref photoreal worldPacket içinde directive taşımaz', () => {
    const world = realWorld();
    const orphan = DATA.refs.find((r) => !r.worldId && r.cat === '2D Animation')!;
    const packet = toWorldPacket(world, { selectedRefIds: [orphan.id] });
    const entry = packet.refs.find((r) => r.id === orphan.id)!;
    expect(entry.compatible).toBe(false);
    expect(entry.directive).toBe('');
  });
});
