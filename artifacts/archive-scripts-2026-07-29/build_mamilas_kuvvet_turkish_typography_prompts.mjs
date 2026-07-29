import fs from 'node:fs';
import path from 'node:path';

const commandFilePath = '/Users/Muhammet/Desktop/-_mamilas_command.json';
const outputDir = '/Users/Muhammet/Desktop/6. sınıf kuvvet';

const rawData = JSON.parse(fs.readFileSync(commandFilePath, 'utf8'));

// Master RenderMan Pipeline Grammar Header
const RENDERMAN_HEADER = `Feature-animation 3D CGI in the Pixar RenderMan / RenderMan-successor premium-CG feature-animation pipeline lineage (original subjects only). The Pixar signature is NOT 'cute 3D' — it is a specific formal grammar: appeal-driven silhouette design (shapes composed for emotional read at 50px thumbnail), subsurface scattering on character skin carrying the scene's light temperature (warm honey SSS under tungsten, cool ivory SSS under daylight), wet dual-point specular on eyes with painted-in iris depth, and physically-motivated bounce fill. Every prop has a deliberate overscale factor (10-15%) for child-safe readability. Material specificity is non-negotiable: wood shows visible grain with satin-varnish sheen, fabric shows woven stitch texture, metal shows anisotropic brushed highlight. Lighting grammar: single motivated key (window sun at 45°, practical lamp at 60°, screen glow below), complementary bounce fill at 25-35% in key's opposing hue, saturated rim accent. Composition: f/4 on mid-shots, f/2.8 on close-ups, f/5.6 on establisher. Vision3 250D color science. IMPERATIVE: FULL 3D CGI FEATURE-ANIMATION RENDER — continuous PBR shading, painterly AO, SSS skin. Strictly forbid 2D cel shading, hard black outlines, flat graphic fill, clay surface texture on character skin. No outlines — silhouette reads via lighting rim. Shadow edges are soft. Lens: 35mm to 50mm equivalent. Light law: Single motivated key from real-world source, complementary bounce fill at 25-35% key intensity.`;

// Strict negative prompt tailored to eliminate English signage, non-Turkish demographics, and non-CG renders
const MASTER_AVOID = `AVOID: English text, English signage, Latin non-Turkish letters, gibberish writing, Black/African-American characters, East Asian characters, non-Turkish demographics, cel shading, 2D art, black outlines, chalk scribbles, teal-orange grade, Woody, Buzz, Disney characters, clay skin, morphing. Clean motion-ready start frame.`;

// Turkish demographic and middle-school environment specification
const TURKISH_DEMOGRAPHIC_SPEC = "AUTHENTIC TURKISH DEMOGRAPHIC & ENVIRONMENT: Middle school environment reflecting authentic Turkish middle school student demographic (Mediterranean/Anatolian facial features, brown/hazel eyes, dark/chestnut hair, neat school uniforms). No foreign or non-Turkish demographic characters in background.";

function buildRichScenePrompt(sceneId, voText) {
  let env = "";
  let dominant = "";
  let typographyText = "";
  let lightComp = "";
  let matSpec = "";
  let pedCheck = "";

  switch (sceneId) {
    case 1:
      env = "A sunny morning exterior of an authentic Turkish apartment building entrance with limestone block walls and a carved dark wooden double door.";
      dominant = "Establishing shot of @mira stepping outside into morning light carrying her school backpack. Soft golden sunlight washes over the stone steps, casting a warm honey glow.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: None required for scene 1. Clean visual establishing shot.";
      lightComp = "Single motivated key from morning sun at 45° casting a warm honey glow, cool-violet complementary bounce fill from the pavement at 30% intensity. Tangerine-amber rim accent. Focal plane f/4 on @mira.";
      matSpec = "Limestone block walls with natural porous grain, polished mahogany door with satin sheen, woven fabric backpack with visible stitch pattern.";
      pedCheck = "Establishes the daily morning starting point before physical forces come into play.";
      break;

    case 2:
      env = "A tree-lined suburban Turkish sidewalk with cobblestone pavement leading toward a school bus stop.";
      dominant = "Dynamic tracking action shot of @mira pushing open the heavy door with her palm, slinging her backpack over her shoulder, and sprinting down the sidewalk. Subtle motion blur on feet.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: None required. Dynamic physical motion focus.";
      lightComp = "Single motivated key from morning sun at 45°, cool-blue bounce fill at 25% intensity. Amber rim highlight along hair and shoulder. Focal plane f/4.";
      matSpec = "Brass door handle with anisotropic highlights, heavy canvas backpack with slight fiber fray, wet cobblestone specular highlights.";
      pedCheck = "Demonstrates applied human muscular force in everyday actions like pushing, lifting, and accelerating.";
      break;

    case 3:
      env = "Open sidewalk with warm sunlight filtering through overhead tree leaves.";
      dominant = "Medium side-tracking shot of @mira running with a bright joyful smile. Floating translucent glowing golden vector arrows and soft kinetic particle trails emanate from her sneakers and backpack straps.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Stylized glowing 3D Turkish label 'KUVVET' rendered in bold golden 3D text hovering smoothly beside the main force vector arrow.";
      lightComp = "Single key sun at 45°, cool-violet bounce fill at 30%. Saturated golden rim light tracing character outline. Focal plane f/2.8 on @mira.";
      matSpec = "Rubber shoe soles with soft-diffuse sheen, glowing vector lines rendered as luminous volumetric light, woven fabric sweater.";
      pedCheck = "Turns invisible forces into visible 3D educational vector indicators with clear Turkish typography.";
      break;

    case 4:
      env = "A clean, stylized 3D educational gallery stage with neutral warm background.";
      dominant = "A crisp triptych composite shot showcasing three physical force micro-illustrations: 1. A palm pushing a wooden door; 2. A sneaker kicking a soccer ball; 3. Hands pushing a metal shopping cart.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Clean 3D Turkish typography overlays: Left panel titled 'İTME KUVVETİ', center panel titled 'VURMA KUVVETİ', right panel titled 'SÜRÜKLEME KUVVETİ' in elegant white 3D sans-serif graphics.";
      lightComp = "Studio softbox key light from top-right at 45°, cool ambient fill at 25%. Soft painted ambient occlusion in corner pockets. Focal plane f/5.6 crisp across all panels.";
      matSpec = "Polished oak wood grain, synthetic leather soccer ball panel stitching, chrome metal cart wires with anisotropic brushed highlights.";
      pedCheck = "Visually categorizes different daily real-world force applications with precise Turkish educational labels.";
      break;

    case 5:
      env = "A clean wooden study desk surface in a brightly lit learning space.";
      dominant = "Macro focus on a glossy crimson wooden cube resting on a polished oak table. Surrounding the cube are four translucent 3D force vector arrows pointing inward from four directions.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: A prominent 3D glowing golden question mark '?' floating directly above the box, surrounded by soft glowing light particles.";
      lightComp = "Single overhead desk lamp key light at 60°, warm-amber bounce fill from wooden desk surface at 35%. Rim accent on cube edges. Focal plane f/2.8 sharp on the red cube.";
      matSpec = "Crimson painted wood block with satin varnish sheen, polished oak desk with visible wood grain, luminous translucent resin vector arrows.";
      pedCheck = "Poses the fundamental question: Does a single force or multiple forces affect an object simultaneously?";
      break;

    case 6:
      env = "Warm school hallway backdrop with soft morning sunlight.";
      dominant = "Close-up character reaction shot of @mira turning her head with an excited, expressive smile, playfully shaking her head with wide curious eyes.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Bold, vibrant 3D text 'HAYIR!' appearing with a fun squash-and-stretch pop animation beside @mira.";
      lightComp = "Soft key light from window at 45° giving warm honey skin tone, cool-violet bounce fill at 30%. Rich amber rim light on hair. Focal plane f/2.8 on eyes.";
      matSpec = "Subsurface skin scattering carrying warm light temperature, wet dual-point specular on eyes with painted iris depth, woven sweater vest.";
      pedCheck = "Engaging emotional hook indicating an emphatic 'No!' to single-force limitation.";
      break;

    case 7:
      env = "A clean 3D physics demonstration grid surface.";
      dominant = "Dynamic 3D physics visual effect showing two individual glowing vector arrows (electric blue and cyan) flowing together and fusing seamlessly into one larger, radiant golden net force vector arrow pushing a stone block.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Glowing 3D Turkish typography showing 'KUVVETLER BİRLEŞİYOR' floating gracefully above the merging vector arrows.";
      lightComp = "High-contrast key from glowing energy arrows casting radiant golden light onto grid floor, soft cyan fill in background. Focal plane f/4.";
      matSpec = "Grid floor with satin sheen, heavy stone block with micro-porous texture, volumetric light bloom on merged vector arrow.";
      pedCheck = "Visually demonstrates vector addition (force combination) into a single resultant net force.";
      break;

    case 8:
      env = "Atmospheric educational room with floating golden dust motes.";
      dominant = "Wide shot of @mira looking up in awe with wide sparkling eyes as glowing 3D magical holographic lettering reading 'BİLEŞKE KUVVET' hovers in mid-air before her like an epic discovery.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Magnificent 3D glowing Turkish text 'BİLEŞKE KUVVET' rendered in bevelled gold 3D typography with radiant volumetric rays.";
      lightComp = "Volumetric key glow from floating 3D text casting warm golden illumination onto @mira's face, cool-indigo background fill at 25%. Focal plane f/2.8 on face.";
      matSpec = "Holographic light bloom on text, SSS skin scattering on face, soft fabric texture on backpack straps.";
      pedCheck = "Creates an unforgettable visual discovery moment for the central concept: Resultant Net Force.";
      break;

    case 9:
      env = "Sunny outdoor school garden path with soft green foliage background.";
      dominant = "Medium framing of @mira smiling warmly toward the viewer, reaching out her hand in an inviting welcoming gesture to join her on the science journey.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Glowing 3D Turkish title 'KEŞFE BAŞLAYALIM!' floating softly below the frame in clean white rounded 3D graphics.";
      lightComp = "Single key sun from top-left at 45°, warm honey bounce fill, saturated golden rim light along silhouette. Focal plane f/4 on @mira.";
      matSpec = "Subsurface skin scattering, crisp fabric weave on collar, soft green leaves in background with gentle bokeh.";
      pedCheck = "Invites student viewers to actively participate in the upcoming lesson.";
      break;

    case 10:
      env = "A modern Turkish middle school science classroom with wooden desks and authentic Turkish middle school students in uniform.";
      dominant = "Wide establishing shot of the classroom. @mira sits at a wooden desk alongside her Turkish classmates. At the front stands a friendly Turkish science teacher next to a glowing 4K digital Smartboard (Akıllı Tahta).";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: The digital Smartboard (Akıllı Tahta) screen displays a crisp Turkish header: 'FEN BİLİMLERİ - KUVVETİ TANIYALIM' in modern clean UI design.";
      lightComp = "Sunlight key from large side windows at 45°, warm wood-reflected bounce fill at 30%. Soft ambient occlusion in desk corners. Focal plane f/5.6 across classroom.";
      matSpec = "Varnished beechwood student desks with visible grain, glass screen with anti-glare sheen, painted plaster walls.";
      pedCheck = "Establishes the formal educational setting in a modern Turkish science classroom.";
      break;

    case 11:
      env = "Front of the Turkish middle school classroom focusing on the Smartboard.";
      dominant = "Over-the-shoulder perspective looking past @mira toward the Smartboard (Akıllı Tahta). The teacher uses a digital pen to draw a blue 3D box with glowing red directional force vector arrows on the screen.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: The Smartboard displays digital Turkish text: '1. KUVVETİN ÖZELLİKLERİ' at the top of the digital canvas.";
      lightComp = "Cool daylight key from Smartboard screen, warm ambient bounce from desk surfaces at 35%. Focal plane f/4 sharp on screen diagram.";
      matSpec = "Digital glass screen with luminous vector graphics, wooden desk edge in foreground with satin sheen.";
      pedCheck = "Demonstrates how teachers introduce vector force diagrams on interactive Smartboards.";
      break;

    case 12:
      env = "Digital screen backdrop on the classroom Smartboard.";
      dominant = "Close-up shot of the Smartboard (Akıllı Tahta) screen displaying four glowing educational 3D icon cards arranged neatly.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: High-clarity 3D Turkish typography on four cards: 1. 'Uygulama Noktası', 2. 'Doğrultu', 3. 'Yön', 4. 'Büyüklük' in bold white sans-serif text with glowing colored borders.";
      lightComp = "Self-luminous digital key glow from UI elements, subtle dark blue ambient fill. Focal plane f/5.6 crisp across all cards.";
      matSpec = "Glass screen surface, glowing vector icons, matte digital UI card backgrounds.";
      pedCheck = "Teaches the 4 fundamental elements required to define any physical force vector in Turkish.";
      break;

    case 13:
      env = "Smartboard digital graphic interface.";
      dominant = "Detailed close-up on the Smartboard (Akıllı Tahta) showing a 3D block with a glowing crimson circular dot at the exact contact point where the force arrow touches.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Prominent 3D glowing Turkish label pointing to the dot reading: '1. Uygulama Noktası' in vibrant neon white typography.";
      lightComp = "Self-luminous crimson key glow from application point dot, dark cyan UI fill. Focal plane f/4 on contact dot.";
      matSpec = "Glowing LED-style point dot, 3D block model with satin finish, glass screen texture.";
      pedCheck = "Visually isolates Element 1: Point of Application (Uygulama Noktası).";
      break;

    case 14:
      env = "Smartboard digital graphic interface.";
      dominant = "Close-up on the Smartboard (Akıllı Tahta) showing a straight horizontal double-headed axis line extending East-West across a grid.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Crisp 3D Turkish text overlay: '2. Doğrultu (Doğu - Batı Çizgisi)' positioned directly above the horizontal axis line.";
      lightComp = "Neon blue key light from axis line, soft dark background fill. Focal plane f/5.6.";
      matSpec = "Luminous vector line, dark digital glass grid with subtle grid lines.";
      pedCheck = "Visually isolates Element 2: Line of Action / Doğrultu (Doğu-Batı).";
      break;

    case 15:
      env = "Smartboard digital graphic interface.";
      dominant = "Close-up on the Smartboard (Akıllı Tahta) screen focusing on a bright glowing arrow pointing distinctly Eastward.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Luminous 3D Turkish text: '3. Yön: Doğu (►)' rendered in glowing yellow typography over the arrowhead.";
      lightComp = "Vibrant yellow-green key glow from directional arrowhead. Focal plane f/4.";
      matSpec = "Self-luminous vector arrowhead, dark glass display.";
      pedCheck = "Visually isolates Element 3: Direction / Yön (Doğu).";
      break;

    case 16:
      env = "Smartboard digital graphic interface.";
      dominant = "Close-up on the Smartboard (Akıllı Tahta) showing a force arrow marked with a glowing numerical value.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Bold 3D glowing text: '4. Büyüklük: 5 N (Newton)' with a glowing measurement bracket highlighting the arrow's length.";
      lightComp = "Bright cyan key glow from numerical text and vector length indicator. Focal plane f/4.";
      matSpec = "Luminous digital typography, vector arrowhead glow.";
      pedCheck = "Visually isolates Element 4: Magnitude / Büyüklük in Newtons (5 N).";
      break;

    case 17:
      env = "Turkish middle school classroom at student desk.";
      dominant = "Medium shot of @mira sitting at her wooden desk holding a pencil over her open science notebook with a curious, thoughtful expression. A stylized glowing thought bubble above her depicts two force arrows pushing a box simultaneously.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Inside the thought bubble, clean 3D text appears asking: 'Aynı Anda Birden Fazla Kuvvet?'.";
      lightComp = "Single key light from window at 45°, warm honey bounce from desk at 30%. SSS skin shading. Focal plane f/2.8 on @mira.";
      matSpec = "Yellow pencil with graphite tip, paper notebook with fiber grain, beechwood desk with satin varnish.";
      pedCheck = "Encourages curious inquiry about multiple simultaneous forces.";
      break;

    case 18:
      env = "Front of Turkish science classroom next to Smartboard.";
      dominant = "Warm medium shot of the science teacher smiling beside the illuminated Smartboard (Akıllı Tahta), tapping the screen as sparkling golden particles highlight the definition of Net Force.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Glowing 3D Turkish definition card on Smartboard: 'BİLEŞKE KUVVET (NET KUVVET): Birden fazla kuvvetin yaptığı etkiyi tek başına yapan kuvvet.'";
      lightComp = "Warm key from overhead lights at 60°, golden screen bounce fill at 35%. Rim light on teacher silhouette. Focal plane f/4.";
      matSpec = "Subsurface skin scattering, cotton shirt fabric, glass Smartboard frame.";
      pedCheck = "Delivers the official definition of Resultant Net Force in clear Turkish text.";
      break;

    case 19:
      env = "Smartboard digital animation presentation.";
      dominant = "3D animation graphic on the Smartboard (Akıllı Tahta) showing two separate blue force vector arrows merging into one large golden net force arrow pushing a heavy crate.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Bold 3D Turkish title: 'BİLEŞKE KUVVET = R' floating in radiant golden letters above the merged arrow.";
      lightComp = "Radiant golden key glow from merged resultant vector arrow. Focal plane f/5.6.";
      matSpec = "3D crate with wooden texture, volumetric glowing vector arrows.";
      pedCheck = "Reinforces that one net force (R) replaces the combined effect of multiple forces.";
      break;

    case 20:
      env = "Smartboard digital graphic center display.";
      dominant = "Center-framed shot of the Smartboard (Akıllı Tahta) displaying a bold 3D capital letter 'R' encircled by a glowing golden aura.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Large glowing 3D capital letter 'R' with a Turkish subtitle: 'R = Bileşke Kuvvet Sembolü' in crisp white 3D text.";
      lightComp = "High-contrast golden key glow from letter R, dark blue ambient screen fill. Focal plane f/4.";
      matSpec = "Embossed 3D metallic letter graphic with gold rim sheen.";
      pedCheck = "Establishes the universal scientific symbol 'R' for Resultant Net Force.";
      break;

    case 21:
      env = "Sunny school courtyard and outdoor playground.";
      dominant = "Wide establishing shot of the Turkish school courtyard as the bell rings. Authentic Turkish middle school students in uniform stream out onto the paved schoolyard for recess.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: None required. Realistic outdoor recess environment.";
      lightComp = "Direct sunlight key from top-right at 45°, warm pavement bounce fill at 30%. Focal plane f/5.6 across courtyard.";
      matSpec = "Concrete pavement with micro-grain texture, brick building facade, metal handrails.";
      pedCheck = "Transitions the narrative from classroom theory to outdoor real-world application.";
      break;

    case 22:
      env = "A muddy patch of soil near the edge of the school courtyard pavement.";
      dominant = "Medium wide shot of @mira walking onto the courtyard, noticing two Turkish male classmates crouched near the mud, trying to free a bright red toy car stuck in wet soil.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Glowing 3D Turkish indicator above the mud patch: 'ÇAMURA SAPLANMIŞ OYUNCAK ARABA'.";
      lightComp = "Sunlight key at 45° casting warm honey light, cool sky-blue bounce fill at 25%. Focal plane f/4 on children and car.";
      matSpec = "Wet dark soil with glossy mud specular highlights, bright red plastic toy car.";
      pedCheck = "Introduces the practical problem-solving scenario for forces in the same direction.";
      break;

    case 23:
      env = "Muddy ground close-up view.";
      dominant = "Close-up action shot of student Ali straining to push the red toy car Eastward. Extending from his hands is a glowing translucent vector arrow labeled 'F1 = 10 N (Doğu)'.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Luminous 3D Turkish vector label: 'F1 = 10 N (Doğu Yönünde)' rendered in bright cyan typography over the force arrow.";
      lightComp = "Key light from sun at 45°, glowing cyan light from 10 N arrow. Focal plane f/2.8 on Ali's hands and car.";
      matSpec = "Dark wet mud, bright red toy car body, translucent glowing cyan vector arrow.";
      pedCheck = "Demonstrates that a single force (10 N) is insufficient to overcome the mud's resistance.";
      break;

    case 24:
      env = "Muddy ground action view.";
      dominant = "Action shot as student Can kneels beside Ali, placing his hands on the toy car to push in the exact same Eastward direction. A second glowing vector arrow labeled 'F2 = 15 N (Doğu)' appears.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Luminous 3D Turkish vector label: 'F2 = 15 N (Doğu Yönünde)' rendered in electric blue typography above Can's arrow.";
      lightComp = "Sunlight key at 45°, dual vector glow illuminating mud surface. Focal plane f/4.";
      matSpec = "Fabric sleeves on jacket, glossy red toy car, dual luminous vector arrows.";
      pedCheck = "Shows the addition of a second force acting along the same line and same direction.";
      break;

    case 25:
      env = "Low-angle side profile of muddy ground.";
      dominant = "Side angle shot of both Turkish boys pushing side-by-side toward the East. Floating above the red toy car are two parallel glowing vector arrows pointing East.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Glowing 3D Turkish header text floating above the boys: 'AYNI DOĞRULTU VE AYNI YÖNLÜ KUVVETLER'.";
      lightComp = "Key sun from left at 45°, parallel vector arrows casting blue light onto boys' hands. Focal plane f/4.";
      matSpec = "Denim fabric on trousers, wet earth, translucent vector arrows.";
      pedCheck = "Clear visual proof of forces acting along the same direction (Same Direction Forces).";
      break;

    case 26:
      env = "Courtyard sideline near the mud patch.";
      dominant = "Close-up of @mira watching excitedly from the side, calculating on her fingers as a glowing floating plus sign (+) appears in mid-air between the two force values.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Floating 3D math symbols: 'F1 + F2' with a glowing yellow plus sign (+) pulsing between them.";
      lightComp = "Key sun on @mira's face, golden glow from floating math symbol (+). Focal plane f/2.8 on @mira.";
      matSpec = "Subsurface skin scattering, woven sweater texture, luminous floating UI symbol.";
      pedCheck = "Active student calculation moment: Same direction forces are ADDED together.";
      break;

    case 27:
      env = "Air space above the red toy car in the courtyard.";
      dominant = "Cinematic 3D educational overlay floating in mid-air: 'R = F1 + F2 = 10 N + 15 N = 25 N', accompanied by a single massive glowing golden net force arrow of 25 N pointing East.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Full bold 3D Turkish formula graphic: 'R = F1 + F2 = 10 N + 15 N = 25 N (Doğu Yönünde)' rendered in bevelled radiant golden text.";
      lightComp = "Radiant golden key light from the 25 N net force arrow illuminating the scene below. Focal plane f/4.";
      matSpec = "Luminous 3D math typography, golden energy bloom on net vector arrow.";
      pedCheck = "Derives the exact mathematical formula for Same Direction Forces ($R = F_1 + F_2$).";
      break;

    case 28:
      env = "Courtyard mud patch action moment.";
      dominant = "High-energy action shot as the red toy car pops cleanly out of the mud with a fun splash of dirt, shooting forward to the East propelled by the 25 N net force, as Ali and Can cheer.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Dynamic 3D Turkish action callout text: '25 N GÜÇ İLE KURTULDU!' popping with celebration sparkles.";
      lightComp = "Direct sunlight key, dynamic specular sparkles on flying mud droplets. Focal plane f/4 on toy car trajectory.";
      matSpec = "Dynamic liquid mud particles, glossy toy car paint, rubber tires.";
      pedCheck = "Shows the physical outcome: The combined 25 N net force successfully moves the object.";
      break;

    case 29:
      env = "Courtyard sideline in warm afternoon light.";
      dominant = "Medium close-up of @mira smiling proudly with hands on her hips, nodding knowingly as she confirms that forces in the same direction reinforce each other to become stronger.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Floating 3D Turkish rule card: 'AYNI YÖNLÜ KUVVETLER BİRLEŞİR VE GÜÇLENİR!'.";
      lightComp = "Key sun at 45°, warm honey skin SSS, golden rim light on hair. Focal plane f/2.8 on @mira.";
      matSpec = "Subsurface skin scattering, cotton fabric weave, soft blurred background.";
      pedCheck = "Reinforces student understanding of same-direction force amplification.";
      break;

    case 30:
      env = "Green grass school sports field under afternoon sky with authentic Turkish middle school students.";
      dominant = "Wide panoramic shot of two teams of Turkish middle school students lined up on opposite sides of a thick hemp rope on the green grass field for a tug-of-war match.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: 3D Turkish scoreboard title floating above the field: 'BEDEN EĞİTİMİ: HALAT ÇEKME YARIŞI'.";
      lightComp = "Sunlight key from top-left at 45°, green grass bounce fill at 30%. Focal plane f/5.6 across field.";
      matSpec = "Lush green grass blades with soft sheen, twisted natural hemp rope with visible fibers.";
      pedCheck = "Introduces the scenario for Opposing Forces (forces acting in opposite directions).";
      break;

    case 31:
      env = "Chalk sideline of the sports field.";
      dominant = "Medium shot of @mira standing near the white chalk line of the field, watching the tug-of-war competition attentively with focused eyes.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: None required. Focused student observation shot.";
      lightComp = "Key sun at 45°, green field bounce fill on shadow side. Focal plane f/4 on @mira.";
      matSpec = "Powdery white chalk line, woven fabric sweater vest, grass blades in foreground.";
      pedCheck = "Positioning the student narrator as an active observer of opposite forces.";
      break;

    case 32:
      env = "Center of the tug-of-war rope under tension.";
      dominant = "Dynamic close-up of the rope strained tight: On the West side, a student pulls with a glowing 30 N arrow pointing West; on the East side, another pulls back with a 20 N arrow pointing East.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: 3D vector labels: Left arrow labeled 'F1 = 30 N (Batı)', right arrow labeled 'F2 = 20 N (Doğu)'.";
      lightComp = "Sunlight key, dual opposing vector arrows (purple West vs orange East) casting light on rope fibers. Focal plane f/2.8.";
      matSpec = "Tightly wound hemp rope fibers, glowing vector arrows under tension.";
      pedCheck = "Visually sets up the conflict of forces acting along the same line but OPPOSITE directions.";
      break;

    case 33:
      env = "Ground level view of the white center chalk line on grass.";
      dominant = "Macro shot of the bright red cloth ribbon tied at the center of the hemp rope, slowly sliding toward the West side across the white chalk line on the green grass.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Glowing 3D Turkish directional arrow pointing West reading: 'BATIYA DOĞRU KAYIYOR'.";
      lightComp = "Low sun angle key casting long soft shadows, specular highlight on red cotton ribbon. Focal plane f/2.8 on red ribbon.";
      matSpec = "Woven red cotton ribbon fabric, natural hemp rope fibers, green grass blades.";
      pedCheck = "Shows the physical indicator moving toward the side applying the larger force.";
      break;

    case 34:
      env = "Sports field sideline.";
      dominant = "Medium shot of @mira observing the opposing forces, pointing her index fingers in opposite directions as she analyzes the physics calculation in her mind.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Floating 3D Turkish graphic above her: 'AYNI DOĞRULTU - ZIT YÖNLER (◄ ►)'.";
      lightComp = "Key sun at 45°, warm honey skin bounce fill. Focal plane f/4 on @mira.";
      matSpec = "Subsurface skin scattering, detailed iris depth in eyes, fabric vest texture.";
      pedCheck = "Active student reflection: Recognizing opposite directions along the same axis.";
      break;

    case 35:
      env = "Sports field sideline close-up.";
      dominant = "Close-up shot of @mira speaking thoughtfully to herself, realizing that forces pulling in opposite directions cannot simply be added together because they fight each other.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Floating 3D thought graphic showing a crossed-out plus sign (❌ +) and replacing it with a subtraction sign (-).";
      lightComp = "Key sun at 45°, cool violet bounce fill at 25%. Focal plane f/2.8 sharp on face.";
      matSpec = "SSS skin shading, wet dual-point specular on eyes, soft fabric collar.";
      pedCheck = "Crucial conceptual distinction: Opposite forces DO NOT add up.";
      break;

    case 36:
      env = "Air space above the sports field.";
      dominant = "Clean 3D educational infographic floating in mid-air showing the subtraction rule for opposing forces: 'R = F büyük - F küçük'. Crisp glowing typography.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Prominent 3D Turkish formula overlay: 'R = F büyük - F küçük (Zıt Yönlü Kuvvetler Kuralı)' in bold white and yellow 3D text.";
      lightComp = "Self-luminous 3D text key light, soft green ambient fill from field below. Focal plane f/5.6.";
      matSpec = "Luminous 3D graphic lettering, soft glowing vector outline.";
      pedCheck = "Teaches the mathematical rule for Opposing Forces ($R = F_{\text{büyük}} - F_{\text{küçük}}$).";
      break;

    case 37:
      env = "Air space above the tug-of-war rope.";
      dominant = "Floating 3D calculation graphic: 'R = 30 N - 20 N = 10 N', accompanied by a single net force vector arrow of 10 N pointing West.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Bold 3D calculation overlay: 'R = 30 N - 20 N = 10 N (Batı Yönünde)' rendered in glowing purple 3D graphics.";
      lightComp = "Radiant purple key glow from the 10 N net vector arrow pointing West. Focal plane f/4.";
      matSpec = "3D glowing math typography, luminous purple vector arrow.";
      pedCheck = "Applies the formula to solve the exact numerical example ($30\text{ N} - 20\text{ N} = 10\text{ N}$).";
      break;

    case 38:
      env = "Center of tug-of-war rope.";
      dominant = "Action shot of the rope strained tight between teams, focusing on the red ribbon marker to highlight the question: Which direction will the net force pull the rope?";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Glowing 3D Turkish question text: 'HALAT HANGİ YÖNE HAREKET EDER?'.";
      lightComp = "Dynamic sunlight key, high contrast shadows on rope strands. Focal plane f/2.8.";
      matSpec = "Strained hemp fibers under tension, red cotton cloth.";
      pedCheck = "Poses the directional question for net force in opposing force systems.";
      break;

    case 39:
      env = "West side of sports field.";
      dominant = "Wide action shot of the West team pulling the rope Westward and celebrating, as a prominent glowing purple arrow points Westward indicating the net force direction.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Dynamic 3D Turkish callout: 'GÜÇLÜ OLANIN YÖNÜNE! (BATI)'.";
      lightComp = "Direct sun key at 45°, saturated purple rim light along West team silhouette. Focal plane f/5.6.";
      matSpec = "Cotton t-shirts, green turf grass, luminous purple vector arrow.";
      pedCheck = "Shows the result: Motion occurs in the direction of the larger force (Westward).";
      break;

    case 40:
      env = "Sports field sideline.";
      dominant = "Medium shot of @mira holding up a digital tablet displaying the final result: 'Bileşke Kuvvet: Batı yönünde 10 N'. She smiles proudly at her calculation.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Crisp 3D Turkish result card on tablet screen: 'SONUÇ: Bileşke Kuvvet = Batı yönünde 10 N'.";
      lightComp = "Key sun at 45°, screen bounce fill illuminating face. Focal plane f/4 on tablet and face.";
      matSpec = "Glass tablet screen, satin aluminum tablet frame, SSS skin shading.";
      pedCheck = "Summarizes the full net force specification: Magnitude (10 N) and Direction (West).";
      break;

    case 41:
      env = "A quiet, cozy Turkish middle school library with mahogany bookshelves and reading lamps.";
      dominant = "Warm interior wide shot of the library. @mira steps quietly into the room after school, surrounded by tall wooden shelves filled with books.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Subtle 3D Turkish header floating near library entrance: 'OKUL KÜTÜPHANESİ'.";
      lightComp = "Warm practical lamp light key at 60° (3000K), cool ambient window fill at 25%. Painted soft ambient occlusion in corner pockets. Focal plane f/5.6 across library.";
      matSpec = "Mahogany wood grain with satin varnish sheen, brass lamp fixtures, paper book spines.";
      pedCheck = "Transitions the setting to a quiet environment ideal for examining stationary objects.";
      break;

    case 42:
      env = "Wooden study table inside the library.";
      dominant = "Medium shot of @mira standing beside a polished wooden study table, staring intently at a heavy blue science textbook sitting completely stationary on the table surface.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: 3D Turkish label above the book: 'DURAN FEN KİTABI'.";
      lightComp = "Single warm desk lamp key light at 60°, wood-reflected bounce fill at 30%. Focal plane f/4 sharp on book and @mira.";
      matSpec = "Polished oak desk with visible wood grain, blue hardcover book with foil-stamped texture.";
      pedCheck = "Presents the core phenomenon: A stationary object that appears to have no forces acting on it.";
      break;

    case 43:
      env = "Library study table close-up.";
      dominant = "Close-up of @mira leaning over the textbook with her chin resting on her hand, pondering whether hidden forces are secretly acting on the resting book.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Floating 3D question mark and text: 'Bu kitaba kuvvet etki ediyor mu?'.";
      lightComp = "Warm key light on face, cool-violet bounce fill on shadow side. Focal plane f/2.8 on eyes.";
      matSpec = "Subsurface skin scattering, wet dual-point eye specular, hardcover book cloth.";
      pedCheck = "Encourages inquiry into hidden static forces acting on resting objects.";
      break;

    case 44:
      env = "Textbook resting on study table surface.";
      dominant = "Cinematic 3D educational diagram overlay on the textbook: A downward blue vector arrow representing Gravity (Yer çekimi) pulling down, and an equal upward cyan vector arrow representing Normal Force (Masa tepki kuvveti) pushing up.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Clear 3D Turkish labels: Downward arrow labeled 'Yer Çekimi (Aşağı)', upward arrow labeled 'Masa Tepki Kuvveti (Yukarı)'.";
      lightComp = "Dual luminous vector arrows (blue down, cyan up) casting soft light onto book cover. Focal plane f/2.8 on book.";
      matSpec = "Foil-embossed blue book cover, oak table grain, self-luminous vector arrows.";
      pedCheck = "Reveals the two invisible equal and opposite vertical forces acting on the resting book.";
      break;

    case 45:
      env = "Textbook surface close-up.";
      dominant = "Animated close-up of the two equal and opposite vertical force arrows glowing brightly before cancelling each other out into a soft puff of golden sparkles.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Floating 3D Turkish text overlay: 'EŞİT VE ZIT YÖNLÜ KUVVETLER BİRBİRİNİ YOK EDER!'.";
      lightComp = "Radiant golden sparkles key glow fading into soft ambient light. Focal plane f/2.8.";
      matSpec = "Golden sparkle particles, book cover texture, satin table finish.";
      pedCheck = "Visually illustrates force cancellation: Equal magnitude + Opposite direction = Zero net force.";
      break;

    case 46:
      env = "Air space above the resting textbook.";
      dominant = "Clean 3D educational text floating over the book: 'Bileşke Kuvvet = 0 N (R = 0 N)'. Crisp glowing typography.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Bold 3D Turkish mathematical equation: 'BİLEŞKE KUVVET R = 0 N (SIFIR NEWTON)' in luminous white and cyan typography.";
      lightComp = "Self-luminous cyan text key glow floating over warm wooden table background. Focal plane f/4.";
      matSpec = "Luminous 3D typography, oak table surface.";
      pedCheck = "Establishes the mathematical state of equilibrium ($R = 0\text{ N}$).";
      break;

    case 47:
      env = "Library study area.";
      dominant = "Medium shot of @mira nodding in clear understanding as glowing 3D title text reading 'DENGELENMİŞ KUVVETLER' appears gracefully above her.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Bevelled 3D glowing Turkish title header: 'DENGELENMİŞ KUVVETLER (R = 0 N)' in radiant golden text.";
      lightComp = "Warm practical desk lamp key, cyan glow from 3D title text on @mira's forehead. Focal plane f/4.";
      matSpec = "SSS skin shading, glowing 3D title text, wooden bookshelves in background.";
      pedCheck = "Defines the fundamental concept: Balanced Forces (Dengelenmiş Kuvvetler).";
      break;

    case 48:
      env = "Library study area.";
      dominant = "Medium close-up of @mira looking around thoughtfully, reflecting that being in a balanced force state applies to objects moving at constant speed, not just stationary items.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Floating 3D Turkish question card: 'Dengelenmiş olmak sadece durmak mıdır?'.";
      lightComp = "Warm key light, cool window fill. Focal plane f/2.8 on face.";
      matSpec = "Subsurface skin scattering, fabric vest stitch texture, soft library background bokeh.";
      pedCheck = "Expands concept: Balanced forces also govern constant velocity motion.";
      break;

    case 49:
      env = "Scenic open highway under a bright afternoon sky.";
      dominant = "Cinematic wide panning shot of a sleek red car cruising smoothly at a steady constant speed along a paved highway. Horizontal force arrows (engine thrust vs friction) are equal and balanced.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Floating 3D Turkish callout overlay: 'SABİT SÜRATLE GİDEN ARABA (R = 0 N)'.";
      lightComp = "Sunlight key from 45°, blue sky bounce fill on car hood, warm road reflection. Focal plane f/5.6.";
      matSpec = "Metallic red car paint with glossy clearcoat sheen, asphalt road texture, glass windshield reflection.";
      pedCheck = "Real-world example 1 of balanced forces in motion: Constant speed car cruising.";
      break;

    case 50:
      env = "Sunny blue sky with soft white fluffy clouds.";
      dominant = "Aerial camera angle of a skydiver with a colorful open parachute gliding effortlessly at constant terminal velocity through the sky, with balanced vertical force arrows (gravity down vs air drag up).";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Floating 3D Turkish callout overlay: 'SABİT SÜRATLE SÜZÜLEN PARAŞÜTÇÜ (R = 0 N)'.";
      lightComp = "Direct high sun key, soft white cloud bounce fill at 35%. Focal plane f/5.6.";
      matSpec = "Nylon parachute fabric with visible weave, sky harness straps, cloud volume depth.";
      pedCheck = "Real-world example 2 of balanced forces in motion: Terminal velocity skydiver.";
      break;

    case 51:
      env = "Split-screen educational visual display.";
      dominant = "Dual split-screen: Left shows car speedometer holding steady at 90 km/h; right shows skydiver speedometer steady, confirming zero acceleration and constant velocity under balanced forces.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Turkish gauge labels: Left panel 'Sabit Sürat: 90 km/h', right panel 'Sabit Sürat: 50 m/s', with a bottom banner reading 'SÜRATM VE YÖN DEĞİŞMİYOR (R = 0 N)'.";
      lightComp = "Clean graphic studio lighting, self-luminous digital gauges. Focal plane f/5.6 across both panels.";
      matSpec = "Digital gauge displays, glass screen gloss, clean division line.";
      pedCheck = "Proves that balanced forces ($R = 0\text{ N}$) mean constant velocity (no change in speed or direction).";
      break;

    case 52:
      env = "Library window looking out to the garden.";
      dominant = "Medium shot of @mira looking through the glass window toward the garden outside, her attention caught by sudden accelerating motion.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: None required. Natural reaction observation shot.";
      lightComp = "Natural window daylight key, soft indoor room fill at 25%. Focal plane f/4 on @mira.";
      matSpec = "Glass window pane with subtle reflection, SSS skin shading, mahogany window frame.";
      pedCheck = "Transitions narrative focus toward Unbalanced Forces (changing motion).";
      break;

    case 53:
      env = "Apple tree branch outside library window.";
      dominant = "High-speed shot of a crisp red apple detaching from a green branch outside the window and accelerating downward toward the grass under gravity. Dynamic speed streaks.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Floating 3D Turkish callout arrow: 'HIZLANARAK DÜŞEN ELMA (Hareket Değişiyor)'.";
      lightComp = "Direct sun key, specular highlights on shiny apple skin. Focal plane f/2.8 on falling apple.";
      matSpec = "Glossy red apple skin, green leaf wax sheen, wood bark texture.";
      pedCheck = "Real-world example 1 of unbalanced force: Free-fall acceleration under net gravity force.";
      break;

    case 54:
      env = "Paved school path outside.";
      dominant = "Action shot of a student riding a bicycle on the path, applying the brakes as a small cat crosses, causing the bicycle to rapidly decelerate to a stop. Motion streaks on wheels.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Floating 3D Turkish callout arrow: 'YAVAŞLAYAN BİSİKLET (Fren Kuvveti Etkisi)'.";
      lightComp = "Sunlight key at 45°, gravel road bounce fill. Focal plane f/4 on bicycle.";
      matSpec = "Rubber bicycle tires, chrome handlebars with anisotropic highlights, paved path texture.";
      pedCheck = "Real-world example 2 of unbalanced force: Deceleration (slowing down) under net friction force.";
      break;

    case 55:
      env = "Library window view.";
      dominant = "Medium close-up of @mira watching through the window, realizing that any change in speed or direction means forces are NOT balanced.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Floating 3D Turkish thought card: 'HAREKET DEĞİŞİYORSA DENGELENMEMİŞTİR!'.";
      lightComp = "Window key light, soft interior bounce fill. Focal plane f/2.8 on face.";
      matSpec = "Subsurface skin scattering, wet eye specular, glass reflection.";
      pedCheck = "Key student deduction: Motion changes indicate Unbalanced Forces ($R \neq 0\text{ N}$).";
      break;

    case 56:
      env = "3D physics graphic space.";
      dominant = "3D educational diagram depicting an unequal pair of opposing force vector arrows acting on a block, where one arrow is noticeably larger than the other, resulting in net force 'R ≠ 0 N'.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Bold 3D Turkish mathematical expression: 'BİLEŞKE KUVVET R ≠ 0 N (SIFIRDAN FARKLI)' rendered in luminous red 3D text.";
      lightComp = "Dual opposing vector lights (large red arrow vs small blue arrow). Focal plane f/4.";
      matSpec = "3D block, self-luminous vector arrows of unequal length.";
      pedCheck = "Defines Unbalanced Forces: Opposing forces of UNEQUAL magnitude.";
      break;

    case 57:
      env = "3D graphic presentation space.";
      dominant = "Dynamic 3D infographic illustration titled 'DENGELENMEMİŞ KUVVETLER', demonstrating how an unbalanced net force causes changes in motion (speeding up, slowing down, or turning).";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Glowing 3D Turkish header: 'DENGELENMEMİŞ KUVVETLER (R ≠ 0 N)' with bullet points: '1. Hızlanır', '2. Yavaşlar', '3. Yön Değiştirir'.";
      lightComp = "High-contrast digital key lighting, vibrant yellow title glow. Focal plane f/5.6.";
      matSpec = "3D graphic text, animated motion arrows.";
      pedCheck = "Formal definition of Unbalanced Forces (Dengelenmemiş Kuvvetler).";
      break;

    case 58:
      env = "Library study table.";
      dominant = "Close-up shot of @mira writing down the core rule in her colorful science study journal with a confident smile. Sunlight glints off her pen tip.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Readable 3D Turkish handwriting in notebook: 'Bir şey hızlanıyorsa, yavaşlıyorsa veya yön değiştiriyorsa orada DENGELENMEMİŞ KUVVET vardır.'";
      lightComp = "Warm desk light key, pen tip specular reflection. Focal plane f/2.8 on notebook and pen.";
      matSpec = "Paper notebook fiber texture, metallic pen tip, SSS skin shading on hand.";
      pedCheck = "Student consolidation of learning into written golden rule in Turkish.";
      break;

    case 59:
      env = "Clean 3D animation gallery stage.";
      dominant = "Triptych composite 3D animation showcasing three micro-examples of unbalanced forces: 1. Rocket accelerating skyward; 2. Car braking at red light; 3. Soccer ball curving mid-air.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Turkish 3D panel titles: Left 'HIZLANMA', center 'YAVAŞLAMA', right 'YÖN DEĞİŞTİRME' in crisp white 3D text.";
      lightComp = "Studio softbox key lighting, dynamic flame exhaust glow on rocket. Focal plane f/5.6.";
      matSpec = "Rocket metallic hull, car rubber tires, soccer ball synthetic leather.";
      pedCheck = "Triple real-world summary of unbalanced force effects: Speed up, Slow down, Change direction.";
      break;

    case 60:
      env = "Library environment.";
      dominant = "Medium camera shot of @mira pointing enthusiastically toward the viewer with a bright confident smile, summarizing the fundamental science rule for the audience.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Floating 3D Turkish summary banner: 'DENGELENMEMİŞ GÜÇ İŞ BAŞINDADIR!'.";
      lightComp = "Warm key light at 45°, amber rim highlight on silhouette. Focal plane f/4 on @mira.";
      matSpec = "Subsurface skin scattering, woven fabric sweater vest, soft background bokeh.";
      pedCheck = "Direct student-to-audience teaching summary.";
      break;

    case 61:
      env = "Tree-lined neighborhood sidewalk at golden hour sunset.";
      dominant = "Golden hour sunset shot of @mira walking home along a sidewalk, her backpack over her shoulders, looking happy and fulfilled after a day of discovery. Soft warm sun glare.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Soft floating 3D Turkish text: 'EVE DÖNÜŞ VE ÖZET'.";
      lightComp = "Low golden sun key at 15°, warm honey bounce fill, bright rim glow along hair and shoulders. Focal plane f/4.";
      matSpec = "Cobblestone sidewalk, autumn tree leaves, SSS skin shading in golden light.";
      pedCheck = "Narrative conclusion of the daily learning journey.";
      break;

    case 62:
      env = "Clean 3D graphic summary display.";
      dominant = "Triple split-screen summary graphic: 1. Forces combining in same direction; 2. Forces opposing in opposite directions; 3. Balanced forces in equilibrium (R = 0 N).";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Turkish split-screen headers: Panel 1 'Aynı Yönlü (Topla)', Panel 2 'Zıt Yönlü (Çıkar)', Panel 3 'Dengelenmiş (R = 0 N)' in clean 3D graphic design.";
      lightComp = "Clean graphic studio illumination. Focal plane f/5.6 across all panels.";
      matSpec = "Matte graphic background, luminous vector diagrams.";
      pedCheck = "Comprehensive visual recap of the entire 6th grade Force unit in Turkish.";
      break;

    case 63:
      env = "Energetic graphic stage.";
      dominant = "Medium close-up of @mira giving an energetic thumbs-up to the camera with glowing stylized speed-lines and lightning energy FX around her, celebrating fast learning.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Dynamic 3D Turkish celebration banner: 'BİLEŞKE KUVVETİ JET HIZIYLA ÖĞRENDİK! 🚀'.";
      lightComp = "Vibrant key light, glowing energy FX rim fill. Focal plane f/2.8 on @mira.";
      matSpec = "Subsurface skin scattering, stylized luminous FX trails.";
      pedCheck = "Positive emotional reinforcement for mastering physics.";
      break;

    case 64:
      env = "Warm studio lighting backdrop.";
      dominant = "Frontal shot of @mira holding up a bright golden reward question card toward the camera with a playful, inviting expression.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Bevelled 3D golden text on card: 'ŞİMDİ SIRA SİZDE! MİRA'DAN ÖDÜLLÜ SORU 🏆'.";
      lightComp = "Warm key light at 45°, golden card reflection on face. Focal plane f/2.8 on question card and face.";
      matSpec = "Foil-stamped golden card, SSS skin shading, fabric shirt collar.";
      pedCheck = "Introduces the end-of-lesson interactive reward question.";
      break;

    case 65:
      env = "3D graphic presentation space.";
      dominant = "Crisp 3D educational diagram of a bright blue gift box pulled Northward with a glowing 15 N arrow and pulled Southward with an equal glowing 15 N arrow.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Clear Turkish vector labels on box: Top arrow 'Kuzey: 15 N', bottom arrow 'Güney: 15 N'.";
      lightComp = "Dual opposing vector lights (North 15 N vs South 15 N) illuminating blue box. Focal plane f/4.";
      matSpec = "Blue cardboard box texture, luminous vector arrows.";
      pedCheck = "Presents the quiz scenario: Equal and opposite 15 N forces on a box.";
      break;

    case 66:
      env = "3D graphic quiz display.";
      dominant = "Close-up of the 3D quiz box graphic with floating glowing question marks asking the two core quiz questions.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Glowing 3D Turkish quiz text: '1. Kutu dengelenmiş kuvvette midir?\n2. Bileşke kuvvet (R) kaç N olur?' in clean white 3D typography.";
      lightComp = "Self-luminous 3D question mark text glow. Focal plane f/4.";
      matSpec = "3D graphic text, glowing question mark icons.";
      pedCheck = "Prompts students to calculate: Is it balanced? What is the net force R?";
      break;

    case 67:
      env = "Warm studio environment.";
      dominant = "Medium shot of @mira pointing down toward the comment section with a friendly, interactive gesture, inviting viewers to share their answers.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Interactive 3D Turkish banner below: 'CEVAPLARINIZI YORUMLARA BEKLİYORUZ! ✍️'.";
      lightComp = "Warm key light at 45°, soft shadow fill. Focal plane f/4 on @mira.";
      matSpec = "Subsurface skin scattering, fabric vest weave, soft background.";
      pedCheck = "Drives student engagement by encouraging comment section answers.";
      break;

    case 68:
      env = "Inspiring lighting backdrop.";
      dominant = "Close-up shot of @mira holding a glowing atom/science emblem in her hand, waving warmly to the audience with inspiring rim lighting.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Glowing 3D Turkish sign-off banner: 'BİLİMLE KALIN, KUVVETİNİZ HEP DENGEDE KALSIN! ⚛️'.";
      lightComp = "Key glow from atom emblem in hand casting cyan light on face, saturated golden rim light. Focal plane f/2.8.";
      matSpec = "Luminous 3D atom model, SSS skin shading, wet eye specular.";
      pedCheck = "Inspires love for science and physical discovery.";
      break;

    case 69:
      env = "Cinematic Pixar feature end-credits visual stage.";
      dominant = "Cinematic end-title frame featuring @mira waving goodbye beside a beautifully stylized 3D banner.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Bevelled 3D golden end-title banner: 'MİRA İLE BİR SONRAKİ KEŞİFTE GÖRÜŞMEK ÜZERE! 👋'.";
      lightComp = "Warm cinematic key lighting, festive sparkle bounce fill. Focal plane f/5.6.";
      matSpec = "Embossed 3D title banner, SSS skin shading, feature animation end-credits polish.";
      pedCheck = "Final warm farewell sign-off for the educational video.";
      break;

    default:
      env = "A clean 3D Pixar feature animation scene.";
      dominant = "Feature 3D CGI illustration of science education.";
      typographyText = "DIEGETIC ON-SCREEN TEXT & GRAPHICS: Clean Turkish educational label.";
      lightComp = "Single key light at 45°, soft bounce fill.";
      matSpec = "PBR textures with subsurface skin scattering.";
      pedCheck = "Standard physics education shot.";
  }

  return `${RENDERMAN_HEADER}\n\n${TURKISH_DEMOGRAPHIC_SPEC}\n\nENVIRONMENT: ${env}\n\nSCENE DOMINANT ELEMENT: ${dominant}\n\n${typographyText}\n\nLIGHTING & COMPOSITION: ${lightComp}\n\nMATERIAL SPECIFICITY: ${matSpec}\n\nPEDAGOGY CHECK: ${pedCheck}\n\n${MASTER_AVOID}`;
}

// Generate ultimate Turkish Educational RenderMan prompt package
let mdContent = `# MAMILAS — 6. Sınıf Kuvvet (69 Sahne) Türkçe 3D Tipografili Master RenderMan Prompt Paketi\n\n`;
mdContent += `> **Motor / Diyalekt:** Fal Nano Banana 2 (\`nano banana 2\` / NB2 - Gemini reasoning mimarisi)\n`;
mdContent += `> **Görsel Mimari:** Pixar RenderMan / RenderMan-successor premium-CG feature-animation pipeline lineage\n`;
mdContent += `> **Demografi & Ortam:** Tamamen Türkiye Ortaokul Demografisi (Akdeniz/Anadolu yüz hatları, kahverengi saç/göz, Türkiye okul üniforması)\n`;
mdContent += `> **Tipografi & Grafikler:** After Effects gerektirmeyen, doğrudan 3D render içinde işlenmiş kusursuz Türkçe pedagojik başlıklar, formüller ve şemalar\n`;
mdContent += `> **Karakter Etiketleme:** @mira fiziksel tanımı yapılmadan doğrudan \`@mira\` olarak etiketlendi (Magnific referans kilitleri için)\n\n`;
mdContent += `---\n\n`;

const updatedScenes = rawData.scenes.map((scene) => {
  const voText = scene.architecture?.source?.exactText || scene.architecture?.beat || '';
  const prompt = buildRichScenePrompt(scene.id, voText);
  
  mdContent += `## Sahne ${scene.id} (${scene.phaseName || 'Main'})\n\n`;
  mdContent += `**Voiceover (Seslendirme):**\n> "${voText.trim()}"\n\n`;
  mdContent += `**Fal Nano Banana 2 Master RenderMan Prompt (Türkçe Tipografi & 3D Grafik Dahil):**\n\`\`\`text\n${prompt}\n\`\`\`\n\n`;
  mdContent += `---\n\n`;

  return {
    ...scene,
    prompts: {
      image: prompt,
      dialect: "nano_banana_2",
      updatedAt: new Date().toISOString()
    }
  };
});

// Write SAHNE-PROMPTLAR.md
const mdFilePath = path.join(outputDir, 'SAHNE-PROMPTLAR.md');
fs.writeFileSync(mdFilePath, mdContent, 'utf8');
console.log('Saved Turkish Typography RenderMan SAHNE-PROMPTLAR.md to:', mdFilePath);

// Write updated command JSON
const updatedCommand = {
  ...rawData,
  scenes: updatedScenes,
  lastUpdated: new Date().toISOString(),
  outputFolder: outputDir
};

const jsonFilePath = path.join(outputDir, 'mamilas_command.json');
fs.writeFileSync(jsonFilePath, JSON.stringify(updatedCommand, null, 2), 'utf8');
console.log('Saved Turkish Typography RenderMan updated command JSON to:', jsonFilePath);

console.log('Done! All 69 scenes rebuilt with 3D Turkish diegetic typography and authentic Turkish demographic locks.');
