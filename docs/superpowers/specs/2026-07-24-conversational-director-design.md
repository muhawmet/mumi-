# Konuşmalı Yönetmen (Conversational Director) — Tasarım Spec'i

**Tarih:** 2026-07-24 · **Durum:** ONAYLI (Mami, bu oturumda) · **Öncelik:** regex-kill B2'nin ÖNÜNDE.

---

## 0. Neden bu var (verdict)

- **Kanıtlı gerçek:** Çok-ajanlı command/batch orkestrası (director → sahne-başına author →
  ayrı jüri → frame gate → motion gate) **bir kez bile tam video üretmedi.** Mami'nin kendi
  sözü: *"hiç tam 1 video yapamadık, hep hata verdi."*
- **Mami ne istiyor:** Sessiz bir otomat değil — **konuştuğu bir yönetmen.** Videoyu anlatacağı,
  yönetmenin soracağı/önereceği, sonra **birlikte epik prompt yazacakları** bir akış. Kendi sözü:
  *"başta konuşalım oturtalım sonra ürettirsin"* + *"en epik promptları istiyorum."*
- **Karar:** "Yönetmen ajan" = **bir konuşma** (bu spec'i üreten konuşmanın aynısı). Beyin onu
  besler. Kırılgan spawn-batch orkestrası **kritik yoldan çıkar** (silinmez, arşive/referansa gider).

### Neden konuşma "en epik"i verir
Epik prompt üç şeyden doğar, üçü de yalnız konuşmada birlikte var:
1. Beynin tam verisi (dünya render-lock + ref DNA + palette-as-light + mined prompt yasaları),
2. Mami'nin **canlı yönlendirmesi** ("daha epik, şunu abart"),
3. Hata bulununca **düzelten** iteratif revizyon (rapor değil, tamir).
Fire-and-forget batch bunların hiçbirini güvenilir vermez — zaten hiç bitmedi, jürisi yalnız rapor eder.

---

## 1. Ne KORUNUR vs ne ÇIKAR

### KORUNUR (değerli olan — beyin)
- `src/core/SURGERY_DATA.json` — worlds, refs, palettes, paths.
- `agents/promptQuality.mined.json` — prompt kalite yasaları (universal/animation/photoreal/engine).
- `generateBatch` (`src/core/pure.ts`) — storyboard beat'leri + brief + render lock + ref DNA üretir.
- Çalışan typed kapılar: `validateBriefCompatibility` → BLOCKED (IP firewall, hex, world-path uyumu),
  palette→ışık çevirisi (`paletteLightPrompt`), render-lock verbatim taşıma.
- Beynin otorite hiyerarşisi (`brain.ts` AUTHORITY_HIERARCHY) ve dünya/ref tarifleri.

### KRİTİK YOLDAN ÇIKAR (arşiv/referans — SİLİNMEZ, testler yeşil kalır)
- Spawn edilen per-rol runtime orkestrası (`scripts/mamilas-command.mjs` rol açma döngüsü).
- Hash-mühürlü handoff / sceneContextHash re-validate zinciri (üretim akışı için; testler kalır).
- `--lanes` paralel şerit koşusu.
- **Ayrı jüri süreci** — hata bulup düzeltmeden ölen. (Yerine: inline jüri = author'ın checklist'i.)
- Çift-tık launcher'ların `--director` batch modu (hiç tam çalışmadı).

> **Not:** "Çıkar" = üretimin ana yolu artık bu değil. Kod referans/test için durur; Mami video
> yaparken bu makineye girmez. Topyekûn silme YOK (regresyon riski + testler).

---

## 2. Akış (Direction A — onaylı)

### Faz 0 — Vizyon sohbeti
Mami videoyu anlatır: konu, his, hangi dünya/ref/ton, kaç sahne, kaynak metin (varsa).
Yönetmen (Claude) beyinden storyboard önerir: `generateBatch` → sahne beat'leri + render lock +
ref DNA + palette-as-light. Mami sohbette **toplu** onaylar. Tek tek CLI onayı YOK.

### Faz 1 — Konuşma-içi epik prompt yazımı
Her sahne için yönetmen prompt'u beyin verisiyle yazar.
- Çok sahne varsa **içeride paralel alt-ajanlarla TASLAK** çıkarır, Mami'ye toplu sunar (hız + in-loop).
- Her prompt **jüri yasalarını INLINE** geçer (`promptQuality.mined.json` + core-prompt-path yasaları) —
  hata bulursa **oracıkta DÜZELTİR**, sadece "hata" yazmaz. **[Değişmez ilke #1]**
- Mami "daha epik / şunu ekle / bu dünyaya çek" der, yönetmen revize eder.
- Çıktı: yapıştırmaya hazır epik image prompt'ları.

### Faz 2 — Kare (elle) → motion
Mami kareleri **elle** üretir (Nano Banana 2 / GPT Image 2 / Firefly — memory'deki motor seçimi).
Onaylı kareyi yönetmene getirir; yönetmen kareyi **görür** (i2v yasası: onaylı kare = gerçek),
motion prompt'u ondan yazar. Motion prompt onaylı kare görülmeden yazılmaz. **[Değişmez ilke]**

---

## 3. İki değişmez ilke (her modelde geçerli)

1. **Jüri sadece rapor etmez — TAMİR eder.** Eleştiri → düzeltilmiş prompt, tek döngüde.
   Mami'nin tavanını ("anca bu kadar ilerledik") kaldıran şey budur.
2. **Storyboard toplu onaylanır**, tek tek değil (eski D1 bug'ının kalıcı cevabı).

---

## 4. "Epik prompt" standardı (kalite çıtası)

Her prompt şunları taşır (memory'deki kanıtlı reçetelerden):
- Render-lock **verbatim** + ref DNA + palette-as-light (fiziksel ışık, ham hex yok).
- **Dominant element** + sahne başına **3 fizik detayı** (çevresel baskı + mikro-aksiyon + duyusal çıpa).
- **Telif-temiz stil:** stili ÇAĞIR, eseri DEĞİL (IP ismi = telif reddi). Bkz. memory One Piece/Rick&Morty dersi.
- **Yüzey yasası:** flat-cel için "ONE hard shadow, NO gradient/gloss/sheen" gibi malzeme-özel.
- **Motor seçimi per-shot:** GPT Image 2 = tek-kahraman/akıcı-dinamik/Türkçe metin · Nano Banana 2 =
  çok-kurallı/statik/worldPacket-sadık. Lens/kamera talimatı promptun BAŞINDA.
- **Türkçe metin + Türk/Anadolu cast** kilitleri korunur.

---

## 5. Execute planı (/clear SONRASI, sırayla)

1. **Oku:** bu spec + `CLAUDE.md` → `docs/ai/PROJECT_CONTRACT.md` + memory (`MEMORY.md`) +
   `.claude/rules/core-prompt-path.md`. (Beyin haritası gerekirse `/mamilas-map`.)
2. **KANITLA (ilk somut iş):** Mami'nin ŞU AN üretmek istediği videodan **2-3 sahnelik GERÇEK mini koşu.**
   Konuş → `generateBatch` ile storyboard öner → epik prompt'ları **konuşmada** yaz (jüri inline, revize) →
   Mami'ye göster. **KAPI: Mami "epik" derse geç.** Değilse çıtayı Mami ile yükselt, tekrar.
3. **Kanon yap:** "epik" kanıtlandıysa konuşmalı-yönetmen'i resmi üretim yüzeyi olarak belgele
   (yeni skill veya `/mamilas-uret` güncellemesi — konuşma-merkezli). Batch orkestrayı çift-tık
   launcher'dan düşür (ya konuşmaya yönlendir ya "arşiv" işaretle).
4. **Sadece CLI yolu kalırsa:** D1 tek-satır fix + jüri-tamir döngüsü. Kalmazsa arşivle (silme).
5. **Gerektikçe:** regex-kill operasyonu (B2→A-serisi) bu yeni yön ışığında yeniden önceliklendirilir;
   beyin sadeleştirme (regex kaldırma) konuşmalı yönetmeni GÜÇLENDİRİR (veri > tahmin).

### /clear sonrası ilk komut (Mami yapıştırır)
> "Bu spec'i oku: `docs/superpowers/specs/2026-07-24-conversational-director-design.md`. Sonra
> [videomu anlatacağım] için 2-3 sahnelik gerçek mini koşu yap — konuş, storyboard öner, epik
> prompt yaz, göster. 'Epik' dersem kanon yaparız."

---

## 6. Başarı kriteri

**Tek ölçü:** Mami ilk kez **1 tam videonun** image prompt'larını (ve onaylı kareden motion'ı)
uçtan uca, "epik" diyerek, yarıyolda kalmadan alır. Throughput değil — **teslim.**

---

## 7. Kapsam dışı (YAGNI — şimdi yapma)

- Batch orkestrayı yeniden yazma / API entegrasyonu (Nano API yok, elle üretim kalıyor).
- Otonom uçtan-uca otomasyon (Mami loop'ta olmak İSTİYOR).
- Yeni jüri süreç mimarisi (jüri = inline checklist, ayrı süreç değil).
