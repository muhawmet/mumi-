# COMMAND AKIŞI DENETİM LOG — 2026-07-24 (ofis mesaisi)

Kapı giriş: tsc0 · vitest 2051/2051 · build✓. 5 Opus 4.8 ajan (read-only, Fable yok).
Disiplin: BUL → Mami SEÇER → onar. Körleme yama + yeni regex/keyword YASAK.

---

## AJAN 1 — KANAL BÜTÜNLÜĞÜ (worldPacket → ajan) ✅ bitti

### B1 [KRİTİK] Gece sahnesi ajana GÜNDÜZ paleti olarak gidiyor
- **Kök:** `pure.ts:506` → `paletteAsLight: paletteLightPrompt(ctx?.palette, world)` — 3. arg (isNight) YOK,
  default false → `scrubSunForNight` çalışmaz, sun/daylight/dawn/dusk cümlede kalır (brain.ts:346).
- **Doğru sürüm VAR ama ajana ulaşmıyor:** `commandExport.ts:437` scenes[].paletteLight = paletteLightFor(scene.isNight) gece-scrub'lı.
  AMA `agentProtocol.ts:420-426` shot objesi yalnız {id,phaseName,durationSec,architecture,sceneBrief} taşıyor —
  scenes[].paletteLight shot'a GİRMİYOR. Ajanın gördüğü palet = worldPacket.paletteAsLight = DAİMA gündüz.
- **= bugünkü T1'in kanıtı.** Gece sahnesi gündüz paletiyle üretilip kendi gate'inde FAIL.

### B2 [KRİTİK] Sözleşme "motionCadence oku" diyor ama IMAGE context taşımıyor
- `commandExport.ts:478` ajana açıkça: "worldPacket.renderPhysics/cameraEnvelope/lightPhysics/**motionCadence**/paletteAsLight okunur."
- AMA `agentProtocol.ts:428-444` IMAGE return'ünde motionCadence YOK (yalnız MOTION context'te, :486).
- Talimat↔veri çelişkisi. (M2 vocabularyExamples + FABLE `negatives` vakalarının aynısı: iki yüzey uyuşmuyor.)

### B3 [İKİNCİL] summary/name/group ajana içerik olarak gitmiyor
- pure.ts WorldPacket'te var, agentProtocol.ts IMAGE return'ünde yok. group yalnız promptQuality seçimine (:407).
- Ajan dünyanın insan-okur adını/özetini/register'ını (ANIMATION/REAL) içerik olarak görmüyor.

### TEMİZ (kayıp değil)
- `failureModes` (GLOBAL_NEGATIVES: morphing/extra-finger/watermark) + `negativeLock` (world-fizik) AYRIK,
  tekrar YOK, ikisi de ajana ulaşıyor. Çakışma yok. (world.negative_lock handoff.IMAGE'e merge edilmiyor ama
  ajan onu ayrı negativeLock alanından alıyor → kayıp değil.)

---
## AJAN 3 — MOTOR UYUMU ✅ bitti

### NET CEVAP: Sistem imageModel'e göre prompt talimatını DEĞİŞTİRMİYOR
- **`gpt_image` repoda SIFIR kez geçiyor** — sistem GPT Image'ı motor olarak HİÇ tanımıyor. UI'da bile seçilemez
  (DirectorStep.tsx:362-367 → 6 model: flux/nano/dall_e/imagen/ideogram/firefly; GPT yok).
- Motor-özel image maddesi TEK: `promptQuality.mined.json:77-89` → `engine.nano_banana_2` = 1 madde (numeric lens/f-stop).
  Diğer TÜM motorlar → `MINED.engine[key] ?? []` = **boş** (agentProtocol.ts:109).
- **Image tarafında prefix-fallback YOK** (motion'da VAR, :142). Tam eşleşmeyen imageModel madde alamaz.
- **= bugünkü motor-farkı bulgusu sisteme YANSIMIYOR.** GPT'ye de Nano'ya da AYNI statik kural-yüklü kontrat gider.
- TS↔mjs parite: mamilas-command.mjs:195 = agentProtocol.ts:109 birebir, promptQuality.test.ts byte-kilitli.

### MOTION tarafı SAĞLAM (image'in aksine)
- buildMotionPromptQualityContract (agentProtocol.ts:142): `motionEngine[key] ?? motionEngine[key.split('_')[0]]`
  → kling_3/turbo/o3 hepsi `kling`'e prefix-fallback ile düşüyor. SAĞLAM.
- engineDialect (engine.ts:97-100): 3 kademeli (tam→prefix→kling house-default). SAĞLAM.
- Kling "approved frame is truth" grammar (engine.ts:49) i2v yasasıyla birebir.

### ÇIKARIM (Mami kararı için): Image motor-uyumu neredeyse YOK. Bugünkü "Nano kural sever / GPT basit
### sever" gerçeği koda girmemiş. GPT hiç tanınmıyor. İMKAN: imageModel'e prefix-fallback + motor-özel
### madde seti (Nano=numeric-lens/çok-kural, akıcı-motor=sadeleştir). ⚠️ ölçülmemiş motora madde yazma = CLAUDE.md ihlali.

## AJAN 2 — PROMPT KALİTE KONTRATI ✅ bitti

### Kontrat 4 kaynaktan clause topluyor (agentProtocol.ts:105-110)
- MINED.universal (5, HEP) · MINED.animation (2, world /ANIMATION|STYLIZED/) · MINED.photoreal (1, /REAL|CINEMATIC|COMMERCIAL/)
  · MINED.engine[imageModel] (engine-gate, TEK key: nano_banana_2).

### B1 [ORTA] Image engine-gate ÖLÜ — nano_banana_2 dışı 6 motor SIFIR engine-clause
- agentProtocol.ts:109 tam-key eşleme, prefix-fallback YOK (motion'da :142 VAR). firefly_4/flux/dall_e/imagen/ideogram → boş.
- Firefly seçilince ajan HİÇ motor-lehçesi görmüyor (sayısal-lens dahil Nano'ya kilitli).

### B2 [ORTA] imageModel prompt GÖVDESİNİ hiç etkilemiyor — yalnız kontrat-gate + etiket
- brain.ts:2433 imageModel'i sadece pipeline-etiketi olarak basıyor. buildImagePrompt motor-agnostik.
- Çelişki: image-author.md:32 "numeric camera clause varsa" koşullu — Nano-dışı motorda clause hiç gelmez → talimat sessizce ölü.

### B3 [DÜŞÜK] DEPRECATED studio/image-author.md diskte, çelişen eski yasa taşıyor
- :31 "ready for Nano Banana 2" (motor-agnostik olmalı) + :8 SURGERY_DATA doğrudan-okuma (eski model). Ölü-madde riski.

### B4 [DÜŞÜK] Canlı image-author.md:62 approvedLessons varsayıyor — kontratta yok (hash-DIŞI sessionContext'te, kasıtlı)
### B5 [DÜŞÜK] mined.json overrideKeys tamamen ölü — kod .text'i map ediyor, overrideKeys ajana hiç gitmiyor (kasıtlı ama 17 maddeyi şişiriyor)

### 🔴 EKSİK MADDELER — bugün KANITLANDI ama mined.json'da YOK (Mami kararı için altın)
- **EKSİK-1 [telif-temiz stil reçetesi]:** "isim verme, stili tarif et, copyright-safe uydur" mined'de YOK.
  brain.ts:2097/1321 prompt gövdesinde var ama ajanın gördüğü kontrat maddesi DEĞİL. (One Piece telif-yeme dersi.)
- **EKSİK-2 [plastik/yüzey yasası]:** mined'de "hangi yüzey flat-cel" genel dersi var ama bugünkü SPESİFİK
  "ONE hard shadow, NO gradient/gloss/sheen" reçetesi YOK. photoreal anti-sheen sadece photoreal-gate'li, animation'a gelmiyor.
- **EKSİK-3 [image motor-farkı]:** Nano-sadık vs akıcı-motor ayrımı YOK (Ajan 3 ile aynı bulgu, çapraz-doğrulandı).

## AJAN 4 — RUNTIME HATA AVI (runner/mjs) ✅ bitti

### R1 [KRİTİK] --skip-image-jury yalnız --batch yolunda okunuyor; import/export/resume GÖRMÜYOR
- mjs:1580 `skipJury = args.includes(...)` TEK okuma, --batch içinde. import-frames(:1471), import-frame(:1496),
  exportImageBundle(:1442), loadFrame(:1440) hepsi options'SIZ çağırıyor → passingImageArtifacts(artifacts,{}) → author:null.
- Sonuç: juryless sahnede kare importu (:725 throw) + bundle export (:756 throw) + frame_jury input-hash (:485 throw) PATLIYOR.
- "batch --skip-image-jury üret → --import-frames getir" akışı UÇTAN UCA KIRIK. = dünkü işin yarım ucu (memory'de "runner forward eksik" notu).

### R2 [KRİTİK] Tekil-sahne --scene N resume, --skip-image-jury'yi yok sayıyor (aynı kök)
- mjs:1692 sceneStatus options'sız (batch :1617 geçiyor). Juryless mühürlü sahne tekil resume → nextAction({}) juryless
  dalını atlar → image_jury talep eder → sahne "tamamlanmadı" + expectedInputs kayar. Aynı command'de moda göre 2 farklı lifecycle.

### R3 [ORTA] TS↔mjs DRIFT: worldPacket.refs yokken hash ayrışması (byte-parite ihlali)
- mjs:847 `refs ?? []` → canonical "refs":[] · TS agentProtocol.ts:442 `refs?.filter` → undefined → anahtar atılır.
  İki farklı sceneContextHash → "stale/tampered" reddi. ŞÜPHE: toWorldPacket refs'i hep dizi set ediyor (pure.ts:507),
  fiili export'ta tetiklenmez; elle/legacy worldPacket'te sessiz red. Parite yasası gereği yine de kapatılmalı.

### R4 [ORTA] --import-frames sahne-eşleştirme regex ilk rakam bloğunu alıyor
- mjs:1457 `name.match(/(\d+)/)` → "2024-06-12-scene-5.png" → 2024 yakalar → sahne yok → skipped. Kullanıcı kareyi
  doğru getirse de "eksik sahne" raporlanır. Sessiz eksik teslim (patlamaz, izole).

### R5 [DÜŞÜK] exportImageBundle:768 juryHash null-güvensiz — R1 düzeltilince GİZLİ ÇÖKME açılır
- :759 jury null kabul ediyor ama :768 `jury.contentHash` koşulsuz. Bugün ulaşılamaz; skipJury export'a bağlanınca TypeError.
### R6 [DÜŞÜK/NOT] --clear-frame:1419 sessiz catch → orphan PNG kalabilir, "temizlendi" sanılır (kozmetik).

### TEMİZ (teyit): batch catch'leri TECHNICAL_ERROR'a çeviriyor (yutmuyor) · validateImageRenderLock cümle-düzeyi temiz (dünkü fix sağlam) · parseApprovedLessons/loadArtifacts kasıtlı.
### 🔑 R1+R2 AYNI KÖK: --skip-image-jury sadece batch'te türetiliyor. Tek fix iki KRİTİĞİ kapatır.

## AJAN 5 — PROMPT YOLU HATA AVI (brain/pure) ✅ bitti

### P1 [HIGH, gerçek-veri kanıtlı] `\b` + Türkçe harf → gece/gündüz markörleri SESSİZCE ÖLÜ
- JS `\b` ASCII, `ö ğ ı ş ç ü`'yü word-char saymıyor. brain.ts:1443-1444 CLOCK_RE `\b(...)\b` + NIGHT_BEAT_RE:1399.
- ÖLÜ markörler: `ay ışığı`(trailing ı), `öğle`/`öğlen`(leading ö), `akşam karanlığı`, `şafaktan önce`.
- **Kanıt (çalıştırıldı):** clockMap(["Ay ışığı gölgeleri uzattı"]) → ['day'] (gece→gündüz sanılıyor).
  clockMap(["Gece bastırdı","Öğle güneşi tepedeydi"]) → ['night','night'] (öğle saati güne çeviremiyor → öğle karesine
  isNight=true → scrubSunForNight meşru öğle-güneşini SİLİYOR).
- Not: dusk/dawn satırları `\b` KULLANMIYOR (:1441-1442) → şafak/akşamüstü çalışıyor. Tutarsızlık = kasıtsız hata.
- **= bugünkü gece-paleti sorununun İKİNCİ kökü** (B1 kanal kaybı + P1 tespit hatası birbirini besliyor).

### P2 [ORTA] Metaforik "karanlık" + son-markör-kazanır → gündüz sahne gece sayılıyor
- brain.ts:1443+1452. Kanıt: "Parlak öğle güneşi altında karanlık bir geçmiş" → night. "Gündüz vakti çocuk yıldızları çizdi" → night.
- yıldız/karanlık markörü mecaz/çizim bağlamını ayırmıyor. (P1'deki öğle-ölü hatası karşı-oyu da engelliyor → iki hata besleşiyor.)

### P3 [ORTA] Hex gate trailing `\b` → bitişik-hex sızıntısı (girdi kapısı + QA ikisi de)
- pure.ts:1187 (RECIPE_RAW_HEX) + qa.ts:33 (HEX_RE). Kanıt: "#ABC123X"→null, "#FF0000A"→null, "#12345"→null.
- Bitişik/malform hex hem girdi kapısını hem çıktı QA'sını atlatıyor. pure.ts:1183 "SAME shapes" yorumu YANLIŞ
  (hexToLightWords ^...$ ile, \b yok). Under-blocking (kaçak), over-blocking değil.

### P4b [ŞÜPHE] dusk sahnesinde güneş-scrub yok (isNight yalnız 'night', pure.ts:1536) — kasıtlı olabilir.
### TEMİZ: splitRenderLawPhysics bilinen kusur ailesinde, YENİ değil · generateBatch BLOCKED meşru sahne bloklamıyor (ters risk: hex kaçağı).

---

# ════════ TAM ÖZET — MAMİ KARARI İÇİN ════════

## GERÇEK BUG'LAR (kod hatası, düzeltilir) — severity sırası
1. **R1+R2 [KRİTİK, tek kök]** — --skip-image-jury sadece batch'te; import/export/resume kırık. Dünkü işin yarım ucu. TEK fix.
2. **B1(kanal) + P1(tespit) [KRİTİK, gece-paleti]** — gece sahnesi ajana gündüz paletiyle gidiyor. İKİ kök: worldPacket.paletteAsLight
   isNight'sız (pure.ts:506) + Türkçe-`\b` markör ölü (brain.ts:1443). = bugünkü T1. İki fix birlikte tam çözer.
3. **B2 [KRİTİK]** — sözleşme "motionCadence oku" diyor, IMAGE context taşımıyor (agentProtocol.ts:478 vs :428-444).
4. **R3 [ORTA]** — TS↔mjs refs hash drift (parite ihlali, latent).
5. **R4 [ORTA]** — import-frames regex ilk rakamı alıyor (sessiz eksik teslim).
6. **B1-kontrat [ORTA]** — image engine-gate fallback yok, 6 motor engine-clause'suz.
7. **P2/P3 [ORTA]** — metaforik-karanlık gece yanlış-pozitifi + bitişik-hex kaçağı.
8. **R5/R6/B3/B4/B5 [DÜŞÜK]** — latent null (R1 fix'iyle açılır), orphan PNG, deprecated md, ölü overrideKeys.

## EKSİK ZEKÂ (bugünkü dersler sisteme girmemiş — mined.json'a) — ⚠️ ölçülmüş olan girer
- EKSİK-1: telif-temiz stil reçetesi ("isim verme, stili tarif et") — One Piece telif-yeme dersi.
- EKSİK-2: plastik/yüzey yasası ("ONE hard shadow, NO gradient/gloss") — mat-cel dersi.
- EKSİK-3: image motor-farkı — sistem GPT'yi HİÇ tanımıyor (repoda gpt_image sıfır). ⚠️ ölçülmemiş motora madde=CLAUDE.md ihlali; önce ölç.

## ÖNERİ: 1(R1+R2) ilk — tek fix/iki kritik/dünkü devam/üretim akışını açar. Sonra 2(gece-paleti çift-kök).
## AJAN 4 — RUNTIME HATA AVI (runner/mjs) · koşuyor
## AJAN 5 — PROMPT YOLU HATA AVI (brain/pure) · koşuyor

---

## CANLI TEST-SÜRÜŞÜ BULGUSU — 2026-07-24 (Yerleşik Yönetmen, Kuvvet run fa5f34)

### D1 [KRİTİK · dünkü "boş yerler"in kökü] --director modunda storyboard onayı tek-sahneye düşüyor
- **Belirti:** Çift-tık (director) ile başlatılan 69-sahne koşusunda batch YALNIZ sahne 1'i yazdı,
  sahne 2-69 hepsi `AWAIT_STORYBOARD_APPROVAL` kaldı → prompt paketinde boş yerler. (Mami'nin dünkü şikâyeti.)
- **Kök:** `agents/runner.mjs:241` → `const batch = process.argv.includes('--batch')`. Ama `--director`
  modu (satır 282-283) batch'i argümanlardan ÇIKARIR (`--batch --launch` yerine geçer). Director'da
  argv'de `--batch` YOK → `batch=false` → onay sorusu tek-sahne dalına düşer (satır 243-244) ve
  `--all-scenes` EKLENMEZ (satır 248) → yalnız ilk bekleyen sahne (1) onaylanır.
- **Sonuç:** "tüm storyboard'u onayla" niyeti director modunda regresyona uğramış; tek-sahne kapısı geri gelmiş.
- **Önerilen tek-satır fix (AYRI OTURUM, kalite kapısı + iki runner.mjs mirror + runnerGate/commandRuntime testi):**
  `const batch = process.argv.includes('--batch') || process.argv.includes('--director');`
  Director bir batch (tüm-sahne) başlatmasıdır; onay sorusu da tüm-sahne olmalı.
- **Bu koşuda geçici çözüm (kod değil):** `--approve-storyboard --all-scenes` ile 69 storyboard elle
  onaylandı, sonra `--batch --launch --lanes 6` ile yeniden başlatıldı. Boşluk kalmadı.
- **DURUM:** Kaydedildi, Mami'nin fix onayı bekleniyor. Üretim ortasında koda DOKUNULMADI (test-sürüşü kuralı).
