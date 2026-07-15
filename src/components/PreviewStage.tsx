import React, { useMemo } from 'react';
import { useStudioStore, productionReadiness } from '../store/useStudioStore';
import { buildPreviewState } from '../core/preview';
import { DATA, deriveTeachingRecipe, paletteColors as resolvePaletteColors, refCompatibleWithWorld } from '../core/pure';
import { dnaDirectives, registerOf } from '../core/brain';
import { WorldPlate } from './WorldPlate';
import { ARC_MAP, detectArc, GROUP_COLOR } from '../data/worldData';

// ── Component ─────────────────────────────────────────────────────────────────
export const PreviewStage: React.FC = () => {
  const store = useStudioStore();

  const selectedWorld = DATA.worlds.find((w) => w.id === store.selectedWorldId);
  const selectedPalette = DATA.palettes.find((p) => p.id === store.selectedPaletteId);
  const activeRefId = store.activePreviewRefId || store.selectedRefIds?.[store.selectedRefIds.length - 1] || '';
  const activeRef = DATA.refs.find((r) => r.id === activeRefId);

  const teachingMaterial = selectedWorld
    ? deriveTeachingRecipe(selectedWorld, store.selectedPropId).id
    : 'world-native';

  const state = buildPreviewState({
    world: store.selectedWorldId,
    palette: store.selectedPaletteId,
    teachingMaterial,
    visualWorld: store.projectClass,
    presetName: selectedWorld && selectedPalette
      ? `${selectedWorld.name} + ${selectedPalette.name}`
      : 'Özel Reçete',
  });

  const hasArcGrammar = Boolean(store.selectedWorldId && ARC_MAP[store.selectedWorldId]);
  const groupColor = GROUP_COLOR[selectedWorld?.group ?? ''] ?? 'rgba(255,255,255,0.3)';

  const arcHint = useMemo(() =>
    hasArcGrammar && store.selectedWorldId
      ? detectArc(store.selectedWorldId, store.rawSource ?? '')
      : null,
    [hasArcGrammar, store.selectedWorldId, store.rawSource],
  );

  // DNA from selected refs
  const dna = useMemo(() => {
    if (!store.selectedRefIds?.length || !store.projectClass) return null;
    const refs = store.selectedRefIds
      .map((id) => DATA.refs.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      // Same world gate as production (pure.ts refCompatibleWithWorld): the
      // preview must not display DNA that generateBatch will drop.
      .filter((r) => !store.selectedWorldId || refCompatibleWithWorld(r, store.selectedWorldId));
    if (!refs.length) return null;
    return { ...dnaDirectives(refs, registerOf(store.projectClass)), refNames: refs.map((r) => r.name).join(' · ') };
  }, [store.selectedRefIds, store.projectClass, store.selectedWorldId]);

  const paletteColors = resolvePaletteColors(selectedPalette, selectedWorld) ?? state.colors;
  const colors = state.colors;

  const hasLock = Boolean(store.selectedWorldId);
  const hasSource = Boolean(store.rawSource?.trim());
  const beatCount = store.sourceBeats?.length ?? 0;
  const hasScenes = (store.scenes?.length ?? 0) > 0;
  // MACRO 4 — sahte "Status: PASS" string sniff'i KALDIRILDI. Gerçek onay durumu tek canonical
  // readiness'ten gelir: üretim ancak Mami tüm shot'ları onayladığında hazırdır.
  const readiness = productionReadiness(
    store,
    store.currentCommandId(),
    store.currentPromptSourceCommandId(),
  );
  const shotsApproved = readiness.ready;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'rgba(24, 14, 7, 0.5)',
      backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
      borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden', color: '#fff',
    }}>

      {/* ── Canvas ────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', height: 210, overflow: 'hidden', borderRadius: '14px 14px 0 0' }}>
        <WorldPlate
          worldGroup={selectedWorld?.group}
          colors={colors}
          category={state.category}
          previewType={activeRef?.preview || 'default'}
          worldId={store.selectedWorldId}
          refId={activeRef?.id}
          evidenceLabel={activeRef ? `${activeRef.cat} · ${activeRef.anchor || activeRef.id}` : state.worldName}
        />

        {/* Top-left: category + group badges — sağdaki ref chip'iyle çakışmasın diye %50'ye sınırlı */}
        <div style={{ position: 'absolute', top: 8, left: 10, display: 'flex', gap: 5, maxWidth: 'calc(50% - 12px)', overflow: 'hidden' }}>
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, padding: '3px 7px', color: '#fff',
            flexShrink: 0,
          }}>{state.category}</span>
          {selectedWorld?.group && (
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase',
              background: groupColor + '22', border: `1px solid ${groupColor}55`,
              borderRadius: 5, padding: '3px 7px', color: groupColor,
              minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{selectedWorld.group.replace('_', ' ')}</span>
          )}
        </div>

        {/* Top-right: active ref name */}
        {activeRef && (
          <div style={{
            position: 'absolute', top: 8, right: 10,
            fontSize: 9, fontWeight: 800,
            background: '#f6c862', color: '#1a1100',
            borderRadius: 5, padding: '3px 7px',
            maxWidth: 'calc(50% - 14px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{activeRef.name}</div>
        )}

        {/* Bottom overlay: arc chip OR world name */}
        {arcHint ? (
          <div style={{
            position: 'absolute', bottom: 8, left: 10, right: 10,
            background: 'rgba(247,201,72,0.15)', border: '1px solid rgba(247,201,72,0.45)',
            backdropFilter: 'blur(8px)', borderRadius: 7, padding: '5px 10px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#f6c862', letterSpacing: 0.5 }}>
                {arcHint.label}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(247,201,72,0.7)', marginTop: 1 }}>
                {arcHint.sub}
              </div>
            </div>
          </div>
        ) : !activeRef ? (
          <div style={{
            position: 'absolute', bottom: 8, left: 10, right: 10,
            fontSize: 11, fontWeight: 800, color: '#fff',
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
            borderRadius: 6, padding: '4px 8px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: 8, overflow: 'hidden',
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{state.worldName}</span>
            <span style={{ fontSize: 9, opacity: 0.55, flexShrink: 0, whiteSpace: 'nowrap' }}>{state.matName}</span>
          </div>
        ) : null}
      </div>

      {/* ── 4-color bridge bar (palette → canvas visual connection) ─── */}
      <div style={{ display: 'flex', height: 3 }}>
        {paletteColors.slice(0, 4).map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>

      {/* ── Info grid: 2×2 ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>

        {/* World */}
        <div style={{ background: 'rgba(22,13,7,0.85)', padding: '10px 12px', minWidth: 0 }}>
          <div style={{
            fontSize: 8, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
            color: 'rgba(255,236,205,0.6)', marginBottom: 4
          }}>WORLD</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
            {selectedWorld?.name ?? '—'}
          </div>
          {hasArcGrammar && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'rgba(247,201,72,0.1)', border: '1px solid rgba(247,201,72,0.3)',
              borderRadius: 4, padding: '2px 7px',
            }}>
              <span style={{ fontSize: 8, color: '#f6c862', fontWeight: 700, letterSpacing: 0.5 }}>ARC-AWARE</span>
              <span style={{ fontSize: 9, color: '#f6c862' }}>✓</span>
            </div>
          )}
          {!hasArcGrammar && selectedWorld?.group && (
            <div style={{ fontSize: 9, color: 'rgba(255,236,205,0.55)' }}>{selectedWorld.group}</div>
          )}
        </div>

        {/* Palette */}
        <div style={{ background: 'rgba(22,13,7,0.85)', padding: '10px 12px', minWidth: 0 }}>
          <div style={{
            fontSize: 8, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
            color: 'rgba(255,236,205,0.6)', marginBottom: 6
          }}>PALETTE — LIGHT</div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end' }}>
            {paletteColors.slice(0, 4).map((c, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {/* Upward arrow connecting to bridge bar */}
                <div style={{
                  width: 0, height: 0,
                  borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
                  borderBottom: `5px solid ${c}`, opacity: 0.6, marginBottom: 1,
                }} />
                <div style={{
                  width: 22, height: 22, borderRadius: 5, background: c,
                  boxShadow: `0 2px 10px ${c}66, inset 0 1px 1px rgba(255,255,255,0.18)`,
                }} />
                <div style={{ fontSize: 7, color: 'rgba(255,236,205,0.55)', fontFamily: 'monospace' }}>
                  {c.replace('#', '').toUpperCase()}
                </div>
              </div>
            ))}
          </div>
          {selectedPalette?.name && (
            <div style={{ fontSize: 9, color: 'rgba(255,236,205,0.55)', marginTop: 5 }}>
              {selectedPalette.name}
            </div>
          )}
        </div>

        {/* DNA — panelin tam genişliğini kaplar; satırlar kırpılmaz, sarar (viewport kenarında yarım kelime yasak) */}
        <div style={{ background: 'rgba(22,13,7,0.85)', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', gridColumn: '1 / -1', minWidth: 0 }}>
          <div style={{
            fontSize: 8, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
            color: 'rgba(255,236,205,0.6)', marginBottom: 5
          }}>REF DNA</div>
          {dna ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{
                fontSize: 10, fontWeight: 600, color: 'var(--gold)',
                lineHeight: 1.35, overflowWrap: 'anywhere',
              }}>
                {dna.refNames}
              </div>
              {(['CAM', 'LIGHT', 'STAGE'] as const).map((k, i) => {
                const val = [dna.camera, dna.light, dna.staging][i];
                return (
                  <div key={k} style={{ display: 'flex', gap: 6, fontSize: 9, alignItems: 'baseline' }}>
                    <span style={{ color: 'rgba(255,236,205,0.55)', fontWeight: 700, minWidth: 34, flexShrink: 0 }}>{k}</span>
                    {/* Truncate yerine 2 satır sar: kritik DNA direktifi tam okunur kalır */}
                    <span style={{
                      color: 'rgba(255,244,224,0.72)', minWidth: 0, lineHeight: 1.35,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere',
                    }}>
                      {val ?? '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', fontStyle: 'italic' }}>
              Referans seçilmedi
            </div>
          )}
        </div>

        {/* Brief status */}
        <div style={{ background: 'rgba(22,13,7,0.85)', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', gridColumn: '1 / -1', minWidth: 0 }}>
          <div style={{
            fontSize: 8, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
            color: 'rgba(255,236,205,0.6)', marginBottom: 6
          }}>BRIEF STATUS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              { label: 'Render Lock', ok: hasLock, val: hasLock ? 'READY' : 'world bekliyor' },
              { label: 'Source', ok: hasSource, val: hasSource ? `${beatCount || '?'} beat` : 'metin bekliyor' },
              { label: 'Onay', ok: shotsApproved, val: hasScenes ? (shotsApproved ? 'TÜM SHOT ONAYLI' : readiness.stage === 'approval' ? `${readiness.approvedShotIds.length}/${store.scenes.length} onaylı` : 'onay bekliyor') : 'sahne bekliyor' },
            ].map(({ label, ok, val }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 9 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: ok ? 'var(--green)' : 'rgba(255,255,255,0.18)',
                  boxShadow: ok ? '0 0 7px rgba(147, 201, 168, 0.4)' : 'none',
                  transition: 'background 0.3s, box-shadow 0.3s',
                }} />
                <span style={{ color: 'rgba(255,236,205,0.6)', minWidth: 64 }}>{label}</span>
                <span style={{ color: ok ? 'var(--green)' : 'rgba(255,236,205,0.45)', fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
