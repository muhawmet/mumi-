import fs from 'node:fs';
import path from 'node:path';

const outputDir = '/Users/Muhammet/Desktop/6. sınıf kuvvet';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const RENDER_LOCK = `Feature-animation 3D CGI in the Pixar RenderMan / RenderMan-successor premium-CG feature-animation pipeline lineage (original subjects only). The Pixar signature is NOT 'cute 3D' — it is a specific formal grammar: appeal-driven silhouette design (shapes composed for emotional read at 50px thumbnail), subsurface scattering on character skin that carries the scene's light temperature (warm honey SSS under tungsten, cool ivory SSS under daylight, amber-bronze SSS under sodium), wet dual-point specular on eyes with painted-in iris depth, and physically-motivated bounce fill. Every prop has a deliberate overscale factor (10-15%) for child-safe readability — a pencil is thumb-width, a bowl is head-width. Material specificity is non-negotiable: wood shows visible grain with satin-varnish sheen, fabric shows woven stitch texture and slight fiber fray at edges, metal shows anisotropic brushed highlight, rubber has soft-diffuse sheen with slight translucency at thin edges. Lighting grammar is art-directed, not photo-random: single motivated key (window sun at 45°, practical lamp at 60°, monitor glow from below), complementary bounce fill at 25-35% intensity in the key's opposing hue, rim accent in palette's saturated accent color, painted soft ambient occlusion in corner and fold pockets — never hard-black shadow. Composition: character at focal plane sharp at f/4 equivalent, background falling into gentle focus falloff. Squash-stretch physics govern all character and prop motion: every pickup has anticipation, every landing has squash, every fast move has follow-through smear. IMPERATIVE: FULL 3D CGI FEATURE-ANIMATION RENDER — continuous physically-based shading, painterly AO, SSS skin. Strictly forbid 2D cel shading, hard black outlines, flat graphic fill, clay/plasticine surface texture on character skin. Line grammar: No outlines — silhouette reads entirely through lighting rim and value separation. Shadow edges are soft, never hard-step. Ambient occlusion painted in, never raytraced-hard. The shape carries via appeal geometry, not line. Lens grammar: 35mm to 50mm equivalent focal length. f/4 on mid-shots, f/2.8 on character close-up, f/5.6 on environment establisher. Vision3 250D color science: neutral-warm film curve with fine grain (16mm-equivalent grain floor, mostly in shadow). Gentle racks on focal plane shifts. No lens flare unless motivated by a visible practical light source in frame. No anamorphic streak. Light law: Single motivated key from a real-world source visible or strongly implied in frame (window sun, desk lamp, overhead classroom fluorescent, screen glow). Complementary bounce fill at 25-35% key intensity, in the key's opposing hue temperature — warm key produces cool-violet bounce, cool daylight key produces warm-honey bounce. Rim accent in the palette's saturated accent tone. Painted soft AO in corner pockets, floor-join, and fabric folds — ambient shadow reads warm-dark, never cold-black.`;

const SHOW_DIRECTIVE = `SHOW-FIRST & FULL (fena fillah show): a jaw-dropping, layered space frame — near/mid/far planes all alive, volumetric light (sun-rays raking across a curved surface, drifting golden particle dust, lens-catch glints, warm bounce, rim), rich material texture (beechwood grain, fabric weave, glass anti-glare, metallic gloss), and vibrant colour as LIGHT BEHAVIOUR (warm saffron sun against deep navy/teal ground, never flat or cold). Carry the physical force details named in the dominant (vector lines · physical micro-action · visual/light anchor). The lesson reads INSTANTLY; the spectacle rewards a second look. Scale is a character — use vast depth, physical clarity, educational impact.`;

const REF_DNA = `Pixar RenderMan-lineage dimensional clarity + emotional-staging geometry + educational-physics dual-register — GRAMMAR ONLY, original subjects, subordinate to world/palette/negative.`;

const PALETTE = `Vibrant Education — shadows read as deep cool blue/navy, midtones read as vivid warm amber/saffron, accents read as vivid warm red/coral, highlights read as near-white board-white — palette character: Navy, saffron-yellow, tomato-red, board-white. Broad saffron key lands flat and even, the navy ground drinks the falloff, one tomato beat punctuates, board-white bounces back clean. NO menace, NO muddy midtone, NO desaturation. Render these as light behaviour, never flat fills.`;

const LANGUAGE_LOCK = `TÜRKÇE METİN KİLİDİ — every visible letter is TURKISH, spelled character-for-character with correct glyphs (ç Ç ğ ı İ ö Ö ş Ş ü Ü). NO English, NO Latin filler, no other language. Diegetic labels live on a real in-world surface (a digital Smartboard/Akıllı Tahta screen, a 3D glowing vector label with real perspective and light, a cutaway-diagram tag, a notebook surface) — never a flat 2D overlay/caption bar. Use ONLY the exact Turkish string named in ON-SCREEN TEXT; CLEAN PLATE = no lettering anywhere. Türkiye Maarif 6. Sınıf Fen Bilimleri Kuvvet Ünitesi.`;

const CAST_LOCK = `CAST KİLİDİ — character identity comes from their tags (@mira, @ali, @can — do not re-describe them physically). Any OTHER person (classmates, teacher) reads Turkish/Anatolian middle-school student or teacher — warm complexion, dark hair; neat school attire (navy vest, white collared shirt). No real-person likenesses, no commercial brand logos, no foreign school insignia. All characters wear original Turkish middle-school uniforms.`;

const BASELINE_NEGATIVE = `morphing, warping, re-render, style/material drift, new object that changes the beat, leaving the framed idea, face/identity change/drift, duplicated face, garbled or English lettering, Latin filler; generic 3D / stock-render / flat empty slide; clay/plasticine surface; hard cel shading, cartoon outline, anime eye geometry, flat graphic fill, toon shader, 2D on 3D; teal-orange grade, desaturation, muddy midtone; octane harshness; recognizable franchise or real-person characters, real brand names; the named literal thing replaced by an icon/arrow/gauge/UI panel that is not diegetic; empty adjectives (cinematic, dynamic, stunning, 4K, epic); warped or drifting text.`;

// Scene data dictionary for all 69 scenes
const sceneDetails = {
  1: {
    cam: "low-angle establishing shot, 40mm lens, f/4. @mira steps out through a carved dark-wood apartment door onto a limestone sidewalk.",
    dom: "@mira stepping out from the carved wooden entrance of a suburban apartment building, carrying her backpack. Physics: morning sun raking across stone steps (anchor) · her foot stepping down (micro) · carved wooden door + limestone wall + soft foliage (environment).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning. No lettering of any language.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  2: {
    cam: "side-tracking medium action shot, 35mm lens, f/4. @mira pushes open the heavy front door and sprints down the tree-lined cobblestone sidewalk.",
    dom: "@mira pushing open the door with her palm and sprinting down the sidewalk toward the waiting yellow school bus. Physics: trailing foot motion blur (micro) · heavy door pushing back (pressure) · sun casting soft shadows on cobblestone (anchor).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  3: {
    cam: "medium side-tracking shot, 40mm lens, f/2.8 on @mira. @mira runs along an open sidewalk under warm sun rays filtering through trees.",
    dom: "@mira running with a bright joyful smile as floating translucent glowing golden and cyan force-vector lines radiate from her sneakers and backpack. Physics: glowing vector lines carrying push-pull force vectors (anchor) · sneakers striking pavement (micro) · leafy sunlight shadows (environment).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  4: {
    cam: "triptych composite shot, 50mm lens, f/5.6 across three panels on a clean neutral-warm backdrop.",
    dom: "Three micro-illustrations of force: LEFT — palm pushing open a wooden door with curved red force arrow; CENTER — sneaker kicking a soccer ball with radial impact vectors; RIGHT — hands pushing a shopping cart with forward teal arrow. Physics: impact vectors expanding (anchor) · hands exerting pressure (micro) · three distinct physical force actions (pressure).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  5: {
    cam: "macro focus close-up, 50mm lens, f/2.8 sharp on the cube. A glossy crimson painted wood cube rests on a polished oak study table.",
    dom: "Crimson wooden cube resting on an oak desk, surrounded by four translucent 3D force-vector arrows pointing inward from four directions, with a glowing golden question mark above. Physics: inward pointing force vectors (anchor) · golden question mark casting warm light (micro) · oak grain + wood cube (environment).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  6: {
    cam: "close-up character reaction shot, 50mm lens, f/2.8 on eyes. @mira turns her head toward camera in a sunny school hallway.",
    dom: "@mira turning her head with an energetic wide-eyed expression, playfully shaking her head side to side with an excited grin. Physics: warm key light filtering through window onto SSS skin (anchor) · animated facial turn (micro) · blurred school hallway background (environment).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  7: {
    cam: "center-framed 3D physics visualization, 40mm lens, f/4 across the grid floor.",
    dom: "Two individual glowing force-vector arrows (electric blue and bright cyan) flowing together and fusing seamlessly into one large radiant golden net-force arrow pushing a heavy stone block across a grid floor. Physics: radiant light bloom at fusion point (anchor) · heavy stone block shifting (micro) · grid floor lines (environment).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  8: {
    cam: "wide cinematic shot, 35mm lens, f/2.8 on @mira in an atmospheric room with floating golden dust motes.",
    dom: "@mira looking up in awe with wide sparkling eyes as glowing 3D holographic Turkish text reading 'BİLEŞKE KUVVET' hovers in mid-air before her like a magical discovery. Physics: golden volumetric light from text illuminating face (anchor) · wide-eyed discovery tilt (micro) · floating dust motes (environment).",
    text: "Diegetic 3D floating holographic Turkish text: 'BİLEŞKE KUVVET'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  9: {
    cam: "medium shot, 40mm lens, f/4 on @mira on a sunny school garden path.",
    dom: "@mira smiling warmly toward the viewer, reaching out her right hand palm-up in an inviting welcoming gesture. Physics: morning sun key casting golden rim light (anchor) · hand extending forward (micro) · green foliage bokeh (environment).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  10: {
    cam: "wide interior establishing shot, 28mm lens, f/5.6 across the science classroom.",
    dom: "Modern Turkish middle school science classroom: @mira sits at a wooden double-desk alongside classmates; at the front, a friendly teacher stands beside a glowing digital Smartboard (Akıllı Tahta). Physics: window sunlight casting light beams across desks (anchor) · teacher gesturing toward screen (micro) · classroom wooden desks + science posters (environment).",
    text: "CLEAN PLATE — no on-screen text on classroom elements.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  11: {
    cam: "over-the-shoulder perspective past @mira at her desk, 40mm lens, f/4 on the Smartboard.",
    dom: "Science teacher using a digital stylus on the illuminated Smartboard (Akıllı Tahta) glass surface to draw a 3D blue box with glowing red directional force arrows. Physics: daylight key glow from Smartboard casting blue tones (anchor) · stylus contact on glass (micro) · wooden desk edge in foreground (environment).",
    text: "Diegetic 3D Smartboard diagram labels.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  12: {
    cam: "close-up of the Smartboard (Akıllı Tahta) screen, 50mm lens, f/5.6 sharp across four cards.",
    dom: "Smartboard screen displaying four glowing 3D educational icon cards in a 2×2 grid: 1. Uygulama Noktası, 2. Doğrultu, 3. Yön, 4. Büyüklük. Physics: self-luminous UI cards glowing against dark glass (anchor) · 3D icon geometry (micro) · screen glass texture (environment).",
    text: "Diegetic screen text: '1. Uygulama Noktası', '2. Doğrultu', '3. Yön', '4. Büyüklük'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  13: {
    cam: "close-up detail on the Smartboard (Akıllı Tahta) screen, 50mm lens, f/4 on the contact point.",
    dom: "Smartboard screen showing a 3D blue block with a glowing crimson circular dot at the exact point where the force arrow touches, labeled '1. Uygulama Noktası'. Physics: crimson point dot casting halo (anchor) · force arrow touching block face (micro) · screen anti-glare sheen (environment).",
    text: "Diegetic screen text: '1. Uygulama Noktası'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  14: {
    cam: "close-up of the Smartboard (Akıllı Tahta) screen, 50mm lens, f/5.6 on the axis line.",
    dom: "Smartboard screen showing a straight horizontal double-headed axis line extending East-West across a dark digital grid in neon blue, labeled '2. Doğrultu (Doğu – Batı)'. Physics: neon blue line glow casting light on grid (anchor) · double arrowhead axis (micro) · digital glass background (environment).",
    text: "Diegetic screen text: '2. Doğrultu (Doğu – Batı)'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  15: {
    cam: "close-up of the Smartboard (Akıllı Tahta) screen, 50mm lens, f/4 on the arrowhead.",
    dom: "Smartboard screen showing a bright glowing arrow pointing Eastward along the axis line, labeled '3. Yön (Doğu)'. Physics: amber-green arrowhead glow (anchor) · Eastward pointing direction (micro) · screen glass surface (environment).",
    text: "Diegetic screen text: '3. Yön (Doğu)'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  16: {
    cam: "close-up of the Smartboard (Akıllı Tahta) screen, 50mm lens, f/4 on the magnitude text.",
    dom: "Smartboard screen showing a glowing cyan force-vector arrow marked with digital numerals reading '4. Büyüklük: 5 N'. Physics: luminous cyan vector body casting light (anchor) · magnitude measurement bracket (micro) · screen surface reflection (environment).",
    text: "Diegetic screen text: '4. Büyüklük: 5 N'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  17: {
    cam: "medium shot, 40mm lens, f/2.8 on @mira at her desk.",
    dom: "@mira holding a pencil over her open science notebook with a thoughtful curious expression, as a stylized translucent thought bubble above depicting two force arrows pushing a box floats overhead. Physics: window key light on SSS skin (anchor) · pencil tip hovering over notebook (micro) · beechwood desk (environment).",
    text: "CLEAN PLATE — no on-screen text; narration carries meaning.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  18: {
    cam: "medium shot, 40mm lens, f/4 on the teacher beside the Smartboard.",
    dom: "Science teacher smiling warmly beside the illuminated Smartboard, tapping the glass screen as sparkling golden particles fan outward highlighting the Net Force definition. Physics: golden screen-reflected bounce fill (anchor) · finger contact with glass (micro) · classroom background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  19: {
    cam: "full-screen Smartboard (Akıllı Tahta) graphic, 50mm lens, f/5.6.",
    dom: "Smartboard 3D animation showing two separate blue force-vector arrows merging into one large golden net-force arrow pushing a heavy crate, titled 'Bileşke Kuvvet (Net Kuvvet)'. Physics: radiant golden key glow from merged arrow (anchor) · 3D crate pushing forward (micro) · grid floor (environment).",
    text: "Diegetic screen text: 'Bileşke Kuvvet (Net Kuvvet)'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  20: {
    cam: "center-framed shot of the Smartboard screen, 50mm lens, f/4.",
    dom: "Smartboard display featuring a bold embossed 3D capital letter 'R' encircled by a golden aura, with text below reading 'R = Bileşke Kuvvet'. Physics: high-contrast golden key glow from letter R (anchor) · embossed gold rim sheen (micro) · dark screen glass (environment).",
    text: "Diegetic screen text: 'R = Bileşke Kuvvet'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  21: {
    cam: "wide establishing shot, 28mm lens, f/5.6 across the sunny courtyard.",
    dom: "Sunny Turkish school courtyard as the brass school bell rings mid-swing at the top of frame; middle school students stream out for recess. Physics: direct sunlight casting warm pavement bounce (anchor) · students stepping onto yard (micro) · brick building facade (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  22: {
    cam: "medium-wide shot, 35mm lens, f/4 on children near mud patch.",
    dom: "@mira stepping onto the courtyard, noticing @ali and @can crouched near a patch of wet mud trying to free a glossy crimson toy car stuck in the earth. Physics: sunlight key casting warm light on mud (anchor) · boys leaning over car (micro) · wet dark soil texture (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  23: {
    cam: "close-up action shot, 40mm lens, f/2.8 sharp on @ali's hands and toy car.",
    dom: "@ali straining with palms flat against the red toy car, pushing Eastward with a glowing translucent vector arrow labeled '10 N' extending from his hands. Physics: glowing cyan light from 10 N arrow on mud (anchor) · @ali pushing with effort (micro) · stuck toy car in mud (environment).",
    text: "Diegetic 3D vector label: '10 N'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  24: {
    cam: "action shot, 35mm lens, f/4 on both boys pushing together.",
    dom: "@can kneeling beside @ali, adding his hands to the toy car pushing in the exact same Eastward direction, with a second glowing vector arrow labeled '15 N' appearing beside the '10 N' arrow. Physics: dual vector light (cyan and blue) illuminating mud (anchor) · both boys straining together (micro) · red toy car (environment).",
    text: "Diegetic 3D vector labels: '10 N', '15 N'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  25: {
    cam: "low side-profile shot, 35mm lens, f/4 along ground level.",
    dom: "Side profile of @ali and @can pushing side-by-side toward the East; floating above the car are two parallel glowing vector arrows ('10 N' and '15 N') pointing East. Physics: parallel vector light casting blue glow on hands (anchor) · boys pushing in unison (micro) · wet earth with tire track (environment).",
    text: "Diegetic 3D vector labels: '10 N', '15 N →'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  26: {
    cam: "close-up of @mira on the sideline, 50mm lens, f/2.8 on her face.",
    dom: "@mira watching eagerly, counting on her fingers as a glowing floating golden plus sign (+) appears in mid-air between the two force values above the boys. Physics: golden glow from floating + symbol on forehead (anchor) · finger-counting calculation pose (micro) · blurred courtyard background (environment).",
    text: "Diegetic floating 3D symbol: '+'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  27: {
    cam: "floating 3D educational graphic, 40mm lens, f/4 above courtyard.",
    dom: "Luminous floating 3D calculation overlay: 'R = F₁ + F₂ = 10 N + 15 N = 25 N', accompanied by a single large glowing golden net-force arrow of 25 N pointing East. Physics: radiant golden key glow from 25 N net arrow (anchor) · formula typography (micro) · courtyard ground below (environment).",
    text: "Diegetic 3D floating text: 'R = F₁ + F₂ = 10 N + 15 N = 25 N'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  28: {
    cam: "high-energy action shot, 35mm lens, f/4 on toy car trajectory.",
    dom: "Red toy car popping cleanly out of the mud with a fun splash of dirt, shooting forward Eastward propelled by 25 N net force as @ali and @can cheer victoriously. Physics: specular light on flying mud droplets (anchor) · toy car popping out of mud (micro) · boys cheering in background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  29: {
    cam: "medium close-up, 50mm lens, f/2.8 on @mira smiling proudly.",
    dom: "@mira standing proudly with hands on her hips, smiling and nodding knowingly as she realizes forces in the same direction add together. Physics: warm sun key on SSS skin (anchor) · confident head nod (micro) · soft sun-dappled green background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  30: {
    cam: "wide panoramic shot, 28mm lens, f/5.6 across the sports field.",
    dom: "Green grass sports field: two teams of Turkish students lined up on opposite sides of a thick hemp rope for a tug-of-war match, divided by a white chalk center line. Physics: afternoon sun key casting golden light on turf (anchor) · students gripping rope (micro) · grass field + hemp rope (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  31: {
    cam: "medium shot, 40mm lens, f/4 on @mira by the chalk line.",
    dom: "@mira standing near the white chalk line of the field, watching the tug-of-war competition attentively with focused eyes. Physics: sun key on shoulder, green turf bounce (anchor) · attentive observer posture (micro) · chalk line + grass blades (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  32: {
    cam: "close-up on rope center under tension, 40mm lens, f/2.8.",
    dom: "Tug-of-war rope strained tight: West side pulled with glowing purple arrow '30 N' pointing West; East side pulled with glowing orange arrow '20 N' pointing East. Physics: dual vector glow (purple vs orange) on rope fibers (anchor) · rope fibers straining under tension (micro) · green grass below (environment).",
    text: "Diegetic 3D vector labels: '30 N ←', '→ 20 N'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  33: {
    cam: "macro ground-level shot, 50mm lens, f/2.8 on the center ribbon.",
    dom: "Bright red cotton cloth ribbon tied at center of hemp rope, slowly sliding Westward across the white chalk line on green grass. Physics: low sun angle casting long soft shadows (anchor) · red ribbon sliding across chalk line (micro) · hemp fibers + chalk powder (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  34: {
    cam: "medium shot, 40mm lens, f/4 on @mira analyzing directions.",
    dom: "@mira standing at the sideline pointing index fingers in opposite directions (West and East), analyzing the opposing forces along the axis line. Physics: warm sun key on SSS skin (anchor) · dual hand gesture (micro) · sports field background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  35: {
    cam: "close-up character shot, 50mm lens, f/2.8 on @mira's face.",
    dom: "@mira speaking thoughtfully to herself, realizing that forces pulling in opposite directions cannot simply be added together. Physics: key sun on face with cool violet shadow bounce (anchor) · thoughtful micro-expression (micro) · soft background bokeh (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  36: {
    cam: "floating 3D educational infographic, 40mm lens, f/5.6.",
    dom: "Glowing 3D text panel in mid-air showing subtraction rule: 'R = F büyük – F küçük'. Physics: self-luminous 3D text key light casting soft tint (anchor) · formula typography (micro) · sports field below (environment).",
    text: "Diegetic 3D text: 'R = F büyük – F küçük'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  37: {
    cam: "floating 3D calculation graphic, 40mm lens, f/4.",
    dom: "Floating 3D calculation: 'R = 30 N – 20 N = 10 N', with a single net-force vector arrow of 10 N pointing West in deep purple. Physics: radiant purple key glow from 10 N net vector arrow (anchor) · calculation numbers (micro) · sunny field below (environment).",
    text: "Diegetic 3D text: 'R = 30 N – 20 N = 10 N → Batı'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  38: {
    cam: "action shot of rope center, 40mm lens, f/2.8.",
    dom: "Tug-of-war rope strained tight, red ribbon hovering near white chalk line, with a floating golden question mark asking which direction movement will occur. Physics: high-contrast sunlight on strained hemp strands (anchor) · red ribbon at tension threshold (micro) · chalk line on grass (environment).",
    text: "Diegetic floating 3D symbol: '?'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  39: {
    cam: "wide action shot, 28mm lens, f/5.6 on West team.",
    dom: "West tug-of-war team pulling rope Westward and celebrating, as a prominent glowing green arrow points Westward indicating winning net force direction. Physics: saturated green rim light along West team (anchor) · West team pulling rope (micro) · turf grass + rope (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  40: {
    cam: "medium shot, 40mm lens, f/4 on @mira with digital tablet.",
    dom: "@mira holding up a digital tablet displaying final result: 'Bileşke Kuvvet: Batı yönünde 10 N', smiling proudly at her calculation. Physics: tablet screen bounce fill illuminating face (anchor) · holding tablet forward (micro) · aluminium tablet frame + glass screen (environment).",
    text: "Diegetic tablet screen text: 'Bileşke Kuvvet: Batı yönünde 10 N'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  41: {
    cam: "wide interior establishing shot, 28mm lens, f/5.6 in school library.",
    dom: "Tranquil Turkish school library with mahogany bookshelves and green reading lamps; @mira steps quietly into the room after school. Physics: warm tungsten reading-lamp key light at 60° (anchor) · stepping into room (micro) · mahogany shelves + book spines (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  42: {
    cam: "medium shot, 40mm lens, f/4 on @mira at study table.",
    dom: "@mira standing beside a polished wooden library study table, staring intently down at a heavy blue science textbook sitting completely stationary on the table. Physics: warm desk lamp key casting golden pool on table (anchor) · staring down at resting book (micro) · oak table grain (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  43: {
    cam: "close-up shot, 50mm lens, f/2.8 on @mira pondering.",
    dom: "@mira leaning over textbook with chin on hand, curious whether hidden forces act on the resting book. Physics: warm lamp glow on SSS skin (anchor) · chin resting on hand (micro) · blue book cover texture (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  44: {
    cam: "physics diagram overlay on textbook, 50mm lens, f/2.8.",
    dom: "Blue textbook on oak table with two equal glowing vector arrows superimposed: downward blue arrow 'Yer çekimi' (Gravity) and upward cyan arrow 'Masa tepki kuvveti' (Normal Force). Physics: dual luminous vector arrows casting blue/cyan light on book (anchor) · equal opposite force arrows (micro) · blue hardcover book (environment).",
    text: "Diegetic labels: 'Yer çekimi ↓', 'Masa tepki kuvveti ↑'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  45: {
    cam: "animated close-up on textbook surface, 50mm lens, f/2.8.",
    dom: "Two equal vertical force arrows glowing brightly before dissolving into a soft puff of golden sparkle particles that scatter and fade — force cancellation. Physics: golden sparkle key glow scattering outward (anchor) · force arrows dissolving (micro) · book cover texture (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  46: {
    cam: "floating text above resting textbook, 40mm lens, f/4.",
    dom: "Clean glowing 3D text floating above resting textbook: 'Bileşke Kuvvet = 0 N (R = 0 N)', confirming equilibrium state. Physics: self-luminous cyan text key glow over wooden table (anchor) · stationary textbook below (micro) · oak table surface (environment).",
    text: "Diegetic 3D text: 'Bileşke Kuvvet = 0 N (R = 0 N)'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  47: {
    cam: "medium shot, 40mm lens, f/4 on @mira in library.",
    dom: "@mira nodding in clear understanding as glowing 3D title text reading 'DENGELENMİŞ KUVVETLER' appears gracefully above her in teal. Physics: cyan glow from 3D title text on forehead (anchor) · understanding head nod (micro) · mahogany shelves background (environment).",
    text: "Diegetic 3D text: 'DENGELENMİŞ KUVVETLER'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  48: {
    cam: "medium close-up, 50mm lens, f/2.8 on @mira reflecting.",
    dom: "@mira looking around thoughtfully, reflecting that balanced forces apply to objects moving at constant speed, not just resting items. Physics: warm lamp key light with cool window fill (anchor) · thoughtful finger-to-chin pose (micro) · library background bokeh (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  49: {
    cam: "wide panning shot, 28mm lens, f/5.6 on highway.",
    dom: "Sleek modern red car cruising smoothly at steady constant speed on open highway; horizontal force arrows (engine thrust vs friction) are equal and balanced. Physics: sun key with sky bounce on car hood (anchor) · red car cruising at steady speed (micro) · asphalt highway texture (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  50: {
    cam: "aerial camera angle, 35mm lens, f/5.6 in sunny sky.",
    dom: "Skydiver with colourful open parachute gliding effortlessly at constant terminal velocity, with balanced vertical force arrows (gravity down vs air resistance up). Physics: high-sun key with cloud bounce (anchor) · parachute gliding through clouds (micro) · blue sky + clouds (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  51: {
    cam: "dual split-screen visual display, 50mm lens, f/5.6 across panels.",
    dom: "LEFT: car speedometer steady at 90 km/h; RIGHT: skydiver speedometer steady, confirming zero acceleration under balanced forces. Physics: self-luminous digital gauges (anchor) · speedometer needles holding steady (micro) · gauge glass lenses (environment).",
    text: "Diegetic gauge numbers: '90 km/h'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  52: {
    cam: "medium shot, 40mm lens, f/4 on @mira by library window.",
    dom: "@mira looking out through glass window toward garden, her attention caught by sudden motion outside. Physics: window daylight key on face (anchor) · leaning toward window (micro) · window glass reflection (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  53: {
    cam: "high-speed freeze shot, 50mm lens, f/2.8 on falling apple.",
    dom: "Crisp red apple detaching from green branch outside window and accelerating downward under gravity with subtle motion streak. Physics: direct sun key on glossy apple skin (anchor) · apple mid-fall detachment (micro) · green leaves + wood branch (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  54: {
    cam: "action shot, 35mm lens, f/4 on bicycle braking.",
    dom: "Student riding bicycle on paved path, applying brakes as small cat crosses, causing rapid deceleration to a stop. Physics: sun key at 45° casting bicycle shadow (anchor) · brake pad gripping wheel rim (micro) · paved path + rubber tyres (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  55: {
    cam: "medium close-up, 50mm lens, f/2.8 on @mira by window.",
    dom: "@mira watching through window, realizing any change in speed or direction signifies forces are NOT balanced. Physics: daylight key on face with glass reflection (anchor) · shifting expression of deduction (micro) · garden view through glass (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  56: {
    cam: "3D physics diagram, 40mm lens, f/4.",
    dom: "3D educational diagram depicting unequal opposing force vector arrows on a block (large red arrow right vs small blue arrow left), resulting in 'R ≠ 0 N'. Physics: asymmetric vector light glow on block (anchor) · unequal force arrow lengths (micro) · 3D grey block (environment).",
    text: "Diegetic 3D text: 'R ≠ 0 N'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  57: {
    cam: "infographic layout, 40mm lens, f/5.6.",
    dom: "Vibrant 3D infographic titled 'DENGELENMEMİŞ KUVVETLER' demonstrating motion changes: Hızlanma (speeding up), Yavaşlama (slowing down), Yön değiştirme (turning). Physics: warm orange title glow casting amber tint (anchor) · three motion change diagrams (micro) · dark background (environment).",
    text: "Diegetic text: 'DENGELENMEMİŞ KUVVETLER', 'Hızlanma', 'Yavaşlama', 'Yön değiştirme'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  58: {
    cam: "close-up, 50mm lens, f/2.8 on notebook writing.",
    dom: "@mira writing core rule in her science study journal with confident smile, sun glinting off pen tip. Physics: desk light key with pen tip specular flash (anchor) · pen writing mid-stroke (micro) · cream paper journal (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  59: {
    cam: "triptych composite, 40mm lens, f/5.6 across three panels.",
    dom: "Three micro-examples of unbalanced forces: LEFT — rocket accelerating skyward with flame exhaust; CENTER — red car braking at red light; RIGHT — soccer ball curving mid-air. Physics: rocket flame exhaust glow (anchor) · three dynamic unbalanced force actions (micro) · synthetic leather + metallic hull (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  60: {
    cam: "medium shot, 40mm lens, f/4 on @mira in library.",
    dom: "@mira pointing enthusiastically toward viewer with confident smile, summarizing golden science rule. Physics: warm key light with amber rim highlight (anchor) · pointing gesture toward audience (micro) · blurred mahogany shelves (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  61: {
    cam: "wide golden hour shot, 35mm lens, f/4 on sidewalk.",
    dom: "@mira walking home along tree-lined sidewalk at sunset, backpack over shoulders, looking happy after a day of discovery. Physics: low golden sun key at 15° with long shadows (anchor) · walking along sidewalk (micro) · cobblestone + autumn leaves (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  62: {
    cam: "triple split-screen summary graphic, 40mm lens, f/5.6.",
    dom: "Triple summary graphic: LEFT — forces combining in same direction (Aynı yönlü); CENTER — forces opposing in opposite directions (Zıt yönlü); RIGHT — balanced forces in equilibrium (Dengelenmiş R = 0 N). Physics: clean studio key with distinct panel color accents (anchor) · three force system diagrams (micro) · matte graphic backdrop (environment).",
    text: "Diegetic 3D text: 'Aynı yönlü', 'Zıt yönlü', 'Dengelenmiş'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  63: {
    cam: "medium close-up, 50mm lens, f/2.8 on @mira celebrating.",
    dom: "@mira giving energetic thumbs-up with glowing stylized speed-lines and lightning energy FX around her fist. Physics: warm key light with glowing energy FX rim fill (anchor) · thumbs-up celebration pose (micro) · stylized energy trails (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  64: {
    cam: "frontal shot, 40mm lens, f/2.8 on @mira holding quiz card.",
    dom: "@mira holding up bright golden reward question card toward camera with playful inviting expression. Physics: warm key light with golden card reflection on face (anchor) · holding question card forward (micro) · golden foil card (environment).",
    text: "Diegetic 3D card symbol: '?'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  65: {
    cam: "clean 3D educational diagram, 40mm lens, f/4.",
    dom: "Bright blue gift box pulled Northward with glowing coral arrow '15 N' and Southward with equal glowing teal arrow '15 N'. Physics: dual opposing vector lights (coral North vs teal South) on box (anchor) · equal opposite pulling vectors (micro) · blue gift box + grid floor (environment).",
    text: "Diegetic 3D vector labels: '15 N ↑', '15 N ↓'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  66: {
    cam: "close-up of quiz diagram, 50mm lens, f/4.",
    dom: "3D quiz box graphic with floating glowing question marks asking: 'Dengelenmiş kuvvette midir? Bileşke kuvvet kaç N?'. Physics: self-luminous question mark glow casting light on box (anchor) · orbiting floating question marks (micro) · blue box (environment).",
    text: "Diegetic 3D text: 'Dengelenmiş kuvvette midir? Bileşke kuvvet kaç N?'.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  67: {
    cam: "medium shot, 40mm lens, f/4 on @mira gesturing down.",
    dom: "@mira pointing down toward comment section with friendly interactive gesture, inviting viewers to share answers. Physics: warm key light from right with soft shadow fill (anchor) · pointing down gesture (micro) · warm library bokeh (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  68: {
    cam: "close-up shot, 50mm lens, f/2.8 on @mira's hand.",
    dom: "@mira holding glowing 3D atom emblem in open palm, waving warmly to audience with inspiring rim lighting. Physics: cyan glow from atom emblem illuminating face (anchor) · hand waving toward viewer (micro) · luminous 3D atom model (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    neg: "live-action, photorealism, English text, cel shading"
  },
  69: {
    cam: "wide end-title composition, 35mm lens, f/5.6.",
    dom: "@mira waving goodbye beside stylized 3D banner reading 'Mira ile Bir Sonraki Keşifte Görüşmek Üzere!'. Physics: warm cinematic key lighting with festive sparkle particles (anchor) · waving goodbye (micro) · embossed gold 3D banner (environment).",
    text: "Diegetic 3D banner text: 'Mira ile Bir Sonraki Keşifte Görüşmek Üzere!'.",
    neg: "live-action, photorealism, English text, cel shading"
  }
};

function formatMasterPrompt(id, details) {
  return `== RENDER LOCK (world rendering law — verbatim) ==

${RENDER_LOCK}


== SHOW DIRECTIVE (fena fillah show — apply to the frame below) ==

${SHOW_DIRECTIVE}


== CAMERA & VANTAGE (adaptive/bold) ==

${details.cam}


== PALETTE AS LIGHT ==

${PALETTE}


== REFERENCE DNA (subordinate) ==

${REF_DNA}


== DOMINANT ELEMENT (the promise this frame is judged against) ==

${details.dom}


== ON-SCREEN TEXT ==

${details.text}


== LANGUAGE LOCK ==

${LANGUAGE_LOCK}


== CAST LOCK ==

${CAST_LOCK}


== NEGATIVE ==

Frame-specific: ${details.neg}.

Baseline: ${BASELINE_NEGATIVE}


Clean, motion-ready, jaw-dropping start frame.`;
}

let mdContent = `# MAMILAS — 6. Sınıf Kuvvet (69 Sahne) MASTER RenderMan Feature-Animation Prompt Paket\n\n`;
mdContent += `> **Mimarisi:** Full MAMILAS Master Prompt Structure (RENDER LOCK / SHOW DIRECTIVE / CAMERA & VANTAGE / PALETTE / DOMINANT / TEXT / LANGUAGE LOCK / CAST LOCK / NEGATIVE)\n`;
mdContent += `> **Motor / Diyalekt:** Fal Nano Banana 2 (Magnific / NB2)\n`;
mdContent += `> **Görsel Mimari:** Pixar RenderMan / RenderMan-successor premium-CG feature-animation pipeline lineage\n`;
mdContent += `> **Karakter Etiketleme:** @mira, @ali, @can (fiziksel tanım yapılmadan doğrudan Magnific handle kilitli)\n`;
mdContent += `> **Dil:** %100 Türkçe Metin Kilidi (TÜRKÇE METİN KİLİDİ)\n\n`;
mdContent += `---\n\n`;

for (let i = 1; i <= 69; i++) {
  const details = sceneDetails[i] || sceneDetails[1];
  const prompt = formatMasterPrompt(i, details);

  mdContent += `## Sahne ${i}\n\n`;
  mdContent += `\`\`\`text\n${prompt}\n\`\`\`\n\n`;
  mdContent += `---\n\n`;
}

const mdFilePath = path.join(outputDir, 'SAHNE-PROMPTLAR-MASTER.md');
fs.writeFileSync(mdFilePath, mdContent, 'utf8');
console.log('Successfully saved full Master RenderMan prompt package to:', mdFilePath);
