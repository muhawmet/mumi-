# MACRO 3 — Final Brief + Command hattı

**Tarih:** 2026-07-15 · **Uygulayıcı:** Claude Opus 4.8 · **Plan:** MACRO 3

## Kullanıcı açısından çalışan akış

Mami hiçbir API kullanmadan bir projeden taşınabilir brief (command JSON) alır → command'deki
ajan brief'i + WorldPacket fiziğini + Mami'nin serbest notunu okuyup final image prompt'u yazar
→ Mami ajanın çıktısını elle yapıştırarak/import ederek siteye geri alır. Site final prompt
üretmez, prompt'a karışmaz. Receipt hangi karardan (commandId) yazıldığını hash'le taşır.

## Değişen dosya grupları

- `src/core/commandExport.ts` — command JSON'a `worldPacket` alanı eklendi (seçili dünyanın
  taşınabilir fiziği; `worldPacketById` ile). `commands.contract`'a üç satır: WorldPacket'in
  yaratıcı malzeme (prompt değil) olduğu, vocab örneğinin emir olmadığı, ve Mami direktifinin
  onaylı bağlam olduğu (ajan "şu sahnelere yazı koy" der, uygular; site bloklamaz). IMAGE
  sözleşmesi worldPacket'i prompt kaynağı olarak adlandırıyor.
- `src/store/useStudioStore.ts` — `Scene.promptReceipt?` + `PromptReceipt` tipi + yeni
  `applyAgentPrompt(scene, finalPrompt, fromCommandId, source)`: ajan çıktısını `userImagePrompt`
  override'ına yazar VE receipt'i (finalPrompt + fromCommandId + sha256 promptHash + source)
  bağlar. Boş geri-alım ikisini de temizler. `sha256Hex` import edildi.
- `src/core/finalBriefLine.test.ts` — yeni: taşınabilir brief + ajan geri-alım + receipt
  hash bağı testleri (8 test).

## Korunan invariant'lar

- **Site prompt yazmaz.** `prompts.image` bir BRIEF (bitmiş prompt değil), `prompts.motion` kare
  öncesi NULL. Ajan `dominant element'i SEN yaz` talimatı korundu.
- Taşınabilir kimlik: içerik-hash'li `commandId` (`mamilas-<64hex>`), timestamp değil.
- WorldPacket brief içinde prompt DEĞİL: `[DIRECTOR TASK]` bandı yok; palette-as-light ham
  hex taşımıyor; legacyRenderLaw korunuyor.
- Mami'nin raw source'u + serbest notu (directorBrief) brief'e değişmeden ulaşıyor.
- Uyumsuz ref command'e girmez (world-lock kapısı) — dokunulmadı.

## Gerçek çıktı (gerçek `buildCommandJSON` + `applyAgentPrompt`)

```
command:
  commandId              : mamilas-<64hex>            (içerik hash, deterministik)
  baseDecision.rawSource : "Mat siyah termos…"        (karakter karakter)
  creativeControls.directorBrief : "4–5 sahneye anlamlı yazı koy…"  (birebir)
  worldPacket.renderPhysics : dolu · paletteAsLight: hex YOK · legacyRenderLaw: dolu
  contract               : "dominant element'i SEN yaz" + "WORLD PACKET prompt değildir" + "MAMI DİREKTİFİ"

ajan geri-alım:
  effectivePrompt        : ajan-yazımı final prompt   (site brief'i DEĞİL)
  promptReceipt          : { finalPrompt, fromCommandId=commandId, promptHash=sha256, source }
  boş geri-alım          : override + receipt temizlenir
```

## Test sonucu

`npx tsc --noEmit` → 0 · `rtk proxy npx vitest run` → **1898 geçti / 0 kaldı (61 dosya)** ·
`npm run build` → OK.

## Açık risk / dış bağımlılık

Yok (kod işi). Ajanın gerçek prompt kalitesi Macro 8'de gerçek frame ile hükme bağlanır — bu
macro yalnız hattın taşınabilirliğini ve sınırı (site brief verir, ajan prompt yazar) kanıtlar.
UI'da geri-alım düğmesi MACRO 4 Storyboard Studio'da bağlanacak.
