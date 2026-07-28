# Kütle ve Ağırlık — Revize ve Motion Takibi

## Gerçek kare eşlemesi

35 karenin tamamının bulunduğu otorite klasör:
`/Users/Muhammet/Desktop/mamilas-modern/agents/COMMAND-INBOX/5. Sınıf - Kütle ve Ağırlık`.

Magnific board'unda K01–K35 doğru sıradadır. İndirme sırasında eksik K10 en son `35.png`
adıyla alınmıştır; bu nedenle yerel dosya akışı `1.png–9.png → 35.png → 10.png–34.png` olur.
`10.png` K11, `34.png` K35'tir.

| Plan kare | Gerçek dosya | Durum |
| --- | --- | --- |
| K01–K09 | `1.png`–`9.png` | K04 baştan üretim, K09 referans edit |
| K10 | `35.png` | PASS |
| K11–K35 | `10.png`–`34.png` | 17 referans edit, kalanlar PASS |

Tam eşleme: [GERCEK-KARE-ESLEME.txt](GERCEK-KARE-ESLEME.txt).

## Gerçek-kare audit hükmü

Node’a çekilecek tam metin: [revize.txt](revize.txt).

| Gerçek dosya | Plan kare | Karar |
| --- | --- | --- |
| `4.png` | K04 | **BAŞTAN ÜRET:** VO fen dersini söylüyor; kare yalnız mutfakta Efe’yi gösteriyor |
| `9.png` | K09 | Fazladan ikinci elmayı kaldır; `kg` ve `g` kütleleri kalsın |
| `10.png` | K11 | Üst-sol bozuk arka plan yazısını boşalt |
| `13.png` | K14 | Okunur pseudo-yazılı fon kâğıtlarını temizle |
| `14.png` | K15 | Aynalı/bozuk fon yazılarını temizle |
| `15.png` | K16 | Elma yanlışlıkla kürenin altına sıkışmış; küre yüzeyindeki yuvaya taşı, etiketleri temizle |
| `17.png` | K18 | Bozuk arka plan tabelalarını boşalt |
| `19.png` | K20 | `N` zaten doğru; asıl hata yeşile dönen elma |
| `20.png` | K21 | Elma domatese morph olmuş; `PLANT CELL` İngilizce; orta pano akıllı tahta gibi değil |
| `21.png` | K22 | `BLANK SOLAR` ve kitap içindeki pseudo-yazılar temizlenecek |
| `25.png` | K26 | Doğru başlık korunacak; altındaki bozuk küçük metin kaldırılacak |
| `26.jpg` | K27 | `TEST LOAD` → `DENEY KÜTLESİ` |
| `27.png` | K28 | Tek doğru `100 N`; ikinci `100` kaldırılacak |
| `28.png` | K29 | Lander elmaya morph olmuş; bozuk habitat tabelası var |
| `29.png` | K30 | Yeşil kara tahta görünümü modern metinsiz akıllı tahtaya çevrilecek |
| `30.png` | K31 | Tek kefede elma varken fizik dışı denge; sol kefeye bilinen kütleler eklenecek |
| `31.png` | K32 | Küredeki İngilizce/bozuk ülke etiketleri kaldırılacak |
| `33.png` | K34 | Elma soyulmuş/parçalanmış; tek küçük ısırık ve temiz fon tabelaları |
| `34.png` | K35 | Isırılmış elma devamlılığı ve sağ-üst bozuk poster düzeltilecek |

### Doğrudan PASS

`1.png`, `2.png`, `3.png`, `5.png`, `6.png`, `7.png`, `8.png`, `35.png`,
`11.png`, `12.png`, `16.png`, `18.png`, `22.png`, `23.png`, `24.png`, `32.png`.

Önemli yanlış teşhis düzeltmeleri: `19.png` üzerindeki `N`, `22.png` üzerindeki `60 kg` ve
`23.png` üzerindeki `600 N` zaten doğru ve legible. Önceki revize listesinde bunlar hatalı
biçimde eksik sayılmıştı; artık revize kuyruğunda değiller.

## Motion kuralı

- Görülen ve temiz kareler için Kling motion yazılabilir.
- K04 için yeni gerçek kare görülmeden motion yazılmaz.
- Referans edit hedeflerindeki mevcut motionlar yalnız sahne kompozisyonu korunursa kullanılabilir; revize sonucu yine görsel olarak onaylanır.
- Her motion yalnız mevcut karedeki öğeyi canlandırır; yeni karakter, eşya veya yazı doğurmaz.
- Motion seti aşağıya gerçek dosya eşlemesiyle eklenecek.

## Motion — PASS veya kompozisyon-korumalı edit kareleri

**Ortak Kling kilidi:** Approved start frame is truth; animate only the next half-second. Attack inside the first second, resolve by about 70%, then hold. Silent clip, no audio, no dialogue, mouth closed, no lip movement. No whip-pan, shake, snap-zoom, camera warp, re-render, new character, new prop or new text.

### K01 · `1.png` · 5s

KAMERA NİYETİ: Ortak ev işinin sıcaklığını, elma yolculuğunun başlangıcı olarak tut.

Efe lowers the vegetables from the cloth bag onto the counter and lets the apple settle among them; @anne completes one small sorting gesture. Steam curls from the copper pot, the lace curtain moves once, and dust drifts in the pendant beam. Camera: a very slow child-eye-level push-in. Keep both characters inside frame, keep the apple, bag, pot and counter rigidly placed; no new food, no talking, no mouth animation.

### K02 · `2.png` · 5s

KAMERA NİYETİ: İlk yanlış adlandırmanın sakin, gerçek anını ölçeğin üzerinde tut.

The apple completes its tiny settle on the kitchen scale and the existing “200 g” display stabilizes without changing shape. Efe’s fingertips lift away by a few centimeters; @anne’s hands remain still nearby. Steam makes one soft curl and the pendant reflection slides gently across the scale casing. Camera: locked with a subtle rack from Efe’s fingertips to the display. Keep “200 g” perfectly frozen and legible; no extra digits, no text morph, no dialogue.

### K03 · `3.png` · 5s

KAMERA NİYETİ: Annenin sıcaklığı ile Efe’nin zihnindeki soruyu aynı nefeste göster.

Efe’s gaze leaves the apple for a brief thoughtful eye dart while his brow settles into the existing question; @anne’s soft background smile holds. The apple rotates less than a quarter turn in his palm, a distant steam thread rises, and warm practical light shifts across his cheek. Camera: gentle micro push toward Efe’s eyes. Keep both mouths closed, the apple intact, and the soft background unsharpened.

### K04 · `4.png` · İPTAL — yeni kare bekleniyor

Mevcut mutfak karesi VO’yu göstermediği için bu motion kullanılmayacak. Yeni sınıf start frame’i
görülüp onaylandıktan sonra o kareye bağlı yeni Kling motion yazılacak.

### K05 · `5.png` · 5s

KAMERA NİYETİ: Merak anını yüz ve eldeki elma arasında netleştir.

Efe turns the apple a small final fraction in his palm, then holds it still as his eyes settle on its surface. The apple highlight travels over the red skin, a warm bokeh practical trembles gently, and a foreground fruit edge stays soft. Camera: slow rack from the apple to Efe’s thoughtful eyes. Keep the apple whole and singular, keep his mouth closed, and do not introduce question marks, graphics or new text.

### K06 · `6.png` · 5s

KAMERA NİYETİ: “KÜTLE” başlığını fiziksel bir keşif eşiği gibi okut.

The existing brass “KÜTLE” lettering holds completely rigid while its warm light gently brightens and settles; Efe’s shoulders rise with one quiet inhalation and his eye line lifts toward the letters. Dust turns in the letter light and the countertop’s small reflection shifts. Camera: slow centered push-in, ending before the text fills frame. Keep every letter perfectly spelled and fixed; no wobble, re-spell, extra word, flame, flower or text creation.

### K07 · `7.png` · 5s

KAMERA NİYETİ: Maddenin elmanın içinde olduğu fikrini dokunsal bir yakınlıkla tut.

Efe rolls the apple a few millimeters against his fingertips and then holds it; the existing warm inner apple glow remains light only, never changing the fruit’s shape. His eyes make a small focus shift toward the apple, dust drifts behind, and the kitchen bokeh breathes. Camera: locked close-up with a subtle focus pull from apple skin to Efe’s eye. Keep the apple uncut, whole and non-melting; no particles, x-ray, diagram or mouth movement.

### K08 · `8.png` · 5s

KAMERA NİYETİ: Eşit kollu terazinin gerçek mekanik dengesini kahraman yap.

Efe releases the final small mass; the balance beam makes one controlled dip, overshoots once, and settles level by the last third. The fine chains sway only within their existing plane, dust turns in the warm light, and the apple remains seated in its pan. Camera: nearly locked, with a gentle rack from Efe’s hand to the center pointer. Keep brass arms, chain count and pans rigid; no bend, melt, pass-through, new weights or numbers.

### K10 · `35.png` · 5s

KAMERA NİYETİ: “DEĞİŞMEZ” hükmünü öğretmenin tek kontrollü jesti ve sabit kalan elmayla mühürle.

@ogretmen lifts her fingertips a few centimeters away from the apple and holds her open hand beside it; the apple remains perfectly still and unchanged. The balance pointer makes one tiny mechanical settle, the curtain edge moves once, and dust turns through the morning beam. Camera: a slow, restrained push that ends with the apple, balance and “DEĞİŞMEZ” plaque all readable. Keep the plaque letters completely rigid and correctly spelled, keep the smartboard text-free, and do not add a student, second apple, speech, lip movement or new text.

### K11 · `10.png` · 5s

KAMERA NİYETİ: Konum değişse de nesnenin aynı kaldığını mekânın kendisi anlatsın.

The balance pointer makes one tiny settle beside the apple while fine frost dust crosses the nearest porthole; a controlled dome-light reflection slides across the apple skin. Camera: slow lateral dolly behind the existing dome strut, creating parallax between the balance and the three distant destinations. Keep the apple, balance, portholes and planetary views fixed; no character entrance, no split-screen, flag, logo, new world or text.

### K12 · `11.png` · 5s

KAMERA NİYETİ: Elmanın değişmeyen bütünlüğünü cam ve metalin sakinliğiyle koru.

The dome reflection travels slowly over the glass and the apple’s existing highlight shifts by a few degrees; the balance behind remains still while a few fine dust grains settle. Camera: a subtle macro push toward the intact stem, ending before the glass edge distorts. Keep the apple whole, uncut and motionless in its cradle; no x-ray, internal particles, morphing, new hand or new text.

### K13 · `12.png` · 5s

KAMERA NİYETİ: İkinci kavramı mutfak dünyasında fiziksel bir başlık olarak aç.

The existing “AĞIRLIK” lettering stays rigid while its warm light gently breathes once; the curtain moves and the apple highlight shifts near the waiting dynamometer. Camera: slow three-quarter push toward the brass base. Keep every Turkish letter fixed and legible, keep the dynamometer and apple in place, and never turn the glow into a flower, flame, floating overlay or new caption.

### K14 · `13.png` · 5s

KAMERA NİYETİ: Düşüşü tek, okunur bir sebep–etki yayı olarak tamamla.

The apple drops the remaining finger-width, touches the satin wood, makes one tiny soft bounce, and settles in its existing contact shadow. Efe’s releasing fingers stop above it; steam curls from the pot and one dust mote crosses the light. Camera: locked at counter height to protect the landing geometry. Keep the apple on the counter after contact; no levitation, slow-motion trail, second bounce, new object, dialogue or camera warp.

### K15 · `14.png` · 5s

KAMERA NİYETİ: Soruyu, yere geri dönen güvenli küçük hareketle bedenleştir.

Efe completes the existing safe hop: sneakers meet the tiled floor, knees absorb the landing, shirt hem settles, then he holds. @anne remains a soft distant witness; the apple stays safely on the counter. Curtain fabric moves once and dust turns in the pendant beam. Camera: locked medium-wide at Efe’s eye level, with no follow pan. Keep feet grounded, no prolonged hover, no fall, no superhero leap, no speech or lip movement.

### K16 · `15.png` · 5s

KAMERA NİYETİ: Dünyanın çekimini, elmanın küre üzerindeki gerçek yerleşmesiyle okut.

The apple completes a tiny settle into the brass cradle on the globe and holds; the balance behind stays quiet, a globe highlight shifts, and classroom dust turns in the window beam. Camera: gentle rack from the globe’s curved surface to the apple. Keep the globe, cradle and apple rigidly connected; no orbit line, arrowhead, rolling apple, new person or smartboard text.

### K17 · `16.png` · 5s

KAMERA NİYETİ: Öğretmenin tek eli kavramı işaret ederken yazıyı güvenle sabitle.

@ogretmen’s open hand makes one small finishing gesture toward the apple in the globe cradle, then rests; her sleeve follows through softly. The apple and globe remain still while dust turns in sunlight. Camera: slow push that stops with the plaque and teaching hand both readable. Keep “YER ÇEKİMİ” perfectly fixed, all letters intact, smartboard dark and text-free; no new drawing, arrow, dialogue or lip movement.

### K18 · `17.png` · 5s

KAMERA NİYETİ: Kuvveti, yayın gerçek uzamasıyla aletin içinde görünür kıl.

The hanging apple adds one tiny downward pull, the visible spring extends subtly, the red pointer overshoots once and settles. Dust turns through the classroom light and a steel highlight slides across the instrument casing. Camera: locked with a small focus pull from the hook connection to the pointer. Keep the rig rigid, hook secure and apple vertical; no swinging arc, deformation, melt, extra text, character entrance or camera shake.

### K19 · `18.png` · 5s

KAMERA NİYETİ: Doğru aleti seçme anında gözü teraziden dinamometreye taşı.

@ogretmen’s existing edge-of-frame hand makes a short directing motion toward @dinamometre; its spring settles while the inactive balance chain makes one final tiny swing. The apple hangs straight, and the classroom smartboard remains quiet in soft focus. Camera: gentle rack from the empty balance pan to the dynamometer. Keep both instruments in place, no new labels or chart, no hand crossing the hook, no dialogue or mouth movement.

### K21 · `20.png` · 5s

KAMERA NİYETİ: Dünya–Ay farkını tek sınıf mekânında karşılaştırmalı ama sakin bırak.

The dynamometer pointer quivers once and settles while the globe catches a moving window highlight and the moon-diorama fabric makes a faint edge motion. Camera: a very short lateral dolly that lets the globe edge pass in the foreground and reveals the moon table in depth. Keep both physical worlds, apple and instrument fixed; no split-screen, orbit graphic, new person, text, logo or camera warp.

### K22 · `21.png` · 5s

KAMERA NİYETİ: Hayal yolculuğunun başladığı anı göz kapakları ve masa detaylarıyla kur.

Efe’s eyes close fully and his hand settles beside the apple; the open book page lifts once in the window draft and falls back, while a dust mote crosses the sunbeam. Camera: a slow push toward his calm face, ending before the scene changes. Keep the classroom, helmet, globe and smartboard exactly present; no portal, rocket launch, costume swap, new space world, dialogue or lip movement.

### K25 · `24.png` · 5s

KAMERA NİYETİ: Ay’a varışı, ilk güvenli adım ve tozun yerleşmesiyle hissettir.

@efe_space completes one short step down from the ramp; the nearest boot compresses lunar grit, a small dust puff rises and settles, and the apple pod catches a shifting reflection. Camera: slow low lateral track for a few centimeters, then hold on the planted boot. Keep lander, Earth, pod and all suit geometry fixed; no flag, logo, rocket launch, teleport, extra astronaut or visor morph.

### K26 · `25.png` · 5s

KAMERA NİYETİ: Daha zayıf çekimi, sakin duran rigdeki kısa yay uzamasıyla göster.

The hanging training weight settles with a restrained upward return; the relaxed spring makes one tiny oscillation and stops while lunar dust drifts low across the rig. An Earth reflection moves across the instrument glass. Camera: locked, minimal macro push. Keep the rig, spring coils, lander and apple pod rigid; no fraction graphic, character appearance, swinging weight, deform, melt or camera shake.

### K27 · `26.png` · 5s

KAMERA NİYETİ: Ay’da da değişmeyen kütleyi terazinin tam dengesiyle mühürle.

The balance beam makes one minute leveling correction and its center pointer settles; fine dust falls beyond the dome while @efe_space holds an attentive still pose. Camera: a delicate rack from the astronaut’s visor reflection to the balance plate. Keep the existing “60 kg” text frozen and legible, chains rigid and pan loads unchanged; no new numbers, flag, logo, dialogue or lip movement.

### K29 · `28.png` · 5s

KAMERA NİYETİ: Düşük yerçekimi adımını uçuşa değil kontrollü inişe bağla.

@efe_space completes the long low-gravity stride already in progress: the forward boot reaches granular ground, dust lifts in a shallow arc and settles, suit fabric follows through, then the body holds balanced. Camera: short side tracking move that stops with the boot landing. Keep the astronaut grounded, lander and Earth fixed; no flying, superhero leap, flag, logo, new character, camera shake or visor deformation.

### K30 · `29.png` · 5s

KAMERA NİYETİ: Kavrayışın geri dönüşünü gözlerde ve sakin sınıf eşyalarında ver.

Efe’s eyes open into the existing calm expression; his catchlight strengthens, then he holds. A notebook page edge settles, dust floats through the window beam, and the apple remains still beside the book. Camera: gentle push toward the eyes, ending before any object becomes a graphic. Keep instruments, helmet, globe and smartboard in soft background focus; no flashback collage, dialogue, lip movement, new text or camera warp.

### K31 · `30.png` · 5s

KAMERA NİYETİ: Kütle özetini, dengelenen terazi ve sabit başlıkla netleştir.

The balance beam completes a tiny settle and the pointer centers while sunlit dust turns behind the apple. Camera: a restrained push that keeps the apple, balance and existing “KÜTLE” plaque in the same plane. Keep every letter rigid, correctly spelled and fully visible; no new kg text, no chart, no arrow, no character entrance, no chain deformation or camera shake.

### K32 · `31.png` · 5s

KAMERA NİYETİ: Ağırlık özetini, yayı ve işaretçiyi sakin bir mekanik sonuç olarak tut.

The spring holds tension, the red pointer makes one tiny final settle, and a small steel highlight travels over the dynamometer while dust turns in morning light. Camera: minimal rack from the hanging apple to the existing “AĞIRLIK” plaque. Keep the plaque text frozen, hook secure, globe and balance fixed; no new number, chart, arrow, text morph, swinging apple or camera warp.

### K33 · `32.png` · 5s

KAMERA NİYETİ: Düzeltmenin kanıtını, gerçek “200 g” ekranının yerleşmesiyle ver.

The scale display completes its existing settle at “200 g” and holds; steam rises once from the copper pot, the apple highlight shifts, and @anne remains a soft distant continuity silhouette. Camera: slow rack from the apple to the readout, then hold. Keep “200 g” exactly frozen and legible, with no extra digit, word, caption or screen flicker; no new hand, dialogue or lip movement.

### K34 · `33.png` · 5s

KAMERA NİYETİ: Bilerek alınan ısırığı abartmadan, memnuniyetle kapat.

Efe lowers the already-bitten apple by a few centimeters and his eyes soften into a satisfied hold; @anne’s background smile remains warm. Steam curls behind, the curtain moves once, and the fruit-bowl foreground stays softly anchored. Camera: subtle medium-close push toward Efe’s eyes, stopping early. Keep the bite size unchanged, mouth closed and still, no food mess, no extra bite, no speech, no new text or camera shake.

### K35 · `34.png` · 5s

KAMERA NİYETİ: Cevabı bulan çocuğu, başladığı mutfaktan sakin bir vedayla çıkar.

Efe takes one small step toward the hall, then turns his existing confident smile back toward the kitchen and holds; @anne continues one quiet dinner gesture at the counter. Steam rises, the lace curtain breathes, and pendant dust drifts. Camera: gentle backward dolly that preserves both Efe and @anne in their existing depth layers. Keep the bitten apple, kitchen geometry and warm practical light fixed; no end card, caption, dialogue, lip movement, new character or camera warp.

## Motion beklemede

K09 (`9.png`), K10 (yeni frame), K20 (`19.png`), K23 (`22.png`), K24 (`23.png`) ve K28 (`27.png`) revize görüntüleri görüldükten sonra yazılacak.

## En fazla 10 Kling üretimi — seçili master klipler

Yukarıdaki motionlar **motion kütüphanesidir**, 29 videoyu toplu üretme talimatı değildir. Kling'e yalnız aşağıdaki on master klip basılacak; diğer temiz kareler Premiere'de VO altında statik/donuk cutaway olarak kullanılır.

| Master video | Kullanılacak kare | Neden |
| --- | --- | --- |
| V01 | K01 / `1.png` | Ev–elma hikâyesini başlatır |
| V02 | K02 / `2.png` | İlk 200 g yanılgısını canlı kurar |
| V03 | K08 / `8.png` | Terazi mekaniği gerçekten hareket ister |
| V04 | K14 / `13.png` | Düşüşün neden–etki anı |
| V05 | K18 / `17.png` | Yay uzaması ağırlığı fiziksel gösterir |
| V06 | K22 / `21.png` | Hayal yolculuğunun karakter geçişi |
| V07 | K25 / `24.png` | Ay’a varışın mekân değişimi |
| V08 | K27 / `26.png` | Ay’da değişmeyen 60 kg dengesi |
| V09 | K29 / `28.png` | Düşük yerçekimi dev adımı |
| V10 | K35 / `34.png` | Sakin, hikâye-kapanışı |

K09/K10/K20/K23/K24/K28 revizeleri tamamlanınca bile otomatik on birinci video açılmaz; bunlar öğretici statik cutaway olarak kalır, Mami özel olarak hareket isterse master seçimi yeniden yapılır.
