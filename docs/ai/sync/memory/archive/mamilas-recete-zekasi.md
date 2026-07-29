---
name: mamilas-recete-zekasi
description: "Kaldıraç reçetedir: reçete iyileşirse prompt iyileşir. Enzim'in 4 kilidinden 3'ü (karakter oranı, @tag listesi, cast yaşı/sınıf) BaseDecision'da hiç yok — geri sarmanın kaynağı bu."
metadata: 
  node_type: memory
  type: project
  originSessionId: 321f2fb4-68f0-4606-89df-a9cd34c99f22
  modified: 2026-07-26T08:45:16.628Z
---

Mami'nin 2026-07-26 mandası, çatalı iptal edip ölçütü değiştirdi:

> *"Zekayı upgrade edecek hamleler yapıyoruz, downgrade varsa yapma. Site güzel yön veren bir
> yer sonuçta, sohbette beraber yaratıyoruz — ama **reçete çok iyi olursa sen de çok daha iyi
> yazarsın**, siteye o özelliği eklersin. Keşfet, adapte ol, düzelt."*

**Ölçüt: zekâ artıyor mu?** Silme nötrdür, upgrade değildir → **silme masadan kalktı.**
`audit_full.ts` (542 satır, sıfır importer) ve `productionPulse.ts` silinmiyor.

**Düzeltilen kendi hükmüm:** `advisor.ts`'i "ekran süsü" saymıştım — yanlış. `suggestRecipe`,
`dnaStrength`, `refFit`, `starterPackFor` **reçete zekâsıdır**; silinecek yer değil, büyütülecek
yer. Importer'ın yalnız UI'da olması ölü demek değil.

## Ölçülmüş kusur — taşıma kapasitesi

`BaseDecision` (contract.ts:208-231) zengin: dünya/malzeme/palet/refs/cast/sceneCount, engine,
mode (osTextMode, voSyncMode), 10 creativeControl (mood, cameraEnergy, timeLight, pov, signature,
leitmotif, tempoCurve, directorBrief…), sahne notları (vo, event, director_note, motion_seed,
turkish_labels, avoid), mamiDirectives. Kimlik kuralı kodun kendi yorumunda: *"EVERY decision
that reaches the prompt reaches the identity."*

**Ama [[mamilas-enzim-hiz-yonergesi]]'nin dört kilidinden üçü reçetede YOK:**

| Enzim kilidi | Durum |
|---|---|
| Yazı planı | ✅ `osTextMode` + `deliveryPromise` + `turkish_labels` |
| Preset | 🟡 `signature`/`mood` var, adlandırılmış preset yok |
| **Karakter oranı (50-50)** | ❌ alan yok |
| **@tag listesi** (@efe/@mira/@araba) | ❌ alan yok — `refs[]` referans *görseli*, tag değil |
| **Cast yaşı / sınıf** | ❌ alan yok — `export type Cast = string` (serbest metin) |

**Yetenek hükmü:** Enzim "kesim masasında kilitle" diyor ama **kilitlenecek alan yok.** Bu üç
karar her prodüksiyonda sohbette yeniden konuşuluyor → Mami tekrar söylüyor, ajan tahmin ediyor,
tahmin kayınca kare yeniden üretiliyor. **Geri sarmanın kaynağı kelime kusuru değil, taşıma
kapasitesi kusuru.** "6. sınıf = ~11-12 yaş" yasası reçetede yaşamıyor.

**İkinci kusur:** `AUTHORITY_HIERARCHY` liste sabiti, çözücü değil (brain.ts:2288 tanım, tek
kullanımı :2407 brief metnine basmak). Gerçek çatışma ad-hoc ikili kapılarda çözülüyor ve
**kaybeden directive sessizce eziliyor** — makbuz yok, sonraki oturum aynı tartışmayı sıfırdan
yapıyor.

**Bedeli:** üç alan kimliğe girerse `commandId` hash'i değişir → mevcut command dosyaları bayat.
2026-07-26'da ölçüldü: bekleyen `.command.json` **yok**, yani geçiş maliyeti sıfır.

Operasyon: `docs/superpowers/plans/2026-07-26-mamilas-kalp-nakli.md` ·
receipt: `artifacts/decision-pipeline-implementation/receipts/KALP-G1.md`
İlgili: [[mamilas-site-tarif-ajan-prompt]] · [[mamilas-command-json-blokajlari]] ·
[[mamilas-v2-kutuphane-makro]]
