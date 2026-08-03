---
name: mamilas-gate
description: "MAMILAS kalite kapısı kırmızı yandığında ve commit'i bloke ettiğinde kullan. Mami'nin cümleleri: 'kapı kırmızı', 'commit olmuyor', 'commit bloke oldu', 'build patladı', 'test kırmızı', 'testler düştü', 'neden geçmiyor', 'kapı neden reddediyor'. Ayrıca bir değişikliği bitti/hazır ilan etmeden önce ve büyük bir refactor öncesi temiz taban kurmak için. Use when the quality gate blocks a commit, a test count drops, or the build breaks. ⚠ Dört komutu koşmak için ÇAĞRILMAZ — PreToolUse hook'u zaten her commit'te koşuyor; bu skill kapının NEDEN reddettiğini teşhis eder."
---

# MAMILAS Gate — teşhis

**Gate artık bir hook.** `.claude/hooks/gate.sh` her `git commit` öncesi otomatik koşar ve
kırmızıysa `exit 2` verir — commit gerçekleşmez, `--dangerously-skip-permissions` modunda bile.
**Onu elle koşman gerekmiyor.** Bu skill kırığı TEŞHİS etmek ve işi hazır ilan etmeden önce
yeni kırığı bilinen baseline'dan ayırmak içindir.

## Gate'i elle koş (teşhis için)

```bash
.claude/hooks/gate.sh <<< '{"tool_input":{"command":"git commit"}}'
```

## Kırıksa — kök teşhis

Sırayla, ilk kırılanı bul:

```bash
rtk proxy npx tsc --noEmit        # 0 hata şart
rtk proxy npx vitest run          # Tests N passed  ← OTORİTER SAYI
rtk proxy npm run build
zsh -n agents/MOTION-CALISTIR.command && zsh -n agents/production/MOTION-CALISTIR.command
```

**E2E ayrı koşar.** `npm run test:e2e` gate'in parçası **değil** — değişiklik E2E akışını
etkiliyorsa koş ve baseline ayrımını yap: bu kırık zaten var mıydı, yoksa bu değişiklik mi doğurdu.

**Launcher/runner değiştiyse** `src/core/docsContract.test.ts` kapsamındaki **Windows ve macOS
sözleşmelerini birlikte** kontrol et. Tek platformu yeşile boyamak paritenin kendisini kırar.

## Test sayısı DÜŞTÜYSE

Baseline `.claude/test-baseline` dosyasında. Sayı düştüyse gate **doğru davranıyor** — test silinmiş.

Bir test **bilerek** kaldırıldıysa (nadiren meşru): baseline'ı elle güncelle **ve nedenini commit
mesajına yaz.** Sayıyı sessizce düşürmek, kapıyı sessizce gevşetmektir.

Sayı arttıysa gate baseline'ı **kendisi ilerletir** — kapı zamanla sıkılaşır, gevşemez.

## Asla

- `--no-verify` ile geçme.
- Kırık testi **silerek** yeşile boyama.
- `.skip` / `.todo` ile susturma.
- Baseline'ı düşürerek kapıyı gevşetme.
- Test sayısındaki düşüşü açıklamasız kabul etme.

Kırık bir kapı, olmayan kapıdan **beterdir**: yeşil rapor verir, sen de güvenirsin.

## Rapor biçimi

Üç başlık **ayrı** yazılır; karıştırılırsa rapor yeşil görünüp yalan söyler:

1. **Çalıştırılan kontroller** — hangileri gerçekten koştu.
2. **Yeni kırıklar** — bu değişikliğin doğurduğu.
3. **Bilinen baseline sorunları** — önceden kırıktı, bu iş sorumlusu değil.

## Tuzaklar

- **RTK çıktıyı yiyor.** `npx vitest run` bazen `PASS (0) FAIL (0)` basar — bu vitest'in çıktısı değil,
  RTK'nın filtresi. Otoriter sayı için: `rtk proxy npx vitest run` → `Tests  N passed` satırı.
- Başıboş dev server: `lsof -ti:5173 | xargs kill`
