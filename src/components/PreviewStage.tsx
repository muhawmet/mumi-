import React, { useMemo } from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { buildPreviewState } from '../core/preview';
import { DATA, deriveTeachingRecipe } from '../core/pure';
import { dnaDirectives, registerOf } from '../core/brain';
import { CanvasPreview } from './CanvasPreview';

// ── Arc detection (UI-only, zero business logic) ──────────────────────────────
const ARC_MAP: Record<string, Array<{ re: RegExp; label: string; sub: string }>> = {
  one_piece_grand_line: [
    { re: /elbaf|elbaph|viking|fjord/i, label: 'Elbaf arc', sub: 'Norse giant grammar active' },
    { re: /wano|samuray|ukiyo|sakura/i, label: 'Wano arc', sub: 'Ukiyo-e samurai grammar active' },
    { re: /dressrosa|birdcage|kafes/i, label: 'Dressrosa arc', sub: 'Spanish Mediterranean active' },
    { re: /fishman|balık.?adam|sualtı|mercan/i, label: 'Fishman Island', sub: 'Bioluminescent deep-sea active' },
    { re: /marineford|donmuş.*okyanus/i, label: 'Marineford arc', sub: 'Naval war epic grammar active' },
    { re: /egghead|vegapunk/i, label: 'Egghead arc', sub: 'Futurist sci-fi grammar active' },
    { re: /alabasta|piramit|çöl krallığı/i, label: 'Alabasta arc', sub: 'Desert kingdom grammar active' },
    { re: /thriller|hayalet.*gemi/i, label: 'Thriller Bark', sub: 'Gothic ghost ship grammar active' },
  ],
  demon_slayer_taisho: [
    { re: /mugen|tren\b|train/i, label: 'Mugen Train arc', sub: 'Steam locomotive nightmare active' },
    { re: /eğlence.*bölge|yoshiwara|gece.*mahalle/i, label: 'Entertainment District', sub: 'Yoshiwara night grammar active' },
    { re: /kılıç.*köy|swordsmith|saklı.*köy/i, label: 'Swordsmith Village', sub: 'Hidden mountain grammar active' },
    { re: /sonsuz.*kale|infinity.*castle|muzan/i, label: 'Infinity Castle', sub: 'Demonic architecture active' },
  ],
  naruto_shinobi_world: [
    { re: /chunin|ölüm.*orman|sınav/i, label: 'Chunin Exam arc', sub: 'Forest of Death grammar active' },
    { re: /pain|yıkım|krater/i, label: "Pain's Assault arc", sub: 'Ruined village grammar active' },
    { re: /ninja.*savaş|büyük.*savaş|birleşik/i, label: 'Great Ninja War', sub: 'Epic battlefield grammar active' },
    { re: /vadi.*son|valley.*end|şelale.*düello/i, label: 'Valley of the End', sub: 'Legendary duel grammar active' },
  ],
  bleach_soul_world: [
    { re: /hueco.*mundo|beyaz.*çöl|hollow/i, label: 'Hueco Mundo arc', sub: 'White desert grammar active' },
    { re: /tybw|thousand.*year|bin.*yıl|quincy/i, label: 'Thousand-Year Blood War', sub: 'Fallen Seireitei active' },
    { re: /soul.*king|kral.*saray/i, label: 'Soul King Palace', sub: 'Celestial palace grammar active' },
  ],
  jjk_cursed_domain: [
    { re: /shibuya|metro.*olay/i, label: 'Shibuya Incident arc', sub: 'Urban catastrophe active' },
    { re: /culling.*game|koloni/i, label: 'Culling Game arc', sub: 'Colony arena grammar active' },
    { re: /antik.*mekan|star.*plasma|mezar/i, label: 'Ancient sites arc', sub: 'Stone corridor grammar active' },
  ],
  aot_wall_world: [
    { re: /marley|liberio|liman.*şehir/i, label: 'Marley arc', sub: 'Port city Liberio grammar active' },
    { re: /okyanus|kıyı.*uçurum|dünya.*sonu/i, label: 'Ocean coast arc', sub: 'World boundary grammar active' },
    { re: /yeraltı|bodrum.*şehir/i, label: 'Underground city', sub: 'Lamp-lit cavern grammar active' },
  ],
  solo_leveling_gate: [
    { re: /s.rank.*dungeon|kırmızı.*gate|red.*gate/i, label: 'S-Rank Red Gate', sub: 'Volcanic dungeon grammar active' },
    { re: /shadow.*monarch|gölge.*kral|mutlak.*karanlık/i, label: 'Shadow Monarch realm', sub: 'Absolute void active' },
    { re: /zindan|dungeon|kristal.*mağara/i, label: 'Dungeon arc', sub: 'Crystal cave grammar active' },
  ],
};

function detectArc(worldId: string, source: string): { label: string; sub: string } | null {
  const arcs = ARC_MAP[worldId];
  if (!arcs || !source.trim()) return null;
  for (const arc of arcs) {
    if (arc.re.test(source)) return { label: arc.label, sub: arc.sub };
  }
  return null;
}

const GROUP_COLOR: Record<string, string> = {
  IP_WORLD: '#f7c948',
  ANIMATION: '#60a5fa',
  REAL: '#86efac',
  STYLIZED: '#c084fc',
};

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

  const isIPWorld = selectedWorld?.group === 'IP_WORLD';
  const groupColor = GROUP_COLOR[selectedWorld?.group ?? ''] ?? 'rgba(255,255,255,0.3)';

  const arcHint = useMemo(() =>
    isIPWorld && store.selectedWorldId
      ? detectArc(store.selectedWorldId, store.rawSource ?? '')
      : null,
    [isIPWorld, store.selectedWorldId, store.rawSource],
  );

  // DNA from selected refs
  const dna = useMemo(() => {
    if (!store.selectedRefIds?.length || !store.projectClass) return null;
    const refs = store.selectedRefIds
      .map((id) => DATA.refs.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r));
    if (!refs.length) return null;
    return { ...dnaDirectives(refs, registerOf(store.projectClass)), refNames: refs.map((r) => r.name).join(' · ') };
  }, [store.selectedRefIds, store.projectClass]);

  const paletteColors = selectedPalette?.colors ?? (selectedWorld?.colors as string[] | undefined) ?? state.colors;
  const colors = state.colors;

  const hasLock = Boolean(store.selectedWorldId);
  const hasSource = Boolean(store.rawSource?.trim());
  const beatCount = store.sourceBeats?.length ?? 0;
  const hasScenes = (store.scenes?.length ?? 0) > 0;
  const proofPass = Boolean(store.agentBrief?.includes('Status: PASS'));

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'rgba(10, 13, 20, 0.55)',
      backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
      borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden', color: '#fff',
    }}>

      {/* ── Canvas ────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', height: 210, overflow: 'hidden', borderRadius: '14px 14px 0 0' }}>
        <CanvasPreview
          colors={colors}
          category={state.category}
          previewType={activeRef?.preview || 'default'}
          worldId={store.selectedWorldId}
          refId={activeRef?.id}
        />

        {/* Top-left: category + group badges */}
        <div style={{ position: 'absolute', top: 8, left: 10, display: 'flex', gap: 5 }}>
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, padding: '3px 7px', color: '#fff',
          }}>{state.category}</span>
          {selectedWorld?.group && (
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase',
              background: groupColor + '22', border: `1px solid ${groupColor}55`,
              borderRadius: 5, padding: '3px 7px', color: groupColor,
            }}>{selectedWorld.group.replace('_', ' ')}</span>
          )}
        </div>

        {/* Top-right: active ref name */}
        {activeRef && (
          <div style={{
            position: 'absolute', top: 8, right: 10,
            fontSize: 9, fontWeight: 800,
            background: '#f7c948', color: '#1a1100',
            borderRadius: 5, padding: '3px 7px',
            maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
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
              <div style={{ fontSize: 10, fontWeight: 800, color: '#f7c948', letterSpacing: 0.5 }}>
                {arcHint.label}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(247,201,72,0.7)', marginTop: 1 }}>
                {arcHint.sub}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            position: 'absolute', bottom: 8, left: 10, right: 10,
            fontSize: 11, fontWeight: 800, color: '#fff',
            textShadow: '0 2px 12px rgba(0,0,0,0.8)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>{activeRef?.name || state.worldName}</span>
            <span style={{ fontSize: 9, opacity: 0.55 }}>{state.matName}</span>
          </div>
        )}
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
        <div style={{ background: 'rgba(10,13,20,0.85)', padding: '10px 12px' }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>WORLD</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
            {selectedWorld?.name ?? '—'}
          </div>
          {isIPWorld && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'rgba(247,201,72,0.1)', border: '1px solid rgba(247,201,72,0.3)',
              borderRadius: 4, padding: '2px 7px',
            }}>
              <span style={{ fontSize: 8, color: '#f7c948', fontWeight: 700, letterSpacing: 0.5 }}>ARC-AWARE</span>
              <span style={{ fontSize: 9, color: '#f7c948' }}>✓</span>
            </div>
          )}
          {!isIPWorld && selectedWorld?.group && (
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{selectedWorld.group}</div>
          )}
        </div>

        {/* Palette */}
        <div style={{ background: 'rgba(10,13,20,0.85)', padding: '10px 12px' }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>PALETTE — LIGHT</div>
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
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
                  {c.replace('#', '').toUpperCase()}
                </div>
              </div>
            ))}
          </div>
          {selectedPalette?.name && (
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 5 }}>
              {selectedPalette.name}
            </div>
          )}
        </div>

        {/* DNA */}
        <div style={{ background: 'rgba(10,13,20,0.85)', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>REF DNA</div>
          {dna ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(247,201,72,0.85)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {dna.refNames}
              </div>
              {(['CAM', 'LIGHT', 'STAGE'] as const).map((k, i) => {
                const val = [dna.camera, dna.light, dna.staging][i];
                return (
                  <div key={k} style={{ display: 'flex', gap: 5, fontSize: 9 }}>
                    <span style={{ color: 'rgba(255,255,255,0.28)', fontWeight: 700, minWidth: 34, flexShrink: 0 }}>{k}</span>
                    <span style={{ color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {val?.slice(0, 46) ?? '—'}
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
        <div style={{ background: 'rgba(10,13,20,0.85)', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>BRIEF STATUS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              { label: 'Render Lock', ok: hasLock, val: hasLock ? 'READY' : '—' },
              { label: 'Source',      ok: hasSource, val: hasSource ? `${beatCount || '?'} beat` : 'yok' },
              { label: 'Proof',       ok: hasScenes && proofPass, val: hasScenes ? (proofPass ? 'PASS' : 'pending') : '—' },
            ].map(({ label, ok, val }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 9 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: ok ? '#4ade80' : 'rgba(255,255,255,0.18)',
                  boxShadow: ok ? '0 0 7px #4ade8066' : 'none',
                  transition: 'background 0.3s, box-shadow 0.3s',
                }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', minWidth: 64 }}>{label}</span>
                <span style={{ color: ok ? '#4ade80' : 'rgba(255,255,255,0.22)', fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
