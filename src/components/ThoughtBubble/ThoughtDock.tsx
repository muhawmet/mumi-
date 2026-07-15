import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { DEFAULT_PROJECT_TOPIC, useStudioStore, type Step } from '../../store/useStudioStore';
import { evaluateInnerVoices } from '../innerVoices';
import { AdvisorPortrait } from '../AdvisorPortrait';
import { InnerVoicePanel } from '../InnerVoicePanel';
import { FALLBACK_PORTRAIT, TONE_COLOR, TONE_LABEL, VOICE_PORTRAIT } from './voicePortraits';
import { isCalmState, mergeThoughts, openToastsFor, type Thought } from './thoughtQueue';
import { useTypewriter } from './useTypewriter';

const CONTEXT_FOR_STEP: Record<Step, Parameters<typeof evaluateInnerVoices>[1]> = {
  dashboard: 'dashboard',
  director: 'director',
  recipe: 'recipe',
  scenes: 'scenes',
  timeline: 'timeline',
  qa: 'qa',
};

const AUTO_DISMISS_MS = 9000;

function ThoughtToast({ thought, onDismiss }: { thought: Thought; onDismiss: (key: string) => void }) {
  // Metin mount anında dondurulur: merge içeriği tazelese bile daktilo baştan başlamaz.
  // Gerçekten yeni bir düşünce zaten thought.key ile remount olur.
  const frozenText = useRef(thought.text).current;
  const typed = useTypewriter(frozenText);
  const color = TONE_COLOR[thought.tone];
  const portrait = VOICE_PORTRAIT[thought.voice] || FALLBACK_PORTRAIT;

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(thought.key), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [thought.key, onDismiss]);

  return (
    <motion.article
      data-testid="thought-toast"
      className="thought-toast"
      aria-label={`${thought.voice}: ${thought.title} — ${frozenText}`}
      style={{ borderColor: `${color}66` }}
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      <div className="thought-toast-portrait">
        <AdvisorPortrait id={portrait.id} fallbackSpriteId={portrait.fallback} width={52} height={52} />
      </div>
      <div className="thought-toast-copy">
        <div className="thought-toast-row">
          <span className="thought-toast-voice" style={{ color }}>{thought.voice}</span>
          <span className="thought-toast-tone" style={{ color, background: `${color}18` }}>
            {TONE_LABEL[thought.tone]}
          </span>
        </div>
        <strong>{thought.title}</strong>
        <p aria-hidden="true">{typed}<span className="thought-caret" aria-hidden>▎</span></p>
      </div>
      <button type="button" className="thought-toast-close" aria-label="Kapat" onClick={() => onDismiss(thought.key)}>×</button>
    </motion.article>
  );
}

export const ThoughtDock: React.FC<{ hidden?: boolean }> = ({ hidden = false }) => {
  const state = useStudioStore(
    useShallow((s) => ({
      projectTopic: s.projectTopic, subject: s.subject, rawSource: s.rawSource,
      sourceReport: s.sourceReport, selectedWorldId: s.selectedWorldId,
      selectedPaletteId: s.selectedPaletteId, selectedRefIds: s.selectedRefIds,
      activePreviewRefId: s.activePreviewRefId, selectedPropId: s.selectedPropId,
      projectClass: s.projectClass, sceneCount: s.sceneCount,
      phase0PresetId: s.phase0PresetId,
      recipeScenes: s.recipeScenes, scenes: s.scenes,
      agentBrief: s.agentBrief, agentPackets: s.agentPackets,
    })),
  );
  const currentStep = useStudioStore((s) => s.currentStep);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const thoughtsRef = useRef(thoughts);
  thoughtsRef.current = thoughts;

  const verdicts = useMemo(
    () => evaluateInnerVoices(state, CONTEXT_FOR_STEP[currentStep]),
    [state, currentStep],
  );

  // Sakin mod: kullanıcı henüz hiçbir eylem yapmadıysa fail'ler rozete düşer.
  const calm = isCalmState(state, DEFAULT_PROJECT_TOPIC);

  useEffect(() => {
    setThoughts(mergeThoughts(thoughtsRef.current, verdicts, Date.now(), { calm }));
  }, [verdicts, calm]);

  const dismiss = React.useCallback((key: string) => {
    setThoughts((current) => current.map((t) => (t.key === key ? { ...t, dismissed: true } : t)));
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  useEffect(() => {
    if (hidden) setDrawerOpen(false);
  }, [hidden]);

  const openToasts = openToastsFor(thoughts, hidden);
  const badgeCount = thoughts.filter((t) => t.behavior === 'badge' && !t.dismissed).length;

  return (
    <>
      <div
        className={hidden ? 'thought-dock is-hidden' : 'thought-dock'}
        data-testid="thought-dock"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {openToasts.map((t) => <ThoughtToast key={t.key} thought={t} onDismiss={dismiss} />)}
        </AnimatePresence>

        {badgeCount > 0 && (
          <motion.button
            type="button"
            data-testid="thought-badge"
            className="thought-badge"
            onClick={() => setDrawerOpen(true)}
            title={`${badgeCount} okuma bekliyor — düşünce geçmişini aç`}
            aria-label={`${badgeCount} okuma bekliyor, düşünce geçmişini aç`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          >
            <span className="thought-badge-mark" aria-hidden>!</span>
            <span className="thought-badge-count">{badgeCount}</span>
            {/* Etiketsiz '! 2' okunmuyordu — anlamı ilk bakışta ver */}
            <span className="thought-badge-label">OKUMA</span>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            className="thought-drawer"
            data-testid="thought-drawer"
            role="dialog"
            aria-modal="false"
            aria-label="Düşünce geçmişi"
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <header className="thought-drawer-head">
              <span>DÜŞÜNCE GEÇMİŞİ</span>
              <button type="button" aria-label="Çekmeceyi kapat" onClick={() => setDrawerOpen(false)}>×</button>
            </header>
            <InnerVoicePanel title="THOUGHT CABINET" subtitle="tüm okumalar" voices={thoughts} compact />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
