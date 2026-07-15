import { describe, expect, it } from 'vitest';
import { scrubAnchorIP } from './brain';
import { scrubWorkTitles } from './proof';
import { DATA } from './pure';

// ─────────────────────────────────────────────────────────────────────────────
// THE DATA ITSELF MUST BE CLEAN — the firewall's last, widest hole.
//
// scrubAnchorIP cleans a ref's `anchor` at runtime. It never touched the WORLD's own
// laws — and renderLock() concatenates render_law + line_grammar + lens_grammar +
// light_law RAW as the FIRST SENTENCE of every image prompt. That path is how "Soul"
// and "Great-Before" reached the engine: the Great Before is a LOCATION IN THAT FILM,
// and pixar_3d_edu's own negative_lock says "NO any named Pixar/Disney location". The
// positive half was ordering precisely what the negative half banned.
//
// A runtime regex is the WRONG instrument here. These fields are authored craft prose;
// cutting a proper noun out of them mid-sentence yields "in the -successor premium-CG
// pipeline" and "as developed by Production for the Arcane series" — mangled English
// sent to the engine, which is worse than the leak. So the DATA is written clean, and
// this test is the lock that keeps it clean: name a studio or a work in a field that
// reaches the engine, and the suite goes red.
//
// NEGATIVE fields are exempt on purpose. "no Pixar-clean", "NO Disney-style" are
// prohibitions — naming what to avoid is how a negative works.

// WORK titles and the places/things inside them. STUDIO names are deliberately absent:
// these worlds exist to teach a studio's rendering pipeline, and each one already blocks
// that studio's CAST from the other side ("NO any named Pixar or Disney animated
// character · NO Pixar City"). Render in the language, never draw their cast — that rule
// is coherent, and stripping the studio would make the world generic, which the same rule
// forbids. Director surnames are absent for the same reason: a lineage is not a work.
//
// Naming the WORK is different in kind. It hands the engine that film's characters, its
// locations and its shots — the exact things the world's own negative_lock forbids. The
// positive half must never order what the negative half bans.
const IP_NAMES = [
  'Soul', 'Great-Before', 'Fury-Road', 'Bebop', 'Arcane', 'Spider-Verse',
  'Into the Spider-Verse', 'Across the Spider-Verse',
];

const IP_RE = new RegExp(`\\b(?:${IP_NAMES.map((n) => n.replace(/[-\s]/g, '[-\\s]')).join('|')})\\b`, 'u');

// Every world field that ends up in a prompt the engine reads.
const WORLD_POSITIVE = [
  'render_law',
  'line_grammar',
  'lens_grammar',
  'light_law',
  'motion_cadence',
  'example_injection',
] as const;

// Ref fields that reach the engine (anchor) or the agent that authors the final prompt from
// it (name + dna → scenes[].refDna). `use` is not listed here only because brain.ts excludes
// it from the DNA pool — it is NOT exempt from the firewall: it ships inside referenceDNA,
// which the export's own cliExample pipes into Claude. That path is locked below, on the
// whole exported document, so no sibling field can quietly reopen the hole again.
const REF_POSITIVE = ['anchor', 'dna'] as const;

describe('IP firewall — the data that reaches the engine', () => {
  it.each(WORLD_POSITIVE)('no world names a studio or a work in %s', (field) => {
    const offenders = DATA.worlds
      .map((w) => {
        const text = String((w as unknown as Record<string, unknown>)[field] ?? '');
        const hit = text.match(IP_RE);
        return hit ? `${w.id} → "${hit[0]}"` : null;
      })
      .filter(Boolean);
    expect(
      offenders,
      `${field} is concatenated into the image prompt verbatim — these worlds order the engine to reproduce a studio's work:\n  ${offenders.join('\n  ')}`,
    ).toEqual([]);
  });

  // Refs, unlike worlds, ARE scrubbed at runtime — the anchor by scrubAnchorIP on its way
  // into the prompt, and name+anchor+dna by scrubWorkTitles on their way into scenes[].refDna.
  // So the ref data may keep its provenance ("Miller Fury-Road chaos") and still ship clean.
  // What is asserted here is what actually LEAVES: the scrubbed text, not the stored text.
  it('no ref anchor carries a work title into the prompt the engine reads', () => {
    const offenders = DATA.refs
      .map((r) => {
        const hit = scrubAnchorIP(String(r.anchor ?? '')).match(IP_RE);
        return hit ? `${r.id} → "${hit[0]}"` : null;
      })
      .filter(Boolean);
    expect(offenders, `scrubAnchorIP let a work title through:\n  ${offenders.join('\n  ')}`).toEqual([]);
  });

  it('no ref carries a work title into refDna, which the agent authors the final prompt from', () => {
    const offenders = DATA.refs
      .map((r) => {
        const shipped = scrubWorkTitles(`${r.name}: ${r.anchor ?? ''} · ${r.dna ?? ''}`);
        const hit = shipped.match(IP_RE);
        return hit ? `${r.id} → "${hit[0]}"` : null;
      })
      .filter(Boolean);
    expect(offenders, `refDna ships a work title to the authoring agent:\n  ${offenders.join('\n  ')}`).toEqual([]);
  });

  it('scrubbing a ref never guts the craft it exists to teach', () => {
    for (const id of ['soul', 'mad_max_chaos_cam', 'cowboy_bebop_noir_jazz']) {
      const ref = DATA.refs.find((r) => r.id === id);
      const cleaned = scrubAnchorIP(String(ref?.anchor ?? ''));
      expect(cleaned.length, `${id}: the scrub emptied the anchor instead of trimming it`).toBeGreaterThan(90);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CLEAN PLATE vs THE LETTERFORM RECIPE — the prompt argued with itself, 42/42.
//
// Every world's negative_lock carries one line shaped like
//   "Turkish label only — blocky dimensional letterform, raised and legible, NO English signage"
// and the whole line was pasted into the prompt's Negative band. Its FIRST half is not a
// ban at all, it is a RECIPE: how to draw Turkish lettering. So a scene with NO on-screen
// text shipped "Text/logo: clean plate ... no added signage" and, two hundred words later,
// instructions for the lettering to use — and the engine invented Turkish labels on
// packaging, boards and signs. The frame gate would then reject its own frame.
//
// When the scene carries text the recipe is correct and stays (visibleTextLine also
// promotes it into the positive half, where an engine can actually obey it). When it does
// not, only the ban survives.
describe('clean plate must not ship a lettering recipe', () => {
  const LETTERFORM = /Turkish label only\s*[—-]/i;

  it('a scene with no on-screen text carries no letterform recipe', async () => {
    const { generateBatch, resolveRecipeDefaults, DATA: D } = await import('./pure');
    const { ingestSource, sourceIntegrity } = await import('./source');
    const src = 'Kap kaynar. Buhar yükselir. Damla düşer.';
    const beats = ingestSource(src);
    const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'clay');
    const project = D.projects.find((p) => p.world === 'clay') ?? D.projects[0];
    const out = generateBatch({
      selectedProjectId: project.id, projectTopic: 'Buhar', projectClass: 'ANIMATION_EDU',
      sceneCount: 3, cast: '', selectedWorldId: 'clay', selectedPropId: 'native_world',
      selectedRefIds: defaults.selectedRefIds, selectedPaletteId: defaults.selectedPaletteId,
      selectedMusicId: '', imageModel: 'nano_banana_2', videoModel: 'kling_3', brandKitLock: '',
      mood: '', cameraEnergy: '', timeLight: '', transition: '', musicVibe: '', pov: '',
      signature: '', leitmotif: '', tempoCurve: '', directorBrief: '',
      rawSource: src, sourceBeats: beats, sourceReport: sourceIntegrity(src, beats),
    } as never) as unknown as { scenes: Array<{ imagePrompt: string; onScreenText?: string | null }> };

    for (const scene of out.scenes) {
      if (scene.onScreenText) continue; // a scene that DOES carry text may keep its letterform
      expect(scene.imagePrompt).toContain('clean plate');
      expect(
        LETTERFORM.test(scene.imagePrompt),
        'clean plate declared, yet the prompt still hands the engine a Turkish lettering recipe',
      ).toBe(false);
    }
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// THE WHOLE EXPORT, NOT ONE FIELD AT A TIME.
//
// Twice now a work title was scrubbed out of one field and kept shipping through its
// neighbour: first the anchor was cleaned while refDna carried "Soul" six times, then
// refDna was cleaned while referenceDNA.refs[].use/avoid/dna carried it thirty-four times.
// Field-by-field locks keep losing to the next sibling. This one greps the ENTIRE exported
// document — every string the package hands to a human or an agent — so the next sibling
// has nowhere to hide.
describe('work titles never leave the building', () => {
  it('the whole exported .command carries no work title, in any field', async () => {
    const { buildCommandJSON } = await import('./commandExport');
    const { generateBatch, resolveRecipeDefaults, DATA: D } = await import('./pure');
    const { ingestSource, sourceIntegrity } = await import('./source');

    // the six refs whose craft was learned from a named work
    const CASES: Array<[string, string]> = [
      ['pixar_3d_edu', 'soul'],
      ['deakins_naturalist', 'mad_max_chaos_cam'],
      ['retro_anime_film', 'cowboy_bebop_noir_jazz'],
      ['spiderverse_sony', 'spiderverse_graphic'],
      ['arcane_fortiche', 'arcane_texture'],
      ['spiderverse_sony', 'verse_miles_dna'],
    ];
    const src = 'Bir cocuk merakla bakar. Isik odayi doldurur. Kapi acilir.';
    const beats = ingestSource(src);
    const report = sourceIntegrity(src, beats);

    for (const [worldId, refId] of CASES) {
      const defaults = resolveRecipeDefaults('ANIMATION_EDU', worldId);
      const project = D.projects.find((p) => p.world === worldId) ?? D.projects[0];
      const base = {
        selectedProjectId: project.id, projectTopic: 'Merak', projectClass: project.path,
        sceneCount: 3, cast: '', selectedWorldId: worldId, selectedPropId: 'native_world',
        selectedRefIds: [refId], selectedPaletteId: defaults.selectedPaletteId, selectedMusicId: '',
        imageModel: 'nano_banana_2', videoModel: 'kling_3', brandKitLock: '', mood: '',
        cameraEnergy: '', timeLight: '', transition: '', musicVibe: '', pov: '', signature: '',
        leitmotif: '', tempoCurve: '', directorBrief: '',
        rawSource: src, sourceBeats: beats, sourceReport: report,
      };
      const gen = generateBatch({ ...base } as never) as unknown as {
        scenes: unknown[]; agentBrief?: string;
      };
      const doc = buildCommandJSON({
        ...base, scenes: gen.scenes, agentBrief: gen.agentBrief ?? '',
      } as never);

      // Two places may legitimately name a work, and both are excluded:
      //   · negative_lock / avoid — "NO any named Spider-Verse character" is a PROHIBITION.
      //     Naming what to refuse is how a negative works; scrubbing it would delete the ban.
      //   · a world's or palette's display NAME — "Spider-Verse — Sony Pictures Animation" is
      //     the label Mami picks in the recipe. It never enters the image prompt (renderLock
      //     ships render_law, not the label), and the agent needs it to say which world a
      //     frame must read as.
      // Everything else is a positive instruction, and a positive instruction may not name a
      // work. This walks the whole document so the next sibling field has nowhere to hide.
      const EXEMPT_KEYS = new Set(['negative_lock', 'avoid', 'name', 'worldName', 'paletteName', 'projectName']);
      const offenders: string[] = [];
      // final_brief.md must TELL the agent which world it is locked to, so it prints the
      // world/project label verbatim. The label is exempt; the rest of the brief is not.
      const labels = [
        (doc as { locks: { worldName?: string; projectName?: string; paletteName?: string } }).locks.worldName,
        (doc as { locks: { projectName?: string } }).locks.projectName,
        (doc as { locks: { paletteName?: string } }).locks.paletteName,
      ].filter(Boolean) as string[];
      const stripLabels = (text: string) =>
        labels.reduce((acc, label) => acc.split(label).join('«world label»'), text);
      // A prohibition may name what it refuses — "NO any named Spider-Verse character" is the
      // ban doing its job. Only POSITIVE instructions are scanned.
      const positiveOnly = (text: string) =>
        text
          .split(/[.;\n]/)
          .filter((clause) => !/\b(NO|no|never|avoid|forbid|forbidden)\b/.test(clause))
          .join('. ');

      const walk = (value: unknown, path: string, key: string) => {
        if (EXEMPT_KEYS.has(key)) return;
        if (typeof value === 'string') {
          const hit = positiveOnly(stripLabels(value)).match(IP_RE);
          if (hit) offenders.push(`${path} → "${hit[0]}"`);
          return;
        }
        if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`, key));
        if (value && typeof value === 'object') {
          for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`, k);
        }
      };
      walk(doc, 'doc', 'doc');

      expect(
        offenders,
        `${worldId} + ${refId}: the exported .command still ships a work title as a positive instruction:\n  ${offenders.join('\n  ')}`,
      ).toEqual([]);
    }
  });
});
