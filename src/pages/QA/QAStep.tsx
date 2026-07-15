import React, { useMemo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scenesWithEffectivePrompts, useStudioStore, productionReadiness } from '../../store/useStudioStore';
import { Button } from '../../components/Layout/PanelKit';
import { evaluateDirectorCabinet, exportGateStatus, type QATip, type SkillId } from '../../core/qa';
import { downloadFile } from '../../core/exporters';
import { buildCommandJSON } from '../../core/commandExport';
import { AdvisorPortrait } from '../../components/AdvisorPortrait';
import { QA_PORTRAIT, FALLBACK_PORTRAIT } from '../../components/ThoughtBubble/voicePortraits';

const SKILL_NAMES: Record<SkillId, string> = {
  visual_calculus: 'VISUAL CALCULUS',
  conceptualization: 'CONCEPTUALIZATION',
  drama: 'DRAMA',
  encyclopedia: 'ENCYCLOPEDIA',
  inland_empire: 'INLAND EMPIRE',
  prompt_surgeon: 'PROMPT SURGEON',
  volition: 'VOLITION'
};

// Tek-sistem accent yasası: ham mor/mavi/pembe YOK. Her ses altın · sage · buz
// ailesinden bir türev tonuyla ayrışır (MAMILAS canonical palette dışına çıkmaz).
const SKILL_COLORS: Record<SkillId, string> = {
  visual_calculus: '#8fa3c2',   // buz (v3-ice)
  conceptualization: '#f6c862', // canonical altın
  drama: '#e0b256',             // derin altın
  encyclopedia: '#93c9a8',      // sage
  inland_empire: '#b7c3d8',     // açık buz
  prompt_surgeon: '#7fb59a',    // derin sage
  volition: '#d6a84f'           // amber
};

const TypewriterText: React.FC<{ text: string; onComplete?: () => void }> = ({ text, onComplete }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 15);
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <span>{displayed}</span>;
};

export const QAStep = () => {
  const state = useStudioStore();
  // Narrow the memo deps to only the state slices evaluateDirectorCabinet reads,
  // so unrelated store churn (or a keystroke elsewhere) can't mint a fresh `tips`
  // reference and reset the auto-advance timer / re-run the rail.
  // effectivePrompt collapse ŞART (TimelineStep ile aynı kalıp): el-düzeltmesi
  // (userImagePrompt) denetlenmezse firewall temiz üretilmiş prompt'a bakıp
  // sahte-yeşil yanar, motora denetimsiz metin gider.
  const tips = useMemo(
    () => evaluateDirectorCabinet(scenesWithEffectivePrompts(state)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      state.scenes,
      state.sceneCount,
      state.projectClass,
      state.selectedWorldId,
      state.selectedPropId,
      state.sourceReport,
    ]
  );
  const [visibleIndex, setVisibleIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);
  const visibleTips = tips.slice(0, visibleIndex + 1);
  const passCount = tips.filter((tip) => tip.success).length;
  const currentTip = tips[Math.min(visibleIndex, Math.max(0, tips.length - 1))];

  // Auto-advance tips
  useEffect(() => {
    if (visibleIndex < tips.length - 1) {
      const timer = setTimeout(() => {
        setVisibleIndex(v => v + 1);
      }, 3000 + (tips[visibleIndex].text.length * 20));
      return () => clearTimeout(timer);
    }
  }, [visibleIndex, tips]);

  // Keep the currently-speaking voice comfortably in view (the queued voices
  // sit below it, so scrolling to the bottom would overshoot the speaker).
  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    activeCardRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }, [visibleIndex]);

  // Red-line FAIL'ler (Medium+) export'u tutar; advisory (Easy/Trivial) tutmaz.
  const gate = useMemo(() => exportGateStatus(tips), [tips]);

  // MACRO 4 — TEK canonical kapı: shot onayı burada birincildir. Mami tüm shot'ları güncel
  // karara APPROVED yapmadan üretim paketi çıkmaz. Disco teknik lint (`gate`) ikincil uyarı
  // olarak kalır (nötr validator). İki export yolu kaldırıldığı için tek gate'li yol budur.
  const commandId = state.currentCommandId();
  const promptSourceId = state.currentPromptSourceCommandId();
  const readiness = useMemo(
    () => productionReadiness(state, commandId, promptSourceId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.scenes, state.shotApprovals, state.blockers, state.sourceReport, state.rawSource, state.selectedWorldId, state.selectedPaletteId, state.subject, state.recipeScenes, commandId, promptSourceId],
  );

  const onExportCommand = () => {
    if (!state.scenes.length) return;
    if (!readiness.ready) return;
    if (gate.blocked) return;
    // QA'nın teslimi de Timeline/runner ile AYNI canonical command'dir. Eski production
    // JSON dev giant-agent yoluna aitti ve yeni runner tarafından bilinçli olarak reddedilir.
    const payload = buildCommandJSON(state);
    const safeName = state.projectTopic.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 60) || 'mamilas';
    downloadFile(`${safeName}_mamilas_command.json`, JSON.stringify(payload, null, 2), 'application/json');
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background:
        "linear-gradient(180deg, rgba(8,8,10,0.9), rgba(8,8,10,0.82)), url('/assets/mamilas-cabinet-texture.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#e4dfd1',
      fontFamily: '"Georgia", serif',
    }}>
      <header style={{
        padding: '24px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(20,20,24,1) 0%, rgba(13,13,15,1) 100%)',
      }}>
        <div>
          <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--gold)', fontFamily: 'var(--font-sans)' }}>
            DIRECTOR'S CABINET
          </h2>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, fontStyle: 'italic', opacity: 0.9 }}>
            İçsesler Projeyi Değerlendiriyor
          </div>
        </div>

        <Button variant="ghost" onClick={() => state.setCurrentStep('timeline')} style={{ fontFamily: 'var(--font-sans)' }}>
          ← Timeline'a Dön
        </Button>
      </header>

      <div className="qa-cabinet-body" style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', overflow: 'hidden' }}>
        {/* Main Dialogue Area */}
        <div
          ref={scrollRef}
          className="qa-dialogue"
          style={{
            flex: 1,
            padding: '40px 56px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
            scrollBehavior: 'smooth'
          }}
        >
          <div style={{
            maxWidth: 840,
            width: '100%',
            margin: '0 auto',
            padding: '18px 22px',
            border: '1px solid rgba(224,200,92,0.22)',
            background: 'linear-gradient(135deg, rgba(224,200,92,0.09), rgba(0,0,0,0.16))',
            borderRadius: 10,
            boxShadow: '0 20px 52px rgba(0,0,0,0.24)',
          }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--gold-hi)', fontFamily: 'var(--font-sans)', fontWeight: 900 }}>
              SESSION VERDICT
            </div>
            <div style={{ marginTop: 6, fontSize: 19, lineHeight: 1.35, fontWeight: 800, color: '#fff' }}>
              {state.scenes.length ? `${state.scenes.length} sahne cabinet masasında.` : 'Henüz sahne yok; cabinet ön-kontrol modunda.'}
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.62)', fontFamily: 'var(--font-sans)' }}>
              İçsesler tek tek konuşur; sağ panel hangi kapının üretime hazır olduğunu tutar.
            </p>
          </div>

          {/* Every voice is seated at the table: spoken voices are full cards,
              voices still waiting their turn sit below as faint queued cards —
              so the column never collapses into dead space. */}
          {tips.map((tip, idx) => {
            const spoken = idx <= visibleIndex;
            const isCurrent = idx === visibleIndex;

            if (!spoken) {
              return (
                <motion.div
                  key={`${tip.skill}-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.62 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    display: 'flex',
                    gap: 16,
                    maxWidth: 840,
                    margin: '0 auto',
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: '1px dashed rgba(255,255,255,0.09)',
                    background: 'rgba(8,8,10,0.3)',
                    alignItems: 'center',
                  }}
                >
                  <div style={{
                    width: 46,
                    height: 46,
                    flexShrink: 0,
                    borderRadius: 999,
                    overflow: 'hidden',
                    border: `1px solid ${SKILL_COLORS[tip.skill]}88`,
                  }}>
                    <AdvisorPortrait
                      id={QA_PORTRAIT[tip.skill]?.id || FALLBACK_PORTRAIT.id}
                      fallbackSpriteId={QA_PORTRAIT[tip.skill]?.fallback || FALLBACK_PORTRAIT.fallback}
                      width={46}
                      height={46}
                      glow={false}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: SKILL_COLORS[tip.skill], fontFamily: 'var(--font-sans)', textTransform: 'uppercase', opacity: 0.92 }}>
                      {SKILL_NAMES[tip.skill]}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontStyle: 'italic' }}>
                      sırada — söz bekliyor
                    </div>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={`${tip.skill}-${idx}`}
                ref={isCurrent ? activeCardRef : undefined}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  display: 'flex',
                  gap: 24,
                  maxWidth: 840,
                  margin: '0 auto',
                  width: '100%',
                  padding: '18px',
                  borderRadius: 12,
                  border: `1px solid ${SKILL_COLORS[tip.skill]}${isCurrent ? '77' : '44'}`,
                  background: isCurrent ? 'rgba(12,12,15,0.72)' : 'rgba(8,8,10,0.58)',
                  boxShadow: isCurrent
                    ? `0 22px 56px rgba(0,0,0,0.28), 0 0 26px -14px ${SKILL_COLORS[tip.skill]}`
                    : '0 18px 48px rgba(0,0,0,0.18)',
                }}
              >
                {/* Artık tüm portreler orjinal oyun asset'i olduğu için monogram yerine direkt portreleri kullanıyoruz */}
                <div style={{
                  width: 100,
                  height: 140,
                  flexShrink: 0,
                  border: `1px solid ${SKILL_COLORS[tip.skill]}55`,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}>
                  <AdvisorPortrait
                    id={QA_PORTRAIT[tip.skill]?.id || FALLBACK_PORTRAIT.id}
                    fallbackSpriteId={QA_PORTRAIT[tip.skill]?.fallback || FALLBACK_PORTRAIT.fallback}
                    width={100}
                    height={140}
                    glow={isCurrent}
                  />
                </div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, color: SKILL_COLORS[tip.skill], fontFamily: 'var(--font-sans)', textTransform: 'uppercase', marginBottom: 8 }}>
                    {/* lang="en": CSS uppercase 'medium'i MEDİUM yapmasın (İngilizce seviye terimi) */}
                    {SKILL_NAMES[tip.skill]} <span style={{ opacity: 0.5 }}>[<span lang="en">{tip.level}</span>: {tip.success ? 'Başarılı' : 'Başarısız'}]</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-serif)' }}>
                    {isCurrent
                      ? <TypewriterText text={tip.text} />
                      : tip.text}
                  </p>
                  {tip.evidence && tip.evidence.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {tip.evidence.map((ev, i) => (
                        <div key={i} style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>
                          ▸ {ev}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <aside className="qa-rail" style={{
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(7,7,9,0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: 24,
          overflowY: 'auto',
          fontFamily: 'var(--font-sans)',
        }}>
          <div style={{ fontSize: 10, letterSpacing: 2.2, color: 'var(--gold-hi)', fontWeight: 900 }}>
            CABINET INDEX
          </div>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              ['Visible', `${visibleTips.length}/${tips.length}`],
              ['Pass', `${passCount}/${tips.length}`],
              ['Scenes', String(state.scenes.length)],
              ['Packets', String(Object.values(state.agentPackets ?? {}).filter(Boolean).length)],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.025)' }}>
                <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: 800 }}>{label}</div>
                <div style={{ color: '#fff', fontSize: 18, fontWeight: 900, marginTop: 5, fontFamily: 'var(--font-mono)' }}>{value}</div>
              </div>
            ))}
          </div>

          {currentTip && (
            <div style={{ marginTop: 18, padding: 16, borderRadius: 10, border: `1px solid ${SKILL_COLORS[currentTip.skill]}55`, background: 'rgba(0,0,0,0.24)' }}>
              <div style={{ color: 'var(--v3-ice)', fontSize: 10, letterSpacing: 1.5, fontWeight: 900 }}>
                NOW SPEAKING
              </div>
              {/* Rozet kart içinde kalır: isim daralır, durum rozeti sarmaz/taşmaz */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 7, flexWrap: 'wrap' }}>
                <span style={{ color: '#fff', fontWeight: 900, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{SKILL_NAMES[currentTip.skill]}</span>
                <span style={{
                  fontSize: 9,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  letterSpacing: 1,
                  padding: '2px 7px',
                  borderRadius: 4,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  color: currentTip.success ? '#93c9a8' : '#f26d6d',
                  background: `${currentTip.success ? '#93c9a8' : '#f26d6d'}1a`,
                }}>
                  {currentTip.level.toUpperCase()} · {currentTip.success ? 'PASS' : 'FIX'}
                </span>
              </div>
              {currentTip.evidence && currentTip.evidence.length > 0 ? (
                <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {currentTip.evidence.slice(0, 4).map((ev, i) => (
                    <div key={i} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                      ▸ {ev}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: 12, marginTop: 8, lineHeight: 1.45 }}>
                  {currentTip.success ? 'Bu ses kanıtsız geçiş veriyor.' : 'Bu ses somut kanıt istiyor.'}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 18, display: 'grid', gap: 8 }}>
            {tips.map((tip, idx) => (
              <button
                key={`${tip.skill}-${idx}`}
                type="button"
                onClick={() => setVisibleIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '10px 11px',
                  borderRadius: 8,
                  border: `1px solid ${idx <= visibleIndex ? SKILL_COLORS[tip.skill] + '55' : 'rgba(255,255,255,0.08)'}`,
                  background: idx === visibleIndex ? `${SKILL_COLORS[tip.skill]}18` : 'rgba(255,255,255,0.02)',
                  color: idx <= visibleIndex ? '#fff' : 'rgba(255,255,255,0.48)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.7 }}>{SKILL_NAMES[tip.skill]}</span>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: tip.success ? '#93c9a8' : '#f26d6d' }}>
                  {tip.success ? 'PASS' : 'FIX'}
                </span>
              </button>
            ))}
          </div>

        </aside>
      </div>

      <footer style={{
        padding: '24px 32px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'center',
        background: '#111',
      }}>
        <AnimatePresence>
          {visibleIndex === tips.length - 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
            >
              {!readiness.ready ? (
                // BİRİNCİL KAPI — Mami shot onayı. Bu, teknik lint'ten önce gelir: onaylanmamış
                // bir storyboard'un teknik olarak temiz olması onu üretime hazır yapmaz.
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 13, color: '#e0b256', fontFamily: 'var(--font-sans)', textAlign: 'center', maxWidth: 540, lineHeight: 1.5 }}>
                    ⏸ Üretim, Mami onayını bekliyor — {readiness.reason} (Timeline'da her shot'ı onayla).
                  </div>
                  <Button variant="ghost" onClick={() => state.setCurrentStep('timeline')} style={{ fontFamily: 'var(--font-sans)' }}>
                    Timeline'a dön →
                  </Button>
                </div>
              ) : gate.blocked ? (
                (() => {
                  // İKİNCİL — teknik lint (nötr validator). VOLITION özet-sestir, gerekçeden çıkar.
                  const blockers = gate.blocking.filter((t) => t.skill !== 'volition');
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: 13, color: '#e0b256', fontFamily: 'var(--font-sans)', textAlign: 'center', maxWidth: 540, lineHeight: 1.5 }}>
                        ⚠ {blockers.length} kritik teknik uyarı üretimi tutuyor — {blockers.map((t) => SKILL_NAMES[t.skill]).join(' · ')}. Önce çöz, ya da sorumluluğu al ve yine de indir.
                      </div>
                      <Button variant="ghost" onClick={() => state.setCurrentStep('timeline')} style={{ fontFamily: 'var(--font-sans)' }}>
                        Timeline'a dön →
                      </Button>
                    </div>
                  );
                })()
              ) : (
                <Button
                  variant="solid"
                  onClick={onExportCommand}
                  style={{
                    fontSize: 16,
                    padding: '16px 32px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-sans)'
                  }}
                >
                  MAMILAS COMMAND İNDİR
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  );
};
