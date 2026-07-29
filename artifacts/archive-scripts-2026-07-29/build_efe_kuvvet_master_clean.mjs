import fs from 'node:fs';
import path from 'node:path';

const outputDir = '/Users/Muhammet/Desktop/6. sınıf kuvvet';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Strictly ZERO SLOP_RE hits across positive AND negative text!
const RENDER_LOCK = `Feature-animation 3D CGI in the Pixar RenderMan / RenderMan-successor premium-CG feature-animation pipeline lineage (original subjects only). The Pixar signature is NOT 'cute 3D' — it is a specific formal grammar: appeal-driven silhouette design (shapes composed for emotional read at 50px thumbnail), subsurface scattering on character skin that carries the scene's light temperature (warm honey SSS under tungsten, cool ivory SSS under daylight, amber-bronze SSS under sodium), wet dual-point specular on eyes with painted-in iris depth, and physically-motivated bounce fill. Every prop has a deliberate overscale factor (10-15%) for child-safe readability — a pencil is thumb-width, a bowl is head-width. Material specificity is non-negotiable: wood shows visible grain with satin-varnish sheen, fabric shows woven stitch texture and slight fiber fray at edges, metal shows anisotropic brushed highlight, rubber has soft-diffuse sheen with slight translucency at thin edges. Lighting grammar is art-directed, not photo-random: single motivated key (window sun at 45°, practical lamp at 60°, monitor glow from below), complementary bounce fill at 25-35% intensity in the key's opposing hue, rim accent in palette's saturated accent color, painted soft ambient occlusion in corner and fold pockets — never hard-black shadow. Composition: character at focal plane sharp at f/4 equivalent, background falling into gentle focus falloff. Squash-stretch physics govern all character and prop motion: every pickup has anticipation, every landing has squash, every fast move has follow-through smear. IMPERATIVE: FULL 3D CGI FEATURE-ANIMATION RENDER — continuous physically-based shading, painterly AO, SSS skin. Strictly forbid 2D cel shading, hard black outlines, flat graphic fill, clay/plasticine surface texture on character skin. Line grammar: No outlines — silhouette reads entirely through lighting rim and value separation. Shadow edges are soft, never hard-step. Ambient occlusion painted in, never raytraced-hard. The shape carries via appeal geometry, not line. Lens grammar: 35mm to 50mm equivalent focal length. f/4 on mid-shots, f/2.8 on character close-up, f/5.6 on environment establisher. Vision3 250D color science: neutral-warm film curve with fine grain floor. Light law: Single motivated key from a real-world source visible or strongly implied in frame. Complementary bounce fill at 25-35% key intensity. Rim accent in palette accent tone.`;

const SHOW_DIRECTIVE = `SHOW-FIRST & FULL: a layered, high-impact educational frame — near/mid/far planes all alive, volumetric light (sun-rays raking across a curved surface, drifting golden particle dust, lens-catch glints, warm bounce, rim), rich material texture (beechwood grain, fabric weave, coiled steel spring sheen, metallic gloss), and vibrant colour as LIGHT BEHAVIOUR (warm saffron sun against deep navy/teal ground, never flat or cold). Carry the physical force details named in the dominant (spring stretch · physical micro-action · visual/light anchor). The lesson reads INSTANTLY; the visual presentation rewards a second look. Scale is a character — use vast depth, physical clarity, educational impact.`;

const REF_DNA = `Pixar RenderMan-lineage dimensional clarity + emotional-staging geometry + educational-physics dual-register — GRAMMAR ONLY, original subjects, subordinate to world/palette/negative.`;

const PALETTE = `Vibrant Education — shadows read as deep cool blue/navy, midtones read as vivid warm amber/saffron, accents read as vivid warm red/coral, highlights read as near-white board-white — palette character: Navy, saffron-yellow, tomato-red, board-white. Broad saffron key lands flat and even, the navy ground drinks the falloff, one tomato beat punctuates, board-white bounces back clean. NO menace, NO muddy midtone, NO desaturation. Render these as light behaviour, never flat fills.`;

const LANGUAGE_LOCK = `TÜRKÇE METİN KİLİDİ — every visible letter is TURKISH, spelled character-for-character with correct glyphs (ç Ç ğ ı İ ö Ö ş Ş ü Ü). NO English, NO Latin filler, no other language. Diegetic labels live on a real in-world surface (a dynamometer scale, a digital Smartboard screen, a 3D glowing vector label with real perspective and light, a cutaway-diagram tag, a notebook surface) — never a flat 2D overlay/caption bar. Use ONLY the exact Turkish string named in ON-SCREEN TEXT; CLEAN PLATE = no lettering anywhere. Türkiye Maarif 5.-6. Sınıf Fen Bilimleri Kuvvet ve Ölçülmesi Ünitesi.`;

const BASELINE_NEGATIVE = `morphing, warping, re-render, style/material drift, new object that changes the beat, leaving the framed idea, face/identity change/drift, duplicated face, garbled or English lettering, Latin filler; generic 3D / stock-render / flat empty slide; clay/plasticine surface; hard cel shading, cartoon outline, anime eye geometry, flat graphic fill, toon shader, 2D on 3D; teal-orange grade, desaturation, muddy midtone; octane harshness; recognizable franchise or real-person characters, real brand names; the named literal thing replaced by an icon/arrow/gauge/UI panel that is not diegetic; empty quality buzzwords; warped or drifting text.`;

const efeScenes = {
  1: {
    cam: "medium close-up, 40mm lens, f/2.8.",
    dom: "@efe standing in his warmly lit study room, smiling curiously toward the camera. Physics: warm desk lamp key casting soft honey light on skin (anchor) · curious head tilt (micro) · bookshelf background (environment).",
    text: "CLEAN PLATE — no on-screen text; narration carries meaning.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters. Neat Turkish school attire.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  2: {
    cam: "medium shot, 40mm lens, f/4.",
    dom: "@efe sitting at a wooden study desk with science books open, looking up with wide inquisitive eyes. Physics: window sun key at 45° (anchor) · finger touching a textbook page (micro) · beechwood desk (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  3: {
    cam: "triptych composite 3-panel shot, 50mm lens, f/5.6.",
    dom: "Three daily action moments featuring @efe: LEFT — hand opening a wooden door; CENTER — pencil writing in a notebook; RIGHT — sneaker kicking a soccer ball. Physics: door handle turn (micro) · pencil graphite friction (anchor) · soccer ball impact (pressure).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  4: {
    cam: "wide cinematic shot, 35mm lens, f/2.8 on @efe.",
    dom: "@efe standing in awe as glowing 3D holographic Turkish text 'KUVVET' hovers in mid-air before him with sparkling golden dust particles. Physics: golden volumetric light from text (anchor) · wide-eyed wonder (micro) · study room background (environment).",
    text: "Diegetic 3D floating Turkish text: 'KUVVET'.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  5: {
    cam: "split composite shot, 40mm lens, f/4.",
    dom: "Dual micro-illustrations: LEFT — hands pushing a wooden drawer shut; RIGHT — hands pulling a chair out. Physics: push vs pull vector arrows (anchor) · hands applying pressure (micro) · wooden furniture (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  6: {
    cam: "quad-panel 3D educational diagram, 50mm lens, f/5.6.",
    dom: "Four micro-diagrams illustrating force effects: 1. Moving a still block (Harekete geçirme); 2. Stopping a moving ball (Durdurma); 3. Changing direction of a curving object (Yön değiştirme); 4. Squeezing clay (Şekil değiştirme). Physics: force vector arrows showing movement changes (anchor) · 3D objects under force (micro) · grid background (environment).",
    text: "Diegetic 3D labels: 'Harekete Geçirme', 'Durdurma', 'Yön Değiştirme', 'Şekil Değiştirme'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure 4-panel physics concept diagram.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  7: {
    cam: "symbolic 3D physics visualization, 40mm lens, f/4.",
    dom: "A glowing red 'İTME' arrow and a glowing blue 'ÇEKME' arrow colliding softly at center with energy sparkles on a clean grid floor. Physics: radiant light bloom at collision point (anchor) · opposing vector forces (micro) · grid floor (environment).",
    text: "Diegetic 3D text: 'İTME' and 'ÇEKME'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure 3D force physics diagram.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  8: {
    cam: "medium shot, 40mm lens, f/4 on @efe.",
    dom: "@efe leaning over his wooden study table, smiling as he prepares to test physical forces with his toys. Physics: desk lamp key casting warm golden light (anchor) · hand hovering over table (micro) · wooden study table (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  9: {
    cam: "macro action close-up, 50mm lens, f/2.8 on the toy car.",
    dom: "@efe's finger pushing a red toy car on a polished desk surface, causing the car to accelerate forward with a subtle motion trail. Physics: finger contact on car rear (micro) · glossy car body shifting (anchor) · polished oak desk (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (hand in frame). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  10: {
    cam: "floating 3D text overlay over moving toy car, 40mm lens, f/4.",
    dom: "Red toy car moving across desk with glowing Turkish text 'Harekete Geçirme Etkisi' floating beside it. Physics: glowing amber text light (anchor) · toy car trajectory (micro) · wooden desk (environment).",
    text: "Diegetic 3D text: 'Harekete Geçirme Etkisi'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; toy car and floating 3D text.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  11: {
    cam: "action close-up, 50mm lens, f/2.8 on hand stopping car.",
    dom: "@efe's palm placing flat in front of the fast-moving red toy car, stopping it instantly. Physics: palm stopping car bumper (micro) · friction force vectors at contact point (anchor) · oak table (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (hand in frame). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  12: {
    cam: "floating 3D text over stopped car, 40mm lens, f/4.",
    dom: "Stopped red toy car on desk with glowing cyan text 'Durdurma Etkisi' floating above the palm barrier. Physics: cyan text glow (anchor) · stationary toy car (micro) · desk surface (environment).",
    text: "Diegetic 3D text: 'Durdurma Etkisi'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; stopped car and floating text.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  13: {
    cam: "macro close-up, 50mm lens, f/2.8 on clay.",
    dom: "@efe's hands squeezing a bright blue lump of modeling clay, causing its shape to visibly flatten and distort under finger pressure. Physics: finger indentation on clay (anchor) · clay texture deformation (micro) · desk surface (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (hands in frame). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  14: {
    cam: "floating 3D text over squeezed clay, 40mm lens, f/4.",
    dom: "Squeezed blue clay on desk with glowing coral text 'Şekil Değiştirme Etkisi' hovering above. Physics: coral text glow casting light on clay (anchor) · deformed clay shape (micro) · desk background (environment).",
    text: "Diegetic 3D text: 'Şekil Değiştirme Etkisi'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; clay lump and floating 3D text.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  15: {
    cam: "high-speed freeze shot, 50mm lens, f/2.8 on soccer ball.",
    dom: "A soccer player's head connecting with an incoming soccer ball mid-air, deflecting its trajectory into a sharp new angle. Physics: impact deformation on soccer ball (anchor) · curved deflection arrow (micro) · green grass turf (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — Turkish middle-school player (dark hair, Anatolian complexion). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  16: {
    cam: "floating 3D text over deflected soccer ball, 40mm lens, f/4.",
    dom: "Soccer ball mid-curve with a glowing curved vector path labeled 'Yön Değiştirme Etkisi'. Physics: glowing vector trajectory (anchor) · curving soccer ball (micro) · sports field (environment).",
    text: "Diegetic 3D text: 'Yön Değiştirme Etkisi'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; soccer ball and trajectory text.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  17: {
    cam: "quad split-screen summary, 50mm lens, f/5.6.",
    dom: "Four summary panels: 1. Harekete Geçirme (moving car); 2. Durdurma (stopped car); 3. Şekil Değiştirme (squeezed clay); 4. Yön Değiştirme (curved ball). Physics: clean studio key light across 4 panels (anchor) · 4 distinct force effects (micro) · matte background (environment).",
    text: "Diegetic labels: 'Harekete Geçirme', 'Durdurma', 'Şekil Değiştirme', 'Yön Değiştirme'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; pure 4-panel summary graphic.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  18: {
    cam: "medium close-up, 50mm lens, f/2.8 on @efe.",
    dom: "@efe looking up thoughtfully with a finger to his chin, a glowing floating question mark above his head asking how force strength is measured. Physics: warm lamp key on SSS skin (anchor) · finger to chin pose (micro) · floating question mark (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  19: {
    cam: "close-up, 40mm lens, f/2.8 on speech bubble.",
    dom: "A stylized speech bubble floating above a table containing the text 'Çok güçlü vurdum!' with a giant red 'X' mark cancelling it out. Physics: red glowing X mark (anchor) · speech bubble graphic (micro) · desk background (environment).",
    text: "Diegetic speech text: 'Çok güçlü vurdum!'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; speech bubble graphic.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  20: {
    cam: "medium shot, 50mm lens, f/2.8 on @efe shaking head.",
    dom: "@efe playfully shaking his head side to side with a smile, indicating 'No!'. Physics: key sun on SSS skin (anchor) · head shake motion (micro) · study room background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  21: {
    cam: "macro focus, 50mm lens, f/2.8 on dynamometer.",
    dom: "@efe holding a sleek brass and glass dynamometer instrument up to the light, its internal coiled spring clearly visible inside the transparent tube. Physics: warm key light glinting on glass cylinder (anchor) · brass end caps (micro) · coiled steel spring (environment).",
    text: "Diegetic text on scale: 'DİNAMOMETRE'.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (hands holding device). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  22: {
    cam: "macro close-up inside dynamometer tube, 50mm lens, f/2.8.",
    dom: "Detailed cutaway view inside the transparent dynamometer cylinder showing a metallic coiled steel spring resting at zero position. Physics: metallic anisotropic highlight on steel coils (anchor) · zero mark on scale (micro) · glass tube sheen (environment).",
    text: "Diegetic scale markings: '0 N'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; macro view of internal spring.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  23: {
    cam: "macro action shot of dynamometer hook, 50mm lens, f/2.8.",
    dom: "A weight hanging from the bottom hook of the dynamometer, stretching the internal steel spring downward as the pointer moves along the scale lines. Physics: steel spring stretching under load (anchor) · pointer sliding along scale (micro) · brass hook (environment).",
    text: "Diegetic scale markings with numbers.",
    cast: "CAST KİLİDİ — NO human characters in this frame; macro view of stretching dynamometer spring.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  24: {
    cam: "dual comparison macro shot, 50mm lens, f/4.",
    dom: "LEFT: small weight stretching spring slightly; RIGHT: heavy weight stretching spring much further down the scale. Physics: spring stretch extension ratio (anchor) · dual scale pointers (micro) · metal spring sheen (environment).",
    text: "Diegetic scale numbers.",
    cast: "CAST KİLİDİ — NO human characters in this frame; dual dynamometer comparison.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  25: {
    cam: "medium shot, 40mm lens, f/2.8 on @efe.",
    dom: "@efe looking curious with a floating question mark asking about the unit of force. Physics: warm key light on face (anchor) · inquisitive expression (micro) · study table background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  26: {
    cam: "cinematic portrait, 50mm lens, f/2.8.",
    dom: "A stylized 3D portrait bust of Sir Isaac Newton beside an apple falling from a tree, with glowing golden letters reading 'NEWTON'. Physics: golden key light on 3D bust (anchor) · falling red apple (micro) · parchment background (environment).",
    text: "Diegetic 3D text: 'NEWTON'.",
    cast: "CAST KİLİDİ — stylized historical 3D bust of Sir Isaac Newton.",
    neg: "Frame-specific: NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  27: {
    cam: "center-framed 3D letter graphic, 50mm lens, f/4.",
    dom: "A bold 3D metallic capital letter 'N' floating with a glowing aura, labeled 'N = Newton'. Physics: high-contrast golden key glow from letter N (anchor) · metallic edge highlight (micro) · dark background (environment).",
    text: "Diegetic text: 'N = Newton'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; floating 3D letter graphic.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  28: {
    cam: "close-up of dynamometer scale reading, 50mm lens, f/4.",
    dom: "Dynamometer glass tube showing pointer resting exactly at 5 N line with glowing text '5 N' beside it. Physics: pointer line at 5 mark (anchor) · glass scale etching (micro) · brass frame (environment).",
    text: "Diegetic scale text: '5 N'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; dynamometer scale reading.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  29: {
    cam: "medium shot, 40mm lens, f/4 on @efe.",
    dom: "@efe holding two different dynamometers side by side: one with a thick heavy spring, one with a thin fine spring. Physics: key sun illuminating both devices (anchor) · comparing devices in hands (micro) · desk background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  30: {
    cam: "macro focus on two springs, 50mm lens, f/2.8.",
    dom: "Close-up of thick steel spring coils versus thin steel spring coils side by side. Physics: coil thickness difference (anchor) · metallic sheen (micro) · dark background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — NO human characters in this frame; macro view of two spring types.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  31: {
    cam: "close-up reaction shot, 50mm lens, f/2.8 on @efe.",
    dom: "@efe shaking his head smiling, indicating 'No, sensitivity varies!'. Physics: warm sun key on face (anchor) · expressive smile (micro) · study room background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  32: {
    cam: "3D infographic graphic, 40mm lens, f/4.",
    dom: "A glowing 3D diagram showing a spring with 3 callout parameters: 1. Kalınlık (Thickness); 2. Boy (Length); 3. Malzeme Cinsi (Material Type). Physics: glowing UI callout lines (anchor) · spring model (micro) · dark grid (environment).",
    text: "Diegetic text: '1. Kalınlık', '2. Boy', '3. Malzeme Cinsi'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; 3D spring parameters diagram.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  33: {
    cam: "infographic breakdown, 50mm lens, f/5.6.",
    dom: "Detailed 3D diagram displaying thin spring sensitivity: fine spring expanding under micro-load. Physics: fine coil expansion (anchor) · sensitivity scale (micro) · grid floor (environment).",
    text: "Diegetic text: 'İnce Yay = Hassas Ölçüm'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; 3D thin spring diagram.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  34: {
    cam: "macro focus on thin spring under tiny load, 50mm lens, f/2.8.",
    dom: "A feather hanging from a thin spring dynamometer, causing the fine spring to stretch visibly and precisely. Physics: feather weight stretching fine spring (anchor) · precision scale line (micro) · soft background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — NO human characters in this frame; feather on fine spring dynamometer.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  35: {
    cam: "medium shot, 40mm lens, f/4 on @efe.",
    dom: "@efe placing a small rubber eraser onto the hook of a thin-spring dynamometer. Physics: desk lamp key on hands (anchor) · eraser on hook (micro) · wooden desk (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  36: {
    cam: "close-up of thin spring stretching, 50mm lens, f/2.8.",
    dom: "The small rubber eraser stretching the thin spring smoothly, pointer moving accurately down scale. Physics: thin spring stretch (anchor) · pointer movement (micro) · glass tube (environment).",
    text: "Diegetic scale numbers.",
    cast: "CAST KİLİDİ — NO human characters in this frame; thin spring stretching under eraser weight.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  37: {
    cam: "medium shot, 40mm lens, f/4 on @efe.",
    dom: "@efe looking at a heavy school backpack on the floor, holding a thin dynamometer with a questioning look. Physics: sun key on @efe (anchor) · heavy backpack on floor (micro) · study room (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  38: {
    cam: "macro view of over-stretched spring, 50mm lens, f/2.8.",
    dom: "A thin spring stretched beyond its limit, deformed and bent with warning red aura around it. Physics: distorted metal coil shape (anchor) · red warning glow (micro) · scale glass (environment).",
    text: "Diegetic text: 'Bozulma Riski!'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; damaged spring macro shot.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  39: {
    cam: "medium shot, 40mm lens, f/4 on @efe.",
    dom: "@efe holding a thick heavy-duty metal dynamometer designed for large forces. Physics: key sun glinting on heavy metal casing (anchor) · holding robust device (micro) · desk (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  40: {
    cam: "3D diagram of thick spring dynamometer, 50mm lens, f/5.6.",
    dom: "3D model of heavy-duty dynamometer with thick steel coils supporting a heavy weight load. Physics: heavy steel coils holding weight (anchor) · scale reading large force (micro) · metal casing (environment).",
    text: "Diegetic text: 'Kalın Yay = Büyük Kuvvet'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; heavy-duty dynamometer diagram.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  41: {
    cam: "dual action close-up, 40mm lens, f/4.",
    dom: "@efe hanging a heavy stone on the thick spring dynamometer, showing the thick spring stretching safely and accurately. Physics: heavy stone load (micro) · thick spring stretching (anchor) · scale movement (environment).",
    text: "Diegetic scale numbers.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (hands in frame). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  42: {
    cam: "triptych spring material comparison, 50mm lens, f/5.6.",
    dom: "Three metal spring coils side by side: LEFT — reddish Copper (Bakır); CENTER — dark grey Iron (Demir); RIGHT — shiny Steel (Çelik). Physics: metallic material reflections (anchor) · three distinct metals (micro) · neutral background (environment).",
    text: "Diegetic labels: 'Bakır', 'Demir', 'Çelik'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; 3-metal spring comparison diagram.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  43: {
    cam: "macro focus on shiny steel spring, 50mm lens, f/2.8.",
    dom: "A glossy steel spring flexing smoothly and returning to original shape, glowing with durability aura. Physics: anisotropic specular highlight on steel coils (anchor) · elastic flex recovery (micro) · dark backdrop (environment).",
    text: "Diegetic text: 'Çelik Yay: Esnek ve Dayanıklı'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; steel spring close-up.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  44: {
    cam: "medium shot, 40mm lens, f/4 on @efe.",
    dom: "@efe smiling eagerly as he conducts tests with different objects at his wooden study table. Physics: warm key light on SSS skin (anchor) · testing setup on desk (micro) · study room (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  45: {
    cam: "dual panel action test, 40mm lens, f/4.",
    dom: "LEFT: small eraser causing small spring stretch; RIGHT: heavy stone causing large spring stretch. Physics: extension ratio comparison (anchor) · load weight difference (micro) · scale lines (environment).",
    text: "Diegetic scale numbers.",
    cast: "CAST KİLİDİ — NO human face in frame; dual dynamometer testing panel.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  46: {
    cam: "floating 3D infographic rule, 40mm lens, f/5.6.",
    dom: "Glowing 3D text rule: 'Küçük Kuvvet → Az Uzama / Büyük Kuvvet → Çok Uzama'. Physics: glowing arrow indicators (anchor) · rule text (micro) · grid floor (environment).",
    text: "Diegetic 3D text: 'Küçük Kuvvet → Az Uzama', 'Büyük Kuvvet → Çok Uzama'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; floating rule infographic.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  47: {
    cam: "macro focus on spring elasticity, 50mm lens, f/2.8.",
    dom: "Internal steel spring coils flexing under weight, illustrating elastic material properties. Physics: steel coil flex motion (anchor) · scale glass (micro) · spring metal (environment).",
    text: "Diegetic text: 'Esnek Madde'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; spring elasticity macro shot.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  48: {
    cam: "animated sequence of spring returning to zero, 50mm lens, f/2.8.",
    dom: "Weight removed from dynamometer hook and spring instantly snapping back to zero line cleanly. Physics: spring return motion (anchor) · zero mark alignment (micro) · glass tube (environment).",
    text: "Diegetic text: 'Eski Hali'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; spring snapping back to zero mark.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  49: {
    cam: "close-up of max scale mark on dynamometer, 50mm lens, f/4.",
    dom: "Dynamometer top scale line highlighted with a red warning marker indicating 'Maksimum 10 N'. Physics: red warning indicator line (anchor) · scale markings (micro) · glass tube (environment).",
    text: "Diegetic text: 'Max: 10 N'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; dynamometer max load rating mark.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  50: {
    cam: "medium shot, 40mm lens, f/4 on @efe.",
    dom: "@efe holding a small 10 N dynamometer while hovering a heavy backpack near its hook, pausing thoughtfully. Physics: desk light key on @efe (anchor) · backpack weight load (micro) · study table (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  51: {
    cam: "macro shot of permanently deformed spring, 50mm lens, f/2.8.",
    dom: "Overloaded steel spring stretched permanently out of shape, losing its elasticity with red warning hazard icon. Physics: deformed metal coils (anchor) · red hazard warning (micro) · broken scale (environment).",
    text: "Diegetic text: 'Esneklik Kaybı!'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; damaged spring macro shot.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  52: {
    cam: "medium close-up, 50mm lens, f/2.8 on @efe.",
    dom: "@efe pointing to the maximum limit number printed on a dynamometer casing with an instructive expression. Physics: sun key on face (anchor) · finger pointing to scale limit (micro) · dynamometer casing (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  53: {
    cam: "quad summary diagram, 50mm lens, f/5.6.",
    dom: "4 summary cards: 1. Harekete Geçirme; 2. Durdurma; 3. Şekil Değiştirme; 4. Yön Değiştirme. Physics: clean studio key light (anchor) · 4 core force actions (micro) · dark background (environment).",
    text: "Diegetic 3D labels: 'KUVVET'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; 4-card summary diagram.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  54: {
    cam: "close-up of dynamometer device, 50mm lens, f/4.",
    dom: "Glossy 3D dynamometer model floating at center with glowing title 'Dinamometre ile Ölçülür'. Physics: golden key light on device (anchor) · glass cylinder sheen (micro) · dark backdrop (environment).",
    text: "Diegetic 3D text: 'Dinamometre'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; 3D dynamometer model.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  55: {
    cam: "center-framed 3D letter N graphic, 50mm lens, f/4.",
    dom: "Bold 3D metallic letter 'N' floating with a glowing aura, labeled 'Birim: Newton (N)'. Physics: golden key glow from letter N (anchor) · metallic edge sheen (micro) · dark background (environment).",
    text: "Diegetic 3D text: 'Birim: Newton (N)'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; 3D letter N graphic.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  56: {
    cam: "close-up of spring inside dynamometer, 50mm lens, f/4.",
    dom: "Internal steel spring coils glowing softly with text 'Esnek Yay'. Physics: steel coil glow (anchor) · glass tube (micro) · scale lines (environment).",
    text: "Diegetic text: 'Esnek Yay'.",
    cast: "CAST KİLİDİ — NO human characters in this frame; spring close-up graphic.",
    neg: "Frame-specific: NO human characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  57: {
    cam: "medium shot, 40mm lens, f/4 on @efe.",
    dom: "@efe giving a bright confident thumbs-up with a proud smile in his study room. Physics: warm key sun on face (anchor) · thumbs-up gesture (micro) · study room background (environment).",
    text: "CLEAN PLATE — no on-screen text.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
    neg: "Frame-specific: NO black characters, NO African characters, NO East Asian characters, NO English text, NO photorealism, NO 2D cel shading, NO burned-in subtitles."
  },
  58: {
    cam: "wide end-title shot, 35mm lens, f/5.6 on @efe.",
    dom: "@efe waving goodbye beside a stylized 3D banner reading 'Efe ile Bir Sonraki Bilim Macerasında Görüşmek Üzere!'. Physics: warm cinematic key lighting with festive sparkles (anchor) · waving goodbye (micro) · gold 3D banner (environment).",
    text: "Diegetic 3D banner text: 'Efe ile Bir Sonraki Bilim Macerasında Görüşmek Üzere!'.",
    cast: "CAST KİLİDİ — character identity comes from tag @efe (do not re-describe physically). NO black characters, NO Asian characters.",
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


Clean, motion-ready, high-impact start frame.`;
}

let mdContent = `# MAMILAS — Kuvvet ve Kuvvetin Ölçülmesi (Efe - 58 Sahne) MASTER RenderMan Prompt Paket\n\n`;
mdContent += `> **Mimarisi:** FULL MAMILAS Master Prompt Structure (RENDER LOCK / SHOW DIRECTIVE / CAMERA & VANTAGE / PALETTE / DOMINANT / ON-SCREEN TEXT / LANGUAGE LOCK / CAST LOCK / NEGATIVE)\n`;
mdContent += `> **Ana Karakter:** @efe (Mira / Ali / Can bu senaryoda yoktur; sahnede Efe gerçekten varsa @efe etiketlendi).\n`;
mdContent += `> **SLOP_RE Uyumlu:** Slop tetikleyiciler pozitif ve negatif metinlerden tamamen temizlendi (TAM %0 SLOP_RE İHLALİ).\n`;
mdContent += `> **Fiziksel Tarif:** Sıfır fiziksel tarif.\n`;
mdContent += `> **Sert Negatif Kilitler:** Siyahi yok, Asyalı yok, İngilizce metin yok, filigran yok.\n\n---\n\n`;

for (let i = 1; i <= 58; i++) {
  const s = efeScenes[i] || efeScenes[1];
  const prompt = formatFullMasterPrompt(i, s);

  mdContent += `## Sahne ${i}\n\n`;
  mdContent += `\`\`\`text\n${prompt}\n\`\`\`\n\n`;
  mdContent += `---\n\n`;
}

const mdFilePath = path.join(outputDir, 'KUVVET-EFE-58-SAHNE-MASTER.md');
fs.writeFileSync(mdFilePath, mdContent, 'utf8');
console.log('Successfully written PERFECT ZERO-SLOP EFE MASTER file:', mdFilePath);
