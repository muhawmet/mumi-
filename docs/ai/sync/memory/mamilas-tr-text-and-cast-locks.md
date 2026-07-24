---
name: mamilas-tr-text-and-cast-locks
description: İki üretim kilidi sitede YOK ama gerekli — Türkçe-metin kilidi + Türk/Anadolu cast kilidi. Ajan katmanında bağlanıyor.
metadata: 
  node_type: memory
  type: project
  originSessionId: 6ab77012-cfce-424d-9d04-b5454d4874c2
---

Maarif üretiminde motor (Nano Banana 2) iki yerde bağlamdan kayıyor; **site bu kilitleri emit etmiyor**, ajan image prompt'a bakmalı:

1. **DİL KİLİDİ (Türkçe, İngilizce yasak).** Yüzeyde madde metni BELİRTİLMEZSE motor İngilizce uyduruyor — ölçüldü: `SORUMLULUK` başlığı Türkçe geldi ama checklist maddeleri **`FIRST` / `SECOND`** basıldı. Kural: on-screen text yazan HER prompt'a "her harf Türkçe, İngilizce/Latin filler (FIRST/SECOND/LOREM) yasak, Türk glifleri (ç ğ ı İ ö ş ü)" kilidi + madde metinlerini **tam Türkçe** ver (yüzeyi boş bırakma).

2. **CAST KİLİDİ (Türk/Anadolu).** İkincil kişi (kardeş, komşu, sınıf arkadaşı, topluluk) rastgele etnik geliyor — Türkiye/Maarif bağlamına oturmalı: sıcak Akdeniz-Anadolu teni, koyu saç, @mira'nın topluluğuyla tutarlı. **Pozitif tarif** (CLAUDE.md "yasak yazma, tarif yaz"), yasak-liste değil. İkincil kişiler isimsiz + tekrar etmeyen (cropped/arkadan).

`cast=""` ve `brandKitLock=""` iken FACT REQUIRED tetiklenmiyor ama **kimlik tutarlılığı** yine gerekiyor: Mira Magnific @-handle ile ([[mamilas-magnific-char-refs]]), ikincil kişiler bu cast kilidiyle. Backlog: siteye `locks.language='tr'` + `locks.castAppearance` alanı öner.
