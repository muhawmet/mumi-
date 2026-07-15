import { useMemo, useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { useStudioStore, recipeReadiness, type SceneNote } from '../../store/useStudioStore';
import { Panel, Field, Button, Chip } from '../../components/Layout/PanelKit';
import { stageNumber } from '../../components/Layout/AppLayout';
import { CanvasPreview } from '../../components/CanvasPreview';
import { DATA, isMaterialCompatibleWithWorld, paletteColors, worldRenderText } from '../../core/pure';
import { downloadFile } from '../../core/exporters';
import { recipeFileName, recipeJsonFileName, registerOf } from '../../core/brain';
import { dnaStrength, refFit, starterPackFor } from '../../core/advisor';
import { WorldLawPanel } from '../../components/WorldLawPanel';
import { RefDnaCards } from '../../components/RefDnaCards';
import { WorldCover } from '../../components/WorldCover';
import { WorldIdentityPlate } from '../../components/WorldIdentityPlate';
import { toPlateColors } from '../../components/PaintedPlate';
import { WORLD_TABS, type WorldTabId } from './recipeTabs';
import { registersFor } from './adRegisters';

// Sıcak nötr aile, belirgin kademeli — neon yasak; tonlar birbirine yakınken çizgi deseni okunmuyordu (T4 yargıç bulgusu)
const MAT_TONES = ['#211a0e', '#4a3d24', '#332916', '#5c4c2e'] as const;
function matSwatchBackground(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  h = h ^ (h >>> 15); // FNV dersi: alt bitler kısa inputta bias'lı, mod'dan önce katla
  const a = MAT_TONES[h % 4];
  const b = MAT_TONES[(h >>> 2) % 4 === h % 4 ? ((h % 4) + 1) % 4 : (h >>> 2) % 4];
  const angle = 30 + (h % 120);
  return `repeating-linear-gradient(${angle}deg, ${a}, ${a} 7px, ${b} 7px, ${b} 14px)`;
}

function textList(value: string): string[] {
  return value.split(/[,\n]+/u).map((item) => item.trim()).filter(Boolean);
}

function listText(value: string[]): string {
  return value.join(', ');
}

function newScene(id: number): SceneNote {
  return {
    id,
    vo: '',
    event: '',
    director_note: '',
    motion_seed: '',
    turkish_labels: [],
    avoid: [],
  };
}

export const RecipeStep = () => {
  const store = useStudioStore();
  const {
    selectedWorldId,
    selectedPropId,
    selectedPaletteId,
    selectedRefIds,
    activePreviewRefId,
    projectClass,
    timeLight,
    cast,
    location,
    subject,
    recipeScenes,
    setField,
    setActivePreviewRefId,
    setCurrentStep,
    advance,
    exportRecipe,
    exportRecipeJson,
  } = store;
  const [activeTab, setActiveTab] = useState<WorldTabId>('ANIMATION');

  const activeGroups = WORLD_TABS.find((tab) => tab.id === activeTab)?.groups || [];
  const worlds = useMemo(
    () => DATA.worlds.filter((world) => activeGroups.includes(world.group as never)),
    [activeGroups],
  );
  /* Denetim şartı (a): world→plaka renkleri BİR KEZ kurulur. map içinde her render'da
     paletteColors çağırmak PaintedPlate'e taze tuple geçiriyordu (39 canvas'lık repaint
     fırtınasının kaynağı) — içerik-anahtarı savunması (PaintedPlate) + bu memo çift kilit. */
  const worldPlateColors = useMemo(
    () => new Map(worlds.map((world) => [world.id, toPlateColors(paletteColors(undefined, world))])),
    [worlds],
  );
  const selectedWorld = DATA.worlds.find((world) => world.id === selectedWorldId);
  const previewWorld = selectedWorld || worlds[0];
  const isPreviewingCandidate = !selectedWorld && Boolean(previewWorld);
  const selectedPalette = DATA.palettes.find((palette) => palette.id === selectedPaletteId);
  const selectedMaterial = DATA.materials.find((material) => material.id === selectedPropId);
  const selectedRefs = selectedRefIds
    .map((id) => DATA.refs.find((ref) => ref.id === id))
    .filter((ref): ref is NonNullable<typeof ref> => Boolean(ref));
  const starterRefs = previewWorld ? starterPackFor(previewWorld.id) : [];
  const sortedRefs = useMemo(
    () => [...DATA.refs].sort((a, b) => refFit(previewWorld, b) - refFit(previewWorld, a) || a.name.localeCompare(b.name)),
    [previewWorld],
  );
  const dna = dnaStrength(selectedRefs, registerOf(projectClass), selectedWorldId);
  const readiness = recipeReadiness({ selectedWorldId, selectedPaletteId, subject, recipeScenes });
  const activeRef = DATA.refs.find((ref) => ref.id === (activePreviewRefId || selectedRefIds[0] || ''));
  const selectedColors = paletteColors(selectedPalette || undefined, previewWorld);
  const filledScenes = recipeScenes.filter((scene) => scene.vo.trim() || scene.event.trim()).length;

  const updateScene = (id: number, patch: Partial<SceneNote>) => {
    setField('recipeScenes', recipeScenes.map((scene) => (scene.id === id ? { ...scene, ...patch } : scene)));
  };

  const addScene = () => {
    const nextId = Math.max(0, ...recipeScenes.map((scene) => scene.id)) + 1;
    setField('recipeScenes', [...recipeScenes, newScene(nextId)]);
  };

  const removeScene = (id: number) => {
    const next = recipeScenes.filter((scene) => scene.id !== id);
    setField('recipeScenes', next.length ? next : [newScene(1)]);
  };

  const setRefs = (ids: string[], activeId?: string) => {
    setField('selectedRefIds', ids);
    setActivePreviewRefId(activeId || ids[0] || '');
  };

  const toggleRef = (id: string) => {
    const selected = selectedRefIds.includes(id);
    const next = selected
      ? selectedRefIds.filter((refId) => refId !== id)
      : [...selectedRefIds, id].slice(0, 3);
    setRefs(next, selected ? next[0] : id);
  };

  const applyStarterPack = () => {
    const ids = starterRefs.slice(0, 3).map((ref) => ref.id);
    setRefs(ids, ids[0]);
  };

  const onDownloadRecipe = () => {
    const md = exportRecipe();
    downloadFile(recipeFileName(subject || 'mamilas'), md, 'text/markdown;charset=utf-8');
  };

  const onDownloadRecipeJson = () => {
    downloadFile(recipeJsonFileName(subject || 'mamilas'), exportRecipeJson(), 'application/json');
  };

  return (
    <div className="recipe-step recipe-step-v2">
      <header className="recipe-header">
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--m2-amber)', fontWeight: 700 }}>STAGE {stageNumber('recipe', { phase0PresetId: store.phase0PresetId, currentStep: 'recipe' })} · REÇETE</div>
          <h1 className="recipe-header-title">Reçete Oluşturucu</h1>
          <p style={{ color: 'var(--m2-muted)', fontSize: 15, margin: '8px 0 0' }}>
            Site prompt üretmez; world, materyal, palet ve sahne notlarından ajana verilecek `.md` reçeteyi çıkarır.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Buton hiyerarşisi: tek primary (solid altın) = ilerleme aksiyonu;
              indirme/geri-dön işleri ghost. Her tıklanabilir öğe buton gibi görünür. */}
          <Button variant="ghost" onClick={() => setCurrentStep('dashboard')}><span style={{ whiteSpace: 'nowrap' }}><span lang="en">Brief</span>'e dön</span></Button>
          <Button variant="ghost" onClick={onDownloadRecipe} disabled={!readiness.ready} data-testid="download-recipe">
            <Download size={16} /> Reçeteyi İndir
          </Button>
          <Button variant="ghost" onClick={onDownloadRecipeJson} disabled={!readiness.ready} data-testid="download-recipe-json">
            JSON İndir
          </Button>
          <Button variant="solid" onClick={() => advance()} disabled={!readiness.ready}>Sahneler'e geç →</Button>
        </div>
      </header>

      <section className="recipe-command-strip">
        <div>
          <span>WORLD</span>
          <strong>{selectedWorld?.name || 'Dünya bekliyor'}</strong>
        </div>
        <div>
          <span>PALET</span>
          <strong>{selectedPalette?.name || 'Palet bekliyor'}</strong>
        </div>
        <div>
          <span>DNA</span>
          <strong>{selectedRefIds.length}/3 kilit</strong>
        </div>
        <div>
          <span>SCENES</span>
          <strong>{filledScenes}/{recipeScenes.length} dolu</strong>
        </div>
      </section>

      <Panel title="World Master Detail" subtitle={`${DATA.worlds.length} world · karar önce, teknik kanıt sonra`}>
        <div className="recipe-world-tabs">
          {WORLD_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`recipe-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              {/* İngilizce sekme adları — CSS uppercase noktalı İ basmasın (ANİMATİON/CİNEMATİC değil) */}
              <span lang="en">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="recipe-world-grid">
          <div className="recipe-world-list">
            {worlds.map((world) => {
              const active = selectedWorldId === world.id;
              const candidate = isPreviewingCandidate && previewWorld?.id === world.id;
              const plateColors = worldPlateColors.get(world.id) ?? toPlateColors([]);
              return (
                <button
                  key={world.id}
                  type="button"
                  onClick={() => setField('selectedWorldId', world.id)}
                  className={`recipe-world-button ${active ? 'active' : ''} ${candidate ? 'candidate' : ''}`}
                >
                  <WorldCover
                    worldId={world.id}
                    height={64}
                    /* kapak webp'i gelene dek dünyanın KENDİ görsel yasası —
                       46 dünya 46 ayrı plaka (worldPlateArt), ortak deniz-günbatımı motifi yok */
                    fallback={<WorldIdentityPlate worldId={world.id} colors={plateColors} height={64} radius={4} />}
                  />
                  <span>
                    <strong style={{ display: 'block', fontSize: 13 }}>{world.name}</strong>
                    <span style={{ color: 'var(--m2-muted)', fontSize: 11 }}>{world.id}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="recipe-world-detail">
            <div style={{ height: 220, position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
              {previewWorld ? (
                <WorldCover
                  worldId={previewWorld.id}
                  height={220}
                  fallback={
                    /* Grup-arketip fotoğrafı EMEKLİ: 46 dünya 4 fotoğrafa düşüyordu (ukiyo-e'ye
                       dedektif kartı). Kapak gelene dek dünyanın KENDİ görsel yasası konuşur. */
                    <WorldIdentityPlate
                      worldId={previewWorld.id}
                      height={220}
                      tag={activeRef ? `${activeRef.cat} · ${activeRef.anchor || activeRef.id}` : previewWorld.group}
                    />
                  }
                />
              ) : (
                <CanvasPreview
                  colors={selectedColors}
                  category={activeTab === 'REAL' || activeTab === 'COMMERCIAL' ? 'real' : activeTab === 'STYLIZED' ? 'anime' : 'edu'}
                  previewType={activeRef?.preview || 'default'}
                  worldId=""
                  refId={activeRef?.id}
                  variant="hero"
                  evidenceLabel={activeRef ? `${activeRef.cat} · ${activeRef.anchor || activeRef.id}` : undefined}
                />
              )}
            </div>
            <div style={{ paddingTop: 18, display: 'grid', gap: 12 }}>
              <div>
                <div style={{ color: 'var(--m2-amber)', fontSize: 11, fontWeight: 900, letterSpacing: 1.6 }}>
                  {previewWorld?.group || 'WORLD'} {isPreviewingCandidate ? '· CANDIDATE' : ''}
                </div>
                <h2 style={{ margin: '4px 0 0', fontSize: 26, fontFamily: 'var(--font-serif)', fontWeight: 500, letterSpacing: '0.005em', color: 'var(--m2-paper)' }}>{previewWorld?.name || 'Dünya seçilmedi'}</h2>
              </div>
              {/* Künye: gri paragrafa erimesin — kimlik satırı olarak amber kenarlı (T4 yargıç bulgusu) */}
              <p className="recipe-world-render-text" style={{ margin: 0, color: 'rgba(242,238,230,0.88)', lineHeight: 1.55, fontSize: 13.5, borderLeft: '2px solid var(--m2-amber)', paddingLeft: 12 }}>
                {previewWorld ? (previewWorld.one_liner || worldRenderText(previewWorld).slice(0, 160)) : 'Bir world seç.'}
              </p>
              {selectedWorld && registersFor(selectedWorld.id).length > 0 && (
                <div className="recipe-register" style={{ display: 'grid', gap: 6 }}>
                  <div style={{ color: 'var(--m2-amber)', fontSize: 10.5, fontWeight: 900, letterSpacing: 1.4 }}>
                    REGISTER — ışık rejimi
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {registersFor(selectedWorld.id).map((reg) => {
                      const active = timeLight === reg.timeLight;
                      return (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => setField('timeLight', active ? '' : reg.timeLight)}
                          aria-pressed={active}
                          style={{
                            padding: '5px 11px',
                            borderRadius: 999,
                            fontSize: 12,
                            cursor: 'pointer',
                            border: `1px solid ${active ? 'var(--m2-amber)' : 'rgba(242,238,230,0.22)'}`,
                            background: active ? 'rgba(224,166,60,0.16)' : 'rgba(242,238,230,0.04)',
                            color: active ? 'var(--m2-paper)' : 'rgba(242,238,230,0.78)',
                            fontWeight: active ? 700 : 500,
                          }}
                        >
                          {reg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {isPreviewingCandidate && <p className="recipe-candidate-note">Aday önizleme. Kilitlemek için soldaki world kartına tıkla.</p>}
              {previewWorld && (
                <details className="recipe-world-law-drawer ml-v3-parchment">
                  <summary>TEKNİK KANIT — render law · grammar · negative lock</summary>
                  <WorldLawPanel world={previewWorld} />
                </details>
              )}
            </div>
          </div>
        </div>
      </Panel>

      <details className="recipe-progressive" open>
        <summary>Look Contract · materyal ve palet</summary>
        <div className="recipe-look-grid">
        <Panel title="Materyal" subtitle={`${DATA.materials.length} seçenek · none dahil`} style={{ flex: 1 }}>
          <div className="recipe-material-grid">
            {DATA.materials.map((material) => {
              const compatible = isMaterialCompatibleWithWorld(selectedWorld, material.id);
              const active = selectedPropId === material.id;
              return (
                <button
                  key={material.id}
                  type="button"
                  disabled={!compatible}
                  onClick={() => setField('selectedPropId', material.id)}
                  title={compatible ? material.name : `${selectedWorld?.name ?? 'Bu world'} bu dokuyu taşımıyor — world-native malzemeye çözülür.`}
                  className={`recipe-material-card ${active ? 'active' : ''}`}
                >
                  <span aria-hidden style={{ display: 'block', height: 34, borderRadius: 4, background: matSwatchBackground(material.id), opacity: compatible ? 1 : 0.35, filter: compatible ? 'none' : 'grayscale(0.8)' }} />
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 600, marginTop: 6, color: compatible ? 'var(--m2-paper)' : 'var(--m2-muted)' }}>{material.name}</span>
                  {!compatible && (
                    <span style={{ display: 'block', fontSize: 9, letterSpacing: 0.6, color: 'rgba(214, 168, 79, 0.7)', marginTop: 2 }}>UYUMSUZ · WORLD TAŞIMIYOR</span>
                  )}
                </button>
              );
            })}
          </div>
          <p style={{ color: 'var(--m2-muted)', fontSize: 12, lineHeight: 1.5 }}>
            {selectedMaterial && isMaterialCompatibleWithWorld(selectedWorld, selectedMaterial.id)
              ? selectedMaterial.substance_grammar
              : 'World native. Uyumsuz materyaller final brief render lock içine girmez.'}
          </p>
        </Panel>

        <Panel title="Palet" subtitle="9 seçenek · native default" style={{ flex: 1 }}>
          <div className="recipe-palette-grid">
            {DATA.palettes.map((palette) => {
              const active = selectedPaletteId === palette.id;
              const colors = paletteColors(palette);
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setField('selectedPaletteId', palette.id)}
                  className={`recipe-palette-button ${active ? 'active' : ''}`}
                  title={palette.name}
                >
                  <span className="recipe-palette-strip" style={{ display: 'flex', gap: 2, height: 22, borderRadius: 4, overflow: 'hidden' }}>
                    {(colors.length ? colors : ['#222', '#555', '#888', '#bbb']).map((color) => (
                      <span key={color} style={{ flex: 1, background: color }} />
                    ))}
                  </span>
                  <span style={{ display: 'block', fontSize: 10.5, color: 'var(--m2-muted)', marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{palette.name}</span>
                </button>
              );
            })}
          </div>
        </Panel>
        </div>
      </details>

      <details className="recipe-progressive" open>
        <summary>Reference DNA · world subordinate evidence</summary>
        <Panel title="Reference DNA" subtitle={`${DATA.refs.length} DNA · en fazla 3 aktif · world subordinate`}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ padding: 12, border: '1px solid var(--m2-line)', borderRadius: 8, background: 'rgba(255,255,255,.035)' }}>
              <div style={{ color: 'var(--m2-amber)', fontSize: 11, fontWeight: 900, letterSpacing: 1.4 }}>SEÇİLİ DNA</div>
              <div style={{ color: 'var(--m2-paper)', fontSize: 13, lineHeight: 1.45, marginTop: 8 }}>
                {selectedRefs.length ? selectedRefs.map((ref) => ref.name).join(' + ') : 'Path-native'}
              </div>
              <div style={{ color: 'var(--m2-muted)', fontSize: 12, marginTop: 8 }}>
                Güç: {dna.filled}/{dna.total} · {dna.roles.join(', ') || 'world native'}
              </div>
            </div>

            <Button type="button" variant="ghost" onClick={applyStarterPack} disabled={!starterRefs.length}>
              Starter Pack'i uygula
            </Button>

            <div style={{ display: 'grid', gap: 8 }}>
              {starterRefs.map((ref) => (
                <button
                  key={ref.id}
                  type="button"
                  onClick={() => toggleRef(ref.id)}
                  className={`recipe-material-button ${selectedRefIds.includes(ref.id) ? 'active' : ''}`}
                  style={{ textAlign: 'left' }}
                >
                  {ref.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ maxHeight: 320, overflow: 'auto', display: 'grid', gap: 8, paddingRight: 4 }}>
            {sortedRefs.map((ref) => {
              const selected = selectedRefIds.includes(ref.id);
              const activePreview = activePreviewRefId === ref.id;
              const fit = refFit(selectedWorld, ref);
              const disabled = !selected && selectedRefIds.length >= 3;
              return (
                <button
                  key={ref.id}
                  type="button"
                  onClick={() => (selected || !disabled) && toggleRef(ref.id)}
                  onMouseEnter={() => setActivePreviewRefId(ref.id)}
                  disabled={disabled}
                  style={{
                    textAlign: 'left',
                    padding: 12,
                    borderRadius: 8,
                    border: `1px solid ${activePreview ? 'var(--m2-amber)' : selected ? 'rgba(247,201,72,.45)' : 'var(--m2-line)'}`,
                    background: selected ? 'rgba(247,201,72,.1)' : 'rgba(255,255,255,.03)',
                    color: 'var(--m2-paper)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.45 : 1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                    <strong style={{ fontSize: 13 }}>{ref.name}</strong>
                    <span style={{ color: fit >= 70 ? 'var(--m2-amber)' : 'var(--m2-muted)', fontSize: 11, fontWeight: 800 }}>%{fit}</span>
                  </div>
                  <div style={{ color: 'var(--m2-muted)', fontSize: 11, marginTop: 4 }}>{ref.cat} · {ref.anchor || ref.id}</div>
                  <div style={{ color: 'var(--m2-muted)', fontSize: 12, marginTop: 6, lineHeight: 1.45 }}>{ref.use}</div>
                </button>
              );
            })}
          </div>
          <RefDnaCards refs={selectedRefs} />
        </div>
        </Panel>
      </details>

      <details className="recipe-progressive">
        <summary>Project Metadata · konu, cast, lokasyon</summary>
        <Panel title="Konu, Cast, Lokasyon" subtitle="Ajan reçetesinin insan-okunabilir üst bloğu">
        <div className="recipe-meta-grid">
          <Field label="Subject / Konu">
            <input className="meta-input" value={subject} onChange={(event) => setField('subject', event.target.value)} data-testid="recipe-subject" />
          </Field>
          <Field label="Cast">
            <input className="meta-input" value={cast} onChange={(event) => setField('cast', event.target.value)} placeholder="@defne, @aras veya serbest" data-testid="recipe-cast" />
          </Field>
          <Field label="Location">
            <input className="meta-input" value={location} onChange={(event) => setField('location', event.target.value)} placeholder="İstanbul, sınıf, stüdyo..." data-testid="recipe-location" />
          </Field>
        </div>
        </Panel>
      </details>

      <details className="recipe-progressive">
        <summary>Scene Notes · progressive editör</summary>
        <Panel title="Scenes" subtitle="Dinamik sahne listesi · id/vo/event/director_note/motion_seed/turkish_labels/avoid">
        <div className="recipe-scenes-list">
          {recipeScenes.map((scene) => (
            <section key={scene.id} className="recipe-scene-note">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <Chip tone="gold">Sahne {scene.id}</Chip>
                <button type="button" onClick={() => removeScene(scene.id)} aria-label={`Sahne ${scene.id} sil`} style={{ background: 'transparent', border: 'none', color: 'var(--m2-danger)', cursor: 'pointer', padding: 4 }}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <Field label="VO">
                  <textarea value={scene.vo} onChange={(event) => updateScene(scene.id, { vo: event.target.value })} />
                </Field>
                <Field label="Event">
                  <textarea value={scene.event} onChange={(event) => updateScene(scene.id, { event: event.target.value })} />
                </Field>
                <Field label="Director Note">
                  <textarea value={scene.director_note} onChange={(event) => updateScene(scene.id, { director_note: event.target.value })} />
                </Field>
                <Field label="Motion Seed">
                  <textarea value={scene.motion_seed} onChange={(event) => updateScene(scene.id, { motion_seed: event.target.value })} />
                </Field>
                <Field label="Turkish Labels">
                  <input value={listText(scene.turkish_labels)} onChange={(event) => updateScene(scene.id, { turkish_labels: textList(event.target.value) })} />
                </Field>
                <Field label="Avoid">
                  <input value={listText(scene.avoid)} onChange={(event) => updateScene(scene.id, { avoid: textList(event.target.value) })} />
                </Field>
              </div>
            </section>
          ))}
          <Button variant="ghost" onClick={addScene} style={{ alignSelf: 'flex-start' }}>
            <Plus size={16} /> Sahne Ekle
          </Button>
        </div>
        </Panel>
      </details>

      {!readiness.ready && (
        <div role="alert" style={{ padding: '10px 14px', borderRadius: 8, borderLeft: '3px solid var(--amber)', background: 'var(--embersoft)', color: 'var(--amber)', fontSize: 13, fontWeight: 700 }}>
          Eksik seçim: {readiness.missing.join(', ')}
        </div>
      )}
    </div>
  );
};
