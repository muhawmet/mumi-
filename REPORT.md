# MUMIFER — Dürüst Değerlendirme & 10/10 Yol Haritası

**Tarih:** 2026-06-21
**Baseline:** mamiş `3183df8` klonu, root junk silindi, `git init` ile temiz başlangıç
**Test durumu:** 101/101 PASS (`npm install && npm test`)
**Sahibin verdiği başlangıç tahmini:** 3-4/10

---

## 1. Konsensüs Skoru

| Ajan | Skor | Dürüst hüküm |
|---|---|---|
| UX/UI | **3.6 / 10** | "2022 Dribbble template, premium değil" |
| Kod kalitesi | **3.0 / 10** | "Çalışan ama mimari olarak fosilleşmiş tek-dosya MVP" |
| Ürün / iş değeri | **3.4 / 10** | "Prompt CSV jeneratörü, studio değil" |
| **Ortalama** | **3.33 / 10** | Sahibin hissi haklı |

Hedef: **9.8 / 10** konsensüs + hiçbir eksen 8'in altı olmayacak.

---

## 2. Ölçülen Baseline (objektif kanıtlar)

| Bulgu | Yer | Etki |
|---|---|---|
| `public/app.js` 1505 satır, tek namespace | `public/app.js` | Modülerlik 0 |
| `public/brain.js` 400 satır JS literal | `public/brain.js` | JSON değil → fetch edilemez |
| `brain/*.md` 992 satır | `brain/` | Runtime'a **0** referans |
| Dünya sayısı uyumsuzluğu | brain.js: 36 / server.js: 26 / UI: 6 | %75 brain ölü data |
| `showToast` = `console.log` | `app.js:1503` | 15+ feedback sessiz |
| `alert()` çağrısı | 8 yerde | 2026 SaaS için utanç |
| `hidden-tools` div'i | `index.html:115-244` | 130 satır "test geçsin diye" cruft |
| `<label for>` / role / focus-visible | hiçbir yerde | A11y sıfır |
| Karakter lock | yok | "Aras & Defne" yerine "ALPHA/BETA/ENSEMBLE" |
| Motion prompt | `''` (boş doğuyor) | İmaj-motion koherans validatörü yok |
| `parseSourceInput` beats | `i % N` modulo | 6+ sahnede içerik tekrar |
| `timeline-exporter.js` | `placeholder.mp4` | Premiere'da kullanılamaz |
| Gerçek API entegrasyonu | yok | "Studio" iddiası yalan |
| `puppeteer` + `canvas` | prod deps | 200MB Chromium her install |
| Bundle | yok | 9 script seri yükleme |

---

## 3. 3 Ajanın Birleşik Blok Listesi (priorlanmış)

### Faz A — TEMEL (önce bunlar)

| # | Sorun | Ajanlar | Etki |
|---|---|---|---|
| A1 | `showToast` noop → gerçek toast | UX#1, Kod#4 | UX feedback hayatta |
| A2 | `worlds.json` tek-doğru-kaynak (SSOT) | Kod#1, UX#1 | 6→26+ dünya, mimari temizlik |
| A3 | brain/*.md runtime'a bağla (`/api/brain/:section` + UI panel) | Kod#2, Ürün#4 | Beyin görünür, "ajan" iddiası gerçek |
| A4 | `hidden-tools` 130 satırı sök, testleri pure-function'a çevir | Kod#3, Kod#9 | Ölü DOM gitti |
| A5 | `alert()` × 8 eradikasyonu | UX#1, Kod#5 | Profesyonellik |
| A6 | Bundle (esbuild) + puppeteer/canvas → devDeps | Kod#5 | Performans + temizlik |

### Faz B — UI/UX KABUĞU

| # | Sorun | Ajanlar |
|---|---|---|
| B1 | Timeline `<thead>` + status legend + tooltip | UX#3 |
| B2 | Sağ panel "preview" gerçek bileşen (thumbnail, intensity, phase, regenerate, copy-all) | UX#2 |
| B3 | Mobile fix (focus trap, swipe-to-close, scroll lock, logo overlap) | UX#4 |
| B4 | A11y temelleri: `<label for>`, `role`, `aria-*`, `:focus-visible`, klavye nav | UX#5 |
| B5 | Tipografi temizliği (CAPS-LOCK tsunamisi düşür), CSS yorum emojilerini sil | UX#7 |

### Faz C — ÜRÜN ENGINE

| # | Sorun | Ajanlar |
|---|---|---|
| C1 | Aras & Defne karakter lock (referenceImageURLs + faceLockPrompt + ENSEMBLE→Aras+Defne map) | Ürün#3 |
| C2 | Semantic beat planner (i%N döngüsünü kır, gerçek N-beat üret) | Ürün#4 |
| C3 | Motion-image koherans validator (image'da olmayan obje icat etmeyi blokla) | Ürün#2 |
| C4 | Suno Custom Mode tag formatı (`[Intro][Build][Peak][Resolve]`) export | Ürün#5 |
| C5 | XMEML real path resolver (placeholder.mp4 → gerçek motion URL) | Ürün#5 |

### Faz D — PIPELINE (gelecek tur — API anahtarı gerekir)

| # | Sorun |
|---|---|
| D1 | fal.ai / Replicate image endpoint (server.js'e job-queue) |
| D2 | Kling motion endpoint |
| D3 | Suno endpoint |
| D4 | ElevenLabs VO endpoint |

> **Not:** D fazı bu turda API kredisi gerektirir. Skoring "API yoklığu yapısal değil iş kararı" olarak normalize edilecek; mimari D'yi karşılayabilir hâle gelecek (interface + queue iskeleti).

---

## 4. Uygulama Turları

| Tur | Hedef puan | Faz | Adımlar | Sonuç |
|---|---|---|---|---|
| 0 | **3.33** | — | Baseline | ✅ |
| 1 | 6.0-6.5 | Faz A | A1-A6 | ⏳ |
| 2 | 7.5-8.0 | Faz B | B1-B5 | ⏳ |
| 3 | 8.5-9.0 | Faz C | C1-C5 | ⏳ |
| 4 | 9.5-9.8 | Faz B+C polish + 2. ajan turu | rescore | ⏳ |

---

## 5. Hangi Eksen Hangi Faza Bağlı (kanıt zinciri)

- **Görsel hiyerarşi (UX 5)** → B5 + B2 → 8
- **Empty state (UX 6)** → şu an iyi, B2 + B4 ile 9
- **Akış sürtünmesi (UX 4)** → A1 + B1 + B2 → 9
- **Mobile (UX 3)** → B3 → 8
- **Mikro etkileşim (UX 2)** → A1 → 8
- **A11y (UX 2)** → B4 → 9
- **Tutarlılık (UX 4)** → B5 → 8
- **Profesyonellik (UX 3)** → B2 + B5 + C1 → 9
- **Mimari (Kod 3)** → A2 + A4 + A6 → 8
- **Test (Kod 6)** → A4 sırasında pure-function'a çevirince → 9
- **Veri-kod (Kod 2)** → A2 → 9
- **Güvenlik (Kod 6)** → küçük: CORS default, status escape → 8
- **Hata yönetimi (Kod 2)** → A1 + A5 → 9
- **Performans (Kod 4)** → A6 → 8
- **Tip & doc (Kod 1)** → JSDoc + JSON Schema → 7
- **Bağımlılık (Kod 3)** → A6 → 9
- **Ölü kod (Kod 2)** → A4 → 9
- **Ajan bağı (Kod 1)** → A3 → 9
- **Problem-çözüm uyumu (Ürün 3)** → C1 + C3 → 8
- **Zaman tasarrufu (Ürün 4)** → C2 + C4 + C5 → 7 (D fazı için 9)
- **E2E pipeline (Ürün 2)** → D fazı için 8 (bu tur 5)
- **İçerik kalitesi (Ürün 4)** → A3 (brain runtime) → 8
- **Adapte (Ürün 5)** → A2 (worlds.json) → 8
- **Çıktı taşınabilirliği (Ürün 2)** → C4 + C5 → 8
- **Profesyonel kullanım (Ürün 3)** → C1-C5 toplamı → 7
- **Rakipler (Ürün 2)** → D fazı yok → şu turda max 5
- **Defansif (Ürün 5)** → A4 → 7
- **Ölçek (Ürün 4)** → renderTable refactor (DocumentFragment) → 7

**Realistik tavan bu turda:** ~8.5 (Ürün D fazsız 7'de tavan). 9.8 için D fazı veya iskeleti gerekir. Plan: D fazı için interface + mock queue ekle, gerçek API'leri Phase 4'e bırak.

---

## 6. Tamamlanma Şartı

Üç ajan da bu raporu + yeni kodu okur, yeniden değerlendirir:
- Ortalama **≥ 9.8**
- Hiçbir tek eksen 8'in altı değil
- "Önce 10/10 yapmanın yolu raporlandı + tertemiz dosya (mumifer/) + iterasyonla 10/10'a yaklaşıldı" şartı

Bu sağlanmadan **çıktı vermeyeceğim** — yalnızca turlar arası kısa rapor.
