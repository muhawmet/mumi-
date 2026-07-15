# MAMILAS — Ürün niyeti denetimi (repo gerçeğine karşı)

Mami'nin 2026-07-15 niyet bildirimi ↔ koddaki gerçek. Anchor'lar Explore taramasıyla,
`.claude/rules/` ile ve doğrudan kaynakla doğrulandı. Bu, task isimlerinden bağımsız
**ürün-niyeti** denetimidir.

## Niyetin özü (ölçüt)

MAMILAS = uzun prompt üreten site DEĞİL; Mami'nin yaratıcı kararlarını **kayıpsız,
deterministik, taşınabilir, kanıtlanabilir** taşıyan karar sistemi. Site kararı SAKLAR;
`.command` içindeki ajan onaylı bağlamdan storyboard + motor prompt'unu YAZAR. Kötü kare
hangi kararı ihlal ettiği KANITIYLA döner. Sistem yalnız gerçek üretim kanıtıyla iyileşir.

## Uyanlar — KORUNACAK (dokunma)

| Niyet | Kod gerçeği | Durum |
|---|---|---|
| Kaynak koruması | `sourceIntegrity()` her yerde (`useStudioStore` 9 çağrı, `source.ts`) | ✅ çalışıyor |
| World fiziği | `renderLock()` `brain.ts:63` → `parts[0]` | ✅ çalışıyor |
| Palette-as-light | `hexToLightWords` `brain.ts:102`, `paletteLightPrompt` `:334` | ✅ ham hex motora girmiyor |
| Ref uyumu | `refCompatibleWithWorld()` `pure.ts:458` | ✅ çalışıyor |
| Site BRIEF verir, prompt DEĞİL | `commandExport.ts:404` "prompts.image bir BRIEF'tir" | ✅ **niyetle birebir** |
| `.command` içindeki ajan yazar | `brain.ts:1977-1978` `[DIRECTOR TASK — authored by Claude]` | ✅ **niyetle birebir** |
| Determinizm/taşınabilirlik | TASK 2: canonical hash + base-decision + typed blocker (yeni) | ✅ kuruldu |

## Niyetle ÇELİŞENLER — kök neden + temizlik

### 1. Disco QA / Cabinet kişilikleri → "6 ajanlı karmaşa" yerine tek yönetmen
- **Kanıt:** `qa.ts:5-8` 7 "skill" persona; `innerVoices.ts:6-11` **26 Disco-Elysium sesi**;
  UI'da `ThoughtDock`, `voicePortraits`, `InnerVoicePanel`, `ProductionPulse`.
- **Niyet:** "Mami tek bir Yerleşik Yönetmen ile konuşuyormuş gibi... altı ajanlı karmaşa
  gösterilmeyecek. Daha fazla ajan otomatik kalite sayılmayacak."
- **Kök neden:** QA bir **karakter tiyatrosu** olarak tasarlanmış; gerçek doğrulama (PROMPT
  SURGEON'ın hex/triad/motion-clone denetimi, `qa.ts`) bu tiyatronun içine gömülü.
- **Temizlik (semptom değil kök):** PROMPT SURGEON'ın **nötr validator** çekirdeğini ayır ve
  koru; 26 ses + 7 persona + portreleri **kaldır**. Kullanıcıya tek "Yönetmen" sesi kalır.
  Persona string'leri export'tan zaten firewall'lı (`qa.test.ts:852,877`) — davranış değil,
  sunum katmanı sökülüyor.

### 1B. Gate fiilen tavsiye — ÜÇ bypass yolu (site-gates.md, ölçülmüş)
- **Kanıt:** (a) Sidebar `setCurrentStep` çağırıp tüm kapıları atlıyor (`AppLayout.tsx:122` ↔
  `useStudioStore.ts:955-982`); (b) kaynak opsiyonel — `rawSource` boşsa kapı `ready:true`
  (`useStudioStore.ts:126`); (c) Timeline "⬇ Üretim Paketi" düğmesi QA kapısı olmadan aynı
  `buildProductionExport`'u çağırıyor — Cabinet'in blokladığı paket bir adım geriden gate'siz iniyor.
- **Niyet:** "Storyboard önce Mami tarafından onaylanacak. Prompt ancak onaylı karardan doğacak."
- **Temizlik (kök):** tek giriş = onay kapısı; sidebar dâhil her yol aynı typed blocker kapısından
  geçer (`resolveBlockers`). Gate'siz ikinci üretim düğmesi kaldırılır. **Shot kavramı UI'a gelir**
  — bugün `grep shot` → `src/pages/` sıfır: Mami site içinde hiçbir kareye onay veremiyor. Onay UI'ı
  `mamilas.receipt.v1` (TASK 2'de kuruldu) ile bağlanır.

### 1C. `personalMode` yalan söylüyor
- **Kanıt:** UI "IP guard kapalı" derken `evaluateDirectorCabinet` ve `contractGate`
  `personalMode`'u hiç okumuyor — firewall aslında açık (`site-gates.md`).
- **Temizlik:** ya `personalMode` gerçekten okunur ya UI'dan kaldırılır. Yalan durum sunulmaz.
  (Not: telif firewall'un açık kalması DOĞRU; yalan olan UI'ın "kapalı" demesi.)

### 2. Çelişen readiness'ler → tek canonical readiness
- **Kanıt:** en az 9 ayrı readiness/skor: `sourceReadiness`, `recipeReadiness`, `contractGate`,
  `qaScore` (`proof.ts:202`), `quantumScore` (`:235`), `productionPulse`, `evaluateDirectorCabinet`,
  `proofDoctor`, ve PreviewStage'in string-sniff'i (`PreviewStage.tsx:62` `includes('Status: PASS')`).
- **Niyet:** "sahte preview, stale adaptörler... çelişkili readiness'ler temizlenmeli."
- **Kök neden:** her katman kendi "hazır mı" mantığını icat etmiş; **tek gerçek typed kapı**
  `validateBriefCompatibility` (`pure.ts:860` → sıfır sahne). Diğerleri gösterge/tavsiye.
- **Temizlik:** tek canonical readiness = typed blocker sonucu (TASK 2/3'te kurulan `blockers`).
  `qaScore`/`quantumScore` gibi **kalite kanıtı sanılan** skorlar ya "gösterge" etiketiyle geri
  çekilir ya kaldırılır (`qaScore` motion'a hiç bakmıyor — `proof.ts:202`, yanıltıcı). String-sniff
  PASS pill'i (`PreviewStage.tsx:62`) kaldırılır — PASS bir string'de aranmaz.

### 3. Sahte preview (4 statik plaka + prosedürel çizim) → gerçek ya da kaldır
- **Kanıt:** `worldPlates.ts:6-15` tüm gruplar **4 statik webp**'e düşüyor (hepsi
  `card-hero-archetype`'a fallback); `CanvasPreview.tsx` Canvas-2D prosedürel boyayıcı
  (`persona`/`silhouette`/`ship` gradient çizer). Motor çıktısı DEĞİL.
- **Niyet:** "sahte preview temizlenmeli"; "prompt'un iyi görünmesi PASS değildir. Gerçek frame
  açılıp incelenecek."
- **Kök neden:** preview "üretim öncesi kalite hissi" satıyor ama gerçek kareyle ilgisi yok →
  yanlış güven.
- **Temizlik:** ya preview'i **gerçek onaylı frame**'e bağla (frame yoksa "henüz kare yok" de),
  ya tümden kaldır. Prosedürel plaka bir kalite sinyali gibi sunulamaz.

### 4. Dev pseudo-prompt (BRIEF ama final gibi görünen) → BRIEF olarak açıkça sınırla
- **Kanıt:** `brain.ts:1935` `buildImagePrompt` düzinelerce bantlı string; içinde
  `[DIRECTOR TASK …]` ajan görevi. `commandExport.ts:404` "BRIEF" diyor ama gövde 7600–10000
  karakterlik tek paragraf, final prompt gibi duruyor.
- **Niyet:** "final prompt gibi davranan dev pseudo-prompt yapısı temizlenmeli."
- **Kök neden:** BRIEF ile FINAL aynı string kanalında yaşıyor; ajanın yazacağı yer ile sitenin
  verdiği bağlam ayrışmıyor.
- **Temizlik:** BRIEF'i **yapısal karar bağlamına** indir (TASK 2 base-decision zaten bu):
  site → typed karar + söz + blocker verir; `.command` ajanı FINAL prompt'u ondan yazar. Dev
  paragraf, ajana giden yapılandırılmış bağlama dönüşür — ajan görev metni motor string'inden çıkar.

### 5. Stale adaptörler → sök
- **Kanıt:** `start-mamilas.command:4` sabit `/Users/Muhammet/...` (ölü mac launcher);
  `mamilas.command.v2026` input adaptörü emrediliyor ama `docsContract.test.ts:337` onu runner
  girişi saymayı yasaklıyor (yarı-emekli); `Advisors.ts` IP karakter adları döndürüyor, hiçbir
  yerde import edilmiyor.
- **Temizlik:** ölü launcher'ı sil; `Advisors.ts` ölü dosyasını sil; v2026 **input** yolunu emekli
  et (yalnız çıktı şeması olarak kalırsa etiketle).

### 6. Frame disiplini yasa ama kapı DEĞİL
- **Kanıt:** `brain.ts:2640` `production.frameGate` yasayı METİN olarak yazıyor; ama
  `buildMotionPrompt` (`:2733`) kare/hash almıyor, `runner.mjs`'de `FRAME_PASS`/`frameHash` = sıfır
  eşleşme. (Not: TASK 2'de `mamilas.receipt.v1` şeması `frameHash` alanını TANIMLADI —
  `contract.ts` `FrameReceipt` — ama `buildMotionPrompt` henüz onu ZORLAMIYOR; kapı hâlâ prompt
  metninde, kodda değil.)
- **Niyet:** "Motion yalnız o onaylı frame'in hash'inden üretilecek; frame'de olmayan uydurulmayacak."
- **Kök neden:** kapı prompt'a yazılmış, koda değil.
- **Temizlik:** `mamilas.receipt.v1` (TASK 2'de kuruldu) + hash-bağlı motion kapısı: `buildMotionPrompt`
  onaylı `frameHash` almadan yazamaz. Bu kod hâline gelir.

### 7. Site/kod Mami adına SESSİZCE seçiyor (Codex 5. tur — en derin ihlal)
Ürün niyetinin kalbi "hiçbir ajan Mami adına seçmeyecek". `resolveBlockers` bunu tutuyor (test
kanıtlı), AMA blocker OLUŞMADAN ÖNCE kod Mami adına seçiyor:
- **Uyumsuz malzeme sessizce world-native oluyor** (`pure.ts:808-831`): `effectiveMaterialId`
  uyumsuz seçimi `none`'a çeviriyor → `deriveTeachingRecipe` `world-native` → uyum kapısı
  düzeltilmiş değeri kontrol ettiği için `MATERIAL_WORLD_MISMATCH` hiç ateşlenmiyor. Mami'nin
  malzeme seçimi kayboluyor.
- **Dünya seçince projectClass/material/ref yeniden yazılıyor** (`useStudioStore.ts:522-542`).
- **Uyumsuz ref sessizce düşürülüyor** (`SUPPRESSED_WORLD_MISMATCH`, `pure.ts:1031-1045,1261-1263`).
- **⚠️ MAMİ KARARI GEREKİYOR:** Uyumsuz malzeme/ref karşısında sistem (a) **DUR** (FACT REQUIRED,
  Mami dünyayı ya da malzemeyi değiştirir) mi, yoksa (b) **makbuzlu-ikame** (otomatik düzelt ama
  görünür makbuz bırak) mı yapsın? Bu gece **kodlanmadı** çünkü doğru düzeltme core+store
  koordineli ve karar Mami'nin. Yarım core-block iki mevcut testi kırıyor ve store önden ikame
  ettiği için tetiklenmiyordu — bu yüzden geri alındı. **Kök-neden hazır, karar bekliyor.**

### 8. Ticari marka (üçüncü taraf) sızıntısı
- **Kanıt:** `location="Apple Store, İstanbul"` → GENERATED, brief Apple'ı verbatim taşıyor
  (`pure.ts:942-965` yalnız korumalı KARAKTER/ESER listesine bakıyor, ticari markaya değil —
  kendi yorumu Apple Store'u örnek gösterdiği hâlde).
- **Niyet:** marka/identity kilitleri; müşterinin KENDİ markası serbest (brandKitLock), ama
  üçüncü-taraf ticari marka sızmamalı.
- **⚠️ MAMİ KARARI:** "yabancı marka" ile "müşterinin kendi markası" ayrımını kim çizer? Bir
  marka listesi mi, yoksa Mami'nin brandKitLock beyanı mı otorite? Kör bir marka-adı bloğu
  müşterinin kendi markasını da yakalar (P0'ın marka-negatifi hatasının aynısı). **Tasarım kararı
  Mami'ye ait** — bu gece guess yapılmadı.

## Windows/macOS (korunacak ilke: birlikte çalışmalı)
- Tek sabit-yol ihlali: `start-mamilas.command:4` (sil). `start-codex.ps1` tutmadığı model sözünü
  basıyor (`launcher-parity.md:3`) → banner'ı düzelt ya da sözü tut. macOS Codex launcher yok.

## Bu denetimin task planına etkisi (kör uygulama YOK)
Handoff task sırası bu niyetle büyük ölçüde örtüşüyor ama **ürün niyeti artık üst-ölçüt**:
- TASK 2 (canonical karar) ✅ niyetin çekirdeği — devam.
- TASK 3 (typed FACT REQUIRED) ✅ "uydurma, dur" — devam. **AÇIK SORU:** `approved_fallback`
  Mami'nin yeni "hiçbir ajan Mami adına seçmeyecek" ilkesiyle gerilimde → Mami'ye sorulacak.
- Disco QA temizliği + tek readiness + sahte preview + stale adaptör = handoff'ta TASK 9'du;
  **niyet bunları merkeze çekiyor** — sıra buna göre ayarlanabilir.
- Frame hash kapısı (TASK 6) niyetin "kötü kare kanıtla döner" ölçütünün kalbi.
