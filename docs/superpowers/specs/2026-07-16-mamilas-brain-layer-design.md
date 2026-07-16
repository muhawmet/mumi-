# MAMILAS Beyin Katmanı — Tasarım (Spec)

> **Tarih:** 2026-07-16 · **Yazan:** Claude Opus 4.8 (1M) · **Ürün sahibi:** Mami (AI Creative Director)
> **Teknik mimari eş-denetçi:** Codex `gpt-5.6-sol` (high) — bu tasarımı bağımsız denetledi, M1'i düzeltti.
> **Kanon:** `docs/ai/PROJECT_CONTRACT.md` · **Durum:** `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md`

Bu, Codex'in kurduğu **sağlam plumbing** üstüne **yaratıcı zekâ katmanını** kurma tasarımıdır.
Anlama fazı 6 kazı + gerçek `generateBatch` çıktısı + web çapraz-kontrol + Sol denetimi ile kanıtlandı.

---

## 0. DEĞİŞMEZ ÜRÜN YASALARI (her task bunlara uymak zorunda)

Bunlar Mami'nin sözüdür; hiçbir task bunları çiğneyemez. Sol denetimi de bunlardan türedi.

1. **API YOK.** Otomatik generation, batch, upscale pipeline YOK. MAMILAS **manuel World Studio**'dur.
   Mami yazılmış prompt'u motora (Nano Banana 2 / Kling) **ELLE** taşır.
2. **Mami HER ZAMAN loop'ta ve sürekli müdahale eder.** Hedef "bas → en iyi çıksın" DEĞİL — Mami ile
   **BERABER** en iyiyi kuran sistem. Hiçbir ajan Mami adına seçim yapmaz. `MamiDirectives` aynen geçer.
   Otomatik türetilen HER alan **override edilebilir ÖNERİ** olmalı — Mami'nin müdahale kapısını kapatan
   kilit ASLA olmaz.
3. **Mami büyük bir ajansta AI Creative Director'dur** — YouTube-shorts hobicisi değil. Kalite çıtası
   profesyonel/ajans-seviyesi. Sistem Mami'nin **eli ve gözü**; hükmünü değiştirmez, yerine geçmez.
4. **Site DETERMİNİST PANEL'dir — yalnız TARİF eder (brief üretir).** Final prompt'u ASLA site yazmaz.
   Brief'ten final prompt'u **AJAN** yazar. (`commandExport.ts:454-461` — zaten böyle kurulu.)
5. **Madenlenmiş dersler EVRENSEL KİLİT değildir.** "Kling'de asla diyalog", "asla pan/dolly" gibi
   yasalar engine-aware **default/red-line**'dır; Mami explicit talimat verirse receipt'te görünerek
   uygulanır veya somut çatışma gerekçesiyle `FACT_REQUIRED` olur. Mami'nin sözünü ajan reddedemez.

---

## 1. Doğrulanmış durum (kanıtlı — file:line)

**✅ Codex'in sağlam kurduğu (DOKUNMA):**
- `src/core/agentProtocol.ts` (352 satır): `AgentArtifact` hash zinciri, 3-değerli `JuryVerdict`
  (PASS/REJECT/FACT_REQUIRED), üç ayrı jüri (image/frame/motion), frame gate (motion yalnız Mami-APPROVE'lu
  gerçek frame'le, `sharp` decode). `scripts/mamilas-command.mjs` runner. **Yeniden icat etme.**
- `buildImagePrompt` → `parts[]` (brain.ts:2093-2158): render_law "nasıl, ne değil"e nötralize; palet
  hex→fiziksel ışık (sızmıyor); vantage beat-aware; motor lehçesi (Kling/Seedance) ayrışıyor.
  **AMA bu FINAL prompt DEĞİL — brief'tir** (Sol itirazı: `[DIRECTOR TASK]` + doctrine + prop örneği taşıyor).
- Gerçek lifecycle canonical role kartlarını yükler: `agents/PROTOCOL.md` + `agents/roles/*.md` +
  `agents/adapters/*.md` + üretilen `CONTEXT.json` (`mamilas-command.mjs:721-754`).

**⚠️ Boş/kusurlu (bu tasarımın işi):**
- **[KUSUR-A] Mami'nin yaratıcı yoruma rızası kanıtlanmıyor (EN BÜYÜK RİSK — Sol).** Zincir kanıtlıyor:
  *"ajan Mami'nin onayladığı ham beat'ten bu prompt'u üretti."* Kanıtlamıyor: *"Mami, ajanın bu sahne için
  seçtiği dominant özne/olay YORUMUNU gördü ve onayladı."* `dominantSubject`/`event` alanları ham cümlenin
  byte-identical kopyası (`pure.ts:1402`, gerçek çıktıda doğrulandı) → bilinçli transport sentinel'i, ama
  ajan sahneyi **görünmez** yorumluyor (`agentProtocol.ts:235`). `embedded_director` type tanımlı ama gerçek
  runner rollerinde YOK (`agentProtocol.ts:35`, `mamilas-command.mjs:28`). **Bu, "Mami adına seçme" yasasının
  en ciddi açığı.**
- **[KUSUR-B] İki ajan yüzeyi senkron değil.** `.claude/agents/mamilas-*.md` (217 satır, ince, ORPHAN —
  yalnız `/mamilas-uret` manuel Studio'da yüklenir, lifecycle'a sıfır etki) vs `agents/roles/*.md` (gerçek).
  Manuel beyin gövdeleri **authority olmaktan çıkmalı**; tek kanon = role kartları.
- **[KUSUR-C] render_law prop sızıntısı canlı.** 19/46 dünya render_law'ında somut nesne adı taşıyor →
  kareye sızıyor. `WorldPacket.renderPhysics` (`pure.ts:425`) tüm law'ı yeniden kopyaladığı için isim
  değişse de sorun sürüyor. Yasa: *"fizikten yapılmışsa güvenli, prop'tan yapılmışsa sızar."* Toptan silme
  YASAK (pilot denedi, kare stok-fotoğrafa kaydı).
- **[KUSUR-D] Madenlenmiş zekâ hiçbir beyinde yok.** 2D-plastik fix, palet-rejim, Physics-First Motion,
  scrub-quoted-source, no-dialogue-ever, FACT_REQUIRED token, self-contained, "half a second before",
  detay-üçlüsü, banned-empties. Kaynak: `[[mamilas-brain-intelligence-mined]]`.

**Çapraz-kontrol (`[[mamilas-external-research-2026-07]]`):** per-shot alan ayrıştırması (subject/action/
place/camera/light) endüstri standardı (Josh English 9-alan, Higgsfield Santiago, Seedance skill,
video-notation-schema, Murch Rule-of-Six). i2v tek-hareket anti-warping yayınlanmış. **Ama "site bu alanları
üretsin" kanıtlanmıyor** — ownership ürün yasasından çıkar: **ajan önerir, Mami onaylar.**

---

## 2. Mimari — çekirdek karar

### 2a. Şeffaf yorum receipt'i (KUSUR-A çözümü — **Mami revizyonu, 2026-07-16**)

> **REVİZYON GEÇMİŞİ:** Sol "ayrı DirectorShotProposal fazı + Mami APPROVE bekleme kapısı" önerdi.
> **Mami reddetti:** *"Öneri phase'ini beğenmedim — direkt image prompt'larına geçelim, çok uzatıyor;
> sahne-sahne spesifikliğe şu an gerek yok. Ben full dominasyon yapmam; ajan tam paketi verir, ben ilk
> 2-3 görseli üretir, 'renderı tam alamamışsın' der sıkılaştırtırım."* Ürün sahibi kararı kesindir.

Site otomatik ayrıştırmaz (yaratıcı yorum = site sınırını deler) — bu kısım değişmedi. Ama çözüm
**onay kapısı değil, şeffaflık:**

```
Site deterministik brief
      ↓
Image Author TAM paketi KESİNTİSİZ yazar
  → her prompt'un yanında tek-satır YORUM RECEIPT'i:
    { dominantSubject, singleEvent, frozenInstant }   ← ajanın kafası GÖRÜNÜR, akışı DURDURMAZ
      ↓
Mami ilk 2-3 görseli motora verir, kareye bakar
      ↓
Doğal dille müdahale: "renderı tam alamamışsın" → MamiDirectives (mevcut mekanizma)
      ↓
Ajan sıkılaştırır (tek-revizyon hattı); direktif receipt'te KAYNAK görünür
```

KUSUR-A böyle kapanır: ajanın yorumu artık **görünmez değil** (receipt'te), ama Mami'nin önüne
**onay bürokrasisi** de konmaz. Müdahale kapısı = Mami'nin gözü + `MamiDirectives`.

**Dürüst adlandırma (değişmedi):** `dominantSubject`/`event` "kopya yalanını" bırak → `exactSourceBeat` +
`semanticInterpretationStatus: AGENT_AUTHORED` (yorum ajanın işi, site taşımaz).

### 2b. Canonical brain — tek kaynak → iki yüzey (KUSUR-B çözümü)

Shared include/symlink DEĞİL (Windows/TOML/MD taşınabilirliği kırılgan). **Generator modeli:**
- Kanon: `agents/PROTOCOL.md` · Rol zekâsı: `agents/roles/<role>.md` · Provider I/O: `agents/adapters/*.md`
- Manifest: role → canonical role card → provider wrapper.
- Generator: `.claude/agents/*.md` + `.codex/agents/*.toml` bunlardan **ÜRETİLİR** (`GENERATED — DO NOT EDIT`
  banner + canonical role/protocol hash).
- `npm run agents:sync` üretir; `npm run agents:sync -- --check` temp'te yeniden üretip byte-compare eder →
  CI/Vitest'te kırmızı verir. Parity testi: role-set + protocol hash + banner + orphan/manual-authority yasağı.
- Gerçek lifecycle'ın `PROTOCOL.md + ROLE.md + ADAPTER.md + CONTEXT.json` modeli **korunur.**

### 2c. `promptQuality` kontratı — ölçülebilir zekâ (KUSUR-D çözümü)

Madenlenmiş yasalar **nesir duvarı değil**, `CONTEXT.json`'daki `promptQuality` kontratına
`requiredEvidence[]` + `rejectIf[]` olarak girer (role kartları bunu zaten okuyor). Böylece:
- Image Author yazarken kontrata karşı counter-read eder.
- Image Jury `rejectIf`/`requiredEvidence`'ı **ölçer** (RLAC deseni: falsifiable, dış-validator).
- Madenlenmiş yasa = kontrat maddesi = testlenebilir. **Ama Mami override → receipt'te `SUPPRESSED`.**

---

## 3. Makro-task sırası (Sol tarafından düzeltildi — bağımlılığa göre)

| # | Task | Deliverable | Neden bu sıra |
|---|---|---|---|
| **M0** | Baseline mühür + iki .bat/sharp fix commit | Yeşil baseline commit'li | Zemin. Kirli worktree'yi temizle (Mami onayıyla). |
| **M1** | **Canonical consolidation** (`agents:sync` generator + parity test) | Tek kaynak → iki yüzey, drift testli | Zekâyı İKİ KEZ yazmamak için ÖNCE. Altyapı çoğu var. |
| **M2** | **render_law prop/fizik ayrımı** (`WorldPacket.renderPhysics`) | Prop sızıntısı ölçülüp kesildi (gerçek A/B + Mami göz) | Image Author içeriğinden ÖNCE; sızıntı hâlâ canlı. |
| **M3** | **Şeffaf yorum receipt'i + dürüst adlandırma** (KUSUR-A, Mami revizyonu) | Ajan tam paketi kesintisiz yazar; yorumu görünür receipt'te; onay kapısı YOK | Site semantic author OLMAZ; Mami bürokrasi istemez. |
| **M4** | **Image Author + Image Jury zekâsı** (birlikte) | `promptQuality` kontratı + madenlenmiş yasalar; jüri ölçer | Author + red-line AYNI task'ta (Sol). |
| **M5** | **Motion Author + Motion Jury zekâsı** (birlikte) | Physics-First Motion, scrub-quoted, no-dialogue; frame-gated | Image sağlamlaşınca üstüne. |
| **M6** | **Sistem QA hardening** (RLAC/red-line/regression matrisi) | Cross-phase adversarial jüri + regresyon | Sistemik katman. |
| **M7** | **Biten projelerden öğrenme — ders bankası** (Mami isteği) | closeout `lessonCandidates` → Mami APPROVE → `agents/lessons/APPROVED.md` → sonraki proje context'i | "Tanrı seviyesi": onaylı ders birikir; otomatik yasalaşma YOK. |

**Her task sonu ritüeli (Mami'nin istediği):**
1. Gerçek çıktı üret — **`generateBatch` DEĞİL, lifecycle'ın gerçek `image_author` artifact'i** (Sol: kalite
   orada ölçülür, brief'te değil). Gerekirse Mami elle prompt'u motora verip **kareye** bakar.
2. Mami gözle okur (yaratıcı hüküm yalnız Mami'nin).
3. Bağımsız denetim: Codex `gpt-5.6-sol` high.
4. `/mamilas-checkpoint` (commit + memory).
5. Kapı: `npx tsc --noEmit` → `npx vitest run` (sayı düşmez, test silme yasak) → `npm run build`.
   Launcher değiştiyse zsh + .bat parity.

**`/clear` noktaları:** M1 öncesi · M3 öncesi (KUSUR-A, mimari) · M4 öncesi · M6 öncesi. Her clear'da yeni
oturum ÖNCE `EXECUTION_STATE.md` + bu spec + son receipt'i okur.

---

## 4. Kapsam dışı (YAGNI — bu tasarım YAPMAZ)

- Otomatik generation / API / batch / upscale. (Ürün yasası #1.)
- Site'nin final prompt yazması veya semantic author olması. (Ürün yasası #4 + Sol.)
- render_law'ı toptan silmek. (Pilot çürüttü.)
- Madenlenmiş dersleri Mami'yi ezen evrensel kilide çevirmek. (Ürün yasası #5.)
- İkinci lifecycle runner / platforma özel yasa kopyası. (`launcher-parity.md`.)
- `.claude/agents/*.md`'yi elle authority olarak derinleştirmek. (Generated olacak — KUSUR-B.)

---

## 5. Başarı ölçütü

- **KUSUR-A kapandı:** ajanın dominant-özne/olay yorumu artık görünmez değil — her image_author
  artifact'inde şeffaf `interpretation` receipt'i var; akış kesintisiz; Mami müdahalesi `MamiDirectives`
  olarak receipt'te kaynak görünüyor. (Onay bürokrasisi kurulmadı — Mami kararı.)
- **KUSUR-B kapandı:** `.claude/.codex` beyinleri role kartlarından üretiliyor; `--check` drift'i yakalıyor.
- **KUSUR-C kapandı:** prop-laden vs physics-only gerçek A/B + Mami göz testinde prop sızıntısı ölçülür
  şekilde azaldı; render_law fiziği verbatim korundu.
- **KUSUR-D kapandı:** madenlenmiş yasalar `promptQuality` kontratında; gerçek `image_author` artifact'i
  gözle profesyonel/ajans-seviyesi; Mami override receipt'te görünür.
- Kapı yeşil, PUSH yok, test silinmedi, Mami'nin müdahale kapısı hiçbir yerde kapanmadı.
