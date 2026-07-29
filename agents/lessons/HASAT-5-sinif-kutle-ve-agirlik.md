<!-- mamilas.harvest.v1
{
  "schema": "mamilas.harvest.v1",
  "parserVersion": "kapanis-hasadi@3",
  "promptLintVersion": "prompt-lint@b0249ceb",
  "harvestedAt": "2026-07-29T07:21:19.544Z",
  "project": {
    "dir": "5. Sınıf - Kütle ve Ağırlık",
    "id": "32bdde29e38d328b"
  },
  "sources": {
    "prompt": [
      {
        "file": "Kütle ve Ağırlık_PROMPTLAR.txt",
        "sha256": "6e312b5321c3d2d2cdf2d60e7c2ec4d07814ddba8a5c33bac528a816885b4c47",
        "bytes": 24126,
        "frames": 8
      },
      {
        "file": "Kütle ve Ağırlık_CODEX-KALAN-START-FRAMELER.txt",
        "sha256": "81f790385632f0631a99b2842cc5b72b234a3d37675d7d290243464ad51330c8",
        "bytes": 35508,
        "frames": 27
      }
    ],
    "revize": [
      {
        "file": "revize.txt",
        "sha256": "69f0ef9c4410b93a5347aa7bfa95178b9a7dfbbee162d35c4c37eac3b87ad769",
        "bytes": 4429,
        "blocks": 11,
        "uniqueFrames": 11
      }
    ],
    "command": {
      "file": "Kutle-ve-Agirlik_mamilas_command.json",
      "sha256": "1b0d8c70e8b46ec11cf272d90548dc5f8de1aa1b101cd0166b1cda7d6f92b189"
    },
    "manifest": {
      "file": "HASAT.json",
      "sha256": "42944122bd38fdfefaa96ae5e6def1f1b07efdcc9003ba7453f6f7bbe285ee03"
    }
  },
  "excluded": [
    {
      "file": "REVIZE-VE-MOTION.md",
      "why": "deny-list: adında \"motion\" geçiyor — kit belgesi, revize kaynağı değil"
    }
  ],
  "metrics": {
    "frameTotal": 35,
    "frameTotalSource": "manifest",
    "revisedBlocks": 11,
    "revisedUniqueFrames": 11,
    "cleanDeclared": null,
    "revizeRatio": 0.3142857142857143,
    "multiRound": null
  },
  "status": "OK",
  "errors": []
}
-->

# KAPANIŞ HASADI — 5. Sınıf - Kütle ve Ağırlık

Kaynak: `agents/COMMAND-INBOX/Biten/5. Sınıf - Kütle ve Ağırlık/` · hasat: 2026-07-29 · parser: `kapanis-hasadi@3`

**Bu dosya banka DEĞİL.** Her satır ADAY. `agents/lessons/APPROVED.md`'ye yalnız Mami taşır
(M7 yasası: otomatik promote yok — çöp ders sistemi zehirler). Kabul ettiğin ders satırını
olduğu gibi taşı, istemediğini burada bırak.

## 0 · Ölçüm durumu — **OK**

| kanal | seçilen kaynak |
|---|---|
| prompt (manifest) | `Kütle ve Ağırlık_PROMPTLAR.txt` + `Kütle ve Ağırlık_CODEX-KALAN-START-FRAMELER.txt` |
| revize (manifest) | `revize.txt` |
| command | `Kutle-ve-Agirlik_mamilas_command.json` |
| manifest | `HASAT.json` |

**Elenen aday kaynaklar** (adında `revize` geçiyor ama revize kaynağı değil):

- `REVIZE-VE-MOTION.md` — deny-list: adında "motion" geçiyor — kit belgesi, revize kaynağı değil

## 1 · Yapısal karne (prompt-lint)

`Kütle ve Ağırlık_PROMPTLAR.txt` + `Kütle ve Ağırlık_CODEX-KALAN-START-FRAMELER.txt` — **35 kare** · register **EDU** (yasa §0.5)

Bölünmüş teslim, 2 parça ayrı ayrı lintlendi: `Kütle ve Ağırlık_PROMPTLAR.txt` 8 kare · `Kütle ve Ağırlık_CODEX-KALAN-START-FRAMELER.txt` 27 kare

| slot | kapsam |
|---|---|
| lens | 35/35 ✅ |
| handle | 35/35 ✅ |
| ten | 22/35 |
| canli | 35/35 ✅ |
| derinlik | 35/35 ✅ |
| temas | 35/35 ✅ |
| style | 35/35 ✅ |
| text | 35/35 ✅ |
| neg | 35/35 ✅ |

**13/35 kare eksikli:**

- `K09 | “Kütlenin birimi kilogramdı, küçük cisimlerde gram kullanılıyordu.” | yazı: “kg” ve ` — ten kilidi (mat, yeşil/gri değil) YOK
- `K11 | “Elmanın kütlesi kutupta, Ay’da ya da Mars’ta da değişmezdi.” | yazı: YOK` — ten kilidi (mat, yeşil/gri değil) YOK
- `K12 | “Çünkü elmanın içindeki madde miktarı hiçbir yere gitmiyordu.” | yazı: YOK` — ten kilidi (mat, yeşil/gri değil) YOK
- `K13 | “Sıra ikinci kavramdaydı.” | yazı: “AĞIRLIK”` — ten kilidi (mat, yeşil/gri değil) YOK
- `K16 | “Dünya, üzerindeki her şeyi merkezine doğru çekiyordu.” | yazı: YOK` — ten kilidi (mat, yeşil/gri değil) YOK
- `K18 | “Ağırlık, kütleye etki eden yer çekimi kuvvetinin büyüklüğüdür.” | yazı: YOK` — ten kilidi (mat, yeşil/gri değil) YOK
- `K20 | “Birimi Newton’dı ve kısaca N harfiyle gösterilirdi.” | yazı: “N”` — ten kilidi (mat, yeşil/gri değil) YOK
- `K21 | “Ağırlık bulunduğumuz yere göre değişirdi.” | yazı: YOK` — ten kilidi (mat, yeşil/gri değil) YOK
- `K24 | “Dünya’da dinamometrede ağırlığı yaklaşık altı yüz Newton ölçülüyordu.” | yazı: “600` — ten kilidi (mat, yeşil/gri değil) YOK
- `K26 | “Ay’ın çekim kuvveti Dünya’nınkinin altıda biri kadardı.” | yazı: YOK` — ten kilidi (mat, yeşil/gri değil) YOK
- `K28 | “Dinamometrede ağırlığı yaklaşık yüz Newton’a düştü.” | yazı: “100 N”` — ten kilidi (mat, yeşil/gri değil) YOK
- `K31 | “Kütle maddenin kendisiydi; değişmezdi, eşit kollu teraziyle ölçülürdü ve birimi kil` — ten kilidi (mat, yeşil/gri değil) YOK
- `K32 | “Ağırlık ise gezegenin o maddeye uyguladığı çekim kuvvetiydi; dinamometreyle ölçülür` — ten kilidi (mat, yeşil/gri değil) YOK

## 2 · Ders adayları (revize turundan)

`revize.txt` — **11 revize bloğu**, **11 benzersiz kare** / 35 kare (payda kaynağı: manifest) · revize oranı **31%**

Sınıflanan kusurlar — her satır onaylanmaya hazır biçimde yazıldı:

```
- Arka plandaki her yazı yüzeyi (tabela, poster, pano) yumuşak-bulanık ve Türkçe ya da BOŞ kalır; kare-özel yazılmazsa motor İngilizce ya da uydurma harf dizisi basıyor — kaynak: 5. Sınıf - Kütle ve Ağırlık · 2026-07-29 · Mami onayı
- Dünya malzeme/palet yasası bu kareyi taşımadı — kusur dünyada, kodda değil — kaynak: 5. Sınıf - Kütle ve Ağırlık · 2026-07-29 · Mami onayı
- Her nesne yüzeyine yaslanır ve yumuşak temas gölgesi bırakır; slot düşünce nesne havada yüzüyor — kaynak: 5. Sınıf - Kütle ve Ağırlık · 2026-07-29 · Mami onayı
- Ölçü aletinin kadranı da Türkçedir (pusula K/D/G/B, gösterge birimi Türkçe); TEXT slotu yalnız kahraman yazıyı kapsayınca alet üstündeki harfler İngilizce çıkıyor — kaynak: 5. Sınıf - Kütle ve Ağırlık · 2026-07-29 · Mami onayı
```

| sınıf | kare | nereye yazılır | slot |
|---|---|---|---|
| arka-plan-yazı | 6.png  (K06) | law | TEXT arka plan kuyruğu |
| dünya-malzeme | 6.png  (K06) | library | — |
| temas-yüzey | 15.png  (K15 — havada asılı poz, VO'yu çürütüyor) | law | [9 TEMAS] |
| kadran-ölçü | 33.png  (K33 — LCD hayalet segment), 20.png  (K20 — DOĞRULA) | law | TEXT (diegetik alet yüzeyi) |

**Sınıflandırılamadı — 7 blok, elle oku:**

- `4.png  (K04 — ÇATAL: Mami seçer)` — Teslim edilen kare brief'in mutfağı DEĞİL, bir SINIF flashback'i (öğretmen elmayı tutar, solda terazi + sağda dinamometre + 2 öğrenci + küre). İki ileri reveal'…
- `12.png  (K12 — FIREWALL: insan sızmış)` — Use this referenced image, change ONLY: remove the blurry person in the background (leave a clean warm soft-focus backdrop), remove the glass bell dome/cloche o…
- `23.png  (K23 — yazı garble "60 66")` — Use this referenced image, change ONLY: the balance beam plate text must read exactly "60 kg" with clean digits (not "60 66"). Keep everything else identical.…
- `11.png  (K11 — ✅ KAPANDI, revize GEREKMİYOR)` — Mami'nin kararı (2026-07-28): kare değil VO değişti. "Ay'da" → "Dünya'nın öbür ucunda". Üç lomboz artık cümleye birebir oturuyor: kutup-Dünya / Dünya / Mars. Be…
- `19.png  (K19 — vurgu netliği)` — change ONLY: make the second hand at the right edge clearly point toward the dynamometer as the correct instrument. Keep everything else identical.…
- `24.png  (K24 — izle)` — Arka planda sağda çok bulanık bir figür olabilir; brief "kişi YOK" der, baskın değil. İstenirse: change ONLY: remove the faint background figure, keep the works…
- `31.png  (K31 — izle)` — Terazi kolu tam yatay dengede değil, hafif eğik. İstenirse: change ONLY: bring the balance beam to level (horizontal). Keep the KÜTLE plaque, apple, weights and…

## 3 · Dünya kusuru → kütüphane

Dünya: **pixar_3d_edu** — Pixar 3D — Education Tier · sınıf: ANIMATION_EDU · yol: ANIMATION_EDU

🔴 **Ad↔sınıf uyuşmazlığı:** proje adı "Ultra Real Commercial" reklam diyor, sınıf `ANIMATION_EDU` eğitim diyor. Hiçbir kapı söylemiyor. (FAZ 1.5 kapısı.)

`pixar_3d_edu` için kütüphane adayları (`src/core/SURGERY_DATA.json` — **kod eğilmez**):

- Dünya malzeme/palet yasası bu kareyi taşımadı — kusur dünyada, kodda değil (kare: 6.png  (K06))

## 4 · Kit biçim sapması (PROMPT-YASASI §5)

| beklenen | durum |
|---|---|
| `<Ad>_REFERANSLAR.txt` | ⚠️ ad sapması: `Kütle ve Ağırlık_REFERANSLAR.txt` |
| `<Ad>_PROMPTLAR.txt` | ⚠️ ad sapması: `Kütle ve Ağırlık_PROMPTLAR.txt` |
| `<Ad>_revize.txt` | ⚠️ ad sapması: `revize.txt` |
| `<Ad>_MOTION.txt` | ⚠️ ad sapması: `Kütle ve Ağırlık_MOTION.txt` |
| `<Ad>_EDIT-PLAN.txt` | ⚠️ ad sapması: `Kütle ve Ağırlık_EDIT-PLAN.txt` |
| `<Ad>_SESLENDIRME.txt` | ⚠️ ad sapması: `Kütle ve Ağırlık_SESLENDIRME.txt` |
| `<Ad>_SUNO.txt` | ⚠️ ad sapması: `Kütle ve Ağırlık_SUNO.txt` |

