# MAMILAS Decision Pipeline — EXECUTION STATE

> **➡️ AKTİF PLAN (VSCode/Mac, 2026-07-16):** Beyin katmanı inşası — anlama fazı BİTTİ, plan HAZIR.
> **✅ M0 TAMAM (2026-07-16):** baseline yeşil mühürlendi (tsc 0 · vitest 1896/1896 (67 dosya) · build OK),
> iki .bat CRLF fix commit `d366231` + push origin/main. Receipt: `receipts/BRAIN-M0.md`.
> **✅ M1 TAMAM (2026-07-16):** KUSUR-B kapandı — kanon `agents/roles/studio/*.md` + `agents/manifest.json`;
> `scripts/agents-sync.mjs` generator + `--check` drift kırmızısı; 12 `.claude/.codex` dosyası GENERATED;
> 5 parity testi (2'si builder'dan bağımsız). Sol denetimi: kritik 0, P2'nin en önemlisi (test-oracle) hemen
> kapatıldı, 3 ikincil ledger'da. Kapı: tsc 0 · vitest 1901/1901 (68 dosya) · build OK. Receipt: `receipts/BRAIN-M1.md`.
> **✅ M2 TAMAM (2026-07-16):** KUSUR-C kapandı — `splitRenderLawPhysics` envanter/fizik ayrımı;
> 5/46 dünya etkilendi (one_piece/naruto/bleach/cyberpunk/claymation envanter cümleleri →
> vocabularyExamples, fizik verbatim); deakins kontrol kolu byte-değişmedi. Sol #1 KRİTİK bulgusu
> (vocabularyExamples role context'ine girmiyordu — görünmez kanal) aynı task'ta kapatıldı +
> test kilitledi. Gerçek A/B: `M2-AB-image-author.md` (iki gerçek buildCommandJSON + role-kartlı
> iki final prompt; kare hükmü Mami'de). Sol'un Synthwave false-negative iddiası reddedildi
> (cümleler ışık/silüet davranışı — gerekçe receipt'te). 4 P2 ledger'da (Naruto/Bleach
> mekân-kimliği kare A/B'si dahil). Kapı: tsc 0 · vitest 1908/1908 (69 dosya) · build OK.
> Receipt: `receipts/BRAIN-M2.md`.
> **Mami yetkisi:** commit/push serbest ("körleme sana güveniyorum") — her kapı yeşilken task-sonu ritüelinde.
> **Mami (Sol denetimleri için):** "kelimelere takılmayın, kritik değilse post'ta fixleriz."
> **✅ M3 TAMAM (2026-07-16):** KUSUR-A kapandı — `exactSourceBeat` + `AGENT_AUTHORED` dürüst adlandırma;
> `interpretation {dominantSubject, singleEvent, frozenInstant}` zorunlu şeffaf receipt (iki yüzeyde tek yasa);
> onay kapısı YOK (lifecycle değişmedi). Gerçek runner zinciri kanıtı: approve→r0→jury REJECT→r1→PASS→
> AWAIT_FRAME→LIVE_CHAT (yeni commandId) — `M3-REAL-FLOW.md`. Sol 2 kritik buldu, aynı turda kapatıldı:
> v10 store migration + needsV6Migration yanlış tetiği (vault-restore sahne silme — pre-existing veri kaybı).
> Sol final PASS. Kapı: tsc 0 · vitest 1917/1917 (70 dosya) · build OK. Receipt: `receipts/BRAIN-M3.md`.
> **Mami (oturum içi, 2026-07-16): "clear'sız devam, bütün M'leri bitir, güveniyorum — her M sonunda Sol'a
> kontrol ettir."** M4→M7 aynı oturumda sürüyor; kare hükmü gerektiren her nokta receipt'te "Mami göz
> bekliyor" olarak işaretli.
>
> **Aktif task: M4 (Image Author + Jury zekâsı — promptQuality kontratı + madenlenmiş yasalar).** Önce oku:
> 1. `docs/superpowers/specs/2026-07-16-mamilas-brain-layer-design.md` (tasarım + 5 değişmez ürün yasası)
> 2. `docs/superpowers/plans/2026-07-16-mamilas-brain-layer.md` (M0→M6 plan + /clear kickoff metni)
> 3. Memory: `[[mamilas-brain-intelligence-mined]]` + `[[mamilas-external-research-2026-07]]`
> Sıra: **M0 baseline → M1 canonical → M2 prop/fizik → M3 şeffaf-yorum → M4 Image → M5 Motion → M6 QA
> → M7 ders bankası.**
> Denetim geçmişi: Sol 5.6 high "otomatik-ayrıştırma"yı reddetti (doğru); Sol'un "ayrı onay fazı" önerisini
> de **Mami reddetti** (2026-07-16): onay bürokrasisi YOK — ajan tam paketi kesintisiz üretir, yorumunu
> şeffaf `interpretation` receipt'iyle bırakır; Mami ilk görselleri üretip doğal dille müdahale eder.
> M7 = Mami isteği: biten projelerin closeout dersleri → Mami-onaylı ders bankası → sonraki proje context'i.
> DEĞİŞMEZ: API YOK · Mami HER ZAMAN loop'ta ama onay bürokrasisi YOK · site tarif eder/ajan yazar ·
> madenlenmiş ders evrensel kilit DEĞİL. Baseline yeşil (tsc 0 · vitest 1896/1896); iki .bat CRLF + sharp
> çalışma ağacında, M0'da Mami onayıyla commit. PUSH YOK.
>
> **Eski handoff (arşiv):** `HANDOFF-MACRO-9-AGENT-BRAINS.md` — durum tespiti doğru, ama çözüm planı bu
> spec+plan'la güncellendi (Sol denetimi sonrası).


## THREE-PHASE RESET — 2026-07-15 (CURRENT AUTHORITY)

Mami deleted the previous long-running goal. Do not auto-continue or declare the old Macro chain
complete. New work is split into three focused goals defined in:

`artifacts/decision-pipeline-implementation/MAMILAS-THREE-PHASE-COMPLETION-MAP.md`

Closure order: **Phase 1 Decision Core & Creative Library → Phase 2 Studio Application/UX/Evidence
State → Phase 3 Command & Manual Production Runtime → Final Convergence & Delivery**. Sol has high
architectural freedom inside the immutable product result: it may improve ideas, make reversible
experiments and coordinate bounded internal agents without micro approval. Each builder phase writes a
receipt, then one fresh independent auditor writes a report. Only critical regressions are repaired
immediately; the final convergence session closes the combined secondary ledger. Older Macro sections
below are historical evidence and cannot override this reset.

Current checkpoint: **THREE PHASES COMPLETE + FINAL CONVERGENCE DELIVERED — 2026-07-15.**

- Phase 1 receipt/audit: `PHASE-1-CORE.md` + `PHASE-1-AUDIT.md` → **PASS**.
- Phase 2 receipt/audit: `PHASE-2-STUDIO.md` + `PHASE-2-AUDIT.md` → **PASS**.
- Phase 3 receipt/audit: `PHASE-3-COMMAND.md` + `PHASE-3-AUDIT.md` → **PASS**.
- Final ledger: `FINAL-CONVERGENCE-LEDGER.md`; açık kritik bulgu **0**, tek kabul edilmiş debt ana
  bundle performans uyarısıdır.
- Final gates: TypeScript PASS; full Vitest **67 dosya · 1888/1888**; production build PASS; full
  Playwright **15/15**; runtime/runner syntax PASS; runner mirrors byte-identical; gerçek
  `inspect-brief` temsilî iki vaka contract PASS.

Canonical manual lifecycle artık şudur:
`Studio decision → pre-author command → ayrı storyboard approval → Image Author/Jury → validated
command+artifact bundle → Studio → gerçek fully-decoded frame + Mami APPROVE → Frame Jury → Motion
Author/Jury`.

Yeni phase/task otomatik başlatma. Mevcut receipts ve dirty-worktree korunur; commit/push Mami'nin
ayrı kararıdır. Dürüst ürün durumu: **implementation complete / visual validation pending** — gerçek
yaratıcı frame estetik hükmü yalnız Mami'nindir.

## CODEX 5.6 SOL TAKEOVER — 2026-07-15

### Codex baseline audit + post-Claude snapshot — 2026-07-15 13:06

- Salt-okunur audit tamamlandı: `CODEX-BASELINE-AUDIT.md`.
- Verdict: Macro 2/4/5 çekirdeği KEEP; kaynak→otomatik yazı, site→prompt sınırı, seçili-palette
  pack drift'i ve Macro 8 browser evidence'i CHANGE; Macro 9 protocol/artifact/command zinciri eksik.
- Post-Claude snapshot (ilk kod mutasyonundan önce):
  `C:\Users\mamya\Desktop\MAMILAS-BACKUPS\CODEX-POST-CLAUDE-20260715-130558\MAMILAS-POST-CLAUDE-20260715-130558.zip`
- ZIP SHA-256: `9dc8fcab894474bfe4b4c0ea81d52fdba3725a99fc5e9972c4d6d3b202fcc82c`
- Manifest: `SHA256-MANIFEST.tsv` — 413 dosya; ZIP açıldı, manifest içeride, örnek hash 3/3.
- Sıradaki tek adım: `CODEX-ARCHITECTURE-DECISION.md` kararını uygula; önce Macro 1/6 kanıtlı
  kök nedenleri, sonra Macro 9 canonical protocol/artifact/command lifecycle.

**Kanonik devralma:** `C:\Users\mamya\Desktop\MAMILAS_CODEX_5_6_SOL_FINAL_DELIVERY.md`.

**Sol yetkisi:** Mami ürün sonucunun sahibidir; Codex teknik mimarinin sahibidir. Handoff'taki rol,
field, task ve mekanizma isimleri zorunlu checklist değildir. Sol kanıtla daha iyi çözümü seçebilir;
değişmez olan manuel World Studio, site→brief/ajan→prompt sınırı, gerçek-frame gate, bağlam
taşınabilirliği ve usage-loop yasağıdır.

Claude Macro 1–8'i tamamladığını raporladı; Macro 9 command/ajan mimarisi boşluk analizi aşamasında
usage nedeniyle kaldı. Yeni Codex önce Macro 1–8'i salt-okunur denetler, sonra post-Claude snapshot
alır, kanıtlanan kusurları düzeltir ve Macro 9'u uygular. Bu devralma bölümü dosyadaki aşağıdaki eski
task/macro yönlendirmelerinden üstündür. Builder session kendine final PASS veremez; ikinci temiz
Codex oturumu zorunludur.

## 🧠 MACRO 9 — COMMAND AJAN BEYİNLERİ (AKTİF — 2026-07-15, Mami sözleşmesi)

**Durum: IN PROGRESS.** MACRO 1-8 bitti (site tarafı). Şimdi command'deki ajan orkestrası kuruluyor.
Bu bölüm çalışma bitene kadar tek gerçektir; sohbet hafızasına güvenilmez.

### Mami'nin değişmez sözleşmesi (5 ek yürütme kuralı + orkestra tasarımı)

**Ürün:** Mami yalnız **Yerleşik Yönetmen** ile konuşur. Kullanıcıya altı ajan, QA karakteri veya
teknik tartışma GÖSTERİLMEZ. Arka planda her fazda: **bir uzman üretir → bağımsız jüri karşı-okur.**
Sabit swarm YOK (usage yakan, birbiriyle konuşan). Yalnız gerekli fazın uzmanı çalışır; özel uzman
(marka/identity/dönem/pedagoji/continuity) yalnız GERÇEK risk varsa çağrılır.

**5 ek yürütme kuralı:**
1. Mami'nin sohbet direktifi `MamiDirectives` olarak decision slice'a AYNEN girer. Ajan uygular;
   site seçimini gizlice değiştiremez. Direktif prompt receipt'te KAYNAK olarak görünür.
2. Jüri faz-bazlıdır: **image** aşaması = Decision+Storyboard+Prompt · **frame** aşaması =
   +gerçek Frame+Mami verdict · **motion** aşaması = +Motion. Frame yokken jüri frame kalitesi
   hakkında PASS VEREMEZ.
3. Bir uzman→jüri geçişinde **en fazla BİR** hedefli düzeltme turu. Jüri aynı bulguyu tekrar
   üretir veya yeni gerçek gerekirse verdict `FACT REQUIRED`. Sonsuz ajan tartışması YOK.
4. Ajanlar YALNIZ artifact üretir: prompt/proposal/receipt/verdict. Hiçbiri image/video API
   çağırmaz, frame üretmez, site state'ini değiştirmez, Mami adına seçim yapmaz.
5. Her agent artifact'i taşır: `protocolVersion`, `role`, `provider`, `decisionHash`,
   `storyboardHash`, `inputArtifactHashes`, `contentHash`. Hash uyuşmazsa sonraki faz BAŞLAMAZ;
   eski artifact stale.

**Roller (context slice'ları sözleşmede — receipts/MACRO-9.md yazılacak):**
- **Yerleşik Yönetmen:** niyet/source/site seçimi/sohbet direktifini anlar; storyboard bütünlüğü +
  continuity + fazlar arası iletişim taşır; değişiklikte sessizce değiştirmez → Mami'ye PROPOSAL;
  MamiDirectives'i aynen kaydeder ve uzmana iletir; eksik gerçeği doldurmaz; final prompt YAZMAZ.
- **Image Author:** yalnız sahne-bazlı slice (decision+onaylı storyboard+MamiDirectives+WorldPacket
  fiziği+compatible ref+palette-as-light+explicit kilitler+engine dialect+scene failure modes+
  continuity özeti). 300KB paket ALMAZ. Çıktı: engine-facing final prompt + receipt + uygulanan
  kilitler + bastırılan bağlam + açık risk + prompt hash. Prompt'ta `[DIRECTOR TASK]`/TODO/hex/
  teknik konuşma YOK.
- **Image Prompt Jürisi:** yalnız Decision+Storyboard+Prompt. Frame yokken frame PASS yok. Verdict
  yalnız PASS/REJECT/FACT_REQUIRED. Skor/karakter/iç yorum/yeni yön YOK. REJECT'te exact failing
  check + en küçük düzeltme hedefi.
- **Frame aşaması:** Mami dış araçta ELLE üretir (API/batch/Magnific-entegrasyon/upscale-pipeline
  YOK). Frame receipt: decision+storyboard+prompt hash + frame SHA-256 + ölçü/aspect + artifact
  hash'leri. Frame Jürisi: +gerçek frame+Mami verdict. Prompt PASS ≠ frame PASS.
- **Motion Author:** yalnız APPROVE'lu gerçek frame + current hash + onaylı shot + MamiDirectives +
  kilitler + engine dialect/window + continuity. Önce frame açar → inventory receipt. Frame'de
  olmayanı UYDURMAZ. Frame current+APPROVE değilse HİÇ çalışmaz; frame değişince motion stale.
  Motion Jürisi: +Motion. PASS/REJECT/FACT_REQUIRED.
- **Deterministic kod (ajan işi DEĞİL):** palette translation, ref compat, IP firewall, schema
  validation, hash doğrulama, artifact staleness, engine window/split matematiği, dosya güvenliği.
- **Claude/Codex:** her workspace'e hash'li tek `PROTOCOL.md`. Aynı schema/hash/gate/evidence
  standardı; final prompt byte-identical OLMAK ZORUNDA DEĞİL (aynı kilit + aynı kanıt). Claude
  adaptörü hiyerarşik context; Codex adaptörü dosya/araç/test/frame. Adaptör karar yasasını
  KOPYALAMAZ, yalnız I/O tarif eder. Chat gibi yazamayan yüzey → label'lı artifact paketi; site
  import+hash doğrulamadan lifecycle ilerlemez.
- **Command:** beyin/prompt-yazarı/ikinci-runner DEĞİL. Yalnız: klasör bul/seçtir → active decision+
  schema+hash+gate doğrula → sonraki geçerli fazı açıkla → doğru workspace+role context ile
  interaktif oturum başlat → çıkışta yeni artifact/receipt yeniden doğrula. Kör `--print`/JSON
  dilimleme/giant one-shot/otomatik provider çağrısı YOK. Mevcut cross-platform Node runner temeli
  korunur; ikinci runner yaratılmaz.

### Mevcut durum ölçümü (2026-07-15, kod okundu)

- **VAR:** 6 uzman ajan tanımı (`.claude/agents/mamilas-*.md`, iyi yazılmış — authority hierarchy,
  mandate propagasyon, identity-lock, IP-firewall saygısı). `mamilas-uret` orkestra skill'i.
  `Decision.commandId` (decisionHash) + `Decision.approvedStoryboardHash` (contract.ts:244-245).
  `PromptReceipt`/`SceneFrameReceipt` (MACRO 3/5) — promptHash/frameHash var.
- **EKSİK (kurulacak):** `MamiDirectives` slice · üç-değerli verdict enum (PASS/REJECT/FACT_REQUIRED)
  · agent artifact receipt zinciri (protocolVersion/role/provider/inputArtifactHashes/contentHash)
  · faz-bazlı jüri ayrımı · `PROTOCOL.md` + Claude/Codex adaptör ayrımı · Image Author sahne-slice
  (şu an kick tüm paketi/scenes[i] okuyor).
- **ÇELİŞKİ (düzeltilecek):** `mamilas-uret` skill "6-ajan swarm, sen orkestra şefisin" diyor —
  sözleşme "sabit swarm kurma, yalnız gerekli faz + risk-bazlı özel uzman" diyor. `kick/claude-tr.md`
  TEK Production Agent kuruyor (6 uzmanı çağırmıyor) ama çok iyi yazılmış (ledger, FACT REQUIRED,
  frame gate, text-as-object). Beyin kalitesi yüksek; eksik olan faz-uzman ayrımı + jüri + hash.

**Sıradaki adım:** boşluk ölçümü tamamlandı → receipts/MACRO-9.md sözleşmesi + kod (MamiDirectives →
verdict enum → artifact receipt → faz jüri → Image Author slice → Yönetmen kick + PROTOCOL/adaptör →
command runner faz doğrulama) → tsc/vitest/build/e2e → tarayıcıda Yönetmen + Image→Jury +
approved-frame→Motion→Jury akışı. Kör plan/regex/API/ekstra-agent/audit-loop YOK.

---

## MACRO RESET — 2026-07-15 — Mami direktifi

**Yeni kanonik plan:** `C:\Users\mamya\Desktop\MAMILAS_MANUAL_WORLD_EXECUTION_PLAN.md`.

Bu bölüm dosyadaki eski 14-task tablosu, `TASK 2/3` aktif durumu, `DeliveryPromise`,
`ON_SCREEN_TEXT_INTENT`, source metninden text niyeti çıkarma, zorunlu `/clear`, erken A/B ve
tekrar eden Codex audit hükümlerinden **üstündür**. Eski kayıtlar tarihçedir; yeniden uygulanmaz.

Muhammet'in kararları:

- MAMILAS manuel World Studio'dur; API, otomatik generation, batch, Magnific entegrasyonu veya
  upscale pipeline değildir.
- Site final prompt yazmaz veya prompt içeriğini tahmin etmez. Site kararları/raw source'u/serbest
  Mami notunu brief'e taşır; command'deki ajan final prompt'u yazar.
- Mami ajana "4–5 sahneye anlamlı yazı koy" veya "buraya bunu yaz" dediğinde ajan uygular;
  site regex/NLP/blocker ile araya girmez.
- World dönüşümü ertelenmez: 46 world WorldPacket fiziğine dönüşür, fakat site bu paketten
  engine prompt üretmez.
- Macro 1–7 kesintisiz uygulanır; Mami task kabulü, `/clear` veya ara Codex audit istenmez.
  Gerçek frame üretimi/Mami verdict'i Macro 8'in tek dış kapısıdır.

**MACRO 1 — TAMAMLANDI (2026-07-15, Claude Opus 4.8).** Receipt: `receipts/MACRO-1.md`.
Source-intent/regex drift'i söküldü (`detectOnScreenTextIntent`/`extractBakedTextRequests`/
tüm regex bankası + `intent_pending` + `ON_SCREEN_TEXT_INTENT`). Söz artık YALNIZ Mami'nin
açık beyanından (`DeliveryDeclaration`) / CLEAN kilidinden doğar; düzyazı taranmaz, üretim
bloklanmaz. Taşınabilir hash/schema/blocker tipleri korundu. Gerçek çıktı: termos düzyazısı
(güçlü metin-isteği) → GENERATED, `deliveryPromise: pedagogy_auto`, raw source + directorBrief
brief'e karakter karakter taşındı. tsc 0 · vitest 1880/0 (59 dosya) · build OK.

**MACRO 2 — TAMAMLANDI (2026-07-15).** Receipt: `receipts/MACRO-2.md`. `src/core/pure.ts`'e
`WorldPacket`/`toWorldPacket`/`worldPacketById` eklendi; 46 world benzersiz fizik paketine
derleniyor (render/figure/env/camera/light/material/motion/negative + palette-as-light +
compatible ref + vocab örneği). `render_law` → `legacyRenderLaw` korundu; palette ham hex değil
fiziksel ışık; paket prompt DEĞİL. tsc 0 · vitest 1890/0 (60 dosya).

**MACRO 3 — TAMAMLANDI (2026-07-15).** Receipt: `receipts/MACRO-3.md`. Command JSON'a
`worldPacket` (taşınabilir dünya fiziği) + ajana "prompt'u SEN yaz / WorldPacket prompt değil /
Mami direktifini uygula" sözleşme satırları eklendi. `Scene.promptReceipt` + `applyAgentPrompt`:
ajan-yazımı final prompt siteye geri alınır, receipt fromCommandId + sha256 promptHash taşır.
Site prompt üretmez. tsc 0 · vitest 1898/0 (61 dosya) · build OK.

**MACRO 4 — TAMAMLANDI (2026-07-15).** Receipt: `receipts/MACRO-4.md`. Shot approval (brief-hash
bağlı, karar değişince temizlenen) + TEK canonical `productionReadiness` + `ShotAuthoringPanel`
(ajan geri-alım + onay) Timeline'da. Duplicate export kapatıldı (tek gate'li QA yolu, readiness
birincil). Sidebar kapı-atlaması durduruldu. Disco konuşan-karakter (ThoughtDock/CASE LEDGER/
ProductionPulse persona) temizlendi; faydalı teknik lint nötr kaldı. Sahte "Status: PASS" sniff'i
gitti; preview dürüst "STİL ARKETİPİ · gerçek kare değil" rozeti. tsc 0 · vitest 1906/0 (62 dosya)
· build OK · E2E smoke 10/10 + 4/4.

**MACRO 5 — TAMAMLANDI (2026-07-15).** Receipt: `receipts/MACRO-5.md`. `sha256HexBytes` (binary),
`SceneFrameReceipt` + `Scene.frameReceipt`, saf `motionGate`, `importFrame`/`setFrameVerdict`/
`clearFrame` aksiyonları; Timeline `FrameGatePanel` (frame yükle → SHA-256/boyut → APPROVE →
motion yalnız kapı açıkken). Frame yok/PENDING/REGENERATE/PROJECT_ONLY_ACCEPT/stale → motion
kapalı. tsc 0 · vitest 1915/0 (63 dosya) · build OK · smoke 10/10.

**MACRO 6 — TAMAMLANDI (2026-07-15).** Receipt: `receipts/MACRO-6.md`. `src/core/projectPack.ts`
(build/serialize/verify/toState) + store `exportProjectPack`/`importProjectPack` + Timeline
"⬇ Proje Paketi"/"⬆ Proje İçe Al". Deterministik pack + hash manifest; export→import round-trip
aynı world/approval/frame; bozuk pack reddedilir; legacy V2026 read-only import korunur. Launcher
parity zaten doğru (ince kabuk, göreli cd, byte-parity). tsc 0 · vitest 1924/0 (64 dosya) · build
OK · smoke 10/10.

**MACRO 7 — TAMAMLANDI (2026-07-15).** Receipt: `receipts/MACRO-7.md`. `buildCloseout` (karar→
prompt→frame zinciri + açık riskler + OBSERVATION dersler, otomatik promote yok). Yanlış Magnific/
upscale-zorunlu sözleri 6 ajan dosyasından (Claude+Codex kopyaları) söküldü; frame gate korundu.
Kural dosyaları (launcher-parity #6, site-gates) kapatılan drift'lerle güncellendi. V2026 korunur.
tsc 0 · vitest 1926/0 (64 dosya) · build OK · smoke 10/10.

**MACRO 8 — TAMAMLANDI (2026-07-15). Durum: implementation complete / visual validation pending.**
Receipt: `receipts/MACRO-8.md`. tsc 0 · vitest **1926/0 (64 dosya)** · build OK · **E2E 15/15** ·
docsContract 97/97 (launcher byte-parity). Tarayıcıda Macro 3-5 uçtan uca sürüklendi: ajan prompt
geri-al → shot onayla → frame yükle → APPROVE → motion AÇILDI (gerçek piksel hash gate). Görsel
kalite hükmü gerçek frame ile Mami'nindir (tek dış kapı) — `production ready` denmedi.

## 🎬 MANUAL WORLD STUDIO — 7 MACRO TESLİM EDİLDİ (2026-07-15, Claude Opus 4.8)

Tüm dönüşüm bitti. Her macro gerçek çıktı + testle kanıtlı, receipt'ler `receipts/MACRO-<N>.md`:

1. **MACRO 1** — Regex/NLP/source-intent dedektörü söküldü; site metni tahmin etmiyor/bloklamıyor.
2. **MACRO 2** — 46 world → WorldPacket (render/camera/light/material/motion/negative + palette-as-
   light + compatible ref); render_law legacy korundu; site paketten prompt üretmiyor.
3. **MACRO 3** — Site → taşınabilir brief → ajan final prompt; ajan çıktısı geri alınıyor (hash'li
   receipt). Site prompt yazmıyor.
4. **MACRO 4** — Shot approval (brief-hash bağlı) + TEK canonical readiness; duplicate export +
   sidebar bypass kapatıldı; Disco persona temizlendi; sahte readiness → gerçek onay.
5. **MACRO 5** — Manuel frame import (SHA-256) + Mami APPROVE/REGENERATE/PROJECT_ONLY_ACCEPT; motion
   yalnız onaylı current frame ile açılır; frame/karar değişince stale.
6. **MACRO 6** — Taşınabilir `.mamilas-project.json` pack + hash manifest; export→import round-trip;
   legacy V2026 read-only import; launcher parity doğru.
7. **MACRO 7** — Closeout (karar→prompt→frame zinciri + açık riskler + OBSERVATION dersler, otomatik
   promote yok); yanlış Magnific-upscale sözleri 6 ajan dosyasından söküldü; frame gate korundu.

**Tek dış bağımlılık:** gerçek frame üretimi + Mami'nin frame verdict'i. Sistem Mami'nin elle
kullanacağı World Studio olarak çalışıyor.

Yeni receipt biçimi: `receipts/MACRO-<N>.md`. Mevcut TASK-00/01/01B/02/03 receipt'leri tarihsel
kanıttır; eski task zincirinin devam zorunluluğu değildir.

Bu dosya sohbet özeti DEĞİLDİR. Tek gerçek durum kaydıdır.
Her oturum başında ÖNCE bu dosya okunur, sonra son receipt doğrulanır.
Sohbet hafızasından varsayım yapılmaz. Çelişki varsa `FACT REQUIRED` ile durulur.

## Onaylı plan

- Handoff: `C:\Users\mamya\Desktop\MAMILAS_CLAUDE_OPUS_4_8_EXECUTION_HANDOFF.md`
- SHA-256: `2d5721480b8ecb26c9957347700656f606975fd69507977378d90f9da9be9851`
- Boyut: 18398 bayt
- Yürütme sözleşmesi (skill): `.claude/skills/mamilas-pipeline/SKILL.md`
- Uygulayıcı model: Claude Opus 4.8 (`claude-opus-4-8[1m]`)

Handoff kanonik plandır. Mami'nin onayladığı üç değişiklik skill içinde
"REVİZE TASK SIRASI" başlığı altında yaşar ve handoff'un TASK 8/11/12 sırasını ezer.

## Backup

- Durum: **VAR** — `C:\Users\mamya\Desktop\MAMILAS-BACKUPS\MAMILAS-2026-07-14_2333\`
- ZIP: `MAMILAS-2026-07-14_2333.zip` — 378 dosya, 14.08 MB —
  SHA-256 `63213D145344FEFA909A8029573D15F579D5946C84905FDE55ECE99BB5C1EE38`
- Git geçmişi: `mamilas-git-history.bundle` (`--all`) —
  SHA-256 `01667C727C91B402A48BA09A507AC9D0DAF320C5E9783506E7BD01BD77507AA0`
- Doğrulama: ZIP açıldı → 378 dosya; manifest'e karşı **378/378 hash eşleşti**;
  `git bundle verify` → "complete history".
- Kural: backup tamamlanmadan hiçbir `src/` dosyası değiştirilmez. **Karşılandı** —
  TASK 1 boyunca `src/` mtime'ları 2026-07-12'de sabit kaldı.

### ⚠️ Yedeğin varlık sebebi (yeni ölçülen gerçek)

**Git HEAD bayat. Gerçek MAMILAS commit edilmemiş worktree'de yaşıyor.**
HEAD = `2af0fb5` (**2026-06-29**) · worktree = 2026-07-12 · fark 92 dosya, **+17 706 / −9 558**.
`brain.ts` HEAD 748 → worktree **2918** satır. `SURGERY_DATA.json` 341 113 → **587 766** bayt.

`git checkout .` / `git reset --hard` / `git stash` **bu sistemi geri getirmez — siler.**
Geri dönüş yalnız ZIP'ten yapılır. Hiçbir ajan "temizlik" adına worktree'yi sıfırlamaz.

## Tamamlanan task'lar

`FINISHED` yalnız **Mami kabul ettikten sonra** yazılır. Test yeşili gerekçe değildir.
Yarım task için `IN PROGRESS — <nerede kalındı> — sıradaki tek adım: <cümle>` yazılır.

| Task | Durum | Receipt |
|---|---|---|
| TASK 0 — Bağımsız ön değerlendirme | **FINISHED** — 2026-07-14 — Claude Opus 4.8 | `receipts/TASK-00.md` |
| TASK 1 — Taze yedek ve çalışma kaydı | **FINISHED** — 2026-07-15 — Claude Opus 4.8 (Codex: APPROVE_WITH_CONDITIONS, şartlar kapatıldı · Mami: kabul) | `receipts/TASK-01.md` |
| TASK 1B — Baseline kanıtı (prompt + kare) | **FINISHED** — 2026-07-15 — Claude Opus 4.8 (Mami: kabul) | `receipts/TASK-01B.md` |
| TASK 2 — Canonical veri sözleşmesi | **IN PROGRESS — kod+testler bitti; 5 Codex REJECT turunun kod-kusurları düzeltildi; Mami kabulü bekleniyor** | `receipts/TASK-02.md` |
| TASK 3 — Typed FACT REQUIRED + conflict resolver | **IN PROGRESS — kod+testler bitti; ajan-seçimi YOK; store köprüsü kuruldu; 2 kusur Mami kararına açık** | `receipts/TASK-03.md` |
| Ürün-niyeti temizlikleri (izole) | **YAPILDI — ölü launcher + Advisors.ts silindi, launcher-parity düzeltildi** | `receipts/CLEANUP-2026-07-15.md` |

### Güncel ölçüm (2026-07-15 gece, `rtk proxy npx vitest run` filtresiz)

**tsc 0 · vitest 1920 geçti / 0 kaldı (59 dosya) · build OK.** Kanıt: `TASK-02-REAL-OUTPUT.txt`.
Codex **6 denetim turu**: dedektör kaçırma+yanlış-pozitif (A/B/C mod modeli + sıradan metin-isimleri),
boş-shot blocks, per-sahne blocks, store köprüsü, receipt overclaim'leri **kapatıldı**. 7. tur
doğrulama koşuyor. Sessiz malzeme/store-rewrite + ticari marka + çözüm UI'ı (TASK 9) **açık/Mami
kararına** (`PRODUCT-INTENT-AUDIT.md §7-8`).

## ⭐ ÜRÜN NİYETİ — üst ölçüt (2026-07-15, Mami)

`PRODUCT-INTENT-AUDIT.md` — repo gerçeği ürün niyetine karşı, kök-neden + plan.
MAMILAS = uzun prompt üreten site DEĞİL; kararları kayıpsız/deterministik/taşınabilir/kanıtlanabilir
taşıyan sistem. **Site TARİF verir; `.command` içindeki AJAN prompt yazar** (memory: site-tarif-ajan-prompt).
**Hiçbir ajan Mami adına seçim yapmaz.** Task planı bu niyete hizmet ettiği sürece geçerlidir;
etmiyorsa kök-neden düzeltmesi yapılır (kör uygulama yok).

## Aktif task

**TASK 2 + TASK 3 — kod bitti, Mami kabulü bekleniyor.**

**Durum:** Söz düzyazıdan TÜRETİLMEZ; Mami "Şüphede SOR ve DUR" (2026-07-15). Kaynak niyet
taşıyıp Mami beyan vermediyse üretim `ON_SCREEN_TEXT_INTENT` ile durur. Typed FACT REQUIRED
(handoff §6) kuruldu; ajan Mami adına seçmez; blocker'lar store state'inde yaşıyor.

tsc 0 · vitest **1920 geçti / 0 KALDI** (59 dosya) · build OK. Gerçek çıktı:
`TASK-02-REAL-OUTPUT.txt` (19/19 wanted + 15/15 legit + P0 + SHA + NFC).

**⚠️ ÖLÇÜM DİSİPLİNİ:** `rtk proxy npx vitest run` kullan — düz `npx vitest run` rtk özetiyle
`PASS (N) FAIL (0)` gösterip kırık testi gizler (bir kez bu yüzden yanlış rapor verdim, düzeltildi).

**Sıradaki tek somut adım:** 7. Codex doğrulama turu bittiğinde sonucu receipt'e işle;
Mami TASK 2+3'ü kabul edince `FINISHED` yaz. Sonra **CLEAR B → TASK 4** (ama site prompt
YAZMAZ — `.command` içindeki ajan yazar; memory: site-tarif-ajan-prompt).

**⚠️ Canlı davranış değişikliği:** ekran-metni niyeti taşıyan kaynaklar **beyan verilene kadar
üretim yapmıyor** (`ON_SCREEN_TEXT_INTENT`). Önce sessizce yanlış üretiyordu.

**CLEAR A — Mami tarafından atlandı** (*"devam et"*). Sözleşme CLEAR A'yı zorunlu tutuyordu;
kullanıcı talimatı skill'i ezer. **CLEAR B (TASK 4 öncesi) yeniden istenecek** — `brain.ts`'e
dokunulan yer orası.

**Ön koşul doğrulaması (yapıldı):** rtk 0.43.0, doğru binary, `rtk gain` çalışıyor,
`PreToolUse: Bash|PowerShell → rtk hook claude` aktif.

### Kabul edildi ama HÂLÂ AÇIK olan gerçekler (unutulmasın)

1. **3 PNG hâlâ diskte değil.** Kareler sohbete yapıştırıldı; Claude sohbetteki görseli diske
   yazamaz. `artifacts/baseline-frames/frames/` boş. Prompt'lar ve gözlemler diskte, **piksel yok**
   → A/B'nin referans ayağı hash'le kilitlenemedi. Mami PNG'leri bırakınca manifest çıkarılır.
2. **GOLDEN-03 bayrak yaması** — Mami verdict'i vermedi (genel kabul verdi, kare hükmü değil).
   Kare: kask indiren Efe, omuzda ajans/ABD bayrağı benzeri yama; prompt bunu **iki bantta yasaklıyor**.
   Bu bir bulgudur, kapı değildir — ama **export riski** olarak açık kalır.
3. **Yedeğin ikinci kopyası** alınmadı (repo + yedek aynı `C:` diskinde).
4. **Magnific/upscale tek yasası** (TASK 6) — hâlâ Mami kararı.
5. **⚠️ TASK 4 ÇATALI — Mami kararı gerekecek.** Altın prompt'ların bantlarını
   (`SHOW DIRECTIVE`, `LANGUAGE LOCK`, `CAST KİLİDİ`, `fena fillah`) **bu makinedeki hiçbir kod
   üretmiyor** — ne `src/`, ne `dist/`, ne `C:\Mamilas-Sol-Lab`. Prompt'ları **ajan yazıyor**
   (KARE-BULGULARI satır 4: *"Ajan-yazımı `.command` Pass A, site-taslağı değil"*).
   Gerçek akış: **site → brief → ajan → prompt → motor.**
   **Çatal:** (A) site prompt'u kendi yazsın — deterministik, kapılanabilir, handoff'un istediği ·
   (B) ajan yazmaya devam etsin — bugün çalışıyor ama ölçülemiyor, gate yazılamıyor.
   **TASK 2 her iki tasarımda da aynı** → çatal TASK 2'yi bloke etmez, TASK 4'te sorulur.

**Ön koşul doğrulaması (bu turda yapıldı):** rtk 0.43.0 kurulu (`~/.local/bin/rtk`),
`rtk gain` yanıt veriyor (isim çakışması yok), `~/.claude/settings.json` →
`PreToolUse: Bash|PowerShell → rtk hook claude` aktif.

## Değiştirilen dosya grupları

Bu ana kadar **hiçbir `src/` dosyası değişmedi.** Değişenler yalnızca altyapı:

- `.claude/skills/` — 4 skill Codex tarafından kopyalandı (görünmezlik çatalı kapatıldı)
- `.claude/rules/` — path-scoped kurallar (yeni)
- `.claude/skills/mamilas-pipeline/` — yürütme sözleşmesi skill'i (yeni)
- `CLAUDE.md` — 3 satır eklendi (state + skill + rules işaretçisi)
- `artifacts/decision-pipeline-implementation/` — bu dosya + receipts (yeni)

Repo dışı (Mami'nin ayrı talebi, projeye ait değil):
`~/.claude/settings.json` — rtk hook + 6 plugin.

## Çalıştırılan testler

TASK 1'de de **hiç test çalıştırılmadı** — TASK 1 salt-yedektir; tsc/vitest/build/e2e koşmaz.
(TASK 0 salt-okunurdu.)
Son bilinen baseline (2026-07-13 buyer audit, ikinci elden): tsc 0 · vitest 1829 geçti ·
build OK · e2e 15/15. **Bu turda doğrulanmadı** — TASK 12A'da gerçek çıktıyla ölçülecek.

## Açık blocker ve riskler

1. **Repoda sıfır gerçek kare.** 11 PNG = arayüz ekran görüntüsü. KARE-BULGULARI'nın
   9 gerçek karesi Mami'nin Mac'inde `~/Desktop/MAMILAS-PROMPTLAR/` altında; bu Windows
   makinesinde yok. A/B için gereken piksel şu an erişilemez durumda.
   **TASK 1'de yeniden ölçüldü — doğru.** Ayrıca **KARE-BULGULARI raporunun kendisi de bu
   makinede dosya olarak yok**; yalnız atıfları var (`docs/superpowers/CLEAR-KICKOFF-3.md`).
   Yani kararlar okunamayan bir rapora atıfla alınıyor. → **TASK 1B FACT REQUIRED.**
2. **P0 — söz sessizce düşüyor. ✅ GERÇEK ÇIKTIYLA KANITLANDI (2026-07-14, TASK 1B).**
   `generateBatch` gerçek termos source'uyla çalıştırıldı. Prompt kaynağın baked-text isteğini
   **üç kez iptal ediyor**: `[SOURCE — do not render as on-screen text]` ·
   `Text/logo: clean plate — this scene carries no on-screen text` · negatifte `NO overlay text`.
   `contractGate = PASS`. Kanıt: `artifacts/baseline-frames/site-output/SITE-02-*.image-prompt.txt`
   ve `artifacts/baseline-frames/GOLDEN-vs-SITE.md`. Mami'nin altın prompt'u aynı işi **kilit**
   olarak yapıyor (`== ON-SCREEN TEXT ==` bandı) → TASK 2'nin `DeliveryPromise`'i tam olarak bu.
3. **`plastik` sorununun kök nedeni bilinmiyor.** `one_piece_toei` prompt'a birebir
   "Official One Piece TV anime production still, Toei Animation" yazıldığında bile
   kare One Piece çıkmadı. Keyword sayımı bunu çözemedi.
4. **Prop sızıntısı canlı.** 19/46 dünyanın `render_law`'ı 3+ somut nesne adı taşıyor
   ve verbatim prompt'a giriyor. "Kapandı" denen `doorway`/`window`/`arch` mobilyası
   2026-07-13 export'unda hâlâ basılıyor.
5. **Magnific/upscale üç yönlü çelişki.** skill+subajan "zorunlu, `PENDING_UPSCALE`" ·
   runner şeridi habersiz · `brain.ts:2396` "ara çözünürlük geçişi yoktur".
   **Mami kararı bekliyor — FACT REQUIRED.**
6. **Windows/macOS drift.** `start-mamilas.command:4` sabit `/Users/Muhammet/...` yolu ·
   `BASLAT-CODEX` macOS karşılığı yok · `start-codex.ps1:48` tutmadığı model sözünü basıyor ·
   `runner.mjs:273-277` Windows'ta yasayı referansla, mac'te değerle teslim ediyor.
7. **Determinizm kırık.** `commandExport.ts:164,173` — `commandId` içerik hash'i değil,
   timestamp türevi. Aynı kararlar aynı byte'ı üretmiyor.

## Mami kararları ve açık onaylar

| Tarih | Karar |
|---|---|
| 2026-07-14 | TASK 0 kabul edildi. |
| 2026-07-14 | **Revize task sırası onaylandı:** kare öne çekilir (bkz. skill). |
| 2026-07-14 | Altyapı 4 hamlesi onaylandı: state · handoff→skill · path-scoped rules · skill çatalı. |
| 2026-07-14 | Plugin avı kapandı. OpenMontage/Graphify/cognee/claude-video **kurulmayacak**. |
| 2026-07-14 | OpenMontage'tan **fikir** alınacak (kod değil — AGPL): `DeliveryPromise` tipi → TASK 2, `approved_fallback` → TASK 3. |
| 2026-07-14 | Sıra: refresh → hooks kurulumu → EXECUTE (TASK 1). |

**Bekleyen Mami kararı:** Magnific/upscale tek yasa ne olacak? (blocker #5)

## Bir sonraki task'ın kesin başlangıç noktası

**TASK 2 — Canonical veri sözleşmesi.** Handoff §5 + `DeliveryPromise`.
Tasarım hazır: `artifacts/decision-pipeline-implementation/TASK-02-DESIGN.md`
(Codex REJECT'i sonrası güncellendi).

**İlk somut adım (TDD):** P0 regresyon testini **kırmızı** yaz — termos source'u
(`rawHash ba24888a`) baked-text istiyor, sistem `onScreenText: null` üretip `PASS` veriyor;
test **BLOCKED** beklemeli. Sonra yeşile çevir.

### A/B'nin KİLİTLİ tanımı (Codex ile birlikte)

> **Aynı canonical decision** → **eski FINAL prompt + karesi** vs **yeni FINAL prompt + karesi.**
> **Ham site BRIEF'i ne referanstır ne adaydır.**
> "Final" = motora giden metin (bugün ajanın yazdığı; yarın hangi tasarım seçilirse onun ürettiği).

Ölçülen bant farkı (gerçek `generateBatch`, Codex bağımsız doğruladı — hepsi **0** eşleşme):
`DOMINANT ELEMENT` · `ON-SCREEN TEXT` · `LANGUAGE LOCK` · `SHOW DIRECTIVE` · `@[` · `Magnific` ·
frame-specific negatif. Sitede var: `STYLE SYSTEM` (render law) · `Camera grammar` ·
`Palette physics` · `Reference anchor` · **ve `[DIRECTOR TASK]`**.

**Uyarılar (Codex):** `SHOW DIRECTIVE` GOLDEN-01'de **yok** → evrensel bant değil.
Canonical sözleşme **Magnific'e bağlanmaz** — `@`-handle kimlik-referansının bir **uygulamasıdır**,
kavramın kendisi değil. Site render lock'u **verbatim değil** (squash-stretch cümlesini düşürüyor,
2958 → 2798 karakter).
