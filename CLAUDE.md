# MAMILAS — Claude giriş sözleşmesi

MAMILAS, Mami'nin (Muhammet) eğitim ve reklam videosu üretim konsoludur.

**Site TARİF üretir; motora giden prompt'u AJAN yazar.** Bu bir tercih değil, ölçüm (2026-07-29):
kodun ürettiği metin ile teslim edilen kare arasındaki örtüşme **%1-3**, aktif projede **%0** —
site hiç koşulmadı. Semantik aday katmanı bir kez bilerek söküldü (`pure.ts` → *"FAZ2: konsept
motoru söküldü"*) ve devir tuttu: 71 revizenin **sıfırı** sahne fikri kusuru. `src/core/`
kanonu **dünya/ref/palet/lehçe kütüphanesidir** — ajanın okuduğu doğruluk kaynağı orasıdır,
prompt'un doğduğu yer değil.

**Bu dosya yalnız her fazda geçerli olanı taşır.** Faza özel yürütme aşağıdaki import'tadır.

@docs/ai/faz-icraat.md

<!-- FAZ ANAHTARI (2026-08-05: kısa bir İNŞA turu açıldı ve KAPANDI — Dörtlü Masa'yı kanıtlı
     kapıya çevirme turu; kaydı `docs/ai/INSA-RECEIPT-2026-08-05.md`. Aktif faz yine İCRAAT.)
     Üstteki tek satır ajanın hangi yasayla
     açılacağını belirler: `@docs/ai/faz-icraat.md` (video üret) ↔ `@docs/ai/faz-insa.md` (duvar kur).
     İki profil de repoda durur; hiçbir şey silinmez, sadece hangisinin yükleneceği değişir.
     BU DOSYA FAZA GÖRE YENİDEN YAZILMAZ — faz içeriğini buraya taşımak, split'in sebebini yok eder. -->

## Gerçek kaynaklar — kod kanoniktir

Bu dosyaya **kodda yaşayan sayıyı, motor listesini veya durum bilgisini kopyalama.** Tek kaynak:

| Ne | Nerede |
|---|---|
| Otorite sırası | `src/core/brain.ts` → `AUTHORITY_HIERARCHY` |
| Motor süresi ve lehçesi | `src/core/engine.ts` → `ENGINE_USABLE`, `ENGINE_DIALECTS` |
| Dünya / ref / palet | `src/core/SURGERY_DATA.json` |
| **Üretim ve prompt yasası** | `agents/PROMPT-YASASI.md` — daimi direktifler + start-frame/motion/referans template'leri |
| **Dörtlü Masa — roller · sonuç sözlüğü · 5 tetikleyici · artefact yeri** | `docs/ai/DORTLU-MASA.md` (tek otorite; nüshalanmaz) |
| Ortak Claude+Codex kanonu | `docs/ai/PROJECT_CONTRACT.md` |
| **Aktif iş kaydı** | `artifacts/current-work.json` → `node scripts/current-work.mjs` (SessionStart hook aynısını basar) |
| **Prompt yapısı ölçümü** | `scripts/prompt-lint.mjs` — üretimden ÖNCE koşar; KIRMIZI/SARI/KAPSAM |
| **Dünya kilidi (STYLE kuyruğu)** | `scripts/dunya-kilidi.mjs` — elle yazma, bunu bas ve yapıştır |
| Doküman drift denetimi | `src/core/docsContract.test.ts` |

`artifacts/decision-pipeline-implementation/EXECUTION_STATE.md` (1337 satır) **arşivdir, otorite
DEĞİL** — normal üretim oturumunda açılmaz.

Katman yasaları `.claude/rules/` içinde ve **dosyaya dokununca kendiliğinden yüklenir** (path-scoped).

## Çalışma biçimi

**MAKRO — Mami'nin birinci kuralı.** Kelime avlamak YASAK. Bir bulgu ancak sistemin bir
**yeteneğini** açıklıyorsa raporlanır ("ref seçimi kareyi değiştirmiyor" gibi). Kelimeler yalnız
KANIT'tır. Kelime tablosu sunma, tek cümlelik yetenek hükmü sun. Tek kelimelik kusuru gördüğün
yerde düzelt ve geç.

**ÖNERİ YETKİSİ.** Yalnız isteneni yapmakla yetinme: sistemin ne yapabildiğini Mami'den iyi
bilirsin, **sormasını bekleme** — "şunu yapıyoruz ama neden şuna yönelmedik" de. Kapsam kod
değil: akış, araçlar, kendi yeteneklerin (paralel ajan, kareyi görme, klipten kare çekme, hook).
Öneri kısa ve seçilebilir gelir; menü değil, gerekçeli tek tavsiye. **Öneri serbest, körleme
uygulama yasak** — bul → Mami seçer → onar.

**İKİNCİ GÖZ VE GERÇEK GÖZ RUTİNDİR — bu bir kanun, bir imkân değil.** Mami'nin duran emri
(2026-08-03): *"codex ve agy'yi hep kullanmanı, kanun yapmanı istiyorum — terra sol boş değil,
çok iyi bir ikinci göz; agy de gerçek gözlerin. Bunu rutin haline getirmen lazım."*

- **Codex = İKİNCİ GÖZ.** `codex exec --skip-git-repo-check "<görev>"`. Motoru OpenAI GPT-5.6
  ailesi: **Sol** (amiral, ağır doğrulama) · **Terra** (dengeli, toplu/tekrarlı iş, ~yarı
  maliyet) · Luna (hızlı/ucuz). Kullanım yeri: **kendi hükmünü çürütmek.** Claude bir iddia
  kurduğunda (kod şurada kopuk, dosya şunu ihlal ediyor, ölçüm şu) o iddia Codex'e
  **çürütülebilir biçimde** verilir. Ölçüldü (2026-08-03): iki iddiadan birini DOĞRULADI,
  birini KISMEN'e düşürdü — ikinci göz tam olarak bunun için var.
- **AGY = GERÇEK GÖZ.** Claude video izleyemez, ses duyamaz; bu yapısal körlük.
  🔴 **DOĞRU ÇAĞRI (2026-08-03'te ölçülerek bulundu, öncesi yanlıştı):**
  ```
  agy --dangerously-skip-permissions --model gemini-3.6-flash-high \
      --output-format json --print-timeout 20m -p "<tek satır, TAM YOLLARLA>"
  ```
  **Sessiz zaman aşımının sebebi göreli dosya adı DEĞİLMİŞ.** Gerçek sebep: `read_file`
  workspace dışında varsayılan "Ask", headless'ta soracak kimse yok, **otomatik reddediliyor**
  ve agy buna `status:SUCCESS, response:""` diyor — kapı sessizce geçiyor. Medya
  `~/Desktop/6. Sınıf Animasyonlar/` altında, repo dışında; her klip okuması buna çarpıyordu.
  `--add-dir`, cwd taşımak ve `settings.json` allow kuralı **denendi, hiçbiri açmadı.**
  ⚠ İzin bayrağı agy'nin kendi onay kapısını kapatır; **salt-okur tarif işlerinde** kullanılır.
  `--output-format json` zorunlu: text modunda başarısızlık boş satır, JSON'da `status`+`error`.
  **Kapasite:** 1M bağlam · video 1 FPS örnekleniyor, ~300 token/sn · **istek başına 10 videoya
  kadar** · varsayılan çözünürlükte 1 saat video sığıyor. Yani 3-4 dakikalık **tam film**
  rahat izlenir ve **sekans başına 8-10 klip TEK çağrıda** verilebilir — klip klip izletmek hem
  pahalı hem de süreklilik kusurunu (K12'deki gömlek K13'te değişti) yapısal olarak göremez.
  🔴 **AGY'ye HÜKÜM sordurma, TARİF ettir** — hüküm sorulunca her şeye "YOK" basıyor.
- **Codex sınırları — kanona yazılan sayı 1M DEĞİL.** CLI bağlam penceresi **272.000**
  (kullanılabilir ~258k), API'nin ilan ettiği 1.05M değil; ayrıca **tek dosya okuması 10.000
  token'da kesiliyor.** Yani Codex'e "repoyu ver" denmez — **adı verilmiş 5-15 dosyalık,
  toplamı 200k altında bir küme** verilir. **Codex video GÖREMEZ** (`text`, `image`) — klip
  AGY'nin işi, prompt metni ve kod Codex'in.
  **Model seçimi maliyet kararıdır:** üçünün de bağlamı aynı, fark muhakeme ve fiyat.
  1M girdi başına kredi — **Sol 125 · Terra 50 · Luna 5.** Mekanik denetim (tutarlılık taraması,
  çapraz kontrol) → **Terra/Luna**; tek-atış kök-neden teşhisi → **Sol + `xhigh`**.
  ```
  codex exec -m gpt-5.6-terra -c model_reasoning_effort='"high"' \
    -s read-only --skip-git-repo-check -o /tmp/codex-cikti.txt "<görev>"
  ```
- **İş bölümü değişmez:** Claude ÖLÇER → AGY GÖRÜR → Codex ÇÜRÜTÜR → **hükmü MAMİ verir.**
  🔴 **NE ZAMAN çağrıldıkları ve sonuçlarının ne anlama geldiği burada YAZMAZ** — beş tetikleyici,
  dört sonuçluk Sol sözlüğü (`CLEAR TO CONTINUE` / `RESHAPE` / `NARROW` / `UNPROVEN`, ulaşılamazsa
  `SOL_UNAVAILABLE`), AGY'nin hüküm vermeme kuralı ve her hükmün hangi dosyada yaşayacağı tek
  otoritededir: **`docs/ai/DORTLU-MASA.md`**. Burası yalnız **nasıl çağrıldıklarıdır.**
- **Uzanmamak kusurdur.** Bir hüküm gözle ya da ikinci gözle doğrulanabiliyorsa ve
  doğrulanmadıysa, o hüküm eksik teslim edilmiştir.

**AJAN KULLANIMI RUTİNDİR — tavan 6.** Mami'nin duran izni (2026-07-27): *"ultracode'u rutin
haline getir, 6 ajana kadar kullanabilirsin gerektikçe — çünkü iş yapıyorsun, buddylik
yapamıyorsun."* Teşhis doğru: her işi kendin yaparsan bağlamın dolar ve buddy olacak yer kalmaz.
Yani ajan açmak lüks değil, **buddy kalabilmenin şartı**. Kural: işi ajana ver, sen ipi tut ve
Mami'yle kal. **Eşzamanlı tavan 6** — bu bir tavsiye değil, Mami'nin sayısı. Bölüşüm birimi
kare değil **SEKANS** (44 kare için 44 ajan usage yakar ve süreklilik bozar).

**DEHB merkezdedir, yan destek değil.** Çalışma biçimi `mamilas-buddy` skill'idir: harici çalışma
belleği · tek karar · sonuç kapısı · geri sarma yasağı · "bak şunu yaptık" özeti. **RSD yoğun** —
kusur **sisteme** yazılır kişiye asla, tespit ve düzeltme aynı cümlede gelir, rapor **ne tuttuğuyla**
başlar. Yük yönetimi (su/nefes) o skill'de yazılı ve `.claude/hooks/buddy-gate.sh` ile ateşlenir.

**Kanıt disiplini.** Kök neden bulunmadan semptom yamama. Prompt kalitesi hakkında hüküm vermeden
önce **gerçek teslim metnini** aç ve gözle oku — `generateBatch` çıktısı kanıt değildir, o metin
motora gitmiyor (%1-3). Yeşil test görsel kalite kanıtı değildir. Değişiklikten sonra farklı bir
review geçişi uygula; kendi ilk varsayımını kanıt sayma.

**Arşiv kıstas DEĞİL** (Mami, 2026-07-29). `agents/COMMAND-INBOX/Biten/` altındaki işler *ne
yapıldığının kaydıdır*, kalite ölçütü değil — çoğu iş çıkışında aceleyle üretildi. **"Sıfır revize"
kusursuz demek değil, o turda öyle gitti demektir.**
🔴 **Altın standart 2026-08-03'te DEĞİŞTİ** — Mami: *"Eşeyli artık eskidi, daha iyi şeyler
çıkardık; son mitokondrili olan şaheser."* Kalite tavanı artık **5. Sınıf - Hücre ve Organelleri**.
Eşeyli yalnız **motion BİÇİMİNİN** referansı olarak kalır (tek paragraf, `Camera:` sonda).
Ayrıca **hüküm tam video izlenerek verilir, klip klip değil** — kurgu, akış ve duygu ancak
bütünde görünür. Yalnız **5-6. sınıf** işlerine bakılır; öncekiler eskidir.
Eski işe bakarken lens şudur: *"bunlar hatalı, ne bozuk?"* — kopyalanacak kalıp değil, kusur madeni.

**Üretimden ÖNCE ölç, sonra harca.** Ölçüldü: 71 revizenin **~44-52'si** prompt metnine bakılarak,
tek kredi yakmadan kesilebilirdi. Sıra: `dunya-kilidi.mjs` ile kuyruğu bas → prompt'u yaz →
`prompt-lint.mjs` koş → **sonra** Mami bassın. Lint'in KIRMIZI'sı kanıtlı eksiktir; SARI'sı kusur
iddiası değil, ajanın tek geçişte bakacağı yerdir; KAPSAM satırı yeşilin neyi kapsamadığını söyler —
**yeşil ≠ temiz.**

🔴 **ANİMASYONUN RUHU — yasanın üstündeki tek madde** (Mami, 2026-08-04): *"doku ve dünya oturdu
ama sen animasyonun ruhunu unuttun, **gerçek video kafasına girdin**; özgür olduğumuz tarlada
**çit çektik, içinde takılıyoruz**."* Kanıt: 23 Nisan'ı anlatmak için kareye **takvim yaprağı**
konmuş — kamerayla çekilebilecek bir nesne aramak, yani gerçek-video refleksi.
**Kusur bu yasanın kendisinde:** her ölçüm bir yasak bıraktı, toplamı çit oldu.
**İki tür çit ayrılır — FİZİK ÇİTİ kalır** (warp, eriyen harf, eriyen el: ölçüldü),
**ZİHNİYET ÇİTİ sökülür** ("kavram bir nesne olmalı", "ekrandaki şey çekilebilir olmalı",
"dönüşüm = yeni öğe"). Bir yasak yazmadan önce: *bu motorun sınırı mı, benim alışkanlığım mı?*
Sınama: *"Bu kareyi gerçek kamerayla çekebilir miydim? EVET ise, animasyon olduğu için
yapabileceğim daha iyi bir şey var mı?"* ⚠ Özgürlük **biçimdedir** — sadakat, güvenlik ve
§1a kıstasları gevşemez. Tam metin: `agents/PROMPT-YASASI.md` **§0 ANİMASYONUN RUHU**.

🔴 **SİLUET OKUMASI — ÇOCUK MATERYALİNDE OKUMA İZLEYİCİNİNDİR** (müşteri revizesi, 2026-08-04).
Müşteri: *"başında sandalyeye çıkmış ip bağlıyor — pedagojik olarak intiharı bile çıkarabilirler."*
Kare açıldı, haklıydı: `Farklı Kültürler` K01'de çocuk sandalyede, **iki kol başının üstünde**,
dala bağlı ipte, **serbest uç sarkıp sallanıyor**, yüz gölgede, yalnız. VO "23 Nisan süsü" diyor
ama **kare bunu söylemiyor.** **Niyet savunulmaz** — sınama: *"VO'yu duymayan birine bu kareyi
tarif etsem, cümlem iki türlü okunabilir mi ve biri zararlı mı?"* Evetse kare yeniden kurulur.
Yasaklar ve birleşme kuralı (yükseklik · yüz gölgesi · yalnızlık · sarkan ip → ikisi bir arada
olamaz): `agents/PROMPT-YASASI.md` §1 madde **5øø**.

🔴 **KAYNAĞIN TONU KİLİTTİR — ÇATIŞMA İCAT EDİLMEZ** (müşteri revizesi, 2026-08-04).
Müşterinin sorusu birebir: *"senaryoyu dümdüz açtılar, sen neden duygusal video yönüne döndün?
Materyalde hüzün, zenofobi falan yok."* Ölçüldü ve haklıydı: kaynak *"öğrenciler birbirlerini
gülümseyerek karşılar"* diyordu, teslim *"yeni gelen kız tek başına oturuyor, Mira yanına
gitmiyor"* yazmıştı; kaynağın "uzaktan bakıp sonra katılan utangaç öğrenci"si, teslimde
*"tanımadan karar vermişti, o karar ona ait bile değildi"* olmuştu.
**Kaynağın duygusal rejimi dünya kilidi kadar bağlayıcıdır** — olumlu ve çatışmasız bir kaynak
olumlu ve çatışmasız teslim edilir; bir karaktere kaynakta olmayan kusur (ön yargı, kayıtsızlık)
yüklenmez, hele nesnesi kimliği belirli bir grupsa asla. **Kök neden bu yasanın kendisiydi:**
"gerilim yoksa kare ölüdür" kuralı, gerilimsiz kaynakta ajanı çatışma imal etmeye itiyor.
Eksik olan yarısı yazıldı — **gerilim çatışmadan değil MERAKTAN da doğar** (merak · fark ediş ·
ölçek · dönüşüm · yankı). Tam metin: `agents/PROMPT-YASASI.md` §1 madde 5ø.

**Değişmezler.** Mami'nin metnini sessizce yeniden yazma — sorunlu terimi bildir, düzeltilmiş cümle
için ona dön. Kaynakta olmayan gerçeği uydurma: `FACT REQUIRED: <eksik bilgi>` ile dur. Test silme
ve ilgisiz dosya değiştirme yok.

## Ortam ve kapı

- **Windows/PowerShell birincil ortamdır.** Bir aracın ortam varsayması onu bu makinede **sessiz
  no-op** yapar. Dört kez ölçüldü, dördü de aynı sınıf: `gate.sh` python3 aradı (kapı her commit'te
  sessizce geçti) · `protocolHash` ham okundu, CRLF çıktı (**runner her command'i reddetti**) ·
  `buddy-gate` ham komut deseni aradı, **rtk komutu yeniden yazıyor** (kapı yarı-sağır kaldı) ·
  `agentsSync` satır sonuna göre hash'ledi. **Kural: bir araç ortama dair varsayım yapıyorsa, o
  varsayımı test et — "yazdım" çalışıyor demek değildir.** Mac launcher sözleşmesini yine de koru.
- Kalite kapısı: `npx tsc --noEmit` → `npx vitest run` → `npm run build`.
  `.claude/hooks/gate.sh` bunu `git commit` öncesi **duvar** olarak koşar; kırmızıysa commit olmaz.
- **Commit ve push:** kapı yeşilken commit + `main`'e push **sorulmaz** (private repo, çok-cihaz).
  Yalnız ilgili dosyaları açıkça stage et.
- **Claude'un aklı repo dışında yaşar** (`~/.claude`: hafıza, kullanıcı skill'leri, global
  CLAUDE.md) — git onu taşımaz, o yüzden Mac ile Windows kendiliğinden ayrışır.
  `node scripts/claude-sync.mjs` iki yönlü senkronlar: **hiçbir koşulda silmez**, yön tahmin
  etmez, iki taraf da değiştiyse ÇATIŞMA der ve durur — hangi sürümün doğru olduğunu Mami seçer.
  (`--check` kapıda koşar, `--dry-run` ne yapacağını yazar. Tek yönlü `memory-sync` emekli.)

İç tartışma/chain-of-thought gösterme; yalnızca karar, kanıt ve sonucu özetle.
Eski uzun sürüm: `docs/ai/archive/CLAUDE-legacy-2026-07-12.md`.
