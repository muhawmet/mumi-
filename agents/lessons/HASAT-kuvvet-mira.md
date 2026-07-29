<!-- mamilas.harvest.v1
{
  "schema": "mamilas.harvest.v1",
  "parserVersion": "kapanis-hasadi@3",
  "promptLintVersion": "prompt-lint@b0249ceb",
  "harvestedAt": "2026-07-29T07:21:19.563Z",
  "project": {
    "dir": "Kuvvet MİRA",
    "id": "10ee1cdef997e30c"
  },
  "sources": {
    "prompt": [],
    "revize": [],
    "command": {
      "file": "Kuvvet MİRA_mamilas_command.json",
      "sha256": "ce5f6d91b830c4157753b7ab2f75a57c8f027b1591060105e41b8030cd60f0b3"
    },
    "manifest": null
  },
  "excluded": [],
  "metrics": {
    "frameTotal": null,
    "frameTotalSource": null,
    "revisedBlocks": 0,
    "revisedUniqueFrames": 0,
    "cleanDeclared": null,
    "revizeRatio": null,
    "multiRound": null
  },
  "status": "ERROR",
  "errors": [
    "PROMPT_MISSING: Final `_PROMPTLAR` dosyası yok — bu projenin yapısı ölçülemedi",
    "REVIZE_NONE: Revize dosyası bulunamadı (bilgi — hata değil)"
  ]
}
-->

# KAPANIŞ HASADI — Kuvvet MİRA

Kaynak: `agents/COMMAND-INBOX/Biten/Kuvvet MİRA/` · hasat: 2026-07-29 · parser: `kapanis-hasadi@3`

**Bu dosya banka DEĞİL.** Her satır ADAY. `agents/lessons/APPROVED.md`'ye yalnız Mami taşır
(M7 yasası: otomatik promote yok — çöp ders sistemi zehirler). Kabul ettiğin ders satırını
olduğu gibi taşı, istemediğini burada bırak.

## 0 · Ölçüm durumu — **ERROR**

| kanal | seçilen kaynak |
|---|---|
| prompt (discovery) | **YOK** |
| revize (discovery) | **YOK** |
| command | `Kuvvet MİRA_mamilas_command.json` |
| manifest | — |

🔴 **Ölçüm hataları — bu rapordan ders adayı ÜRETİLMEDİ:**

- PROMPT_MISSING: Final `_PROMPTLAR` dosyası yok — bu projenin yapısı ölçülemedi
- REVIZE_NONE: Revize dosyası bulunamadı (bilgi — hata değil)

## 1 · Yapısal karne (prompt-lint)

⚠️ `_PROMPTLAR` dosyası yok — bu projenin yapısı ölçülemedi. Ölçülmemiş, temiz değil.

## 2 · Ders adayları (revize turundan)

⚠️ Revize dosyası bulunamadı. İki olasılık ayrılamıyor: **(a)** revize turu yapılmadı,
**(b)** video sıfır revize aldı. Hüküm verilmiyor — Mami'ye soruluyor.

## 3 · Dünya kusuru → kütüphane

Dünya: **pixar_3d_edu** — Pixar 3D — Education Tier · sınıf: ANIMATION_EDU · yol: ANIMATION_EDU

🔴 **Ad↔sınıf uyuşmazlığı:** proje adı "Ultra Real Commercial" reklam diyor, sınıf `ANIMATION_EDU` eğitim diyor. Hiçbir kapı söylemiyor. (FAZ 1.5 kapısı.)

Bu hasatta **dünya-yerel kusur çıkmadı** — bulunan kusurların hepsi yasa/ders katmanında.
Kütüphaneye yazılacak bir şey yok; sessiz geçilmiyor, açıkça yazılıyor.

## 4 · Kit biçim sapması (PROMPT-YASASI §5)

| beklenen | durum |
|---|---|
| `<Ad>_REFERANSLAR.txt` | ❌ YOK (prompt yazımından ÖNCE) |
| `<Ad>_PROMPTLAR.txt` | ❌ YOK (sekans sekans) |
| `<Ad>_revize.txt` | ❌ YOK (denetim geçişinde) |
| `<Ad>_MOTION.txt` | ⚠️ ad sapması: `Kuvvet MİRA_MOTION.md` |
| `<Ad>_EDIT-PLAN.txt` | ✅ |
| `<Ad>_SESLENDIRME.txt` | ✅ |
| `<Ad>_SUNO.txt` | ✅ |

