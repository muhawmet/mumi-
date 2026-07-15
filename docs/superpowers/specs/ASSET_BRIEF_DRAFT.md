# MAMILAS 3D Diorama — M4 ASSET BRIEF (DRAFT)

Tarih: 2026-07-03
Durum: Denetleyici onayı bekliyor (DRAFT)
Dal: `feat/3d-diorama-shell`
Otorite: `DESIGN_LANGUAGE_V3.md` §8 + `src/scene/lookConfig.ts` `LOOK.palette`. Bu brief o iki kaynağa **hizmet eder**; çelişki olursa V3 kanunu kazanır, brief düzeltilir.

Bu belge iki işi birden yapar:
1. Muhammet'in nano_banana_2 + Magnific ile asset üreteceği **hazır prompt listesi**.
2. En sona eklenen **Antigravity GOAL** sarmalı (bkz. Bölüm 4) — dosya `ANTIGRAVITY_GOAL_DIORAMA_ASSETS.md` olarak da kaydedilebilir.

> UYARI (formatlar): V3 §8 asset formatlarını **kanun** olarak sabitliyor ve bu brief onları takip ediyor
> (portre 512² şeffaf PNG, kart yüzü 1024×1448 WebP, zemin 2048² seamless WebP, masa 1024² WebP).
> Görev talimatındaki alternatif ölçüler (portre 1024², kart 512×768, gökyüzü 2048×1024) V3 ile çelişiyor;
> denetleyici için Bölüm 5'te "Açık sorular" olarak bırakıldı. Aşağıdaki tüm promptlar V3 ölçülerini kullanır.

---

## 1. Genel stil kanunu

**Kimlik cümlesi (V3 §1'den):** Disco Elysium yağlıboya karanlığı + altın stüdyo konsolu füzyonu. Near-black **sıcak grafit** bir boşlukta tek altın sokak lambası yanar; sis her şeyi yutar; renk doygunluğu yalnız portrelere ve TONE etiketlerine aittir, kabuk kendini fısıltıyla anlatır.

### Ortak stil DNA'sı (her prompt'a giren çekirdek)
- **Teknik:** oil painting / gouache, görünür fırça izi (impasto), painterly edge — dijital-temiz vektör değil.
- **Işık:** tek sıcak altın kaynak (sokak lambası mantığı), uzun yumuşak gölgeler, chiaroscuro; koyu değerler **sıcak** (asla `#000`).
- **Palet (LOOK.palette):** gold `#f7c948`, amber `#d6a84f`, paper `#e8ddc8`, ink `#0a0c14`, floor `#141210`. Dominant amber bandı (hue ≈ 35–55°), düşük value.
- **Karşı-ışık:** yalnız **desatüre buz-çeliği** `#8fa3c2` — soğuk vurgu, neon değil.
- **Ton:** melankolik, sinematik, "yağmurdan sonra sokak feneri" hissi.

### Üslup ilhamı — telif kilidi (ZORUNLU)
- İlham DE **üslubudur** (yağlıboya karakter portresi + izometrik diorama his). **Birebir kopya, tanınır karakter, oyun UI'ı, logo, marka öğesi YASAK.**
- Prompt'lara "in the style of" ile spesifik sanatçı/stüdyo adı **yazma**; jenerik painterly betimleme kullan ("oil-painted noir portrait", "impressionist gouache").
- Üretilen yüzler özgün olmalı; mevcut portre **rolüyle** (Volition = irade/omurga vb.) uyumlu ama yeni bir kişi.

### Negatif kilit listesi (HER prompt'un negative alanına yapıştır)
```
photograph, photorealistic, 3D render, octane, unreal engine, CGI plastic look,
neon, cyan glow, magenta, teal accent, saturated blue rim light,
watermark, signature, text, letters, typography, UI, HUD, logo, brand mark,
pure black #000000, flat vector, clean digital gradient, smooth airbrush,
low contrast, washed out, oversaturated, HDR, lens flare, bloom blowout
```

### Işık dokunulmazlığı (V3 §8)
Asset ışığa uyar, ışık asset'e değil. **Luminance > 0.72 alan payı %4'ü geçemez** — aksi halde bloom eşiği (`LOOK.bloom.luminanceThreshold 0.72`) tetiklenir, sahne patlar. Yani: parlak beyaz highlight'ları küçük tut, geniş parlak yüzey üretme.

---

## 2. Asset listesi

Toplam **15 asset**: 7 portre + 4 kart yüzü + 1 masa + 1 zemin + 1 backdrop + 1 logo kartı.
Tüm dosyalar `public/assets3d/` altında, kebab-case. (Portreler istisna — mevcut hat `public/assets/characters/` kullanır; bkz. her portre satırı ve Bölüm 3.)

### Ortak Magnific ayarı
- **Preset mantığı:** *Illustration / Art* modu, **Creativity düşük-orta (2–3)**, **Resemblance yüksek (8–9)** — fırça izini korur, halüsinasyon eklemez.
- **YASAK:** "Photo/Realistic" upscale preset'i (V3 §8: fotogerçekçi upscale DE formülünü öldürür).
- Portrelerde upscale sonrası **alfa kanalını koru** (arka planı tekrar temizle; Magnific bazen matte basar).

---

### 2A. Kabinet sesi portreleri (7 adet)

Ortak portre kuralları:
- **Format:** şeffaf PNG, **512×512**, sRGB. Omuz-üstü büst, hafif ¾ açı, bakış kadraja doğru.
- **Dosya yolu:** `public/assets/characters/<id>.png` (mevcut `AdvisorPortrait` hattı `/assets/characters/${id}.png` okur — bkz. Bölüm 3). `assets3d/` DEĞİL.
- **Arka plan:** tamamen şeffaf (portre koyu diorama önünde asılır). Gövde alt kenarı yumuşak fade.
- **Ortak prompt kuyruğu (her portrenin sonuna ekle):**
  `oil painting bust portrait, three-quarter view, single warm golden light source from upper left, long soft shadows, visible impasto brushstrokes, dark warm graphite background, muted amber palette, desaturated ice-steel cold rim on the shadow side, melancholic cinematic mood, isolated subject, transparent background`
  Negatif: ortak negatif kilit listesi.

| # | Ses | Rol/karakter yönü | id (dosya adı) |
|---|-----|-------------------|----------------|
| 1 | **Volition** | İrade, omurga, ahlaki dayanak | `skill_volition` |
| 2 | **Perception** | Duyusal tetik, ayrıntı avcısı | `skill_perception` |
| 3 | **Shivers** | Şehrin ürpertisi, sezgi, atmosfer | `skill_shivers` |
| 4 | **Logic** | Soğuk mantık, tümdengelim | `skill_logic` |
| 5 | **Visual Calculus** | Sahne yeniden kurma, geometri | `skill_visual_calculus` |
| 6 | **Drama** | Rol, yalan sezme, teatrallik | `skill_drama` |
| 7 | **Case Ledger** | Kayıt tutan, arşivci, fallback | `skill_case_ledger` |

> Not: Bunlar mevcut placeholder PNG'lerin **id'leriyle birebir aynı** — asset düşünce otomatik değişir, kod dokunulmaz. Yeni yüz eskisini yerinden okur.

**1 — Volition** (`skill_volition`)
`Oil-painted bust of a resolute middle-aged figure, jaw set, upright posture suggesting an inner backbone, plain dark high-collar coat, faint golden halo behind the shoulders like conscience made visible,` + ortak portre kuyruğu.
Türkçe: İradenin sesi — dik, kararlı, omurga temsili. Omuz arkasında zar zor görünür altın hâle.

**2 — Perception** (`skill_perception`)
`Oil-painted bust of a wiry alert figure with wide watchful eyes, head slightly tilted as if catching a distant sound, sharp cheekbones, collar turned up, tension in the neck,` + ortak portre kuyruğu.
Türkçe: Algı — teyakkuz halinde, uzaktaki bir sesi yakalamış gibi.

**3 — Shivers** (`skill_shivers`)
`Oil-painted bust of an ethereal weathered figure half-dissolving into the dark, rain-damp skin, distant hollow gaze as if listening to the whole city at once, cold mist curling around the shoulders,` + ortak portre kuyruğu.
Türkçe: Ürperti — şehri bir bütün olarak dinleyen, karanlığa yarı karışmış figür. Omuzlarda soğuk sis.

**4 — Logic** (`skill_logic`)
`Oil-painted bust of a precise cool-eyed scholar, thin-rimmed spectacles catching a single glint, composed neutral expression, high forehead, restrained posture, faint ledger lines suggested in shadow behind,` + ortak portre kuyruğu.
Türkçe: Mantık — soğuk gözlü, ölçülü akademisyen. İnce gözlükte tek parıltı.

**5 — Visual Calculus** (`skill_visual_calculus`)
`Oil-painted bust of an analytical figure with one hand raised as if tracing invisible lines in the air, faint amber geometric guide-lines painted like ghost trajectories around the head, focused downward gaze reconstructing a scene,` + ortak portre kuyruğu.
Türkçe: Görsel Hesap — havada görünmez çizgiler izleyen el, kafanın çevresinde hayalet amber geometri hatları.

**6 — Drama** (`skill_drama`)
`Oil-painted bust of a theatrical figure with an ambiguous half-smile, one eyebrow arched, subtle stage-light rim on one cheek, collar with a hint of velvet, expression caught between sincerity and performance,` + ortak portre kuyruğu.
Türkçe: Drama — teatral, muğlak yarım gülümseme, bir yanağında sahne ışığı. Samimiyet ile rol arası.

**7 — Case Ledger** (`skill_case_ledger`)
`Oil-painted bust of a tired methodical archivist figure, eyes down over an unseen open ledger, worn coat, a stub of pencil behind the ear, patient exhausted dignity, warm lamplight on the paper reflecting up onto the face,` + ortak portre kuyruğu.
Türkçe: Dava Defteri — yorgun ama düzenli arşivci; kağıttan yansıyan sıcak lamba ışığı yüzüne vurur. (Fallback portre — bu asla eksik kalmasın.)

---

### 2B. Yüzen kart yüzleri — dünya arketipleri (4 adet)

Ortak kart kuralları:
- **Format:** WebP, **1024×1448** (`FloatingCard` geometrisi 0.94×1.38 ≈ 1.1×1.55 → 1024×1448 oran-eş). sRGB, mipmap açık.
- **İçerik:** world/ref **film-still plate'i** — UI ekran görüntüsü DEĞİL (V3 §8). Dikey kompozisyon, kenarları hafif vinyet.
- **Dosya yolu:** `public/assets3d/`.
- **Ortak prompt kuyruğu:** `painterly cinematic film-still, vertical composition, single warm golden key light, deep warm shadows, visible oil brushwork, muted amber-and-ink palette, atmospheric haze, no text, no border,` + ortak negatif kilit.

Arketipler MAMILAS'ın world kategorilerini temsil eder (anime / sinematik-real / edu / arcane) ama **spesifik telifli dünya değil**, jenerik arketip.

**1 — Kahraman arketipi** `card-hero-archetype.webp`
`A lone silhouetted hero figure on a rooftop under a single golden streetlamp, cape or coat catching wind, distant painterly city glowing amber below, dramatic low angle,` + kart kuyruğu.
Türkçe: Anime/aksiyon dünyası arketipi — çatıda tek altın lamba altında yalnız kahraman silüeti.

**2 — Dedektif / noir arketipi** `card-detective-archetype.webp`
`A trench-coated investigator standing in a rain-slick alley, warm lamplight pooling on wet cobblestones, breath visible in cold air, one hand in pocket, painterly noir,` + kart kuyruğu.
Türkçe: Sinematik-real/noir arketipi — yağmurlu sokakta trençkotlu dedektif, ıslak taşlarda sıcak ışık göleti.

**3 — Bilge / arcane arketipi** `card-arcane-archetype.webp`
`A robed scholar-mage bent over an ancient glowing manuscript, faint amber runic light rising from the page, dust motes in the lamplight, shelves of dark tomes behind,` + kart kuyruğu.
Türkçe: Arcane/büyü dünyası arketipi — parıldayan el yazması üzerine eğilmiş cübbeli bilge, sayfadan yükselen soluk amber ışık.

**4 — Kâşif / edu-doğa arketipi** `card-explorer-archetype.webp`
`A lantern-carrying explorer at the mouth of a vast painterly cavern or forest clearing, warm lantern glow against deep blue-grey depth, sense of scale and wonder,` + kart kuyruğu.
Türkçe: Edu/keşif dünyası arketipi — fener taşıyan kâşif, uçsuz mağara/orman ağzında; sıcak fener ışığı derin buz-grisi derinliğe karşı.

---

### 2C. Diorama dokuları (2 adet)

**Masa üstü dokusu** `table-top.webp`
- **Format:** WebP, **1024×1024**, seamless GEREKMİYOR (masa tek yüzey, tile edilmez) ama kenar-güvenli. sRGB.
- Prompt: `Top-down painterly texture of a worn dark hardwood studio table, oil-painted grain, faint golden lamplight falling from upper left, scattered soft highlights, a few old ink stains and pencil marks, warm graphite base tone, visible brushwork, matte,` + ortak negatif kilit.
- Türkçe: Yıpranmış koyu ahşap stüdyo masası, sol-üstten altın ışık, eski mürekkep lekeleri. Fırça izi görünür, mat.
- Magnific: Illustration, Resemblance 8, Creativity 2 (deseni bozma).

**Zemin dokusu** `floor-disc.webp`
- **Format:** WebP, **2048×2048 SEAMLESS** (tile edilebilir; `circleGeometry` diskine sarılır). sRGB.
- Prompt: `Seamless tileable painterly texture of a dark warm concrete-and-graphite studio floor, subtle oil-painted mottling, faint amber light gradient, occasional dust and scuff marks, near-black warm base #141210, low contrast, no strong highlights, matte, edges must tile perfectly,` + ortak negatif kilit.
- Türkçe: Koyu-sıcak beton/grafit stüdyo zemini, tile edilebilir, soluk amber gradyan, toz izleri. Baz `#141210`. Güçlü highlight YOK (§8 luminance bandı).
- Magnific: Illustration, Resemblance 9, Creativity 1 (seamless'ı koru; tile testini upscale sonrası tekrar yap).
- Not (V3 §8): Bu zemin canlıya bağlanınca DOM'daki `.ml-v3-floor` grid'i sahne açıkken kaldırılır — iki zemin aynı anda yaşamaz.

---

### 2D. Backdrop / gökyüzü (1 adet)

**Backdrop** `backdrop-sky.webp`
- **Format:** WebP, **2048×1024** (geniş panoramik arka fon; sahneyi saran düzlem/dome). sRGB.
- Prompt: `Wide painterly night backdrop, deep warm graphite sky fading to near-black at the top, a single distant golden glow near the horizon like a far streetlamp or dying sun, soft atmospheric haze, no stars, no moon, no buildings in focus, impressionist oil wash, extremely low detail, matte, horizontal panorama,` + ortak negatif kilit.
- Türkçe: Geniş yağlıboya gece fonu, üstte near-black'e giden sıcak grafit gök, ufukta tek uzak altın parıltı. Yıldız/ay/bina YOK, düşük detay (arka planda kalmalı, dikkat çekmemeli).
- Magnific: Illustration, Resemblance 7, Creativity 3 (yumuşak atmosfer için biraz serbestlik).
- Işık uyarısı: ufuktaki altın parıltı KÜÇÜK kalsın — geniş parlak alan bloom patlatır (§7/§8).

---

### 2E. Logo kartı (1 adet)

**MAMILAS logo kartı** `logo-card.webp`
- **Format:** WebP, **1024×1448** (yüzen kart yüzü ile aynı geometri — logo bir kart olarak asılır). sRGB.
- Prompt: `A painterly emblem card: an oil-painted golden geometric monogram medallion centered on dark warm graphite, embossed brass-plate feel, single warm rim light, aged patina, subtle impasto, vignette edges, NO letters spelled out, abstract golden crest only,` + ortak negatif kilit.
- Türkçe: Yağlıboya amblem kartı — koyu grafit üzerinde altın geometrik monogram madalyonu, pirinç-plaka hissi, eskimiş patina. **Harf yazma** (MAMILAS metni koda ayrı basılır); yalnız soyut altın arma.
- Magnific: Illustration, Resemblance 9, Creativity 1 (formu koru).
- Not: Metin yasağı bilinçli — logotype/tipografi V3 tipografi kanununa (Bölüm 4) tabidir ve DOM'da işlenir; asset yalnız görsel amblemi taşır.

---

## 3. Teslim protokolü

### Klasör yapısı
```
public/
├─ assets3d/                      ← YENİ: diorama dokuları + kartlar + logo
│  ├─ card-hero-archetype.webp
│  ├─ card-detective-archetype.webp
│  ├─ card-arcane-archetype.webp
│  ├─ card-explorer-archetype.webp
│  ├─ table-top.webp
│  ├─ floor-disc.webp
│  ├─ backdrop-sky.webp
│  └─ logo-card.webp
└─ assets/characters/            ← MEVCUT: portreler buraya (id'ler değişmez)
   ├─ skill_volition.png
   ├─ skill_perception.png
   ├─ skill_shivers.png
   ├─ skill_logic.png
   ├─ skill_visual_calculus.png
   ├─ skill_drama.png
   └─ skill_case_ledger.png
```

### Adlandırma
- Kebab-case, uzantı küçük harf. `assets3d/` slot adı = kod slot adı (birebir eşleşme).
- Portreler mevcut id sözleşmesini korur (`voicePortraits.ts` → `VOICE_PORTRAIT[voice].id`); yeni dosya eskisini **overwrite** eder, kod satırı değişmez.

### "Asset düşünce otomatik bağlanır" slot mantığı (M4 kodu okuyacak)
- **Portreler:** zaten canlı. `AdvisorPortrait` `/assets/characters/${id}.png` yükler; `onError` → `CharacterStage` sprite fallback. Dosyayı değiştir, yenile — yeni yüz gelir. Kod dokunulmaz.
- **Diorama slotları (M4'te eklenecek kod):** `DioramaStage.tsx` her slot için `useTexture`/loader ile `public/assets3d/<slot>.webp` dener:
  - `FloatingCard` → ilgili `card-*.webp` (bugün `LOOK.palette.ink` plane → doku map).
  - Zemin diski → `floor-disc.webp` (bugün düz `floor` renk).
  - Masa üstü → `table-top.webp` (bugün `#2a241c` düz).
  - Backdrop → `backdrop-sky.webp` (bugün yok → yeni saran düzlem/dome mesh).
- **Bağlanma sözleşmesi:** slot → sabit dosya adı eşlemesi tek bir manifest'te tutulur (M4 kodu). Dosya varsa doku, yoksa placeholder malzeme + `console.warn`.

### Eksik asset davranışı (V3 §7.11 — ZORUNLU)
- Sessiz düşüş YASAK. Asset yüklenemezse:
  1. `console.warn('[assets3d] missing/failed: <path>')`
  2. Bugünkü placeholder malzeme (altın-kağıt kart, düz zemin/masa) devreye girer.
  3. Gate script (`mamilas-gate` + `scripts/final-shots.mjs`) eksik slotu **raporlar** — brief tamamlanana kadar yeşile geçmez.
- Placeholder'dan gerçeğe geçiş, V3 §8'in üç kriterini birden gerektirir: (1) gate yeşil + format/boyut doğru, (2) ekran kanıtında kimlik korunuyor (tek altın ışık, cam arkası doku okunuyor, bloom patlaması yok), (3) fark "boyanmış dünya", "daha güzel placeholder" değil.

### Renk/ışık kabul bandı (üretim sırasında Muhammet kontrol eder)
- Dominant hue 35–55° amber, düşük value; soğuk yalnız desatüre `#8fa3c2` ailesi.
- Luminance > 0.72 alan payı ≤ %4 (geniş parlak yüzey = bloom patlaması).
- Fırça izi görünür; fotogerçekçi upscale kullanılmadı.

---

## 4. Antigravity GOAL formatı

> Aşağıdaki blok, bu briefin Antigravity/Gemini'ye verilebilir sarmalıdır.
> Dosya `ANTIGRAVITY_GOAL_DIORAMA_ASSETS.md` olarak da kaydedilebilir. Promptlar Bölüm 2'dekilerle aynıdır; burada hedef + kabul kriteri çerçevesi eklenir.

```markdown
# GOAL: MAMILAS 3D Diorama Painterly Asset Seti (M4)

## Hedef
15 adet telif-temiz, Disco-Elysium-ilhamlı yağlıboya asset üret:
7 kabinet portresi + 4 dünya-arketip kartı + masa dokusu + zemin dokusu +
backdrop gökyüzü + 1 logo kartı. Tümü altın-karanlık MAMILAS paletinde,
tek altın ışık kaynağı, görünür fırça izi. nano_banana_2 ile üret,
Magnific ile Illustration modunda upscale et (Resemblance yüksek,
fotogerçekçi preset YASAK).

## Stil kanunu (her prompt'a giren çekirdek)
- Oil painting / gouache, visible impasto, painterly edges.
- Tek sıcak altın key light, uzun yumuşak gölge, sıcak koyular (asla #000).
- Palet: gold #f7c948, amber #d6a84f, paper #e8ddc8, ink #0a0c14, floor #141210.
- Karşı-ışık yalnız desatüre buz-çeliği #8fa3c2 (neon yasak).
- Üslup ilhamı serbest; birebir kopya / tanınır karakter / marka / UI YASAK.
- Negative (her üretimde): photograph, photorealistic, 3D render, CGI, neon,
  cyan, magenta, teal, watermark, signature, text, letters, UI, HUD, logo,
  pure black, flat vector, lens flare, bloom blowout.
- Luminance > 0.72 alanı ≤ %4 (geniş parlak yüzey bloom patlatır).

## Hedef klasör
- Portreler → public/assets/characters/<id>.png  (şeffaf PNG 512²)
- Diorama/kart/logo → public/assets3d/<ad>.webp
- Formatlar: portre 512² PNG-alpha · kart & logo 1024×1448 WebP ·
  masa 1024² WebP · zemin 2048² WebP SEAMLESS · backdrop 2048×1024 WebP · hepsi sRGB.

## Asset listesi + promptlar
[Bölüm 2A–2E'deki 15 prompt buraya kopyalanır — dosya adı, boyut,
 İngilizce prompt, Türkçe açıklama, Magnific notu ile.]

## Kabul kriterleri
1. 15 dosya doğru ad + doğru format/boyutla üretildi (kebab-case, sRGB).
2. Her asset altın-karanlık kimlikte: tek sıcak ışık, amber dominant,
   soğuk yalnız desatüre buz; neon/foto/metin yok.
3. Fırça izi görünür; hiçbir asset fotogerçekçi görünmüyor.
4. Zemin dokusu kusursuz tile ediyor (upscale sonrası tekrar test edildi).
5. Portrelerde alfa temiz (matte kalıntısı yok), büst ¾ açı, şeffaf zemin.
6. Logo kartında yazılı harf yok; yalnız soyut altın amblem.
7. Parlak (luminance > 0.72) alan payı her asset'te ≤ %4.
8. Dosyalar repoya bırakıldığında MAMILAS gate + final-shots ekran
   kanıtı yeşil: kimlik korunuyor, bloom patlaması yok.
```

---

## 5. Denetleyici için açık sorular

1. **Format çelişkisi:** Görev talimatı portre 1024², kart 512×768, gökyüzü 2048×1024 diyor; V3 §8 kanunu portre 512², kart 1024×1448, zemin 2048² seamless, masa 1024² diyor. Bu brief **V3'ü** izledi (kanun sırası: V3 en üstte). Backdrop için V3 boyut vermiyor; 2048×1024 (talimattan) alındı. Onaylanacak mı, yoksa talimat ölçüleri mi bağlayıcı?
2. **Portre yolu:** Portreler `assets3d/` DEĞİL, mevcut `assets/characters/` hattında bırakıldı (mevcut `AdvisorPortrait` + `voicePortraits.ts` id'leri buradan okuyor; yol değişirse kod da değişir — bu M4 kapsamını beyin-dışı sunum katmanından çıkarır). Doğrulansın mı?
3. **Backdrop geometrisi:** Bugün `DioramaStage`'de backdrop mesh yok. Saran düzlem mi, yarım dome mu, skybox mu? Doku oranı (2048×1024) düzlem/dome varsayıyor; karar M4 kodunu etkiler.
4. **Logo metni:** Amblemde harf yasakladım (tipografi DOM'da V3 §4'e göre). "MAMILAS" kelimesi asset'e mi basılsın yoksa kod mu bassın? Şu an: kod basar.
5. **Kart arketipleri:** 4 jenerik arketip (hero/detective/arcane/explorer) seçildi. MAMILAS world kategorileri (arcane/verse/edu/anime/real) 5 tane; 4 karta sığdırmak için "verse+anime" hero'da, "real" detective'te birleşti. 5. kart eklensin mi, yoksa 4 yeterli mi?
```
