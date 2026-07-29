<!-- mamilas.harvest.v1
{
  "schema": "mamilas.harvest.v1",
  "parserVersion": "kapanis-hasadi@3",
  "promptLintVersion": "prompt-lint@b0249ceb",
  "harvestedAt": "2026-07-29T07:21:19.586Z",
  "project": {
    "dir": "Sabit Sürat ve Hız",
    "id": "dc5e8770946017cb"
  },
  "sources": {
    "prompt": [
      {
        "file": "Sabit Sürat ve Hız_PROMPTLAR.txt",
        "sha256": "e1874b27d1648d06105f2e30299242d7e39427b3386aa26c5c314626201e21a9",
        "bytes": 115350,
        "frames": 44
      }
    ],
    "revize": [
      {
        "file": "revize.txt",
        "sha256": "bba2d866910ee8f21f16a2bbff9634c6b1ccddf4e568598b80c89100430c8715",
        "bytes": 3617,
        "blocks": 8,
        "uniqueFrames": 8
      }
    ],
    "command": {
      "file": "sabit-surat-ve-hiz_mamilas_command.json",
      "sha256": "821460a90c6b83f0911590cacf12aa7af3e6761346f42b6a3d43f3f908cb5efd"
    },
    "manifest": null
  },
  "excluded": [],
  "metrics": {
    "frameTotal": 44,
    "frameTotalSource": "prompt-parts",
    "revisedBlocks": 8,
    "revisedUniqueFrames": 8,
    "cleanDeclared": 36,
    "revizeRatio": 0.18181818181818182,
    "multiRound": null
  },
  "status": "OK",
  "errors": []
}
-->

# KAPANIŞ HASADI — Sabit Sürat ve Hız

Kaynak: `agents/COMMAND-INBOX/Biten/Sabit Sürat ve Hız/` · hasat: 2026-07-29 · parser: `kapanis-hasadi@3`

**Bu dosya banka DEĞİL.** Her satır ADAY. `agents/lessons/APPROVED.md`'ye yalnız Mami taşır
(M7 yasası: otomatik promote yok — çöp ders sistemi zehirler). Kabul ettiğin ders satırını
olduğu gibi taşı, istemediğini burada bırak.

## 0 · Ölçüm durumu — **OK**

| kanal | seçilen kaynak |
|---|---|
| prompt (discovery) | `Sabit Sürat ve Hız_PROMPTLAR.txt` |
| revize (discovery) | `revize.txt` |
| command | `sabit-surat-ve-hiz_mamilas_command.json` |
| manifest | — |

## 1 · Yapısal karne (prompt-lint)

`Sabit Sürat ve Hız_PROMPTLAR.txt` — **44 kare** · register **EDU** (yasa §0.5)

| slot | kapsam |
|---|---|
| lens | 44/44 ✅ |
| handle | 44/44 ✅ |
| ten | 43/44 |
| canli | 44/44 ✅ |
| derinlik | 44/44 ✅ |
| temas | 44/44 ✅ |
| style | 44/44 ✅ |
| text | 44/44 ✅ |
| neg | 44/44 ✅ |

**6/44 kare eksikli:**

- `K03 | VO3 "İkisi birlikte okula doğru yürümeye başladılar." · yazı: YOK` — tuzak kelime: sheen
- `K06 | VO6 "evden okula giden yolu çözerek geçirecekti." · yazı: YOK · KAVRAM (rota, olgu y` — ten kilidi (mat, yeşil/gri değil) YOK · tuzak kelime: sheen
- `K08 | VO8 "Mira ve Ali kaldırımdan yürüdüler, köşeyi döndüler ve parkın etrafından dolandı` — tuzak kelime: sheen
- `K12 | VO12 "Peki ya yer değiştirme neydi?" · yazı: YOK` — tuzak kelime: sheen
- `K33 | VO37 "Birinci saniyede 1 metre, ikinci saniyede yine 1 metre, üçüncü saniyede yine 1` — tuzak kelime: bloom
- `K41 | VO47 "Zil çaldığında Mira okulun kapısından içeri girdi ve o günün özetini kafasında` — tuzak kelime: sheen

## 2 · Ders adayları (revize turundan)

`revize.txt` — **8 revize bloğu**, **8 benzersiz kare** / 44 kare (payda kaynağı: prompt-parts) · revize oranı **18%**

Sınıflanan kusurlar — her satır onaylanmaya hazır biçimde yazıldı:

```
- Arka plandaki her yazı yüzeyi (tabela, poster, pano) yumuşak-bulanık ve Türkçe ya da BOŞ kalır; kare-özel yazılmazsa motor İngilizce ya da uydurma harf dizisi basıyor — kaynak: Sabit Sürat ve Hız · 2026-07-29 · Mami onayı
- Karakterin gardırop rengi @referansta kilitlenir; sahne promptunda tarif edilirse aynı çanta kareden kareye renk değiştiriyor — kaynak: Sabit Sürat ve Hız · 2026-07-29 · Mami onayı
- Bayrak, arma ve rozet YAZI slotunun kapsamındadır: mekânda bayrak direği varsa Türk bayrağı açıkça yazılır, yoksa motor Amerikan bayrağı basıyor — kaynak: Sabit Sürat ve Hız · 2026-07-29 · Mami onayı
- Kavram yazısı NET ve tam okunur olur ve konumu yazılır — figür hiçbir harfin önünde durmaz; konum yazılmazsa yazı gövdenin arkasında kalıyor — kaynak: Sabit Sürat ve Hız · 2026-07-29 · Mami onayı
- Ölçü aletinin kadranı da Türkçedir (pusula K/D/G/B, gösterge birimi Türkçe); TEXT slotu yalnız kahraman yazıyı kapsayınca alet üstündeki harfler İngilizce çıkıyor — kaynak: Sabit Sürat ve Hız · 2026-07-29 · Mami onayı
```

| sınıf | kare | nereye yazılır | slot |
|---|---|---|---|
| arka-plan-yazı | 3.png, 16.png, 41.png, 42.png | law | TEXT arka plan kuyruğu |
| renk-süreklilik | 3.png | lesson | @tag disiplini |
| sembol-bayrak | 31.png, 32.png | law | TEXT arka plan kuyruğu (sembol dahil) |
| kavram-yazısı | 35.png | law | TEXT konum |
| kadran-ölçü | 27.png | law | TEXT (diegetik alet yüzeyi) |

## 3 · Dünya kusuru → kütüphane

Dünya: **pixar_3d_edu** — Pixar 3D — Education Tier · sınıf: ANIMATION_EDU · yol: ANIMATION_EDU

🔴 **Ad↔sınıf uyuşmazlığı:** proje adı "Ultra Real Commercial" reklam diyor, sınıf `ANIMATION_EDU` eğitim diyor. Hiçbir kapı söylemiyor. (FAZ 1.5 kapısı.)

Bu hasatta **dünya-yerel kusur çıkmadı** — bulunan kusurların hepsi yasa/ders katmanında.
Kütüphaneye yazılacak bir şey yok; sessiz geçilmiyor, açıkça yazılıyor.

## 4 · Kit biçim sapması (PROMPT-YASASI §5)

| beklenen | durum |
|---|---|
| `<Ad>_REFERANSLAR.txt` | ❌ YOK (prompt yazımından ÖNCE) |
| `<Ad>_PROMPTLAR.txt` | ✅ |
| `<Ad>_revize.txt` | ⚠️ ad sapması: `revize.txt` |
| `<Ad>_MOTION.txt` | ✅ |
| `<Ad>_EDIT-PLAN.txt` | ✅ |
| `<Ad>_SESLENDIRME.txt` | ✅ |
| `<Ad>_SUNO.txt` | ✅ |

