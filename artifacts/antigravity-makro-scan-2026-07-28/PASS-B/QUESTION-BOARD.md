# PASS-B — Makro Soru Tahtası (Kanıt Odaklı Hipotezler)

## B1 — Gerçek Üretim Omurgası
- **Hipotez:** Mami kararları command JSON'dan kurgu kiti XML'ine kadar uçtan uca çalışıyor mu?
- **Durum:** `CURRENT`
- **İncelenen İş:** `5. Sınıf - Kütle ve Ağırlık`
- **Kanıt Yüzeyi:** `agents/COMMAND-INBOX/5. Sınıf - Kütle ve Ağırlık/` (`revize.txt`, `REVIZE-VE-MOTION.md`, `5. Sınıf - Kütle ve Ağırlık — kaba kurgu.xml`).

## B2 — Linter Yaratıcı Veto Yetkisi
- **Hipotez:** `prompt-lint.mjs` hook veya gate seviyesinde Mami'nin REAL promptlarını veto edip commit'i durduruyor mu?
- **Durum:** `REJECTED` (Linter kapıda/hook'ta çağrılmıyor, bloklamıyor).
- **Kanıt Yüzeyi:** `.claude/hooks/gate.sh`, `.claude/settings.json`.

## B3 — REAL/EDU Register Düşüşü
- **Hipotez:** Tanımlanamayan marka/ürün isimleri (örn. "Gece Serumu") sessizce EDU dalına mı düşüyor?
- **Durum:** `CURRENT`
- **Kanıt Yüzeyi:** `src/core/pure.ts:987` (`deriveProductionPath` catch-all `return 'ANIMATION_EDU'`).

## B4 — Görsel Doğrulama ve Motion Handoff'u
- **Hipotez:** Motion prompt'ları kare görülmeden yazılıyor mu?
- **Durum:** `CURRENT` (Kurala uyuluyor, 35/35 kare incelendikten sonra motion yazılmış).
- **Kanıt Yüzeyi:** `agents/COMMAND-INBOX/5. Sınıf - Kütle ve Ağırlık/revize.txt`.

## B5 — Kapılar ve Platform Davranışı
- **Hipotez:** `protocolHash` CRLF hatası halen canlı hatayı bloke ediyor mu?
- **Durum:** `HISTORICAL` (2026-07-27 commit `d366231` ile kapatılmış).
- **Kanıt Yüzeyi:** `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md` (satır 512).

## B6 — Memory Sync ve Hafıza Asimetrisi
- **Hipotez:** `memory-sync.mjs` canlı hafızayı otorite sayarak repo kopyasını arşive mi sürüyor?
- **Durum:** `CURRENT`
- **Kanıt Yüzeyi:** `scripts/memory-sync.mjs:46-48`.
