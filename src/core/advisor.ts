// The MAMILAS "creative director" advisor — pure intelligence on top of the
// existing decode + compatibility engine. Two jobs:
//   suggestRecipe()  — turn a topic into a full world+palette+DNA recipe
//   directorNotes()  — read the whole recipe and give directorial feedback
// No DOM, no LLM, deterministic. Reuses decodeBrief / registerOf / worldCategory.

import { decodeBrief } from './source';
import { DATA, deriveProductionPath, deriveTeachingRecipe, validateBriefCompatibility, type SurgeryRef, type SurgeryWorld } from './pure';
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

/** Topic → a complete, valid recipe the user can apply with one click. */
export function suggestRecipe(topic: string): RecipeSuggestion {
  const decoded = decodeBrief(topic || '');
  const p = decoded.project;
  return {
    path: decoded.path,
    worldId: p.world,
    paletteId: p.palette,
    refIds: p.ref ? [p.ref] : [],
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

// Gritty render worlds vs. clean/bright palettes: the Render Lock wins by
// authority, but the palette can mislead downstream agents — worth a heads-up.
const GRITTY_WORLD_IDS = new Set(['arcane', 'painterly_shadow', 'graphic_comic']);
const CLEAN_PALETTE_IDS = new Set(['vibrant_clean_education', 'pastel_soft', 'clinical_blue']);

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
  pixar3d: ['pixar_dimensional', 'pixar_emotional_staging', 'soul'],
  anime_cel: ['anime_silhouette', 'demon_slayer_dna', 'makoto_shinkai_sky_light'],
  arcane: ['arcane_texture', 'arcane_zaun_dna', 'league_arcane_bridge'],
  spiderverse: ['spiderverse_graphic', 'verse_miles_dna', 'spiderverse_gwen_pastel'],
  ghibli: ['ghibli_organic', 'miyazaki_wind_nature', 'ghibli_spirited_bathhouse'],
  stopmotion: ['laika_tactile_stopmotion', 'lego_movie_brick_energy', 'arcane_clay_hybrid'],
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
  return world.group.toUpperCase() === 'REAL' ? 'REAL' : 'STY';
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

export function dnaStrength(refs: SurgeryRef[], register: Register = 'STY'): DnaStrength {
  const fields = changedDirectiveFields(refs, register);
  return {
    filled: fields.length,
    total: CONTRIBUTION_FIELDS.length,
    percent: Math.round((fields.length / CONTRIBUTION_FIELDS.length) * 100),
    fields,
    roles: fields.map((field) => ROLE_LABEL[field]),
    zeroRefIds: refs.filter((ref) => refContribution(ref, register).count === 0).map((ref) => ref.id),
    directives: dnaDirectives(refs, register),
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
  if (refs.length === 0) { notes.push({ level: 'warn', title: 'Referans DNA yok', detail: 'Yön yok — sonuç jenerik çıkar. En az bir referans ekle.' }); blocking = true; }

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
    notes.push({ level: 'info', title: 'Çok fazla referans', detail: `${refs.length} DNA sesi karışır. En güçlü 3'e in.` });
  } else if (refs.length >= 2) {
    const families = new Set(refs.map((r) => refFamily(r.cat)));
    if (families.size === refs.length) {
      notes.push({ level: 'info', title: 'Referanslar dağınık', detail: `Seçili DNA'lar ${families.size} ayrı aileden; ortak bir görsel dil seçersen sahneler tutarlı olur.` });
    }
  }

  // scene-count guard — too many scenes = unproducible, no narrative arc
  if ((input.sceneCount ?? 0) > 20) {
    notes.push({
      level: 'warn',
      title: 'Sahne sayısı çok yüksek',
      detail: `${input.sceneCount} sahne planlandı. Tipik içerik için 8-15 sahne yeter (üst sınır 25). Kaynağı tematik beat'lere grupla (Beat Planner / Akıllı Grupla).`,
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

  if (!blocking && world && palette && refs.length >= 1 && lowFitRefs.length === 0) {
    const strength = dnaStrength(refs, register);
    notes.unshift({ level: 'good', title: 'Reçete sağlam', detail: `${REGISTER_LABEL[register]} register'ı, "${world.name}" ve DNA uyumlu; direktif gücü ${strength.filled}/${strength.total} — üretime hazır.` });
  }

  return notes;
}
