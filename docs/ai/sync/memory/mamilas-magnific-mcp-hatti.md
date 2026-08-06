---
name: mamilas-magnific-mcp-hatti
description: "Magnific MCP sohbetten kare basıyor (ölçüldü 2026-08-06) — ama library BOŞ, @handle süreklilik hattı MCP'den kurulmuyor; kredi %86 tükenmiş"
metadata: 
  node_type: memory
  type: project
  originSessionId: d105a6d7-86a2-4ca5-998a-096a3a24c91a
  modified: 2026-08-06T10:27:02.098Z
---

**Magnific MCP AKTİF ve sohbetten kare basıyor** — 2026-08-06'da uçtan uca ölçüldü:
`images_generate` (mode `imagen-nano-banana-2-flash`) → `creations_wait` → PNG URL → curl → Read
ile **kare gözle görüldü.** Yani NB2 hattı için tarayıcı ve elle indirme zorunlu değil.

Ölçülen sayılar:
- `simulate_cost` **exact** dönüyor (kredi yakmadan fiyat): NB Pro 2K 16:9 = **75 kredi**, NB2 Lite = **60**.
- Hesap Premium+: **84.756 / 600.000 kredi kalmış (%86 tükenmiş)** → ~1.130 kare. Sayım tarih damgalı, güncel değeri `account_balance` ile oku.
- Model adı tuzağı: **Nano Banana 2 = `imagen-nano-banana-2-flash`**; `imagen-nano-banana-2` = **Pro**.
- Çıktı 16:9 istenince **1376×768** geliyor (tam 16:9 değil).

🔴 **library_list BOŞ (total: 0).** Tekrar eden karakterlerin `@handle` referansları MCP
kütüphanesinde görünmüyor — yani **süreklilik (Mira/Efe) MCP yoluyla `type:"character"` ile
KURULMUYOR.** Tek yol: kareyi yükleyip dönen creation identifier'ı `references:[{type:"image"}]`
olarak vermek. Bu, [[mamilas-magnific-char-refs]] ve [[mamilas-higgsfield-hatti]]'ndaki
"element katmanı taşıyıcı kolon" hükmüyle aynı sınıfta: **referanssız basılan kare kimliği kaybediyor.**

Test karesinde ölçülen motor kusuru: prompt'ta *"no on-screen text"* yazılmasına rağmen deftere
**ters ve anlamsız yazı** bastı — negatif tek başına yazıyı kesmiyor ([[mamilas-kling3-text-trick]]
ile aynı sınıf). Olumlu yazım gerekir: *"a blank unlined page"*.

**Hattın tamamı ölçüldü (2026-08-06) — kare TEK parça değil:**
- **Klip fiyat tablosu — 5 sn · 1080p · 16:9, hepsi `certainty: exact`:**
  **Kling 2.6 = 225** (SFX + 2 sesli voiceControl, start+end frame, referans YOK) ·
  **Kling 2.5 = 325** · **Kling 3.0 = 450** · **Kling 3.0 Turbo = 1300** (en pahalı ve
  referans almıyor — "turbo" ucuz demek DEĞİL) · Kling 3.0 10 sn = 900 (süre lineer).
  🔴 **Kling 3.0 REFERANS ALIYOR** — `character`/`product`/`image`, 3'e kadar, **startFrame ile
  birlikte zorunlu**; ayrıca 3-15 sn, 4K, 6 shot multishot, SFX. Higgsfield'daki "Kling referans
  almıyor" sınırı ([[mamilas-higgsfield-hatti]]) **bu hatta geçerli değil.**
  Seedance 2.0 ayrıca native ses, lipsync ve **52 adlı kamera hareketi** veriyor — MAMILAS'ın
  `Camera:` satırı burada parametre olabilir.
- **Model seçimi ölçülmeden yapılmaz:** 60 klipte 2.6 → 13.500 kredi, 3.0 → 27.000 kredi.
  Fark bir filmin maliyeti kadar. Canary'de aynı start frame + aynı motion ile **2.6 vs 3.0 A/B**
  basılır (~2.700 kredi), hükmü Mami verir.
- **VO: ElevenLabs MCP kurmaya GEREK YOK — zaten içinde.** `audio_voices_list` 10 Türkçe
  ElevenLabs sesi döndürüyor; `audio_tts` `voiceId` ile çağırıyor. Çocuk materyali için aday:
  **Can Özkan (id 198, orta yaş erkek, "masal anlatıcı, çocukların sevebileceği")**,
  Emre Aydın (199, belgesel/eğitim), Zeynep Yılmaz (202, sakin kadın anlatıcı).
  Sabit ses seçilince `voiceId` yasaya yazılır → her videoda aynı ses.
- **Suno MCP YOK.** Müzik yerine `audio_music_generate` (magnific) + Higgsfield Seed Audio (müzik+SFX).
  Suno'ya karşı kalite ölçülmedi.
- **Bütçe aritmetiği:** 60 sahnelik film ≈ 60×75 (kare) + 60×325 (klip) = **~24.000 kredi**
  → kalan ~84.7k ile **~3,5 film**. Yani darboğaz tarayıcı değil, **kredi**.

**How to apply:** MCP'yi tek kare / hızlı deneme / fiyat ölçümü için kullan. Süreklilik gereken
sekansta önce referans karesini yükle, identifier'ı sakla, her karede `type:"image"` olarak geç.
