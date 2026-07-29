import fs from 'node:fs';
import path from 'node:path';

const outputDir = '/Users/Muhammet/Desktop/6. sınıf kuvvet';

const scenes = {
  1: {
    prompt: `3D Pixar animation style feature film shot. Low-angle establishing camera, 40mm lens. @mira steps out through a dark wood apartment door onto a limestone sidewalk, holding her backpack strap. Soft golden morning sunlight. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Mira o sabah heyecanla uyandı ve çantasını sırtlayıp evden çıktı."
  },
  2: {
    prompt: `3D Pixar animation style feature film shot. Side-tracking action camera, 35mm lens. @mira pushes open a front door and runs along a cobblestone sidewalk toward a yellow school bus. Morning sun rays. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Okul otobüsüne yetişmek için kapıyı itti ve sokakta koşmaya başladı."
  },
  3: {
    prompt: `3D Pixar animation style feature film shot. Medium shot, 40mm lens. @mira runs joyfully along a sidewalk under tree shade. Glowing semi-transparent golden force arrows fan out from her sneakers. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Farkında değildi ama attığı her adımda, ittiği her kapıda görünmez bir güç onunla birlikteydi."
  },
  4: {
    prompt: `3D Pixar animation style feature film shot. Triptych composite 3-panel educational illustration. Left: hand pushing wooden door with red arrow. Center: sneaker kicking soccer ball. Right: hands pushing shopping cart with teal arrow. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Bir kapıyı açarken, bir topa vururken ya da bir alışveriş arabasını iterken... Hepsinde aynı şey vardı: Kuvvet!"
  },
  5: {
    prompt: `3D Pixar animation style feature film shot. Macro close-up, 50mm lens. A glossy red wooden cube sits on a wooden desk surrounded by four 3D glowing force arrows pointing inward. A glowing golden question mark hovers above. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Peki bir cismin üzerine sadece tek bir kuvvet mi etki eder, yoksa birden fazla mı?"
  },
  6: {
    prompt: `3D Pixar animation style feature film shot. Close-up character shot, 50mm lens. @mira turns her head with a happy excited expression and a cheerful smile in a sunny school corridor. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Tabii ki hayır!"
  },
  7: {
    prompt: `3D Pixar animation style feature film shot. 3D physics diagram. Two glowing energy arrows (blue and cyan) merge into one large golden force arrow pushing a grey block across a grid floor. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Bazen birden fazla kuvvet bir araya gelir ve güçlerini birleştirir."
  },
  8: {
    prompt: `3D Pixar animation style feature film shot. Wide shot, 35mm lens. @mira looks up in awe at glowing 3D holographic Turkish text 'BİLEŞKE KUVVET' floating in mid-air with golden dust motes. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Mira bugün işte bu gizemli gücü, yani bileşke kuvveti keşfedecek."
  },
  9: {
    prompt: `3D Pixar animation style feature film shot. Medium shot, 40mm lens. @mira smiles warmly at the camera on a sunny school garden path, reaching her hand forward in a welcoming gesture. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Hazırsanız, Mira'nın yolculuğuna biz de katılalım!"
  },
  10: {
    prompt: `3D Pixar animation style feature film shot. Wide shot of a Turkish science classroom. @mira sits at a wooden double-desk with Turkish classmates. At the front, a friendly teacher stands next to an interactive Smartboard. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Mira'nın ilk dersi fendi."
  },
  11: {
    prompt: `3D Pixar animation style feature film shot. Over-the-shoulder view past @mira toward the Smartboard. The science teacher uses a digital pen to draw a blue box with red force arrows on the glass display. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Öğretmeni tahtaya sevimli bir kutu çizdi ve kutunun üzerine oklar koydu."
  },
  12: {
    prompt: `3D Pixar animation style feature film shot. Close-up of Smartboard screen displaying 4 glowing icon cards with Turkish labels: '1. Uygulama Noktası', '2. Doğrultu', '3. Yön', '4. Büyüklük'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Sonra bir kuvveti tam olarak tanımlamak için dört şeye ihtiyacımız olduğunu anlattı."
  },
  13: {
    prompt: `3D Pixar animation style feature film shot. Smartboard screen close-up showing a 3D block with a glowing red dot at the force contact point, labeled '1. Uygulama Noktası'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Birincisi uygulama noktası, yani kuvvetin cisme etki ettiği yer."
  },
  14: {
    prompt: `3D Pixar animation style feature film shot. Smartboard screen showing a horizontal blue double-headed axis line labeled '2. Doğrultu (Doğu - Batı)'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "İkincisi doğrultu; tıpkı doğu-batı gibi bir çizgi."
  },
  15: {
    prompt: `3D Pixar animation style feature film shot. Smartboard screen showing a glowing amber arrow pointing East, labeled '3. Yön (Doğu)'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Üçüncüsü yön; örneğin doğuya doğru olması."
  },
  16: {
    prompt: `3D Pixar animation style feature film shot. Smartboard screen showing a glowing cyan arrow labeled '4. Büyüklük: 5 N'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Ve dördüncüsü büyüklük, yani kuvvetin Newton cinsinden değeri; mesela 5 N."
  },
  17: {
    prompt: `3D Pixar animation style feature film shot. Medium shot. @mira sits at her desk holding a pencil over her notebook with a curious expression, a floating thought bubble above showing two force arrows pushing a box. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Mira defterine not aldıkça bir şeyi merak etti: Ya bir cisme aynı anda birden fazla kuvvet etki ederse?"
  },
  18: {
    prompt: `3D Pixar animation style feature film shot. Medium shot of science teacher smiling beside Smartboard, tapping the glass screen as golden sparkles appear. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "İşte tam o an öğretmeni sihirli tanımı söyledi:"
  },
  19: {
    prompt: `3D Pixar animation style feature film shot. Smartboard graphic showing two blue force arrows combining into a golden net force arrow pushing a box, titled 'Bileşke Kuvvet (Net Kuvvet)'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "İki ya da daha fazla kuvvetin bir cisme yaptığı etkiyi, tek başına yapabilen kuvvete bileşke kuvvet, ya da net kuvvet diyoruz."
  },
  20: {
    prompt: `3D Pixar animation style feature film shot. Smartboard screen display featuring a bold 3D golden letter 'R' with Turkish text below 'R = Bileşke Kuvvet'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Ve onu R harfiyle gösteriyoruz."
  },
  21: {
    prompt: `3D Pixar animation style feature film shot. Wide shot of sunny school courtyard as school bell swings. Students walk out for recess. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Zil çaldı, teneffüs başladı."
  },
  22: {
    prompt: `3D Pixar animation style feature film shot. Medium wide shot. @mira walks into schoolyard and sees Turkish boys @ali and @can near mud trying to push a stuck red toy car. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Mira bahçeye çıktığında arkadaşları Ali ile Can'ı, çamura saplanmış kırmızı bir oyuncak arabayı kurtarmaya çalışırken buldu."
  },
  23: {
    prompt: `3D Pixar animation style feature film shot. Action close-up. @ali strains as he pushes red toy car Eastward with a glowing vector arrow labeled '10 N' from his hands. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Ali arabayı doğu yönünde var gücüyle, 10 N ile itiyordu ama araba yerinden kıpırdamıyordu."
  },
  24: {
    prompt: `3D Pixar animation style feature film shot. Action shot. @can kneels beside @ali, pushing the red toy car in the same Eastward direction with a second glowing vector arrow labeled '15 N'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Yetmedi! Can da yardıma koştu ve aynı yönde 15 N ile destek verdi."
  },
  25: {
    prompt: `3D Pixar animation style feature film shot. Side profile ground angle. @ali and @can pushing side-by-side Eastward with two parallel glowing vector arrows '10 N' and '15 N'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "İkisi de aynı doğrultuda ve aynı yönde kuvvet uyguladığı için bu kuvvetler birbirine yardım etti."
  },
  26: {
    prompt: `3D Pixar animation style feature film shot. Close-up. @mira watches excitedly counting on her fingers as a glowing golden '+' symbol floats between force values. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Mira hemen hesapladı: Aynı yönlü kuvvetlerde bileşke kuvveti bulmak için onları toplarız."
  },
  27: {
    prompt: `3D Pixar animation style feature film shot. Floating 3D math graphic in mid-air: 'R = F1 + F2 = 10 N + 15 N = 25 N' with a large golden arrow '25 N' pointing East. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "R eşittir F1 artı F2; yani 10 N artı 15 N, eder 25 N."
  },
  28: {
    prompt: `3D Pixar animation style feature film shot. Action shot. Red toy car pops out of mud with dirt splash shooting Eastward as @ali and @can cheer. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Ve araba, doğu yönündeki bu 25 N'luk güçle çamurdan bir anda kurtuldu!"
  },
  29: {
    prompt: `3D Pixar animation style feature film shot. Medium close-up. @mira smiles proudly with hands on hips, nodding in understanding. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Mira gülümsedi: Demek aynı yöndeki kuvvetler birleşince güçleniyordu."
  },
  30: {
    prompt: `3D Pixar animation style feature film shot. Wide shot of green school sports field during tug-of-war match between Turkish students divided by white chalk line. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Öğleden sonra beden eğitimi dersinde sınıfça halat çekme yarışı yaptılar."
  },
  31: {
    cam: "medium shot",
    prompt: `3D Pixar animation style feature film shot. Medium shot. @mira stands at the grass field sideline watching tug-of-war attentively. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Mira kenardan izledi."
  },
  32: {
    prompt: `3D Pixar animation style feature film shot. Close-up on rope under tension. West side pulled with glowing purple arrow '30 N'; East side pulled with glowing orange arrow '20 N'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Batı tarafındaki arkadaşı halatı 30 N ile çekerken, doğu tarafındaki arkadaşı 20 N ile karşı koyuyordu."
  },
  33: {
    prompt: `3D Pixar animation style feature film shot. Macro ground-level shot. Bright red cloth ribbon on rope sliding slowly Westward across white chalk line on grass. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Ortadaki kırmızı kurdele yavaşça batıya doğru kaydı."
  },
  34: {
    prompt: `3D Pixar animation style feature film shot. Medium shot. @mira points fingers in opposite directions analyzing opposing forces along the axis. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Mira bu sefer kuvvetlerin aynı doğrultuda ama zıt yönlerde olduğunu fark etti ve"
  },
  35: {
    prompt: `3D Pixar animation style feature film shot. Close-up. @mira looks up thoughtfully speaking to herself about opposing forces. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "kendi kendine \"Bunları toplayamam, çünkü birbirlerine karşı çekiyorlar\" dedi."
  },
  36: {
    prompt: `3D Pixar animation style feature film shot. Floating 3D infographic in mid-air showing subtraction rule: 'R = F büyük - F küçük'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Zıt yönlü kuvvetlerde bileşke kuvveti bulmak için büyük kuvvetten küçük kuvveti çıkarırız."
  },
  37: {
    prompt: `3D Pixar animation style feature film shot. Floating 3D calculation graphic: 'R = 30 N - 20 N = 10 N' with a purple vector arrow '10 N' pointing West. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "R eşittir büyük kuvvet eksi küçük kuvvet; yani 30 N eksi 20 N, eder 10 N."
  },
  38: {
    prompt: `3D Pixar animation style feature film shot. Action close-up of rope center ribbon at chalk line with a floating golden question mark '?'. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Peki halat hangi yöne hareket etti?"
  },
  39: {
    prompt: `3D Pixar animation style feature film shot. Wide action shot. West team pulls rope Westward celebrating with a green vector arrow pointing West. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Tabii ki güçlü olanın yönüne, yani batıya!"
  },
  40: {
    prompt: `3D Pixar animation style feature film shot. Medium shot. @mira holds up a digital tablet displaying 'Bileşke Kuvvet: Batı yönünde 10 N', smiling proudly. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Mira'nın bulduğu bileşke kuvvet: batı yönünde 10 N."
  },
  41: {
    prompt: `3D Pixar animation style feature film shot. Wide interior. Warm school library with mahogany bookshelves; @mira steps quietly into the room. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Ders bitince Mira kütüphaneye uğradı."
  },
  42: {
    prompt: `3D Pixar animation style feature film shot. Medium shot. @mira stands at a wooden library desk staring intently at a stationary blue science textbook. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Masanın üzerinde sessizce duran bir fen kitabı gördü ve düşündü:"
  },
  43: {
    prompt: `3D Pixar animation style feature film shot. Close-up. @mira leans over textbook with chin on hand, pondering about hidden forces. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "\"Bu kitap hareket etmiyor ama üzerine kuvvet etki ediyor olmalı.\""
  },
  44: {
    prompt: `3D Pixar animation style feature film shot. Textbook diagram with two equal glowing vector arrows: downward blue arrow 'Yer çekimi' and upward cyan arrow 'Masa tepki kuvveti'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Gerçekten de yer çekimi kitabı aşağı çekiyor, masa ise onu tam olarak aynı büyüklükte yukarı itiyordu."
  },
  45: {
    prompt: `3D Pixar animation style feature film shot. Close-up of textbook surface as equal vertical force arrows dissolve into glowing golden sparkles fading away. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "İki kuvvet eşit ve zıt yönlü olduğu için birbirini yok ediyor,"
  },
  46: {
    prompt: `3D Pixar animation style feature film shot. Floating 3D text over stationary book: 'Bileşke Kuvvet = 0 N (R = 0 N)'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "bileşke kuvvet tam olarak sıfır, yani R eşittir 0 N oluyordu."
  },
  47: {
    prompt: `3D Pixar animation style feature film shot. Medium shot. @mira nods in understanding as glowing 3D title 'DENGELENMİŞ KUVVETLER' appears above her in cyan. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "İşte Mira buna dengelenmiş kuvvetler dendiğini öğrendi."
  },
  48: {
    prompt: `3D Pixar animation style feature film shot. Medium close-up. @mira looks around thoughtfully reflecting that balanced forces apply to moving objects at constant speed. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Ama dengelenmiş olmak sadece durmak demek değildi."
  },
  49: {
    prompt: `3D Pixar animation style feature film shot. Wide panning shot. Sleek red car cruising smoothly at constant speed on highway with balanced horizontal force arrows. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Otobanda sabit süratle giden bir araba da,"
  },
  50: {
    prompt: `3D Pixar animation style feature film shot. Aerial shot. Skydiver with colorful parachute gliding at constant terminal velocity with balanced vertical force arrows. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "gökyüzünde sabit süratle süzülen bir paraşütçü de dengelenmiş kuvvetlerin etkisindeydi;"
  },
  51: {
    prompt: `3D Pixar animation style feature film shot. Dual split-screen. Left: car speedometer steady at 90 km/h. Right: skydiver speedometer steady. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "çünkü onların da sürati ve yönü değişmiyordu."
  },
  52: {
    prompt: `3D Pixar animation style feature film shot. Medium shot. @mira looks through library glass window toward garden, caught by sudden motion outside. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Tam o sırada Mira pencereden dışarı baktı."
  },
  53: {
    prompt: `3D Pixar animation style feature film shot. High-speed freeze shot. Crisp red apple detaching from tree branch accelerating downward under gravity. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Bahçedeki ağaçtan bir elma koptu ve gitgide hızlanarak yere düştü."
  },
  54: {
    prompt: `3D Pixar animation style feature film shot. Action shot. Student riding bicycle applies brakes as a cat crosses path, decelerating to a stop. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Biraz ötede bir bisikletli, önüne aniden bir kedi çıkınca frene bastı; yavaşladı ve durdu."
  },
  55: {
    prompt: `3D Pixar animation style feature film shot. Medium close-up. @mira watches through window realizing motion changes mean forces are NOT balanced. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Mira bunların dengelenmiş olamayacağını anladı, çünkü ikisinde de hareket değişiyordu."
  },
  56: {
    prompt: `3D Pixar animation style feature film shot. 3D physics diagram depicting unequal opposing force arrows on a block resulting in 'R ≠ 0 N'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Eğer bileşke kuvvet sıfırdan farklıysa, yani taraflardan biri daha güçlüyse,"
  },
  57: {
    prompt: `3D Pixar animation style feature film shot. Infographic titled 'DENGELENMEMİŞ KUVVETLER' demonstrating: 'Hızlanma', 'Yavaşlama', 'Yön değiştirme'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "orada dengelenmemiş kuvvetler vardır ve cismin hareketi mutlaka değişir."
  },
  58: {
    prompt: `3D Pixar animation style feature film shot. Close-up. @mira writes core rule in her science notebook with a confident smile. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Kısacası Mira şu kuralı çıkardı:"
  },
  59: {
    prompt: `3D Pixar animation style feature film shot. Triptych composite 3-panel: Left: space rocket accelerating; Center: car braking; Right: soccer ball curving mid-air. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Bir şey hızlanıyorsa, yavaşlıyorsa ya da yön değiştiriyorsa,"
  },
  60: {
    prompt: `3D Pixar animation style feature film shot. Medium shot. @mira points enthusiastically toward viewer with confident smile summarizing golden rule. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "bilin ki orada dengelenmemiş bir güç iş başındadır!"
  },
  61: {
    prompt: `3D Pixar animation style feature film shot. Wide golden hour shot. @mira walks home along sidewalk at sunset with backpack, happy and satisfied. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Akşam eve dönerken Mira o gün öğrendiklerini düşündü."
  },
  62: {
    prompt: `3D Pixar animation style feature film shot. Triple split-screen summary: Left: 'Aynı yönlü'; Center: 'Zıt yönlü'; Right: 'Dengelenmiş R = 0 N'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Artık kuvvetlerin bazen birleşip güçlendiğini, bazen çekişip birbirini azalttığını, bazen de tam denge kurup her şeyi olduğu gibi bıraktığını biliyordu."
  },
  63: {
    prompt: `3D Pixar animation style feature film shot. Medium close-up. @mira gives an energetic thumbs-up with glowing speed-lines and energy FX. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Bugün bileşke kuvveti jet hızıyla öğrendik!"
  },
  64: {
    prompt: `3D Pixar animation style feature film shot. Frontal shot. @mira holds up a bright golden question card toward camera with a playful smile. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Şimdi sıra sizde; işte Mira'dan küçük bir ödüllü soru:"
  },
  65: {
    prompt: `3D Pixar animation style feature film shot. 3D diagram of blue gift box pulled Northward with arrow '15 N' and Southward with arrow '15 N'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Bir kutuyu kuzey yönünde 15 N, güney yönünde ise yine 15 N kuvvetle çekersek,"
  },
  66: {
    prompt: `3D Pixar animation style feature film shot. Close-up quiz diagram with text: 'Dengelenmiş kuvvette midir? Bileşke kuvvet kaç N?'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "bu kutu dengelenmiş kuvvette midir ve bileşke kuvvet kaç olur?"
  },
  67: {
    prompt: `3D Pixar animation style feature film shot. Medium shot. @mira points down toward comment section inviting answers with a warm smile. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Cevaplarınızı yorumlara bekliyoruz."
  },
  68: {
    prompt: `3D Pixar animation style feature film shot. Close-up. @mira holds glowing 3D atom emblem in open palm waving warmly to camera. NO photorealism, NO text, NO subtitle, NO English letters, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Bilimle kalın, kuvvetiniz hep dengede kalsın."
  },
  69: {
    prompt: `3D Pixar animation style feature film shot. Wide end-title shot. @mira waves goodbye beside 3D banner 'Mira ile Bir Sonraki Keşifte Görüşmek Üzere!'. NO photorealism, NO English text, NO subtitle, NO watermark, NO black characters, NO Asian characters. Clean render.`,
    vo: "Mira'yla bir sonraki keşifte görüşmek üzere!"
  }
};

let md = `# MAMILAS — 6. Sınıf Kuvvet TEMİZ & NET 69 Prompt Paketi (Magnific / NB2 Uyumlu)\n\n`;
md += `> **Metin / Filigran Koruması:** Sıfır teori bloğu; filigran basılması engellendi.\n`;
md += `> **Irk / Karakter Koruması:** Fiziksel tarif yok; Siyahi/Yabancı karakter türetilmesi engellendi.\n`;
md += `> **Dil:** Sadece Türkçe metinler serbest, İngilizce harfler yasaklandı.\n\n---\n\n`;

for (let i = 1; i <= 69; i++) {
  const item = scenes[i];
  md += `## Sahne ${i}\n\n`;
  md += `**Seslendirme:**\n> "${item.vo}"\n\n`;
  md += `**Fal Nano Banana 2 Clean Prompt:**\n\`\`\`text\n${item.prompt}\n\`\`\`\n\n---\n\n`;
}

fs.writeFileSync(path.join(outputDir, 'SAHNE-PROMPTLAR-CLEAN.md'), md, 'utf8');
console.log('Saved clean prompts to SAHNE-PROMPTLAR-CLEAN.md');
