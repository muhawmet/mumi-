<!-- mamilas.harvest.v1
{
  "schema": "mamilas.harvest.v1",
  "parserVersion": "kapanis-hasadi@3",
  "promptLintVersion": "prompt-lint@b0249ceb",
  "harvestedAt": "2026-07-29T07:21:19.550Z",
  "project": {
    "dir": "6. Sınıf - Kuvvetlerin Güç Birliği",
    "id": "e4283de967d369c0"
  },
  "sources": {
    "prompt": [
      {
        "file": "Bileşke Kuvvet_PROMPTLAR.txt",
        "sha256": "5f42bf7548666ffc4abf11c296f54efb99d633ea0336445a32a3bca7c15fef47",
        "bytes": 164181,
        "frames": 52
      }
    ],
    "revize": [
      {
        "file": "Bileşke Kuvvet_REVİZE-PROMPTLAR.txt",
        "sha256": "52226500c030dde433a3ee814bb242921b2610de10c45e812cd9fa433108bda7",
        "bytes": 6295,
        "blocks": 19,
        "uniqueFrames": 19
      },
      {
        "file": "Bileşke Kuvvet_REVİZE-TUR2.txt",
        "sha256": "bc2c419e144ed408ec69442ece188fbfdfb0abe54480a35b70c44b0761d9d6fc",
        "bytes": 8169,
        "blocks": 33,
        "uniqueFrames": 27
      }
    ],
    "command": null,
    "manifest": null
  },
  "excluded": [],
  "metrics": {
    "frameTotal": 52,
    "frameTotalSource": "prompt-parts",
    "revisedBlocks": 52,
    "revisedUniqueFrames": 34,
    "cleanDeclared": null,
    "revizeRatio": 0.6538461538461539,
    "multiRound": {
      "rounds": 2,
      "repeatedFrames": [
        "2",
        "8",
        "9",
        "12",
        "14",
        "15",
        "18",
        "19",
        "21",
        "25",
        "34",
        "35"
      ],
      "carryOverRate": 0.631578947368421,
      "perRound": [
        {
          "file": "Bileşke Kuvvet_REVİZE-PROMPTLAR.txt",
          "blocks": 19,
          "frames": 19
        },
        {
          "file": "Bileşke Kuvvet_REVİZE-TUR2.txt",
          "blocks": 33,
          "frames": 27
        }
      ]
    }
  },
  "status": "OK",
  "errors": [
    "COMMAND_MISSING: Command JSON yok — hangi dünyanın sınandığı bilinmiyor"
  ]
}
-->

# KAPANIŞ HASADI — 6. Sınıf - Kuvvetlerin Güç Birliği

Kaynak: `agents/COMMAND-INBOX/Biten/6. Sınıf - Kuvvetlerin Güç Birliği/` · hasat: 2026-07-29 · parser: `kapanis-hasadi@3`

**Bu dosya banka DEĞİL.** Her satır ADAY. `agents/lessons/APPROVED.md`'ye yalnız Mami taşır
(M7 yasası: otomatik promote yok — çöp ders sistemi zehirler). Kabul ettiğin ders satırını
olduğu gibi taşı, istemediğini burada bırak.

## 0 · Ölçüm durumu — **OK**

| kanal | seçilen kaynak |
|---|---|
| prompt (discovery) | `Bileşke Kuvvet_PROMPTLAR.txt` |
| revize (discovery) | `Bileşke Kuvvet_REVİZE-PROMPTLAR.txt` + `Bileşke Kuvvet_REVİZE-TUR2.txt` |
| command | **YOK** |
| manifest | — |

**Notlar:**

- COMMAND_MISSING: Command JSON yok — hangi dünyanın sınandığı bilinmiyor

## 1 · Yapısal karne (prompt-lint)

`Bileşke Kuvvet_PROMPTLAR.txt` — **52 kare** · register **STY** (yasa §0.5)

| slot | kapsam |
|---|---|
| lens | 52/52 ✅ |
| handle | 51/52 |
| ten | 15/52 |
| canli | 0/52 |
| derinlik | 52/52 ✅ |
| temas | 0/52 |
| style | 52/52 ✅ |
| text | 0/52 |
| neg | 0/52 |

**52/52 kare eksikli:**

- `K01 [MİRA]  |  VO 1: "Bu Mira. Her sabah olduğu gibi bugün de okula gitmek için yola çıktı` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K02 [MİRA]  |  VO 2: "Kapıyı itti, ağır çantasını omzuna aldı ve otobüse yetişmek için koş` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K03 [WORLD]  |  VO 3: "...her hareketin arkasında görünmez bir güç vardı: Kuvvet!"   (KUVV` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K04 [WORLD]  |  VO 4: "Kapıyı açarken, topa vururken ya da market arabasını iterken hep ku` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K05 [MİRA]  |  VO 5+6: "Peki bir cismi her zaman tek bir kuvvet mi etkiler? Tabii ki hayır` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K06 [WORLD]  |  VO 7: "Bazen birden fazla kuvvet bir araya gelir ve güçlerini birleştirir.` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K07 [MİRA]  |  VO 8+9: "Mira bugün bu gizemli gücü, bileşke kuvveti keşfedecek. Hazırsanız` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K08 [MİRA]  |  VO 10+11: "Mira'nın ilk dersi fendi. Öğretmeni tahtaya sevimli bir kutu çiz` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K09 [WORLD]  |  VO 12: "Sonra bir kuvveti tam olarak tanımlamak için dört şeye ihtiyacımız` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K10 [WORLD]  |  VO 13: "Birincisi uygulama noktası, yani kuvvetin cisme etki ettiği yer."` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K11 [WORLD]  |  VO 14+15: "İkincisi doğrultu; doğu-batı gibi bir çizgi. Üçüncüsü yön; doğu` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K12 [WORLD]  |  VO 16: "Ve dördüncüsü büyüklük, yani kuvvetin Newton cinsinden değeri; mes` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K13 [MİRA]  |  VO 17: "Mira defterine not aldıkça bir şeyi merak etti: Ya bir cisme aynı a` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K14 [MİRA/sınıf]  |  VO 18: "İşte tam o an öğretmeni sihirli tanımı söyledi:"` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 258 kelime (tavan 110)
- `K15 [WORLD/tahta]  |  VO 19+20: "İki ya da daha fazla kuvvetin bir cisme yaptığı etkiyi, t` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 258 kelime (tavan 110)
- `K16 [CAST/bahçe]  |  VO 21+22: "Zil çaldı, teneffüs başladı. Mira bahçeye çıktığında arkad` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen
- `K17 [WORLD/eller]  |  VO 23: "Ali arabayı doğu yönünde var gücüyle, 10 N ile itiyordu ama ` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 247 kelime (tavan 110)
- `K18 [WORLD/eller]  |  VO 24: "Yetmedi! Can da yardıma koştu ve aynı yönde 15 N ile destek ` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 247 kelime (tavan 110)
- `K19 [WORLD]  |  VO 25: "İkisi de aynı doğrultuda ve aynı yönde kuvvet uyguladığı için bu k` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen
- `K20 [WORLD]  |  VO 26+27: "Aynı yönlü kuvvetlerde bileşke kuvveti bulmak için onları topla` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 247 kelime (tavan 110)
- `K21 [WORLD/CAST]  |  VO 28: "Ve araba, doğu yönündeki bu 25 N'luk güçle çamurdan bir anda ` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen
- `K22 [MİRA]  |  VO 29: "Mira gülümsedi: Demek aynı yöndeki kuvvetler birleşince güçleniyord` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen
- `K23 [CAST]  |  VO 30+31: "Öğleden sonra beden eğitimi dersinde sınıfça halat çekme yarışı ` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen
- `K24 [WORLD/eller]  |  VO 32: "Batı tarafındaki arkadaşı halatı 30 N ile çekerken, doğu tar` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 247 kelime (tavan 110)
- `K25 [WORLD]  |  VO 33: "Ortadaki kırmızı kurdele yavaşça batıya doğru kaydı."` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen
- `K26 [MİRA]  |  VO 34: "Mira bu sefer kuvvetlerin aynı doğrultuda ama zıt yönlerde olduğunu` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen
- `K27 [WORLD]  |  VO 35: "kendi kendine 'Bunları toplayamam, çünkü birbirlerine karşı çekiyo` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen
- `K28 [WORLD]  |  VO 36+37: "Zıt yönlü kuvvetlerde büyük kuvvetten küçük kuvveti çıkarırız. ` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 247 kelime (tavan 110)
- `K29 [WORLD]  |  VO 38: "Peki halat hangi yöne hareket etti?"` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen
- `K30 [WORLD]  |  VO 39: "Tabii ki güçlü olanın yönüne, yani batıya!"` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen
- `K31 [WORLD]  |  VO 40: "Mira'nın bulduğu bileşke kuvvet: batı yönünde 10 N."` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 247 kelime (tavan 110)
- `K32 [WORLD/eller]  |  VO 41+42: "Ders bitince Mira kütüphaneye uğradı. Masanın üzerinde se` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen
- `K33 [WORLD]  |  VO 43: "'Bu kitap hareket etmiyor ama üzerine kuvvet etki ediyor olmalı.'"` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen
- `K34 [WORLD]  |  VO 44: "Gerçekten de yer çekimi kitabı aşağı çekiyor, masa ise onu tam ola` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen
- `K35 [WORLD]  |  VO 45+46: "İki kuvvet eşit ve zıt yönlü olduğu için birbirini yok ediyor, ` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 247 kelime (tavan 110)
- `K36 [MİRA]  |  VO 47: "İşte Mira buna dengelenmiş kuvvetler dendiğini öğrendi."` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen
- `K37 [WORLD]  |  VO 48: "Ama dengelenmiş olmak sadece durmak demek değildi."   (HINGE → Cli` — ten kilidi (mat, yeşil/gri değil) YOK · canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 284 kelime (tavan 110)
- `K38 [WORLD]  |  VO 49+50+51: "Otobanda sabit süratle giden bir araba da, gökyüzünde sabit ` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · STYLE 196 kelime (tavan 110)
- `K39 [MİRA]  |  VO 52: "Tam o sırada Mira pencereden dışarı baktı."` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom
- `K40 [WORLD]  |  VO 53: "Bahçedeki ağaçtan bir elma koptu ve gitgide hızlanarak yere düştü.` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom
- `K41 [WORLD]  |  VO 54: "Biraz ötede bir bisikletli, önüne aniden bir kedi çıkınca frene ba` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom
- `K42 [MİRA]  |  VO 55: "Mira bunların dengelenmiş olamayacağını anladı, çünkü ikisinde de h` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom
- `K43 [WORLD]  |  VO 56+57: "Eğer bileşke kuvvet sıfırdan farklıysa, yani taraflardan biri d` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · STYLE 196 kelime (tavan 110)
- `K44 [MİRA]  |  VO 58: "Kısacası Mira şu kuralı çıkardı:"` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom
- `K45 [WORLD]  |  VO 59+60: "Bir şey hızlanıyorsa, yavaşlıyorsa ya da yön değiştiriyorsa, bi` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K46 [MİRA]  |  VO 61: "Akşam eve dönerken Mira o gün öğrendiklerini düşündü."` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom
- `K47 [WORLD]  |  VO 62: "Artık kuvvetlerin bazen birleşip güçlendiğini, bazen çekişip birbi` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · tuzak kelime: sheen · STYLE 196 kelime (tavan 110)
- `K48 [MİRA]  |  VO 63: "Bugün bileşke kuvveti jet hızıyla öğrendik!"` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom
- `K49 [MİRA]  |  VO 64: "Şimdi sıra sizde; işte Mira'dan küçük bir ödüllü soru:"` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom
- `K50 [WORLD]  |  VO 65+66: "Bir kutuyu kuzey yönünde 15 N, güney yönünde ise yine 15 N kuvv` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · STYLE 196 kelime (tavan 110)
- `K51 [MİRA]  |  VO 67+68: "Cevaplarınızı yorumlara bekliyoruz. Bilimle kalın, kuvvetiniz he` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · STYLE 189 kelime (tavan 110)
- `K52 [MİRA]  |  VO 69: "Mira'yla bir sonraki keşifte görüşmek üzere!"   (KAPANIŞ)` — canlı üçlü (karede yaşayan 3 şey) YOK · temas / yerçekimi cümlesi YOK · TEXT: slotu (ayrı satır) YOK · NEGATIVE: slotu (ayrı satır) YOK · tuzak kelime: saffron · tuzak kelime: bloom · STYLE 225 kelime (tavan 110)

## 2 · Ders adayları (revize turundan)

`Bileşke Kuvvet_REVİZE-PROMPTLAR.txt` + `Bileşke Kuvvet_REVİZE-TUR2.txt` — **52 revize bloğu**, **34 benzersiz kare** / 52 kare (payda kaynağı: prompt-parts) · revize oranı **65%**

### Tur devri — düzeltme tuttu mu?

**2 tur.** `Bileşke Kuvvet_REVİZE-PROMPTLAR.txt` 19 blok / 19 kare · `Bileşke Kuvvet_REVİZE-TUR2.txt` 33 blok / 27 kare

İlk turdan geri dönen kare: **12** (2, 8, 9, 12, 14, 15, 18, 19, 21, 25, 34, 35) → tur devri **63%**

Bu sayı "revize yazıldı" ile "kusur kapandı" arasındaki farktır: geri dönen kare,
birinci turda verilen düzeltmenin motorda TUTMADIĞI karedir.

Sınıflanan kusurlar — her satır onaylanmaya hazır biçimde yazıldı:

```
- Arka plandaki her yazı yüzeyi (tabela, poster, pano) yumuşak-bulanık ve Türkçe ya da BOŞ kalır; kare-özel yazılmazsa motor İngilizce ya da uydurma harf dizisi basıyor — kaynak: 6. Sınıf - Kuvvetlerin Güç Birliği · 2026-07-29 · Mami onayı
- Kavram ışığı YUVARLAK sıcak-altın ışıktır ve ışık kalır — taç yaprağı, sap, ok ucu ya da alev olmaz — kaynak: 6. Sınıf - Kuvvetlerin Güç Birliği · 2026-07-29 · Mami onayı
- Ölçü aletinin kadranı da Türkçedir (pusula K/D/G/B, gösterge birimi Türkçe); TEXT slotu yalnız kahraman yazıyı kapsayınca alet üstündeki harfler İngilizce çıkıyor — kaynak: 6. Sınıf - Kuvvetlerin Güç Birliği · 2026-07-29 · Mami onayı
- Sayı ile birim AYRI ve aralıklı yazılır ("R = 0 N", asla "R = ON"); her değer için TEK etiket — kaynak: 6. Sınıf - Kuvvetlerin Güç Birliği · 2026-07-29 · Mami onayı
- Ten sıcak mat ve düşük specular yazılır; yeşil/gri cilt karenin reddidir — kaynak: 6. Sınıf - Kuvvetlerin Güç Birliği · 2026-07-29 · Mami onayı
- Her nesne yüzeyine yaslanır ve yumuşak temas gölgesi bırakır; slot düşünce nesne havada yüzüyor — kaynak: 6. Sınıf - Kuvvetlerin Güç Birliği · 2026-07-29 · Mami onayı
- Bayrak, arma ve rozet YAZI slotunun kapsamındadır: mekânda bayrak direği varsa Türk bayrağı açıkça yazılır, yoksa motor Amerikan bayrağı basıyor — kaynak: 6. Sınıf - Kuvvetlerin Güç Birliği · 2026-07-29 · Mami onayı
```

| sınıf | kare | nereye yazılır | slot |
|---|---|---|---|
| arka-plan-yazı | 2.png, 7.png, 9.png, 12.png, 14.png, 15.png, 19.png, 21.png, 8.png   (sahne HOŞ — sadece tam öğretmen eksik; referans-edit), 32.png, 8.png, 9.png, 12.png, 14.png, 21.png | law | TEXT arka plan kuyruğu |
| kavram-ışığı | 11.png, 17.png, 19.png, 21.png, 25.png, 30.png   (en kötüsü), 29.png, 14.png, 38.png, 19.png, 21.png, 25.png | law | [6 KAVRAM] |
| kadran-ölçü | 12.png, 12.png | law | TEXT (diegetik alet yüzeyi) |
| sayısal-etiket | 12.png, 17.png, 18.png, 35.png, 35.png, 24.png, 12.png, 50.png, 18.png, 35.png | law | TEXT harf harf |
| ten | 14.png, 14.png, 39.png | law | [3 KİMLİK] |
| temas-yüzey | 34.png, 35.png, 8.png   (sahne HOŞ — sadece tam öğretmen eksik; referans-edit), 33.png (ek), 50.png, 33.png, 35.png | law | [9 TEMAS] |
| sembol-bayrak | 2.png | law | TEXT arka plan kuyruğu (sembol dahil) |

**Sınıflandırılamadı — 17 blok, elle oku:**

- `13.png` — Use this referenced image. Change ONLY: turn the notebook text into faint illegible pencil scribbles — remove the raised/garbled letters and any English. Keep M…
- `16.png` — Use this referenced image. Change ONLY the characters' identities/outfits: the child pushing in the middle is @ali in a GREEN hoodie (NOT Mira's red overalls); …
- `45.png` — Use this referenced image. Change ONLY the panel labels: fix the garbled/repeated "ETKİSİ ETKİSİ" text to clean labels — a small shared header "DENGELENMEMİŞ KU…
- `52.png` — Use this referenced image. Change ONLY: Mira's outfit from a yellow hoodie to her own red hoodie + denim overalls (Saturn pocket). Keep the sunset, the wave, th…
- `36.png` — Use this referenced image. Change ONLY the book-cover text: it is currently MIRRORED/reversed and unreadable — write it correctly and legibly as Turkish "DENGEL…
- `5.png    (blokta çiçek + sarı gölcük)` — …
- `6.png    (blokta kocaman lotus çiçeği)` — …
- `15.png   (tahtadaki çizim: iki safran çiçeği → iki glow birleşiyor)` — …
- `31.png   (halatın ortasında BİTMİŞ turuncu çiçek — tamamen kaldır, yerine glow)` — …
- `33.png   (kitabın üstünde/altında çiçek → glow)` — …
- `47.png   (üç panelde de çiçekler → yuvarlak glow'lar; "BİRLEŞİR/ÇEKİŞİR/DENGE" yazıları doğru, kalsın)` — ##### C) DİĞER NET HATALAR #####…
- `23.png` — Use this referenced image. Change ONLY the child standing at the right watching: it must be @mira (girl, red hoodie + denim overalls), not a boy in a green hood…
- `30.png (ek)` — Also: @mira must NOT pull the rope — she stands watching at the side, hands free. ##### D) KÜTÜPHANE SEKANSI — @kitap SÜREKLİLİĞİ (K32–K37) ##### Kitap her ka…
- `32.png` — Use this referenced image. Change ONLY the book on the table: replace it with @kitap (the tagged reference book), lying flat in exactly the same position, same …
- `34.png` — Use this referenced image. Change ONLY the book: replace it with @kitap, lying flat on the table in the same position and angle. Keep the two equal glows above …
- `36.png` — Use this referenced image. Change ONLY the book: replace it with @kitap in the same position and angle — its cover title must read correctly left-to-right, neve…
- `37.png` — Use this referenced image. Change ONLY the book: replace it with @kitap, lying flat on the table in the same position and angle. Keep the window, the view outsi…

## 3 · Dünya kusuru → kütüphane

⚠️ Command JSON bulunamadı — hangi dünyanın sınandığı bilinmiyor.

## 4 · Kit biçim sapması (PROMPT-YASASI §5)

| beklenen | durum |
|---|---|
| `<Ad>_REFERANSLAR.txt` | ⚠️ ad sapması: `Bileşke Kuvvet_REFERANSLAR.txt` |
| `<Ad>_PROMPTLAR.txt` | ⚠️ ad sapması: `Bileşke Kuvvet_PROMPTLAR.txt` |
| `<Ad>_revize.txt` | ❌ YOK (denetim geçişinde) |
| `<Ad>_MOTION.txt` | ⚠️ ad sapması: `Bileşke Kuvvet_MOTION.txt` |
| `<Ad>_EDIT-PLAN.txt` | ⚠️ ad sapması: `Bileşke Kuvvet_EDIT-PLAN.txt` |
| `<Ad>_SESLENDIRME.txt` | ⚠️ ad sapması: `Bileşke Kuvvet_SESLENDIRME.txt` |
| `<Ad>_SUNO.txt` | ⚠️ ad sapması: `Bileşke Kuvvet_SUNO.txt` |

