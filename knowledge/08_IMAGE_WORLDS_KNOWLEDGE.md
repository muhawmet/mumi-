# IMAGE WORLDS V2 — Recipe Reference

Readable companion for `WORLD_LIBRARY_V2.md`. This file is not the source of truth;
it explains the 2026-07-01 V2 world, material, and palette library for IMAGE
agents. Use the recipe protocol in `agents/GLOBAL_BRAIN.md` first, then read this
file when a world, material, or palette ID needs human-readable interpretation.

The machine-readable recipe fields are:

- `world_id`: selects one of the 30 worlds in `SURGERY_DATA.json`. Some newer
  worlds are not yet narrated in this companion file; read their full `render_law` /
  `line_grammar` / `lens_grammar` / `light_law` / `motion_cadence` /
  `negative_lock` / `example_injection` directly from `SURGERY_DATA.json` — it
  is the source of truth regardless of what this file covers.
- `material_id`: also includes 8 new `ip_style` materials added 2026-07-01
  (`one_piece`, `naruto`, `demon_slayer`, `solo_leveling`, `arcane_paint`,
  `jjk_ink_style`, `dragon_ball`, `attack_titan` — combinable with ANY world,
  not tied to a specific one). See `agents/GLOBAL_BRAIN.md` §18.
- `material_id`: must be listed in the selected world's compatible materials.
- `palette_override`: optional palette ID; if null, use the world native palette.
- `negative_lock`: absolute leak ban. These names and signatures must not appear
  in generated prompts or images.

## World Rules

Every world carries six production laws:

- **Render law:** the main visual paragraph for the prompt.
- **Line grammar:** how silhouettes, outlines, and edges behave.
- **Lens grammar:** camera, aperture, grain, aspect, and focus behavior.
- **Light law:** motivated lighting and shadow behavior.
- **Palette lock:** exact HEX values and palette bias.
- **Motion cadence:** how the frame should want to move in the motion pass.

Material is a substance layer inside the world. It never turns the world into a
different world.

---

## 1. `pixar_3d_edu` — Pixar 3D Education Tier

**Group:** `ANIMATION_EDU`

Feature-animation 3D education world in the lineage of *Toy Story 4*, *Onward*,
and *Luca*. Characters use full subsurface skin shading, wet dual-point eye
speculars, warm accurate skin midtones, rounded silhouettes, and visible fillet
bevels on hard edges. Props are slightly overscaled for child-safe readability.
Materials must feel tactile: wood has grain and satin varnish, fabric shows weave,
metal has anisotropic brush, and ambient occlusion is painted rather than hard.

**Line grammar:** no outlines, no cel steps. Silhouette comes from light rims and
soft shadow-side edges.

**Lens and light:** 35-50mm equivalent; f/4 for mid-shots, f/2.8 for character
close-ups. Vision3 250D neutral color science with light 16mm-style grain. Use a
single motivated key, complementary bounce fill at about 30%, accent rim light,
and soft painted AO.

**Palette lock:** shadow `#3D2817`, mid `#F4C7A6`, accent `#F28C4A`, highlight
`#FFF6DC`. Bias is warm honey with cool blue-violet complement only.

**Motion cadence:** anticipation, action, reaction; 12-18 frame emotional holds,
eye darts before action, and squash-stretch on prop pickup.

**Compatible materials:** `none`, `paper_craft_popup`, `clay_hamur`,
`chalkboard_kara_tahta`, `wood_tactile`.

**Never allow:** clay/plasticine character skin, cel shading, cartoon outlines,
anime eyes, named Pixar or Disney-adjacent characters, named Pixar locations,
English signage, desaturated grade, or teal-orange Hollywood grading.

---

## 2. `paper_craft_popup` — Paper Craft Pop-Up

**Group:** `ANIMATION_EDU`

Photoreal miniature paper-craft diorama world at macro scale, staged like a
pop-up storybook page opened toward the camera. Every visible element is die-cut
cardstock with tab-and-slot mechanisms, hinge folds, stacked paper depth, paper
grain, cut-edge fiber tear, page flex, and warm fold shadows. Physical depth is
real: 2-4 paper layers standing perpendicular to the page, never a painted
illusion.

**Line grammar:** no drawn outlines. Silhouettes are crisp die-cut paper edges;
interior detail is layered paper collage, not printed line art.

**Lens and light:** 50-100mm macro, f/2.8-f/4 shallow depth of field, tungsten
3200K key, cool 5600K rim behind paper edges, mild 16mm grain, and optional slight
50mm macro barrel distortion.

**Palette lock:** shadow `#8B6F47`, mid `#F1E4C6`, accent `#D9782E`, highlight
`#FFF8E7`. Bias is cream, kraft, terracotta, and construction-paper accents.

**Motion cadence:** slow visible mechanisms: tab slides, flap folds, pop-up rises,
then rests for 1.5-2 seconds.

**Compatible materials:** `none` only.

**Never allow:** CGI characters, Pixar bevel/skin behavior, printed line art,
fabric, clay, wood, plastic, non-paper props, printed Turkish labels, or named
children's book characters.

---

## 3. `ghibli_hayao` — Studio Ghibli / Hayao Miyazaki

**Group:** `ANIMATION_PAINTERLY`

Traditional 2D animation frame in the lineage of *My Neighbor Totoro*, *Kiki's
Delivery Service*, and *The Wind Rises*. Character drawings use confident
hand-inked 2-3px tapered dark-warm-brown line, with flat cel fills in 2-3 values.
Backgrounds are watercolor and gouache with brush marks, wet-into-wet bleed,
paper texture, clustered foliage masses, sky washes, and dust motes in light
shafts. The character must harmonize with the painted world rather than sitting
on top of it.

**Line grammar:** tapered hand-inked line in `#3A2418`, never pure black; minimal
interior lines.

**Lens and light:** flat 2D composition, deep focus, no lens flare, subtle paper
grain. Natural motivated light, warm ambient shadow reflection, and hair/grass rim
light.

**Palette lock:** shadow `#3A2418`, mid `#B8D4A8`, accent `#E85D3C`, highlight
`#FFF4C4`. Bias is sage green, honey cream, terracotta red, and sky cobalt.

**Motion cadence:** 8-frame cycles for wind in grass, hair, and cloth; 24-frame
breath cycles; 12fps deliberate walking; 24-36 frame emotional holds.

**Compatible materials:** `none`, `storybook_illustration`, `paper_craft_popup`.

**Never allow:** named Ghibli characters, named Ghibli locations or vehicles, CGI
shading, 3D bevels, cel-shaded 3D, neon, teal-orange grading, or non-Turkish
labels.

---

## 4. `arcane_fortiche` — Arcane / Fortiche Painterly-3D Hybrid

**Group:** `ANIMATION_STYLIZED`

Painterly 3D hybrid world in the *Arcane* / Fortiche surface-shading lineage.
3D forms are dressed with visible oil-paint texture; silhouette edges show brush
stroke, highlights are hand-painted rather than physically exact, and shadow-side
edges push to deep violet rather than black. Skin uses painted blush and pore
work, hair reads as sculpted painted volume, fabric weave is painted, metals use
thin-film rainbow spec, and backgrounds compress into painterly matte.

**Line grammar:** no hard cel outline. Silhouette is a painted edge with emotional
weight variation; interior marks are painted shadow steps.

**Lens and light:** 35-50mm, f/2.8 close-up, f/4 mid, f/5.6 wide. Vision3 500T
curve, highlight halation, subtle high-contrast chromatic aberration, 35mm grain.
Use one motivated key, complementary bounce hue, accent-color rim, and no hard
black AO.

**Palette lock:** shadow `#1B0B2E`, mid `#6BC5D2`, accent `#E85D75`, highlight
`#FFF3C4`. Bias is deep violet, magenta-pink, teal, warm highlight; no earth
green, primary red, pure black, or orange except a single flame accent.

**Motion cadence:** deliberate 24fps, painted 2-3 frame smears at peak action,
slow-in slow-out weight, and 1.5-2 second emotional holds.

**Compatible materials:** `none`, `notebook_ink`.

**Never allow:** named Arcane characters, Piltover/Zaun/Undercity/Academy/Last
Drop references, Hextech crystals, shimmer, cel outline, hard black, earth green,
pure orange, sepia, or non-Turkish labels.

---

## 5. `spiderverse_sony` — Spider-Verse / Sony Pictures Animation

**Group:** `ANIMATION_STYLIZED`

Sony Pictures Animation Spider-Verse hybrid. 3D-modeled forms are rendered with
Ben-Day halftone dot texture on flat color fills; dot size scales with distance.
Hero animation runs at 12fps on twos while camera/background move at 24fps.
High-contrast edges carry cyan-magenta chromatic split, and the frame may include
Turkish onomatopoeia, speed lines, diagonal panel breaks, ink smudge, print bleed,
and 1-2px color-layer misregistration.

**Line grammar:** bold black 3-6px brush-textured line, thicker on shadow side;
line layer may sit slightly offset from color fill.

**Lens and light:** 35-50mm as comic panel, f/2.8-f/4, visible 2-4px
cyan-magenta split, no lens flare except drawn starburst. Lighting is bold,
hard-stepped, graphic, and rim-shaped.

**Palette lock:** shadow `#1A0F3D`, mid `#E63946`, accent `#00E5FF`, highlight
`#FFFF3D`. Bias is saturated red, cyan, yellow, deep violet; neon allowed.

**Motion cadence:** hero on 12fps twos, camera/background 24fps, speed lines as
graphic streaks, freeze-frame at peak beat.

**Compatible materials:** `none`, `notebook_ink`.

**Never allow:** named Spider-Verse characters, Spider-Man suit patterns, spider
emblems, web-shooters, recognizable New York skyline landmarks, clean vector line,
earth tones, English onomatopoeia, or non-Turkish action words.

---

## 6. `jjk_mappa` — Jujutsu Kaisen / MAPPA

**Group:** `ANIMATION_DARK`

Contemporary MAPPA television-animation frame in the Jujutsu Kaisen production
lineage. The image is underexposed by 1-1.5 stops, backgrounds are desaturated,
shadows dominate, and subjects are often rim-lit instead of fill-lit. Cel color
uses 3-value steps with shadow crushed toward blue-black. At peak action, the
drawing can dissolve for 1-2 frames into brush-ink smear before resolving.
Energy is abstract fractal black smoke with faint teal-cyan core glow, never a
named franchise icon.

**Line grammar:** confident 2-3px black line at rest, high interior detail, and
ink-smear brush motion at peak.

**Lens and light:** flat 2D with simulated 24-35mm action width or 50mm drama
portrait; Dutch tilt allowed. Rim-dominant light, often with no key, cold
blue-black shadow, and warm or teal rim.

**Palette lock:** shadow `#0B111A`, mid `#3A4A5A`, accent `#4DD0E1`, highlight
`#F5E6C8`. Bias is cold blue-gray with one warm or cursed-teal accent.

**Motion cadence:** hold, 1-2 ink-smear peak frames, impact hold, 24fps camera,
12fps character, 8fps effects loop, and 2-3 second post-climax hold.

**Compatible materials:** `none`, `notebook_ink`.

**Never allow:** named JJK characters, Shibuya/Culling Game/Jujutsu High
references, Sukuna finger, Ryomen mouth marks, Gojo blindfold/six-eyes cues,
domain-expansion signatures, Jujutsu Tech uniform, warm dominant palettes, or
pastels.

---

## 7. `demon_slayer_ufotable` — Demon Slayer / Ufotable

**Group:** `ANIMATION_CEL_3D_HYBRID`

Ufotable-style animation frame in the Demon Slayer / Fate Zero production lineage:
2D cel characters with crisp linework and 3-value fill sit over 3D-modeled
backgrounds that are rendered and then painted over until luminous. The
environment carries volumetric god rays, particulate atmosphere, moisture, and
dew. Effects such as water, fire, light energy, or abstract slash force are a
separate high-detail layer that can overwhelm the cel figure in scale.

**Line grammar:** crisp uniform 2px black line on characters; effects get their
own brush-textured contour.

**Lens and light:** simulated 40-85mm, optional 2.35:1 letterbox, f/2.8-f/4 hero,
f/8 wide environment, bloom on light sources. Motivated key, volumetric rays,
warm rim, cool shadow, and self-lighting effects.

**Palette lock:** shadow `#1F2B3A`, mid `#7B8FA8`, accent `#FF6B35`, highlight
`#FFF0C4`. Bias is cool blue-slate shadow, warm fire amber or teal water accent,
and cream highlight.

**Motion cadence:** 24fps camera, 12fps character, 24fps effects with one-frame
peak smear, and 2-3 second hold after the signature move.

**Compatible materials:** `none`.

**Never allow:** named Demon Slayer characters, Taisho-era wilderness unless
asked, Mount Natagumo/Infinity Castle, checkered haori, Nichirin sword, hanafuda
earrings, named breathing-style signatures, or non-Turkish labels.

---

## 8. `one_piece_toei` — One Piece / Toei Bold-Cel

**Group:** `ANIMATION_BOLD_CEL`

Toei Animation One Piece production-frame world. Every character and prop has a
bold 3-5px pure-black outline, minimal interior linework, and two-value flat cel
fills. Color is poster-vibrant. Anatomy is rubber-elastic: joints stretch and
squash, eyes can enlarge in reaction, mouths can push beyond realistic silhouette,
and face symbols such as sweat drops or blush blocks are graphic. Backgrounds are
simple sky/ocean gradients unless environment detail is required.

**Line grammar:** uniform 3-5px pure black outline, no taper, silhouette-first,
minimal interior lines.

**Lens and light:** flat 2D, simulated 35mm neutral or 50mm portrait, fisheye for
wide comedy reaction, no lens flare. Lighting is simple hard 2-value cel light.

**Palette lock:** shadow `#1E3A8A`, mid `#FFC93C`, accent `#E63946`, highlight
`#FFF8E7`. Bias is marine blue, primary yellow, primary red, cream, and high
saturation.

**Motion cadence:** 12fps on twos, one-frame multi-ghost limb smears at action
peak, speed lines during motion, and 24-36 frame reaction freeze.

**Compatible materials:** `none`.

**Never allow:** named One Piece characters, Straw Hat crew signs, Jolly Roger,
named pirate flags, Grand Line/Alabasta/Water 7/Wano references, Devil Fruit
signatures, Gomu Gomu stretch, desaturated palette, realistic anatomy, or
non-Turkish labels.

---

## 9. `deakins_naturalist` — Roger Deakins Naturalist Real

**Group:** `CINEMATIC_REAL`

Photoreal cinematography in the Roger Deakins ASC/BSC lineage. Lighting must be
motivated by practical or natural sources visible or implied in frame: window
sun, tungsten lamp, sodium streetlight, fire. No invisible fill unless bounced
off a visible surface. Frames use negative space, single-subject isolation, small
figures against large environments, protected highlights, deep dynamic range, and
subtle organic ARRI Alexa 65 film curve.

**Line grammar:** none. Photoreal silhouette comes from light and natural edges.

**Lens and light:** Master Anamorphic 40/50/65mm, f/2.8-f/5.6, 2.39:1,
horizontal streak flare from practicals only, fine grain in shadows. One
motivated source, visible bounce only, 4:1 or 6:1 contrast, shadow side can fall
toward black.

**Palette lock:** shadow `#0A0A0A`, mid `#8B7355`, accent `#E85A2A`, highlight
`#F4E4C6`. Bias is natural umber, ochre, olive, sky-neutral, and one warm
practical accent.

**Motion cadence:** locked-off or slow deliberate dolly over 2-4 seconds; long
take feeling and rare cuts.

**Compatible materials:** `none`, `chalkboard_kara_tahta`, `notebook_ink`.

**Never allow:** named Deakins-shot characters or locations, 1917 trench, Blade
Runner LA/Vegas bar, handheld shake, fill-flash flat lighting, teal-orange excess,
neon, fluorescent green, oversaturated color, or non-Turkish signage.

---

## 10. `fincher_precision` — David Fincher Precision Real

**Group:** `CINEMATIC_REAL`

Photoreal cinematography in the David Fincher / Jeff Cronenweth / Erik
Messerschmidt lineage. Camera is locked-off or motorized-dolly smooth, never
handheld. Composition is geometric: symmetry, one-point perspective, exact thirds,
deep focus, precise prop placement, digital sharpness softened by FilmConvert
grain, practical lights composed in frame, and restrained teal-shadow/warm-highlight
grade with protected skin.

**Line grammar:** none. Photoreal sharpness and deep focus carry detail.

**Lens and light:** 35/40/50mm on RED or Alexa Mini, f/5.6-f/8, 1.85:1 or 2.00:1,
no flare unless practical. Use motivated practical plus one soft key and minimal
fill; monitor, phone, or desk lamp glow can drive the scene.

**Palette lock:** shadow `#1B3B4B`, mid `#8B7C6E`, accent `#F4C97A`, highlight
`#F0E6D2`. Bias is restrained teal shadow, warm highlight, and earth-neutral
midtone.

**Motion cadence:** locked-off or exact motorized dolly, slow 4-6 second reveals,
cuts on precise beat.

**Compatible materials:** `none`, `notebook_ink`.

**Never allow:** named Fincher characters or locations, Facebook office, Fight
Club basement, Zodiac newsroom, Mindhunter FBI office, handheld shake, shallow
bokeh dominance, warm-cozy grade, broad neon, or non-Turkish signage.

---

## 11. `wes_anderson_symmetric` — Wes Anderson Symmetric Real

**Group:** `CINEMATIC_REAL`

Photoreal cinematography in the Wes Anderson / Robert Yeoman lineage. The frame
uses rigid one-point perspective, dead-center vertical symmetry, precise prop
placement, deep focus, compressed flat layers, period-styled costumes, coordinated
pastels, legible hand-drawn Futura or Archer-style Turkish signage, and motivated
but even low-contrast light.

**Line grammar:** none. The frame reads graphic through symmetry and pastel
flatness.

**Lens and light:** 35-40mm, f/5.6-f/8, 1.37:1 Academy or 2.00:1 flat, no lens
flare, Kodak Vision3 250D pastel push. Key and fill match temperature, with a
soft 2:1 contrast ratio.

**Palette lock:** shadow `#8B9A7B`, mid `#F4C7A6`, accent `#E8817A`, highlight
`#FDF6E3`. Bias is coordinated mint, salmon, mustard, powder blue, and cream.

**Motion cadence:** locked-off, perpendicular dolly, snap-whip pans between
locked positions, and 3-5 second stillness.

**Compatible materials:** `none`, `paper_craft_popup`.

**Never allow:** named Wes Anderson characters or locations, copied Grand
Budapest/Isle of Dogs/New Penzance/Asteroid City signage patterns, handheld
shake, shallow bokeh, high contrast, saturated primary color, or non-Turkish
labels.

---

## 12. `chivo_naturalist_handheld` — Emmanuel Lubezki Documentary Naturalist

**Group:** `CINEMATIC_REAL`

Photoreal cinematography in the Emmanuel "Chivo" Lubezki AMC lineage. Natural
light only: sun, moon, fire, candle, or window. Golden hour and blue hour are the
default bias. Camera is handheld with intentional micro-drift and organic breath,
not shake and not stabilized-dead. Wide lenses include environment context, deep
focus keeps the world sharp, highlights bloom naturally, and shadows fall without
artificial fill.

**Line grammar:** none. Photoreal wide-angle edges may show organic distortion.

**Lens and light:** 14/16/21/35mm wide primes, f/5.6-f/8, 1.85:1 or 2.39:1,
35mm-organic grain, slight wide barrel distortion. Use natural sun key, sky bounce
fill, magic-hour long shadows, and no artificial fixture.

**Palette lock:** shadow `#2A1F14`, mid `#C89968`, accent `#F4A947`, highlight
`#FFE9B8`. Bias is golden earth warmth with cool blue for blue-hour scenes and
natural skin protection.

**Motion cadence:** handheld micro-drift with organic breath, long-take
aspiration, camera weaving through space and reframing naturally.

**Compatible materials:** `none`.

**Never allow:** named Lubezki-shot characters or locations, Revenant frontier
wilderness unless requested, Birdman theater, Children of Men London bus, handheld
shake, artificial light source, fill flash, neon, teal-orange excess, shallow
bokeh dominance, or non-Turkish labels.

---

## Material Library

Materials describe the teaching substance inside a compatible world. If a
selected material is not in the world's compatible list, stop and warn the user.

| ID | Name | Use |
|---|---|---|
| `none` | Materyal Yok — World Native | No extra teaching-material layer. Use the world's native render law for cinematic real work, brand work, and subjects that should exist naturally in the selected world. |
| `paper_craft_popup` | Paper Craft Pop-Up | Teaching subject is die-cut cardstock with tabs, folds, hinges, layered pop-up depth, paper grain, cut-edge fibers, and warm fold shadows. The selected world decides how that paper renders. |
| `clay_hamur` | Clay / Hamur | Teaching props are stop-motion plasticine with matte tone, fingerprints, tool marks, and slight deformation. Character skin still follows the world; only props become clay. |
| `chalkboard_kara_tahta` | Chalkboard / Kara Tahta | Teaching happens on a black or dark-green board, with real props on the tray or in front. Chalk marks follow the world's line grammar and carry chalk-dust particulate. |
| `wood_tactile` | Wood Toy — Tactile | Props are Montessori-style hand-turned maple or oak toys with satin varnish, visible grain, anisotropic highlight, real shadow, and jointed or sorted teaching objects. |
| `storybook_illustration` | Storybook Illustration | Teaching subject appears as children's book watercolor-and-ink illustration nested inside the world; if the world is Ghibli, the storybook can be the world. |
| `notebook_ink` | Notebook Ink | Teaching happens on a lined spiral notebook page with pen-and-ink drawings, nib-pressure bleed, paper warp, and occasional smudge. Ink line behavior follows the selected world. |

---

## Palette Library

If `palette_override` is null, use `native_world`. If an override is present, use
its HEX values but keep the selected world's render law intact.

| ID | Name | HEX | Bias |
|---|---|---|---|
| `native_world` | Native — World Default | Uses selected world's palette | Default. Do not override without a creative reason. |
| `pastel_soft` | Pastel Soft | shadow `#C7D2C7`, mid `#F6E1D3`, accent `#F4A6A6`, highlight `#FDFBF3` | Muted mint, peach, blush, cream; best for very young children's-book feeling; avoid neon, deep black, saturated primary. |
| `vibrant_edu` | Vibrant Education | shadow `#1D3557`, mid `#F4C430`, accent `#E63946`, highlight `#F1FAEE` | Bright cobalt, sunshine, tomato, off-white; high saturation but not neon; best for elementary lesson emphasis. |
| `deep_noir` | Deep Noir | shadow `#0A0A0A`, mid `#2B2B2B`, accent `#8B0000`, highlight `#C4C4C4` | Near-black, deep desaturated blood accent, silver highlight; best for precision real or blue-hour darkness. |
| `warm_autumn` | Warm Autumn | shadow `#4A2C1A`, mid `#C68B47`, accent `#D9451F`, highlight `#F5D28B` | Amber, burnt sienna, burgundy; best for story sequences and warm painterly worlds; avoid cool blue, neon, teal grade. |
| `cool_scientific` | Cool Scientific | shadow `#0D2137`, mid `#4A90A4`, accent `#4DD0E1`, highlight `#E8F4F8` | Cobalt, teal, cyan glow, near-white; best for science, math, and technology; avoid warm earth and saturated red-orange. |
| `earth_natural` | Earth Natural | shadow `#3D2817`, mid `#8B7355`, accent `#C89968`, highlight `#F4E4C6` | Umber, ochre, sand, cream; best for Deakins, Ghibli, and Chivo golden-hour directions; avoid neon and saturated primary. |
| `high_contrast_bold` | High Contrast Bold | shadow `#000000`, mid `#E63946`, accent `#FFC93C`, highlight `#F1FAEE` | Pure black, primary red, primary yellow, off-white; best for One Piece native or Spider-Verse poster mode; avoid pastel and muted grades. |
| `desaturated_cinematic` | Desaturated Cinematic | shadow `#1F2B3A`, mid `#5A6270`, accent `#8C6E4D`, highlight `#C4C0B8` | Cool blue-gray, neutral mid, muted amber, gray highlight; best for MAPPA-adjacent drama; avoid high saturation and warm-cozy grade. |
