# GECE TASK BOARD — orta irtifa, üçlüye odaklı

**Odak (Mami):** *"En büyük odak bizim üçlü: reçete = doktor, command = eczacı, kod bütünlüğü."*
**İrtifa:** ışık/gece mikrosu DEĞİL · "sistemi iyileştir" makrosu DEĞİL. **Somut, ölçülebilir, bitirilebilir.**

---

## AJAN KABİLİYET PROFİLİ (deneyimle öğrenildi — buna göre dağıt)

### Codex `gpt-5.6-sol` — DIŞTAN DENETÇİ
**İyi olduğu:** gerçek üretilmiş çıktıyı okumak · pipeline'ı kendi throwaway test'iyle koşturmak · sözleşmeleri adversaryel okumak · **birebir alıntıyla kanıtlamak** · "itaat edemiyorum" demek.
**Zayıf olduğu:** usage SINIRLI (birkaç derin tur) · zanaat nesri yazmaz (dünya/ref yazımı BENİM) · geniş görevde yayılır.
**Nasıl ver:** **DAR ve DERİN.** Tek soru, tek dosya çıktısı, "ZATEN KAPANDI" listesi zorunlu. `--sandbox workspace-write --skip-git-repo-check`, repo'ya DOKUNMAZ, sadece `~/Desktop/FAZ5-PILOT/` okur.
**Verme:** kod yazdırma · dünya/ref yazdırma · geniş refactor.

### Claude subagent (opus) — UYGULAYICI
Testli fix, paralel kulvar, gerçek çıktıyla doğrulama. Worktree ile izole edilebilir.

### Claude subagent (sonnet) — DENETÇİ / MEKANİK
Bağımsız review-ajanı (anti-halüsinasyon, STANDING KURAL) · sayaç/kablolama işleri · ölçüm.

### Fable — SADECE TASARIM
Ayrı worktree. `src/core/*` ve store DOKUNULMAZ. Açık-uçlu yaratıcı 3D/UI.

### Ben (orkestratör)
Task dağıtımı · **zanaat nesri (dünya/ref)** · üçlünün mimarisi · her bulguda "Mami bunu bir cümleyle düzeltir mi?" süzgeci.

---

## TASK BOARD

### 🔴 T1 — E2E BASELİNE KIRIK: gerçek akış DOĞRULANMAMIŞ  `[kod bütünlüğü · DAY-ZERO]`
**Bulgu:** 15 e2e testinin **7'si düşüyor**. Sebep: Fable arayüzü yeniden tasarladı (*"Karar Dosyası"*, *"Hikayenin omurgası"*), **e2e eski arayüzü arıyor** (`PHASE 0 — HAZIR BAŞLANGIÇ`). Birim testleri 1691/1691 yeşil — ama **Mami'nin fiilen kullandığı yol tarayıcıda hiç kanıtlanmamış.**
**Kırık:** `app boots and renders Brief stage` · `Phase 0 preset wires world and lets us complete the full flow` · `Reference DNA complete E2E workflow` · `keyboard shortcut advances` · `per-scene override persists` · `beat-planner` · `screenshots`
**İş:** e2e'yi BUGÜNKÜ arayüze onar. Testi silme/gevşetme — **selector'ı güncelle, akışı koru.** Sonunda **brief → reçete → sahneler → timeline → QA → export** tarayıcıda uçtan uca yeşil.
**Kime:** Claude opus subagent (worktree). Sonra Sonnet review.
**Bitti sayılır:** `npm run test:e2e` 15/15 (ya da kalan kırık için GERÇEK sebep + issue).

### 🔴 T2 — REÇETENİN 11 KARARI → FINAL BRIEF'E HEPSİ GEÇİYOR MU?  `[üçlü · DAY-ZERO]`
**Bulgu:** `RecipeStep.tsx`'te **11 `setField` çağrısı** var (11 karar noktası: dünya · materyal · palet · ref'ler · mood · kamera enerjisi · zaman-ışık · geçiş · POV · imza · leitmotif…). **Hiçbiri sistematik olarak "final brief'e ulaşıyor mu?" diye test edilmedi.**
**İş:** Her karar noktası için: reçetede seç → `agentBrief`'te GÖRÜN → `project.json`'da GÖRÜN. Ulaşmayan varsa **o karar sessizce ölüyor demektir** (`brandKitLock` böyleydi — alan vardı, prompt'a hiç bağlanmamıştı).
**Kime:** Claude opus (test yaz), sonra Codex'e "gerçek çıktıda doğrula" turu.
**Bitti sayılır:** `faz1_triple.test.ts`'te 11 karar × 46 dünya matrisi, hepsi brief'te.

### 🟠 T3 — İKİ EXPORT, TEK GERÇEK Mİ?  `[kod bütünlüğü]`
**Bulgu:** `commandExport.ts` (`buildCommandJSON`) ve `productionExport.ts` (`buildProductionExport`) — ikisi de sözleşme üretiyor. Production, command'ı sarmalıyor. **Drift var mı? Bir alan birinde var diğerinde yok mu? Ajan hangisini okuyor?**
**İş:** İki export'un ALAN ALAN karşılaştırması. Yalnız production'da olan / yalnız command'da olan / ikisinde FARKLI olan. Farklıysa hangisi otorite?
**Kime:** Codex (DAR görev: "iki export'u alan alan diff'le, drift'i birebir alıntıyla göster").

### 🟠 T4 — COMMAND'IN ZEKÂSI: 3 ŞERİT AYNI YASAYI Mİ TAŞIYOR?  `[eczacı]`
**Bulgu:** `agents/MOTION-CALISTIR.command`'da 3 kick şeridi var (Claude TR · Codex EN · Antigravity EN) + `agents/production/` ayrı bir dosya. **Gece-4'te ledger sadece TR şeridine yazılmıştı** — kablo kopukluğu. Şerit-başına kilit testi kondu ama **tam diff hiç yapılmadı.**
**İş:** 4 metni clause clause diff'le. Birinde olup diğerinde olmayan HER kural → drift. Otorite `project.json`'da mı, şeritte mi?
**Kime:** Codex (DAR: "dört .command metnini clause clause diff'le").

### 🟠 T5 — ÖLÜ QA CHECK'LERİ  `[kod bütünlüğü]`
**Bulgu:** `qa.ts`'te CHECK 6/6b, bugünkü `buildMotionPrompt`'un HİÇ basmadığı `"Moving element:"` etiketini arıyor. **Ölü.** `qa.test.ts` onları elle yazılmış fixture'larla yeşil tutuyor; `brain.test.ts` aynı anda TERSİNİ garanti ediyor. **İki test dosyası birbirinin zıddını doğruluyor.**
**İş:** Ya bugünkü gerçek etikete kablola (niyet değerli: sahneler arası kopya-motion yakalamak), ya **dürüst adıyla emekli et** — ama fixture yalanını BİTİR. Test silme yasak; testi GERÇEK çıktıya bağla.
**Kime:** Claude opus.

### 🟡 T6 — `brain-workbench` KOPUK KABLO  `[Mami'nin denetim aracı yalan söylüyor]`
**Bulgu:** `scripts/brain-workbench.ts:108` → `sourceReport: null`. Mami'nin günlük denetim aracında **Encyclopedia/Volition HEP sahte kırmızı** — gerçek sinyal o gürültünün altında kayboluyor.
**İş:** Gerçek `ingestSource` + `sourceIntegrity` zincirini bağla.
**Kime:** Sonnet (mekanik).

### 🟡 T7 — DÜNYA/REF ÇOĞALTMA (devam)  `[zanaat — BENDE kalır]`
46 dünya · 130 ref. **Kopya dünya yazma** — önce envanter, sonra GERÇEK boşluk. Sıradaki gerçek boşluklar: güzellik/moda reklamı · emlak/mimari · sokak fotoğrafı (Türkiye gerçekçiliği) · retro pixel · karanlık masal illüstrasyonu.
**Kural:** her dünya = kendi yasası. İki dünya aynı kareyi üretiyorsa ikincisi zararlı.

### 🔵 T8 — FABLE: FAZ 2 TASARIM  `[ayrı kulvar, worktree]`
**Asıl iş:** **46 dünya plakasının hepsi aynı deniz-günbatımı motifi.** Whiteboard dünyasının kapağında deniz manzarası o dünyayı ANLATMIYOR. `PRESET_PLATE_FILES` sözleşmesi hazır, içi boş.
Diğer: çalışma adımlarında paneller sahnenin %80'ini örtüyor · yakın su gri · DOF alt kenarda yayıyor.
**Kısıt:** `src/core/*` + store DOKUNULMAZ · vitest ≥ 1691 · test silme yok. Her turdan sonra Sonnet review.

### ⚫ T9 — SİMÜLASYON DÖNGÜSÜ (arka planda sürekli)
Paket üret → Codex + Claude'a *"itaat edebiliyor musun?"* → kapat → tekrar sor.
**SÜZGEÇ (her bulguda):** *"Mami bunu prompt'a bakarak bir cümleyle düzeltir mi?"* → **EVETSE KAPATMA**, gözüne bırak.

---

## DAY-ZERO LİSTESİ (hiç yapılmamış / hiç doğrulanmamış)
1. **HİÇ KARE ÜRETİLMEDİ.** Her şey teori. ← en büyüğü
2. **`.command` hiç uçtan uca koşmadı** — Pass A → kareler → Pass B → FRAME_PASS → motion. Gerçek bir ajan bunu hiç yürütmedi.
3. **`brand_refs/` hiç kullanılmadı** — kapı var, hiç sınanmadı.
4. **E2E gerçek akış kırık** (T1).
5. **Reçetenin 11 kararı brief'e ulaşıyor mu — hiç ölçülmedi** (T2).

---

## RTK
Token için `rtk` hook'u aktif (`git status` → `rtk git status`, %60-90 tasarruf). `rtk gain` ile kazancı gör. Ölçüm/analiz turlarında `rtk discover` çalıştır — kaçırılan fırsatları söyler.
