// Pure logic extracted from the vanilla app.ts monolith.
// No DOM, no window globals, no side effects. Args in, value out.
// Wraps the keepers (motion-validator, pacing, exporter) for React.

import SURGERY from './SURGERY_DATA.json';
import {
  registerOf, dnaDirectives, primeConcept, primeCamera, buildImagePrompt as brainImagePrompt,
  buildMotionPrompt, primeSuno, durationGuard, buildAgentBrief, primePacket,
  type Concept, type DurationVerdict, type AgentBriefScene, type Register,
} from './brain';
import { ingestSource, sourceIntegrity, type SourceBeat } from './source';

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

export interface MaterialDef { id: string; name: string; clause: string; motion: string; }

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
  materials: MaterialDef[];
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
  calm_focus:{label:'Sakin & Huzur',brief:'calm and clear - steady unhurried pacing, clean balanced palette, minimal music and breathing space, clarity-first staging'},
  real_confident:{label:'Gerçek Reklam · Güven',brief:'premium real-commercial confidence - believable product truth, disciplined taste, no fake corporate excitement'},
  human_trust:{label:'İnsan Güveni',brief:'human trust and lived-in credibility - honest faces, useful gestures, documentary warmth, no stock-smile performance'},
  luxury_restraint:{label:'Lüks Sadelik',brief:'luxury restraint - quiet status, negative space, refined detail, expensive stillness, no loud promo energy'},
  social_native:{label:'Native Sosyal',brief:'native social urgency - fast hook, authentic phone-era rhythm, creator-adjacent energy, no overproduced TVC gloss'},
  clinical_precision:{label:'Klinik Hassasiyet',brief:'clinical precision - calm confidence, clean evidence, exact surfaces, trust through restraint and clarity'},
  civic_honest:{label:'Kamu Gerçekliği',brief:'civic honesty - public-service clarity, real place texture, dignified human scale, no propaganda polish'},
  editorial_desire:{label:'Editorial Arzu',brief:'editorial desire - fashion-grade mood, controlled sensual detail, confident asymmetry, never cheap glamour'},
  system_clarity:{label:'Sistem Netliği',brief:'structured clarity - hierarchy, repeated modules, readable information architecture and deliberate white space'}
};
export const CAM_OPTS: Record<string, {label:string, brief:string}> = {
  calm_clear:{label:'Sakin & Net',brief:'restrained camera - mostly locked frames and slow motivated dolly, clarity over movement'},
  explore_pov:{label:'Keşifçi & POV',brief:'exploratory camera - lean on inside-object, child-eye and POV reveals, motivated movement that uncovers the idea'},
  cinematic_dramatic:{label:'Sinematik & Dramatik',brief:'cinematic camera - bold motivated moves, strong depth, deliberate reveal timing and scale'},
  locked_premium:{label:'Premium Kilitli',brief:'locked premium frames, exact product geometry, deliberate negative space and only one motivated move when earned'},
  macro_glide:{label:'Makro Glide',brief:'macro glide camera - tactile surface travel, controlled parallax, geometry-respecting close detail, no floating product tricks'},
  handheld_human:{label:'Elde İnsan',brief:'handheld human realism - small observational drift, shoulder-height truth, imperfect timing that feels witnessed'},
  location_dolly:{label:'Mekan Dolly',brief:'slow location dolly or slider - reveal real space, practical depth and human-scale anchors before the hero beat'},
  social_phone:{label:'Telefon Ritmi',brief:'phone-native camera - direct, close, fast readable reframes, creator realism without chaotic shake'},
  editorial_locked:{label:'Editorial Kompozisyon',brief:'editorial composed camera - long-lens compression, exact posture/shape, elegant crop discipline'},
  system_scan:{label:'Sistem Scan',brief:'interface/system camera - straight-on readable frames, measured push-ins, screen-safe reflections and no UI warping'}
};
export const LIGHT_OPTS: Record<string, {label:string, brief:string}> = {
  morning:{label:'Sabah',brief:'soft cool morning light, gentle long shadows, fresh clean feel'},
  golden:{label:'Altın Saat',brief:'warm golden-hour light, long amber shadows, premium glow'},
  night:{label:'Gece',brief:'controlled night light, pools of practical light, deep shadow with focused accents'},
  studio:{label:'Stüdyo',brief:'clean controlled studio light, soft key and fill, neutral readable shadows'},
  highkey_clean:{label:'High-Key Clean',brief:'Apple-grade high-key clean field, soft wrap, exact shadow control, product edges readable and calm'},
  window_natural:{label:'Doğal Pencere',brief:'motivated window naturalism - believable direction, skin-safe falloff, room air and honest contrast'},
  tabletop_control:{label:'Tabletop Kontrol',brief:'controlled tabletop light - crisp specular passes, grounded contact shadows, exact material truth'},
  overcast_doc:{label:'Overcast Doc',brief:'soft overcast documentary light, public-place honesty, no glamorized contrast'},
  golden_commercial:{label:'Altın Reklam',brief:'premium golden-hour commercial light, warm long shadows, motivated glow and believable skin/product highlights'},
  luxury_lowkey:{label:'Luxury Low-Key',brief:'low-key luxury light - deep blacks, selective highlight, expensive falloff, one readable hero edge'},
  clinical_white:{label:'Klinik Beyaz',brief:'clinical white precision - clean high-key, cool bounce, exact glass/metal edges, trustworthy sterility'},
  warm_home:{label:'Sıcak Ev',brief:'warm home utility light - practical lamps, soft amber skin, honest domestic texture'},
  editorial_flash:{label:'Editorial Flash',brief:'editorial flash/key discipline - crisp fashion contrast, sculpted face/product planes, no random flare'}
};
export const MUS_OPTS: Record<string, {label:string, brief:string}> = {
  warm_motif:{label:'Sıcak Motif',brief:'warm hummable educational motif - felted piano and soft strings, VO-safe, no vocals unless requested'},
  epic:{label:'Epik',brief:'rising cinematic bed - light percussion building to one peak, VO-safe, no vocals unless requested'},
  curious:{label:'Merak',brief:'playful curious motif - pizzicato or marimba, light and bright, VO-safe, no vocals unless requested'},
  minimal:{label:'Minimal',brief:'minimal sparse texture - one instrument and space, strongly VO-safe, no vocals unless requested'},
  education_light:{label:'Eğitim Hafif',brief:'light educational bed - celesta, marimba or pizzicato motif, curious but uncluttered, VO-safe and friendly'},
  premium_commercial:{label:'Premium Reklam',brief:'premium commercial restraint - muted pulse, sparse signature tone on reveal, VO-safe, no trailer brass'},
  doc_roomtone:{label:'Doc Roomtone',brief:'documentary roomtone bed - quiet felt texture, human breath space, almost invisible support under VO'},
  social_snap:{label:'Sosyal Snap',brief:'short-form snap bed - quick hook, clean micro-drop, low clutter, platform-native but still premium'},
  luxury_minimal:{label:'Lüks Minimal',brief:'luxury minimal bed - sub pulse, brushed texture, one elegant motif, silence used as status'},
  tech_precision:{label:'Tech Precision',brief:'tech precision bed - soft modular pulse, glassy ticks, clinical low-end control, no EDM cliché'}
};
export const TRANS_OPTS: Record<string, {label:string, brief:string}> = {
  match_cut:{label:'Match-cut',brief:'match-cut between scenes on a shared shape or motion; keep continuity and a stable final hold'},
  morph_safe:{label:'Morph-safe',brief:'morph-safe transitions only - freeze text, logo and face; never melt or morph between scenes'},
  hard_cut:{label:'Sert Kesme',brief:'clean hard cuts on action; no decorative transitions'},
  product_match:{label:'Ürün Match',brief:'product match-cuts on shape, edge, reflection or gesture; preserve exact geometry through every cut'},
  doc_cut:{label:'Belgesel Cut',brief:'observational cuts motivated by human action; no decorative transitions, no fake montage energy'},
  social_cut:{label:'Sosyal Cut',brief:'tight social cuts on hook/action/proof; fast but readable, no random glitch pack'},
  editorial_cut:{label:'Editorial Cut',brief:'editorial hard cuts on pose, silhouette and texture; let stillness carry luxury'}
};
export const POV_OPTS: Record<string, {label:string, brief:string}> = {
  child_eye:{label:'Çocuk gözü',brief:'child-eye level POV — frame the idea at a child\'s height and curiosity'},
  object_pov:{label:'Nesne-POV',brief:'object-POV — see from inside or from the lesson/hero object itself'},
  consequence:{label:'Sonuç→sebep',brief:'consequence-to-cause — show the result first, then reveal what caused it'},
  hidden_mech:{label:'Gizli mekanizma',brief:'hidden-mechanism reveal — open the object to show how it works'},
  scale_reveal:{label:'Ölçek reveal',brief:'scale reveal — start tight or wide, then reveal true scale of the idea'},
  locked:{label:'Kilitli kare',brief:'deliberate locked/static frame — stillness that makes the change readable'},
  product_orbit:{label:'Ürün Etrafı',brief:'product-first POV — camera earns every angle from product truth, contact shadows and real use context'},
  customer_hand:{label:'Kullanıcı Eli',brief:'customer-hand POV — show the useful action from human distance without hiding the product geometry'},
  witness:{label:'Tanık POV',brief:'witness POV — observe a real person or place without forcing performance; credibility over spectacle'},
  phone_native:{label:'Telefon POV',brief:'phone-native POV — vertical-friendly proximity and directness, but keep exposure and composition intentional'},
  system_reader:{label:'Sistem Okuru',brief:'reader/user POV — screen, object or layout remains legible; camera behaves like a careful evaluator'}
};
export const SIG_OPTS: Record<string, {label:string, brief:string}> = {
  macro_truth:{label:'Makro gerçek',brief:'one macro-truth hero frame — the smallest real detail that carries the whole idea'},
  scale_hero:{label:'Ölçek kahraman',brief:'one scale-hero frame — the subject revealed at its most epic true size'},
  silhouette:{label:'Siluet imza',brief:'one silhouette hero frame — the subject read purely as shape against light'},
  light_shaft:{label:'Işık huzmesi',brief:'one motivated light-shaft frame — a single beam that names the subject'},
  reflection:{label:'Yansıma',brief:'one reflection/echo frame — the subject seen through what it acts upon'},
  product_reveal:{label:'Ürün Reveal',brief:'one product-reveal hero frame — the object becomes undeniable through light, scale and exact material truth'},
  usage_payoff:{label:'Kullanım Payoff',brief:'one usage-payoff frame — the product or service proves itself through a real action, not a slogan'},
  human_truth:{label:'İnsan Gerçeği',brief:'one human-truth frame — a credible micro-expression or gesture that carries the promise'},
  brand_mark:{label:'Marka İmzası',brief:'one brand-mark frame — logo/text remains locked geometry while light or context earns the recognition'},
  system_grid:{label:'Sistem Grid',brief:'one system-grid frame — hierarchy, modules and output align into a calm final proof'}
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
  slow_burn:{label:'Slow burn',brief:'slow burn — withhold, let tension build, deliver a late reveal then a stable hold'},
  educational_arc:{label:'Eğitim Yayı',brief:'educational arc — orient the idea, show mechanism, repeat the cause-effect once, then land on a clear final teaching frame'},
  launch_tease:{label:'Launch Tease',brief:'launch-teaser arc — intrigue, partial reveal, proof detail, final product/brand confirmation'},
  problem_solution:{label:'Problem→Çözüm',brief:'problem-solution arc — real friction, useful action, visible result, restrained confidence'},
  proof_buildup:{label:'Kanıt İnşası',brief:'proof-build arc — claim, evidence detail, real use, hero proof, quiet resolved trust'},
  social_hook:{label:'Sosyal Hook',brief:'short-form hook arc — immediate problem or visual hook, rapid proof beats, clean final CTA-ready hold'},
  documentary_arc:{label:'Doc Arc',brief:'documentary arc — place/person truth first, observed process, earned outcome, no salesy punchline'},
  editorial_arc:{label:'Editorial Arc',brief:'editorial arc — mood, texture, silhouette, signature frame; desire through restraint'},
  system_arc:{label:'Sistem Arc',brief:'system arc — context, structure, proof module, final organized output'}
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
  phase0PresetId?: string;
  directorChoices?: Record<string, string>;
  directorBrief?: string;
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
  'orient the audience to this exact source beat',
  'identify the first essential element',
  'expose the governing relationship',
  'demonstrate the mechanism in action',
  'contrast a correct and incorrect state',
  'transform the initial state visibly',
  'verify the result with observable proof',
  'apply this source beat to a concrete situation',
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
  const sourceBody = sourceMatch[1].trim();
  const lineBeats = sourceBody
    .split(/\n+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const exactBeats = lineBeats.length > 1
    ? lineBeats
    : ingestSource(sourceBody).map((beat) => beat.exactText.trim()).filter(Boolean);
  const beats = exactBeats.map((exactText, i) => ({
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
  const raw = String(projectClass || '').trim();
  const v = raw.toUpperCase();
  const exactPath = DATA.paths.find((path) => path.id.toUpperCase() === v);
  if (exactPath) return exactPath.id;
  if (/FOOD|ESPRESSO|KAHVE|RESTAURANT|MEN[ÜU]|İÇECEK|ICECEK/.test(v)) return 'FOOD_MACRO';
  if (/HEALTH|SA[ĞG]LIK|HASTANE|BAKIM|PUBLIC HEALTH/.test(v)) return 'HEALTH_PUBLIC_SERVICE';
  if (/TECH|MEDICAL|MEDIKAL|MEDİKAL|CLINIC|KLINIK|KLİNİK|SAAS/.test(v)) return 'TECH_MEDICAL_PRECISION';
  if (/FASHION|MODA|EDITORIAL|ED[İI]TORIAL/.test(v)) return 'FASHION_EDITORIAL';
  if (/ARCHITECTURE|M[İI]MAR|REAL ESTATE|GAYR[İI]MENKUL/.test(v)) return 'ARCHITECTURE_REAL_ESTATE';
  if (/TOURISM|TUR[İI]ZM|DESTINATION|DEST[İI]NASYON/.test(v)) return 'TOURISM_DESTINATION';
  if (/AUTO|OTOMOT[İI]V|MOBILITY|ARA[ÇC]/.test(v)) return 'AUTOMOTIVE_MOBILITY';
  if (/SOCIAL|REELS|TIKTOK|T[İI]KTOK|INSTAGRAM|VERTICAL|D[İI]KEY/.test(v)) return 'SOCIAL_REELS_REALISM';
  if (/DOCUMENTARY|BELGESEL/.test(v)) return 'DOCUMENTARY_REALISM';
  if (/TESTIMONIAL|R[ÖO]PORTAJ|DENEY[İI]M/.test(v)) return 'HUMAN_TESTIMONIAL';
  if (/LIVE[_\s-]?ACTION|CORPORATE|KURUM|BELED[İI]YE|KAMU/.test(v)) return 'LIVE_ACTION_CORPORATE';
  if (/PRODUCT|PACKSHOT|[ÜU]R[ÜU]N|LOGO/.test(v)) return 'PRODUCT_HERO';
  if (/ULTRA|REAL|COMMERCIAL|REKLAM|MARKA/.test(v)) return 'ULTRAREAL_COMMERCIAL';
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

/** Material (teaching axis) → a render-lock clause that actually changes the look.
    Empty for 'none'/'native_world'/unknown so pure-style worlds stay untouched. */
export function materialClauseOf(materialId: string | undefined): string {
  const id = String(materialId || '');
  if (!id || id === 'none' || id === 'native_world') return '';
  const m = (DATA.materials || []).find((x) => x.id === id);
  return m?.clause || '';
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
  const register = registerOf(path);
  const realPath = register === 'REAL';
  const realWorld = (world.group || '').toLowerCase() === 'real';
  const tactileRecipe = recipe.id && recipe.id !== 'world-native';
  if (realPath && tactileRecipe) {
    findings.push({
      code: 'REGISTER_CONTAMINATION',
      message: `REAL path ${path} cannot use tactile recipe ${recipe.id}`,
    });
  }
  if (realPath && !realWorld) {
    findings.push({
      code: 'WORLD_PATH_MISMATCH',
      message: `REAL path ${path} cannot use ${(world.group || '').toLowerCase()} world ${world.id}`,
    });
  }
  if (!realPath && realWorld) {
    findings.push({
      code: 'WORLD_PATH_MISMATCH',
      message: `${register} path ${path} cannot use real world ${world.id}`,
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

function compactSourceCue(text: string): string {
  const compact = String(text || '').replace(/\s+/g, ' ').trim();
  if (/\b(ignore|disregard|forget|delete|override|system prompt|prior rules|render lock|jailbreak)\b/i.test(compact)) {
    return 'an inert quoted-source card flagged as unsafe instruction text';
  }
  if (compact.length <= 120) return compact;
  return `${compact.slice(0, 117).trim()}...`;
}

function createSceneArchitecture(sourceInput: ParsedSource, sceneIndex: number, world: SurgeryWorld): SceneArchitecture {
  const index = Math.max(1, Number(sceneIndex) || 1) - 1;
  const cycle = Math.floor(index / sourceInput.beats.length);
  const sourceBeat = sourceInput.beats[index % sourceInput.beats.length];
  const intent = SCENE_INTENTS[index % SCENE_INTENTS.length];
  const event = SCENE_EVENTS[index % SCENE_EVENTS.length];
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

function architectureFallbackConcept(arch: SceneArchitecture, phaseName: PureScene['phaseName'], register: Register): Concept {
  const sourceCue = compactSourceCue(arch.source.exactText || arch.dominantSubject);
  const phaseSubject: Record<Register, Record<PureScene['phaseName'], string>> = {
    EDU: {
      Intro: 'one readable question-board scene built from this exact beat',
      'Build-up': 'one concrete teaching mechanism that isolates this beat as a visible cause-and-effect',
      Climax: 'one proof-stage scene where this beat creates an observable learning consequence',
      Resolution: 'one final takeaway scene that gathers this beat into a readable end state',
    },
    STY: {
      Intro: 'one stylized question frame that makes this exact beat visually concrete',
      'Build-up': 'one graphic proof frame that isolates this beat as a visible tension',
      Climax: 'one stylized consequence frame where this beat visibly turns',
      Resolution: 'one earned emblem frame that resolves this exact beat without adding story facts',
    },
    REAL: {
      Intro: 'one real human-scale detail that makes this exact beat observable',
      'Build-up': 'one practical real-world action that isolates this beat as evidence',
      Climax: 'one real proof moment where this beat creates an observable consequence',
      Resolution: 'one restrained real-world final detail that resolves this exact beat',
    },
  };
  return {
    subject: `${phaseSubject[register][phaseName]}: ${sourceCue} — ${arch.beat}`,
    event: `${arch.event}, then the frame holds with this exact beat resolved and no extra idea added`,
    matched: false,
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
  // Scene-count guard: a single brief should not explode into dozens of clips.
  // Group the source into thematic beats (Beat Planner / auto-group) before producing.
  if (count > 25) {
    return {
      status: 'BLOCKED',
      scenes: [],
      contractGate: {
        status: 'BLOCKED',
        findings: [{ code: 'SCENE_OVERFLOW', message: `${count} sahne tespit edildi (üst sınır 25). Kaynağı tematik beat'lere grupla (Beat Planner / Akıllı Grupla) ve yeniden üret.` }],
      },
      error: 'SCENE_OVERFLOW',
    };
  }
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
  // Material (teaching axis) only colours non-real registers; REAL footage isn't "made of" clay.
  const materialClause = register === 'REAL' ? '' : materialClauseOf(input.selectedPropId);
  const sunoBrief = projectKind === 'design'
    ? 'NOT_APPLICABLE: static design deliverable; no music brief.'
    : primeSuno(path);
  let prev: { src: string; concept: Concept } | undefined;
  const emittedConcepts: Concept[] = [];
  const briefScenes: AgentBriefScene[] = [];

  for (let i = 1; i <= count; i++) {
    const arch = createSceneArchitecture(sourceParsed, i, world);
    const brief = buildFinalBriefContext(arch, world, input.selectedPropId, selectedRefIds, path, paletteOverride);
    const pacing = calcPacing(i, count);

    // Semantic concept from the scene's exact source beat — this is the brain.
    const beatText = arch.source.exactText;
    const conceptVariant = sourceParsed.status !== 'SOURCE_BOUND' && sourceParsed.beats.length === 1 ? i - 1 : 0;
    const rankedConcept = primeConcept(beatText, register, world.id, pacing.phaseName, prev, conceptVariant, emittedConcepts);
    const concept = rankedConcept.matched ? rankedConcept : architectureFallbackConcept(arch, pacing.phaseName, register);
    const prevId = i > 1 ? i - 1 : undefined;
    const camera = primeCamera(i, beatText, i - 1, register, prev?.src, prevId);
    const duration = durationGuard(beatText, input.videoModel);

      const imagePrompt = brainImagePrompt(i, concept, camera, {
        world, register, dna, palette: paletteOverride,
        pathForbidden: contractGate.findings.length ? '' : (DATA.paths.find((p) => p.id === path) as { forbidden?: string } | undefined)?.forbidden || '',
        chars: register === 'EDU' && cast ? cast : undefined,
        projectKind,
        material: materialClause || undefined,
        directorBrief: input.directorBrief,
      });
    const motionPrompt = projectKind === 'design'
      ? 'NOT_APPLICABLE: static design deliverable; no motion prompt.'
      : buildMotionPrompt(i, concept, camera, dna, duration.sec);
    const voiceOver = beatText;
    prev = { src: beatText, concept };
    emittedConcepts.push(concept);
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
    material: materialClause || undefined,
    imageModel: input.imageModel,
    videoModel: input.videoModel,
    brandKitLock: input.brandKitLock,
    directorBrief: input.directorBrief,
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
