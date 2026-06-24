import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sourceReadiness, useStudioStore } from '../../store/useStudioStore';
import { Panel, Field, Button, inputStyle, selectStyle } from '../../components/Layout/PanelKit';
import { PHASE0_VIDEO, PHASE0_DESIGN, buildDirectorMandate, directorChoiceMap, directorDefaultSets, type Phase0Preset } from '../../data/presets';
import { DATA, parseSourceInput } from '../../core/pure';
import { decodeBrief } from '../../core/source';
import { suggestRecipe } from '../../core/advisor';
import { Wand2 } from 'lucide-react';

const CLASS_OPTIONS = DATA.paths.map((path) => ({ id: path.id, label: path.name }));

export const DashboardStep = () => {
  const {
    projectKind, selectedProjectId, projectTopic, projectClass, sceneCount, cast,
    rawSource, sourceBeats, sourceReport,
    phase0PresetId,
    setField, setCurrentStep, applyPreset, setRawSource, decodeRawSource, ingestRawSource,
    vault, saveToVault, loadFromVault, deleteFromVault,
  } = useStudioStore();
  const [kind, setKind] = useState<'video' | 'design'>(projectKind);
  const [vaultName, setVaultName] = useState('');
  const [autoRecipe, setAutoRecipe] = useState<{ reason: string; confidence: string } | null>(null);

  const onAutoRecipe = () => {
    const topic = (rawSource.trim() || projectTopic).trim();
    if (!topic) return;
    const s = suggestRecipe(topic);
    applyPreset({ projectClass: s.path, selectedWorldId: s.worldId, selectedPaletteId: s.paletteId, selectedRefIds: s.refIds });
    setField('phase0PresetId', '');
    setField('directorChoices', {});
    setField('directorBrief', '');
    setAutoRecipe({ reason: s.reason, confidence: s.confidence });
  };

  const presets = kind === 'video' ? PHASE0_VIDEO : PHASE0_DESIGN;
  const sourceParsed = useMemo(() => parseSourceInput(projectTopic), [projectTopic]);
  const decoded = useMemo(() => (rawSource.trim() ? decodeBrief(rawSource) : null), [rawSource]);
  const sourceGate = sourceReadiness({ rawSource, sourceReport });
  const isSourceBound = sourceParsed.status === 'SOURCE_BOUND';

  const onPreset = (p: Phase0Preset) => {
    const defaults = directorChoiceMap(p);
    applyPreset({ ...p.sets, ...directorDefaultSets(p), projectKind: p.kind, directorBrief: buildDirectorMandate(p, defaults) });
    setField('phase0PresetId', p.id);
    setField('directorChoices', defaults);
    setCurrentStep('director');
  };

  return (
    <div className="dashboard-step" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1080 }}>
      <header>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--gold)', fontWeight: 700 }}>STAGE 1 · BRIEF</div>
        <h1 style={{ fontSize: 38, margin: '8px 0 4px', fontWeight: 700, letterSpacing: -0.5 }}>
          Hikayenin omurgası
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Hazır bir başlangıçtan başla ya da elle kur. Phase 0 sadece kuruluşu yapar — sonra istediğini değiştirirsin.
        </p>
      </header>

      <Panel title="Phase 0 — Hazır başlangıç" subtitle="Tek tıkla world + class + scene count ayarlanır.">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['video', 'design'] as const).map((k) => (
            <button
              key={k}
              onClick={() => {
                setKind(k);
                setField('phase0PresetId', '');
                setField('directorChoices', {});
                setField('directorBrief', '');
                setField('projectKind', k);
              }}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: `1px solid ${kind === k ? 'var(--gold)' : 'var(--line2)'}`,
                background: kind === k ? 'var(--goldsoft)' : 'transparent',
                color: kind === k ? '#fff' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {k === 'video' ? `VIDEO · ${PHASE0_VIDEO.length}` : `DESIGN · ${PHASE0_DESIGN.length}`}
            </button>
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {presets.map((p, i) => {
            const active = phase0PresetId === p.id;
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                whileHover={{ y: -2, backgroundColor: active ? 'var(--s3)' : 'var(--s2)' }}
                onClick={() => onPreset(p)}
                style={{
                  padding: '16px 14px',
                  borderRadius: 'var(--r-md)',
                  border: `1px solid ${active ? 'var(--goldline)' : 'var(--line2)'}`,
                  background: active ? 'var(--s2)' : 'var(--s1)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#fff',
                  boxShadow: active ? '0 0 0 1px var(--goldline), 0 8px 24px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
                    boxShadow: '0 0 10px var(--goldglow)'
                  }} />
                )}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 'var(--r-sm)',
                  background: active ? 'var(--goldsoft)' : 'var(--s3)',
                  color: active ? 'var(--gold)' : 'var(--text-muted)',
                  border: `1px solid ${active ? 'var(--goldline)' : 'var(--line2)'}`
                }}>
                  <p.icon size={18} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--text)' : 'var(--text-soft)' }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.4 }}>
                    {p.desc}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </Panel>

      <Panel
        title="Brief decode & kayıpsız ingest"
        subtitle="Müşteri metni önce gerçek production path'e çözülür, sonra hiçbir karakter kaybetmeden source beat'lere ayrılır."
      >
        <Field label="Müşteri briefi / Raw Source Vault" hint="Noktalama, satır sonu ve boşluklar dahil kaynak aynen korunur.">
          <textarea
            data-testid="raw-source-input"
            style={{ ...inputStyle, minHeight: 150, resize: 'vertical', fontFamily: "'JetBrains Mono Variable', monospace", lineHeight: 1.55 }}
            value={rawSource}
            onChange={(event) => setRawSource(event.target.value)}
            placeholder="Örn. 3. sınıf öğrencileri için su döngüsü dersi..."
          />
        </Field>

        {decoded && (
          <div
            data-testid="decode-summary"
            style={{ marginTop: 16, padding: 14, border: '1px solid var(--line2)', borderRadius: 10, background: 'rgba(0,0,0,.22)' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <strong style={{ color: 'var(--gold)', fontSize: 12 }}>{decoded.path}</strong>
              <span style={{ color: '#fff', fontSize: 13 }}>{decoded.project.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>confidence: {decoded.confidence}</span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 7 }}>{decoded.reason}</div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
          <Button variant="ghost" disabled={!rawSource.length} onClick={decodeRawSource}>
            Decode reçetesini uygula
          </Button>
          <Button disabled={!rawSource.length} onClick={() => { decodeRawSource(); ingestRawSource(); }}>
            Decode + Kayıpsız Ingest
          </Button>
        </div>

        <div
          data-testid="source-integrity-report"
          style={{
            marginTop: 18,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 10,
          }}
          className="source-metrics-grid"
        >
          {[
            ['Coverage', sourceReport ? `${sourceReport.coverage}%` : '—'],
            ['Beat', String(sourceBeats.length)],
            ['Raw Hash', sourceReport?.rawHash ?? '—'],
            ['Recon Hash', sourceReport?.reconHash ?? '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: 12, border: '1px solid var(--line2)', borderRadius: 10, minWidth: 0 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: 1 }}>{label}</div>
              <div style={{ color: label === 'Coverage' && sourceReport?.ok ? 'var(--green)' : '#fff', fontFamily: "'JetBrains Mono Variable', monospace", fontSize: 13, marginTop: 5, overflowWrap: 'anywhere' }}>{value}</div>
            </div>
          ))}
        </div>

        {sourceBeats.length > 0 && (
          <ol style={{ margin: '18px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            {sourceBeats.map((beat) => (
              <li key={beat.sourceId} data-testid="source-beat" style={{ display: 'grid', gridTemplateColumns: '92px minmax(0, 1fr)', gap: 10, padding: 10, borderRadius: 8, background: 'rgba(77,245,160,.045)', border: '1px solid rgba(77,245,160,.18)' }}>
                <span style={{ color: 'var(--green)', fontFamily: "'JetBrains Mono Variable', monospace", fontSize: 10 }}>{beat.sourceId}</span>
                <span style={{ color: '#fff', whiteSpace: 'pre-wrap', fontSize: 12 }}>{beat.exactText}</span>
              </li>
            ))}
          </ol>
        )}

        {rawSource.length > 0 && (
          <div style={{ marginTop: 14, color: sourceGate.ready ? 'var(--green)' : 'var(--red)', fontSize: 12 }}>
            {sourceGate.ready
              ? `PASS · ${selectedProjectId} · kaynak üretim için kilitli.`
              : `FAIL · ${sourceGate.reason}`}
          </div>
        )}
      </Panel>

      <Panel
        title="Konu & Sınıf"
        aside={
          <Button onClick={onAutoRecipe} disabled={!(rawSource.trim() || projectTopic.trim())} style={{ padding: '9px 14px', fontSize: 12.5 }}>
            <Wand2 size={14} /> Reçeteyi kur
          </Button>
        }
      >
        <AnimatePresence>
          {autoRecipe && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--goldline)', background: 'var(--goldsoft)' }}>
                <Wand2 size={15} color="var(--gold)" />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gold-hi)' }}>
                    Reçete kuruldu · {autoRecipe.confidence === 'high' ? 'yüksek güven' : autoRecipe.confidence === 'medium' ? 'orta güven' : 'tahmini'}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-soft)', marginTop: 2 }}>{autoRecipe.reason} → Reçete adımında ince ayar yapabilirsin.</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="dashboard-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Field label="Proje konusu" hint='Kanonik kaynak için "SOURCE:" ön ekiyle çoklu beat yazabilirsin.'>
            <textarea
              style={{ ...inputStyle, minHeight: isSourceBound ? 120 : 44, resize: 'vertical', fontFamily: isSourceBound ? "'JetBrains Mono Variable', monospace" : 'inherit' }}
              value={projectTopic}
              onChange={(e) => setField('projectTopic', e.target.value)}
              placeholder="örn. Su Döngüsü — veya SOURCE: ile çoklu beat"
            />
          </Field>
          <Field label="Proje sınıfı / yolu">
            <select
              style={selectStyle}
              value={projectClass}
              onChange={(e) => setField('projectClass', e.target.value)}
            >
              {CLASS_OPTIONS.map((o) => (
                <option key={o.id} value={o.id} style={{ background: '#0d1018' }}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sahne sayısı" hint={sourceGate.ready && rawSource ? 'Source beat sayısı tarafından kilitli.' : '1–20'}>
            <input
              type="number"
              min={1}
              max={20}
              disabled={Boolean(sourceGate.ready && rawSource)}
              style={inputStyle}
              value={sceneCount}
              onChange={(e) => setField('sceneCount', Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            />
          </Field>
        </div>
        <AnimatePresence>
          {isSourceBound && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginTop: 18 }}
            >
              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: 'rgba(77,245,160,.05)',
                  border: '1px solid rgba(77,245,160,.25)',
                }}
              >
                <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--green, #4df5a0)', fontWeight: 700, marginBottom: 8 }}>
                  SOURCE BOUND · {sourceParsed.beats.length} BEAT
                </div>
                <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {sourceParsed.beats.map((b) => (
                    <li key={b.sourceId ?? b.exactText}>
                      <span style={{ color: 'var(--green)', fontFamily: "'JetBrains Mono Variable', monospace", fontSize: 11 }}>
                        {b.sourceId ?? '—'}
                      </span>{' '}
                      <span style={{ color: '#fff' }}>{b.exactText}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Panel>

      <Panel title="Karakter (opsiyonel)" subtitle="Boş bırak → nesne-odaklı, karaktersiz sahne. Doldurursan birebir kilitlenir (kimlik kayması engellenir).">
        <Field label="Karakter tanımı">
          <textarea
            data-testid="cast-input"
            style={{ ...inputStyle, minHeight: 70, resize: 'vertical', fontFamily: 'inherit' }}
            value={cast}
            onChange={(e) => setField('cast', e.target.value)}
            placeholder="örn. @mehmet = 9 yaşında çocuk, mavi kazak, kısa kahverengi saç, ağzı kapalı. — Boş bırakırsan sahnede karakter olmaz."
          />
        </Field>
      </Panel>

      <Panel title="Proje Kasası" subtitle="Aktif projeyi adıyla kaydet; istediğin an birebir geri yükle. Tarayıcıda saklanır.">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            data-testid="vault-name"
            style={{ ...inputStyle, flex: '1 1 220px' }}
            value={vaultName}
            onChange={(e) => setVaultName(e.target.value)}
            placeholder={`Proje adı (boşsa "${projectTopic.trim() || 'konu'}" kullanılır)`}
          />
          <Button data-testid="vault-save" onClick={() => { saveToVault(vaultName); setVaultName(''); }}>
            Aktif projeyi kasaya kaydet
          </Button>
        </div>
        {vault.length === 0 ? (
          <div style={{ marginTop: 14, color: 'var(--text-muted)', fontSize: 12 }}>
            Kasa boş — kaydettiğin projeler burada listelenir.
          </div>
        ) : (
          <ul data-testid="vault-list" style={{ margin: '16px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            {vault.map((e) => (
              <li
                key={e.id}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--line2)', background: 'rgba(0,0,0,.2)' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
                    {new Date(e.savedAt).toLocaleString('tr-TR')} · {e.snapshot.projectClass} · {(e.snapshot.scenes?.length ?? 0)} sahne
                  </div>
                </div>
                <Button variant="ghost" onClick={() => loadFromVault(e.id)}>Yükle</Button>
                <Button variant="ghost" onClick={() => deleteFromVault(e.id)}>Sil</Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Button disabled={!sourceGate.ready} onClick={() => setCurrentStep(phase0PresetId ? 'director' : 'recipe')}>
          {phase0PresetId ? 'Yönetmene geç' : 'Reçeteye geç'} → <span className="kbd" style={{ marginLeft: 8 }}>⌘↵</span>
        </Button>
      </div>
    </div>
  );
};
