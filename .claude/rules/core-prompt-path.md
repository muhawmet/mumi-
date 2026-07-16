---
paths:
  - "src/core/brain.ts"
  - "src/core/pure.ts"
  - "src/core/source.ts"
  - "src/core/engine.ts"
  - "src/core/qa.ts"
  - "src/core/proof.ts"
  - "src/core/commandExport.ts"
  - "src/core/productionExport.ts"
---

# Prompt yolu — bilinen kusurlar ve değişmez yasalar

Bu dosyalar motor prompt'unu üretir. Aşağıdakiler **ölçülmüş** kusurlardır; tahmin değil.
Bir tanesine dokunuyorsan önce `artifacts/decision-pipeline-implementation/receipts/TASK-00.md`
oku.

## Değişmez yasalar

- Palet motora **ham hex** olarak girmez; fiziksel ışık dili olarak girer
  (`hexToLightWords`, `paletteLightPrompt`). Bu yasa bugün **çalışıyor** — bozma.
- On-screen text ya kareye **diegetik/baked** olarak üretilir ya da hiç kullanılmaz.
- Motion prompt, **onaylı başlangıç karesi görülmeden yazılmaz.**
  Prompt PASS ile görsel PASS **ayrı kapılardır**.
- Marka geometrisi, belirli yüz veya dönem bilgisi kaynakta yoksa **uydurma**:
  `FACT REQUIRED: <eksik bilgi>` ile dur.
- Kullanıcının cümlesini **sessizce scrub etme**. Sorunlu terimi bildir, düzeltilmiş
  cümle için Mami'ye dön.
- Soyut kalite sıfatı yerine **gözlenebilir** kamera, ışık, malzeme, hareket davranışı yaz.

## Bilinen kusurlar (dokunmadan önce bil)

**Ajan görev metni motor stringinin içinde.** `brain.ts:1977-1978` →
`Scene brief (Claude yazar): … [DIRECTOR TASK — authored by Claude, not image content…]`.
Motion'da da var (`:2760-2761`, `:2789`). **Testle kilitli** (`commandExport.test.ts:347`) —
kaldırırken testi de birlikte güncelle, sessizce silme.

**`render_law` verbatim prompt'a giriyor** (`renderLock()` `:63-79` → `parts[0]` `:2094`).
46 dünyanın **19'u** render_law'ında 3+ somut nesne adı taşıyor → **prop kareye sızıyor**
(One Piece karesine korsan gemisi + WANTED afişleri girdi). Yasa:
**"Render law FİZİKTEN yapılmışsa güvenle taşınır. PROP'tan yapılmışsa kareye sızar."**
Ama render_law'ı **toptan silme** — A2 pilotu bunu denedi, kare "stok fotoğrafa kaydı".
Fizik/prop olarak **ayır**, fizik verbatim kalsın.

**Ham hex render lock yolundan girebiliyor.** `qa.ts:333-334` bunu itiraf ediyor:
*"The render-lock block is a verbatim contract and MAY contain hex — strip it first."*

**`AUTHORITY_HIERARCHY` bir liste sabiti, çözücü değil.** `brain.ts:2288` tanım; tek
kullanımı `:2407` (brief metnine basılıyor). Gerçek çatışma çözümü ad-hoc ikili kapılarda
(`:288-302`, `:616-634`, `:1898-1918`, `:2056-2059`) ve **kaybeden directive sessizce
eziliyor**. Yeni bir çözüm yazıyorsan **her ezilen directive makbuz bırakmalı**.

**Determinizm — FİXLİ (tarihçe).** `commandId` eskiden timestamp türeviydi; artık içerik
hash'i (`commandExport.ts` — "no longer defines identity" yorumu). `generatedAt` yalnız kayıt.

**`qaScore` motion'a hiç bakmıyor** (`proof.ts:202-232`) — hex sızıntılı prompt `100` alıyor.
`qaScore 100` **kalite kanıtı değildir**.

**Motion gate hash'siz.** `buildMotionPrompt` (`:2733`) kare/hash almıyor; `pure.ts:1326`
körlemesine çağırıyor. `runner.mjs` içinde `frame_checks`/`FRAME_PASS` → **sıfır eşleşme**.

## Gerçekten çalışan tek typed kapı

`validateBriefCompatibility` (`pure.ts:860-966`) → `BLOCKED` → `generateBatch` **sıfır sahne**
döndürüyor (`pure.ts:1188`). Kodlar: `CAST_IP_LEAK`, `RECIPE_IP_LEAK`, `RECIPE_RAW_HEX`,
`MATERIAL_WORLD_MISMATCH`, `WORLD_PATH_MISMATCH`, `CAST_REQUIRED`, `REGISTER_CONTAMINATION`.
Yeni blocker yazarken **bu deseni izle** — prompt'un içine "DUR" cümlesi yazmak kapı değildir
(`PERIOD REQUIRED`, `brain.ts:2045-2047` — string yine de return ediliyor).

## Kanıt disiplini

Prompt kalitesi hakkında hüküm vermeden önce **gerçek `generateBatch` çıktısı** üret ve gözle oku.
Fixture yardımcı kanıttır, gerçek üretim yolunun yerine geçmez. `npx vitest run` yeşil olması
görsel kalite kanıtı **değildir**.
