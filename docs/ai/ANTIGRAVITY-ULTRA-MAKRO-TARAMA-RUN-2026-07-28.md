# ANTIGRAVITY ULTRA — MAMILAS MAKRO TARAMA RUN'I

> Mami'nin emri: Claude ve Codex yaratıcı üretim, karar ve hassas onarım için kalsın.
> Antigravity Ultra; paralel araştırma, artifact tarama, bağlantı denetimi ve bilinmeyen
> fırsat avı için kullanılsın. Bu run kod yazmak için değil, **hangi yeteneğin gerçekten
> bağlı olup olmadığını kanıtlamak** için yapılır.

## Tek cümlelik amaç

MAMILAS'ta var gibi görünen fakat gerçek video üretim hattına bağlanmamış yetenekleri; güncel
disk, gerçek command/artifact, runtime ve UI üzerinden bul. Sonuç, Muhammet'in seçebileceği
en fazla beş makro operasyon olsun — kelime tuzağı, linter sayacı veya kozmetik bug listesi değil.

## Kesin sınırlar

- **Read-only.** Kod, skill, state, prompt, kare, command veya git geçmişini değiştirme.
  Sadece aşağıdaki rapor klasörüne yaz.
- Destructive komut, `git reset`, `checkout`, dosya silme, dependency kurma, API anahtarı,
  backend model çağrısı, otomatik görsel üretim ve ikinci runner YOK.
- Kare dosyası/numarası üzerinden kimlik taşıma sorunu Mami'nin kendi kapsamındadır; ona çözüm
  önermeyin ve o konuda bulgu yazmayın.
- Yeşil test = yetenek kanıtı değildir. Her iddia gerçek artifact, gerçek runtime çıktısı veya
  gerçek kullanıcı akışıyla desteklenir.
- Bir kelime/regex/font/tek satır tek başına bulgu değildir. Ancak bütün bir yeteneği
  bozduğunu kanıtlarsa kullanın.
- Mami'nin üretimini durdurmayın. Bulgu çıkarın; onarım kararını Mami verir.

## Z0 — Önce model gerçeğini güncelle

Repo taramasına başlamadan önce 3.1 Pro, güncel resmi Google, Anthropic ve OpenAI
kaynaklarından kısa bir **model yetenek haritası** çıkarır. Blog özeti, benchmark reklamı ve
kulaktan dolma model adı kaynak sayılmaz. Her iddia için birincil kaynak URL'si yazılır.

`MODEL-CAPABILITY-MAP.md` şu üç sütundan oluşur:

| Doğrulanmış kabiliyet | Bu run'da nasıl kullanılabilir | Sınır / doğrulanmamış varsayım |
| --- | --- | --- |

Şunlar özellikle doğrulanır:

- **Antigravity / Gemini:** 3.6 Flash'ın güncel araç, çok-modlu inceleme, kod yürütme,
  web/Computer Use, uzun bağlam ve ajan-kurulum sınırları; 3.1 Pro'nun derin sentez,
  araç kullanımı ve uzun bağlamdaki gerçek rolü.
- **Claude Opus:** resmi olarak sunulan en güncel Opus yüzeyinin uzun ufuklu ajanlık,
  vision, dosya/skill/tool kullanımı ve bağlam sınırları. "Opus 5" adı resmi kaynakta
  yoksa varmış gibi davranma; mevcut resmi Opus sürümünü ve belirsizliği yaz.
- **Codex / GPT-5.6 Terra-Sol:** resmi OpenAI/Codex kaynaklarında doğrulanabilen agent,
  skills, araç, çoklu ajan, bilgisayar/browser ve workspace çalışma kabiliyetleri. Terra/Sol
  ismi veya teknik detayı resmi kaynakta doğrulanamıyorsa bunu "yerel yüzeyde çağrılabiliyor,
  resmi ürün iddiası doğrulanmadı" diye ayır.

Sonra MAMILAS'ı **normal insan workaround'ına göre değil, bu doğrulanmış frontier-agent
baseline'ına göre** değerlendir:

1. Güçlü bir ajan bugün hangi tekrar eden doğrulama, artefact eşleme, görsel QC, state/receipt
   okuma, kod bağlantısı ve kanıt toplama işini güvenle üstlenebilir?
2. Bu iş hangi nedenle hâlâ Mami'nin çalışma belleğine veya manuel kontrolüne bırakılmış?
3. Hangi yaratıcı hüküm Mami/yaratıcı yönetmende kalmalı: hikâye niyeti, estetik zevk,
   final kare onayı ve gerçek üretim kararı?
4. Hangi iş hiçbir ajana sessiz devredilmemeli: yetkisiz yazma, dış sağlayıcı çağrısı,
   görünmeyen yaratıcı seçim veya Mami adına karar?

Bu bölümün amacı "ajan daha çok iş yapsın" demek değildir. Amaç, bugün ajanla güvenilirce
yapılabilecek bir kontrolün Mami'ye manuel yük olarak kalıp kalmadığını bulmaktır.

## Model dağılımı — 3.1 Pro gerçek orkestratör, Flash keşif gücü

### Gemini 3.1 Pro — run sahibi, sistem mimarı ve jüri

Pro önce **kendisi** `MODEL-CAPABILITY-MAP.md`, `SYSTEM-MAP.md` ve `QUESTION-BOARD.md`yi
kurar. F01–F12 bir checklist değildir: Pro bunlardan hangisinin gerekli olduğuna kanıtla karar
verir; çakışan kolları birleştirir, zayıf kolu iptal eder, ikinci dalga soru üretir ve Flash
çıktısını ham kanıta geri döndürür. Flash'lar Pro'nun gözleri/elleridir; run'ın sahibi değildir.

Pro'nun zorunlu çalışma döngüsü:

1. **Sistem haritası:** üretim yüzeyleri, gerçek artefact'ler, karar kaynakları ve mevcut
   kontrol kapılarını tek grafikte kur.
2. **Soru tahtası:** "ajan baseline'ında otomatikleşmesi gereken ama bağlı olmayan iş" hipotezlerini
   önceliklendir; her hipoteze kanıt ihtiyacı ve çürütme ölçütü ata.
3. **Dinamik delegasyon:** yalnız kör noktası olan soruyu Flash'a ver. İlk dalga bittikten sonra
   gereken ikinci dalgayı kendisi aç; 12 raporu mekanik biçimde toplamaya çalışma.
4. **Karar grafiği:** bulgu → kanıt → kök bağlantı → Mami'de kalacak hüküm / ajana devredilecek
   güvenli iş → en küçük operasyon zincirini çıkar.
5. **Karşı-jüri ve memo:** önce kendi sentezini çürütür; yalnız ayakta kalanları Mami'ye taşır.

### Gemini 3.6 Flash High — keşif işçisi

Flash, hızlı ve paralel kanıt toplar. Her Flash ajanı yalnız kendi dosya/dizin alanını okur;
başka ajanın görevini tekrar etmez. Kod önerisi yazabilir ama kod değiştirmez.

Her Flash ajanının tavanı:

- en fazla 3 makro bulgu;
- her bulgu için en fazla 5 doğrudan kanıt;
- en az 1 karşı-kanıt / “neden yanlış olabilir?” denemesi;
- 900 kelimeyi geçmeyen sonuç;
- kanıt yoksa bulgu YOK.

## Çalışma alanı ve ortak çıktı şekli

Run başında yalnız şu klasör oluşturulur:

`artifacts/antigravity-makro-scan-2026-07-28/`

Altında:

```text
CHARTER.md                         # bu brief'in kısa kopyası + run zamanı
MODEL-CAPABILITY-MAP.md            # resmi kaynaklı model gerçekliği ve sınırlar
SYSTEM-MAP.md                      # Pro'nun üretim/karar/artefact haritası
QUESTION-BOARD.md                  # hipotez, kanıt ihtiyacı, çürütme ölçütü
FINDINGS-GRAPH.md                  # kabul edilen bulgu bağlantı grafiği
evidence/<agent-id>.md             # Flash bulguları
SYNTHESIS.md                       # ilk Pro sentezi
COUNTER-JURY.md                    # ikinci Pro'nun kabul/reject kararı
MAMI-MEMO.md                       # yalnız Mami'ye gösterilecek kısa karar metni
EVIDENCE-INDEX.md                  # bulgu -> dosya/command/asset haritası
```

Her Flash raporu şu şablonu **aynen** kullanır:

```md
# <agent-id> — <yetenek alanı>

## Ne gerçekten tuttu?
<1-3 somut kapasite>

## Bulgu 1 — <yetenek hükmü, kelime değil>
- Beklenen davranış:
- Gerçekte olan:
- Kanıt: <dosya:satır / komut çıktısı / artifact>
- Üretim etkisi: <video, süre, kredi, karar veya güven etkisi>
- Kök bağlantı: <hangi iki/üç yüzey arasında kopuyor>
- En küçük yön: <henüz kod değil, korunacak sistemle nasıl bağlanır>
- Karşı-okuma: <bu bulguyu çürütecek kanıt arandı mı, sonucu ne?>

## Bulgu 2 ...

## Bulgu olmayanlar
<mikro, bayat, kanıtsız veya zaten kapanmış şeyler — neden elendi?>

## Mami'ye sorulabilecek tek karar
<Yalnız ürün yönünü gerçekten değiştiriyorsa; aksi halde YOK>
```

## Flash keşif ekibi — 12 bağımsız kol

Her ajan önce yalnız ortak sözleşmenin gerekli küçük kısmını okur; 1000+ satırlık state'i
körlemesine kopyalamaz. Çakışma varsa öncelik sırası: gerçek disk/runtime > kod > güncel
receipt > state > memory > prose.

### F01 — Oturum açılışı ve hot truth

**Alan:** `CLAUDE.md`, `AGENTS.md`, `docs/ai/CODEX.md`, faz profilleri,
`EXECUTION_STATE.md`, aktif inbox/kitler.

**Soru:** Taze bir Claude veya Codex oturumu, kanonik girişe uyarsa aktif videonun gerçek aşamasını
doğru öğreniyor mu; yoksa bayat, pahalı veya çelişkili state'e mi açılıyor?

**Özellikle ölç:** Kütle ve Ağırlık state tablosu ile disk üzerindeki gerçek prompt/motion/edit
kit farkı; hot state ile tarih ledger ayrımı; her ajanın aynı dev state'i okuma maliyeti.

### F02 — Buddy ve insan çalışma biçimi

**Alan:** `mamilas-buddy`, `CLAUDE.md`, `AGENTS.md`, `.claude/settings.json`, hook'lar,
memory persona/hal logu, ilgili testler.

**Soru:** Buddy capability'si gerçekten yüklüyor mu; Claude ve Codex erişiyor mu; hook hedefi
gerçek mi; kullanıcıyı yormayan çalışma biçimi akışa bağlanmış mı?

**Özellikle ölç:** Hook yalnız dosya executable mı kontrol ediliyor, yoksa çağırdığı skill/reference
hedefi de çözülüyor mu? Bu yetenek üretim ve karar anında gerçekten görünür mü?

### F03 — Memory taşıma ve precedent ekonomisi

**Alan:** `scripts/memory-sync.mjs`, `docs/ai/sync/memory/`, canlı Claude memory varsa,
skill'lerin memory atıfları, gate/hook testleri.

**Soru:** Standing order, Mami-onaylı precedent ve session-local not birbirinden ayrılmış mı?
İki makinede güncel bilgi kaybetmeden taşınıyor mu? Claude/Codex aynı doğru hafızaya ulaşabiliyor mu?

**Özellikle ölç:** `--check` mutasyonsuz mu; sync yönü açık mı; belirsiz `memory/` atıfları
sağlayıcıya göre çözülebiliyor mu?

### F04 — Skill capability graph ve sağlayıcı paritesi

**Alan:** `.claude/skills/`, `.agents/skills/`, skill trigger metadatası, docs contract testleri,
provider giriş sözleşmeleri.

**Soru:** Skill'ler yalnız aynı isimli dosyalar mı, yoksa trigger → input → output → next stage
zinciri gerçekten bağlı yetenekler mi?

**Özellikle ölç:** Codex yüzeyindeki skill'ler körlemesine Claude yollarını mı okuyor; test yalnız
directory eşitliği mi bakıyor; eksik dependency silinince kırmızı oluyor mu?

### F05 — Source → command → Enzim → Director karar kapanışı

**Alan:** `source.ts`, `pure.ts`, `brain.ts`, `commandExport.ts`, `scripts/mamilas-command.mjs`,
`mamilas-enzim`, `mamilas-director`, aktif Kütle command ve prompt setleri.

**Soru:** Mami'nin konuşmada kilitlediği cast, hero asset, sahne merge'i, ışık ve açık kararlar,
sonraki author'a kanonik olarak gidiyor mu? Yoksa seed command geçmişiyle gerçek film ayrışıyor mu?

**Özellikle ölç:** Kütle command'daki Mira/41/morning/boş lock'lar ile gerçek Efe/35/dusk/asset
kararları; mevcut MamiDirectives, directive-file ve storyboard receipt altyapısı bu boşluğu
bağlamaya yeter mi?

### F06 — Prompt pack, VO ve kalite kapısı kapsamı

**Alan:** `prompt-lint.mjs`, kapanış hasadı, prompt quality kaynakları, aktif prompt pack'leri,
VO ve edit planları.

**Soru:** Gate bir dosyayı mı, yoksa Mami'nin gerçekten üreteceği bütün proje paketini mi ölçüyor?
VO → kare → prompt sayısı eksiksiz izleniyor mu?

**Özellikle ölç:** Kütle K01–K08 ana dosyası ve K09–K35 sidecar; strict lint'in gerçek kapanışa
bağlanıp bağlanmadığı; testin kendi fixture'ını değil diskteki teslimi ölçüp ölçmediği.

### F07 — Gerçek kare denetimi, revize ve motion handoff'u

**Alan:** `mamilas-denetim`, `mamilas-director`, `PROMPT-YASASI §3`, frame receipt/motion gate,
Kütle `revize.txt`, `REVIZE-VE-MOTION.md`, güncel `_MOTION.txt`, edit plan.

**Soru:** Frame verdict, revize türü ve final motion arasında tek bir doğrulanabilir durum
makinesi var mı? Motion gerçekten görülen kareden mi yazılıyor?

**Özellikle ölç:** `PATCH_SAFE_FOR_MOTION` ile geometri/yaratıcı karar değiştiren revizenin ayrımı;
K04 gibi karar açık sahneler; metin-safe K23/K33 ile fizik-safe olmayan K15 arasındaki fark.

### F08 — Motion ve kurgu kiti kalite denetimi

**Alan:** `engine.ts`, `agentProtocol.ts`, `motion-qc.mjs`, aktif motion/edit/VO/Suno dosyaları,
Kling diyalekti.

**Soru:** Motion prompt'ları Kling'in “start frame truth, yalnız değişeni yaz” lehçesine uyuyor mu;
yoksa tekrar eden negatif bloklar ve hayali aksiyonlarla motion'ı zorluyor mu? Kurgu kiti kredi,
VO süresi ve drift maliyetini gerçekten yönetiyor mu?

**Özellikle ölç:** Mevcut Claude ve Codex Kütle motion setlerini karşılaştır; kişisel puanlama
değil, kapsama/sıra/frame-gate/tek hareket/kamera-fizik/VO/negatif ekonomi üzerinden hüküm ver.

### F09 — REAL register ve Gece Serumu prova yolu

**Alan:** `deriveProductionPath`, `registerOf`, Studio wiring, `PROMPT-YASASI` REAL bölümü,
quality/motion contract, world exam, `Gece Serumu` ile gerçek generateBatch probu.

**Soru:** Reklam filmi seçimi bütün hatta REAL kalıyor mu; belirsiz isim veya CLI sessizce EDU'ya
düşüyor mu? REAL motion ve kalite kuralları gerçekten register görüyor mu?

**Özellikle ölç:** Metin adıyla path, selected world ile path, exported command ile path ve motion
contract arasındaki farkı gerçek çıktıyla karşılaştır. Ölçülmemiş photoreal kural icat etme.

### F10 — Studio UI ile gerçek manuel üretim arasındaki boşluk

**Alan:** `src/store/useStudioStore.ts`, ilgili UI bileşenleri, command export/import, gerçek
Magnific/Premiere kitleri ve Mami'nin iş akışı.

**Soru:** Mami'nin gerçekten kullandığı kararlar sitede görünür ve geri alınabilir mi, yoksa en iyi
iş akışı dosyalarda/sohbette mi kalıyor? Siteye taşınacak en fazla iki yüksek-kaldıraçlı yüzey ne?

**Kural:** UI güzellik eleştirisi yapma. Yalnız yanlış seçim, tekrar iş, kredi kaybı veya karar
kaybı doğuran boşluğu raporla.

### F11 — Gate/test dürüstlüğü ve “yeşil ama boş” riskleri

**Alan:** `docsContract.test.ts`, command/runtime testleri, gate scripts, prompt lint, closeout,
hook testleri, gerçek artifact'ler.

**Soru:** Testler davranışı mı ölçüyor, yoksa dosya varlığı/aynı string/fixture sabiti gibi kendi
yarattığı kolay gerçeği mi ölçüyor?

**Özellikle ölç:** Bir hook hedef skill'i eksikse, prompt pack'in yarısı sidecar ise, memory drift
varsa veya REAL motion register'sızsa mevcut gate gerçekten kırmızı oluyor mu?

### F12 — Bilinmeyen bilinmeyenler / yerel araç fırsatı

**Alan:** tüm repo ama yalnız yüksek kaldıraçlı ürün fırsatları; package.json, yerel araçlar,
ffmpeg/Playwright/Three.js/React/Vite yüzeyleri, gerçek üretim darboğazları.

**Soru:** Doğrulanmış frontier-agent baseline'ında mümkün olduğu halde Mami'nin teknik adını
bilmediği için istemediği, API'siz ve yerel kalacak hangi 1–3 kabiliyet MAMILAS'ı belirgin
biçimde ileri taşır?

**Zorunlu ayrım:** Her fırsatta "normal insan bugün bunu elle yapar" ile "güçlü ajan bunu
güvenle kanıt/denetim olarak üstlenebilir" farkını yaz. Yalnız agent mümkün diye yaratıcı
yargıyı devralmayı önermeyin; Mami'nin final yaratıcı hükmü ve izin sınırı açık kalsın.

**Örnek düşünme yönü:** temporal video QC, frame-contact sheet, üretim state cockpit,
prompt/receipt explorer, asset continuity viewer. Bunları öneri diye yazma; mevcut darboğaz,
yerel uygulanabilirlik, maliyet ve Mami'ye etkisi kanıtlanmadan bulgu sayma.

## Aşama sırası

### Aşama 0 — Model reality refresh ve orchestrator kurulumu (3.1 Pro, tek ajan)

1. Önce `MODEL-CAPABILITY-MAP.md`yi resmi kaynaklarla yaz; doğrulanmış, çıkarım ve
   doğrulanmamış olanı birbirine karıştırma.
2. Worktree'nin dirty olduğunu kaydet; değiştirmeme sınırını yaz.
3. Aktif proje/artifact alanlarını listele ve `SYSTEM-MAP.md`ye bağla.
4. `QUESTION-BOARD.md`de agent-baseline boşluklarını, kanıt ihtiyacını ve çürütme kriterini yaz.
5. F01–F12'den yalnız ilk dalgada gerçekten gerekenleri Flash'a dağıt; output yolunu ve süre
   sınırını belirle.
6. İlk dalga sonrası ikinci dalga gerekip gerekmediğine karar verecek tek yerin Pro olduğunu
   kaydet; ajanların birbirini beklemediğini doğrula.

### Aşama 1 — Pro yönetiminde paralel Flash taraması

İlk dalgada gereken F-kolları birlikte koşar. Pro, ham kanıt boşluğu varsa ikinci dalgayı açar;
F01–F12'nin hepsini sırf listede diye çalıştırmaz. Her Flash ajanı kendi `evidence/Fxx-*.md`
dosyasına yazar.

Flash ajanı bir bulguyu doğrulamadan önce şu üç soruyu cevaplar:

1. Bu gerçekten videoda/kararda para veya zaman yaktırır mı?
2. Bu zaten kapanmış veya yalnız eski bir artifact mi?
3. En az iki yüzey arasındaki bağlantı mı kopuyor?

Üçünden biri hayırsa bulgu listesine değil “elendi” bölümüne gider.

### Aşama 2 — Sentez ve karar grafiği (3.1 Pro, tek ajan)

Pro, bulguları beş kök nedene kadar indirir ve `FINDINGS-GRAPH.md`yi tamamlar. Aynı kökün
altındaki on semptomu ayrı madde yapmaz.

Her sentez bulgusu için şunları üretir:

- MAMILAS'ın bugün gerçekten sahip olduğu değer;
- kopuk yetenek hükmü;
- en güçlü iki kanıt;
- videoya/iş akışına maliyet;
- mevcut mimariyi koruyan en küçük yön;
- Mami'den karar gerekirse tek soru;
- kabul testi.

### Aşama 3 — Karşı jüri (3.1 Pro, ayrı context)

İkinci Pro sentezi **çürütmeye** çalışır. Her bulguya `ACCEPT`, `WEAKEN`, `REJECT` verir.

Şunları özellikle eler:

- yalnız doküman drift'i olup gerçek hattı etkilemeyenler;
- state'te açık görünüp koda zaten kapanmış olanlar;
- bir kere görülen kişisel tercih;
- kelime/regex/format takıntısı;
- çözümü mevcut sistemden büyük olan düşük etkili fikirler.

### Aşama 4 — Mami memo (3.1 Pro)

`MAMI-MEMO.md` en fazla 900 kelime olur. Şu biçimde yazılır:

1. **Ne tuttu?**
2. **İlk üç bağlantı kopukluğu** — her biri tek paragraf.
3. **Mami yerinde olsam ilk bunu kapatırdım:** tek güçlü tavsiye.
4. **Mami'nin gerçekten vermesi gereken karar:** en fazla bir tane; yoksa “karar gerekmiyor”.
5. **Sonra yapılacaklar:** en fazla iki operasyon, öncelik sırasıyla.

Mami memo'da tool adı, agent iç konuşması, kelime listesi, dosya çöplüğü veya 12 rapor özeti yok.

## Antigravity'nin yapmaması gerekenler

- Kendi kendine onarım kodu yazma veya commit atma.
- Yeni skill/agent/hook önerisini “çözüm” diye sayma; önce onun hangi gerçek bağlantıyı
  kapattığını göster.
- Tüm videoları tekrar linter'a sokup sayısal çıktı dökme.
- Promptları yeniden yazma, motion üretme veya görüntü üretme.
- Mami'ye 5–10 karar açma.
- “Daha fazla test yazalım” diye bitirme.
- Claude/Codex'in üretim oturumunu bölme veya onların güncel dosyalarını değiştirme.

## Run sonunda teslim edilecek tek karar paketi

Mami'ye yalnız şunları ver:

1. `MAMI-MEMO.md`
2. `COUNTER-JURY.md`
3. Her kabul edilmiş bulguyu ham kanıta götüren `EVIDENCE-INDEX.md`

Claude/Codex'e devredilecek paket:

```text
<bulgu-id>
Kök bağlantı:
Korunacak mevcut parça:
Yapılacak en küçük mimari operasyon:
Dokunulmayacak alan:
Kabul testleri:
Gerçek production probe:
Mami kararı gerekiyorsa:
```

## Başlatma komutu yerine yapıştırılacak ana direktif

> MAMILAS için read-only, evidence-first makro tarama yapıyorsun. Bu repo bir eğitim ve reklam
> videosu üretim konsolu; hedef daha çok mikro kusur bulmak değil, var olan yeteneklerin doğru
> üretim aşamasına bağlanıp bağlanmadığını kanıtlamak. Claude/Codex yaratıcı üretim ve onarımda
> kalacak; sen yalnız araştırma madenciliği yapacaksın. Sen 3.1 Pro olarak run'ın gerçek
> orkestratörüsün: önce resmi Google, Anthropic ve OpenAI kaynaklarından model gerçeğini çıkar;
> `MODEL-CAPABILITY-MAP.md`, `SYSTEM-MAP.md` ve `QUESTION-BOARD.md`yi kendin kur. MAMILAS'ı
> normal insanın elle taşıdığı yüke göre değil, doğrulanmış güçlü ajanların güvenle yapabileceği
> denetim/bağlantı/kanıt işleri üzerinden yargıla. Flash ajanları senin gözlerin ve ellerin;
> F01–F12 statik checklist değildir, gerekli kolları sen seçer, çakışanı birleştirir ve yalnız
> kanıt boşluğu kalırsa ikinci dalgayı açarsın. Sonra sentezle, bağımsız context'te çürüt ve Mami
> için kısa karar memo'su yaz. Kod/dosya değiştirme, API kullanma, frame filename kimliği
> sorununa girme, kelime avı yapma. Bir bulgu ancak gerçek video, kredi, karar veya üretim
> güvenilirliği etkisini kanıtlarsa kabul edilir. Her final öneri: ajana güvenle devredilecek
> iş, Mami'de kalacak yaratıcı hüküm, mevcut sistemi koruyan en küçük bağlantı onarımı ve
> doğrulanabilir kabul testi içermek zorunda.

## Başarı ölçütü

Bu tarama, 12 ayrı rapor ürettiği için değil; Mami'nin “hangisini kapatırsak sistem gerçekten
daha güvenli ve daha iyi video üretir?” sorusuna kanıtlı, kısa ve seçilebilir cevap verdiği için
başarılıdır.
