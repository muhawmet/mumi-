---
name: mamilas-insa-ledger-acik
description: "Açık İNŞA ledger'ı — 2026-07-28 keşif turunun 38 bulgusu ve açık makro kopukluklar. Kod donuk; Mami tek tek seçer, körleme onarım yasak."
metadata: 
  node_type: memory
  type: project
  originSessionId: 651a452b-2f9e-43f9-aef5-0f4175d8c3db
  modified: 2026-07-28T14:34:05.945Z
---

# AÇIK İNŞA LEDGER — 2026-07-28

Tam metin: `EXECUTION_STATE.md` → "İNŞA LEDGER" bölümü (38 bulgu, üç bağımsız hakemden geçti).
Kanıt: workflow journal `wf_2bc59520-483`. **Kod donuk — bunlar seçilecek, uygulanacak değil**
([[mamilas-bul-sec-onar]]).

## Sistemin bugün yapamadıkları (yetenek hükmü olarak)

- **Öğrenme halkası kopuk** — hasat topluyor, terfi hiç çalışmıyor; her üretim BOŞ ders
  bankasıyla başlıyor.
- **Enzim kilitleri hiçbir dosyaya yazılmıyor** — konuşmada kararlaştırılıp buharlaşıyor.
- **`prompt-lint` üretimin dörtte birini ölçüyor** — dosya ADINA bağlı (Kütle'nin 35 karesinden
  8'ini gördü), üretimden SONRA koşuyor, üstelik varsayılan EDU register'ıyla (REAL işinde kör).
- **Hasat kapısı içeriğe değil varlığa bakıyor** — boş hasat ile dolu hasat aynı yeşil.
- **Codex `.claude/rules/` yasalarını hiç görmüyor** — parite isim paritesi, operasyon değil.
- **5 videonun ortak görsel imzası yok** — MAMILAS ident'i yok.
- **17 bitmiş `.prproj` diskte okunmamış** — Mami'nin gerçek kesim ritmi orada, madenlenmedi.
- **`memory-sync` tek yönlü ve tehlikeli** — `--check`'in emrettiği tamir ikinci makinede taze
  aklı `archive/`'e sürer. **Yön kararını script veremez** ([[mamilas-tasima-yasasi]]).
- **11 çöp betik** (`scripts/build_*kuvvet*.mjs`, `generate_*.py`) — reddedilmiş biçim, üç ayaklı
  silme kanıtı var. İSTİSNA: `SHOW_DIRECTIVE` (near/mid/far üç düzlem) repoda hiç yok, silmeden
  önce alınmalı.

## Bu turda onarılan (kanıtlı)

`buddy-gate.sh` + `hasat-gate.sh` git index'inde `100644`'tü → **her SessionStart'ta 126 permission
denied ile sessizce ölüyordu.** 755'e alındı. python3 no-op'unun Mac aynası: kusur türü değil,
**körlük** aynı — bir araç ortama dair varsayım yapıyorsa o varsayım test edilmeli.

İlgili: [[mamilas-makro-baglanti-brief]] · [[mamilas-test-suite-is-hollow]] · [[mamilas-makro-kurali]]
