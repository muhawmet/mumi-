# MACRO 6 — Taşınabilir Project Pack

**Tarih:** 2026-07-15 · **Uygulayıcı:** Claude Opus 4.8 · **Plan:** MACRO 6

## Kullanıcı açısından çalışan akış

Mami Timeline'da "⬇ Proje Paketi" ile projesini taşınabilir `.mamilas-project.json`'a export eder;
başka makinede (Mac ↔ Windows) "⬆ Proje İçe Al" ile açar. Pack; kararı, seçili dünyanın WorldPacket
sürümünü, storyboard onaylarını, prompt/frame receipt'lerini ve bir HASH MANIFEST taşır. Aynı proje
→ aynı byte → aynı hash (deterministik). LocalStorage yalnız cache; pack gerçek kayıttır.

## Değişen dosya grupları

- `src/core/projectPack.ts` — yeni: `ProjectPack`/`PackScene` tipleri, `buildProjectPack`,
  `serializeProjectPack` (kanonik, deterministik), `verifyProjectPack` (manifest hash doğrulama +
  legacy V2026 read-only algılama), `projectPackToState` (kararı geri yükle).
- `src/store/useStudioStore.ts` — `exportProjectPack()` / `importProjectPack(json)` aksiyonları
  (bozuk/uyumsuz pack lastError'a düşer, state'i ezmez; legacy V2026 read-only import korunur).
- `src/pages/Timeline/TimelineStep.tsx` — export şeridine "⬇ Proje Paketi" + "⬆ Proje İçe Al".
- `src/core/projectPack.test.ts` — yeni: build + deterministik hash + verify (bozuk/legacy) +
  export→import round-trip + motion gate koruması (9 test).

## Korunan invariant'lar

- **Launcher parity (MACRO 6 gereği): dokunulmadı çünkü zaten doğru.** macOS `.command` ve Windows
  `.bat` launcher'ları ince kabuk, göreli `cd` (`$(dirname "$0")` / `%~dp0`), sabit kullanıcı yolu
  YOK, iş kuralı YOK, ikisi de `node runner.mjs`. `docsContract.test.ts` byte-parity kilidi geçiyor.
- Pack deterministik: timestamp yok, kanonik NFC anahtar sırası, içerik-hash kimliği.
- WorldPacket sürümü pack'e gömülü (legacyRenderLaw dahil) — taşınabilir fizik.
- Frame receipt (SHA-256 + verdict + karar bağı) pack'te taşınıyor → import sonrası motion gate
  aynı kararı verir (round-trip test kilitli).
- V2026 (eski) projeler silinmez — schema'sız snapshot legacy read-only import olarak açılır.

## Gerçek çıktı

- **Round-trip test:** export → reset → import → aynı world/subject/directorBrief/shotApproval.
- **Determinizm:** aynı karar iki kez paketlenince aynı `packHash` + aynı serialize byte.
- **Doğrulama:** bozulmuş pack (scene id değişti) reddediliyor; bozuk JSON state'i ezmiyor.
- **smoke 10/10 PASS** — "⬇ Proje Paketi" + "⬆ Proje İçe Al" düğmeleri gerçek tarayıcıda görünür.

## Test sonucu

`npx tsc --noEmit` → 0 · `rtk proxy npx vitest run` → **1924 geçti / 0 kaldı (64 dosya)** ·
`npm run build` → OK · E2E smoke 10/10.

## Açık risk / dış bağımlılık

- Pack `.json` (zip değil): medya (frame PNG'leri) Mami'nin diskinde kalır, pack onların SHA-256'sını
  taşıyıp doğrular — hafif + deterministik + dış-araç bağımsız. Ham piksel gömme (zip) gerekirse
  MACRO 8 sonrası eklenebilir; şu an hash-ile-doğrulama taşıma için yeterli.
