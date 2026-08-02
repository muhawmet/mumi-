# TEMEL GÜÇLENDİRME — İŞ LİSTESİ
Kaynak: artifacts/denetim-2026-07-31/AGY-SISTEM-HATA-AVI.md (bağımsız hata avı, 2026-07-31)
Bu dosya o raporun SIKIŞTIRILMIŞ hâlidir. Bir maddeye başlamadan önce raporun
ilgili bölümünü aç — kanıt ve karşı kontrol orada.

## Sıra — bağımlılığa göre

Rapor kendi uygulanma sırasını `Claude için uygulanma sırası` (satır 496-505) altında veriyor.
Aşağıdaki numaralandırma o sırayı madde numaralarına bağlar.

1. **Madde 1** (hasat stdout kanalı) — P0. Tek başına yapılabilir; ama Madde 2 çözülmeden
   tam fayda vermez: rapor, Madde 2'deki proje hiç `Biten/`e girmediği için stdout kusuru
   düzeltilse bile uyarının doğmayacağını söylüyor (satır 248).
2. **Madde 2** (kapat → Biten → hasat zinciri) — P0. Madde 1 ile aynı zarar zincirini paylaşır;
   **birlikte ele alınmalı**.
3. **Madde 3 + Madde 4** (teslim uzantısı kanonu `.md`/`.txt` + motion lint kapıya bağlama) — P0,
   **birbirine bağlı**. Rapor Madde 4'ün 4. fix maddesinde `.md` motion kabulünün "yukarıdaki
   teslim-kanonu kararıyla birlikte ele alınsın; aksi halde linter yine uzantıdan kaçırılır"
   diyor (satır 342). Yani önce kanon, sonra/eşzamanlı lint bağlama.
4. **Madde 13 + Madde 14** (Windows shell hook kayıtları: SessionStart + PreTool gate) — P1,
   **aynı sınıf, birlikte**. Madde 1'in fix'i zaten `settings.json`'u Node kaydına çeviriyor;
   aynı dosyada aynı anda yapılır.
5. **Madde 10 + Madde 11** (`dunya-kilidi` sessiz fallback + protocol migration kısmi başarı) — P1,
   **aynı sınıf: sessiz fallback / kısmi başarı yerine açık kırmızı makbuz**.
6. **Madde 12 + Madde 15** (okunmamış rapor triage + claude-sync görünürlüğü) — P1,
   **ikisi de SessionStart'a salt-okur görünür yüzey ekler**. Otomatik merge/promotion yok.
7. **Madde 16 + Madde 17** (disk-ahead state görünümü + eski oy pusulası) — P2.
8. Bağımsız kalanlar, yukarıdaki grupların dışında sırasız: **Madde 5** (lint bypass receipt),
   **Madde 6** (protocolHash seal), **Madde 7** (matrix testi), **Madde 8** (Studio motion taslağı),
   **Madde 9** (ölü skill isimleri).

**Rapor kapanış şartı (satır 505):** "Her adımdan sonra gerçek hook stdout'u, Windows yolu ve
Git sync makbuzu ölçülmeden 'çözüldü' deme."

---

## P0 — 4 madde

### 1. ✅ KAPANDI (2026-08-02, `962074a` + kanal testi) — Kapanış-hasat uyarısı SessionStart'ta Claude bağlamına girmiyor

> **Kabul kriteri nasıl kanıtlandı:**
> 1. `hasat-gate.mjs:23` artık `process.stdout.write`. Canlı ölçüm: **stdout 1692 bayt /
>    stderr 0** (önce tam tersiydi).
> 2. `settings.json:32-36` hook'u `node` + `args` exec-form ile çağırıyor; `.sh` launcher
>    yolundan çıkıldı (dosya silinmedi, launcher paritesi duruyor).
> 3. Test yazıldı: `scripts/hasat-hook.test.mjs` — **6 test**, exit code'a değil KANALA bakıyor:
>    kaynakta `process.stderr.write` yok · stdout dolu ve stderr boş · her hâlde bir hüküm
>    basılıyor (🚨 / ✅ / ÖLÇEMEDİ) · bekleyen varsa `[hasat] 🚨` stdout'ta · kapı bloke etmiyor ·
>    settings.json kaydı `.sh`'a bağlı değil.
> 4. Canlı SessionStart makbuzu: kapı açılır açılmaz **üç gerçek bekleyen iş** bildirdi —
>    `Eşeyli ve Eşeysiz Üreme [ERROR]`, `Kuvvet MİRA [ERROR]`,
>    `Kuvvet ve Kuvvetin Ölçülmesi [STALE_N]`. Yani raporun iddia ettiği kayıp gerçekti.
>
> Yasak çözüme dokunulmadı: `APPROVED.md`'ye otomatik promote yok.

**Aşağısı kusurun ölçüm anındaki kaydıdır — tarihsel, artık geçerli değil.**

- **Kırık:** `hasat-gate.mjs` bütün SessionStart mesajlarını `process.stderr.write` ile yazıyor;
  Claude'a ulaşan kanal düz `stdout`.
- **Zarar:** Canlı ölçüm (31 Temmuz): `node .claude/hooks/hasat-gate.mjs` → `stdout bytes: 0`,
  `stderr bytes: 1692`. stderr'de üç gerçek bekleyen hasat problemi var —
  `Eşeyli ve Eşeysiz Üreme [ERROR]`, `Kuvvet MİRA [ERROR]`,
  `Kuvvet ve Kuvvetin Ölçülmesi [STALE_N]` — ve bunların hiçbiri modele gelmiyor; bir sonraki
  video önceki projenin ölçülmüş dersini hiç görmeden başlıyor.
- **Fix sınırı:**
  1. `hasat-gate.mjs` SessionStart mesajlarını `stdout`a yazmalı.
  2. `settings.json` bu hook'u shell launcher yerine platformdan bağımsız biçimde doğrudan Node
     ile çağırmalı:
     ```json
     {
       "type": "command",
       "command": "node",
       "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/hasat-gate.mjs"],
       "timeout": 30
     }
     ```
  3. Test yalnız exit code'u değil şunu kanıtlamalı: bekleyen hasat varken SessionStart
     `stdout`unda `[hasat] 🚨` var.
- **Kabul kriteri:** Kontrollü bekleyen-hasat fixture'ında hook stdout'u `[hasat] 🚨` içermeli,
  stderr tek başına başarı sayılmamalı; sonra gerçek Claude SessionStart'ta görünür delivery
  makbuzu alınmalı.
- **Yasak çözüm:** Adayları otomatik `APPROVED.md`ye taşımak. Bu Mami onayı kapısını delerek
  bankayı zehirler.
- **İlgili kanıt dosyaları:** `.claude/settings.json:34`,
  `.claude/hooks/hasat-gate.sh:16`, `.claude/hooks/hasat-gate.mjs:23`, `:31-61`,
  `.claude/hooks/oturum-durumu.mjs:4-13`, `scripts/buddy-hook.test.mjs:64-71`,
  `src/core/docsContract.test.ts:247-288`.
  *(Yolların başındaki fazladan eğik çizgi rapordan kopyalanmıştı ve onları mutlak yol yapıyordu —
  `scripts/baglar.mjs` yakaladı.)*
- **Rapor satırı:** 33

### 2. `kapandı` durumu, klasör taşınması ve hasat birbirinden kopuk

- **Kırık:** `cmdKapat` `status = 'kapandi'` atıyor ama projeyi `Biten/` altına taşımıyor ve
  klasör yoksa kapanışı reddetmiyor; `cmdBaslat` önceki state `kapandi` ise yeni projeye izin
  veriyor; `kapanis-hasadi.mjs` yalnız `Biten/` dizinini tarıyor.
- **Zarar:** Tekrarlanabilir kaçış — `kapat` → `baslat "ProjB"` → `kapanis-hasadi --check`.
  ProjA "kapandı" diye unutulur, revizeleri hiç hasat edilmez, Mami'ye aday gösterilmez,
  gelecek projeye tek ders geçmez. JSON elle bozma veya kötü niyet gerekmiyor; normal CLI
  sırası yeterli.
- **Fix sınırı:** `cmdKapat`te iki güvenli seçenekten biri seçilmeli:
  - klasörü yalnız Mami'nin açık kapanış eyleminde, hedefin doğruluğunu kontrol ederek `Biten/`
    altına taşı; **veya**
  - `Biten/` hedefi yoksa `kapandi` yazma; state `mami-bekliyor` kalsın ve açık
    `Biten/ + hasat` receipt'i olmadan `baslat`ı reddet.

  `--zorla` da bu koşulu görünür bir receipt olmadan bypass etmemeli. Bu, adayları otomatik
  onaylamak değildir; yalnız ölçüm yüzeyine girmeyi garanti eder.
- **Kabul kriteri:** rapor vermiyor.
- **İlgili kanıt dosyaları:** `scripts/current-work.mjs:526-562`, `:563-567`, `:407-445`;
  `scripts/kapanis-hasadi.mjs:767-772`, `:813`.
- **Rapor satırı:** 220

### 3. `_PROMPTLAR.md` kapanışı geçiyor, lintten kaçıyor, hasatta ölçülemez oluyor

- **Kırık:** Dört katman `.md` teslim dosyası karşısında birbirini yalanlıyor —
  `agents/PROMPT-YASASI.md:835-847` yalnız `.txt` der ·
  `scripts/current-work.mjs:53` `_promptlar.md`yi de geçerli teslim sayar ·
  `.claude/hooks/gate.sh:114-171` yalnız `*_PROMPTLAR*.txt`yi lint'e gönderir, `.md` sessizce
  `continue` olur · `scripts/kapanis-hasadi.mjs:149-158` yalnız `_PROMPTLAR.txt`yi hasat
  kaynağı kabul eder.
- **Zarar:** Diskte kanıtlı: `Biten/` altında `Kuvvet ve Kuvvetin Ölçülmesi_PROMPTLAR.md` ve
  `Eşeyli ve Eşeysiz Üreme_PROMPTLAR.md` var. Kaçış zinciri: lint hiç koşmaz → state `kapandi`
  yazar → hasat `PROMPT_MISSING` / ölçülemez sonuç verir. Normal dosya uzantısı seçimiyle
  oluyor; override ya da JSON müdahalesi gerekmiyor.
- **Fix sınırı:** Tek kanon seçilmeli. Mevcut Prompt Yasası ve hasat kanonu `.txt` olduğundan en
  dar güvenli yol:
  - `current-work`te `.md`yi teslim sayma;
  - gate ve hasatla aynı dosya seçiciyi ortak bir modüle çıkar;
  - eski `.md` dosyaları yalnız arşiv/çalışma notu olarak açıkça sınıflansın veya Mami seçimiyle
    canonical `.txt`e dönüştürülsün.

  Alternatif olarak `.md` resmi teslim yapılacaksa **üç katman birlikte** güncellenmeli: gate
  lint, current-work, hasat ve Prompt Yasası.
- **Kabul kriteri:** rapor vermiyor.
- **Yasak çözüm:** "Yalnız bir regex yaması ikinci gerçeklik üretir."
- **Rapor satırı:** 289

### 4. Motion kırmızı kuralları için yazılmış linter hiçbir kapıya bağlı değil

- **Kırık:** `scripts/motion-lint.mjs:1-48` sekiz kanıtlı kırmızı kural tanımlıyor ve `--strict`
  için açıkça "kapı için" diyor, `:403` çıktısının `gate.sh` tarafından parse edileceğini
  belirtiyor — ama gerçek `.claude/hooks/gate.sh`te `motion-lint`, `_MOTION` ya da `_MOTION.md`
  için **hiçbir çağrı yok**; kapı yalnız `_PROMPTLAR*.txt` tarıyor (`:106-185`).
- **Zarar:** `current-work.mjs:58` `_motion.txt`/`_motion.md` varlığını kapanış için yeterli
  sayıyor, `cmdKapat` içerik lint'i çağırmıyor, hasat kapanıştan sonra çalışıyor. Sonuç:
  `half a second later`, yazı yazdırma, yanlış kamera yapısı gibi linterin kırmızı dediği
  hatalar Kling'e gitmeden önce hiç durdurulmuyor — manuel karar öncesi deterministik yasaklar
  hiç ölçülmüyor.
- **Fix sınırı:**
  1. Canonical `_MOTION.txt` teslimini gate'e ekle.
  2. `node scripts/motion-lint.mjs "$file" --strict` kırmızıysa commit'i bloklasın.
  3. Kapanışta da aynı fonksiyon/çıktı kullanılsın; dosya varlığı tek başına "motion teslim
     edildi" sayılmasın.
  4. `.md` motion kabulü yukarıdaki teslim-kanonu kararıyla birlikte ele alınsın; aksi halde
     linter yine uzantıdan kaçırılır.
- **Kabul kriteri:** rapor vermiyor.
- **Rapor satırı:** 323

---

## P1 — 11 madde

### 5. Acil prompt-lint bypass'ı kalıcı receipt bırakmadan kapıyı yeşile çeviriyor

- **Kırık:** `.claude/hooks/gate.sh:119-127`de `MAMILAS_LINT_SKIP=1` verildiğinde teslim
  dosyalarını lint eden tüm `while` dalı atlanıyor; hook yalnız stderr'e
  `🟡 PROMPT LINT ATLANDI — MAMILAS_LINT_SKIP=1 verildi. / Gerekcesi commit mesajina YAZILMALI.`
  yazıyor.
- **Zarar:** Gate ne commit mesajını okuyor ne `current-work.json`, hasat manifesti ya da ayrı
  receipt yazıyor; bu bayrak ve uyarı için test de yok. Akış normal `✅ Gate yesil` satırına
  ulaşıyor. Sonradan "hangi video hangi kanıtlı yasağı bilerek geçti?" sorusunun güvenilir
  cevabı yok.
- **Fix sınırı:**
  - Bayrağı ancak bir gerekçe ve receipt id ile kabul et; receipt'i proje içine ya da audit
    ledger'a yaz.
  - Kapanış/hasat bu receipt'i görünür `LINT_BYPASSED` olarak taşısın; otomatik onay vermesin.
  - En az iki test: gerekçesiz skip kırmızı; gerekçeli skipte kalıcı receipt + görünür sarı
    durum var.
- **Kabul kriteri:** Yukarıdaki iki test (gerekçesiz skip kırmızı / gerekçeli skipte kalıcı
  receipt + görünür sarı durum).
- **Yasak çözüm:** "Bu Mami'nin acil kaçış yetkisini kaldırma çağrısı değildir." Sorun kaçışın
  sonradan normal yeşilden ayırt edilememesi.
- **Rapor satırı:** 94

### 6. Eski protocolHash taşıyan agent taslağı mühürlenebiliyor

- **Kırık:** `scripts/mamilas-command.mjs:1826-1847`deki `sealArtifactDraft()` taslağı okuyup
  yalnız kendi `contentHash`ini hesaplayarak yazıyor; taslağın `protocolHash`i güncel
  `agents/PROTOCOL.md` hash'iyle karşılaştırılmıyor.
- **Zarar:** PROTOCOL değiştikten sonra eski bir child-agent taslağı mühürlenir; insan "seal
  başarılı" makbuzu görür, koşu çok sonra `protocolHash stale/tampered` ile durur. Hata kaynağı
  üretim anı değil geç bir yürütme aşaması gibi görünür; yarım kalan sürdürmelerde teşhis
  maliyeti büyür. `commandRuntime.test.ts` protocol uyuşmazlığını run/verify yolunda test
  ediyor, seal yolunda eşdeğer stale-hash testi yok.
- **Fix sınırı:** `sealArtifactDraft` yazmadan önce kanonik protocol hash'i hesaplayıp taslaktaki
  hash ile eşleştirsin; farklıysa hiçbir çıktı yazmadan açık hata versin. Eksik hash de açık
  karar gerektirsin (legacy kabulü ancak görünür migrate yolu). İki test zorunlu: güncel hash
  seal olur; stale hash hedef dosya yaratmadan kırmızı verir.
- **Kabul kriteri:** Yukarıdaki iki zorunlu test.
- **Kapsam notu:** Bu P1 şu anki elle-Magnific üretimini değil, sistemde hâlâ sunulan
  `--seal-artifact`/runner kurtarma yolunu ilgilendirir.
- **Rapor satırı:** 128

### 7. Dünya×palet matrix testi `generateBatch` istisnalarını yutuyor

- **Kırık:** `src/core/brain.test.ts:3249` tüm dünya×palet kombinasyonlarında
  `generateBatch()` çağırıyor ama `try { out = generateBatch(...); } catch { continue; }` ile
  sarıyor.
- **Zarar:** Belirli bir world/palette verisi `generateBatch`i çökertirse `continue` o
  kombinasyonu testten tamamen çıkarır; test yine `offenders.length === 0` ile geçer. İstisna
  adedi, world id veya failure listesi assert edilmiyor. Bu hâlâ kaynakta mevcut.
- **Fix sınırı:** İstisnayı doğrudan fırlat ya da `failures[]` içinde world/palette ile toplayıp
  sonunda boş olduğunu assert et. Test, taranan kombinasyon sayısının
  `DATA.worlds × DATA.palettes` olduğunu ayrıca doğrulamalı. Amaç prompt zevkini kapılamak değil;
  testin "tüm matrix ölçüldü" iddiasını gerçek kılmak.
- **Kabul kriteri:** rapor vermiyor (fix sınırındaki assert'ler dışında).
- **Rapor satırı:** 155

### 8. Studio'nun görünür motion taslağı kendi linterine göre kırmızı

- **Kırık:** `src/store/useStudioStore.ts:1453-1510` `generateBatch()` sonucu
  `scene.motionPrompt`u state'e koyuyor; `src/pages/Timeline/TimelineStep.tsx:601-610` frame
  kapısı açıldıktan sonra bu metni **`▶ MOTION BRIEF AÇIK`** başlığı altında ekranda gösteriyor.
- **Zarar:** Canlı reproduksiyon — kanonik tek sahneli `generateBatch()` çalıştırıldı; elde
  edilen `scene.motionPrompt` **374 kelime** ve iki `[DIRECTOR TASK]` bloğu taşıyor.
  `lintMotionBlock()` üç kırmızı verdi: `kamera-yok`, `kuyruk`, `kelime-bandi`. Linterin kırmızı
  kelime duvarı 160-250 (`scripts/motion-lint.mjs:357-365`). `commandExport.ts:560-585` doğru
  biçimde `prompts.motion: null` export ediyor, ama `commandExport.ts:594-599` aynı taslağı
  `proofDoctor(... motionText: scene.motionPrompt)`a veriyor — acele eden ajan/kullanıcı onu
  çerçeve zanneder, QA sahte güven üretir.
- **Fix sınırı:**
  - Frame yokken Studio yalnız kısa, açıkça `MOTION AUTHORING BRIEF — motora yapıştırılmaz`
    bağlamını göstersin.
  - Frame onaylandıktan sonra görünür metin ya gerçek frame-aware author artifact'i olsun ya da
    durum `PENDING_FRAME_AWARE_MOTION` kalsın.
  - `proofDoctor`a pre-frame `scene.motionPrompt` değil yalnız final frame-hash bağlı motion
    artifact girsin.
  - Test: Studio'da gösterilen/QA'ya verilen motion metni varsa `lintMotionBlock` kırmızısı
    sıfır olmalı.
- **Kabul kriteri:** Yukarıdaki test — gösterilen/QA'ya verilen motion metninde `lintMotionBlock`
  kırmızısı sıfır.
- **Yasak çözüm:** "Bu, manuel yönetmeni kaldırmak değil; eski deterministik taslağın gerçek
  motion sanılmasını kapatmaktır."
- **Rapor satırı:** 179

### 9. Referans skill'i olmayan `mamilas-world` ve `mamilas-checkpoint`'e zorunlu yönlendiriyor

- **Kırık:** Hem `.claude/skills/mamilas-ref/SKILL.md` hem `.agents/skills/mamilas-ref/SKILL.md`
  referans ekleme başlamadan `mamilas-world`, kapanışta `mamilas-checkpoint` koşmayı emrediyor;
  bu iki skill mevcut kurulumda yok (ne `.claude/skills/`, ne `.agents/skills/`, ne Codex'in
  canlı skill listesinde).
- **Zarar:** Mami referans istediğinde ajan daha veri girmeden olmayan bir disipline yönlenir;
  kapanışta olmayan checkpoint'e çarpıp ya durur ya uydurma prosedür icat eder. Referans
  kimliği/7-katman işinin hassas olduğu aktif üretimde gerçek yönlendirme kopuğu.
- **Fix sınırı:** Skill yalnız gerçek bir üst beceriye yönlensin veya adları tamamen kaldırsın.
  Referans ekleme için zorunlu kalanlar: `SURGERY_DATA.json` hedefi, gerçek preview davranışı,
  ilgili testler ve mevcut `mamilas-gate`. `mamilas-world`/`mamilas-checkpoint` ancak gerçekten
  kurulacaksa önce canlı skill olarak teslim edilmeli. Parite testi içerik eşitliğini zaten
  koruyor; buna "skill içi zorunlu çağrı mevcut mu?" testi eklenmeli.
- **Kabul kriteri:** "Skill içi zorunlu çağrı mevcut mu?" testi.
- **Rapor satırı:** 202

### 10. `dunya-kilidi`, zorunlu kalite kanonu bozulunca sessizce daha zayıf REAL kuyruğu üretiyor

- **Kırık:** `scripts/dunya-kilidi.mjs:47` `agents/promptQuality.mined.json`ı "REAL register'ın
  zorunlu karşı-terimleri" diye tanımlıyor, ama `:63-64`teki geniş catch hatayı tamamen yutuyor:
  ```js
  let MINED = null;
  try { MINED = readJson('agents/promptQuality.mined.json'); } catch { MINED = null; }
  ```
- **Zarar:** `buildStyle()` (`:637-640`) REAL karşı-terimlerini bu kaynaktan koşullu ekliyor.
  Kaynak yokken hata, stderr uyarısı veya exit ≠ 0 yok; komut üç yapıştırılabilir satırı
  üretmeye devam ediyor, yalnız `negative fill, motivated light, subtle 35mm film grain,
  raw skin micro-texture` gibi ölçülmüş karşı-terimler sessizce düşüyor. Canlı sağlıklı koşuda
  `node scripts/dunya-kilidi.mjs deakins_naturalist --register=REAL` bu terimlerin eklendiğini
  raporluyor — veri dekoratif değil, manuel yönetmenin kullandığı gerçek kuyruğun parçası.
  `scripts/dunya-kilidi.test.mjs` 46 dünyanın çıktısını süpürüyor ama kanon okunamazken
  komutun durduğunu test etmiyor; `src/core/agentProtocol.ts` aynı JSON'u derleme anında zorunlu
  import ediyor — iki farklı güvenlik gerçeği.
- **Fix sınırı:** `promptQuality.mined.json` okunamazsa `dunya-kilidi` hiçbir
  `STYLE/LIGHT/NEGATIVE` stdout'u basmadan açık hata ve exit 2 ile durmalı. Ya da gerçekten
  opsiyonelse başlıktaki "zorunlu" hükmü kaldırılıp ayrı görünür `QUALITY_CANON_MISSING` durumu
  verilmelidir; sessiz fallback kabul edilemez. Test: bozuk/minimum fixture'ta stdout boş ve
  exit kırmızı; sağlıklı REAL dünyada karşı-terim korunur.
- **Kabul kriteri:** Bozuk/minimum fixture'ta stdout boş + exit kırmızı; sağlıklı REAL dünyada
  karşı-terim korunur.
- **Rapor satırı:** 443

### 11. Protocol migration bozuk dosyaları raporlamadan atlayıp `MIGRATED` başarısı dönüyor

- **Kırık:** `scripts/mamilas-command.mjs --migrate-command-context` iki döngüde bozuk JSON'u
  sessizce atlıyor (`scripts/mamilas-command.mjs:1399`, `:1416`):
  ```js
  try { value = JSON.parse(await readFile(join(migrationArtifactDir, name), 'utf8')); } catch { continue; }
  // ...
  try { receipt = JSON.parse(await readFile(join(migrationFramesDir, name), 'utf8')); } catch { continue; }
  ```
  Şema uyuşmazlığı da aynı biçimde `continue`.
- **Zarar:** Komut buna rağmen `COMMAND_CONTEXT_MIGRATED`, `validation: 'PASS'` ve yalnız sayısal
  `migratedWorkspace` döndürüyor; `skipped/corrupt/unsupported` listesi yok. Kullanıcı
  migration'ın tam olduğunu sanır, dosya eski protocol hash'iyle yerinde kalır; hata protocol
  değişiminin kökünde değil çok sonra sahne üzerinde ortaya çıkar. Mevcut testler
  (`batchResilience.test.ts:322+`) yalnız sağlıklı fixture zincirlerini test ediyor.
- **Fix sınırı:** Migration, parse/şema reddi olan her dosyayı `skipped[]`a dosya adı ve neden
  ile koymalı; liste boş değilse `validation: PARTIAL` dönmeli ve normal yeni koşu
  `FACT_REQUIRED` olmadan başlamamalı. Daha güvenlisi: hedef workspace'e hiçbir yazma yapmadan
  önce tüm giriş setini doğrulamak ve bozuk dosyada komple migration'ı açıkça durdurmak. Mevcut
  sahne-izolasyon davranışı korunabilir; yalnız "tam migration" makbuzu gerçeği söylemeli.
- **Kabul kriteri:** rapor vermiyor (bozuk artifact/frame varken migration'ın kırmızı ya da
  eksik-işaretli çıkması testi "eksik" olarak tespit edilmiş).
- **Rapor satırı:** 466

### 12. Okunmamış AGY/audit raporu yeni projede makbuzsuz atlanabiliyor

- **Kırık:** Okunmamış kritik raporların giriş kapısı yok —
  `agents/COMMAND-INBOX/Bekleyen/YENI-PROJE-BASLATMA-METNI.txt:31` yalnız metin içinde
  `artifacts/denetim-2026-07-31/BULGULAR.md`yi ve içindeki altı okunmamış raporu söylüyor;
  gerçek SessionStart kayıtları yalnız `buddy-gate.sh`, `oturum-durumu.mjs`, `hasat-gate.sh`
  (`.claude/settings.json:18-39`); `BULGULAR`/`OKUNMAMIŞ RAPOR` için okuma/triage makbuzu yok;
  `PROMPT-YASASI.md:907-917` yalnız bitmiş projeden aday çıkarmayı düzenliyor.
- **Zarar:** AGY ciddi bulgu üretir → `BULGULAR.md`ye düşer → sohbet clear olur ya da cihaz
  değişir → yeni proje açılır, Claude başlangıç metnindeki paragrafı atlar → sistem bunu ölçmez,
  aynı hata tekrar üretilir.
- **Fix sınırı:** Otomatik ders üretmek değil, **SessionStart'ta görünür triage makbuzu** eklemek:
  - okunmamış rapor varsa `stdout`a dosya listesi +
    `FACT REQUIRED: raporlar triage edilmeden yeni üretim kilidi açılmaz` yaz;
  - Mami/Claude hangi raporun `uygulanacak`, `reddedildi` veya `proje-yerel` olduğunu küçük bir
    receipt dosyasına kaydetsin;
  - ancak Mami onayladığı satırlar `APPROVED.md`ye taşınsın.
- **Kabul kriteri:** rapor vermiyor.
- **Yasak çözüm:** Otomatik ders üretmek. Ayrıca kapı mevcut projenin üretimini durdurmak için
  değil, clear sonrası bilinen ölçümü kaybetmemek için var.
- **Rapor satırı:** 261

### 13. Windows'ta doğrudan `.sh` SessionStart hook'ları tek hata noktası

- **Kırık:** `settings.json:23` `buddy-gate.sh`ı, `:34` `hasat-gate.sh`ı doğrudan executable
  olarak kaydediyor; `buddy-gate.sh:4-6` kendi yorumunda Windows birincil ortamda `.sh` ve
  çıplak proje yolunun kırılgan olduğunu söylüyor; `oturum-durumu.mjs:8-13` Windows'ta `.sh`
  hook'larının 126 verdiğini ve bu yüzden kendisinin `node` ile çağrıldığını yazıyor.
- **Zarar:** Windows'a gidildiğinde Buddy ve hasat SessionStart yüzeyleri hiç doğmayabilir; test
  yeşil kalır çünkü `src/core/docsContract.test.ts:235-288` yalnız `.sh` kayıtlarını regex ile
  topluyor ve Git index `100755` modunu yeterli sayıyor — hook'un o makinede gerçekten başlayıp
  bağlama teslim ettiğini ölçmüyor.
- **Fix sınırı:**
  - SessionStart'taki iki shell launcher da `node` + `.mjs` hedefiyle kaydedilsin.
  - Meta-duvar `command` kadar `args` içindeki `.mjs` hedefini de doğrulasın.
  - Windows'ta gerçek Claude SessionStart delivery testi eklensin: Buddy protokolü ve hasat
    uyarısı modele ulaşan `stdout`ta görülmeli.
- **Kabul kriteri:** Windows'ta gerçek Claude SessionStart'ta Buddy protokolü ve hasat uyarısının
  modele ulaşan `stdout`ta görülmesi.
- **Rapor satırı:** 346

### 14. Windows'ta PreTool kalite kapısının kendisi doğrudan `.sh` olarak kayıtlı

- **Kırık:** `.claude/settings.json:12` PreToolUse'ta doğrudan `gate.sh` çağırıyor; `gate.sh`
  saf Bash (`#!/bin/bash`, `set -uo pipefail`, `case`, command substitution) ve tsc → vitest →
  build → prompt lint → state/sync kontrollerini bu dosyada tutuyor. Ayrıca `gate.sh:51`,
  `CLAUDE_PROJECT_DIR` yanlış/çözülemezse `cd ... || exit 0` yapıyor.
- **Zarar:** Windows Claude Code `.sh`i başlatamazsa veya proje kökü yanlış çözülürse PreTool
  kalite duvarı çalışmaz: tsc, Vitest, build, prompt/motion lint, state drift ve sync uyarıları
  commit öncesinde hiç ölçülmez; test yine yeşil görünür. `cd ... || exit 0` kapının kendi
  "kör kapı bloke etmeli" kuralıyla çelişiyor.
- **Fix sınırı:** Çözüm shell yolunu varsaymak değil, gate'in platformdan bağımsız Node
  entrypoint'ini yazıp settings'te `node <entrypoint>` olarak kaydetmektir.
- **Kabul kriteri:** Gerçek Windows Claude PreToolUse olayında bozuk bir TypeScript dosyasının
  commit'i engellenmeli.
- **Ayrım notu:** Bu bulgu SessionStart Buddy/hasat bulgusundan (Madde 13) ayrıdır: kaybolursa
  üretim desteği değil, commit öncesi kalite kapısı kaybolur.
- **İlgili kanıt dosyaları:** `CLAUDE.md:89-94`, `oturum-durumu.mjs:8-13`,
  `docsContract.test.ts:235-288`.
- **Rapor satırı:** 369

### 15. Claude hafıza sync'i yeni oturumda kontrol/geri yükleme yüzeyine bağlı değil

- **Kırık:** `scripts/claude-sync.mjs` üç yönlü ve silmeyen tasarlanmış, iki taraf değiştiğinde
  doğru duruyor — ama `settings.json` SessionStart listesinde sync kontrolü yok ve
  `.claude/hooks/gate.sh:202-214` sync sapmasını yalnız `stderr`e uyarı olarak basıp commit'i
  bloklamıyor.
- **Zarar:** Canlı makbuz (bu Mac'te `node scripts/claude-sync.mjs --check`): 34 dosya eşit,
  6 dosya repo → canlı bekliyor, 12 dosya canlı → repo bekliyor, **4 çatışma**: `MEMORY.md`,
  aktif üretim durumu, Buddy persona, Mami kişisel notu. Mac'teki yeni hafıza/skill repo'ya
  taşınmadan veya Windows'ta repo içeriği canlı `~/.claude`ya çekilmeden yeni oturum başlayabiliyor.
- **Fix sınırı:**
  1. SessionStart'ta **salt-okur** `claude-sync --check` sonucu Claude'a `stdout`tan görünür olsun.
  2. Sapma/çatışma varsa "sync bitti" yalanı yerine açık `SYNC FACT REQUIRED` yüzeyi oluşsun.
  3. Çatışma çözümü otomatik yapılmasın. Mami seçiminden sonra `claude-sync` → yalnız ilgili sync
     dosyaları commit/push → Windows'ta pull → kontrollü canlıya çekme akışı kalsın.
- **Kabul kriteri:** rapor vermiyor.
- **Yasak çözüm:** Otomatik merge. "Bu raporda 'otomatik merge' istenmiyor; çatışmada Mami seçimi
  doğru kural."
- **Rapor satırı:** 394

---

## P2 — 2 madde

### 16. Aktif iş kaydı diskten geride kalabiliyor

- **Kırık:** `node scripts/current-work.mjs --check` bu aktif proje için exit `1` verdi: kayıt
  `REFERANSLAR`, `EDIT-PLAN`, `SESLENDIRME`, `SUNO` için `yok` diyor, aynı dosyalar diskte var,
  kayıt hâlâ `iş açıldı — henüz ölçülmüş bir çıktı yok` yazıyor.
- **Zarar:** `oturum-durumu.mjs` bu kaydı SessionStart'ta Claude'a otorite olarak veriyor. Hata
  tamamen gizli değil (Yönetmen skill'i "kayıtla disk çelişirse DİSK kazanır" diyor), ama yeni
  oturum gereksiz yeniden üretim veya yanlış "sıradaki adım" riski taşıyor.
- **Fix sınırı:**
  - Mid-production commit'i bloklama; bu aşamada drift doğal.
  - SessionStart görünümünde `KİT eksik` ile `disk kayıttan ileride` ayrımı daha sert olmalı:
    `DISK AHEAD — state'i ilerletmeden yeni üretim başlatma`.
  - Claude her somut teslim parçasından sonra mevcut `current-work.mjs ilerle` yolunu çağırmalı;
    yeni paralel state üretme.
- **Kabul kriteri:** rapor vermiyor.
- **Yasak çözüm:** Mid-production commit'i bloklamak. (Ayrıca genel: "her state drift'i commit'i
  bloklasın" çözümü raporda açıkça reddedildi.)
- **Rapor satırı:** 423

### 17. Onay bekleyen oy pusulası, dolu ders bankasını hâlâ "0 ders" sanıyor

- **Kırık:** `agents/lessons/ONAY-BEKLEYEN.md` ilk paragrafta `APPROVED.md bugün 0 ders taşıyor`
  diyor; gerçek kanonik `agents/lessons/APPROVED.md` yedi Mami-onaylı ders içeriyor (ilki bugün
  bitirilen **Birlikte Daha Güçlüyüz** işinden).
- **Zarar:** Yeni bir ajan/Claude "banka boş" zannıyla aynı dersleri tekrar adaylaştırabilir veya
  öğrenmenin aktarılmadığını sanabilir. (Dosya otomatik runtime kanonu değil.)
- **Fix sınırı:** Oy pusulası üretildiği anın sayımıdır; ya güncel sayıyı hiç yazmamalı ya da
  onay transferi gerçekleşince başlığı/referansları güncellenmeli. `APPROVED.md` tek otorite
  olarak açıkça işaretlenmeli.
- **Kabul kriteri:** rapor vermiyor.
- **Rapor satırı:** 488

---

## RAPORUN KENDİ ŞÜPHELERİ

**Kapsam sınırı (satır 4-5):** Rapor video promptlarını kapsamıyor; yalnız öğrenme/özümseme,
SessionStart, hook, state ve Mac → Git → Windows hattı. Hiçbir dosya değiştirilmedi.

**Kanıt seviyesi tam "doğrulandı" olmayan maddeler (özet tablosu, satır 11-29):**
- Madde 13 (Windows SessionStart `.sh`): *"kod kanıtı güçlü, Windows'ta canlı delivery testi
  eksik"*. Bölüm sonu (satır 365): "Bu P1'in platform kısmı Windows'ta henüz yeniden canlı
  ölçülmedi; fakat aynı repodaki kod yorumları ve testin bilinçli skip'i ciddi kanıt oluşturuyor."
- Madde 14 (Windows PreTool gate): *"kod kanıtı güçlü, Windows'ta canlı execution testi eksik"*.
  Bölüm (satır 386-388): "Bu çalışma ortamında Windows process kanıtı yok; bu nedenle 'şu an
  kesin kapalı' değil, **Windows'a geçmeden giderilmesi gereken P1**dir."
- Madde 10 (`dunya-kilidi`): *"kod kanıtı güçlü"* — canlı bozuk-fixture koşusu yapılmadı.
- Madde 8 (Studio motion): *"canlı reproduksiyon"*.
- Madde 15 (claude-sync): *"canlı sapma/çatışma görüldü"*.
- Madde 16 (state drift): *"canlı reproduksiyon, ama uyarı görünür"*.
- Madde 17 (oy pusulası): *"canlı içerik çelişkisi"*.

**Açıkça reddedilen alarmlar — iş listesine ALINMADI (satır 507-511):**
- AGY'nin ilk "hasat hook dosyası yok" alarmı yanlıştı; `.sh` launcher var, çalıştırılabilir ve
  yalnız Node'a delege ediyor. Asıl kusur stdout/stderr teslimi (Madde 1).
- `@kaval` gibi video-asset sayım notları bu sistem raporuna alınmadı; üretim hattı mimarisini
  kıran kanıt değildi.
- AGY'nin "her state drift'i commit'i bloklasın" çözümü reddedildi; yarım üretimde drift doğal.
  Doğru çözüm görünür ve doğru yönlendirilmiş state reconciliation.
- Day-zero raporunun "`check-assets3d.mjs` arşivlenmiş ve üç Vitest testi patlıyor" iddiası
  güncel repoda geçersiz: `scripts/check-assets3d.mjs` bugün mevcut (satır 173-175).
- Önceki `agy-25-onarim-denetimi.txt` raporunun `git commit -a`, rename ve okunamayan register
  alarmları bu loga taşınmadı; mevcut `gate.sh` bunların karşılığını içeriyor (satır 116-118).
- AGY'nin "ham `git commit` metin filtresi `rtk` nedeniyle kesin bypass" iddiası reddedildi:
  mevcut kanıt komutun bu stringi taşımadığını göstermiyor. Ancak ayrı gerçek event payload
  testiyle P1'e yükselebilir (satır 390).

**Yeşil-test karşı kanıtı (satır 82-90):** `npx vitest run scripts/buddy-hook.test.mjs
src/core/docsContract.test.ts` 76/76 geçti. Bu Madde 1'i çürütmez; test boşluğunu sınırlar —
hasat/oturum-durumu için child-process + `stdout` assertion'ı yok, meta-duvar yalnız `.sh` yolunu,
dosya varlığını ve Git executable modunu doğruluyor. "Testler yeşil, hook doğru" sonucu geçersiz.
