---
name: mamilas-uretim-akisi
description: "MAMILAS video üretiminin uçtan uca akışı ve teslim dosyaları — Mami'nin 2026-07-25'te kurduğu düzen."
metadata: 
  node_type: memory
  type: project
  originSessionId: 0b4a7c89-f6c0-4d85-8a52-503440509ec0
  modified: 2026-07-25T18:33:47.316Z
---

Sürtünme (31) + Bileşke Kuvvet (52) tam üretiminde oturan akış. Yönetmen bunu takip eder.

**AKIŞ:**
1. **Command JSON seç** (`agents/COMMAND-INBOX/*_mamilas_command.json`) → Mami'ye hangisi diye sor.
2. **Kesim kararı** — beat'lerin HEPSİNİ oku, filler ayıkla: (a) glue/geçiş cümleleri, (b) kural+sayı ayrı iki kare → tek kare, (c) aynı fikre iki örnek → tek kare, (d) outro fluff. Görüntüyü birleştir, **VO cümlesini ATMA** (Mami VO'yu kesintisiz okutuyor). 69→52 böyle oldu.
3. **Referanslar** — tekrar eden karakter/hero-prop için temiz hero referans promptu yaz (stüdyo zemini kasıtlı, izole). Mami basıp `@handle` tag'ler (auto-tag). `agents/PROMPT-YASASI.md` §2 (@tag disiplini)
4. **Prompt yaz — faz faz** (Intro → Build-up → Climax → Resolution), her fazda Mami yön versin. Toplu da istenebilir. **Yazarken [[mamilas-nb2-hata-katalogu]]'nu uygula** — bilinen 10 NB2 hatası prompt anında kesilir, bir revize turu silinir.
4b. **A/B karşılaştırma kareleri referans-edit ile türetilir** (ince yay/kalın yay, hafif/ağır). A'yı sıfırdan üret, B'yi A'nın görselinden "change ONLY <tek değişken>, keep everything else identical" ile çıkar. Sıfırdan iki kare üretilirse açı/ışık/kompozisyon kayar ve **ders okunmaz olur** — bu kozmetik değil pedagojik kayıp.
5. **Mami üretir + indirir** → `COMMAND-INBOX/<klasör>/1.png…N.png`
6. **REVİZYON FAZI — TEK GEÇİŞ:** kareleri bir kez aç; aynı geçişte hem motion'ı hem varsa revizeyi yaz. Revize = **referans-edit** ("use this referenced image, change ONLY…"), yalnız çok bozuksa baştan üret. Bulanık arka plan yazısına takılma, net okunan yanlışa bak.
7. **MOTION** — kare GÖRÜLDÜKTEN sonra (mutlak yasa). `agents/PROMPT-YASASI.md` §3 (motion template)
8. **Teslim:** Mami Premiere'de klipleri dizer, ElevenLabs VO + Suno müzik bindirir.

**TESLİM DOSYALARI (hepsi `.txt`, COMMAND-INBOX):** `agents/PROMPT-YASASI.md` §5 (teslim seti)
- `<Ad>_PROMPTLAR.txt` — start frame promptları (her biri tek parça, STYLE gömülü)
- `<Ad>_SESLENDIRME.txt` — ElevenLabs metni, kesintisiz cümle listesi
- `<Ad>_EDIT-PLAN.txt` — klip ↔ VO cümlesi ↔ shot tipi ↔ süre haritası (Mami Premiere'i iyi bilmiyor, ahengi yönetmen planlar)
- `<Ad>_REFERANSLAR.txt` — @tag hero referansları
- `<klasör>/revize.txt` — referans-edit düzeltmeleri
- `<Ad>_MOTION.txt` — Kling promptları, **her blok tek parça birleşik prompt** (motion+kamera+negatif akan tek metin; Türkçe başlık satırı sadece bilgi)

**PROMPT BİÇİMİ (Mami'nin tercihi):** tek parça, kopyala-yapıştır, ``` fence YOK, düz ayraç. Motion promptunda karakter adı/@tag yazma — start frame zaten veriyor ("she/the boy/the truck" yeter).

**JSON'un blokladıkları:** [[mamilas-command-json-blokajlari]]
