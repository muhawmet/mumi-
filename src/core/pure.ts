// Pure logic extracted from the vanilla app.ts monolith.
// No DOM, no window globals, no side effects. Args in, value out.
// Wraps the keepers (motion-validator, pacing, exporter) for React.

import SURGERY from './SURGERY_DATA.json';
import {
  registerOf, dnaDirectives, primeConcept, primeCamera, buildImagePrompt as brainImagePrompt,
  buildMotionPrompt, primeSuno, durationGuard, buildAgentBrief, primePacket,
  type Concept, type DurationVerdict, type AgentBriefScene,
} from './brain';
import { sourceIntegrity, type SourceBeat } from './source';

// ============================================================
// Types
// ============================================================

export interface SurgeryWorld {
  id: string;
  group: string;
  name: string;
  formula?: string;
  render: string;
  motion?: string;
  best?: string;
  avoid?: string;
  colors?: string[];
  palette?: string[];
  texture?: string;
  lighting?: string;
  compositionConstraint?: string;
  imageVantageConstraint?: string;
  motionNotes?: string;
}

export interface SurgeryRef {
  id: string;
  name: string;
  cat: string;
  use?: string;
  avoid?: string;
  /** In SURGERY_DATA this is a free-text string describing the DNA. */
  dna?: string;
  preview?: string;
  anchor?: string;
  worldId?: string;
}

export interface SurgeryPalette {
  id: string;
  name: string;
  colors: string[];
  c0?: string;
  c1?: string;
  c2?: string;
  c3?: string;
  use?: string;
  avoid?: string;
}

export interface SurgeryData {
  paths: Array<{
    id: string;
    name: string;
    group: string;
    desc?: string;
    icon?: string;
    defaultWorld?: string;
    defaultRef?: string;
    defaultPalette?: string;
    forbidden?: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    tag?: string;
    category?: string;
    path: string;
    world: string;
    ref: string;
    palette: string;
  }>;
  worlds: SurgeryWorld[];
  refs: SurgeryRef[];
  palettes: SurgeryPalette[];
  agents: unknown[];
  golden: unknown[];
  regression: unknown[];
}

export const MOOD_OPTS: Record<string, {label:string, brief:string}> = {
  joy_curiosity:{label:'Neşeli & Merak',brief:'bright, curious and playful - light comedic timing, warm-bright palette lean, upbeat hummable motif, quick but clear pacing'},
  warm_emotional:{label:'Sıcak & Duygusal',brief:'warm and tender - gentle unhurried pacing, soft warm palette, intimate close staging, emotional music motif'},
  epic_excite:{label:'Epik & Heyecan',brief:'bold and exciting - larger scale and stronger contrast, punchy pacing, heroic music build to one peak, confident camera'},
  calm_focus:{label:'Sakin & Huzur',brief:'calm and clear - steady unhurried pacing, clean balanced palette, minimal music and breathing space, clarity-first staging'}
};
export const CAM_OPTS: Record<string, {label:string, brief:string}> = {
  calm_clear:{label:'Sakin & Net',brief:'restrained camera - mostly locked frames and slow motivated dolly, clarity over movement'},
  explore_pov:{label:'Keşifçi & POV',brief:'exploratory camera - lean on inside-object, child-eye and POV reveals, motivated movement that uncovers the idea'},
  cinematic_dramatic:{label:'Sinematik & Dramatik',brief:'cinematic camera - bold motivated moves, strong depth, deliberate reveal timing and scale'}
};
export const LIGHT_OPTS: Record<string, {label:string, brief:string}> = {
  morning:{label:'Sabah',brief:'soft cool morning light, gentle long shadows, fresh clean feel'},
  golden:{label:'Altın Saat',brief:'warm golden-hour light, long amber shadows, premium glow'},
  night:{label:'Gece',brief:'controlled night light, pools of practical light, deep shadow with focused accents'},
  studio:{label:'Stüdyo',brief:'clean controlled studio light, soft key and fill, neutral readable shadows'}
};
export const MUS_OPTS: Record<string, {label:string, brief:string}> = {
  warm_motif:{label:'Sıcak Motif',brief:'warm hummable educational motif - felted piano and soft strings, VO-safe, no vocals unless requested'},
  epic:{label:'Epik',brief:'rising cinematic bed - light percussion building to one peak, VO-safe, no vocals unless requested'},
  curious:{label:'Merak',brief:'playful curious motif - pizzicato or marimba, light and bright, VO-safe, no vocals unless requested'},
  minimal:{label:'Minimal',brief:'minimal sparse texture - one instrument and space, strongly VO-safe, no vocals unless requested'}
};
export const TRANS_OPTS: Record<string, {label:string, brief:string}> = {
  match_cut:{label:'Match-cut',brief:'match-cut between scenes on a shared shape or motion; keep continuity and a stable final hold'},
  morph_safe:{label:'Morph-safe',brief:'morph-safe transitions only - freeze text, logo and face; never melt or morph between scenes'},
  hard_cut:{label:'Sert Kesme',brief:'clean hard cuts on action; no decorative transitions'}
};
export const POV_OPTS: Record<string, {label:string, brief:string}> = {
  child_eye:{label:'Çocuk gözü',brief:'child-eye level POV — frame the idea at a child\'s height and curiosity'},
  object_pov:{label:'Nesne-POV',brief:'object-POV — see from inside or from the lesson/hero object itself'},
  consequence:{label:'Sonuç→sebep',brief:'consequence-to-cause — show the result first, then reveal what caused it'},
  hidden_mech:{label:'Gizli mekanizma',brief:'hidden-mechanism reveal — open the object to show how it works'},
  scale_reveal:{label:'Ölçek reveal',brief:'scale reveal — start tight or wide, then reveal true scale of the idea'},
  locked:{label:'Kilitli kare',brief:'deliberate locked/static frame — stillness that makes the change readable'}
};
export const SIG_OPTS: Record<string, {label:string, brief:string}> = {
  macro_truth:{label:'Makro gerçek',brief:'one macro-truth hero frame — the smallest real detail that carries the whole idea'},
  scale_hero:{label:'Ölçek kahraman',brief:'one scale-hero frame — the subject revealed at its most epic true size'},
  silhouette:{label:'Siluet imza',brief:'one silhouette hero frame — the subject read purely as shape against light'},
  light_shaft:{label:'Işık huzmesi',brief:'one motivated light-shaft frame — a single beam that names the subject'},
  reflection:{label:'Yansıma',brief:'one reflection/echo frame — the subject seen through what it acts upon'}
};
export const LEIT_OPTS: Record<string, {label:string, brief:string}> = {
  color:{label:'Renk motifi',brief:'a recurring colour accent that returns at the open, the turn and the final frame'},
  shape:{label:'Şekil motifi',brief:'a recurring shape/object that reappears and pays off at the end'},
  sound:{label:'Ses motifi',brief:'a recurring musical motif (one short phrase) that returns at each beat'},
  gesture:{label:'Jest motifi',brief:'a recurring human gesture/micro-action that bookends the episode'}
};
export const TEMPO_OPTS: Record<string, {label:string, brief:string}> = {
  gentle:{label:'Yumuşak yay',brief:'gentle rising arc — calm open, soft build, one tender peak, settled close'},
  build_peak:{label:'Yapı→doruk',brief:'curiosity hook -> concept -> build -> single strong climax of understanding -> final teaching frame'},
  punchy:{label:'Tempolu',brief:'punchy episodic — quick hooks and frequent small peaks, energetic throughout, still one clear payoff'},
  slow_burn:{label:'Slow burn',brief:'slow burn — withhold, let tension build, deliver a late reveal then a stable hold'}
};

export const DATA = SURGERY as unknown as SurgeryData;

export interface BriefInput {
  projectKind?: 'video' | 'design';
  rawSource?: string;
  sourceBeats?: SourceBeat[];
  projectTopic: string;
  projectClass: string;
  sceneCount: number;
  cast?: string;
  selectedWorldId: string;
  selectedPropId: string;
  selectedRefIds: string[];
  selectedPaletteId: string;
  selectedMusicId: string;
  imageModel: string;
  videoModel: string;
  brandKitLock?: string;
  mood?: string;
  cameraEnergy?: string;
  timeLight?: string;
  transition?: string;
  musicVibe?: string;
  pov?: string;
  signature?: string;
  leitmotif?: string;
  tempoCurve?: string;
}

export interface RecipeDefaults {
  selectedRefIds: string[];
  selectedPaletteId: string;
}

export interface SceneArchitecture {
  source: { status: string; sourceId: string | null; exactText: string; notice: string | null };
  beat: string;
  dominantSubject: string;
  event: string;
  imageVantage: string;
  semanticFingerprint: string;
}

export interface FinalBrief {
  authority: string[];
  path: string;
  source: SceneArchitecture['source'];
  world: { id: string; renderRecipe: string; texture?: string; lighting?: string };
  recipe: { id: string; source: string };
  referenceDNAs: Array<{
    id: string | null;
    name?: string;
    status: string;
    worldId?: string;
    /** Single line of DNA guidance subordinate to the world. */
    directive: string;
    use?: string;
    avoid?: string;
    suppressedFields: string[];
  }>;
  paletteAccent: { value: string | null; source: string };
}

export interface HandoffPacket {
  packetVersion: '1.0.0';
  packetId: string;
  projectId: string;
  sourceHash: string;
  role: 'IMAGE' | 'MOTION' | 'SUNO';
  scene: {
    id: number;
    sourceId: string | null;
    exactSourceBeat: string;
    sourceStatus: string;
    intent: string;
    dominantSubject: string;
    event: string;
    continuity: {
      previousSceneId: number | null;
      nextSceneId: number | null;
      characterLock: string;
      worldLock: string;
      semanticFingerprint: string;
    };
  };
  world: {
    id: string;
    recipe: { id: string; source: string };
    renderRecipe: string;
    texture?: string;
    lighting?: string;
    camera: string;
    composition: string | null;
    motionGrammar?: string;
  };
  refDNAs: FinalBrief['referenceDNAs'];
  locks: { character: string; product: null; visibleText: string };
  targetModel: { kind: 'image' | 'video' | 'music'; provider: string; label: string };
  negatives: string[];
  warnings: Array<{ code: string; message: string }>;
  draft: { previewPrompt: string; canonical: false };
}

export type HandoffPacketSet = {
  IMAGE: HandoffPacket;
  MOTION: HandoffPacket;
  SUNO: HandoffPacket;
};

export interface PureScene {
  id: number;
  topic: string;
  architecture: SceneArchitecture;
  finalBrief: FinalBrief;
  handoff: HandoffPacketSet;
  imagePrompt: string;
  motionPrompt: string;
  voiceOver: string;
  sunoBrief: string;
  durationSec: number;
  duration: DurationVerdict;
  intensity: number;
  phaseName: 'Intro' | 'Build-up' | 'Climax' | 'Resolution';
}

export interface GenerationResult {
  status: 'GENERATED' | 'BLOCKED';
  scenes: PureScene[];
  contractGate: { status: string; findings: Array<{ code: string; message: string }> };
  /** Legacy primeBrief payload — paste into Claude Projects / Custom GPT as the director system prompt. */
  agentBrief?: string;
  agentPackets?: {
    image: string;
    motion: string;
    suno: string;
    idea: string;
    proof: string;
  };
  error?: string;
}

// ============================================================
// Constants (extracted verbatim from app.ts)
// ============================================================

const SCENE_INTENTS = [
  'orient the audience to the core idea',
  'identify the first essential element',
  'expose the governing relationship',
  'demonstrate the mechanism in action',
  'contrast a correct and incorrect state',
  'transform the initial state visibly',
  'verify the result with observable proof',
  'apply the idea to a concrete situation',
  'connect the result to the wider system',
  'resolve the sequence with a clear takeaway',
];

const SCENE_EVENTS = [
  'the key relationship is revealed from an initially neutral arrangement',
  'one component moves into its correct position and locks',
  'a visible comparison separates the two possible outcomes',
  'the mechanism completes one cause-and-effect cycle',
  'an incorrect arrangement is corrected in one decisive change',
  'the proof marker appears only after the result is established',
  'one practical example activates while all supporting elements remain still',
  'the completed system settles into an edit-safe final state',
];

const SCENE_FOCUSES = [
  'concept map',
  'primary teaching object',
  'cause-and-effect junction',
  'worked example',
  'proof state',
];

const GLOBAL_NEGATIVES = [
  'morphing', 'warping', 'melting', 'extra fingers', 'duplicated face',
  'text artifacts', 'watermark', 'flickering', 'identity drift between frames',
];

// Tactile recipe overrides per world
const TACTILE_RECIPES: Record<string, string> = {
  paper_diorama: 'paper',
  clay_diorama: 'clay',
  wood_diorama: 'wood',
  felt_diorama: 'fabric',
  shadow_puppet: 'shadow-puppet',
  book_theater: 'paper-theater',
  stained_glass: 'stained-glass',
};

// ============================================================
// Pure helpers
// ============================================================

function stableSemanticFingerprint(parts: Array<string | number>): string {
  const text = parts.join('|');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `scene-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function parseSourceInput(topic: string) {
  const raw = String(topic || '').trim();
  const sourceMatch = raw.match(/^SOURCE:\s*([\s\S]+)$/i);
  if (!sourceMatch) {
    return {
      status: 'UNSOURCED_TOPIC_INPUT',
      beats: [{ sourceId: null as string | null, exactText: raw || 'Genel Konu' }],
      notice: 'UNSOURCED: only a topic was supplied; no canonical source beat is claimed.',
    };
  }
  const beats = sourceMatch[1]
    .split(/\n+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((exactText, i) => ({
      sourceId: `source-${String(i + 1).padStart(3, '0')}` as string | null,
      exactText,
    }));
  return {
    status: beats.length > 0 ? 'SOURCE_BOUND' : 'UNSOURCED_TOPIC_INPUT',
    beats: beats.length > 0 ? beats : [{ sourceId: null as string | null, exactText: 'Genel Konu' }],
    notice: beats.length > 0 ? null : 'UNSOURCED: SOURCE marker contained no usable beat.',
  };
}

function buildImageVantage(world: SurgeryWorld, sceneIndex: number): string {
  const i = Math.max(1, Number(sceneIndex) || 1) - 1;
  const tactile = (world.group || '').toLowerCase() === 'tactile';
  const pool = tactile
    ? [
        '35mm three-quarter wide exterior view, complete miniature frame visible',
        '50mm eye-level wide exterior view, foreground mechanism and layered background readable',
        '35mm high three-quarter wide exterior view, full diorama boundary retained',
        '50mm low three-quarter wide exterior view, miniature scale and negative space preserved',
      ]
    : [
        '35mm eye-level medium-wide three-quarter view, dominant subject and environment readable',
        '50mm eye-level medium view, dominant subject isolated against deliberate negative space',
        '85mm eye-level close view, subject geometry intact and background context still legible',
        '35mm low three-quarter medium-wide view, silhouette separated from the background',
        '50mm high three-quarter medium view, cause-and-effect layout visible in one frame',
      ];
  const base = pool[i % pool.length];
  return world.imageVantageConstraint ? `${base}; constraint: ${world.imageVantageConstraint}` : base;
}

export function deriveProductionPath(projectClass: string): string {
  const v = String(projectClass || '').toUpperCase();
  if (/ULTRA|REAL|COMMERCIAL|PRODUCT|LIVE ACTION/.test(v)) return 'ULTRAREAL_COMMERCIAL';
  if (/TASARIM|DESIGN/.test(v)) return 'STYLIZED_PREMIUM';
  return 'ANIMATION_EDU';
}

/** Resolve the old app's project/path auto-wiring without mutating caller state. */
export function resolveRecipeDefaults(projectClass: string, worldId: string): RecipeDefaults {
  const pathId = DATA.paths.some((p) => p.id === projectClass)
    ? projectClass
    : deriveProductionPath(projectClass);
  const project = DATA.projects.find((p) => p.world === worldId && p.path === pathId);
  const path = DATA.paths.find((p) => p.id === pathId);
  const defRef = project?.ref || path?.defaultRef || '';

  return {
    selectedRefIds: defRef ? [defRef] : [],
    selectedPaletteId: project?.palette || path?.defaultPalette || '',
  };
}

export function deriveTeachingRecipe(world: SurgeryWorld, propOverride: string): { id: string; source: string } {
  if (propOverride && propOverride !== 'native_world') {
    return { id: propOverride, source: 'USER_OVERRIDE' };
  }
  if (TACTILE_RECIPES[world.id]) {
    return { id: TACTILE_RECIPES[world.id], source: 'WORLD_DERIVED' };
  }
  return { id: 'world-native', source: 'NO_TACTILE_OVERRIDE' };
}

export function validateBriefCompatibility(args: {
  path: string;
  world: SurgeryWorld;
  recipe: { id: string };
}): { status: 'PASS' | 'BLOCKED'; authority: string[]; path: string; findings: Array<{ code: string; message: string }> } {
  const { path, world, recipe } = args;
  const findings: Array<{ code: string; message: string }> = [];
  const realPath = /REAL|COMMERCIAL|PRODUCT|LIVE_ACTION/.test(path);
  const tactileRecipe = recipe.id && recipe.id !== 'world-native';
  if (realPath && tactileRecipe) {
    findings.push({
      code: 'REGISTER_CONTAMINATION',
      message: `REAL path ${path} cannot use tactile recipe ${recipe.id}`,
    });
  }
  if (realPath && (world.group || '').toLowerCase() !== 'real') {
    findings.push({
      code: 'WORLD_PATH_MISMATCH',
      message: `REAL path ${path} cannot use ${(world.group || '').toLowerCase()} world ${world.id}`,
    });
  }
  return {
    status: findings.length ? 'BLOCKED' : 'PASS',
    authority: ['SOURCE', 'WORLD', 'RECIPE', 'REFERENCE_DNA', 'PALETTE_ACCENT'],
    path,
    findings,
  };
}

type ParsedSource = ReturnType<typeof parseSourceInput>;

function createSceneArchitecture(sourceInput: ParsedSource, sceneIndex: number, world: SurgeryWorld): SceneArchitecture {
  const index = Math.max(1, Number(sceneIndex) || 1) - 1;
  const cycle = Math.floor(index / sourceInput.beats.length);
  const sourceBeat = sourceInput.beats[index % sourceInput.beats.length];
  const intent = SCENE_INTENTS[index % SCENE_INTENTS.length];
  const event = SCENE_EVENTS[Math.floor(index / SCENE_INTENTS.length) % SCENE_EVENTS.length];
  const focus = SCENE_FOCUSES[index % SCENE_FOCUSES.length];

  const developedBeat = cycle > 0
    ? `${sourceBeat.exactText} (Gelişim Evresi ${cycle + 1})`
    : sourceBeat.exactText;
  const dominantSubject = `${developedBeat} — ${focus}`;

  return {
    source: {
      status: sourceInput.status,
      sourceId: sourceBeat.sourceId,
      exactText: sourceBeat.exactText,
      notice: sourceInput.notice,
    },
    beat: intent,
    dominantSubject,
    event,
    imageVantage: buildImageVantage(world, sceneIndex),
    semanticFingerprint: stableSemanticFingerprint([
      sourceInput.status,
      sourceBeat.sourceId || sourceBeat.exactText,
      intent,
      dominantSubject,
      event,
      cycle,
    ]),
  };
}

function buildFinalBriefContext(
  arch: SceneArchitecture,
  world: SurgeryWorld,
  selectedPropId: string,
  selectedRefIds: string[],
  path: string,
  paletteOverride?: SurgeryPalette,
): FinalBrief {
  const referenceDNAs = selectedRefIds.map(id => {
    const reference = DATA.refs.find((r) => r.id === id) || null;
    const compatible = reference && (!reference.worldId || reference.worldId === world.id) ? reference : null;
    return reference
      ? {
          id: reference.id,
          name: reference.name,
          status: compatible ? 'ACTIVE_SUBORDINATE' : 'SUPPRESSED_WORLD_MISMATCH',
          worldId: reference.worldId,
          directive: compatible && reference.dna ? reference.dna : '',
          use: reference.use,
          avoid: reference.avoid,
          suppressedFields: ['palette', 'texture', 'lighting'],
        }
      : { id: null, status: 'NONE', directive: '', suppressedFields: [] };
  });

  const recipe = deriveTeachingRecipe(world, selectedPropId);
  const colors = paletteOverride?.colors || world.colors || world.palette || [];
  const paletteAccent = colors.length ? colors[colors.length - 1] : null;

  return {
    authority: ['SOURCE', 'WORLD', 'RECIPE', 'REFERENCE_DNA', 'PALETTE_ACCENT'],
    path,
    source: arch.source,
    world: { id: world.id, renderRecipe: world.render, texture: world.texture, lighting: world.lighting },
    recipe,
    referenceDNAs,
    paletteAccent: { value: paletteAccent, source: paletteOverride ? 'USER_PALETTE' : 'WORLD_PALETTE_LAST_ACCENT' },
  };
}

function calcPacing(sceneId: number, sceneCount: number) {
  const arcPct = (sceneId - 1) / Math.max(1, sceneCount - 1);
  let intensity = 0;
  let phaseName: PureScene['phaseName'] = 'Intro';
  if (arcPct < 0.25) {
    intensity = 20 + (arcPct / 0.25) * 30;
    phaseName = 'Intro';
  } else if (arcPct < 0.7) {
    intensity = 50 + ((arcPct - 0.25) / 0.45) * 35;
    phaseName = 'Build-up';
  } else if (arcPct < 0.9) {
    intensity = 85 + ((arcPct - 0.7) / 0.2) * 15;
    phaseName = 'Climax';
  } else {
    intensity = 100 - ((arcPct - 0.9) / 0.1) * 70;
    phaseName = 'Resolution';
  }
  return { intensity, phaseName };
}

// ============================================================
// Public API
// ============================================================

function buildHandoffPackets(args: {
  scene: Omit<PureScene, 'handoff'>;
  world: SurgeryWorld;
  cast: string;
  count: number;
  projectId: string;
  sourceHash: string;
  imageModel: string;
  videoModel: string;
  projectKind: 'video' | 'design';
}): HandoffPacketSet {
  const { scene, world, cast, count, projectId, sourceHash, imageModel, videoModel, projectKind } = args;
  const negatives = GLOBAL_NEGATIVES.slice();
  const continuity = {
    previousSceneId: scene.id > 1 ? scene.id - 1 : null,
    nextSceneId: scene.id < count ? scene.id + 1 : null,
    characterLock: cast,
    worldLock: world.id,
    semanticFingerprint: scene.architecture.semanticFingerprint,
  };
  const sceneCore = {
    id: scene.id,
    sourceId: scene.architecture.source.sourceId,
    exactSourceBeat: scene.architecture.source.exactText,
    sourceStatus: scene.architecture.source.status,
    intent: scene.architecture.beat,
    dominantSubject: scene.architecture.dominantSubject,
    event: scene.architecture.event,
    continuity,
  };
  const worldCore = {
    id: world.id,
    recipe: scene.finalBrief.recipe,
    renderRecipe: world.render,
    texture: world.texture,
    lighting: world.lighting,
    camera: scene.architecture.imageVantage,
    composition: world.compositionConstraint || null,
    motionGrammar: world.motionNotes,
  };
  const locks = { character: cast, product: null, visibleText: 'NO_UNSOURCED_VISIBLE_TEXT' };

  const makePacket = (role: 'IMAGE' | 'MOTION' | 'SUNO', label: string, draftPrompt: string): HandoffPacket => {
    const warnings: Array<{ code: string; message: string }> = [];
    if (scene.architecture.source.status !== 'SOURCE_BOUND') {
      warnings.push({ code: 'UNSOURCED_INPUT', message: scene.architecture.source.notice || 'Unsourced topic input.' });
    }
    if (scene.finalBrief.referenceDNAs.some(r => r.status === 'SUPPRESSED_WORLD_MISMATCH')) {
      warnings.push({ code: 'REFERENCE_DNA_SUPPRESSED', message: 'One or more Reference DNAs cannot override the selected world.' });
    }
    if (role === 'MOTION') {
      warnings.push(projectKind === 'design'
        ? { code: 'NOT_APPLICABLE_STATIC_DESIGN', message: 'Static design deliverables do not create motion.' }
        : { code: 'APPROVED_IMAGE_REQUIRED', message: 'Motion stays locked until an approved image exists.' });
    }
    if (role === 'SUNO' && projectKind === 'design') {
      warnings.push({ code: 'NOT_APPLICABLE_STATIC_DESIGN', message: 'Static design deliverables do not create music.' });
    }
    return {
      packetVersion: '1.0.0',
      packetId: stableSemanticFingerprint([projectId, sourceHash, String(scene.id), role, label]),
      projectId,
      sourceHash,
      role,
      scene: sceneCore,
      world: worldCore,
      refDNAs: scene.finalBrief.referenceDNAs,
      locks,
      targetModel: {
        kind: role === 'IMAGE' ? 'image' : role === 'MOTION' ? 'video' : 'music',
        provider: role === 'SUNO' ? 'SUNO' : role === 'IMAGE' ? imageModel.split('_')[0] : videoModel.split('_')[0],
        label,
      },
      negatives,
      warnings,
      draft: { previewPrompt: draftPrompt, canonical: false },
    };
  };

  return {
    IMAGE: makePacket('IMAGE', imageModel, scene.imagePrompt),
    MOTION: makePacket('MOTION', videoModel, scene.motionPrompt),
    SUNO: makePacket('SUNO', 'Custom Mode', scene.sunoBrief),
  };
}

export function generateBatch(input: BriefInput): GenerationResult {
  const { projectTopic, projectClass, sceneCount, selectedWorldId, selectedRefIds, selectedPaletteId } = input;
  const cast = (input.cast || '').trim();

  const world = DATA.worlds.find((w) => w.id === selectedWorldId);
  if (!world) {
    return {
      status: 'BLOCKED',
      scenes: [],
      contractGate: { status: 'BLOCKED', findings: [{ code: 'NO_WORLD', message: 'Lütfen bir vizyonel dünya seçin.' }] },
      error: 'NO_WORLD',
    };
  }

  const path = deriveProductionPath(projectClass);
  const recipe = deriveTeachingRecipe(world, input.selectedPropId);
  const contractGate = validateBriefCompatibility({ path, world, recipe });
  if (contractGate.status === 'BLOCKED') {
    return { status: 'BLOCKED', scenes: [], contractGate };
  }

  if (input.rawSource?.length) {
    if (!input.sourceBeats?.length) {
      return {
        status: 'BLOCKED',
        scenes: [],
        contractGate: {
          status: 'BLOCKED',
          findings: [{ code: 'SOURCE_NOT_INGESTED', message: 'Raw Source Vault kayıpsız ingest edilmeden üretim yapılamaz.' }],
        },
        error: 'SOURCE_NOT_INGESTED',
      };
    }
    const integrity = sourceIntegrity(input.rawSource, input.sourceBeats);
    if (!integrity.ok) {
      return {
        status: 'BLOCKED',
        scenes: [],
        contractGate: {
          status: 'BLOCKED',
          findings: [{ code: 'SOURCE_INTEGRITY_FAIL', message: `Kaynak bütünlüğü ${integrity.coverage}%; üretim için %100 gerekli.` }],
        },
        error: 'SOURCE_INTEGRITY_FAIL',
      };
    }
  }

  const paletteOverride = DATA.palettes.find((p) => p.id === selectedPaletteId);
  const count = input.rawSource?.length && input.sourceBeats?.length
    ? input.sourceBeats.length
    : Math.max(1, Math.min(20, Number(sceneCount) || 5));
  const sourceParsed: ParsedSource = input.rawSource?.length && input.sourceBeats?.length
    ? {
        status: 'SOURCE_BOUND',
        beats: input.sourceBeats.map((beat) => ({ sourceId: beat.sourceId, exactText: beat.exactText })),
        notice: null,
      }
    : parseSourceInput(projectTopic);
  const projectId = stableSemanticFingerprint(['PROJECT', projectTopic.trim()]);
  const sourceHash = stableSemanticFingerprint([
    'SOURCE',
    sourceParsed.status,
    ...sourceParsed.beats.map((b) => b.exactText),
  ]);
  const scenes: PureScene[] = [];
  const projectKind = input.projectKind || 'video';

  // Brain context — register, DNA directives and Suno brief are batch-wide.
  const register = registerOf(path);
  const selectedRefs = selectedRefIds.map(id => DATA.refs.find(r => r.id === id)).filter(Boolean) as SurgeryRef[];
  const compatibleRefs = selectedRefs.filter(r => !r.worldId || r.worldId === world.id);
  const dna = dnaDirectives(compatibleRefs, register);
  const sunoBrief = projectKind === 'design'
    ? 'NOT_APPLICABLE: static design deliverable; no music brief.'
    : primeSuno(path);
  let prev: { src: string; concept: Concept } | undefined;
  const briefScenes: AgentBriefScene[] = [];

  for (let i = 1; i <= count; i++) {
    const arch = createSceneArchitecture(sourceParsed, i, world);
    const brief = buildFinalBriefContext(arch, world, input.selectedPropId, selectedRefIds, path, paletteOverride);
    const pacing = calcPacing(i, count);

    // Semantic concept from the scene's exact source beat — this is the brain.
    const beatText = arch.source.exactText;
    const concept = primeConcept(beatText, register, world.id, pacing.phaseName, prev);
    const prevId = i > 1 ? i - 1 : undefined;
    const camera = primeCamera(i, beatText, i - 1, register, prev?.src, prevId);
    const duration = durationGuard(beatText, input.videoModel);

    const imagePrompt = brainImagePrompt(i, concept, camera, {
      world, register, dna, palette: paletteOverride,
      pathForbidden: contractGate.findings.length ? '' : (DATA.paths.find((p) => p.id === path) as { forbidden?: string } | undefined)?.forbidden || '',
      chars: register === 'EDU' && cast ? cast : undefined,
      projectKind,
    });
    const motionPrompt = projectKind === 'design'
      ? 'NOT_APPLICABLE: static design deliverable; no motion prompt.'
      : buildMotionPrompt(i, concept, camera, dna, duration.sec);
    const voiceOver = beatText;
    prev = { src: beatText, concept };
    briefScenes.push({ id: i, source: beatText, concept, camera, sec: duration.sec });

    const sceneCore: Omit<PureScene, 'handoff'> = {
      id: i,
      topic: `${projectTopic} — Sahne ${i}`,
      architecture: arch,
      finalBrief: brief,
      imagePrompt,
      motionPrompt,
      voiceOver,
      sunoBrief,
      durationSec: duration.sec,
      duration,
      intensity: pacing.intensity,
      phaseName: pacing.phaseName,
    };
    const handoff = buildHandoffPackets({
      scene: sceneCore,
      world,
      cast,
      count,
      projectId,
      sourceHash,
      imageModel: input.imageModel,
      videoModel: input.videoModel,
      projectKind,
    });
    scenes.push({ ...sceneCore, handoff });
  }

  const agentCtx = {
    projectTopic,
    productionPath: path,
    register,
    world,
    palette: paletteOverride,
    dna,
    cast,
    projectKind,
    brandKitLock: input.brandKitLock,
    mood: input.mood ? MOOD_OPTS[input.mood]?.brief : undefined,
    cameraEnergy: input.cameraEnergy ? CAM_OPTS[input.cameraEnergy]?.brief : undefined,
    timeLight: input.timeLight ? LIGHT_OPTS[input.timeLight]?.brief : undefined,
    transition: input.transition ? TRANS_OPTS[input.transition]?.brief : undefined,
    musicVibe: input.musicVibe ? MUS_OPTS[input.musicVibe]?.brief : undefined,
    pov: input.pov ? POV_OPTS[input.pov]?.brief : undefined,
    signature: input.signature ? SIG_OPTS[input.signature]?.brief : undefined,
    leitmotif: input.leitmotif ? LEIT_OPTS[input.leitmotif]?.brief : undefined,
    tempoCurve: input.tempoCurve ? TEMPO_OPTS[input.tempoCurve]?.brief : undefined,
  };

  const agentBrief = buildAgentBrief(agentCtx, briefScenes);

  const agentPackets = {
    image: primePacket('image', agentCtx, briefScenes),
    motion: primePacket('motion', agentCtx, briefScenes),
    suno: primePacket('suno', agentCtx, briefScenes),
    idea: primePacket('idea', agentCtx, briefScenes),
    proof: primePacket('proof', agentCtx, briefScenes),
  };

  return { status: 'GENERATED', scenes, contractGate, agentBrief, agentPackets };
}

// Used by the Recipe step for grouped dropdowns
// ============================================================
// Motion validator — prevent motion prompts from introducing
// content tokens that were never approved in the image.
// ============================================================

const MOTION_STOPWORDS = new Set([
  // Connectives
  'a','an','and','as','at','by','for','from','in','into','of','on','or','the','to','with',
  // Generic motion verbs (allowed by definition)
  'move','moves','moving','motion','slow','slowly','fast','quick','quickly','smooth','smoothly',
  'gentle','gently','steady','steadily','sudden','suddenly','then','while','before','after',
  // Camera vocabulary (allowed)
  'camera','pan','pans','tilt','tilts','dolly','dollies','push','pushes','pull','pulls',
  'zoom','zooms','rack','racks','focus','frame','frames','shot','take','takes',
  'second','seconds','fps','tracking','tracks','crane','cranes','glide','glides',
  // Direction
  'left','right','up','down','forward','back','backward','across','around','toward','away',
  // Intensity
  'subtle','soft','hard','intense','calm','energetic',
]);

const TOKEN_RE = /[a-zA-ZığüşöçİĞÜŞÖÇ][a-zA-ZığüşöçİĞÜŞÖÇ-]{2,}/g;

function tokenSet(text: string): Set<string> {
  const out = new Set<string>();
  const matches = text.toLowerCase().match(TOKEN_RE) ?? [];
  for (const m of matches) {
    if (!MOTION_STOPWORDS.has(m)) out.add(m);
  }
  return out;
}

export interface MotionValidation {
  ok: boolean;
  foreign: string[];
  threshold: number;
}

/**
 * Detect content tokens in `motionPrompt` that don't appear in `imagePrompt`.
 * Camera, direction, and generic motion words are ignored. More than `threshold`
 * foreign tokens flips ok=false — that means motion is asking for things the
 * image never established (a recipe for identity drift across frames).
 */
export function validateMotion(imagePrompt: string, motionPrompt: string, threshold = 3): MotionValidation {
  const imgTokens = tokenSet(imagePrompt);
  const motionTokens = tokenSet(motionPrompt);
  const foreign: string[] = [];
  for (const t of motionTokens) {
    if (!imgTokens.has(t)) foreign.push(t);
  }
  return { ok: foreign.length <= threshold, foreign: foreign.slice(0, 12), threshold };
}

export function groupedRefs(): Record<string, SurgeryRef[]> {
  const groups: Record<string, SurgeryRef[]> = {};
  for (const r of DATA.refs) {
    const cat = r.cat || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(r);
  }
  return groups;
}

export function groupedWorlds(): Record<string, SurgeryWorld[]> {
  const groups: Record<string, SurgeryWorld[]> = {};
  for (const w of DATA.worlds) {
    const g = w.group || 'other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(w);
  }
  return groups;
}
