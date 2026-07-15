---
name: mamilas-gate
description: MAMILAS değişikliğini bitirmeden, commit etmeden veya hazır ilan etmeden önce kalite kapısını çalıştırmak ve yeni kırıkları ayırmak için kullan.
---

# MAMILAS Gate

1. `npx tsc --noEmit`
2. `npx vitest run`
3. `npm run build`
4. Değişiklik E2E akışını etkiliyorsa `npm run test:e2e` ve baseline ayrımı.
5. Launcher/runner değiştiyse `docsContract.test.ts` kapsamındaki Windows ve macOS
   sözleşmelerini özellikle kontrol et.

Test silme, hata saklama veya test sayısındaki düşüşü açıklamasız kabul etme. Sonuçta
çalıştırılan kontrolleri, yeni kırıkları ve bilinen baseline sorunlarını ayrı yaz.
