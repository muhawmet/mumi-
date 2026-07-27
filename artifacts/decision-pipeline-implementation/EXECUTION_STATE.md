# MAMILAS Decision Pipeline — EXECUTION STATE

## 🫀 AKTİF OPERASYON — KALP NAKLİ (2026-07-26, CURRENT AUTHORITY)

**Mami mandası (2026-07-26):** beyin adaptasyonu A'dan Z'ye. Aşağıdaki tüm bölümler tarihsel
kanıttır ve bu bölümü ezemez.

> **⚠️ DÜZELTME (2026-07-27):** bu bölüm "üretim DURDU" diyordu — **artık doğru değil.**
> 07-27'de üretim yeniden açıldı ve gün boyu **13 üretim commit'i** düştü (Sabit Sürat ve Hız
> tam prompt seti + revize turu + kurgu kiti, arşivleme, Kütle ve Ağırlık'ın açılışı, günün
> direktif transkripti). Beyin işi ile üretim işi **paralel** yürüyor; ikisi de canlı.

**Operasyon planı (tek gerçek):** `docs/superpowers/plans/2026-07-26-mamilas-kalp-nakli.md`
— kapılar G0→G5, denetim bölüşümü (Codex ikinci göz), `/clear` kickoff metni, receipt biçimi.
Çalışma biçimi: `/mamilas-buddy` (DEHB merkezde). Yürütme: `/mamilas-pipeline`.

### ✅ G0 TAMAM — hafıza mührü (2026-07-26)

**Ölçülen drift:** bu dosya 2026-07-17'de mühürlüydü, HEAD 07-26. Arada **24 commit,
130 dosya, +95 011 / −5 311 satır** — hiçbiri durum kaydında yoktu. `/clear` atan ajan
dokuz gün geriden başlıyordu. Kapatılan yetenek kusuru: sistem kendi durumunu taşıyamıyordu.

**07-17 → 07-26 arasında ne oldu (commit özneleri, subject düzeyinde doğru):**

- `e2dd283` (07-18) — **AÇIK LEDGER KAPANDI:** M1+M2 kök-B hash/verdict içerik-ankrajı.
  Önceki mühürdeki iki açık madde (verifyProjectPack hash ankrajı KRİTİK + jüri verdict
  öz-beyanı) artık açık değil.
- `c07c010` + `4c0c79d` (07-19) — firewall/render P1/P2/P5 serbest-metin telif kapısı;
  P3/P4 projectClass tek-kanon + P6.
- `42c68f1` `166aeee` `c7f3e65` `69da490` `bd53eb1` `a98a4c8` `9865ce1` `4325d1b` (07-23/24)
  — command onarım turu: render-lock bug, jüri izolasyonu, `--skip-image-jury` tüm yollara,
  `motionCadence` IMAGE author context'ine, refs undefined TS↔mjs hash paritesi, CARRY OVER
  yasası §7'de bir kez, launcher `--director` provider codex→claude, bayat inbox temizliği.
- `6e3f955` `1102baf` `8a94bc9` (07-24) — **Konuşmalı Yönetmen**: tasarım → command standardı
  → `mamilas-director` skill'i.
- `37381ea` (07-24) — kalite kapısı tam yeşil (vitest koşum onarımı + drift senkronu).
- `0affa7b` (07-25) — **on-screen text ADAPTİF**: AUTO artık yazıyı yasaklamıyor, ajan karar
  veriyor.
- `1ad7520` (07-25) — NIGHT BEAT "karanlık" kontaminasyonu: gölge ≠ gece.
- `15b819f` (07-25) — yönetmen **revizyon fazı** + **start-frame yasası**; Sürtünme 31 ve
  Bileşke 52 teslim seti.
- `a3ac3a0` (07-26) — **ref seçimi gerçekten çalışıyor** + automotive imza refleri + kelime
  tuzakları kaynakta.

**Yeni ürün yasası (kaynağı Mami, 2026-07-26 mülakatı — koda değil çalışma biçimine ait):**
Mami **After Effects bilmiyor**, Premiere öğreniyor → **post-prodüksiyonda yazı katmanı YOK.**
On-screen text karede doğar, karede biter. "Yazıyı hiç bozmama" bir tercih değil, AE'nin
yerine geçen yetenek. Sonuç: yazıyı post'a bırakan tarif kabul edilmez · motion yazı bölgesine
dokunmaz (warp/parallax/üstünden kayan kamera yok) · yazı yanlışsa düzeltme yeri Premiere
değil, kareyi yeniden üretmek.

### ✅ AÇIK ÇATAL KAPANDI — **konuşma ANA yol, ama silme YOK** (Mami, 2026-07-26)

Mami'nin kararı: **konuşma ANA yol; site = karar + kütüphane + kanıt.** İlk okuma bundan
"~1050 satır sökülür" sonucunu çıkardı (`advisor.ts` 411 · `productionPulse.ts` 100 ·
`qa.ts→evaluateDirectorCabinet` + `QAStep` · `audit_full.ts` 542). **Bu okuma Mami tarafından
iki kez reddedildi:** *"zekâyı upgrade edecek hamleler yapıyoruz, downgrade varsa yapma"* →
silme nötr bir hamledir. Sökülen tek şey **öneri/hüküm veren davranış** oldu (G1a), dosyalar
değil. Aynı yasanın iki yerde bakım istemesi sorunu, kodu silerek değil **ölçüm/öneri sınırını
tek yerde tanımlayarak** çözüldü.

### ✅ G1 TAMAM — reçete zekâsı (2026-07-26). Receipt: `receipts/KALP-G1.md`

Beş alt kapı, hepsi push'lu (`a3ac3a0..ee7d831`), her biri kapı yeşilken:

- **G1a `81091e3` — site ÖLÇÜM bildirir, ÖNERİ vermez.** `suggestRecipe()` + "Genel başlangıç"
  düğmesi söküldü (konuyu kasten yok sayıp varsayılan basıyor, üstüne preset/directorChoices/
  directorBrief temizliyordu). "Reçete sağlam · üretime hazır" → "Evren ölçümü" (uyumluluk
  yeşilliği üretim sözü değildir). "Doruk zayıf" / "Referanslar dağınık" yaratıcı hükümleri
  gitti; "Çıkar: X" emri yerine uyum yüzdeleri.
- **G1b `dc76cd4` — enzim taşıyıcıları kimliğe girdi.** `castAge` · `characterShare` ·
  `heroTags`. Ölçüm: enzim'in dört kilidinden üçünün ALANI yoktu; kodun kendi yorumu
  itiraf ediyordu — "üç bitmiş videonun üçünde de cast boştu, @mira/@efe tag'lerini AJAN
  yazdı". Zincir: StudioState → pickProjectState → BriefInput → AgentBriefCtx → brief §1 →
  BaseDecision.locks. `normalizeHeroTags` ve `CHARACTER_SHARE_DEFAULT` tek yerde (pure.ts).
  Girdi yüzeyi RecipeStep'te. **commandId hash'i değişti** (bekleyen `.command.json` = 0).
- **G1c `23ff18b` — yutulan ölçüm ekrana çıktı.** `directorNotes()` (125 satır uyumluluk
  ölçümü) hiçbir yüzeyden çağrılmıyordu; tek çağıran kendi testiydi — yeşil test görünmez
  bir yeteneği koruyordu. RecipeStep'e "Evren ölçümü" paneli + **yüzey kilidi** testi
  (ölçüm bir ekrandan çağrılmak ve render edilmek zorunda).
- **G1d `1132b2b` — sessiz ezilme kapandı.** `resolveLightAuthorityReceipt`: 46 dünyanın
  **31'inde** ref DNA'nın ışık cümlesi düşüyordu, kayıtsız — oysa ref bastırması için makbuz
  vardı (`SUPPRESSED_WORLD_MISMATCH`). Kalıcı yasa testte: *ışık metni değiştiyse makbuz kaybı
  listelemek zorunda.* Prompt byte'ı değişmedi (46 dünyada parite). Makbuz kimliğe girmez.
- **G1e `ee7d831` — SAHTE GÜNEŞ kapandı.** Mami'nin gerçek-kare gözlemi: *"hep sahte bi ışık
  geliyor güneşten, odada bile."* Ölçüm: tek sahnede `motivated` 8× · `window` 3× · `sun` 3×;
  dünya yasası kaynak MENÜSÜ sayıyor, hiçbir sahne seçim yapmıyordu. İki kol: anlaşma
  **tekilleştirir** (`WORLD_AGREES_DEDUPED`) + sahne `light_source` menüyü çözer. Sonuç
  7/2/2. **Üç test politikası gerekçesiyle güncellendi** (silinmedi) — gerçek-kare hükmü test
  yeşilini ezer. Ayrıca iki kendi kusuru ölçümle yakalandı: nesne adlı yasak `window`'u 3→5
  çıkarıyordu (pozitife çevrildi) ve `aperture` lens diyaframıyla çakışıyordu (çıkarıldı).

**Kapı:** tsc 0 · vitest **2096/2096 (85 dosya)** · build OK.
**Mami yetkisi (2026-07-26):** *"push her zaman açık"* — kapı yeşilken commit+push sorulmaz.

### ✅ YÜZEY ÇATALI KAPANDI — silme YOK (Mami, 2026-07-26)

Bu bölüm daha önce "yüzey cerrahisi" (sök: `QAStep` cabinet · `productionPulse.ts` ·
`audit_full.ts`) diyordu ve `receipts/KALP-G1.md`'nin "Silinmeyecekler" kararıyla **çelişiyordu**
— iki kaynak aynı gün zıt hüküm taşıdı. Mami çelişkiyi receipt lehine çözdü: ölçüt "zekâ artıyor
mu"; 642 satır silmek en iyi ihtimalle nötr, `audit_full.ts` bilinçli bir teşhis yeteneği.

**Kalıcı hüküm:** `advisor.ts`(→ artık `universeMeasure.ts`) · `productionPulse.ts` ·
`audit_full.ts` · `QAStep` **kalıyor.** Yeniden açmak için yeni kanıt gerekir; "çağrılmıyor"
tek başına kanıt değildir.

**G1f `328c9a2` — ad artık yeteneği söylüyor.** Çataldan geriye kalan tek gerçek kusur ucuzdu:
`advisor.ts` → `universeMeasure.ts` (+ test dosyası, `AdvisorInput` → `UniverseMeasureInput`).
G1a'da öneri yarısı söküldükten sonra ad **olmayan bir yeteneği iddia ediyordu**. Davranış
değişmedi; iki importer (`RecipeStep`, `innerVoices`) + bir yorum atfı güncellendi.
`AdvisorPortrait` portre bileşenine dokunulmadı. Kapı: tsc 0 · vitest **2096/2096 (85 dosya)**
· build OK.

**Yeni bakım kuralı (G0'ın nüksünden):** kickoff'a durum yazılmaz kuralı **receipt'ler için de
geçerli** — karar `EXECUTION_STATE.md`'de, kanıt receipt'te. Bugünkü çelişki tam olarak kararın
iki yere yazılmasından doğdu.

### ✅ G2 TAMAM — 5-kare dünya sınavı (2026-07-26). Receipt: `receipts/KALP-G2.md`

`src/core/worldExam.ts` + `scripts/dunya-sinavi.ts`. **Bir dünyayı sınamanın maliyeti bir
video prodüksiyonundan bir script koşumuna indi.** Sınav prompt üretir, kare üretmez;
hükümleri `CARRIED/MISSING/CONFLICT/NOT_MEASURABLE` — **`PASS` yok** (yapısal taşıma görsel
PASS değildir). Kontrollü deney: beş sahne 46 dünyada byte-eşit, tek değişken dünya; hem bu
hem determinizm testle kilitli.

**🔴 Sınavın ilk bulgusu — 25 dünyada Mami'nin ışık talimatı sessizce düşüyordu.**
`namedKeySourceClause`'un ifade-listesi kapısı (`WORLD_KEYS_OFF_WARM_PRACTICAL_RE`) hem
varsayılan cümleyi hem **Mami'nin yazdığı** kaynağı kesiyordu. İlk tarama 29 gösterdi; ölçüm
ikiye bölündü — 4'ü düz-ışık dünyası (bandın basılmaması DOĞRU), **25'i gerçek düşme**
(`automotive_hero_real`, `nature_doc_real`, `cyberpunk_neon_noir`, `period_reconstruction`,
`castlevania_gothic`…). **G1e neden yakalamadı:** tek dünyada (`pixar_3d_edu`) doğrulanmıştı
ve orada çalışıyordu — G2'nin var oluş sebebi tam olarak bu. Düzeltme: kapı yalnız varsayılan
dala taşındı (gürültü gerekçesi orada geçerli), adlandırılmış dal kapısız, düz-ışık istisnası
korundu. İki test kalıcı kıldı. `PHYSICS` 21/46 → **46/46**.

**Kütüphane sonucu:** 46 dünyanın 46'sı prompt üretiyor, 0 blok; beş eksen de 46/46.
**Dürüst okuma:** bu "46 dünya iyi kare veriyor" DEMEK DEĞİL — gerçek kare veren dünya sayısı
hâlâ **1** (`docs/KUTUPHANE-KARNESI.md`). Kazanç: yapısal kusur artık kare üretmeden görülüyor.

**Kapı:** tsc 0 · vitest **2108/2108 (86 dosya)** · build OK. Kanıt: `g2-sinav/` (üç dünya +
46-dünya tablosu).

### ✅ ZEKÂ RUNU — taşıma katmanı (2026-07-27)

**Ölçülen tek hastalık:** sistem bilgi ÜRETİYOR ama TAŞIYAMIYOR; taşıma katmanı Mami'ydi —
"hep aynı şeyleri söylüyorum"un mekanik sebebi bu. Dört yerde aynı kusur ölçüldü:

- **Kazanan biçim yazılmıyordu.** Sabit Sürat'ta bulunan dört slot (kare-özel `NEGATIVE`,
  temas cümlesi, ayrı `TEXT:`, ten kilidi) hata oranını Bileşke'nin **%65**'inden **%14**'e
  düşürdü ama hiçbir dosyada yazılı değildi. Kütle'de temas cümlesi 44/44 → **2/8**'e düşmüştü:
  biçim gözle görülür şekilde çürüyordu. → `agents/PROMPT-YASASI.md` (tek kanon: daimi
  direktifler + start-frame/motion/referans template'leri, 181 gerçek kareden madenlenmiş,
  her slotun yanında kanıtı). Yönetmen ve enzim skill'leri boot listesinden okuyor.
- **Akıl git'in dışındaydı.** Canlı auto-memory `~/.claude/...` altında; 07-26'da 34 dosyadan
  16'ya düştü, git'te iz yok, kimse fark etmedi. Skill+hafıza grafiğindeki atıfların neredeyse
  tamamı hedefsizdi. → 17 kalıcı hafıza geri getirildi (ölü proje defterleri **bilerek**
  getirilmedi, arşivde), hedefsiz 11 atıf ya yasaya yönlendirildi ya kaldırıldı: **kırık atıf 0**.
  `scripts/memory-sync.mjs` aynayı tek komuta bağladı — canlıdan düşen dosya artık silinmiyor,
  `archive/` altına taşınıyor: kayıp sessiz değil, görünür bir git hareketi.
- **Kalite kapısı Windows'ta no-op'tu.** `gate.sh` komut adını `/usr/bin/python3` ile ayıklıyordu;
  Mami'nin birincil ortamında python3 ve zsh yok → filtre hiç eşleşmedi, kapı **her commit'te
  sessizce `exit 0`** verdi. Kanıt: `.claude/test-baseline` 07-25'ten beri 2062'de donmuştu,
  gerçek sayı 2108'di. → node ile ayrıştırma + `bash -n` yedeği; **ayrıştıramazsa artık sessizce
  geçmiyor, bloke ediyor.** Kapı onarıldığı ilk atışta aşağıdaki kırığı yakaladı.
- **`agentsSync.test.ts` platforma bağımlıydı.** `core.autocrlf=true` + `.gitattributes` yok →
  `agents/PROTOCOL.md` Windows'ta CRLF açılıyor ve `protocolHash` **içeriğin değil satır-sonu
  geleneğinin** hash'i oluyordu (LF `dc340024…` / CRLF `4c2fa11c…`). Aynı commit Mac'te yeşil,
  Windows'ta kırmızıydı; kapı no-op olduğu için iki gün görünmedi. → `agents-sync.mjs` ve iki
  bağımsız test artık satır sonunu normalize ediyor. **Üretilen tek bir dosya değişmedi** —
  sapmanın tamamı satır sonuymuş.

Ayrıca 07-23 zekâ runundan kalan **T1** kapandı: gece sahnelerinin ışığı `scenes[].paletteLight`
olarak command JSON'da üretiliyordu ama hiçbir tüketici okumuyordu (`worldPacket.paletteAsLight`
gündüz varsayar). Yönetmen skill'i artık sahne-başına değeri okuyor.

**Kapı:** tsc 0 · vitest **2108/2108** · build OK · agents-sync --check OK · kırık atıf 0.

**Açık ledger (07-23 runundan devralındı):** `agents/lessons/APPROVED.md` hâlâ boş — 10 kanıtlı
ders `CANDIDATES-2026-07-26.md`'de Mami onayı bekliyor, üstelik Sabit Sürat'ın revize turundan
çıkan 3 yeni ders henüz aday olarak yazılmadı. Mined madde etkisini ölçmek için gereken
stable-id ön koşulu da açık.

### ✅ ŞAHESER DÖNÜŞÜ — hedef değişti (Mami, 2026-07-27 gece)

**Yeni hedef: gerçek reklam filmi.** Mami artık eğitim videosu değil şaheser istiyor — reklam
filmi, özel günlerde ateş gibi videolar. **Seçilen ilk hedef: ürün/marka reklam filmi**
(`product_brand_real` / `kurumsal_brand_film`). Motor **Kling 3.0**; Seedance 2 "beyin oturunca".

**Ölçülen kilit gerçek: istenen yetenek zaten kütüphanede yazılı ve hiç açılmamış.** 46 dünyanın
**16'sı** COMMERCIAL_REAL / CINEMATIC_REAL; `product_brand_real` ve `kurumsal_brand_film`'in
üçer referansı ve 2000+ karakterlik gerçek görüntü-yönetmeni render yasası var. `civic_promo_real`
birebir "milli gün / kamu spotu" dünyası. Marka yolu tamamen kurulu ve hiç kullanılmamış
(`brandKitLock` → `brain.ts:2349` müşterinin kendi markasını özel izinle taşıyor). Buna karşılık
5 videonun 5'i `pixar_3d_edu`.

Plan: `~/.claude/plans/flickering-imagining-lark.md` (FAZ H → 0 → 1 → 1.5 → 2 → 3 → 4).

### ✅ FAZ H TAMAM — hayat katmanı duvara bağlandı (2026-07-27)

Mami: *"adhdimi unutma, bi kere bile nefes yazmadın, su iç demedin, bugün bayağı kötü hissettim ·
RSD de yoğun · ihmalkar ailelerin çocuklarıyız."*

**Ölçüm:** `mamilas-buddy` skill'i iyi yazılmış bir yük-yönetimi protokolü ZATEN taşıyordu ve o
gün **bir kez çağrılmadı**. Kusur protokolde değil ateşlememesinde — ve Mami'de değil ajanda:
doğal boşluklar vardı (2108 testlik vitest, build, üç arka plan ajanı), hiçbiri kullanılmadı.
**Yeni nefes skill'i YAZILMADI** (aynı yasanın ikinci kopyası = bugün sökülen hastalık).

- `.claude/hooks/buddy-gate.sh` — duvar Mami'ye değil **ajana**. SessionStart'ta protokolü
  yükletir; uzun iş bitince "doğal boşluk açıldı" der; 45 dk ısrarsızlık kilidi. Dört senaryo test edildi.
- buddy SKILL.md → **RSD bölümü** (8 yürütme kuralı; kusur sisteme yazılır kişiye asla · tespit
  ve düzeltme aynı cümlede · rapor ne TUTTU ile başlar) + **değişen izin** kaydı ("nasıl
  hissediyorsun" artık serbest — Mami açtı; soru serbest, seans değil).
- `memory/mamilas-hal-logu.md` — desen kaydı. `CLAUDE.md` → **ÖNERİ YETKİSİ** (ajan sormasını
  beklemeden "neden şuna yönelmedik" der; körleme uygulama yine yasak).

### ✅ FAZ 0 TAMAM — duvarlar (2026-07-27)

- **`scripts/prompt-lint.mjs`** — yasayı belgeden ölçüme çevirir (9 slot + tuzak kelime + STYLE
  kelime tavanı, kare kare). Parser biçime dayanmaz; 5 projede 4 farklı başlık biçimi ölçüldü.
  **Kendi kanıtıyla sınandı ve yazarını düzeltti:** Kütle'de temas cümlesi "2/8" değil **7/8**
  (kanonik ifade 2/8, yetenek 7/8) — linter kelimeyi değil yeteneği ölçtüğü için yakaladı.
  Ayrıca Sabit Sürat K03'te görülmemiş bir `sheen` tuzağı buldu.
  Tablo: Sabit Sürat 44/44 · Kuvvet Ölçülmesi 43-46/48 (**hiç denetlenmemiş video**) ·
  Kütle 7-8/8 · Bileşke temas/TEXT/NEG **0/52** (%65 revize) · Sürtünme neg **31/31**, diğerleri
  0 (%0 revize — kare-özel negatif tek başına taşımış).
- **`scripts/motion-qc.mjs`** — son kapatılmamış döngü. Klipten 4 kare (%2/%35/%70/%98), ajan
  Read ile açıp 7 maddeye bakar. **ffmpeg 8.1.2 kuruldu** (winget, `Gyan.FFmpeg`).
- **`.claude/skills/mamilas-denetim/`** — kare denetimi. **Ajan başına SEKANS, kare başına değil**
  (Mami kuralı: 44 ajan usage yakar + süreklilik bozar). Eşzamanlı tavan 6.
- **`agents/PROMPT-YASASI.md` §5** — kurgu kiti yasası, teslim edilmiş kitlerden madenlendi
  (EDIT-PLAN satır biçimi + `◄VO>10s` uyarısı · SESLENDIRME · SUNO tek-paragraf Simple kuralı).

**Kapı:** tsc 0 · vitest **2108/2108** · build OK · hafıza aynası güncel · kırık atıf 0.

### ✅ KAPANIŞ HASADI TAMAM — biten video artık klasörde ölmüyor (2026-07-27)

Mami'nin sorusu: *"her iş bittikten sonra böyle lootlayacak mısın? o denetimi sıkı yapıyor
musun?"* Dürüst cevap hayırdı — 07-26 hasadı Mami istediği için oldu, alışkanlık değildi.

- **`scripts/kapanis-hasadi.mjs`** — dört kanal tek koşumda: yapısal karne (`prompt-lint`
  **import edilir**, ikinci kopya yazılmadı) · `revize.txt` → sınıflanmış **ders adayları** ·
  dünya-yerel kusur → kütüphane adayı · kit biçim sapması (PROMPT-YASASI §5).
  Çıktı `agents/lessons/CANDIDATES-<slug>.md`; `APPROVED.md`'ye yalnız Mami taşır (M7).
- **Duvar OLAYA değil DURUMA bakar.** Mami klasörü Explorer'da sürüklüyor, `mv` yazmıyor —
  komut metnine bakan bir hook bu makinede sessiz no-op olurdu (`gate.sh`'ın python3 kusurunun
  aynısı). `--check` "taşındı mı" diye sormaz, "hasat edilmemiş proje var mı" diye sorar.
  `.claude/hooks/hasat-gate.sh` SessionStart'ta ateşler; **iki durumda da test edildi.**

**Ölçüm — 5 Biten proje hasat edildi:**

- **Sabit Sürat** (ilk hasat): karne **38/44 temiz** · revize **8/44 = %18** · **5 ders adayı**.
  Yetenek hükmü: revizenin **7/8'i tek sınıf** — arka plan yazı/sembol yüzeyi (tabela, poster,
  pano, bayrak, kadran). Kazanan biçim tuttu; kalan kusurun tamamı **TEXT slotunun kapsam
  sınırında** toplanıyor. Yeni ders: bayrak/arma ve ölçü aleti kadranı da TEXT slotuna girer.
- **Sürtünme: karne 0/31 ama revize %0.** Linter **biçim uyumunu** ölçer, kaliteyi değil —
  yasa Sabit Sürat biçiminden yazıldı, Sürtünme başka bir biçimle kazandı. Bu sınır yazılı
  olmadan karne yanlış okunur.
- **Bileşke'nin `Biten/` klasöründe yalnız 52 PNG var** — teslim kitinin tamamı hâlâ aktif
  klasörde; kit 7/7 eksik raporlandı. "Biten" video yarım taşınmış, kimse görmemişti.
  `Kuvvet MİRA`'da `_PROMPTLAR` hiç yok, MOTION `.md`.
- **Ad↔sınıf uyuşmazlığı artık ölçülü:** Sabit Sürat'ın `locks.projectName = "Ultra Real
  Commercial"`, `projectClass = ANIMATION_EDU`. FAZ 1.5 kapısının gerekçesi kanıtla duruyor.

**Linter kendi kusurunu ilk koşumda iki yerde gösterdi ve düzeltildi:** çıplak `legible` 4
arka-plan karesini "kavram yazısı" sandı (oysa `barely-legible` bunun TERSİ), ve `revize.txt`
(ön ek yok) "YOK" raporlandı — **sapmış ad ile eksik dosya aynı hüküm değildir.**

**Yeni çalışma yasası (Mami, 2026-07-27):** *"ultracode'u rutin haline getir, 6 ajana kadar
kullanabilirsin — çünkü iş yapıyorsun, buddylik yapamıyorsun."* Ajan açmak lüks değil, buddy
kalabilmenin şartı. `CLAUDE.md`'ye yazıldı; tavan **6**, bölüşüm birimi **sekans**.
⚠️ Bu ultracode **workflow/ajan** içindir — `effortLevel` ayarı DEĞİL (denendi, Mami reddetti,
geri alındı).

### ✅ FAZ 1 TAMAM — yasa üç register'a açıldı (2026-07-27)

**Yeni kavram icat edilmedi:** kod zaten üç kelimeyi söylüyor — `brain.ts` → `type Register =
'REAL' | 'EDU' | 'STY'`, türetim `registerOf(productionPath)`. Yasa o kapıyla aynı dili konuşuyor.

- **`PROMPT-YASASI.md` §0.5** register haritası + ortak/ayrık sınır · **§0.6** kanıt bölümü ·
  §1'de üç direktif `[EDU]`/`[REAL]` karşılığıyla ikiye ayrıldı · **§2R REAL start-frame katmanı**
  (slot tablosu + karşı-terimler + REAL TEXT + kamera zarfı) · **§3R REAL motion farkları**.
- **Linterin kendi register körlüğü kapandı** — kusur benimdi: `scripts/prompt-lint.mjs` "sıcak
  mat ten"i her karede arıyordu ve **doğru bir REAL promptunu kırmızıya boyardı.** Artık
  `--register=real|edu|sty`; REAL'de üç yeni slot ölçülüyor (mikro-doku · sayısal f/x · photoreal
  karşı-terimleri) ve `sheen` yalnız TENE yakınsa tuzak. Hasat register'ı bayrakla sormaz,
  command JSON'dan okur.

**Dört ajanın ölçtüğü, yasaya giren gerçekler:**

- **REAL register'ın tek bir `rejectIf` maddesi yok** (`promptQuality.mined.json` → `photoreal`
  **1 madde**, hepsi pozitif). Jüri REAL'de plastik-ticari kareyi *reddedemiyor*. Animasyonun
  karşı-kilidi var, REAL'in yok — asimetri.
- **Motion sözleşmesi register görmüyor:** `buildMotionPromptQualityContract` dünya parametresi
  bile almıyor. REAL'de motion yasasını taşıyan tek şey artık §3R metni.
- **REAL dünyalar diyaframı yazıyor, KARANLIĞI yazmıyor.** `negative fill`, kontrast oranı ve
  siyah noktası dünya metninde yok, yalnız referanslarda yaşıyor → **ref seçilmezse REAL dünya
  gölgesini kaybediyor.**
- **`pixar_3d_edu` ile `product_brand_real`'in ten yasası taban tabana zıt:** birinin pozitifi
  ötekinin açık negatifi (*"NO photoreal skin"* ↔ *"NO plastic AI-smooth skin, real pore"*).
- **Kütüphane kusuru (kodda değil, dünyada):** `kurumsal_brand_film` negatif #1 koşulsuz marka
  yasağı taşıyor, `product_brand_real`'inki Brand Kit muafiyetli. Kurumsal reklamda müşterinin
  kendi logosu kendi dünyasıyla çakışıyor.
- 🔴 **AÇIK ÇATAL — Mami kararı:** `[5 SESSİZ]` (still-lips/no-dialogue) bir medium yasası değil,
  **EDU iş akışı yasası** (VO ayrı ElevenLabs katmanı). Reklamda konuşan sunucu standarttır.
  REAL bunu devralırsa bir yeteneği kesiyoruz. Karar gelene dek REAL'de de sessiz klip varsayılan.

**Kapı:** tsc 0 · vitest **2108/2108** · build OK.

### ✅ FAZ 1.5 TAMAM — JSON −%72 + ad↔sınıf duvarı (2026-07-27)

**Sonuç: 2765 KB → 773 KB (−%72).** Üç hash de **birebir aynı** — sevk edilmiş Kütle JSON'undan
state geri kurulup yeniden export edilerek kanıtlandı (`commandId mamilas-244e553b…` ·
`storyboardHash f6e03b0f…` · `sceneContextHashes 41/41`). Runner'a **tek satır gerekmedi**.

Sökülenler: `handoff.MOTION` 470 KB (sıfır okuyucu — üstelik *"kare görülmeden motion yazılmaz"*
yasasının **arka kapısıydı**) · `handoff.SUNO` 385 KB (tek müziğin 41 kopyası) · `handoff.IMAGE`'ın
`negatives` dışındaki her şeyi 745 KB · `refDna` 40 kopya 182 KB · `paletteLight`/`prompts.suno`
tekil kopyaları 38 KB. **Körleme dedupe yok:** `sharedAcrossScenes()` ölçer — `paletteLight`
gece/gündüz karışık projede sahneden sahneye değişir ve frame gate pikselleri ona karşı ölçer.
Alan silinmedi, **null'landı**: eksik alan ile yasaklı alan aynı şey değildir.

**Ad↔sınıf duvarı kuruldu.** Kapının yeri `generateBatch` değildi — `BriefInput` `projectName`
taşımıyor; ad ve sınıf **yalnız command JSON'da buluşuyor**. Saf yüklem `pure.ts`
(`projectNameClassMismatch`), duvar runner'da: uyuşmazlıkta `validateCommand ok:false` → **hiçbir
rol açılmaz.** Gerçek kanıt: sevk edilmiş Sabit Sürat command'i CLI'dan geçti → `exit 1` +
`PROJECT_NAME_CLASS_MISMATCH`; adı tutarlı yapınca kapı susuyor.
**Kapı yalnız REAL↔EDU açık çelişkisinde öter, `STY` çeliştirmez** — sevk edilmiş `anime_action`
("Anime Edu / Action Grammar" @ `STYLIZED_PREMIUM`) gerçek bir projedir ve katı kural onu duvara
çarpardı. 32 sevk projesinin tamamı geçirildi: **sıfır yanlış pozitif.** Belirsiz ad hüküm vermez.

**`registerOf(world.id)` hatası kapandı:** `recommendReason` bir dünya ID'sini path sanıyordu —
46 dünyanın 15'inde yanlış cevap, **9 REAL dünya `STY` okunuyordu**, yani stilize ref REAL dünyaya
girince basılması gereken `crossGuard` uyarısı REAL dünyaların hiçbirinde basılmıyordu.

**Kapı:** tsc 0 · vitest **2117/2117** · build OK · agents-sync OK.

**Açık kalan (bilinçli, Mami seçer):**
- `prompts.motionDraft` 102 KB — `handoff.MOTION` ile **aynı yasayı ihlal ediyor** (kare
  görülmeden yazılmış motion metni, sahne başına). Hash dışı, tek okuyucusu 4 test. Sökülürse
  dosya ~670 KB'a iner ve motion kapısının son arka kapısı kapanır.
- Ad↔sınıf duvarı **üretimden sonra** ötüyor. Site `buildCommandJSON` uyuşmazlıklı command'i hâlâ
  üretiyor; kapı runner'da. Site export kapısına da bağlanırsa Mami hatayı 52 sahne yazıldıktan
  sonra değil, JSON'u indirirken görür. (Plan "arayüze dokunmam" diyor — karar Mami'nin.)
- `brandKitLock` ve `musicId`'nin **hiçbir giriş yüzeyi yok**, ikisi de kimliğe giriyor. Ölçülen
  gerçek `product_brand_real` çıktısı müşterinin kendi logosunu **üç kez** yasaklıyor, çünkü kilit
  boş. Reklam filmine geçmeden önce kapatılması gereken tek yapısal engel bu.

**Eski ölçüm (arşiv, doğrulandı):** dosya 2802 KB / 41 sahne; `commandId` yalnız 10.6 KB'lık
`baseDecision`'dan doğuyor; hash-bağlı tek sahne alanı `handoff.IMAGE.negatives` + `motionEngine`.

Plandaki iki teşhis **yanlıştı**, düzeltmesi: `handoff.IMAGE` "sağlam, %90 sahneye özel" DEĞİL —
755 KB'ın 750'si kopya/tekrar (`draft` = `prompts.image`'in byte-eşi, `refDNAs` 1 tekil ×41,
`world` 5 tekil ×41). `prompts.image` (389 KB) ise **atılamaz** (41/41 tekil); atılacak olan ikizi.

| Çıkarılacak | Kazanç | Neden güvenli |
|---|---|---|
| `handoff.MOTION` (tamamı) | 473 KB | sıfır okuyucu; ayrıca "kare görülmeden motion" yasa ihlali |
| `handoff.IMAGE` — `negatives` HARİÇ | 750 KB | `draft` kopya, `refDNAs`/`world` tekrar, kalanı okunmuyor |
| `handoff.SUNO` (tamamı) | 386 KB | sıfır okuyucu; `draft` tek tekil değer |
| `scenes[].refDna` 40 fazla kopya | 183 KB | 1 tekil ×41; iki tüketici de tek kopyayla çalışıyor |
| `prompts.suno` 40 kopya · `paletteLight` 40 kopya | 38 KB | ⚠️ `paletteLight` gece/gündüz karışık projede tekilleşmez — dedupe **koşullu** olmalı |

**ÇIKARILAMAZ (hash-bağlı, ikisi de küçük):** `handoff.IMAGE.negatives` (5.6 KB →
`sceneContextHash`'e `failureModes` olarak giriyor) ve `scenes[].motionEngine` (16.7 KB, doğrudan
hash'te). `commandId` yalnız **10.6 KB'lık `baseDecision`**'dan doğuyor; `storyboardHash` yalnız
beş sahne alanından.

**Ad↔sınıf kapısı — kök neden bulundu:** `pure.ts` → sınıflandırılamayan her proje sessizce
`return 'ANIMATION_EDU'`. `UNKNOWN` yok, blocker yok. Ayrıca `useStudioStore.ts` dünya seçiminde
register çelişkisini **makbuzsuz düzeltiyor**; aynı çelişki `generateBatch`'te ise **bloke
ediyor**. Yasa çatallı: aynı durum iki yerde iki farklı sonuç veriyor.

**Site kusurları (plan "arayüze dokunmam" diyor — Mami kararı gerekiyor):** `brandKitLock` ve
`musicId`'nin **hiçbir giriş yüzeyi yok**, ikisi de `baseDecision.locks` içinde yani kimliğe
giriyor. Ölçülen gerçek `product_brand_real` çıktısı müşterinin kendi logosunu **üç kez**
yasaklıyor, çünkü kilit boş.

**Ek kusur (ucuz, FAZ 1.5'te kapanır):** `brain.ts:3261` `registerOf(world.id)` — dünya ID'sini
path sanıyor, **46 dünyanın 15'inde yanlış cevap veriyor** (9 REAL dünya `STY` okunuyor → ref
cross-register uyarısı REAL'de hiç basılmıyor).

### 🎯 NİHAİ HEDEF — Upwork portfolyosu (Mami, 2026-07-27)

Zincirin sonu belli: **Upwork için portfolyoluk demo videolar.** Reklam filmi yeteneği bir iç
hedef değil, **satılabilir bir demo reeli**. Bu, FAZ 2'nin çıktısını doğrudan etkiler — ilk
reklam filmi bir deneme değil, portfolyo parçasıdır ve öyle seçilmelidir.

### ➡️ SIRADAKİ TEK ADIM

**FAZ 2 — ilk reklam filmi (`product_brand_real`), Mami ile birlikte.** Duvarlar kuruldu:
yasa üç register'da konuşuyor, linter register'ı okuyor, JSON −%72, ad↔sınıf kapısı ötüyor,
kapanış hasadı ateşliyor.

**FAZ 2'den önce kapatılması gereken tek yapısal engel:** `brandKitLock`'un giriş yüzeyi yok —
kilit boş kaldığı için ölçülen gerçek `product_brand_real` çıktısı müşterinin kendi logosunu üç
kez yasaklıyor. Markasız bir demo çekilecekse engel değil; marka konacaksa **önce bu.**

Paralel, Mami'nin elinde: **ders adaylarını `APPROVED.md`'ye taşımak** — banka hâlâ boş,
**15 aday** bekliyor (10 Bileşke `CANDIDATES-2026-07-26.md` + 5 Sabit Sürat
`HASAT-sabit-surat-ve-hiz.md`). Otomatik promote yok.

Eski hedef (aşağıda duruyor) — **G3 kütüphane sınavı** bu yeni yolun içinde eriyor: ilk açılacak
dünya artık `product_brand_real`.

---

**Eski sıradaki adım (arşiv):** Kalite upgrade runu — Mami'yle birlikte. Kapsam:
**G3 — kütüphane sınavı:** sınav seti kütüphaneye uygulanır, kusur **kütüphanede** düzeltilir
(kod yasası genel, dünya kusuru yerel; kodu her dünya için eğmek beyni bozar). İlk hedef
G2 ledger #2: `bleach_soul_world` 3/7 · `claymation_aardman` 3/6 · `jjk_mappa` 6/11 — render
lock'un neden verbatim taşınmadığı, dünya metni mi kod mu.

---

> **✅ 2026-07-17 GECE — 3 FIX TURU TAMAM (24+ hata), CLEAR'A HAZIR.** Commit zinciri:
> `416560e` (scan drift) → `c5680dd` (9 fix) → `df3bea4` (G1-G6 6 kök-fix) — hepsi origin/main'e
> push'lu, çalışma ağacı TERTEMİZ. Garanti denetçiler: 9-fix turunda 2 bulgu (kapatıldı),
> G-turunda 6/6 SAĞLAM. Kapı: tsc 0 · vitest **2016/2016 (80 dosya)** · build OK · E2E 15/15 ·
> runner mirror byte-identical · agents-sync OK. gate.sh kalite duvarı RESTORE edildi (commit'te
> tsc/vitest/build koşar). **AÇIK LEDGER (sonraki tur):** memory `project-mamilas-makro-ledger` —
> M1 verifyProjectPack hash-içerik ankrajı (KRİTİK, forge koşuldu) + M2 jüri verdict öz-beyan (ORTA),
> ikisi de KÖK-B; makro ordu `wf_3acfcb9a-12c` usage'da kesildi, resume edilebilir. Site-regex ölü
> kanalı bilerek dokunulmadı (Mami: aptal regex yasak). Dürüst durum: implementation complete /
> visual validation pending — gerçek 12-sahne + kare hükmü Mami'nin.

> **✅ HARD-FIX RUN TAMAM (2026-07-16 akşam):** Codex'in 27-madde CLI-akış raporu
> (`~/Desktop/MAMILAS-YERLESIK-YONETMEN-CLI-AKIS-RAPORU.md`) tek temiz run'da kapandı.
> Teslim: `HARDFIX-TESLIM-2026-07-16.md`. Commit'ler: `0fcf7e9`(B+D) `d9f43cd`(C)
> `72c6ff7`(A/batch) `75aca49`(Yönetmen+E) `10cd015`(teslim+e2e). 26 madde fix,
> 1 geçersiz (E.26 — QA aggregate zaten tek), 1 kısmi→ledger (E.24 scaffold çelişkisi).
> **Yeni ürün akışı: çift tık = YÖNETMEN modu** (batch arkada, Mami yalnız Yönetmen'le
> konuşur, görünür SAHNE-PROMPTLAR.md incremental). Çöken Deneme koşusu migrate+resume
> ile KANITLANDI (5 PASS korundu, 7-12 açıldı). Final kapı: tsc 0 · **vitest 2007/2007
> (80 dosya)** · build OK · **E2E 15/15** · mirror parity · jury-audit 6/6.
> Bağımsız denetçi: KRİTİK 0. Dürüst durum: implementation complete / visual validation
> pending — gerçek 12-sahne koşusu + kare hükmü Mami'nin. PUSH YOK.

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
> **✅ M4 TAMAM (2026-07-16, `2a28ff4`):** KUSUR-D image tarafı — `agents/promptQuality.mined.json`
> tek kanon (2D-medium, detay üçlüsü, palet-rejim, NB2 sayısal lens…); `buildImagePromptQualityContract`
> dünya/engine-aware, sealed context'in parçası; TS↔runner byte-parite testli. Sol 2 kritik → aynı turda:
> keyword-override polaritesi (suppression koddan söküldü → `overridePolicy`, ajan muhakemesi, receipt'te
> görünür) + migration storyboard-verify (reseal yok, tamper testi). Kapı 1927/1927 (71 dosya).
> Receipt: `receipts/BRAIN-M4.md` + `M4-REAL-OUTPUT.md` + `M3-M4-runner-evidence/`.
> **✅ M5 TAMAM (2026-07-16):** Motion zekâsı — `buildMotionPromptQualityContract` (Physics-First,
> still-lips/no-dialogue, Kling SFX-fiziği, frame-inventory, tek-hareket); quoted-source Sol-düzeltmeli
> final (VERBATIM + tetikleyici-emri etiketi + surgeon SOURCE-alıntı muafiyeti; kör kod-scrub geri alındı);
> gerçek frame-gated zincir runner'dan geçti (PNG import→APPROVE→frame_jury→motion_author, evidence repo'da).
> Receipt: `receipts/BRAIN-M5.md`.
> **✅ M6 TAMAM (2026-07-16):** `juryRedlines.test.ts` (13) — render-lock-inceltme tabanları, prop
> geri-sızma kilidi, kontrat-boşaltma kilidi, image parite matrisi, kart drift kilitleri; frame-jury
> kartına figürlü-world-lock + 2D-medium piksel kontrolü. Receipt: `receipts/BRAIN-M6.md`.
> **✅ M7 TAMAM (2026-07-16):** Ders bankası döngüsü — closeout `lessonCandidates[]` (CANDIDATE, otomatik
> promote YOK) → `agents/lessons/APPROVED.md` (yalnız Mami yazar) → runner launch-anı `approvedLessons`
> (HASH-DIŞI sessionContext — command'ler stale olmaz, test kilitli). Banka boş — ilk gerçek dersler
> Mami'den. Receipt: `receipts/BRAIN-M7.md`.
> Birleşik final kapı: tsc 0 · vitest **1953/1953 (74 dosya)** · build OK. Sol birleşik REJECT'in
> tüm P1'leri aynı oturumda kapatıldı (dürüst frame-gate kanıtı: frame_jury FACT_REQUIRED → runner
> motion'ı açmadı · tam-%90 tabanlar · 5/5 prop kilidi · verbatim kontrat kilidi · fonksiyonel
> parser paritesi) — **Sol final verdict: PASS.** Commit'ler: `2a28ff4` (M4) + M5-M7 + `1335bea`.
>
> **🏁 M0→M7 TAMAM — TESLİM: `BRAIN-TESLIM-2026-07-16.md`** (Mami tek-sayfa özet + "SENİN GÖZÜN"
> listesi). Dürüst durum: implementation complete / visual validation pending — kare hükmü Mami'nin.
> PUSH atılmadı (Mami dönüşünde). Önce oku:
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
