---
name: project-mamilas-zeka-run-2026-07-23
description: "ZEKÂ RUNU task listesi — 23-ajan ordusuyla süzülmüş; clear sonrası öldürücü session buradan yürür. Kapı yeşil, 3 commit local."
metadata: 
  node_type: memory
  type: project
  originSessionId: 39cc714b-4d5e-41f6-9e63-c181380f8027
  modified: 2026-07-23T17:47:04.421Z
---

# ZEKÂ RUNU — clear sonrası öldürücü session (2026-07-23 gece hazırlandı)

**Giriş durumu:** Kapı YEŞİL (tsc0·vitest 2051/2051·build✓). 3 commit local (push yok).
Ordu (23 ajan, ultracode) haritayı çıkardı, doğrulama turu 4 iddiayı ÇÜRÜTTÜ (onlara iş YOK).
Standing order: [[mamilas-bul-sec-onar]] (BUL→Mami SEÇER→onar, körleme regex YASAK) +
[[mamilas-simulation-loop]] (fabrikayı değil kullananı sor) + [[mamilas-batch-mode-mandate]].

## KÖK BULGU — sistemde 2 zekâ hattı, bağlı değil

- **Hat A (site):** brain.ts/pure.ts, DNA_MAP(80 regex). `commandExport.ts:477` açıkça
  "prompts.image ÖNİZLEME TASLAĞI, motora gitmez" diyor; `buildImageAuthorContext` prompts.image'i
  ajana HİÇ vermiyor (grep doğrulandı). **DNA_MAP zekâsı motora ULAŞMIYOR** — iyi haber (kök hastalık
  büyük ölçüde devre-dışı), kötü haber: aynı kesme isNight/clock/paletteLight'ı da düşürüyor.
- **Hat B (ajan):** commandExport→worldPacket→CONTEXT.json→image-author.md→promptQuality.mined.json(17 madde).
  Ajanın gördüğü TEK zekâ kanalı budur.

## ÇÜRÜTÜLEN iddialar (İŞ YAPMA — doğrulama turu ölçümle çürüttü)

- ❌ "46 dünyanın çoğu medium maddesi almıyor" → ölçüldü, HEPSİ alıyor (8 grup, hepsi ANIMATION_/CINEMATIC_/COMMERCIAL_).
- ❌ "isAnimationWorld/isPhotorealWorld regex kırılgan" → world.group doğal dil değil, 8 sabit grup.
- ❌ "refDna anchor + per-shot camera düşüyor" → imageVantage sahne-başına context'te VAR, r.dna anchor taşıyor.
- ❌ "DNA_MAP ölü bakım borcu" → yarısı canlı yasa (FLAT_LIGHT_RE çalışıyor).
- ❌ "mined.json'a ekle sıfır risk" → mined.json `sceneContextHash`'e giriyor (mjs:826), uçuştaki command'leri STALE eder.

## TASK LİSTESİ (Mami seçer, sırayla)

### T1 — MÜDAHALE 1: isNight/clock kablosunu ajana bağla (EN YÜKSEK KALDIRAÇ)
- **Nerede:** `buildImageAuthorContext` (agentProtocol.ts) + byte-ikizi `mamilas-command.mjs` imageContext.
  `world.paletteAsLight`'ı sahne-gece-farkında üret: `paletteLightPrompt(palette, world, isNight)` —
  imza `commandExport.ts:175`'te ZATEN var. isNight/clockMap `brain.ts:1448`'de hesaplı, ajan sınırında düşüyor.
- **Kazanç:** Gece sahneleri gündüz paletiyle üretilip kendi kapısında fail etmesi biter.
- **KRİTİK:** `frame_jury` de gündüz paletine bakıyor → İKİSİ AYNI COMMIT'te. mjs ikizi aynı commit'te
  değişmezse tüm command "contextHash stale". Bu alan sceneContextHash'e girer → **`--migrate-command-context`
  ile taşı** (repoda VAR). ⚠️ "hash-dışı katman yap" önerisi REDDEDİLDİ — isNight karar-türevi, tamper-evident olmalı.
- Körleme yama: YOK (mevcut imza + mevcut clockMap yeniden kullanılıyor).

### T2 — MÜDAHALE 2: APPROVED.md kuluçkasını doldur (EN UCUZ, SIFIR HASH RİSKİ)
- **Nerede:** `agents/lessons/APPROVED.md` (bugün boş, 735B başlık). Kanal canlı `mjs:1118`, **hash-DIŞI**.
- Kanıtlı ama yazılmamış dersleri madde-formuna çevir (kaynak: `docs/superpowers/URETIM-TURU-2026-07-13.md`
  + [[mamilas-brain-intelligence-mined]] + [[mamilas-physical-medium-law]]): "render law FİZİKTEN yapılmışsa
  taşınır PROP'tan sızar", Türkçe metin kilidi, yapışık @-tag reddi, split a/b tek fikir.
- ⚠️ **ENGINE tablosu (2b) YAPMA/kuluçkada bırak:** ölçülmemiş image motorlarına "plastik-parlak" yazmak =
  ölçüm-dışı yasa uydurma (CLAUDE.md ihlali). Gerçek generateBatch çıktısı görülene kadar bekle.

### T3 — MÜDAHALE 3: madde-etki ölçümü için ÖN KOŞUL (ölç, sonra genişlet)
- **⚠️ EN ÖNEMLİ REGEX RİSKİ:** "her clause için APPLIED/SUPPRESSED say" OLDUĞU GİBİ uygulanırsa YASAK
  sınıfa girer — mined maddelerin stable id'si yok, suppressedContext serbest metin (59/59 unique),
  join için fuzzy/keyword eşleme gerekir = yeni keyword tablosu + sessizce yanlış sayan metrik.
- **Doğru sıra:** (1) önce mined.json maddelerine stable `id` + author suppressedContext'e `clauseId`
  (küçük sözleşme, hash-dışı tercih), (2) SONRA regex'siz kesin join. Ön koşul olmadan tek meşru hamle:
  **59 suppressedContext satırını GÖZLE oku** (aletsiz; zaten bulgu veriyor: 2D-medium yasası animation
  kovasında değil medium-gated olmalı). qaScore kaynak YAPILAMAZ (proof.ts:172-203 mined'e bakmıyor).

## MAMİ KARARI BEKLEYEN

1. **Fixture yöntemi retro:** bugün RENDER_LOCK_TAIL sabiti kullanıldı (batchResilience+directorSession).
   `commandRuntime.test.ts` aynı kuralı 8 yerde farklı metinle karşılıyor — birleştirilsin mi, kalsın mı?
2. **codex-69-prompts (25MB) kaderi:** sigortası alındı. git'e mi (LFS?) / sadece .gitignore mu?
   ⚠️ sadece .gitignore ZARARLI — `-fdx` ignored'ı da siler. Karar: kopya(yapıldı)→sonra git/gitignore.
3. **`--skip-image-jury` tamlığı:** `--import-frames` jürisiz kareyi hâlâ reddediyor (mjs:1471-1473);
   runner forward + PROTOCOL.md paragrafı + 2 test eksik. ⚠️ import'a options geçirmek KAPI GEVŞETMESİ
   (jürisiz kare import edilebilir olur) — ürün kararı, default "aç" olmamalı.
4. **Engine tablosu:** ölçülene kadar bekle (öneri).
5. **🔴 Açık üretim direktifi (dünkü):** "promptta kızı tarif etmek yok, @mira yeterli" — kimlik direktifi
   (`live-6582c96df5f2b9a4`) uzun paragraf tarif içeriyor. Zekâ runu kapsamına girsin mi? (Not: sahne-1
   promptu zaten @mira kullanıyor, tarif yok — pratikte sorun görünmüyor, ölç.)

## KÖRLEME YAMA / REGEX RİSKİ — açık yasak listesi (ordudan)

- validateImageRenderLock regex gevşet/keyword ekle → YASAK (yaşayan yasa, kendi testi commandRuntime:298).
- Fixture dünyasını 3D-olmayana çevir → YASAK (regresyonu gizler).
- Engine tablosuna ölçülmemiş "plastik-parlak" → YAPMA (ölçüm-dışı yasa).
- clause-etki sayımı stable-id olmadan → fuzzy keyword tablosu = ÖN KOŞUL şart.
- isNight'ı hash-dışı katmana koy → REDDET (migration kullan).
- Kırık kapıyı commit/baseline düşür → YASAK (gate.sh bloke eder zaten).
- **TEMİZ:** fixture'ı gerçek prompta benzet · isNight mevcut imzayla bağla · APPROVED.md doldur · stable-id+clauseId.

## HER MÜDAHALE SONRASI KAPI
`npx tsc --noEmit` → `npx vitest run` → `npm run build`. TS/mjs ikiz byte-parite ŞART
(agentsSync/commandRuntime/docsContract.test.ts zorlar). sceneContextHash'e giren her alan
uçuştaki command'leri stale eder → `--migrate-command-context`.

İlgili: [[mamilas-bul-sec-onar]] · [[mamilas-simulation-loop]] · [[mamilas-brain-intelligence-mined]] ·
[[mamilas-physical-medium-law]] · [[project-mamilas-command-onarim-2026-07-23]]
