import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudioStore, recipeReadiness } from '../../store/useStudioStore';
import { Panel, Field, Button, Chip, selectStyle } from '../../components/Layout/PanelKit';
import { DATA, groupedWorlds, deriveProductionPath, deriveTeachingRecipe, SurgeryRef, MOOD_OPTS, CAM_OPTS, LIGHT_OPTS, MUS_OPTS, TRANS_OPTS, POV_OPTS, SIG_OPTS, LEIT_OPTS, TEMPO_OPTS } from '../../core/pure';
import { registerOf } from '../../core/brain';
import { dnaStrength, refContribution, refFit, REF_FIT_CONFLICT, starterPackFor } from '../../core/advisor';

function worldGradient(colors?: string[]): string {
  if (!colors || colors.length === 0) return 'linear-gradient(135deg,#1a1a2e,#16213e)';
  const stops = colors.slice(0, 4);
  if (stops.length === 1) return `linear-gradient(135deg,${stops[0]},#0a0a14)`;
  return `linear-gradient(135deg,${stops.join(',')})`;
}

function getRefPreviewBackground(previewClass?: string, colors?: string[]): string {
  const cls = previewClass || 'default';
  const c = colors && colors.length >= 4 ? colors : ['#111827', '#f5c84233', '#1e3a8a', '#facc15'];

  // Map categories to dynamic CSS gradients using the current palette
  // This makes the reference grid react to the selected palette!
  const maps: Record<string, string> = {
    blade: `linear-gradient(135deg, ${c[2]}, ${c[0]} 48%, ${c[3]} 140%)`,
    ship: `linear-gradient(135deg, ${c[1]}, ${c[0]} 52%, ${c[3]} 140%)`,
    pop: `linear-gradient(135deg, ${c[3]}, ${c[1]}, ${c[0]})`,
    tactile: `linear-gradient(135deg, ${c[2]}, ${c[1]}, ${c[3]})`,
    graphic: `linear-gradient(135deg, ${c[0]}, ${c[3]}, ${c[1]})`,
    openair: `linear-gradient(135deg, ${c[3]}, ${c[1]}, ${c[2]})`,
    gothic: `linear-gradient(135deg, ${c[2]}, ${c[0]}, #000)`,
    ashen: `linear-gradient(135deg, ${c[0]}, ${c[2]}, ${c[1]})`,
    gothicblue: `linear-gradient(135deg, #000, ${c[1]}, ${c[2]})`,
    cyberpunk: `linear-gradient(135deg, ${c[2]}, ${c[3]}, ${c[1]})`,
    tactical: `linear-gradient(135deg, ${c[0]}, ${c[2]}, ${c[3]})`,
    fantasy: `linear-gradient(135deg, ${c[1]}, ${c[3]}, ${c[0]})`,
    underworld: `linear-gradient(135deg, ${c[0]}, ${c[2]}, ${c[1]})`,
    silhouette: `linear-gradient(135deg, #000, ${c[2]}, ${c[0]})`,
    glowforest: `linear-gradient(135deg, ${c[2]}, ${c[1]}, ${c[3]})`,
    monument: `linear-gradient(135deg, ${c[3]}, ${c[1]}, ${c[0]})`,
    persona: `linear-gradient(135deg, #000, ${c[3]}, #fff)`,
    rhythm: `linear-gradient(135deg, ${c[1]}, ${c[3]}, ${c[2]})`,
    whitecity: `linear-gradient(135deg, #fff, ${c[3]}, ${c[0]})`,
    deco: `linear-gradient(135deg, ${c[2]}, ${c[1]}, ${c[3]})`,
    lab: `linear-gradient(135deg, #fff, ${c[3]}, ${c[1]})`,
    western: `linear-gradient(135deg, ${c[3]}, ${c[2]}, ${c[0]})`,
    overgrown: `linear-gradient(135deg, ${c[2]}, ${c[1]}, ${c[0]})`,
    lonely: `linear-gradient(135deg, ${c[2]}, ${c[0]}, ${c[1]})`,
    nordic: `linear-gradient(135deg, ${c[0]}, ${c[1]}, ${c[3]})`,
    technature: `linear-gradient(135deg, ${c[2]}, ${c[3]}, ${c[0]})`,
    elemental: `linear-gradient(135deg, ${c[1]}, ${c[3]}, ${c[2]})`,
    voxel: `linear-gradient(135deg, ${c[2]}, ${c[3]}, ${c[1]})`,
    icon: `linear-gradient(135deg, ${c[3]}, ${c[1]}, #fff)`,
    cozy: `linear-gradient(135deg, ${c[3]}, ${c[1]}, ${c[2]})`,
    pixel: `linear-gradient(135deg, ${c[2]}, ${c[1]}, ${c[3]})`,
    default: `linear-gradient(135deg, ${c[0]}, ${c[2]} 80%)`
  };
  return maps[cls] || maps['default'];
}

const normalize = (s: string) => {
  return s.toLocaleLowerCase('tr-TR')
    .replace(/g/g, 'g').replace(/ğ/g, 'g')
    .replace(/u/g, 'u').replace(/ü/g, 'u')
    .replace(/s/g, 's').replace(/ş/g, 's')
    .replace(/i/g, 'i').replace(/ı/g, 'i')
    .replace(/o/g, 'o').replace(/ö/g, 'o')
    .replace(/c/g, 'c').replace(/ç/g, 'c');
};

function searchMatch(ref: SurgeryRef, q: string): boolean {
  if (!q) return true;
  const terms = normalize(q).split(' ').filter(Boolean);
  const target = normalize([ref.name, ref.id, ref.cat, ref.dna, ref.use, ref.avoid, ref.anchor].filter(Boolean).join(' '));
  return terms.every(t => target.includes(t));
}

export const RecipeStep = () => {
  const {
    selectedWorldId,
    selectedPropId,
    selectedRefIds,
    selectedPaletteId,
    mood,
    cameraEnergy,
    timeLight,
    transition,
    musicVibe,
    pov,
    signature,
    leitmotif,
    tempoCurve,
    projectClass,
    setField,
    setCurrentStep,
    advance,
  } = useStudioStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [showLimit, setShowLimit] = useState(24);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedDetailRefId, setSelectedDetailRefId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDetailRefId) {
      const el = document.getElementById('hero-detail-panel');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        el.focus();
      }
    }
  }, [selectedDetailRefId]);

  const worldGroups = useMemo(() => groupedWorlds(), []);
  const selectedWorld = DATA.worlds.find((w) => w.id === selectedWorldId);
  const isRealWorld = (selectedWorld?.group || '').toLowerCase() === 'real';
  const selectedPalette = DATA.palettes.find((p) => p.id === selectedPaletteId);
  const recipe = selectedWorld ? deriveTeachingRecipe(selectedWorld, selectedPropId) : null;
  const readiness = recipeReadiness({ selectedWorldId, selectedPaletteId, selectedRefIds });
  const dnaRegister = registerOf(deriveProductionPath(projectClass));
  const selectedRefs = (selectedRefIds || []).map((id) => DATA.refs.find((ref) => ref.id === id)).filter(Boolean) as SurgeryRef[];
  const strength = dnaStrength(selectedRefs, dnaRegister);
  const starterPack = selectedWorld ? starterPackFor(selectedWorld.id) : [];
  const starterApplied = starterPack.length > 0 && starterPack.every((ref) => selectedRefIds.includes(ref.id));

  const categories = useMemo(() => {
    const cats = new Map<string, number>();
    DATA.refs.forEach(r => {
      const c = r.cat || 'other';
      cats.set(c, (cats.get(c) || 0) + 1);
    });
    return Array.from(cats.entries()).sort((a, b) => b[1] - a[1]);
  }, []);

  const filteredRefs = useMemo(() => {
    let list = DATA.refs;
    if (activeCat) list = list.filter(r => r.cat === activeCat);
    if (searchQuery) list = list.filter(r => searchMatch(r, searchQuery));
    if (selectedWorld) list = [...list].sort((a, b) => refFit(selectedWorld, b) - refFit(selectedWorld, a));
    return list;
  }, [activeCat, searchQuery, selectedWorld]);

  const applyStarterPack = () => {
    if (!selectedWorld || starterPack.length === 0) return;
    setField('selectedRefIds', starterPack.map((ref) => ref.id));
    setToastMsg(`${selectedWorld.name} için küratörlü DNA paketi uygulandı.`);
    window.setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleRef = (id: string) => {
    setToastMsg(null);
    const r = DATA.refs.find(x => x.id === id);
    if (!r) return;

    let next = [...(selectedRefIds || [])];
    if (next.includes(id)) {
      next = next.filter(x => x !== id);
    } else {
      const mismatch = r.worldId && selectedWorldId && r.worldId !== selectedWorldId;
      if (mismatch) {
        setToastMsg('Seçili Dünya ile uyumsuz referans eklenemez.');
        setTimeout(() => setToastMsg(null), 3000);
        return;
      }
      if (next.length >= 3) {
        setToastMsg('Maximum 3 Referans DNA seçilebilir. Birini çıkarmalısınız.');
        setTimeout(() => setToastMsg(null), 3000);
        return;
      }
      next.push(id);
    }
    setField('selectedRefIds', next);
  };

  const removeRef = (id: string) => {
    setField('selectedRefIds', (selectedRefIds || []).filter(x => x !== id));
  };

  return (
    <div className="recipe-step" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1180 }}>
      <header>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700 }}>STAGE 2 · REÇETE</div>
        <h1 style={{ fontSize: 38, margin: '8px 0 4px', fontWeight: 700, letterSpacing: -0.5 }}>Görsel DNA</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Dünya yetkilidir; Reference DNA ona tabidir. Palet, dünya rengini ezerse "USER_PALETTE" olarak işaretlenir.
        </p>
      </header>

      {toastMsg && (
        <div role="status" aria-live="polite" style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: '#000', padding: '12px 24px', borderRadius: 99, fontWeight: 700, zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
          {toastMsg}
        </div>
      )}

      <Panel
        title={`Visual World Type (${DATA.worlds.length})`}
        subtitle={selectedWorld ? selectedWorld.formula : 'Sahnenin tüm görsel grameri buradan akar.'}
      >
        {Object.entries(worldGroups).map(([group, list]) => (
          <div key={group} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>
              {group.toUpperCase()} · {list.length}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: 10,
              }}
            >
              {list.map((w, i) => {
                const active = selectedWorldId === w.id;
                return (
                  <motion.button
                    key={w.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    whileHover={{ y: -2 }}
                    onClick={() => setField('selectedWorldId', w.id)}
                    style={{
                      padding: 0,
                      borderRadius: 12,
                      border: `1px solid ${active ? 'var(--gold)' : 'var(--line2)'}`,
                      background: 'rgba(0,0,0,.25)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: '#fff',
                      overflow: 'hidden',
                      boxShadow: active ? '0 0 0 1px var(--gold), 0 12px 30px rgba(247,201,72,.16)' : 'none',
                    }}
                  >
                    <div style={{ height: 56, background: worldGradient(w.colors) }} />
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{w.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{w.id}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
        {selectedWorld && (
          <div
            style={{
              marginTop: 12,
              padding: 14,
              borderRadius: 10,
              background: 'rgba(247,201,72,.04)',
              border: '1px solid var(--line2)',
              fontSize: 12,
              color: 'var(--text-muted)',
              lineHeight: 1.55,
            }}
          >
            <div><strong style={{ color: '#fff' }}>Render:</strong> {selectedWorld.render}</div>
            {selectedWorld.motion && (
              <div style={{ marginTop: 6 }}>
                <strong style={{ color: '#fff' }}>Motion:</strong> {selectedWorld.motion}
              </div>
            )}
          </div>
        )}
      </Panel>

      {/* Reference DNA Full Width Vault */}
      <Panel title="Reference DNA" subtitle="Max 3 reference mix. First selected is primary.">

        {selectedWorld && starterPack.length > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 'var(--sp-4)', alignItems: 'center',
            padding: 'var(--sp-4)', marginBottom: 'var(--sp-5)', borderRadius: 'var(--r-md)',
            background: 'var(--goldsoft)', border: '1px solid var(--goldline)', boxShadow: 'var(--ring-gold)',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, letterSpacing: 1.8, fontWeight: 800, color: 'var(--gold)', marginBottom: 7 }}>
                BU DÜNYA İÇİN ÖNERİLEN DNA
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {starterPack.map((ref) => (
                  <span key={ref.id} style={{ padding: '5px 9px', borderRadius: 'var(--r-pill)', background: 'var(--inset)', border: '1px solid var(--line2)', color: 'var(--text-soft)', fontSize: 11, fontWeight: 700 }}>
                    {ref.name} · %{refFit(selectedWorld, ref)}
                  </span>
                ))}
              </div>
            </div>
            <Button onClick={applyStarterPack} disabled={starterApplied}>
              {starterApplied ? 'Paket aktif' : 'Tek tıkla uygula'}
            </Button>
          </div>
        )}

        <div style={{
          display: 'grid', gridTemplateColumns: 'auto minmax(120px,1fr) auto', alignItems: 'center', gap: 'var(--sp-3)',
          padding: '12px 14px', marginBottom: 'var(--sp-4)', borderRadius: 'var(--r-sm)', background: 'var(--inset)', border: '1px solid var(--line2)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-soft)', letterSpacing: 1 }}>DNA GÜCÜ</span>
          <span style={{ height: 7, borderRadius: 'var(--r-pill)', background: 'var(--s3)', overflow: 'hidden' }}>
            <span style={{ display: 'block', width: `${strength.percent}%`, height: '100%', borderRadius: 'inherit', background: strength.filled >= 4 ? 'var(--green)' : strength.filled >= 2 ? 'var(--gold)' : 'var(--red)', transition: 'width var(--dur-2) var(--ease-out)' }} />
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: strength.filled >= 4 ? 'var(--green)' : 'var(--gold)' }}>
            {strength.filled}/{strength.total}
          </span>
          <span style={{ gridColumn: '1 / -1', color: 'var(--text-muted)', fontSize: 11 }}>
            {strength.roles.length ? strength.roles.join(' · ') : 'Henüz brief direktifi doldurulmadı.'}
            {strength.zeroRefIds.length > 0 && <strong style={{ color: 'var(--red)' }}> · {strength.zeroRefIds.length} gereksiz ref</strong>}
          </span>
        </div>

        {/* Active Slots */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[0, 1, 2].map((i) => {
            const id = (selectedRefIds || [])[i];
            const r = id ? DATA.refs.find(x => x.id === id) : null;
            const isPrimary = i === 0 && r;
            const fit = r && selectedWorld ? refFit(selectedWorld, r) : 0;
            const contribution = r ? refContribution(r, dnaRegister) : null;
            const conflict = Boolean(r && selectedWorld && fit < REF_FIT_CONFLICT);
            return (
              <div key={i} style={{
                border: r ? (conflict ? '1px solid var(--red)' : i === 0 ? '2px solid var(--gold)' : '1px solid var(--line2)') : '1px dashed var(--line2)',
                background: r ? (i === 0 ? 'rgba(247,201,72,.08)' : 'rgba(0,0,0,.2)') : 'rgba(0,0,0,.1)',
                borderRadius: 12,
                padding: 16,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minHeight: 120,
                boxShadow: isPrimary ? '0 0 15px rgba(247,201,72,.15)' : 'none'
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: r ? 'var(--gold)' : 'var(--text-muted)', letterSpacing: 1 }}>
                  SLOT {i + 1} {isPrimary ? '· PRIMARY DNA' : ''}
                </div>
                {r ? (
                  <>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.cat}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: conflict ? 'var(--red)' : 'var(--green)' }}>UYUM %{fit}</span>
                      {contribution?.roles.map((role) => <span key={role} style={{ fontSize: 9.5, color: 'var(--text-soft)' }}>{role}</span>)}
                      {contribution?.count === 0 && <span style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--red)' }}>GEREKSİZ</span>}
                    </div>
                    <button
                      onClick={() => removeRef(r.id)}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'rgba(255,80,80,.1)',
                        color: 'var(--red)',
                        border: '1px solid rgba(255,80,80,.2)',
                        borderRadius: 6,
                        padding: '10px 14px',
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                        minHeight: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Kaldır
                    </button>
                    {conflict && (
                      <div style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700, marginTop: 'auto' }}>DÜNYA İLE ÇATIŞIYOR</div>
                    )}
                  </>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 'auto', marginBottom: 'auto', textAlign: 'center' }}>
                    Boş Slot
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Detail Hero Area */}
        <AnimatePresence>
          {selectedDetailRefId && (() => {
            const r = DATA.refs.find(x => x.id === selectedDetailRefId);
            if (!r) return null;
            const selected = (selectedRefIds || []).includes(r.id);
            const isPrimary = (selectedRefIds || [])[0] === r.id;
            const mismatch = Boolean(r.worldId && selectedWorldId && r.worldId !== selectedWorldId);
            const fit = selectedWorld ? refFit(selectedWorld, r) : 0;
            const contribution = refContribution(r, dnaRegister);

            return (
              <motion.div
                id="hero-detail-panel"
                tabIndex={-1}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: 'rgba(247,201,72,.06)',
                  border: '1px solid var(--gold)',
                  borderRadius: 14,
                  padding: 20,
                  marginBottom: 24,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(247,201,72,.08)',
                  outline: 'none'
                }}
              >
                <button
                  onClick={() => setSelectedDetailRefId(null)}
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 16,
                    minHeight: 44,
                    minWidth: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label="Detayı kapat"
                >
                  ✕
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 40 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 700, letterSpacing: 2 }}>{r.cat.toUpperCase()} DETAYI</div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 4, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      {r.name}
                      {isPrimary && <span style={{ fontSize: 10, background: 'var(--gold)', color: '#000', padding: '4px 8px', borderRadius: 4, fontWeight: 800 }}>PRIMARY DNA</span>}
                      {mismatch && <span style={{ fontSize: 10, background: 'var(--red)', color: '#fff', padding: '4px 8px', borderRadius: 4, fontWeight: 800 }}>UYUMSUZ / EXPORT DIŞI</span>}
                      {selectedWorld && <span style={{ fontSize: 10, color: fit < REF_FIT_CONFLICT ? 'var(--red)' : 'var(--green)', border: '1px solid currentColor', padding: '4px 8px', borderRadius: 4, fontWeight: 800 }}>DÜNYA UYUMU %{fit}</span>}
                    </h2>
                  </div>

                  {r.dna && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', marginBottom: 2 }}>TAM DNA DIRECTIVE</div>
                      <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.5, background: 'rgba(0,0,0,.3)', padding: 12, borderRadius: 8 }}>{r.dna}</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {contribution.roles.map((role) => <Chip key={role} tone="gold">{role}</Chip>)}
                    {contribution.count === 0 && <Chip tone="red">Gereksiz · direktif katkısı yok</Chip>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    {r.use && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', marginBottom: 2 }}>USE (Kullanılacaklar)</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, background: 'rgba(77,245,160,.04)', padding: 10, borderRadius: 8 }}>{r.use}</div>
                      </div>
                    )}
                    {r.avoid && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', marginBottom: 2 }}>AVOID (Kaçınılacaklar)</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, background: 'rgba(255,80,80,.04)', padding: 10, borderRadius: 8 }}>{r.avoid}</div>
                      </div>
                    )}
                  </div>

                  {mismatch && r.worldId && (
                    <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700, background: 'rgba(255,80,80,.06)', padding: 10, borderRadius: 8, border: '1px solid rgba(255,80,80,.2)' }}>
                      ⚠ UYUMSUZLUK: Bu referans sadece "{r.worldId}" dünyasında çalışmak üzere tasarlanmıştır. Aktif dünya "{selectedWorldId}" olduğu için bu referans aktif mix'e eklenemez ve batch üretimine dahil edilemez.
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button
                      onClick={() => toggleRef(r.id)}
                      disabled={!selected && mismatch}
                      style={{
                        background: selected ? 'var(--red)' : (!selected && mismatch) ? 'var(--s1)' : 'var(--gold)',
                        color: selected ? '#fff' : '#000',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: (!selected && mismatch) ? 'not-allowed' : 'pointer',
                        minHeight: 44,
                        opacity: (!selected && mismatch) ? 0.5 : 1
                      }}
                    >
                      {selected ? 'Referansı Kaldır' : 'Mix\'e Ekle'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Vault Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="DNA, id, özellik ara..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowLimit(24); }}
            style={{ flex: 1, minWidth: 240, background: 'var(--s2)', border: '1px solid var(--line2)', padding: '10px 14px', borderRadius: 8, color: '#fff', fontSize: 14 }}
          />
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', background: 'var(--goldsoft)', padding: '8px 14px', borderRadius: 8, border: '1px solid var(--gold)' }}>
            {(selectedRefIds || []).length}/3 SEÇİLİ
          </div>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16, scrollbarWidth: 'none', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
          <button
            onClick={() => { setActiveCat(null); setShowLimit(24); }}
            style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              background: activeCat === null ? 'var(--gold)' : 'var(--s2)',
              color: activeCat === null ? '#000' : 'var(--text-muted)',
              border: activeCat === null ? '1px solid var(--gold)' : '1px solid var(--line2)'
            }}
          >
            Tümü ({DATA.refs.length})
          </button>
          {categories.map(([cat, count]) => (
            <button
              key={cat}
              onClick={() => { setActiveCat(cat); setShowLimit(24); }}
              style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                background: activeCat === cat ? 'var(--gold)' : 'var(--s2)',
                color: activeCat === cat ? '#000' : 'var(--text-muted)',
                border: activeCat === cat ? '1px solid var(--gold)' : '1px solid var(--line2)'
              }}
            >
              {cat} ({count})
            </button>
          ))}
        </div>

        {/* Results Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          <AnimatePresence>
            {filteredRefs.slice(0, showLimit).map(r => {
              const selected = (selectedRefIds || []).includes(r.id);
              const isPrimary = (selectedRefIds || [])[0] === r.id;
              const mismatch = Boolean(r.worldId && selectedWorldId && r.worldId !== selectedWorldId);
              const fit = selectedWorld ? refFit(selectedWorld, r) : 0;
              const conflict = Boolean(selectedWorld && fit < REF_FIT_CONFLICT);
              const contribution = refContribution(r, dnaRegister);

              return (
                <motion.div
                  layout
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedDetailRefId(r.id)}
                  style={{
                    background: selected ? 'linear-gradient(180deg,rgba(247,201,72,.08),rgba(0,0,0,.2))' : 'linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.2))',
                    border: selected ? '1px solid var(--gold)' : conflict ? '1px solid var(--red)' : '1px solid var(--line2)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: selected ? '0 0 20px rgba(247,201,72,.1)' : '0 4px 20px rgba(0,0,0,.2)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ height: 90, background: getRefPreviewBackground(r.preview, selectedPalette?.colors), position: 'relative' }}>
                    {selectedWorld && (
                      <span style={{ position: 'absolute', top: 8, right: 8, padding: '4px 7px', borderRadius: 'var(--r-pill)', fontSize: 10, fontWeight: 900, color: conflict ? 'var(--red)' : 'var(--green)', background: conflict ? 'var(--redsoft)' : 'var(--greensoft)', border: '1px solid currentColor' }}>
                        %{fit} UYUM
                      </span>
                    )}
                    {r.anchor && (
                      <div style={{ position: 'absolute', bottom: 6, left: 10, right: 10, fontSize: 9, fontWeight: 800, background: 'rgba(0,0,0,.6)', padding: '4px 6px', borderRadius: 6, color: '#fff' }}>
                        {r.anchor}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>{r.cat}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: selected ? 'var(--gold)' : '#fff' }}>{r.name}</div>
                    </div>
                    {r.dna && <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{r.dna}</div>}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto', paddingTop: 8 }}>
                      {contribution.roles.map((role) => <Chip key={role} tone="gold">{role}</Chip>)}
                      {contribution.count === 0 && <Chip tone="red">Gereksiz</Chip>}
                      {r.use && <span style={{ fontSize: 10, background: 'rgba(77,245,160,.1)', color: 'var(--green)', padding: '3px 6px', borderRadius: 4, fontWeight: 700 }}>USE: {r.use.slice(0,40)}...</span>}
                      {r.avoid && <span style={{ fontSize: 10, background: 'rgba(255,80,80,.1)', color: 'var(--red)', padding: '3px 6px', borderRadius: 4, fontWeight: 700 }}>AVOID: {r.avoid.slice(0,30)}...</span>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line2)', paddingTop: 10, marginTop: 4 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedDetailRefId(r.id); }}
                          aria-label={`Detay: ${r.name}`}
                          style={{
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--line2)',
                            padding: '10px 16px',
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: 'pointer',
                            minHeight: 44,
                          }}
                        >
                          Detay
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleRef(r.id); }}
                          disabled={!selected && mismatch}
                          aria-label={!selected && mismatch ? `${r.name} seçili dünya ile uyumsuz olduğu için eklenemez` : undefined}
                          title={!selected && mismatch ? "Bu referans seçili Dünya ile uyumsuz olduğu için eklenemez." : undefined}
                          style={{
                            background: selected ? 'var(--goldsoft)' : (!selected && mismatch) ? 'var(--s1)' : 'var(--s3)',
                            color: (!selected && mismatch) ? 'var(--text-muted)' : selected ? 'var(--gold)' : '#fff',
                            border: selected ? '1px solid var(--gold)' : '1px solid var(--line2)',
                            padding: '10px 16px',
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: (!selected && mismatch) ? 'not-allowed' : 'pointer',
                            opacity: (!selected && mismatch) ? 0.5 : 1,
                            minHeight: 44,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {selected ? 'Çıkar' : 'Ekle'}
                        </button>
                      </div>

                      {isPrimary && <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)' }}>PRIMARY</span>}
                      {mismatch && <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--red)' }}>UYUMSUZ / EXPORT DIŞI</span>}
                      {!mismatch && conflict && <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--red)' }}>DÜNYA İLE ÇATIŞIYOR</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {filteredRefs.length > showLimit && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button variant="ghost" onClick={() => setShowLimit(s => s + 24)}>Daha fazla göster ({filteredRefs.length - showLimit})</Button>
          </div>
        )}
        {filteredRefs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Sonuç bulunamadı.</div>
        )}
      </Panel>

      <Panel
        title="Anlatı Malzemesi · 2. Eksen"
        subtitle="Render dünyası bu malzemeyi İŞLER — örn. Arcane render'ı + kâğıt malzeme. Render stilinden bağımsız: sahne neyden yapılı?"
      >
        {isRealWorld ? (
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>
            <Chip tone="default">GERÇEK</Chip> Foto-gerçek dünyalarda malzeme ekseni uygulanmaz — gerçek görüntü "bir şeyden yapılı" değildir.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DATA.materials.map((m) => {
                const active = selectedPropId === m.id || (m.id === 'none' && (selectedPropId === 'native_world' || !selectedPropId));
                return (
                  <button
                    key={m.id}
                    onClick={() => setField('selectedPropId', m.id)}
                    style={{
                      padding: '9px 14px', borderRadius: 'var(--r-pill)', cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                      border: `1px solid ${active ? 'var(--gold)' : 'var(--line2)'}`,
                      background: active ? 'var(--goldsoft)' : 'var(--inset)',
                      color: active ? 'var(--gold)' : 'var(--text-soft)',
                      transition: 'all var(--dur) var(--ease)',
                    }}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
            {(() => {
              const m = DATA.materials.find((x) => x.id === selectedPropId);
              if (!m || !m.clause) return (
                <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-dim)' }}>Saf render dünyası — malzeme katmanı yok.</div>
              );
              return (
                <div style={{ marginTop: 14, padding: 12, borderRadius: 'var(--r-sm)', background: 'var(--inset)', border: '1px solid var(--line)', borderLeft: '3px solid var(--gold)', fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.55 }}>
                  <strong style={{ color: 'var(--gold)' }}>Render-lock'a eklenecek:</strong> {m.clause}
                </div>
              );
            })()}
          </>
        )}
      </Panel>

      <Panel title={`Palet (${DATA.palettes.length})`} subtitle="Dünya paletini ezerse Brief'te 'USER_PALETTE' işaretlenir.">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 10,
          }}
        >
          <button
            onClick={() => setField('selectedPaletteId', '')}
            style={{
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${selectedPaletteId === '' ? 'var(--gold)' : 'var(--line2)'}`,
              background: selectedPaletteId === '' ? 'var(--goldsoft)' : 'rgba(0,0,0,.2)',
              cursor: 'pointer',
              color: '#fff',
              textAlign: 'left',
              fontSize: 12,
            }}
          >
            <div style={{ fontWeight: 700 }}>Dünya paleti</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>varsayılan</div>
          </button>
          {DATA.palettes.map((p) => {
            const active = selectedPaletteId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setField('selectedPaletteId', p.id)}
                style={{
                  padding: 0,
                  borderRadius: 10,
                  border: `1px solid ${active ? 'var(--gold)' : 'var(--line2)'}`,
                  background: 'rgba(0,0,0,.2)',
                  cursor: 'pointer',
                  color: '#fff',
                  textAlign: 'left',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', height: 40 }}>
                  {p.colors.slice(0, 6).map((c, i) => (
                    <div key={i} style={{ flex: 1, background: c }} />
                  ))}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</div>
                </div>
              </button>
            );
          })}
        </div>
        {selectedPalette && (
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
            Seçildi: <strong style={{ color: 'var(--gold)' }}>{selectedPalette.name}</strong>
            {selectedPalette.use && <span> · {selectedPalette.use}</span>}
          </div>
        )}
      </Panel>

      <Panel title="Mood & Yönetmen Kolları" subtitle="Videonun ruhunu burada kur. Hepsi opsiyonel — boş bırakırsan motor karar verir.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <Field label="Mood / Duygu">
            <select style={selectStyle} value={mood} onChange={(e) => setField('mood', e.target.value)}>
              <option value="" style={{ background: '#0d1018' }}>— (yönetmen seçsin)</option>
              {Object.entries(MOOD_OPTS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#0d1018' }}>{v.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Kamera Enerjisi">
            <select style={selectStyle} value={cameraEnergy} onChange={(e) => setField('cameraEnergy', e.target.value)}>
              <option value="" style={{ background: '#0d1018' }}>— (yönetmen seçsin)</option>
              {Object.entries(CAM_OPTS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#0d1018' }}>{v.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Işık & Saat">
            <select style={selectStyle} value={timeLight} onChange={(e) => setField('timeLight', e.target.value)}>
              <option value="" style={{ background: '#0d1018' }}>— (yönetmen seçsin)</option>
              {Object.entries(LIGHT_OPTS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#0d1018' }}>{v.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Geçiş Stili">
            <select style={selectStyle} value={transition} onChange={(e) => setField('transition', e.target.value)}>
              <option value="" style={{ background: '#0d1018' }}>— (yönetmen seçsin)</option>
              {Object.entries(TRANS_OPTS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#0d1018' }}>{v.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Müzik / Suno Vibe">
            <select style={selectStyle} value={musicVibe} onChange={(e) => setField('musicVibe', e.target.value)}>
              <option value="" style={{ background: '#0d1018' }}>— (yönetmen seçsin)</option>
              {Object.entries(MUS_OPTS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#0d1018' }}>{v.label}</option>
              ))}
            </select>
          </Field>
          <Field label="POV">
            <select style={selectStyle} value={pov} onChange={(e) => setField('pov', e.target.value)}>
              <option value="" style={{ background: '#0d1018' }}>— (yönetmen seçsin)</option>
              {Object.entries(POV_OPTS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#0d1018' }}>{v.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Signature Shot">
            <select style={selectStyle} value={signature} onChange={(e) => setField('signature', e.target.value)}>
              <option value="" style={{ background: '#0d1018' }}>— (yönetmen seçsin)</option>
              {Object.entries(SIG_OPTS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#0d1018' }}>{v.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Leitmotif">
            <select style={selectStyle} value={leitmotif} onChange={(e) => setField('leitmotif', e.target.value)}>
              <option value="" style={{ background: '#0d1018' }}>— (yönetmen seçsin)</option>
              {Object.entries(LEIT_OPTS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#0d1018' }}>{v.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Bölüm Temposu (Arc)">
            <select style={selectStyle} value={tempoCurve} onChange={(e) => setField('tempoCurve', e.target.value)}>
              <option value="" style={{ background: '#0d1018' }}>— (yönetmen seçsin)</option>
              {Object.entries(TEMPO_OPTS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#0d1018' }}>{v.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <Button variant="ghost" onClick={() => { setField('mood', ''); setField('cameraEnergy', ''); setField('timeLight', ''); setField('transition', ''); setField('musicVibe', ''); setField('pov', ''); setField('signature', ''); setField('leitmotif', ''); setField('tempoCurve', ''); }}>
            Hepsini Temizle
          </Button>
        </div>
      </Panel>

      {!readiness.ready && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--red)',
            background: 'rgba(255,80,80,.1)',
            color: 'var(--red)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Eksik seçim: {readiness.missing.join(', ')} — hepsi seçilmeden batch üretilemez.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 12, marginBottom: 40 }}>
        <Button variant="ghost" onClick={() => setCurrentStep('dashboard')}>← Brief'e dön</Button>
        <Button onClick={() => advance()} disabled={!readiness.ready}>
          Sahneler'e geç → <span className="kbd" style={{ marginLeft: 8 }}>⌘↵</span>
        </Button>
      </div>
    </div>
  );
};
