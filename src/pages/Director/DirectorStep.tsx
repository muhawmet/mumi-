import { useMemo } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { Button, Field, Panel, inputStyle, selectStyle } from '../../components/Layout/PanelKit';
import { DATA } from '../../core/pure';
import {
  PHASE0_DESIGN,
  PHASE0_VIDEO,
  buildDirectorMandate,
  directorChoiceMap,
  directorDefaultSets,
  type Phase0Preset,
  type Phase0PresetSets,
} from '../../data/presets';
import { useStudioStore, type StudioState } from '../../store/useStudioStore';

const ALL_PRESETS = [...PHASE0_VIDEO, ...PHASE0_DESIGN];
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
  const {
    phase0PresetId,
    directorChoices,
    directorBrief,
    projectClass,
    selectedWorldId,
    selectedPaletteId,
    selectedRefIds,
    sceneCount,
    setField,
    setCurrentStep,
    applyPreset,
    setActivePreviewRefId,
  } = useStudioStore();

  const preset = useMemo<Phase0Preset | undefined>(
    () => ALL_PRESETS.find((item) => item.id === phase0PresetId),
    [phase0PresetId],
  );
  const selectedWorld = DATA.worlds.find((world) => world.id === selectedWorldId);
  const selectedPalette = DATA.palettes.find((palette) => palette.id === selectedPaletteId);
  const selectedRefs = resolveRefs(selectedRefIds || []);

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
    applyPreset({ ...preset.sets, ...directorDefaultSets(preset), projectKind: preset.kind, directorBrief: buildDirectorMandate(preset, defaults) });
    setField('directorChoices', defaults);
    setField('phase0PresetId', preset.id);
  };

  const setRefPack = (value: string) => {
    const refIds = value.split(',').filter(Boolean).slice(0, 3);
    setField('selectedRefIds', refIds);
    setActivePreviewRefId(refIds[0] || '');
    refreshMandate();
  };

  if (!preset) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 920 }}>
        <header>
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700 }}>STAGE 2 · YÖNETMEN</div>
          <h1 style={{ fontSize: 38, margin: '8px 0 4px', fontWeight: 700, letterSpacing: -0.5 }}>Önce bir yol seç</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Bu ekran Phase 0 preset'ine göre açılır. Brief'e dönüp bir başlangıç seçince path kararları burada görünür.
          </p>
        </header>
        <Panel>
          <Button onClick={() => setCurrentStep('dashboard')}>
            <ArrowLeft size={15} /> Brief'e dön
          </Button>
        </Panel>
      </div>
    );
  }

  return (
    <div className="director-step" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1120 }}>
      <header>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700 }}>
          STAGE 2 · {preset.directorPanel.eyebrow}
        </div>
        <h1 style={{ fontSize: 38, margin: '8px 0 4px', fontWeight: 700, letterSpacing: -0.5 }}>
          {preset.label} karar masası
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 760 }}>
          {preset.directorPanel.thesis}
        </p>
      </header>

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
          <Field label="World">
            <select
              aria-label="World"
              data-testid="director-world"
              style={selectStyle}
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
              max={20}
              style={inputStyle}
              value={sceneCount}
              onChange={(event) => setField('sceneCount', Math.max(1, Math.min(20, Number(event.target.value) || 1)))}
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

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          {[
            ['World', selectedWorld?.name || '—'],
            ['Palet', selectedPalette?.name || '—'],
            ['Ref DNA', selectedRefs.map((ref) => ref?.name).join(' + ') || '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: 12, borderRadius: 10, border: '1px solid var(--line2)', background: 'rgba(0,0,0,.18)', minWidth: 0 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
              <div style={{ color: '#fff', fontSize: 12.5, marginTop: 6, lineHeight: 1.35, overflowWrap: 'anywhere' }}>{value}</div>
            </div>
          ))}
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
        <Button onClick={() => setCurrentStep('recipe')}>
          Reçeteye geç <ArrowRight size={15} />
        </Button>
      </div>
    </div>
  );
};
