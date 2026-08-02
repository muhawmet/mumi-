---
paths:
  - "src/pages/**"
  - "src/store/**"
  - "src/components/**"
  - "src/App.tsx"
---

# Site katmanı — kapılar, readiness ve bilinen bypass'lar

## Değişmez yasa

Site **karar** üretir, **nihai prompt üretmez**. Görsel katman değişikliklerinde
wizard → recipe → brief → export akışını ve mevcut test setini koru.
"Build geçti" görsel kalitenin kanıtı **değildir**.

## ✅ KAPANAN kusurlar (MACRO 4, 2026-07-15)

- **Tek canonical readiness kuruldu:** `productionReadiness()` (store) — source→recipe→storyboard
  →blocker→shot approval. ProductionPulse/PreviewStage/QA bunu okur; rakip skorlar (productionPulse
  motoru, string sniff `Status: PASS`) söküldü.
- **Duplicate export kapandı:** Timeline'daki gate'siz "Üretim Paketi" düğmesi kaldırıldı; tek
  gate'li yol QA (readiness birincil + teknik lint ikincil).
- **Sidebar bypass kapandı:** ileri atlama `advance()` kapılarından sırayla geçer.
- **Disco konuşan-karakter kaldırıldı:** ThoughtDock mount'u + RecipeRail `kim_kitsuragi` portresi +
  ProductionPulse 26-ses persona söküldü. `qa.ts` teknik lint (PROMPT SURGEON) NÖTR validator kaldı.
- **Preview dürüstlüğü:** archetype görseline "STİL ARKETİPİ · gerçek kare değil" rozeti.
- **Shot approval + frame gate (MACRO 5) eklendi:** Mami her shot'ı onaylar; motion yalnız onaylı
  gerçek frame (SHA-256) ile açılır.

## Bilinen kusurlar (ölçülmüş — tarihsel; yukarıdakiler kapandı)

**Tek canonical readiness YOK — 8+ rakip hesap var ve çelişiyorlar:**
`sourceReadiness` · `recipeReadiness` · `contractGate` · `qaScore` · `quantumScore` ·
`productionPulse` · `evaluateDirectorCabinet`/`exportGateStatus` · `proofDoctor` ·
Preview "Proof" pill'i (`PreviewStage.tsx:62` — `agentBrief?.includes('Status: PASS')`,
**string sniff**).
Somut çelişki: Timeline `QA 100` + "Hazır Sahneler: N/N" yeşil basarken QA adımı aynı
batch'i **blokluyor**. Mami bir ekranda "hazır", sonrakinde "üretimi tutuyor" görüyor.

**Gate fiilen tavsiye — üç bypass yolu:**
1. Sidebar `setCurrentStep`'i çağırıyor (`AppLayout.tsx:122`), tüm kapılar `advance()`
   içinde (`useStudioStore.ts:955-982`) → **sidebar hepsini atlıyor.**
2. Kaynak **opsiyonel**: `useStudioStore.ts:126` — `rawSource` boşsa kapı `ready: true`.
3. Timeline'daki "⬇ Üretim Paketi" düğmesi, QA'daki "ÜRETİMİ ATEŞLE" ile **aynı
   `buildProductionExport` çağrısını aynı dosya adıyla** yapıyor — ama **QA kapısı yok**.
   Cabinet'in blokladığı paket bir adım geriden gate'siz indirilebiliyor.

**Preview sahte.** 46 dünya → **4 statik archetype görseli** (`worldPlates.ts:6-15`).
`ANIMATION_STYLIZED` ile `COMMERCIAL_REAL` aynı `card-hero-archetype`'ı gösteriyor.
World'e göre değişen tek şey palet şeridi ve metin rozetleri.

**`personalMode` yalan söylüyor.** UI "IP guard kapalı" derken `evaluateDirectorCabinet`
ve `contractGate` `personalMode`'u **hiç okumuyor** — firewall aslında açık.

**Shot kavramı UI'da YOK.** `grep shot` → `src/pages/` altında sıfır eşleşme.
Shot yalnız export JSON'unda yaşıyor. **Mami site içinde hiçbir kareye onay veremiyor.**

<!-- bag-yok: iki dosya da SİLİNDİ; adları bilerek anılıyor, kusur sınıfı kayda geçsin -->
**Ölü kod (KAPANDI):** `src/components/Advisors.ts` world'e göre IP karakter adları
(`sanji`, `zoro`, `rengoku`) döndürüyordu ve `src/components/Sidebar/Sidebar.tsx` boş dosyaydı.
**İkisi de silinmiş.** Kayıt duruyor çünkü kusur sınıfı duruyor: IP firewall'un (`proof.ts:11`)
yasakladığı isimleri taşıyan bir dosya, hiçbir yerden import edilmediği için gözden kaçmıştı.

## Disco QA katmanı

`qa.ts` (7 ses) ve `innerVoices.ts` (26 ses) iki paralel persona sistemi.
Decision Pipeline'da **kişilikler kaldırılır** — ama `PROMPT SURGEON`'ın denetimleri
(hex sızıntısı `qa.ts:336-344` · özne+ışık+kamera triad'ı `:362-383` · motion klon tespiti
`:457-483`) **bugünkü tek gerçek prompt lint'idir**. Nötr validator olarak **korunur**, silinmez.
