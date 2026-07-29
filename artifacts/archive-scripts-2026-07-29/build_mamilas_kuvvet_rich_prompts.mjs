import fs from 'node:fs';
import path from 'node:path';

const commandFilePath = '/Users/Muhammet/Desktop/-_mamilas_command.json';
const outputDir = '/Users/Muhammet/Desktop/6. sınıf kuvvet';

const rawData = JSON.parse(fs.readFileSync(commandFilePath, 'utf8'));

// Bespoke, rich, detailed Art-Director level prompts for all 69 scenes tailored for Fal Nano Banana 2
const richPrompts = {
  1: `A 3D Pixar feature animation scene. Cinematic low-angle establishing shot of @mira in her navy middle school vest and white collared shirt, carrying her backpack as she steps out from the carved wooden entrance of a suburban apartment building. Soft golden 5500K morning sunlight washes over the cobblestone sidewalk, creating long warm shadows. Rich PBR textures on brick walls, lush green potted plants by the doorway, and clear atmospheric volumetric depth. Rendered in full 3D CGI animation with subsurface scattering skin shading, no live action, no photorealism.`,
  
  2: `A 3D Pixar feature animation scene. Dynamic low-angle tracking shot of @mira pushing open a heavy front door with her palm, slinging her canvas school backpack securely over her shoulder, and sprinting down the tree-lined sidewalk toward a bright yellow school bus waiting down the street. Subtle motion blur on the asphalt sidewalk, fluttering autumn leaves in the breeze, and crisp reflections on the bus's side mirrors. High-end feature CGI animation, vibrant color palette, non-photorealistic.`,

  3: `A 3D Pixar feature animation scene. Medium side-tracking camera movement following @mira running with a joyful expressive smile. Radiating around her sneakers and backpack straps are vibrant semi-transparent golden and cyan force vector lines with soft particle trails, visually illustrating the invisible physical forces pushing and pulling as she moves. Rich volumetric lighting, soft rim light separating character from background, feature 3D CGI style.`,

  4: `A 3D Pixar feature animation scene. A crisp triptych composite shot showcasing three educational micro-illustrations of applied forces: Left panel shows a hand pushing open a wooden door with a curved glowing force arrow; center panel captures a sneaker kicking a colorful soccer ball with radial impact vectors; right panel shows hands pushing a metal shopping cart with a bold forward arrow. Rendered in stylized clean 3D CGI with soft studio lighting.`,

  5: `A 3D Pixar feature animation scene. Macro camera focus on a glossy crimson wooden cube resting on a polished oak table. Surrounding the cube are translucent 3D force vector arrows pointing inward from four different angles, with a glowing golden question mark hovering directly above the box. Soft depth of field, warm ambient indoor lighting, clean educational visual concept in feature 3D CGI.`,

  6: `A 3D Pixar feature animation scene. Close-up character shot of @mira turning her head toward the camera with an energetic, expressive smile, playfully shaking her head with wide curious hazel eyes. Soft key lighting highlighting her animated expression, subtle subsurface scattering on skin, rich fabric texture on her collared shirt. Feature animation quality, non-photorealistic CGI.`,

  7: `A 3D Pixar feature animation scene. Dynamic 3D physics visual effect: Two distinct glowing force vector arrows—one electric blue and one vibrant cyan—flow together and fuse seamlessly into a single large, radiant golden vector arrow pushing a heavy stone block across a grid floor. Volumetric light bloom, particle embers, feature 3D CGI educational FX.`,

  8: `A 3D Pixar feature animation scene. Wide cinematic camera angle of @mira looking up in awe with sparkling wide eyes as glowing 3D holographic typography reading 'BİLEŞKE KUVVET' hovers in mid-air before her like a magical discovery. Atmospheric dust motes catching the golden light, cinematic shallow depth of field, feature 3D CGI animation.`,

  9: `A 3D Pixar feature animation scene. Medium camera framing of @mira smiling warmly directly at the viewer, reaching out her hand in an inviting welcoming gesture. Warm morning sun flare bursting behind her shoulder, soft background blur of a green park, expressive character pose in 3D feature animation CGI style.`,

  10: `A 3D Pixar feature animation scene. Wide interior shot of a modern Turkish middle school science classroom. @mira sits at a wooden double-desk near the front alongside fellow Turkish classmates. At the front, a friendly teacher stands next to a glowing 4K interactive Smartboard (Akıllı Tahta). Sunlight streams through large windows casting soft light rays across wooden desks and corkboards pinned with science posters. Rich 3D CGI interior detail.`,

  11: `A 3D Pixar feature animation scene. Over-the-shoulder perspective looking past @mira at her desk toward the front of the room. The science teacher uses a digital stylus on the glass Smartboard (Akıllı Tahta) to draw a bright blue 3D box with glowing red directional force arrows. Deep classroom depth, warm ambient lighting, clean educational focus in 3D CGI.`,

  12: `A 3D Pixar feature animation scene. Detailed shot of the glass Smartboard (Akıllı Tahta) display, showing four glowing educational infographic cards: 1. Application Point ('Uygulama Noktası'), 2. Line of Action ('Doğrultu'), 3. Direction ('Yön'), 4. Magnitude ('Büyüklük'). Crisp glowing text, high-contrast dark digital background, clean 3D graphic design.`,

  13: `A 3D Pixar feature animation scene. Close-up shot of the Smartboard (Akıllı Tahta) screen highlighting a 3D block with a glowing crimson circular dot right where the force arrow makes contact, clearly labeled '1. Uygulama Noktası'. Sleek digital UI aesthetic, soft neon glow, 3D CGI feature graphic.`,

  14: `A 3D Pixar feature animation scene. Close-up of the Smartboard (Akıllı Tahta) display showing a horizontal double-ended axis line extending East and West across the grid, labeled '2. Doğrultu (Doğu - Batı)'. Clean vector graphics, vivid blue neon lines on dark digital glass, 3D infographic precision.`,

  15: `A 3D Pixar feature animation scene. Close-up of the Smartboard (Akıllı Tahta) screen focusing on a bright glowing arrow pointing specifically Eastward, marked with a bold white label reading '3. Yön (Doğu)'. High-tech educational presentation in 3D CGI style.`,

  16: `A 3D Pixar feature animation scene. Close-up of the Smartboard (Akıllı Tahta) screen displaying a force vector arrow marked with a glowing numerical value reading '4. Büyüklük: 5 N'. Crisp vector typography, luminous electric green glow, clean educational graphic.`,

  17: `A 3D Pixar feature animation scene. Medium shot of @mira sitting at her wooden desk, holding a yellow pencil over her open science notebook with a thoughtful, curious facial expression. A stylized floating thought bubble above her depicts two force arrows pushing a box simultaneously. Warm indoor classroom illumination, rich 3D CGI detail.`,

  18: `A 3D Pixar feature animation scene. Medium shot of the friendly science teacher smiling warmly beside the glowing digital Smartboard (Akıllı Tahta), tapping the screen as sparkling golden particles illuminate the core definition of Net Force. Atmospheric glow, warm engaging atmosphere, feature 3D CGI.`,

  19: `A 3D Pixar feature animation scene. High-tech 3D graphic animation on the Smartboard (Akıllı Tahta) depicting two individual blue force vector arrows combining into one massive golden net force arrow pushing a heavy crate, titled 'Bileşke Kuvvet (Net Kuvvet)'. Vivid glowing FX, clean 3D educational presentation.`,

  20: `A 3D Pixar feature animation scene. Center-framed shot of the Smartboard (Akıllı Tahta) screen showcasing a bold 3D capital letter 'R' surrounded by a subtle golden aura, representing Net Force ('R = Bileşke Kuvvet'). High-contrast digital aesthetic, 3D feature CGI graphic.`,

  21: `A 3D Pixar feature animation scene. Wide shot of the brightly lit school hallway and sunny courtyard as the brass school bell rings. Turkish middle school students spill out onto the paved schoolyard for recess. Bright afternoon sunlight, bustling energetic background, 3D feature CGI animation.`,

  22: `A 3D Pixar feature animation scene. Medium wide shot of @mira stepping out into the sunny school courtyard, coming across two Turkish male classmates, Ali and Can, crouched near a patch of wet soil trying to dislodge a glossy crimson toy car stuck in the mud. Realistic mud textures, warm summer sunlight, 3D CGI style.`,

  23: `A 3D Pixar feature animation scene. Close-up action angle of student Ali straining as he pushes the red toy car Eastward with all his strength. Extending from his hands is a glowing translucent force arrow labeled '10 N', while the car remains stuck in the dark mud. High character expression, 3D CGI feature quality.`,

  24: `A 3D Pixar feature animation scene. Dynamic action shot as student Can kneels beside Ali, adding his hands to the back of the toy car and pushing in the exact same Eastward direction. A second glowing vector arrow labeled '15 N' appears right next to Ali's arrow. Vivid energy FX, 3D feature animation CGI.`,

  25: `A 3D Pixar feature animation scene. Low side-profile shot of both Turkish boys Ali and Can pushing in unison toward the East. Floating above the red toy car are two parallel glowing vector arrows ('10 N' and '15 N') pointing in the same direction. Rich sunlight, dynamic composition, 3D CGI physics illustration.`,

  26: `A 3D Pixar feature animation scene. Close-up of @mira watching excitedly from the sideline, holding up her fingers as she calculates, with a glowing plus sign (+) floating between the two force values in mid-air above the boys. Expressive smile, soft background blur, 3D feature CGI.`,

  27: `A 3D Pixar feature animation scene. Cinematic floating 3D math graphic in mid-air: 'R = F1 + F2 = 10 N + 15 N = 25 N', accompanied by a large golden net force arrow of '25 N' pointing East. Clean educational overlay, radiant glow, feature 3D CGI presentation.`,

  28: `A 3D Pixar feature animation scene. High-energy action shot as the red toy car pops out of the mud with a fun splash of dirt, shooting forward to the East propelled by the 25 N net force, while Ali and Can cheer victoriously. Motion blur, dynamic mud particles, 3D feature CGI.`,

  29: `A 3D Pixar feature animation scene. Medium close-up of @mira smiling proudly with her hands on her hips, nodding knowingly as she realizes that forces in the same direction add together to create a stronger net force. Bright sunny backdrop, 3D character animation polish.`,

  30: `A 3D Pixar feature animation scene. Wide panoramic shot of the green grass school athletic field during PE class. Two teams of Turkish middle school students line up on opposite sides of a thick hemp rope for a tug-of-war match. Clear blue afternoon sky, lush turf texture, 3D feature CGI.`,

  31: `A 3D Pixar feature animation scene. Medium framing of @mira standing near the white chalk sideline of the sports field, watching the intense tug-of-war competition with focused, curious eyes. Warm sunlight, soft grass blades in foreground, 3D CGI feature quality.`,

  32: `A 3D Pixar feature animation scene. Dynamic close-up of the tug-of-war rope under tension: On the West side, a student pulls hard with a glowing 30 N arrow pointing West; on the East side, another student pulls back with a glowing 20 N arrow pointing East. High tension visual, 3D CGI physics FX.`,

  33: `A 3D Pixar feature animation scene. Macro shot of the bright red cloth ribbon tied at the center of the hemp rope, slowly sliding toward the West side across a white chalk line on the green grass. Shallow depth of field, detailed rope fiber texture, 3D CGI feature animation.`,

  34: `A 3D Pixar feature animation scene. Medium camera shot of @mira observing the opposing forces acting along the same axis line, gesturing with her hands in opposite directions as she analyzes the net force math. Expressive pose, 3D feature CGI.`,

  35: `A 3D Pixar feature animation scene. Close-up shot of @mira thoughtfully speaking to herself, her eyes looking up in thought as she realizes that forces pulling in opposite directions cannot be added together. Expressive facial micro-animation, 3D CGI style.`,

  36: `A 3D Pixar feature animation scene. Clean floating 3D educational infographic illustrating the subtraction rule for opposing forces: 'R = F büyük - F küçük'. Bold glowing white and yellow text, crisp digital background, 3D graphic presentation.`,

  37: `A 3D Pixar feature animation scene. Floating 3D calculation graphic in mid-air: 'R = 30 N - 20 N = 10 N', accompanied by a single net force vector arrow of 10 N pointing West. High visibility educational presentation in 3D CGI.`,

  38: `A 3D Pixar feature animation scene. Action shot of the tug-of-war rope strained tight between the two teams, focusing on the center red ribbon to emphasize the question of which direction the net force will pull the rope. Dynamic lighting, 3D CGI style.`,

  39: `A 3D Pixar feature animation scene. Wide action shot of the West tug-of-war team successfully pulling the rope Westward and celebrating, as a giant glowing green directional arrow points Westward indicating the winning net force direction. Bright sunny field, 3D feature CGI.`,

  40: `A 3D Pixar feature animation scene. Medium shot of @mira holding up a digital tablet displaying the final result: 'Bileşke Kuvvet: Batı yönünde 10 N'. She smiles proudly at her accurate calculation. Warm outdoor lighting, 3D feature character animation.`,

  41: `A 3D Pixar feature animation scene. Warm interior wide shot of a tranquil Turkish middle school library with tall mahogany bookshelves, quiet study tables, and warm reading lamps. @mira steps quietly into the room after school. Cozy golden lighting, 3D CGI interior detail.`,

  42: `A 3D Pixar feature animation scene. Medium shot of @mira standing beside a polished wooden library study table, staring intently at a thick blue science textbook sitting completely stationary on the table surface. Soft ambient library light, 3D CGI feature detail.`,

  43: `A 3D Pixar feature animation scene. Close-up of @mira leaning over the table, resting her chin on her hand with a curious expression as she wonders if invisible forces are acting on the stationary textbook. Soft key lighting, 3D character animation.`,

  44: `A 3D Pixar feature animation scene. Cinematic 3D physics diagram overlay on the textbook: A blue downward arrow representing Gravity ('Yer çekimi') pulling down, and an equal cyan upward arrow representing Normal Force ('Masa tepki kuvveti') pushing up. Clean 3D educational graphic.`,

  45: `A 3D Pixar feature animation scene. Animated close-up of the two equal and opposite vertical force arrows (Gravity vs Normal Force) glowing brightly before cancelling each other out into a soft puff of golden sparkles. Radiant FX, 3D CGI educational visualization.`,

  46: `A 3D Pixar feature animation scene. Floating 3D text overlaying the stationary textbook: 'Bileşke Kuvvet = 0 N (R = 0 N)'. Crisp white and cyan typography, glowing outline, clean 3D graphic presentation.`,

  47: `A 3D Pixar feature animation scene. Medium shot of @mira nodding her head in clear understanding as glowing 3D title text reading 'DENGELENMİŞ KUVVETLER' appears gracefully above her. Warm library environment, 3D feature character animation.`,

  48: `A 3D Pixar feature animation scene. Medium close-up of @mira looking around thoughtfully, reflecting that being in a balanced force state applies to moving objects in constant motion, not just stationary items. Expressive character animation, 3D CGI style.`,

  49: `A 3D Pixar feature animation scene. Cinematic wide panning shot of a sleek modern red car cruising smoothly at a steady constant speed along a scenic highway under a clear blue sky. Horizontal force arrows (engine force vs friction) are equal and balanced. Rich lighting, 3D feature CGI.`,

  50: `A 3D Pixar feature animation scene. Aerial camera angle of a skydiver with a colorful open parachute gliding effortlessly at constant terminal velocity through a sunny blue sky with fluffy white clouds, with balanced vertical force arrows (gravity vs air resistance). Breathtaking atmosphere, 3D CGI.`,

  51: `A 3D Pixar feature animation scene. Dual split-screen visualization: Left side shows the car's speedometer holding steady at 90 km/h; right side shows the skydiver's speedometer holding steady, confirming zero acceleration and constant velocity under balanced forces. Clean 3D graphic design.`,

  52: `A 3D Pixar feature animation scene. Medium shot of @mira looking out through the large glass window of the school library toward the green courtyard outside, her attention caught by sudden motion in the garden. Soft reflections on glass, 3D feature CGI animation.`,

  53: `A 3D Pixar feature animation scene. High-speed camera shot of a crisp red apple detaching from a green tree branch outside the window and accelerating downward toward the grass under gravity. Dynamic motion streaks, crisp sunlight, 3D feature CGI detail.`,

  54: `A 3D Pixar feature animation scene. Action shot of a student riding a bicycle on the paved school path, applying the brakes as a small cat crosses the path, causing the bicycle to rapidly decelerate to a complete stop. Dust particles, motion blur, 3D feature CGI.`,

  55: `A 3D Pixar feature animation scene. Medium close-up of @mira watching through the window, realizing that any change in speed or direction signifies that forces are NOT balanced. Thoughtful expressive face, 3D character animation.`,

  56: `A 3D Pixar feature animation scene. 3D educational diagram depicting an unequal pair of opposing force vector arrows acting on an object, where one arrow is noticeably larger than the other, resulting in a net force 'R ≠ 0 N'. Clean 3D graphic.`,

  57: `A 3D Pixar feature animation scene. Dynamic 3D infographic illustration titled 'DENGELENMEMİŞ KUVVETLER', visually demonstrating how an unbalanced net force causes changes in motion (speeding up, slowing down, or turning). Bright high-contrast graphics in 3D CGI.`,

  58: `A 3D Pixar feature animation scene. Close-up shot of @mira writing down the core rule in her colorful science study journal with a confident, satisfied smile. Sunlight glinting off her pen tip, warm cozy lighting, 3D feature animation polish.`,

  59: `A 3D Pixar feature animation scene. Triptych composite 3D animation showcasing three micro-examples of unbalanced forces: 1. A space rocket accelerating skyward with flaming exhaust, 2. A red car braking at a red light, 3. A soccer ball curving mid-air into a goal. Vivid 3D feature CGI.`,

  60: `A 3D Pixar feature animation scene. Medium camera shot of @mira pointing enthusiastically toward the viewer with a bright confident smile, summarizing the golden science rule clearly for the audience. Warm engaging backdrop, 3D feature character animation.`,

  61: `A 3D Pixar feature animation scene. Golden hour sunset shot of @mira walking home along a tree-lined sidewalk, her school backpack over her shoulders, looking happy and fulfilled after a day of discovery. Soft warm sun glare, peaceful neighborhood street, 3D feature CGI.`,

  62: `A 3D Pixar feature animation scene. Triple split-screen summary graphic: 1. Forces combining in the same direction, 2. Forces opposing in opposite directions, 3. Balanced forces in equilibrium (R = 0 N). Perfect educational summary layout in clean 3D graphic design.`,

  63: `A 3D Pixar feature animation scene. Medium close-up of @mira giving an energetic thumbs-up to the camera with glowing stylized speed-lines and lightning energy FX around her, celebrating fast learning. Dynamic lighting, 3D feature character animation.`,

  64: `A 3D Pixar feature animation scene. Frontal shot of @mira holding up a bright golden reward question card toward the camera with a playful, inviting expression. Warm key light, shallow background depth, 3D feature animation polish.`,

  65: `A 3D Pixar feature animation scene. Crisp 3D educational diagram of a bright blue gift box pulled Northward with a glowing 15 N arrow and pulled Southward with an equal glowing 15 N arrow. Clean quiz presentation, high-contrast digital background, 3D CGI.`,

  66: `A 3D Pixar feature animation scene. Close-up of the 3D quiz box graphic with floating glowing question marks asking: 'Dengelenmiş kuvvette midir? Bileşke kuvvet kaç N?'. Bold readable typography, 3D graphic presentation.`,

  67: `A 3D Pixar feature animation scene. Medium shot of @mira pointing down toward the comment section with a friendly, interactive gesture, inviting viewers to share their answers. Expressive character animation, warm inviting light, 3D CGI.`,

  68: `A 3D Pixar feature animation scene. Close-up shot of @mira holding a glowing atom/science emblem in her hand, waving warmly to the audience with inspiring rim lighting. Soft background blur, 3D feature character animation.`,

  69: `A 3D Pixar feature animation scene. Cinematic end-title frame featuring @mira waving goodbye beside a beautifully stylized 3D banner reading 'Mira ile Bir Sonraki Keşifte Görüşmek Üzere!'. Warm Pixar end-credits feature film visual style.`
};

let mdContent = `# MAMILAS — 6. Sınıf Kuvvet (69 Sahne) Zengin & Detaylı Image Prompt Paketi\n\n`;
mdContent += `> **Motor / Diyalekt:** Fal Nano Banana 2 (\`nano banana 2\` / NB2 - Gemini reasoning mimarisi)\n`;
mdContent += `> **Görsel Stil:** 3D Pixar Animasyon Filmi Kalitesi (Show / Wow Faktörlü - Detaylı Işık, PBR Kaplama ve Kamera Açısı)\n`;
mdContent += `> **Demografi & Ortam:** Türkiye Ortaokulu (Akıllı Tahta / Sınıf / Bahçe / Kütüphane / Spor Sahası)\n`;
mdContent += `> **Karakter Etiketleme:** @mira fiziksel tanımı yapılmadan doğrudan \`@mira\` olarak etiketlendi (Magnific referans kilitleri için)\n`;
mdContent += `> **On-Screen Text:** Özel kısıtlama yok (diegetik Akıllı Tahta görselleri ve 3D pedagojik şemalar serbest)\n\n`;
mdContent += `---\n\n`;

const updatedScenes = rawData.scenes.map((scene) => {
  const voText = scene.architecture?.source?.exactText || scene.architecture?.beat || '';
  const prompt = richPrompts[scene.id] || `A 3D Pixar feature animation scene for scene ${scene.id}.`;
  
  mdContent += `## Sahne ${scene.id} (${scene.phaseName || 'Main'})\n\n`;
  mdContent += `**Voiceover (Seslendirme):**\n> "${voText.trim()}"\n\n`;
  mdContent += `**Fal Nano Banana 2 Detailed Image Prompt:**\n\`\`\`text\n${prompt}\n\`\`\`\n\n`;
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
console.log('Saved rich SAHNE-PROMPTLAR.md to:', mdFilePath);

// Write updated command JSON
const updatedCommand = {
  ...rawData,
  scenes: updatedScenes,
  lastUpdated: new Date().toISOString(),
  outputFolder: outputDir
};

const jsonFilePath = path.join(outputDir, 'mamilas_command.json');
fs.writeFileSync(jsonFilePath, JSON.stringify(updatedCommand, null, 2), 'utf8');
console.log('Saved rich updated command JSON to:', jsonFilePath);

console.log('Done! All 69 scenes populated with custom, detailed, non-generic prompts.');
