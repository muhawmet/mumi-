# BASELINE FRAMES — buraya bırak

TASK 1B. Bu klasör **A/B kanıtı** içindir. Burada duran her PNG, TASK 5'te yeni prompt hattının
eskisini yenip yenmediğini ölçmek için kullanılacak **gerçek piksel**dir.

Bu klasöre kare gelmeden TASK 5'in A/B'si yapılamaz.

## Mami — buraya ne bırakacaksın

1. **PNG/JPG kareleri** — doğrudan bu klasöre. Alt klasör kurma, isimlerini değiştirme.
   (Magnific'ten indirdiklerin: hem upscale öncesi hem sonrası varsa **ikisini de** koy,
   dosya adında ayırt edilsin. Upscale çelişkisi TASK 6'da senin kararına gidecek.)

2. ~~KARE-BULGULARI raporu bu makinede yok~~ → **YANLIŞTI, DÜZELTİLDİ.** Rapor repoda:
   `docs/superpowers/KARE-BULGULARI-2026-07-12.md`. Okundu. Eksik olan rapor değil, **kare pikselleri**.

3. Her kare için **üç gerçek** (aşağıdaki tabloyu doldur ya da bana sözlü söyle,
   ben doldururum — tahmin yürütmem):

| Dosya adı | Hangi dünya (worldId) | Hangi prompt/shot | Verdict: GEÇTİ / KALDI | Kaldıysa neden (senin sözünle) |
|---|---|---|---|---|
|  |  |  |  |  |

Beklenen: **4 geçen + 3 kalan** (ve varsa gerisi). Elinde ne varsa o gelir — eksik olan
"eksik" diye yazılır, uydurulmaz.

## Ben ne yapacağım

Kareler gelince: SHA-256 manifest çıkarır, her kareyi dünyası/prompt'u/verdict'iyle eşler,
`artifacts/baseline-frames/MANIFEST.md` yazar ve TASK 1B receipt'ini üretirim.
**Hiçbir kare üretmem** — bu adım sıfır maliyettir, motor çalışmaz.

Gerçek kare üretimi yalnız TASK 5'te ve yalnız **senin o pilot için açık onayınla** olur.
