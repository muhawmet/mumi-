---
name: mamilas-studio
description: Use when working on MAMILAS, planning/producing Mami's AI videos, writing image/motion prompts, or advising on tools, engines, music, VO, or on-screen text — loads Mami's tool park, credit strategy, and hard production constraints.
---

# MAMILAS Studio — Mami'nin İş Gerçeği

Mami (Muhammet) AI eğitim/reklam videoları üretir. Doktor=Mami (sitede reçete kurar), Eczacı=`.command` (Claude'u yönlendirir). Hedef: film-grade, 10/10 beyin.

## Araç parkı — YÜZEY ile MOTOR ayrı şeydir (BAŞKA ARAÇ ÖNERME)

**Yüzeyler** — Mami'nin çalıştığı yer. Motorlar bunların İÇİNDE koşar. Yüzey Mami'nin seçimi; motor sözleşmesi yüzeye göre DEĞİŞMEZ.

| Yüzey | İçindekiler |
|---|---|
| **Magnific Spaces** (eski Freepik) | Sonsuz node canvas, 79 model. Image: Nano Banana Pro/2, Flux 2 Pro, Imagen 4, Seedream 4.5, Ideogram V3, GPT Image. Video: **Kling (O3'e kadar)**, Veo 3.1, Seedance, Wan, Sora 2. Ayrı bir "upscale aracı" DEĞİL — her şey burada |
| **Higgsfield** | 16+ video (Kling 3.0/2.6/o1, Seedance 2.0, Veo 3.1, Wan 2.7, Hailuo) · 15+ image (Nano Banana Pro, FLUX, Seedream, GPT Image 2, Soul 2.0). **Mami'de SONSUZ KREDİ → tüm denemeler burada** |
| Firefly vb. | Aynı motorlar orada da var |

**Motorlar** — asıl üretenler.

| Motor | Rol | Kredi kuralı |
|---|---|---|
| Nano Banana 2 | Start frame (1K) | Yüzeyin içinde, elle. API yok |
| Kling 3.0 | Final take I2V | **PAID — sadece valide edilmiş final take.** Çıktı 1080p. "O3" ayrı motor DEĞİL, reasoning tier |
| Seedance 2 / Veo 3.1 / Wan | Alternatif I2V | Brief hangisini derse o — lehçesi `engine.ts`'te |
| Suno | Müzik | Müzik SADECE buradan |
| ElevenLabs | VO | Tek anlatıcı; ekranda kimse konuşmaz, ağız hareketi global negatif |

- **ZORUNLU UPSCALE ADIMI YOK.** Eskiden "Magnific'te upscale et" diye bir kural vardı — Magnific'i ayrı bir araç sanan yanlış anlamaydı, söküldü (2026-07-11). Nano Banana 1K verir, Kling 1080p çıkarır.
- **Sora 2 kapanıyor** (API 2026-09-24) — üstüne bir şey kurma.
- Motor pencere/lehçe bilgisi EZBERDEN yazılmaz: tek otorite `src/core/engine.ts`.


## Sert kısıtlar (asla ihlal etme)

- **Mami'nin kurgu sınırı (2026-07-10'da doğrudan soruldu):** Premiere'de SADECE klip kesme/sıralama (J-cut, L-cut, kırpma) + VO/müzik yerleştirme, ses seviyesi ve fade yapar. **Kesme sırası + ses yerleşimi içeren kurgu planı üretmek MEŞRU ve işine yarıyor.** ASLA önerme: keyframe, compositing, text/altyazı overlay, renk grading, hız rampası, efekt, dB normalize, After Effects / Resolve / Canva.
- **On-screen text yasası:** metin ya tasarımın parçası olarak IMAGE PROMPT'a gömülür (diegetik: tabela, kitap, ekran; ya da baked typography) ya HİÇ olmaz (temiz plaka + VO anlatır). ".command" text-protect negatifleri metni korur. "Sonra text eklersin" diye bir dünya yok.
- **FRAME-AWARE:** motion prompt asla start frame'i görmeden yazılmaz — onaylı kareye bağlanır.
- **IP katılığı (çift yönlü):** world seçildiyse (ör. one_piece_toei) çıktı O DÜNYA OKUNMALI — jenerik anime/3D kabul edilmez. AMA tanınabilir karakter adı/silüeti export'a sızmaz (telif firewall'u).
- **Palet sadakati:** palet seçimi prompt'a ham hex olarak DEĞİL fiziksel ışık dili olarak geçer (Translation Law).
- **Tarih farkındalığı:** motor yetenek/süre bilgisini ezberden yazma — `src/core/engine.ts` (ENGINE_USABLE + ENGINE_DIALECTS) tek otorite; güncelliğinden şüphen varsa WebSearch ile doğrula (bugünün tarihine bak).

## Üretim hattı (tek doğru sıra)

1. Beyin reçetesi → image prompt → **Nano Banana 2** start frame (1K)
2. Onaylı kareye FRAME-AWARE motion prompt → **Higgsfield**'da varyasyonlar
3. Valide edilen take → **Kling 3.0** final (1080p)
4. **Suno** müzik + **ElevenLabs** VO — video içi ses/müzik yönetimi bu ikisiyle planlanır, editör yok
