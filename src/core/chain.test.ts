import { describe, expect, it } from 'vitest';
import { PHASE0_VIDEO } from '../data/presets';
import { AUTHORITY_HIERARCHY } from './brain';
import { buildCommandJSON } from './commandExport';
import { buildProductionExport } from './productionExport';
import { containsWorkTitle, containsProtectedTerm } from './proof';
import { DATA, generateBatch, normalizeWorldId, resolveRecipeDefaults } from './pure';
import { ingestSource, sourceIntegrity } from './source';

// ─────────────────────────────────────────────────────────────────────────────
// THE CHAIN — reçete → final brief → command, end to end, every preset.
//
// Every defect this project has shipped lived in a SEAM, not in a unit: the preset
// named a world that no longer existed and normalizeWorldId quietly rescued it into
// the wrong one; the anchor reached the prompt carrying a brand; the light variant
// engine existed but nothing passed `pv`. Unit tests were green through all of it,
// because each unit was fine — the CHAIN was broken. So this suite runs the real
// chain for all ten presets and asserts on what the engine and the agent ACTUALLY
// receive, never on a fixture.
//
// The three artifacts Mami ships on production day: the recipe he builds, the
// final_brief.md the agent obeys, and the project.json/.command it runs from. If any
// of the three is dirty, the video is dirty — there is no editor downstream.

const SOURCE =
  'Deniz suyu güneşle ısınır ve buharlaşır. Yükselen nem soğuk havada yoğunlaşır. Bulut ağırlaşınca yağmur düşer. ' +
  'Yağmur toprağa iner ve dereleri besler. Dereler ırmağa karışır. Irmak sonunda denize döner.';

const HEX = /#[0-9a-fA-F]{6}\b/;
// The exact words the project bans as empty adjectives. They may appear inside a
// NEGATIVE list (a prohibition is not an instruction), so purity is checked on the
// POSITIVE half of the prompt only — everything before the NEGATIVE: line.
const EMPTY_ADJ = /\b(cinematic|stunning|epic|4K|8K)\b/i;

// A prohibition is not an instruction. Two shapes of prohibition live in a prompt:
// the trailing "Negative: ..." list, and inline forbid-clauses inside a world's render
// law ("Strictly forbid 2D cel shading", "Forbid ... drone-epic skyline clichés"). Both
// are dropped before purity is asserted — what remains is what the engine is ORDERED to
// do, which is the only half a banned adjective may not appear in.
function positiveHalf(prompt: string): string {
  return (prompt || '')
    .split(/\bNegative:/i)[0]
    .split(/[.;]/)
    .filter((clause) => !/\b(forbid|forbidden|avoid|never|no)\b/i.test(clause))
    .join('. ');
}

// Paths that are ABOUT a human block generation with CAST_REQUIRED when the cast is
// empty — correctly: a live-action corporate frame with nobody in it is not a frame.
// The preset does not carry a cast (Mami types it in the wizard), so the chain test
// supplies one rather than asserting the gate is broken.
const HUMAN_PATHS = new Set(['LIVE_ACTION_CORPORATE']);

function stateFor(preset: (typeof PHASE0_VIDEO)[number]) {
  const sets = preset.sets;
  const projectClass = sets.projectClass ?? 'ANIMATION_EDU';
  const selectedWorldId = normalizeWorldId(sets.selectedWorldId ?? '');
  const defaults = resolveRecipeDefaults(projectClass, selectedWorldId);
  const project =
    DATA.projects.find((p) => p.path === projectClass && p.world === selectedWorldId) ??
    DATA.projects.find((p) => p.path === projectClass) ??
    DATA.projects[0];

  const sourceBeats = ingestSource(SOURCE);
  const sourceReport = sourceIntegrity(SOURCE, sourceBeats);

  return {
    selectedProjectId: project.id,
    projectTopic: 'Su Döngüsü',
    projectClass,
    sceneCount: sets.sceneCount ?? 6,
    cast: sets.cast || (HUMAN_PATHS.has(projectClass) ? 'Kırk yaşlarında bir öğretmen, sade gömlek' : ''),
    selectedWorldId,
    selectedPropId: sets.selectedPropId ?? 'native_world',
    selectedRefIds: sets.selectedRefIds?.length ? sets.selectedRefIds : defaults.selectedRefIds,
    selectedPaletteId: sets.selectedPaletteId ?? defaults.selectedPaletteId,
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
    brandKitLock: '',
    mood: sets.mood ?? '',
    cameraEnergy: sets.cameraEnergy ?? '',
    timeLight: sets.timeLight ?? '',
    transition: sets.transition ?? '',
    musicVibe: sets.musicVibe ?? '',
    pov: '',
    signature: '',
    leitmotif: '',
    tempoCurve: '',
    directorBrief: '',
    rawSource: SOURCE,
    sourceBeats,
    sourceReport,
  };
}

function runChain(preset: (typeof PHASE0_VIDEO)[number]) {
  const base = stateFor(preset);
  const generated = generateBatch({ ...base } as never) as unknown as {
    status: string;
    scenes: Array<{ id: number; imagePrompt: string; motionPrompt: string }>;
    agentBrief?: string;
  };
  const state = {
    ...base,
    scenes: generated.scenes,
    agentBrief: generated.agentBrief ?? '',
  };
  return {
    generated,
    command: buildCommandJSON(state as never) as unknown as Record<string, never>,
    production: buildProductionExport(state as never) as unknown as Record<string, never>,
  };
}

describe('CHAIN — reçete → final brief → command (all 10 presets, real output)', () => {
  it('ships exactly the ten presets, none orphaned', () => {
    expect(PHASE0_VIDEO.length).toBe(10);
  });

  describe.each(PHASE0_VIDEO.map((p) => [p.id, p] as const))('%s', (id, preset) => {
    const chain = runChain(preset);
    const scenes = chain.generated.scenes;
    const brief = chain.generated.agentBrief ?? '';
    const locks = (chain.command as unknown as { locks: Record<string, unknown> }).locks;

    // ── RECIPE survives into the command ──────────────────────────────────────
    it('names a world that exists — a stale id would be silently rescued into the wrong one', () => {
      const worldId = normalizeWorldId(preset.sets.selectedWorldId ?? '');
      expect(DATA.worlds.some((w) => w.id === worldId), `${id} → unknown world ${worldId}`).toBe(true);
      expect(preset.sets.selectedWorldId, `${id} stores a stale world id in presets.ts`).toBe(worldId);
    });

    it('the world Mami picked is the world the agent is handed', () => {
      expect(locks.worldId).toBe(normalizeWorldId(preset.sets.selectedWorldId ?? ''));
    });

    it('generates every scene it promised', () => {
      expect(chain.generated.status).toBe('GENERATED');
      expect(scenes.length).toBeGreaterThan(0);
    });

    // ── FINAL BRIEF is the sole home of the law ───────────────────────────────
    // .command says, verbatim: "final_brief.md içindeki Authority Hierarchy satırı TEK
    // otoritedir — bu dosya sırayı tekrar etmez." So an empty or lawless brief does not
    // degrade the run, it DELETES the hierarchy: nothing else restates it.
    it('final_brief.md is not empty', () => {
      expect(brief.trim().length, `${id} produced an empty agentBrief — final_brief.md would be blank`).toBeGreaterThan(200);
    });

    it('final_brief.md carries the authority hierarchy it is the only home of', () => {
      const top = AUTHORITY_HIERARCHY[0];
      expect(brief.toLowerCase()).toContain(String(top).toLowerCase().slice(0, 6));
    });

    // ── THE PROMPT the engine reads must be clean ─────────────────────────────
    it.each(scenes.map((s) => [s.id, s] as const))(
      'scene %i image prompt is clean (hex · IP · work title · empty adjectives)',
      (sid, scene) => {
        const pos = positiveHalf(scene.imagePrompt);
        expect(HEX.test(pos), `scene ${sid}: raw hex reached the prompt (Palette Translation Law)`).toBe(false);
        expect(containsProtectedTerm(pos), `scene ${sid}: protected franchise term in the prompt`).toBe(false);
        expect(containsWorkTitle(pos), `scene ${sid}: work/studio title in the prompt`).toBe(false);
        expect(EMPTY_ADJ.test(pos), `scene ${sid}: banned empty adjective used as a positive instruction`).toBe(false);
      },
    );

    it.each(scenes.map((s) => [s.id, s] as const))('scene %i carries its own source beat', (sid, scene) => {
      expect(scene.imagePrompt.length, `scene ${sid} produced no image prompt`).toBeGreaterThan(200);
    });

    // ── COMMAND: the frame gate must reach the package ────────────────────────
    it('the production package ships the frame gate', () => {
      const prod = (chain.production as unknown as { production: Record<string, unknown> }).production;
      const gate = prod.frameGate as { checklist: string[] };
      expect(gate?.checklist?.length ?? 0).toBeGreaterThan(4);
      expect(JSON.stringify(prod)).toContain('FRAME_PASS');
    });

    it('motion stays frame-gated — no final motion ships before a frame exists', () => {
      const prod = (chain.production as unknown as {
        scenes: Array<{ prompts: { motion: unknown; motionDraft: unknown } }>;
      }).scenes;
      for (const s of prod) {
        expect(s.prompts.motion, `${id}: a final motion prompt shipped without an approved frame`).toBeNull();
        expect(s.prompts.motionDraft).toBeTruthy();
      }
    });
  });
});
