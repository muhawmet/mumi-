# BRAIN-M5 — Motion Author + Motion Jury zekâsı (Physics-First, frame-gated)

**Tarih:** 2026-07-16 · **Uygulayıcı:** Claude Opus 4.8 (1M) · **Denetçi:** Codex `gpt-5.6-sol` high (aşağıda)
**Plan:** Task M5 · **Kaynak zekâ:** `[[mamilas-brain-intelligence-mined]]` MOTION bölümü.

## Ne yapıldı

- **Quoted-source tetikleyici gap'i — Sol düzeltmeli final tasarım:** İlk fix alıntıyı KOD ile
  klingScrub'lıyordu; **Sol P1: kör silme anlamı katlediyor** ("the seed and above the soil,
  growth.") ve "kullanıcının cümlesini sessizce scrub etme" yasasını çiğniyor. Final: alıntı
  **VERBATIM** kalır (brief kaynak sadakati taşır) + etikete açık emir eklendi (*"i2v trigger words
  inside this quote must NOT survive into the final motion prompt"*) — temizlik AJANIN final yazım
  işi, motionQuality kontratı + jüri kartı zorlar/ölçer. qa.ts prompt_surgeon lint'i SOURCE-etiketli
  alıntıyı tetikleyici taramasından muaf tutar (NEGATIVE/Engine-grammar muafiyet deseniyle aynı);
  alıntı DIŞI tetikleyici hâlâ kırmızı. Test yeni tasarımı kilitler.
- **`buildMotionPromptQualityContract(videoModel)`** — mined JSON'a `motionUniversal` +
  `motionEngine.kling_3` bölümleri: Physics-First (kütle/kadans dili zorunlu; çıplak pan/zoom/dolly
  rejectIf) · frame-inventory (yalnız APPROVE karede görünen) · tek-hareket yasası · still-lips /
  no-dialogue-ever (VO ayrı ElevenLabs katmanı) · Kling native-audio SFX omurgası (2-4 diegetik ses,
  sesin ADI değil FİZİĞİ). TS + runner aynı JSON'dan; byte-parite testi kilitli. `overridePolicy`
  motion kontratında da (suppression ajan muhakemesi — M4 dersi).
- **Context'ler:** `buildMotionAuthorContext` (TS) + runner motion_author/motion_jury context'lerine
  `motionQuality` girdi.
- **Role kartları** derinleşti: motion-author (fizik dili, SFX fiziği, scrub-her-satıra, override
  görünürlüğü) + motion-jury (her madde exact failing check; kareyi kendisi açar; quoted-source
  tetikleyici taraması; dayanaksız suppression failing check).
- Yeni test: `src/core/motionQuality.test.ts` (7 test — TDD, önce kırmızı).

## Sol denetimi (tur 1 REJECT) — karşılıklar

1. **P1 scrub anlam kaybı** → yukarıda: verbatim + etiket + ajan-katmanı + surgeon muafiyeti.
2. **P1 motion artifact kontrat ihlali** (inventory "nesne yok" derken prompt kamera/operatör/kumaş
   icat ediyordu) → artifact kontrata gerçekten uyan haliyle yeniden yazıldı ve runner'dan yeniden
   geçirildi (contentHash `bd9c27a0…`): hareket yalnız inventory'deki mavi alanın kendi ışık-değeri
   davranışı; ses fiziği kadraj-içi (kapalı mekân hava basıncı + room-tone swell).
3. **P2 engine fallback** → motionEngine anahtarı `kling` ailesine alındı; test kling_3/kling_o3/
   kling_3_turbo/kling hepsini + kling-dışı negatif vakayı kilitler; parite testi çok-vaka oldu
   (kling_3/kling_o3/runway_gen4/undefined).
4. **P2 override alan tutarlılığı + still-lips çelişkisi** → motion-author kartı netleşti: motion
   şemasında suppressedContext yok, görünürlük kanalı `risks` (aynı disiplin, aynı jüri kontrolü);
   still-lips de default'tur — yalnız açık Mami direktifi kaldırır ve risks'te adlandırılır.
5. **"Tam zincir bağımsız doğrulanamıyor"** → evidence genişletildi: m5-image-jury-r0.json +
   m5-frame-receipt.json + m5-frame1.png (gerçek piksel) repo'da.


## Sol birleşik tur (M5+M6+M7) — karşılıklar

- **P1 "frame-jury PASS'i kendi kartını ihlal ediyor"** → kanıt zinciri DÜRÜST yeniden kuruldu:
  meşru denizci prompt'u + meşru image_jury PASS + gerçek plate import + frame_jury **FACT_REQUIRED**
  ("kare vaadi taşımıyor") → runner motion'ı AÇMADI ve nedeni aynen taşıdı. Bu, frame-gate'in
  koruduğunun asıl kanıtı: akış testi bile sahte PASS ile geçemez. Evidence:
  `m5-frame-jury-r0-FACT_REQUIRED.json` (README'de düzeltme notu).
- **P1 "motion inventory ihlali sürüyor"** → uyumsuz motion artifact'i evidence'tan KALDIRILDI;
  gerçek motion artifact'i Mami'nin gerçek karesi geldiğinde üretilecek (motion şema/doğrulama
  birim testlerle zaten kilitli — 1953 süiti). "Kontrata tam uyum" iddiası geri çekildi.
- **P2 "VERBATIM byte-anlamda değil (SRC_LINE \s+→space)"** → doğru; SRC_LINE normalizasyonu
  M3-öncesi mevcut davranış (FIX-6), M5 değişikliği değil — receipt dili "satır-normalize verbatim"
  olarak okunmalı. Ledger.
- **P2 `[^"]*` muafiyet regex'i kaynakta çift tırnak varsa bozulur** → ledger (kaynakta " nadire;
  bozulursa lint yalnızca daha SIKI davranır — güvenli taraf).

## Gerçek çıktı — frame-gated tam zincir (runner CLI)

Final (Sol sonrası) zincir: image_author r0 (beat'e sadık, kontrata uyumlu) → image_jury r0
meşru PASS → gerçek PNG import (1280×720, sharp decode) + APPROVE → **frame_jury r0 FACT_REQUIRED**
(kare vaadi taşımıyor — dürüst verdict) → **runner motion'ı açmadı** (gate kanıtı). Motion
şema/doğrulama/kontrat birim testlerle kilitli; gerçek motion artifact'i gerçek Mami karesini bekler.
Kanıt: `M3-M4-runner-evidence/m5-*` dosyaları.

**Dürüstlük notu:** akış karesi düz-renk test plate'idir (zincir/gate kanıtı) — **estetik hüküm ve
gerçek üretim karesi Mami'nindir; Mami göz bekliyor.**

## Kapı (gerçek çıktı)

- `npx tsc --noEmit` → **0** · `rtk proxy npx vitest run` → **1934/1934 · 72 dosya** (M4: 1927/71)
- `npm run build` → OK · `node --check scripts/mamilas-command.mjs` → OK

## Dosyalar

- `agents/promptQuality.mined.json` — motionUniversal + motionEngine.kling_3
- `src/core/agentProtocol.ts` — buildMotionPromptQualityContract + motion context
- `src/core/brain.ts` — quoted-source verbatim + tetikleyici emri etiketi
- `src/core/qa.ts` — surgeon SOURCE-alıntı muafiyeti
- `scripts/mamilas-command.mjs` — motion kontratı + context'ler + test-export
- `agents/roles/motion-author.md` · `agents/roles/motion-jury.md`
- `src/core/motionQuality.test.ts` (yeni)
