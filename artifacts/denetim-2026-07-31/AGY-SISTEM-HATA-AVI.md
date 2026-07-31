# MAMILAS — AGY Sistem Hata Avı

**Tarih:** 2026-07-31  
**Kapsam:** video promptları değil; Claude’un öğrenme/özümseme, SessionStart, hook, state ve Mac → Git → Windows hattı.  
**Çalışma biçimi:** AGY (`gemini-3.6-flash-high`, `--mode plan`) bağımsız red-team karşı okumaları yaptı. Her alarm kaynak kod ve canlı komutla ayrıca çürütülmeye çalışıldı. Bu dosyada yalnız sağ kalanlar var. Hiçbir dosya değiştirilmedi.

## Hüküm

Sistemin kalıcı beyni **var**: `PROMPT-YASASI.md`, `APPROVED.md`, `current-work.json` ve iki yönlü Claude sync tasarlanmış. Ama öğrenmenin “son projeden yeni oturuma” halkasında iki doğrulanmış kör nokta var. Bunlar çözülmeden sistem, önemli bir bulguyu üretebilir ama Claude’a/Mami’ye ulaştıramayabilir.

| Öncelik | Kırık | Durum |
|---|---|---|
| P0 | Kapanış-hasat uyarısı SessionStart’ta Claude bağlamına girmiyor | **doğrulandı** |
| P0 | `kapandı` durumu klasör Biten/ ve hasat ölçümünden bağımsız atılabiliyor | **doğrulandı** |
| P0 | `_PROMPTLAR.md` kapanışı geçiyor, lintten kaçıyor, hasatta ölçülemez oluyor | **doğrulandı** |
| P0 | Motion kırmızı kuralları için yazılmış linter hiçbir kapıya bağlı değil | **doğrulandı** |
| P1 | Acil prompt-lint bypass'ı kalıcı receipt bırakmadan kapıyı yeşile çeviriyor | **doğrulandı** |
| P1 | Eski protocolHash taşıyan agent taslağı mühürlenebiliyor; hata geç ve belirsiz patlıyor | **doğrulandı** |
| P1 | Dünya×palet matrix testi `generateBatch` istisnalarını yutarak yanlış yeşil verebiliyor | **doğrulandı** |
| P1 | Studio, frame kapısı açılınca kendi motion linter'ından kırmızı alan eski taslağı gösteriyor | **canlı reproduksiyon** |
| P1 | Referans skill'i olmayan `mamilas-world` ve `mamilas-checkpoint` becerilerine zorunlu yönlendiriyor | **doğrulandı** |
| P1 | `dunya-kilidi`, zorunlu kalite kanonu bozulunca sessizce daha zayıf REAL kuyruğu üretir | **kod kanıtı güçlü** |
| P1 | Protocol migration, bozuk artifact/frame dosyalarını raporlamadan atlayıp `MIGRATED` başarısı döndürür | **doğrulandı** |
| P1 | Okunmamış AGY/audit raporu yeni projede makbuzsuz atlanabiliyor | **doğrulandı** |
| P1 | Windows’ta doğrudan `.sh` SessionStart hook’ları platform riskini taşıyor; test bunu yeşil sanabiliyor | kod kanıtı güçlü, Windows’ta canlı delivery testi eksik |
| P1 | Windows’ta PreTool kalite kapısının kendisi doğrudan `.sh` olarak kayıtlı | kod kanıtı güçlü, Windows’ta canlı execution testi eksik |
| P1 | Claude hafıza sync’i yeni oturumda kontrol/geri yükleme yüzeyine bağlı değil | **canlı sapma/çatışma görüldü** |
| P2 | Aktif iş kaydı diskten geride kalabiliyor | **canlı reproduksiyon**, ama uyarı görünür |
| P2 | Onay bekleyen oy pusulası, artık dolu olan ders bankasını hâlâ “0 ders” sanıyor | **canlı içerik çelişkisi** |

---

## P0 — Hasat ölçüyor ama Claude’a konuşmuyor

### Kanıt

1. `/.claude/settings.json:34` SessionStart’ta `hasat-gate.sh` çağırıyor.
2. `/.claude/hooks/hasat-gate.sh:16` ince launcher olarak Node’daki gerçek hook’u çağırıyor; launcher dosyası kayıp değil.
3. Asıl hook `/ .claude/hooks/hasat-gate.mjs:23` bütün mesajları şu kanala yazıyor:

```js
const say = (s) => process.stderr.write(`${s}\n`);
```

4. Aynı repodaki SessionStart kanalı sözleşmesi bunu doğrudan tanımlıyor: `.claude/hooks/oturum-durumu.mjs:4-13` düz **stdout**’un Claude’a ulaştığını, `hasat-gate.sh`ın eski davranışının “0 bayt stdout, exit 0” sessizliği olduğunu söylüyor.
5. Hasat hook’unun bekleyen proje, hata ve yönlendirme satırlarının tamamı `say(...)` üzerinden gidiyor (`hasat-gate.mjs:31-61`). Yani hook çalışsa bile Claude’un oturum bağlamı bu uyarıyı görmüyor.

**Canlı ölçüm (31 Temmuz):** aktif repoda `node .claude/hooks/hasat-gate.mjs` çalıştırıldığında `stdout bytes: 0`, `stderr bytes: 1692` çıktı. stderr'in ilk satırları gerçek üç bekleyen hasat problemini taşıyor: `Eşeyli ve Eşeysiz Üreme [ERROR]`, `Kuvvet MİRA [ERROR]`, `Kuvvet ve Kuvvetin Ölçülmesi [STALE_N]`. Yani bu soyut bir hata senaryosu değil; model bağlamına girmeyen gerçek bekleyen öğrenme kuyruğu var.

### Gerçek zarar zinciri

1. Video `Biten/`e taşınır; hasat aday/hata üretir.
2. Yeni Claude oturumu başlar.
3. Hook terminal `stderr`ine “HASAT BEKLEYEN PROJE VAR” basar, fakat modele bağlam olarak gelmez.
4. Mami’ye adaylar gösterilmez; ders `APPROVED.md`ye taşınmaz ya da hasat hatası çözülmez.
5. Bir sonraki video, önceki projenin ölçülmüş dersini hiç görmeden başlar.

Bu, “rapor üretip okumamak ölçüm biriktirmektir” hatasının sistem seviyesindeki karşılığıdır.

### Karşı kontrol

AGY’nin ilk alarmı “`hasat-gate.sh` dosyası yok”tu. **Reddedildi:** dosya var, çalıştırılabilir ve yalnız Node’a delege ediyor. Kırık dosya varlığı değil; **çıktının yanlış kanalda olması**.

### Dar fix sınırı

1. `hasat-gate.mjs` SessionStart mesajlarını `stdout`a yazmalı.
2. `settings.json` bu hook’u shell launcher yerine platformdan bağımsız biçimde doğrudan Node ile çağırmalı:

```json
{
  "type": "command",
  "command": "node",
  "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/hasat-gate.mjs"],
  "timeout": 30
}
```

3. Test yalnız exit code’u değil şunu kanıtlamalı: bekleyen hasat varken SessionStart `stdout`unda `[hasat] 🚨` var.

**Yasak çözüm:** adayları otomatik `APPROVED.md`ye taşımak. Bu Mami onayı kapısını delerek bankayı zehirler.

### Yeşil-test karşı kanıtı (31 Temmuz canlı)

`npx vitest run scripts/buddy-hook.test.mjs src/core/docsContract.test.ts` **76/76 geçti**. Bu P0'ı çürütmez; tam tersine test boşluğunu sınırlar:

- Buddy testi Node child process'ini çalıştırıp SessionStart **stdout** metnini bizzat assert ediyor (`scripts/buddy-hook.test.mjs:64-71`).
- Hasat/oturum-durumu için test dosyalarında eşdeğer child-process ve `stdout` assertion'ı yok.
- Meta-duvar yalnız settings içindeki `.sh` yolunu, dosya varlığını ve Git executable modunu doğruluyor (`docsContract.test.ts:247-288`); hook'un stdout/stderr kanalını ya da Claude'a teslimini ölçmüyor.

Dolayısıyla burada "testler yeşil, hook doğru" sonucu geçersizdir. Kabul kriteri: kontrollü bekleyen-hasat fixture'ında hook stdout'u `[hasat] 🚨` içermeli, stderr tek başına başarı sayılmamalı; sonra gerçek Claude SessionStart'ta görünür delivery makbuzu alınmalıdır.

---

## P1 — Acil lint atlama düğmesi denetlenebilir iz bırakmıyor

### Kanıt

`.claude/hooks/gate.sh:119-127`de `MAMILAS_LINT_SKIP=1` olduğunda teslim dosyalarını lint eden tüm `while` dalı atlanıyor ve hook yalnız terminale/stderr'e şunu yazıyor:

```sh
🟡 PROMPT LINT ATLANDI — MAMILAS_LINT_SKIP=1 verildi.
Gerekcesi commit mesajina YAZILMALI.
```

Ancak gate ne commit mesajını okuyor ne `current-work.json`, hasat manifesti veya ayrı bir receipt dosyası yazıyor. Arama sonucu bu bayrak ve uyarı için bir test de yok. Aynı akış sonunda normal `✅ Gate yesil` satırına ulaşır. Dolayısıyla "gerekçe yazılmalı" mekanik bir koşul değil, yalnız dilekçe.

### Gerçek zarar zinciri

1. Kırmızı prompt lint sonucunda Claude/Mami yetişmek için geçici bayrağı kullanır.
2. Commit geçer; lint kırmızısı ve nedeni state/hasat/commit makinesince ayırt edilemez.
3. `current-work kapat` dosya varlığını kabul eder; P0 motion ölçüm boşluğuyla birlikte teslim daha da kolay kapanır.
4. Sonradan "hangi video hangi kanıtlı yasağı bilerek geçti?" sorusunun güvenilir cevabı yoktur.

Bu Mami'nin acil kaçış yetkisini kaldırma çağrısı değildir. Sorun, kaçışın sonradan normal yeşilden ayırt edilememesidir.

### Karşı kontrol

Önceki `agy-25-onarim-denetimi.txt` raporunun `git commit -a`, rename ve okunamayan register alarmlarını **bu loga taşımadık**: mevcut `gate.sh` bunların karşılığı olarak çalışma ağacı + staged birleşimini, `R` filtresini ve register okunamazsa `fail`i içeriyor. Sağ kalan tek bulgu, kodda hâlâ bulunan ve test/makbuzla örtülmeyen `MAMILAS_LINT_SKIP` dalıdır.

### Dar fix sınırı

- Bayrağı ancak bir gerekçe ve receipt id ile kabul et; receipt'i proje içine ya da audit ledger'a yaz.
- Kapanış/hasat bu receipt'i görünür `LINT_BYPASSED` olarak taşısın; otomatik onay vermesin.
- En az iki test: gerekçesiz skip kırmızı; gerekçeli skipte kalıcı receipt + görünür sarı durum var.

---

## P1 — Agent taslağı mühüründe protocolHash kapısı eksik

### Kanıt

`scripts/mamilas-command.mjs:1826-1847`deki `sealArtifactDraft()` taslağı okuyup yalnız kendi `contentHash`ini hesaplayarak yazıyor:

```js
const draft = JSON.parse(await readFile(draftPath, 'utf8'));
const { contentHash: _ignored, ...body } = draft;
const sealed = { ...body, contentHash: canonicalHash(body) };
await writeFile(output, JSON.stringify(sealed, null, 2), 'utf8');
```

Burada taslağın `protocolHash`i güncel `agents/PROTOCOL.md` hash'iyle karşılaştırılmıyor. Aynı scriptin aşağı akışındaki `verifyArtifact()` ise protocolHash uyumsuzluğunu kırmızı görüyor; yani sistem yanlış taslağı erken reddetmek yerine onu geçerli görünüşlü şekilde diske mühürleyip daha sonra batch/runner noktasında durduruyor. `commandRuntime.test.ts` protocol uyuşmazlığını run/verify yolunda test ediyor; seal yoluna ait eşdeğer stale-hash testi yok.

### Gerçek zarar

PROTOCOL değiştikten sonra eski bir child-agent taslağı mühürlenebilir. İnsan “seal başarılı” makbuzu görür; koşu daha sonra `protocolHash stale/tampered` ile durur. Hata kaynağı taslağın üretildiği an değil, çok daha geç bir yürütme aşaması gibi görünür; özellikle yarım kalan sürdürmelerde teşhis maliyeti büyür.

### Dar fix sınırı

`sealArtifactDraft` yazmadan önce kanonik protocol hash'i hesaplayıp taslaktaki hash ile eşleştirsin; farklıysa hiçbir çıktı yazmadan açık hata versin. Eksik hash de açık karar gerektirsin (legacy kabulü ancak görünür migrate yolu). İki test zorunlu: güncel hash seal olur; stale hash hedef dosya yaratmadan kırmızı verir.

Bu P1, şu anki elle-Magnific üretimini değil, sistemde hâlâ sunulan `--seal-artifact`/runner kurtarma yolunu ilgilendirir.

---

## P1 — Matrix testi üretim çöküşünü sessizce örtebiliyor

### Kanıt

`src/core/brain.test.ts:3239-3277` tüm dünya×palet kombinasyonlarında `generateBatch()` çağırıyor, fakat çağrıyı şu dal ile sarıyor:

```ts
try {
  out = generateBatch(...);
} catch { continue; }
```

Bu testin iddiası her kombinasyonda çelişkili ışık emrinin taşınmadığını kanıtlamak. Belirli bir world/palette verisi `generateBatch`i çökertecek hâle gelirse `continue` o kombinasyonu testten tamamen çıkarır; test yine `offenders.length === 0` ile geçebilir. Bu hâlâ kaynakta mevcut. İstisna adedi, world id veya failure listesi de assert edilmiyor.

### Dar fix sınırı

İstisnayı doğrudan fırlat ya da `failures[]` içinde world/palette ile toplayıp sonunda boş olduğunu assert et. Test, taranan kombinasyon sayısının `DATA.worlds × DATA.palettes` olduğunu ayrıca doğrulamalı. Amaç prompt zevkini kapılamak değil; testin “tüm matrix ölçüldü” iddiasını gerçek kılmak.

### Reddedilen eski alarm

Day-zero raporunun `check-assets3d.mjs` arşivlenmiş ve üç Vitest testi patlıyor iddiası güncel repoda **geçersizdir**: `scripts/check-assets3d.mjs` bugün mevcut. Bu rapora taşınmadı.

---

## P1 — Studio'nun görünür motion taslağı kendi ölçenine göre kırmızı

### Canlı reproduksiyon

`src/store/useStudioStore.ts:1453-1510` Studio'da `generateBatch()` sonucu olan `scene.motionPrompt`u state'e koyuyor. `src/pages/Timeline/TimelineStep.tsx:601-610` frame kapısı açıldıktan sonra bu metni **`▶ MOTION BRIEF AÇIK`** başlığı altında doğrudan ekranda gösteriyor.

Kanonik, kaynak-bağlı tek sahneli bir `generateBatch()` çalıştırıldı; elde edilen `scene.motionPrompt` **374 kelime** ve iki `[DIRECTOR TASK]` bloğu taşıyor. Aynı metin `lintMotionBlock()` ile üç kırmızı verdi: `kamera-yok`, `kuyruk`, `kelime-bandi`. Linterin kırmızı kelime duvarı 160-250 (`scripts/motion-lint.mjs:357-365`); taslak 374 kelime.

### Sınır / neden bu yine gerçek

`commandExport.ts:560-585` doğru biçimde `prompts.motion: null` export ediyor: taslak final motor promptu olarak Command JSON'a taşınmıyor. Ama Timeline bunu kullanıcıya kapı açıldıktan sonra görünür biçimde sunuyor ve `commandExport.ts:594-599` aynı taslağı `proofDoctor(... motionText: scene.motionPrompt)`a veriyor. Görünür "brief açık" metni ile kendi kırmızı ölçeni çelişiyor; acele eden ajan/kullanıcı onu çerçeve zannedebilir ve QA sahte güven hissi üretebilir.

### Dar fix sınırı

- Frame yokken Studio yalnız kısa, açıkça `MOTION AUTHORING BRIEF — motora yapıştırılmaz` bağlamını göstersin.
- Frame onaylandıktan sonra görünür metin ya gerçek frame-aware author artifact'i olsun ya da durum `PENDING_FRAME_AWARE_MOTION` kalsın.
- `proofDoctor`a pre-frame `scene.motionPrompt` değil yalnız final frame-hash bağlı motion artifact girsin.
- Test: Studio'da gösterilen/QA'ya verilen motion metni varsa `lintMotionBlock` kırmızısı sıfır olmalı.

Bu, manuel yönetmeni kaldırmak değil; eski deterministik taslağın gerçek motion sanılmasını kapatmaktır.

---

## P1 — Referans ekleme rotası ölü beceri isimleri veriyor

### Kanıt

Hem `.claude/skills/mamilas-ref/SKILL.md` hem `.agents/skills/mamilas-ref/SKILL.md` referans ekleme başlamadan `mamilas-world`, kapanışta da `mamilas-checkpoint` koşmayı emrediyor. Bu iki skill mevcut kurulumda yok: ne `.claude/skills/`, ne `.agents/skills/`, ne de Codex'in canlı skill listesinde çalıştırılabilir karşılığı var.

### Etki

Mami referans istediğinde ajan daha veri girmeden olmayan bir disipline yönlenebilir; kapanışta da olmayan checkpoint'e çarpıp ya durur ya da uydurma prosedür icat eder. Bu, referans kimliği/7-katman işinin zaten hassas olduğu aktif üretimde gerçek yönlendirme kopuğudur.

### Dar fix sınırı

Skill yalnız gerçek bir üst beceriye yönlensin veya adları tamamen kaldırsın. Referans ekleme için zorunlu kalanlar: `SURGERY_DATA.json` hedefi, gerçek preview davranışı, ilgili testler ve mevcut `mamilas-gate`. `mamilas-world`/`mamilas-checkpoint` ancak gerçekten kurulacaksa önce canlı skill olarak teslim edilmeli. Parite testi içerik eşitliğini zaten koruyor; buna “skill içi zorunlu çağrı mevcut mu?” testi eklenmeli.

---

---

## P0 — Kapanış durumu, klasör taşınması ve hasat birbirinden kopuk

### Kanıt

`current-work.mjs` içindeki üç doğru parça birlikte yanlış bir kaçış yaratıyor:

1. `cmdKapat` teslim setini kontrol ettikten sonra `status = 'kapandi'` atıyor (`scripts/current-work.mjs:526-562`).
2. Aynı fonksiyon `projectPath`i yalnız `agents/COMMAND-INBOX/Biten/<proje>` **zaten varsa** değiştiriyor (`:563-567`). Klasörü taşımıyor ve klasör yoksa kapanışı reddetmiyor.
3. `cmdBaslat` önceki state `kapandi` ise yeni projeye izin veriyor (`:407-445`); Biten/ veya hasat makbuzu aramıyor.
4. `kapanis-hasadi.mjs` bitmiş proje listesini yalnız `Biten/` dizininden çıkarıyor (`:767-772`, `:813`). Inbox’ta kalmış “kapandı” proje onun için yok.

### Tekrarlanabilir kaçış

```bash
# ProjA aktif ve teslim seti tamam
node scripts/current-work.mjs kapat

# ProjA'yı Biten/ altına taşımadan
node scripts/current-work.mjs baslat "ProjB"

# Hasat yalnız Biten/ taradığı için ProjA'yı bilmez
node scripts/kapanis-hasadi.mjs --check
```

Bu JSON elle bozma ya da kötü niyet gerektirmiyor; normal CLI sırası yeterli.

### Gerçek zarar

ProjA “kapandı” diye unutulur, ama revizeleri hiçbir zaman hasat edilmez, Mami’ye adaylar gösterilmez ve gelecek projeye tek ders dahi geçmez. Önceki bölümdeki stdout kusuru düzeltilse bile bu proje Biten/ listesine hiç girmediği için uyarı doğmaz.

### Dar fix sınırı

`cmdKapat`te iki güvenli seçenekten biri seçilmeli:

- klasörü yalnız Mami’nin açık kapanış eyleminde, hedefin doğruluğunu kontrol ederek Biten/ altına taşı; **veya**
- Biten/ hedefi yoksa `kapandi` yazma; state `mami-bekliyor` kalsın ve açık `Biten/ + hasat` receipt’i olmadan `baslat`ı reddet.

`--zorla` da bu koşulu görünür bir receipt olmadan bypass etmemeli. Bu, adayları otomatik onaylamak değildir; yalnız ölçüm yüzeyine girmeyi garanti eder.

---

## P1 — Okunmamış kritik raporların giriş kapısı yok

### Kanıt

- `agents/COMMAND-INBOX/Bekleyen/YENI-PROJE-BASLATMA-METNI.txt:31` yalnız metin içinde `artifacts/denetim-2026-07-31/BULGULAR.md` ve içindeki altı okunmamış raporu söylüyor.
- Gerçek SessionStart kayıtları yalnız `buddy-gate.sh`, `oturum-durumu.mjs`, `hasat-gate.sh` (`.claude/settings.json:18-39`).
- `.claude/`, Enzim/Yönetmen skill’leri, `current-work` ve hook’larda `BULGULAR`/`OKUNMAMIŞ RAPOR` için bir okuma/triage makbuzu yok.
- `PROMPT-YASASI.md:907-917` yalnız bitmiş projeden aday çıkarma ve Mami onayı sözleşmesini düzenliyor; mevcut okunmamış denetim raporlarını yeni oturuma sokmuyor.

### Gerçek zarar zinciri

1. AGY ciddi bulgu üretir; `BULGULAR.md`ye düşer.
2. Sohbet clear olur ya da cihaz değişir.
3. Yeni proje açılır; Claude başlangıç metnindeki paragrafı atlayabilir.
4. Sistem bunu ölçmez; aynı hata tekrar üretilir.

### Dar fix sınırı

Otomatik ders üretmek değil, **SessionStart’ta görünür triage makbuzu** eklemek:

- okunmamış rapor varsa `stdout`a dosya listesi + `FACT REQUIRED: raporlar triage edilmeden yeni üretim kilidi açılmaz` yaz;
- Mami/Claude hangi raporun `uygulanacak`, `reddedildi` veya `proje-yerel` olduğunu küçük bir receipt dosyasına kaydetsin;
- ancak Mami onayladığı satırlar `APPROVED.md`ye taşınsın.

Bu kapı mevcut projenin üretimini durdurmak için değil, clear sonrası **bilinen ölçümü kaybetmemek** için var.

---

## P0 — Teslim dosyası otoriteleri birbirini yalanlıyor (`.md` kaçışı)

### Kanıt matrisi

| Katman | `_PROMPTLAR.md` karşısındaki davranış |
|---|---|
| `agents/PROMPT-YASASI.md:835-847` | Teslim seti açıkça yalnız `.txt` der. |
| `scripts/current-work.mjs:53` | `_promptlar.txt` **ve** `_promptlar.md`yi geçerli teslim sayar. |
| `.claude/hooks/gate.sh:114-171` | Yalnız `*_PROMPTLAR*.txt`yi prompt-lint’e gönderir; `.md` sessizce `continue` olur. |
| `scripts/kapanis-hasadi.mjs:149-158` | Yalnız `_PROMPTLAR.txt`yi hasat kaynağı kabul eder. |

Diskte bu formatın yalnız teorik olmadığı da kanıtlı: Biten altında `Kuvvet ve Kuvvetin Ölçülmesi_PROMPTLAR.md` ve `Eşeyli ve Eşeysiz Üreme_PROMPTLAR.md` var.

### Tekrarlanabilir kaçış

1. Bir projede yalnız `<Ad>_PROMPTLAR.md` üret.
2. Commit et: prompt lint `.txt` matcher’ına uymadığı için hiç koşmaz.
3. `current-work.mjs kapat` çalıştır: state `.md`yi teslim kabul ettiği için `kapandi` yazar.
4. Hasat: `_PROMPTLAR.txt` bulamadığı için `PROMPT_MISSING` / ölçülemez sonuç verir.

Bu normal dosya uzantısı seçimiyle oluyor; override ya da JSON müdahalesi gerekmiyor.

### Dar fix sınırı

Tek kanon seçilmeli. Mevcut Prompt Yasası ve hasat kanonu `.txt` olduğundan en dar güvenli yol:

- `current-work`te `.md`yi teslim sayma;
- gate ve hasatla aynı dosya seçiciyi ortak bir modüle çıkar;
- eski `.md` dosyaları yalnız arşiv/çalışma notu olarak açıkça sınıflansın veya Mami seçimiyle canonical `.txt`e dönüştürülsün.

Alternatif olarak `.md` resmi teslim yapılacaksa **üç katman birlikte** güncellenmeli: gate lint, current-work, hasat ve Prompt Yasası. Yalnız bir regex yaması ikinci gerçeklik üretir.

---

## P0 — Motion kırmızı kuralları ölçülmüyor

### Kanıt

- `scripts/motion-lint.mjs:1-48` sekiz kanıtlı kırmızı kuralı tanımlıyor; `--strict` için açıkça “kapı için” diyor.
- Aynı linter `:403`te çıktısının `gate.sh` tarafından parse edileceğini belirtiyor.
- Gerçek `.claude/hooks/gate.sh`te `motion-lint`, `_MOTION`, ya da `_MOTION.md` için **hiçbir çağrı yok**. Kapı yalnız `_PROMPTLAR*.txt`yi tarıyor (`:106-185`).
- `current-work.mjs:58` ise `_motion.txt` ve `_motion.md` varlığını kapanış için yeterli kabul ediyor; `cmdKapat` içerik lint’i çağırmıyor.
- Hasat da kapanıştan sonra çalışıyor; motion red-line kontrolünü kapatmadan önce geri bağlamıyor.

### Gerçek zarar zinciri

Bir motion teslimi yazılır → commit ve kapanış sadece dosya varlığıyla geçer → `half a second later`, yazı yazdırma, yanlış kamera yapısı gibi linterin kırmızı dediği hatalar Kling’e gitmeden önce hiç durdurulmaz. Bu, manuel görsel Mami hükmünün yerine geçmesi gereken bir şey değil; **manuel karar öncesi deterministik yasakların hiç ölçülmemesi**.

### Dar fix sınırı

1. Canonical `_MOTION.txt` teslimini gate’e ekle.
2. `node scripts/motion-lint.mjs "$file" --strict` kırmızıysa commit’i bloklasın.
3. Kapanışta da aynı fonksiyon/çıktı kullanılsın; dosya varlığı tek başına “motion teslim edildi” sayılmasın.
4. `.md` motion kabulü yukarıdaki teslim-kanonu kararıyla birlikte ele alınsın; aksi halde linter yine uzantıdan kaçırılır.

---

## P1 — Windows’ta shell hook’ları hâlâ tek hata noktası

### Kanıt

- `settings.json:23` `buddy-gate.sh`ı, `:34` `hasat-gate.sh`ı doğrudan executable olarak kaydediyor.
- `buddy-gate.sh:4-6` kendi yorumunda Windows birincil ortamda `.sh` ve çıplak proje yolu kırılgandı diyor.
- `oturum-durumu.mjs:8-13`, Windows’ta `.sh` hook’larının 126 verdiğini ve bu yüzden kendisinin `node` ile çağrıldığını yazıyor.
- `src/core/docsContract.test.ts:235-288` yalnız `.sh` kayıtlarını regex ile topluyor; Windows’ta gerçek executable kontrolünü atlayıp Git index `100755` modunu yeterli sayıyor.

### Risk

Windows’a gidildiğinde Buddy ve hasat SessionStart yüzeyleri hiç doğmayabilir; test yeşil kalır çünkü test “dosya Git’te executable mı?”yı ölçüyor, Claude Code’un o makinede hook’u gerçekten başlatıp bağlama teslim ettiğini değil.

### Dar fix sınırı

- SessionStart’taki iki shell launcher da `node` + `.mjs` hedefiyle kaydedilsin.
- Meta-duvar `command` kadar `args` içindeki `.mjs` hedefini de doğrulasın.
- Windows’ta gerçek Claude SessionStart delivery testi eklensin: Buddy protokolü ve hasat uyarısı modele ulaşan `stdout`ta görülmeli.

Bu P1’in platform kısmı Windows’ta henüz yeniden canlı ölçülmedi; fakat aynı repodaki kod yorumları ve testin bilinçli skip’i ciddi kanıt oluşturuyor.

---

## P1 — Windows’ta kalite duvarı da aynı shell riskini taşıyor

Bu bulgu SessionStart Buddy/hasat bulgusundan ayrıdır: kaybolursa üretim desteği değil, **commit öncesi kalite kapısı** kaybolur.

### Kanıt

- `.claude/settings.json:12` PreToolUse’ta doğrudan `gate.sh` çağırıyor.
- `gate.sh` saf Bash (`#!/bin/bash`, `set -uo pipefail`, `case`, command substitution) ve tsc → vitest → build → prompt lint → state/sync kontrollerini bu dosyada tutuyor.
- `CLAUDE.md:89-94` Windows/PowerShell’in birincil ortam olduğunu ve platform varsayımının geçmişte gate’i sessiz no-op yaptığını açıkça kaydediyor.
- `oturum-durumu.mjs:8-13` `.sh` hook’larının Windows’ta 126 verdiği ölçümün ardından Node ile çağrılacak şekilde yazıldığını söylüyor.
- `docsContract.test.ts:235-288` Windows’ta gerçek process çalıştırmasını ölçmüyor; Git index `100755` bilgisini yeterli kabul ediyor.
- Ayrıca `gate.sh:51`, `CLAUDE_PROJECT_DIR` yanlış/çözülemezse `cd ... || exit 0` yapıyor. Yani kapı doğru hook olarak çağrılsa bile kök yolu bozulduğunda kırmızı vermek yerine sessizce açılıyor; kendi başındaki “kör kapı bloke etmeli” kuralıyla çelişiyor.

### Etki

Windows Claude Code doğrudan `.sh` dosyasını başlatamazsa veya proje kökü yanlış çözülürse PreTool kalite duvarı çalışmaz: tsc, Vitest, build, prompt/motion lint, state drift ve sync uyarıları commit öncesinde hiç ölçülmez. Test yine yeşil görünebilir.

### Sınır ve doğrulama

Bu çalışma ortamında Windows process kanıtı yok; bu nedenle “şu an kesin kapalı” değil, **Windows’a geçmeden giderilmesi gereken P1**dir. Çözüm shell yolunu varsaymak değil, gate’in platformdan bağımsız Node entrypoint’ini yazıp settings’te `node <entrypoint>` olarak kaydetmektir. Kabul testi gerçek Windows Claude PreToolUse olayında bozuk bir TypeScript dosyasının commit’ini engellemelidir.

AGY’nin ham `git commit` metin filtresinin `rtk` nedeniyle kesin bypass olduğu iddiası **reddedildi**: mevcut kanıt komutun bu stringi taşımadığını göstermiyor. Bu ancak ayrı gerçek event payload testiyle P1’e yükselir.

---

## P1 — Claude hafızası Git’e ve Windows oturumuna otomatik bağlanmıyor

### Canlı makbuz

Bu Mac’te `node scripts/claude-sync.mjs --check` şu an:

- 34 dosya eşit;
- 6 dosya repo → canlı çekilmeyi bekliyor;
- 12 dosya canlı → repo itilmeyi bekliyor;
- 4 çatışma var: `MEMORY.md`, aktif üretim durumu, Buddy persona, Mami kişisel notu.

Hiçbiri yazılmadı; bu güvenli davranış doğru.

### Kırık bağlantı

- `scripts/claude-sync.mjs` üç yönlü ve silmeyen tasarlanmış; iki taraf değiştiğinde doğru biçimde duruyor.
- Ama `settings.json` SessionStart listesinde sync kontrolü yok.
- `.claude/hooks/gate.sh:202-214` sync sapmasını yalnız `stderr`e uyarı olarak basıyor ve commit’i bloklamıyor.

Sonuç: Mac’teki yeni hafıza/skill repo’ya taşınmadan veya Windows’ta repo içeriği canlı `~/.claude`ya çekilmeden yeni oturum başlayabiliyor. Bu raporda “otomatik merge” istenmiyor; çatışmada Mami seçimi doğru kural.

### Dar fix sınırı

1. SessionStart’ta **salt-okur** `claude-sync --check` sonucu Claude’a `stdout`tan görünür olsun.
2. Sapma/çatışma varsa “sync bitti” yalanı yerine açık `SYNC FACT REQUIRED` yüzeyi oluşsun.
3. Çatışma çözümü otomatik yapılmasın. Mami seçiminden sonra `claude-sync` → yalnız ilgili sync dosyaları commit/push → Windows’ta pull → kontrollü canlıya çekme akışı kalsın.

---

## P2 — Aktif iş kaydı gerçekte diskten geride kaldı

### Canlı reproduksiyon

`node scripts/current-work.mjs --check` bu aktif proje için exit `1` verdi:

- kayıt `REFERANSLAR`, `EDIT-PLAN`, `SESLENDIRME`, `SUNO` için `yok` diyor;
- aynı dosyalar aktif proje klasöründe diskte var;
- kayıt hâlâ `iş açıldı — henüz ölçülmüş bir çıktı yok` yazıyor.

`oturum-durumu.mjs` bu kaydı SessionStart’ta Claude’a otorite olarak veriyor. Yönetmen skill’i de `kayıtla disk çelişirse DİSK kazanır` diyor; bu yüzden hata tamamen gizli değil. Yine de yeni oturum gereksiz yeniden üretim veya yanlış “sıradaki adım” riski taşıyor.

### Dar fix sınırı

- Mid-production commit’i bloklama; bu aşamada drift doğal.
- Ama SessionStart görünümünde `KİT eksik` ile `disk kayıttan ileride` ayrımı daha sert olmalı: `DISK AHEAD — state'i ilerletmeden yeni üretim başlatma`.
- Claude her somut teslim parçasından sonra mevcut `current-work.mjs ilerle` yolunu çağırmalı; yeni paralel state üretme.

---

## P1 — Dünya kilidi, zorunlu kalite kanonu bozulunca sessizce zayıflıyor

### Kanıt

`scripts/dunya-kilidi.mjs` kendi başında `agents/promptQuality.mined.json`ı **"REAL register'ın zorunlu karşı-terimleri"** diye tanımlıyor (`:47`). Fakat aynı kaynak okunamaz ya da geçersiz JSON olursa `:63-64`teki geniş catch hatayı tamamen yutuyor:

```js
let MINED = null;
try { MINED = readJson('agents/promptQuality.mined.json'); } catch { MINED = null; }
```

Ardından `buildStyle()` bu kaynaktan gelen REAL karşı-terimlerini koşullu ekliyor (`:637-640`). Kaynak yokken hata, stderr uyarısı veya exit ≠ 0 yok; `dunya-kilidi` üç yapıştırılabilir satırı üretmeye devam ediyor, yalnız `negative fill, motivated light, subtle 35mm film grain, raw skin micro-texture` gibi ölçülmüş karşı-terimler sessizce düşüyor.

Canlı sağlıklı koşuda `node scripts/dunya-kilidi.mjs deakins_naturalist --register=REAL` bu karşı-terimlerin eklendiğini açıkça raporluyor ve exit 0 veriyor. Yani bu veri dekoratif değil; manuel yönetmenin kullandığı gerçek kuyruğun parçası.

`scripts/dunya-kilidi.test.mjs` 46 dünyanın bugünkü çıktısını süpürüyor, fakat kalite kanonu okunamazken komutun güvenli biçimde **durduğunu** test etmiyor. Buna karşılık kod tabanının başka yüzeyi (`src/core/agentProtocol.ts`) aynı JSON'u derleme anında zorunlu import ediyor. Aynı kanon bir yolda sert, elle üretimin tek dünya kuyruğu yolunda sessiz opsiyonel: iki farklı güvenlik gerçeği.

### Dar fix sınırı

`promptQuality.mined.json` okunamazsa `dunya-kilidi` hiçbir `STYLE/LIGHT/NEGATIVE` stdout'u basmadan açık hata ve exit 2 ile durmalı. Ya da gerçekten opsiyonelse başlıktaki "zorunlu" hükmü kaldırılıp ayrı görünür `QUALITY_CANON_MISSING` durumu verilmelidir; sessiz fallback kabul edilemez. Test: bozuk/minimum fixture'ta stdout boş ve exit kırmızı; sağlıklı REAL dünyada karşı-terim korunur.

---

## P1 — Protocol migration kısmi kaldığını söylemeden başarı makbuzu veriyor

### Kanıt

`scripts/mamilas-command.mjs --migrate-command-context` migration sırasında artifact ve frame receipt klasörlerini okuyor. Ancak iki döngüde bozuk JSON'u sessizce atlıyor:

```js
try { value = JSON.parse(await readFile(join(migrationArtifactDir, name), 'utf8')); } catch { continue; }
// ...
try { receipt = JSON.parse(await readFile(join(migrationFramesDir, name), 'utf8')); } catch { continue; }
```

(`scripts/mamilas-command.mjs:1399`, `:1416`). Şema uyuşmazlığı da aynı biçimde `continue`. Komut buna rağmen `COMMAND_CONTEXT_MIGRATED`, `validation: 'PASS'` ve yalnız sayısal `migratedWorkspace` döndürüyor; `skipped/corrupt/unsupported` listesi yok. Kullanıcı migration'ın tam olduğunu sanabilir, o dosya ise eski protocol hash'iyle yerinde kalır.

Normal batch yolu bozuk artifact'i sonunda sahne-bazlı `FORMAT_RETRY_PENDING`/`TECHNICAL_ERROR` olarak görünür yapıyor (`loadArtifacts():641-668`, batch `:1693-1723`). Bu iyi bir izolasyon. Sorun migration makbuzunun önceki aşamada **kısmi taşıma bilgisini gizlemesi**: hata, protocol değişiminin kökünde değil çok sonra sahne üzerinde ortaya çıkar. Mevcut migration testleri yalnız sağlıklı fixture zincirlerinin korunduğunu test ediyor (`batchResilience.test.ts:322+`); bozuk artifact/frame varken migration'ın kırmızı ya da eksik-işaretli çıkmasını test etmiyor.

### Dar fix sınırı

Migration, parse/şema reddi olan her dosyayı `skipped[]`a dosya adı ve neden ile koymalı; liste boş değilse `validation: PARTIAL` dönmeli ve normal yeni koşu `FACT_REQUIRED` olmadan başlamamalı. Daha güvenlisi: hedef workspace'e hiçbir yazma yapmadan önce tüm giriş setini doğrulamak ve bozuk dosyada komple migration'ı açıkça durdurmak. Mevcut sahne-izolasyon davranışı korunabilir; yalnız "tam migration" makbuzu gerçeği söylemeli.

---

## P2 — Onay oy pusulası, ders bankasının güncel durumunu yalanlıyor

`agents/lessons/ONAY-BEKLEYEN.md` ilk paragrafta `APPROVED.md bugün 0 ders taşıyor` diyor. Aynı anda gerçek kanonik `agents/lessons/APPROVED.md` yedi Mami-onaylı ders içeriyor; bunların ilki bu gün bitirilen **Birlikte Daha Güçlüyüz** işinden geliyor. Bu dosya otomatik runtime kanonu değil, ama yeni bir ajanın/Claude'un “banka boş” zannıyla aynı dersleri tekrar adaylaştırmasına veya öğrenmenin aktarılmadığını sanmasına yol açar.

Dar fix: oy pusulası üretildiği anın sayımıdır; ya güncel sayıyı hiç yazmamalı ya da onay transferi gerçekleşince başlığı/referansları güncellenmeli. `APPROVED.md` tek otorite olarak açıkça işaretlenmeli. Bu P2'dir: bankaya veri girişi çalışıyor, yanlış olan insanı yönlendiren eski açıklama.

---

## Claude için uygulanma sırası

1. **P0:** hasat output kanalını ve Node kayıt biçimini onar; macOS + Windows delivery testini yaz.
2. **P0:** `kapat → Biten → hasat` zincirini tek bir receipt altında bağla; ölçülmemiş kapalı projenin yeni iş açmasını engelle.
3. **P0:** teslim uzantısı ve linter kaynaklarını tek kanona bağla; prompt/motion varlık kontrolü yerine aynı strict ölçeni kullan.
4. **P1:** Buddy/hasat ve kalite-gate shell kayıtlarını platformdan bağımsız Node kayıtlarına taşı; testin `.mjs args` yüzeyini ölçmesini sağla.
5. **P1:** `dunya-kilidi` ve protocol migration'da sessiz fallback/kısmi başarı yerine açık kırmızı makbuz koy; bozuk kalite kanonu veya bozuk receipt asla normal kuyruğa dönüşmesin.
6. **P1:** SessionStart’a yalnız görünür, salt-okur sync/okunmamış-rapor triage yüzeyi ekle. Otomatik merge/promotion yok.
7. **P2:** state görünümünü disk-ahead durumunda açık ve yönlendirici yap; eski oy pusulasını güncel bankanın yerine konuşturma.
8. Her adımdan sonra gerçek hook stdout’u, Windows yolu ve Git sync makbuzu ölçülmeden “çözüldü” deme.

## Açıkça reddedilenler

- AGY’nin ilk “hasat hook dosyası yok” alarmı yanlıştı; `.sh` launcher var. Asıl kusur stdout/stderr teslimi.
- `@kaval` gibi video-asset sayım notları bu sistem raporuna alınmadı; üretim hattı mimarisini kıran kanıt değildi.
- AGY’nin “her state drift’i commit’i bloklasın” çözümü reddedildi; yarım üretimde drift doğal. Doğru çözüm görünür ve doğru yönlendirilmiş state reconciliation.
