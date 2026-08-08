# UPSCALE DURUMU — 1284×716 → 1920×1080

**Araç:** Higgsfield · Topaz Video · `resolution=1080p`, `aspect_ratio=auto`
**Fiyat (ölçüldü):** **SABİT DEĞİL** — 5 sn klip **3 kredi**, 6-7 sn klip **5 kredi**.
(İlk tahmin "3 kredi/klip"ti ve 174 kredi diyordu; gerçek **235 kredi ≈ $10,5** çıktı.)
**Hedef klasör:** `~/Desktop/6. Sınıf Animasyonlar/Denetleyici ve Düzenleyici/klipler-1080p/`
**Kaynak:** `_KLIP-JOB-IDLERI.json` (Kling üretim job id'leri, upscale girdisi olarak kullanıldı)

## Durum — 2026-08-08 · ✅ BİTTİ, 58/58

58 dosyanın **58'i** ffprobe ile tek tek doğrulandı: **1920×1080 · 24 fps · HEVC ·
ses izi yok**, süreler orijinal kliple birebir aynı. Kusurlu dosya **0**.

**Harcama:** Higgsfield cüzdanı **235 kredi ≈ $10,5** (bakiye 4441,25 → 4206,25,
cüzdanın ~%5'i). K58 kapıya takıldı; Mami tavanı 10000 → 10100 onayladı ve basıldı.

## ÖLÇÜLEN — bir dahaki upscale'de tekrar etmesin

🔴 **Topaz upscale SESLİ geliyor.** Girdisi diskteki sessizleştirilmiş klip değil,
Higgsfield'ın **ham** creation'ıdır (`sound=on` ile basıldı). `klipler/` sessizdi ama
`klipler-1080p/` 56 dosyada ses iziyle indi. Onarım kayıpsız:
`ffmpeg -i <f> -an -c:v copy`. **Upscale'den sonra ses izi TEK TEK kontrol edilir.**
(Bu, kanondaki 29. ölçümün aynısıdır: yeni araçla basılan ilk çıktı `ffprobe` ile
niyete karşı doğrulanır — çözünürlük · ses izi · süre · fps.)

⚠ Çıktı **HEVC (H.265)**. Premiere okur ama H.264'ten ağırdır; kurgu takılırsa
proxy ya da tek seferlik H.264 transcode gerekir.
