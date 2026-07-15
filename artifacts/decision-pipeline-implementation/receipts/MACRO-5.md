# MACRO 5 — Manuel Frame + Motion kapısı

**Tarih:** 2026-07-15 · **Uygulayıcı:** Claude Opus 4.8 · **Plan:** MACRO 5

## Kullanıcı açısından çalışan akış

Mami harici araçta ürettiği frame'i (PNG/JPG) Timeline'daki sahne detayına yükler. Site görsel
ÜRETMEZ — yalnız karenin SHA-256'sını, boyut/aspect'ini ve hangi karar/prompt'a bağlı olduğunu
receipt'e yazar. Mami APPROVE / REGENERATE / PROJECT_ONLY_ACCEPT hükmü verir. Motion brief YALNIZ
APPROVE edilmiş current frame ile açılır — prompt'a değil GERÇEK piksele bağlı. Frame değişince
motion stale olur.

## Değişen dosya grupları

- `src/core/contract.ts` — `sha256HexBytes(Uint8Array)` (binary-safe SHA-256, frame piksel hash'i);
  `sha256Hex` artık onun UTF-8 sarmalayıcısı.
- `src/store/useStudioStore.ts` — `SceneFrameReceipt` tipi (frameHash + fromCommandId +
  fromPromptHash + width/height/aspect + fileName/byteSize + verdict + note); `Scene.frameReceipt`.
  Saf `motionGate(scene, commandId)` kapısı. Aksiyonlar: `importFrame` (async: dosya SHA-256 +
  `readImageDims` boyut + karar/prompt bağı, PENDING başlar), `setFrameVerdict`, `clearFrame`.
- `src/pages/Timeline/TimelineStep.tsx` — `FrameGatePanel`: frame yükle (input file) → SHA-256/
  boyut/aspect göster → APPROVE/REGENERATE/PROJECT_ONLY_ACCEPT → motion brief YALNIZ kapı açıkken;
  kapalıysa nedeni. Motion author'a "karede olmayan uydurulamaz" talimatı.
- `src/store/frameGate.test.ts` — yeni: motion gate (frame yok/PENDING/REGENERATE/
  PROJECT_ONLY_ACCEPT/stale → kapalı; APPROVE+güncel → açık) + gerçek importFrame/verdict/clear
  aksiyonları (9 test).
- `e2e/smoke.spec.ts` — MACRO 5 assertion: "GERÇEK FRAME · MOTION KAPISI" görünür, frame yokken
  motion kapalı, FRAME YÜKLE hazır.

## Korunan invariant'lar

- **Site görsel üretmez** — API/otomatik generation/batch/upscale YOK. Frame Mami'nin manuel
  eylemidir; site yalnız hash + kayıt tutar.
- Motion, onaylı start-frame görülmeden yazılmaz (proje yasası) — artık gerçek piksele bağlı gate.
- Frame receipt hangi karar (commandId) ve hangi ajan-prompt (promptHash) ile üretildiğini taşır.
- Karar değişince (STALE_GENERATION) sahne + frame receipt'i temizlenir; motion tekrar kapanır.

## Gerçek çıktı (gerçek tarayıcı — E2E smoke)

- **smoke 10/10 PASS.** Sahne detayında "GERÇEK FRAME · MOTION KAPISI" paneli; frame yokken
  "⏸ Motion kapalı — Frame yok"; "⬆ FRAME YÜKLE" düğmesi hazır. Screenshot: shot authoring +
  frame gate + motion-kapalı bir arada; Disco persona ekranda yok.
- Store: importFrame gerçek SHA-256 (`sha256HexBytes` ile eşleşiyor) + PENDING; APPROVE → motion
  açık; clearFrame → kapalı; karar değişince frame temizlenir.

## Test sonucu

`npx tsc --noEmit` → 0 · `rtk proxy npx vitest run` → **1915 geçti / 0 kaldı (63 dosya)** ·
`npm run build` → OK · E2E smoke 10/10.

## Açık risk / dış bağımlılık

- **Gerçek frame üretimi Mami'nin manuel eylemidir** — bu tek dış bağımlılık (plan gereği).
  Frame boyutu tarayıcıda `Image` ile ölçülür; Node/test ortamında 0×0'a düşer (hash yine gerçek).
- Runner tarafında motion'ın frame-gate'e bağlanması (`runner.mjs` FRAME_PASS) MACRO 6/7'de
  taşınabilir pack + closeout ile hizalanacak; site-içi gate (bu macro) tamam.
