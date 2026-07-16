# BRAIN-M4 — Image Author + Image Jury zekâsı (KUSUR-D, promptQuality kontratı)

**Tarih:** 2026-07-16 · **Uygulayıcı:** Claude Opus 4.8 (1M) · **Denetçi:** Codex `gpt-5.6-sol` high
**Plan:** Task M4 · **Spec:** §2c — madenlenmiş yasa = kontrat maddesi = testlenebilir; evrensel kilit değil.

## Ne yapıldı

- **Tek kanon maden dosyası:** `agents/promptQuality.mined.json` — 2D-plastik/medium-split · detay
  üçlüsü · self-contained · half-a-second-before · banned-empties · palet-rejim(duotone) ·
  anti-sheen counter-terms · NB2 sayısal-lens grameri. Kaynak: `[[mamilas-brain-intelligence-mined]]`.
- **`buildImagePromptQualityContract(world, imageModel)`** — dünya-grubu (ANIMATION/STYLIZED vs
  REAL/CINEMATIC/COMMERCIAL) + engine'e göre kontrat üretir; statik çekirdek korunur, madenler
  eklenir. TS (`agentProtocol.ts`) ve runner (`mamilas-command.mjs`) AYNI JSON'dan okur; byte-parite
  testi kilitli (`__testBuildImagePromptQualityContract`). Kontrat sceneContextHash'in parçası —
  drift her command'i stale eder (hash kapısı).
- **Override = AJAN muhakemesi (`overridePolicy`).** İlk tasarım keyword-suppression'dı; **Sol
  kritik: kod polarite bilemez** ("yarım saniye önce patlama olsun" maddeyi İSTEYEN direktif ama
  keyword onu kapatırdı). Suppression koddan tamamen söküldü: Author çatışan maddeyi
  `suppressedContext`e yazar, Jury APPLIED direktifle çatışan maddeyi enforce etmez, dayanaksız
  suppression (madde VEYA direktif) exact failing check. Role kartları bu disiplini taşıyor.
- **Migration sıkılaştırma (Sol kritik #2):** `migrateCommandToCurrentContext` artık storyboardHash'i
  YENİDEN MÜHÜRLEMEZ — scenes'le doğrular, uyuşmazsa REDDeder ("tamper migration'la
  meşrulaştırılamaz"). Tamper testi eklendi; eski test yeni yasaya taşındı (silinmedi).
- Yeni test: `src/core/promptQuality.test.ts` (10 test — kontrat maddeleri, exact sıra, determinizm,
  TS↔runner byte-parite, overridePolicy).

## Gerçek çıktı — `M4-REAL-OUTPUT.md` + `M3-M4-runner-evidence/`

- Aynı karar → commandId değişmedi (`mamilas-ce4a0f77…`) ama contextHash değişti (kontrat context'in
  parçası; eski workspace doğal stale). Gerçek context: one_piece_toei + NB2 için 8 requiredEvidence
  / 7 rejectIf + overridePolicy.
- Yeni kontrata tam uyumlu gerçek image_author artifact'i runner'dan geçti (contentHash `2dac9951…`,
  sonraki adım image_jury r0): sayısal lens erken · detay üçlüsü · 2D-medium split · palet-rejim ·
  continuity sıfırdan · half-a-second kapanışı · sıfır banned-empty.
- Kanıtlar repo'da kalıcı: `M3-M4-runner-evidence/` (README ile tarihli-anlık-görüntü uyarısı).

## Sol denetim geçmişi

- Tur 1 REJECT: (a) override ters-polarite — **kapatıldı** (suppression → ajan muhakemesi);
  (b) migration storyboard resealing — **kapatıldı** (verify + tamper testi). P2'ler: parite testi
  eklendi, determinism/sıra sıkıldı, evidence repo'ya alındı.
- Tur 2 bulguları ve karşılıkları:
  - *"Directive SUPPRESSED işaretlenebiliyor, jüri saymıyor"* → jüri kartına eklendi: direktif
    suppression'ı yalnız adlandırılmış sert ürün duvarıyla (IP firewall / frame gate / eksik gerçek)
    meşru; dayanaksızsa exact failing check. (Store'da hard-block KURULMADI — SUPPRESSED meşru
    vakası var; hüküm jüri katmanında.)
  - *"Migration'la worldPacket/motionEngine tamper contextHash'e girebilir"* → **P2/ledger, gerekçe:**
    tehdit modeli Mami'nin kendi diskindeki kendi dosyası; worldPacket baseDecision-hash'inin dışında
    yaşadığı için bu vektör migration'dan bağımsız pre-existing bir sınırdır (elle contextHash yazan
    aynı baypası migration'sız da yapar). Kalıcı çözüm (worldPacket'i karar kimliğine bağlamak veya
    migration'da DATA'dan yeniden türetmek) M6 QA hardening adayı.
  - *"Parite testi tek vaka + exact sıra tüm mined diziyi kilitlemiyor"* → P2 ledger (M6 regresyon
    matrisi genişletir).

### P2 ledger (post'ta)

- Statik çekirdek kontrat hâlâ iki dosyada kopya (drift'i hash kapısı yakalar; tek-kanonlaştırma M6).
- Parite testini çok-vaka matrisine genişlet (photoreal dünya + engine'siz + boş dünya).
- worldPacket/motionEngine'i karar-türetilebilir kılma veya migration'da yeniden türetme (yukarıda).

## Kapı (gerçek çıktı)

- `npx tsc --noEmit` → **0 hata**
- `rtk proxy npx vitest run` → **1927/1927 · 71 dosya** (M3: 1917/70 — arttı)
- `npm run build` → **OK** · `node --check scripts/mamilas-command.mjs` → OK

**Mami göz bekliyor:** kontrat maddelerinin (özellikle 2D-medium split) kare üzerinde işlediği hükmü
gerçek kareyle Mami'nin. Prompt `M4-REAL-OUTPUT.md`'de motora elle verilmeye hazır.

## Dosyalar

- `agents/promptQuality.mined.json` (yeni — tek kanon)
- `src/core/agentProtocol.ts` — buildImagePromptQualityContract + overridePolicy
- `scripts/mamilas-command.mjs` — aynı üretici + migration verify + test-only parite export
- `agents/roles/image-author.md` · `agents/roles/image-jury.md` — maden zekâsı + override disiplini
- `src/core/promptQuality.test.ts` (yeni) · `src/core/commandRuntime.test.ts` (migration testleri)
- `artifacts/decision-pipeline-implementation/M4-REAL-OUTPUT.md` + `M3-M4-runner-evidence/`
