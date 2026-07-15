# MAMILAS — AI Creative Director Arsenal + Neuron Sync (Tasarım)

**Tarih:** 2026-07-04 · **Dal:** feat/3d-diorama-shell · **Sahip:** Mami · **Beyin:** Opus 4.8 (Fable dönünce Fable 5) · **İşçi:** Sonnet 5 ajanlar
**Deadline:** Pazartesi 2026-07-06 gerçek video günü.

## Vizyon
`SURGERY_DATA.json` kütüphanesini (30 world · 99 ref · 12 palette) bir **AI creative director'ın cephaneliğine** çevir. Her giriş **uzman seviyesi** (gerçek sinefil + otaku), **SIFIR generic bullshit**. Ve bu içerik **`.command` beynine NÖRON GİBİ bağlanacak** — audit'in yakaladığı "ref DNA prompt'a sızmıyor" kopukluğu bitecek; kütüphanenin her katmanı final prompt'ta OKUNUR olacak.

## Neden (audit bulguları, doğrulandı)
- Keyword→konsept bankaları (STY/REAL/EDU) yanlış konsept ateşliyor (koya→dedektif, an→café). ÇÖP KAYNAĞI. Kazınacak.
- Ref DNA (`akira neon impact: ribbon arc, breath rhythm...`) kompakt virgül-listesi; sahne prompt'una GİRMİYOR (Ref-DNA 5/10).
- Palet fiziği çelişkili (`shadows read as near-black warm burnt orange`) — hexToLightWords bozuk.

## Referans anatomisi (Higgsfield vb. araştırmadan, 7 katman + negative)
`Medium/Çağ · İsim-Çapa · İmza Işık · Renk/Grade · Lens/Optik · Doku/Render · Kompozisyon+Kamera imzası · NEGATIVE LOCK`
Kural: **İSİM + TARİF birlikte.** İsim modelin latent bilgisini ateşler, direktifler kilitler. Sadece "Deakins" zayıf. "cinematic/dynamic/stunning/4K" YASAK — yerine somut kamera fiili, ışık davranışı, grade dili.

## Alan haritası (kod uyumu için alan ADLARI değişmez, İÇERİK dünya sınıfı olur)
**WORLD (30):** `render_law`=medium/çağ + kompozisyon imzası · `line_grammar` · `lens_grammar`=lens/optik · `light_law`=imza ışık · `palette_lock`=renk/grade · `motion_cadence`=kamera imzası · `negative_lock`=NEGATIVE · `example_injection`=altın örnek · `one_liner`=vurucu öz. Her biri o stilin GERÇEK imzasını taşır (Demon Slayer=ufotable su-nefesi compositing; One Piece=Toei frog-eye gök draması; Deakins=motive-pratik + negative fill).
**REF (99):** `dna`=tam 7-katman çalıştırılabilir direktif · `anchor`=tek-satır prompt-enjeksiyon distilasyonu · `use`=bu ref NE katıyor (keskin) · `avoid`=negative lock (IP/isim/kostüm). `id/name/cat/worldId/preview` sabit.
**PALETTE (12):** `bias`=uzman fiziksel-ışık direktifi, ton slotu başına (shadow/mid/highlight/accent = ışık davranışı + mood + kullanım). `hex` sabit; `native_world` dokunulmaz.

## NÖRON SYNC (kritik — içerik kadar önemli)
1. **Bankalar kazınır:** `conceptRanked`/`primeConcept`/`architectureFallbackConcept` + STY/REAL/EDU konsept seçimi sökülür.
2. **Özne = Mami** (reçetede), **Motion = özneden türetilir** (tek-olay, FRAME-AWARE korunur).
3. **`buildImagePrompt` tüm katmanları prompt'a örer:** world render_law + line/lens/light + **ref dna direktifi + ref anchor** + **palet-olarak-ışık**. Her katman `.command` çıktısında görünür.
4. **Dünya birincil, ref = üstüne katman** (çatışmada dünya kazanır), **sahne başına tek ref**.
5. **Uçtan uca kanıt:** gerçek `generateBatch` çıktısında her katman okunur olmalı (fixture değil).

## Motor ekosistemi — HUB-FARKINDA üretim (temel karar, 2026-07-04)
Mami TÜM motorlara sınırsız erişir (memory [[reference-target-engines]]). Engine tek hedef değil; iki hub:
- **Higgsfield** (15+ model + **Cinema Studio** optik kamera + **Soul ID** karakter kilidi) — `lens_grammar`/`motion_cadence` → Cinema Studio param'ları (gövde/lens/focal + stacked move). Karakter tutarlılığı → Soul ID.
- **Magnific Spaces** (node canvas + batch + **zorunlu upscale**) — pipeline node grafiği; Nano Banana 2 çıktısı → Magnific fidelity upscale → Higgsfield motion.
- Default: **Nano Banana 2** (image; asset/özne/stil/metin/AR + negative), **Kling 3.0** (kontrollü/sekans) veya **Seedance 2.0** (karmaşık aksiyon, ≤15sn) motion.
`.command` bu hub'lara göre engine-aware blok üretir; kamera direktifleri serbest metin değil Cinema Studio girdisi gibi yazılır.

## Süreç + kalite kapısı (ÇOK ÇOK İYİ denetle)
- Ajanlar **ÖNERİ üretir** → `docs/library-rewrite/*.json` (SURGERY_DATA'ya DOKUNMAZ). Opus grep + gerçek-çıktı ile denetler (geçmişte ajan yanlız pozitif verdi — her bulgu doğrulanır).
- Entegrasyon TDD ile; her adımda gate YEŞİL: tsc 0 · vitest · build · .command syntax · workbench Surgeon 0 FAIL.
- Generic tarama: "cinematic/dynamic/stunning/4K/epic" sızarsa RED.

## Rollout
Wave 1: flagship'ler (bar'ı kilitle — 6 world + 12 flagship ref + 12 palette). → Opus review → Mami onay.
Wave 2: kalan 24 world + 87 ref. → review.
Wiring: banka söküm + buildImagePrompt neuron threading (TDD). → heavy multi-agent review.
Sonra: UI (T6 Yönetmen+QA → T7 main merge).
