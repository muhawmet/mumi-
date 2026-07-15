# MAMILAS 3D Tableau V4 — "Canlı Altın-Saat" (Vivid Golden Hour, World-Adaptive)

> Kaynak: Fable yaratıcı direktör spec'i (2026-07-11, Mami "çok canlı + zeldamsı + adaptif, Fable özgür" yönü).
> Uygulama: Opus, adım-adım, her adım PNG screenshot ile doğrulanır. Karar pipeline'ı + slot sistemi + sunRef + CAMERA_POSES DOKUNULMAZ.

**Creative thesis.** Demo-f bir Turner *alacakaranlığı*: gökyüzünün %60'ı umber-siyah, fog `#1a1309`, deniz `#1d1206` — o yüzden mat. BotW altın-saati tersi fizik: **pus'un kendisi ışıktır**. Serin cerulean zenit × erimiş altın ufuk (sıcak/serin komplement = canlılık), objeleri parlak-kreme yıkayan pus (aerial perspective), neredeyse-beyaz güneş, altın parıltıyı patlatan teal deniz. Demo-f'in painterly stamp tekniği + kompozisyonu (güneşe kare-nehri, glitter yolu, kuşlar) KALIR ama value yapısı "gece iniyor"dan "dünya parlıyor"a döner. Tek yasa her şeyi (world-adaptivity dahil) sürer: **"Pus ışıktır, asla karanlık değil"** — noir dünyada da Ghibli'de de geçerli; 39 paleti *tek canlı dünya* hissettiren budur.

## 1. Vivid Default (world seçili değil)

### 1.1 Sky — `makeSkyTexture(p: ScenePalette)` (1024×512 canvas, dome [60,48,32] BackSide, slot 'backdrop-sky' hâlâ override)
Gradient stops (default): 0.00 `#2e5f7a` zenit dusty-cerulean · 0.20 `#4b7d92` · 0.38 `#8fae9e` cool→warm pivot · 0.52 `#d8b877` · 0.62 `#f2c168` · 0.675 `#ffd98c` · 0.700 `#ffe7ad` ufuk-glow · 0.720 `#e89a4e` molten · 0.82 `#7a5a44` · 1.00 `#3a3a44`.
Güneş glow baked (screen-blend, sun equirect pos, SUN_POS [6.2,3.4,-30]): `rgba(255,250,235,.95)`@.03w → `rgba(255,224,150,.85)`@.09w → `rgba(255,180,90,.55)`@.22w → `rgba(240,140,60,.35)`@.45w.
Bulutlar LIT (en büyük canlılık flip): demo-f `stamp()` 5 band (~120/band). Gövde `rgba(120,138,160,.04–.09)` mavi-gri (umber DEĞİL). Lit alt-yüz (lit>.12): `rgba(255,200–230,130–170,.05–.13·lit)`. Bulut TEPE (yeni, %40, y-6px): `rgba(255,246,230,.04–.08)` krem cap. Cirrus `rgba(255,228,185,.03–.06)`; zenit komplement `rgba(150,180,205,.03–.05)`. **Demo-f'in "long dark streaks"i SİL** (dusk imzası). Fine canvas-grain pass KALIR (overlay .045; full-screen post DEĞİL — Noise dersi geçerli).

### 1.2 Atmosphere/depth — fog = aerial perspective motoru (SceneCanvas.tsx)
fog color default **`#eec488`** (luminous altın pus L≈.68); clearColor == fog HEP. **near 10, far 52** (14/34'tü). Kamera z≈13-16 + deniz 240×240 → deniz uzakta parlak pusa erir, uzak çerçeveler (z-18,-23) kremleşir (bedava aerial perspective). Fog runtime-lerp (AtmosphereRig §2.4).
**Uzak tepeler (yeni geometri, BotW silüet)**: 3 ridge plane, alpha-map boyalı silüet (canvas hills(): 16-seg sine ridgeline 512×128), fog=true, güneşin SOLUNDA (sun/glitter/frame'i kesmez): A 60×6 @[-14,1.4,-26] `ridgeNear`(#4a6152) · B 80×7 @[-8,1.8,-34] mix(#6f8272) · C 100×8 @[2,2.0,-44] `ridgeFar`(#a8a98e). Peaks ≤ y2.6 (frame river 2.9-3.4 altında).

### 1.3 Sun — canlı, neredeyse-beyaz, nefes alan
sunRef occluder KALIR (mesh circle→setSun). Disk color `#fff2d6` (hotter, GodRays enerjisi), radius 1.6, scale-pulse kalır. Glow sprite'ları BEYAZ bake et (`rgba(255,255,255,1)`→transparent), `material.color` ile tint (world-lerp texture regen'siz): core `sunCore`(#fff4dc,s10,op.95), mid `sunHalo`(#ffc476,s30,op.6), outer mix(sunHalo,accent)(#ff9e52,s80,op.30). **Rayburst sprite** (demo-f rayburstTexture() port, 6-spoke feathered fan 1024px): additive @sun, scale90, op.30, fog=false, `rotation.z=sin(t·.05)·.04`. GodRays: weight .5→.6, exposure .5→.55, density .94, samples 50.

### 1.4 Sea — teal su + canlı altın yol
floor-disc slot override KALIR (#fff textured). Placeholder: base `seaDeep`(#26505c derin teal — altını ateşleyen serin komplement; #1d1206'ydı), rough .85 metal .1. **Boyalı glitter yolu** (tek reflection yerine): 2. plane 22×90 flat, ufuktan kameraya güneş altında (x=SUN_POS[0]·.75), additive, depthWrite false, canvas ~170 yatay glitter stroke (demo-f port, beyaz çiz→`seaGlitter` tint), wrapT Repeat. + 1 soft reflection-column sprite (op.30, `sunHalo`).

### 1.5 Particles/life
Sparkles 2 layer: near(count70,size2.6,scale[20,10,18],speed.18,op.5) + far(140,1.4,[40,16,40],.1,.35) color `sparkle`(#ffe2a0). **Kuşlar** (yeni, 5 gull sprite 64px, 2 quad stroke). **Light shafts** (yeni, 3 additive wedge plane sun'dan, `sunHalo` tint, op .10/.14/.08).

### 1.6 Color grading — canlılık push (PostFX.tsx)
ACESFilmic tam o sıcak-doygun bandı desature ediyor. `gl.toneMappingExposure=1.12` (SceneCanvas onCreated). `<HueSaturation saturation={0.14}/>` + `<BrightnessContrast contrast={0.05}/>` (Bloom sonrası, CA öncesi). `LOOK.grade={saturation:.14,contrast:.05,exposure:1.12}`. Bloom: int .42→.62, thresh .7→.58, smooth .22→.3. Vignette: darkness .66→.42, offset .32→.3. DOF+CA kalır. Grain config-only .06 (sky texture'a baked).

## 2. World-Adaptive

### 2.1 `src/scene/scenePalette.ts` (pure, unit-test)
```ts
export interface ScenePalette { skyTop; skyMid; horizonGlow; sunCore; sunHalo; fog; ambient; key; seaDeep; seaGlitter; frameHalo; sparkle; ridgeNear; ridgeFar; } // hepsi string hex
export const DEFAULT_SCENE_PALETTE: ScenePalette; // §1 hand-tuned
export function deriveScenePalette(lock:{shadow;mid;accent;highlight:string}): ScenePalette;
```
Deterministik HSL (mix=RGB lerp). bias-string PARSE ETME (bias prompt-side kalır; bu display-only, hex prompt'a girmez → Palette Translation Law dokunulmaz).
| output | rule |
|---|---|
| sunCore | mix(highlight,#fff,.35) clamp L≥.88 |
| sunHalo | mix(highlight,accent,.45) clamp L∈[.55,.78] |
| horizonGlow | mix(highlight,accent,.35) S×1.15(≤.9) clamp L∈[.60,.80] |
| skyTop | mix(shadow,mid,.40) clamp S∈[.10,.60] L∈[.24,.46] |
| skyMid | mix(mid,horizonGlow,.45) |
| fog | mix(mid,highlight,.50) clamp L∈[.55,.80] S≤.55 |
| ambient | mix(fog,#fff,.25) |
| key | mix(sunCore,accent,.25) |
| seaDeep | shadow clamp L∈[.10,.30] S≥.12* |
| seaGlitter | horizonGlow |
| frameHalo | mix(accent,highlight,.50) |
| sparkle | mix(highlight,accent,.30) |
| ridgeNear | mix(shadow,mid,.25) |
| ridgeFar | mix(ridgeNear,fog,.65) |

\* Monochrome exception: max input S < .05 (noir) → tüm S-floor'ları atla.

### 2.2 `useScenePalette()`: selectedWorldId→world.palette_lock ? deriveScenePalette : DEFAULT (useMemo).
### 2.3 Tüketim: sky texture (skyTop/skyMid/horizonGlow/sunCore/sunHalo + cloud lit=horizonGlow, shadow=mix(skyTop,#8a96a8,.5)) memoize per worldId. Glow sprite'lar BEYAZ bake→material.color tint. Lights: ambient→ambient, dir→key, sconce→frameHalo. fog+clear→fog. Sea→seaDeep. Ridge→ridgeNear/Far. Frame emissive→frameHalo. Brass/parchment/gold LOOK'ta STATİK (gilded frame = worldlar arası sabit müze kimliği, kasıtlı).
### 2.4 Transition eased 2-hız: continuous (fog/clear/3 light/tüm tint/sea) → AtmosphereRig THREE.Color damp `lerp(target,1-exp(-3·dt))` (~1.2s). Sky dome → 2-dome crossfade (yeni dome transparent op0→1 1.4s ease, sonra swap; radius 59.5 z-fight'sız). His: ışık *döner*, kesmez (~1.5s).

## 3. Life/motion (hepsi useFrame, ucuz). Kural: **buluttan hızlı hiçbir şey** (kuş kanadı hariç), amplitude ≤ 0.1 (UI önde, fısıldasın).
Sky drift rot.y+=.00055·dt·60 · Sun pulse+halo breath+rayburst sway · Light shafts async (period 7/11/13s) · Glitter map.offset.y-=.0008 + op sin · Frames mevcut bob/yaw + z-breath sin(t·.18)·.03 · Birds 5 sprite line (-22,7.5,-28)→(22,10,-32) 55s stagger i·4s, flap scale.y, op ramp, güneş diskini geçmez · Pollen 2 Sparkles.

## 4. lookConfig.test.ts re-derivation (11 it kalır rewrite, +7 yeni describe = 18+, sayı ARTAR)
Değişmeyen(6): pose completeness, cameraPoseFor fallback, FOV 30-36, dist>2, z>0, grain≤.25&CA≤.003.
Değişen(5):
- efekt: bloom≤.6→**≤.9** + grade.saturation≤.25, contrast≤.15, exposure∈[1.0,1.3]
- fog: near[12,16]/far[30,38]→**near[8,16]/far[40,60]/far-near≥30**
- clearColor/fog r≥g≥b → **"pus ışıktır": rel-luma≥.45 her ikisi + clearColor===fog**
- ışık: ambient[.3,.45]→**[.45,.85]** (lamp≥2·sconce, ≤2 sconce kalır)
- vignette: darkness≤.75→**[.25,.55]**, offset≥.25
Yeni describe `deriveScenePalette` (scenePalette.test.ts, 39 GERÇEK palette_lock üstünde): 1) L(fog)∈[.55,.80] 2) L(sunCore)≥.85 3) L(seaDeep)∈[.06,.35] 4) S(horizonGlow)≥min(.25,maxInputS) 5) noir_high_contrast→S≤.02 6) one_piece skyTop b>r; ghibli fog r≥b 7) no-world→DEFAULT.

## 5. Build order (her adım: implement → gate → PNG screenshot ?scene=force → doğrula → sonraki)
1. **Palette engine (pure, görsel risk yok)**: scenePalette.ts + test; lookConfig değerleri + lookConfig.test rewrite §4. Gate yeşil.
2. **Vivid sky + atmosphere**: makeSkyTexture(palette), ridge planes, SceneCanvas fog/clear/exposure. Screenshot dashboard (money shot).
3. **Sun + sea + grading**: white-baked tinted sprites, #fff2d6 occluder, rayburst, glitter-road, seaDeep teal, HueSaturation/BrightnessContrast + GodRays retune. Screenshot 6 poz.
4. **Adaptive wiring**: useScenePalette, AtmosphereRig, 2-dome crossfade, tint refs. Screenshot matrix: default·ghibli·one_piece·kurzgesagt·noir·sports.
5. **Life**: birds, shafts, drift, shimmer, dual pollen. Screenshot 3s aralık pair.
6. **Final gate + checkpoint.**
Do-not-touch: useSlotTexture + tüm slot fallback, WorldHeroFrame store/cover, sunRef occluder, CAMERA_POSES, CameraRig, engine/prompt pipeline (scenePalette render-only; hex prompt'a girmez).
