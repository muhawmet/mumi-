# ANTIGRAVITY ULTRA — PASS B: KANITLI MAKRO DERİNLEŞTİRME

## Neden ikinci tur var

İlk makro tarama doğru alanları sezdi, fakat onarım kararı verecek kanıt seviyesine çıkmadı.
Özellikle F05/F07 sentezde anıldı ama ham kanıtı teslim edilmedi; bazı iddialar güncel üretim
hatası yerine kapanmış `EXECUTION_STATE` tarihçesine dayandı. Bu tur, ilk raporu savunmak için
değil, onu **çürütmek veya gerçek kanıtla yeniden kurmak** içindir.

Bu, kod yazma turu değildir. Claude/Codex'e implementasyon görevi ancak bu turun kabul paketi
bitince verilebilir.

## Değişmez sınırlar

- Read-only: kod, skill, hook, state, prompt, kare, command, git geçmişi ve mevcut Antigravity
  raporları değişmez/silinmez.
- API anahtarı, provider çağrısı, otomatik görsel üretim, ikinci lifecycle runner, dependency
  yükleme, commit ve destructive komut YOK.
- Kare dosyası/numarası üzerinden kimlik taşıma sorunu Mami'nin kapsamındadır; bulgu ve çözüm
  olarak açılmaz.
- `EXECUTION_STATE.md`, eski memo, test veya fixture **lead** olabilir; tek başına bug kanıtı
  değildir. "Tarihte oldu" ile "şimdi oluyor" ayrı hükümlerdir.
- Mami'nin yaratıcı kararını hiçbir script, ajan veya bu tarama sessizce devralamaz.

## Run sahibi ve iş bölümü

**Gemini 3.1 Pro run sahibidir.** Önce bu belgeyi, önceki `MODEL-CAPABILITY-MAP.md`yi ve ilk
turun bütün artefact'lerini okur. İlk rapordaki her bulguyu `CURRENT`, `HISTORICAL`,
`UNPROVEN` veya `REJECTED` diye sınıflandırmadan Flash'a iş veremez.

Flash'lar yalnız delil toplar. Pro; soru tahtasını kurar, ham kanıtı okur, ikinci dalgayı açar,
karşı-jüriyi yapar ve kabul paketi üretir. F-kolları checklist değildir; aşağıdaki altı eksen
öncelik sırasıdır.

## Önce düzeltilecek model gerçeği

`PASS-B/MODEL-SOURCES.md` oluştur. Her satırda resmi birincil kaynak URL'si, erişim tarihi ve
doğrudan desteklediği kabiliyet olsun. Model adı/bağlam penceresi/agent sınırı için kaynak yoksa
"doğrulanmadı" yaz; sayı veya davranış uydurma.

Özellikle şu ayrımı yap:

1. Gemini 3.1 Pro — orkestrasyon, uzun bağlam, araçlar ve gerçek sınırlar.
2. Gemini 3.6 Flash — paralel kanıt toplama/çok-modlu inceleme için gerçek kabiliyetler.
3. Claude'un resmi güncel Opus yüzeyi — ismi doğrulanmayan "Opus 5" varsayımı yapılmaz.
4. Codex / GPT-5.6 Terra-Sol — yerel ortamda görünen capability ile resmi OpenAI iddiasını ayır.

Model haritası yalnız model reklamı değildir: her satır "bu kabiliyet MAMILAS'ta hangi manuel
kontrolü güvenle denetim işine çevirebilir, hangi yaratıcı hüküm yine Mami'de kalır?" cevabını
taşır.

## Kanıt kalitesi duvarı

Bir bulgunun `ACCEPT` alması için aşağıdaki **altı parçanın hepsi** gerekir:

1. **Bugünün davranışı:** Çalıştırılabilir komut, gerçek üretim artefact'i veya kaynakta hâlâ
   erişilebilir somut yol.
2. **Beklenen / gerçek farkı:** Ne olması gerekirken ne oldu; tek cümle.
3. **İki yüzeyli zincir:** Örneğin UI/command → prompt pack, frame receipt → motion, hook →
   gerçek commit, register → lint/motion. Sadece bir dosya veya bir ledger satırı yetmez.
4. **Karşı-okuma:** Aynı iddiayı çürüten mevcut kod/test/receipt aranır; varsa bulgu `WEAKEN`
   veya `REJECT` olur.
5. **Üretim etkisi:** Kötü kare, yanlış motion, kayıp kredi, yanlış karar veya üretim durması.
   "Daha temiz mimari" tek başına etki değildir.
6. **En küçük yön + kabul testi:** Henüz kod değil; korunacak mevcut yetenek, dokunulmayacak
   alan ve gerçek production probe.

Kanıtın yanında kesin durum etiketi zorunludur: `CURRENT`, `HISTORICAL`, `UNPROVEN`, `REJECTED`.
Tarihsel bulgu iyi ders olabilir; canlı onarım backlog'una giremez.

## Derinleştirilecek altı eksen

### B1 — Gerçek üretim omurgası: kararın kareye ve kurguya inişi

Bir gerçek, yakın tarihli MAMILAS işi seç. Şu zinciri somut dosyalar ve üretim çıktılarıyla izle:

`Mami direktifi / Director kararları → command JSON → Author context / görünür prompt pack →
insanla render edilen start frame → frame receipt/revize → onaylı frame üzerinden motion → edit/VO kiti`.

Amaç yeni manifest önermek değildir. Amaç; her eldeki bağlantının gerçekten çalışıp çalışmadığını,
nerede yalnız sohbet veya dosya adıyla kaldığını görmek. Görsel karar iddiası varsa gerçek kareleri
incele; yalnız prompt veya test okuma yetmez.

### B2 — Mami direktifi ve kreatif otorite

`LIVE_CHAT` / Director direktifinin command, receipt, prompt ve jury yolunda üstün geldiğini veya
gelmediğini kanıtla. `mamilas-command.mjs`, `agentProtocol`, command runtime testleri ve gerçek
bir command artefact'i birlikte okunur.

Özellikle şunu test et: Linter gerçekten hangi çağrı yolunda `--strict` ile üretimi blokluyor?
Bir Mami-onaylı REAL promptunu **bugün** hangi satır/komut reddediyor? Bu gösterilemezse
"linter kreatif veto" bulgusu `REJECTED` olur. Linterin üretim güvenliği için taşıdığı lens,
temas, TEXT, STYLE, register ve gerçek-frame kökenli ölçüleri boş/dolu kontrolüne indirgemek
önerilemez.

### B3 — REAL / EDU / STY register'ının uçtan uca gerçekliği

Bir REAL ve bir EDU örneğiyle şu hattı izle:

`seçim / production path → registerOf → command export → image context → prompt-lint →
motion quality contract / görünür prompt`.

Her aşamada register'ın kaybolup kaybolmadığını kanıtla. Tarihsel olarak kapanmış register
körlüğünü yeniden açık bulgu gibi yazma; bugün çalıştırılan yolun çıktısını kullan.

### B4 — Frame, revize ve motion: görsel doğrulama var mı

Gerçek üretilmiş frame'leri aç ve incele. En az bir `PATCH_SAFE_FOR_MOTION` örneği ve geometri/
yaratıcı karar değiştiren bir revize örneğini karşılaştır. Motion prompt'unun o anki onaylı kareye
dayandığını receipt, görsel ve motion metni birlikte göstermeden hüküm verme.

`mamilas-denetim`in kareyi görmeden motion yazmama yasasının gerçek kullanımdaki karşılığını
araştır. Bir test/skill metni yalnız beklenen davranıştır, kanıt değildir.

### B5 — Kapılar, platform ve gerçek fail-closed davranış

CRLF, hook veya launcher bulgusu için önce gerçek bug'ın açık olup olmadığını yeniden üret.
Kapanmış `protocolHash` olayı tarihsel ders olarak kalabilir. `gate.sh`in yaptığı iş ile
protocol hash doğrulamasını aynı sistem sanma; gerçek çağrı zincirini göster.

Hook için minimum kanıt: settings çağrısı → çözülen executable yol → sentetik payload → doğru
exit kodu. Mac/Windows farkı iddiası varsa iki yüzeyde ölçülmüş çıktı gerekir; bir platform
hakkında diğerinden varsayım yapılmaz.

### B6 — Hafıza, skill ve oturum açılışı

`memory-sync` için canlı kaynak, repo aynası ve archive davranışını birbirinden ayır. Yön seçimi
Mami onayı olmadan veri taşıyorsa bu ayrı bir CURRENT bulgudur. Bunu command/prompt DNA kopukluğu
ile ancak aynı gerçek proje üzerinde bağlantı kurulursa birleştir.

Claude ve Codex'in `CLAUDE.md` / `AGENTS.md`, memory ve skill yüzeylerini gerçek dosya çözümüyle
karşılaştır. Skill paritesi "aynı ad var" değildir: trigger → yüklenebilir dosya → gerekli
referans → üretim adımı zinciridir.

## Flash görevleri

İlk dalga en fazla dört bağımsız Flash işi açar: B1, B2+B3, B4, B5+B6. Pro, sadece eksik
kanıt kaldığında ikinci dalga açabilir. Her görev en fazla üç aday bulgu üretir; bulgu yoksa
bu da net sonuçtur.

Her Flash çıktısı şu şablondadır:

```md
# B<n> — <alan>

## İncelenen gerçek yol
<artifact ve komutlarla başlangıç/bitiş>

## Aday bulgu — <hüküm>
- Durum: CURRENT | HISTORICAL | UNPROVEN | REJECTED
- Beklenen / gerçek:
- Kanıt zinciri: <iki veya daha çok yüzey>
- Tekrar üretim:
- Karşı-okuma ve sonucu:
- Üretim etkisi:
- Korunacak şey:
- En küçük yön / production probe:

## Bulgu olmayanlar
<neden elendi>
```

## Çıktı düzeni ve iterasyon

Hiçbir eski dosya silinmez. Yeni tüm çıktı şurada yaşar:

```text
artifacts/antigravity-makro-scan-2026-07-28/PASS-B/
  MODEL-SOURCES.md
  QUESTION-BOARD.md
  evidence/B1-*.md ...
  FINDINGS-v2.md
  COUNTER-JURY-v2.md
  MAMI-MEMO-v2.md
  CLAUDE-IMPLEMENTATION-BRIEF.md    # yalnız kabul eşiği geçilirse
```

Pro aşağıdaki kalite eşiğini kendi tesliminden önce uygular:

- Model haritasındaki her iddianın resmi URL'si var.
- Her `ACCEPT` bulgusunda altı parçalı kanıt duvarı eksiksiz.
- Her CURRENT bulgu bugünkü üretim yolunda tekrar üretilebilir.
- Counter-jury en az bir bulguyu `WEAKEN` veya `REJECT` etmeden memo yazılamaz; aksi halde
  çürütme yapılmamış sayılır.
- `MAMI-MEMO-v2.md` en fazla üç kabul edilmiş kök bağlantı taşır.
- Bir bulgu için Claude'a kod görevi yazılıyorsa, aynı maddede korunacak yetenek, sınır,
  kabul testi ve gerçek production probe bulunur.

Eşik geçmezse Pro "yeterli değil" diyerek yalnız eksik kanıt için ikinci dalgayı açar. Yeni
fikir listesi çıkarmak veya önceki memoyu cilalamak yasaktır.

## Claude'a ancak sonunda verilecek brief biçimi

`CLAUDE-IMPLEMENTATION-BRIEF.md` her onarım için ayrı bölüm taşır:

```text
<ID> — <tek kök bağlantı>
CURRENT kanıtı:
Kök neden:
Korunacak yetenek:
Dokunulmayacak alan:
En küçük mimari operasyon:
Kabul testleri:
Gerçek production probe:
Mami kararı gerekiyor mu:
```

"Linterı zayıflat", "tek kaynak yap", "daha fazla test" gibi belirsiz görevler kabul edilmez.
Mami onayı ile çelişen her kontrol için önce mevcut override/receipt mekanizmasının neden
yetersiz kaldığı kanıtlanır.

## Antigravity'ye yapıştırılacak direktif

> İlk makro tarama kabul edilmedi: doğru alanlara dokundu ama güncel bug, tarihsel ledger ve
> varsayımı ayırmadı; F05/F07 için ham kanıt olmadan sentez yazdı. Bu Pass B belgesini aynen
> uygula. 3.1 Pro run sahibidir; önce model kaynaklarını düzelt, sonra yalnız B1–B6 gerçek
> üretim zincirini kanıtla. Her bulguyu CURRENT/HISTORICAL/UNPROVEN/REJECTED etiketle. Kod
> yazma, eski raporları silme, API/provider çağrısı yapma, kare dosyası kimliği alanına girme.
> Linterı boş/doluya indirmeyi başlangıç varsayımı değil, çürütülecek bir iddia say. Kanıt
> eşiği geçmeden Claude briefi yazma; eşiği geçmezse eksik kanıt için ikinci dalgayı aç.
