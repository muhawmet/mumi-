Run start — 2026-06-23 Europe/Istanbul — AŞAMA 1 başladı; bağlayıcı direktif ve GLOBAL_BRAIN okundu.

## AŞAMA 1 — Premium render dünyaları / canvas önizleme

### Uygulama
- Komut: `sed -n ... CODEX_DIRECTIVE.md agents/GLOBAL_BRAIN.md src/components/refScenes.ts src/components/CanvasPreview.tsx` → otorite, mevcut `SceneFn` primitifleri ve render yaşam döngüsü okundu.
- Değişiklik: `WORLD_SCENES` içine `arcane`, `spiderverse`, `anime_cel`, `pixar3d`, `ghibli`, `stopmotion` için altı özgün, palet-adaptif sahne eklendi.
- Değişiklik: `CanvasPreview` çözümleme sırası `REF_SCENES → WORLD_SCENES → category renderer` oldu; `prefers-reduced-motion` açıkken tek kare çizip RAF döngüsünü durduruyor.
- Test: `src/components/refScenes.test.ts` altı zorunlu world ID’sini ve world-scene lookup sözleşmesini kilitliyor.
- Neden: Referans seçilmeden de render world kendi görsel gramerini göstermeli; referans seçilince daha özgül DNA sahnesi otoriteyi devralmalı.

### Görsel kanıt ve öz-denetim
- Geçici galeri: 6 dünya × 2 palet gerçek canvas motoruyla render edildi; galeri kaynak dosyası screenshot sonrası silindi.
- Screenshot: `phase1-world-scenes-2-palettes.png` (final, iki palette 12 kare).
- Ara screenshot: `/tmp/phase1-world-scenes-before-self-audit.png` (commit dışı öz-denetim girdisi).
- Runtime kontrol: `/tmp/phase1-runtime-arcane-fallback.png`; gerçek Reçete ekranı açıldı, seçim akışı çalıştı, browser console `0 error / 0 warning`.
- Before: altı premium world, refsiz durumda geniş kategori renderer’ına düşüyor ve birbirinden yeterince ayrışmıyordu.
- After: Arcane teal/ember boya+negatif gölge; Spider-Verse Ben-Day+print shift+ink; Anime cel bant+rim+bloom/action axis; Pixar yumuşak GI; Ghibli suluboya wash+rüzgâr çimi; Stop-motion macro DOF+grain+12fps armature olarak ayrışıyor.
- Kreatif direktör öz-denetimi: ilk turdaki üçgen Arcane/Anime silüetleri, düz-vektör Ghibli tepeleri ve küre gibi okunan Stop-motion figürü “ucuz/jenerik” bulundu; organik bezier kütleleri, wet-edge boya katları, action blade ve görünür eklem/yüz detaylarıyla düzeltildi.
- Palet kanıtı: Teal/Ember ve Violet/Citron setlerinde tüm kompozisyonlar aynı kimliği korurken `c0–c3` renkleri görünür biçimde değişiyor.

### Gate — PASS
- Komut: `npx tsc --noEmit && npx eslint . && npx vitest run && npx vite build`
- TypeScript: `0 hata`.
- ESLint: `0 hata`.
- Vitest: `10/10 test file`, `129/129 test PASS`.
- Vite: `2197 module transformed`, production build başarılı (`✓ built in 133ms`).
- Sınır kontrolü: `rg -ni 'aras|defne' src` → `0`; `agents/` ve kaynak/kontrat/golden katmanlarına dokunulmadı; geçici galeri silindi.
- Kuzey Yıldızı: **Evet** — bu aşama final brief metnini değiştirmiyor fakat seçilen render world’ü doğru ve ayırt edilebilir görselleştirerek ajana gidecek reçetenin yanlış dünya ile kurulma riskini azaltıyor.
- Sonuç: **AŞAMA 1 PASS**.
