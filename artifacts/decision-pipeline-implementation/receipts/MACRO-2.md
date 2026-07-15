# MACRO 2 — 46 World → WorldPacket dönüşümü

**Tarih:** 2026-07-15 · **Uygulayıcı:** Claude Opus 4.8 · **Plan:** MACRO 2

## Kullanıcı açısından çalışan akış

Mami bir dünya seçtiğinde, o dünyanın yaratıcı FİZİĞİ (render, figure, environment, camera,
light, material, motion, negative + palette-as-light + compatible ref) tek bir yapılandırılmış
`WorldPacket` olarak ajanın okuyabileceği biçime derleniyor. Bu paket MACRO 3'te brief içinde
ajana taşınacak — **site bu paketten prompt üretmiyor.** Aynı source iki farklı world'de ajana
gerçekten farklı yaratıcı malzeme veriyor.

## Değişen dosya grupları

- `src/core/pure.ts` — yeni: `WorldPacket`/`WorldPacketRef` tipleri, `toWorldPacket(world, ctx?)`
  ve `worldPacketById(id, ctx?)`. Import: `paletteLight` → `paletteLightPrompt` (fiziksel ışık).
- `src/core/worldPacket.test.ts` — yeni: 46 world kapsama + benzersizlik + palette-as-light +
  legacy koruma + compatible-ref + "prompt değildir" testleri (10 test).

## Korunan invariant'lar (Mami sınırları)

- **WorldPacket PROMPT DEĞİLDİR.** Alanlar veri; test hiçbirinde `[DIRECTOR TASK]`/
  `DOMINANT ELEMENT`/`ON-SCREEN TEXT` bandı olmadığını kanıtlıyor.
- **Veri çoğaltılmadı — türetildi.** Kaynak `SURGERY_DATA.json`'daki world alanları
  (render_law, line_grammar, lens_grammar, camera_grammar, light_law, palette_lock,
  motion_cadence, material_compat, negative_lock, example_injection). Yeni literal yok.
- **`render_law` silinmedi.** `legacyRenderLaw` her world'de world.render_law'ı birebir taşıyor
  (test kilitli) — legacy/human referansı.
- **palette-as-light korunuyor.** `paletteLightPrompt` (hexToLightWords) ile ham hex fiziksel
  ışığa indirgeniyor; test 46 world'ün hiçbirinde `#RRGGBB` olmadığını doğruluyor.
- **`vocabularyExamples` yalnız yaratıcı referans** — motor kadro/prop emri değil.
- **compatible ref davranışı**: ref world'ü ezemez; uyumsuz ref `compatible=false` + boş directive.

## Gerçek çıktı (gerçek `toWorldPacket`)

İki radikal farklı dünya, aynı derleyiciden:

```
one_piece_toei (ANIMATION_BOLD_CEL):
  renderPhysics : Toei bold-cel, 3-5px uniform pure-black outline, 2-value flat cel
  cameraEnvelope: 25-35mm frog-eye from below chest, horizon 20-30% from bottom
  motionCadence : 12fps on 2s, smear frame + multi-ghost limb, hard freeze on reaction
  paletteAsLight: shadows deep cool blue, mid vivid warm amber, accent vivid warm red  (hex YOK)
  negativeLock  : NO Luffy/Zoro/Nami… (tam franchise firewall korundu)

deakins_naturalist (CINEMATIC_REAL):
  renderPhysics : Photoreal Deakins naturalist, DISCIPLINE OF RESTRAINT
  cameraEnvelope: Master Anamorphic primes 40/50/65mm, f/2.8 rare, contextual depth
  motionCadence : Locked-off preferred, slow 2-4s dolly, constant speed
  paletteAsLight: shadows near-black neutral gray, mid dusky warm umber  (hex YOK)
```

Kimlik jenerikleşmiyor: renderPhysics / cameraEnvelope / lightPhysics 46 world genelinde
**benzersiz** (test kilitli).

## Test sonucu

`npx tsc --noEmit` → 0 · `rtk proxy npx vitest run` → **1890 geçti / 0 kaldı (60 dosya)** ·
`npm run build` → OK (MACRO 1'de doğrulandı; tip yüzeyi değişmedi, MACRO 3'te tekrar koşulacak).

## Açık risk / dış bağımlılık

Yok. Bu, veri/derleme katmanı — real-frame gerektirmez. Frame-kalite hükmü MACRO 8'de Mami'ye
ait. WorldPacket'in brief'e taşınması ve ajana ulaşması MACRO 3'te bağlanacak.
