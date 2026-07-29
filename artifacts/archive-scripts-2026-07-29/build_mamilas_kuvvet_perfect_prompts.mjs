import fs from 'node:fs';
import path from 'node:path';

const outputDir = '/Users/Muhammet/Desktop/6. sınıf kuvvet';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Exact scene-by-scene configuration according to VO presence:
// Character presence rule:
// - Includes @mira ONLY if Mira is physically present in the shot.
// - Includes @ali / @can ONLY if Ali/Can are physically present in the shot.
// - Diagram / Object / Apple / Car / Gauge / Triptych scenes have ZERO character tags!

const sceneSpecs = {
  1: {
    hasChar: true,
    prompt: `3D Pixar feature animation style. Low-angle shot, 40mm lens. @mira steps out through a dark wood apartment door onto a stone sidewalk, holding her backpack strap. Soft golden morning sunlight. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO American school bus, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Mira o sabah heyecanla uyandı ve çantasını sırtlayıp evden çıktı."
  },
  2: {
    hasChar: true,
    prompt: `3D Pixar feature animation style. Side-tracking medium action shot, 35mm lens. @mira pushes open a front door and sprints down a tree-lined sidewalk. Sunlight casting soft shadows. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO yellow American school bus, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Okul otobüsüne yetişmek için kapıyı itti ve sokakta koşmaya başladı."
  },
  3: {
    hasChar: true,
    prompt: `3D Pixar feature animation style. Medium shot, 40mm lens. @mira runs joyfully along a sidewalk under tree shade. Semi-transparent glowing golden and cyan force-vector lines radiate around her body. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Farkında değildi ama attığı her adımda, ittiği her kapıda görünmez bir güç onunla birlikteydi."
  },
  4: {
    hasChar: false, // Triptych diagram of hands/feet
    prompt: `3D Pixar feature animation style. Triptych composite 3-panel educational illustration. Left: hand pushing wooden door with red arrow. Center: sneaker kicking soccer ball. Right: hands pushing shopping cart with teal arrow. NO human face in frame. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Bir kapıyı açarken, bir topa vururken ya da bir alışveriş arabasını iterken... Hepsinde aynı şey vardı: Kuvvet!"
  },
  5: {
    hasChar: false, // Object/cube focus
    prompt: `3D Pixar feature animation style. Macro close-up, 50mm lens. A glossy red wooden cube sits on an oak desk surrounded by four 3D glowing force arrows pointing inward. A glowing golden question mark hovers above. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Peki bir cismin üzerine sadece tek bir kuvvet mi etki eder, yoksa birden fazla mı?"
  },
  6: {
    hasChar: true,
    prompt: `3D Pixar feature animation style. Close-up character shot, 50mm lens. @mira turns her head with a happy excited expression and a cheerful smile in a sunny school corridor. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Tabii ki hayır!"
  },
  7: {
    hasChar: false, // Physics diagram
    prompt: `3D Pixar feature animation style. 3D physics diagram. Two glowing energy arrows (blue and cyan) merge into one large golden force arrow pushing a grey stone block across a grid floor. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Bazen birden fazla kuvvet bir araya gelir ve güçlerini birleştirir."
  },
  8: {
    hasChar: true,
    prompt: `3D Pixar feature animation style. Wide shot, 35mm lens. @mira looks up in awe at glowing 3D holographic Turkish text 'BİLEŞKE KUVVET' floating in mid-air with golden dust motes. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Diegetic Turkish text: 'BİLEŞKE KUVVET'. Clean 3D CGI start frame.`,
    vo: "Mira bugün işte bu gizemli gücü, yani bileşke kuvveti keşfedecek."
  },
  9: {
    hasChar: true,
    prompt: `3D Pixar feature animation style. Medium shot, 40mm lens. @mira smiles warmly at the camera on a sunny school garden path, reaching her hand forward in a welcoming gesture. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Hazırsanız, Mira'nın yolculuğuna biz de katılalım!"
  },
  10: {
    hasChar: true, // Classroom establishing shot
    prompt: `3D Pixar feature animation style. Wide shot of a Turkish science classroom. @mira sits at a wooden double-desk. At the front, a friendly Turkish female teacher stands next to an interactive Smartboard. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Mira'nın ilk dersi fendi."
  },
  11: {
    hasChar: false, // Smartboard drawing focus
    prompt: `3D Pixar feature animation style. Over-the-shoulder view of Smartboard display. A digital pen draws a blue box with red force arrows on the glass screen. NO human face in frame. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Öğretmeni tahtaya sevimli bir kutu çizdi ve kutunun üzerine oklar koydu."
  },
  12: {
    hasChar: false, // Smartboard 4 elements screen
    prompt: `3D Pixar feature animation style. Close-up of Smartboard screen displaying 4 glowing icon cards with Turkish labels: '1. Uygulama Noktası', '2. Doğrultu', '3. Yön', '4. Büyüklük'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Sonra bir kuvveti tam olarak tanımlamak için dört şeye ihtiyacımız olduğunu anlattı."
  },
  13: {
    hasChar: false,
    prompt: `3D Pixar feature animation style. Smartboard screen close-up showing a 3D block with a glowing red dot at the force contact point, labeled '1. Uygulama Noktası'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Birincisi uygulama noktası, yani kuvvetin cisme etki ettiği yer."
  },
  14: {
    hasChar: false,
    prompt: `3D Pixar feature animation style. Smartboard screen showing a horizontal blue double-headed axis line labeled '2. Doğrultu (Doğu - Batı)'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "İkincisi doğrultu; tıpkı doğu-batı gibi bir çizgi."
  },
  15: {
    hasChar: false,
    prompt: `3D Pixar feature animation style. Smartboard screen showing a glowing amber arrow pointing East, labeled '3. Yön (Doğu)'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Üçüncüsü yön; örneğin doğuya doğru olması."
  },
  16: {
    hasChar: false,
    prompt: `3D Pixar feature animation style. Smartboard screen showing a glowing cyan arrow labeled '4. Büyüklük: 5 N'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Ve dördüncüsü büyüklük, yani kuvvetin Newton cinsinden değeri; mesela 5 N."
  },
  17: {
    hasChar: true,
    prompt: `3D Pixar feature animation style. Medium shot, 40mm lens. @mira sits at her desk holding a pencil over her notebook with a curious expression, a floating thought bubble above showing two force arrows pushing a box. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Mira defterine not aldıkça bir şeyi merak etti: Ya bir cisme aynı anda birden fazla kuvvet etki ederse?"
  },
  18: {
    hasChar: false, // Teacher tapping glass
    prompt: `3D Pixar feature animation style. Medium shot of teacher's hand tapping the Smartboard glass screen as golden sparkles appear. NO main student character in frame. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "İşte tam o an öğretmeni sihirli tanımı söyledi:"
  },
  19: {
    hasChar: false, // Smartboard diagram
    prompt: `3D Pixar feature animation style. Smartboard graphic showing two blue force arrows combining into a golden net force arrow pushing a box, titled 'Bileşke Kuvvet (Net Kuvvet)'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "İki ya da daha fazla kuvvetin bir cisme yaptığı etkiyi, tek başına yapabilen kuvvete bileşke kuvvet, ya da net kuvvet diyoruz."
  },
  20: {
    hasChar: false, // Letter R screen
    prompt: `3D Pixar feature animation style. Smartboard screen display featuring a bold 3D golden letter 'R' with Turkish text below 'R = Bileşke Kuvvet'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Ve onu R harfiyle gösteriyoruz."
  },
  21: {
    hasChar: false, // Wide courtyard bell
    prompt: `3D Pixar feature animation style. Wide shot of sunny school courtyard as brass school bell swings. Students walk out in background. NO primary character focus. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Zil çaldı, teneffüs başladı."
  },
  22: {
    hasChar: true, // Mira discovers Ali and Can
    prompt: `3D Pixar feature animation style. Medium wide shot. @mira walks into schoolyard and sees Turkish boys @ali and @can near mud trying to push a stuck red toy car. NO physical description of characters. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Mira bahçeye çıktığında arkadaşları Ali ile Can'ı, çamura saplanmış kırmızı bir oyuncak arabayı kurtarmaya çalışırken buldu."
  },
  23: {
    hasChar: true, // Ali pushing
    prompt: `3D Pixar feature animation style. Action close-up, 40mm lens. @ali strains as he pushes a red toy car stuck in wet dark mud, with a glowing translucent vector arrow labeled '10 N' extending from his hands. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Diegetic vector label: '10 N'. Clean 3D CGI start frame.`,
    vo: "Ali arabayı doğu yönünde var gücüyle, 10 N ile itiyordu ama araba yerinden kıpırdamıyordu."
  },
  24: {
    hasChar: true, // Ali and Can pushing together
    prompt: `3D Pixar feature animation style. Action shot, 35mm lens. @can kneels beside @ali, pushing the red toy car in the same Eastward direction with a second glowing vector arrow labeled '15 N'. NO physical description of characters. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Diegetic vector labels: '10 N', '15 N'. Clean 3D CGI start frame.`,
    vo: "Yetmedi! Can da yardıma koştu ve aynı yönde 15 N ile destek verdi."
  },
  25: {
    hasChar: true, // Side profile Ali and Can
    prompt: `3D Pixar feature animation style. Side profile ground angle. @ali and @can pushing side-by-side Eastward with two parallel glowing vector arrows '10 N' and '15 N'. NO physical description of characters. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Diegetic vector labels: '10 N', '15 N →'. Clean 3D CGI start frame.`,
    vo: "İkisi de aynı doğrultuda ve aynı yönde kuvvet uyguladığı için bu kuvvetler birbirine yardım etti."
  },
  26: {
    hasChar: true, // Mira calculating
    prompt: `3D Pixar feature animation style. Close-up, 50mm lens. @mira watches eagerly counting on her fingers as a glowing golden '+' symbol floats between force values. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Mira hemen hesapladı: Aynı yönlü kuvvetlerde bileşke kuvveti bulmak için onları toplarız."
  },
  27: {
    hasChar: false, // Math formula overlay
    prompt: `3D Pixar feature animation style. Floating 3D math graphic in mid-air: 'R = F1 + F2 = 10 N + 15 N = 25 N' with a large golden arrow '25 N' pointing East. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "R eşittir F1 artı F2; yani 10 N artı 15 N, eder 25 N."
  },
  28: {
    hasChar: true, // Car pops out, Ali & Can cheer
    prompt: `3D Pixar feature animation style. Action shot. Red toy car pops out of mud with dirt splash shooting Eastward as @ali and @can cheer. NO physical description of characters. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Ve araba, doğu yönündeki bu 25 N'luk güçle çamurdan bir anda kurtuldu!"
  },
  29: {
    hasChar: true, // Mira smiles
    prompt: `3D Pixar feature animation style. Medium close-up, 50mm lens. @mira smiles proudly with hands on hips, nodding in understanding. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Mira gülümsedi: Demek aynı yöndeki kuvvetler birleşince güçleniyordu."
  },
  30: {
    hasChar: false, // Tug of war wide field
    prompt: `3D Pixar feature animation style. Wide shot of green school sports field during tug-of-war match between Turkish students divided by white chalk line. NO primary character focus. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Öğleden sonra beden eğitimi dersinde sınıfça halat çekme yarışı yaptılar."
  },
  31: {
    hasChar: true, // Mira watching
    prompt: `3D Pixar feature animation style. Medium shot, 40mm lens. @mira stands at the grass field sideline watching tug-of-war attentively. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Mira kenardan izledi."
  },
  32: {
    hasChar: false, // Rope close-up
    prompt: `3D Pixar feature animation style. Close-up on rope under tension. West side pulled with glowing purple arrow '30 N'; East side pulled with glowing orange arrow '20 N'. NO human face in frame. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Batı tarafındaki arkadaşı halatı 30 N ile çekerken, doğu tarafındaki arkadaşı 20 N ile karşı koyuyordu."
  },
  33: {
    hasChar: false, // Ribbon on chalk line
    prompt: `3D Pixar feature animation style. Macro ground-level shot. Bright red cloth ribbon on rope sliding slowly Westward across white chalk line on grass. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Ortadaki kırmızı kurdele yavaşça batıya doğru kaydı."
  },
  34: {
    hasChar: true, // Mira pointing directions
    prompt: `3D Pixar feature animation style. Medium shot, 40mm lens. @mira points fingers in opposite directions analyzing opposing forces along the axis. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Mira bu sefer kuvvetlerin aynı doğrultuda ama zıt yönlerde olduğunu fark etti ve"
  },
  35: {
    hasChar: true, // Mira speaking to herself
    prompt: `3D Pixar feature animation style. Close-up, 50mm lens. @mira looks up thoughtfully speaking to herself about opposing forces. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "kendi kendine \"Bunları toplayamam, çünkü birbirlerine karşı çekiyorlar\" dedi."
  },
  36: {
    hasChar: false, // Formula graphic
    prompt: `3D Pixar feature animation style. Floating 3D infographic in mid-air showing subtraction rule: 'R = F büyük - F küçük'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Zıt yönlü kuvvetlerde bileşke kuvveti bulmak için büyük kuvvetten küçük kuvveti çıkarırız."
  },
  37: {
    hasChar: false, // Calculation graphic
    prompt: `3D Pixar feature animation style. Floating 3D calculation graphic: 'R = 30 N - 20 N = 10 N' with a purple vector arrow '10 N' pointing West. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "R eşittir büyük kuvvet eksi küçük kuvvet; yani 30 N eksi 20 N, eder 10 N."
  },
  38: {
    hasChar: false, // Ribbon question mark
    prompt: `3D Pixar feature animation style. Action close-up of rope center ribbon at chalk line with a floating golden question mark '?'. NO human face in frame. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Peki halat hangi yöne hareket etti?"
  },
  39: {
    hasChar: false, // Winning team wide
    prompt: `3D Pixar feature animation style. Wide action shot of West team pulling rope Westward celebrating with a green vector arrow pointing West. NO primary character focus. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Tabii ki güçlü olanın yönüne, yani batıya!"
  },
  40: {
    hasChar: true, // Mira holding tablet
    prompt: `3D Pixar feature animation style. Medium shot, 40mm lens. @mira holds up a digital tablet displaying 'Bileşke Kuvvet: Batı yönünde 10 N', smiling proudly. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Mira'nın bulduğu bileşke kuvvet: batı yönünde 10 N."
  },
  41: {
    hasChar: true, // Mira steps into library
    prompt: `3D Pixar feature animation style. Wide interior, 28mm lens. Warm school library with mahogany bookshelves; @mira steps quietly into the room. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Ders bitince Mira kütüphaneye uğradı."
  },
  42: {
    hasChar: true, // Mira staring at textbook
    prompt: `3D Pixar feature animation style. Medium shot, 40mm lens. @mira stands at a wooden library desk staring intently at a stationary blue science textbook. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Masanın üzerinde sessizce duran bir fen kitabı gördü ve düşündü:"
  },
  43: {
    hasChar: true, // Mira pondering
    prompt: `3D Pixar feature animation style. Close-up, 50mm lens. @mira leans over textbook with chin on hand, pondering about hidden forces. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "\"Bu kitap hareket etmiyor ama üzerine kuvvet etki ediyor olmalı.\""
  },
  44: {
    hasChar: false, // Textbook diagram
    prompt: `3D Pixar feature animation style. Textbook diagram with two equal glowing vector arrows: downward blue arrow 'Yer çekimi' and upward cyan arrow 'Masa tepki kuvveti'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Gerçekten de yer çekimi kitabı aşağı çekiyor, masa ise onu tam olarak aynı büyüklükte yukarı itiyordu."
  },
  45: {
    hasChar: false, // Sparkles cancellation
    prompt: `3D Pixar feature animation style. Close-up of textbook surface as equal vertical force arrows dissolve into glowing golden sparkles fading away. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "İki kuvvet eşit ve zıt yönlü olduğu için birbirini yok ediyor,"
  },
  46: {
    hasChar: false, // R=0 text
    prompt: `3D Pixar feature animation style. Floating 3D text over stationary book: 'Bileşke Kuvvet = 0 N (R = 0 N)'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "bileşke kuvvet tam olarak sıfır, yani R eşittir 0 N oluyordu."
  },
  47: {
    hasChar: true, // Mira nodding
    prompt: `3D Pixar feature animation style. Medium shot, 40mm lens. @mira nods in understanding as glowing 3D title 'DENGELENMİŞ KUVVETLER' appears above her in cyan. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "İşte Mira buna dengelenmiş kuvvetler dendiğini öğrendi."
  },
  48: {
    hasChar: true, // Mira reflecting
    prompt: `3D Pixar feature animation style. Medium close-up, 50mm lens. @mira looks around thoughtfully reflecting that balanced forces apply to moving objects at constant speed. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Ama dengelenmiş olmak sadece durmak demek değildi."
  },
  49: {
    hasChar: false, // Car on highway
    prompt: `3D Pixar feature animation style. Wide panning shot. Sleek red car cruising smoothly at constant speed on highway with balanced horizontal force arrows. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Otobanda sabit süratle giden bir araba da,"
  },
  50: {
    hasChar: false, // Skydiver
    prompt: `3D Pixar feature animation style. Aerial shot. Skydiver with colorful parachute gliding at constant terminal velocity with balanced vertical force arrows. NO primary student character in frame. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "gökyüzünde sabit süratle süzülen bir paraşütçü de dengelenmiş kuvvetlerin etkisindeydi;"
  },
  51: {
    hasChar: false, // Speedometers
    prompt: `3D Pixar feature animation style. Dual split-screen. Left: car speedometer steady at 90 km/h. Right: skydiver speedometer steady. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "çünkü onların da sürati ve yönü değişmiyordu."
  },
  52: {
    hasChar: true, // Mira looking out window
    prompt: `3D Pixar feature animation style. Medium shot, 40mm lens. @mira looks through library glass window toward garden, caught by sudden motion outside. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Tam o sırada Mira pencereden dışarı baktı."
  },
  53: {
    hasChar: false, // Falling apple
    prompt: `3D Pixar feature animation style. High-speed freeze shot, 50mm lens. Crisp red apple detaching from tree branch accelerating downward under gravity. NO human characters in frame. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Bahçedeki ağaçtan bir elma koptu ve gitgide hızlanarak yere düştü."
  },
  54: {
    hasChar: false, // Bicycle braking
    prompt: `3D Pixar feature animation style. Action shot. Student riding bicycle applies brakes as a cat crosses path, decelerating to a stop. NO primary student character in frame. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Biraz ötede bir bisikletli, önüne aniden bir kedi çıkınca frene bastı; yavaşladı ve durdu."
  },
  55: {
    hasChar: true, // Mira realization
    prompt: `3D Pixar feature animation style. Medium close-up, 50mm lens. @mira watches through window realizing motion changes mean forces are NOT balanced. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Mira bunların dengelenmiş olamayacağını anladı, çünkü ikisinde de hareket değişiyordu."
  },
  56: {
    hasChar: false, // Unequal arrows diagram
    prompt: `3D Pixar feature animation style. 3D physics diagram depicting unequal opposing force arrows on a block resulting in 'R ≠ 0 N'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Eğer bileşke kuvvet sıfırdan farklıysa, yani taraflardan biri daha güçlüyse,"
  },
  57: {
    hasChar: false, // Infographic
    prompt: `3D Pixar feature animation style. Infographic titled 'DENGELENMEMİŞ KUVVETLER' demonstrating: 'Hızlanma', 'Yavaşlama', 'Yön değiştirme'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "orada dengelenmemiş kuvvetler vardır ve cismin hareketi mutlaka değişir."
  },
  58: {
    hasChar: true, // Mira writing in journal
    prompt: `3D Pixar feature animation style. Close-up, 50mm lens. @mira writes core rule in her science notebook with a confident smile. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Kısacası Mira şu kuralı çıkardı:"
  },
  59: {
    hasChar: false, // Triptych examples
    prompt: `3D Pixar feature animation style. Triptych composite 3-panel: Left: space rocket accelerating; Center: car braking; Right: soccer ball curving mid-air. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Bir şey hızlanıyorsa, yavaşlıyorsa ya da yön değiştiriyorsa,"
  },
  60: {
    hasChar: true, // Mira pointing to viewer
    prompt: `3D Pixar feature animation style. Medium shot, 40mm lens. @mira points enthusiastically toward viewer with confident smile summarizing golden rule. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "bilin ki orada dengelenmemiş bir güç iş başındadır!"
  },
  61: {
    hasChar: true, // Mira walking home
    prompt: `3D Pixar feature animation style. Wide golden hour shot, 35mm lens. @mira walks home along sidewalk at sunset with backpack, happy and satisfied. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Akşam eve dönerken Mira o gün öğrendiklerini düşündü."
  },
  62: {
    hasChar: false, // Summary graphic
    prompt: `3D Pixar feature animation style. Triple split-screen summary: Left: 'Aynı yönlü'; Center: 'Zıt yönlü'; Right: 'Dengelenmiş R = 0 N'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Artık kuvvetlerin bazen birleşip güçlendiğini, bazen çekişip birbirini azalttığını, bazen de tam denge kurup her şeyi olduğu gibi bıraktığını biliyordu."
  },
  63: {
    hasChar: true, // Mira thumbs up
    prompt: `3D Pixar feature animation style. Medium close-up, 50mm lens. @mira gives an energetic thumbs-up with glowing speed-lines and energy FX. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Bugün bileşke kuvveti jet hızıyla öğrendik!"
  },
  64: {
    hasChar: true, // Mira holding question card
    prompt: `3D Pixar feature animation style. Frontal shot, 40mm lens. @mira holds up a bright golden question card toward camera with a playful smile. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Şimdi sıra sizde; işte Mira'dan küçük bir ödüllü soru:"
  },
  65: {
    hasChar: false, // Quiz box diagram
    prompt: `3D Pixar feature animation style. 3D diagram of blue gift box pulled Northward with arrow '15 N' and Southward with arrow '15 N'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Bir kutuyu kuzey yönünde 15 N, güney yönünde ise yine 15 N kuvvetle çekersek,"
  },
  66: {
    hasChar: false, // Quiz box text
    prompt: `3D Pixar feature animation style. Close-up quiz diagram with text: 'Dengelenmiş kuvvette midir? Bileşke kuvvet kaç N?'. NO human characters in scene. NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "bu kutu dengelenmiş kuvvette midir ve bileşke kuvvet kaç olur?"
  },
  67: {
    hasChar: true, // Mira pointing down
    prompt: `3D Pixar feature animation style. Medium shot, 40mm lens. @mira points down toward comment section inviting answers with a warm smile. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Cevaplarınızı yorumlara bekliyoruz."
  },
  68: {
    hasChar: true, // Mira holding atom
    prompt: `3D Pixar feature animation style. Close-up, 50mm lens. @mira holds glowing 3D atom emblem in open palm waving warmly to camera. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Bilimle kalın, kuvvetiniz hep dengede kalsın."
  },
  69: {
    hasChar: true, // Mira end banner
    prompt: `3D Pixar feature animation style. Wide end-title shot, 35mm lens. @mira waves goodbye beside 3D banner 'Mira ile Bir Sonraki Keşifte Görüşmek Üzere!'. NO physical description of character. NO black characters, NO Asian characters, NO English text, NO photorealism, NO 2D cel shading. Clean 3D CGI start frame.`,
    vo: "Mira'yla bir sonraki keşifte görüşmek üzere!"
  }
};

let md = `# MAMILAS — 6. Sınıf Kuvvet TAM İSABET MAGNIFIC PROMPT PAKETİ (69 SAHNE)\n\n`;
md += `> **MİKRO-Hassasiyet Kuralı:**\n`;
md += `> 1. Karakterler hikayede VARSA (@mira, @ali, @can) tam etiketlendi.\n`;
md += `> 2. Karakterler YOKSA (diyagram, elma, araba, akıllı tahta, kutu) ASLA isim etiketi yazılmadı (Magnific yanlış çocuk çizmeyecek!).\n`;
md += `> 3. Fiziksel tarif SIFIR.\n`;
md += `> 4. Siyahi, Asyalı, İngilizce yazı, Amerikan otobüsü vb. SERT ENGEL.\n\n---\n\n`;

for (let i = 1; i <= 69; i++) {
  const item = sceneSpecs[i];
  md += `## Sahne ${i} ${item.hasChar ? '(Karakterli)' : '(Karaktersiz / Diyagram)'}\n\n`;
  md += `**Seslendirme:**\n> "${item.vo}"\n\n`;
  md += `**Magnific Prompt:**\n\`\`\`text\n${item.prompt}\n\`\`\`\n\n---\n\n`;
}

fs.writeFileSync(path.join(outputDir, 'SAHNE-PROMPTLAR-PERFECT.md'), md, 'utf8');
console.log('Successfully saved PERFECT prompts to SAHNE-PROMPTLAR-PERFECT.md');
