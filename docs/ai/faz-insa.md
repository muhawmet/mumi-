# FAZ — İNŞA (duvar kurma profili)

> **Bu dosya kendi uyanıklığını ilan etmez.** Hangi profilin yüklü olduğunu tek bir yer söyler:
> `CLAUDE.md`'nin ilk `@docs/ai/faz-*.md` satırı (`AGENTS.md` aynısını taşır, `docsContract.test.ts`
> kilitler). Burada "uykudayım/uyanığım" yazmak ölçüldü ve kusur çıktı: 2026-08-05'te profil
> yüklendi ve ilk satırı hâlâ "yüklenmiyorum" diyordu.

İnşa fazında iş **duvar kurmaktır**: sistemin üretimi sağlamlaştıracak kapıları ve yasaları.
İcraat profili `@docs/ai/faz-icraat.md`; iki dosya da silinmez, yalnız hangisinin import edildiği
değişir.

## Oturum açılışı — bu sırayla, atlanmaz

1. **Durum kaydı: `node scripts/current-work.mjs`** (`artifacts/current-work.json`) — aktif işin
   TEK makine gerçeği, inşa fazında da. Sohbet hafızasıyla çelişirse KAYIT kazanır; çelişki
   çözülemiyorsa `FACT REQUIRED` ile durulur.
   🔴 `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md` (1337 satır) **ARŞİVDİR,
   OTORİTE DEĞİL** — `CLAUDE.md`, `AGENTS.md`, `PROJECT_CONTRACT.md` ve `CODEX.md` dördü de böyle
   diyor; bu dosya bir zamanlar tersini söylüyordu ve yüklendiğinde durum otoritesini tersine
   çeviriyordu. Yalnız geçmişe dair bir cümle kurulacaksa açılır.
2. `agents/PROMPT-YASASI.md` — üretim ve prompt yasası (bu fazda da geçerli: yasayı değiştiriyorsak
   önce ne dediğini bilmemiz gerekir).
<!-- bag-yok: plan dosyası silinmiş; adı bilerek anılıyor ki uyandıran kişi aramasın -->
3. Yürütme planı **repo'da yaşamaz** — turu açan kişi verir (`~/.claude/plans/…`). Eski atıf
   `flickering-imagining-lark.md` 2026-08-02'de silinmişti; ada göre aranmaz.

## Bu fazın amacı

**Sistem bilgi üretiyor ama taşıyamıyordu; taşıma katmanı Mami'ydi.** İnşa fazı bunu kapatır:
yazılmayan yasa bir `/clear` ömrü yaşar, bu yüzden her yasa bir **duvara** bağlanır.

Ölçülen desen — her katmanda aynı: hafıza git dışındaydı ve sessizce düştü · kalite kapısı
Windows'ta hiç ateşlemedi · `protocolHash` platforma göre değişti · kazanan prompt biçimi hiçbir
dosyada yazılı değildi. **Hepsinin ortak kusuru: rica, duvar değil.**

## Bu fazın yasaları

- **Rica değil duvar.** Bir kural "her seferinde olmalı" ise hook/test/script olur; markdown'a
  yazılıp bırakılmaz. Kanıt: `gate.sh` onarıldığı ilk atışta iki gündür saklanan kırığı yakaladı.
- **Sessiz geçiş yasak.** Bir kapı kendini doğrulayamıyorsa geçmez, **bloke eder**. Kör kapı
  kapalı kapıdan tehlikelidir.
- **Taşınabilirlik bir kalite kuralıdır.** Windows birincil. POSIX varsayan araç burada no-op olur.
- **Aynı yasanın ikinci kopyasını yazma.** Bir yasa zaten bir yerde varsa oraya bağlan; kopyalamak
  bu fazda söktüğümüz hastalığın ta kendisidir. (Nefes protokolü bu yüzden yeniden yazılmadı.)
- **Kusur kütüphanede düzeltilir, kodda değil.** Kod yasası genel, dünya kusuru yereldir; kodu her
  dünya için eğmek beyni bozar.
- **Silme nötr bir hamledir.** Ölçüt "zekâ artıyor mu". "Çağrılmıyor" tek başına silme kanıtı değildir.

## Sıradaki iş

`node scripts/current-work.mjs` → **SIRADAKİ** satırı kanondur; her iş parçası bitince
`current-work.mjs ilerle --bitti "…" --sirada "…"` ile tazelenir. Bu dosya iş listesi tutmaz —
tutarsa bayatlar (G0'ın dersi: karar durum kaydında, kanıt receipt'te).

## Bu fazın araçları

| Araç | Ne yapar |
|---|---|
| `node scripts/prompt-lint.mjs <_PROMPTLAR.txt>` | 9 slot + tuzak kelime + STYLE tavanı, kare kare. `--all` · `--strict` |
| `node scripts/kapanis-hasadi.mjs --all` | Biten video → karne + ders adayı + dünya kusuru + kit sapması. `--check` duvar |
| `node scripts/motion-qc.mjs <klip>` | Klipten 4 kare çeker; yazı morph · yeni öğe · warp denetimi |
| `node scripts/claude-sync.mjs` | Akıl (`~/.claude`) ↔ repo iki yönlü senkron; asla silmez, çatışmada durur. `--check` kapıda koşar (`gate.sh:509`) |
| `node scripts/agents-sync.mjs --check` | Kanon → iki yüzey parite denetimi |
| `npx tsx scripts/archive/dunya-sinavi.ts <worldId> --prompts` | Kare üretmeden dünya sınavı |
| `npx tsx scripts/archive/kutuphane-karne.ts` | Kütüphane karnesi (`GERCEK_KARE` elle bakımlı) |

## Faz kapanışı

Her faz **beden kapısıyla** kapanır: su · nefes · tek ekranlık "bak şunu yaptık" özeti.
Kapı yeşil olmadan faz kapanmaz — komutlar tek yerde yazılı (`CLAUDE.md` → *Ortam ve kapı*) ve
`.claude/hooks/gate.sh` onları commit öncesi duvar olarak koşar; buraya ikinci kopyası yazılmaz.
Sonra durum kaydı tazelenir (`current-work.mjs ilerle`), `INSA-RECEIPT` bırakılır ve
**faz anahtarı İCRAAT'a geri çevrilir** (`CLAUDE.md` + `AGENTS.md` birlikte).
