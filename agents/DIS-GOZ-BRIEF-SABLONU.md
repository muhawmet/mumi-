# DIŞ GÖZ — BRIEF VE HÜKÜM BLOĞU ŞABLONU

Roller, beş tetikleyici ve sonuç sözlüğü **burada tanımlanmaz** — tek otorite
`docs/ai/DORTLU-MASA.md`. Bu dosya yalnız **biçimdir**: dış göze ne verilir, geri gelen ne
şekilde repo'ya yazılır.

Şablonlar icat edilmedi; **gerçek koşmuş iki çıktının biçiminden** çıkarıldı
(`~/Desktop/mamiş/01-SOL-REVIEW.md` · `~/Desktop/mamiş/02-AGY-REVIEW.md`, 2026-08-05).

🔴 **`~/Desktop/mamiş/` transfer alanıdır, kanonik receipt değildir.** Oradan gelen bulgu
aşağıdaki **hüküm bloğu** olarak repo artefact'ine taşınmadıysa yaşamamış sayılır.

---

## 1. SOL BRIEF — karşı-yönetmene ne verilir

Sol **gerçek dosyaları okur**; Claude'un özeti verilmez. Ölçülmüş sınırlar: CLI bağlam
penceresi **272.000** (kullanılabilir ~258k) ve **tek dosya okuması 10.000 token'da kesilir** —
yani "repoyu ver" denmez, **adı verilmiş 5-15 dosyalık, toplamı 200k altında bir küme** verilir.
Sol **video göremez** (`text`, `image`); klip AGY'nin işidir.

```
# <TASK ADI> — SOL KARŞI-DENETİMİ

Sen KARŞI-YÖNETMENSİN. Prompt yazmıyorsun, jüri değilsin, Mami adına hüküm vermiyorsun.
İşin: aşağıdaki GERÇEK dosyaları AÇIP OKUMAK ve iddiayı ÇÜRÜTMEK.
Claude'un özetine güvenme — yalnız dosyaların kendisine bak.

## OKUYACAĞIN GERÇEK YOLLAR
1. <mutlak ya da repo-göreli yol>   — <neden bu dosya>
…  (5-15 dosya, toplam < 200k)

## ÇÜRÜTÜLECEK İDDİA
<Claude'un kurduğu hüküm, tek cümle, ölçülebilir biçimde>

## ÇIKTI BİÇİMİ — bundan başkasını yazma
Tek satır hüküm: CLEAR TO CONTINUE | RESHAPE | NARROW | UNPROVEN
Sonra en fazla 8 madde; her madde:
  · GERÇEK DOSYA YOLU + SATIR NUMARASI (okumadığın şey hakkında madde yazma)
  · BULGU (tek cümle)
  · SONUÇ: uygulanmalı / daraltılmalı / kanıt yetersiz
Emin olmadığın yerde UNPROVEN yaz — sahte CLEAR yasak.
```

**Çağrı** (maliyet kararı; üçünün de bağlamı aynı, fark muhakeme ve fiyat — 1M girdi başına
kredi: Sol 125 · Terra 50 · Luna 5):

```bash
codex exec -m gpt-5.6-sol -c model_reasoning_effort='"high"' \
  -s read-only --skip-git-repo-check -o <cikti.txt> "$(cat <brief.md>)"
```

---

## 2. AGY BRIEF — gerçek göze ne verilir

AGY **yalnız gerçek medyayı** okur. 🔴 **HÜKÜM SORDURULMAZ, TARİF ETTİRİLİR** — hüküm sorulunca
her şeye "YOK" basıyor.

Ölçülmüş çağrı kuralları (`~/Desktop/mamiş/02-AGY-REVIEW.md` çağrı kaydı: 7 klip · 20 dk →
`ERROR timeout`; 3 klip · 25 dk → `SUCCESS` 568 sn):

- **TAM YOLLAR**, tek satır. Medya repo dışında (`~/Desktop/6. Sınıf Animasyonlar/…`).
- `--output-format json` **zorunlu** — text modunda başarısızlık boş satır, JSON'da `status`+`error`.
- **3-4 kliplik dar paket.** Tam film için ayrı çağrı, `--print-timeout 25m`.
- İzin bayrağı AGY'nin kendi onay kapısını kapatır; **salt-okur tarif işlerinde** kullanılır.

```bash
agy --dangerously-skip-permissions --model gemini-3.6-flash-high \
    --output-format json --print-timeout 25m -p "<tek satır, TAM YOLLARLA, TARİF sorusu>"
```

Tarif sorusu kalıbı — hüküm değil gözlem ister:

```
Şu klipleri saniye damgasıyla TARİF et (hüküm verme, yalnız ne gördüğünü yaz):
<tam yol 1> <tam yol 2> <tam yol 3>
Her klip için: (1) ne oldu ve ne zaman, (2) hangi öğe şekil değiştirdi ve kaçıncı saniyede,
(3) ağız oynuyor mu ve hangi aralıkta, (4) kamera ne yaptı, (5) klip nerede kesildi,
(6) olay klibin başında zaten olmuş muydu yoksa klip boyunca mı gerçekleşti.
```

---

## 3. HÜKÜM BLOĞU — geri gelen sonucun repo'daki biçimi

Bu blok, `docs/ai/DORTLU-MASA.md` §4'teki dört yerden birine yazılır (ENZİM KİLİT 5 ·
`<Ad>_CANARY-LOCK.md` · shot'ın kendi Shot Card'ı · kapanış hasadı). **Ayrı rapor dosyası
açılmaz.** Ölçen: `scripts/hukum-blogu.mjs`.

```
## DIŞ GÖZ HÜKMÜ — SOL · 2026-08-05
KOŞULDU: codex exec -m gpt-5.6-sol · high · read-only · 4 dosya
OKUNAN: agents/COMMAND-INBOX/<Ad>/<Ad>_ENZIM.md · sha256:8fbeaafccf4c413d
OKUNAN: agents/COMMAND-INBOX/<Ad>/SHOTS/CANARY-8.md
HÜKÜM: NARROW
BULGU: Ref sözleşmesi sekiz kartın üçünde TAŞIMAZ satırı taşımıyor.
SONUÇ: daraltıldı — kural yalnız canary ref'lerine uygulandı, 11 canlı proje SARI bırakıldı.
MAMİ: "plastik"
```

Alan kuralları — ölçen bunları **kırmızı** yapar:

| Alan | Kural |
|---|---|
| `HÜKÜM` | SOL için `CLEAR TO CONTINUE` / `RESHAPE` / `NARROW` / `UNPROVEN` / `SOL_UNAVAILABLE`; AGY için yalnız `TARİF` |
| `KOŞULDU` | **zorunlu** — dış gözün gerçekten koştuğunun kaydı. Yoksa sonuç uydurulmuş sayılır (sahte CLEAR duvarı) |
| `OKUNAN` | en az bir yol, ve yol **diskte gerçekten var olmalı**. Yalnız `SOL_UNAVAILABLE` bundan muaftır |
| `SONUÇ` | `uygulandı` / `daraltıldı` / `kanıt yetersiz` ile başlar; her bulguya **tek** karşılık |
| AGY bloğu | `PASS_CANDIDATE`, `APPROVED`, `MOTION_VERIFIED` ya da Sol sözlüğünden bir kelime **geçemez** |
| `MAMİ` | opsiyonel; ham cümle tırnak içinde, yeniden yazılmadan |

`sha256` yazmak zorunlu değil ama yazılmazsa **sarı**: dosya sonradan değişirse hüküm sessizce
bayatlar. Yazılıp da biçimi bozuksa **kırmızı** — tahmin edilen imza, imzasızlıktan kötüdür.
