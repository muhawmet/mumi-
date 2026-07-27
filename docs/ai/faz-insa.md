# AKTİF FAZ — İNŞA

Bu profil `CLAUDE.md`'den import edilir. Şu an **inşa** fazındayız: sistem üretimi
sağlamlaştıracak duvarlar ve yasalar kuruluyor. İcraata geçince üstteki import
`@docs/ai/faz-icraat.md` olur — bu dosya silinmez, uykuya geçer.

## Oturum açılışı — bu sırayla, atlanmaz

1. `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md` — **tek gerçek durum kaydı.**
   Sohbet hafızasından varsayım yapılmaz. Çelişki varsa `FACT REQUIRED` ile durulur.
2. `agents/PROMPT-YASASI.md` — üretim ve prompt yasası (bu fazda da geçerli: yasayı değiştiriyorsak
   önce ne dediğini bilmemiz gerekir).
3. Yürütme planı: `~/.claude/plans/flickering-imagining-lark.md` (FAZ H → 0 → 1 → 1.5 → 2 → 3 → 4).

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

`EXECUTION_STATE.md` → **SIRADAKİ TEK ADIM** bölümü kanondur. Bu dosya iş listesi tutmaz —
tutarsa bayatlar (G0'ın dersi: karar `EXECUTION_STATE`'te, kanıt receipt'te).

## Bu fazın araçları

| Araç | Ne yapar |
|---|---|
| `node scripts/prompt-lint.mjs <_PROMPTLAR.txt>` | 9 slot + tuzak kelime + STYLE tavanı, kare kare. `--all` · `--strict` |
| `node scripts/kapanis-hasadi.mjs --all` | Biten video → karne + ders adayı + dünya kusuru + kit sapması. `--check` duvar |
| `node scripts/motion-qc.mjs <klip>` | Klipten 4 kare çeker; yazı morph · yeni öğe · warp denetimi |
| `node scripts/memory-sync.mjs` | Hafıza ↔ repo aynası. `--check` sapmada exit 1 |
| `node scripts/agents-sync.mjs --check` | Kanon → iki yüzey parite denetimi |
| `npx tsx scripts/dunya-sinavi.ts <worldId> --prompts` | Kare üretmeden dünya sınavı |
| `npx tsx scripts/kutuphane-karne.ts` | Kütüphane karnesi (`GERCEK_KARE` elle bakımlı) |

## Faz kapanışı

Her faz **beden kapısıyla** kapanır: su · nefes · tek ekranlık "bak şunu yaptık" özeti.
Kapı yeşil olmadan faz kapanmaz: tsc 0 · vitest yeşil · build OK · `agents-sync --check` OK.
Sonra `EXECUTION_STATE.md` mühürlenir ve commit+push edilir.
