import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sourceReadiness, useStudioStore } from '../../store/useStudioStore';
import { Panel, Field, Button, inputStyle, selectStyle } from '../../components/Layout/PanelKit';
import { stageNumber } from '../../components/Layout/AppLayout';
import { ArchetypeSlate } from '../../components/ArchetypeSlate';
import { PHASE0_VIDEO, buildDirectorMandate, directorChoiceMap, directorDefaultSets, type Phase0Preset } from '../../data/presets';
import { DATA, parseSourceInput } from '../../core/pure';
import { decodeBrief } from '../../core/source';
import { suggestRecipe } from '../../core/advisor';
import { Wand2 } from 'lucide-react';

const CLASS_OPTIONS = DATA.paths.map((path) => ({ id: path.id, label: path.name }));

export const DashboardStep = () => {
  const studioState = useStudioStore();
  const {
    selectedProjectId, projectTopic, projectClass, sceneCount, cast,
    rawSource, sourceBeats, sourceReport,
    phase0PresetId,
    setField, setCurrentStep, advance, applyPreset, setRawSource, decodeRawSource, ingestRawSource,
    vault, saveToVault, loadFromVault, deleteFromVault, importProjectPack,
  } = studioState;
  const [vaultName, setVaultName] = useState('');
  const [autoRecipe, setAutoRecipe] = useState<{ reason: string; confidence: string } | null>(null);

  const onAutoRecipe = () => {
    const s = suggestRecipe('');
    applyPreset({ projectClass: s.path, selectedWorldId: s.worldId, selectedPaletteId: s.paletteId, selectedRefIds: s.refIds });
    setField('phase0PresetId', '');
    setField('directorChoices', {});
    setField('directorBrief', '');
    setAutoRecipe({ reason: s.reason, confidence: s.confidence });
  };

  const presets = PHASE0_VIDEO;
  const sourceParsed = useMemo(() => parseSourceInput(projectTopic), [projectTopic]);
  const decoded = useMemo(() => (rawSource.trim() ? decodeBrief(rawSource) : null), [rawSource]);
  const sourceGate = sourceReadiness({ rawSource, sourceReport });
  const hasFailedReport = Boolean(sourceReport && !sourceReport.ok);
  const isSourceBound = sourceParsed.status === 'SOURCE_BOUND';

  const onPreset = (p: Phase0Preset) => {
    const defaults = directorChoiceMap(p);
    applyPreset({ ...p.sets, ...directorDefaultSets(p), directorBrief: buildDirectorMandate(p, defaults) });
    setField('phase0PresetId', p.id);
    setField('directorChoices', defaults);
    // The preset is a creative choice, not permission to skip raw-source integrity.
    // `advance()` applies the same project/source gate as the sidebar.
    advance();
  };

  const onImportProjectPack = (file: File) => {
    file.text().then((json) => importProjectPack(json));
  };

  return (
    <div className="dashboard-step mamilas-design-v2" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1080, background: 'transparent' }}>
      {/* Zone 1: BAŞLANGIÇ */}
      <header>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--m2-amber)', fontWeight: 700 }}>STAGE {stageNumber('dashboard', { phase0PresetId, currentStep: 'dashboard' })} · BRIEF</div>
        <h1 style={{ fontSize: 32, margin: '8px 0 4px', fontWeight: 500, letterSpacing: '0.005em', fontFamily: 'var(--font-serif)', color: 'var(--m2-paper)' }}>
          Hikayenin omurgası
        </h1>
        <p style={{ color: 'var(--text-soft)', fontSize: 15, textShadow: '0 1px 14px rgba(18,10,5,0.5)' }}>
          Hazır bir arketiple başla ya da kaynağı yapıştır. Kaynak kelimeleri yaratıcı seçimlerini değiştirmez.
        </p>
        <label className="ml-file-picker" style={{ display: 'inline-block', marginTop: 10 }}>
          <input
            className="ml-file-input"
            aria-label="Proje paketi içe al"
            type="file"
            accept=".json,application/json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImportProjectPack(file);
              event.currentTarget.value = '';
            }}
          />
          <span className="ml-file-picker-face" style={{ display: 'inline-flex', padding: '8px 12px', border: '1px solid var(--m2-line-strong)', borderRadius: 6, color: 'var(--m2-muted)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            ⬆ Proje Paketi Aç
          </span>
        </label>
        {/* P6 — import edilen pack'te doğrulanamayan (format-only) kanıt varsa Mami görür.
            HATA değil bildirim: import başarılı, ama bu hash'lerin kaynağı pack'te yok, o yüzden
            "onaylı gerçek kanıt" sayılamaz (gerçek kareyi bu cihazda yeniden yükle). M1 sözleşmesi. */}
        {studioState.packEvidenceNotice && studioState.packEvidenceNotice.length > 0 && (
          <div
            role="status"
            style={{ marginTop: 10, padding: '8px 12px', border: '1px solid var(--m2-line-strong)', borderRadius: 6, background: 'rgba(214,158,46,0.08)', color: 'var(--text-soft)', fontSize: 12, maxWidth: 640 }}
          >
            <strong style={{ color: 'var(--m2-amber)' }}>⚠ Doğrulanamayan kanıt:</strong>{' '}
            Bu paketteki {studioState.packEvidenceNotice.length} hash yalnızca biçim olarak geçerli —
            kaynağı pakette taşınmadığı için içeriği doğrulanamaz (format-only). Onaylı gerçek kare/kanıt
            sayılmaz; gerçek görseli bu cihazda yeniden yükleyip onaylayın.
          </div>
        )}
      </header>

      {/* Görsel sıra flex-order ile: yapıştırma yüzeyi (order 1) fold'un kahramanı,
          Phase 0 slate'i (order 2) altında. DOM/karar akışı AYNEN — sadece sahneleme. */}
      <Panel
        title="Phase 0 — Açılış reçetesi"
        subtitle="Arketip seç, sonucunu sağdaki dosyada oku: tek tık world + class + palet + ref DNA'yı kilitler ve Yönetmen'e geçer."
        style={{ order: 2 }}
      >
        <ArchetypeSlate
          presets={presets}
          lockedId={phase0PresetId}
          onPick={onPreset}
          onReturn={() => advance()}
        />
      </Panel>

      {/* Zone 2: KAYNAK — fold'un kahramanı (order 1) */}
      <Panel
        title="Brief decode & kayıpsız ingest"
        subtitle="Müşteri metni hiçbir yaratıcı seçim uydurulmadan, karakter kaybetmeden source beat'lere ayrılır. Etiketli MAMILAS dossier metadata'sı ayrıca geri yüklenir."
        style={{ order: 1 }}
      >
        {/* CSS uppercase Türkçe i→İ bilmez; etiket elden büyük yazılır */}
        <Field label="MÜŞTERİ BRİEFİ / RAW SOURCE VAULT" hint="Noktalama, satır sonu ve boşluklar dahil kaynak aynen korunur.">
          <textarea
            data-testid="raw-source-input"
            style={{ ...inputStyle, minHeight: 150, resize: 'vertical', fontFamily: "'JetBrains Mono Variable', monospace", lineHeight: 1.55 }}
            value={rawSource}
            onChange={(event) => setRawSource(event.target.value)}
            placeholder="Örn. 3. sınıf öğrencileri için su döngüsü dersi..."
          />
        </Field>

        {decoded?.confidence === 'high' && (
          <div
            data-testid="decode-summary"
            style={{ marginTop: 16, padding: 14, border: '1px solid var(--m2-line)', borderRadius: 8, background: 'var(--m2-surface-2)' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <strong style={{ color: 'var(--m2-amber)', fontSize: 12 }}>{decoded.path}</strong>
              <span style={{ color: 'var(--m2-paper)', fontSize: 13 }}>{decoded.project.name}</span>
              <span style={{ color: 'var(--m2-muted)', fontSize: 11 }}>confidence: {decoded.confidence}</span>
            </div>
            <div style={{ color: 'var(--m2-muted)', fontSize: 12, marginTop: 7 }}>{decoded.reason}</div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
          <Button variant="solid" disabled={!rawSource.length} onClick={() => { decodeRawSource(); ingestRawSource(); }}>
            {/* lang="en": CSS uppercase 'Ingest'i İNGEST yapmasın (tr-locale İ İngilizce loanword'e taşmaz) */}
            Kayıpsız <span lang="en">Ingest</span>
          </Button>
        </div>

        {/* Boş durumda NULL tablosu basılmaz: metrikler ölçülecek metin varken görünür */}
        {rawSource.length > 0 && (
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
            <div key={label} style={{ padding: 12, border: '1px solid var(--m2-line)', borderRadius: 8, minWidth: 0, background: 'var(--m2-surface-2)' }}>
              <div style={{ color: 'var(--m2-muted)', fontSize: 10, letterSpacing: 1 }}>{label}</div>
              <div style={{ color: label === 'Coverage' && sourceReport?.ok ? '#93c9a8' : 'var(--m2-paper)', fontFamily: "'JetBrains Mono Variable', monospace", fontSize: 13, marginTop: 5, overflowWrap: 'anywhere' }}>{value}</div>
            </div>
          ))}
        </div>
        )}

        {sourceBeats.length > 0 && (
          <ol style={{ margin: '18px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            {sourceBeats.map((beat) => (
              <li key={beat.sourceId} data-testid="source-beat" style={{ display: 'grid', gridTemplateColumns: '92px minmax(0, 1fr)', gap: 10, padding: 10, borderRadius: 8, background: 'rgba(147,201,168,.06)', border: '1px solid rgba(147,201,168,.28)' }}>
                <span style={{ color: '#93c9a8', fontFamily: "'JetBrains Mono Variable', monospace", fontSize: 10 }}>{beat.sourceId}</span>
                <span style={{ color: 'var(--m2-paper)', whiteSpace: 'pre-wrap', fontSize: 12 }}>{beat.exactText}</span>
              </li>
            ))}
          </ol>
        )}

        {rawSource.length > 0 && (
          <div style={{ marginTop: 14, fontSize: 12, color: sourceGate.ready ? 'var(--green)' : hasFailedReport ? 'var(--m2-danger)' : 'var(--m2-amber)' }}>
            {sourceGate.ready
              ? `PASS · ${selectedProjectId} · kaynak üretim için kilitli.`
              : hasFailedReport
                ? `Kaynak bütünlüğü ${sourceReport!.coverage}% — %100 için metni değiştirmeden yeniden ingest et.`
                : 'Sıradaki adım: "Kayıpsız Ingest" — kaynak beat\'lere kilitlensin.'}
          </div>
        )}
      </Panel>

      {/* Zone 3: AYRINTILAR */}
      <Panel
        style={{ order: 3 }}
        title="Ayrıntılar"
        aside={
          <Button onClick={onAutoRecipe} style={{ padding: '9px 14px', fontSize: 12.5 }}>
            <Wand2 size={14} /> Genel başlangıç
          </Button>
        }
      >
        {/* KONU & SINIF */}
        <div className="ml-v3-eyebrow" style={{ marginTop: 0, marginBottom: 14 }}>KONU &amp; SINIF</div>

        <AnimatePresence>
          {autoRecipe && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--m2-amber)', background: 'var(--m2-amber-soft)' }}>
                <Wand2 size={15} color="var(--m2-amber)" />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--m2-amber)' }}>
                    Reçete kuruldu · {autoRecipe.confidence === 'high' ? 'yüksek güven' : autoRecipe.confidence === 'medium' ? 'orta güven' : 'tahmini'}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--m2-muted)', marginTop: 2 }}>{autoRecipe.reason} → Reçete adımında ince ayar yapabilirsin.</div>
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
                <option key={o.id} value={o.id} style={{ background: 'var(--m2-ink)' }}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sahne sayısı" hint={sourceGate.ready && rawSource ? 'Source beat sayısı tarafından kilitli.' : '1–60'}>
            <input
              type="number"
              min={1}
              max={60}
              disabled={Boolean(sourceGate.ready && rawSource)}
              style={inputStyle}
              value={sceneCount}
              onChange={(e) => setField('sceneCount', Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
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
                  background: 'rgba(147,201,168,.06)',
                  border: '1px solid rgba(147,201,168,.3)',
                }}
              >
                <div style={{ fontSize: 10, letterSpacing: 2, color: '#93c9a8', fontWeight: 700, marginBottom: 8 }}>
                  SOURCE BOUND · {sourceParsed.beats.length} BEAT
                </div>
                <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--m2-muted)', lineHeight: 1.6 }}>
                  {sourceParsed.beats.map((b) => (
                    <li key={b.sourceId ?? b.exactText}>
                      <span style={{ color: '#93c9a8', fontFamily: "'JetBrains Mono Variable', monospace", fontSize: 11 }}>
                        {b.sourceId ?? '—'}
                      </span>{' '}
                      <span style={{ color: 'var(--m2-paper)' }}>{b.exactText}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* KARAKTER */}
        <div className="ml-v3-eyebrow" style={{ marginTop: 24, marginBottom: 6 }}>KARAKTER (OPSİYONEL)</div>
        <p style={{ fontSize: 12, color: 'var(--m2-muted)', marginBottom: 14, marginTop: 0 }}>
          Boş bırak → nesne-odaklı, karaktersiz sahne. Doldurursan birebir kilitlenir.
        </p>
        <Field label="Karakter tanımı">
          <textarea
            data-testid="cast-input"
            style={{ ...inputStyle, minHeight: 70, resize: 'vertical', fontFamily: 'inherit' }}
            value={cast}
            onChange={(e) => setField('cast', e.target.value)}
            placeholder="örn. @mehmet = 9 yaşında çocuk, mavi kazak, kısa kahverengi saç, ağzı kapalı. — Boş bırakırsan sahnede karakter olmaz."
          />
        </Field>

        {/* PROJE KASASI */}
        <div className="ml-v3-eyebrow" style={{ marginTop: 24, marginBottom: 6 }}>PROJE KASASI</div>
        <p style={{ fontSize: 12, color: 'var(--m2-muted)', marginBottom: 14, marginTop: 0 }}>
          Aktif projeyi adıyla kaydet; istediğin an birebir geri yükle.
        </p>
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
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--m2-line)', background: 'var(--m2-surface-2)' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--m2-paper)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
                  <div style={{ color: 'var(--m2-muted)', fontSize: 11, marginTop: 2 }}>
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, order: 4 }}>
        <Button disabled={!sourceGate.ready} onClick={() => advance()}>
          {phase0PresetId ? 'Yönetmene geç' : 'Reçeteye geç'} → <span className="kbd" style={{ marginLeft: 8 }}>⌘↵</span>
        </Button>
      </div>
    </div>
  );
};
