import { useMemo } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { Button, Field, Panel, inputStyle, selectStyle } from '../../components/Layout/PanelKit';
import { DATA } from '../../core/pure';
import {
  PHASE0_VIDEO,
  buildDirectorMandate,
  directorChoiceMap,
  directorDefaultSets,
  type Phase0Preset,
  type Phase0PresetSets,
} from '../../data/presets';
import { useStudioStore, type StudioState, type VoSyncMode, type OsTextMode } from '../../store/useStudioStore';
import { stageNumber } from '../../components/Layout/AppLayout';

const ALL_PRESETS = PHASE0_VIDEO;
/** Başlık arketip SAYISINI veriden söyler — "sekiz yol" gibi gömülü sayı preset
 *  eklenince bayatlıyordu (8→10 çürümesi). 12'yi aşarsa rakama düşer. */
const COUNT_TR = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on', 'on bir', 'on iki'] as const;
const PRESET_COUNT_TR = COUNT_TR[ALL_PRESETS.length] ?? String(ALL_PRESETS.length);
const SET_FIELDS = [
  'projectClass',
  'selectedWorldId',
  'selectedRefIds',
  'selectedPaletteId',
  'selectedPropId',
  'sceneCount',
  'cast',
  'mood',
  'cameraEnergy',
  'timeLight',
  'transition',
  'musicVibe',
  'pov',
  'signature',
  'leitmotif',
  'tempoCurve',
] satisfies Array<keyof Phase0PresetSets>;

function applyDirectorSets(
  sets: Phase0PresetSets,
  setField: StudioState['setField'],
  applyPreset?: StudioState['applyPreset'],
) {
  if (sets.projectClass || sets.selectedWorldId) {
    applyPreset?.(sets as Partial<StudioState>);
    return;
  }

  SET_FIELDS.forEach((field) => {
    if (sets[field] !== undefined) {
      setField(field as keyof StudioState, sets[field] as never);
    }
  });
}

function resolveRefs(refIds: string[]) {
  return refIds.map((id) => DATA.refs.find((ref) => ref.id === id)).filter(Boolean);
}

export const DirectorStep = () => {
  const studioState = useStudioStore();
  const {
    phase0PresetId,
    directorChoices,
    directorBrief,
    projectClass,
    selectedWorldId,
    selectedPaletteId,
    selectedRefIds,
    sceneCount,
    imageModel,
    videoModel,
    setField,
    setCurrentStep,
    advance,
    applyPreset,
    setActivePreviewRefId,
    voSyncMode,
    osTextMode,
  } = studioState;

  const preset = useMemo<Phase0Preset | undefined>(
    () => ALL_PRESETS.find((item) => item.id === phase0PresetId),
    [phase0PresetId],
  );
  const selectedWorld = DATA.worlds.find((world) => world.id === selectedWorldId);
  const selectedPalette = DATA.palettes.find((palette) => palette.id === selectedPaletteId);
  const selectedRefs = resolveRefs(selectedRefIds || []);
  const activeDecisionRows = preset?.directorPanel.groups.map((group) => {
    const choiceId = directorChoices[group.id] || group.defaultChoiceId;
    const choice = group.choices.find((item) => item.id === choiceId) || group.choices[0];
    return {
      id: group.id,
      label: group.label,
      value: choice?.label || '—',
      desc: choice?.desc || '',
    };
  }) || [];

  const refreshMandate = (nextChoices = directorChoices, activePreset = preset) => {
    if (!activePreset) return;
    setField('directorBrief', buildDirectorMandate(activePreset, nextChoices));
  };

  const choose = (groupId: string, choiceId: string) => {
    if (!preset) return;
    const group = preset.directorPanel.groups.find((item) => item.id === groupId);
    const choice = group?.choices.find((item) => item.id === choiceId);
    if (!choice) return;
    const nextChoices = { ...directorChoices, [groupId]: choiceId };
    setField('directorChoices', nextChoices);
    applyDirectorSets(choice.sets, setField, applyPreset);
    setField('directorBrief', buildDirectorMandate(preset, nextChoices));
  };

  const resetToPreset = () => {
    if (!preset) return;
    const defaults = directorChoiceMap(preset);
    applyPreset({ ...preset.sets, ...directorDefaultSets(preset), directorBrief: buildDirectorMandate(preset, defaults) });
    setField('directorChoices', defaults);
    setField('phase0PresetId', preset.id);
  };

  const setRefPack = (value: string) => {
    const refIds = value.split(',').filter(Boolean).slice(0, 3);
    setField('selectedRefIds', refIds);
    setActivePreviewRefId(refIds[0] || '');
    refreshMandate();
  };

  const pickPreset = (p: Phase0Preset) => {
    const defaults = directorChoiceMap(p);
    applyPreset({ ...p.sets, ...directorDefaultSets(p), directorBrief: buildDirectorMandate(p, defaults) });
    setField('directorChoices', defaults);
    setField('phase0PresetId', p.id);
  };

  if (!preset) {
    // Never a bare void, and never an overlapping fan: the Phase-0 archetypes
    // lie on the table as an ORDERLY deck — a clean grid, full titles, no cut
    // text. The freeform Brief path is the final card, not a "+N" stub.
    return (
      <div className="director-empty" style={{ display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 1160, padding: '4px 0 34px' }}>
        <header>
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700 }}>STAGE {stageNumber('director', { phase0PresetId, currentStep: 'director' })} · YÖNETMEN</div>
          <h1 style={{ fontSize: 38, margin: '8px 0 4px', fontWeight: 500, letterSpacing: '0.005em', fontFamily: 'var(--font-serif)' }}>Karar masasında {PRESET_COUNT_TR} yol serili</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 760 }}>
            Bir arketip seç — kart, dünyayı, paleti ve referans DNA'sını karar masasına açar. Ham başlamak istersen son kart seni Brief'e döndürür.
          </p>
        </header>
        <div className="ml-v3-deck">
          {ALL_PRESETS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => pickPreset(p)}
              className="ml-v3-deck-card"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <span className="ml-v3-deck-kicker">{p.directorPanel.eyebrow}</span>
              <span className="ml-v3-deck-title">{p.label}</span>
              <span className="ml-v3-deck-thesis">{p.directorPanel.thesis}</span>
              <span className="ml-v3-deck-cta">
                Karar masasını aç <ArrowRight size={13} />
              </span>
            </button>
          ))}
          <button
            onClick={() => setCurrentStep('dashboard')}
            className="ml-v3-deck-card ml-v3-deck-free"
            style={{ animationDelay: `${ALL_PRESETS.length * 45}ms` }}
          >
            <span className="ml-v3-deck-kicker">SERBEST YOL</span>
            <span className="ml-v3-deck-title">Kendi brief'inle başla</span>
            <span className="ml-v3-deck-thesis">
              Arketipe bağlı kalmadan konuyu Brief'te ham gir; dünya, palet ve DNA'yı elle kur. Tüm yollar orada.
            </span>
            <span className="ml-v3-deck-cta">
              <ArrowLeft size={13} /> Brief'e dön
            </span>
          </button>
        </div>

        {/* Grid altındaki ölü boşluğu kompozisyona kat: seçim öncesi bağlam bandı */}
        <div className="director-deck-context">
          <span className="director-deck-context-kicker">SONRAKİ HAMLE</span>
          <p>
            Bir kart seç — dünya, palet ve referans DNA karar masasına hazır açılır; sonra Reçete'de tek tek
            ince ayar yaparsın. Hazır bir yol yoksa <strong>Serbest Yol</strong> seni Brief'e döndürür.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="director-step" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1460 }}>
      <header>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700 }}>
          STAGE {stageNumber('director', { phase0PresetId, currentStep: 'director' })} · {preset.directorPanel.eyebrow}
        </div>
        <h1 style={{ fontSize: 38, margin: '8px 0 4px', fontWeight: 500, letterSpacing: '0.005em', fontFamily: 'var(--font-serif)' }}>
          {preset.label} karar masası
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 760 }}>
          {preset.directorPanel.thesis}
        </p>
      </header>

      <div
        className="director-workspace"
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 320px)', gap: 18, alignItems: 'start' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          <Panel
            title="Path kararları"
            subtitle="Bu menü seçili Phase 0 yoluna aittir; seçenekler final brief ve prompt beynine mandate olarak taşınır."
            aside={
              <Button variant="ghost" onClick={resetToPreset} style={{ padding: '9px 13px', fontSize: 12 }}>
                <RotateCcw size={14} /> Default'a dön
              </Button>
            }
          >
            <div style={{ display: 'grid', gap: 18 }}>
              {preset.directorPanel.groups.map((group) => (
                <section key={group.id} style={{ display: 'grid', gap: 10 }}>
                  <div>
                    <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 800 }}>{group.label}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>{group.desc}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
                    {group.choices.map((choice) => {
                      const active = (directorChoices[group.id] || group.defaultChoiceId) === choice.id;
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => choose(group.id, choice.id)}
                          style={{
                            minHeight: 116,
                            padding: '14px 14px',
                            borderRadius: 'var(--r-md)',
                            border: `1px solid ${active ? 'var(--goldline)' : 'var(--line2)'}`,
                            background: active ? 'var(--goldsoft)' : 'rgba(255,255,255,0.025)',
                            color: 'var(--text)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 9,
                            boxShadow: active ? '0 10px 26px -18px var(--goldglow)' : 'none',
                          }}
                        >
                          <span style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: active ? 'var(--gold-hi)' : 'var(--text-soft)' }}>
                              {choice.label}
                            </span>
                            {active && <Check size={15} color="var(--gold)" strokeWidth={3} />}
                          </span>
                          <span style={{ fontSize: 11.5, lineHeight: 1.45, color: 'var(--text-muted)' }}>{choice.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </Panel>

          <Panel title="Canlı ince ayar" subtitle="Path kararını bozmadan dünya, palet, referans paketi ve sahne sayısını burada netleştir.">
            <div className="dashboard-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <Field label="Production path">
                <select
                  aria-label="Production path"
                  data-testid="director-project-class"
                  style={selectStyle}
                  value={projectClass}
                  onChange={(event) => setField('projectClass', event.target.value)}
                >
                  {DATA.paths.map((path) => (
                    <option key={path.id} value={path.id} style={{ background: '#0d1018' }}>
                      {path.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div style={{ minWidth: 0 }}>
                <Field label="World">
                  <select
                    aria-label="World"
                    data-testid="director-world"
                    style={{ ...selectStyle, width: '100%', minWidth: 0 }}
                    value={selectedWorldId}
                    onChange={(event) => setField('selectedWorldId', event.target.value)}
                  >
                    {DATA.worlds.map((world) => (
                      <option key={world.id} value={world.id} style={{ background: '#0d1018' }}>
                        {world.group} · {world.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Palet">
                <select
                  aria-label="Palet"
                  data-testid="director-palette"
                  style={selectStyle}
                  value={selectedPaletteId}
                  onChange={(event) => setField('selectedPaletteId', event.target.value)}
                >
                  <option value="" style={{ background: '#0d1018' }}>Palet seç</option>
                  {DATA.palettes.map((palette) => (
                    <option key={palette.id} value={palette.id} style={{ background: '#0d1018' }}>
                      {palette.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Sahne sayısı" hint="1-20">
                <input
                  type="number"
                  min={1}
                  max={60}
                  style={inputStyle}
                  value={sceneCount}
                  onChange={(event) => setField('sceneCount', Math.max(1, Math.min(60, Number(event.target.value) || 1)))}
                />
              </Field>
              <Field label="Referans paketi" hint="En fazla 3 DNA. Reçete adımında tek tek cerrahi seçim devam ediyor.">
                <select
                  aria-label="Referans paketi"
                  data-testid="director-ref-pack"
                  style={selectStyle}
                  value={(selectedRefIds || []).join(',')}
                  onChange={(event) => setRefPack(event.target.value)}
                >
                  <option value="" style={{ background: '#0d1018' }}>DNA paketi seç</option>
                  {preset.directorPanel.groups.flatMap((group) => (
                    group.choices.flatMap((choice) => (
                      choice.sets.selectedRefIds?.length
                        ? [(
                          <option key={`${group.id}:${choice.id}`} value={choice.sets.selectedRefIds.join(',')} style={{ background: '#0d1018' }}>
                            {group.label} · {choice.label}
                          </option>
                        )]
                        : []
                    ))
                  ))}
                </select>
              </Field>
            </div>
            <p style={{ marginTop: 14, fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.45 }}>
              Seçili dünya, palet ve DNA özeti sağdaki <strong style={{ color: 'var(--text-muted)' }}>Karar Kaydı</strong>'nda canlı tutulur.
            </p>
          </Panel>

          <Panel title="Pipeline modelleri" subtitle="Image ve motion için aktif frontier model — brief output'una yansır.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <Field label="Image model">
                <select style={selectStyle} value={imageModel} onChange={(e) => setField('imageModel', e.target.value)}>
                  <option value="flux_1_1_pro" style={{ background: '#0d1018' }}>FLUX.1.1 Pro</option>
                  <option value="nano_banana_2" style={{ background: '#0d1018' }}>Nano Banana 2</option>
                  <option value="dall_e_3" style={{ background: '#0d1018' }}>DALL-E 3</option>
                  <option value="imagen_4" style={{ background: '#0d1018' }}>Imagen 4</option>
                  <option value="ideogram_3" style={{ background: '#0d1018' }}>Ideogram 3</option>
                  <option value="firefly_4" style={{ background: '#0d1018' }}>Adobe Firefly 4</option>
                </select>
              </Field>
              <Field label="Motion (i2v) model">
                <select style={selectStyle} value={videoModel} onChange={(e) => setField('videoModel', e.target.value)}>
                  <option value="kling_3" style={{ background: '#0d1018' }}>Kling 3.0 — 10s pencere</option>
                  <option value="kling_3_turbo" style={{ background: '#0d1018' }}>Kling 3.0 Turbo — 10s</option>
                  <option value="kling_o3" style={{ background: '#0d1018' }}>Kling O3 — 12s pencere</option>
                  <option value="runway_gen4" style={{ background: '#0d1018' }}>Runway Gen-4 — 14s</option>
                  <option value="runway_gen4_5" style={{ background: '#0d1018' }}>Runway Gen-4.5 — 14s</option>
                  <option value="veo_3" style={{ background: '#0d1018' }}>Veo 3 — 10s</option>
                  <option value="veo_3_1" style={{ background: '#0d1018' }}>Veo 3.1 — 10s</option>
                  <option value="pika_2_2" style={{ background: '#0d1018' }}>Pika 2.2 — 10s</option>
                  <option value="hailuo_2" style={{ background: '#0d1018' }}>Hailuo 2 — 10s</option>
                </select>
              </Field>
            </div>
          </Panel>

          <Panel title="Pedagoji Kilitleri" subtitle="VO-görsel senkron ve ekran metni — agent brief'e yansır.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <Field label="VO-Görsel Senkron">
                <select
                  style={selectStyle}
                  value={voSyncMode}
                  onChange={(e) => setField('voSyncMode', e.target.value as VoSyncMode)}
                >
                  <option value="FREE" style={{ background: '#0d1018' }}>FREE — Agent serbest metafor seçer</option>
                  <option value="LOCKED" style={{ background: '#0d1018' }}>LOCKED — Görsel VO'yu birebir gösterir</option>
                </select>
                {voSyncMode === 'LOCKED' && (
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--gold)', lineHeight: 1.4 }}>
                    ⚠ Her sahne görseli narasyonla birebir örtüşmeli — metafor yasak.
                  </div>
                )}
              </Field>
              <Field label="Ekran Metni (AE)">
                <select
                  style={selectStyle}
                  value={osTextMode}
                  onChange={(e) => setField('osTextMode', e.target.value as OsTextMode)}
                >
                  <option value="AUTO" style={{ background: '#0d1018' }}>AUTO — Pedagoji bazlı (önerilen)</option>
                  <option value="DENSE" style={{ background: '#0d1018' }}>DENSE — Her sahneye metin</option>
                  <option value="CLEAN" style={{ background: '#0d1018' }}>CLEAN — Metin yok</option>
                </select>
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {osTextMode === 'AUTO' && 'Intro + Climax + Resolution: anahtar kelime · Build-up: sessiz'}
                  {osTextMode === 'DENSE' && 'Her sahneye 1-3 kelime overlay — AE katman listesine gider.'}
                  {osTextMode === 'CLEAN' && 'Hiç metin yok — görsel anlatıyor.'}
                </div>
              </Field>
            </div>
          </Panel>

          <Panel title="Final brief kaydı" subtitle="Bu metin sahne promptlarına ve agent brief'e gider; seçtiğin kararların izi burada görünür.">
            <div
              style={{
                padding: 14,
                borderRadius: 10,
                border: '1px solid var(--line2)',
                background: 'rgba(0,0,0,.22)',
                color: 'var(--text-soft)',
                fontSize: 12.5,
                lineHeight: 1.6,
              }}
            >
              {directorBrief || buildDirectorMandate(preset, directorChoices)}
            </div>
          </Panel>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <Button variant="ghost" onClick={() => setCurrentStep('dashboard')}>
              <ArrowLeft size={15} /> Brief'e dön
            </Button>
            <Button onClick={() => advance()}>
              Reçeteye geç <ArrowRight size={15} />
            </Button>
          </div>
        </div>

        <aside
          className="director-decision-rail"
          style={{
            position: 'sticky',
            top: 24,
            padding: 16,
            borderRadius: 'var(--r-lg)',
            border: '1px solid var(--line2)',
            background: 'linear-gradient(180deg, rgba(16,16,22,.54), rgba(6,7,11,.32))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.07), 0 18px 46px rgba(0,0,0,.28)',
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: 2.1, color: 'var(--gold)', fontWeight: 900 }}>
            DECISION RECORD
          </div>
          <div style={{ marginTop: 8, color: '#fff', fontSize: 15, fontWeight: 900, lineHeight: 1.25 }}>
            {preset.label}
          </div>
          <div style={{ marginTop: 5, color: 'var(--text-muted)', fontSize: 11.5, lineHeight: 1.45 }}>
            Final brief'e giden aktif yaratıcı kilitler.
          </div>

          <div style={{ display: 'grid', gap: 9, marginTop: 16 }}>
            {activeDecisionRows.map((row) => (
              <div key={row.id} style={{ padding: 11, borderRadius: 10, background: 'rgba(0,0,0,.22)', border: '1px solid var(--line)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 800 }}>
                  {row.label}
                </div>
                <div style={{ marginTop: 4, color: 'var(--gold-hi)', fontSize: 12.5, fontWeight: 850 }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--line2), transparent)', margin: '15px 0' }} />

          <div style={{ display: 'grid', gap: 8 }}>
            {[
              ['World', selectedWorld?.name || '—'],
              ['Palette', selectedPalette?.name || '—'],
              ['Ref DNA', selectedRefs.map((ref) => ref?.name).join(' + ') || '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'grid', gap: 2 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 800 }}>
                  {label}
                </span>
                <span style={{ color: 'var(--text-soft)', fontSize: 11.5, lineHeight: 1.35, overflowWrap: 'anywhere' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

        </aside>
      </div>
    </div>
  );
};
