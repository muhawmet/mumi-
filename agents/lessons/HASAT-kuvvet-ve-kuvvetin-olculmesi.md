<!-- mamilas.harvest.v1
{
  "schema": "mamilas.harvest.v1",
  "parserVersion": "kapanis-hasadi@3",
  "promptLintVersion": "prompt-lint@c330b146",
  "harvestedAt": "2026-07-31T12:55:03.370Z",
  "project": {
    "dir": "Kuvvet ve Kuvvetin Ölçülmesi",
    "id": "9f1b701cab13a456"
  },
  "sources": {
    "prompt": [
      {
        "file": "Kuvvet ve Kuvvetin Ölçülmesi_PROMPTLAR.txt",
        "sha256": "cf84b9dbdd72931b5763db03c852897c489a62518a401b8cae0c5c734e4d4420",
        "bytes": 178589,
        "frames": 48
      }
    ],
    "revize": [],
    "command": {
      "file": "Kuvvet ve Kuvvetin Ölçülmesi_mamilas_command.json",
      "sha256": "f1f0890b7d00faa75b2769eb5e9cc881f35b14cea0545145c34c7f6a11777ce1"
    },
    "manifest": {
      "file": "HASAT.json",
      "sha256": "386ca6f6219dc4312815a1584757ecb4e04289d9a1285db6a4a6ba5dad92b80d"
    }
  },
  "excluded": [],
  "metrics": {
    "frameTotal": 48,
    "frameTotalSource": "prompt-parts",
    "revisedBlocks": 0,
    "revisedUniqueFrames": 0,
    "cleanDeclared": null,
    "revizeRatio": null,
    "multiRound": null
  },
  "status": "OK",
  "errors": [
    "REVIZE_NONE: Revize dosyası bulunamadı (bilgi — hata değil)"
  ]
}
-->

# KAPANIŞ HASADI — Kuvvet ve Kuvvetin Ölçülmesi

Kaynak: `agents/COMMAND-INBOX/Biten/Kuvvet ve Kuvvetin Ölçülmesi/` · hasat: 2026-07-31 · parser: `kapanis-hasadi@3`

**Bu dosya banka DEĞİL.** Her satır ADAY. `agents/lessons/APPROVED.md`'ye yalnız Mami taşır
(M7 yasası: otomatik promote yok — çöp ders sistemi zehirler). Kabul ettiğin ders satırını
olduğu gibi taşı, istemediğini burada bırak.

## 0 · Ölçüm durumu — **OK**

| kanal | seçilen kaynak |
|---|---|
| prompt (manifest) | `Kuvvet ve Kuvvetin Ölçülmesi_PROMPTLAR.txt` |
| revize (discovery) | **YOK** |
| command | `Kuvvet ve Kuvvetin Ölçülmesi_mamilas_command.json` |
| manifest | `HASAT.json` |

**Notlar:**

- REVIZE_NONE: Revize dosyası bulunamadı (bilgi — hata değil)

## 1 · Yapısal karne (prompt-lint)

`Kuvvet ve Kuvvetin Ölçülmesi_PROMPTLAR.txt` — **48 kare** · register **EDU** (yasa §0.5)

| slot | kapsam |
|---|---|
| lens | 045/45/48 |
| handle | 042/45/48 |
| ten | 043/43/48 |
| canli | 045/45/48 |
| derinlik | 044/45/48 |
| temas | 044/45/48 |
| style | 045/45/48 |
| text | 045/45/48 |
| text-hece | 09/11/48 |
| text-tasiyici | 01/11/48 |
| neg | 045/45/48 |

**45/48 kare eksikli:**

- `K01 | VO1 "Mira'nın hikâyesi çok sıradan bir sabahta başladı."` — STYLE 159 kelime (tavan 110)
- `K02 | VO2a "Odasının kapısını açtı, çantasını sırtına aldı,"` — STYLE 159 kelime (tavan 110)
- `K03 | VO2b "masadan kalemini alıp bir şeyler karaladı,"` — STYLE 137 kelime (tavan 110)
- `K04 | VO2c+3 "sonra bahçeye çıkıp ayağının ucundaki topa vurdu." + "Sıradan hareketlerdi b` — STYLE 143 kelime (tavan 110)
- `K05 | VO4 "Ama Mira o sabah, farkında bile olmadan, doğanın en gizemli ama bir o kadar da ` — temas / yerçekimi cümlesi YOK · STYLE 130 kelime (tavan 110)
- `K06 | VO5 "Bahçeden çıkarken bir çocuğun market arabasını ittiğini gördü."` — @handle (karakter/hero-prop) YOK · STYLE 147 kelime (tavan 110)
- `K07 | VO6 "Karşı kaldırımda biri köpeğinin tasmasını çekiyordu."` — @handle (karakter/hero-prop) YOK · STYLE 142 kelime (tavan 110)
- `K08 | VO7 "Ve o an anladı ki her şey aslında bir itme ve bir çekme savaşıyla başlıyordu."` — @handle (karakter/hero-prop) YOK · STYLE 155 kelime (tavan 110)
- `K09 | VO8+9+10 "Kuvvetin en basit tanımı da buydu işte: duran bir cismi hareket ettiren, h` — üç katman derinlik YOK · TEXT harf karakteri (malzeme ya da tasarım) YOK · tuzak: tekduzelik-yazi · STYLE 129 kelime (tavan 110)
- `K10 | VO11 "Eve döndüğünde meraktan duramadı."` — STYLE 159 kelime (tavan 110)
- `K11 | VO12 "Masasına bir oyuncak arabayla bir paket oyun hamuru koydu ve denemeye başladı.` — STYLE 143 kelime (tavan 110)
- `K12 | VO13 "Duran arabayı parmağıyla ittiğinde araba hareket etti; demek ki kuvvet duran b` — STYLE 138 kelime (tavan 110)
- `K13 | VO14 "Arabayı tekrar hızlandırıp önüne elini koyduğunda araba durdu; demek ki hareke` — STYLE 138 kelime (tavan 110)
- `K14 | VO15 "Oyun hamurunu avucunda sıktığında hamurun şekli tamamen değişti; demek ki cisi` — yazı taşıyan karede HARF HARF heceleme + diakritik YOK · TEXT harf karakteri (malzeme ya da tasarım) YOK · STYLE 146 kelime (tavan 110)
- `K15 | VO16+17 "Ve o akşam izlediği maçta bir futbolcunun gelen topa kafasıyla vurup topu b` — STYLE 154 kelime (tavan 110)
- `K16 | VO18 "Ama Mira'nın kafasında yeni bir soru belirmişti."` — STYLE 146 kelime (tavan 110)
- `K17 | VO19 "Kuvvetin ne olduğunu anlamıştı, peki bir kuvvetin ne kadar güçlü olduğunu nası` — STYLE 134 kelime (tavan 110)
- `K18 | VO20+21 "'Çok güçlü vurdum' demek bilimsel bir ölçüm müydü? Tabii ki hayır."` — STYLE 135 kelime (tavan 110)
- `K19 | VO22 "Kuvveti ölçmek için dinamometre adı verilen bir araç kullanılıyordu."` — TEXT harf karakteri (malzeme ya da tasarım) YOK · STYLE 140 kelime (tavan 110)
- `K20 | VO23 "Şeffaftı, içinde esnek bir yay vardı."` — TEXT harf karakteri (malzeme ya da tasarım) YOK · tuzak: tekduzelik-yazi · STYLE 126 kelime (tavan 110)
- `K21 | VO24 "Kancasına bir cisim asıldığında kuvvet yayı aşağı doğru çekiyor, yay uzuyordu;` — STYLE 133 kelime (tavan 110)
- `K22 | VO25+26 "Ölçtüğü sonucu yazarken de bir birime ihtiyacı vardı: o birim, ünlü bilim i` — TEXT harf karakteri (malzeme ya da tasarım) YOK · tuzak: tekduzelik-yazi · STYLE 123 kelime (tavan 110)
- `K23 | VO27 "Yani bir kuvvet ölçüldüğünde sonuç '5 Newton' ya da kısaca '5 N' diye söyleniy` — TEXT harf karakteri (malzeme ya da tasarım) YOK · tuzak: tekduzelik-yazi · STYLE 121 kelime (tavan 110)
- `K24 | VO28 "Derken Mira iki farklı dinamometre gördü."` — STYLE 142 kelime (tavan 110)
- `K25 | VO29 "Birinin içinde kalın bir yay vardı, diğerinde incecik bir yay."` — TEXT harf karakteri (malzeme ya da tasarım) YOK · tuzak: tekduzelik-yazi · STYLE 122 kelime (tavan 110)
- `K26 | VO30 "İkisi aynı hassaslıkta mı ölçüyordu? Hayır. İşin sırrı yayın özelliklerinde sa` — STYLE 140 kelime (tavan 110)
- `K27 | VO31 "Bir dinamometrenin ölçüm hassasiyeti; yayın kalınlığına, yani kesit alanına, y` — STYLE 122 kelime (tavan 110)
- `K28 | VO32 "İnce yaylı olana hafif bir silgi astığında yay hemen esnedi."     [A KARESİ — ` — tuzak: tekduzelik-yazi · STYLE 138 kelime (tavan 110)
- `K29 | VO33+34 "Demek ki hassas bir ölçüm yapmak istiyorsak, yani çok küçük kuvvetleri bile` — STYLE 147 kelime (tavan 110)
- `K30 | VO35 "Bir tüyü ya da küçük bir silgiyi ölçmek için tam da böyle hassas bir dinamomet` — STYLE 123 kelime (tavan 110)
- `K32 | VO36b "ancak ağır bir taş astığında esnedi."` — tuzak: tekduzelik-yazi · STYLE 137 kelime (tavan 110)
- `K33 | VO37 "Çünkü ağır bir sırt çantasını ölçmeye kalksak ince yay kopabilir ya da bozulab` — STYLE 153 kelime (tavan 110)
- `K34 | VO38+39 "İşte o zaman kalın ve sert yaylı dinamometreler kullanılıyordu. Kalın yaylı` — TEXT harf karakteri (malzeme ya da tasarım) YOK · tuzak: tekduzelik-yazi · STYLE 164 kelime (tavan 110)
- `K35 | VO40+41 "Bir de yayın bakır mı, demir mi, yoksa çelik mi olduğu, yani yayın yapıldığ` — STYLE 146 kelime (tavan 110)
- `K36 | VO42 "Mira denemeye devam etti."` — STYLE 157 kelime (tavan 110)
- `K37 | VO43 "Kancaya önce küçük bir silgi astı, yay az uzadı;"     [A KARESİ — K38 bundan r` — tuzak: tekduzelik-yazi · STYLE 154 kelime (tavan 110)
- `K39 | VO46 "Çünkü dinamometrenin içindeki yay esnek bir maddeydi ve esnek maddeler, üzerle` — TEXT harf karakteri (malzeme ya da tasarım) YOK · tuzak: tekduzelik-yazi · STYLE 138 kelime (tavan 110)
- `K40 | VO47 "Ama Mira bir şeyi merak etti: ya bu küçük dinamometreye kocaman bir okul çanta` — STYLE 153 kelime (tavan 110)
- `K41 | VO48 "O zaman yay esneklik özelliğini kaybeder ve bozulurdu; bir daha eski hâline dö` — STYLE 129 kelime (tavan 110)
- `K42 | VO49 "İşte bu yüzden her dinamometrenin üzerinde yazan maksimum ölçüm değerine dikka` — TEXT harf karakteri (malzeme ya da tasarım) YOK · tuzak: tekduzelik-yazi · STYLE 129 kelime (tavan 110)
- `K43 | VO50 "Günün sonunda Mira defterini açtı ve o gün öğrendiklerini yazdı:"` — STYLE 131 kelime (tavan 110)
- `K44 | VO51+52 "kuvvet, cisimleri hareket ettiren, durduran, yönünü ve şeklini değiştiren i` — yazı taşıyan karede HARF HARF heceleme + diakritik YOK · STYLE 135 kelime (tavan 110)
- `K45 | VO53+54 "birimi Newton, yani N'di; ve dinamometreler içlerindeki esnek yaylar sayesi` — STYLE 125 kelime (tavan 110)
- `K46 | VO55 "Sonra defterini kapattı ve gülümsedi."` — STYLE 153 kelime (tavan 110)
- `K47 | VO56 "Çünkü sıradan sandığı o sabah, aslında bir bilim macerasının ilk günüydü."` — STYLE 148 kelime (tavan 110)

## 2 · Ders adayları (revize turundan)

⚠️ Revize dosyası bulunamadı. İki olasılık ayrılamıyor: **(a)** revize turu yapılmadı,
**(b)** video sıfır revize aldı. Hüküm verilmiyor — Mami'ye soruluyor.

## 3 · Dünya kusuru → kütüphane

Dünya: **pixar_3d_edu** — Pixar 3D — Education Tier · sınıf: ANIMATION_EDU · yol: ANIMATION_EDU

Bu hasatta **dünya-yerel kusur çıkmadı** — bulunan kusurların hepsi yasa/ders katmanında.
Kütüphaneye yazılacak bir şey yok; sessiz geçilmiyor, açıkça yazılıyor.

## 4 · Kit biçim sapması (PROMPT-YASASI §5)

| beklenen | durum |
|---|---|
| `<Ad>_REFERANSLAR.txt` | ✅ |
| `<Ad>_PROMPTLAR.txt` | ✅ |
| `<Ad>_revize.txt` | ❌ YOK (denetim geçişinde) |
| `<Ad>_MOTION.txt` | ✅ |
| `<Ad>_EDIT-PLAN.txt` | ✅ |
| `<Ad>_SESLENDIRME.txt` | ✅ |
| `<Ad>_SUNO.txt` | ✅ |

