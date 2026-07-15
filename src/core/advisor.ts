// The MAMILAS "creative director" advisor — pure intelligence on top of the
// existing decode + compatibility engine. Two jobs:
//   suggestRecipe()  — turn a topic into a full world+palette+DNA recipe
//   directorNotes()  — read the whole recipe and give directorial feedback
// No DOM, no LLM, deterministic. Reuses decodeBrief / registerOf / worldCategory.

import { decodeBrief } from './source';
import { DATA, deriveProductionPath, deriveTeachingRecipe, normalizeWorldId, refCompatibleWithWorld, resolveRecipeDefaults, validateBriefCompatibility, type SurgeryRef, type SurgeryWorld } from './pure';
import { dnaDirectives, registerOf, type DnaDirectives, type Register } from './brain';
import { worldCategory, type PreviewCategory } from './preview';

export interface RecipeSuggestion {
  path: string;
  worldId: string;
  paletteId: string;
  refIds: string[];
  reason: string;
  confidence: 'high' | 'medium' | 'fallback';
}

/**
 * Generic starter recipe. Raw source/topic is deliberately ignored: the site cannot infer
 * production intent from source words. Mami may explicitly apply this neutral starter, then
 * choose the real world/palette/ref; intelligent creative development belongs to the Director.
 */
export function suggestRecipe(_topic: string): RecipeSuggestion {
  const decoded = decodeBrief('');
  const p = decoded.project;
  const defaults = resolveRecipeDefaults(decoded.path, p.world);
  return {
    path: decoded.path,
    worldId: p.world,
    paletteId: p.palette,
    refIds: p.ref ? [p.ref] : defaults.selectedRefIds,
    reason: decoded.reason,
    confidence: decoded.confidence,
  };
}

export type NoteLevel = 'good' | 'info' | 'warn';
export interface DirectorNote { level: NoteLevel; title: string; detail: string; }

export interface AdvisorInput {
  projectClass: string;
  selectedWorldId: string;
  selectedPaletteId: string;
  selectedRefIds: string[];
  selectedPropId?: string;
  rawSource?: string;
  sourceCoverage?: number | null;
  sceneCount?: number;
  intensities?: number[];
  phase0PresetId?: string;
}

// Which preview categories sit honestly under each register.
const REGISTER_OK: Record<Register, PreviewCategory[]> = {
  EDU: ['edu'],
  STY: ['anime', 'verse', 'arcane', 'edu'],
  REAL: ['real'],
};
const REGISTER_LABEL: Record<Register, string> = {
  EDU: 'Animasyon/Eğitim', STY: 'Stilize Premium', REAL: 'Foto-gerçek',
};

// Which registers each Phase-0 preset's Director Mandate was authored for.
// Catches e.g. a "Ürün / Marka Filmi" mandate being applied to an EDU script.
const PRESET_REGISTER_MAP: Record<string, Register[]> = {
  product_brand: ['REAL'],
  cinematic_story: ['REAL'],
  social_short: ['REAL'],
  doc_human: ['REAL'],
  corp_public: ['REAL'],
  event_campaign: ['REAL'],
  edu_explainer: ['EDU', 'STY'],
  stylized_game: ['STY'],
};

// Every world a Phase-0 preset can legitimately set (its base `sets` plus every
// director-panel choice). If the final recipe's world is outside this scope, the
// Director Mandate text still describes one of THESE worlds (e.g. "Clay diorama"
// while the user switched to kurzgesagt_edu) — downstream agents read a mandate
// that contradicts the Render Lock. Render Lock wins by authority, so this is a
// heads-up, never a block. Kept in sync with src/data/presets.ts by a test.
export const PRESET_WORLD_SCOPE: Record<string, string[]> = {
  // Reklam yolları (product/corp/event) amaca özel COMMERCIAL_REAL dünyalarına bağlıdır —
  // film-yönetmeni dünyaları (fincher/chivo/deakins) reklamda kullanılmaz. Bu liste
  // presets.ts ile senkron kalmak ZORUNDA (advisor.test.ts kilitler).
  product_brand: ['product_brand_real', 'kurumsal_brand_film'],
  edu_explainer: ['pixar_3d_edu', 'paper_craft_popup'],
  cinematic_story: ['deakins_naturalist', 'chivo_naturalist_handheld'],
  social_short: ['chivo_naturalist_handheld'],
  doc_human: ['chivo_naturalist_handheld'],
  corp_public: ['kurumsal_brand_film'],
  event_campaign: ['civic_promo_real', 'sports_energy_real'],
  stylized_game: ['arcane_fortiche', 'demon_slayer_ufotable', 'spiderverse_sony', 'jjk_mappa', 'one_piece_toei'],
  food_beverage: ['appetite_tabletop_real'],
  edu_promo: ['edu_promo_real'],
  campaign_kv: ['commercial_studio', 'photoreal_location', 'luxury_editorial'],
  product_launch: ['product_macro_tabletop', 'commercial_studio', 'tech_clinical_real'],
  social_content: ['social_reels_real', 'commercial_studio'],
  editorial_cover: ['luxury_editorial', 'human_portrait_real'],
  brand_kit: ['commercial_studio', 'photoreal_location'],
  pitch_deck: ['notebook', 'commercial_studio', 'lightbox'],
  ui_product: ['tech_clinical_real', 'product_macro_tabletop', 'photoreal_location'],
};

// Gritty render worlds vs. clean/bright palettes: the Render Lock wins by
// authority, but the palette can mislead downstream agents — worth a heads-up.
const GRITTY_WORLD_IDS = new Set(['arcane', 'arcane_fortiche', 'painterly_shadow', 'graphic_comic']);
const CLEAN_PALETTE_IDS = new Set(['vibrant_clean_education', 'vibrant_edu', 'pastel_soft', 'clinical_blue', 'cool_scientific']);

function refFamily(cat: string): string {
  return String(cat || '').split('/')[0].trim().toLowerCase();
}

export const REF_FIT_CONFLICT = 45;

const REAL_REF_CATS = new Set([
  'Architecture', 'Cinematography', 'Commercial', 'Commercial / Auto', 'Commercial / Food',
  'Commercial / Tech', 'Documentary', 'Fashion / Editorial', 'Fine Art Lighting',
  'Live Action Cinema', 'Product / Macro', 'Product / Tech', 'Real Setup', 'Sports / Game',
  'Tech / Medical',
]);
const STYLIZED_REF_CATS = new Set([
  '2D Animation', '3D Animation', 'Anime / Auteur', 'Anime / Cinematic', 'Anime / Comedy',
  'Anime / Game', 'Anime / Graphic', 'Anime / Mecha', 'Anime / Shonen', 'Anime Action',
  'Animation / Game', 'Animation Auteur', 'Game / Animation', 'Game / Film',
  'Game Art Direction', 'Hybrid Edu', 'Story DNA', 'Stylized Premium',
]);

const WORLD_REF_CATS: Record<string, string[]> = {
  pixar3d: ['3D Animation', 'Animation Auteur', 'Hybrid Edu'],
  anime_cel: ['Anime Action', 'Anime / Shonen', 'Anime / Cinematic', 'Anime / Auteur', 'Anime / Graphic'],
  arcane: ['Stylized Premium', 'Game / Animation', 'Fine Art Lighting'],
  spiderverse: ['Stylized Premium', 'Anime / Graphic', '2D Animation'],
  ghibli: ['Animation Auteur', 'Anime / Auteur', 'Stylized Premium'],
  stopmotion: ['Animation Auteur', '3D Animation', 'Hybrid Edu'],
  cinematic_real: ['Live Action Cinema', 'Cinematography', 'Real Setup'],
  real_human_doc: ['Documentary', 'Real Setup', 'Cinematography'],
  clay: ['Hybrid Edu', '3D Animation', 'Animation Auteur'],
  paper: ['Hybrid Edu', '2D Animation', 'Stylized Premium'],
  wood: ['Animation Auteur', 'Hybrid Edu', '3D Animation'],
  museum: ['Historical / National', 'Fine Art Lighting', 'Cinematography'],
  fabric: ['Hybrid Edu', 'Animation Auteur', 'Stylized Premium'],
  lightbox: ['Tech / Medical', 'Cinematography', '3D Animation'],
  notebook: ['Anime / Auteur', '2D Animation', 'Story DNA'],
  botanical: ['Animation Auteur', 'Stylized Premium', 'Game Art Direction'],
  graphic_comic: ['Stylized Premium', '2D Animation', 'Game Art Direction'],
  painterly_shadow: ['Stylized Premium', 'Fine Art Lighting', 'Game Art Direction'],
  photoreal_location: ['Cinematography', 'Live Action Cinema', 'Documentary'],
  commercial_studio: ['Commercial', 'Real Setup', 'Cinematography'],
  documentary_civic: ['Documentary', 'Real Setup', 'Story DNA'],
  human_portrait_real: ['Real Setup', 'Fine Art Lighting', 'Documentary'],
  luxury_editorial: ['Fashion / Editorial', 'Fine Art Lighting', 'Real Setup'],
  food_macro_real: ['Product / Macro', 'Commercial / Food', 'Real Setup'],
  architecture_real: ['Architecture', 'Cinematography', 'Real Setup'],
  tech_clinical_real: ['Tech / Medical', 'Product / Tech', 'Real Setup'],
  social_reels_real: ['Documentary', 'Real Setup', 'Commercial'],
  automotive_stage_real: ['Commercial / Auto', 'Commercial', 'Real Setup'],
  tourism_destination_real: ['Documentary', 'Cinematography', 'Commercial'],
  healthcare_public_real: ['Documentary', 'Real Setup', 'Cinematography'],
  real_event_coverage: ['Real Setup', 'Documentary', 'Sports / Game'],
  product_macro_tabletop: ['Product / Macro', 'Real Setup', 'Commercial'],
};

const STARTER_PACKS: Record<string, string[]> = {
  rick_morty_scifi: ['rick_morty_wobble', 'cartoon_network_graphic'],
  invincible_hero_comic: ['invincible_hero_impact', 'batman_timm_graphic'],
  castlevania_gothic: ['castlevania_gothic_sakuga', 'jujutsu_dark_ritual'],
  pixar_3d_edu: ['pixar_dimensional', 'pixar_emotional_staging', 'soul'],
  paper_craft_popup: ['verse_paper_hybrid', 'kurzgesagt_clarity', 'cartoon_network_graphic'],
  ghibli_hayao: ['ghibli_organic', 'miyazaki_wind_nature', 'ghibli_spirited_bathhouse'],
  arcane_fortiche: ['arcane_texture', 'arcane_zaun_dna', 'league_arcane_bridge'],
  spiderverse_sony: ['spiderverse_graphic', 'verse_miles_dna', 'spiderverse_gwen_pastel'],
  jjk_mappa: ['jujutsu_dark_ritual', 'jjk_dna', 'inside_limbo_shadow'],
  demon_slayer_ufotable: ['demon_slayer_breath', 'demon_slayer_dna', 'makoto_shinkai_sky_light'],
  one_piece_toei: ['one_piece_sunny_adventure', 'onepiece_grandline_scale', 'anime_silhouette'],
  deakins_naturalist: ['roger_deakins_naturalism', 'cinedna_naturalkey', 'cinedna_deepfocus'],
  fincher_precision: ['cinedna_symmetry', 'cinedna_highkey', 'rembrandt_portrait'],
  wes_anderson_symmetric: ['cinedna_symmetry', 'bauhaus_geometric', 'vogue_editorial'],
  chivo_naturalist_handheld: ['emmanuel_lubezki_long_take', 'cinedna_handheld', 'setup_verite'],
  edu_promo_real: ['cinedna_naturalkey', 'cinedna_highkey', 'apple_object_worship'],
  kurumsal_brand_film: ['cinedna_symmetry', 'architectural_digest', 'apple_object_worship'],
  civic_promo_real: ['cinedna_golden', 'civic_doc', 'cinedna_deepfocus'],
  appetite_tabletop_real: ['product_macro', 'apple_object_worship', 'cinedna_naturalkey'],
  product_brand_real: ['apple_object_worship', 'product_macro', 'cinedna_highkey'],
  automotive_hero_real: ['product_glass_refraction', 'roger_deakins_naturalism', 'cinedna_highkey'],
  nature_doc_real: ['street_doc', 'roger_deakins_naturalism', 'miyazaki_wind_nature'],
  science_viz_real: ['product_macro', 'cinedna_highkey', 'kurzgesagt_iso'],
  archival_newsreel: ['street_doc', 'chernobyl_muted_dread', 'newsprint_halftone_panel'],
  technical_cutaway: ['product_macro', 'kurzgesagt_iso', 'cinedna_highkey'],
  shinkai_photoreal_anime: ['miyazaki_wind_nature', 'chrome_grid_neon_sun', 'cinedna_goldenhour'],
  period_reconstruction: ['roger_deakins_naturalism', 'chernobyl_muted_dread', 'street_doc'],
  sports_energy_real: ['cinedna_handheld', 'setup_verite', 'cinedna_deepfocus'],
  kurzgesagt_edu: ['kurzgesagt_clarity', 'nasa_vintage_poster', 'bauhaus_geometric'],
  whiteboard_explainer: ['samurai_jack_minimal', 'kurzgesagt_clarity', 'batman_timm_graphic'],
  retro_anime_film: ['akira_neon_impact', 'cowboy_bebop_noir_jazz', 'ghost_shell_cyber_melancholy'],
  motion_design_flat: ['bauhaus_geometric', 'constructivist_poster', 'apple_object_worship'],
  ukiyo_e_print: ['hokusai_woodblock', 'turkish_folk_iznik', 'medieval_illuminated'],
  laika_stopmotion: ['laika_tactile_stopmotion', 'ghibli_felt_hybrid', 'lego_movie_brick_energy'],
  cyberpunk_neon_noir: ['akira_neon_impact', 'ghost_shell_cyber_melancholy', 'arcane_zaun_dna'],
  vintage_comic_book: ['spiderverse_graphic', 'batman_timm_graphic', 'kurzgesagt_clarity'],
  claymation_aardman: ['laika_tactile_stopmotion', 'ghibli_felt_hybrid', 'lego_movie_brick_energy'],
  noir_high_contrast: ['cowboy_bebop_noir_jazz', 'cinedna_handheld', 'inside_limbo_shadow'],
  watercolor_storybook: ['ghibli_organic', 'miyazaki_wind_nature', 'hokusai_woodblock'],
  sci_fi_hard_surface: ['akira_neon_impact', 'cinedna_symmetry', 'emmanuel_lubezki_long_take'],
  synthwave_retro_80s: ['akira_neon_impact', 'ghost_shell_cyber_melancholy', 'spiderverse_gwen_pastel'],
  low_poly_ps1: ['samurai_jack_minimal', 'kurzgesagt_clarity', 'apple_object_worship'],
  naruto_shinobi_world: ['naruto_chakra_motion', 'dragon_ball_power_aura', 'anime_silhouette'],
  aot_wall_world: ['attack_titan_scale', 'vagabond_ink_brush', 'inside_limbo_shadow'],
  solo_leveling_gate: ['solo_leveling_rank_shadow', 'jujutsu_dark_ritual', 'inside_limbo_shadow'],
  bleach_soul_world: ['bleach_soul_blade', 'bleach_hollow_mask_pressure', 'anime_silhouette'],
  pixar3d: ['pixar_dimensional', 'pixar_emotional_staging', 'soul'],
  anime_cel: ['anime_silhouette', 'demon_slayer_dna', 'makoto_shinkai_sky_light'],
  arcane: ['arcane_texture', 'arcane_zaun_dna', 'league_arcane_bridge'],
  spiderverse: ['spiderverse_graphic', 'verse_miles_dna', 'spiderverse_gwen_pastel'],
  ghibli: ['ghibli_organic', 'miyazaki_wind_nature', 'ghibli_spirited_bathhouse'],
  stopmotion: ['laika_tactile_stopmotion', 'lego_movie_brick_energy', 'arcane_clay_hybrid'],
  mappa_cinematic: ['jujutsu_dark_ritual', 'demon_slayer_breath', 'solo_leveling_rank_shadow'],
  bones_action: ['dragon_ball_power_aura', 'naruto_chakra_motion', 'anime_silhouette'],
  toei_adventure: ['one_piece_sunny_adventure', 'dragon_ball_power_aura', 'naruto_chakra_motion'],
  cinematic_real: ['roger_deakins_naturalism', 'emmanuel_lubezki_long_take', 'cinedna_naturalkey'],
  real_human_doc: ['civic_doc', 'setup_verite', 'cinedna_handheld'],
  clay: ['pixar_dimensional', 'arcane_clay_hybrid', 'kurzgesagt_clarity'],
  paper: ['verse_paper_hybrid', 'cartoon_network_graphic', 'kurzgesagt_clarity'],
  wood: ['laika_tactile_stopmotion', 'kurzgesagt_clarity', 'miyazaki_wind_nature'],
  museum: ['atat_rk_prestige', 'rembrandt_portrait', 'cinedna_symmetry'],
  fabric: ['ghibli_felt_hybrid', 'laika_tactile_stopmotion', 'ghibli_organic'],
  lightbox: ['kurzgesagt_clarity', 'tech_glass', 'cinedna_highkey'],
  notebook: ['vagabond_ink_brush', 'samurai_jack_minimal', 'kurzgesagt_clarity'],
  botanical: ['ghibli_organic', 'miyazaki_wind_nature', 'ori_glow_forest'],
  graphic_comic: ['spiderverse_graphic', 'cartoon_network_graphic', 'hades_underworld_graphic'],
  painterly_shadow: ['arcane_texture', 'rembrandt_portrait', 'inside_limbo_shadow'],
  photoreal_location: ['roger_deakins_naturalism', 'cinedna_naturalkey', 'cinedna_deepfocus'],
  commercial_studio: ['apple_object_worship', 'setup_threepoint', 'cinedna_highkey'],
  documentary_civic: ['civic_doc', 'story_civic_child_height', 'setup_verite'],
  human_portrait_real: ['setup_window', 'rembrandt_portrait', 'cinedna_window'],
  luxury_editorial: ['vogue_editorial', 'setup_highkey', 'chanel_bw_luxury'],
  food_macro_real: ['food_tabletop_macro', 'food_macro', 'cinedna_macro'],
  architecture_real: ['architectural_digest', 'architecture_window_light', 'cinedna_deepfocus'],
  tech_clinical_real: ['tech_glass', 'setup_highkey', 'cinedna_highkey'],
  social_reels_real: ['street_doc', 'setup_verite', 'cinedna_handheld'],
  automotive_stage_real: ['automotive_commercial', 'setup_goldenhour_auto', 'cinedna_tealorange'],
  tourism_destination_real: ['destination_doc', 'cinedna_golden', 'thy_destination_scale'],
  healthcare_public_real: ['setup_window', 'civic_doc', 'cinedna_overcast'],
  real_event_coverage: ['setup_verite', 'cinedna_handheld', 'fifa_stadium_energy'],
  product_macro_tabletop: ['product_macro', 'setup_tabletop', 'luxury_watch_macro'],
};

function worldRegister(world: SurgeryWorld): Register {
  return /real|cinematic/i.test(world.group) ? 'REAL' : 'STY';
}

/** 0–100 world ↔ reference fit. Explicit world locks outrank category affinity. */
export function refFit(world: SurgeryWorld | undefined, ref: SurgeryRef): number {
  if (!world) return 0;
  if (ref.worldId) return ref.worldId === world.id ? 100 : 0;

  const curatedIndex = (STARTER_PACKS[world.id] || []).indexOf(ref.id);
  if (curatedIndex >= 0) return 98 - curatedIndex * 4;

  const preferred = WORLD_REF_CATS[world.id] || [];
  const preferredIndex = preferred.indexOf(ref.cat);
  if (preferredIndex >= 0) return Math.max(68, 82 - preferredIndex * 7);

  const compatibleFamily = worldRegister(world) === 'REAL' ? REAL_REF_CATS : STYLIZED_REF_CATS;
  if (compatibleFamily.has(ref.cat)) return 62;
  if (ref.cat === 'Story DNA') return 55;
  return 22;
}

export function starterPackFor(worldId: string): SurgeryRef[] {
  const ids = STARTER_PACKS[worldId] || [];
  return ids.map((id) => DATA.refs.find((ref) => ref.id === id)).filter(Boolean) as SurgeryRef[];
}

const CONTRIBUTION_FIELDS = ['camera', 'light', 'staging', 'motion', 'texture'] as const;
export type DnaContributionField = typeof CONTRIBUTION_FIELDS[number];
export type DnaRole = 'kamera' | 'ışık' | 'kompozisyon' | 'hareket' | 'doku';
const ROLE_LABEL: Record<DnaContributionField, DnaRole> = {
  camera: 'kamera', light: 'ışık', staging: 'kompozisyon', motion: 'hareket', texture: 'doku',
};

function changedDirectiveFields(refs: SurgeryRef[], register: Register): DnaContributionField[] {
  const base = dnaDirectives([], register);
  const actual = dnaDirectives(refs, register);
  return CONTRIBUTION_FIELDS.filter((field) => actual[field] !== base[field]);
}

export function refContribution(ref: SurgeryRef, register: Register = 'STY'): { fields: DnaContributionField[]; roles: DnaRole[]; count: number } {
  const fields = changedDirectiveFields([ref], register);
  return { fields, roles: fields.map((field) => ROLE_LABEL[field]), count: fields.length };
}

export interface DnaStrength {
  filled: number;
  total: number;
  percent: number;
  fields: DnaContributionField[];
  roles: DnaRole[];
  zeroRefIds: string[];
  directives: DnaDirectives;
}

export function dnaStrength(refs: SurgeryRef[], register: Register = 'STY', worldId?: string): DnaStrength {
  // Same world gate as production (pure.ts refCompatibleWithWorld): a ref the
  // batch will silently drop must not report strength here.
  const gatedOut = worldId ? refs.filter((r) => !refCompatibleWithWorld(r, worldId)) : [];
  const active = refs.filter((r) => !gatedOut.includes(r));
  const fields = changedDirectiveFields(active, register);
  return {
    filled: fields.length,
    total: CONTRIBUTION_FIELDS.length,
    percent: Math.round((fields.length / CONTRIBUTION_FIELDS.length) * 100),
    fields,
    roles: fields.map((field) => ROLE_LABEL[field]),
    zeroRefIds: [
      ...gatedOut.map((ref) => ref.id),
      ...active.filter((ref) => refContribution(ref, register).count === 0).map((ref) => ref.id),
    ],
    directives: dnaDirectives(active, register),
  };
}

/** Whole-recipe directorial read. Ordered: blockers first, then polish, then praise. */
export function directorNotes(input: AdvisorInput): DirectorNote[] {
  const notes: DirectorNote[] = [];
  const world = DATA.worlds.find((w) => w.id === input.selectedWorldId);
  const palette = DATA.palettes.find((p) => p.id === input.selectedPaletteId);
  const refs = (input.selectedRefIds || []).map((id) => DATA.refs.find((r) => r.id === id)).filter(Boolean) as SurgeryRef[];
  const path = deriveProductionPath(input.projectClass);
  const register = registerOf(path);

  let blocking = false;

  if (!world) { notes.push({ level: 'warn', title: 'Dünya seçilmedi', detail: 'Sahnenin görsel grameri yok. Bir vizyonel dünya seç.' }); blocking = true; }
  if (!palette) { notes.push({ level: 'warn', title: 'Palet yok', detail: 'Işık davranışı tanımsız kalır. Bir palet seç (renkler ışık olarak okunur).' }); blocking = true; }
  if (refs.length === 0) {
    notes.push({ level: 'info', title: 'Referans DNA seçilmedi', detail: 'Render World tek başına çalışır; ama prodüksiyon seviyesi prompt için 1-3 uyumlu DNA kamera/ışık/hareket tarifini keskinleştirir.' });
  }

  // register ↔ world coherence
  if (world) {
    const wcat = worldCategory([input.selectedWorldId, world.name, (world as { formula?: string }).formula].join(' '));
    if (!REGISTER_OK[register].includes(wcat)) {
      notes.push({ level: 'warn', title: 'Register / dünya gerilimi', detail: `${REGISTER_LABEL[register]} path'i ile "${world.name}" (${wcat}) dünyası çakışıyor. Aynı dili konuşmuyorlar.` });
      blocking = true;
    }
  }

  // preset (Director Mandate) ↔ register coherence — e.g. a product-film mandate on an EDU script
  if (input.phase0PresetId) {
    const allowed = PRESET_REGISTER_MAP[input.phase0PresetId];
    if (allowed && !allowed.includes(register)) {
      notes.push({
        level: 'warn',
        title: 'Preset / register uyumsuzluğu',
        detail: `"${input.phase0PresetId}" preset'i ${allowed.map((r) => REGISTER_LABEL[r]).join(' / ')} için tasarlandı, ama mevcut path ${REGISTER_LABEL[register]}. Director Mandate yanlış dili konuşuyor — register'a uygun bir preset seç.`,
      });
      blocking = true;
    }
  }

  // preset (Director Mandate) ↔ world coherence — mandate text describes a preset
  // world ("Clay diorama") while the recipe locked a different one. Render Lock
  // wins by authority; this only warns that the mandate speaks a stale language.
  if (world && input.phase0PresetId) {
    const scope = PRESET_WORLD_SCOPE[input.phase0PresetId]?.map(normalizeWorldId);
    if (scope && !scope.includes(normalizeWorldId(world.id))) {
      notes.push({
        level: 'info',
        title: 'Preset / dünya gerilimi',
        detail: `"${input.phase0PresetId}" preset'inin Director Mandate metni kendi dünyalarını (${scope.join(', ')}) tarif eder, ama seçili dünya "${world.name}". Render Lock kazanır; yine de mandate'i bu dünyaya göre tazelemek agent karışıklığını önler.`,
      });
    }
  }

  // palette ↔ world mood harmony (non-blocking: Render Lock has authority)
  if (world && GRITTY_WORLD_IDS.has(world.id) && CLEAN_PALETTE_IDS.has(input.selectedPaletteId)) {
    notes.push({
      level: 'info',
      title: 'Palet / dünya gerilimi',
      detail: `"${world.name}" gritty bir dünya ama seçili palet temiz/parlak. Render Lock kazanır, fakat agentlar palet bilgisiyle karışabilir — dünyaya uygun bir palet daha tutarlı olur.`,
    });
  }

  const lowFitRefs = world
    ? refs.map((ref) => ({ ref, fit: refFit(world, ref) })).filter(({ fit }) => fit < REF_FIT_CONFLICT)
    : [];
  if (lowFitRefs.length > 0) {
    notes.push({
      level: 'warn',
      title: 'DNA / dünya uyumsuzluğu',
      detail: lowFitRefs.map(({ ref, fit }) => `${ref.name} %${fit}`).join(' · ') + ` — %${REF_FIT_CONFLICT} altı referans render dilini bulandırır.`,
    });
  }

  // compatibility gate (path × world × teaching recipe)
  if (world) {
    try {
      const recipe = deriveTeachingRecipe(world, input.selectedPropId || '');
      const gate = validateBriefCompatibility({ path, world, recipe });
      if (gate.status === 'BLOCKED') {
        gate.findings.forEach((f: { message: string }) => notes.push({ level: 'warn', title: 'Uyumluluk kapısı', detail: f.message }));
        blocking = true;
      }
    } catch { /* deriveTeachingRecipe is best-effort here */ }
  }

  // reference coherence — too many distinct DNA families muddies the voice
  if (refs.length > 3) {
    const sorted = world ? [...refs].sort((a, b) => refFit(world, b) - refFit(world, a)) : refs;
    const toRemove = sorted.slice(3).map((r) => r.name);
    notes.push({ level: 'info', title: 'Çok fazla referans', detail: `${refs.length} DNA sesi karışır. Çıkar: ${toRemove.join(', ')}.` });
  } else if (refs.length >= 2) {
    const families = new Set(refs.map((r) => refFamily(r.cat)));
    if (families.size === refs.length) {
      notes.push({ level: 'info', title: 'Referanslar dağınık', detail: `Seçili DNA'lar ${families.size} ayrı aileden; ortak bir görsel dil seçersen sahneler tutarlı olur.` });
    }
  }

  // scene-count note — long-form is allowed; this is a soft cost heads-up, not a block.
  if ((input.sceneCount ?? 0) > 30) {
    notes.push({
      level: 'info',
      title: 'Uzun format',
      detail: `${input.sceneCount} sahne planlandı — uzun format (4 dk+) için normal. Üretim/klip maliyeti yüksek olur; sahne sayısını düşürmeyi veya source'u daha az satıra bölmeyi düşün.`,
    });
  }

  // source intelligence
  if (input.rawSource && (input.sourceCoverage ?? 100) < 100) {
    notes.push({ level: 'warn', title: 'Kaynak bütünlüğü düşük', detail: `Kapsam %${input.sourceCoverage}. Üretim için %100 gerekir — ingest'i tamamla.` });
  } else if (!input.rawSource && (input.sceneCount ?? 1) > 1) {
    notes.push({ level: 'info', title: 'Tek konu · çok sahne', detail: 'Çok-satırlı SOURCE vermezsen her sahne aynı beat\'i tekrarlar. Kaynağı satırlara böl.' });
  }

  // pacing read
  if (input.intensities && input.intensities.length >= 3) {
    const peak = Math.max(...input.intensities);
    if (peak < 60) notes.push({ level: 'info', title: 'Doruk zayıf', detail: `Pacing arcı düz (tepe %${Math.round(peak)}). Bir climax beat'ini yükselt.` });
  }

  if (!blocking && world && palette && lowFitRefs.length === 0) {
    const strength = dnaStrength(refs, register, input.selectedWorldId);
    notes.unshift({ level: 'good', title: 'Reçete sağlam', detail: `${REGISTER_LABEL[register]} register'ı ve "${world.name}" uyumlu; DNA gücü ${strength.filled}/${strength.total} — üretime hazır.` });
  }

  return notes;
}
