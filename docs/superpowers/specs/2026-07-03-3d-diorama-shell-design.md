# MAMILAS 3D Diorama Kabuğu — Tasarım Spec'i

Tarih: 2026-07-03
Durum: Onay bekliyor

## Amaç

MAMILAS Pro OS'in sunum katmanını Disco Elysium ilhamlı, oyun hissi veren bir
3D deneyime dönüştürmek. **Beyin (kabinet mantığı, prompt üretimi, Final Brief,
production export) hiçbir şekilde değişmez** — bu proje yalnızca sunum katmanıdır.
Final Brief akışının çalışırlığı her milestone'da birinci öncelik.

## Kilitlenen kararlar

1. **Kapsam — Hibrit:** Giriş/dashboard tam 3D sahne; çalışma ekranları
   (Brief, Reçete, Sahneler, Timeline, QA) 2D DOM panel olarak kalır,
   3D dünyanın üstünde "cam/parşömen panel" gibi durur.
2. **Estetik — Disco Elysium ilhamı:** Painterly/yağlıboya karanlık,
   mevcut koyu-altın MAMILAS paletiyle füzyon. Neon cyberpunk değil.
   Telifli asset kullanılmaz; tarz ilhamı + özgün üretim.
3. **3D strateji — DE formülü:** 3D izometrik diorama (prosedürel geometri)
   + 2D painterly karakter portreleri. Rigli 3D karakter yok (ileride
   opsiyonel).
4. **Mimari — Kalıcı R3F katmanı:** Uygulama kökünde tek `<Canvas>`;
   stage geçişleri kamera koreografisiyle yapılır.
5. **Inner thoughts — DE ünlem sistemi:** Sürekli açık kabinet paneli yerine
   ünlem rozeti + portreli/daktilo animasyonlu düşünce baloncukları.

## Mimari

### Katmanlar

```
┌─ DOM (z:1) ─────────────────────────────┐
│ Stage panelleri (Brief/Reçete/...)      │
│ ThoughtBubble kuyruğu + geçmiş çekmecesi│
├─ R3F Canvas (z:0, kalıcı) ──────────────┤
│ DioramaStage (prosedürel geometri)      │
│ CameraRig (stage → kamera pozu)         │
│ Atmosphere (sis, toz, ışık hüzmeleri)   │
│ PostFX (bloom, vignette, grain, CA)     │
└─────────────────────────────────────────┘
```

### Yeni bağımlılıklar

`@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`.
Vite 8 olduğu gibi kalır; R3F chunk'ı lazy import edilir (ilk boya hızı korunur).

### Birimler

- **`src/scene/DioramaStage.tsx`** — prosedürel stüdyo dioraması: masa, ışık
  direği, yüzen kartlar, zemin. Doku slotları placeholder ile başlar; gerçek
  painterly dokular `public/assets3d/`e düşünce otomatik bağlanır.
- **`src/scene/CameraRig.tsx`** — zustand'daki aktif stage'i dinler; her stage
  için tanımlı kamera pozuna (pozisyon + hedef + FOV) yumuşak tween.
  Tek yetkili kamera otoritesi budur; başka hiçbir birim kamerayı oynatmaz.
- **`src/scene/PostFX.tsx`** — efekt zinciri: hafif altın bloom, vignette,
  film grain, çok düşük chromatic aberration. Şiddetler tek config dosyasında
  (`src/scene/lookConfig.ts`) — DE "yağlıboya karanlığı" ayarı buradan döner.
- **`src/components/ThoughtBubble/`** — ünlem rozeti, baloncuk, daktilo
  animasyonu, "VOLITION — FAIL" tarzı etiket, otomatik kapanma, geçmiş
  çekmecesi. Kabinet çıktısını **mevcut store'dan okur**; kabinet koduna
  dokunmaz. Kural: FAIL/BLOCK önem düzeyi kendiliğinden açılır, FIX/INFO
  rozette bekler.
- **Panel giydirme** — mevcut stage sayfaları yerinde kalır; sadece kapsayıcı
  stilleri (cam/parşömen çerçeve, arkada diorama görünürlüğü) güncellenir.

### Veri akışı

Kabinet mantığı → (mevcut zustand store, değişmez) → ThoughtBubble kuyruğu.
Stage router → CameraRig pozu. Tek yönlü; sahne hiçbir zaman beyne yazmaz.

## Asset hattı

Kod tarafı (Claude) ile üretim tarafı (Muhammet: nano_banana_2 + Magnific)
ayrışır:

- Claude, `ASSET_BRIEF.md` üretir: her kabinet karakteri için DE yağlıboya
  portre promptu, diorama doku promptları, arka plan/gökyüzü promptu; format
  (şeffaf PNG portreler, WebP dokular), boyutlar, Magnific upscale notları.
- Asset gelene kadar her slot placeholder ile çalışır; **hiçbir milestone
  asset beklemez.**

## Hata durumları

- WebGL yoksa / context düşerse: canvas kapanır, uygulama bugünkü 2D haliyle
  tam işlevsel çalışır (graceful degrade). Final Brief asla 3D'ye bağımlı olmaz.
- Asset yüklenemezse: placeholder'a sessizce dönmek yok — konsola uyarı +
  placeholder; gate script'i eksik asset'i raporlar.

## Kalite kapısı

- Her milestone sonunda `mamilas-gate` (tsc + vitest + build) + mevcut
  `scripts/final-shots.mjs` ekran kanıtları.
- ThoughtBubble kuyruk mantığı vitest ile test edilir (önem düzeyi →
  davranış eşlemesi).
- Playwright smoke: canvas mount oluyor mu, stage geçişinde panel içeriği
  erişilebilir mi.
- Performans bütçesi: DPR ≤ 2, idle'da frameloop düşürme; Final Brief
  ekranında etkileşim gecikmesi hissedilirse efektler o ekranda kısılır.

## Milestone'lar

1. **M1 — Sahne iskeleti:** R3F katmanı + CameraRig + PostFX, placeholder
   diorama. Gate yeşil, ekran kanıtı.
2. **M2 — Ünlem sistemi:** ThoughtBubble kuyruk + rozet + daktilo + geçmiş;
   eski sabit panel kaldırılır.
3. **M3 — Panel giydirme:** Stage panelleri cam/parşömen çerçeve + stage
   başına kamera koreografisi.
4. **M4 — Gerçek asset + cila:** ASSET_BRIEF üretimi, Muhammet'in asset'leri
   bağlanır, grain/partikül/ışık son ayar.
5. **M5 — Referans önizlemenin 3D'leşmesi:** `CanvasPreview` (1464 satır elle
   yazılmış 2D canvas) kademeli olarak R3F'e taşınır. drei `<View>` ile her
   önizleme kartı kalıcı canvas'a açılan bir viewport olur (ekstra WebGL
   context yok). Önce hero varyant (Reçete büyük kart): world başına bir
   R3F mini-sahne, palet renkleri gerçek malzeme/ışık/sise bağlanır. Küçük
   rail thumb'ları 2D motorda kalır; 2D motor ayrıca WebGL fallback'i olarak
   korunur. Kabul ölçütü: palet değişimi hero önizlemede gerçek ışık/gölge
   tepkisi üretir, mevcut preview kategorileri (arcane/verse/edu/anime/real)
   birebir karşılanır.

## Kapsam dışı (bilerek)

- Rigli/animasyonlu 3D karakter (ileride ayrı proje).
- Rail thumb önizlemelerinin 3D'leşmesi (M5 sonucuna göre ayrıca kararlaştırılır).
- Next.js veya build sistemi değişikliği.
- Kabinet/beyin/decode/export mantığında herhangi bir değişiklik.
- Ses tasarımı (M4 sonrası ayrıca değerlendirilir).
