import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DATA, paletteColors } from '../core/pure';
import { PresetPlate } from './PresetPlate';
import { PaintedPlate } from './PaintedPlate';
import { Button } from './Layout/PanelKit';
import type { Phase0Preset } from '../data/presets';

/* =============================================================
   ArchetypeSlate — Phase 0 "Karar Dosyası"
   Yönetmen 8 eş kart duvarından seçmez; arketipleri çevirir ve
   her birinin onu NEYE bağladığını okur. Sol: hiyerarşik ray
   (Mami'nin günlük hattı önde). Sağ: canlı sonuç dosyası —
   tek tıkın kilitleyeceği GERÇEK reçete verisi.
   SALT GÖRÜNÜM: karar akışı (onPreset → director) aynen;
   hex sadece plaka/dossier'de yaşar, prompt yoluna girmez.
   ============================================================= */

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

interface PlateRecipe {
  world?: (typeof DATA.worlds)[number];
  palette?: (typeof DATA.palettes)[number];
  colors: [string, string, string, string];
  worldShort: string;
  signature: string;      // preset'i AYIRAN etiket (benzersiz ref > benzersiz class > label)
  signatureRefNames: string[];
  seed: number;           // deterministik kompozisyon tohumu (plateArt)
  sunX: number;           // % — preset'e özgü kompozisyon tohumu
  horizon: number;        // %
}

/** Preset'i diğerlerinden ayıran imza: base-set ref'leri içinde başka hiçbir
 *  preset'te geçmeyen ilki; yoksa benzersiz class; o da yoksa preset adı.
 *  (4 preset aynı world'ü kilitliyor — world adı plakayı AYIRAMAZ, veri bunu söylüyor.) */
function signatureFor(preset: Phase0Preset, all: Phase0Preset[]): string {
  const others = all.filter((p) => p.id !== preset.id);
  const otherRefs = new Set(others.flatMap((p) => p.sets.selectedRefIds ?? []));
  const uniqueRef = (preset.sets.selectedRefIds ?? []).find((id) => !otherRefs.has(id));
  if (uniqueRef) {
    const ref = DATA.refs.find((r) => r.id === uniqueRef);
    if (ref) return ref.name;
  }
  const cls = preset.sets.projectClass ?? '';
  const clsUnique = cls && !others.some((p) => p.sets.projectClass === cls);
  if (clsUnique) {
    // "DOCUMENTARY_REALISM" → "Documentary Realism" — Title Case ref adlarıyla aynı registerde
    return cls.toLowerCase().split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  return preset.label;
}

export function plateRecipe(preset: Phase0Preset, all: Phase0Preset[]): PlateRecipe {
  const world = DATA.worlds.find((w) => w.id === preset.sets.selectedWorldId);
  const palette = DATA.palettes.find((pl) => pl.id === preset.sets.selectedPaletteId);
  const raw = paletteColors(palette, world);
  const colors: [string, string, string, string] =
    raw.length >= 4
      ? [raw[0], raw[1], raw[2], raw[3]]
      : ['#241a10', '#45311d', '#d6a84f', '#ffe6a3'];
  const h = hashSeed(preset.id);
  return {
    world,
    palette,
    colors,
    worldShort: world ? (world.name.split('—')[1]?.trim() || world.name) : '—',
    signature: signatureFor(preset, all),
    signatureRefNames: (preset.sets.selectedRefIds ?? [])
      .map((id) => DATA.refs.find((r) => r.id === id)?.name)
      .filter((n): n is string => Boolean(n)),
    seed: h,
    sunX: 18 + (h % 63),                 // 18–80%: her arketipin güneşi kendi yerinde
    horizon: 52 + ((h >>> 5) % 15),      // 52–66%: ufuk da öyle
  };
}

/** Işık plakası — world'ün palette_lock ışığı + preset'e özgü kompozisyon.
 *  Boyama gövdesi paylaşılan PaintedPlate'te (Reçete dünya listesi de aynı fırça). */
export const LightPlate: React.FC<{
  recipe: PlateRecipe;
  height: number;
  tag?: string;
  radius?: number;
}> = ({ recipe, height, tag, radius = 7 }) => (
  <PaintedPlate
    colors={recipe.colors}
    seed={recipe.seed}
    sunX={recipe.sunX}
    horizon={recipe.horizon}
    height={height}
    tag={tag}
    radius={radius}
  />
);

/* — dossier satırı — */
const DossierRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr)', gap: 10, alignItems: 'baseline' }}>
    <span style={{ fontSize: 9, letterSpacing: 1.4, color: 'var(--m2-muted)', fontFamily: 'var(--m2-font-mono)', fontWeight: 700 }}>{label}</span>
    <span style={{ fontSize: 12, color: 'var(--m2-paper)', minWidth: 0 }}>{children}</span>
  </div>
);

interface ArchetypeSlateProps {
  presets: Phase0Preset[];
  lockedId: string;
  onPick: (preset: Phase0Preset) => void;
  /** Kilitli preset'e "dön" — reçeteyi ezmeden Yönetmen adımına navigasyon. */
  onReturn: () => void;
}

/** Mami'nin günlük hattı: gerçek iş reklam + eğitim ağırlıklı — veri hiyerarşisi. */
const FEATURED_IDS = ['product_brand', 'edu_explainer'];

export const ArchetypeSlate: React.FC<ArchetypeSlateProps> = ({ presets, lockedId, onPick, onReturn }) => {
  const [armedId, setArmedId] = React.useState<string>('');
  const recipes = React.useMemo(
    () => new Map(presets.map((p) => [p.id, plateRecipe(p, presets)])),
    [presets],
  );
  const armed = presets.find((p) => p.id === (armedId || lockedId)) ?? presets[0];
  const armedRecipe = recipes.get(armed.id)!;
  const isLockedArmed = Boolean(lockedId) && armed.id === lockedId;
  const featured = presets.filter((p) => FEATURED_IDS.includes(p.id));
  const archive = presets.filter((p) => !FEATURED_IDS.includes(p.id));

  const renderRow = (p: Phase0Preset, big: boolean) => {
    const r = recipes.get(p.id)!;
    const isLocked = p.id === lockedId;
    const isArmed = p.id === armed.id;
    return (
      <motion.button
        key={p.id}
        onClick={() => onPick(p)}
        onMouseEnter={() => setArmedId(p.id)}
        onFocus={() => setArmedId(p.id)}
        whileHover={{ backgroundColor: 'rgba(64,45,27,0.5)' }}
        style={{
          display: 'grid',
          gridTemplateColumns: big ? '104px minmax(0,1fr)' : '72px minmax(0,1fr)',
          gap: 12, alignItems: 'center',
          padding: big ? '10px 12px' : '7px 10px',
          borderRadius: 10, textAlign: 'left', cursor: 'pointer',
          border: `1px solid ${isLocked ? 'var(--m2-amber)' : isArmed ? 'var(--m2-line-strong)' : 'var(--m2-line)'}`,
          background: isLocked ? 'rgba(64,45,27,0.55)' : isArmed ? 'rgba(43,29,16,0.55)' : 'rgba(32,21,11,0.38)',
          color: 'var(--m2-paper)', position: 'relative', overflow: 'hidden',
          boxShadow: isArmed && !isLocked ? 'inset 2px 0 0 var(--m2-amber-soft)' : undefined,
        }}
      >
        {isLocked && (
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 2, background: 'var(--m2-amber)' }} />
        )}
        <LightPlate recipe={r} height={big ? 58 : 40} radius={6} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: big ? 13.5 : 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.label}</span>
            {isLocked && <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: 1.2, color: 'var(--m2-amber)', fontFamily: 'var(--m2-font-mono)', flexShrink: 0 }}>KİLİTLİ</span>}
          </div>
          <div style={{
            fontSize: big ? 11 : 10, color: 'var(--m2-muted)', marginTop: 3, lineHeight: 1.35,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: big ? 'normal' : 'nowrap',
          }}>
            {big ? p.desc : r.signature}
          </div>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="phase0-slate" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 316px', gap: 20, alignItems: 'start' }}>
      {/* — SOL: arketip rayı (hiyerarşi veriden: günlük hat üstte, arşiv altta) — */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <div className="ml-v3-eyebrow" style={{ margin: '0 0 2px' }}>GÜNLÜK HAT — REKLAM &amp; EĞİTİM</div>
        {featured.map((p) => renderRow(p, true))}
        <div className="ml-v3-eyebrow" style={{ margin: '12px 0 2px' }}>SET ARŞİVİ</div>
        {archive.map((p) => renderRow(p, false))}
      </div>

      {/* — SAĞ: karar dosyası — seçimin SONUCU, hover'la canlı — */}
      <div
        aria-live="polite"
        style={{
          border: `1px solid ${isLockedArmed ? 'var(--m2-amber)' : 'var(--m2-line-strong)'}`,
          borderRadius: 12, padding: 14,
          background: 'linear-gradient(178deg, rgba(24,15,8,0.72), rgba(16,10,5,0.66))',
          boxShadow: 'inset 0 1px 0 rgba(255,214,130,0.12), 0 18px 40px -24px rgba(0,0,0,0.8)',
          position: 'sticky', top: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 9.5, letterSpacing: 2, fontWeight: 800, fontFamily: 'var(--m2-font-mono)', color: isLockedArmed ? 'var(--m2-amber)' : 'var(--m2-muted)' }}>
            {isLockedArmed ? 'KİLİTLİ REÇETE' : 'BU TIK NEYİ KİLİTLER'}
          </span>
          <span style={{ fontSize: 9.5, fontFamily: 'var(--m2-font-mono)', color: 'var(--m2-muted)' }}>
            {armed.sets.sceneCount ?? '—'} SAHNE
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={armed.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <PresetPlate
              presetId={armed.id}
              height={104}
              fallback={<LightPlate recipe={armedRecipe} height={104} tag={armedRecipe.worldShort} radius={8} />}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
              <DossierRow label="SINIF">
                <span style={{ fontFamily: 'var(--m2-font-mono)', fontSize: 11, color: 'var(--m2-amber)', fontWeight: 700 }}>
                  {(armed.sets.projectClass ?? '—').replace(/_/g, ' ')}
                </span>
              </DossierRow>
              <DossierRow label="DÜNYA">{armedRecipe.world?.name ?? '—'}</DossierRow>
              <DossierRow label="PALET">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {armedRecipe.colors.map((c, i) => (
                    <span key={i} style={{ width: 11, height: 11, borderRadius: 3, background: c, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)', flexShrink: 0 }} />
                  ))}
                  <span style={{ fontSize: 11, color: 'var(--m2-muted)' }}>{armedRecipe.palette?.name ?? 'Native — World Default'}</span>
                </span>
              </DossierRow>
              <DossierRow label="REF DNA">
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {armedRecipe.signatureRefNames.map((n) => (
                    <span key={n} style={{ fontSize: 11.5, lineHeight: 1.3, display: 'flex', gap: 6, alignItems: 'baseline' }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--m2-amber)', flexShrink: 0, transform: 'translateY(-2px)' }} />
                      {n}
                    </span>
                  ))}
                </span>
              </DossierRow>
            </div>

            {/* Yönetmen tezi — bu seçim bir MANDATE kurar, dekor değil */}
            <div style={{
              marginTop: 12, paddingTop: 11, borderTop: '1px solid var(--m2-line)',
              fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12.5,
              lineHeight: 1.5, color: 'var(--text-soft)',
            }}>
              “{armed.directorPanel.thesis}”
            </div>

            <div style={{ marginTop: 11, fontSize: 10.5, color: 'var(--m2-muted)', lineHeight: 1.5 }}>
              Tek tık reçeteyi kilitler → Yönetmen adımında{' '}
              <strong style={{ color: 'var(--m2-paper)' }}>{armed.directorPanel.groups.length} karar</strong> seni bekler:{' '}
              {armed.directorPanel.groups.map((g) => g.label).join(' · ')}.
            </div>

            <Button
              variant="solid"
              onClick={() => (isLockedArmed ? onReturn() : onPick(armed))}
              style={{ width: '100%', marginTop: 12 }}
            >
              {isLockedArmed ? 'Yönetmen\'e dön →' : 'Bu reçeteyle kur → Yönetmen'}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
