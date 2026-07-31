---
name: mamilas-gate
description: Use when the MAMILAS quality gate has gone red and blocked a commit, when a test count drops, when the build breaks, or when you need to diagnose why the gate is refusing. Also use before a large refactor to establish a clean baseline. Do NOT use it merely to run the four commands — the PreToolUse hook already runs them on every commit.
---

# MAMILAS Gate — teşhis

**Gate artık bir hook.** `.claude/hooks/gate.sh` her `git commit` öncesi otomatik koşar ve
kırmızıysa `exit 2` verir — commit gerçekleşmez, `--dangerously-skip-permissions` modunda bile.
**Onu elle koşman gerekmiyor.** Bu skill kırığı TEŞHİS etmek içindir.

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

Kırık bir kapı, olmayan kapıdan **beterdir**: yeşil rapor verir, sen de güvenirsin.

## Tuzaklar

- **RTK çıktıyı yiyor.** `npx vitest run` bazen `PASS (0) FAIL (0)` basar — bu vitest'in çıktısı değil,
  RTK'nın filtresi. Otoriter sayı için: `rtk proxy npx vitest run` → `Tests  N passed` satırı.
- Başıboş dev server: `lsof -ti:5173 | xargs kill`
- `npm run test:e2e` gate'in parçası **değil** — ayrı koş, "yeni kırık var mı" diye bak.
- `SURGERY_DATA.json` deny'lı. Veri lazımsa `npm run data <alt-komut>`.
