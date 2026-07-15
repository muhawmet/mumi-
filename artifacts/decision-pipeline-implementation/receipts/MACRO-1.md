# MACRO 1 — Mevcut iyi hattı koru, source-intent drift'ini sök

**Tarih:** 2026-07-15 · **Uygulayıcı:** Claude Opus 4.8 (`claude-opus-4-8[1m]`)
**Kanonik plan:** `MAMILAS_MANUAL_WORLD_EXECUTION_PLAN.md` → MACRO 1

## Kullanıcı açısından çalışan akış

Mami sitede world/palette/ref/source/proje seçer → site bunları kaybetmeden taşınabilir
final brief'e (`buildCommandJSON`) koyar → command'deki ajan brief'i + Mami'nin serbest
direktifini okuyup final prompt'u yazar. **Site artık kaynak düzyazısından metin niyeti
çıkarıp üretimi durdurmuyor.** Mami "şu sahnelere anlamlı yazı koy" derse bunu ajan çözer;
site regex/NLP/blocker ile araya girmez.

## Değişen dosya grupları

- `src/core/contract.ts` — **sökülen:** düzyazı→niyet motorunun tamamı
  (`fold`, `BAKE_AFTER`, `NEGATED`, `QUOTED`, `UNQUOTED_ON_SURFACE`, `SURFACE_BEFORE`,
  `splitClauses`, `TEXT_NOUN`/`CAPS_TARGET`/`REQUEST_MOOD`/`WRITE_VERB`/`SURFACE_LOC`/
  `SPEECH_ONLY` regex bankası, `requestMood`, `hasLiteral`, `OnScreenTextIntent`,
  `detectOnScreenTextIntent`, `extractBakedTextRequests`). `DeliveryPromise`'ten
  `intent_pending` kolu ve `PromiseFinding`'den `ON_SCREEN_TEXT_INTENT` kodu kaldırıldı.
  **Korunan (taşınabilir kimlik):** `sha256Hex`/`canonicalize`/`canonicalHash`, tüm
  `SCHEMA_IDS`/`BaseDecision`/`Decision`/`FrameReceipt`/`Closeout` şemaları, typed
  `Blocker`/`toBlockers`/`resolveBlockers` (telif/kadro/dünya kapıları), `spanHash`/
  `languageOf` (beyandan söz üretirken). `deriveDeliveryPromise`/`lockDeliveryPromise`
  yalnız Mami'nin açık beyanı (`DeliveryDeclaration`) + `osTextMode: CLEAN` kilidinden söz
  doğuruyor; beyan yoksa `pedagogy_auto`.
- `src/core/pure.ts` — `generateBatch` delivery-promise bloğu artık düzyazı taramıyor;
  yalnız Mami beyan verdiyse ölçüm yapıyor. `BriefInput.deliveryDeclaration` yorumu
  güncellendi.
- **Testler (silinmedi, yeni davranışa uyarlandı):**
  `deliveryPromise.test.ts`, `deliveryPromiseDefects.test.ts` — eski "niyet dedektörü
  doğruluğu" matrisi (WANTED/LEGIT/ANLATI, CODEX #3-#6, 40 case) → "düzyazı üretimi
  BLOKLAMAZ" davranışı. `blockers.test.ts` — `ON_SCREEN_TEXT_INTENT` girdileri korunan
  `DELIVERY_PROMISE_BROKEN` koduna çevrildi; `generateBatch` düzyazı-blok testi →
  "düzyazı akar + Mami beyanı kırılırsa BLOCKED" testine.
  **Korunan:** canonical hash NFC-eşdeğerlik testi, beyan karakter-koruma, Türkçe glif
  kilidi, boş-beyan reddi, pedagogy_auto varsayılanı.

## Korunan invariant'lar

- Taşınabilir kimlik: içerik-hash'li `commandId` (timestamp değil), SHA-256, NFC canonicalize.
- Typed FACT REQUIRED (blocker) sistemi — telif/kadro/dünya/hex kapıları aynen çalışıyor.
- Palette-as-light, render lock, çalışan world/ref/palette/source davranışı — dokunulmadı.
- Mami'nin raw source'u ve serbest notu brief'e karakter karakter, değişmeden ulaşıyor.

## Gerçek çıktı (gerçek `generateBatch` + gerçek `buildCommandJSON`)

Termos source'u — düzyazıda güçlü metin-isteği (`'MAMILAS THERMO' baked-in görünsün`):

```
(1) generateBatch:
  status       : GENERATED
  scene count  : 4
  contractGate : PASS []
  → BLOKLAMIYOR (önce ON_SCREEN_TEXT_INTENT ile sıfır sahne döndürüyordu)

(2) buildCommandJSON:
  deliveryPromise      : {"kind":"pedagogy_auto"}   (düzyazı taranmadı)
  rawSource == source  : karakter karakter aynı
  base rawSource == src : karakter karakter aynı
  directorBrief taşındı : command JSON içinde birebir
  commandId (hash)     : mamilas-e84d53ffa5daea44d1b84c15cf5378ab05a3ddcfddca14aec2aec51a535e4ea6
```

## Test sonucu

`npx tsc --noEmit` → 0 hata · `rtk proxy npx vitest run` → **1880 geçti / 0 kaldı (59 dosya)**
· `npm run build` → OK.

## Açık risk / dış bağımlılık

Yok. MACRO 1 tamamen kod işi; gerçek frame gerektirmez. Kabul kriteri (Mami'nin "anlamlı
yazı koy" notu ajan için brief içinde görünür, site yorumlamaz/durdurmaz) gerçek çıktıyla
karşılandı.
