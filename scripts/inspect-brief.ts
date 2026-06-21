// Quick CLI: generate a sample brief and dump scene 1 + scene 5 for inspection.
// Run: npx tsx scripts/inspect-brief.ts  (or compile via vitest, but tsx is faster)

import { generateBatch } from '../src/core/pure';

const inputs = [
  {
    label: 'A — Eğitim · Aras&Defne · Clay world · no reference',
    input: {
      projectTopic: 'Su Döngüsü',
      projectClass: 'EĞİTİM_01',
      sceneCount: 5,
      cast: 'İkisi' as const,
      selectedWorldId: 'clay',
      selectedPropId: 'native_world',
      selectedRefId: '',
      selectedPaletteId: '',
      selectedMusicId: '',
      imageModel: 'midjourney_v7',
      videoModel: 'kling_2_1',
    },
  },
  {
    label: 'B — Premium Ad · Cinematic Real · Pixar reference · with palette override',
    input: {
      projectTopic: 'SOURCE:\nÜrün ışıkta dönüyor\nReklam metni şekilleniyor\nLogo netleşip kilitleniyor',
      projectClass: 'ULTRAREAL_COMMERCIAL',
      sceneCount: 4,
      cast: 'Aras' as const,
      selectedWorldId: 'cinematic_real',
      selectedPropId: 'native_world',
      selectedRefId: 'pixar_dimensional',
      selectedPaletteId: 'rembrandt_amber',
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
