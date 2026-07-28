---
name: mamilas-agy-video-gozu
description: "agy (Antigravity CLI) = Claude'un VİDEO GÖZÜ. Claude klip izleyemez/ses duyamaz; Gemini modelleri izler. Kullanım deseni ve PATH tuzağı."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 651a452b-2f9e-43f9-aef5-0f4175d8c3db
  modified: 2026-07-28T17:18:51.380Z
---

# agy — Claude'un video gözü (2026-07-28'de ölçüldü)

**Neden kritik:** Claude ses duyamaz, video izleyemez — bu yapısal bir körlük. Antigravity CLI
üzerinden Gemini modelleri **izleyebilir.** Yani "yazı bozuldu mu / hareket doğal mı / klip VO'ya
oturuyor mu" sorularının gerçek cevabı oradan gelir.

**İş bölümü:** Claude ÖLÇER (ffprobe/ffmpeg, sıfır token) → agy İZLER → Claude HÜKÜM verir.

```
Mac      ~/.local/bin/agy                              (v1.1.8)
         export PATH="$HOME/.local/bin:$PATH"          # Claude'un PATH'inde YOK — şart
Windows  %LOCALAPPDATA%\agy\bin\agy.exe                (v1.1.8, 2026-07-28'de kuruldu)
         Kurulum: irm https://antigravity.google/cli/install.ps1 | iex
         Installer user PATH'e kendi ekler; ama KOŞAN oturum onu görmez —
         Claude'un her çağrısı TAM YOL ile yapılmalı (shell state çağrılar arası yaşamıyor).

agy -p "<prompt>" --model <ad> --effort low|medium|high --add-dir <yol>
                  --dangerously-skip-permissions   --mode plan (salt-okur)
```

⚠ **Oturum açmadan HİÇBİR şey çalışmaz** — `agy models` bile `Please sign in` ile düşer. Giriş
**interaktif**: Mami bir terminalde çıplak `agy` yazar, tarayıcıdan Ultra hesabıyla imzalar.
Claude bunu yapamaz (stdin yok). Yeni makinede ilk adım budur, PATH değil.

**Ölçülen model filosu** (`agy models`): `gemini-3.6-flash-high/medium/low` ·
`gemini-3.5-flash-*` · `gemini-3.1-pro-high/low` · `claude-sonnet-4-6` ·
`claude-opus-4-6-thinking` · `gpt-oss-120b-medium`.

🔴 **Desen DÜZELTİLDİ (2026-07-28 akşam, ölçüldü):** ilk yazılan *"ağır iş 3.6-flash, derin hüküm
3.1-pro"* kuralı BİZİM işimiz için yanlış. `gemini-3.6-flash` (21 Tem 2026) Google'ın yayımladığı
her kodlama/ajan benchmark'ında 3.1-pro'yu geçiyor, çıktıda %58 ucuz, ~2 kat hızlı, zekâ endeksi
50'ye 46 — ve **video liderlik tablosunda birinci: "sahnede zaman içinde ne olduğunu takip etmede
test edilen en iyi model."** 3.1-pro yalnız iki yerde önde: GPQA Diamond (94.3 / 92.8) ve
Humanity's Last Exam (44.4 / 38.3) — yani **doktora seviyesi akademik muhakeme.** Klip izlemekle
ilgisi yok. Hüküm: **her iş için `gemini-3.6-flash-high`.** "Derin hüküm için pro'ya çık" bizim
kullanımımızda yükseltme değil, DÜŞÜŞ.

## KANITLANDI — 2026-07-28, gerçek klip üstünde

`23.mp4` (Kütle, 5.0sn) izletildi. AGY'nin **yedi maddesinin yedisi de** Claude'un `motion-qc`
kareleriyle bağımsız doğrulandı: astronot çocuk + şeffaf kask + kırmızı boyunluk · pirinç eşit
kollu terazi · sağ kefede kırmızı elma · Dünya'lı lumboz · sol duvarda pano · sağ tezgahta saat
ve çanta · yavaş zoom-in · **terazinin küçük plakasındaki "60 kg" yazısını birebir okudu.**
Yani agy dosya adından tahmin etmiyor, **gerçekten izliyor ve karedeki küçük metni okuyor.**

## 🔴 EN ÖNEMLİ YASA — AGY'ye HÜKÜM sordurma, TARİF ettir

Aynı model, aynı klip (`15.mp4`), iki dakika arayla ölçüldü:

- **"Kusur ara, hüküm ver"** → 6 maddenin 6'sına `YOK`. 146 bayt. Tek gözlem, tek zaman damgası,
  tek kanıt yok. Biçimi dolduruyor, ölçmüyor.
- **"Hüküm verme, sadece tarif et"** → aynı klipte kusurun kendisini anlatıyor:
  `0:00 çocuk havada süzülüyor, ayakları yere değmiyor` → `0:02 ayakları yere değiyor` ·
  `0:00 lavaboda dantel perde + lamba` → **`0:02 kavisli gümüş musluk`** (yoktan var olan nesne).

**Hüküm:** AGY kanıtlanmış bir GÖZ, kanıtlanmamış bir JÜRİ. Doğru iş bölümü:
**AGY zaman damgalı TARİF üretir → Claude tarifi start frame + motion promptuyla karşılaştırıp
sapmayı çıkarır → hükmü MAMİ verir.** Brief'in "AGY `VERDICT:` üretsin" tasarımı bu ölçümle
çürüdü; uygulansaydı her klibe PASS basan işe yaramaz bir jüri kurulmuş olurdu.

**Bulunan gerçek kusur (teslim edilmiş videoda):** Kütle `15.mp4` — musluk 0:00'da yok, 0:02'de
var. *"Motion yeni öğe doğurmaz"* yasasının ihlali; ne kare denetimi ne o günkü göz yakalamıştı.

## AGY GÖRSEL DE ÜRETİYOR — `generate_image` (2026-07-28 kanıtlandı)

Video üretemiyor, **görsel üretiyor.** Test: pixar_3d_edu mutfak karesi, tahtada `KÜTLE DEĞİŞMEZ`
istendi → **Ü/Ğ/İ/Ş dördü de doğru bastı**, ikincil `FEN BİLGİSİ / MADDE` de tuttu, akıllı tahta
kendiliğinden geldi (precedent'e uygun). Yalnız arka plandaki poster bozuldu — Sabit Sürat'ın
"arka plan yazı yüzeyi" ders sınıfının aynısı.

**Ne işe yarar:** Magnific/NB2 kredisi harcamadan **yapısal ön kontrol** — yazı ayakta kalıyor mu,
eleman eksik mi, kompozisyon tutuyor mu. Mami'nin en kalabalık revize sınıfı arka plan yazı/sembol
yüzeyi olduğu için kaldıraç yüksek. **Ne işe yaramaz:** NB2'nin yerine geçmez, farklı motor,
nihai estetik hükmü oradan çıkmaz.

⚠ Görsel modeli `agy models` listesinde YOK — seçilebilir model değil, **dahili araç**. Yani
`--model` değiştirmek görsel kalitesini değiştirmez; yalnız izleme/tarif kalitesini değiştirir.
Çıktı AGY'nin kendi scratch'ine düşüyor: `~/.gemini/antigravity-cli/scratch/`.

## Ölçülen sınırlar (üç deneme, üçü de kanıt)

- **`--model gemini-3.6-flash-high` ile `--effort` ÇAKIŞIR** — model adı effort'u zaten taşıyor.
  Birlikte verilirse `invalid model selection` ile düşer.
- **Zaman aşımı AYARLANABİLİR: `--print-timeout 25m`** (varsayılan `5m0s`). İlk hüküm "tam film
  izletilemez" YANLIŞTI — 3 dakikalık film varsayılan 5 dk limite takılıyordu, limit uzatılınca
  yol açık. Ayrıca `--json-schema` ile yapılandırılmış çıktı zorlanabiliyor (kurgu kiti için).
- Tek klip (5-10 sn) sorunsuz: ~1-2 dk, 2 KB dolu cevap.
- Çok satırlı prompt suçlu değil; suçlu süreydi. Yine de **tek satır prompt** güvenli desen.
- Doğru iş bölümü kanıtlandı: **motion-qc kareyi çeker (Claude görür) + agy hareketi izler** —
  ikisi birbirini denetler. Tek başına ikisi de eksik.

⚠ `agy models` ilk çağrıda ~2 dk sürebilir (ısınma) — **arka planda çağır**, Mami'yi bekletme.
⚠ `gemini` CLI **ÖLDÜ** — Google bireysel ücretsiz katmanı kapattı (`IneligibleTierError`).
Mami'nin Ultra aboneliği agy'de yaşıyor. Yol agy'dir, gemini değil.

İlgili: [[mamilas-kling3-text-trick]] (yazı bozulması tam da agy'nin ölçeceği şey) ·
[[mamilas-kaba-kurgu-hatti]] · `scripts/motion-qc.mjs`
