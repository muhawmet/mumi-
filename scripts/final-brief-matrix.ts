/**
 * final-brief-matrix.ts — açılış protokolü matrisi (2026-07-04)
 *
 * 3 senaryo, GERÇEK generateBatch, FINAL BRIEF (agentBrief + image/motion) tam dump:
 *   A) INTERSTELLAR-VARİ — ULTRAREAL yolu, deakins/sci-fi + Kubrick/Villeneuve/Tarkovsky
 *   B) ONE PIECE — one_piece_toei STY macera katı testi
 *   C) PALET SWEEP — aynı reçete × 4 palet, ışık dili ayrışması
 *
 * Deterministik. src/'a dokunmaz. Çıktı: output/final-brief-matrix/
 * Run: npx tsx scripts/final-brief-matrix.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateBatch, type BriefInput } from '../src/core/pure.js';
import { evaluateDirectorCabinet, type QATip } from '../src/core/qa.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'output', 'final-brief-matrix');
fs.mkdirSync(OUT, { recursive: true });

function base(overrides: Partial<BriefInput>): BriefInput {
  return {
    projectTopic: 'Su Döngüsü',
    projectClass: 'ANIMATION_EDU',
    sceneCount: 4,
    cast: '',
    selectedWorldId: 'pixar_3d_edu',
    selectedPropId: 'native_world',
    selectedRefIds: [],
    selectedPaletteId: '',
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
    ...overrides,
  };
}

function cabinet(brief: BriefInput, scenes: unknown[]): QATip[] {
  const state = {
    selectedProjectId: 'matrix',
    projectTopic: brief.projectTopic,
    projectClass: brief.projectClass,
    sceneCount: scenes.length,
    cast: '',
    location: '',
    subject: 'matrix',
    recipeScenes: [],
    selectedWorldId: brief.selectedWorldId,
    selectedPropId: brief.selectedPropId,
    selectedRefIds: brief.selectedRefIds ?? [],
    activePreviewRefId: '',
    selectedPaletteId: brief.selectedPaletteId ?? '',
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: brief.videoModel,
    brandKitLock: '', mood: '', cameraEnergy: '', timeLight: '', transition: '',
    musicVibe: '', pov: '', signature: '', leitmotif: '', tempoCurve: '',
    phase0PresetId: '', directorChoices: {}, directorBrief: '',
    voSyncMode: 'FREE' as const, osTextMode: 'AUTO' as const,
    rawSource: '', sourceBeats: [], sourceReport: null,
    scenes: scenes as any[],
    agentBrief: '', agentPackets: null, selectedSceneId: null,
    isGenerating: false, lastError: null,
    beatMode: 'Dengeli' as const, workingMode: 'Standart' as const,
    beatKeeps: {}, beatAnalysis: null, beatHistory: [],
    personalMode: false, currentStep: 'qa' as const,
    setField: () => {}, togglePersonalMode: () => {},
  } as any;
  return evaluateDirectorCabinet(state);
}

interface Scenario { slug: string; title: string; brief: BriefInput; }

const SCENARIOS: Scenario[] = [
  {
    slug: 'A1-interstellar-deakins-kling',
    title: 'INTERSTELLAR-VARİ — deakins_naturalist × kling_3 × Kubrick/Villeneuve/Tarkovsky',
    brief: base({
      projectTopic: 'Zamanın büküldüğü bir istasyonda babanın kızına veda mesajı',
      projectClass: 'ULTRAREAL_COMMERCIAL',
      selectedWorldId: 'deakins_naturalist',
      selectedRefIds: ['kubrick_one_point', 'villeneuve_scale_dread', 'tarkovsky_slow_nature'],
      videoModel: 'kling_3',
      sceneCount: 4,
    }),
  },
  {
    slug: 'A2-interstellar-scifi-seedance',
    title: 'INTERSTELLAR-VARİ — sci_fi_hard_surface × seedance_2 × aynı refler',
    brief: base({
      projectTopic: 'Zamanın büküldüğü bir istasyonda babanın kızına veda mesajı',
      projectClass: 'ULTRAREAL_COMMERCIAL',
      selectedWorldId: 'sci_fi_hard_surface',
      selectedRefIds: ['kubrick_one_point', 'villeneuve_scale_dread', 'tarkovsky_slow_nature'],
      videoModel: 'seedance_2',
      sceneCount: 4,
    }),
  },
  {
    slug: 'B-one-piece-macera',
    title: 'ONE PIECE — one_piece_toei STY macera katı testi',
    brief: base({
      projectTopic: 'Fırtınalı denizde efsanevi haritanın peşindeki son yolculuk',
      projectClass: 'STYLIZED_PREMIUM',
      selectedWorldId: 'one_piece_toei',
      selectedRefIds: [],
      videoModel: 'kling_3',
      sceneCount: 4,
    }),
  },
  ...['soviet_muted', 'golden_dust_epic', 'neon_rain_romance', 'native_world'].map((pal) => ({
    slug: `C-palette-${pal}`,
    title: `PALET SWEEP — deakins_naturalist × ${pal} (aynı reçete)`,
    brief: base({
      projectTopic: 'Zamanın büküldüğü bir istasyonda babanın kızına veda mesajı',
      projectClass: 'ULTRAREAL_COMMERCIAL',
      selectedWorldId: 'deakins_naturalist',
      selectedRefIds: [],
      selectedPaletteId: pal,
      videoModel: 'kling_3',
      sceneCount: 3,
    }),
  })),
];

const HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g;
const summary: string[] = ['# FINAL BRIEF MATRIX — INDEX', ''];

for (const sc of SCENARIOS) {
  const result = generateBatch(sc.brief);
  const lines: string[] = [`# ${sc.title}`, ''];
  lines.push('## Reçete');
  lines.push('```json');
  lines.push(JSON.stringify(sc.brief, null, 2));
  lines.push('```', '');

  if (result.status !== 'GENERATED') {
    const findings = result.contractGate.findings.map((f) => `${f.code}: ${f.message}`).join('; ');
    lines.push(`!! BLOCKED — ${findings}`);
    summary.push(`- **${sc.slug}**: BLOCKED — ${findings}`);
  } else {
    lines.push('## AGENT BRIEF (tam metin)');
    lines.push('```');
    lines.push(result.agentBrief ?? '(yok)');
    lines.push('```', '');

    lines.push('## SCENES');
    for (const scene of result.scenes) {
      lines.push(`### Scene ${scene.id} — ${scene.phaseName}`);
      lines.push('**imagePrompt:**', '```', scene.imagePrompt, '```');
      lines.push('**motionPrompt:**', '```', scene.motionPrompt, '```', '');
    }

    const tips = cabinet(sc.brief, result.scenes);
    lines.push('## Cabinet');
    for (const tip of tips) {
      lines.push(`- **${tip.skill}** [${tip.success ? 'PASS' : 'FAIL'} · ${tip.level}] ${tip.text}`);
      for (const ev of tip.evidence) lines.push(`  - ${ev}`);
    }

    const surgeon = tips.find((t) => t.skill === 'prompt_surgeon');
    const allText = result.scenes.map((s) => s.imagePrompt + '\n' + s.motionPrompt).join('\n');
    const hexLeaks = allText.match(HEX_RE) ?? [];
    summary.push(
      `- **${sc.slug}**: surgeon=${surgeon?.success ? 'PASS' : 'FAIL'} · hexLeak=${hexLeaks.length ? hexLeaks.join(',') : '0'} · scenes=${result.scenes.length}`,
    );
  }

  fs.writeFileSync(path.join(OUT, `${sc.slug}.md`), lines.join('\n'), 'utf-8');
  console.log(`✓ ${sc.slug}`);
}

fs.writeFileSync(path.join(OUT, 'INDEX.md'), summary.join('\n'), 'utf-8');
console.log('DONE →', OUT);
