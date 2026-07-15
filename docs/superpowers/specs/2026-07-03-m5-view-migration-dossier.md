<!-- M5 araştırma dosyası — filo ajanı çıktısı (2026-07-03). Kaynak: CanvasPreview → drei <View> migrasyon keşfi. M5 planı yazılırken bu dosya okunacak. -->

I now have a complete picture. Here is the M5 architecture dossier.

---

# M5 Architecture Dossier — Migrating the Hero Preview from 2D Canvas to R3F `<View>`

## Executive summary

The MAMILAS preview engine is a **palette-driven, pixel-quantized HTML5 Canvas system** with three tiers of scene selection (per-ref → per-world → per-category+motif). It renders into a tiny 64×40 offscreen buffer, snaps every pixel to a 6-color palette, and upscales with `imageSmoothingEnabled=false` for a deliberate NES crunch. There are **~114 distinct paintable scenes** (73 REF_SCENES + 21 WORLD_SCENES + 5 category renderers + ~90 motif cases), all consuming the same 4-color contract `[shadow, mid, accent, highlight]`.

The R3F stack (`@react-three/fiber@9`, `drei@10`) already exists but is a **single fullscreen background diorama** (`SceneLayer` → `SceneCanvas` → one `<Canvas>`), mounted `position:fixed; zIndex:0; pointerEvents:none`. **No `<View>` is used anywhere yet.** The core integration problem: drei's `<View>` requires tracking DIVs *inside* the scrollable UI plus a `<Canvas eventSource>` that spans them — architecturally opposite to today's fixed, pointer-dead background canvas. M5 needs a **second, dedicated `<View>`-host Canvas** (not the diorama one) or a significant restructure of `SceneLayer`.

---

## 1. Scene inventory

### Selection precedence (the dispatch contract)
In `CanvasPreview.tsx` `draw()` (lines 1324–1338), scene selection is strictly ordered:

```
refScene  = REF_SCENES[refId]          // 1st priority — dedicated per-reference scene
worldScene = WORLD_SCENES[worldId]      // 2nd — world visual grammar
dedicated = refScene ?? worldScene
if (dedicated) dedicated(pctx, 64, 40, t, safeColors)
else {
  render{Edu|Arcane|Anime|Verse|Real}(...)   // 3rd — category base layer
  renderMotif(..., previewType)               // 4th — motif overlay on top
}
```

Then **always**: quantize to palette (+ IP iconic colors for known worlds), upscale, `drawPixelGrid`.

### Tier A — Category base renderers (5, `CanvasPreview.tsx`)
`PreviewCategory = 'arcane' | 'verse' | 'edu' | 'anime' | 'real'`, resolved by `worldCategory()` (`core/preview.ts`).

| Category | Visual elements | 3D translation idea |
|---|---|---|
| `edu` | Warm radial bg glow; 5 floating clay orbs (radial gradients, orbiting); highlight sine streak | Soft-body spheres, `meshStandardMaterial` low metalness/high roughness, key light + AO — literally what `pixar3d` WORLD_SCENE already models in R3F |
| `arcane` | Deep vignette; painterly glow nucleus; 3 energy arcs; 100 ember particles rising | `Sparkles`/GPU points for embers; volumetric point light; dark fog (already in `LOOK.fog`) |
| `anime` | 24 radial speed lines; central energy burst; 3 horizontal cel bands | Radial line geometry or shader; emissive burst sprite; cel/toon material (`gradientMap`) |
| `verse` | Panel dividers; halftone dot field; diagonal action line; accent circle | Halftone via screen-space shader; extruded panel planes; the existing 2D CMYK offset is a post-effect |
| `real` | Letterbox bars; rule-of-thirds; anamorphic flare; horizontal lens streak | Letterbox = orthographic frame overlay; flare via `Lensflare`/bloom (PostFX already has Bloom+Vignette+CA) |

### Tier B — Motif overlays (~90 cases, `renderMotif` switch, `CanvasPreview.tsx` lines 292–1206)
Keyed by `previewType` (= `ref.preview` string). Each paints a lightweight signature on top of the category base. Representative clusters:

- **Weapon/energy**: `blade` (gradient slash), `spiral`, `aura` (concentric radial glows), `orb`/`pixar` (lit sphere + rim)
- **Sci-fi/tech**: `neon`/`cyberpunk`/`cyber` (grid + glow stripe with shadowBlur), `tech`, `mecha`, `lab`, `tactical`, `technature`
- **Cinematic/photo**: `cinema` (letterbox), `real`, `noir`, `car`/`auto`, `analog`/`verite` (film grain via per-pixel noise), `silhouette`, `persona`
- **Environment**: `openair`, `tabletop`, `gothic`/`gothicblue`, `desert`, `western`, `underworld`, `overgrown`, `wasteland`, `nordic`, `ship`, `voxel`, `dream`
- **Product**: `food`, `apple`, `nike` (swoosh bezier), `watch` (clock face + hand), `beauty`
- **Graphic/retro**: `graphic`, `pop`, `retro`, `deco`, `arch`, `halftone`/`doc` (grain), `pixel`/`pixelmountain` (NES landscape), `anthology`, `circle`, `icon`, `default`

**3D translation**: most motifs are *lighting/atmosphere signatures* (gradients, grain, vignette shifts) → map to PostFX param sets + one or two accent meshes rather than bespoke geometry per motif. Grain/halftone/noir/analog are already covered by the existing `PostFX` composer (`Noise`, `Vignette`, `ChromaticAberration`, `Bloom`).

### Tier C — WORLD_SCENES (21, `refScenes.ts` lines 275+)
Full painterly compositions keyed by `worldId`. These are the **richest 2D scenes and the highest-value M5 targets** because each already encodes a distinct 3D-able "set":

| Key | Visual elements | 3D translation |
|---|---|---|
| `pixar3d` | Curved stage, contact-occlusion floor, 2 lit soft orbs, specular rim, bounce-card reflection | **Near-1:1 with existing `DioramaStage`** — soft orbs + `receiveShadow` floor + rim light. Best first target. |
| `arcane` | Screen-blend albedo strokes, negative-space figure, architectural shadow, ember field, vignette | Painterly character bust mesh + emissive embers (`Sparkles`) + fog; matches `LOOK` gold/ink palette |
| `anime_cel` | Sky gradient, speed lines, hard-shadow-band cel silhouette, energy blade, exposure bands | Toon-shaded figure (`gradientMap`), emissive blade, radial speed-line geometry |
| `ghibli` | Watercolor wash bands (screen blend), layered hill silhouettes, 42 wind-blown grass blades | Layered translucent planes, instanced grass, soft directional light |
| `stopmotion` | **12fps time-quantized** armature puppet w/ ball joints, seeded grain, bokeh | Stop-motion cadence = clamp `useFrame` delta; armature = jointed meshes |
| `spiderverse` | CMYK registration offset, halftone dots, ink gutters, "KRAK!" impact text | Halftone/CA post shader (CA already in PostFX) + billboard text |
| `mappa_cinematic` | Heavy shadow mass, haze, single accent glow, urban silhouette, cursed-energy geometry | Dark fog + one emissive accent light + silhouette meshes |
| `bones_action`, `toei_adventure` | Clean-ink action figure / heroic silhouette + horizon + sun glow | Toon material + emissive sun sprite |
| IP worlds: `demon_slayer_taisho`, `one_piece_grand_line`, `solo_leveling_gate`, `jjk_cursed_domain`, `aot_wall_world`, `naruto_shinobi_world`, `bleach_soul_world` | Franchise environments (delegate to `renderDemonSlayerVFX`, `renderOnePieceVFX`, etc.) + pixel-plate characters | Later phase — these lean on `CharacterStage` pixel plates and IP iconic colors; hardest to translate |
| Edu: `kurzgesagt_edu`, `whiteboard_explainer`, `motion_design_flat`, `ukiyo_e_print`, `retro_anime_film` | Flat vector / print aesthetics | Flat-shaded / `MeshBasicMaterial`, orthographic camera |

### Tier D — REF_SCENES (73, `refScenes.ts` lines 1026+)
Per-reference scenes, highest priority. Named after references (`pixar_dimensional`, `soul`, `kurzgesagt_clarity`, `demon_slayer_breath`, `akira_neon_impact`, `makoto_shinkai_sky_light`, `villeneuve_scale_dread`, `kubrick_one_point`, etc.). Same palette contract. These are **variations on the WORLD_SCENE grammars** with reference-specific accents — translate *after* the world grammars are proven in 3D, since a 3D world "set" + material/light tweak can cover many refs (mirroring how the 2D code shares primitives like `softOrb`, `speedLines`, `blade`, `emberField`, `figureSilhouette`).

### Shared palette-adaptive primitives (`refScenes.ts` lines 50–143)
`fillBg`, `radialGlow`, `vignette`, `letterbox`, `speedLines`, `ribbon`, `emberField`, `dots`, `scanlines`, `blade`, `softOrb`, `figureSilhouette`, plus `mix`/`rgba`/`lum`/`seed`. **These are the real translation unit** — build a matching set of R3F "material/light presets" and most scenes fall out of composition.

### Props that drive scenes
`CanvasPreviewProps`: `colors: string[4]`, `category`, `previewType` (=`ref.preview`), `worldId`, `refId` (wins if it has a REF_SCENE), `variant: 'default'|'hero'|'rail'`, `evidenceLabel`.
- `variant` drives **overlay chrome only**, not the paint: `showPlateCharacter = hero|rail`, `plateWidth/Height` (hero 238×228, rail 156×168), `textureOpacity`, and the evidence-label position. The canvas paint is variant-independent.
- IP character color preservation: `IP_ICONIC[worldId]` extends the quantization palette (lines 1214–1225).

---

## 2. Consumer map — which usage is the M5 hero target

| Consumer | File | Variant | Container / sizing | Notes |
|---|---|---|---|---|
| **RecipeStep world-detail preview** | `pages/Recipe/RecipeStep.tsx:206` | **`hero`** | `<div style={{height:180, position:'relative', borderRadius:8, overflow:'hidden'}}>` full-width of `.recipe-world-detail` grid cell | **← M5 FIRST TARGET.** The only `variant="hero"` consumer. Fixed 180px tall, static in the scrollable main column. Colors from `paletteColors(selectedPalette, previewWorld)`. |
| PreviewStage (right rail monitor) | `components/PreviewStage.tsx:133` | `rail` | `<div style={{width:'100%', height:210, overflow:'hidden'}}>` inside sticky `.ml-right-rail` (340px, `overflowY:auto`) | Rich overlay chrome (badges, arc chip, 4-color bridge, 2×2 info grid). Second phase. |
| RecipeThumb (storyboard/timeline) | `components/RecipeThumb.tsx:37` | `default` | `size` prop or 100%; used at 60px (ScenesStep), radius 20 & 14 (TimelineStep) | Many small instances — a **View-index stress case**, do last. |
| AppLayout right rail | mounts `PreviewStage` | — | sticky aside, `zIndex:2` | Host location for the rail variant. |

**Hero container is ideal for a first `<View>`**: single instance, fixed 180×(width) box, `position:relative; overflow:hidden`, lives in a normally-scrolling column. A tracking div here is textbook drei `<View>`.

---

## 3. drei `<View>` requirements vs. current setup — the concrete integration problem

### Current setup (all in `src/scene/`)
- `SceneLayer.tsx`: `position:fixed; inset:0; zIndex:0; pointerEvents:none`, lazy-loads one `SceneCanvas`. Gated by `resolveSceneMode(search)` (`?scene=on/off/force`) and software-renderer detection — **3D is optional; 2D is always the source of truth** (spec: "Final Brief asla 3D'ye rehin olmaz").
- `SceneCanvas.tsx`: a single `<Canvas>` with `camera`, `fog`, `CameraRig` (one camera authority damped per `currentStep`), `DioramaStage`, `PostFX`. No `eventSource`, no `frameloop` override, no `<View>`.

### What `<View>` needs
drei `<View>` (v10) works by: you place **tracking `<View track={ref}>` divs inside your normal DOM/scroll flow**, and a **single `<Canvas eventSource={rootRef} frameloop="always">` with a `<View.Port />`** renders each view into the scissor rectangle of its tracking div (per-view camera + scissor + viewport). The Canvas itself is typically `position:fixed; inset:0; pointerEvents:none; zIndex:1` and spans the whole document; the *tracking divs* carry layout and (optionally) pointer events.

### The concrete conflicts
1. **Pointer/event tracking.** `<View>` requires `<Canvas eventSource>` pointing at a DOM root that contains the tracking divs so raycasting maps to the right view. Today's Canvas has **no `eventSource` and `pointerEvents:none`**. The hero tracking div lives in `.recipe-world-detail` inside `.ml-main` (`overflowY:auto`) — a *different scroll container* from the fixed canvas. `<View>` reads `getBoundingClientRect()` of the track div each frame, so scroll works, but events must be wired to the scroll root.
2. **Scroll tracking across nested scrollers.** The hero sits in `.ml-main` (own scroll) and the rail variant in `.ml-right-rail` (own scroll), both under a fixed shell. `<View>` handles this via per-frame rect reads, but the host Canvas must cover the viewport and update on scroll — fine as long as the Canvas is fixed/full-viewport, which **conflicts with `zIndex:0` behind the UI**. Views must render **above** their tracking div's background but **below/around** the overlay chrome (badges, evidence label). Needs `zIndex` restacking.
3. **Z-ordering.** SceneLayer is `zIndex:0`, shell content is `zIndex:1–2`. A `<View>` host must be `zIndex:1+` and the tracking divs given a transparent background so the WebGL shows through, while overlay chrome (PreviewStage's absolutely-positioned badges) must sit *above* the view. Today's single background diorama can't host foreground views.
4. **One diorama camera vs. per-view cameras.** `CameraRig` assumes **one camera** driven by `currentStep`. Each `<View>` needs its **own camera** (a mini "hero set" camera framing the scene), independent of the diorama's step-based camera. You cannot reuse `CameraRig` for views.
5. **View index / scissor limits.** RecipeThumb spawns *many* small instances (60px thumbs, timeline monitors). Each is a scissored viewport = a draw pass. Dozens of simultaneous views on one Canvas is a real perf ceiling → thumbs should stay 2D or be virtualized. Start with the **single hero view**.
6. **PostFX conflict.** The current `<EffectComposer>` in `PostFX` is full-frame. Per-`View` post-processing needs the composer *inside* each `<View>` (drei supports this in v10) or a shared screen-space pass — the existing global composer will apply to the whole canvas, not per-view.
7. **Optional-3D gate must still hold.** `SceneLayer` returns `null` on no-WebGL/software renderer. The hero `<View>` path must **fall back to `<CanvasPreview variant="hero">`** when 3D is off, so the tracking div needs a 2D sibling that shows when the view host is unmounted.

### What must change in `SceneLayer` / scene stack
- **Add a second host** (do NOT retrofit the fixed background diorama): a `ViewCanvasHost` = `<Canvas eventSource={shellRootRef} frameloop="always" style={{position:'fixed', inset:0, zIndex:1, pointerEvents:'none'}}><View.Port/></Canvas>`, mounted once at shell level, gated by the same `resolveSceneMode` check.
- Export a **`<HeroView track={ref}>`** component that renders a per-view `<PerspectiveCamera makeDefault>`, its own lights, the world/ref scene mesh graph, and optional per-view `<EffectComposer>`.
- The hero consumer renders: a `ref`'d tracking div (transparent bg) + a `<CanvasPreview variant="hero">` fallback shown only when `sceneMode !== 'on'` or on context loss.
- Keep `CameraRig`/`DioramaStage`/`PostFX` untouched for the ambient background; views are a parallel system.
- Wire `eventSource` to the shell root and set `pointerEvents:'auto'` on individual tracking divs only if interaction is needed (hero is currently non-interactive → can stay `none`).

---

## 4. Palette flow — the 4-color contract for 3D materials

Two convergent producers, both yielding a 4-element hex array in **`[shadow, mid, accent, highlight]`** order (documented at `refScenes.ts:9-11` as `c[0]=primary, c[1]=accent, c[2]=dark/ground, c[3]=light/highlight`):

**A. `paletteColors(palette?, world?)` — `core/pure.ts:269`** (used by RecipeStep hero via `selectedColors`):
```
if palette.colors[]        → palette.colors
elif palette.hex           → [hex.shadow, hex.mid, hex.accent, hex.highlight]
elif world.palette_lock    → [lock.shadow, lock.mid, lock.accent, lock.highlight]
else                       → world.colors || world.palette || []
```

**B. `buildPreviewState().colors` — `core/preview.ts:20`** (used by PreviewStage/RecipeThumb): same shape from `pal.hex.{shadow,mid,accent,highlight}` or `pal.colors`, padded to 4 with `#2b2f3a`.

**Consumption inside CanvasPreview**: `normalizeCanvasColors` validates each as `#rrggbb` (fallback `['#253044','#7aa2ff','#0a0c14','#f7c948']`), then `hexToRgbTuple` builds the quantization palette: **4 palette colors + `[8,8,12]` (black) + `[240,238,232]` (white) + `IP_ICONIC[worldId]`**.

**For 3D materials, honor the same contract:**
- `colors[0]` → dominant/base material albedo (shadow/primary)
- `colors[1]` → accent — emissive lights, rim, key accent mesh
- `colors[2]` → ground/floor/fog color (the `isDark` branch already treats `colors[2]` as background: `luminance(safeColors[2]) < 0.3`)
- `colors[3]` → highlight — specular/rim/light tint
- Feed the same array into a `<HeroView>` prop; map to `meshStandardMaterial.color`, `emissive`, light colors, and `<fog>`/clear color, so palette changes re-skin the 3D scene live exactly as they re-skin the 2D canvas.

Note `LOOK.palette` (gold/amber/paper/ink/floor) is a **separate fixed DE-brand palette** for the ambient diorama; hero views should use the **dynamic 4-color contract**, not `LOOK.palette`, to stay palette-reactive.

---

## 5. Migration order recommendation

Translate **WORLD_SCENE grammars** first (each is a reusable 3D "set" that many refs inherit), starting with the ones closest to existing R3F primitives:

1. **`pixar3d`** — near-identical to existing `DioramaStage` (soft lit orbs, occlusion floor, rim). Proves the `<View>` + palette-material pipeline with lowest risk. **Wire it into the RecipeStep hero (variant="hero") first.**
2. **`arcane`** — painterly bust + `Sparkles` embers + fog; reuses `LOOK.fog` and matches the DE dark aesthetic; validates emissive/particle + palette accents.
3. **`anime_cel`** — introduces toon/cel material (`gradientMap`), speed-line geometry, emissive blade; proves the stylized (non-PBR) material path.
4. **`ghibli`** — layered translucent planes + instanced grass; proves depth-sorted transparency + wind animation.
5. **`mappa_cinematic`** (or `real` category set) — heavy fog + single accent light + silhouettes; proves the per-view `EffectComposer` (bloom/vignette) path.

Defer: IP-world scenes (`demon_slayer_taisho`, `one_piece_grand_line`, etc.) — they depend on pixel `CharacterStage` plates and `IP_ICONIC`; and all 73 REF_SCENES — cover them as material/light variants on the 5 proven world sets. Keep RecipeThumb thumbnails on 2D (View-count perf) until a virtualization strategy exists.

Each 3D world set should ship behind a fallback: if a world/ref has no 3D set yet, or 3D is gated off, the hero div renders `<CanvasPreview variant="hero">` as today.

---

## 6. Open risks

- **View perf ceiling**: dozens of thumbnails (`RecipeThumb` at 60px, timeline monitors) as simultaneous scissored views will tank framerate. Keep thumbs 2D; hero-only for M5.
- **Optional-3D invariant**: `SceneLayer` returns `null` on software/no-WebGL renderers and Final Brief must never depend on 3D. Every `<View>` consumer needs a guaranteed 2D fallback path (context-loss handler already exists in `SceneCanvas` → propagate to views).
- **eventSource / z-order regression**: introducing a `zIndex:1`, viewport-spanning View-host Canvas over `pointerEvents:none` risks intercepting clicks on the rail/main UI; must keep host `pointerEvents:none` and only opt-in tracking divs.
- **PostFX scope**: global `EffectComposer` vs. per-view — mixing both can double-apply bloom/CA. Decide per-view composer vs. shared, and keep the ambient diorama's composer isolated.
- **Palette fidelity**: 2D path quantizes to 6 colors + IP iconic hues for the crunch look. 3D is smooth-shaded — the crunch/pixel identity and IP character-color preservation (`IP_ICONIC`) won't carry over unless deliberately reproduced (e.g., a pixelation/posterize post-pass), which is a **design decision**, not just a port.
- **Two palette producers**: `paletteColors()` (hero) and `buildPreviewState().colors` (rail/thumb) can diverge on edge cases (empty palette padding differs: `#2b2f3a` vs. world fallback). Feed 3D from one normalized source to avoid hero/rail color drift.
- **`variant` semantics**: today `hero` only changes overlay chrome + plate size, not paint. In 3D, "hero" should mean a richer camera/lighting framing — that's new behavior to define, not a direct port.
- **CharacterStage plates**: pixel-art `mode="plate"` characters (238×228 in hero) are a separate 2D overlay on top of the canvas. In a 3D hero they'd either remain a 2D DOM overlay or need 3D character stand-ins — unresolved.

**Key files**: `/Users/Muhammet/Desktop/mamilas-modern/src/components/CanvasPreview.tsx` (dispatch + quantize pipeline, lines 1278–1379), `/src/components/refScenes.ts` (WORLD_SCENES + REF_SCENES + primitives), `/src/components/CharacterStage.tsx` (pixel plates), `/src/components/PreviewStage.tsx` (rail consumer), `/src/pages/Recipe/RecipeStep.tsx:206` (hero consumer), `/src/core/preview.ts` (category + colors), `/src/core/pure.ts:269` (`paletteColors`), `/src/scene/SceneLayer.tsx`, `/src/scene/SceneCanvas.tsx`, `/src/scene/DioramaStage.tsx`, `/src/scene/CameraRig.tsx`, `/src/scene/PostFX.tsx`, `/src/scene/lookConfig.ts`, `/src/components/Layout/AppLayout.tsx` (mount points).