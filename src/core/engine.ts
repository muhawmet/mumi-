const T = (v: unknown): string => String(v == null ? '' : v);

// Clean single-shot window (seconds) per engine — the SAFE ceiling, not the
// marketing max. Web-verified 2026-07-04: Kling 3.0 native 3-15s (multi-shot,
// 4K HDR); Seedance 2.0 native 4-15s dynamic (2.5 @30s in beta); Veo 3/3.1
// hard max 8s (extend-only beyond); Runway Gen-4.x long-take class; Higgsfield
// is a HUB (hosts Kling/Seedance/Veo/Sora — paid clips up to 16s), its own
// window covers native preset moves. FAZ 5 pilot empirically re-validates.
// SURFACE ≠ ENGINE. Magnific Spaces and Higgsfield are node canvases that HOST these engines —
// the same Kling, the same Seedance, the same Nano Banana run inside both. `higgsfield` below is
// kept only because older packages named it as a model; it resolves to a generic short window.
// Never treat a surface as an engine, and never invent an "upscale pass" between them: Nano
// Banana delivers 1K, Kling delivers 1080p from whatever frame it is given.
// Sora 2 is winding down (API retires 2026-09-24) — do not build on it.
export const ENGINE_USABLE: Record<string, number> = {
  kling: 9, kling_2_1: 9,
  kling_3: 12, kling_3_turbo: 12, kling_o3: 15,
  seedance: 9, seedance_2: 12, hailuo: 9, hailuo_2: 10,
  veo: 8, veo_3: 8, veo_3_1: 8,
  runway: 14, runway_gen4: 14, runway_gen4_5: 14,
  pika: 9, pika_2_2: 10,
  higgsfield: 9, higgsfield_dop: 9,
};

export function engineUsableSec(videoModel: string): number {
  const key = T(videoModel).trim().toLowerCase();
  return ENGINE_USABLE[key] ?? ENGINE_USABLE[key.split('_')[0]] ?? 9;
}

// ---------------- engine dialects ----------------
// Each i2v engine has a personality: what it rewards, what breaks it. The
// dialect injects ONE grammar sentence into the motion prompt and appends
// engine-specific negatives after the universal core. Unknown/empty model
// resolves to the Kling dialect (the historical house default).

export interface EngineDialect {
  label: string;
  grammar: string;
  extraNegatives: string;
  /** Engine-specific pacing law — joins the motion prompt's Rhythm sentence. */
  rhythm: string;
}

const ENGINE_DIALECTS: Record<string, EngineDialect> = {
  // NOTE (2026-07): the engine is ALWAYS "Kling 3.0". "O3" is its high-tier
  // reasoning MODE (reasoning_tier: "O3" in the payload), never a separate engine.
  kling: {
    label: 'Kling 3.0',
    grammar: 'Kling 3.0 start-frame fidelity: the approved frame is truth — describe only what changes, never re-describe what already exists; the motion reads as the frame\'s next half-second.',
    extraNegatives: 're-render of the start frame',
    rhythm: 'attack lands inside the first second, the event resolves by ~70% of the clip, the rest is held',
  },
  kling_o3: {
    label: 'Kling 3.0 · O3 tier',
    grammar: 'Kling 3.0 in O3 reasoning tier: the approved frame is truth — describe only what changes; one cause→effect→settle arc may breathe across the full window, the O3 tier holds the causal chain.',
    extraNegatives: 're-render of the start frame',
    rhythm: 'the causal arc may breathe across the full window — slow attack allowed, settled no later than the final 1.5s',
  },
  seedance: {
    label: 'Seedance',
    grammar: 'Seedance subject-tracking: anchor the take to ONE tracked subject; physics carries all secondary motion (cloth, dust, water ripple) — never script secondary motion separately.',
    extraNegatives: 'subject swap mid-track, teleporting subject',
    rhythm: 'continuous tracked motion — no rhythm breaks, physics timing rules the arc from first frame to settle',
  },
  veo: {
    label: 'Veo',
    grammar: 'Veo cinematic grammar: motivate camera and light like live action — the move must have a physical reason; ambient audio is native, name the soundscape in one short clause only if the scene needs it.',
    extraNegatives: 'unmotivated camera move',
    rhythm: 'live-action pacing — the move earns its motivation, completes fully, then the frame breathes',
  },
  runway: {
    label: 'Runway',
    grammar: 'Runway long-take coherence: one continuous take, no internal cuts; let the movement complete fully before the final hold begins.',
    extraNegatives: 'internal cuts, shot change',
    rhythm: 'one long uncut arc — begin gently, travel the full take, land the hold late',
  },
  hailuo: {
    label: 'Hailuo',
    grammar: 'Hailuo dynamic clarity: keep one bold primary motion; do not stack micro-actions around it.',
    extraNegatives: 'stacked micro-actions',
    rhythm: 'one bold beat — fast readable attack, clean early settle',
  },
  pika: {
    label: 'Pika',
    grammar: 'Pika crisp beat: one punchy action with an early, clean settle.',
    extraNegatives: 'lingering slow-burn pacing',
    rhythm: 'punchy single beat — impact early, settle immediately after',
  },
  higgsfield: {
    label: 'Higgsfield',
    grammar: 'Higgsfield camera presets: name the camera move plainly (dolly-in, orbit, crane-up) — presets execute one clean move; the approved frame stays truth.',
    extraNegatives: 'compound camera paths',
    rhythm: 'the named preset move runs once at constant confidence — no speed ramps',
  },
};

export function engineDialect(videoModel?: string): EngineDialect {
  const key = T(videoModel ?? '').trim().toLowerCase();
  return ENGINE_DIALECTS[key] ?? ENGINE_DIALECTS[key.split('_')[0]] ?? ENGINE_DIALECTS.kling;
}
