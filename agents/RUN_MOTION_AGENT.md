# RUN_MOTION_AGENT — bu paketi çalıştırma

Bu paket `schema: mamilas.command.v2026` + `production` bloğu taşır. Tek doğruluk kaynağı: `project.json`.

## Çalıştır
- macOS: `MOTION-CALISTIR.command` (çift tık) — ince kabuk, sadece `node runner.mjs` çağırır.
- Windows: `MOTION-CALISTIR.bat` (çift tık).
- Elle: `node runner.mjs` (bu klasörde).

## Akış
- **Pass A (tamam):** ledger/ · image_prompts/<id>.txt · IMAGE_PROMPTS.md · final_brief.md · suno.txt · report.md.
- **Mami:** IMAGE_PROMPTS.md BÖLÜM A'daki kıyafet referanslarını Magnific'te üretip tag'ler; sonra BÖLÜM B sahne promptlarıyla kareleri üretip `images/<id>.png` koyar.
- **Pass B (motion):** "resimler hazır" denince — her `images/<id>.png` açılır, `production.frameGate` koşulur, `frame_checks/<id>.md` FRAME_PASS ise `motion/<id>.txt` (Kling 3.0, tek hareketli öğe, 1–1.5s hold) yazılır. FRAME_PASS yoksa motion doğmaz.

## Kapı
- `production` bloğu olmayan paket reddedilir.
- Bölünen sahne (7) shot başına kare ister: 7a.png + 7b.png (`sceneIndex[].imageFiles` otoritedir).
