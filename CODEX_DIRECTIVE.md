# CODEX DIRECTIVE — MAMILAS Modern (2026-06-23)

Sen Codex'sin. Bu repoda (`~/Desktop/mamilas-modern`, Vite + React 19 + TS + Zustand) aşağıdaki işleri **aşama aşama** yapacaksın. Her aşama bağımsız bir commit. Sabah Claude final-check + cila yapacak — yani işini **denetlenebilir, temiz ve kanıtlı** bırak.

Bu bir emirdir, öneri değil. Sırayla git, atlama, kısa kesme.

---

## ★ KUZEY YILDIZI — FINAL BRIEF İNANILMAZ OLMALI

Bu projenin tek amacı şu: site'ın ürettiği **final brief + ajan paketleri**, yönetmen
ajanlarına (eczacılara) yapıştırıldığında **inanılmaz bir reçete** gibi çalışsın.
Final brief = ajanın elindeki tam, özgül, çelişkisiz, üretilebilir reçete. Her işin
sonunda kendine sor: "Bu brief'i bir ajana versem, tartışmasız harika bir prompt
üretir mi?" Cevap evet değilse iş bitmemiştir.

Final brief'in taşıması ZORUNLU (hepsi `brain.ts` `buildAgentBrief`/`primePacket`'te
üretiliyor — bozma, güçlendir): RENDER LOCK (kelimesi kelimesine, render world'ün
zengin tarifi) · Material cümlesi (varsa) · MODEL ERA (2026 frontier) · AUTHORITY
hiyerarşisi · REFERENCE DNA → DIRECTIVES · PALETTE AS LIGHT · I2V ANCHOR LAW + ~9s
dengeli bölme · SCENE DOSSIER (kaynak+concept+kamera+süre) · SOUND · FAIL CONDITIONS
· PROOF STATE. Bir alanı zayıf/jenerik bırakma; ajanın kararını netleştir.

Ajan beyinlerini (`agents/GLOBAL_BRAIN.md` + `agents/claude/*` + `agents/gpt/*`)
**CODEX YAZMAZ** — onlar Claude'a emanet. Sen yalnız site/kod/önizleme/referans
tarafını yap; ajan dosyalarına dokunma (AŞAMA 4 yalnız DENETİM raporu yazar, içerik
Claude'a kalır).

---

## 0. DEĞİŞMEZ KURALLAR (her aşamada geçerli — ihlal = iş reddedilir)

1. **GATE (her commit'ten önce ZORUNLU, hepsi yeşil olmadan commit etme):**
   ```
   npx tsc --noEmit        # 0 hata
   npx eslint .            # 0 hata
   npx vitest run          # hepsi PASS (şu an 127/127)
   npx vite build          # başarılı
   ```
   Bir aşamada gate kırılıyorsa: ya düzelt ya o aşamayı geri al. Kırık commit YASAK.

2. **ARAS & DEFNE EMEKLİ.** Bu isimleri ASLA geri ekleme (kod, veri, test, doküman). `cast` opsiyonel serbest-metin, varsayılan `''`. `grep -ri "aras\|defne" src/` → 0 olmalı.

3. **2 EKSEN MİMARİSİ KORUNUR:** Render Dünyası (stil+kalite, `SURGERY_DATA.worlds`) × Anlatı Malzemesi (`SURGERY_DATA.materials`). Malzeme `materialClauseOf()` ile non-real register'da render-lock'a enjekte edilir. Bu ayrımı geri birleştirme.

4. **2026 FRONTIER KAFASI:** Sabit model sürümü yazma (Kling 3.0/Suno v5.5 gibi). Motorlar seçili modele bağlı + "frontier" dilinde. Prompta "4K/8K/masterpiece/ultra-detailed/award-winning" cargo-cult YAZMA. Eski-zayıf-model defansı yazma.

5. **SÜRE PENCERESİ:** temiz tek-çekim ~9s (kling/seedance/hailuo=9, veo=8, runway=14). Aşınca `durationGuard` **dengeli böler** (14s→2×7s). Bu mantığı bozma.

6. **DOKUNMA:** kaynak-bütünlüğü (`sourceIntegrity`, `ingestSource`), kontrat kapısı (`validateBriefCompatibility`), golden-master testleri. Bunlar kanıt katmanı; davranışlarını değiştirme, sadece üstüne ekle.

7. **TASARIM SİSTEMİ:** Studio Console token'ları (`src/styles/tokens.css`) tek kaynak. Yeni renk/spacing hardcode etme; `var(--...)` kullan. Paneller `PanelKit`, sağ ray `RecipeRail`, canlı thumb `RecipeThumb` üstünden.

8. Her commit mesajı: ne + neden + "Gate: tsc 0, eslint 0, N/N unit, build green". Sonuna:
   `Co-Authored-By: Codex <noreply@openai.com>`

9. Emin olmadığın 3. parti gerçeği (model sürümü, motor limiti) UYDURMA. Tunable bırak + yorumda belirt.

10. **HER ADIMI KANITLA LOGLA (ZORUNLU).** Repoda `CODEX_LOG.md` tut. Her alt-adımda
    şunları yapıştır: çalıştırdığın komut + çıktısının özeti, gate sonucu (tsc/eslint/
    vitest/build sayıları), aldığın screenshot dosya adı, before/after notu, ve "neden
    böyle yaptım" tek cümle. Kanıtsız "yaptım" YASAK. Claude sabah bu logu denetleyecek;
    log eksikse iş yapılmamış sayılır.

11. **BU UZUN BİR İŞ — acele etme, derinleş.** Bu en az 1 saatlik, titiz bir vardiyadır.
    Yüzeysel geçme; her sahneyi/komponenti tek tek elden geçir. "High-end" demek: gerçek
    kompozisyon, gerçek efekt katmanları, okunaklı hiyerarşi, mikro-etkileşim, performans
    (gereksiz reflow/rAF yok). Ucuz/placeholder iş reddedilir.

---

## MİMARİ ÖZET (neye dokunduğunu bil)

- `src/core/pure.ts` — saf üretim motoru: `generateBatch`, `materialClauseOf`, `deriveTeachingRecipe`, `validateBriefCompatibility`, `DATA` (SURGERY_DATA tipli).
- `src/core/brain.ts` — beyin: `renderLock(world,register,material?)`, `buildImagePrompt`, `buildMotionPrompt`, `buildAgentBrief`, `primePacket`, `dnaDirectives`, `durationGuard`, `primeConcept`.
- `src/core/advisor.ts` — `suggestRecipe(topic)` (Otomatik Reçete), `directorNotes(input)` (canlı yönetmen denetimi).
- `src/components/refScenes.ts` — `REF_SCENES: Record<refId, SceneFn>`: referans-başına özgün palet-adaptif HTML5 canvas sahnesi.
- `src/components/CanvasPreview.tsx` — `refId` varsa `REF_SCENES`, yoksa `worldCategory` taban renderer.
- `src/components/RecipeRail.tsx` — sağ ray: Reçete Kilidi + Yönetmen notları + 10/10 hedef.
- `src/core/SURGERY_DATA.json` — `worlds` (group ANIMATION/REAL/STYLIZED), `materials`, `refs` (cat'e göre), `palettes`, `golden`.

---

## AŞAMA 1 — Yeni premium render dünyalarına ÖZGÜN canvas önizleme sahneleri
**GOAL:** Arcane / Spider-Verse / Anime / Pixar3D / Ghibli / Stop-motion seçilince önizleme o stilin *özgün* canvas sahnesini göstersin (şu an `worldCategory` taban renderer'a düşüyorlar — cılız).

- `src/components/refScenes.ts` desenini örnek al. Yeni bir `WORLD_SCENES: Record<worldId, SceneFn>` ekle (veya `REF_SCENES`'i genişlet) ve `CanvasPreview`'da ref-sahnesi yoksa **world-sahnesi**, o da yoksa kategori taban sırasıyla dene.
- 6 dünya için özgün sahne yaz: `arcane` (teal+ember, brush-stroke albedo hissi, negatif-alan gölge), `spiderverse` (halftone Ben-Day + CMYK kayma + ink outline + onomatopoeia), `anime_cel` (cel bantları + speed line + rim/bloom), `pixar3d` (yumuşak GI orb + rim), `ghibli` (suluboya gökyüzü + rüzgârda çimen), `stopmotion` (grain + macro DOF + 12fps stutter).
- Hepsi palet-adaptif (c0–c3), `requestAnimationFrame`, `prefers-reduced-motion` saygılı.
- **EFEKT-YÜKLÜ, TANINIR ÖNİZLEME (Mami isteği):** her referans önizlemesi o evrenin
  ENERJİSİNİ taşımalı — ör. One Piece = hasır-şapka silüeti + gum-gum esneme hareketi +
  güneş/okyanus enerjisi + bayrak; Naruto = chakra spirali + el-işareti enerjisi.
  Tanınır ama **IP-GÜVENLİ**: birebir kopyalanmış telifli karakter yüzü/tasarımı YOK —
  silüet + imza-efekt + renk-enerjisiyle "o seriyi hissettir". Ucuz geometri değil,
  katmanlı efekt (glow, parçacık, hız çizgisi, halftone) + okunaklı kompozisyon.
- **ACCEPTANCE:** her yeni dünya/önizleme görünür biçimde farklı + palet değişince renk değişir. Gate yeşil. Geçici galeri HTML ile sahneleri 2 palette render edip screenshot al (CODEX_LOG.md'ye iliştir), sonra galeriyi sil.

## AŞAMA 2 — Referans sistemini güçlendir ("cılız/ham" — Mami)
**GOAL:** referans seçimi akıllı ve yönlendirici olsun.

- **(a) Render-dünyası uyum skoru:** seçili render dünyasıyla her ref arasında 0–100 uyum (ref.cat ↔ dünya register/kategori). RecipeStep ref kartında küçük bir skor rozeti; çakışan ref kırmızı uyarı. Mantığı `advisor.ts`'e saf fonksiyon olarak yaz (`refFit(world, ref): number` + test).
- **(b) Başlangıç paketleri:** her render dünyası için küratörlü 2-3 ref'lik "Starter Pack" (`SURGERY_DATA` veya `advisor`'da statik harita). RecipeStep'te "Bu dünya için önerilen DNA" tek-tık uygula.
- **(c) Rol etiketi:** ref'in katkısı (kamera / ışık / kompozisyon / doku) — `dnaDirectives` zaten DNA_MAP ile çıkarıyor; ref kartında etiket olarak göster.
- **(d) Güç göstergesi:** seçili reflerin brief'i ne kadar değiştirdiği (kaç direktif alanını doldurdukları). 0 katkılı ref'i "gereksiz" diye işaretle.
- **ACCEPTANCE:** uyumsuz ref seçince RecipeRail yönetmen notu uyarır; starter pack tek tıkla dolu reçete kurar. Yeni saf fonksiyonlara unit test. Gate yeşil.

## AŞAMA 3 — Önizleme kalite turu (60 referans sahnesi)
**GOAL:** `refScenes.ts`'teki 60 sahneyi tek tek gözden geçir; zayıf/jenerik olanları (özellikle One Piece, shonen grubu) o referansın DNA'sına daha sadık yeniden çiz.
- Her sahne ~12-30 satır, paylaşımlı primitifleri kullan. Kompozisyon okunaklı, palet-adaptif, klişe değil.
- **ACCEPTANCE:** galeri screenshot'ı (60 sahne, 2 palet) ile önce/sonra; en az "default'a düşen" veya boş görünen sahne kalmasın. Gate yeşil.

## AŞAMA 4 — Ajan/Knowledge standart denetimi + güçlendirme
**GOAL:** `agents/` (GLOBAL_BRAIN + claude×6 + gpt×6) ve `knowledge/` (×6) dosyalarını "Claude standardı"na getir.
- Denetle: (1) eski model sürümü/2025 kafası var mı → 2026 frontier diline çek, (2) Aras/Defne kalıntısı, (3) 2-eksen (render×malzeme) ve 9s/dengeli-bölme kuralları yansıyor mu, (4) site↔paket↔ajan token sözleşmesi (`BRAND KIT: LOCKED` vb.) tutarlı mı, (5) çelişki/tekrar/şişme.
- Önce `AGENT_AUDIT.md` raporu yaz (dosya-dosya bulgular + öneri), SONRA düzeltmeleri uygula. Kaynak metni anlamını bozma; sadece güncelle/sıkılaştır.
- **ACCEPTANCE:** AGENT_AUDIT.md + temizlenmiş dosyalar. Bu aşama kod gate'ini etkilemez ama yine de tsc/build kırılmamalı.

---

## SABAH (Claude yapacak — sana bilgi)
Claude her aşamayı bağımsız doğrulayacak: gate'i tekrar koşacak, brief çıktısını probe ile okuyacak, görselleri tarayıcıda çekecek, gereksiz/uydurma şeyleri budayacak, commit geçmişini düzeltecek. O yüzden **dürüst bırak**: yapamadığın yeri `TODO(codex):` ile işaretle, uydurma yeşil verme.

İlk hamleni AŞAMA 1'den başlat. Başla.
