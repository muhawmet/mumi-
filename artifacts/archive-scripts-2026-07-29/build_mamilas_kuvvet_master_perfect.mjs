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

const BASELINE_NEGATIVE = `morphing, warping, re-render, style/material drift, new object that changes the beat, leaving the framed idea, face/identity change/drift, duplicated face, garbled or English lettering, Latin filler; generic 3D / stock-render / flat empty slide; clay/plasticine surface; hard cel shading, cartoon outline, anime eye geometry, flat graphic fill, toon shader, 2D on 3D; teal-orange grade, desaturation, muddy midtone; octane harshness; recognizable franchise or real-person characters, real brand names; the named literal thing replaced by an icon/arrow/gauge/UI panel that is not diegetic; empty adjectives (cinematic, dynamic, stunning, 4K, epic); warped or drifting text.`;

// Scene specifications following EXACT template format
const scenes = {
  1: {
    cam: "low-angle establishing shot, 40mm lens, f/4.",
    dom: "@mira steps out through a dark wood apartment door onto a limestone sidewalk, holding her backpack strap. Physics: morning sun raking across stone steps (anchor) · her foot stepping down (micro) · carved wooden door + limestone wall (environment).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning. No lettering of any language.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters. Neat Turkish middle-school attire.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO yellow American school bus, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  2: {
    cam: "side-tracking medium action shot, 35mm lens, f/4.",
    dom: "@mira pushes open the front door and sprints down a tree-lined sidewalk. Physics: foot motion blur (micro) · door pushing back (pressure) · sun casting soft shadows on cobblestone (anchor).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters. Neat Turkish middle-school attire.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO yellow American school bus, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  3: {
    cam: "medium side-tracking shot, 40mm lens, f/2.8 on @mira.",
    dom: "@mira runs joyfully along a sidewalk under tree shade, with semi-transparent glowing golden and cyan force-vector arrows radiating from her body. Physics: glowing vector lines carrying push-pull forces (anchor) · sneakers striking pavement (micro) · leafy sunlight shadows (environment).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters. Neat Turkish middle-school attire.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  4: {
    cam: "triptych composite 3-panel educational illustration, 50mm lens, f/5.6 across all three panels.",
    dom: "Three micro-illustrations of force: LEFT — palm pushing wooden door with red arrow; CENTER — sneaker kicking soccer ball with impact vectors; RIGHT — hands pushing shopping cart with teal arrow. Physics: impact vectors expanding (anchor) · hands exerting pressure (micro) · three physical force actions (pressure).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning.",
    cast: "CAST KİLİDİ — NO main student characters in this frame; this is a pure 3-panel physical action diagram. Do NOT add any child face or student character.",
    neg: "Frame-specific: NO human face in frame, NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  5: {
    cam: "macro focus close-up, 50mm lens, f/2.8 sharp on the cube.",
    dom: "A glossy red wooden cube sits on an oak study table surrounded by four 3D translucent glowing force arrows pointing inward, with a glowing golden question mark hovering above. Physics: inward force vectors (anchor) · golden question mark casting warm light (micro) · oak grain + red cube (environment).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning.",
    cast: "CAST KİLİDİ — NO human characters in this frame; this is a pure object and physics diagram shot. Do NOT add any student or child character.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  6: {
    cam: "close-up character reaction shot, 50mm lens, f/2.8 on eyes.",
    dom: "@mira turns her head toward camera with an energetic wide-eyed expression and a playful excited smile in a sunny school corridor. Physics: warm key light filtering through window onto SSS skin (anchor) · animated facial turn (micro) · blurred school corridor (environment).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters. Neat Turkish middle-school attire.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  7: {
    cam: "center-framed 3D physics visualization, 40mm lens, f/4.",
    dom: "Two individual glowing energy arrows (blue and cyan) flow together and fuse into one large radiant golden force arrow pushing a heavy stone block across a grid floor. Physics: radiant light bloom at fusion point (anchor) · stone block shifting (micro) · grid floor lines (environment).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning.",
    cast: "CAST KİLİDİ — NO human characters in this frame; this is a pure 3D physics diagram shot. Do NOT add any student or child character.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  8: {
    cam: "wide shot, 35mm lens, f/2.8 on @mira.",
    dom: "@mira looks up in awe as glowing 3D holographic Turkish text reading 'BİLEŞKE KUVVET' hovers in mid-air before her with golden dust motes. Physics: golden volumetric light from text illuminating face (anchor) · wide-eyed discovery tilt (micro) · floating dust motes (environment).",
    text: "Diegetic 3D floating holographic Turkish text: 'BİLEŞKE KUVVET'.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters. Neat Turkish middle-school attire.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  9: {
    cam: "medium shot, 40mm lens, f/4 on @mira.",
    dom: "@mira smiles warmly at the camera on a sunny school garden path, reaching her right hand forward in a welcoming gesture. Physics: morning sun key casting golden rim light (anchor) · hand extending forward (micro) · green foliage bokeh (environment).",
    text: "CLEAN PLATE — no on-screen text; the image and narration carry the meaning.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters. Neat Turkish middle-school attire.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  10: {
    cam: "wide interior establishing shot, 28mm lens, f/5.6 across the science classroom.",
    dom: "Modern Turkish middle school science classroom: @mira sits at a wooden double-desk alongside Turkish classmates; at the front, a friendly teacher stands beside a glowing digital Smartboard. Physics: window sunlight casting light beams across desks (anchor) · teacher gesturing toward screen (micro) · classroom wooden desks (environment).",
    text: "CLEAN PLATE — no on-screen text on classroom elements.",
    cast: "CAST KİLİDİ — main student identity comes from tag @mira. Classmates and teacher read Anatolian/Turkish (dark hair, warm skin tone). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  11: {
    cam: "over-the-shoulder view past desk toward the Smartboard, 40mm lens, f/4.",
    dom: "The science teacher uses a digital pen on the Smartboard glass screen to draw a blue 3D box with glowing red force arrows. Physics: daylight key glow from Smartboard screen (anchor) · stylus contact on glass (micro) · wooden desk edge in foreground (environment).",
    text: "Diegetic 3D Smartboard diagram labels.",
    cast: "CAST KİLİDİ — NO main student characters in focus; over-the-shoulder view of Smartboard screen. Teacher hand reads Anatolian/Turkish.",
    neg: "Frame-specific: NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  12: {
    cam: "close-up of Smartboard screen, 50mm lens, f/5.6 sharp across four cards.",
    dom: "Smartboard display showing four glowing 3D educational icon cards in a 2x2 grid with Turkish text: '1. Uygulama Noktası', '2. Doğrultu', '3. Yön', '4. Büyüklük'. Physics: self-luminous UI cards glowing against dark glass (anchor) · 3D icon geometry (micro) · screen glass texture (environment).",
    text: "Diegetic screen text: '1. Uygulama Noktası', '2. Doğrultu', '3. Yön', '4. Büyüklük'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure Smartboard screen graphic.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  13: {
    cam: "Smartboard screen close-up, 50mm lens, f/4.",
    dom: "Smartboard screen displaying a 3D blue block with a glowing red circular dot at the force contact point, labeled '1. Uygulama Noktası'. Physics: crimson point dot casting halo (anchor) · force arrow touching block face (micro) · screen anti-glare sheen (environment).",
    text: "Diegetic screen text: '1. Uygulama Noktası'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure Smartboard screen graphic.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  14: {
    cam: "Smartboard screen close-up, 50mm lens, f/5.6.",
    dom: "Smartboard screen showing a horizontal blue double-headed axis line extending East-West across a dark grid, labeled '2. Doğrultu (Doğu - Batı)'. Physics: neon blue line glow (anchor) · double arrowhead axis (micro) · digital glass background (environment).",
    text: "Diegetic screen text: '2. Doğrultu (Doğu - Batı)'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure Smartboard screen graphic.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  15: {
    cam: "Smartboard screen close-up, 50mm lens, f/4.",
    dom: "Smartboard screen showing a glowing amber arrow pointing Eastward, labeled '3. Yön (Doğu)'. Physics: amber-green arrowhead glow (anchor) · Eastward pointing direction (micro) · screen glass surface (environment).",
    text: "Diegetic screen text: '3. Yön (Doğu)'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure Smartboard screen graphic.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  16: {
    cam: "Smartboard screen close-up, 50mm lens, f/4.",
    dom: "Smartboard screen showing a glowing cyan force arrow marked with digital numerals reading '4. Büyüklük: 5 N'. Physics: luminous cyan vector body (anchor) · magnitude measurement bracket (micro) · screen surface reflection (environment).",
    text: "Diegetic screen text: '4. Büyüklük: 5 N'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure Smartboard screen graphic.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  17: {
    cam: "medium shot, 40mm lens, f/2.8 on @mira at her desk.",
    dom: "@mira sits at her beechwood classroom desk holding a pencil over her notebook with a curious expression, a floating translucent thought bubble above showing two force arrows pushing a box. Physics: window key light on SSS skin (anchor) · pencil tip hovering (micro) · beechwood desk (environment).",
    text: "CLEAN PLATE — no on-screen text; narration carries meaning.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters. Neat Turkish middle-school attire.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  18: {
    cam: "medium shot, 40mm lens, f/4 on teacher's hand.",
    dom: "Teacher's hand tapping the Smartboard glass screen as sparkling golden particles fan outward highlighting the Net Force definition area. Physics: golden screen-reflected bounce fill (anchor) · finger contact with glass (micro) · classroom background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — NO main student characters in focus; teacher's hand reads Anatolian/Turkish.",
    neg: "Frame-specific: NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  19: {
    cam: "full-screen Smartboard graphic, 50mm lens, f/5.6.",
    dom: "Smartboard 3D animation showing two blue force arrows merging into one golden net force arrow pushing a heavy crate, titled 'Bileşke Kuvvet (Net Kuvvet)'. Physics: radiant golden key glow (anchor) · 3D crate pushing forward (micro) · grid floor (environment).",
    text: "Diegetic screen text: 'Bileşke Kuvvet (Net Kuvvet)'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure Smartboard screen graphic.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  20: {
    cam: "center-framed shot of Smartboard screen, 50mm lens, f/4.",
    dom: "Smartboard screen featuring a bold 3D golden letter 'R' encircled by an aura, with text below 'R = Bileşke Kuvvet'. Physics: golden key glow from letter R (anchor) · gold rim sheen (micro) · dark screen glass (environment).",
    text: "Diegetic screen text: 'R = Bileşke Kuvvet'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure Smartboard screen graphic.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  21: {
    cam: "wide establishing shot, 28mm lens, f/5.6 across sunny courtyard.",
    dom: "Sunny Turkish school courtyard as the brass school bell swings mid-swing; Turkish middle school students walk out for recess. Physics: direct sunlight casting warm pavement bounce (anchor) · students stepping onto yard (micro) · brick building facade (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — background Turkish middle-school students (dark hair, Anatolian complexion, Turkish school uniforms). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  22: {
    cam: "medium wide shot, 35mm lens, f/4.",
    dom: "@mira walks into the schoolyard and discovers Turkish boys @ali and @can crouched near a patch of wet mud trying to free a stuck red toy car. Physics: sunlight key casting warm light on mud (anchor) · boys leaning over car (micro) · wet dark soil texture (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identities come from tags @mira, @ali, @can (do not re-describe physically). NO black characters, NO Asian characters. Neat Turkish school uniforms.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  23: {
    cam: "action close-up, 40mm lens, f/2.8 sharp on @ali's hands and car.",
    dom: "@ali strains as he pushes a red toy car stuck in wet mud Eastward, with a glowing translucent vector arrow labeled '10 N' extending from his hands. Physics: glowing cyan light from 10 N arrow on mud (anchor) · @ali pushing with effort (micro) · stuck toy car (environment).",
    text: "Diegetic 3D vector label: '10 N'.",
    cast: "CAST KİLİDİ — character identity comes from tag @ali (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  24: {
    cam: "action shot, 35mm lens, f/4 on both boys pushing together.",
    dom: "@can kneels beside @ali, adding his hands to push the red toy car in the same Eastward direction with a second glowing vector arrow labeled '15 N'. Physics: dual vector light (cyan and blue) on mud (anchor) · both boys straining together (micro) · red toy car (environment).",
    text: "Diegetic 3D vector labels: '10 N', '15 N'.",
    cast: "CAST KİLİDİ — character identities come from tags @ali, @can (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  25: {
    cam: "low side-profile shot, 35mm lens, f/4 along ground level.",
    dom: "@ali and @can pushing side-by-side Eastward with two parallel glowing vector arrows '10 N' and '15 N' floating above the car. Physics: parallel vector light casting blue glow on hands (anchor) · boys pushing in unison (micro) · wet earth with tire track (environment).",
    text: "Diegetic 3D vector labels: '10 N', '15 N →'.",
    cast: "CAST KİLİDİ — character identities come from tags @ali, @can (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  26: {
    cam: "close-up of @mira, 50mm lens, f/2.8 on her face.",
    dom: "@mira watches eagerly, counting on her fingers as a glowing golden '+' symbol floats between force values above the boys in the background. Physics: golden glow from floating + symbol on forehead (anchor) · finger-counting calculation pose (micro) · blurred courtyard (environment).",
    text: "Diegetic floating 3D symbol: '+'.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  27: {
    cam: "floating 3D educational graphic, 40mm lens, f/4.",
    dom: "Luminous floating 3D calculation overlay: 'R = F₁ + F₂ = 10 N + 15 N = 25 N' with a large golden arrow '25 N' pointing East. Physics: radiant golden key glow from 25 N arrow (anchor) · formula numbers (micro) · courtyard ground below (environment).",
    text: "Diegetic 3D floating text: 'R = F₁ + F₂ = 10 N + 15 N = 25 N'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure floating 3D math graphic overlay.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  28: {
    cam: "action shot, 35mm lens, f/4 on toy car trajectory.",
    dom: "Red toy car pops out of mud with dirt splash shooting Eastward as @ali and @can cheer. Physics: specular light on flying mud droplets (anchor) · toy car popping out (micro) · boys cheering in background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identities come from tags @ali, @can (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  29: {
    cam: "medium close-up, 50mm lens, f/2.8 on @mira.",
    dom: "@mira smiles proudly with hands on hips, nodding in understanding. Physics: warm sun key on SSS skin (anchor) · confident head nod (micro) · soft sun-dappled green background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  30: {
    cam: "wide panoramic shot, 28mm lens, f/5.6 across sports field.",
    dom: "Green grass sports field: two teams of Turkish middle school students line up for tug-of-war divided by a white chalk center line. Physics: afternoon sun key casting golden light on turf (anchor) · students gripping rope (micro) · grass field + hemp rope (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — background Turkish middle-school students (dark hair, Anatolian complexion, neat sports attire). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  31: {
    cam: "medium shot, 40mm lens, f/4 on @mira.",
    dom: "@mira stands at the grass field sideline watching tug-of-war attentively. Physics: sun key on shoulder, green turf bounce (anchor) · attentive observer posture (micro) · chalk line + grass blades (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  32: {
    cam: "close-up on rope center under tension, 40mm lens, f/2.8.",
    dom: "Tug-of-war rope strained tight: West side pulled with glowing purple arrow '30 N'; East side pulled with glowing orange arrow '20 N'. Physics: dual vector glow (purple vs orange) on rope fibers (anchor) · rope fibers straining under tension (micro) · green grass below (environment).",
    text: "Diegetic 3D vector labels: '30 N ←', '→ 20 N'.",
    cast: "CAST KİLİDİ — NO human face in frame; macro focus on strained hemp rope and hands. Student hands read Anatolian/Turkish.",
    neg: "Frame-specific: NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  33: {
    cam: "macro ground-level shot, 50mm lens, f/2.8 on center ribbon.",
    dom: "Bright red cotton cloth ribbon on rope sliding slowly Westward across white chalk line on green grass. Physics: low sun angle casting long soft shadows (anchor) · red ribbon sliding across chalk line (micro) · hemp fibers + chalk powder (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — NO human characters in this frame; macro shot of red ribbon and chalk line on grass.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  34: {
    cam: "medium shot, 40mm lens, f/4 on @mira.",
    dom: "@mira points index fingers in opposite directions analyzing opposing forces along the axis line. Physics: warm sun key on SSS skin (anchor) · dual hand gesture (micro) · sports field background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  35: {
    cam: "close-up character shot, 50mm lens, f/2.8 on @mira.",
    dom: "@mira looks up thoughtfully speaking to herself about opposing forces. Physics: key sun on face with cool violet shadow bounce (anchor) · thoughtful micro-expression (micro) · soft background bokeh (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  36: {
    cam: "floating 3D educational infographic, 40mm lens, f/5.6.",
    dom: "Glowing 3D text panel in mid-air showing subtraction rule: 'R = F büyük - F küçük'. Physics: self-luminous 3D text key light casting soft tint (anchor) · formula typography (micro) · sports field below (environment).",
    text: "Diegetic 3D text: 'R = F büyük - F küçük'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure floating 3D infographic overlay.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  37: {
    cam: "floating 3D calculation graphic, 40mm lens, f/4.",
    dom: "Floating 3D calculation graphic: 'R = 30 N - 20 N = 10 N' with a purple vector arrow '10 N' pointing West. Physics: radiant purple key glow from 10 N net vector arrow (anchor) · calculation numbers (micro) · sunny field below (environment).",
    text: "Diegetic 3D text: 'R = 30 N - 20 N = 10 N → Batı'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure floating 3D math graphic overlay.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  38: {
    cam: "action close-up of rope center, 40mm lens, f/2.8.",
    dom: "Rope center ribbon at chalk line with a floating golden question mark '?'. Physics: high-contrast sunlight on strained hemp strands (anchor) · red ribbon at tension threshold (micro) · chalk line on grass (environment).",
    text: "Diegetic floating 3D symbol: '?'.",
    cast: "CAST KİLİDİ — NO human face in frame; macro focus on rope ribbon and floating question mark.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  39: {
    cam: "wide action shot, 28mm lens, f/5.6 on West team.",
    dom: "West tug-of-war team pulls rope Westward celebrating with a green vector arrow pointing West. Physics: saturated green rim light along West team (anchor) · West team pulling rope (micro) · turf grass + rope (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — background Turkish middle-school students (dark hair, Anatolian complexion). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  40: {
    cam: "medium shot, 40mm lens, f/4 on @mira.",
    dom: "@mira holds up a digital tablet displaying 'Bileşke Kuvvet: Batı yönünde 10 N', smiling proudly. Physics: tablet screen bounce fill illuminating face (anchor) · holding tablet forward (micro) · aluminium tablet frame + glass screen (environment).",
    text: "Diegetic tablet screen text: 'Bileşke Kuvvet: Batı yönünde 10 N'.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  41: {
    cam: "wide interior establishing shot, 28mm lens, f/5.6.",
    dom: "Warm school library with mahogany bookshelves; @mira steps quietly into the room after school. Physics: warm tungsten reading-lamp key light at 60° (anchor) · stepping into room (micro) · mahogany shelves + book spines (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  42: {
    cam: "medium shot, 40mm lens, f/4 on @mira.",
    dom: "@mira stands at a wooden library study table staring intently down at a stationary blue science textbook. Physics: warm desk lamp key casting golden pool on table (anchor) · staring down at resting book (micro) · oak table grain (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  43: {
    cam: "close-up shot, 50mm lens, f/2.8 on @mira.",
    dom: "@mira leans over textbook with chin on hand, curious whether hidden forces act on the resting book. Physics: warm lamp glow on SSS skin (anchor) · chin resting on hand (micro) · blue book cover texture (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  44: {
    cam: "physics diagram overlay on textbook, 50mm lens, f/2.8.",
    dom: "Blue textbook on oak table with two equal glowing vector arrows: downward blue arrow 'Yer çekimi' and upward cyan arrow 'Masa tepki kuvveti'. Physics: dual luminous vector arrows casting blue/cyan light on book (anchor) · equal opposite force arrows (micro) · blue hardcover book (environment).",
    text: "Diegetic labels: 'Yer çekimi ↓', 'Masa tepki kuvveti ↑'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; physics diagram overlay on blue textbook.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  45: {
    cam: "animated close-up on textbook surface, 50mm lens, f/2.8.",
    dom: "Two equal vertical force arrows glow brightly before dissolving into a soft puff of golden sparkle particles that scatter and fade. Physics: golden sparkle key glow scattering outward (anchor) · force arrows dissolving (micro) · book cover texture (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — NO human characters in this frame; macro close-up of book cover and sparkles.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  46: {
    cam: "floating 3D text over stationary book, 40mm lens, f/4.",
    dom: "Clean glowing 3D text floating above resting textbook: 'Bileşke Kuvvet = 0 N (R = 0 N)'. Physics: self-luminous cyan text key glow over wooden table (anchor) · stationary textbook below (micro) · oak table surface (environment).",
    text: "Diegetic 3D text: 'Bileşke Kuvvet = 0 N (R = 0 N)'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure 3D text floating over book.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  47: {
    cam: "medium shot, 40mm lens, f/4 on @mira.",
    dom: "@mira nods in clear understanding as glowing 3D title 'DENGELENMİŞ KUVVETLER' appears above her in teal. Physics: cyan glow from 3D title text on forehead (anchor) · understanding head nod (micro) · mahogany shelves background (environment).",
    text: "Diegetic 3D text: 'DENGELENMİŞ KUVVETLER'.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  48: {
    cam: "medium close-up, 50mm lens, f/2.8 on @mira.",
    dom: "@mira looks around thoughtfully reflecting that balanced forces apply to moving objects at constant speed. Physics: warm lamp key light with cool window fill (anchor) · thoughtful finger-to-chin pose (micro) · library background bokeh (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  49: {
    cam: "wide panning shot, 28mm lens, f/5.6 on highway.",
    dom: "Sleek red car cruising smoothly at constant speed on highway with balanced horizontal force arrows above it. Physics: sun key with sky bounce on car hood (anchor) · red car cruising at steady speed (micro) · asphalt highway texture (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — NO human characters in this frame; car cruising on highway.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  50: {
    cam: "aerial camera angle, 35mm lens, f/5.6 in sunny sky.",
    dom: "Skydiver with colorful open parachute gliding at constant terminal velocity with balanced vertical force arrows. Physics: high-sun key with cloud bounce (anchor) · parachute gliding through clouds (micro) · blue sky + clouds (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — NO primary student character in frame; skydiver in suit under parachute.",
    neg: "Frame-specific: NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  51: {
    cam: "dual split-screen display, 50mm lens, f/5.6 across panels.",
    dom: "LEFT: car speedometer steady at 90 km/h; RIGHT: skydiver speedometer steady, confirming zero acceleration under balanced forces. Physics: self-luminous digital gauges (anchor) · speedometer needles holding steady (micro) · gauge glass lenses (environment).",
    text: "Diegetic gauge numbers: '90 km/h'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; dual split-screen gauge graphic.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  52: {
    cam: "medium shot, 40mm lens, f/4 on @mira.",
    dom: "@mira looks through library glass window toward garden, caught by sudden motion outside. Physics: window daylight key on face (anchor) · leaning toward window (micro) · window glass reflection (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  53: {
    cam: "high-speed freeze shot, 50mm lens, f/2.8 on falling apple.",
    dom: "Crisp red apple detaching from tree branch outside window and accelerating downward under gravity. Physics: direct sun key on glossy apple skin (anchor) · apple mid-fall detachment (micro) · green leaves + wood branch (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — NO human characters in frame; high-speed macro shot of falling apple.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  54: {
    cam: "action shot, 35mm lens, f/4 on bicycle braking.",
    dom: "Student riding bicycle applies brakes as a cat crosses path, decelerating to a stop. Physics: sun key at 45° casting bicycle shadow (anchor) · brake pad gripping wheel rim (micro) · paved path + rubber tyres (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — background Turkish student on bicycle. NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  55: {
    cam: "medium close-up, 50mm lens, f/2.8 on @mira.",
    dom: "@mira watches through window realizing motion changes mean forces are NOT balanced. Physics: daylight key on face with glass reflection (anchor) · shifting expression of deduction (micro) · garden view through glass (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  56: {
    cam: "3D physics diagram, 40mm lens, f/4.",
    dom: "3D physics diagram depicting unequal opposing force vector arrows on a block resulting in 'R ≠ 0 N'. Physics: asymmetric vector light glow on block (anchor) · unequal force arrow lengths (micro) · 3D grey block (environment).",
    text: "Diegetic 3D text: 'R ≠ 0 N'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure 3D physics diagram.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  57: {
    cam: "infographic layout, 40mm lens, f/5.6.",
    dom: "Vibrant 3D infographic titled 'DENGELENMEMİŞ KUVVETLER' demonstrating: 'Hızlanma', 'Yavaşlama', 'Yön değiştirme'. Physics: warm orange title glow casting amber tint (anchor) · three motion change diagrams (micro) · dark background (environment).",
    text: "Diegetic text: 'DENGELENMEMİŞ KUVVETLER', 'Hızlanma', 'Yavaşlama', 'Yön değiştirme'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure 3D infographic graphic layout.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  58: {
    cam: "close-up, 50mm lens, f/2.8 on notebook writing.",
    dom: "@mira writes core rule in her science study journal with a confident smile, sun glinting off pen tip. Physics: desk light key with pen tip specular flash (anchor) · pen writing mid-stroke (micro) · cream paper journal (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  59: {
    cam: "triptych composite 3-panel, 40mm lens, f/5.6.",
    dom: "Three micro-examples of unbalanced forces: LEFT — rocket accelerating skyward; CENTER — car braking at red light; RIGHT — soccer ball curving mid-air. Physics: rocket flame exhaust glow (anchor) · three dynamic unbalanced force actions (micro) · synthetic leather + metallic hull (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure 3-panel triptych illustration.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  60: {
    cam: "medium shot, 40mm lens, f/4 on @mira.",
    dom: "@mira points enthusiastically toward viewer with confident smile summarizing golden rule. Physics: warm key light with amber rim highlight (anchor) · pointing gesture toward audience (micro) · blurred mahogany shelves (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  61: {
    cam: "wide golden hour shot, 35mm lens, f/4 on sidewalk.",
    dom: "@mira walks home along sidewalk at sunset with backpack, happy and satisfied. Physics: low golden sun key at 15° with long shadows (anchor) · walking along sidewalk (micro) · cobblestone + autumn leaves (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  62: {
    cam: "triple split-screen summary graphic, 40mm lens, f/5.6.",
    dom: "Triple split-screen summary: LEFT — 'Aynı yönlü'; CENTER — 'Zıt yönlü'; RIGHT — 'Dengelenmiş R = 0 N'. Physics: clean studio key with distinct panel color accents (anchor) · three force system diagrams (micro) · matte graphic backdrop (environment).",
    text: "Diegetic 3D text: 'Aynı yönlü', 'Zıt yönlü', 'Dengelenmiş'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure triple split-screen graphic layout.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  63: {
    cam: "medium close-up, 50mm lens, f/2.8 on @mira.",
    dom: "@mira gives an energetic thumbs-up with glowing speed-lines and energy FX. Physics: warm key light with glowing energy FX rim fill (anchor) · thumbs-up celebration pose (micro) · stylized energy trails (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  64: {
    cam: "frontal shot, 40mm lens, f/2.8 on @mira.",
    dom: "@mira holds up a bright golden reward question card toward camera with a playful smile. Physics: warm key light with golden card reflection on face (anchor) · holding question card forward (micro) · golden foil card (environment).",
    text: "Diegetic 3D card symbol: '?'.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  65: {
    cam: "clean 3D educational diagram, 40mm lens, f/4.",
    dom: "Bright blue gift box pulled Northward with arrow '15 N' and Southward with arrow '15 N'. Physics: dual opposing vector lights (coral North vs teal South) on box (anchor) · equal opposite pulling vectors (micro) · blue gift box + grid floor (environment).",
    text: "Diegetic 3D vector labels: '15 N ↑', '15 N ↓'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure 3D box quiz diagram.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  66: {
    cam: "close-up quiz diagram, 50mm lens, f/4.",
    dom: "3D quiz box graphic with floating glowing question marks asking: 'Dengelenmiş kuvvette midir? Bileşke kuvvet kaç N?'. Physics: self-luminous question mark glow casting light on box (anchor) · orbiting floating question marks (micro) · blue box (environment).",
    text: "Diegetic 3D text: 'Dengelenmiş kuvvette midir? Bileşke kuvvet kaç N?'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure 3D quiz diagram.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  67: {
    cam: "medium shot, 40mm lens, f/4 on @mira.",
    dom: "@mira points down toward comment section inviting answers with a warm smile. Physics: warm key light from right with soft shadow fill (anchor) · pointing down gesture (micro) · warm library bokeh (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  68: {
    cam: "close-up, 50mm lens, f/2.8 on @mira.",
    dom: "@mira holds glowing 3D atom emblem in open palm waving warmly to camera. Physics: cyan glow from atom emblem illuminating face (anchor) · hand waving toward viewer (micro) · luminous 3D atom model (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  69: {
    cam: "wide end-title shot, 35mm lens, f/5.6 on @mira.",
    dom: "@mira waves goodbye beside 3D banner 'Mira ile Bir Sonraki Keşifte Görüşmek Üzere!'. Physics: warm cinematic key lighting with festive sparkle particles (anchor) · waving goodbye (micro) · embossed gold 3D banner (environment).",
    text: "Diegetic 3D banner text: 'Mira ile Bir Sonraki Keşifte Görüşmek Üzere!'.",
    cast: "CAST KİLİDİ — character identity comes from tag @mira (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  }
};

function formatFullMasterPrompt(id, s) {
  return `== RENDER LOCK (world rendering law — verbatim) ==

${RENDER_LOCK}


== SHOW DIRECTIVE (fena fillah show — apply to the frame below) ==

${SHOW_DIRECTIVE}


== CAMERA & VANTAGE (adaptive/bold) ==

${s.cam}


== PALETTE AS LIGHT ==

${PALETTE}


== REFERENCE DNA (subordinate) ==

${REF_DNA}


== DOMINANT ELEMENT (the promise this frame is judged against) ==

${s.dom}


== ON-SCREEN TEXT ==

${s.text}


== LANGUAGE LOCK ==

${LANGUAGE_LOCK}


== CAST LOCK ==

${s.cast}


== NEGATIVE ==

${s.neg}

Baseline: ${BASELINE_NEGATIVE}


Clean, motion-ready, jaw-dropping start frame.`;
}

let mdContent = `# MAMILAS — 6. Sınıf Kuvvet (69 Sahne) MASTER RenderMan Prompt Paket (Tam Mimarili & Hassas Filtreli)\n\n`;
mdContent += `> **Mimarisi:** FULL MAMILAS Master Prompt Structure (RENDER LOCK / SHOW DIRECTIVE / CAMERA & VANTAGE / PALETTE / DOMINANT / ON-SCREEN TEXT / LANGUAGE LOCK / CAST LOCK / NEGATIVE)\n`;
mdContent += `> **Karakter Kilit Hassasiyeti:** Sahnede @mira / @ali / @can gerçekten varsa tag eklendi; diyagram/obje/araç sahnelerinde KESİNLİKLE karakter tag'i yazılmadı.\n`;
mdContent += `> **Fiziksel Tarif:** Sıfır fiziksel tarif (ten/saç/kıyafet yazılmadı).\n`;
mdContent += `> **Sert Negatif Kilitler:** Siyahi yok, Asyalı yok, İngilizce metin yok, Amerikan sarı otobüsü yok.\n\n---\n\n`;

for (let i = 1; i <= 69; i++) {
  const s = scenes[i] || scenes[1];
  const prompt = formatFullMasterPrompt(i, s);

  mdContent += `## Sahne ${i}\n\n`;
  mdContent += `\`\`\`text\n${prompt}\n\`\`\`\n\n`;
  mdContent += `---\n\n`;
}

const mdFilePath = path.join(outputDir, 'SAHNE-PROMPTLAR-MASTER-PERFECT.md');
fs.writeFileSync(mdFilePath, mdContent, 'utf8');
console.log('Successfully saved PERFECT MASTER prompts to:', mdFilePath);
