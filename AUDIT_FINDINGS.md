# MAMILAS-MODERN — DENETLEME TURU BULGULARI

## ÖZET TABLO (Lane × Severity)

| Lane | P0 (Kırık/Bloklayıcı) | P1 (İşlev Eksik/Yanlış) | P2 (UX/Premium Cila) | Toplam |
| :--- | :--- | :--- | :--- | :--- |
| **A** (Runtime/Render) | 1 | 1 | 3 | **5** |
| **B** (İşlev Paritesi) | 0 | 8 | 0 | **8** |
| **C** (Beyin/Doğruluk) | 1 | 1 | 0 | **2** |
| **D** (State/Store) | 1 | 3 | 5 | **9** |
| **E** (Premium/UX) | 0 | 0 | 2 | **2** |
| **F** (Ölü Kod) | 0 | 0 | 2 | **2** |
| **Genel Toplam** | **3** | **13** | **12** | **28** |

---

## LANE A — Runtime & Render Bulguları

[ID]  FINDING-A1
LANE  A
SEV   P0
WHERE src/components/Layout/AppLayout.tsx:93
WHAT  `shell`'in `minHeight: 100vh` olması ve `body`'deki `overflow: hidden` nedeniyle, uzun içerikler aşağıya doğru taşarak tamamen kırpılıyor ve scroll edilemiyor.
PROOF `shell` flex container olarak içindeki `.ml-main` kadar uzar. Ancak ana gövde (`body` ve `#root`) `height: 100%` ve `overflow: hidden` ile kilitlendiği için taşan içerik gizlenir.
BAR   `height: '100vh'` yapılarak `.ml-main`'in `overflowY: 'auto'` özelliği tetiklenmelidir.

[ID]  FINDING-A2
LANE  A
SEV   P1
WHERE src/pages/Timeline/TimelineStep.tsx:214
WHAT  Mobil görünümlerde (max-width: 820px) `.timeline-layout` sınıfı için bir CSS ezişi unutulduğu için ekranı aşan yatay bir grid oluşuyor.
PROOF `TimelineStep` içinde inline style olarak `gridTemplateColumns: 'minmax(280px, 1fr) 1.6fr'` verilmiş. Mobil ezişi `.timeline-layout` için atlanmış.
BAR   `index.css` içindeki mobil media query'sine `.timeline-layout { grid-template-columns: 1fr !important; }` eklenmeli.

[ID]  FINDING-A3
LANE  A
SEV   P2
WHERE src/components/Layout/AppLayout.tsx:121
WHAT  Aktif adımı gösteren `activeBar` bileşeninin sabit konumu, mobilde yatay hale gelen `.ml-sidebar` düzeninde uyumsuz kalıyor.
PROOF `activeBar`, dikey (column) düzene bağlı olarak `position: absolute` ile tasarlanmış. Mobilde anlamsız boyutta kalıyor.
BAR   Yatay görünüm için `bottom` hizalamalı duyarlı bir durum kullanılmalı.

[ID]  FINDING-A4
LANE  A
SEV   P2
WHERE src/components/Layout/AppLayout.tsx:125
WHAT  `.stepBtn` içindeki `width: '100%'` inline değeri ve eksik no-wrap tanımı, yatay mobil düzende metin kırılmalarına yol açıyor.
PROOF Sidebar `row` olduğunda buton genişliği %100 olmamalı.
BAR   `whiteSpace: 'nowrap'` eklenmeli.

[ID]  FINDING-A5
LANE  A
SEV   P2
WHERE src/styles/index.css:104
WHAT  Responsive `.ml-main` padding değeri inline stiller ile CSS `!important` üzerinden zorla çakıştırılarak kontrol ediliyor.
PROOF `AppLayout.tsx` (166. satır) içerisinde `padding` JavaScript ile inline atanmış. Mobilde `!important` kullanılmış.
BAR   Padding yönetimi inline stillerden tamamen çıkartılmalı.

---

## LANE B — İşlev Paritesi Bulguları

[ID]  FINDING-B1
LANE  B
SEV   P1
WHERE src/pages/Recipe/RecipeStep.tsx:243
WHAT  Marka Kiti kilidi tek bir `textarea` ile geçiştirilmiş.
PROOF Kodda sadece `<textarea value={brandKitLock} />` bulunuyor. Eski sitedeki 5 yapılı alan ve müşteri onayı kilidi mekanizması yok.
BAR   mamilas.html "Marka Kiti Kilidi" (MARKA ADI, LOGO NOTU, vs. ayrı inputlar).

[ID]  FINDING-B2
LANE  B
SEV   P1
WHERE src/pages/Recipe/RecipeStep.tsx:251
WHAT  Varyant Testi (A/B/C) sadece "Mock" butonlarından oluşuyor ve entegre bir test akışı sunmuyor.
PROOF UI kodunda `Dünya Varyantı (Mock)` yazılı statik string set eden butonlar var. Hazır değil durumu ve gerçek varyantlı üretim eksik.
BAR   mamilas.html "3 palet varyantı / 3 world varyantı" butonları.

[ID]  FINDING-B3
LANE  B
SEV   P1
WHERE src/pages/Recipe/RecipeStep.tsx:120
WHAT  Yaratıcı DNA seçimi tek bir basit HTML `<select>` elemanına indirgenmiş; çoklu DNA slotu ve arama özelliği yok.
PROOF `selectedRefId` tek bir state olarak tutuluyor. "+ DNA ekle" veya 3 slot mekanizması kodda mevcut değil.
BAR   mamilas.html "Yaratıcı DNA (1/3)" slotları.

[ID]  FINDING-B4
LANE  B
SEV   P1
WHERE src/store/useStudioStore.ts
WHAT  AMAÇ (Eğitim/Stilize/Reklam vb.) seçici menüsü tamamen kayıp.
PROOF `projectClass` store'da mevcut ancak UI üzerinden (ör. RecipeStep) kullanıcıya AMAÇ seçimi sunulmuyor, otomatik geçiştirilmiş.
BAR   mamilas.html "AMAÇ & GÖRSEL DÜNYA"

[ID]  FINDING-B5
LANE  B
SEV   P1
WHERE src/components/Layout/AppLayout.tsx:80
WHAT  Sağ panel (Adaptif Önizleme) zengin işlevlerini kaybetmiş, çip ve sayaçlar yok.
PROOF Sadece `PreviewStage` ve `GoldenViewer` render ediliyor. "BU TAMAM", çip listeleri, BATCH READINESS sayaçları kayıp.
BAR   mamilas.html Sağ panel (ADAPTİF ÖNİZLEME).

[ID]  FINDING-B6
LANE  B
SEV   P1
WHERE src/components/Layout/AppLayout.tsx:7
WHAT  PROMPT LAB adımı menüde ve akışta hiç yok.
PROOF `STEPS` array'i içinde yalnızca dashboard, recipe, scenes ve timeline var. 4. adım olan Prompt Lab eksik.
BAR   mamilas.html `4 · PROMPT LAB`

[ID]  FINDING-B7
LANE  B
SEV   P1
WHERE src/pages/Scenes/ScenesStep.tsx
WHAT  Sahneler adımında toplu işlem, kalite kontrol ve sahne numaralandırma işlevleri eksik.
PROOF Kodda yalnızca Beat Planner ve basit bir Storyboard döngüsü var. "Renumber", "Toplu Onayla", "İlk/Orta/Son Kalite Kontrolü" butonları veya fonksiyonları yok.
BAR   mamilas.html Sahneler kontrolleri.

[ID]  FINDING-B8
LANE  B
SEV   P1
WHERE src/pages/Timeline/TimelineStep.tsx
WHAT  Ayrı bir EXPORT adımı yok; Timeline içine basit butonlarla gömülmüş ve paket toplu indirme paneli eksik.
PROOF `TimelineStep.tsx` içinde "Handoff", "JSON" butonları var fakat profesyonel bir export configurator veya toplu paket yönetim arayüzü yok.
BAR   mamilas.html EXPORT adımı.

---

## LANE C — Beyin & Çıktı Doğruluğu Bulguları

[ID]  FINDING-C1
LANE  C
SEV   P0
WHERE src/core/proof.ts:51
WHAT  `proofDoctor` fonksiyonu `SURGERY_DATA.regression` veritabanını tam işlemek yerine sadece hardcoded 3 kuralı (`reg_real_path_contamination`, vb.) kontrol ediyor.
PROOF Kodda `if (reg.id === 'reg_real_path_contamination' ...)` şeklinde mock-up mantığı yazılmış. Genişletilebilir regression motoru çökmüş durumda ve sahte PASS veriyor.
BAR   -

[ID]  FINDING-C2
LANE  C
SEV   P1
WHERE src/core/proof.ts:39
WHAT  `quantumScore` çıktı kalitesini değerlendirmek yerine rastgele `+10`, `+20` gibi statik puanlarla sahte bir doluluk skoru üretiyor.
PROOF Kod, `if (state.projectTopic) score += 10;` şeklinde çalışıyor. Promptların asıl semantic zenginliği hesaba katılmıyor.
BAR   -

---

## LANE D — State / Store Bulguları

[ID]  FINDING-D1
LANE  D
SEV   P0
WHERE src/store/useStudioStore.ts:257
WHAT  `migratePersistedState` sadece root state'i migrate edip olası vault snapshot içindeki sahneleri atlıyor.
PROOF Eğer vault mantığı dışarıdan eklenirse `persisted.vault` iterate edilmediği için eski state sızıntısı yaşanır.
BAR   -

[ID]  FINDING-D2
LANE  D
SEV   P1
WHERE src/store/useStudioStore.ts:67
WHAT  Readiness kapısında `selectedPaletteId` boş string (`""`) olsa bile seçilmiş sayılarak validasyon deliği yaratıyor.
PROOF `if (s.selectedPaletteId === null || s.selectedPaletteId === undefined)` kontrolü, initial state olan `""` için false döner ve eksikler listesine 'Palet' eklemez.
BAR   -

[ID]  FINDING-D3
LANE  D
SEV   P1
WHERE src/store/useStudioStore.ts:260
WHAT  Migration sırasında `scenes.every(hasCurrentSceneShape)` kullanımı tek bir malformed sahne yüzünden tüm geçerli sahneleri siliyor.
PROOF Sahnelerden sadece biri güncel yapıda değilse `every()` false döner ve tüm sahneler toptan silinir.
BAR   -

[ID]  FINDING-D4
LANE  D
SEV   P1
WHERE src/store/useStudioStore.ts:362
WHAT  `mergeBeats` ve `splitBeat` işlemleri `sceneCount` değerini değiştiriyor ancak üretilmiş `scenes` dizisini temizlemiyor.
PROOF Yeni beat'ler set edilirken `scenes: []` yapılmadığı için üretilmiş sahneler state'te bayat (stale) olarak kalıyor.
BAR   -

[ID]  FINDING-D5
LANE  D
SEV   P2
WHERE src/store/useStudioStore.ts:470
WHAT  Eğer `loadFromVault` uygulanırsa, snapshot'ta bulunmayan yeni nesil state alanlarını temizlemiyor.
PROOF `return { ...entry.snapshot, ... }` shallow merge yapacağından eski state alanları asılı kalır.
BAR   -

[ID]  FINDING-D6
LANE  D
SEV   P2
WHERE src/store/useStudioStore.ts:267
WHAT  `migratePersistedState` sahneleri geçersiz kılıp sildiğinde `agentPackets` verisini temizlemiyor.
PROOF `agentBrief` sıfırlanırken `agentPackets: persisted.agentPackets || null` şeklinde kontrolsüz korunuyor.
BAR   -

[ID]  FINDING-D7
LANE  D
SEV   P2
WHERE src/store/useStudioStore.ts:240
WHAT  `presetWithDefaults` metodu üretilmiş verileri sıfırlarken `agentPackets` objesini atlıyor.
PROOF `scenes: []` yapılıp `agentPackets: null` yapılmadığı için sızıntı oluyor.
BAR   -

[ID]  FINDING-D8
LANE  D
SEV   P2
WHERE src/store/useStudioStore.ts:301
WHAT  `setRawSource` çağrıldığında eski kaynağa ait `beatAnalysis` temizlenmeyip asılı kalıyor.
PROOF `sourceBeats: []` sıfırlanırken `beatAnalysis` atlanıyor.
BAR   -

[ID]  FINDING-D9
LANE  D
SEV   P2
WHERE src/store/useStudioStore.ts:291
WHAT  `setField` metodu içindeki `generationFields` listesinde `brandKitLock` alanı eksik.
PROOF `brandKitLock` değiştiğinde `clearGeneration` tetiklenmiyor ve sahneler asılı kalıyor.
BAR   -

---

## LANE E — Premium/UX Cila Bulguları

[ID]  FINDING-E1
LANE  E
SEV   P2
WHERE src/pages/Timeline/TimelineStep.tsx:166
WHAT  "Ajan Paketleri" seçim kutusunda (dropdown) aşağı ok (`▼`) işareti, overlay olarak konumlandırılmış, üzerine tıklandığında menüyü açmıyor.
PROOF Kodda `<span style={{ position: 'absolute', pointerEvents: 'none' }}>▼</span>` var, bu click intercept'i önlese de premium his vermiyor.
BAR   -

[ID]  FINDING-E2
LANE  E
SEV   P2
WHERE src/pages/Recipe/RecipeStep.tsx:119
WHAT  `recipe-controls-grid` içerisinde kutular (Panels) arasında dikey hizalama ve boşluklar ekran genişliğine göre dengesiz kalıyor.
PROOF Flex/grid boşlukları orantısız ve mobil öncesi ara ekranlarda kutu yükseklikleri stretch olup içi boş hissediliyor.
BAR   -

---

## LANE F — Ölü Kod & Çöp Bulguları

[ID]  FINDING-F1
LANE  F
SEV   P2
WHERE src/core/pure.ts
WHAT  Dışa aktarılan (exported) ancak hiçbir komponent tarafından kullanılmayan yardımcı fonksiyonlar mevcut.
PROOF `groupedWorlds` veya `groupedRefs` gibi fonksiyonlar komponentlerde kullanılmakla beraber bazı parser yardımcıları çağrılmıyor.
BAR   -

[ID]  FINDING-F2
LANE  F
SEV   P2
WHERE src/index.css:75
WHAT  `.dashboard-step` sınıfı CSS'de tanımlı ve animasyon alıyor ancak React bileşenlerinde bu sınıfa sahip ana bir Dashboard komponenti yok.
PROOF İlgili adımın komponenti isimlendirilirken uyumsuz bir CSS sınıfı referansı verilmiş.
BAR   -

---

## CLAUDE (Opus 4.8) BAĞIMSIZ TEYİT — 2026-06-22

**Repo bütünlüğü:** Antigravity HİÇBİR kaynak dosyayı değiştirmedi (git: 0 modified,
yalnız bu dosya eklendi). Read-only kuralına uydu — bozma yok.

**Bulgu teyidi (koda bakılarak):**

| ID | Verdict | Not |
|---|---|---|
| A1 | ✅ CONFIRMED P0 | Gerçek scroll bug; kök sebep doğru (shell minHeight + body overflow:hidden + main yükseklik yok). |
| A2 | ✅ CONFIRMED | timeline-layout inline 2-kolon, ≤820px media ezişi yok → mobil yatay taşma. |
| A3,A4,A5 | ✅ CONFIRMED P2 | Mobil sidebar/activeBar/padding kozmetik; gerçek ama düşük öncelik. |
| B1 | ✅ CONFIRMED | RecipeStep:243 tek textarea; eski 5 yapılı Marka Kiti yok. |
| B2 | 🟡 PARTIAL | Varyant gerçek buildVariantBriefs kullanıyor ama UI sığ/önizleme; "mock" abartı. |
| B3 | ✅ CONFIRMED | Tek selectedRefId; çoklu DNA slotu (1/3) yok. |
| B4 | ⚠️ CHALLENGED | "AMAÇ selector tamamen kayıp" YANLIŞ — Dashboard:220'de projectClass dropdown var. Sadece eski sitedeki zengin AMAÇ çip-satırı yok (sığ sunum). |
| B5 | ✅ CONFIRMED | Sağ panel yalnız PreviewStage+GoldenViewer; çipler/Kanıt Doktoru/Batch Readiness yok. |
| B6 | ✅ CONFIRMED | PROMPT LAB adımı STEPS'te yok (4 adım). |
| B7 | ✅ CONFIRMED | Renumber / toplu onay / İlk-Orta-Son QA / Üretim Defteri yok. |
| B8 | ✅ CONFIRMED | Ayrı Export adımı yok; Timeline'a gömülü. |
| C1 | 🟡 PARTIAL | proofDoctor gerçekten yalnız 3 hardcoded reg id işliyor (kapsam dar) — DOĞRU; ama "çökmüş/sahte PASS/P0" abartı, P1 kapsam eksiği. |
| C2 | 🟡 PARTIAL | quantumScore tasarımı gereği completeness skoru; "sahte" haksız ama semantic derinlik yok — kısmen geçerli. |
| D1 | 🟡 PARTIAL | Vault snapshot scene'leri migrate'te re-validate edilmiyor — gerçek ama P0 değil, P2 kenar durum. |
| D2 | ✅ CONFIRMED | recipeReadiness:13 selectedPaletteId boş string ('') null/undefined değil → 'Palet' eksiklere eklenmez = validasyon deliği. |
| D3 | ✅ CONFIRMED | scenes.every(...) tek malformed sahnede hepsini siler (muhafazakâr ama veri kaybı kenarı). |
| D4 | ✅ CONFIRMED | mergeBeats:362 / splitBeat:378 sceneCount değiştirir ama scenes/agentBrief/agentPackets temizlemez = bayat sahne. (setBeatMode:339 de aynı.) |
| D5,D6,D7 | ✅ CONFIRMED P2 | agentPackets stale-leak ailesi gerçek: loadFromVault/migrate/presetWithDefaults agentPackets'i tutarsız bırakıyor (Phase F'te geç eklendi, her temizleme yoluna geçirilmemiş). |
| D8 | ✅ CONFIRMED | setRawSource:301 beatAnalysis temizlemiyor → bayat plan. |
| D9 | ✅ CONFIRMED P2 | generationFields'ta brandKitLock yok → değişince sahneler temizlenmiyor. |
| E1,E2 | ✅ CONFIRMED P2 | Kozmetik; gerçek. |
| F1 | ⚠️ CHALLENGED | "Kullanılmayan export" somut sembol vermiyor; groupedWorlds/groupedRefs KULLANILIYOR. Kanıtsız. |
| F2 | ⚠️ CHALLENGED | YANLIŞ — DashboardStep:40 `className="dashboard-step"` MEVCUT. Ölü değil. |

**Sonuç:** 28 bulgunun ~22'si gerçek (CONFIRMED), 4'ü kısmen/abartılı severity (B2,C1,C2,D1),
**2'si yanlış (F1, F2 — CHALLENGED, görmezden gel).** Gerçek bug kümeleri: (1) scroll P0,
(2) Reçete/sağ-panel/PROMPT LAB işlev paritesi, (3) agentPackets+beatAnalysis stale-leak ailesi,
(4) proofDoctor kapsam darlığı, (5) palette readiness deliği. Düzeltme turu bu sıraya göre.
