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

## ✅ YAPILDI — G1c: yutulan ölçüm ekrana çıktı (2026-07-26)

`directorNotes()` hesaplanıyor ama `src/` içinde hiçbir yüzeyden çağrılmıyordu; tek çağıran
kendi testiydi. Testler yeşildi çünkü test fonksiyonu doğrudan çağırıyordu — yani **yeşil
test, görünmez bir yeteneği koruyordu.**

- `RecipeStep` → **"Evren ölçümü"** paneli. `warn` kırmızı kenar, `info` amber. Alt başlık
  sınırı söylüyor: *"Ölçülen uyumsuzluklar — öneri değil, gerçek. Yaratıcı kararı sen ve
  yönetmen verir."* Reçete adımında durur çünkü uyumsuzluk BURADA doğar (dünya/palet/materyal/
  DNA bu adımda seçilir); sonraki adımda haber vermek kararı geri sarmaktır.
- **Yüzey kilidi** (`advisor.test.ts`, `agentsSync.test.ts` deseni): ölçümün bir kullanıcı
  yüzeyinden import edilmesi, çağrılması ve render edilmesi testle zorunlu. İkinci test
  çağrının `sceneCount` ve `phase0PresetId` dahil tüm girdileri taşıdığını kilitler — eksik
  girdi, o kontrolün sessizce ölmesi demek.
- Commit: `23ff18b`. Kapı: tsc 0 · vitest 2085/2085 (83 dosya) · build OK.

## ✅ YAPILDI — G1d: ezilen directive makbuz bırakıyor (2026-07-26)

**Ölçüm (gerçek `dnaDirectives` çıktısı, 4 ref · STY register):** `resolveLightAuthority`
gerçek bir çözücüdür ve **46 dünyanın 31'inde** ref DNA'nın en az bir ışık cümlesini
düşürüyor. Dağılım: `FLAT_WORLD_DROPS_DIRECTIONAL` (kurzgesagt_edu, whiteboard_explainer,
motion_design_flat, ukiyo_e_print… — 2 cümle) ve `WORLD_LAW_GOVERNS_KEY` (paper_craft_popup,
jjk_mappa, one_piece_toei, wes_anderson_symmetric, aot_wall_world, solo_leveling_gate… —
1 cümle). **Hiçbiri kayıtlı değildi.**

Tutarsızlık kanıtı: ref bastırması için deterministik makbuz VAR
(`pure.ts` → `SUPPRESSED_WORLD_MISMATCH`), ışık için yoktu. Sistem bir eksende hesap veriyor,
diğerinde vermiyordu. `AUTHORITY_HIERARCHY` ise liste sabiti; gerçek çözüm bunun gibi
noktasal kapılarda yaşıyor.

- `resolveLightAuthorityReceipt(dnaLight, world)` → `{ light, dropped[], rule, winner }`.
  `rule`: `NO_WORLD_LAW` · `WORLD_AGREES` · `FLAT_WORLD_DROPS_DIRECTIONAL` ·
  `WORLD_LAW_GOVERNS_KEY` · `NONE`. `dropped` **verbatim** — kırpılmaz.
- **Prompt byte'ı değişmedi:** `light` alanı eski çözücüyle 46 dünyada parite testiyle
  kilitli. Makbuz motor prompt'una değil **kanıta** girer.
- Command paketine `authorityReceipts.light` — ve açıkça *deterministik*, ajanın
  `directiveReceipts`/`suppressedContext` öz-beyanından ayrı. Ajan bunu okuyup "bu dünyada
  rim light neden yok" sorusunu yeniden araştırmaz. **Kimliğe girmez:** karardan
  türetilmiştir, karar değildir.
- **Asıl yasa testle kalıcı:** *ışık metni değiştiyse makbuz kaybı listelemek ZORUNDA.*
  46 dünya taranır; değişen her dünyada `dropped` dolu, `rule ≠ NONE`, `winner =
  WORLD_LIGHT_LAW` olmalı. Yeni bir otorite kapısı makbuzsuz eklenirse bu test kırar.
  Ayrıca ölçülen taban (≥20 dünya) kilitli — çözücü zayıflarsa fark edilir.
- Kapı: tsc 0 · vitest **2090/2090 (84 dosya)** · build OK.

## ✅ YAPILDI — G1e: SAHTE GÜNEŞ kapandı (2026-07-26, `ee7d831`)

**Kaynak test değil, gerçek kare.** Mami'nin gözlemi: *"hep sahte bi ışık geliyor güneşten,
odada bile."* Ölçüm bunu doğruladı: tek sahnede `motivated` **8×**, `window` **3×**, `sun` **3×**.
Sebep yapısal — dünya yasası ışık kaynağı **MENÜSÜ** sayıyordu ve hiçbir sahne o menüden seçim
yapmıyordu; her katman kendi kaynağını ekliyor, prompt üç güneşle motora gidiyordu.

- **İki kol:** (1) dünya ↔ ref anlaşması artık **tekilleştirir** (`WORLD_AGREES_DEDUPED`) —
  aynı ışık iki kez yazılmaz; (2) sahnenin `light_source` alanı menüyü **çözer** — sahne
  kaynağını seçince diğerleri düşer. Sonuç ölçümü: 8/3/3 → **7/2/2**.
- **Üç test politikası gerekçesiyle GÜNCELLENDİ, silinmedi.** Eski testler menü davranışını
  kilitliyordu; menü kusurdu. Gerekçe dosyada yazılı. Yasa: **gerçek-kare hükmü test yeşilini ezer.**
- **İki kendi kusuru ölçümle yakalandı:** nesne adlı yasak `window` sayısını 3→5 çıkarıyordu
  (negatif cümle motorda pozitif sayılıyordu → pozitife çevrildi); `aperture` lens diyaframıyla
  çakışıyordu (çıkarıldı). Kendi düzeltmesini ölçmeyen düzeltme, yeni kusurdur.

## ✅ YAPILDI — G1f: ad artık yeteneği söylüyor (2026-07-26)

**Çatal kapandı — Mami kararı (2026-07-26): silme yok, G2'ye geçilir.** `EXECUTION_STATE.md`'nin
"yüzey cerrahisi" maddesi (`productionPulse.ts` + `audit_full.ts` sökülsün) bu receipt'in
"Silinmeyecekler" kararıyla **çelişiyordu**; iki kaynak aynı gün zıt hüküm taşıyordu. Mami
çelişkiyi receipt lehine çözdü: ölçüt "zekâ artıyor mu", 642 satır silmek en iyi ihtimalle nötr.

Kalan tek gerçek kusur ucuzdu ve yapıldı: `advisor.ts` → **`universeMeasure.ts`**
(+ `advisor.test.ts` → `universeMeasure.test.ts`, `AdvisorInput` → `UniverseMeasureInput`).
G1a'da öneri yarısı söküldükten sonra dosyanın adı **olmayan bir yeteneği iddia ediyordu** —
bir sonraki oturum adı okuyup "burada öneri motoru var" sanacaktı. Davranış değişmedi;
import eden iki yüzey (`RecipeStep`, `innerVoices`) ve bir yorum atfı (`commandExport.ts:166`)
güncellendi. `AdvisorPortrait` hattına **dokunulmadı** — o portre bileşeni, ölçüm değil.

Kapı: tsc **0** · vitest **2096/2096 (85 dosya)** · build **OK**. Test sayısı düşmedi.

**Sistem yeteneği hükmü (G0'ın nüksü):** G0'da kapattığımız kusur — durumun iki yerde yaşaması —
G1'in kendi içinde yeniden doğdu: karar hem receipt'e hem state'e yazıldı, ikisi ayrıştı.
Kickoff'un bakım kuralı receipt'ler için de geçerli olmalı: **karar state'te, kanıt receipt'te.**
Bundan sonra receipt bir kararı tek başına taşımaz; state'e tek satır hüküm düşer.

## Ledger (final convergence'a taşınan)

1. **Diğer otorite eksenleri hâlâ makbuzsuz.** Işık ekseni kapandı; `.claude/rules/
   core-prompt-path.md` başka ad-hoc ikili kapılar da işaret ediyor (prop/render-lock,
   palet-hex, period). Aynı desen (`*Receipt` + parite testi) oralara da uygulanabilir.
2. **`AUTHORITY_HIERARCHY` hâlâ liste sabiti** — tek gerçek çözücü ışıkta. Genel bir
   çözücüye dönüşmesi ayrı iş; bugünkü kazanç, çözümün en yoğun olduğu eksende hesap
   verebilirlik.

3. **`productionPulse.ts` + `audit_full.ts` kalıyor** (Mami, 2026-07-26). Silme değil, gerekirse
   büyütme masada. Yeniden açmak için yeni kanıt gerekir — "çağrılmıyor" tek başına kanıt değil.

## Sıradaki tek adım

**G2 — 46 dünyaya uygulanabilen ortak 5-kare sınav seti.** Sınav prompt üretir, kare üretmez
(API yok). Kapı kanıtı: iki dünyada gerçek çıktı — biri bilinen-iyi (Sürtünme referansı), biri
hiç kare görmemiş bir dünya; fark okunabilir olmalı.
