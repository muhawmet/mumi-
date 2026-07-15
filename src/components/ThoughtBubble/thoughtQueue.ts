import type { InnerVoiceTone, InnerVoiceVerdict } from '../innerVoices';

export type ThoughtBehavior = 'auto-open' | 'badge' | 'silent';

export interface Thought extends InnerVoiceVerdict {
  key: string;
  behavior: ThoughtBehavior;
  seenAt: number;
  dismissed: boolean;
}

export interface MergeOpts { calm?: boolean }

/** Sakin mod sinyali: kullanıcı henüz hiçbir eylem yapmadı mı?
 *  projectTopic default'la dolu geldiği için ancak DEĞİŞMİŞSE eylem sayılır
 *  (silmek eylem değildir); kaynak/world/preset ise dolunca doğrudan eylemdir. */
export function isCalmState(
  sig: { projectTopic?: string; rawSource?: string; selectedWorldId?: string; phase0PresetId?: string },
  defaultTopic: string,
): boolean {
  const topic = sig.projectTopic?.trim() ?? '';
  const topicTouched = topic !== '' && topic !== defaultTopic.trim();
  return !(topicTouched || sig.rawSource?.trim() || sig.selectedWorldId || sig.phase0PresetId);
}

export function behaviorFor(tone: InnerVoiceTone, calm = false): ThoughtBehavior {
  if (tone === 'fail') return calm ? 'badge' : 'auto-open';
  if (tone === 'warn' || tone === 'spark') return 'badge';
  return 'silent';
}

export function thoughtKey(verdict: InnerVoiceVerdict): string {
  return `${verdict.voice}|${verdict.title}`;
}

/**
 * Mevcut düşünce listesiyle yeni verdict'leri birleştirir.
 *
 * Değişmezler:
 * - Kimlik voice|title ikilisidir; evidence oynak (kelime sayısı, pulse %) olduğundan
 *   kimliğe girmez — bilinen key'de seenAt/dismissed korunur, içerik (evidence, text) tazelenir.
 * - Ton değişimi tırmanma sayılır: behavior yeni tona göre yeniden hesaplanır ve
 *   dismissed sıfırlanır (durum değişti, taze dikkat hak eder). seenAt yine korunur.
 * - Verdict listesinden düşenler listeden çıkar (durum düzeldi demektir).
 * - Sakin mod (calm): kullanıcı henüz hiçbir eylem yapmadıysa fail toast'a değil
 *   rozete düşer; calm kalkınca behavior yeniden hesaplanır ama dismissed korunur
 *   (ton değişmediyse yeniden patlama hakkı yok).
 */
export function mergeThoughts(
  previous: Thought[],
  verdicts: InnerVoiceVerdict[],
  now: number,
  opts: MergeOpts = {},
): Thought[] {
  const calm = opts.calm ?? false;
  const known = new Map(previous.map((t) => [t.key, t]));
  return verdicts.map((verdict) => {
    const key = thoughtKey(verdict);
    const existing = known.get(key);
    if (existing) {
      if (existing.tone !== verdict.tone) {
        return { ...existing, ...verdict, key, behavior: behaviorFor(verdict.tone, calm), dismissed: false };
      }
      return { ...existing, ...verdict, key, behavior: behaviorFor(verdict.tone, calm) };
    }
    return { ...verdict, key, behavior: behaviorFor(verdict.tone, calm), seenAt: now, dismissed: false };
  });
}

/** Akvaryum kanunu (V3 §6): gizliyken toast açılmaz ama kuyruk yaşar.
 *  Toast'lar render edilmediği için auto-dismiss sayacı gizliyken işlemez —
 *  çıkışta auto-open hakkı korunur.
 *  hidden parametresi bilerek fonksiyonun İÇİNDE: slice(0,2) + akvaryum kontrolü
 *  tek yerde kalır, gelecekte kimse hidden-bilinçsiz filtreyi doğrudan çağırıp
 *  akvaryum kanununu atlayamaz. */
export function openToastsFor(thoughts: Thought[], hidden: boolean): Thought[] {
  if (hidden) return [];
  return thoughts.filter((t) => t.behavior === 'auto-open' && !t.dismissed).slice(0, 2);
}
