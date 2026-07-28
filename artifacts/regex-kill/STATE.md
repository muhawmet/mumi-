# REGEX-KILL OPERASYONU — TASK HAFIZASI

**Plan:** `~/.claude/plans/synthetic-cuddling-clover.md` (onaylı 2026-07-24).
**Makro vizyon:** Motoru "ince kabuk" yap. Ruh 3 yerde: VERİ (world/ref alanları) + AJAN (interpretation)
+ İNSAN (Mami/APPROVED.md). Motor tahmin değil OKUMA yapar. regex EKLEME YASAK — hepsi KALDIRMA.
**Giriş kapısı:** tsc0 · vitest 2053 · build✓ (2026-07-24).

## KURAL (her task)
kök göster → kırmızı test → fix → yeşil → kapı (tsc→vitest→build) → Opus garanti denetçi (read-only).
TS↔mjs byte-parite ŞART. sceneContextHash'e giren alan → `--migrate-command-context` (mjs:256).
Her task ayrı `/clear`. Bitince buraya LOG. Mami "teslim" der → bu klasör silinir.

## SIRA
C1 → C2 → C3 → B1 → B2 → A3 → A1 → A4 → A5 → A2

---

## FAZ C — açık bug'lar (izole)

### C1 — motionCadence IMAGE context'e ekle · **DONE ✅ (commit bd53eb1, main'e push'landı)**
Kök: commandExport.ts:478 sözleşme "worldPacket.motionCadence oku" der, buildImageAuthorContext
(agentProtocol.ts:428-444) IMAGE return'ünde motionCadence YOK. → alan ekle, migration.
Log:
- **Kök kanıtlı:** IMAGE world bloğu motionCadence taşımıyordu; MOTION (agentProtocol.ts:486 /
  mjs:896) taşıyor. M2 vocabularyExamples vakasının aynısı (sessiz alan-düşürme).
- **Kırmızı test:** commandExport.test.ts'e dedicated `it('carries worldPacket.motionCadence...')`
  eklendi (inline worldPacket'li command). Kırmızı doğrulandı: `expected undefined to be '24fps…'`.
- **Fix:** motionCadence alanı IMAGE world bloğuna eklendi — **TS (agentProtocol.ts) + mjs ikizi**
  (byte-aynı yorum+konum, paletteAsLight'tan sonra). Yeşil.
- **Migration/parite (kanıtlı):** canonicalize key-sort + undefined-drop → motionCadence her zaman
  dolu string (pure.ts:501) → worldPacket'li command'lerin sceneContextHash'i DEĞİŞİR. commandFixture
  (TS buildCommandJSON, world=pixar_3d_edu) mjs runner'dan geçiyor = TS-export↔mjs-runtime hash
  paritesi END-TO-END guardlı. **Guard'ın CANLI olduğu kanıtlandı:** mjs satırını geçici silince
  `commandRuntime > valid command → image_author` KIRMIZI oldu (validation≠PASS); geri yükleyince
  yeşil. Migration testi (commandRuntime.test.ts:167 `--migrate-command-context`) mjs imageContext'i
  motionCadence'le yeniden mühürlüyor, yeşil.
- **Kapı durumu (2026-07-24 resume):** TAM kapı yeşil — `npx tsc --noEmit`=0 hata · `npx vitest run`
  **2054/2054** · `npm run build`✓. test-baseline 2053→2054 hizalandı.
- **Opus garanti denetçi (read-only) YEŞİL:** 4 madde ✅ (IMAGE bloğu ekli · TS↔mjs alan-özdeş parite ·
  test gerçekten alanı koruyor, hollow değil) + ⚠️ tek operasyonel koşul: fix-öncesi üretilmiş eski
  command artifact'leri bir kez `--migrate-command-context` ile yeniden mühürlenmeli (bu yol tam bu
  context-şema evrimi için var, regresyon DEĞİL; storyboardHash'e girmez → tamper penceresi açılmaz).
  Verdict: "C1 fix doğru ve güvenli."
- **Değişen dosyalar:** src/core/agentProtocol.ts, scripts/mamilas-command.mjs, src/core/commandExport.test.ts.

### C2 — refs hash-drift parite (R3) · **DONE ✅ (commit a98a4c8, main'e push'landı)**
Kök: mjs:853 `(refs ?? []).filter` vs agentProtocol.ts:447 `refs?.filter`. undefined refs'te 2 farklı hash. mjs'i TS'e hizala.
Log:
- **Kök kanıtlı:** TS `refs?.filter`→undefined→canonicalize (contract.ts:365 `!==undefined`) anahtarı düşürür;
  mjs `(refs ?? []).filter`→`[]`→`"refs":[]` kalır. İki farklı sceneContextHash. mjs canonicalize (:223) de
  undefined düşürüyor → fix işe yarar. mjs'de `.refs` başka tüketici YOK (yalnız 853) → undefined güvenli.
- **Kırmızı test:** commandRuntime.test.ts'e `undefined worldPacket.refs TS↔mjs hash paritesi (R3)` eklendi
  (worldPacket.refs sil → TS gibi sceneContextHash'leri yeniden mühürle → mjs runner). Kırmızı doğrulandı:
  `scene 1 contextHash stale/tampered` (expected 1 to be +0).
- **Fix:** mjs:853 `refs?.filter` (byte-davranış TS agentProtocol.ts:447 ile aynı, `?? []` kaldırıldı). Yeşil.
- **Kapı:** tsc0 · vitest **2055/2055** · build✓. test-baseline 2054→2055.
- **Opus garanti denetçi YEŞİL:** 5 madde ✅ (mjs↔TS byte-parite · downstream refs güvenli undefined ·
  canonicalize iki tarafta `!==undefined` simetrik · normal export regresyonsuz — toWorldPacket refs hep dizi ·
  test hollow değil, ayrışmayı canlı runner üzerinden ispatlıyor). Verdict: "doğru, tam, gerçekten test edilmiş."
- **Değişen dosyalar:** scripts/mamilas-command.mjs, src/core/commandRuntime.test.ts, .claude/test-baseline.

### C3 — image engine-gate fallback simetrisi · **WON'T-FIX-NOW ⏭️ (Mami kararı 2026-07-24)**
Kök: agentProtocol.ts:109 image engine-gate prefix-fallback YOK (motion :142 VAR).
**BULGU (fix'ten önce ölçüldü):** iki mined dataset FARKLI anahtar konvansiyonu kullanıyor —
`motionEngine` PREFIX'le (`kling` → kling_3/turbo/o3 fallback anlamlı), `engine` (image) TAM-ID'yle
(`nano_banana_2`) anahtarlı. Prefix-fallback'i image'e eklemek 6 UI modelinin HİÇBİRİNİ değiştirmiyor:
nano_banana_2 tam-key zaten tutar (fallback tetiklenmez); flux_1_1_pro→flux, dall_e_3→dall, imagen_4→imagen,
ideogram_3→ideogram, firefly_4→firefly → hiçbiri için key yok → hepsi `[]` (bugünkü davranış).
→ fix = NO-OP + yanıltıcı (var olmayan prefix-konvansiyonu ima eder) + ölçülmemiş motora spekülatif kod
(CLAUDE.md ihlali riski). Non-nano'ya gerçek madde = İÇERİK = ölçüm-önkoşullu ayrı Mami kararı.
**Mami kararı:** atla, körleme no-op yazma. İçerik işi generateBatch ölçümünden sonra.
Log: kapatıldı (kod dokunulmadı).

## FAZ B — brief/prompt temizlik (mimariye dokunmaz)

### B1 — final brief şişme (CARRY OVER) · **DONE ✅ (commit 9865ce1, main'e push'landı)**
Kapsam: Mami kararıyla YALNIZ CARRY OVER tekrarı. perRef-diff + §2 blok = agentBrief↔primePacket iki-yüzey
örtüşmesi (ayrı, daha büyük refactor — bu tek brief'te 1× görünüyor, şişme değil).
Log:
- **Kök gerçek çıktıyla kanıtlı (generateBatch, fixture DEĞİL):** §7 dossier'de ~600 karakterlik DEĞİŞMEZ
  CARRY OVER gövdesi her HOLD sahnesi altında birebir. 6-sahne brief → 5 kopya; 69-sahne gerçek koşu → 68
  kopya ≈ 40KB. Tek varyans: saat değişince shot-özel `time of day CHANGES (was→now)` cümlesi.
- **Mami seçimi:** "yasa 1 kez + kısa işaretçi" (AskUserQuestion, önerilen). Körleme değil, seçildi.
- **Kırmızı test:** faz1_triple.test.ts `invariant body is stated once` — `governed by THIS shot` sayısı.
  Kırmızı: `expected 5 to be 1`.
- **Fix (brain.ts):** (1) per-shot blok → kısa `CARRY OVER from shot N: hold per the Carry-Over Law (§7).`
  + saat değişince shot-özel `EXCEPT its time of day CHANGES here (was → now)...`. (2) §7'ye `CARRY-OVER LAW`
  bir kez (scenes.length>1 koşullu). Tire'li başlık `/CARRY OVER/` boşluk-regex'ine takılmaz → carries sayacı korunur.
- **Yeşil + regresyon yok:** yeni test + `every shot after the first` (carries===scenes) + `carryOver does not
  freeze the clock` (clock-change korundu) üçü de PASS. Gerçek çıktıda body 1×, sahne-altı kısa satır doğrulandı.
- **Kapı:** tsc0 · vitest **2056/2056** · build✓. test-baseline 2055→2056.
- **Opus garanti denetçi YEŞİL:** 6 madde ✅ (anlam korundu — eski gövdenin her öğesi §7 yasasında ·
  shot-özel saat değişimi korundu · TEK üretim yeri, bırakılmış kopya yok · shot-1 establishes korundu ·
  3 test gerçek+yeşil, tireli başlık carries sayacını şişirmiyor · tek-sahnede yasa basılmıyor). Verdict:
  "meaning-preserving ve doğru." Tek not: "obey it exactly" ibaresi düştü, anlamı "and by nothing else" taşıyor.
- **Değişen dosyalar:** src/core/brain.ts, src/core/faz1_triple.test.ts, .claude/test-baseline.

### B2 — prompt çift-yankı + NO-OP clause · **TODO**
Log: _(boş)_

## FAZ A — regex yok etme (makro kök)

### A3 — gece/olay ajana devret (clockMap+countEvents Türkçe-\b öldür) · **TODO**
#2 gece-paleti bug'ını (pure.ts:506 + brain.ts:1443) kökten çözer. Deterministik carry-over korunur.
Log: _(boş)_

### A1 — render_law fizik/prop ayrımı (splitRenderLawPhysics öldür) · **TODO**
world.render_physics + render_props ayrı alan. 46 world veri. migration.
Log: _(boş)_

### A4 — deriveProductionPath 17-if öldür · **TODO**
Log: _(boş)_

### A5 — SCENE_INTENTS round-robin öldür (pure.ts:1208) · **TODO**
Log: _(boş)_

### A2 — DNA_MAP 118-regex öldür (ref.channels yapısal alan) · **TODO**
En büyük iş, en olgun noktada. brain-data.ts:30 kaldırılır. migration.
Log: _(boş)_

---

## GENEL LOG (kronolojik)
- 2026-07-24: Operasyon kuruldu. Plan onaylı. Sıra: C1→...→A2. C1 başlıyor.
- 2026-07-24 (resume, usage döndü): **C1 ✅(bd53eb1) · C2 ✅(a98a4c8) · C3 ⏭️WON'T-FIX(no-op, Mami atla) ·
  B1 ✅(9865ce1)** — hepsi kapı+Opus denetçi yeşil, main'e push'lu. **SIRADA: B2** (prompt çift-yankı +
  NO-OP clause) — temiz /clear'lı ayrı oturumda başla. Baseline 2056.
