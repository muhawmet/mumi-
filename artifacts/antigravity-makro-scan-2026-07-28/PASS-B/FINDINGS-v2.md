# PASS-B — Kabul Edilen ve Revize Edilen Bulgu Grafiği (v2)

## 1. [CURRENT] Tanımlanamayan Özel Ürün/Marka İsimlerinin Sessizce ANIMATION_EDU'ya Düşmesi
- **Kök Neden:** `src/core/pure.ts:987` (`deriveProductionPath`) fonksiyonunun tanımadığı tüm proje isimlerini varsayılan olarak `ANIMATION_EDU` olarak döndürmesi.
- **Etki:** Mami özel bir reklam/şaheser projesi açtığında (örneğin "Gece Serumu"), proje sessizce EDU register'ına düşer. Photoreal ten, ışık ve kamera kuralları pasife alınır.
- **Çözüm Yönü:** Tanımlanamayan isimlerde varsayılan EDU döndürmek yerine `UNKNOWN` dönerek Mami'nin açık register seçimi yapmasını sağlamak.

## 2. [CURRENT] Hafıza Senkronunun (memory-sync) Çift Yönlü Olmaması
- **Kök Neden:** `scripts/memory-sync.mjs` script'inin sadece canlı hafızadan repo'ya akış yapması.
- **Etki:** Repo üzerinde yapılan hafıza iyileştirmeleri canlı `~/.claude` dizinine aktarılamaz.
- **Çözüm Yönü:** Operasyonel opsiyonel `--adopt` (repo → canlı) bayrağı eklenmesi.

## 3. [REJECTED] Linter'ın Mami'nin Kreatif Kararlarını Kapıda Veto Etmesi İddiası
- **Gerekçe:** `.claude/hooks/gate.sh` ve `.claude/settings.json` incelenmiş; `prompt-lint.mjs`'in hiçbir pre-commit hook'unda çağrılmadığı ve üretimi durdurmadığı kanıtlanmıştır.
- **Karar:** Bu iddia tamamen REDDEDİLMİŞTİR. Linter yalnız manuel teşhis aracıdır.

## 4. [HISTORICAL] protocolHash CRLF Uyuşmazlığı
- **Gerekçe:** 2026-07-27 tarihinde commit `d366231` ile CRLF normalization ve `.gitattributes` eklenerek çözülmüştür.
- **Karar:** Canlı hatta hata oluşturmadığı için canlı backlog'dan çıkarılmış, TARİHSEL DERS olarak kaydedilmiştir.
