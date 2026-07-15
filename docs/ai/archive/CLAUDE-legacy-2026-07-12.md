# MAMILAS Modern — Proje Beyni

Mami'nin (Muhammet) AI eğitim/reklam videosu üretim konsolu. **Doktor = Mami** (sitede reçete kurar), **Eczacı = `.command`** (Claude'u yönlendirir). Hedef: film-grade, 10/10 beyin.

Bu dosya **kanonik kuralları** taşır; ilerleme/changelog/faz-durumu değil — güncel durum için `MEMORY.md` + `docs/superpowers/` handoff'ları.

## Stack & Gate
- **Vite + React + TS + Zustand**, `~/Desktop/mamilas-modern` (git). Aktif dal: `feat/3d-diorama-shell`.
- **Tam kalite kapısı (her commit öncesi ZORUNLU — `/mamilas-gate` skill'i koşar):**
  - `npx tsc --noEmit` → 0 hata
  - `npx vitest run` → hepsi yeşil (sayı DÜŞERSE alarm — **test silmek yasak**)
  - `npm run build` → başarılı
  - `zsh -n agents/MOTION-CALISTIR.command && zsh -n agents/production/MOTION-CALISTIR.command` → syntax OK
- **`npm run test:e2e`**: Playwright. Bilinen baseline kırıkları var (preset/director bug ailesi) — gate'in parçası DEĞİL, sadece "yeni kırık yok" kontrol et.
- **Tuzak:** 5173/5179'da başıboş dev server kalabilir → `lsof -ti:5173 | xargs kill`.
- **`npm run workbench`** → `scripts/brain-workbench.ts` (beyin senaryo matrisi).

## Veri: `src/core/SURGERY_DATA.json`
39 dünya · 112 ref · 12 palette. Her dünyada: `render_law` / `line_grammar` / `lens_grammar` / `light_law` / `palette_lock` / `motion_cadence` / `negative_lock` / `example_injection` — hepsi pipeline'a bağlı. Ref: `dna` (7-katman direktif) / `anchor` / `use` / `avoid` + `id/name/cat/worldId/preview`. Palette: `bias` (fiziksel ışık dili) / `hex` / `native_world`.

## Çekirdek akış (`src/core/`)
`source.ts` (decodeBrief/ingestRawSource) → `pure.ts` (generateBatch) → `brain.ts` (dnaDirectives/perRef, buildImagePrompt — mood/timeLight/cameraEnergy/pov threading, buildAgentBrief, primePacket, FRAME-AWARE motion) → `commandExport.ts` (.command, frame-gated) → `productionExport.ts`. QA = Director's Cabinet v2 (`qa.ts`, kanıt-tabanlı, export firewall testli). Motor otoritesi = `engine.ts` (ENGINE_USABLE + ENGINE_DIALECTS). Authority tek kaynak = `brain.ts` `AUTHORITY_HIERARCHY` — `agentBrief`→`final_brief.md` yoluyla motora gider; `docsContract.test.ts` her doküman kopyasını (authority/hex/engine) koda kilitler, sapan kopya = kırmızı test.

## Sert kısıtlar (ASLA ihlal etme)
- **Authority hiyerarşisi:** Path > World/Render Lock > Material (uyumluysa) > Source > Approved image > Director Mandate > Ref DNA > Palette. Alt üstü ezmez.
- **Palet Translation Law:** palet prompt'a ham hex olarak DEĞİL fiziksel ışık dili olarak geçer. `#RRGGBB` sadece `palette_lock`/dossier'de yaşar, ASLA prompt yoluna sızmaz.
- **Mami'nin kurgu sınırı:** Premiere'de SADECE klip kesme/sıralama (J-cut, L-cut, kırpma) + VO/müzik yerleştirme, seviye ve fade yapar. **Kesme sırası + ses yerleşimi içeren kurgu planı üretmek MEŞRU.** ASLA önerme: keyframe, compositing, text/altyazı overlay, renk grading, hız rampası, efekt, dB normalize, After Effects / Resolve / Canva.
- **On-screen text yasası:** metin ya IMAGE PROMPT'a diegetik/baked gömülür ya HİÇ olmaz (temiz plaka + VO). "Sonra text eklersin" diye bir dünya yok.
- **FRAME-AWARE:** motion prompt asla start frame'i görmeden yazılmaz — onaylı kareye bağlanır. **Prompt PASS ≠ görsel PASS** — kare ayrıca (envanter/dims/baked-text) denetlenir; onaylı kare olmadan I2V yok.
- **IP katılığı (çift yönlü):** world seçildiyse çıktı O DÜNYA okunmalı (jenerik anime/3D kabul edilmez); AMA tanınabilir karakter adı/silüeti export'a sızmaz (telif firewall'u — `qa.test.ts` kanıtlı).
- **İKİ FIREWALL VAR, PROMPT YOLUNA GİREN HER YENİ METİN İKİSİNDEN DE GEÇER:** `protectedTermsIn` korumalı **KARAKTERİ** yakalar (Luffy/Eren/Gojo), `workTitlesIn` **ESERİ** (Spider-Verse/Arcane/Fury Road). **STÜDYO adı KALIR** (pipeline'a işaret eder), **ESER adı GİDER.** Kapı dört kez yeniden açıldı — dördüncüsü Mami'nin KENDİ serbest metniydi (`subject`/`location`/`recipeScenes`). **Yeni bir metin alanını brief'e/export'a bağlarken ÖNCE firewall'a bağla, sonra kabloyu çek.**
- **Mami'nin yazdığını ASLA sessizce yeniden yazma.** Referans nesri (site'in kendi verisi) *scrub* edilir; **Mami'nin cümlesi DURDURULUR ve terim ona söylenir.** Adı kesmek "Spider-Verse tarzında olsun"u "tarzında olsun"a çevirir — hem sakat hem hâlâ yanlış. O döngüde; bir cümleyle düzeltir.
- **EKSİK GERÇEK = DUR (FACT REQUIRED).** Metnin taşıyamadığı üç gerçek: **marka geometrisi** · **belirli bir yüz** · **dönem**. Kaynakta ve `brand_refs/`'te yoksa ajan UYDURMAZ — `FACT REQUIRED: <ne eksik>` yazıp DURUR.
- **Runner DOSYA ADINA değil KAPIYA bakar.** `production` bloğu olmayan paket (ör. Timeline'ın `_mamilas_command.json`'ı) reddedilir. Kapı **kendi sözünü tutar**: hata mesajı neyi sayıyorsa (frameGate · sceneIndex · folderContract · scaffold) kapı o alanlara *gerçekten* bakar — `production: {}` bir obje olduğu için eskiden geçiyordu, artık geçmiyor.
- **RUNNER MİMARİSİ (pazarlıksız — Mami evde Windows, ofiste Mac):** **mantık TEK dosyada** (`agents/runner.mjs`, Node; `agents/production/runner.mjs` bayt-bayt aynası, test kilitli), **yasa TEK dosyada** (`kick/<şerit>.md`), **launcher'lar İNCE KABUK** (`MOTION-CALISTIR.command` = zsh/macOS · `MOTION-CALISTIR.bat` = cmd/Windows; ikisi de çift tıklanabilir, ikisi de sadece `node runner.mjs` çağırır). **Launcher'a yasa YAZMA** — yazarsan yasa hiçbir şerit testinin okumadığı bir yerde yaşar ve iki platform sessizce ayrışır (`docsContract.test.ts` bunu kırmızıya çevirir). Paket **self-contained**: içine runner + kick/ + İKİ launcher girer.
- **YASANIN BİRİMİ DOSYA DEĞİL, ŞERİTTİR.** Üç şeridi tek `.command` dosyasında tutmak, "`brand_refs` dosyada 4 kez geçiyor" diye YEŞİL veren bir test üretti — dördü de Claude-TR şeridindeydi, Codex ve Antigravity şeritlerinde **sıfır**dı. Şerit başına dosya, şerit başına test.
- **Bir check ancak site'in KONTROL ETMEDİĞİ girdiye bakıyorsa KAPIDIR; kendi yazdığı string'e bakıyorsa AYNADIR.** Yeni test yazarken builder'ın KAYNAĞINA değil ÜRETİLEN PAKETE bak.
- **cinedna_* ref'leri kasten kompakt — DOKUNMA.** One Piece world → materialId 'none'.
- **"cinematic/dynamic/stunning/4K/epic" YASAK** — somut kamera fiili / ışık davranışı / grade dili.

## Araç parkı (BAŞKA araç önerme — detay: `/mamilas-studio`)
**YÜZEY ile MOTOR ayrı şeydir. Karıştırma.**

**Yüzeyler** (Mami'nin çalıştığı yer — motorlar bunların İÇİNDE koşar):
- **Magnific Spaces** (eski Freepik) — sonsuz node canvas, 79 model: Nano Banana Pro/2, Flux 2 Pro, Imagen 4, Seedream 4.5, Ideogram V3, GPT Image · video: Kling (O3'e kadar), Veo 3.1, Seedance, Wan, Sora 2.
- **Higgsfield** — 16+ video (Kling 3.0/2.6/o1, Seedance 2.0, Veo 3.1, Wan 2.7, Hailuo), 15+ image (Nano Banana Pro, FLUX, Seedream, GPT Image 2, Soul 2.0). **Mami'de sonsuz kredi → deneme lane'i burası.**
- Firefly vb. — aynı motorlar orada da var. **Yüzey Mami'nin seçimi; motor sözleşmesi yüzeye göre DEĞİŞMEZ.**

**Motorlar** (asıl üreten): image → **Nano Banana 2** (1K) · video → **Kling 3.0** final (PAID, 1080p verir), deneme Higgsfield'da. Müzik: **Suno**. VO: **ElevenLabs** (tek anlatıcı, ekranda kimse konuşmaz).
- **"Kling O3" ayrı motor DEĞİL**, reasoning tier. Motor otoritesi tek kaynak: `src/core/engine.ts`.
- **ZORUNLU UPSCALE ADIMI YOK.** Eskiden "Magnific'te upscale et" diye bir kural vardı — Magnific'i ayrı bir upscale aracı sanan bir yanlış anlamaydı, söküldü (2026-07-11).
- **Sora 2 kapanıyor** (API 2026-09-24'te biter) — üstüne bir şey kurma.

## Çalışma disiplini
- **Model:** Beyin = **Opus 4.8 (SABİT)** — Fable geri gelse de beyin Opus kalır (Fable targeted spec'te drift eder, üstelik 2× pahalı). Hedefli dünya/reçete = Opus, denetim + işçi/mekanik iş = **Sonnet 5** skeptik panel (mimari/kök-fix asla). **Fable = yalnız açık-uçlu yaratıcı** (3D UI/UX). Token: RTK (`rtk init -g`) + ccusage.
- **Görsel katman kuralı:** sadece UI/3D/görsel değişir; **fonksiyonel karar akışı (wizard→recipe→brief→export, decode/generateBatch) + tam test seti AYNEN korunur.** Mami screenshot'la steer eder ("build yeşil ≠ güzel").
- **Skiller (oturum başında yükle):** `mamilas-studio` (her zaman), `mamilas-gate` (commit öncesi), `mamilas-audit` (GERÇEK generateBatch çıktısıyla beyin denetimi — fixture değil), `mamilas-world` (world/ref yazımı), `mamilas-checkpoint` (crash-safe commit+memory). UI dokunuşu → `frontend-design`. Bug → `superpowers:systematic-debugging`. Yeni test/feature → `superpowers:test-driven-development`.
- **Doğrulama:** "vitest geçti ≠ doğrulandı." Cerrah/kalite bulguları FIXTURE'la değil gerçek üretim çıktısıyla test edilir; prompt kalitesi gerçek generateBatch'i GÖZLE okunarak (`scripts/prompt-bak.ts`) denetlenir.
- **ÖNCE FARKLI GÖZ (2026-07-11'de kanıtlandı):** büyük bir tura başlarken Claude ilk kazmayı vurmaz — **Codex `gpt-5.6-sol` derin taramayla önden mağaraya girer** (`codex exec --sandbox workspace-write -c model=gpt-5.6-sol -c model_reasoning_effort=high`), Claude arkasından. Gerekçe: Claude kendi yazdığı kodu kendi gözüyle okuyunca "yapı doğru" der ve **çıktıya bakmaz**; testler de yapıyı ölçtüğü için sessiz kalır. Codex'in bulduğu 4 kusurun hepsi bu sınıftandı (ref'ler kareyi değiştirmiyordu · her sahne aynı ışıkta · dünya-palet zıt emir · bölünen sahnede tek tarif). **Görev tarifi ÇIKTI seviyesinde verilir**: "kod kokusu değil, üretim gününde kötü kare üretecek kusuru bul; gerçek generateBatch'i KOŞ ve prompt'u GÖZLE oku." Codex'in usage'ı biter → görevi dar ve derin ver, task task böl.
- **Anti-halüsinasyon (Mami standing kuralı):** her iş parçasından sonra bağımsız review-ajanı (Sonnet) arkanı denetler. Bu kural bir telif deliğini yakaladı (`ecbcf7d`) — kendi işini kendin onaylama.
- **Yeni metin kaynağını prompt yoluna bağlarken ÖNCE firewall'dan geçir.** Ref anchor'ı enjekte edilirken "Apple" markası pozitif prompt'a sızdı; `proof.ts` kurgu karakterleri kapsıyordu ama GERÇEK TİCARİ MARKA sınıfı kör noktaydı (`scrubAnchorIP`).
- **Commit:** iş-parçası başına ayrı commit, `git add` ile SPESİFİK dosyalar (asla `-A`). **Push YOK** (Mami kararı). Termius her an kapanabilir → her anlamlı iş parçasından sonra `/mamilas-checkpoint`.
