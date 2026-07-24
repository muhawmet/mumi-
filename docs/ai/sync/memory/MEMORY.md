# MEMORY — MAMILAS

**Tavan: 200 satır / 25KB.** Aşarsa **sessizce kesilir**. Detay konu dosyalarına iner (açılışta
yüklenmez, bedava). Kanon `CLAUDE.md` → `docs/ai/PROJECT_CONTRACT.md`. Anlatı buraya YAZILMAZ.
Kapanan durum notları `memory/archive/`'e taşınır (silinmez).

## 🔴 AKTİF YÖN · 2026-07-24 — KONUŞMALI YÖNETMEN (regex-kill'in ÖNÜNDE)

- **Spec (ONAYLI, oku):** `docs/superpowers/specs/2026-07-24-conversational-director-design.md`.
- **Kanıtlı gerçek:** çok-ajanlı command/batch orkestrası HİÇ tam video üretmedi (Mami: "hiç 1 video
  yapamadık, hep hata"). Mami sessiz otomat değil, **konuştuğu yönetmen** istiyor + **en epik prompt**.
- **Karar:** "yönetmen ajan" = BİR KONUŞMA (bu spec'i üreten sohbet gibi). Beyin (worlds/refs/render-lock/
  mined yasalar/generateBatch) onu besler; kırılgan spawn-batch orkestrası kritik yoldan ÇIKAR (silinmez,
  arşiv/test kalır). İki değişmez: (1) jüri RAPOR değil TAMİR eder — inline, (2) storyboard TOPLU onay.
- **✅ KANITLANDI + SKILL KURULDU (2026-07-24, `8a94bc9`):** Mami'nin GERÇEK Kuvvet videosundan (58 sahne,
  Pixar 3D Edu, `@efe`) 4 start-frame prompt yazıldı → Mami **Magnific Spaces'te bastı, TUTTU** (@efe
  tutarlı, dünya okundu, palet ışık gibi). "güzel promptlar" = yeşil ışık. Konuşmalı yönetmen resmi skill:
  **`/yonetmen` = `mamilas-director`** (eski deprecated Pass A/B yeniden yazıldı). boot: hangi JSON sor→yükle ·
  epik NB2 prompt (@handle, pozitif, lens başta, 3 fizik, telif-temiz, inline jüri=tamir) · kare→Kling motion ·
  tempo sekans sekans · çıktı ayrı `.md` · öğrenme=precedent(yasa değil). Kapı yeşil (2056✓), parity birebir.
- **DERSLER (bu oturum):** JSON'daki `prompts.image` = STYLE SYSTEM + `[DIRECTOR TASK: Claude yazsın]`,
  BİTMİŞ prompt değil — yönetmenin işi o boşluğu doldurmak (CLI author-agent hiç dolduramadı). · Karakter =
  `@efe`/`@mira` handle, tarif YOK (Magnific ref bağlı). · Yüzey Magnific Spaces. · NB2: pozitif çerçeve,
  lens başta, @-ref. Kling: start frame çıpa, sadece değişen, DoP mantığı (Google+fal.ai temiz kaynak).
- **SIRADA (Mami seçer):** (1) `/yonetmen` test-drive → Kuvvet Intro sekansını (S1-6) uçtan uca bas ·
  (2) **command-orkestra sökme** (Mami istedi: makine+4 test+parity+launcher düzgün kalkar, kapı yeşil).
  Command JSON (siteden reçete) KALIR; sökülecek olan MAKİNE (`mamilas-command.mjs`+runner+jüri).
- **Not:** regex-kill (C1✅C2✅B1✅ · sırada B2) beklemede — bu yön öncelikli.

## DURUM · 2026-07-24 (resume) — 🧹 REGEX-KILL FAZ C+B (usage döndü, `artifacts/regex-kill/STATE.md`)

- **Onaylı operasyon:** motoru ince-kabuk yap, regex EKLEME YASAK (hepsi KALDIRMA). Sıra C1→C2→C3→B1→B2→
  A3→A1→A4→A5→A2. Her task: kök→kırmızı test→fix→yeşil→kapı→Opus denetçi→Mami commit kararı→/clear.
- **Bugün kapatıldı (hepsi push'lu, kapı+denetçi yeşil):** **C1** motionCadence IMAGE context'e (`bd53eb1`) ·
  **C2** refs undefined TS↔mjs hash paritesi (`a98a4c8`) · **B1** CARRY OVER yasası §7'de 1 kez + sahne-altı
  kısa işaretçi, ~40KB/69-sahne şişme gitti (`9865ce1`). **C3 ⏭️ WON'T-FIX** (Mami kararı: image engine-gate
  prefix-fallback bugünkü veriyle NO-OP — engine tam-id'yle anahtarlı, motion prefix'le; körleme no-op yazma).
- **SIRADA: B2** (prompt çift-yankı + NO-OP clause). Temiz `/clear`'lı ayrı oturumda başla. Baseline **2056**.
- **Ders:** her task öncesi gerçek `generateBatch` çıktısı üret (fixture değil); "şişme"/kalite kararlarını
  Mami SEÇSİN (AskUserQuestion) — [[mamilas-bul-sec-onar]]. C3'te no-op'u ölçüp durdum, körleme yamamadım.

## DURUM · 2026-07-24 — 🏁 BUL-ONAR + TEMİZLİK GÜNÜ (ofis, Codex usage bitik)

- **Kapı: tsc0 · vitest 2053/2053 · build✓.** Bugün 3 gerçek fix + launcher + memory temizliği.
- **🔴 KURAL DEĞİŞTİ (2026-07-24): artık PUSH YAPILIR.** Mami "giti de güncelle, private repo, evde de
  kullanacağım" dedi. Eski "PUSH YOK" iptal. Commit'ler `main`'e push'lanır (origin: github muhawmet/mumi-).
  CLAUDE.md güncellendi. → [[mamilas-push-serbest]].
- **Bugün kapatılan bug'lar (push'lu, `69da490`):**
  - **R1+R2+R5** — `--skip-image-jury` yalnız batch'te okunuyordu; import/export/resume yolları
    kırıktı. `sceneOptions` ortak scope'a çıkarıldı, 4 çağrıya bağlandı + exportImageBundle juryHash
    null-güvenli. "batch --skip-image-jury üret → --import-frames getir" akışı artık çalışıyor.
  - **R4** — `--import-frames` sahne-eşleştirme `/(\d+)/` ilk rakamı alıyordu ("2024-..-scene-5"→2024).
    scene-N belirteci + sondaki-rakam hedeflendi. Her ikisine kırmızı→yeşil test + garanti kapı.
  - **Launcher** — 4 dosya (`MOTION-CALISTIR.command/.bat` × agents + production) `codex`→`claude`.
    Codex usage 2026-07-30'a bitik; çift-tık artık Claude Yönetmen'i açar. CRLF korundu, parite geçti.
- **AÇIK bug'lar (denetim log: `artifacts/test-drive/DENETIM-LOG-2026-07-24.md`):** #2 gece-paleti
  çift-kök (pure.ts:506 isNight'sız + brain.ts:1443 Türkçe-`\b` markör ölü — `clockMap(["Ay ışığı.."])→day`),
  #3 motionCadence IMAGE context'te yok (agentProtocol.ts:478 sözleşme diyor, taşımıyor), R3 refs
  hash-drift (parite latent), B1 image engine-gate fallback yok. Sırada #2 (gece) — sceneContextHash'e
  girebilir → `--migrate-command-context` ölç.
- **EKSİK ZEKÂ (bugünkü Firefly dersleri mined.json'a girmemiş):** telif-temiz stil reçetesi,
  plastik/mat-cel yüzey yasası, image motor-farkı (GPT sistemde HİÇ tanınmıyor). ⚠️ ölçülmemiş motora
  madde=CLAUDE.md ihlali; önce ölç. → [[project-mamilas-nano-banana-kalite-2026-07-24]].
- **Devam eden analiz (arka plan):** 6-ajan bul-onar analizi (site-tarifi · final-brief · command-ajan-
  beyni · motor-uyumu · aptal-regex · gerçek-senaryo) — her biri skor + MAKRO öneri döndürür. Sonuç bekleniyor.

## GEÇMİŞ (tek satır — detay archive/'de)

- **07-16→07-23:** Windows/Codex restructure (yeni trunk = Decision Pipeline + command orkestra, eski
  Mac hattı superseded/yedekte). Brain M0-M7 · hard-fix run · tarif→command taraması (P1-P6 kapandı) ·
  07-23 command onarımı (4 duvar) + zekâ-run haritası. Hepsi `memory/archive/` + git geçmişinde.
- **Her oturum oku:** `CLAUDE.md` → `docs/ai/PROJECT_CONTRACT.md` (kanon) · `EXECUTION_STATE.md` (durum) ·
  `/mamilas-pipeline` skill · `.claude/rules/*.md`. Kod haritası → `/mamilas-map`. Büyük veri → `npm run workbench`.

## ÜRETİM DERSLERİ (Firefly kalite runı, 2026-07-24 — kanıtlı reçeteler)

- **One Piece (Toei-cel) telif-temiz reçetesi:** İSİM YOK ("One Piece/Elbaf/Oda" telif YER). Onun yerine
  Oda-abartılı-anatomi (dev omuz/kocaman el/ince bel) + abartılı-mimik (açık ağız/balon göz) + ayrı
  texture/render bloğu (flat cel, ONE hard shadow, NO gradient/gloss/hatching) + poster-doygun renk.
- **Rick&Morty:** isimsiz + "boiling wobble line, NEVER clean vector/SVG" → kusursuz. İsim EKLEMEK bozuyor.
- **GENEL:** stili ÇAĞIR, eseri DEĞİL. IP ismi = telif reddi + firewall ihlali. Kalıcı çözüm = stil-ref-IMAGE.
- **Motor seçimi:** GPT Image 2 = tek-kahraman/akıcı-dinamik/ruh + Türkçe metin. Nano Banana 2 = çok-kurallı/
  statik/worldPacket-sadık. "Efe" = özgün karakter (beyaz-form/Gear-5 enerjisi, telif-temiz).

## BACKLOG (yapı-bağımsız, üretim tarafı)

- **Premiere Pass C** — kurgu planı çıktısı (kesme sırası + VO/müzik). Talimat listesi, timeline değil.
- **Kling native audio** — SFX tek geçişte. Yasa: "patlama sesi" değil **fiziğini** yaz. VO ElevenLabs.
- **Kling Element Reference** — kareye yüz/kıyafet element bağlanınca morph biter. Kullanılmıyor.
- **Fiziksel medyum taraması** — bekleyen 5: jjk_mappa · naruto_shinobi · solo_leveling · bleach · invincible.
- **Detay Yasası** — her sahne 3 fizik detayı (çevresel baskı + mikro-aksiyon + ses/görsel çıpa).
- **Lens pozisyonu** — kamera talimatı promptun BAŞINDA daha iyi okunuyor (NB2 sayısal lens'i KULLANIR).

## Index

- [[precedent-pixar-edu-akilli-tahta]] — 🎬 SÜRTÜNME işi precedent: pixar_3d_edu sınıf sahnesi = AKILLI TAHTA (özel okul), asla kara tahta. Aynı dünya/ref'te SUN.
- [[project-mamilas-nano-banana-kalite-2026-07-24]] — 🔴 EN GÜNCEL: Firefly kalite runı reçeteleri
  (One Piece telif-temiz, Rick&Morty isimsiz, motor seçimi GPT vs Nano, "Efe" karakter DNA'sı).
- [[project-mamilas-zeka-run-2026-07-23]] — ZEKÂ RUNU task listesi (T1 isNight-kablo bugün #2 olarak
  denetimde doğrulandı · T2 APPROVED.md · T3 ölçüm-önkoşul). Kısmen bugüne taşındı.
- [[project-mamilas-tarif-command-scan]] — 07-19 tarif→command taraması: P1-P6 kapandı, P8/P14 Mami-karar bekliyor.
- [[mamilas-fullscan3-2026-07-16]] — üçüncü tam tarama 78/100; UI borçları + 4 Mami-karar maddesi (kısmen eskidi).

- [[mamilas-bul-sec-onar]] — 🔴 STANDING ORDER: BUL → Mami SEÇER → onar. Körleme yama + yeni regex/keyword YASAK.
- [[mamilas-simulation-loop]] — 🔴 STANDING ORDER: fabrikayı değil, onu KULLANAN ajana sor.
- [[mamilas-batch-mode-mandate]] — 🔴 default TOPLU mod + istisna-listesi verdict. Üretim hattına dokununca oku.
- [[mamilas-mami-is-in-the-loop]] — aşırı mühendislik tuzağı: "Mami bir cümleyle düzeltir mi?"

- [[mamilas-kling3-text-trick]] — 🔴 Kling 3.0 baked-in yazı tricki: push-in/zoom yazıyı baştan yaratır→morph; yazıyı dönüştüren kamera yazma.
- [[mamilas-brain-intelligence-mined]] — madenlenmiş prompt-yazma yasaları → ajan beyinlerine somut kısıt.
- [[mamilas-physical-medium-law]] — "2D plastik"in cevabı: üslup değil **FİZİKSEL MALZEME**.
- [[mamilas-tr-text-and-cast-locks]] — Türkçe-metin + Türk/Anadolu cast kilitleri.
- [[mamilas-magnific-char-refs]] — tekrar eden karakterler @-handle ile geçer.
- [[mamilas-generation-routine]] — Mami'nin gerçek üretim rutini + klip ekonomisi.
- [[mamilas-3d-shell-progress]] — 3D golden-hour kabuğu + dokunulmaz sahne kuralları.
- [[mamilas-disclaimer-does-not-work]] — feragatname okunmuyor; yasa koşullu yazılır.

- [[mamilas-context-economy]] — loop'un mekanik sebebi + üç duvar (mekanizma 07-24 güncellendi).
- [[mamilas-test-suite-is-hollow]] — testlerin çoğu hiçbir şeyi korumuyor; mutasyonla ölçüldü.
- [[mamilas-getbylabel-turkish-trap]] — e2e `getByLabel` Türkçe'de tutmuyor; koşturulmamış test = kırık.
- [[mamilas-external-research-2026-07]] — dış araştırma (per-shot alan ayrıştırması); kanon değil, çapraz-kontrol.
