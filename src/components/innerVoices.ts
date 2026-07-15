import { productionPulse } from '../core/productionPulse';
import { DATA, paletteColors } from '../core/pure';
import { refFit } from '../core/advisor';
import type { StudioState } from '../store/useStudioStore';

export type InnerVoiceName =
  | 'Logic' | 'Encyclopedia' | 'Rhetoric' | 'Drama' | 'Conceptualization' | 'Visual Calculus'
  | 'Volition' | 'Inland Empire' | 'Empathy' | 'Authority' | 'Esprit de Corps' | 'Suggestion'
  | 'Endurance' | 'Pain Threshold' | 'Physical Instrument' | 'Electrochemistry' | 'Shivers' | 'Half Light'
  | 'Hand/Eye Coordination' | 'Perception' | 'Reaction Speed' | 'Savoir Faire' | 'Interfacing' | 'Composure'
  | 'Case Ledger' | 'Director';

export type InnerVoiceTone = 'pass' | 'warn' | 'fail' | 'info' | 'spark';

export interface InnerVoiceVerdict {
  voice: InnerVoiceName;
  tone: InnerVoiceTone;
  title: string;
  text: string;
  evidence: string;
}

type VoiceContext = 'rail' | 'dashboard' | 'director' | 'recipe' | 'preview' | 'scenes' | 'timeline' | 'qa';
type VoiceState = Pick<StudioState,
  'projectTopic' | 'subject' | 'rawSource' | 'sourceReport' | 'selectedWorldId' | 'selectedPaletteId' |
  'selectedRefIds' | 'activePreviewRefId' | 'selectedPropId' | 'projectClass' | 'sceneCount' |
  'recipeScenes' | 'scenes' | 'agentBrief' | 'agentPackets'
>;

function toneRank(tone: InnerVoiceTone): number {
  return ({ fail: 0, warn: 1, spark: 2, info: 3, pass: 4 })[tone];
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}

function paletteContrast(colors: string[]): 'thin' | 'good' {
  const unique = new Set(colors.map((color) => color.toLowerCase()));
  return unique.size >= 3 ? 'good' : 'thin';
}

function refNames(ids: string[]): string {
  const names = ids.map((id) => DATA.refs.find((ref) => ref.id === id)?.name || id);
  return names.join(' + ');
}

export function evaluateInnerVoices(state: VoiceState, context: VoiceContext = 'rail'): InnerVoiceVerdict[] {
  const world = DATA.worlds.find((item) => item.id === state.selectedWorldId);
  const palette = DATA.palettes.find((item) => item.id === state.selectedPaletteId);
  const activeRef = DATA.refs.find((item) => item.id === (state.activePreviewRefId || state.selectedRefIds[0] || ''));
  const selectedRefs = state.selectedRefIds.map((id) => DATA.refs.find((ref) => ref.id === id)).filter(Boolean);
  const colors = paletteColors(palette, world);
  const pulse = productionPulse(state);
  const topic = state.subject || state.projectTopic;
  const verdicts: InnerVoiceVerdict[] = [];

  if (!topic.trim()) {
    verdicts.push({
      voice: 'Logic',
      tone: 'fail',
      title: 'Konu yok.',
      text: 'Dosya boş. Cümle yoksa akıl da yok.',
      evidence: 'subject/projectTopic boş',
    });
  } else {
    verdicts.push({
      voice: 'Logic',
      tone: 'pass',
      title: 'Brief tutunuyor.',
      text: wordCount(topic) > 3 ? 'Bir omurga var. Şimdi onu dünyanın kanununa çarp.' : 'Kısa. Kırılgan. Yine de dosyaya girebilir.',
      evidence: `${wordCount(topic)} kelime konu`,
    });
  }

  if (state.rawSource.trim() && !state.sourceReport?.ok) {
    verdicts.push({
      voice: 'Case Ledger',
      tone: 'warn',
      title: 'Kaynak kilidi açık.',
      text: 'Kanıt numarası eksik. Güzel görünen şey mahkemede düşer.',
      evidence: `coverage %${state.sourceReport?.coverage ?? 0}`,
    });
  }

  if (!world) {
    verdicts.push({
      voice: 'Director',
      tone: 'fail',
      title: 'World yok.',
      text: 'Işık nereden geliyor? Hiçbir yerden. Önce dünyayı kilitle.',
      evidence: 'selectedWorldId boş',
    });
  } else {
    verdicts.push({
      voice: 'Shivers',
      tone: 'spark',
      title: world.name,
      text: `${world.group} sokaktan içeri sızıyor. Hava var. Şimdi onu delille sabitle.`,
      evidence: world.id,
    });
  }

  if (!palette) {
    verdicts.push({
      voice: 'Visual Calculus',
      tone: 'warn',
      title: 'Palet eksik.',
      text: 'Göz şekli seçiyor, renk hâlâ imza atmıyor.',
      evidence: 'selectedPaletteId boş',
    });
  } else {
    const contrast = paletteContrast(colors);
    verdicts.push({
      voice: 'Visual Calculus',
      tone: contrast === 'good' ? 'pass' : 'warn',
      title: contrast === 'good' ? 'Palet okunuyor.' : 'Palet zayıf ayrışıyor.',
      text: contrast === 'good'
        ? 'Kenar, gölge, vurgu: üçü de ayrı yerde duruyor.'
        : 'Renkler birbirine yaslanıyor. Silüet nefes istiyor.',
      evidence: `${palette.name} · ${colors.slice(0, 4).join(' ')}`,
    });
  }

  if (!state.selectedRefIds.length) {
    verdicts.push({
      voice: 'Perception',
      tone: 'warn',
      title: 'Reference DNA boş.',
      text: 'Lens izi yok. Kadrajın parmak izi henüz dosyada değil.',
      evidence: '0 ref seçili',
    });
  } else if (world && activeRef) {
    const fit = refFit(world, activeRef);
    verdicts.push({
      voice: fit >= 70 ? 'Perception' : 'Rhetoric',
      tone: fit >= 70 ? 'pass' : 'warn',
      title: fit >= 70 ? 'DNA uyumlu.' : 'DNA itiraz ediyor.',
      text: fit >= 70
        ? 'İz, yüzeye oturuyor. Referans kanıt gibi duruyor.'
        : 'Kenarlar uyuşmuyor. Ya bu çatışmayı sahiplen ya da dosyadan çıkar.',
      evidence: `${activeRef.name} · fit %${fit}`,
    });
  }

  if (state.selectedRefIds.length >= 3) {
    verdicts.push({
      voice: 'Electrochemistry',
      tone: 'spark',
      title: 'Üç DNA kilitli.',
      text: 'Üç iz. Güzel bir baş dönmesi. Dördüncü masayı devirebilir.',
      evidence: refNames(state.selectedRefIds),
    });
  }

  const emptyRecipeScenes = state.recipeScenes.filter((scene) => !scene.vo.trim() && !scene.event.trim()).length;
  if (emptyRecipeScenes > 0) {
    verdicts.push({
      voice: 'Drama',
      tone: 'warn',
      title: 'Sahne boşlukları var.',
      text: 'Perde kalktı. Bazı ağızlar hâlâ kapalı.',
      evidence: `${emptyRecipeScenes}/${state.recipeScenes.length} recipe scene boş`,
    });
  }

  if (pulse.score === 100) {
    verdicts.push({
      voice: 'Volition',
      tone: 'pass',
      title: 'Kapılar yeşil.',
      text: 'Nefes al. Dosya ayakta. Üretime geçebilirsin.',
      evidence: `pulse ${pulse.score}% READY`,
    });
  } else {
    verdicts.push({
      voice: 'Volition',
      tone: pulse.score < 50 ? 'fail' : 'info',
      title: pulse.next.label,
      text: pulse.next.detail.startsWith('Eksik') ? pulse.next.detail : `Eksik: ${pulse.next.detail}`,
      evidence: `pulse ${pulse.score}% ${pulse.status}`,
    });
  }

  const cap = context === 'qa' ? 6 : context === 'recipe' || context === 'director' ? 5 : 4;
  return verdicts
    .sort((a, b) => toneRank(a.tone) - toneRank(b.tone))
    .slice(0, cap);
}
