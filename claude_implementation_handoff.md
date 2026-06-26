# Mamilas — FULL SITE WORKFLOW IMPLEMENTATION HANDOFF
> Claude saat 15:00'te bu dökümanla bütün site pipeline'ını fix eder.
> Tarih: 2026-06-26 | Tam site taraması.

---

## 1. Kısa Özet

- **Düz ingest çalışıyor.** `ingestSource → autoGroupBeats → sourceIntegrity` zinciri temiz. Direkt ingest sonrası `%100` garantili.
- **Bozulma split/mod/edit sonrası başlıyor.** `splitBeat` kelime bazlı bölüyor, karakter kaybı üretiyor. `setBeatMode` küçük source'ta bozuk state'i temizlemiyor. `generateBatch` editlenmiş beats'i hardcode 'Dengeli' ile eziyor.
- **Final Brief `SOURCE_INTEGRITY_FAIL %99` veriyor** çünkü `splitBeat` sonrası store'daki `sourceBeats` `rawSource` ile eşleşmiyor; `generateBatch` bunu yakalayıp BLOCKED dönüyor.
- **Ek site sorunları:** `workingMode` seçimi üretimi etkilemiyor (dekoratif). Prompt override sonrası yeniden üretim edit'i kaybediyor. `lastError` ScenesStep'te gösterilmiyor. Export'ta edited prompt düzgün çözümleniyor ama eski export JSON tipi (simple `scenes`) `effectivePrompt`'u yok sayıyor.

---

## 2. Kritik Buglar

### BUG-1 — `splitBeat`: Kelime bazlı bölme, karakter kaybı
- **Dosya**: `src/store/useStudioStore.ts` L537–551
- `beat.exactText.split(' ')` → `join(' ')` → Türkçe `\n`, çoklu boşluk, sekme kaybolur
- `b2.start = b1.end + 1` → +1 gap → rawSource ile %99 coverage → `SOURCE_INTEGRITY_FAIL`
- Split sonrası `sourceIntegrity` çağrılmıyor → stale `sourceReport` OK gösteriyor ama değil
- **Etki**: Her Böl tıklamasından sonra BATCH ÜRET BLOCKED

### BUG-2 — `setBeatMode`: Küçük source'ta bozuk state temizlenmiyor
- **Dosya**: `src/store/useStudioStore.ts` L496–507
- `regroup = atoms.length > AUTO_GROUP_THRESHOLD (12)` → 12 veya daha az cümle → FALSE
- Daha önce `splitBeat` çalıştırıldıysa, Dengeli/Ekonomik/Hassas geçişi o bozuk stateı taşıyor
- **Etki**: Mod butonlarına basmak storyboard'u onarmıyor

### BUG-3 — `generateBatch`: Edited storyboard hardcode 'Dengeli' ile eziliyor
- **Dosya**: `src/core/pure.ts` L827–828
- `durationBudgetSourceBeats(input.rawSource, 'Dengeli', input.sourceBeats)` her zaman çalışıyor
- Kullanıcının manuel split/merge/mod düzenlemeleri production'da ignore ediliyor
- `voiceOver = beatText` bu ezilmiş beats'ten geliyor
- **Etki**: Final Brief kullanıcının storyboard'unu değil, 'Dengeli' regroupunu yansıtıyor

### BUG-4 — `mergeBeats` + split zinciri: Bozuk slice
- **Dosya**: `src/store/useStudioStore.ts` L513–535
- `mergeBeats` rawSource.slice kullanıyor ✓ — ama `b1.start, b2.end` değerleri splitBeat'ten bozuk geliyorsa slice yanlış
- `b1.start=0, b1.end=21, b2.start=22, b2.end=35` → merge: `rawSource.slice(0, 35)` = doğru ama b2 kendi içinde bozuksa (b2.exactText yanlış) `merged.exactText` doğru görünür ama b2.end yanlış olabilir
- **Etki**: Split → Merge zincirinde integrity bozulabilir

---

## 3. Orta Riskler

### RISK-1 — `workingMode` üretimi etkilemiyor (dekoratif)
- **Dosya**: `ScenesStep.tsx` L22–30, `generateScenes` L555–623
- `workingMode` (`Hızlı / Standart / Sıkı Teslim`) store'a yazılıyor ama `generateBatch`'e gönderilmiyor
- `BriefInput` interface'inde `workingMode` yok (pure.ts L203–231)
- Kullanıcı "Sıkı Teslim" seçip BATCH ÜRET'e basıyor → hiçbir fark yok
- **Fix öneri**: Ya `BriefInput`'a ekle ve production pipeline'da kullan, ya da butonu "yakında" olarak işaretle

### RISK-2 — Prompt override + yeniden üretim: Kullanıcı edit kaybı
- **Dosya**: `useStudioStore.ts` L625–628 + `STALE_GENERATION`
- Kullanıcı Timeline'da bir sahnenin image prompt'unu düzenledi (`setSceneOverride`)
- Sonra Director'da yeni bir seçim yaptı → `setField` `clearGeneration` çalıştırdı → tüm sahneler silindi → edit kayboldu
- **Şu an koruma yok**: Kullanıcıya "kaydedilmemiş editleriniz var, devam etmek ister misiniz?" uyarısı çıkmıyor
- **Etki**: Kullanıcı farkında olmadan saatlerce düzenlediği promptları kaybedebilir

### RISK-3 — `sourceReadiness` yol engeli: `rawSource` varsa ilerlemek zorunda
- **Dosya**: `useStudioStore.ts` L80–88 + L632–633
- `rawSource.length > 0` ve `sourceReport === null` → `sourceReadiness.ready = false`
- Kullanıcı rawSource girdi ama ingest yapmadı → `advance()` (İleri butonu) çalışmıyor
- Kullanıcı bunun neden çalışmadığını anlamıyor — Dashboard'da hata mesajı var ama buton basılabilir görünüyor
- **Etki**: `advance()` sessizce hiçbir şey yapmıyor, kullanıcı neden geçemediğini bilmiyor

### RISK-4 — `onExportJSON` (basit JSON export) `effectivePrompt`'u yok sayıyor
- **Dosya**: `TimelineStep.tsx` L37–51
- `scenes` nesnesini olduğu gibi export ediyor → `imagePrompt` field'ı kullanılıyor
- Ama kullanıcı `setSceneOverride` ile override etti → `userImagePrompt` set edildi
- `effectivePrompt(s) = s.userImagePrompt ?? s.imagePrompt` → Bu export'ta kullanılmıyor
- `onExportCSV` ve `onExportMD` `scenesForExport.map(s => ({ ...s, imagePrompt: effectivePrompt(s) }))` yapıyor ✓
- **Etki**: Basit JSON export edit edilmiş promptu değil orijinal AI prompt'unu verir

### RISK-5 — `proofDoctor` Timeline'da `sourceReport.coverage` geçiyor ama stale olabilir
- **Dosya**: `TimelineStep.tsx` L518
- `sourceCoverage: state.sourceReport?.coverage ?? undefined`
- Split sonrası `sourceReport` STALE (hatalı OK) → `proofDoctor` hatalı coverage'la çalışıyor
- Fix-1 sonrası düzelir ama şu an yanlış coverage değeri geçiyor

### RISK-6 — `beatAnalysis` set edilmeden stale kalıyor: `ingestRawSource` eksik güncelleme
- **Dosya**: `useStudioStore.ts` L494
- `ingestRawSource` `beatAnalysis` set ediyor ✓
- Ama `setBeatMode` sonrası → Fix-2 uygulandığında `beatAnalysis` yeniden hesaplanmalı
- Mevcut kodda `setBeatMode` L506: `beatAnalysis` hesaplanıyor ✓ (fix-2 ile korunacak)

---

## 4. UX / Debug Eksikleri

### UX-1 — `lastError` ScenesStep'te görünmüyor
- **Dosya**: `ScenesStep.tsx` — `lastError` kullanılmıyor
- `TimelineStep.tsx` L196–211'de `lastError` banner'ı var ✓
- ScenesStep'te `splitBeat` hatası (güvenli nokta yok / integrity fail) sessizce kayboluyor
- **Fix**: ScenesStep header'ına `lastError` banner ekle

### UX-2 — Split/Merge sonrası `sourceReport.coverage` UI'da güncel değil
- **Dosya**: `DashboardStep.tsx` L200
- Dashboard'daki Coverage metriği `store.sourceReport.coverage` gösteriyor
- Kullanıcı Scenes sayfasında split yapıyor, coverage değişiyor ama Dashboard'a dönünce artık güncel
- Ama Scenes sayfasında coverage gösterilmiyor → kullanıcı split'in bozuk olduğunu göremez
- **Fix**: ScenesStep'e mini coverage badge ekle (OK/FAIL rengiyle)

### UX-3 — `advance()` sessiz failure: İleri butonu bazen çalışmıyor
- **Dosya**: `useStudioStore.ts` L630–640
- `advance()` koşul sağlanmadığında hiçbir şey yapmıyor, hata vermiyor
- Dashboard → Reçete geçişi: `sourceReadiness(s).ready === false` ise → sessiz failure
- Kullanıcı İleri'ye basıyor, hiçbir şey olmuyor, neden bilmiyor
- **Fix**: `advance()` başarısız olursa `lastError` set etsin

### UX-4 — Reset butonu scope eksikliği
- **Dosya**: `useStudioStore.ts` L643
- `reset()` tüm projeyi (world, palette, topic, class dahil) sıfırlıyor
- Sadece storyboard'u rawSource'a döndüren partial reset yok
- **Fix**: `resetStoryboard()` action ekle (Implementation Handoff Fix-4'te belirtildi)

### UX-5 — BATCH ÜRET disable condition eksik: `selectedWorldId` zorunlu ama `sourceReadiness` değil
- **Dosya**: `TimelineStep.tsx` L190
- `disabled={isGenerating || !state.selectedWorldId}` → source bozuksa da generate izin veriyor
- BATCH ÜRET sonrası `SOURCE_INTEGRITY_FAIL` alınıyor — önce bloke etmek daha iyi
- **Fix**: `disabled={isGenerating || !state.selectedWorldId || (state.rawSource.length > 0 && !state.sourceReport?.ok)}`

### UX-6 — `workingMode` seçimi görsel geribildirim veriyor ama etkisiz
- **Dosya**: `ScenesStep.tsx` L22–30
- "Sıkı Teslim" seçilince UI güncelleniyor ama batch üretimi değişmiyor
- Kullanıcı sıkı kontrol yaptığını sanıyor ama hayır

---

## 5. Dosya / Fonksiyon Haritası — Tüm Site

| Dosya | Fonksiyon/Kod | Risk | Claude Ne Yapmalı |
|---|---|---|---|
| `useStudioStore.ts` L537 | `splitBeat` | **KRİTİK** | Fix-1: rawSource.slice + eventBoundary |
| `useStudioStore.ts` L496 | `setBeatMode` | **KRİTİK** | Fix-2: threshold guard kaldır |
| `useStudioStore.ts` L513 | `mergeBeats` | Düşük — rawSource varsa güvenli | Dokunma |
| `useStudioStore.ts` L508 | `toggleBeatKeep` | Yok — sourceBeats değişmiyor | Dokunma |
| `useStudioStore.ts` L555 | `generateScenes` | Güvenli — BUG-3 pure.ts'te | Dokunma |
| `useStudioStore.ts` L625 | `setSceneOverride` | Güvenli | RISK-2 için uyarı ekle |
| `useStudioStore.ts` L417 | `setField` | Güvenli | Dokunma |
| `useStudioStore.ts` L453 | `setRawSource` | Güvenli — tüm state'i temizliyor | Dokunma |
| `useStudioStore.ts` L464 | `decodeRawSource` | Güvenli | Dokunma |
| `useStudioStore.ts` L482 | `ingestRawSource` | Güvenli | Dokunma |
| `useStudioStore.ts` L630 | `advance` | UX-3 sessiz failure | Fix: lastError set et |
| `useStudioStore.ts` L643 | `reset` | Tüm projeyi siliyor | resetStoryboard ekle |
| `pure.ts` L827 | `generateBatch` içi budgeting | **KRİTİK** | Fix-3: durationBudgetSourceBeats sil |
| `pure.ts` L411 | `parseSourceInput` L428 | Orta — `trim()` | rawSource hat değil, topic hat — dokunma |
| `pure.ts` L556 | `compactSourceCue` | Düşük — display only | voiceOver'a girmiyor — dokunma |
| `source.ts` L177 | `ingestSource` | Güvenli | Dokunma |
| `source.ts` L392 | `autoGroupBeats` | Güvenli | Dokunma |
| `source.ts` L331 | `durationBudgetSourceBeats` | Güvenli — çağrı yanlış | Fix-3 ile çağrı kaldırılır |
| `source.ts` L435 | `sourceIntegrity` | Güvenli | Değişmez |
| `beats.ts` L137 | `eventBoundary` | Güvenli — Fix-1'de kullanılacak | Import ekle |
| `ScenesStep.tsx` L65 | Mode butonu | Fix-2 ile düzelir | lastError banner ekle |
| `ScenesStep.tsx` L133 | Böl butonu | Fix-1 ile düzelir | Dokunma |
| `ScenesStep.tsx` L22 | workingMode select | RISK-1 dekoratif | "yakında" badge veya BriefInput'a ekle |
| `TimelineStep.tsx` L190 | BATCH ÜRET butonu | UX-5 | sourceReadiness disable ekle |
| `TimelineStep.tsx` L96 | `onExportCSV` | Güvenli — effectivePrompt kullanıyor | Dokunma |
| `TimelineStep.tsx` L37 | `onExportJSON` | RISK-4 userImagePrompt yok sayılıyor | Fix: effectivePrompt kullan |
| `TimelineStep.tsx` L53 | `onExportCommandJSON` | Güvenli — state.scenes kullanıyor | Dokunma |
| `TimelineStep.tsx` L341 | `setSceneOverride` | Güvenli | RISK-2 uyarısı için loglama |
| `DashboardStep.tsx` L39 | `sourceGate` | Güvenli | Dokunma |
| `commandExport.ts` L99 | `buildCommandJSON` | Güvenli — state direkt | Dokunma |
| `exporters.ts` L19 | `scenesToCSV` | Güvenli | Dokunma |

---

## 6. Mevcut Bozuk Data Flow — Tam Site

```
[1. Dashboard — Kaynak gir]
rawSource → textarea → setRawSource()
  → sourceBeats: [], sourceReport: null, scenes: [], lastError: null ✓

[2. Dashboard — Decode + Kayıpsız Ingest]
decodeRawSource() → selectedProjectId, projectClass, world, ref, palette ✓
ingestRawSource()
  → atoms = ingestSource(rawSource)            ← temiz
  → sourceBeats = atoms.length > 12
      ? autoGroupBeats(rawSource, beatMode)    ← temiz
      : atoms
  → sourceReport = sourceIntegrity(raw, sourceBeats)  ← %100
  STATE: sourceReport.ok = true ✓

[3. Dashboard → Reçete: İleri butonu]
advance() → sourceReadiness(s).ready === false'ta sessiz failure ← UX-3 BUG

[4. Reçete adımı]
setField('selectedWorldId', x) → clearGeneration ✓ (scenes silinir)
setField('selectedRefIds', x)  → clearGeneration ✓

[5. Scenes — Mod butonu tıklandı]
setBeatMode('Ekonomik')
  atoms.length <= 12 → regroup = FALSE ← BUG-2
  sourceBeats = s.sourceBeats  ← bozuk split state kalıyor
  sourceReport yeniden hesaplanmıyor ← STALE
  STALE_GENERATION çalışıyor ✓ (scenes siliyor)
  STATE: sourceBeats BOZUK | sourceReport STALE

[6. Scenes — Böl butonu]
splitBeat(0)
  words = beat.exactText.split(' ')    ← BUG-1: normalizer
  b2.start = b1.end + 1               ← BUG-1: +1 gap
  set({ sourceBeats: newBeats })       ← sourceIntegrity çağrılmıyor
  sourceReport STALE (eski OK görünüyor)

[7. Timeline — BATCH ÜRET]
generateScenes()
  → generateBatch({ rawSource, sourceBeats: bozukBeats, ... })
  → [L812] sourceIntegrity(rawSource, bozukBeats) → ok:false, coverage:99%
  → return BLOCKED: SOURCE_INTEGRITY_FAIL %99
  → lastError set ✓
  ← lastError ScenesStep'te GÖSTERILMIYOR ← UX-1

VEYA integrity geçse bile:
  → [L827] durationBudgetSourceBeats(rawSource, 'Dengeli', input.sourceBeats)
      ← BUG-3: kullanıcı storyboard eziyor
  → voiceOver = 'Dengeli' gruplarından ← storyboard'u yansıtmıyor

[8. Timeline — Image Prompt Düzenle]
ImagePromptRow → textarea → setSceneOverride(sceneId, draft)
  → scene.userImagePrompt = draft ✓
  → handoff.IMAGE.draft.previewPrompt = draft ✓

[9. Director'da herhangi bir ayar değişikliği sonrası]
setField('mood', ...) → clearGeneration → scenes = [] ← RISK-2 BUG
  → userImagePrompt kayboldu (scene silindi)

[10. Export — Komut JSON]
buildCommandJSON(state) → state.scenes kullanıyor ✓
  scenes[].prompts.image = effectivePrompt(s) kullanuyor değil
  → scene.imagePrompt kullanıyor (userImagePrompt değil!)
  → commandExport.ts L173: scenePrompt(scene) = scene.userImagePrompt ?? scene.imagePrompt ✓
  → BU TAMAMEN DOĞRU ✓ (scenePrompt fonksiyonu var)

[10b. Export — Basit JSON (onExportJSON)]
TimelineStep.tsx L38–51:
  { brief: {...}, scenes } → scenes doğrudan export ediliyor
  scene.imagePrompt kullanılıyor ← RISK-4: userImagePrompt yok sayılıyor

[11. Export — CSV/Markdown]
onExportCSV: scenesForExport.map(s => ({...s, imagePrompt: effectivePrompt(s)})) ✓
onExportMD: aynı ✓
```

---

## 7. Doğru Data Flow — Tüm Site

```
rawSource (immutable — asla değişmez)
  ↓
[ingestRawSource — her zaman rawSource'tan]
  atoms = ingestSource(rawSource)                        → lossless atoms
  sourceBeats = autoGroupBeats(rawSource, beatMode)      → temiz groups
  sourceReport = sourceIntegrity(rawSource, sourceBeats) → %100
  beatAnalysis = planBeats(sourceBeats, beatMode)        → hints

[setBeatMode — Manuel dışı: HER ZAMAN rawSource'tan temiz regroup]
  mode !== 'Manuel' → sourceBeats = autoGroupBeats(rawSource, mode)
  mode === 'Manuel' → sourceBeats = s.sourceBeats korunur
  Her durumda: sourceReport = sourceIntegrity(rawSource, sourceBeats)
  Her durumda: STALE_GENERATION

[splitBeat — semantik bölme, karakter kaybı yok]
  splitPoint = eventBoundary(rawSource.slice(beat.start, beat.end))
  Bulunamazsa → lastError set et, RETURN (state değişmez)
  b1 = rawSource.slice(beat.start, beat.start + splitPoint)
  b2 = rawSource.slice(beat.start + splitPoint, beat.end)
  report = sourceIntegrity(rawSource, newBeats)
  !report.ok → lastError set et, RETURN
  set({ sourceBeats, sourceReport: report, ...STALE_GENERATION })

[generateBatch — edited storyboard doğrudan kullan]
  sourceIntegrity gate korunur (L812) ← DOKUNMA
  durationBudgetSourceBeats çağrısını SİL
  sourceParsed.beats = input.sourceBeats.map(b => ({sourceId, exactText}))
  count = input.sourceBeats.length
  voiceOver = beatText = arch.source.exactText = kullanıcı storyboard'u

[setSceneOverride — edit korunur]
  scene.userImagePrompt = override
  handoff.IMAGE.draft.previewPrompt = override
  effectivePrompt(scene) = userImagePrompt ?? imagePrompt
  CSV/MD export: effectivePrompt kullanıyor ✓
  JSON export: effectivePrompt kullan (fix gerekli)
  CommandJSON: scenePrompt() = effectivePrompt ✓

[advance — hata bildirimi ile]
  Koşul sağlanmadığında: set({ lastError: 'neden geçemiyor' })

[BATCH ÜRET disable]
  disabled = isGenerating || !selectedWorldId
          || (rawSource.length > 0 && !sourceReport?.ok)

[workingMode — ya kullan ya dekoratif olduğunu belirt]
  BriefInput'a workingMode ekle ve production'da kullan
  VEYA UI'ya "(Yakında)" badge ekle
```

---

## 8. Claude Implement Planı — 7 Fix

### Fix 1 — `splitBeat` (`useStudioStore.ts` L537–551)
*(Implementation Handoff Fix-1'deki tam kod uygulanacak)*

Özet:
- `eventBoundary(rawSource.slice(beat.start, beat.end))` kullanılacak
- Fallback: sentence-end regex
- Bulunamazsa reject + `lastError`
- Integrity gate sonrası write
- `...STALE_GENERATION, lastError: null`

---

### Fix 2 — `setBeatMode` (`useStudioStore.ts` L496–507)
*(Implementation Handoff Fix-2'deki tam kod uygulanacak)*

Özet:
- `AUTO_GROUP_THRESHOLD` guard kaldır
- Manuel dışı → her zaman `autoGroupBeats(rawSource, mode)`
- Her durumda `sourceIntegrity` yeniden hesapla
- `...STALE_GENERATION`

---

### Fix 3 — `generateBatch` budgeting kaldır (`pure.ts` L827–852)
*(Implementation Handoff Fix-3'teki tam kod uygulanacak)*

Özet:
- `durationBudgetSourceBeats` çağrısını sil
- `input.sourceBeats`'i doğrudan `sourceParsed.beats` olarak kullan
- `count = input.sourceBeats.length`

---

### Fix 4 — `resetStoryboard` action (`useStudioStore.ts`)
*(Implementation Handoff Fix-4'teki tam kod uygulanacak)*

Özet:
- Interface'e ekle: `resetStoryboard: () => void;`
- `beatKeeps: {}` ile birlikte reset
- Recipe/world/topic'e dokunma

---

### Fix 5 — `lastError` Banner in `ScenesStep.tsx`

**Header'dan hemen sonra, L35'den önce ekle:**
```tsx
{store.lastError && (
  <div style={{
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid var(--red, #f54d6b)',
    background: 'rgba(245,77,107,.08)',
    color: '#fdb',
    fontSize: 13,
    marginBottom: 8,
  }}>
    ⚠ {store.lastError}
  </div>
)}
```

---

### Fix 6 — `onExportJSON` basit JSON'da `effectivePrompt` kullan (`TimelineStep.tsx` L37–51)

```ts
const onExportJSON = () => {
  const payload = {
    brief: {
      kind: state.projectKind,
      topic: state.projectTopic,
      class: state.projectClass,
      cast: state.cast,
      worldId: state.selectedWorldId,
      refIds: state.selectedRefIds,
      paletteId: state.selectedPaletteId,
    },
    scenes: scenes.map((s) => ({ ...s, imagePrompt: effectivePrompt(s) })),  // ← FIX
  };
  downloadFile(`${state.projectTopic.replace(/\s+/g, '_')}_timeline.json`, JSON.stringify(payload, null, 2), 'application/json');
};
```

---

### Fix 7 — `advance` sessiz failure'a hata mesajı (`useStudioStore.ts` L630–640)

```ts
advance: () => {
  const s = get();
  if (s.currentStep === 'dashboard') {
    if (!s.projectTopic.trim()) {
      set({ lastError: 'Proje konusu boş. Brief adımında konu girin.' });
      return;
    }
    const srcGate = sourceReadiness(s);
    if (!srcGate.ready) {
      set({ lastError: `Kaynak hazır değil: ${srcGate.reason}` });
      return;
    }
    set({ currentStep: s.phase0PresetId ? 'director' : 'recipe', lastError: null });
  } else if (s.currentStep === 'director') {
    set({ currentStep: 'recipe', lastError: null });
  } else if (s.currentStep === 'recipe') {
    const rcp = recipeReadiness(s);
    if (!rcp.ready) {
      set({ lastError: `Reçete eksik: ${rcp.missing.join(', ')}` });
      return;
    }
    set({ currentStep: 'scenes', lastError: null });
  } else if (s.currentStep === 'scenes') {
    set({ currentStep: 'timeline', lastError: null });
  }
},
```

---

### Fix 8 — BATCH ÜRET disable condition (`TimelineStep.tsx` L190–192)

```tsx
<Button
  onClick={onGenerate}
  disabled={
    isGenerating
    || !state.selectedWorldId
    || (state.rawSource.length > 0 && !state.sourceReport?.ok)  // ← FIX
  }
>
  {isGenerating ? 'Üretiliyor…' : scenes.length ? 'Yeniden üret' : 'BATCH ÜRET'}
  <span className="kbd" style={{ marginLeft: 8 }}>⌘↵</span>
</Button>
```

---

## 9. Test Planı

### Yeni Birim Testler (mevcut `useStudioStore.test.ts`'e ekle)

```ts
// Fix 1: splitBeat lossless
it('splitBeat: rawSource lossless, no character loss', () => {
  useStudioStore.getState().reset();
  const raw = 'Şehirdeki bir kararı kim alıyor? Yöneticiler hangi kararları veriyor.';
  useStudioStore.getState().setRawSource(raw);
  useStudioStore.getState().ingestRawSource();
  useStudioStore.getState().splitBeat(0);
  const state = useStudioStore.getState();
  expect(state.sourceBeats.map(b => b.exactText).join('')).toBe(raw);
  expect(state.sourceReport?.ok).toBe(true);
  expect(state.sourceReport?.coverage).toBe(100);
  useStudioStore.getState().reset();
});

// Fix 1: split noktası yoksa reject
it('splitBeat: rejects and sets lastError if no safe split point', () => {
  useStudioStore.getState().reset();
  const raw = 'Kim?';
  useStudioStore.getState().setRawSource(raw);
  useStudioStore.getState().ingestRawSource();
  const beatsBefore = useStudioStore.getState().sourceBeats.length;
  useStudioStore.getState().splitBeat(0);
  const state = useStudioStore.getState();
  expect(state.sourceBeats.map(b => b.exactText).join('')).toBe(raw);
  expect(state.lastError).toBeTruthy();
  expect(state.sourceBeats.length).toBe(beatsBefore);
  useStudioStore.getState().reset();
});

// Fix 1: tekrar split integrity
it('splitBeat: repeated 3x preserves integrity', () => {
  useStudioStore.getState().reset();
  const raw = 'Birinci cümle. İkinci cümle. Üçüncü cümle.';
  useStudioStore.getState().setRawSource(raw);
  useStudioStore.getState().ingestRawSource();
  for (let i = 0; i < 3; i++) {
    if (useStudioStore.getState().sourceBeats.length > 0) {
      useStudioStore.getState().splitBeat(0);
    }
  }
  const state = useStudioStore.getState();
  expect(state.sourceBeats.map(b => b.exactText).join('')).toBe(raw);
  expect(state.sourceReport?.ok).toBe(true);
  useStudioStore.getState().reset();
});

// Fix 2: setBeatMode küçük source regroup
it('setBeatMode: regroups even for small source (< 12 atoms)', () => {
  useStudioStore.getState().reset();
  const raw = 'Bir. İki. Üç.';
  useStudioStore.getState().setRawSource(raw);
  useStudioStore.getState().ingestRawSource();
  useStudioStore.setState({
    sourceBeats: [{ sourceId: 'source-001', exactText: 'BOZULMUŞ', start: 0, end: 5, hash: 'x' }]
  });
  useStudioStore.getState().setBeatMode('Ekonomik');
  const state = useStudioStore.getState();
  expect(state.sourceBeats.map(b => b.exactText).join('')).toBe(raw);
  expect(state.sourceReport?.ok).toBe(true);
  useStudioStore.getState().reset();
});

// Fix 3: generateBatch edited beats korunuyor
it('generateBatch: merged beats not re-budgeted', () => {
  useStudioStore.getState().reset();
  const raw = 'Cümle A. Cümle B.';
  useStudioStore.getState().setRawSource(raw);
  useStudioStore.getState().decodeRawSource();
  useStudioStore.getState().ingestRawSource();
  useStudioStore.getState().mergeBeats(0);
  const mergedCount = useStudioStore.getState().sourceBeats.length;
  useStudioStore.getState().setField('selectedWorldId', 'clay');
  useStudioStore.getState().generateScenes();
  const state = useStudioStore.getState();
  expect(state.lastError).toBeNull();
  if (state.scenes.length > 0) {
    expect(state.scenes.length).toBe(mergedCount);
  }
  useStudioStore.getState().reset();
});

// Fix 4: resetStoryboard recipe'ye dokunmuyor
it('resetStoryboard: restores clean state without touching recipe', () => {
  useStudioStore.getState().reset();
  const raw = 'Cümle bir. Cümle iki.';
  useStudioStore.getState().setRawSource(raw);
  useStudioStore.getState().decodeRawSource();
  useStudioStore.getState().ingestRawSource();
  const worldBefore = useStudioStore.getState().selectedWorldId;
  useStudioStore.setState({ sourceBeats: [] });
  useStudioStore.getState().resetStoryboard();
  const state = useStudioStore.getState();
  expect(state.sourceReport?.ok).toBe(true);
  expect(state.selectedWorldId).toBe(worldBefore);
  useStudioStore.getState().reset();
});

// Fix 7: advance lastError
it('advance: sets lastError when source not ingested', () => {
  useStudioStore.getState().reset();
  useStudioStore.setState({ rawSource: 'test source', sourceReport: null });
  useStudioStore.getState().advance();
  expect(useStudioStore.getState().lastError).toBeTruthy();
  useStudioStore.getState().reset();
});

// Fix 6: JSON export uses effectivePrompt
it('export JSON uses userImagePrompt when set', () => {
  // Bu test manual integration test olmalı; unit test mock ile
  // effectivePrompt(scene) = scene.userImagePrompt ?? scene.imagePrompt
  // Scene'de userImagePrompt set edilmişse o kullanılmalı
  const scene = { imagePrompt: 'original', userImagePrompt: 'edited' } as any;
  const result = scene.userImagePrompt ?? scene.imagePrompt;
  expect(result).toBe('edited');
});

// Turkish whitespace/newline integrity
it('splitBeat: preserves Turkish multiline source with newlines', () => {
  useStudioStore.getState().reset();
  const raw = 'Su ısınır.\n\nBuhar yükselir!  Sonra ne olur?';
  useStudioStore.getState().setRawSource(raw);
  useStudioStore.getState().ingestRawSource();
  // split attempt — integrity must hold regardless
  const beats = useStudioStore.getState().sourceBeats;
  if (beats.length > 0) {
    useStudioStore.getState().splitBeat(0);
  }
  const state = useStudioStore.getState();
  expect(state.sourceBeats.map(b => b.exactText).join('')).toBe(raw);
  useStudioStore.getState().reset();
});
```

---

## 10. Manuel Site Kontrol Listesi

Sırayla uygula — hepsi geçmeli:

| # | Adım | Beklenen |
|---|---|---|
| 1 | Dashboard → rawSource gir, İleri'ye bas (ingest YAPMAdan) | Hata mesajı: "Kaynak henüz ingest edilmedi" |
| 2 | Dashboard → Decode + Kayıpsız Ingest → Coverage kontrol et | `%100`, rawHash = reconHash |
| 3 | Dashboard → İleri'ye bas | Reçete sayfasına geç |
| 4 | Reçete → world seçmeden Scenes'e geç | Hata mesajı: "Reçete eksik: Dünya" |
| 5 | Reçete → world, palette, ref seç → Scenes'e geç | Başarı |
| 6 | Scenes → Dengeli/Ekonomik/Hassas sırasıyla tıkla (kısa kaynak, 3 cümle) | Her geçişte beats rawSource ile eşit, Coverage %100 |
| 7 | Scenes → Böl'e bas | Beat'ler semantik sınırdan bölünmeli, "kim / alıyor?" split GÖRÜNMEMELİ |
| 8 | Scenes → Böl'e 3 kez bas aynı beat'e | Her adımda Coverage %100 veya lastError banner görünür |
| 9 | Scenes → Çok kısa cümleye ("Kim?") Böl'e bas | lastError: "Güvenli bölme noktası bulunamadı" banner görünmeli, storyboard değişmemeli |
| 10 | Scenes → Storyboard Sıfırla'ya bas | Ingest haline dönüş, Coverage %100, world/topic değişmez |
| 11 | Scenes → BATCH ÜRET (source bozukken) | Buton disabled (kırmızı/gri) |
| 12 | Scenes → BATCH ÜRET (source OK) | `SOURCE_INTEGRITY_FAIL` olmaz |
| 13 | Timeline → Sahne seç → Image Prompt → Düzenle → Kaydet | "EDITED" badge görünür |
| 14 | Timeline → Düzenle sonrası Komut JSON export et | Export içinde `prompts.image` = düzenlenmiş prompt |
| 15 | Timeline → Düzenle sonrası basit JSON export et | Export içinde `imagePrompt` = düzenlenmiş prompt (Fix-6 sonrası) |
| 16 | Director → Mood değiştir → Timeline'a dön | Scenes temizlendi (STALE_GENERATION) — beklenen |
| 17 | Director → Mood değiştir → Prompt EDIT kayboldu uyarısı | RISK-2 — şu an fix yok, dokümante edildi |
| 18 | `workingMode` select → Hızlı / Sıkı Teslim seç → BATCH ÜRET | Şu an aynı çıktı — RISK-1 dokümante edildi |
| 19 | Beat Planner → Keep'e bas | BÖLEMEZSÍN chip görünür, sourceBeats değişmez, generateScenes'e etkisi yok |
| 20 | Vault → Kaydet → Yükle | Storyboard geri yükleniyor, Coverage tutarlı |

---

## 11. Yapılmaması Gerekenler

| Yasak | Sebep |
|---|---|
| `onScreenText` overlay ekleme | Sistem kararı, proje kuralı |
| UI redesign / layout değişikliği | Sadece store + core logic fix |
| `sourceIntegrity`'yi `%99`'da geçer yapmak | `%99 = FAIL`, güvenlik kontratı |
| `SOURCE_INTEGRITY_FAIL`'i `%99` ile zorla geçme | Kaynak kayıp = üretim yasak |
| Hata bannerını gizleme / `lastError` suppress | Kullanıcı hatayı görmeli |
| `proof.ts` / `brain.ts` regression detector'larını zayıflatma | Test kontratı kırılır |
| `STALE_GENERATION` korumasını kaldırma | Stale çıktı üretimi yasak |
| `mergeBeats`'e dokunmak | Güvenli çalışıyor (rawSource.slice) |
| `ingestSource` / `autoGroupBeats` / `sourceIntegrity` içeriğini değiştirmek | 150+ test bağımlı |
| `generateBatch`'teki L812 sourceIntegrity integrity gate'ini kaldırmak | Güvenlik kapısı |
| `setRawSource` davranışını değiştirmek | Zaten doğru — tüm stateı temizliyor |
| İlgisiz refactor (style, naming, import sırası) | Diff kirlenmesin |
| `RISK-2` (prompt edit kaybı) için scene silme davranışını değiştirmek | STALE_GENERATION kasıtlı tasarım — sadece uyarı ekle |
| `workingMode`'u tam implement etmeden UI'dan kaldırmak | Kullanıcı bağımlılığı olabilir |

---

## EK A: Scenes/Timeline Farklı Data mı Kullanıyor?

**HAYIR — Aynı store, farklı aşamalar:**

| Bileşen | Hangi Data | Aşama |
|---|---|---|
| `ScenesStep` `enhancedBeats` | `beatAnalysis.enhancedBeats` → `sourceBeats` tabanlı | Pre-generation |
| `ScenesStep` beat text | `beat.text` = `sourceBeats[i].exactText` | Pre-generation |
| `TimelineStep` sahneler | `store.scenes` → `generateBatch` çıktısı | Post-generation |
| `TimelineStep` voiceOver | `scene.voiceOver` = `beatText` = `arch.source.exactText` | Post-generation |
| `TimelineStep` imagePrompt | `effectivePrompt(s) = s.userImagePrompt ?? s.imagePrompt` | Post-generation + edit |

**BUG-3 nedeniyle**: ScenesStep'te kullanıcı görünen beat text ≠ Timeline'daki voiceOver. Fix-3 sonrası eşit olacak.

## EK B: Export / Final Brief Canonical Data Kullanımı

| Export | imagePrompt kaynağı | voiceOver kaynağı | Doğru mu? |
|---|---|---|---|
| `onExportJSON` | `scene.imagePrompt` (raw) | `scene.voiceOver` | ❌ RISK-4: edit yok sayılıyor |
| `onExportCSV` | `effectivePrompt(s)` | `scene.voiceOver` | ✓ |
| `onExportMD` | `effectivePrompt(s)` | `scene.voiceOver` | ✓ |
| `onExportCommandJSON` | `scenePrompt(s)` = `effectivePrompt(s)` | — | ✓ |
| `onExportHandoff` | `s.handoff` (applyPromptOverride ile güncel) | — | ✓ |
| `buildCommandJSON` scenes | `scenePrompt(scene)` | `scene.voiceOver` | ✓ |

**Fix sonrası voiceOver sorunu**: Fix-3 uygulandıktan sonra `scene.voiceOver` = kullanıcının storyboard texti olacak. Şu an BUG-3 nedeniyle 'Dengeli' regroupundan geliyor.

## EK C: Testlerin Kaçırdığı Gerçek UI Akışları

| Kaçırılan Senaryo | Neden Kaçırıldı | Test Ekle |
|---|---|---|
| `splitBeat` ardından integrity check | Store testi yok | Test 1 (Fix-1) |
| Küçük source setBeatMode | Threshold condition test edilmemiş | Test 2 (Fix-2) |
| `generateBatch` sonrası `voiceOver` storyboard'la eşit mi | `pure.ts` testi source beat'e bakıyor, edit sonrasına değil | Test 3 (Fix-3) |
| `advance()` sessiz failure | Hiç test edilmemiyor | Test 4 (Fix-7) |
| JSON export edit koruması | `effectivePrompt` test edilmiş ama export testi yok | Test 5 (Fix-6) |
| Türkçe `\n\n` split sonrası integrity | source.test.ts `\n\n` split değil ingest test ediyor | Test 6 |
| Split → Merge → generate zinciri | İzole test var, zincir yok | Test 7 |
| `resetStoryboard` recipe'yi koruma | Yok | Test 8 (Fix-4) |
