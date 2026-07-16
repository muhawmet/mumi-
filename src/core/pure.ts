// Pure logic extracted from the vanilla app.ts monolith.
// No DOM, no window globals, no side effects. Args in, value out.
// Wraps the keepers (motion-validator, pacing, exporter) for React.

import SURGERY from './SURGERY_DATA.json';
import {
  registerOf, dnaDirectives, primeCamera, primeShotPattern, nightMap, clockMap, type Clock, buildImagePrompt as brainImagePrompt,
  buildMotionPrompt, primeSuno, durationGuard, buildAgentBrief, primePacket, applyWorldCameraLaw, lightVariantFor,
  paletteLightPrompt,
  type Concept, type DurationVerdict, type AgentBriefScene, type Register, type RecipeSceneNote,
} from './brain';
import { protectedTermsIn, scrubWorkTitles, workTitlesIn } from './proof';
import { ingestSource, sourceIntegrity, type SourceBeat } from './source';
import {
  lockDeliveryPromise,
  validateDeliveryPromise,
  toBlockers,
  type Blocker,
  type DeliveryDeclaration, effectiveTopic, } from './contract';

// ============================================================
// Types
// ============================================================

export interface SurgeryWorld {
  id: string;
  group: string;
  name: string;
  formula?: string;
  one_liner?: string;
  render?: string;
  render_law?: string;
  line_grammar?: string;
  lens_grammar?: string;
  /** How this world frames and moves. lens_grammar states the optics; this states the shot. */
  camera_grammar?: string;
  light_law?: string;
  palette_lock?: { shadow: string; mid: string; accent: string; highlight: string; bias: string };
  motion_cadence?: string;
  material_compat?: string[];
  negative_lock?: string[];
  example_injection?: string;
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
  colors?: string[];
  hex?: { shadow: string; mid: string; accent: string; highlight: string } | null;
  c0?: string;
  c1?: string;
  c2?: string;
  c3?: string;
  use?: string;
  bias?: string;
  avoid?: string;
}

export interface MaterialDef { id: string; name: string; clause?: string; substance_grammar?: string; motion?: string; }

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
    /** What the frame MUST do. The path's positive contract — outranks world grammar. */
    required?: string;
    /** What the frame must NOT do. Scrubbed for IP, then joined into the Negative band. */
    forbidden?: string;
    /** The checklist the frame is measured against before it goes to the engine. */
    gate?: string[];
    /** This path's subject IS a person; a castless frame contradicts it. */
    requiresHumanCast?: boolean;
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
  cinematic_dramatic:{label:'Sinematik & Dramatik',brief:'bold motivated camera - large deliberate moves, deep layered staging, reveal timing and scale held with intent'},
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
  epic:{label:'Epik',brief:'rising orchestral bed - light percussion building to one peak, VO-safe, no vocals unless requested'},
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
  scale_hero:{label:'Ölçek kahraman',brief:'one scale-hero frame — the subject revealed at its overwhelming true size'},
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

// WORK TITLES DIE AT THE DOOR, ONCE.
//
// Three times a title was scrubbed out of one field and kept shipping through its
// neighbour: the anchor was cleaned while refDna carried "Soul" six times; refDna was
// cleaned while referenceDNA.refs[] carried it thirty-four; that was cleaned while
// handoff.{IMAGE,MOTION,SUNO}.refDNAs[] carried it still. Every one of those is a
// different reader of the SAME ref prose, and a field-by-field firewall loses to the
// next reader every time.
//
// So the scrub happens ONCE, where the data enters the program — every consumer
// downstream (image prompt · refDna · handoff · referenceDNA · agentBrief · the UI) is
// then clean by construction, and a new reader cannot reopen the hole by existing.
//
// Only the ref's own prose is touched. Worlds are NOT scrubbed here: their laws are long
// authored craft, and cutting a proper noun out of one mid-sentence yields mangled English
// ("in the -successor premium-CG pipeline") — those are kept clean in the data itself and
// locked by ipData.test.ts. Studio names survive everywhere: they name a pipeline, and each
// world already blocks that studio's cast from the other side.
const SCRUBBED = (() => {
  const raw = SURGERY as unknown as SurgeryData;
  return {
    ...raw,
    refs: raw.refs.map((ref) => ({
      ...ref,
      name: scrubWorkTitles(ref.name),
      anchor: ref.anchor ? scrubWorkTitles(ref.anchor) : ref.anchor,
      dna: ref.dna ? scrubWorkTitles(ref.dna) : ref.dna,
      use: ref.use ? scrubWorkTitles(ref.use) : ref.use,
      avoid: ref.avoid ? scrubWorkTitles(ref.avoid) : ref.avoid,
    })),
  } as SurgeryData;
})();

export const DATA = SCRUBBED;

export type VoSyncMode = 'FREE' | 'LOCKED';
export type OsTextMode = 'AUTO' | 'DENSE' | 'CLEAN';
/** Alias for components that import `World` directly. */
export type World = SurgeryWorld;

export interface BriefInput {
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
  voSyncMode?: VoSyncMode;
  osTextMode?: OsTextMode;
  /**
   * Mami'nin ekran-metni BEYANI. Söz YALNIZ bundan doğar — düzyazıdan değil (MACRO 1).
   * Verilmezse söz `pedagogy_auto`'dur (temiz plaka + VO); kaynak düzyazısı taranmaz, üretim
   * bloklanmaz. Kaynağın metin isteğini kare için AJAN yazar (brief içinde).
   */
  deliveryDeclaration?: DeliveryDeclaration;
  /**
   * Reçete adımının "Subject / Konu" alanı. Dashboard'daki `projectTopic` TABAN,
   * reçetedeki `subject` DOKTORUN SON SÖZÜ — `recipeReadiness` onu zaten zorunlu
   * tutuyor ("Konu" eksikse reçete kapanmıyor). Boşsa taban konuşur.
   * (`getRecipeInput` ve `innerVoices` bu kuralı zaten uyguluyordu; brief yolu uygulamıyordu.)
   */
  subject?: string;
  /** Reçete adımının "Location" alanı — sahnenin gerçek mekânı. Boşsa brief'e satır basılmaz. */
  location?: string;
  /** Reçetenin sahne notları — doktorun kendi eliyle yazdığı VO/event/yön/motion seed/label/avoid. */
  recipeScenes?: RecipeSceneNote[];
}

export interface RecipeDefaults {
  selectedRefIds: string[];
  selectedPaletteId: string;
}

export function worldRenderText(world: SurgeryWorld): string {
  return world.render_law || world.render || world.one_liner || world.name;
}

export function worldMotionText(world: SurgeryWorld): string {
  return world.motion_cadence || world.motion || '';
}

export function worldAvoidText(world: SurgeryWorld): string {
  return world.negative_lock?.join('; ') || world.avoid || '';
}

export function worldNegativeLockTextById(worldId: string): string {
  const w = DATA.worlds.find((x) => x.id === worldId);
  return w ? worldAvoidText(w) : '';
}

// ============================================================
// WORLD PACKET — MACRO 2 (Manual World Studio)
//
// Her world'ün yaratıcı FİZİĞİNİ ajanın okuyabileceği tek yapıya derler: render, figure,
// environment, camera, light, material, motion, negative + palette-as-light davranışı +
// compatible ref DNA + insan/ajan için vocabulary örnekleri.
//
// DEĞİŞMEZ SINIRLAR (Mami):
//  • WorldPacket PROMPT DEĞİLDİR. Site bu paketten engine prompt YAZMAZ — brief içinde ajana
//    yaratıcı malzeme olarak taşır; final prompt'u command'deki ajan yazar.
//  • Kaynak `SURGERY_DATA.json`'daki world alanlarıdır — veri ÇOĞALTILMAZ, buradan TÜRETİLİR.
//    `render_law` silinmez; `legacyRenderLaw` olarak korunur (legacy/human referansı).
//  • `vocabularyExamples` yalnız yaratıcı REFERANStır — motor kadro/prop emri DEĞİLDİR.
//  • palette-as-light: motora ham hex gitmez; dünyanın palette_lock'u fiziksel ışık diline
//    (`paletteLight`) çevrilerek taşınır.
// ============================================================

/** Bir world'ün, seçili bir dünyayla uyumlu ref'lere nasıl davrandığının paket-içi kaydı. */
export interface WorldPacketRef {
  id: string;
  name: string;
  /** Bu world'de kullanılabilir mi (world-native ya da CINEMATIC_REAL lehçe-uyumu)? */
  compatible: boolean;
  /** Ajana taşınan DNA satırı (world'e tabi). Uyumsuzsa boş — ref world'ü ezemez. */
  directive: string;
}

/**
 * Bir world'ün taşınabilir yaratıcı fizik paketi. Alanların hepsi
 * `SURGERY_DATA.json`'daki world verisinden TÜRETİLİR; prompt cümlesi DEĞİLDİR.
 */
export interface WorldPacket {
  id: string;
  name: string;
  group: string;
  /** İnsan/ajan için dünyanın tek cümlelik özeti (one_liner). */
  summary: string;
  /** Dünyanın render kimliğinin FİZİĞİ — line + render kavrayışı (render_law + line_grammar). */
  renderPhysics: string;
  /** Figürün/anatominin nasıl kurulduğu (line_grammar). */
  figurePhysics: string;
  /** Ortam/arka planın davranışı (light_law'ın ortam kısmı + render_law özeti). */
  environmentPhysics: string;
  /** Kameranın zarfı: lens + shot grammar (lens_grammar + camera_grammar). */
  cameraEnvelope: string;
  /** Işığın fiziği (light_law). */
  lightPhysics: string;
  /** Malzeme davranışı: world-native mi, hangi malzemeler uyumlu (material_compat). */
  materialPhysics: string;
  /** Hareketin ritmi/kadansı (motion_cadence). */
  motionCadence: string;
  /** Bu dünyanın fizik ihlalleri — ne OLMAMALI (negative_lock, tam liste). */
  negativeLock: string[];
  /** Palette'in FİZİKSEL IŞIK olarak davranışı — ham hex değil (paletteLight). */
  paletteAsLight: string;
  /** Seçili ref'lerin bu dünyadaki uyum davranışı (verildiğinde). */
  refs: WorldPacketRef[];
  /** İnsan/ajan için yaratıcı örnek — motor emri DEĞİL (example_injection). */
  vocabularyExamples: string;
  /** LEGACY: eski verbatim render sözleşmesi. Silinmez; human/legacy referansı olarak korunur. */
  legacyRenderLaw: string;
}

// ---- BRAIN M2 — render_law prop/fizik ayrımı (KUSUR-C) -------------------------------------
// Ölçülmüş kusur: render_law'daki somut nesne-ENVANTERİ cümleleri (wanted-poster/caravel,
// village facades, vending machines…) `renderPhysics` üzerinden set-emri gibi taşınıp kareye
// sızıyordu. Yasa: "Render law FİZİKTEN yapılmışsa güvenle taşınır. PROP'tan yapılmışsa sızar."
// Çözüm: envanter cümleleri `vocabularyExamples`'a düşer (yaratıcı referans kanalı — silinmez,
// kanal değişir); fizik cümleleri VERBATIM `renderPhysics`'te kalır. Kararsız cümle fizik
// tarafında bırakılır (boşaltma riski > sızıntı riski — A2 pilotu toptan silmeyi denedi,
// kare stok fotoğrafa kaydı). `legacyRenderLaw` her zaman render_law'ı birebir korur.

/** Somut, sayılabilir set/prop nesneleri — envanter imzasının hammaddesi. */
const PROP_NOUN_RE =
  /\b(poster|pennant|hull|figurehead|signage|caravel|bridge|facade|seal|path|machine|cable|curtain|tree|wall|roof|courtyard|lamp|desk|table|window|door|vending|sticker|crt|fortress|village|rope|stone|timber|cardboard|foam|wire|miniature)\w*\b/gi;

/**
 * Fizik-DAVRANIŞ kalıpları: cümle nesne adı taşısa bile ışık/optik/kompozisyon davranışı
 * tarif ediyorsa fiziktir (ör. Deakins'in "every photon … traceable to a … light source"
 * cümlesi window/desk/lamp sayar ama envanter değildir).
 */
const PHYSICS_BEHAVIOUR_RE =
  /\b(light source|photon|motivated|serves as the|soft key|key light|fill (?:light|comes)|bounce|ambient|contrast ratio|falloff|grain|lens|aperture|exposure|implied through composition|filling \d+)/i;

/** render_law'ı cümlelere böler (nokta/ünlem/soru sonrası boşluk). */
function splitLawSentences(law: string): string[] {
  return law
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Bir render_law cümlesi somut nesne-ENVANTERİ mi? Dar imza: ≥3 benzersiz somut nesne VE
 * fizik-davranış kalıbı yok. Kararsızsa `false` → cümle fizikte kalır (güvenli taraf).
 */
function isPropInventorySentence(sentence: string): boolean {
  const nouns = sentence.match(PROP_NOUN_RE) ?? [];
  const unique = new Set(nouns.map((n) => n.toLowerCase()));
  if (unique.size < 3) return false;
  return !PHYSICS_BEHAVIOUR_RE.test(sentence);
}

/**
 * render_law'ı {physics, props} olarak ayırır. Fizik cümleleri ORİJİNAL SIRAYLA ve VERBATIM
 * korunur; envanter cümleleri props'a düşer. Saf; prompt üretmez.
 */
export function splitRenderLawPhysics(law: string): { physics: string; props: string } {
  const sentences = splitLawSentences((law || '').trim());
  const physics: string[] = [];
  const props: string[] = [];
  for (const s of sentences) {
    (isPropInventorySentence(s) ? props : physics).push(s);
  }
  return { physics: physics.join(' '), props: props.join(' ') };
}

/**
 * Bir world'ü taşınabilir `WorldPacket`'e derler. Saf: dünyayı ve (opsiyonel) seçili ref/palette
 * bağlamını alır, veri döndürür. Prompt üretmez.
 */
export function toWorldPacket(
  world: SurgeryWorld,
  ctx?: { selectedRefIds?: string[]; palette?: SurgeryPalette },
): WorldPacket {
  const refs: WorldPacketRef[] = (ctx?.selectedRefIds ?? [])
    .map((id) => DATA.refs.find((r) => r.id === id))
    .filter((r): r is SurgeryRef => !!r)
    .map((r) => {
      const compatible = refCompatibleWithWorld(r, world.id);
      return {
        id: r.id,
        name: r.name,
        compatible,
        directive: compatible && r.dna ? r.dna : '',
      };
    });

  const light = (world.light_law || '').trim();
  // BRAIN M2: render_law fizik/prop olarak ayrılır — fizik verbatim `renderPhysics`'e,
  // envanter cümleleri `vocabularyExamples`'a (aşağıda). render_law boşsa eski fallback
  // zinciri (render/one_liner/name) olduğu gibi çalışır — orada envanter riski ölçülmedi.
  const lawSplit = splitRenderLawPhysics(world.render_law || '');
  const render = lawSplit.physics || worldRenderText(world);

  return {
    id: world.id,
    name: world.name,
    group: world.group,
    summary: (world.one_liner || world.name).trim(),
    renderPhysics: [render, world.line_grammar].filter(Boolean).join(' ').trim(),
    figurePhysics: (world.line_grammar || '').trim(),
    environmentPhysics: light || render,
    cameraEnvelope: [world.lens_grammar, world.camera_grammar].filter(Boolean).join(' ').trim(),
    lightPhysics: light,
    materialPhysics: (() => {
      const compat = (world.material_compat || []).filter((m) => m && m !== 'none');
      return compat.length
        ? `World-compatible materials: ${compat.join(', ')}. Material only colours a non-real register; the world's own surface law governs.`
        : 'World-native surface only — no tactile material substitution.';
    })(),
    motionCadence: worldMotionText(world),
    negativeLock: (world.negative_lock || []).slice(),
    // palette-as-light: dünyanın kendi palette_lock'u FİZİKSEL IŞIK diline çevrilir — ham hex
    // motora/ajana gitmez (Palette Translation Law). `paletteLightPrompt` `hexToLightWords`
    // ile hex'i ışık davranışına indirger; `paletteLight` (hex'li) yalnız insan-okur dossier içindir.
    paletteAsLight: paletteLightPrompt(ctx?.palette, world),
    refs,
    // Envanter cümleleri kaybolmaz — yaratıcı-referans kanalına düşer (prop EMRİ değil):
    vocabularyExamples: [(world.example_injection || '').trim(), lawSplit.props]
      .filter(Boolean)
      .join(' ')
      .trim(),
    legacyRenderLaw: (world.render_law || '').trim(),
  };
}

/** Bir world'ü id'siyle pakete derler (yoksa undefined). */
export function worldPacketById(
  worldId: string,
  ctx?: { selectedRefIds?: string[]; palette?: SurgeryPalette },
): WorldPacket | undefined {
  const w = DATA.worlds.find((x) => x.id === normalizeWorldId(worldId));
  return w ? toWorldPacket(w, ctx) : undefined;
}

export function paletteColors(palette?: SurgeryPalette, world?: SurgeryWorld): string[] {
  const fromPalette = palette?.colors?.length
    ? palette.colors
    : palette?.hex
      ? [palette.hex.shadow, palette.hex.mid, palette.hex.accent, palette.hex.highlight]
      : [];
  if (fromPalette.length) return fromPalette;
  return world?.palette_lock
    ? [world.palette_lock.shadow, world.palette_lock.mid, world.palette_lock.accent, world.palette_lock.highlight]
    : world?.colors || world?.palette || [];
}

const LEGACY_WORLD_ID_MAP: Record<string, string> = {
  clay: 'pixar_3d_edu',
  clay_diorama: 'pixar_3d_edu',
  lightbox: 'pixar_3d_edu',
  notebook: 'paper_craft_popup',
  arcane: 'arcane_fortiche',
  painterly_shadow: 'arcane_fortiche',
  spiderverse: 'spiderverse_sony',
  anime_cel: 'demon_slayer_ufotable',
  mappa_cinematic: 'jjk_mappa',
  bones_action: 'jjk_mappa',
  toei_adventure: 'one_piece_toei',
  cinematic_real: 'deakins_naturalist',
  photoreal_location: 'chivo_naturalist_handheld',
  product_macro_tabletop: 'fincher_precision',
  commercial_studio: 'fincher_precision',
  social_reels_real: 'chivo_naturalist_handheld',
  documentary_civic: 'chivo_naturalist_handheld',
  real_event_coverage: 'chivo_naturalist_handheld',
  real_human_doc: 'chivo_naturalist_handheld',
  human_portrait_real: 'chivo_naturalist_handheld',
  tech_clinical_real: 'fincher_precision',
  architecture_real: 'deakins_naturalist',
  food_macro_real: 'deakins_naturalist',
  healthcare_public_real: 'chivo_naturalist_handheld',
  automotive_stage_real: 'fincher_precision',
  tourism_destination_real: 'chivo_naturalist_handheld',
  luxury_editorial: 'fincher_precision',
};

const LEGACY_PALETTE_ID_MAP: Record<string, string> = {
  vibrant_clean_education: 'vibrant_edu',
  commercial_neutral: 'native_world',
  warm_commercial_gold: 'warm_autumn',
  muted_documentary: 'desaturated_cinematic',
  clinical_blue: 'cool_scientific',
  pastel_soft: 'pastel_soft',
  luxury_black_gold: 'deep_noir',
  deep_space_blue: 'deep_noir',
  rembrandt_amber: 'warm_autumn',
  skin_realism: 'earth_natural',
  civic_morning: 'earth_natural',
  architecture_daylight: 'earth_natural',
  editorial_monochrome: 'desaturated_cinematic',
};

const LEGACY_MATERIAL_ID_MAP: Record<string, string> = {
  clay: 'clay_hamur',
  paper: 'paper_craft_popup',
  chalk: 'chalkboard_kara_tahta',
  felt: 'storybook_illustration',
  fabric: 'storybook_illustration',
  wood: 'wood_tactile',
  'shadow-puppet': 'storybook_illustration',
  'paper-theater': 'paper_craft_popup',
  'stained-glass': 'storybook_illustration',
};

export function normalizeWorldId(id: string | undefined): string {
  const value = String(id || '');
  if (DATA.worlds.some((world) => world.id === value)) return value;
  return LEGACY_WORLD_ID_MAP[value] || value;
}

export function normalizePaletteId(id: string | undefined): string {
  const value = String(id || '');
  if (DATA.palettes.some((palette) => palette.id === value)) return value;
  return LEGACY_PALETTE_ID_MAP[value] || value;
}

export function normalizeMaterialId(id: string | undefined): string {
  const value = String(id || '');
  if (!value || value === 'none' || value === 'native_world') return value;
  if ((DATA.materials || []).some((material) => material.id === value)) return value;
  return LEGACY_MATERIAL_ID_MAP[value] || value;
}

export function normalizeRefIds(ids: unknown): string[] {
  const raw = Array.isArray(ids)
    ? ids
    : typeof ids === 'string'
      ? ids.split(/[,\n]+/u)
      : [];
  const valid = new Set(DATA.refs.map((ref) => ref.id));
  const out: string[] = [];
  for (const item of raw) {
    const id = String(item || '').trim();
    if (!id || !valid.has(id) || out.includes(id)) continue;
    out.push(id);
    if (out.length === 3) break;
  }
  return out;
}

function defaultRefIdsForWorld(worldId: string): string[] {
  return DATA.refs
    .filter((ref) => ref.worldId === worldId)
    .slice(0, 3)
    .map((ref) => ref.id);
}

// Ref world gate. Cinematography/prestige grammar voices are homed in
// CINEMATIC_REAL worlds only for preview/default purposes — photoreal camera
// language is dialect-safe across photoreal worlds, so they may serve any
// CINEMATIC_REAL host (Kubrick on deakins). IP-homage refs (anime/stylized
// groups) stay pinned to their world: crossing them would leak one IP's grammar
// into another IP's frame (naruto ref on one_piece).
//
// HARD-FIX 2026-07-16 (rapor madde 18): a ref WITHOUT a worldId is no longer
// universally compatible. 54/130 refs carry no worldId; the stylized ones among
// them (2D Animation, Animation Auteur, Story DNA, Anime/Shonen, Stylized Premium)
// were leaking rendering-style orders into photoreal worlds — measured in a real
// package: a Hades-based 2D ref carried "flat 2D illustration / ink-comic" into a
// photoreal product world whose own negative lock forbade cartoon. Compatibility is
// now medium-aware: an orphan ref whose category names an animation medium is
// incompatible with a REAL-register host. Photoreal-medium orphans (Cinematography,
// Documentary, Product/Macro, Real Setup, Commercial, …) stay legitimate everywhere.
const ANIMATION_MEDIUM_CAT_RE = /^(?:2D Animation|Animation(?: Auteur| \/)|Anime \/|Story DNA|Stylized Premium)/i;

export function refCompatibleWithWorld(ref: Pick<SurgeryRef, 'worldId' | 'cat'>, worldId: string): boolean {
  if (ref.worldId === worldId) return true;
  const host = DATA.worlds.find((w) => w.id === worldId);
  const hostIsReal = host?.group === 'CINEMATIC_REAL' || host?.group === 'COMMERCIAL_REAL';
  if (!ref.worldId) {
    // Orphan ref: compatible unless its category orders an animation medium onto a real host.
    return !(hostIsReal && ANIMATION_MEDIUM_CAT_RE.test(ref.cat ?? ''));
  }
  const home = DATA.worlds.find((w) => w.id === ref.worldId);
  return home?.group === 'CINEMATIC_REAL' && host?.group === 'CINEMATIC_REAL';
}

export interface SceneArchitecture {
  source: { status: string; sourceId: string | null; exactText: string; notice: string | null };
  beat: string;
  /**
   * BRAIN M3 — dürüst adlandırma (KUSUR-A). Eski `dominantSubject`/`event` alanları ham kaynak
   * cümlenin byte-identical kopyasıydı ama adları "site sahnenin dominant öznesini/olayını seçti"
   * iddiası taşıyordu. Site semantic author DEĞİLDİR: verbatim beat dürüst adla taşınır,
   * dominant-özne/tek-olay/donmuş-an YORUMU ajanın işidir ve image_author artifact'inin zorunlu
   * `interpretation` receipt'inde GÖRÜNÜR yaşar (agentProtocol.ts).
   */
  exactSourceBeat: string;
  semanticInterpretationStatus: 'AGENT_AUTHORED';
  imageVantage: string;
  semanticFingerprint: string;
}

export interface FinalBrief {
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
    /** BRAIN M3: dominant-özne/olay yorumu pakette taşınmaz — ajanın interpretation receipt'i yazar. */
    semanticInterpretationStatus: 'AGENT_AUTHORED';
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
  onScreenText: string | null;
  /** Computed over the whole source and carried across shots — the frame gate needs the clock. */
  isNight?: boolean;
}

export interface GenerationResult {
  status: 'GENERATED' | 'BLOCKED';
  scenes: PureScene[];
  contractGate: { status: string; findings: Array<{ code: string; message: string }> };
  /**
   * Typed FACT REQUIRED (handoff §6). contractGate'in düz bulgularının tiplenmiş hâli:
   * her blocker'ın scope/field/requiredEvidence/allowedResolutions'ı vardır. Site, runner,
   * Claude ve Codex AYNI blocker'ı görür.
   */
  blockers?: Blocker[];
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

// BRAIN M3: SCENE_EVENTS/SCENE_FOCUSES bankaları söküldü — ürettikleri `dominantSubject`/`event`
// süslemesi generateBatch yolunda byte-copy ile eziliyordu (hiçbir canlı çıktıya ulaşmıyordu) ve
// alan adları site'yi semantic author gibi gösteriyordu. Yorum ajanın işi (interpretation receipt).

const GLOBAL_NEGATIVES = [
  'morphing', 'warping', 'melting', 'extra fingers', 'duplicated face',
  'text artifacts', 'watermark', 'flickering', 'identity drift between frames',
];

// ============================================================
// On-screen text helpers
// ============================================================

/** Extracts a 1-3 word Turkish keyterm from a source beat (first meaningful noun phrase). */
function extractTurkishKeyterm(source: string): string {
  const clean = source.replace(/[.!?…]+$/u, '').trim();
  const allWords = clean.split(/\s+/u);
  // Short titles stay whole: dropping 2-letter words would orphan phrases
  // like "Su Döngüsü" into a broken "Döngüsü" plate.
  if (allWords.length > 0 && allWords.length <= 3) return clean.replace(/[,;:—–-]+$/u, '');
  const words = allWords.filter((w) => w.length > 2);
  if (words.length === 0) return clean.slice(0, 30);
  const term = words.length <= 3 ? words.join(' ') : words.slice(0, 2).join(' ');
  // The keyterm gets baked into the start frame as visible text — a mid-sentence
  // cut must not carry its trailing comma/dash onto the plate ("Artık grupları,").
  return term.replace(/[,;:—–-]+$/u, '');
}

/**
 * Resolves the scene's explicitly selected text mode.
 *
 * AUTO is deliberately a clean plate: source words are content, not permission to typeset
 * them. DENSE is an explicit Mami UI choice and may derive compact teaching labels; CLEAN is
 * an explicit no-text lock. Free-form/directive text is authored by the Image Author and enters
 * through the artifact protocol, never through source-word intent inference here.
 */
function deriveOnScreenText(
  source: string,
  phaseName: PureScene['phaseName'],
  mode: OsTextMode,
): string | null {
  if (mode === 'CLEAN') return null;
  if (mode === 'AUTO') return null;
  // DENSE is explicit, not inferred intent. Build-up stays visual-first even in dense pedagogy.
  if (phaseName === 'Build-up') return null;
  return extractTurkishKeyterm(source);
}

/**
 * Lists which scenes carry text baked into the start frame. There is no compositing
 * step downstream (Mami owns no editor), so this is a frame manifest, not a layer plan:
 * no timing, no screen coordinate. The image prompt names the world's letterform and
 * the agent picks the surface that carries it.
 */
export function formatOsTextBlock(scenes: Array<{ id: number; phaseName: PureScene['phaseName']; onScreenText: string | null; durationSec: number }>): string {
  const lines = scenes.map((s) => {
    if (!s.onScreenText) {
      return `[${s.id}] ${s.phaseName.padEnd(10)} → NO_TEXT  (görsel anlatıyor)`;
    }
    return `[${s.id}] ${s.phaseName.padEnd(10)} → "${s.onScreenText}" — start frame'e baskılı (Kling korur)`;
  });
  return ['== START FRAME TEXT (sahneye işlenmiş) ==', ...lines].join('\n');
}

// Tactile recipe overrides per world
const TACTILE_RECIPES: Record<string, string> = {
  paper_diorama: 'paper_craft_popup',
  clay_diorama: 'clay_hamur',
  wood_diorama: 'wood_tactile',
  felt_diorama: 'storybook_illustration',
  shadow_puppet: 'storybook_illustration',
  book_theater: 'paper_craft_popup',
  stained_glass: 'storybook_illustration',
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
  if (/STYLIZED|ANIME|MANGA|COMIC|ÇIZGI|CIZGI/.test(v)) return 'STYLIZED_PREMIUM';
  if (/EDU|EGITIM|EĞİTİM|ÖĞRET|OGRET|LESSON|DERS/.test(v)) return 'ANIMATION_EDU';
  return 'ANIMATION_EDU';
}

/** Resolve the old app's project/path auto-wiring without mutating caller state. */
export function resolveRecipeDefaults(projectClass: string, worldId: string): RecipeDefaults {
  const pathId = DATA.paths.some((p) => p.id === projectClass)
    ? projectClass
    : deriveProductionPath(projectClass);
  const normalizedWorldId = normalizeWorldId(worldId);
  const project = DATA.projects.find((p) => p.world === normalizedWorldId && p.path === pathId);
  const path = DATA.paths.find((p) => p.id === pathId);
  return {
    selectedRefIds: normalizeRefIds([
      ...(project?.ref ? [project.ref] : []),
      ...(path?.defaultRef ? [path.defaultRef] : []),
      ...defaultRefIdsForWorld(normalizedWorldId),
    ]),
    selectedPaletteId: project?.palette || path?.defaultPalette || 'native_world',
  };
}

/** Material (teaching axis) → a render-lock clause that actually changes the look.
    Empty for 'none'/'native_world'/unknown so pure-style worlds stay untouched. */
export function isMaterialCompatibleWithWorld(world: SurgeryWorld | undefined, materialId: string | undefined): boolean {
  const id = normalizeMaterialId(materialId);
  if (!world || !id || id === 'none' || id === 'native_world') return true;
  const compat = world.material_compat || [];
  if (!compat.length) return true;
  return compat.map(normalizeMaterialId).includes(id);
}

export function effectiveMaterialId(world: SurgeryWorld | undefined, materialId: string | undefined): string {
  const id = normalizeMaterialId(materialId);
  if (!id || id === 'native_world') return 'none';
  return isMaterialCompatibleWithWorld(world, id) ? id : 'none';
}

export function materialClauseOf(materialId: string | undefined, world?: SurgeryWorld): string {
  const effectiveId = world ? effectiveMaterialId(world, materialId) : normalizeMaterialId(materialId);
  const id = normalizeMaterialId(effectiveId);
  if (!id || id === 'none' || id === 'native_world') return '';
  const m = (DATA.materials || []).find((x) => x.id === id);
  return m?.substance_grammar || m?.clause || '';
}

export function deriveTeachingRecipe(world: SurgeryWorld, propOverride: string): { id: string; source: string } {
  const normalizedProp = effectiveMaterialId(world, propOverride);
  if (normalizedProp && normalizedProp !== 'native_world' && normalizedProp !== 'none') {
    return { id: normalizedProp, source: 'USER_OVERRIDE' };
  }
  if (TACTILE_RECIPES[world.id]) {
    const derived = normalizeMaterialId(TACTILE_RECIPES[world.id]);
    return { id: isMaterialCompatibleWithWorld(world, derived) ? derived : 'world-native', source: 'WORLD_DERIVED' };
  }
  return { id: 'world-native', source: 'NO_TACTILE_OVERRIDE' };
}

/**
 * A path's binding contract — the positive half of its authority.
 *
 * CODEX#1: `required` and `gate` lived in SURGERY_DATA and were read by nothing.
 * Production only ever consumed `forbidden`, so the site told the agent what NOT to
 * do and never what it MUST do — while §3 of the brief declared "Path > World".
 * An empty authority. `SOCIAL_REELS_REALISM.required` says "vertical" and the site
 * was printing 2.39:1 anamorphic at it.
 */
export interface PathContract {
  id: string;
  /** Positive obligations — what the frame must contain / do. */
  required: string;
  /** Negative obligations — scrubbed for IP before reaching the engine. */
  forbidden: string;
  /** Acceptance checklist the frame is measured against. */
  gate: string[];
  /** The subject IS a person; a castless frame contradicts the path. */
  requiresHuman: boolean;
}

export function pathContract(pathId: string): PathContract | undefined {
  const p = DATA.paths.find((x) => x.id === pathId);
  if (!p) return undefined;
  return {
    id: p.id,
    required: (p.required || '').trim(),
    forbidden: (p.forbidden || '').trim(),
    gate: Array.isArray(p.gate) ? p.gate.filter(Boolean) : [],
    requiresHuman: !!p.requiresHumanCast,
  };
}

export function validateBriefCompatibility(args: {
  path: string;
  world: SurgeryWorld;
  recipe: { id: string };
  /** Authored cast. Omitted by callers that only check world/recipe compatibility. */
  cast?: string;
  /** The doctor's own free text from the recipe. Reaches agentBrief and project.json verbatim. */
  authoredSubject?: string;
  authoredLocation?: string;
  /** Every scene note flattened into one string (vo, event, director_note, motion_seed, labels, avoid). */
  authoredSceneNotes?: string;
}): { status: 'PASS' | 'BLOCKED'; path: string; findings: Array<{ code: string; message: string }> } {
  const { path, world, recipe, cast, authoredSubject, authoredLocation, authoredSceneNotes } = args;
  const findings: Array<{ code: string; message: string }> = [];
  const register = registerOf(path);
  const realPath = register === 'REAL';
  const realWorld = /real|cinematic/i.test(world.group || '');
  const tactileRecipe = recipe.id && recipe.id !== 'world-native';
  if (recipe.id && recipe.id !== 'world-native' && !isMaterialCompatibleWithWorld(world, recipe.id)) {
    findings.push({
      code: 'MATERIAL_WORLD_MISMATCH',
      message: `World ${world.id} cannot use material ${recipe.id}; use world-native material.`,
    });
  }
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
  // CODEX#2 — a path whose whole meaning IS a person (a shopkeeper giving testimony,
  // a patient in care, corporate human scale) cannot render castless. Without this gate
  // the castless branch printed "No human subject in this frame … never to a person"
  // into the image prompt, inverting the path's own contract: Path > World authority
  // was being overruled by an absent field. Data-driven (`requiresHumanCast`), never
  // inferred from prose. `cast === undefined` means the caller isn't checking cast at
  // all (world/recipe compatibility probes) — only an authored-but-empty cast blocks.
  if (pathContract(path)?.requiresHuman && cast !== undefined && !cast.trim()) {
    findings.push({
      code: 'CAST_REQUIRED',
      message: `${path} bir insanı konu alır — Oyuncu/Kadro alanını doldurun (kim görünüyor, nasıl giyinmiş).`,
    });
  }
  // TELİF FIREWALL — `cast` is free text that lands in the image prompt verbatim as
  // `Character lock:`. Nothing screened it, so a franchise name typed here reached the
  // engine untouched. The firewall never silently rewrites what Mami authored — excising
  // "Naruto" from "Naruto Uzumaki" leaves "Uzumaki", still the franchise, and shatters
  // the surrounding sentence ("… gibi giyinmiş esnaf"). It stops the batch and names the
  // terms so the cast can be re-authored as an original character. Two-way IP rule: the
  // WORLD must read as itself; the CHARACTER must never be recognisable.
  const leakedTerms = cast ? protectedTermsIn(cast) : [];
  if (leakedTerms.length) {
    findings.push({
      code: 'CAST_IP_LEAK',
      message: `Kadro tarifinde korumalı isim var: ${leakedTerms.join(', ')}. Telif firewall'u geçirmez — özgün bir karakter olarak yeniden yazın (dünya o dünya kalır, karakter tanınmaz).`,
    });
  }

  // THE FOURTH OPENING. The copyright gate has now been re-opened four times, each time by
  // a NEW field that reaches the prompt with nobody screening it: anchor → refDna →
  // referenceDNA.refs[] → handoff.refDNAs[]. Those were all reference prose, and they were
  // closed at the data gate. This one is different and worse: it is MAMI'S OWN FREE TEXT.
  // The recipe's subject / location / scene notes were wired into agentBrief and project.json
  // and went through NO firewall — "Spider-Verse tarzında olsun" landed in final_brief.md
  // raw, and "Apple Store, İstanbul" carried a live commercial brand into the export.
  //
  // The rule is the one `cast` already follows: NEVER silently rewrite what Mami authored.
  // Excising a word leaves a mutilated sentence and a still-recognisable franchise. STOP,
  // name the terms, and let him re-author — he is sitting right there. He fixes it in one
  // sentence; the export never carries the leak.
  const doctorText: Array<[string, string | undefined]> = [
    ['Konu', authoredSubject],
    ['Lokasyon', authoredLocation],
    ['Sahne notları', authoredSceneNotes],
  ];
  for (const [label, text] of doctorText) {
    if (!text?.trim()) continue;
    // TWO firewalls, and the new path went through NEITHER. `protectedTermsIn` catches the
    // protected CHARACTER (Luffy, Eren, Gojo). `workTitlesIn` catches the WORK (Spider-Verse,
    // Arcane, Fury Road) — the rule MEMORY draws is STUDIO stays, WORK goes. Screening for
    // only one of them is how "Spider-Verse tarzında olsun" reached final_brief.md untouched.
    const leaked = [...protectedTermsIn(text), ...workTitlesIn(text)];
    if (leaked.length) {
      findings.push({
        code: 'RECIPE_IP_LEAK',
        message: `${label} alanında korumalı eser/karakter adı var: ${leaked.join(', ')}. Bu ad export'a giremez — ne DEMEK istediğinizi dünyanın kendi diliyle yazın (ör. "Spider-Verse gibi" değil, "kalın kontur, ofset baskı kayması, yarım-ton nokta dokusu").`,
      });
    }
    // Palette Translation Law: a palette reaches the engine as physical light words, never
    // as #RRGGBB. Hex lives in palette_lock and the dossier — it does not live in the prompt
    // path. A hex typed into a scene note walked straight down that path.
    const hex = text.match(/#[0-9A-Fa-f]{6}\b/g);
    if (hex?.length) {
      findings.push({
        code: 'RECIPE_RAW_HEX',
        message: `${label} alanında ham renk kodu var: ${[...new Set(hex)].join(', ')}. Motora hex gitmez — rengi ışığın davranışı olarak yazın (ör. "#FF00AA" değil, "gölgeler soğuk mora çalıyor, aksan sıcak macenta olarak yalnızca gerçek bir kaynakta yaşıyor").`,
      });
    }
  }

  return {
    status: findings.length ? 'BLOCKED' : 'PASS',
    path,
    findings,
  };
}

type ParsedSource = ReturnType<typeof parseSourceInput>;

function createSceneArchitecture(sourceInput: ParsedSource, sceneIndex: number, world: SurgeryWorld): SceneArchitecture {
  const index = Math.max(1, Number(sceneIndex) || 1) - 1;
  const sourceBeat = sourceInput.beats[index % sourceInput.beats.length];
  const intent = SCENE_INTENTS[index % SCENE_INTENTS.length];

  // BRAIN M3: eski `dominantSubject = "${beat} — ${focus}"` / `event = SCENE_EVENTS[...]` süslemesi
  // gizli site-yorumuydu ve generateBatch yolunda zaten byte-copy ile eziliyordu — hiçbir canlı
  // çıktıya ulaşmıyordu. Site verbatim beat'i dürüst adla taşır; yorum ajanın işi.
  return {
    source: {
      status: sourceInput.status,
      sourceId: sourceBeat.sourceId,
      exactText: sourceBeat.exactText,
      notice: sourceInput.notice,
    },
    beat: intent,
    exactSourceBeat: sourceBeat.exactText,
    semanticInterpretationStatus: 'AGENT_AUTHORED',
    imageVantage: buildImageVantage(world, sceneIndex),
    semanticFingerprint: stableSemanticFingerprint([
      sourceInput.status,
      sourceBeat.sourceId || sourceBeat.exactText,
      intent,
      sourceBeat.exactText,
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
    const compatible = reference && refCompatibleWithWorld(reference, world.id) ? reference : null;
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
  const colors = paletteColors(paletteOverride, world);
  const paletteAccent = colors.length ? colors[colors.length - 1] : null;

  return {
    path,
    source: arch.source,
    world: { id: world.id, renderRecipe: worldRenderText(world), texture: world.texture, lighting: world.lighting },
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
  // KÖK (jüri FIX-4): intensity is a UI/dossier-facing pacing figure, never a
  // continuous signal — round it so raw floats ("intensity 56.48148148148148",
  // "30.000000000000014") never leak into the .command JSON or jury print.
  return { intensity: Math.round(intensity), phaseName };
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
}): HandoffPacketSet {
  const { scene, world, cast, count, projectId, sourceHash, imageModel, videoModel } = args;
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
    exactSourceBeat: scene.architecture.exactSourceBeat,
    sourceStatus: scene.architecture.source.status,
    intent: scene.architecture.beat,
    semanticInterpretationStatus: scene.architecture.semanticInterpretationStatus,
    continuity,
  };
  const worldCore = {
    id: world.id,
    recipe: scene.finalBrief.recipe,
    renderRecipe: worldRenderText(world),
    texture: world.texture,
    lighting: world.lighting,
    camera: scene.architecture.imageVantage,
    composition: world.compositionConstraint || null,
    motionGrammar: worldMotionText(world),
  };
  const locks = { character: cast, product: null, visibleText: scene.onScreenText ?? 'NO_UNSOURCED_VISIBLE_TEXT' };

  const makePacket = (role: 'IMAGE' | 'MOTION' | 'SUNO', label: string, draftPrompt: string): HandoffPacket => {
    const warnings: Array<{ code: string; message: string }> = [];
    if (scene.architecture.source.status !== 'SOURCE_BOUND') {
      warnings.push({ code: 'UNSOURCED_INPUT', message: scene.architecture.source.notice || 'Unsourced topic input.' });
    }
    if (scene.finalBrief.referenceDNAs.some(r => r.status === 'SUPPRESSED_WORLD_MISMATCH')) {
      warnings.push({ code: 'REFERENCE_DNA_SUPPRESSED', message: 'One or more Reference DNAs cannot override the selected world.' });
    }
    if (role === 'MOTION') {
      warnings.push({ code: 'APPROVED_IMAGE_REQUIRED', message: 'Motion stays locked until an approved image exists.' });
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
  const { projectClass, sceneCount, selectedWorldId, selectedRefIds, selectedPaletteId } = input;
  // Reçetenin "Subject / Konu" alanı Dashboard'un projectTopic'ini EZER. İki ayrı alan
  // aynı şeyi soruyor ("Konu"), ve reçete kapısı (recipeReadiness) subject'i zorunlu
  // tutuyor — ama brief yolu yalnız projectTopic'i okuyordu: Mami reçetede konuyu
  // değiştirdiğinde final_brief.md hâlâ Dashboard'un konusunu yazıyordu. (brandKitLock sınıfı.)
  // FABLE canlı bulgusu: dokunulmamış varsayılan subject projeyi ezmez (contract.ts kanonu).
  const projectTopic = effectiveTopic(input.subject, input.projectTopic);
  const cast = (input.cast || '').trim();

  const normalizedWorldId = normalizeWorldId(selectedWorldId);
  const normalizedPaletteId = normalizePaletteId(selectedPaletteId);
  const world = DATA.worlds.find((w) => w.id === normalizedWorldId);
  if (!world) {
    return {
      status: 'BLOCKED',
      scenes: [],
      contractGate: { status: 'BLOCKED', findings: [{ code: 'NO_WORLD', message: 'Lütfen bir vizyonel dünya seçin.' }] },
      blockers: toBlockers([{ code: 'NO_WORLD', message: 'Lütfen bir vizyonel dünya seçin.' }]),
      error: 'NO_WORLD',
    };
  }

  const path = deriveProductionPath(projectClass);
  const recipe = deriveTeachingRecipe(world, input.selectedPropId);
  // The doctor's own free text goes through the same firewall as the cast. It reaches
  // agentBrief and project.json verbatim, so this IS the prompt path.
  const contractGate = validateBriefCompatibility({
    path,
    world,
    recipe,
    cast,
    authoredSubject: input.subject,
    authoredLocation: input.location,
    authoredSceneNotes: (input.recipeScenes ?? [])
      .flatMap((note) => [note.vo, note.event, note.director_note, note.motion_seed, note.turkish_labels, note.avoid])
      .filter(Boolean)
      .join(' • '),
  });
  if (contractGate.status === 'BLOCKED') {
    return { status: 'BLOCKED', scenes: [], contractGate, blockers: toBlockers(contractGate.findings) };
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
        blockers: toBlockers([{ code: 'SOURCE_NOT_INGESTED', message: 'Raw Source Vault kayıpsız ingest edilmeden üretim yapılamaz.' }]),
        error: 'SOURCE_NOT_INGESTED',
      };
    }
    // Integrity below %100 is NO LONGER a hard wall. If the user deliberately edited a
    // beat's text, byte-exactness to the raw vault is intentionally broken — it is their
    // storyboard and they may compile it. The shortfall is still surfaced as a warning in
    // the QA cabinet (qa.ts reads sourceReport.coverage), so the signal is never hidden;
    // only the block is lifted. Production below carries the edited storyboard verbatim.
    void sourceIntegrity(input.rawSource, input.sourceBeats);
  }

  const paletteOverride = DATA.palettes.find((p) => p.id === normalizedPaletteId);
  // Production uses the current edited canonical storyboard verbatim — no hidden
  // re-budgeting. The user's manual split/merge/mode edits ARE the storyboard.
  const productionSourceBeats = input.rawSource?.length && input.sourceBeats?.length
    ? input.sourceBeats
    : [];
  const count = input.rawSource?.length && productionSourceBeats.length
    ? productionSourceBeats.length
    : Math.max(1, Math.min(20, Number(sceneCount) || 5));
  // No scene-count ceiling: long-form videos (4+ min) legitimately need 40–60+
  // beats, and the user's beat plan is authoritative. `count` is the storyboard
  // the user actually built; production follows it verbatim.
  const sourceParsed: ParsedSource = input.rawSource?.length && productionSourceBeats.length
    ? {
        status: 'SOURCE_BOUND',
        beats: productionSourceBeats.map((beat) => ({ sourceId: beat.sourceId, exactText: beat.exactText })),
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

  // Brain context — register, DNA directives and Suno brief are batch-wide.
  const register = registerOf(path);
  const selectedRefs = selectedRefIds.map(id => DATA.refs.find(r => r.id === id)).filter(Boolean) as SurgeryRef[];
  const compatibleRefs = selectedRefs.filter(r => refCompatibleWithWorld(r, world.id));
  const dna = dnaDirectives(compatibleRefs, register);
  // Material (teaching axis) only colours non-real registers; REAL footage isn't "made of" clay.
  const materialClause = register === 'REAL' ? '' : materialClauseOf(input.selectedPropId, world);
  const sunoBrief = primeSuno(path, world.id);
  let prev: { src: string; concept: Concept } | undefined;
  let prevShotPatternId: string | undefined;
  const usedShotPatternIds: string[] = [];
  // The clock, computed ONCE over the whole source and carried across shots. A night does not
  // end because the next sentence stopped saying "gece".
  const beatTexts = Array.from({ length: count }, (_, k) => createSceneArchitecture(sourceParsed, k + 1, world).source.exactText);
  const nightByScene = nightMap(beatTexts);
  const clockByScene: Clock[] = clockMap(beatTexts);
  const briefScenes: AgentBriefScene[] = [];

  for (let i = 1; i <= count; i++) {
    const arch = createSceneArchitecture(sourceParsed, i, world);
    const pacing = calcPacing(i, count);

    // FAZ2: konsept motoru söküldü. Site sahne öznesini/motion'ı UYDURMAZ — gerçek
    // düşünen Claude yazar. Concept placeholder; verbatim kaynak beat çerçeveye
    // (image sourceBeat + motion Claude-talimatı) açıkça geçer.
    const beatText = arch.source.exactText;
    const concept: Concept = { subject: '', event: '', matched: false };
    // BRAIN M3: eski "dominantSubject/event = beatText" byte-copy ezmesi kalktı —
    // createSceneArchitecture artık verbatim beat'i dürüst adla (exactSourceBeat) ve
    // aynı fingerprint girdileriyle üretiyor; ikinci bir kurulum gerekmiyor.
    const semanticArch: SceneArchitecture = arch;
    const brief = buildFinalBriefContext(semanticArch, world, input.selectedPropId, selectedRefIds, path, paletteOverride);
    const prevId = i > 1 ? i - 1 : undefined;
    const camera = applyWorldCameraLaw(primeCamera(i, beatText, i - 1, register, prev?.src, prevId, 0, world.id), i, world, register, beatText, pathContract(path)?.required);
    const duration = durationGuard(beatText, input.videoModel);

    const onScreenText = deriveOnScreenText(beatText, pacing.phaseName, input.osTextMode ?? 'AUTO');
    let shotPattern = primeShotPattern(i, beatText, register, selectedRefIds, prevShotPatternId, usedShotPatternIds, world.id);
    // Composition sanity: a "ma" (quarter-frame) pattern contradicts a camera
    // that gives the subject the whole frame — re-pick once on clash.
    if (shotPattern.id === 'negative_space_ma' && /full[- ]presence|whole frame|fills? the frame/i.test(camera)) {
      shotPattern = primeShotPattern(i, beatText, register, selectedRefIds, shotPattern.id, [...usedShotPatternIds, shotPattern.id], world.id);
    }
    prevShotPatternId = shotPattern.id;
    usedShotPatternIds.push(shotPattern.id);
    const imagePrompt = brainImagePrompt(i, concept, camera, {
        world, register, dna, palette: paletteOverride,
        shotPattern: shotPattern.line,
        // CODEX#1: both halves of the contract, gated alike — a findings-carrying gate
        // means the path/world pairing is incoherent, so neither half binds.
        pathForbidden: contractGate.findings.length ? '' : pathContract(path)?.forbidden || '',
        pathRequired: contractGate.findings.length ? '' : pathContract(path)?.required || '',
        // CODEX#2: cast is free text on every register. Pinning it to EDU made an
        // authored cast dead data on the very paths that now require one.
        chars: cast || undefined,
        hasCast: !!cast,
        material: materialClause || undefined,
        directorBrief: input.directorBrief,
        // The client's own brand reaches the engine. Without this the site could not make a
        // branded ad: the firewall scrubbed the brand out of the prompt and its negative said
        // "no brand names" — for an advertisement, about the advertised thing.
        brandKitLock: input.brandKitLock || undefined,
        onScreenText,
        sourceBeat: beatText,
        wholeSource: input.rawSource,
        isNight: nightByScene[i - 1] ?? false,
        mood: input.mood ? MOOD_OPTS[input.mood]?.brief : undefined,
        timeLight: input.timeLight ? LIGHT_OPTS[input.timeLight]?.brief : undefined,
        cameraEnergy: input.cameraEnergy ? CAM_OPTS[input.cameraEnergy]?.brief : undefined,
        pov: input.pov ? POV_OPTS[input.pov]?.brief : undefined,
      },
      // pv = sahne varyant tohumu. buildImagePrompt bunu VAR_LIGHT'a veriyor ("key'i bir stop
      // yumuşat" / "key'i karşı taraftan motive et"), ama pure.ts onu HİÇ geçmiyordu: pv daima 0,
      // VAR_LIGHT[0] = '' → ışık direktifi her sahnede BİREBİR aynıydı. Işık varyasyon motoru
      // yazılmış ama kablosu takılmamıştı; sonuç, izleyicinin "aynı setin yeniden kadrajlanmış
      // hâli" hissi. Sahne indeksi tohum olur: varyantlar sahneler boyunca döner. Dünyanın ışık
      // yasası (resolveLightAuthority) hâlâ otoritedir — varyant onun İÇİNDE nefes alır.
      i);
    const motionPrompt = buildMotionPrompt(i, concept, camera, dna, duration.sec, input.videoModel, onScreenText, beatText, worldMotionText(world));
    const voiceOver = beatText;
    prev = { src: beatText, concept };
    // The brief must carry the same per-shot decisions the image prompt does — phase, framing,
    // composition, light variant. Printing only SOURCE + CAMERA made five scenes read as one.
    briefScenes.push({
      id: i, source: beatText, concept, camera, sec: duration.sec, onScreenText,
      phaseName: pacing.phaseName,
      shotPattern: shotPattern.line,
      isNight: nightByScene[i - 1] ?? false,
      clock: clockByScene[i - 1] ?? 'day',
      // THE SECOND DOOR INTO THE SAME ROOM. This line used to read VAR_LIGHT[i % 3] straight
      // from the ungated pool while the image prompt read the same pool THROUGH the world gate.
      // One decision, two artefacts, two different answers: in the FAZ5-PILOT-R2 packages 9 of
      // 32 scenes (28%) had final_brief.md ordering a light the image prompt had already
      // refused — dokuma's brief said "let the accent colour carry the subject edge" three
      // paragraphs under its own "There is NO fill, NO bounce card, NO rim" — and no rule
      // anywhere says which file the agent should believe. Same gate, same seed, one answer.
      lightVariant: lightVariantFor(world, i).replace(/^\s*Light variant:\s*/, '').trim() || undefined,
    });

    const sceneCore: Omit<PureScene, 'handoff'> = {
      id: i,
      topic: `${projectTopic} — Sahne ${i}`,
      architecture: semanticArch,
      finalBrief: brief,
      imagePrompt,
      motionPrompt,
      voiceOver,
      sunoBrief,
      durationSec: duration.sec,
      duration,
      intensity: pacing.intensity,
      phaseName: pacing.phaseName,
      onScreenText,
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
    });
    // The frame gate compares the pixels to scenes[].paletteLight — it must know the clock too.
    scenes.push({ ...sceneCore, handoff, isNight: nightByScene[i - 1] ?? false });
  }

  // DELIVERY PROMISE — MACRO 1 (Mami, 2026-07-15): site kaynak DÜZYAZISINDAN metin niyeti
  // ÇIKARMAZ ve üretimi bu yüzden BLOKLAMAZ. Kaynağın metin isteğini kare için AJAN yazar
  // (brief içinde, Mami'nin doğrudan talimatıyla). `lockDeliveryPromise` yalnız Mami'nin AÇIK
  // beyanından söz doğurur; beyan yoksa `pedagogy_auto` (temiz plaka + VO) — hiç blok.
  //
  // Ölçüm (`validateDeliveryPromise`) yalnızca Mami açık beyan verdiğinde çalışır: baked beyanı
  // verildiyse prompt o metni gerçekten taşımalı; CLEAN kilidi verildiyse kareye metin pişmemeli.
  // Bu, Mami'nin kendi kararının çıktıya karşı korunması — düzyazı tahmini değil.
  const promiseSourceText = sourceParsed.beats.map((b) => b.exactText).join(' ').trim() || projectTopic;
  const { promise, findings: promiseConflicts } = lockDeliveryPromise({
    sourceText: promiseSourceText,
    sourceId: sourceHash,
    osTextMode: input.osTextMode ?? 'AUTO',
    declaration: input.deliveryDeclaration,
  });
  const promiseFindings = [
    ...promiseConflicts,
    ...scenes.flatMap((sc) => validateDeliveryPromise(promise, sc.imagePrompt, sc.id, sc.onScreenText)),
  ];
  if (promiseFindings.length) {
    return {
      status: 'BLOCKED',
      scenes: [],
      contractGate: { status: 'BLOCKED', findings: [...contractGate.findings, ...promiseFindings] },
      blockers: toBlockers(promiseFindings, scenes.map((sc) => sc.id)),
      error: promiseFindings[0].code,
    };
  }

  const agentCtx = {
    projectTopic,
    productionPath: path,
    contract: pathContract(path),
    register,
    world,
    palette: paletteOverride,
    dna,
    cast,
    location: input.location,
    doctorNotes: input.recipeScenes,
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
    voSyncMode: input.voSyncMode ?? 'FREE',
    osTextMode: input.osTextMode ?? 'AUTO',
    osTextBlock: formatOsTextBlock(scenes.map(sc => ({ id: sc.id, phaseName: sc.phaseName, onScreenText: sc.onScreenText, durationSec: sc.durationSec }))),
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
