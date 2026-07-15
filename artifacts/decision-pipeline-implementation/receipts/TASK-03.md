# RECEIPT — TASK 3: Typed FACT REQUIRED ve conflict resolver

- Tarih: 2026-07-15
- Model: Claude Opus 4.8 (`claude-opus-4-8[1m]`)
- Kanonik plan: handoff §6 + Mami'nin ürün-niyeti (2026-07-15).
- Kip: **TDD.** `blockers.test.ts` — kırmızı → yeşil.
- Mami verdict: **BEKLİYOR**.

## Ürün niyetiyle hizası (ölçüt)

Mami: *"Eksik marka geometrisi, yüz, dönem, exact text veya çelişen karar varsa sistem
uydurmayacak; FACT REQUIRED diyerek doğru yerde duracak. Hiçbir ajan Mami adına seçim yapmayacak."*

Bu task tam olarak bunu kod hâline getirir.

## Ne değişti

**Yeni (`src/core/contract.ts`):**
- `Blocker` — handoff §6 biçimi birebir: `scope · code · field · reason · requiredEvidence ·
  allowedResolutions · blocks`.
- `BlockerCode` — §6 sınıfları: `BRAND_GEOMETRY · IDENTITY_UNRESOLVED · PERIOD_REGION_TRADITION ·
  EXACT_TEXT_REQUIRED · SOURCE_CLAIM_CHANGED · MAMI_LOCK_CONFLICT · DOSSIER_HASH_MISMATCH`.
- `toBlockers()` — mevcut düz `{code, message}` bulgularını typed blocker'a köprüler. Site,
  runner, Claude, Codex **aynı** blocker'ı görür.
- `resolveBlockers()` — **otomatik geçiş YOK.** Yalnız kapsam ayrımı: bağımsız shot ilerler,
  project/source sorunu tüm projeyi durdurur. Her blocker `pending` olarak Mami'yi bekler.

**Değişti (`src/core/pure.ts`):**
- `GenerationResult.blockers?` eklendi.
- `generateBatch`'in 4 BLOCKED çıkışının hepsi artık typed `blockers` taşıyor.

**Yeni test:** `src/core/blockers.test.ts` (6).

## ⚠️ approved_fallback KALDIRILDI — Mami kararıyla

Tasarım başta kritik/kozmetik ayrımı + "kozmetik boşlukta onaylı fallback" içeriyordu. Mami
2026-07-15'te **kesin** dedi: *"Hiçbir ajan Mami adına seçim yapmayacak."* Bu yüzden:
- `CRITICAL_CODES` / `isCriticalBlocker` / `appliedFallbacks` **çıkarıldı**.
- Kozmetik olsa bile hiçbir blocker otomatik geçilmez. Ajanın rolü: **tiplendir ve DUR.**

Bu, ürün niyetine sadakattir — daha "akıllı" değil, daha **dürüst** bir sistem.

## Hangi invariant korundu

- Mevcut tek gerçek typed kapı `validateBriefCompatibility` (`pure.ts:860`) **davranışı aynı** —
  yalnız çıktısı artık typed blocker olarak da sunuluyor. Sıfır sahne davranışı korundu.
- Kaynak koruması, world fiziği, palette-as-light, ref uyumu — dokunulmadı.
- Ajan görev metni / prompt üretimi — dokunulmadı (o TASK 4; **ama site/kod prompt YAZMAZ,
  `.command` içindeki ajan yazar** — Mami kilidi).

## Çalıştırılan testler (GERÇEK — `rtk proxy`, filtresiz)

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit` | **0 hata** |
| `rtk proxy npx vitest run` | **1892 geçti · 0 KALDI** (59 dosya) |
| `npm run build` | **OK** |

Gerçek çıktı (`TASK-02-REAL-OUTPUT.txt` §1): termos → `BLOCKED`, blocker'ın **yedi §6 alanı**
(scope · code · field · reason · requiredEvidence · allowedResolutions · blocks) tam. Codex 5. tur
`blockers.test.ts`'te yedi alanı ve `preApproved:false`'ı bağımsız doğruladı.

## Codex 5. tur (TASK 2+3 birlikte) — kapatılanlar

| Bulgu | Durum |
|---|---|
| Boş-shot blocks tutarsız (`blocks:[]`) | Kapandı — sahne id yoksa `'ALL'` (batch tümü durur) |
| Her bulgu her sahneye atanıyordu | Kapandı — `PromiseFinding.sceneId` iliştirildi; per-sahne blocker yalnız o sahneyi bloklar |
| **Typed blocker'lar store'da düşürülüyordu** (`lastError` string'ine indiriliyordu) | Kapandı (store katmanı) — `useStudioStore` artık `blockers: Blocker[]` state'i taşıyor; `allowedResolutions`/`preApproved` korunuyor (`useStudioStore.test.ts` kilidi). **AÇIK (TASK 9):** blocker'ları GÖSTEREN ve Mami'nin beyanını TOPLAYAN çözüm UI'ı henüz yok; hiçbir üretim sayfası `state.blockers`'ı tüketmiyor. Çözülmüş söz (`deliveryPromise`) **export'ta runner'a ulaşıyor** (`baseDecision.deliveryPromise` — gerçek çıktıyla doğrulandı), ama blocked batch komut üretmez. Uçtan-uca çözüm akışı TASK 9. |

## Codex 5. tur — AÇIK (Mami kararı, `PRODUCT-INTENT-AUDIT.md` §7-8)

- **Sessiz malzeme/ref ikamesi + store'un dünya-seçince-rewrite'ı** — core+store koordineli
  düzeltme; "DUR mu, makbuzlu-ikame mi" Mami'nin kararı. Bu gece kodlanmadı (yarım core-block
  geri alındı).
- **Üçüncü-taraf ticari marka sızıntısı** — "yabancı vs müşteri markası" ayrımı tasarım kararı.

## Açık / Mami'ye ait

1. TASK 3 kabulü.
2. `allowedResolutions` şu an salt-bilgi (ajan uygulayamaz). İleride Mami açıkça bir çözümü
   "önceden onaylı" işaretlemek isterse `preApproved` alanı hazır — ama varsayılan: hiçbiri.
3. Bağımsız Codex denetimi (bu receipt yazılırken TASK 2+3 birlikte denetime verildi).
