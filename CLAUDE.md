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

<!-- FAZ ANAHTARI (2026-07-28: İNŞA → İCRAAT çevrildi). Üstteki tek satır ajanın hangi yasayla
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
  `agy -p "<tek satır>" --model gemini-3.6-flash-medium --mode plan --print-timeout 25m`,
  **her zaman tam yol** (göreli ad = belirsizlik = sessiz zaman aşımı, 34 klipte ölçüldü).
  Görüntüyü de okur, klibi de. 🔴 **AGY'ye HÜKÜM sordurma, TARİF ettir** — hüküm sorulunca
  her şeye "YOK" basıyor, tarif istenince kusurun kendisini anlatıyor.
- **İş bölümü değişmez:** Claude ÖLÇER → AGY GÖRÜR → Codex ÇÜRÜTÜR → **hükmü MAMİ verir.**
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
