// Quick CLI: generate a sample brief and dump scene 1 + scene 5 for inspection.
// Run: npx tsx scripts/inspect-brief.ts  (or compile via vitest, but tsx is faster)

import { generateBatch } from '../src/core/pure';

const inputs = [
  {
    label: 'A — Eğitim · pixar_3d_edu · AUTO clean plate · no reference',
    input: {
      projectTopic: 'Su Döngüsü',
      projectClass: 'ANIMATION_EDU',
      sceneCount: 5,
      cast: 'İkisi' as const,
      selectedWorldId: 'pixar_3d_edu',
      selectedPropId: 'native_world',
      selectedRefIds: [],
      selectedPaletteId: '',
      selectedMusicId: '',
      imageModel: 'midjourney_v7',
      videoModel: 'kling_2_1',
    },
  },
  {
    label: 'B — Premium Ad · deakins_naturalist · warm_autumn · incompatible ref suppression',
    input: {
      projectTopic: 'SOURCE:\nÜrün ışıkta dönüyor\nReklam metni şekilleniyor\nLogo netleşip kilitleniyor',
      projectClass: 'ULTRAREAL_COMMERCIAL',
      sceneCount: 4,
      cast: 'Aras' as const,
      selectedWorldId: 'deakins_naturalist',
      selectedPropId: 'native_world',
      selectedRefIds: ['pixar_dimensional'],
      selectedPaletteId: 'warm_autumn',
      selectedMusicId: '',
      imageModel: 'midjourney_v7',
      videoModel: 'kling_2_1',
    },
  },
];

for (const { label, input } of inputs) {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(label);
  console.log('═══════════════════════════════════════════════════════════════\n');
  const r = generateBatch(input);
  if (r.status === 'BLOCKED') {
    console.log('🚫 BLOCKED:', r.contractGate.findings);
    continue;
  }
  console.log(`✅ ${r.scenes.length} scenes · contract: ${r.contractGate.status}`);
  for (const idx of [0, r.scenes.length - 1]) {
    const s = r.scenes[idx];
    console.log(`\n─── Sahne ${s.id} (${s.phaseName}, ${s.durationSec}s, intensity ${Math.round(s.intensity)}) ───`);
    console.log('SOURCE:', s.architecture.source);
    console.log('BEAT:', s.architecture.beat);
    console.log('DOMINANT:', s.architecture.dominantSubject);
    console.log('EVENT:', s.architecture.event);
    console.log('VANTAGE:', s.architecture.imageVantage);
    console.log('FINGERPRINT:', s.architecture.semanticFingerprint);
    console.log('\nIMAGE PROMPT:');
    console.log('  ' + s.imagePrompt);
    console.log('\nVO:', s.voiceOver);
    console.log('SUNO:', s.sunoBrief);
    console.log('\nFINAL BRIEF · referenceDNA:', JSON.stringify(s.finalBrief.referenceDNA, null, 2));
    console.log('FINAL BRIEF · paletteAccent:', s.finalBrief.paletteAccent);
    console.log('HANDOFF · IMAGE warnings:', s.handoff.IMAGE.warnings);
  }
}
