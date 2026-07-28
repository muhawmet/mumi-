# OPUS 5 — MAMILAS MAKRO BAĞLANTI CERRAHİSİ

> Bu metin Muhammet'in doğrudan görevlendirmesidir. İstişare et, gerekli gerçekleri yeniden
> ölç, önemli ürün kararlarını Muhammet'le konuş, seçilen mimariyi uygula, doğrula ve sistemi
> yeniden video üretimine teslim et. Bu bir “öneri listesi bırak ve çık” görevi değildir.

## Sana verilen rol

Sen Mami'nin yalnız yazılımcısı değilsin. Bu turda üç rolü birlikte taşı:

1. **Yerleşik sistem mimarı:** Güçlü parçaların gerçekten ana hatta bağlı olup olmadığını ölç.
2. **Showrunner:** Her teknik kararın sonunda daha iyi ve daha güvenilir video çıkmalı.
3. **Buddy:** Mami'ye seçenek çöplüğü dökme; çalışma belleğini sen tut, gerekli tek kararı
   gerekçeli öneriyle getir ve iş seçilir seçilmez devam et.

Mami programcı ya da prompt mühendisi olmak zorunda değil. Onun bilmediği için soramadığı
makro imkânları bulmak senin görevin. “İstediğini yaptım” yeterli değildir. Bir temel teknoloji,
yerel araç, mimari kalıp veya üretim kabiliyeti MAMILAS'ı belirgin biçimde iyileştirecekse:

- önce gerçek ihtiyacı ve kazancı sade Türkçeyle anlat;
- **“Mami yerinde olsam şunu yapardım”** diyerek tek tavsiyeni ver;
- gerekli değilse menü açma;
- ürün yönünü değiştirecekse uygulamadan önce onunla konuş;
- seçildikten sonra işi sonuna kadar götür.

Vanilla JS ile başlanıp Vite/React/Three.js'in ancak sonradan keşfedilmesi gibi bir körlüğü
tekrarlama. Mami'nin adını bilmediği ama ihtiyacı olan şeyi proaktif biçimde yüzeye çıkar.

## Nihai sonuç

Bu operasyon bittiğinde temiz bir Claude veya Codex oturumu yalnız kendi kanonik giriş
sözleşmesinden açıldığında:

- aktif videonun ne olduğunu ve üretimin hangi aşamada kaldığını doğru bilir;
- buddy çalışma biçimini gerçekten yükler;
- geçerli Mami direktiflerini ve ilgili precedent'leri kayıpsız bulur;
- yeni videoyu doğru sırayla `enzim → yönetmen → prompt kalite kapısı → gerçek kare denetimi
  → motion → kurgu kiti → kapanış hasadı` hattından geçirir;
- kısmi bir dosyayı bütün prodüksiyon sanıp yeşil vermez;
- revize edilmiş/görülmemiş bir kareye geçersiz motion yazmaz;
- REAL reklamı sessizce EDU'ya düşürmez;
- Claude ve Codex aynı ürüne açılır ama sağlayıcıya özgü girişleri yanlış birbirine kopyalamaz;
- bütün bunları harici API, ikinci lifecycle runner veya otomatik görsel üretim servisi olmadan
  yapar.

Bu hedefin kısa adı:

> **MAMILAS'ta özellik varlığı değil, yetenek bağlantısı kanıtlanacak.**

## Üslup ve muhakeme sınırı

- **MAKRO düşün.** “Şu kelime çıktı”, “firewall bunu saydı”, “bir regex kaçırdı” tek başına
  bulgu değildir. Bulgu bir yeteneği açıklamalı: “Final Brief yönetmen kararını taşımıyor”,
  “buddy çağrılıyor ama yüklenemiyor”, “kapı projenin yalnız dörtte birini ölçüyor” gibi.
- Kelime yalnız kanıt olabilir; raporun konusu olamaz.
- Kusuru kişiye değil sisteme yaz. Ne tuttuğunu önce söyle, sonra kopukluğu ve onarımını aynı
  bölümde ver.
- Yeşil test, var olan dosya veya uzun doküman çalışma kanıtı değildir. Ana akıştan gerçek
  çıktı üret.
- Yeni bir sistem kurmadan önce mevcut parçayı bağlayıp bağlayamayacağını araştır.
- İç tartışmayı dökme. Karar, kanıt, uygulama ve sonuç ver.
- Hata yapma hakkın var; gizleme hakkın yok. Varsayım yanlışsa kaydı düzelt ve devam et.

## Yetki ve faz

Mami bu metinle **sınırlı bir mimari kapanış operasyonuna** açıkça izin veriyor. Aktif
`İCRAAT` profili üretim sırasında kodu donduruyor; bu görev ise bağlantı cerrahisi gerektiriyor.

Bu nedenle:

1. Çalışmaya başlamadan mevcut worktree'yi ve kullanıcı değişikliklerini koru.
2. Operasyonu görünür ve sınırlı bir `İNŞA` turu olarak kaydet.
3. Kaynak üretim dosyalarını ve Mami'nin gerçek karelerini bozma.
4. Operasyon bitince giriş sözleşmelerini yeniden `İCRAAT` fazına döndür.
5. İCRAAT'a dönüşü yalnız gerçek bir uçtan uca prova ve bağımsız kapanış denetiminden sonra yap.

Destructive reset/checkout yok. İlgisiz dosyaya dokunma. API anahtarı, model backend'i,
otomatik provider çağrısı, ikinci runner veya ödeme altyapısı önerme.

Mami'nin ayrıca kapattığı kapsam:

> Karelerin dosya adı/numarası üzerinden kimlik taşıması meselesine bu turda girme. Onu Mami
> kendisi ele alıyor. Ancak o konu dışındaki VO–karar–prompt–denetim–motion bağlantılarını kapat.

## İlk açılış — ezberden başlama

Önce şu kaynakları oku:

1. `CLAUDE.md`
2. `AGENTS.md`
3. `docs/ai/PROJECT_CONTRACT.md`
4. `docs/ai/faz-icraat.md` ve `docs/ai/faz-insa.md`
5. `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md`
6. `agents/PROMPT-YASASI.md`
7. `.claude/skills/` ve `.agents/skills/` altındaki aktif üretim skill'leri
8. `.claude/settings.json`, `.claude/hooks/`, `scripts/memory-sync.mjs`
9. gerçek aktif Kütle ve Ağırlık command/prompt/kare-denetim/kurgu kiti
10. `src/core/` içindeki gerçek karar, command export, kalite ve motion sözleşmeleri

Fakat bu listeyi bütün alt ajanlara körlemesine verme. Bugünkü state dosyası 1000+ satır;
önce ana ajan olarak incele, her araştırma koluna yalnız gereken dar kanıt paketini ver.

## Önce korunacak doğru mimari

Sistemi yeniden icat etme. Şunlar doğru yön ve korunmalı:

- Site dünya/karar **tarifi** verir; nihai motor prompt'unu konuşmalı yönetmen yazar.
- Manuel Magnific → Mami kare hükmü → Kling akışı korunur.
- `PROMPT-YASASI.md` gerçek kare ve revize sonuçlarından madenlenmiştir.
- Dünya/ref/palet/engine kanonu kod ve `SURGERY_DATA.json` içindedir.
- Start frame her şeyi taşır; motion yeni öğe doğurmaz.
- Mami açık yaratıcı kararlarda loop'tadır.
- Precedent yasa değildir; sonraki projede Mami'ye sunulur.
- Ajan başına kare değil sekans ilkesi doğrudur.
- Kapanış dersi otomatik promote edilmez; Mami onayı gerekir.

Sorun bunların yanlış olması değil. Sorun, aynı üretim durumuna bağlı ve birlikte
kanıtlanabilir olmamalarıdır.

## Codex'in 2026-07-28 ölçümünden gelen başlangıç hipotezleri

Aşağıdakileri körlemesine “doğru” kabul etme. Her birini güncel worktree'de yeniden çalıştır.
Doğrulanırsa kök bağlantıyı onar; güncelde kapanmışsa kanıtla kapat.

### P0 — Giriş sözleşmesi bayat ve pahalı gerçeğe açılıyor

`CLAUDE.md` ve `AGENTS.md` her oturumda
`artifacts/decision-pipeline-implementation/EXECUTION_STATE.md` okunmasını emrediyor.
Dosyanın kendi kaydı, 121 ajanın aynı 1099 satırı tekrar okumasının 6.5M token yaktığını söylüyor.

Daha kötüsü, güncel üretim gerçeğiyle uyuşmuyor:

- State tablosu Kütle ve Ağırlık'ı “8 intro kare, kurgu kiti yok” diye taşıyor.
- Diskte 35 start frame planı ve `MOTION + EDIT-PLAN + SESLENDIRME + SUNO` kiti var.
- Claude canlı memory index'i de bu güncel Kütle aşamasını taşımıyor.

Yani kanona uyan yeni ajan yanlış yerden başlıyor.

**İstenen mimari:** Büyük tarih/ledger dosyasını “her oturum hot path” olmaktan çıkar. Küçük,
makinece güncellenen bir **NOW / ACTIVE PRODUCTION** kaydı oluştur:

- aktif proje;
- register/world;
- onaylı storyboard/kare sayısı;
- tamamlanan aşama;
- sıradaki tek aşama;
- açık Mami kararı;
- ilgili artifact yolları;
- son güncelleme kanıtı.

Derin ledger ve receipt'ler denetim/inşa sırasında okunur; normal video oturumu yalnız hot state
ve ihtiyaç duyduğu receipt'i okur. Bu yeni bir ikinci gerçeklik olmasın: hot state mevcut
artifact'lerden veya tek kapanış komutundan deterministik türesin.

### P0 — Buddy anlatılıyor ve hook ile çağrılıyor, fakat yetenek yok

Ölçülen durum:

- `CLAUDE.md` çalışma biçimini `mamilas-buddy` skill'ine bağlar.
- `.claude/hooks/buddy-gate.sh` SessionStart ve uzun iş sonrasında “skill'i yükle” der.
- Senkron memory içindeki buddy persona da aynı skill'e ve
  `references/dehb-mufredat.md` dosyasına gönderir.
- Fakat `~/.claude/skills/mamilas-buddy/SKILL.md`,
  `~/.agents/skills/mamilas-buddy/SKILL.md` ve
  `~/.codex/skills/mamilas-buddy/SKILL.md` ölçüm anında yoktu.
- `docsContract.test.ts` 54/54 geçti; çünkü hook'un executable olmasını ölçüyor, hook'un çağırdığı
  skill'in varlığını ve yüklenebilirliğini ölçmüyor.

Bu tam olarak “ajanı yapmışsın ama bağlanmamış” sınıfıdır.

**İstenen mimari:** Buddy'yi makineye özel global klasörde hayalet dependency olarak bırakma.
Claude ve Codex'in erişebileceği repo-ortak bir yetenek/çalışma sözleşmesine dönüştür. Sağlayıcı
adaptörü yalnız nasıl yükleneceğini bilsin. Meta-duvar şunları ölçsün:

- hook'un işaret ettiği capability gerçekten var;
- bütün doğrudan reference dosyaları çözülüyor;
- sentetik SessionStart çıktısı yüklenebilir bir hedefe gidiyor;
- Claude ve Codex aynı buddy davranış çekirdeğine ulaşıyor.

Mami'yle konuşurken buddy protokolünü gösteriye çevirme. Harici çalışma belleği, tek karar,
sonuç kapısı, geri sarma yasağı ve “bak şunu yaptık” kapanışı ana çalışma biçimidir. Su/nefes
teklifi doğal boşlukta bir kez, üç parçalı ve ısrarsızdır; iş durmaz.

### P0 — Hafıza tek bir hafıza değil; taşıma mekanizması şu an split-brain

Ölçülen durum:

- Claude canlı auto-memory repo dışında yaşıyor.
- `docs/ai/sync/memory/` yalnız aynadır.
- Codex'in kendi memory sistemi ayrıdır.
- Skill'ler `memory/...` ve `MEMORY.md` diye belirsiz yollar kullanıyor.
- `node scripts/memory-sync.mjs --check` ölçüm anında iki sapma buldu:
  bir yeni dosya ve değişmiş `MEMORY.md`.
- Mevcut sync canlı tarafı mutlak otorite sayıyor; ikinci makinede repo daha yeniyse doğru bilgiyi
  archive'a sürme riski state ledger'ında gerçek olay olarak kayıtlı.

**İstenen mimari:** Hafızayı üç sınıfa ayır:

1. **Standing orders / ürün yasası:** repo kanonu, testli, sağlayıcıdan bağımsız.
2. **Mami-onaylı precedent ve üretim dersi:** taşınabilir ortak depo, conflict-aware.
3. **Oturuma özgü geçici not/hal kaydı:** sağlayıcı-local olabilir, kanon değildir.

Sync yönü otomatik tahmin edilmesin. `check`, `adopt repo`, `pull live`, `archive dropped`
ayrı ve açık eylemler olsun; çatışmada mutasyon yapmadan dursun. Yeni oturumda hangi hafıza
sınıfının yükleneceği skill giriş/çıkış sözleşmesinde açık olsun.

### P0 — Skill paritesi isim paritesi; operasyon paritesi değil

Ölçülen durum:

- Test `.claude/skills` ve `.agents/skills` klasör adlarını eşitliyor.
- Fakat `.agents/skills/mamilas-director/SKILL.md` Codex'e bile `CLAUDE.md`,
  `.claude/rules/core-prompt-path.md`, belirsiz `MEMORY.md` ve `memory/` yollarını okutuyor.
- `mamilas-ref` iki yüzde byte-eşit değil; test bunu görmüyor.
- Skill dosyasının varlığı, doğrudan dependency'lerinin varlığını ve bir sonraki aşamaya gerçek
  artifact teslim ettiğini kanıtlamıyor.

Kopyayı parite sanma. Ortak workflow çekirdeği ile Claude/Codex adaptörünü ayır.

Her aktif skill için makinece denetlenebilir küçük bir capability contract tanımla:

- `trigger / intent`
- `preconditions`
- `required inputs`
- `authoritative sources`
- `outputs`
- `postconditions`
- `next capability`
- `provider-specific adapter`

Test yalnız klasör adı değil bu grafiği doğrulasın: dependency çözülebiliyor mu, çıktı gerçekten
sonraki skill'in girdisi mi, sağlayıcı adaptörü ortak çekirdeği ezmeden yükleniyor mu?

### P0 — Final Brief konuşmadan sonra final kalmıyor

Kütle ve Ağırlık gerçek üretiminde ölçülen ayrışma:

**Command artifact:**

- 41 scene;
- kaynak protagonisti Mira;
- `cast=""`;
- `heroTags=[]`;
- `directorBrief=""`;
- `timeLight="morning"`;
- scene prompt'larında `@efe` yok.

**Mami + Yönetmen'in onayladığı gerçek film:**

- 41 VO beat → 35 start frame;
- protagonist `@efe`, uzay varyantı `@efe_space`;
- `@anne`, `@ogretmen`, `@terazi`, `@dinamometre`, `@elma`;
- Türk/Anadolu cast ve 5. sınıf yaşı;
- açılış dusk/akşam;
- yalnız Türkçe yazı;
- Mami-onaylı altı görsel merge.

Skill kaynak command JSON'u mutasyondan koruyor; bu doğru. Fakat konuşma sonrası kararlar
kanonik, türetilmiş bir Director Closeout'a yazılmadığı için “Final Brief” fiilen seed brief
olarak kalıyor. Sonraki ajan command'a dönerse filmi geri alıyor.

**İstenen mimari:** Kaynak command'ı değiştirme. Mevcut `MamiDirectives`,
`--add-directive-file` ve storyboard approval altyapısını kullanarak konuşma sonunda hash-bağlı
bir **Director Decision / Closeout receipt** ve ondan türetilen current command üret:

- onaylı cast ve hero tags;
- storyboard merge/split planı;
- gerçek kare sayısı;
- sahne/sekans haritası;
- time/light ve yaratıcı mandate;
- referans assetleri;
- açık Mami kararları.

Start-frame authoring yalnız bu güncel türetilmiş kararı kullanmalı. Kaynak command tarihsel
seed olarak kalabilir; “current production truth” olamaz.

Aktif 2.7 MB command'ın büyük bölümünde tekrar eden preview prompt ve pre-frame motion taslakları
varsa bunların güncel generator'da hâlâ gerekli olup olmadığını ayrıca ölç. Final Brief karar
taşımalı; yazarın görmezden gelmesi gereken dev bir pseudo-prompt deposu olmamalı.

### P0 — Kalite kapısı dosyayı ölçüyor, prodüksiyonu değil

Kütle üretimi iki dosyaya bölünmüş:

- `Kütle ve Ağırlık_PROMPTLAR.txt` → Intro K01–K08
- `Kütle ve Ağırlık_CODEX-KALAN-START-FRAMELER.txt` → K09–K35

`node scripts/prompt-lint.mjs --all` yalnız kanonik isimli ilk dosyayı tarayıp
“8 kare, eksik yok” diyor. Gerçek üretimin kalan 27 karesi bu yeşil hükmün dışında.

Bu frame filename kimliği konusu değildir; **teslim kapsamı ve gate coverage** sorunudur.

**İstenen mimari:**

- Bir projede tek current prompt pack veya makinece tanımlı çok-parçalı pack manifesti olsun.
- Sidecar dosya varsa gate onu görmeden PASS veremesin.
- Beklenen storyboard kare sayısı ile lint edilen kare sayısı eşleşsin.
- Sekans atomik tamamlanabilir; fakat proje PASS'i bütün onaylı sekansları kapsamalı.
- `prompt-lint --strict` kapanış/teslim kapısına gerçekten bağlansın.
- Gate kendisinin ürettiği sabiti değil diskteki gerçek teslim paketini ölçsün.

### P0 — Revize ile motion arasında tek bir durum makinesi yok

Sözleşmeler birbirini çürütüyor:

- `PROJECT_CONTRACT.md`, faz profili ve Director skill: görülmemiş/revize kareye motion yok.
- Aynı Director skill: bozuk kareyi düzeltilmiş varsay ve aynı geçişte motion yaz.
- Denetim skill'i: sorunluya revize, sorunsuza motion; yeni kare görülmeden motion yok.
- Gerçek Kütle motion dosyası: 35 motion “fix yapılmış kare varsayımıyla” yazıldı.
- K04 için Mami'nin mutfak/sınıf kararı açıkken mutfak varsayımıyla motion mevcut.

Mami'nin gerçek süreç isteği nüanslıdır: kareye bir kez bakmak ister; motion bölgesini
değiştirmeyen küçük bir patch yüzünden aynı kareyi tekrar tekrar denetlemek istemez. Bunu
“her revizeye motion yasak” veya “bütün revizeleri düzelmiş say” gibi iki kaba uçtan biriyle
çözme.

**İstenen durum makinesi:**

- `PASS` → final motion yazılabilir.
- `PATCH_SAFE_FOR_MOTION` → yazı/uzak arka plan gibi hareket geometrisini değiştirmeyen fix;
  mevcut kareden motion yazılabilir, patch dependency kayda girer.
- `FRAME_AFFECTING_EDIT` → özne, temas, yörünge, mekanik geometri veya kamera değişiyor;
  revize kare görülmeden final motion yok.
- `REGENERATE / CREATIVE_DECISION_OPEN` → Mami kararı ve yeni kare gelmeden motion yok.
- İstenirse bekleyen kare için yalnız `MOTION_INTENT` tutulur; final motor prompt'u sayılmaz.

K23'te hayalet LCD segmenti ile K15'te çocuğun havadaki geometrisi aynı sınıf değildir.
K04 açıkken motion final sayılamaz. Bu ayrımı artifact ve gate seviyesinde taşı.

### P1 — REAL register yazılmış ama bütün ana hatta kalıtılmıyor

Ölçülen güncel risk:

- `deriveProductionPath("Gece Serumu")` ve `"Milli Gün"` sessizce `ANIMATION_EDU` döndürüyor.
- Site bir REAL world seçildiğinde class'ı düzelten wiring'e sahip olabilir; bunu koru ve gerçek
  UI/command akışından doğrula.
- Fakat metin/CLI/eksik seçim yolunda bilinmeyen proje adı hâlâ EDU catch-all'a düşüyor.
- `buildMotionPromptQualityContract` register/world almıyor.
- REAL prompt yasası Markdown'da var; quality/motion makineleri aynı ayrımı tam taşımıyor.

**İstenen mimari:**

- Register proje başlangıcında birinci sınıf, görünür ve receipt'li karar olsun.
- Sınıflandırılamayan ad `UNKNOWN`/FACT REQUIRED üretsin; EDU sessiz fallback olmasın.
- World seçimi register'ı belirliyorsa bu düzeltme makbuzlu ve tüm exportlarda aynı olsun.
- Register image quality, jury, motion contract ve world exam boyunca taşınsın.
- REAL için ölçülmemiş reject maddesi uydurma; ilk gerçek reklam karelerinden kanıt madenle.
- İlk prova hedefi `Gece Serumu` olsun: ürün geometri/malzeme/ışık/motion doğruluğu EDU
  kalıplarından bağımsız çalışmalı.

## Bilinenlerin ötesine bakma görevi

Yukarıdaki liste tavan değildir. Özellikle şu soruları araştır:

1. **Mami'nin bilmediği için istemediği hangi yerel araç veya mimari kabiliyet var?**
   Harici API olmadan üretim hızını, video kalite kontrolünü, bağlam ekonomisini veya teslim
   güvenilirliğini ciddi artıran bir şey var mı?
2. **MAMILAS bir dosya koleksiyonu mu, yoksa gerçek bir yerel production operating system mi?**
   İkinci olabilmesi için eksik kontrol düzlemi nedir?
3. **Kanon, state, memory ve precedent sınırları doğru mu?** Aynı bilgi kaç yerde yaşıyor,
   hangisi hot path olmalı?
4. **Skill'ler yalnız prompt mu, yoksa üretim aşamaları arasında typed handoff yapıyor mu?**
5. **Site ile manuel Magnific/Premiere arasındaki en pahalı insan işi nedir?** Bunu yerel,
   geri alınabilir, Mami loop'ta kalan bir araçla azaltabilir miyiz?
6. **Video kalitesi yalnız start frame düzeyinde mi ölçülüyor?** Yerel ffmpeg/clip sampling,
   temporal drift, text stability ve motion-zone kontrolünün doğru yeri nedir?
7. **UI gerçekten Mami'nin gerçek akışını mı taşıyor, yoksa en iyi sistem hâlâ dosyalarda mı?**
   Siteye taşınması gereken yalnız bir veya iki yüksek kaldıraçlı yüzey var mı?

Her sorudan ürün yönünü değiştiren en fazla bir güçlü öneri çıkar. Mami'ye beş alternatif
sunma. Tavsiyeni, kazancı ve bedeli söyle; onunla konuş.

## İstişare biçimi — Muhammet'le nasıl konuşacaksın

Mami sıkılmak üzereyken uzun denetim günlüğü gösterme. Şu ritmi kullan:

1. **Önce ne tuttu:** Sistemin bugün gerçekten yapabildiği bir şeyi söyle.
2. **Tek makro kopukluk:** “Buddy var sanıyoruz ama hedef skill yok” gibi tek cümle.
3. **Tavsiyen:** “Mami yerinde olsam ortak capability contract kurup iki sağlayıcıyı oraya
   bağlardım; çünkü...” de.
4. **Gerçek karar gerekiyorsa tek soru sor.**
5. Cevap geldiğinde geri sarma; kayda geçir ve uygulamaya devam et.

Rutin teknik seçimleri Mami'ye yükleme. Yalnız şu sınıflarda konuş:

- ürün yönünü değiştiriyorsa;
- yaratıcı otorite Mami'ye aitse;
- veri kaybı/destructive risk varsa;
- iki seçenek gelecekte belirgin farklı işletme maliyeti yaratıyorsa;
- bildiği iş akışına dair varsayımın kanıtsızsa.

Her uzun blok sonunda en fazla üç satır:

- ne tamamlandı;
- sıradaki tek somut sonuç;
- varsa tek Mami kararı.

## Codex ile istişare

Mami Claude içinde Codex'e danışma skill'ini kurdu. Kullan; fakat yeni bir ajan girdabı kurma.
Kurulu skill'in gerçek adını/yükleme biçimini mevcut Claude ortamından keşfet, uydurma komut yazma.
Kullanılamıyorsa bunu bir satırla kaydet ve ana işi durdurma.

Codex'i üç sınırda bağımsız ikinci göz yap:

1. **Teşhis sonrası:** Bu bulgular gerçekten bağlantı kusuru mu, yoksa mevcut tasarımı yanlış mı
   okuduk? En kritik kaçırılan makro ne?
2. **Mimari karar öncesi:** Önerilen tek kontrol düzlemi yeni bir ikinci gerçeklik veya runner
   yaratıyor mu? Daha küçük ama tam bağlantılı çözüm var mı?
3. **Final convergence:** Taze oturum provası, gerçek production artifact'i ve test coverage
   hedefi gerçekten kanıtlıyor mu?

Codex'e bütün 1000+ satırlık state'i tekrar tekrar yedirme. Her istişareye iddia + dar kanıt +
önerilen karar ver. Codex kod yazmak zorunda değil; adversarial reviewer olarak daha değerlidir.

Çoklu ajan gerekiyorsa eşzamanlı tavan 6, pratik hedef 2–4. Birim sekans veya bağımsız mimari
kol olsun. Aynı dosyayı altı ajana okutma. Her ajana dosya sahipliği ve “başkalarının değişikliğini
geri alma” yasağı ver.

## Önerilen uygulama sırası

Bağımlılık kanıtı aksini göstermedikçe şu sırayı izle:

### Faz A — Doğru açılış ve ortak akıl

1. Hot `NOW / ACTIVE PRODUCTION` durumunu kur.
2. Buddy capability'sini gerçek ve ortak hale getir.
3. Memory sınıflarını ve conflict-safe taşıma yönlerini ayır.
4. Claude/Codex girişlerinin ortak çekirdek + sağlayıcı adaptörü sınırını düzelt.

Bu faz bitmeden üretim skill'lerini çoğaltma; yanlış state'e daha fazla ajan bağlamış olursun.

### Faz B — Capability graph ve gerçek handoff

1. Aktif skill'lerin precondition/input/output/postcondition/next sözleşmesini çıkar.
2. Enzim storyboard closeout'unu Director girdisine bağla.
3. Director konuşma kararını derived current command/receipt'e bağla.
4. Prompt pack'i proje kapsamı olarak kalite kapısına bağla.
5. Denetim verdict'ini motion eligibility durum makinesine bağla.
6. Motion'ı kurgu kitine ve kapanış hasadına bağla.

Yeni orkestratör yazmak son seçenek. Önce mevcut command/runtime/receipt parçalarını birbirine bağla.

### Faz C — REAL hattı

1. UNKNOWN→sessiz EDU fallback'i kapat.
2. Register'ı bütün image/motion/quality/world-exam hattına taşı.
3. `Gece Serumu` ile gerçek command/generateBatch/Director pack üret.
4. Gerçek kare gelmeden görsel kalite PASS deme; “implementation complete / visual validation
   pending” sınırını koru.

### Faz D — Convergence ve İCRAAT'a dönüş

1. Taze Claude oturumu simülasyonu.
2. Taze Codex oturumu simülasyonu.
3. Aynı aktif proje/stage/standing orders/precedent sonucu.
4. Bir EDU ve bir REAL uçtan uca yerel prova.
5. Codex bağımsız completion audit.
6. State/receipt güncellemesi.
7. Aktif fazı tekrar İCRAAT'a çevir.

## Kabul testleri — “bitti” demeden önce

Aşağıdakilerin her biri gerçek kanıt ister:

### Açılış

- Taze Claude yalnız kanonik girişten Kütle'nin güncel aşamasını doğru söyler.
- Taze Codex de aynı aktif gerçeği söyler.
- İkisi 1000+ satırlık tarih ledger'ını normal video başlangıcında yüklemek zorunda kalmaz.

### Buddy

- Hook'un gösterdiği capability fiziksel olarak vardır.
- Doğrudan reference'ları çözülür.
- Sentetik SessionStart gerçek yüklenebilir talimat üretir.
- Meta-test, buddy skill silinince kırmızı olur.

### Memory

- `--check` sapmayı gösterir ama veriyi değiştirmez.
- İki tarafta farklı yeni veri varsa sync yön seçmeden mutasyon yapmaz.
- Repo→live ve live→repo ayrı açık komutlardır.
- Standing order, precedent ve session-local not birbirine karışmaz.

### Skill graph

- Claude ve Codex skill listesi yalnız isimde değil capability contract'ta eşleşir.
- Provider adaptörleri kendi giriş dosyalarını okur; Codex skill'i körlemesine `CLAUDE.md`ye
  bağımlı değildir.
- Bir skill'in gerekli dependency'si silinince test kırmızı olur.
- Her üretim aşamasının çıktısı sonraki aşamanın gerçek girdisidir.

### Director closeout

Kütle current decision artifact'inde en az şu gerçekler görünür:

- 35 kare / 41 VO beat;
- Efe ve gerekli tekrar eden asset tag'leri;
- Türk/Anadolu 5. sınıf cast;
- dusk açılış;
- onaylı merge planı;
- açık yaratıcı kararlar.

Kaynak command değişmemiş olabilir; fakat hiçbir downstream aşama onu current film sanmaz.

### Prompt pack

- Kütle kalite kapısı 8 değil 35 kare ölçer.
- K09–K35 sidecar olarak görünmez kalamaz.
- Beklenen storyboard count ile lint edilen count farklıysa project PASS çıkmaz.

### Revize/motion

- K23 gibi motion-safe text patch ile K15 gibi geometry-changing patch farklı state alır.
- K04 yaratıcı karar açıkken final motion üretilemez.
- Revize frame hash/verdict'i değiştiğinde ona bağlı motion gerektiği sınıfta stale olur.

### REAL

- “Gece Serumu” eksik/belirsiz seçimde sessiz EDU olmaz.
- Product REAL world ile current command/register aynı gerçeği taşır.
- Image ve motion quality contract register'ı görür.
- Gerçek kare yokken yalnız uygulama zinciri kanıtlanır, görsel kalite değil.

### Gate dürüstlüğü

- `docsContract` benzeri testler yalnız dosya/executable/set ismi ölçmez; çağrılan capability ve
  gerçek dependency'yi de ölçer.
- Bilerek buddy'yi, memory dependency'sini veya prompt pack parçasını düşürdüğünde ilgili test
  kırmızı olur.
- Son yeşil test yanında gerçek iki production probe çıktısı okunur.

## Teknik doğrulama

Değişikliğe uygun kapıları çalıştır:

1. `npx tsc --noEmit`
2. `npx vitest run`
3. `npm run build`
4. İlgili gerçek `generateBatch`/command üretim probları
5. Hook sentetik payload testleri
6. Memory conflict senaryoları
7. Bir EDU + bir REAL production rehearsal
8. Launcher değiştiyse Windows ve macOS ince-kabuk sözleşmeleri

Test yeşil olsa bile kabul maddelerini tek tek kanıtlamadan tamamlandı deme.

## Teslim biçimi

Çalışma boyunca:

- büyük kararları `EXECUTION_STATE` tarih çöplüğüne gömmek yerine operasyon receipt'lerine yaz;
- hot state'i güncel tut;
- kod ile mimari karar arasında iz bırak;
- Mami'nin seçtiği ürün kararını verbatim kaydet;
- kullanıcı üretim dosyalarını ve kareleri koru.

Finalde Mami'ye uzun changelog dökme. Şu sırayla teslim et:

1. **Ne tuttu ve artık gerçekten ne yapabiliyor?**
2. **Hangi makro bağlantılar kapandı?**
3. **Hangi iki gerçek prova bunu kanıtladı?**
4. **Hâlâ Mami kararı veya gerçek kare bekleyen tek şey ne?**
5. **“Bak şunu yaptık” — en fazla üç somut sonuç.**

Gerçek kare hükmü yoksa doğru final:

> **Mimari bağlantı tamamlandı; görsel doğrulama Mami'nin gerçek frame verdict'ini bekliyor.**

## Son emir

Bu sistemi daha fazla metin, skill, hook ve testle şişirmek için değil; Mami yeni video açtığında
doğru yeteneğin doğru anda, doğru bilgiyle gerçekten çalışması için düzelt.

Rapor yazıp bırakma. Önce doğrula, Muhammet'le yalnız gerekli makro kararları konuş, uygula,
gerçek akıştan prova et, bağımsız denetlet ve MAMILAS'ı yeniden İCRAAT'a teslim et.
