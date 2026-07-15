# MAMILAS World Library V2 — Cerrahi Tarifler
**Tarih:** 2026-07-01
**Yazan:** Claude Opus 4.7
**Amaç:** `SURGERY_DATA.json` içindeki `worlds[]`, `materials[]`, `palettes[]` alanlarını doğrudan besleyen source-of-truth.
**Codex için not:** Her fenced `json` bloğu birebir kullanılacak. Alanlar `SURGERY_DATA.json` şemasına uygun.

**Kural — HER world için:**
- `render_law` prompt'a düşecek ana paragraf. English (AI modelleri EN prompt anlar).
- Boilerplate cümleler ("premium 3D animated feature world", "top-studio fidelity", "friendly polish", "cinematic," "stunning") **ASLA** yok.
- HEX kodları kesin. Palette bias kuralı bağlayıcı.
- `negative_lock` = o world'e özgü karakter/lokasyon/franchise isimleri (sızıntı ban).
- `example_injection` = 1 sahne birebir kullanıma hazır, imgen 4/nano_banana_2 copy-paste seviyesi.

---

## 1. `pixar_3d_edu` — Pixar 3D Education Tier

```json
{
  "id": "pixar_3d_edu",
  "name": "Pixar 3D — Education Tier",
  "group": "ANIMATION_EDU",
  "one_liner": "Yumuşak beveled 3D formlar, sıcak bounce ışık, çocuk-güvenli scale. Vision3 250D grade, karakter yüzünde subsurface scattering ve tam ekspresyon.",
  "render_law": "Rendered as feature-animation 3D CGI in the studio pipeline lineage of Toy Story 4 / Onward / Luca: full subsurface scattering on character skin, soft rounded silhouettes with visible fillet bevels on every hard edge, physically based shading with warm bounce light dominance. Every prop has a slight overscale (10-15%) for child-safe readability. Environment is stage-lit like a practical set — key light motivated by a real source (window, lamp), warm bounce fill in complementary hue, ambient occlusion painted, not raytraced-hard. Skin tone accurate warm midtones (#F4C7A6 baseline), never desaturated. Character eyes have wet spec highlight (dual point) and painted iris depth. Materials read tactile: wood shows grain and satin varnish, fabric shows stitch and weave, metal shows anisotropic brush. Composition rule-of-thirds with characters at focal plane sharp, background falling into gentle f/4 defocus. No cel lines. No graphic shadows. Full continuous shading with painterly AO. 24fps cadence.",
  "line_grammar": "No outlines. Silhouettes carry via lighting rim only. Shadow-side edges soften into ambient tone; no black line, no cel step.",
  "lens_grammar": "35mm to 50mm equivalent. f/4 mid-shot, f/2.8 character close-up. Vision3 250D neutral color science. Very light 16mm-equiv grain. No lens flare unless motivated. Focus racks are gentle.",
  "light_law": "Single motivated key (window sun, practical lamp, key monitor). Complementary bounce fill at 30% intensity. Rim light in accent palette. Painted AO in shadow pockets, never hard-black.",
  "palette_lock": {
    "shadow": "#3D2817",
    "mid": "#F4C7A6",
    "accent": "#F28C4A",
    "highlight": "#FFF6DC",
    "bias": "warm-honey dominant; cool bounce only in blue-violet complement; no acid green, no neon"
  },
  "motion_cadence": "Anticipation-action-reaction beat. Hold on emotional look 12-18 frames. Squash-stretch on prop pickup. Character eye darts before action.",
  "material_compat": ["none", "paper_craft_popup", "clay_hamur", "chalkboard_kara_tahta", "wood_tactile"],
  "negative_lock": [
    "NO clay/plasticine character skin (skin must be Pixar-shaded, not clay); clay is ONLY prop material when clay_hamur selected",
    "NO cel shading, NO cartoon outline, NO anime eye",
    "NO Woody, NO Buzz, NO Elsa, NO Bing Bong, NO Merida, NO named Pixar characters",
    "NO Radiator Springs, NO Monstropolis, NO Arendelle, NO named Pixar locations",
    "Turkish label only; NO English/other-language signage",
    "NO desaturated look, NO teal-orange Hollywood grade"
  ],
  "example_injection": "3D animated feature frame in the Pixar Onward/Luca pipeline: subject centered at f/4, warm window-sun key from camera-right, cool violet bounce fill from left, painted AO in floor pockets. Wood classroom desk shows grain and satin varnish. Character skin at #F4C7A6 midtone with dual-point wet-eye spec. Subject: @defne holds a red counting pencil at chest height, looking down at it with soft focus, half-smile forming. Turkish label 'SAĞ' raised as blocky wooden letter on desk edge, frozen and legible. AVOID: cel outline, teal-orange grade, English signage, Pixar franchise names. Clean motion-ready start frame."
}
```

---

## 2. `paper_craft_popup` — Paper Craft Pop-Up World

```json
{
  "id": "paper_craft_popup",
  "name": "Paper Craft Pop-Up",
  "group": "ANIMATION_EDU",
  "one_liner": "Elle kesilmiş, katlanmış, tab'lı kağıt katmanlarından inşa edilmiş miniature dünya. Kağıt lif dokusu, kesim kenarı, fold gölgesi, sayfa flex'i.",
  "render_law": "Photoreal miniature paper-craft diorama at macro scale, shot as if a pop-up storybook page opens flat toward camera. Every element is die-cut cardstock (100-250 gsm equivalent visible fiber), assembled via tab-and-slot mechanisms, hinge folds, and stacked layers. Paper grain visible at raking light. Cut edges show mild fiber tear at knife stroke. Fold shadows are soft ambient dark, not black. Warm bounce fill from below simulates page-glow. Every prop is paper — characters, buildings, math tiles, arrows, plants — no clay, no plastic, no fabric. Depth is real physical depth (2-4 layers of paper standing perpendicular to page), not painted illusion. Camera prefers low-angle side dolly or macro overhead. Depth-of-field shallow (f/2.8 macro equivalent) to isolate mechanism. Light temperature warm 3200K key, cool 5600K rim behind paper edges to backlight the fiber.",
  "line_grammar": "No drawn lines. Silhouettes carry via crisp die-cut paper edge. Interior detail via layered paper collage — shape on shape, never printed line.",
  "lens_grammar": "50mm-100mm macro. f/2.8-f/4 shallow DOF. Warm tungsten grade (3200K key). Mild film grain (16mm equiv). Slight barrel distortion allowed at 50mm macro end.",
  "light_law": "Warm key from oblique angle to rake paper texture. Cool backlight from behind paper edges for fiber halation. Bounce fill from off-white foam-core equivalent. Shadow pockets under folds ambient-warm, not black.",
  "palette_lock": {
    "shadow": "#8B6F47",
    "mid": "#F1E4C6",
    "accent": "#D9782E",
    "highlight": "#FFF8E7",
    "bias": "cream-kraft-terracotta dominant; accents may be primary construction-paper (crimson, cobalt, ochre); avoid neon, avoid pastel-mint"
  },
  "motion_cadence": "Slow deliberate mechanical motion — tab slides in slot, page flap folds, popup rises. Every motion has physical constraint visible. Hold 1.5-2s on rest position.",
  "material_compat": ["none"],
  "negative_lock": [
    "NO CGI 3D characters (all figures are paper)",
    "NO Pixar-style bevel or subsurface skin",
    "NO printed line-art on the paper (only cut shapes)",
    "NO fabric, NO clay, NO wood, NO plastic (paper only)",
    "Turkish label only; letters are raised die-cut paper, not printed",
    "NO named children's book characters (Curious George, Peter Rabbit, etc.)"
  ],
  "example_injection": "Photoreal paper-craft pop-up diorama, low side dolly along the bottom page edge. Complete pop-up letter lies open like a tiny room, with a name-and-signature paper mechanism anchored at lower right and a folded address pocket at lower left; a narrow die-cut paper route line runs between them. Warm 3200K low-sun key from the right strongly rakes the signature corner, cool backlight halates the paper edges. Exactly one tactile texture note: clean cut-paper laminations show fiber at corner tears. Turkish labels raised as die-cut cardstock words: 'Ad-Soyad ve İmza' right, 'Adres' left. Motion seed: the address pocket flap is one frame before folding shut. AVOID: reversed placement, English labels, printed line-art, extra people, warped Turkish letters, CGI skin. Clean motion-ready start frame."
}
```

---

## 3. `ghibli_hayao` — Studio Ghibli / Hayao Miyazaki

```json
{
  "id": "ghibli_hayao",
  "name": "Studio Ghibli — Hayao Miyazaki",
  "group": "ANIMATION_PAINTERLY",
  "one_liner": "Watercolor arka plan, elle çizilmiş karakter key, doğa-yakın palet, dust mote'lu ışık. Kaze Tachinu / Tonari no Totoro / Mononoke Hime signature.",
  "render_law": "Traditional 2D animation frame in the Studio Ghibli lineage of My Neighbor Totoro / Kiki's Delivery Service / The Wind Rises. Character key drawing is confident hand-inked line at 2-3px weight, tapered at ends, never uniform. Fills are flat cel color in 2-3 value steps per shape — highlight, mid, shadow, no gradient. Background is fully painted in watercolor and gouache: visible brush marks, wet-into-wet color bleed, paper texture at raking light. Foliage rendered as clustered brushstroke masses, not individual leaves. Sky has gradient wash with cloud silhouettes brushed in wet. Dust motes float in shafts of light. Character sits IN the painted world (not on top) — cel color values chosen to harmonize with background paint. Wind is visible: grass bends, hair lifts, clothes ripple in 8-frame cycles. Natural warm light dominant (afternoon golden hour bias). Composition uses ma (negative space) generously; character often occupies only 1/4-1/3 of frame.",
  "line_grammar": "Hand-inked confident line, 2-3px weight, tapered at both ends. Line color is dark-warm-brown (#3A2418), never pure black. Interior fold lines minimal — only where anatomy demands.",
  "lens_grammar": "Flat 2D frame; simulated 'lens' is compositional only. No lens flare, no DOF (deep focus). 4:3 or 16:9 aspect. Paper grain overlay subtle.",
  "light_law": "Motivated natural light — sun through leaves, window shaft, lantern glow. Shadow side gets warm ambient reflection, not gray. God-ray dust motes when light shaft present. Rim light on hair and grass edges.",
  "palette_lock": {
    "shadow": "#3A2418",
    "mid": "#B8D4A8",
    "accent": "#E85D3C",
    "highlight": "#FFF4C4",
    "bias": "sage-green, honey-cream, terracotta-red, sky-cobalt; avoid neon, avoid teal-orange grade"
  },
  "motion_cadence": "8-frame wind cycles on grass/hair/cloth. Character breath cycle 24 frames. Deliberate walk cycle at 12fps limited animation feel. Hold on emotional beat 24-36 frames.",
  "material_compat": ["none", "storybook_illustration", "paper_craft_popup"],
  "negative_lock": [
    "NO Totoro, NO Chihiro, NO Kiki, NO Ponyo, NO Howl, NO Ashitaka, NO named Ghibli characters",
    "NO Spirit World, NO bathhouse, NO Cat Bus, NO named Ghibli locations",
    "NO CGI shading, NO 3D bevel, NO cel-shaded 3D",
    "NO neon colors, NO Hollywood teal-orange grade",
    "Turkish label only; ink brush-lettering style"
  ],
  "example_injection": "Hand-drawn 2D animation frame in the Studio Ghibli lineage. Character @defne (dark-brown 2-3px inked line, warm cel skin at #F0C48A midtone) stands in a summer meadow at afternoon golden hour. Background fully watercolor-painted: sage-green grass in clustered brush-mass, distant cobalt-sky gradient wash, single line of clouds wet-brushed. Dust motes float in the light shaft from camera-left. Wind lifts hair in 8-frame cycle. Composition: character at lower-right third; upper 2/3 is open sky and meadow. Turkish label as ink brush-letter: 'DOĞU' painted on wooden signpost at frame edge. Motion seed: hand rising toward a passing dragonfly, mid-gesture. AVOID: Totoro, spirit world, CGI shading, neon color, English signage. Clean motion-ready start frame."
}
```

---

## 4. `arcane_fortiche` — Arcane / Fortiche Painterly-3D Hybrid

```json
{
  "id": "arcane_fortiche",
  "name": "Arcane — Fortiche Painterly-3D",
  "group": "ANIMATION_STYLIZED",
  "one_liner": "Yağlıboya dokusuyla giydirilmiş 3D form. Painterly edge, elle boyanmış silüet, Vision3 500T tonlaması ve hafif halation. Fortiche Production signature.",
  "render_law": "Fortiche painterly-3D hybrid rendering as in the Arcane series: 3D-modeled forms are surface-shaded with oil-paint texture, visible brush stroke at every silhouette edge, hand-painted highlights that DO NOT follow physical light math exactly. Shadow-side edges are deep violet (#1B0B2E), not black — there is NO black in this world. Skin has painted-in blush and pore work, not subsurface scattering. Hair reads as sculpted painted volume, not strand-simulation. Fabric has visible weave painted, not physical cloth-sim. Environment: chunky mid-poly architecture surface-painted with grime, rust, and iridescent oil streaks. Every metal has a painterly rainbow spec (thin-film interference feel). Backgrounds compress into painterly matte — never crisp photographic detail. Post: Vision3 500T grade with mild halation blooming on highlights, subtle chromatic aberration at high-contrast edges, 35mm-equivalent grain floor.",
  "line_grammar": "NO hard cel outline. Silhouette carries by painted edge — brush stroke visible, weight varies with light intensity and emotional beat. Interior lines are painted shadow steps, never inked. Shadow-side rim is #1B0B2E deep violet.",
  "lens_grammar": "35mm neutral to 50mm portrait. f/2.8 character close-up, f/4 mid, f/5.6 wide establisher. Vision3 500T signature: warm-highlight cool-shadow curve, halation on hot pixels. Grain: 35mm-equivalent, present but not gritty.",
  "light_law": "Motivated key single-direction. Bounce fill in complementary palette hue (magenta if key is teal, teal if key is magenta). Rim light in accent color (never white). Ambient occlusion painterly and soft; hard-black AO forbidden.",
  "palette_lock": {
    "shadow": "#1B0B2E",
    "mid": "#6BC5D2",
    "accent": "#E85D75",
    "highlight": "#FFF3C4",
    "bias": "deep-violet + magenta-pink + teal + warm-highlight only; NO earth green, NO primary red, NO orange (unless single accent flame), NO pure black"
  },
  "motion_cadence": "Deliberate 24fps with hand-animated smear frames at peak action (2-3 frame smears, painted with motion streak). 1.5-2s hold on emotional beat. Slow-in slow-out with weight. No motion-blur; smears are painted.",
  "material_compat": ["none", "notebook_ink"],
  "negative_lock": [
    "NO Jinx, NO Vi, NO Caitlyn, NO Jayce, NO Viktor, NO Silco, NO Ekko, NO Heimerdinger, NO Vander, NO Powder",
    "NO Piltover, NO Zaun, NO Undercity, NO Hexgate, NO Last Drop, NO Academy",
    "NO Hextech crystal (blue-glowing gem), NO shimmer purple-glow substance",
    "NO cel outline, NO hard black anywhere",
    "NO earth green, NO pure orange, NO sepia",
    "Turkish label only; hand-painted brush lettering with slight uneven edge"
  ],
  "example_injection": "Fortiche painterly-3D hybrid frame in the Arcane surface-shading lineage. Oil-paint texture on every form, visible brush stroke at silhouette. Subject: @defne mid-close-up, painted-blush skin at cool #B08978 shadow-side pushed to violet #1B0B2E, magenta rim from camera-right. Background: chunky mid-poly Istanbul rooftop compressing into painterly matte, teal night sky with painted stars, single warm window-glow bloom in mid-ground. Vision3 500T halation on the rim highlight. Turkish label 'KUZEY' hand-painted on a rusted iron sign, brushy uneven letter edges. Motion seed: eye flicking toward off-camera sound, painted smear on iris just starting. AVOID: Jinx, Hextech blue crystal, Piltover, cel outline, hard black, earth green, English signage. Clean motion-ready start frame."
}
```

---

## 5. `spiderverse_sony` — Spider-Verse / Sony Pictures Animation

```json
{
  "id": "spiderverse_sony",
  "name": "Spider-Verse — Sony Pictures Animation",
  "group": "ANIMATION_STYLIZED",
  "one_liner": "Comic-book baskı estetiği + 3D. Halftone dot dokusu, kromatik aberasyon, çift-zaman (12fps hero + 24fps camera), panel break'ler. Into the Spider-Verse / Across the Spider-Verse signature.",
  "render_law": "Sony Pictures Animation Spider-Verse hybrid: 3D-modeled forms rendered with visible Ben-Day halftone dot texture on flat-shaded color fills (dot size scales with distance — larger dots on background). Character animation runs at 12fps on 2s (hero) while camera and background move at 24fps — this dual-cadence is signature. Chromatic aberration split visible at high-contrast edges (cyan-magenta 2-4px offset). Comic-book pop art details: onomatopoeia words break into frame (Turkish 'PAT', 'ŞIK', etc.), speed lines around fast motion, action-panel divider bars can slice the frame diagonally. Shading uses hard cel steps (3 values max) with printed misregistration — one color layer offset 1-2px from the linework layer. Line art itself is bold varied-weight, filled with textured brush, not vector-clean. Ink smudge and print bleed at corners.",
  "line_grammar": "Bold black line, 3-6px weight, varied brush edge with visible texture. Line thickens on shadow-side of form. Print misregistration: line layer sits 1-2px offset from color fill (looks like old comic printing).",
  "lens_grammar": "35mm-50mm cinematic, but treated as comic panel. f/2.8-f/4. Chromatic aberration split (2-4px cyan-magenta) at high-contrast edges — this is a look choice, not a defect. No lens flare unless drawn as star-burst graphic.",
  "light_law": "Bold key from motivated source. Fill is complementary color, hard-stepped not gradient. Rim light in accent hue, becomes a graphic shape rather than realistic wrap.",
  "palette_lock": {
    "shadow": "#1A0F3D",
    "mid": "#E63946",
    "accent": "#00E5FF",
    "highlight": "#FFFF3D",
    "bias": "high-saturation primary comic palette (red, cyan, yellow, deep violet); allow neon; NO earth tones, NO desaturated grade"
  },
  "motion_cadence": "Hero character 12fps on 2s. Camera and background 24fps. Speed lines on fast action, drawn as graphic streaks not motion blur. Freeze-frame allowed at peak beat.",
  "material_compat": ["none", "notebook_ink"],
  "negative_lock": [
    "NO Miles Morales, NO Peter Parker, NO Peter B. Parker, NO Gwen Stacy, NO Kingpin, NO Prowler, NO Spider-Man 2099, NO Miguel O'Hara, NO named Spider-Verse characters",
    "NO Spider-Man suit patterns (red-blue web, black-red), NO web-shooter, NO spider emblem",
    "NO New York skyline recognizable landmarks",
    "NO clean vector line (must be brush-textured)",
    "Turkish onomatopoeia only (PAT, ŞIK, VUM); NO English (POW, BAM, ZAP)"
  ],
  "example_injection": "Spider-Verse hybrid frame in Sony Pictures Animation style. Halftone dot texture on flat color fills. Subject: teenager on a rooftop mid-turn, 3-value cel shading with 2px print misregistration between line and color layers. Bold #E63946 red jacket, #00E5FF cyan sky background with cyan-magenta chromatic aberration split at silhouette edge. Character animated at 12fps (2s hold on pose), camera dolly at 24fps producing dual-cadence feel. Turkish onomatopoeia 'ŞIK' breaks into upper-right frame in bold comic letters with drop shadow. Motion seed: turning head mid-arc, 12fps hold pose. AVOID: Spider-Man suit patterns, English POW/BAM, clean vector line, earth tones, named Spider-Verse characters. Clean motion-ready start frame."
}
```

---

## 6. `jjk_mappa` — Jujutsu Kaisen / MAPPA

```json
{
  "id": "jjk_mappa",
  "name": "Jujutsu Kaisen — MAPPA",
  "group": "ANIMATION_DARK",
  "one_liner": "MAPPA underexposed cel, ink-smear peak frame, cursed-energy fractal (soyut, franchise ikonu değil), cold steel rim. Karanlık drama estetiği.",
  "render_law": "Contemporary MAPPA television animation frame in the Jujutsu Kaisen production lineage: 2D cel animation underexposed 1-1.5 stops compared to standard cel — backgrounds desaturated, shadow zones dominant, subject rim-lit rather than fill-lit. Cel color 3-value steps but shadow value is push-crushed toward blue-black (#0B111A). Line art is confident 2-3px black, but at peak action becomes ink-smear frame — a single frame or two where the drawing dissolves into brush-ink motion streak, then resolves back. Cursed-energy visualization is abstract fractal black smoke tendrils with faint teal-cyan core glow (#4DD0E1), NEVER a named franchise icon or specific curse. Backgrounds are photobash-heavy: real photo reference under painted overlay, atmospheric perspective aggressive (mid-ground fades hazy). Effects animation (light, fire, energy) hand-drawn with 12-frame cycles, not CGI. Post: cold film curve, teal-blue shadow lift, minimal saturation on background, high saturation reserved for accent (blood, cursed-energy core).",
  "line_grammar": "Confident 2-3px black line at rest. At peak action: 1-2 frames of ink-smear brush motion. Interior detail line count high (fabric folds, hair strand, muscle definition).",
  "lens_grammar": "Flat 2D but simulated 24mm-35mm wide when action, 50mm portrait when drama. Aspect 16:9. Compositional Dutch tilt allowed at emotional beats.",
  "light_law": "Rim-dominant. Key light is often ABSENT (character in shadow), rim outlines the form. Cold shadow (blue-black), warm rim (amber or cursed-teal). Bounce fill minimal or none.",
  "palette_lock": {
    "shadow": "#0B111A",
    "mid": "#3A4A5A",
    "accent": "#4DD0E1",
    "highlight": "#F5E6C8",
    "bias": "cold blue-gray desaturated dominant; single warm or cursed-teal accent; NO earth green, NO pastel, NO Ghibli-warm"
  },
  "motion_cadence": "Deliberate hold, then 1-2 ink-smear peak frames, then hold on impact. 24fps camera, character 12fps. Effects on 8fps loop. 2-3s hold after climax action.",
  "material_compat": ["none", "notebook_ink"],
  "negative_lock": [
    "NO Yuji Itadori, NO Megumi, NO Nobara, NO Gojo, NO Sukuna, NO Geto, NO Nanami, NO Toji, NO Mahito, NO named JJK characters",
    "NO Shibuya, NO Tokyo Jujutsu High, NO Culling Game locations",
    "NO Sukuna's finger, NO Ryomen mouth-mark, NO Gojo blindfold or six-eyes glow, NO domain expansion visual signature",
    "NO black-uniform school outfit specific to Jujutsu Tech",
    "NO warm palette dominant, NO pastel",
    "Turkish label only"
  ],
  "example_injection": "MAPPA television animation frame in Jujutsu Kaisen production style. Underexposed cel, shadow-crushed #0B111A dominant. Subject: Mamilas character mid-close-up in profile, rim-lit from camera-right with cursed-teal #4DD0E1 glow, key light absent, form reads as silhouette. Background: photobash of Istanbul night alley, painted overlay pushed cool-blue, atmospheric haze reducing mid-ground to grayscale. Confident 2-3px black line on subject, cursed-energy abstract fractal black tendrils with teal core rising from the ground plane behind character. Motion seed: eye opening, next frame will be an ink-smear as energy pulses. Turkish label 'GECE' painted as brush kanji-inspired lettering on brick wall. AVOID: Yuji, Gojo, Shibuya, Sukuna finger, Jujutsu Tech uniform, warm palette. Clean motion-ready start frame."
}
```

---

## 7. `demon_slayer_ufotable` — Demon Slayer / Ufotable

```json
{
  "id": "demon_slayer_ufotable",
  "name": "Demon Slayer — Ufotable",
  "group": "ANIMATION_CEL_3D_HYBRID",
  "one_liner": "Ufotable signature: 2D cel karakter + 3D-composite luminous painted background + hi-fi effects (water, fire, ışık) katmanı. Taisho-era wilderness estetiği yerine kullanıcı lokasyonu.",
  "render_law": "Ufotable studio animation frame in the Demon Slayer / Fate Zero production lineage: 2D cel character with crisp linework and 3-value cel fill sits on top of a fully 3D-modeled background that has been rendered and then hand-painted-over to look luminous and painterly (not raw-CG). Environment lighting is hi-fi: volumetric god rays, particulate atmosphere, dew and moisture on surfaces. Effects animation (water, fire, light energy, sword slash) is a separate signature layer — composited digital fluid simulation blended with hand-drawn key frames, produces the 'Ufotable effect' of hyper-detailed liquid/flame that overwhelms the cel character in scale. Composition frequently 2.35:1 letterbox for cinematic feel. Character skin is cel-shaded warm midtone with subtle painted rim. Line 2px confident black. Post: filmic curve with warm highlight, cool shadow, slight bloom on light sources.",
  "line_grammar": "Crisp 2px black line on character, uniform weight, no taper. Interior fold lines minimal. Effects layer has its own brush-textured line for water/flame contour.",
  "lens_grammar": "Simulated 40mm-85mm cinematic. 2.35:1 letterbox aspect option. f/2.8-f/4 shallow feel on hero, f/8 wide on environment. Bloom on light sources.",
  "light_law": "Motivated cinematic key with volumetric god rays. Warm rim from key, cool shadow ambient. Effects generate their own light (fire glows on character, water reflects sky). Particulates in air always.",
  "palette_lock": {
    "shadow": "#1F2B3A",
    "mid": "#7B8FA8",
    "accent": "#FF6B35",
    "highlight": "#FFF0C4",
    "bias": "cool blue-slate shadow, warm fire-amber accent (or teal water accent), cream highlight; balanced cinematic; NO neon, NO desaturated flat"
  },
  "motion_cadence": "24fps camera. Character 12fps limited animation. Effects layer 24fps full animation with 1-frame smear at peak. 2-3s hold after signature move.",
  "material_compat": ["none"],
  "negative_lock": [
    "NO Tanjiro, NO Nezuko, NO Zenitsu, NO Inosuke, NO Giyu, NO Rengoku, NO Muzan, NO named Demon Slayer characters",
    "NO Taisho-era Japan wilderness, NO cedar forest, NO Mount Natagumo, NO Infinity Castle",
    "NO Demon Slayer haori pattern (checkered green-black), NO Nichirin sword, NO hanafuda earrings",
    "NO named breathing style visual signature (water dragon, flame form, etc. — effects layer must be abstract or user-directed)",
    "Turkish label only; brush-kanji-inspired lettering allowed"
  ],
  "example_injection": "Ufotable animation frame in Demon Slayer production style. 2D cel character over hand-painted-over 3D background. Subject: Mamilas character mid-shot at 2.35:1 letterbox, 2px black line, cel-shaded warm skin, cool-slate shadow. Background: 3D-modeled Istanbul stone bridge at night, painted-over to luminous, volumetric god-ray from off-camera lantern, particulate mist in air. Effects layer: water droplets on stone glowing warm-amber #FF6B35 from the lantern reflection. Cinematic bloom on light source. Turkish label 'KÖPRÜ' brush-inked on wooden signpost, kanji-style stroke. Motion seed: character exhaling visible warm breath in cold air, mid-cycle. AVOID: Tanjiro, checkered haori, Nichirin sword, Taisho-era wilderness, named breathing styles. Clean motion-ready start frame."
}
```

---

## 8. `one_piece_toei` — One Piece / Toei Bold-Cel

```json
{
  "id": "one_piece_toei",
  "name": "One Piece — Toei Bold-Cel",
  "group": "ANIMATION_BOLD_CEL",
  "one_liner": "Toei Animation bold-outline, rubber-elastic anatomy distortion, marine palette bias, poster-vibrant flat fill. Shounen enerji estetiği.",
  "render_law": "Toei Animation One Piece production frame: bold 3-5px black outline on every character and prop, uniform-weight (no taper), pure black (#000000). Interior line count minimal — silhouette does the work. Fill is flat cel color, 2-value steps only (mid and shadow, no highlight step or only for hair spec). Colors are poster-vibrant: high saturation across the board, no muted tones. Anatomy is rubber-elastic — joints stretch and squash at peak motion, eyes can go huge in reaction shots, mouth can extend past face silhouette in shout. Background is often simple painted sky/ocean gradient with hand-drawn cloud shapes, less detail than character. When environment matters, it's bold-outlined too. Motion uses smear frames at peak (single-frame with multiple limb ghosts). Speed lines for fast action. Emotion lines (sweat drops, blush blocks, veins) are graphic symbols placed on face. 4:3 or 16:9 aspect.",
  "line_grammar": "Bold 3-5px pure black outline, uniform weight, no taper. Silhouette-first design. Interior line minimal (only for muscle definition or fabric fold at key emotional beat).",
  "lens_grammar": "Flat 2D. Simulated 35mm neutral or 50mm portrait. Wide reaction shots use fish-eye distortion for comedic effect. No lens flare.",
  "light_law": "Simple 2-value cel light — mid tone and shadow tone, hard step. Occasional highlight step for hair spec or metal. Shadow is deep saturated color, not black.",
  "palette_lock": {
    "shadow": "#1E3A8A",
    "mid": "#FFC93C",
    "accent": "#E63946",
    "highlight": "#FFF8E7",
    "bias": "marine-blue + primary yellow + primary red + cream; high saturation across the board; NO pastel, NO desaturated, NO neon"
  },
  "motion_cadence": "12fps character animation on 2s. Smear frames at peak action (single frame with multi-ghost limb). Speed lines during motion. Freeze on reaction shot 24-36 frames.",
  "material_compat": ["none"],
  "negative_lock": [
    "NO Luffy, NO Zoro, NO Nami, NO Sanji, NO Chopper, NO Robin, NO Franky, NO Brook, NO Jinbe, NO Ace, NO Shanks, NO Blackbeard, NO named One Piece characters",
    "NO Straw Hat crew emblem, NO Jolly Roger, NO named pirate crew flags",
    "NO Grand Line, NO Alabasta, NO Water 7, NO Wano, NO named One Piece locations",
    "NO Devil Fruit visual signature, NO Gomu Gomu stretch specifically",
    "NO desaturated palette, NO realistic anatomy",
    "Turkish label only; bold display letter with drop shadow"
  ],
  "example_injection": "Toei Animation bold-cel frame in the One Piece production style. Subject: Mamilas character mid-close-up, 4px pure black outline, poster-vibrant #FFC93C yellow shirt, #E63946 red bandana, 2-value cel shading, deep marine #1E3A8A shadow tone. Anatomy slightly rubbery — head 15% larger than realistic proportion, eyes wide with high spec highlight. Background: painted marine-blue sky gradient with 2-3 hand-drawn cloud shapes, minimal detail. Wide reaction expression forming. Turkish label 'MACERA' bold display letter with drop shadow, placed as onomatopoeia in upper-right. Motion seed: mouth opening for a shout, mid-arc. AVOID: Luffy, Straw Hat, Jolly Roger, Gomu Gomu stretch, Grand Line, realistic anatomy, desaturated palette. Clean motion-ready start frame."
}
```

---

## 9. `deakins_naturalist` — Roger Deakins Naturalist Real

```json
{
  "id": "deakins_naturalist",
  "name": "Roger Deakins — Naturalist Real",
  "group": "CINEMATIC_REAL",
  "one_liner": "Roger Deakins signature: motivated single-source natural key, minimal fill, still-frame reverence. 1917 / Blade Runner 2049 / Skyfall aydınlatma disiplini.",
  "render_law": "Photoreal cinematography in the Roger Deakins ASC BSC lineage (1917, Blade Runner 2049, Skyfall, Sicario): motivated lighting only — every source is a practical or natural fixture visible or implied in-frame (window sun, tungsten lamp, sodium streetlight, fire). NO fill light unless bounced off a visible surface. Shadow side of subject is genuinely dark and often into the black point. Contrast ratio 4:1 or 6:1 typical. Camera is locked-off or slow deliberate dolly — never handheld shake. Composition uses negative space and single-subject isolation; Deakins frames a small figure against vast environment. Aspect 2.39:1 anamorphic feel with subtle horizontal lens flare from bright practicals. Grade is naturalistic: warm highlights, cool shadows, but never Hollywood teal-orange excess. Skin tone accurate to source light temperature — tungsten yields warm skin, daylight yields neutral, sodium yields amber. ARRI Alexa 65 look: fine grain, deep dynamic range, subtle organic film curve.",
  "line_grammar": "N/A — photoreal. Silhouette carries via light. Deep-focus edges natural, no line.",
  "lens_grammar": "Master Anamorphic 40mm, 50mm, 65mm primes. f/2.8-f/5.6 typical. 2.39:1 aspect. Horizontal streak flare from practicals allowed but subtle. ARRI Alexa 65 sensor characteristics. Fine grain (35mm-equivalent, mostly in shadows).",
  "light_law": "One motivated source. Bounce fill only off visible surface (wall, ground). Practicals in-frame allowed and often composed. Shadow side into deep territory (#0A0A0A), not lifted. Highlights protected, never clip.",
  "palette_lock": {
    "shadow": "#0A0A0A",
    "mid": "#8B7355",
    "accent": "#E85A2A",
    "highlight": "#F4E4C6",
    "bias": "earth-natural (umber, ochre, olive, sky-neutral); accent is single warm practical (tungsten, fire, sodium); NO teal-orange grade, NO neon, NO saturated primary"
  },
  "motion_cadence": "Locked-off or slow deliberate dolly (2-4 seconds across frame). Long take feel. Cuts are rare and reverent.",
  "material_compat": ["none", "chalkboard_kara_tahta", "notebook_ink"],
  "negative_lock": [
    "NO Ryan Gosling K, NO Rick Deckard, NO Sam Mendes character names, NO James Bond, NO named Deakins-shot characters",
    "NO 1917 trench, NO Blade Runner Los Angeles, NO Vegas Deckard bar, NO named Deakins-shot locations",
    "NO handheld shake, NO fill-flash flat lighting, NO Hollywood teal-orange grade",
    "NO neon, NO fluorescent green, NO oversaturated color",
    "Turkish label only; naturalistic signage integrated into environment"
  ],
  "example_injection": "Photoreal cinematography in the Roger Deakins ASC/BSC lineage. Locked-off frame, 2.39:1 anamorphic aspect, 50mm Master Anamorphic at f/4. Subject: solitary figure standing at the edge of a wide Istanbul rooftop at dusk, tiny within the frame, silhouetted against a burning sodium-orange sky (#E85A2A). Single motivated key: distant setting sun, no fill. Shadow side of figure into #0A0A0A near-black. Foreground: rust-textured metal railing catching horizontal streak flare from a low sodium streetlight below. ARRI Alexa 65 fine grain in shadow. Turkish label 'İSTANBUL' integrated as weathered sign on distant rooftop antenna, barely legible. Motion seed: figure exhaling, cigarette smoke drifting upward. AVOID: Ryan Gosling, Blade Runner LA, teal-orange grade, fill light, handheld shake, neon. Clean motion-ready start frame."
}
```

---

## 10. `fincher_precision` — David Fincher Precision Real

```json
{
  "id": "fincher_precision",
  "name": "David Fincher — Precision Real",
  "group": "CINEMATIC_REAL",
  "one_liner": "Fincher precision: locked-off geometric composition, dijital keskinlik + FilmConvert grain, restrained teal-and-orange, motorlu dolly smoothness. Se7en / Zodiac / The Social Network / Mindhunter estetiği.",
  "render_law": "Photoreal cinematography in the David Fincher / Jeff Cronenweth / Erik Messerschmidt lineage: camera is locked-off or motorized-dolly-perfect, never handheld. Composition is geometric — symmetry, one-point perspective, or precise rule-of-thirds hit exactly. Every element in frame is placed. Focus is deep (f/5.6-f/8 typical), everything sharp — Fincher prefers deep focus over shallow. RED or Alexa Mini digital sharpness with FilmConvert-style grain overlay to soften the digital edge. Grade is restrained teal-and-orange: shadows push toward #1B3B4B teal, highlights toward warm #F4C97A, but midtones and skin stay accurate. Sets are precise: props positioned, walls squared, geometry emphasized. Subject often centered or on a mathematical thirds intersection. Practical lights are visible and composed (desk lamp at exact angle, monitor glow on face). Long takes with slow reveals via dolly move.",
  "line_grammar": "N/A — photoreal. Sharp digital detail, deep focus.",
  "lens_grammar": "35mm, 40mm, 50mm primes on RED or Alexa Mini. f/5.6-f/8 deep focus. 1.85:1 or 2.00:1 aspect. Digital sharpness present, softened by FilmConvert grain. No lens flare (unless motivated practical).",
  "light_law": "Motivated practical + one soft key + minimal fill. Practicals often desk lamp, monitor, phone screen — composed as part of frame. Shadow into teal territory but not black. Skin protected accurate.",
  "palette_lock": {
    "shadow": "#1B3B4B",
    "mid": "#8B7C6E",
    "accent": "#F4C97A",
    "highlight": "#F0E6D2",
    "bias": "restrained teal shadow + warm highlight; midtone earth-neutral; NO neon, NO saturated primary, NO Hollywood teal-orange excess"
  },
  "motion_cadence": "Locked-off or precision motorized dolly. No handheld. Slow reveals over 4-6 seconds. Cuts on beat, precise.",
  "material_compat": ["none", "notebook_ink"],
  "negative_lock": [
    "NO Mark Zuckerberg, NO Tyler Durden, NO Amazing Amy, NO Holden Ford, NO named Fincher-directed characters",
    "NO Facebook office, NO Fight Club basement, NO Zodiac newsroom, NO Mindhunter FBI office, NO named Fincher locations",
    "NO handheld shake, NO shallow-focus bokeh dominance, NO warm-cozy grade",
    "NO neon (unless a single composed practical)",
    "Turkish label only; precision sans-serif signage"
  ],
  "example_injection": "Photoreal cinematography in the David Fincher / Erik Messerschmidt lineage. Locked-off symmetrical composition, 40mm on Alexa Mini at f/5.6 deep focus. Subject: person seated at a dark wood desk in a Beyoğlu apartment, centered on frame axis. Practical desk lamp warm-tungsten #F4C97A on the desk surface at exact 30-degree angle from left. Monitor glow cool-teal #1B3B4B on the subject's face from below. Ceiling and walls in deep teal shadow, geometric edges emphasized. FilmConvert grain overlay. Turkish label 'DOSYA 47' printed precision sans-serif on a document at the desk edge, sharp and legible. Motion seed: hand reaching for the document, mid-arc, motorized dolly beginning slow push-in. AVOID: Mark Zuckerberg, Fight Club, handheld, shallow bokeh, neon, warm-cozy grade. Clean motion-ready start frame."
}
```

---

## 11. `wes_anderson_symmetric` — Wes Anderson Symmetric Real

```json
{
  "id": "wes_anderson_symmetric",
  "name": "Wes Anderson — Symmetric Real",
  "group": "CINEMATIC_REAL",
  "one_liner": "Dead-center 1-point perspective, pastel palette, motivated flat light, whip-pan cuts. Grand Budapest Hotel / Isle of Dogs / Asteroid City / Moonrise Kingdom disiplini.",
  "render_law": "Photoreal cinematography in the Wes Anderson / Robert Yeoman lineage: rigid one-point perspective, dead-center composition, everything symmetrical along vertical axis. Camera is either locked-off, on a precise dolly (perpendicular tracking), or executing a snap-whip pan between locked positions. Aspect ratio 1.37:1 (Academy) or 2.00:1 flat scope option, depending on project. Palette is pastel-vintage: mint green, salmon pink, mustard yellow, powder blue, cream white — all muted, all coordinated. Every prop is period-styled and precisely placed. Costume palette is limited to 2-3 colors per character. Signage and labels are hand-drawn Futura or Archer sans-serif, always legible, always composed. Lighting is motivated but even and flat — Anderson avoids dramatic shadow. Skin tone slightly desaturated to match pastel environment. Depth is compressed — 35mm-40mm neutral or slight wide, but subjects arranged in flat perpendicular layers. No shallow focus; deep focus preferred.",
  "line_grammar": "N/A — photoreal, but composition reads graphic due to symmetry and pastel flatness.",
  "lens_grammar": "35mm-40mm primes. f/5.6-f/8 deep focus. 1.37:1 Academy or 2.00:1 flat. No lens flare. Kodak Vision3 250D grade with pastel push.",
  "light_law": "Motivated but even. Fill light matches key temperature (no complementary bounce). Shadow soft, low contrast (2:1 ratio typical). Everything readable.",
  "palette_lock": {
    "shadow": "#8B9A7B",
    "mid": "#F4C7A6",
    "accent": "#E8817A",
    "highlight": "#FDF6E3",
    "bias": "coordinated pastel (mint, salmon, mustard, powder-blue, cream); muted saturation; NO neon, NO deep black, NO teal-orange grade"
  },
  "motion_cadence": "Locked-off or perpendicular dolly. Snap-whip pans between locked positions. Cuts precise on beat. Long stillness allowed 3-5s.",
  "material_compat": ["none", "paper_craft_popup"],
  "negative_lock": [
    "NO M. Gustave, NO Suzy Bishop, NO Sam Shakusky, NO Steve Zissou, NO Max Fischer, NO Royal Tenenbaum, NO Asteroid City characters",
    "NO Grand Budapest Hotel, NO Isle of Dogs, NO New Penzance, NO named Anderson locations",
    "NO Andersontown fictional country signage patterns copied specifically",
    "NO handheld shake, NO shallow bokeh, NO high contrast, NO saturated primary",
    "Turkish label only; hand-drawn Futura or Archer-style sans-serif, precisely composed"
  ],
  "example_injection": "Photoreal cinematography in the Wes Anderson / Robert Yeoman lineage. Dead-center one-point perspective, 40mm at f/5.6 deep focus, 2.00:1 flat aspect. Subject: person standing centered in the doorway of a pastel-mint (#8B9A7B) hotel lobby, symmetric along vertical axis. Costume: mustard-yellow jacket, salmon-pink shirt, cream trousers — 3-color coordinated. Background: two identical brass wall-lamps flanking the doorway, cream ceiling with parallel ornamental molding. Even flat light, low-contrast, everything readable. Turkish label 'RESEPSİYON' hand-drawn Futura sans-serif on brass plaque, dead-centered above doorway. Motion seed: character mid-turn, preparing to walk perpendicular to camera. AVOID: M. Gustave, Grand Budapest signage, handheld, shallow bokeh, high contrast, saturated primary. Clean motion-ready start frame."
}
```

---

## 12. `chivo_naturalist_handheld` — Emmanuel Lubezki Documentary Naturalist

```json
{
  "id": "chivo_naturalist_handheld",
  "name": "Emmanuel Lubezki — Documentary Naturalist",
  "group": "CINEMATIC_REAL",
  "one_liner": "Emmanuel Chivo Lubezki signature: sadece doğal ışık, altın saat bias, handheld micro-drift, geniş lens, uzun-çekim hissi. The Revenant / Birdman / Children of Men / Tree of Life estetiği.",
  "render_law": "Photoreal cinematography in the Emmanuel Lubezki AMC lineage (The Revenant, Birdman, Children of Men, Tree of Life): natural light ONLY — sun, moon, fire, candle, window. No artificial fixture visible or used. Golden hour and blue hour are default (magic hour bias). Camera is handheld with intentional micro-drift and organic breath — not shaky, not stabilized-dead, but human-alive. Long takes are the aspiration — the camera weaves through space, follows subject, discovers frame naturally. Lens is wide: 14mm, 16mm, 21mm, sometimes 35mm — wide enough to include environment context around subject. Depth is deep (f/5.6-f/8) so environment reads sharp. Aspect 1.85:1 or 2.39:1. Skin tone golden-warm in magic hour, natural in daylight, cool-blue in blue hour. Grain is 35mm-organic. Highlights allowed to bloom naturally, shadows allowed to fall into darkness — no cheating with fill.",
  "line_grammar": "N/A — photoreal. Wide-angle organic distortion at frame edges.",
  "lens_grammar": "Wide primes: 14mm, 16mm, 21mm, 35mm. f/5.6-f/8 deep focus. 1.85:1 or 2.39:1. Natural bloom on highlights. 35mm-organic grain. Slight barrel distortion at frame edge (uncorrected wide).",
  "light_law": "Natural only. Sun key, sky bounce fill (soft blue), no artificial fixture. Magic hour bias — warm low sun, long shadows. Fire and candle allowed as practical secondary sources. Shadow into natural darkness, not lifted.",
  "palette_lock": {
    "shadow": "#2A1F14",
    "mid": "#C89968",
    "accent": "#F4A947",
    "highlight": "#FFE9B8",
    "bias": "golden-earth warm dominant (magic hour), cool blue for blue-hour scenes, natural skin protected; NO teal-orange grade excess, NO neon, NO artificial saturation"
  },
  "motion_cadence": "Handheld micro-drift, organic breath. Long take aspiration (30s-2min continuous). Camera weaves through space following action. Reframes are natural, not choreographed.",
  "material_compat": ["none"],
  "negative_lock": [
    "NO Hugh Glass, NO Riggan Thomson, NO Theo Faron, NO named Lubezki-shot characters",
    "NO Revenant frontier wilderness (unless user asks Turkey wilderness), NO Birdman theater, NO Children of Men London bus",
    "NO handheld shake (must be micro-drift, not shake), NO artificial light source, NO fill flash",
    "NO neon, NO teal-orange grade, NO shallow bokeh dominance",
    "Turkish label only; naturalistic integration into environment"
  ],
  "example_injection": "Photoreal cinematography in the Emmanuel Lubezki AMC lineage. Handheld micro-drift, 21mm wide prime at f/5.6 deep focus, 2.39:1 aspect. Subject: solitary walker crossing a golden-lit Cappadocia hillside during magic hour, sun low behind camera-right creating long warm shadow (#2A1F14) rake across the tuff-stone terrain. Warm golden #F4A947 rim on hair and jacket edge. Sky natural blue bounce fill on shadow side. Wide-angle slight barrel distortion at frame edge. Environment context: distant fairy chimneys sharp in deep focus, hot-air balloons faint on horizon. Turkish label 'GÖREME' integrated as weathered wooden trail-marker at frame right, natural aged. Motion seed: subject mid-step, arms lowering, camera micro-drift settling on breath. AVOID: Hugh Glass, Revenant frontier, artificial light, teal-orange grade, shake, neon. Clean motion-ready start frame."
}
```

---

## 13. MATERYAL KÜTÜPHANESİ (6 + none)

```json
{
  "materials": [
    {
      "id": "none",
      "name": "Materyal Yok — World Native",
      "substance_grammar": "No teaching-material substance layer. World renders natively as described in its render_law. Use for cinematic real worlds, high-end brand work, and any prompt where the subject is the world's native form (character, object, environment)."
    },
    {
      "id": "paper_craft_popup",
      "name": "Paper Craft Pop-Up",
      "substance_grammar": "Teaching subject is constructed of die-cut cardstock (100-250 gsm equivalent visible fiber): tabs, folds, hinge mechanisms, layered pop-up. Paper grain visible at raking light, fiber tear at cut edges, warm ambient fold-shadows. INSIDE the selected world's render_law — world dictates HOW paper reads (Pixar 3D shading paper vs. Ghibli watercolor-painting paper); paper does NOT replace world. Use for concrete manipulable teaching props (math tiles, letter cards, story pages, geometry shapes)."
    },
    {
      "id": "clay_hamur",
      "name": "Clay / Hamur",
      "substance_grammar": "Teaching subject is stop-motion plasticine clay: matt tone, visible fingerprint or tool marks, slight deformation between frames suggesting hand-manipulation. Character skin stays true to world's render_law (Pixar 3D skin is Pixar skin, NOT clay). Only PROPS are clay: tiles, arrows, animals, letters, numbers. Fingerprints on clay are storytelling detail. Use for tactile counting, shape manipulation, playful transformation demos."
    },
    {
      "id": "chalkboard_kara_tahta",
      "name": "Chalkboard / Kara Tahta",
      "substance_grammar": "Teaching happens on a black or dark-green chalkboard surface as backdrop, with real physical props (numbered wooden blocks, colored pencils, math manipulatives) sitting on the chalkboard tray or in front. Chalk drawings on the board are hand-drawn in the world's line grammar — Pixar 3D world gives clean beveled chalk, Deakins world gives naturalist chalk with real chalk-dust particulate. Use for classroom-authentic scenes."
    },
    {
      "id": "wood_tactile",
      "name": "Wood Toy — Tactile",
      "substance_grammar": "Teaching props are hand-turned wooden toys (Montessori-style): satin-varnished maple or oak, visible grain, anisotropic highlight from oblique light, real shadow. Numbers, letters, geometric solids, sorting shapes all in polished wood. INSIDE the world — Pixar 3D world renders wood with feature-animation subsurface fidelity; Deakins world renders wood photoreal with natural light rake. Use for warm, natural, Montessori-aligned teaching."
    },
    {
      "id": "storybook_illustration",
      "name": "Storybook Illustration",
      "substance_grammar": "Teaching subject appears as a classic children's book watercolor-and-ink illustration nested within the world. If world is Ghibli, the storybook IS the world; if world is Pixar 3D, an illustrated storybook page opens within the 3D scene like a physical prop. Watercolor pigment, paper grain, torn edges, hand lettering. Colors muted, edges soft. Use for hikaye-anlatım (storytelling) sequences and fable-style teaching."
    },
    {
      "id": "notebook_ink",
      "name": "Notebook Ink",
      "substance_grammar": "Teaching happens on a lined notebook page, spiral-bound, with pen-and-ink drawings appearing as if hand-drawn in real-time by an unseen author. Ink bleed at nib pressure, slight paper warp under wet ink, occasional smudge. Ink lines follow the world's line grammar — Arcane world gives brushy varied-weight ink; JJK/MAPPA world gives confident 2px black ink; Deakins world gives sparse graphite. Use for editorial/documentary teaching, brand storytelling, older-grade abstract concepts."
    }
  ]
}
```

---

## 14. PALET KÜTÜPHANESİ (9)

```json
{
  "palettes": [
    {
      "id": "native_world",
      "name": "Native — World Default",
      "hex": null,
      "bias": "Uses the selected world's palette_lock verbatim. Default choice. Do not override unless a specific creative reason exists."
    },
    {
      "id": "pastel_soft",
      "name": "Pastel Soft",
      "hex": {"shadow": "#C7D2C7", "mid": "#F6E1D3", "accent": "#F4A6A6", "highlight": "#FDFBF3"},
      "bias": "Muted pastel — mint, peach, blush, cream. Low saturation across the board. Overrides warm world palettes into softer register. Best for very young audience children's book vibe. AVOID: neon, deep black, saturated primary."
    },
    {
      "id": "vibrant_edu",
      "name": "Vibrant Education",
      "hex": {"shadow": "#1D3557", "mid": "#F4C430", "accent": "#E63946", "highlight": "#F1FAEE"},
      "bias": "Bright educational primary — cobalt, sunshine, tomato, off-white. High saturation but not neon. Best for elementary lesson emphasis. AVOID: desaturated, muted, dark grade."
    },
    {
      "id": "deep_noir",
      "name": "Deep Noir",
      "hex": {"shadow": "#0A0A0A", "mid": "#2B2B2B", "accent": "#8B0000", "highlight": "#C4C4C4"},
      "bias": "Near-black shadow, deep desaturated blood accent, silver highlight. Best for Fincher-precision and Chivo-blue-hour override. AVOID: warm cozy, pastel, primary color."
    },
    {
      "id": "warm_autumn",
      "name": "Warm Autumn",
      "hex": {"shadow": "#4A2C1A", "mid": "#C68B47", "accent": "#D9451F", "highlight": "#F5D28B"},
      "bias": "Rich amber, burnt sienna, deep burgundy. Best for hikaye-anlatım and Ghibli-warm override. AVOID: cool blue, neon, teal grade."
    },
    {
      "id": "cool_scientific",
      "name": "Cool Scientific",
      "hex": {"shadow": "#0D2137", "mid": "#4A90A4", "accent": "#4DD0E1", "highlight": "#E8F4F8"},
      "bias": "Cobalt, teal, cyan-glow, near-white highlight. Best for science, math, technology teaching. Overlays cleanly on JJK/MAPPA and Fincher worlds. AVOID: warm earth, saturated red-orange."
    },
    {
      "id": "earth_natural",
      "name": "Earth Natural",
      "hex": {"shadow": "#3D2817", "mid": "#8B7355", "accent": "#C89968", "highlight": "#F4E4C6"},
      "bias": "Umber, ochre, sand, cream. Best for Deakins native, Ghibli native, and Chivo golden-hour. AVOID: neon, teal grade, saturated primary."
    },
    {
      "id": "high_contrast_bold",
      "name": "High Contrast Bold",
      "hex": {"shadow": "#000000", "mid": "#E63946", "accent": "#FFC93C", "highlight": "#F1FAEE"},
      "bias": "Pure black shadow, primary red, primary yellow, off-white. Best for One Piece native, Spider-Verse override into poster mode. AVOID: pastel, desaturated, muted."
    },
    {
      "id": "desaturated_cinematic",
      "name": "Desaturated Cinematic",
      "hex": {"shadow": "#1F2B3A", "mid": "#5A6270", "accent": "#8C6E4D", "highlight": "#C4C0B8"},
      "bias": "Cool blue-gray shadow, neutral mid, muted amber accent, gray highlight. Best for JJK/MAPPA native mood extension, MAPPA-adjacent drama. AVOID: high saturation, bright primary, warm-cozy grade."
    }
  ]
}
```

---

## Codex için mekanik direktif

Her fenced `json` bloğunu birebir `SURGERY_DATA.json`'a yerleştir:
- 12 world → `worlds[]` içine (var olan 47 world'ü sil, bunları koy)
- 6 materyal + none → `materials[]` içine (mevcut 20'yi sil)
- 9 palet → `palettes[]` içine (mevcut 17'yi sil)
- `refs[]` → boş array `[]`

Şema uyumsuzluğu (eski alan var, yeni alan yok) durumunda eski alanı SİL. Yeni alanlar öncelikli.

Lint / prettier / json-format çalıştır. Sonra bkz. ORCHESTRATOR_HANDOFF §1 Lane A remaining steps.
