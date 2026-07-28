# PASS-C — Kesinleşmiş Bulgu Grafiği (v3)

| Bulgu Kimliği | Bulgu Tanımı | Durum | Kök Neden / Delil |
| --- | --- | --- | --- |
| **C-1** | Belirsiz Proje İsimlerinin (`deriveProductionPath`) Sessizce `ANIMATION_EDU`'ya Düşmesi | **CURRENT** | `src/core/pure.ts:987` varsayılan dönüşü. "Gece Serumu" gibi projelerde tüm pipeline sessizce EDU üretir. |
| **C-2** | Motion Hattının Metin Üretimi Ötesinde Görsel Doğrulaması Olmaması | **UNPROVEN** | Diskte `.txt` motion varlığı video başarısı kanıtı değildir. Gerçek `.mp4` görsel denetimi yapılmamıştır. |
| **C-3** | `memory-sync.mjs` Tek Yönlü Aynasının Repo Değişikliklerini Sessizce Ezme Riski | **CURRENT** | `scripts/memory-sync.mjs:46-48` repo → canlı aktarım seçeneği taşımıyor; repo editleri canlı hafıza tarafından ezilir. |
| **C-4** | Frame Filename Kimlik Eşleşmesi | **OUT OF SCOPE** | Mami'nin kendi dosya ve klasör yönetim alanındadır. Sistem bulgusu olarak işlenmez. |
| **C-5** | Linter Kreatif Veto Yetkisi | **REJECTED** | `.claude/hooks/gate.sh` içinde `prompt-lint.mjs` bulunmamaktadır; üretimi veya commit'i durdurmaz. |
| **C-6** | Platform `protocolHash` CRLF Engeli | **HISTORICAL** | 2026-07-27 commit `d366231` ile çözülmüştür, canlı hat üzerinde hata üretmez. |
