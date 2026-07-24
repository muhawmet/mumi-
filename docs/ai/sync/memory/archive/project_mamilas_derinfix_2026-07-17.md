---
name: project-mamilas-derinfix-2026-07-17
description: 2026-07-17 derin hata avı + 9 fix + garanti denetçi (2 gerçek bulgu kapatıldı) — mekanizma/tarif/ajan kusursuzlaştırma. tsc0·2014·E2E15·build·mirror.
metadata: 
  node_type: memory
  type: project
  originSessionId: b1de5f1a-7cfa-4848-b888-0db81834f8a8
---

# DERİN HATA AVI + FIX RUN — 2026-07-17 (sınırsız usage günü)

Mami: "sınırsız usage, yak yık, fable/sol kullan · sonra: command kusursuz olsun, tarifler,
ajanlar, export JSON, kaliteyi arttırma session'ı · loop'a girme, aptal regex'lere takılma."
Kural: [[mamilas-bul-sec-onar]] — BUL→Mami SEÇER→onar. Mami "hepsini sırayla tek session'da bitir" dedi.

## Yöntem: 4 paralel avcı + göz okuma + 2 garanti denetçi

Av (brain.ts god-file · store/migration veri-kaybı · source/qa · güvenlik/FS) — hepsi KOŞULMUŞ
kanıt. 15+ gerçek bulgu, kök-desene bağlı sınıflandırıldı ("koddan doğal-dil kararı" hastalığı).

## 9 FIX (hepsi test-kilitli, commit'li)

- **F-A1** migration frame receipt remap — onaylı kare artık migration'da ÖLMÜYOR. **Garanti
  denetçi BULGU 1:** alfabetik `.sort()` r1-revizyon (REJECT sonrası) zincirini bozuyordu →
  DEPENDENCY sırasına çevirdim (revision×role×scene). r1 senaryosu ayrı test.
- **F-A2** `--clear-frame` — bozuk-bağ kareyi + görseli güvenli siler, karar zincirine dokunmaz.
- **F-A3** `gate.sh` restore (git b40fc6b'den byte-aynı) — commit'te tsc/vitest/build DUVAR;
  commit-dışı sessiz geçer. baseline `.claude/test-baseline`=2014.
- **F-A4** `jailWrite` — --out yazma proje ağacı dışına çıkamaz (5 nokta). **BULGU 2:** symlink
  (macOS /tmp→/private/var) meşru --out'u yanlış reddediyordu → realpathClosest ile iki taraf
  normalize. Okuma yolları (import-frame) bilerek jail'siz.
- **F-A5** `--batch` solo-flag çakışmasına net hata (5 flag).
- **F-B1+B2** (Mami kararı: "cross-world geçişi ETME") — `refCompatibleWithWorld`'de
  CINEMATIC_REAL→CINEMATIC_REAL çapraz izni KALDIRILDI. Pinli ref artık YALNIZ kendi dünyasında.
  Konum (Soviet/Tokyo/New Mexico) + hareket (long-take drift/time-lapse) sızıntısını TEK KÖKTEN
  kapattı, **regex YOK, tek satır**. 0 default kırıldı (denetçi doğruladı). 4 eski cross-world
  testi yeni yasaya çevrildi (mutasyonla sahte-yeşil olmadığı kanıtlı).
- **F-C** command sözleşmesine "prompts.image TASLAK, kopyalama" cümlesi — davranış DEĞİŞMEZ
  (byte-identical), C grubu regex kusurlarını (gece-metaforu/olay-sayma/DNA-rim) nötralize eder.
  Bunlar zaten motora GİTMİYOR (site önizleme); ajan kanonik command'den kendi yazıyor.
- **F-D** mamilas-ref skill "drift"i aslında doğru platform-adaptasyonu (CLAUDE.md vs AGENTS.md,
  ikisi de diskte) — dokunulmadı.

## Garanti denetçi sonucu

İki bağımsız denetçi (fix-doğrulama + regresyon avcısı) AYNI 2 bulguyu buldu → ikisi de kapatıldı
ve teste kilitlendi. 8 fix baştan sağlam, F-A1 r1 açığı + F-A4 symlink açığı düzeltildi.

## Açık ledger (kritik değil, Mami kararı bekleyen)

- Site-hattı regex makineleri (DNA_MAP 80-kural, countEvents Türkçe morfoloji, clockMap gece-metafor,
  registerOf İ/ı, source.ts ondalık-cümle-kesme) DURUYOR — motora gitmedikleri için F-C etiketiyle
  nötralize, tek-tek yamalanmadı (Mami "aptal regex'e takılma"). Gerçek üretimde site prompt
  kopyalanırsa gündeme gelir.
- gate.sh python3'e bağlı (yoksa fail-open sessiz geçer) — bu makinede python3 var.
- UI katmanı (scan2: 58/100, iki CSS, ölü ~1200 satır, 2MB bundle) hiç ele alınmadı.

## Kapı (kendi gözümle)
tsc 0 · vitest **2014/2014 (80 dosya)** · build OK · **E2E 15/15** · runner mirror byte-identical ·
agents-sync OK. Baseline 2007→2014 (+7, sıfır silme). Push'lu.
