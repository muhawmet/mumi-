# BRAIN-M0 — Baseline mühür

**Tarih:** 2026-07-16 · **Uygulayıcı:** Claude Opus 4.8 (1M) · **Ortam:** VSCode/Mac

## Ne yapıldı

1. Baseline gerçek çıktıyla ölçüldü (aşağıda).
2. İki `.bat` launcher'ın CRLF satır-sonları geri getirildi ve commit'lendi:
   - `agents/MOTION-CALISTIR.bat`
   - `agents/production/MOTION-CALISTIR.bat`
   - Diff doğrulaması: yalnız satır-sonu değişikliği (14 insertion = 14 deletion, içerik aynı);
     `file` çıktısı: `DOS batch file text, ASCII text, with CRLF line terminators`.
3. `sharp` zaten `package.json`'da — yalnız `npm install` koşulmuştu, ayrı commit gerekmedi.

## Kapı ölçümü (gerçek çıktı, 2026-07-16 10:51)

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | **0 hata** |
| `rtk proxy npx vitest run` | **1896 passed / 0 failed (67 dosya)** — 5.26s |
| `npm run build` | **OK** — ✓ 2808 modül, built in 266ms. Tek uyarı: bilinen >500kB chunk debt'i (FINAL-CONVERGENCE-LEDGER kabul edilmiş debt). |

## Commit

- Hash: `d366231` — `fix(launcher): restore CRLF on MOTION-CALISTIR .bat launchers`
- Push: `origin/main` `3c4cc8a..d366231` ✅ (Mami yetkisi: 2026-07-16, "commit push serbest")

## Mami kararı

Mami 2026-07-16: *"Commit push serbest, körleme sana güveniyorum — aptal drift atma, amaç belli hedef belli."*
→ Sonraki M task'larında commit/push için ayrı onay sorulmayacak; her kapı yeşilken task-sonu ritüelinde yapılacak.

## Sıradaki

**M1 — Canonical consolidation** (`scripts/agents-sync.mjs` generator + parity test).
