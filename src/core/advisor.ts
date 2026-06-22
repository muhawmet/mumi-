// The MAMILAS "creative director" advisor — pure intelligence on top of the
// existing decode + compatibility engine. Two jobs:
//   suggestRecipe()  — turn a topic into a full world+palette+DNA recipe
//   directorNotes()  — read the whole recipe and give directorial feedback
// No DOM, no LLM, deterministic. Reuses decodeBrief / registerOf / worldCategory.

import { decodeBrief } from './source';
import { DATA, deriveProductionPath, deriveTeachingRecipe, validateBriefCompatibility } from './pure';
import { registerOf, type Register } from './brain';
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

function refFamily(cat: string): string {
  return String(cat || '').split('/')[0].trim().toLowerCase();
}

/** Whole-recipe directorial read. Ordered: blockers first, then polish, then praise. */
export function directorNotes(input: AdvisorInput): DirectorNote[] {
  const notes: DirectorNote[] = [];
  const world = DATA.worlds.find((w) => w.id === input.selectedWorldId);
  const palette = DATA.palettes.find((p) => p.id === input.selectedPaletteId);
  const refs = (input.selectedRefIds || []).map((id) => DATA.refs.find((r) => r.id === id)).filter(Boolean) as Array<{ id: string; cat: string; name: string }>;
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
    }
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

  if (!blocking && world && palette && refs.length >= 1) {
    notes.unshift({ level: 'good', title: 'Reçete sağlam', detail: `${REGISTER_LABEL[register]} register'ı, "${world.name}" ve DNA uyumlu — üretime hazır.` });
  }

  return notes;
}
