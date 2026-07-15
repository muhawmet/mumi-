/**
 * Bir dünyanın GERÇEK image promptunu bas — fixture değil, generateBatch'in kendi metni.
 * Kullanım:  npx tsx scripts/prompt-bak.ts <world_id>
 * Örnek:     npx tsx scripts/prompt-bak.ts ukiyo_e_print
 * Dünya listesi: node -e "console.log(require('./src/core/SURGERY_DATA.json').worlds.map(w=>w.id).join('\n'))"
 *
 * mamilas-audit kuralı: "vitest geçti" ≠ doğrulandı. Prompt'u GÖZLE oku.
 */
import { generateBatch } from '../src/core/pure';
const world = process.argv[2] || 'castlevania_gothic';
const r:any = generateBatch({ projectTopic:'Yanardağ nasıl patlar?', projectClass:'ders',
  sceneCount:3, cast:'', selectedWorldId:world, selectedPropId:'none',
  selectedRefIds:[], selectedPaletteId:'native_world', selectedMusicId:'',
  imageModel:'nano_banana_2', videoModel:'kling_3' });
if (r.status !== 'GENERATED') { console.log('BLOCKED:', JSON.stringify(r.contractGate)); process.exit(0); }
console.log(r.scenes[0].imagePrompt);
