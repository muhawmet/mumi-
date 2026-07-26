# KALP-G1 — Reçete zekâsı: ölçüm (2026-07-26)

> Operasyon: `docs/superpowers/plans/2026-07-26-mamilas-kalp-nakli.md`
> Bu receipt G1'in **ölçüm** yarısıdır. Düzeltme yarısı aynı dosyaya eklenecek.

## Mami mandası — kapının ölçütünü değiştirdi

Çatal (yönetmen tek yüzey / iki yüzey / envanter) **cevaplanmadı, iptal edildi.** Mami:

> *"Zekayı upgrade edecek hamleler yapıyoruz, downgrade varsa yapma. Site güzel yön veren bir
> yer sonuçta, sohbette beraber yaratıyoruz, her türlü yönü de alıyorsun — ama **reçete çok iyi
> olursa sen de çok daha iyi yazarsın**, siteye o özelliği eklersin. Keşfet, adapte ol, düzelt."*

**Yeni ölçüt: zekâ artıyor mu?** Silme nötr bir hamledir, upgrade değil → **silme masadan
kalktı.** `audit_full.ts` (542, sıfır importer), `advisor.ts` (411), `productionPulse.ts` (100)
silinmiyor. Dahası: `advisor.ts` hakkındaki ilk hükmüm (`ekran süsü`) **yanlıştı** —
`suggestRecipe` / `dnaStrength` / `refFit` / `starterPackFor` reçete zekâsıdır; silinecek yerde
büyütülecek yerdir. Kayda geçti.

Kaldıraç Mami'nin cümlesiyle sabit: **reçete → prompt.** Reçete ne taşıyorsa ajan onu yazar;
taşımadığını her seferinde sohbette yeniden konuşuruz.

## Ölçüm — `BaseDecision` ne taşıyor

Kaynak: `src/core/contract.ts:208-231` (BaseDecision) + `src/core/commandExport.ts:282-325`
(gerçek doldurma). Kimlik kuralı kodun kendi yorumunda: *"EVERY decision that reaches the prompt
reaches the identity."*

**Taşınan:** `locks{topic, productionPath, projectClass, projectId, musicId, world, material,
palette, refs[], cast, brandKitLock, sceneCount}` · `engine{imageModel, videoModel}` ·
`mode{workingMode, beatMode, osTextMode, voSyncMode}` · `creativeControls{mood, cameraEnergy,
timeLight, transition, musicVibe, pov, signature, leitmotif, tempoCurve, directorBrief}` ·
`authored{subject, location, sceneNotes[id, vo, event, director_note, motion_seed,
turkish_labels, avoid]}` · `overrides[]` · `deliveryPromise` · `mamiDirectives`.

Sözleşme zengin. Kusur eksiklik değil, **hangi eksiklik.**

## Bulgu 1 — Enzim'in dört kilidinden üçü reçetede yok

`mamilas-enzim` disiplini şunu söylüyor: üretim başlamadan **preset, karakter oranı, tag
listesi, yazı planı** kesim masasında kilitlenir. Reçetede karşılıkları:

| Enzim kilidi | Durum | Kanıt |
|---|---|---|
| Yazı planı | ✅ taşınıyor | `mode.osTextMode` + `deliveryPromise` + sahne `turkish_labels` |
| Preset | 🟡 kısmen | `creativeControls.signature` / `mood` var; adlandırılmış preset kavramı yok |
| **Karakter oranı (50-50)** | ❌ **alan yok** | `contract.ts` içinde `ratio`/`oran`/`characterShare`: sıfır eşleşme |
| **@tag listesi** | ❌ **alan yok** | `locks.refs[]` referans **görseli**; karakter/hero-prop tag'i taşıyan alan yok |
| **Cast yaşı / sınıf** | ❌ **alan yok** | `locks.cast: string` tek serbest metin; `castAge`/`ageRange`/`gradeLevel`: sıfır eşleşme |

**Yetenek hükmü:** Enzim "kilitle" diyor ama **kilitlenecek alan yok.** Bu üç karar her
prodüksiyonda sohbette yeniden konuşuluyor → Mami tekrar söylüyor, ajan tahmin ediyor, tahmin
kayınca kare yeniden üretiliyor. **Geri sarmanın kaynağı budur** — kelime kusuru değil, taşıma
kapasitesi kusuru. Mami'nin "6. sınıf = ~11-12 yaş" yasası reçetede yaşamıyor.

## Bulgu 2 — `AUTHORITY_HIERARCHY` çözücü değil, liste

`.claude/rules/core-prompt-path.md` ölçümü: `brain.ts:2288` tanım, tek kullanımı `:2407`
(brief metnine basılıyor). Gerçek çatışma çözümü ad-hoc ikili kapılarda (`:288-302`, `:616-634`,
`:1898-1918`, `:2056-2059`) ve **kaybeden directive sessizce eziliyor** — makbuz yok.

**Yetenek hükmü:** reçete kendi içinde çeliştiğinde kimin kazandığı görünmez. Zekâ upgrade'i
burada net: her ezilen directive makbuz bırakmalı. Sessiz eziliş, sonraki oturumun aynı
tartışmayı sıfırdan yapması demek.

## Silinmeyecekler (karar, gerekçesiyle)

- `audit_full.ts` — sıfır importer ama bilinçli standalone teşhis scripti (`npx tsx` başlığı).
  Silmek zekâ kaybı; **kalıyor.**
- `advisor.ts`, `productionPulse.ts` — reçete zekâsı ve yön verme yüzeyi. **Kalıyor, büyüyecek.**
- `render_law` — toptan silinmez (A2 pilotu denedi, kare stok fotoğrafa kaydı). Fizik/prop ayrımı
  korunur.

## Bedeli — dürüst uyarı

Üç alan kimliğe girerse `commandId` içerik hash'i değişir → **mevcut command dosyaları bayat
olur.** Doğrusu bu (kimlik iki farklı filmi ayırt edemiyorsa kimlik değildir — `commandExport.ts:287-290`
kendi yorumu), ama elde yarım üretim varsa geçiş onun bitişinden sonra yapılır. **Mami'ye soruldu.**

## ✅ YAPILDI — Site/sohbet sınırı (2026-07-26)

**Mami'nin yasası, kendi cümlesi:** *"Site dünyayı, ruhu, DNA'yı, süreleri tarif etsin — ama
yazma kısmı bizde. Ben evreni orada tasarlayıp seninle yaratıyorum."* → Sınır: **site ÖLÇÜM
bildirir, ÖNERİ vermez.** Ölçüm bir gerçeği söyler ("bu ref bu dünyada hiçbir alanı
doldurmuyor"); öneri ne yapılacağını söyler — o Mami'nin ve yönetmenin işi.

**Beklenmeyen bulgu:** `directorNotes()` (125 satır uyumluluk ölçümü) `src/` içinde **hiçbir
yerde gösterilmiyordu** — tek çağıran kendi testi. Yani site register/dünya çakışmasını, DNA
uyumsuzluğunu ve uyumluluk kapısının `BLOCKED`'ını hesaplıyor ve **yutuyordu.** Yön veren
yüzey, yönü biliyor ama söylemiyordu. Ölçüm katmanı korundu; yüzeye taşınması ledger'da.

### Sökülenler (gerekçeli)

- **`suggestRecipe()` + `RecipeSuggestion`** (`advisor.ts`) — konuyu **kasten yok sayıp**
  `decodeBrief('')` ile varsayılan reçeteyi döndürüyordu; üstüne `phase0PresetId`,
  `directorChoices`, `directorBrief` alanlarını temizliyordu. Zekâ değil, zekâ kılığına
  girmiş sıfırlama düğmesi. Ekrandaki karşılığı **"Genel başlangıç"** düğmesi + "Reçete
  kuruldu · güven" bandı (`DashboardStep.tsx`) — ikisi de kalktı.
- **"Reçete sağlam · üretime hazır"** övgüsü → yerine **"Evren ölçümü"** (info): register,
  dünya, DNA'nın doldurduğu alanlar + *"kare hükmü ayrı kapıdır"*. Eski cümle uyumluluk
  yeşilliğini üretim sözüne çeviriyordu; PROJECT_CONTRACT'ın "test yeşili görsel PASS
  değildir" yasasını ekranda ihlal ediyordu.
- **"Doruk zayıf · bir climax beat'ini yükselt"** — yaratıcı hüküm, sohbette doğar.
  `AdvisorInput.intensities` alanı da onunla kalktı (başka çağıran yok).
- **"Referanslar dağınık · ortak bir görsel dil seç"** — yaratıcı hüküm.
- **"Çok fazla referans · Çıkar: X, Y"** → **"Referans sayısı"**: emir yerine ölçüm —
  dünya-uyumu en düşük ref'ler **yüzdeleriyle** listelenir, hangisinin çıkacağı Mami'nin.
- Ölü kalan `refFamily()` yardımcı fonksiyonu.

### Korunanlar (gerekçeli — evren tarifi = Mami'nin istediği iş)

`starterPackFor` + `STARTER_PACKS` (dünya başına küratörlü DNA paketleri) · `refFit`
(dünya↔ref uyum yüzdesi; pinli ref yalnız kendi dünyasında) · `dnaStrength` (hangi ref
kamera/ışık/kompozisyon/hareket/doku alanını gerçekten dolduruyor, hangisi sıfır) ·
`refContribution` · `PRESET_WORLD_SCOPE` (presets.ts ile testle senkron) ·
`directorNotes`'un ölçüm yarısı: dünya/palet eksik · register↔dünya · preset↔register ·
preset↔dünya · palet↔dünya gerilimi · DNA/dünya uyumsuzluğu · uyumluluk kapısı `BLOCKED` ·
kaynak kapsamı · uzun format maliyeti.

### Test disiplini

`suggestRecipe`'in 3-vakalı testi fonksiyonla birlikte kalktı (davranış yok, test yok —
dosyada gerekçesi yazılı). Övgüyü kilitleyen test **silinmedi, niyeti korunarak güncellendi**:
"tutarlı reçete uyarı üretmez" + yeni kilit "ölçüm satırı üretim sözü VERMEZ"
(`üretime hazır` yokluğu ve `kare hükmü ayrı kapıdır` varlığı assert'li).

### Kapı (gerçek çıktı)

`npx tsc --noEmit` → **0 hata** · `rtk proxy npx vitest run` → **2075/2075 (82 dosya)** ·
`npm run build` → **OK** (>500 KB ana bundle uyarısı FINAL-CONVERGENCE-LEDGER'da kabul
edilmiş debt, yeni değil).

## ✅ YAPILDI — G1b: üç taşıyıcı reçeteye indi (2026-07-26)

TDD: `src/core/recipeCarriers.test.ts` önce **kırmızı** (4 kırık / 4 geçen — geçenler "alan
yokken satır basılmaz" testleriydi, yani kırmızı doğru yerdeydi), sonra yeşil (8/8).

### Eklenen alanlar — tek zincir

`StudioState` → `pickProjectState` (vault/pack/snapshot ile taşınır) → `generateBatch` girdisi
(`BriefInput`) → `AgentBriefCtx` → brief §1 → **ve** `BaseDecision.locks` (kimlik) +
command paketi `locks`.

| Alan | Tip | Ne taşır |
|---|---|---|
| `castAge` | `string` | "6. sınıf · 11-12 yaş". Boşsa satır basılmaz. |
| `characterShare` | `number` 0-100 | Karakterli sahne payı; varsayılan `CHARACTER_SHARE_DEFAULT = 50`. |
| `heroTags` | `string[]` | `@mira · @ali · @araba`; `normalizeHeroTags` ile tek biçim. |

### Brief'e basılan yasa (sadece değer değil, yasası da)

- **Cast age / grade** — *"every person in this frame reads THIS age. 'Child' is not an age:
  a face that reads six years old in a sixth-grade scene is a casting error, not a style
  choice."* Gövde oranı, mobilyaya göre boy ve yüz yapısı bu satırı izler.
- **Character share** — *"roughly N% of the scenes carry people; the rest are object /
  phenomenon frames. Do not push a character into a scene that does not need one — a crowded
  frame reads as filler and the lesson object loses the eye."*
- **Recurring tags** — *"each tag is ONE entity: the same face, the same body, the same object
  in every scene where it appears… If a tag does not appear in a scene, it is simply absent —
  never replaced by a lookalike."* (NB2 kataloğundaki "tag'siz prop drift"in kapısı.)

### Determinizm kararları (hash'i bozmamak için)

- `normalizeHeroTags` **tek yerde** yaşar (`pure.ts`) ve hem brief'i hem kimliği besler.
  İki ayrı normalizasyon, hash'in brief'ten farklı bir listeye bağlanması olurdu.
  Küçük harfe indirir (`@Mira` ile `@mira` iki varlık sayılırsa çıpa işini yapmaz), `@`'yı
  tek sefer ekler, sırayı korur (ilk tag genelde ana karakter), tekrarı atar.
- `CHARACTER_SHARE_DEFAULT` **tek sabit** (`pure.ts`); store varsayılanı ile
  `commandExport`'un `?? ` düşüşü aynı sayıyı okur. İki literal, aynı reçetenin iki yolda
  farklı hash üretmesi demekti.
- Üç alan `CommandStateWithPersonal`'da **opsiyonel** (yerleşik desen: `subject`, `location`,
  `osTextMode` de öyle) — eski fixture ve persist edilmiş state kırılmadı; verilmediğinde
  kimliğe store varsayılanıyla aynı değer yazılır, sessiz `undefined` kimliğe girmez.
- UI'da boş sayı girdisi `NaN` üretiyordu; `NaN` kimliğe yazılırsa hash bozulur → boşluk
  varsayılana düşürülür, değer 0-100'e kırpılır.

### Girdi yüzeyi (yoksa alan ölü)

`RecipeStep` → "Project Metadata" bloğuna üç alan: **Cast yaşı / sınıf** · **Karakterli sahne
payı (%)** · **Tekrar eden tag'ler** (virgülle). Her birinin `hint`'i yasayı söylüyor, sadece
alanı değil. `data-testid`: `recipe-cast-age`, `recipe-character-share`, `recipe-hero-tags`.

### Kapı (gerçek çıktı)

`npx tsc --noEmit` → **0** · `npx vitest run` → **2083/2083 (83 dosya)** · `npm run build` → **OK**.
Test sayısı 2075 → 2083 (+8 yeni taşıyıcı testi; hiçbir test silinmedi).

### Dürüst uyarı — hash kayması

Üç alan kimliğe girdiği için `commandId` içerik hash'i **değişti**. Bekleyen `.command.json`
ölçüldü: **yok** (0 dosya), yani geçiş maliyeti sıfır. Eski bir command dosyası elden
gelirse bayat sayılacaktır — doğrusu bu.

## Ledger (final convergence'a taşınan)

1. **`directorNotes` ölçümü ekranda görünmüyor** — 125 satır uyumluluk zekâsı hesaplanıyor,
   Mami görmüyor. Yüzeye taşınması ayrı iş; "site yön verir" yasası bugün fiilen çalışmıyor.
2. **`AUTHORITY_HIERARCHY` çözücü değil** — kaybeden directive makbuzsuz eziliyor.

## Sıradaki tek adım

Üç taşıyıcıyı ekle — TDD: önce kırmızı test (reçete 50-50 oranını / @tag listesini / cast
yaşını taşımıyor → prompt bunları içermiyor), sonra alanlar, sonra brief/prompt kablolaması,
sonra kapı (`npx tsc --noEmit` → `npx vitest run` → `npm run build`). Ardından Codex bağımsız
denetim.
