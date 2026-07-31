<!-- mamilas.harvest.v1
{
  "schema": "mamilas.harvest.v1",
  "parserVersion": "kapanis-hasadi@3",
  "promptLintVersion": "prompt-lint@c330b146",
  "harvestedAt": "2026-07-31T12:55:03.340Z",
  "project": {
    "dir": "6. Sınıf - Eşeyli ve Eşeysiz Üreme",
    "id": "3719fec8f615411a"
  },
  "sources": {
    "prompt": [],
    "revize": [
      {
        "file": "Eşeyli ve Eşeysiz Üreme_revize.txt",
        "sha256": "780699db037a9a1a3cc59770074f41004f5aef8392f4b518a5eec36b84aa0917",
        "bytes": 15556,
        "blocks": 31,
        "uniqueFrames": 29
      }
    ],
    "command": null,
    "manifest": null
  },
  "excluded": [
    {
      "file": "Eşeyli ve Eşeysiz Üreme_PROMPTLAR.md",
      "why": "PROMPT_AMBIGUOUS: hangisi final belli değil — Mami kararı"
    },
    {
      "file": "Eşeyli ve Eşeysiz Üreme_PROMPTLAR.txt",
      "why": "PROMPT_AMBIGUOUS: hangisi final belli değil — Mami kararı"
    }
  ],
  "metrics": {
    "frameTotal": null,
    "frameTotalSource": null,
    "revisedBlocks": 31,
    "revisedUniqueFrames": 29,
    "cleanDeclared": null,
    "revizeRatio": null,
    "multiRound": null
  },
  "status": "ERROR",
  "errors": [
    "PROMPT_AMBIGUOUS: Birden çok aday final prompt dosyası var; hangisi final belli değil: Eşeyli ve Eşeysiz Üreme_PROMPTLAR.md · Eşeyli ve Eşeysiz Üreme_PROMPTLAR.txt — HASAT.json ile bildir (promptParts)",
    "RATIO_UNCOMPUTABLE: Kare evreni bilinmiyor — revize oranı hesaplanamaz",
    "COMMAND_MISSING: Command JSON yok — hangi dünyanın sınandığı bilinmiyor"
  ]
}
-->

# KAPANIŞ HASADI — 6. Sınıf - Eşeyli ve Eşeysiz Üreme

Kaynak: `agents/COMMAND-INBOX/Biten/6. Sınıf - Eşeyli ve Eşeysiz Üreme/` · hasat: 2026-07-31 · parser: `kapanis-hasadi@3`

**Bu dosya banka DEĞİL.** Her satır ADAY. `agents/lessons/APPROVED.md`'ye yalnız Mami taşır
(M7 yasası: otomatik promote yok — çöp ders sistemi zehirler). Kabul ettiğin ders satırını
olduğu gibi taşı, istemediğini burada bırak.

## 0 · Ölçüm durumu — **ERROR**

| kanal | seçilen kaynak |
|---|---|
| prompt (discovery) | **YOK** |
| revize (discovery) | `Eşeyli ve Eşeysiz Üreme_revize.txt` |
| command | **YOK** |
| manifest | — |

🔴 **Ölçüm hataları — bu rapordan ders adayı ÜRETİLMEDİ:**

- PROMPT_AMBIGUOUS: Birden çok aday final prompt dosyası var; hangisi final belli değil: Eşeyli ve Eşeysiz Üreme_PROMPTLAR.md · Eşeyli ve Eşeysiz Üreme_PROMPTLAR.txt — HASAT.json ile bildir (promptParts)
- RATIO_UNCOMPUTABLE: Kare evreni bilinmiyor — revize oranı hesaplanamaz
- COMMAND_MISSING: Command JSON yok — hangi dünyanın sınandığı bilinmiyor

## 1 · Yapısal karne (prompt-lint)

🔴 **İki aday final prompt dosyası var; hangisi final belli değil** — körleme seçim yapılmadı:

- `Eşeyli ve Eşeysiz Üreme_PROMPTLAR.md`
- `Eşeyli ve Eşeysiz Üreme_PROMPTLAR.txt`

Karar Mami'nin. Seçim `HASAT.json` içinde `promptParts` ile bildirilir.

## 2 · Ders adayları (revize turundan)

`Eşeyli ve Eşeysiz Üreme_revize.txt` — **31 revize bloğu**, **29 benzersiz kare** · kare evreni bilinmiyor, oran hesaplanmadı · revize oranı **—**

**Ders adayı üretilmedi — ölçüm hatalı** (bkz. §0 ve metadata `errors`).
Hatalı ölçümün altına ders satırı dizmek bankayı zehirler; 388%'lik rapor tam böyle doğdu.

**Sınıflandırılamadı — 25 blok, elle oku:**

- `3.png` — Kapı eşiğinde kimseye ait olmayan iki gri bacak + terlik duruyor (anatomi artefaktı). Use this referenced image, change ONLY: remove the pair of grey legs and s…
- `40.png` — Duvar takviminin gün başlıkları İNGİLİZCE ("SUN MON TUE WED") — Türkçe dersin ekranında. Use this referenced image, change ONLY: the calendar's weekday abbrevia…
- `42.png` — Ortadaki yavru ve anne kedi PEMBE kürklü; yanındaki turuncu yavruya pembe hiç düşmemiş, yani renk lambadan değil kürkten geliyor. Biyoloji dersinde olmayan kedi…
- `47.png` — Karede İKİ defter var: yazı ön plandaki neredeyse dik duran ayrı deftere yazılmış, çocuk ise arkadaki başka deftere yazıyor. Use this referenced image, change O…
- `49.png` — Sepette tek yavru var; VO "yavrular sepette" diyor, referans üç yavru. Use this referenced image, change ONLY: put all three kittens in the basket — one ginger …
- `50.png` — Sepette iki yavru var ve anne kedi hiç yok. Use this referenced image, change ONLY: the basket holds the mother cat and all three kittens together, softly out o…
- `1.png` — Balkon manzarası Anadolu kiremit çatı; K2 gökdelen, K3-K5 Paris mansart. Dünya üç ülke. Ayrıca prompt'un tek yazısı olan FESLEĞEN fidan etiketi karede hiç doğma…
- `2.png` — Efe SOL elinde ikinci bir su bardağı tutuyor (hero bardak ayrıca ledge'de) ve hero bardaktaki gülün pembe tomurcuğu kayıp — sadece dikenli çubuk kalmış. Use thi…
- `3.png (ikinci fix — yukarıdakiyle birlikte istenebilir)` — Toprak torbasının SAKSI TOPRAĞI baskısı okunmaz kıvrım-yazı olmuş ve kadrajın altından kesilmiş. Use this referenced image, change ONLY: bring the soil bag's pr…
- `5.png · 26.png · 27.png — DÜNYA KİLİDİ (üçü aynı cümleyle)` — Balkondan Paris mansart çatı (K5), Fransız arduvaz dam (K26), kemerli taş kapı + kahverengi ahşap korkuluk ve MOR saksı çiçekleri (K27) görünüyor. Hiçbiri Anado…
- `34.png · 35.png · 36.png · 37.png · 38.png — @gul DURUM KİLİDİ` — K32'de gül saksıya dikiliyor (dersin dönüm noktası) ama bu beş karede BARDAĞA geri dönmüş; K38'de kökler suda görünüyor. Bitki kendi kendini söküyor. Use this r…
- `44.png` — @anne kilidi kırık (kot pantolon + kırmızı bluz yok) ve yüzü K43'tekinden belirgin genç. Use this referenced image, change ONLY: @anne in her locked wardrobe — …
- `6.png` — Üç kavram küresinin ikisi defterin sayfası üstünde değil, Efe'nin tulum göğsünde duruyor. Use this referenced image, change ONLY: the three glowing spheres hove…
- `30.png` — Fidan etiketi Efe'nin ağzı ve çenesi üstünden geçip yüzünü ikiye bölüyor. Use this referenced image, change ONLY: move the plant label to the LEFT of the pot, e…
- `31.png` — Ön plandaki korkuluk tek bulanık çubuk değil, kareyi baştan başa kesen 4-5 çubuklu siyah X. Use this referenced image, change ONLY: exactly ONE softly defocused…
- `46.png` — Efe'nin saçı "S" ve "A" harflerinin altını kesiyor. Use this referenced image, change ONLY: raise the lettering one letter-height so the whole word sits clear a…
- `14.png` — VO "üçü de tam ortadan ikiye" diyor ama yalnız paramesyum bölünmüş; öglena ve bakteriler bölünmemiş. Use this referenced image, change ONLY: the euglena is pinc…
- `15.png` — Damlada 9-10 amip var (8 olmalı) ve boyları üç kata varan farkta — "birebir aynı" dersi çürüyor. Use this referenced image, change ONLY: exactly eight amoebae i…
- `17.png` — Hidranın tomurcuğu ebeveynin yeşim dokusunda değil, sert kehribar cam küre — tomurcuk okunmuyor. Use this referenced image, change ONLY: the bud on the hydra's …
- `20.png` — Denizanasında tomurcuk yok; "hepsi aynı şeyi yapıyor" hükmü kareyle kurulmuyor. Use this referenced image, change ONLY: a small second bell buds visibly from th…
- `24.png` — FASULYE etiketi kadrajın en büyük ikinci nesnesi — solucan karesinde en büyük yazı "FASULYE" diyor. Use this referenced image, change ONLY: the plant label at h…
- `25.png` — Cam kap değişmiş (K22/K23'te geniş sığ tabak, burada derin fanus) ve Efe defterine değil sağ üste bakıyor. Use this referenced image, change ONLY: the same wide…
- `33.png` — Banttaki HİDRA'nın İ'si küçük harf boyunda; kavanozdaki hidra yeşil sap + kökçüklerle BİTKİ okuyor. Use this referenced image, change ONLY: the taped word reads…
- `34.png (ikinci fix)` — Renk ayrımı harf harf değil kelime kelime olmuş: "EŞEY" kehribar, "ÜREME" mavi. Use this referenced image, change ONLY: every single letter split down its own v…
- `39.png` — Işıktan siluet "türü okunmayan" değil, bacaklı-kulaklı bir ayı/hamster olarak okunuyor (promptun kendi negatifini ihlal ediyor); ayrıca defter kapalı, açık ve b…

## 3 · Dünya kusuru → kütüphane

⚠️ Command JSON bulunamadı — hangi dünyanın sınandığı bilinmiyor.

## 4 · Kit biçim sapması (PROMPT-YASASI §5)

| beklenen | durum |
|---|---|
| `<Ad>_REFERANSLAR.txt` | ⚠️ ad sapması: `Eşeyli ve Eşeysiz Üreme_REFERANSLAR.txt` |
| `<Ad>_PROMPTLAR.txt` | ⚠️ ad sapması: `Eşeyli ve Eşeysiz Üreme_PROMPTLAR.md` |
| `<Ad>_revize.txt` | ⚠️ ad sapması: `Eşeyli ve Eşeysiz Üreme_revize.txt` |
| `<Ad>_MOTION.txt` | ❌ YOK (kareler görüldükten sonra) |
| `<Ad>_EDIT-PLAN.txt` | ⚠️ ad sapması: `Eşeyli ve Eşeysiz Üreme_EDIT-PLAN.txt` |
| `<Ad>_SESLENDIRME.txt` | ⚠️ ad sapması: `Eşeyli ve Eşeysiz Üreme_SESLENDIRME.txt` |
| `<Ad>_SUNO.txt` | ⚠️ ad sapması: `Eşeyli ve Eşeysiz Üreme_SUNO.txt` |

