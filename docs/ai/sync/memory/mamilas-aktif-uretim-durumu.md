---
name: mamilas-aktif-uretim-durumu
description: "HOT STATE — aktif video hangisi, hangi aşamada, Mami'nin bekleyen kararı ne. Oturum açılışında 1300 satırlık ledger'ı değil BUNU oku."
metadata: 
  node_type: memory
  type: project
  originSessionId: fbff88be-4a01-42c5-8144-26fb9e4d6996
  modified: 2026-07-28T20:41:25.061Z
---

# ŞU AN — 2026-07-28 gece mührü

## Aktif iş: 6. Sınıf — EŞEYLİ VE EŞEYSİZ ÜREME

`agents/COMMAND-INBOX/6. Sınıf - Eşeyli ve Eşeysiz Üreme/`

| Ne | Durum |
|---|---|
| Start frame promptları | **50/50 bitti** — yazı yasası (§11a/b/c) uygulandı, 25 kare yazı taşıyor, 25'i bilerek temiz |
| Kareler | **50/50 üretildi** — `Resimler/1..50`, 28 numaralı `.jpg`, diğerleri `.png` |
| Kare denetimi | **50/50 tarandı** — 4 ajan, her yazı yüzeyi ffmpeg ile büyütülüp harf harf okundu |
| Revize | Liste çıkarıldı (`_revize.txt`, beş kademe) — **Mami revizeleri YAPTI** |
| Motion promptları | **50/50 yazıldı** — `MOTION/01..50.txt`, §3a + §3b ile |
| Klipler | **Mami üretiyor** (Kling 3.0) |
| Kurgu kiti | ❌ **YAZILMADI** — EDIT-PLAN · SESLENDIRME · SUNO · KABA-KURGU.xml |

**SIRADAKİ TEK ADIM:** klipler gelince kurgu kiti. Ses dosyası adları Mami'nin kuralı:
**müzik `1.mp3` + `2.mp3`, seslendirme `3.mp3`** — kaba kurgu XML'i bunlarla kurulur.

**Birleştiriciler** (repo kökünden koş, alt dizinden çalışmaz):
`node scripts/ureme-birlestir.mjs` (start frame → tek .txt) ·
`node scripts/ureme-motion-birlestir.mjs` (motion → tek .txt).

## Beklemede

- **Bileşke Kuvvet baştan yapılacak.** Mami ekran görüntüsünü atıp *"bundan nefret
  ediyorum, iğrenç animasyonlar"* dedi. Ölçüldü: 52 karenin 52'sinde temas cümlesi,
  `TEXT:` ve `NEGATIVE:` slotu YOK · `saffron`+`bloom` tuzağı 52/52 · STYLE 196-284
  kelime (tavan 110) · motion'da **333 yasak / 3 zaman omurgası**. Sebep: sistemin
  hiçbir şey bilmediği zamanda yapıldı. Kaynak duruyor (69 VO cümlesi, 52 klip planı,
  @mira/@ali/@can/@araba/@kitap). **Mami'ye sorulan ve cevaplanmayan soru: VO'ya
  dokunuyor muyuz?** Önerilen yol: 52'yi birden basma, önce INTRO sekansı.
- **Gece Serumu** — `agents/COMMAND-INBOX/Gece Serumu/` hâlâ commit'siz.
- **agy bağlandı** (Mami kendi hesabıyla girdi; öncesi hocasının hesabıydı) ama henüz
  hiçbir akışta çağrılmıyor — klip izletme sırası kliplerden sonra.
- **push blokajı:** `claude-sync` ve `üreme` commit'leri atıldı, push'u izin katmanı bloklamıştı.
- ⚠ **Codex'e geniş kanon taraması yaptırma denendi, SONUÇSUZ.** `codex-rescue` ajanı görevi
  arka plan Codex sürecine devredip kendi bitti; o süreç 50 komut koşturup hüküm üretmeden
  dondu, çıktı dosyası yalnız komut kaydı. Codex **dar ve tek soruluk** incelemede iş görüyor
  (aynı gün `claude-sync`'te gerçek bir mantık kusuru buldu); geniş "her şeyi tara" görevinde
  değil. Bir dahakine böyle bölme.

İlgili: [[mamilas-uretim-dersleri-2026-07-28]] · [[mamilas-claude-senkronu]] · [[mamilas-agy-video-gozu]]
