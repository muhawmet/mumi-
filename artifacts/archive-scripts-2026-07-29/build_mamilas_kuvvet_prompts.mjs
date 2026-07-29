import fs from 'node:fs';
import path from 'node:path';

const commandFilePath = '/Users/Muhammet/Desktop/-_mamilas_command.json';
const outputDir = '/Users/Muhammet/Desktop/6. sınıf kuvvet';

const rawData = JSON.parse(fs.readFileSync(commandFilePath, 'utf8'));

// Nano Banana 2 Natural Art-Director Style Generator
function createNB2Prompt(sceneId, voText) {
  const STYLE = "Official 3D CGI Pixar feature animation film style, continuous PBR shading, vibrant lighting, volumetric depth, cinematic composition, no photoreal, not live-action.";
  const ENVT = "Turkish middle school environment with authentic classroom architecture, wooden student desks, bright welcoming light.";

  let prompt = "";

  switch (sceneId) {
    case 1:
      prompt = `A 3D Pixar-style feature animation scene. Low angle establishing shot of @mira in her school uniform with her backpack, stepping out from the entrance of a suburban apartment building onto a sunny paved sidewalk in the morning light, ready for school. ${STYLE} ${ENVT}`;
      break;
    case 2:
      prompt = `A 3D Pixar-style feature animation scene. Dynamic action tracking shot of @mira pushing open a heavy front door, slinging her school backpack over her shoulder, and running energetically down the sunny sidewalk toward a yellow school bus. Vibrant morning sunlight with motion blur on her feet. ${STYLE} ${ENVT}`;
      break;
    case 3:
      prompt = `A 3D Pixar-style feature animation scene. Medium tracking shot of @mira running with a bright smile. Stylized semi-transparent glowing force arrows and motion trails emanate from her shoes and backpack straps, visually illustrating invisible physical forces acting on her as she moves. ${STYLE}`;
      break;
    case 4:
      prompt = `A 3D Pixar-style feature animation scene. A clean triptych composite shot featuring three educational micro-illustrations of forces: 1. A hand pushing open a door with a glowing force arrow, 2. A shoe kicking a colorful soccer ball with glowing impact vectors, 3. Hands pushing a metal shopping cart with a forward force arrow. ${STYLE}`;
      break;
    case 5:
      prompt = `A 3D Pixar-style feature animation scene. Close-up shot of a bright red stylized wooden box resting on a table, surrounded by multiple translucent glowing force arrows pointing toward it from different angles, with a floating glowing question mark above it. ${STYLE}`;
      break;
    case 6:
      prompt = `A 3D Pixar-style feature animation scene. Close-up shot of @mira turning her head with an excited, expressive smile, shaking her head playfully with bright curious eyes. Energetic warm lighting, high expressive character animation. ${STYLE}`;
      break;
    case 7:
      prompt = `A 3D Pixar-style feature animation scene. Dynamic 3D physics visual effect showing two individual glowing force vector arrows (one blue, one cyan) merging together into one larger, brighter golden net force vector arrow pushing a block forward. ${STYLE}`;
      break;
    case 8:
      prompt = `A 3D Pixar-style feature animation scene. Wide shot of @mira looking up in awe with wide sparkling eyes as glowing 3D educational lettering reading 'BİLEŞKE KUVVET' floats like a glowing holographic discovery in front of her. ${STYLE}`;
      break;
    case 9:
      prompt = `A 3D Pixar-style feature animation scene. Medium camera shot of @mira smiling warmly and making a welcoming inviting hand gesture toward the viewer, inviting them to join her science discovery. Bright morning backdrop. ${STYLE}`;
      break;
    case 10:
      prompt = `A 3D Pixar-style feature animation scene. Wide shot of a bright, modern Turkish primary/middle school science classroom. @mira is seated at a wooden student desk alongside her classmates. At the front of the classroom, a friendly science teacher stands next to a high-tech glowing digital Smartboard (Akıllı Tahta). Warm morning window light. ${STYLE} ${ENVT}`;
      break;
    case 11:
      prompt = `A 3D Pixar-style feature animation scene. Medium shot of the science teacher drawing a cute stylized blue box on the high-tech digital Smartboard (Akıllı Tahta), placing bright glowing red force vector arrows on top of the box. @mira watches intently from her desk in the foreground. ${STYLE} ${ENVT}`;
      break;
    case 12:
      prompt = `A 3D Pixar-style feature animation scene. Close-up shot of the high-tech digital Smartboard (Akıllı Tahta) displaying four distinct glowing educational icon cards: 1. Application Point (Uygulama Noktası), 2. Line of Action (Doğrultu), 3. Direction (Yön), 4. Magnitude (Büyüklük). Clean 3D infographic design. ${STYLE}`;
      break;
    case 13:
      prompt = `A 3D Pixar-style feature animation scene. Detailed close-up of the digital Smartboard (Akıllı Tahta) displaying a 3D box with a glowing red dot right at the contact point where the force arrow meets the box, clearly labeled '1. Uygulama Noktası'. Crisp high-contrast educational visual. ${STYLE}`;
      break;
    case 14:
      prompt = `A 3D Pixar-style feature animation scene. Close-up of the digital Smartboard (Akıllı Tahta) showing a straight horizontal double-headed axis line extending East-West across the screen, labeled '2. Doğrultu (Doğu - Batı)'. Clean vector graphics on a digital board background. ${STYLE}`;
      break;
    case 15:
      prompt = `A 3D Pixar-style feature animation scene. Close-up of the digital Smartboard (Akıllı Tahta) screen displaying a bright glowing vector arrow pointing Eastward, labeled '3. Yön (Doğu)'. High visibility educational diagram. ${STYLE}`;
      break;
    case 16:
      prompt = `A 3D Pixar-style feature animation scene. Close-up of the digital Smartboard (Akıllı Tahta) showing a force arrow marked with a glowing numerical value reading '4. Büyüklük: 5 N'. Clear physics vector presentation. ${STYLE}`;
      break;
    case 17:
      prompt = `A 3D Pixar-style feature animation scene. Medium shot of @mira sitting at her wooden desk, holding a pencil over her open science notebook with a thoughtful curious look. Above her head is a floating stylized thought bubble showing two force arrows pushing a single box simultaneously. ${STYLE} ${ENVT}`;
      break;
    case 18:
      prompt = `A 3D Pixar-style feature animation scene. Warm medium shot of the friendly science teacher smiling happily in front of the illuminated digital Smartboard (Akıllı Tahta), tapping the screen as glowing golden text sparkles around the core definition. ${STYLE} ${ENVT}`;
      break;
    case 19:
      prompt = `A 3D Pixar-style feature animation scene. High-tech 3D graphic on the digital Smartboard (Akıllı Tahta) showing two separate blue force arrows merging into one single large golden net force arrow pushing a heavy block, titled 'Bileşke Kuvvet (Net Kuvvet)'. ${STYLE}`;
      break;
    case 20:
      prompt = `A 3D Pixar-style feature animation scene. Center focused shot of the digital Smartboard (Akıllı Tahta) displaying a magnificent glowing bold 3D capital letter 'R' encircled by a subtle golden aura, representing Net Force (R = Bileşke Kuvvet). ${STYLE}`;
      break;
    case 21:
      prompt = `A 3D Pixar-style feature animation scene. Wide shot of the school hallway and courtyard as the school bell rings. Turkish students joyfully stream out into the sunny school playground for recess. Vibrant summer sunlight. ${STYLE} ${ENVT}`;
      break;
    case 22:
      prompt = `A 3D Pixar-style feature animation scene. Medium wide shot of @mira stepping onto the sunny school courtyard, noticing two of her Turkish male classmates, Ali and Can, bent down trying to free a bright red toy car stuck in a muddy patch of soil. ${STYLE} ${ENVT}`;
      break;
    case 23:
      prompt = `A 3D Pixar-style feature animation scene. Close-up action shot of student Ali pushing the red toy car Eastward with all his strength. A glowing translucent 10 N force arrow extends from his hands pointing East, but the car remains stuck in the mud. ${STYLE}`;
      break;
    case 24:
      prompt = `A 3D Pixar-style feature animation scene. Action shot of second student Can running up to help Ali, placing his hands beside Ali's on the toy car and pushing in the exact same Eastward direction. A second glowing force arrow of 15 N appears alongside Ali's 10 N arrow. ${STYLE}`;
      break;
    case 25:
      prompt = `A 3D Pixar-style feature animation scene. Side angle shot of both Turkish boys Ali and Can pushing side-by-side toward the East, with two glowing parallel vector arrows (10 N and 15 N) extending in the same direction over the red toy car. ${STYLE}`;
      break;
    case 26:
      prompt = `A 3D Pixar-style feature animation scene. Close-up shot of @mira watching eagerly from the side, smiling as she calculates on her fingers, with a glowing floating plus sign (+) appearing between the two force values in the air above the boys. ${STYLE}`;
      break;
    case 27:
      prompt = `A 3D Pixar-style feature animation scene. Floating 3D educational math breakdown overlaying the scene: 'R = F1 + F2 = 10 N + 15 N = 25 N', accompanied by a single massive glowing golden net force arrow of 25 N pointing East. ${STYLE}`;
      break;
    case 28:
      prompt = `A 3D Pixar-style feature animation scene. High energy action shot as the red toy car pops cleanly out of the mud with a fun splash of dirt, shooting forward to the East propelled by the 25 N net force, while Ali and Can cheer happily. ${STYLE}`;
      break;
    case 29:
      prompt = `A 3D Pixar-style feature animation scene. Medium close-up of @mira smiling brightly with a joyful realization, resting her hands on her hips as she nods in agreement that forces in the same direction combine to become stronger. ${STYLE}`;
      break;
    case 30:
      prompt = `A 3D Pixar-style feature animation scene. Wide shot of the green grass school sports field during PE class. Two opposing teams of Turkish middle school students are lined up for an exciting tug-of-war game, holding a thick hemp rope. Bright sunny sky. ${STYLE} ${ENVT}`;
      break;
    case 31:
      prompt = `A 3D Pixar-style feature animation scene. Medium shot of @mira standing at the sideline of the sports field, watching the tug-of-war competition attentively. ${STYLE}`;
      break;
    case 32:
      prompt = `A 3D Pixar-style feature animation scene. Dynamic action shot of the tug-of-war rope: On the West side, a student pulls hard with a glowing 30 N arrow pointing West; on the East side, another student pulls back with a glowing 20 N arrow pointing East. ${STYLE}`;
      break;
    case 33:
      prompt = `A 3D Pixar-style feature animation scene. Close-up shot of the bright red ribbon marker tied at the center of the tug-of-war rope, slowly and steadily shifting toward the West side across the white center line on the grass. ${STYLE}`;
      break;
    case 34:
      prompt = `A 3D Pixar-style feature animation scene. Medium shot of @mira observing the two opposing forces acting along the same line in opposite directions, pointing her fingers in opposite directions as she analyzes the physics. ${STYLE}`;
      break;
    case 35:
      prompt = `A 3D Pixar-style feature animation scene. Close-up shot of @mira talking to herself with a thoughtful expression, realizing that forces pulling in opposite directions cannot simply be added together. ${STYLE}`;
      break;
    case 36:
      prompt = `A 3D Pixar-style feature animation scene. Clean 3D educational infographic showing the subtraction rule for opposing forces: 'R = F büyük - F küçük'. Crisp mathematical presentation. ${STYLE}`;
      break;
    case 37:
      prompt = `A 3D Pixar-style feature animation scene. Floating 3D calculation graphic displaying: 'R = 30 N - 20 N = 10 N', showing a single net force arrow of 10 N pointing West. High clarity physics graphic. ${STYLE}`;
      break;
    case 38:
      prompt = `A 3D Pixar-style feature animation scene. Dynamic action shot of the rope under tension, focusing on the center red ribbon, highlighting the question of which direction the net movement occurs. ${STYLE}`;
      break;
    case 39:
      prompt = `A 3D Pixar-style feature animation scene. Wide action shot of the West tug-of-war team pulling the rope successfully to the West, winning the match as a prominent glowing green directional arrow points Westward toward the larger force. ${STYLE}`;
      break;
    case 40:
      prompt = `A 3D Pixar-style feature animation scene. Medium shot of @mira holding up a digital learning tablet displaying the final result: 'Bileşke Kuvvet: Batı yönünde 10 N'. She smiles proudly at her correct calculation. ${STYLE}`;
      break;
    case 41:
      prompt = `A 3D Pixar-style feature animation scene. Warm interior wide shot of a cozy Turkish middle school library filled with tall wooden bookshelves and quiet study tables. @mira walks quietly into the room after school. ${STYLE} ${ENVT}`;
      break;
    case 42:
      prompt = `A 3D Pixar-style feature animation scene. Medium shot of @mira standing next to a polished wooden library study table, looking curiously at a heavy blue science textbook sitting completely motionless on top of the table. ${STYLE} ${ENVT}`;
      break;
    case 43:
      prompt = `A 3D Pixar-style feature animation scene. Close-up of @mira leaning over the textbook with an inquisitive expression, tapping her chin as she ponders whether hidden forces are acting on the stationary book. ${STYLE}`;
      break;
    case 44:
      prompt = `A 3D Pixar-style feature animation scene. Cinematic 3D educational diagram overlay on the textbook resting on the table: A downward blue force vector arrow representing Gravity pulling down, and an equal upward cyan force vector arrow representing Normal Force pushing up. ${STYLE}`;
      break;
    case 45:
      prompt = `A 3D Pixar-style feature animation scene. Animated close-up of the two equal and opposite vertical force arrows (Downward Gravity vs Upward Table Support Force) glowing and perfectly balancing each other out, cancelling into a soft sparkle effect. ${STYLE}`;
      break;
    case 46:
      prompt = `A 3D Pixar-style feature animation scene. Clean 3D educational infographic text floating over the stationary textbook: 'Bileşke Kuvvet = 0 N (R = 0 N)'. Perfect physics clarity. ${STYLE}`;
      break;
    case 47:
      prompt = `A 3D Pixar-style feature animation scene. Medium shot of @mira nodding her head in clear understanding as glowing stylized 3D header text reading 'DENGELENMİŞ KUVVETLER' appears gracefully above her. ${STYLE}`;
      break;
    case 48:
      prompt = `A 3D Pixar-style feature animation scene. Medium close-up of @mira looking around thoughtfully, reflecting that being in a balanced force state applies to more than just stationary objects. ${STYLE}`;
      break;
    case 49:
      prompt = `A 3D Pixar-style feature animation scene. Cinematic wide panning shot of a modern red car cruising smoothly at a steady constant speed along a scenic highway under a clear blue sky. Horizontal force vector arrows (engine thrust vs air resistance) are equal and balanced. ${STYLE}`;
      break;
    case 50:
      prompt = `A 3D Pixar-style feature animation scene. Breathtaking aerial shot of a skydiver with a colorful open parachute gliding effortlessly at constant terminal velocity through a bright sunny sky with fluffy white clouds, with balanced vertical force arrows (gravity vs air drag). ${STYLE}`;
      break;
    case 51:
      prompt = `A 3D Pixar-style feature animation scene. Dual split-screen visual: On the left, the car's speedometer holding steady at 90 km/h; on the right, the skydiver's speedometer steady, confirming zero acceleration and constant velocity under balanced forces. ${STYLE}`;
      break;
    case 52:
      prompt = `A 3D Pixar-style feature animation scene. Medium shot of @mira looking out through the large glass window of the school library toward the outdoor courtyard garden, her eyes catching sudden movement outside. ${STYLE} ${ENVT}`;
      break;
    case 53:
      prompt = `A 3D Pixar-style feature animation scene. High speed camera shot of a crisp red apple detaching from a green tree branch outside the library window and accelerating downwards toward the grass under gravity. Dynamic speed streaks. ${STYLE}`;
      break;
    case 54:
      prompt = `A 3D Pixar-style feature animation scene. Action shot of a student riding a bicycle on the paved school path, suddenly applying the hand brakes as a small cat trots across the path, causing the bicycle to rapidly decelerate and come to a smooth stop. ${STYLE}`;
      break;
    case 55:
      prompt = `A 3D Pixar-style feature animation scene. Medium close-up of @mira watching through the library window, realizing that any change in speed or direction means forces are NOT balanced. ${STYLE}`;
      break;
    case 56:
      prompt = `A 3D Pixar-style feature animation scene. 3D educational diagram showing an unequal pair of opposing force vector arrows acting on an object, where one arrow is larger than the other, resulting in a net force 'R ≠ 0 N'. ${STYLE}`;
      break;
    case 57:
      prompt = `A 3D Pixar-style feature animation scene. Dynamic 3D infographic illustration titled 'DENGELENMEMİŞ KUVVETLER', showing how an unbalanced net force causes changes in motion: speeding up, slowing down, or changing direction. ${STYLE}`;
      break;
    case 58:
      prompt = `A 3D Pixar-style feature animation scene. Close-up shot of @mira writing down the golden rule in her colorful science study notebook with a confident smile. ${STYLE} ${ENVT}`;
      break;
    case 59:
      prompt = `A 3D Pixar-style feature animation scene. Triptych composite 3D animation displaying three micro-examples of unbalanced forces: 1. A rocket accelerating skyward, 2. A car braking at a red light, 3. A soccer ball curving in mid-air. ${STYLE}`;
      break;
    case 60:
      prompt = `A 3D Pixar-style feature animation scene. Medium shot of @mira pointing enthusiastically toward the camera with a bright confident expression, summarizing the fundamental science rule clearly for the viewers. ${STYLE}`;
      break;
    case 61:
      prompt = `A 3D Pixar-style feature animation scene. Warm golden hour shot of @mira walking home along a pleasant tree-lined neighborhood sidewalk, her school backpack on her shoulders, looking happy and fulfilled after school. ${STYLE}`;
      break;
    case 62:
      prompt = `A 3D Pixar-style feature animation scene. Triple split-screen summary illustration: 1. Forces combining in the same direction, 2. Forces opposing in opposite directions, 3. Balanced forces in equilibrium (R = 0 N). Perfect educational recap. ${STYLE}`;
      break;
    case 63:
      prompt = `A 3D Pixar-style feature animation scene. Medium close-up of @mira giving an enthusiastic thumbs-up to the camera with glowing stylized speed-lines and lightning energy FX around her, celebrating fast learning. ${STYLE}`;
      break;
    case 64:
      prompt = `A 3D Pixar-style feature animation scene. Frontal shot of @mira holding up a bright golden reward question card toward the camera with a cheerful, playful expression. ${STYLE}`;
      break;
    case 65:
      prompt = `A 3D Pixar-style feature animation scene. Crisp 3D educational diagram of a bright blue gift box pulled Northward with a glowing 15 N arrow and pulled Southward with an equal glowing 15 N arrow. Clear quiz question presentation. ${STYLE}`;
      break;
    case 66:
      prompt = `A 3D Pixar-style feature animation scene. Close-up of the 3D quiz box graphic with floating glowing question marks asking: 'Dengelenmiş kuvvette midir? Bileşke kuvvet kaç N?'. ${STYLE}`;
      break;
    case 67:
      prompt = `A 3D Pixar-style feature animation scene. Medium shot of @mira pointing down toward the comment section with a friendly, interactive invitation gesture, smiling warmly at the camera. ${STYLE}`;
      break;
    case 68:
      prompt = `A 3D Pixar-style feature animation scene. Close-up of @mira holding a glowing atom/science symbol in her hand, giving a warm wave to the audience with inspiring lighting. ${STYLE}`;
      break;
    case 69:
      prompt = `A 3D Pixar-style feature animation scene. Cinematic end-title frame featuring @mira waving goodbye beside a beautifully stylized banner reading 'Mira ile Bir Sonraki Keşifte Görüşmek Üzere!'. Warm Pixar feature end-credits visual style. ${STYLE}`;
      break;
    default:
      prompt = `A 3D Pixar-style feature animation scene illustration for science education. ${STYLE} ${ENVT}`;
  }

  return prompt;
}

// Generate all prompts
let mdContent = `# MAMILAS — 6. Sınıf Kuvvet (69 Sahne) Image Prompt Paket\n\n`;
mdContent += `> **Motor / Diyalekt:** Fal Nano Banana 2 (\`nano banana 2\` / NB2 - Gemini reasoning architecture format)\n`;
mdContent += `> **Görsel Stil:** 3D Pixar Animasyon Filmi Kalitesi (Show / Wow Faktörlü)\n`;
mdContent += `> **Demografi & Ortam:** Türkiye Ortaokulu (Akıllı Tahta / Sınıf / Bahçe)\n`;
mdContent += `> **Karakter Etiketleme:** @mira fiziksel tanımı yapılmadan doğrudan \`@mira\` olarak etiketlendi (Magnific referans kilitleri için)\n`;
mdContent += `> **On-Screen Text:** Özel kısıtlama yok (diegetik Akıllı Tahta görselleri serbest)\n\n`;
mdContent += `---\n\n`;

const updatedScenes = rawData.scenes.map((scene) => {
  const voText = scene.architecture?.source?.exactText || scene.architecture?.beat || '';
  const prompt = createNB2Prompt(scene.id, voText);
  
  mdContent += `## Sahne ${scene.id} (${scene.phaseName || 'Main'})\n\n`;
  mdContent += `**Voiceover (Seslendirme):**\n> "${voText.trim()}"\n\n`;
  mdContent += `**Fal Nano Banana 2 Image Prompt:**\n\`\`\`text\n${prompt}\n\`\`\`\n\n`;
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
console.log('Updated SAHNE-PROMPTLAR.md at:', mdFilePath);

// Write updated command JSON
const updatedCommand = {
  ...rawData,
  scenes: updatedScenes,
  lastUpdated: new Date().toISOString(),
  outputFolder: outputDir
};

const jsonFilePath = path.join(outputDir, 'mamilas_command.json');
fs.writeFileSync(jsonFilePath, JSON.stringify(updatedCommand, null, 2), 'utf8');
console.log('Updated command JSON at:', jsonFilePath);

console.log('NB2 Prompt optimization complete for all 69 scenes!');
