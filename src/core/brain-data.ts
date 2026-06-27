// AUTO-EXTRACTED verbatim from legacy mamilas.html concept/DNA/suno engine.
// Pure data literals — no state, no DOM. Do not hand-edit; regenerate from source.
/* eslint-disable */
export type Bank = Array<[RegExp, string, string]>;
export type FB = Record<string, [string, string]>;

export const EDU_BANK: Bank =[
 [/fotosentez|klorofil|yaprak|bitki b[uü]y|\bk[oö]k|\btohum|photosynth/i,
  'one oversized translucent leaf model with a visible inner channel',
  'the leaf draws in one water drop and one beam of light, a single bright food drop forms inside the channel and settles glowing at the stem'],
 [/su d[oö]ng|buharla[sş]|\bbuhar\b|ya[gğ]mur|bulut|yo[gğ]u[sş]|damla|nehirle|denize d[oö]n|evapor/i,'WATER_STAGE',''],
 [/kuvvet|s[uü]rt[uü]nme|yer[cç]ekimi|m[iı]knat[iı]s|itme|[cç]ekme|enerji d[oö]n[uü]/i,
  'one demo rig with a slider block and a visible force arrow rail',
  'the block slides once along the rail exactly as far as the force arrow shows, leaving a faint friction mark, and both settle aligned'],
 [/gezegen|y[oö]r[uü]nge|uzay|g[uü]ne[sş] sistem|planet|orbit/i,
  'one orbit table where small planets ride visible brass rings around a warm sun lamp',
  'the highlighted planet glides one clean arc along its ring, its small shadow sweeping the table, and the system settles readable'],
 [/erime|donma|\bbuz\b|kat[iı] s[iı]v[iı]|h[aâ]l de[gğ]i[sş]|melt|freeze/i,
  'one state-change stage: an ice block, a water basin and a vapour lane under one warm lamp',
  'the lamp warmth crosses the ice once, a melt line travels down its face into the basin, and the surface settles still'],
 [/\bkesir|\bpayda(?![sş])|\bpay\b|b[uü]t[uü]n[uü]n par[cç]a|fraction/i,
  'one whole circular form scored into equal parts on a measuring base',
  'the scored form opens once into its equal parts, the named part lifts slightly and brightens, and the whole closes back aligned'],
 [/toplama|[cç][iı]karma|e[sş]ittir|denklem|matematik problemi|equation/i,
  'one balance scale with number tiles waiting on both arms',
  'tiles slide onto one arm in a single move, the beam tips and levels exactly at equality, and the result tile settles facing camera'],
 [/[cç]arpma|[cç]arp[iı]m|e[sş]it grup|multipl/i,
  'one tile field where loose pieces wait beside an empty grid frame',
  'the loose tiles snap into equal rows inside the grid in one sweep, the total edge brightens, and the array settles square'],
 [/b[oö]lme i[sş]lem|payla[sş]t[iı]rma|division/i,
  'one sharing tray where a stack of tokens waits above equal empty cups',
  'the token stack deals itself once around the cups in even turns, each cup filling equally, and the last token settles showing the remainder'],
 [/geometri|[uü][cç]gen|\bkare\b|daire|dikd[oö]rtgen|\ba[cç][iı]\b|\balan\b|[cç]evre [oö]l[cç]|shape|angle/i,
  'one shape-building table with edge sticks and a corner protractor token',
  'edge sticks rise and join one by one into the named shape, the angle token clicks at its corner, and the build settles rigid'],
 [/say[iı] do[gğ]rusu|\brakam|\bonluk|\bbirlik\b|basamak|ritmik say|place value/i,
  'one place-value board with stacks of unit cubes and ten-rods',
  'ten loose cubes merge once into a single rod that slides into the tens column, the readout settles on the new number'],
 [/\bsaat\b|dakika|s[uü]re [oö]l[cç]|zaman [oö]l[cç]|clock/i,
  'one oversized clock face with a touchable minute hand and a duration arc band',
  'the minute hand sweeps once to the target mark, the duration band fills behind it, and the face settles readable'],
 [/uzunluk [oö]l[cç]|metre|cetvel|santimetre|terazi|kilogram|litre|[oö]l[cç]me/i,
  'one measuring station: the object, an oversized honest ruler or scale, and a result window',
  'the measuring tool extends once along or under the object, the result window fills to the exact mark, and the reading settles locked'],
 [/atat[uü]rk|cumhuriyet|kurtulu[sş]|ba[gğ][iı]ms[iı]zl[iı]k|[iı]nk[iı]lap|23 nisan|29 ekim|10 kas[iı]m|19 may[iı]s/i,
  'one respectful museum table with an archive map, a timeline rail and one brass event marker',
  'the brass marker advances once along the timeline rail, a soft spotlight settles on the matching map region, and the exhibit holds in quiet dignity'],
 [/osmanl[iı]|sel[cç]uklu|fetih|kurulu[sş] d[oö]nem|beylik|antla[sş]ma|zafer|tarih ders/i,
  'one relief map table with a timeline rail and a single moving campaign marker',
  'the marker advances one segment, the map region tone shifts to match the outcome, and the table settles on the new border line'],
 [/harita|k[iı]ta|[uü]lke|pusula|co[gğ]raf|b[oö]lge|\bda[gğ]\b|\bg[oö]l\b|iklim ku[sş]a/i,
  'one carved relief map with a compass rose and a small route bead',
  'the route bead travels once along the carved valley path, the compass needle steadies, and the landform settles under raking light'],
 [/empati|sayg[iı]|sevgi|d[uü]r[uü]st|payla[sş]mak|yard[iı]mla[sş]|ho[sş]g[oö]r[uü]|sab[iı]r|nezaket|merhamet|de[gğ]erler|duygu|arkada[sş]l[iı]k/i,
  'two soft figures at a small table with one shared keepsake object between them',
  'the keepsake passes once from one pair of hands to the other, the receiving figure warms visibly, and both settle in a calm shared frame'],
 [/\bkurall?ar\b|\bhak\b|sorumluluk|adalet|e[sş]itlik|g[oö]rev bilinci|fairness/i,
  'one fairness scale with two equal token trays',
  'one token moves to balance the trays in a single placement, the beam levels, and the scale settles even'],
 [/\bhece\b|[uü]nl[uü] harf|[uü]ns[uü]z|alfabe|\bses bilgisi\b|harfler/i,
  'one letter rail where carved letter tiles wait beside an empty word slot',
  'the letter tiles slide once along the rail into the word slot, the completed word edge brightens, and the rail settles'],
 [/\bfiil\b|\bisim\b|s[iı]fat|zamir|s[oö]zc[uü]k t[uü]r|kelime t[uü]r|c[uü]mlenin [oö]ge/i,
  'one word-sorting station with labelled lanes and waiting word blocks',
  'one word block glides into its correct lane, the lane gate clicks shut, and the station settles ordered'],
 [/ge[cç]mi[sş] zaman|[sş]imdiki zaman|gelecek zaman|zaman eki|tense/i,
  'one time station with three lanes (past, present, future) and a verb block on a slider',
  'the verb block travels once into the correct lane, its suffix tile clicks into place, and the station settles readable'],
 [/[cç][uü]nk[uü]|dolay[iı]s[iı]yla|ba[gğ]la[cç]|sebep sonu[cç]|neden sonu[cç]/i,
  'one cause card and one result card with a folded bridge piece between them',
  'the bridge unfolds once from the cause card to the result card, the connector word face turns up, and the link settles locked'],
 [/noktalama|b[uü]y[uü]k harf|virg[uü]l|soru i[sş]aret/i,
  'one sentence rail with an empty punctuation slot and a stamp token',
  'the punctuation token rolls once into its slot, the stamp presses gently, and the sentence settles readable'],
 [/ana fikir|paragraf|\bmetin\b|hikaye haritas|olay [oö]rg|masal|okudu[gğ]unu anlama/i,
  'one story stage built from layered page flats with a small idea lantern',
  'one page flat tips forward to reveal the core idea layer, the idea lantern brightens above it, and the stage settles on the main point'],
 [/h[uü]cre|organlar|v[uü]cudumuz|kemik|sindirim|solunum|iskelet|kas sistem/i,
  'one open cutaway body or cell model with layered, touchable parts',
  'one labelled layer lifts away to reveal the working part beneath, that part performs its single function visibly, and the model settles open'],
 [/duyu organ|g[oö]z[uü]m[uü]z|kula[gğ][iı]m[iı]z|burnumuz|dilimiz|derimiz/i,
  'one gentle sense-station: the oversized sense organ model and the thing it senses on a small stage',
  'the stimulus reaches the organ model once, a soft signal line travels visibly from organ toward a small glowing mind lamp, and both settle connected'],
 [/sa[gğ]l[iı]kl[iı] beslen|besin|vitamin|[oö][gğ][uü]n|dengeli/i,
  'one balanced plate model with food group sectors and one selector ring',
  'the selector ring glides once around the plate, each food sector lifting slightly in turn, and the ring settles on the balanced full circle'],
 [/mikrop|temizlik|h[iı]jyen|el y[iı]ka|di[sş] f[iı]r[cç]ala/i,
  'one before/after cleanliness stage: a surface half-covered with soft dust motes and a gentle cleaning tool',
  'the cleaning tool passes once across the surface, the dust motes lift away in its wake, and the cleared half settles bright'],
 [/geri d[oö]n[uü][sş][uü]m|\bat[iı]k|[cç]evre koru|do[gğ]ay[iı] koru|recycl/i,
  'one recycling loop table: a used object, a transform gate and a fresh object slot',
  'the used object passes once through the transform gate and emerges reshaped into the fresh slot, the loop arrow settling closed'],
 [/trafik|emniyet kemeri|yaya ge[cç]idi|g[uü]venli[gğ]imiz|kask/i,
  'one miniature street corner with a crossing band, a signal lamp and one small traveller token',
  'the signal lamp turns to safe, the traveller token crosses the band in one steady move, and the corner settles with the token safely across'],
 [/deprem|do[gğ]al afet|[cç]anta haz[iı]rla|tatbikat/i,
  'one calm preparedness table: a sturdy desk model and a small ready-bag beside it',
  'the small figure token moves once under the sturdy desk model as the room sway passes, then emerges and settles beside the ready-bag'],
 [/mevsim|sonbahar|ilkbahar|k[iı][sş] gel|yaz gel|takvim/i,
  'one season wheel with four textured quarter landscapes around a turning hub',
  'the wheel turns one quarter, the active landscape warming or cooling visibly as it arrives, and the hub settles on the named season'],
 [/s[uü]t di[sş]i|di[sş] eti|tooth/i,
  'one cutaway gum-line model with a loose milk tooth and a waiting new tooth below',
  'the milk tooth lifts once from the gum line as the new tooth rises slightly beneath it, and both layers settle readable'],
 [/[sş]ifre|parola|gizlilik|ki[sş]isel veri|izin iste/i,
  'one personal-data chest with a soft shield plate and a single key token',
  'the shield plate slides closed over the chest in one motion, the key token turns once, and the lock settles with a calm click'],
 [/okuryazarl[iı]k|internet|ekran s[uü]resi|tablet|dijital d[uü]nya/i,
  'one tabletop route map of glowing screen tiles with one safe-lane marker',
  'the marker travels the safe lane once, dims one risky tile as it passes, and parks on the trusted-source tile'],
 [/do[gğ]ru bilgi|yanl[iı][sş] bilgi|kaynak g[oö]ster|reklam m[iı] bilgi mi/i,
  'one sorting desk with mixed info cards and a verified-source seal press',
  'one card slides under the seal press, the press stamps once, and the verified card settles in the trusted tray']
];

export const WATER_STAGES: Bank =[
 [/nehir|dere|denize d[oö]n|akarak|toplan|river/i,
  'the carved river channel of the miniature landscape, fresh rainwater pooled at the hilltop',
  'the pooled water follows the carved river channel once down to the sea and merges, the loop closing visibly where it began'],
 [/ya[gğ]mur|d[uü][sş]er|a[gğ][iı]rla[sş]|ya[gğ][iı][sş]/i,
  'the heavy cloud of the miniature landscape hanging over the hill, three drops formed at its base',
  'the cloud releases its three drops in one clean fall onto the hill face, each landing mark darkening gently, and the cloud settles lighter'],
 [/yo[gğ]u[sş]|so[gğ]uyan|bulut olu[sş]|bulutlar[iı]/i,
  'the cool upper sky lane of the miniature landscape where thin vapour curls drift toward an empty cloud frame',
  'the drifting vapour curls cool and gather once into one small visible cloud, the cloud gaining soft weight and settling in place'],
 [/buharla[sş]|[iı]s[iı]t|g[uü]ne[sş]|y[uü]ksel/i,
  'the sea edge of the miniature water-cycle landscape, sunlit, one water bead resting on the surface',
  'warmed by the sun lamp, one water bead lifts from the sea as a single soft vapour curl and rises gently into the open sky lane, the surface settling calm beneath it'],
 [/d[oö]ng|yolculuk|bitmeyen|loop|cycle/i,
  'the whole miniature water-cycle landscape: sea edge, hill, river channel and open sky lane in one readable frame',
  'a single light pass travels the full loop once — sea to sky to cloud to hill to river to sea — and settles where it started, the cycle readable as one closed path']
];

export const EDU_FB: FB ={
 'Opening Hook':['one sealed capsule object that visibly contains the episode question','the capsule cracks open along one clean seam, light spilling from inside, and the revealed core settles as the question made physical'],
 'Rule Reveal':['one mechanism with a hidden rule chamber behind a sliding panel','the panel slides once, the rule mechanism turns a single cycle in plain view, and locks open so the rule stays readable'],
 'Proof Beat':['one before/after pair of the lesson object on a comparison rail','the rail carries the before form once through the change gate, it emerges as the after form, and both settle side by side as proof'],
 'Scale / Detail':['one detail of the lesson object grown to dominant scale on the table','a fine probe light traces the oversized detail once, its function moves a single time, and the detail settles sharp'],
 'Emotional Turn':['one small character-scale keepsake that carries the feeling of the idea','the keepsake tilts gently toward the light, its surface warms once, and it settles closer to the viewer'],
 'Brand / Client Role':['the client mark or signature object placed as a quiet anchor in the world','one light pass settles onto the anchor, confirming it without spectacle, and the frame holds with the mark stable and readable'],
 'Resolution / Signature':['the completed lesson object at rest, every earlier change now visible at once','the world light eases to a warm final state across the object, one last small element clicks home, and everything settles for the end card'],
 'Build / Proof':['one working model of the core idea with a single visible moving part','the moving part completes one honest cycle that demonstrates the idea, and the model settles with its result mark visible']
};

export const STY_BANK: Bank =[
 // --- Action / shonen / adventure narrative beats (anime + stylized content) ---
 [/sava[sş][cç][iı]|d[oö]v[uü][sş][cç][uü]|muharebe|warrior|battle|fighter|combat/i,
  'one original warrior figure in a decisive stance, the force they carry rendered as directed light and shadow geometry behind them',
  'the warrior completes one weighted movement that carves the space — shadow mass shifting as the stance locks, light finding the raised edge, and the frame settling on the held resolve'],
 [/macera|keşif|yolculuk.*kahraman|serüven|quest|adventure|voyage/i,
  'one original traveler at the threshold of a vast world, scale gap between figure and horizon dramatic and readable',
  'the horizon brightens one degree revealing the world depth, a single element of the journey (vessel, path, wind) confirms direction, and the figure settles poised for the first step'],
 [/kahraman|protagonist|ana karakter|hero.*moment|hero.*stand/i,
  'the original hero figure at the story axis, negative space above and environment behind confirming their scale in the world',
  'the hero takes one definitive action that reorganises the light around them — one shadow lifts, one accent locks on the figure edge, and the frame settles on their new position'],
 [/intikam|revenge|öfke.*derin|kin|vendetta|rage.*coil/i,
  'one original figure carrying visible interior weight — posture angled forward, shadow mass heavy on the dominant side',
  'the shadow mass lifts one degree off the figure face, revealing contained fury rather than releasing it, and the frame locks on the controlled menace of the held moment'],
 [/zafer|zafer an[iı]|triumph|victory.*moment|kazandı|win.*final/i,
  'the original hero figure elevated at the climax point, environment confirming scale, one strong rim pulling the silhouette clear of the world behind',
  'the rim light fires once and holds, the background settling one value lighter as the world opens up beneath the triumph, the figure raised element catching the peak and holding'],
 [/fedakarlık|feda|sacrifice|kurban.*kahraman|sacrifice.*self/i,
  'the original hero figure at the giving moment, one hand or element extended forward into the light while the rest of them remains in shadow',
  'the extended element meets the receiving point once, light flowing along the transfer line and settling on the point of sacrifice, the figure behind remaining half in dark as the cost made visible'],
 [/arkadaş|dostluk|yoldaş|bond|friendship.*strong|nakama|comrade/i,
  'two or three original figures reading as one unified shape, visual grammar binding them together — shared light edge, overlapping silhouettes',
  'the shared light brightens once across all figures simultaneously, their unified silhouette gaining one clean rim edge, and the bond settles as visual fact'],
 [/kader|alın yazısı|destiny|fate.*seal|yazgı|chosen/i,
  'the original figure beneath or before a vast symbol of inevitability — scale contrast extreme, the fate element larger than the human',
  'the fate element shifts one degree toward the figure, its shadow passing across them and revealing the face as they meet it, the frame settling on the accepted weight'],
 [/g[uü][cç]len|g[uü][cç] kazan|power.*surge|enerji patlamas[iı]|aura.*rise|power.*level/i,
  'the original figure at the center of a power expansion — energy geometry radiating outward from their core in controlled arcs',
  'the energy arcs extend one beat outward then pull tight to the figure edge, the ambient light dropping as the figure own light claims the frame, settling at full radiating power'],
 [/son.*kez|son.*d[oö]v[uü][sş]|last.*fight|final.*battle|veda.*kahraman/i,
  'the original warrior alone in a cleared space, past and cost visible as shadow geometry behind them, final light ahead',
  'the final light narrows once onto the warrior face, the shadow geometry behind them deepening and settling, and the frame holds on the weight of the last commitment'],
 [/d[uü][sş]man.*güçlü|rakip.*kuvvet|villain.*reveal|antagonist|karanlık.*güç/i,
  'the original antagonist occupying the dominant compositional mass, their power made spatial — light bending around them or withdrawn from their space',
  'one shadow arm of their presence extends one degree toward the frame edge, the ambient light retreating before it, and the frame settles on the scale of the threat'],
 // --- MAPPA-grade dark cinematic / urban atmospheric ---
 [/karanl[iı]k atmosfer|dark atmospheric|karanl[iı]k.*[sş]ehir|urban dark|gritty city|karanlık.*kentsel/i,
  'heavy atmospheric depth: one original figure in a gritty urban void, smoke-diffused backlight carving their silhouette from the dark mass behind',
  'the backlight bleeds one degree through the smoke layer, finding the figure edge and holding it, the surrounding urban texture settling into controlled deep shadow'],
 [/la[gğ]netli|curse|la[gğ]netli enerji|cursed space|lanetli.*alan|cursed domain|barrier.*space/i,
  'one original figure at the boundary of a cursed space — the domain pressing visible pressure against every surface, distorted geometry at the edges',
  'the cursed pressure pulses once outward from the center, one surface crack or shadow arm extending then locking, the boundary settling with visible weight at every edge'],
 [/duman|sis|smoke|haze|atmospheric haze|havada as[iı]l[iı]/i,
  'volumetric smoke or haze filling the mid-ground, one figure or object reading clean through it as the only sharp plane',
  'the haze drifts one slow layer pass across the mid-ground, the sharp plane holding fixed as the soft world moves behind it, settling with the subject fully isolated in focus'],
 [/hapishane|kafes|cage|s[iı]k[iı][sş][iı]k|enclosed.*tension|trapped|surrounded/i,
  'one original figure inside a compressed spatial frame — walls, bars, or crowd mass pressing the negative space tight around them',
  'the surrounding mass contracts one increment, tightening the negative space, the figure edge gaining rim light as the compression peaks and the frame locks on the held stand'],
 [/kan|sava[sş] sonras[iı]|yenilgi.*a[gğ]|aftermath|battle remnant|cost.*visible/i,
  'a quiet aftermath frame: one original figure surrounded by evidence of what was spent, the cost readable in the spatial geometry around them',
  'one remaining element of the cost catches the only warm light and holds it, the figure settling in the surrounded quiet, the full weight of the aftermath visible without exaggeration'],
 [/gözler|yüz bask[iı]|face pressure|intense face|karakter.*yüz.*gerilim|close.*face.*weight/i,
  'extreme close portrait: one original face under maximum emotional compression, the eye-line reading the interior weight without release',
  'the key light holds fixed on the face, one micro-expression arriving at the eye and locking — no movement beyond this single interior beat, the frame resting on the unspoken weight'],
 // --- Original STY_BANK entries ---
 [/k[iı]v[iı]lc[iı]m|makine [cç]al[iı][sş]|ilk [cç]al[iı][sş]|ate[sş]le|spark|ignit/i,
  'the dormant machine heart at frame center, one ready contact point catching the only warm light',
  'the contact closes once, a single spark line travels the visible circuit path and the core lamp blooms steady, shadows pulling back as the machine settles alive'],
 [/[sş]ehir [iı][sş][iı]k|gece [sş]ehir|silüet|siluet|skyline|şehrin [iı][sş][iı]klar/i,
  'one original figure silhouette on a high edge against a layered night city of warm and cold light planes',
  'one window plane of the city lights up in a slow wave that reaches the figure, the rim light catching the silhouette edge, and the figure settles facing the glow'],
 [/mucit|at[oö]lye|icat|laboratuvar|tezgah|inventor|workshop/i,
  'one original young inventor silhouette over a cluttered workbench, the unfinished machine as the bright focal mass',
  'the inventor turns the final crank once, the machine answers with a single contained pulse of light that climbs its frame, and the silhouette settles taller against the glow'],
 [/grafiti|graffiti|sprey|duvar boya/i,
  'a charged graffiti wall, one fresh color shape still wet, the painter silhouette stepping back',
  'the wet color shape runs one drip line that lands exactly on the design intent, halftone grain shimmering once across the wall, and the piece settles complete'],
 [/cesaret|korku|karar an|y[uü]zle[sş]|courage|brave/i,
  'one figure at a threshold of hard light and deep shadow, the next step physically visible as a lit edge',
  'the figure takes one weighted step across the light line, the shadow mass behind releasing its hold, and the stance settles planted in the lit half'],
 [/ko[sş]u|hareket|atlama|s[iı][cç]ra|parkur|takip|leap|run|chase/i,
  'one kinetic figure silhouette mid-stride along an elevated line, speed shapes frozen in the texture',
  'the figure completes one bounded leap along the established line, graphic motion shapes trailing then dissolving, and the landing settles solid on the far mark'],
 [/yenilgi|kaybet|d[uü][sş]me|k[iı]r[iı]lma|defeat|fall/i,
  'one figure low in a wide negative-space frame, a single warm ember of light surviving near them',
  'the surviving ember brightens once and lifts the nearest shadow edge, the figure raising their head into its glow, and the frame settles on quiet resolve'],
 [/d[oö]n[uü][sş][uü]m|g[uü][cç]len|seviye|ustala[sş]|transform|level/i,
  'one figure centered between their old tool/state on one side and the new on the other, value contrast splitting the frame',
  'the dividing light edge sweeps once across the figure from old side to new, the new side gaining full value weight, and the figure settles fully inside the new state'],
 [/ya[gğ]murlu|[iı]slak sokak|neon|gece sokak|rain street/i,
  'one rain-glossed street plane reflecting stacked neon shapes, a lone silhouette as the dark anchor',
  'one neon reflection band slides along the wet ground toward the silhouette and stops at their feet, rain texture shimmering once, and the street settles mirror-still'],
 [/d[uü][sş]man|kar[sş][iı]la[sş]ma|gerilim|pressure|standoff/i,
  'two opposing silhouettes across a charged negative space, one hard light edge dividing them',
  'the light edge between the figures narrows once as both lean a single degree forward, the pressure made visible, and the frame locks on the held tension'],
 [/umut|[sş]afak|g[uü]n do[gğ]|sabaha kar[sş][iı]|dawn|hope/i,
  'one weary skyline or figure edge with the first dawn band waiting low in frame',
  'the dawn band rises one slow degree, warm value flooding the lowest plane and climbing the silhouette edge, and the frame settles in first light'],
 [/mesaj|final s[oö]z|kapan[iı][sş]|imza|signature/i,
  'the story emblem of this film — an original mark or object earned by the narrative — under a single committed key light',
  'the key light tightens once onto the emblem, every other plane falling to clean dark value, and the emblem settles as the final word'],
 // --- Sci-fi / mecha / space ---
 [/robot|mecha|uzay|galaksi|siborg|mekanik kalp|yapay zeka|mekanik|biyonik|exo.?suit|cyborg|android/i,
  'one original mech or bio-mechanical figure at rest in an industrial void, scale gap between its mass and the human pilot established',
  'the mech completes one weighted mechanical activation — joints locking, power lines brightening in sequence — and settles in commanded posture with the pilot confirmed at the control point'],
 [/uzay yolculu[gğ]u|galaktik|uzay sava[sş]|yıldız|nebula|evren|orbital|planet|güne[sş] sistemi/i,
  'one original spacecraft or suited figure at the frontier of an impossible scale — a star field or gas cloud establishing depth behind',
  'the vessel or figure carries one committed arc into that depth, scale confirmed by one tiny course-correction detail, and the cosmos holds silent and vast on arrival'],
 [/siber|dijital d[uü]nya|hologram|matrix|sanal gerçek|kod ya[gğ]muru|data|arayüz/i,
  'one original figure inside a layered digital construct — data planes stacking at depth, the exit point a brighter node in the far field',
  'one data column collapses into the figure as information, the construct brightening a single plane around them, and the figure holds with new knowledge confirmed in their posture'],
 // --- Psychological horror / dread ---
 [/korku|dehşet|kabus|hayalet|canavar|karanlık v[aâ]rl[iı]k|gizem|gerilim|psikolojik/i,
  'one original figure at the center of a long corridor or open room, a single practical light behind them — what lies ahead deliberately unclear',
  'the light source behind dims one degree, shadow advancing from the unseen direction a single slow step, and the figure holds without retreat as the dread settles in the space between them'],
 [/sis|gizli tehdit|paranoya|kaybolma|labirent|terk edilmiş|ıssız bina|unutulmu[sş] yer/i,
  'a fog-filled or partially revealed environment, one detail sharp against soft white — the figure reduced to silhouette at mid-ground',
  'the fog drifts one slow rotation around the sharp detail, the figure silhouette holding position, and one sound-implication settles into the silence as the threat becomes spatial'],
 // --- Fantasy RPG / epic world-building ---
 [/ejderha|b[uü]y[uü]c[uü]|b[uü]y[uü]|fantezi|krall[iı]k|büyülü|sihir|büyü|elfler|cüceler|mitoloji/i,
  'one original mage or hero figure at the threshold of a world-scale event — magic geometry radiating outward from the central point as readable shaped light',
  'the magic geometry completes one expansion arc outward from the cast point, environment reacting with a single material-truth response, and the figure stands in the new world-state'],
 [/antik tapınak|harabe|hazine|keşif yolculu[gğ]u|macera haritası|gizli kap[iı]|portal/i,
  'one original explorer figure against an ancient structure at architectural scale, one source of light leaking from the threshold ahead',
  'the threshold light brightens one degree as the explorer approaches, stone geometry revealing itself in the growing illumination, and the explorer settles at the entry point with the ruin opened before them'],
 // --- Sports / rhythm / performance ---
 [/spor|turnuva|final mac[iı]|gol|say[iı]|kupa|şampiyon|müsabaka|skor/i,
  'one original athlete figure at the peak performance moment — the field or court in depth behind, one critical opponent or goal element in the facing direction',
  'the athlete completes one peak physical motion that decides the moment, environmental lighting confirming the achievement with a single widening of the key, and the figure holds in the result pose'],
 [/ritim|m[uü]zik|dans|performans sahne|konser|sahne[ye] [cç][iı]k|enstr[uü]man|melodi|m[uü]zisyen|sanat[cç][iı]|solist|grup|bant|rap|beat/i,
  'one original performer figure in a committed mid-performance pose, stage light narrowed to the performance space and the instrument or motion as the bright focal mass',
  'the performance peak arrives in a single sustained motion — the note, the move, the beat landing — stage light confirming the moment with one upward shift, and the figure holds in the held resolution'],
 // --- Cozy / pastoral / slice of life ---
 [/k[oö]y|[cç]iftlik|huzur|sakin|sessiz hayat|g[uü]nd[uü]z.*yaşam|kafa dinle|do[gğ]ada|bahçe/i,
  'one original figure in a small-scale domestic or natural environment, warm afternoon key, every surface suggesting comfort and seasonal rhythm',
  'one small habitual action completes — a door opened, a crop tended, a tea poured — the warmth of the light settling with the gesture, and the world returns to its patient quiet'],
 [/arkada[sş] toplulu[gğ]u|birarada|yemek masas[iı]|aile an[iı]|kar[sş][iı]la[sş]ma|veda|bulu[sş]ma/i,
  'two or more original figures sharing one warm domestic space, practical light motivated from the real room source, faces unposed and present',
  'one shared moment completes — a gesture passed, a laugh released, a look exchanged — the room light holding all figures equally, and the gathering settles in unhurried warmth'],
 // --- Comedy / absurd ---
 [/komedi|e[gğ]lence|gülme|abs[uü]rd|kari[cç]at[uü]r|[sş]aka|mizah|komik sahne|güldürü/i,
  'one original comic figure caught at the peak of an absurd situation — body language doing the punchline, environment slightly too large or wrong-scale for them',
  'the punchline beat lands — a single snap of physical consequence — and the figure holds in frozen comic surprise for exactly one beat before the world settles into the new wrong normal'],
 [/oyun boz|plan i[sş]e yaramad[iı]|gaf|talihsizlik|beklenmedik|sürpriz|ani d[oö]n[uü][sş]/i,
  'one original figure in the frame at the exact moment the plan goes wrong — one element visibly out of position, the consequence still arriving from the right',
  'the out-of-position element completes its wrong trajectory in one beat and lands, the figure\'s reaction arriving a half-beat after, and the frame holds on the settled chaos'],
 // --- Emotional / romantic / drama ---
 [/aşk|sevgi|romantik|özlem|duygusal yolculuk|anı|mektup|ayr[iı]l[iı]k|hasret|gel.*ayr[iı]l/i,
  'two original figures in a quiet emotionally charged space — the object or letter or place between them carrying more weight than the people',
  'the shared object passes once between them or one figure reaches and holds without the other responding, a single warm value confirming the human cost, and the frame settles on the space between'],
 [/yas|kay[iı]p|üzüntü|gözyaş[iı]|bo[sş]luk|anısına|hüzün|yalnızlık.*derin/i,
  'one original figure in a space that has been emptied — the absent element implied by the remaining one warm detail they left behind',
  'the warm remaining detail catches the only live light in the frame, the figure\'s response arriving once as a turn of the head or a lowering, and the grief settles into the held quiet of the space'],
 // --- Noir / detective / mystery ---
 [/dedektif|soruşturma|cinayet|su[cç]|sır|gizli|iz s[uü]r|ka[cç][iı][sş]|komplo|hile|çözüm/i,
  'one original investigator figure at the center of a spread of evidence — rain-light or practical lamp making each clue separately readable',
  'the investigator\'s hand lifts one clue into the motivated light, the piece fitting a confirmed connection, and the case geography settles one step closer to the answer'],
 // --- Historical / samurai / martial arts ---
 [/samuray|[sş][oö]valye|ortaça[gğ]|kılıç ustas[iı]|d[oö]v[uü][sş] sanat[iı]|duel|d[oö]v[uü][sş] alanı|antik sava[sş]/i,
  'one original warrior figure in a historical setting at the calm before a decisive exchange — the environment honest to its era, light raking the material truth of their gear',
  'one measured decisive exchange completes — strike, parry, or stance locked — environment answering with a single material consequence, and both figures settle in the held aftermath of the instant'],
 // --- Post-apocalyptic / survival / dystopia ---
 [/k[iı]yamet|y[iı]k[iı]nt[iı]|hayatta kalan|distopya|[cç][oö]km[uü][sş] d[uü]nya|virüs|salgın|terk edilmiş [sş]ehir|sava[sş] sonras[iı] d[uü]nya/i,
  'one original survivor figure in a long-ruined environment, one functional object or living detail confirming that life persists in the wreckage',
  'the surviving detail catches the only warm light in the cold ruin — a flame, a flower, a working radio — the figure turning toward it, and the frame settles on the fact of persistence'],
 // --- Ink / brushwork / graphic novel ---
 [/fırça darbe|m[uü]rekkep|çizgi roman|manga panel|karakalem|eskiz|tuval|hat sanat[iı]/i,
  'one original figure rendered as a brushstroke decision — negative white space completing the meaning, the most economical mark doing the full weight of the pose',
  'one final defining brushstroke arrives into the frame and locks — the image complete where before it was open — and the white space settles as intentional silence'],
 // --- Wonder / discovery / science ---
 [/ke[sş]if|merak|bilim|deney|bulu[sş]|mucize|hayret|ilk kez g[oö]rme|gizem[iı] [cç][oö]z/i,
  'one original discoverer figure at the exact moment of first contact with the unknown thing — scale relationship establishing its significance',
  'the unknown thing reveals itself one degree — one property becoming legible — the figure\'s response arriving as a forward lean or a held breath, and the frame settles on the suspended moment of understanding arriving']
];

export const STY_FB: FB ={
 'Opening Hook':['one charged silhouette or object mass against a high-contrast value field, the story question physically lit','the brightest value plane shifts once to reveal the subject edge, texture grain breathing a single time, and the reveal settles in held tension'],
 'Rule Reveal':['the mechanism of this world rendered as bold graphic shapes, its working core rim-lit','the core turns one visible cycle, its shadow shapes rotating across the frame in step, and the mechanism locks open and readable'],
 'Proof Beat':['a before-state and after-state staged as opposing value masses in one frame','the dividing light edge crosses once from before to after, the after mass gaining full weight, and both settle as visible proof'],
 'Emotional Turn':['one face or figure edge half-claimed by shadow, one warm value holding the human side','the warm value gains one degree against the shadow mass, the figure edge softening toward it, and the frame settles on the turn'],
 'Resolution / Signature':['the earned emblem of the story under one committed key','the key narrows once onto the emblem, the field dropping to clean dark, and the final mark holds'],
 'Build / Proof':['the core conflict of the source staged as two opposing graphic masses','one mass yields a single visible degree to the other along one light edge, and the new balance settles readable']
};

export const REAL_BANKS: Record<string, Bank> ={
 PRODUCT:[
  [/logo|marka i[sş]aret/i,'the hero product with its logo plane square to a controlled key light','one narrow highlight travels across the surface, arrives at the locked logo plane and fades, the logo never bending'],
  [/doku|y[uü]zey|aramid|karbon|deri|metal|kuma[sş]|texture|weave/i,'the product surface at 100mm macro, weave or grain depth fully resolved','one raking light band crosses the surface texture a single time, micro-relief casting honest shadow, and the surface settles matte and exact'],
  [/\beld[ea]\b|kullan[iı]m|kullan[iı]rken|takar|tak[iı]yor|tak[iı]l|giyer|giyiyor|giyin|in hand|grip|wear/i,'real hands and the product at the natural moment of use, skin texture honest','the hands complete one natural use gesture with the product, its geometry locked throughout, and the grip settles comfortable and believable'],
  [/kutu|a[cç][iı]l[iı][sş]|paket|unbox/i,'the sealed premium package on clean negative space, lid line crisp','the lid lifts once along its true hinge, interior light catching the product edge inside, and the open package settles square'],
  [/yans[iı]|refleks|par[iı]lt[iı]|reflect/i,'the product on a low-gloss plane, one controlled reflection of itself beneath','a single reflection band glides along the body line and stops, the mirrored image staying true to geometry, and both settle aligned']
 ],
 FOOD:[
  [/espresso|kahve ak|fincana|pour|dök[uü]l/i,'the cup at macro under warm key, the pour spout poised at frame top','the pour lands once in a steady ribbon, crema building in a slow spiral on the surface, and the cup settles full with the crema ring intact'],
  [/krema|k[oö]p[uü]k|crema|foam/i,'the fresh crema surface at extreme macro, amber rings still forming','the crema rings drift once into their final pattern, one tiny bubble winking out, and the surface settles velvet-still'],
  [/buhar|s[iı]cak|steam/i,'the hot dish or cup with one ready steam source, backlight set to catch it','a single steam curl rises through the backlight, bending once with the room air, and thins away as the dish settles inviting'],
  [/[cç]ekirdek|dane|d[oö]k[uü]l|bean/i,'roasted beans heaped at the frame edge, surface oils catching the key','a small run of beans tumbles once into the heap, each catching the light in turn, and the pile settles with one hero bean facing camera'],
  [/[iı]s[iı]r|dilim|kes|bite|slice/i,'the hero dish at the exact moment before the first cut or bite, structure visible','the knife or hands complete one clean cut, the interior structure revealing in honest layers, and the cut face settles glistening']
 ],
 CIVIC:[
  [/tebe[sş]ir|[cç]izgi [cç]iz|chalk/i,'a real child at sidewalk level drawing one chalk line, morning light raking the paving texture','the chalk line extends once under the small hand, dust lifting faintly in the light, and the line settles leading out of frame toward the city'],
  [/meydan|toplan|kalabal[iı]k|square|crowd/i,'a human-scale view into the real public square, citizens in natural mid-distance motion','pedestrians cross the square in soft parallax as one child detail in the foreground completes a small true action, and the square settles alive but calm'],
  [/[cç]ocuklar|oyun|park/i,'real children mid-play in an authentic public space, faces natural, light practical','one believable beat of play completes — a pass, a turn, a small victory — and the children settle in honest laughter, no posed smiles'],
  [/ba[sş]kan|y[oö]netici|konu[sş]ma/i,'a restrained human-scale frame of service in action, never a hero portrait','one act of ordinary service completes in believable rhythm, hands and place doing the talking, and the frame settles on the work, not the person'],
  [/bayrak|t[oö]ren|and|flag/i,'a respectful real-scale detail of the ceremony — fabric, hands, young faces in natural light','one ceremonial beat completes with documentary restraint, the flag fabric answering the wind a single time, and the moment settles dignified']
 ],
 EVENT:[
  [/foto[gğ]raf|an[iı]lar|eski|ar[sş]iv|photo|memory/i,'real hands over a table of true archive photographs, window light low and warm','one hand lifts a single photograph into the light, dust motes drifting once, and the photo settles facing camera as the past made present'],
  [/jenerasyon|ku[sş]ak|b[uü]y[uü]k anne|dede|torun|generation/i,'two generations in one honest frame, hands or profiles close, light shared','the older hand and the younger hand meet once over the shared object, the touch unhurried, and both settle in the same warm key'],
  [/logo|perde|a[cç][iı]l[iı][sş]|lansman|reveal/i,'the veiled mark or screen at the center of the real venue, audience presence felt at frame edges','the veil or screen transition completes once, the new mark arriving stable and true, and the room light settles on it holding'],
  [/pasta|mum|kutla|y[iı]ld[oö]n[uü]m|celebrat/i,'the real celebration centerpiece in honest practical light, hands of several ages near it','one celebration beat completes — a candle breath, a shared cut, a raised glass — in documentary rhythm, and the table settles in warm afterglow'],
  [/sahne|salon|davet|t[oö]ren salonu|stage/i,'the real venue at human scale, practical lights motivated, one detail of preparation in foreground','the final preparation gesture completes — a chair squared, a light warming — and the venue settles ready, breath held before the doors']
 ],
 TESTIMONIAL:[
  [/anlat|s[uü]re[cç]|ya[sş]ad[iı]|deneyim|hikaye/i,'the real person at conversational distance, eye-line just off camera, room honest behind them','the person breathes and leans a single degree into their sentence, one natural hand gesture landing with the thought, and they settle present and credible'],
  [/doktor|uzman|hem[sş]ire|dan[iı][sş]man/i,'the professional in their true working environment, tools of the work soft behind them','one small professional gesture completes — a chart turned, a calm nod — grounding the words in practice, and the frame settles on quiet competence'],
  [/g[uü]l[uü]mse|rahatla|iyile[sş]|umut|relief/i,'the person in the after-moment, posture visibly lighter, daylight doing the warmth','the genuine smile arrives once and is allowed to be small, shoulders easing a single degree, and the person settles in unforced relief'],
  [/dinle|kar[sş][iı]l[iı]kl[iı]|sohbet|listen/i,'two people in honest conversation geometry, the listener detail in focus','the listener responds once with eyes and a slight nod, the speaker continuing off-mic, and the exchange settles in believable rhythm']
 ],
 FASHION:[
  [/sil[uü]et|duru[sş]|poz|silhouette|pose/i,'the model as a sculpted silhouette against deep negative space, one editorial light edge defining the line','the model turns one deliberate degree, the light edge re-carving the silhouette as fabric weight follows late, and the stance settles in held authority'],
  [/kuma[sş]|triko|dokuma|iplik|textile|knit/i,'the textile at macro, weave structure and fiber halo resolved under sculpted side light','the side light slides once along the weave, each fiber ridge answering in turn, and the textile settles with its structure fully legible'],
  [/koleksiyon|defile|s[iı]ra|collection/i,'the collection staged as a disciplined editorial line-up, negative space doing the luxury','one garment plane catches the moving key in sequence down the line, a single fabric edge stirring, and the line-up settles in quiet command'],
  [/hareket|y[uü]r[uü]|sal[iı]n|walk|drape/i,'the garment mid-motion potential, hem weight visible, light committed to the drape','the model takes one measured step, the drape answering with a single honest swing and fall, and the garment settles back to its line']
 ],
 TOURISM:[
  [/balon|g[oö]ky[uü]z|[sş]afak|sunrise|balloon/i,'the real dawn sky of the place with its signature shapes rising, terrace or vantage detail anchoring human scale','the signature shapes lift one slow degree into the warming sky, the foreground place texture catching first light, and the vista settles in arrival calm'],
  [/kahvalt[iı]|teras|masa|breakfast/i,'the set terrace table in true morning light, place texture in every surface, the view soft beyond','one human beat completes at the table — a cup lifted, a chair drawn — as the view holds soft behind, and the morning settles unhurried'],
  [/ta[sş]|duvar|tarihi doku|sokak|stone|street/i,'the historic surface at touch distance, raking sun revealing its tool marks and age','the sun angle deepens one degree across the stone, shadow filling each carved mark in turn, and the wall settles ancient and warm'],
  [/g[uü]n bat[iı]m|vadi|manzara|sunset|valley/i,'the signature valley or skyline vista at golden hour, one human-scale figure or detail for honesty','the gold band slides once across the landform planes, the human detail turning toward it, and the vista settles at the held peak of the light'],
  [/havuz|deniz kenar|sahil|plaj|pool|beach/i,'the water edge of the place in clean afternoon light, surface texture honest, one human trace present','one gentle water movement crosses the surface a single time, light scattering true, and the edge settles in unforced invitation']
 ],
 AUTO:[
  [/s[uü]z[uü]l|yol|[sş]erit|tracking|glide|drive/i,'the vehicle on its line, lens-compressed road planes stacking behind, stance planted','the vehicle carries one smooth pass along the established line, road light bands sweeping the body in rhythm, and it settles into a planted hero hold'],
  [/yans[iı]|karoser|[iı][sş][iı]k ak|reflection/i,'the body line at low angle, one architectural light source ready to travel it','a single reflection band glides the full body line from nose to tail, every panel answering true to geometry, and the surface settles deep and still'],
  [/[sş]arj|elektrik|sabah|charge/i,'the vehicle at rest at its charge point in early light, cable line clean, environment real','the charge indicator completes one calm pulse as morning light climbs the glass, and the vehicle settles ready, quiet power implied not shouted'],
  [/far|head ?light|gece/i,'the front mass in near dark, headlight elements as the only waiting geometry','the light signature wakes once in its true sequence, throwing measured beams that find the road texture, and the face of the car settles lit and exact'],
  [/i[cç] mekan|kokpit|direksiyon|interior/i,'the driver environment in honest material close-up, controls dormant, one practical light source','one control surface wakes in its real sequence under a settling hand, materials answering the light truthfully, and the cabin holds ready']
 ],
 TECH:[
  [/ekran a[cç]|a[cç][iı]l[iı][sş]|boot|screen on/i,'the device on its clean working surface, screen dark, edge light defining exact geometry','the screen wakes once in its true boot rhythm, interface settling legible and screen-safe, and the device holds with its glass reflection controlled'],
  [/dokunu[sş]|[oö]l[cç][uü]m|kullan|touch|measure/i,'the professional hand and the device at the exact working distance, environment clinical and true','one precise touch completes the measurement gesture, the device answering with a single honest indicator, and hand and device settle in working calm'],
  [/sonu[cç]|veri|rapor|result|data/i,'the result view framed straight and screen-safe, the human reader implied at frame edge','the result resolves once on screen in clean legible form, reflection held off the glass, and the frame settles on the readable answer'],
  [/cihaz|steril|masa|device|table/i,'the device alone on the sterile surface, geometry exact, materials honest under clinical key','one clinical light pass crosses the device housing a single time, glass, metal and polymer each answering correctly, and the device settles precise']
 ],
 ARCH:[
  [/kap[iı]|giri[sş]|e[sş]ik|doorway|entrance/i,'the threshold line into the space, doorframe true, the room beyond in soft depth','the eye carries once through the threshold as window light reveals the room material by material, and the space settles in calm accurate depth'],
  [/pencere|[iı][sş][iı]k al|window/i,'the window plane and the light it admits, material finishes waiting in its path','the window light extends once across the floor and wall finishes, each material answering with its honest sheen, and the room settles inhabited by light'],
  [/havuz|teras|d[iı][sş] mekan|terrace/i,'the outdoor living plane in true daylight, edges and materials exact, landscape honest beyond','one daylight shift crosses the terrace surfaces a single time, water or stone answering, and the outdoor room settles in unforced luxury']
 ],
 SOCIAL:[
  [/h[iı]zl[iı]|trend|reels|dikey|vertical/i,'the vertical frame on the real subject at honest phone-camera distance, location texture authentic','one quick believable beat completes in natural handheld rhythm — gesture, look, result — and the frame settles legible for a thumb-stop hold'],
  [/mekan|d[uü]kkan|i[sş]letme|local|shop/i,'the real business interior at customer eye height, working details alive, light practical','one true working beat completes — a hand-off, a pour, a finish — in documentary phone rhythm, and the space settles welcoming and real']
 ],
 HEALTH:[
  [/bak[iı]m|hasta|tedavi|care/i,'a respectful human-scale care moment, hands and faces natural, institutional light honest','one act of genuine care completes in unhurried rhythm, dignity protected in the framing, and the moment settles in quiet trust'],
  [/sa[gğ]l[iı]k [cç]al[iı][sş]|ekip|personel|staff/i,'the care team in their real working geometry, one professional detail in focus','one coordinated working beat completes between team members, competence shown not told, and the frame settles on steady hands']
 ],
 HISTORY:[
  [/kalem|masa|saat|[cç]al[iı][sş]ma odas/i,'the desk of memory in respectful close detail: pen, paper, the clock face, archive light low and warm','the archive light settles once across the desk objects, the clock face holding its eternal minute, and the desk holds in national quiet'],
  [/dokuz[uı] be[sş] ge[cç]e|9.05|saat dur/i,'the clock face alone, hands at the remembered minute, every other detail in respectful dark','the light finds the clock face one final degree brighter, the hands unmoving at the remembered minute, and the frame holds in silence'],
  [/an[iı]t|y[uü]r[uü]|gen[cç] nesil|monument/i,'young citizens approaching the monument in real scale, morning light long across the stone','the young figures complete one measured stretch of the approach, their shadows joining the monument shadow, and the frame settles on the meeting of generations']
 ]
};

export const REAL_FB: FB ={
 PRODUCT:['the hero product itself, exact geometry locked, on disciplined negative space','one controlled light event crosses the product a single time, surface and logo answering true, and the hero settles in a clean edit-safe hold'],
 FOOD:['the hero dish or drink at appetite distance, texture forward, light warm and motivated','one sensory event completes a single time — pour, steam, cut or slide — and the surface settles glistening and exact'],
 CIVIC:['one real human-scale civic detail inside an authentic public space, light practical','one ordinary believable action completes in documentary rhythm, the public texture doing the production value, and the frame settles human and true'],
 EVENT:['one honest detail of the occasion — hands, object, place — in warm practical light','one ceremonial or shared beat completes unhurried, emotion earned not staged, and the moment settles in genuine warmth'],
 TESTIMONIAL:['the real person at conversational distance, environment honest, eye-line just off camera','one natural beat of speech completes with a true gesture, and the person settles credible and present'],
 FASHION:['the silhouette or textile as the single sculpted subject in editorial negative space','one deliberate movement or light pass re-carves the line a single time, and the frame settles in held luxury'],
 TOURISM:['the signature texture of the place at honest human scale, natural light committed','one light or human beat crosses the place a single time, desire built through truth, and the vista settles in arrival calm'],
 AUTO:['the vehicle with exact geometry on its true stage, reflections disciplined','one motion or light pass completes along the body line, every panel answering, and the stance settles planted'],
 TECH:['the device exact and dormant in its clinical environment','one precise wake or use event completes in true sequence, and the device settles legible and controlled'],
 ARCH:['the space at accurate perspective, one threshold or light plane as the subject','the light or the eye crosses the space a single time, materials answering honestly, and the room settles in calm depth'],
 SOCIAL:['the real subject in honest vertical phone framing, location texture true','one quick believable beat completes in natural handheld rhythm and the frame settles thumb-stop legible'],
 HEALTH:['a respectful human-scale care detail in honest institutional light','one genuine care beat completes with dignity protected, and the moment settles in quiet trust'],
 HISTORY:['one respectful object or human detail of national memory in archive light','one measured light or human beat completes in silence-grade restraint, and the frame holds in dignity']
};

export const CAM_EDU: string[] =['35mm child-eye push across the existing tabletop, foreground depth already in frame',
 '50mm slow lateral dolly inside the same set, one shelf edge passing as parallax',
 '85mm tactile macro creep onto the dominant object, background already soft',
 'static front-on lock where only the mechanism moves, keeping any text razor sharp',
 'gentle crane-down within the same set, settling at object height',
 'low side dolly along the existing cause-and-result line',
 'slow arc around the dominant object, staying on its established geometry',
 'inside-object vantage gliding along the active channel already in frame'];

export const CAM_STY: string[] =['locked low-pressure angle held inside the frame, negative space carrying the wait',
 'slow push along the dominant silhouette edge, value planes parallaxing behind',
 'one committed lateral slide across the graphic layers already in frame',
 'static wide hold where only light value and the single subject move',
 'measured rise from low vantage, the silhouette gaining scale against the bright plane',
 'tight creep onto the texture grain of the focal mass, edges already resolved',
 'slow arc that re-carves the silhouette against the contrasting value field'];

export const CAM_REAL: string[] =['35mm human-scale handheld micro-drift, movement already motivated by the action',
 '50mm slow dolly at eye height, one foreground edge passing as parallax',
 '85mm rack focus from foreground detail to the subject, both already in frame',
 '100mm macro slide along the surface, geometry and logo plane locked',
 'static locked tripod frame where only light and the single event move',
 'low tracking move along the established line, lens-compressed depth',
 'gentle push-in at the subject\u2019s true working distance, environment honest behind'];

export const DNA_MAP: Array<[RegExp, string, string]> =[
 // --- Specific DNA → cinematography translation (runs before generic patterns) ---
 // Anime/Shonen: translate anime visual language into real-lens decisions
 [/ribbon.*arc|arcing ribbon|elemental ribbon|ribbon flow/i,'camera','one sweeping diagonal arc move: enter from the force corner, resolve at subject in a single committed travel'],
 [/breath rhythm|rhythmic tension|tense breath|action.*breath/i,'motion','rhythmic tension escalation: motion builds through timed beats, explosive pressure at the peak, hard confident hold'],
 [/elemental force|elemental energy|elemental spirit|spiritual energy/i,'staging','force-line diagonal: energy line travels from frame corner to a single decisive focal point, everything else subordinate'],
 [/blade silhouette|sword arc|slash timing|negative.*space.*slash/i,'camera','low-angle motivated diagonal — action geometry drives the frame, one decisive line from corner to center'],
 [/spiritual pressure|dark ritual|cursed energy|rank shadow|shadow rise/i,'staging','power staging: subject in commanding position, negative space above charged with implicit weight'],
 [/purple.*shadow|purple.*hierarchy|spectral shadow|purple.*black/i,'light','desaturated low-key: deep shadow mass, single cold accent defining hierarchy from below'],
 [/arc.*of.*effort|spiral motion|dust trail|circular energy|warm.*determination/i,'motion','arc-of-effort motion: one rising trajectory peaks and lands — particle/dust confirmation on arrival only'],
 [/high.*contrast.*black|black.*orange|orange.*black|black.*white.*contrast/i,'light','extreme high-contrast: dominant shadow mass with single warm accent cut — no ambient fill, no grey zones'],
 // Portrait / intimate face: missing camera + staging + motion
 [/portrait|intimate.*face|dignified.*face|human.*clarity|face.*expression|human dignity/i,'camera','intimate focal compression: moderate telephoto equivalent, face fills the emotional center, one geometry-respecting reframe only'],
 [/portrait|dignified|prestige|national.*prestige|archive.*warm|respectful.*symbol/i,'staging','full-presence dignified composition: subject given the whole frame, surroundings confirm without competing'],
 [/portrait|face.*light|dignified.*hold|gentle.*face|intimate.*still/i,'motion','anchored stillness: subject holds position with one breath-scale micro-settle, no mechanical movement'],
 // Painterly / volume-lit: Arcane, Ghibli, stylized with real DNA
 [/painted.*volume|volume.*light|painterly.*cinematic|angular.*silhouette|fortiche/i,'camera','dramatic locked angle: low-to-mid architectural frame, one motivated push into the composition depth'],
 [/warm.*cold.*value|value.*war|colour.*tension|painted.*texture.*cinematic/i,'motion','weighted colour settle: motion ends with a material sense of gravity, warm/cold shift confirms the beat'],
 // Fashion / luxury / textile
 [/luxury.*pose|sculpted.*light|textile.*authority|vogue|couture|fashion.*editorial/i,'camera','fashion vantage: neutral or elevated angle, frame edges razor-clean, one axis of movement only'],
 [/luxury|fashion.*quality|textile|pose.*turn|couture|editorial.*hold/i,'motion','held presence: subject achieves position and holds — one deliberate micro-settle confirms arrival, nothing mechanical'],
 // Physical effort / athletic / commercial sports
 [/sweat|physical.*effort|athlete|hero.*silhouette|body.*performance|kinetic.*hero/i,'staging','performance axis: subject on the action line, effort legible in body form, environment confirms scale at distance'],
 [/sweat|physical.*effort|athlete|kinetic.*force|physical.*motivation/i,'motion','sustained effort arc: continuous committed motion through the peak, clean deceleration landing'],
 // Appetite / food macro
 [/appetite|viscosity|sensory.*macro|food.*beauty|pour.*moment|steam.*condense/i,'staging','appetite-close: subject at touching distance, one key sensory detail at the emotional center, background softened'],
 [/appetite|viscosity|pour.*moment|macro.*food|drip|condensation/i,'motion','sensory arrival: one slow deliberate approach to the appetite moment, settle at the peak of desire'],
 // Automotive / speed grammar
 [/speed.*grammar|low.*tracking|metal.*reflect|body.*line.*pass|road.*pass/i,'staging','ground-level stance: low camera line, subject form against open depth or road perspective, horizon confirms scale'],
 // Architecture / spatial / window light
 [/window.*light|spatial.*depth|threshold.*reveal|material.*calm|space.*depth/i,'camera','spatial reveal: one slow dolly through threshold or along the depth axis, camera arrives and holds'],
 [/spatial.*reveal|window.*light|threshold.*entry|architecture.*reveal/i,'motion','spatial drift: camera or light drifts through one threshold, lands and holds in the destination quality'],
 // System / hierarchy / clarity (Kurzgesagt-type)
 [/system|hierarchy|cause.*effect|explanatory|readable.*flow|information.*design/i,'staging','logical hierarchy: components spatially ranked by importance, reading line clear, negative space guides the eye'],
 // --- Standard cinematography entries ---
 [/kinetic|leap|fall|speed|chase|action|impact|rebellion/i,'camera','one bolder committed camera travel is allowed — never two moves'],
 [/handheld|documentary|observational|street/i,'camera','documentary handheld micro-drift at operator walking pace'],
 [/macro|surface|reflection choreography|edge light|precision/i,'camera','macro/close vantage favoured, geometry-respecting moves only'],
 [/symmetr|one-point|centered|editorial|negative space|staging|composition/i,'staging','strict composition — centered or negative-space led, frame edges intentional'],
 [/silhouette|value separation|contrast|shadow mass|chiaroscuro|noir/i,'light','hard value separation: one strong key, deep readable shadow shapes'],
 [/warm|amber|gold|lantern|sunlight|golden|marigold/i,'light','warm motivated key with a named source (window, lamp, low sun)'],
 [/neon|cyan|magenta|rain-?slick/i,'light','contained neon accents, one colour pairing, never spray glow'],
 [/reflection|reflective|refraction/i,'light','controlled reflection passes — every highlight motivated, disciplined and geometry-true'],
 [/rim|backlit|backlight/i,'light','single rim/backlight accent carving the dominant subject edge'],
 [/halftone|grain|painterly|brush|woodblock|texture|tactile|stop-motion|handmade|fabric|clay|ink/i,'texture','texture'],
 [/scale|colossal|monumental|vast|tiny figure|huge|dread/i,'staging','scale contrast: small subject against large world, honest perspective'],
 [/wind|nature|organic|leaves|grass/i,'motion','one organic environmental confirmation allowed, on the moving element only'],
 [/jazz|rhythm|timing|pacing|slow|restraint|restrained|stillness/i,'motion','restrained rhythm: event completes early, long confident hold'],
 [/adventure|journey|route|exploration|open-air/i,'staging','route-led staging: a visible path or direction line organises the frame'],
 [/emotion|warmth|family|memory|melanchol|quiet|dignity/i,'light','soft emotional fill, faces and key objects gently lifted from shadow'],
 [/comedy|absurd|pop|gag|playful/i,'motion','snap-and-hold comic timing: the event lands a beat early and the hold carries the joke'],
 [/noir|dread|one-point|formal|kubrick/i,'staging','one-point or formal frame: subject isolated inside architectural geometry'],
 [/impact|power aura|energy|burst|explosive|chakra/i,'light','one high-energy accent burst contained to the event beat, never ambient spray'],
 [/marigold|nostalg|keepsake|sentiment/i,'staging','keepsake-scale staging: small warm subject held against soft dark depth'],
 [/deco|geometric ornament|stepped|art deco/i,'staging','deco geometry: strong verticals, stepped shapes, ornamental symmetry'],
 [/ashen|gloom|gothic|somber|decay/i,'light','low-key weight: cold fill, deep blacks, a single warm survivor accent'],
 [/retro|limited animation|cut-?out|flat absurd|poster flat/i,'staging','flat graphic staging: poses read as cut-out shapes against minimal background'],
 [/cyber|glass|hologra|interface|refraction/i,'light','cool edge-light precision: controlled glass refraction, no neon spam'],
 [/showcase|airflow|engineered|machined|precision car|clean automotive/i,'camera','engineered product choreography: one machined-smooth move, zero handheld noise'],
 [/whimsy|bathhouse|organic ease|gentle wind/i,'motion','organic ease: motion breathes in and settles out, nothing mechanical'],
 [/anthology|experimental|bold formal/i,'staging','one bold formal experiment per frame, everything else disciplined'],
 [/rebellion|punk|red ui|defiant/i,'light','one rebellious accent colour owns the energy of the frame, all else neutral'],
 [/melody|lyrical|poetic|dreamlike/i,'motion','lyrical pacing: the event unfolds as one unbroken legato phrase'],
 [/sports|victory|arena|competition/i,'staging','arena staging: subject on a performance line, depth built from witnesses'],
 [/horror|tension|unease|lurking/i,'light','withheld light: the key arrives late, shadow holds information until the event'],
 [/mecha|industrial|machinery|hydraulic/i,'motion','industrial weight: mass leads, inertia visible, every stop earns a micro-settle'],
 // Available light / naturalistic / verite
 [/available.?light|practical.only.*source|candid.*low.*inter|available-light real/i,'camera','lock the camera to a fluid float that never fights the available light — each move justifies itself by following a light direction or revealing a motivated source'],
 [/available.?light|practical.only.*source|candid.*low.*inter/i,'light','practical-only sourcing: every exposure choice traces to a real light in the scene, zero supplemental fill, latitude carries the image'],
 [/imperfect.*truth|motivated grit|present.?tense.*observ|human truth.*grit|verite/i,'camera','verite witness: camera finds its position based on what the subject does, never anticipates, reframes only when forced, imprecision confirms presence'],
 // Authentic destination / travel
 [/authentic place|travel desire|destination.*desire|place-led/i,'camera','destination reveal: begin with a detail that could be anywhere, one slow back-reveal commits to the full place, hold the vista'],
 [/authentic place|travel desire|destination.*desire/i,'staging','human-scale place grammar: one person in scale relationship to landscape or architecture confirms the invitation'],
 // Analog / tungsten / film density
 [/tungsten|analog pressure|film density|analog grain|film stock/i,'light','tungsten-biased key: 2700-3200K source reads as warm incandescent, shadow edges soft from real diffusion, grain in the blacks acceptable'],
 // Beauty / skincare / soft-lit face
 [/soft skin|cream texture|skincare|beauty.*glow|skin.*glow|skin.*clarity/i,'light','beauty wrap: large-format diffused key at low angle to skin, surface texture is the proof, fill ratio high enough that no shadow reads as hard'],
 [/soft skin|cream texture|skincare|beauty.*glow/i,'camera','beauty proximity: close enough to read skin texture without distortion, shallow focus on the key sensory surface'],
 // Keynote / product stage reveal
 [/keynote stage|product reveal|stage.*reveal|black.*stage|stage.*emergence/i,'staging','stage-emergence: subject arrives out of total darkness into a precision pool of light, the void is the value message'],
 [/keynote stage|product reveal|minimal.*ev.*stage|minimal.*tech.*light|minimal.*stage/i,'camera','clean reveal move: one slow motivated approach as subject achieves its final lit position, no repositioning after arrival'],
 // Three-point / sculpted studio
 [/sculpted form|three.?point|subject.*separation|neutral premium control/i,'light','three-point control: key defines form, fill holds detail in the shadow, rim separates subject from field — ratios precise, no source competes'],
 // Night density / coloured practicals
 [/night density|colour from sources|layered depth.*night|neon.*street.*real/i,'light','coloured practical sourcing: each light in frame is a named real source, colours come only from those sources, overlapping pools build the depth'],
 // Even / overcast
 [/even credible light|overcast.*even|natural.*truth.*even|skin truth.*even|credible light/i,'light','overcast diffusion: sky acts as a single enormous source, all shadows directional-soft, no fill fight, colour temperature honest'],
 // Suspense geometry
 [/suspense grammar|information as camera|geometric shadows|ordinary objects charged|controlled reveal/i,'camera','suspense framing: what the camera shows IS the information — hold longer than comfortable, let the ordinary object fill the frame until it becomes threat'],
 [/suspense grammar|geometric shadows|ordinary.*charged.*threat/i,'staging','geometric threat staging: subject and object in precise spatial relationship, shadow geometry reinforces the menace, negative space holds tension'],
 // Dream-cut / fractured identity (Satoshi Kon)
 [/dream.?match|fractured identity|reality.*cut|memory.*edit|identity.*fracture/i,'motion','dream-cut rhythm: cuts arrive before the viewer expects, parallel realities overlap in a single held frame, identity revealed through the edit itself'],
 [/dream.?match|fractured identity|reality.*cut/i,'staging','fractured space staging: two states of the same environment in one frame, the seam between them is the subject'],
 // White city / clean graphic city (Mirror's Edge)
 [/white city|red.*motion|clean.*city|parkour.*geometric|white.*urban|runner.*city/i,'staging','graphic city staging: the running line is the architecture, white negative space confirms freedom, one red accent marks the route'],
 [/white city|red.*motion|clean.*city/i,'motion','route-line motion: camera follows the body line through the city, one continuous committed trajectory, zero hesitation'],
 // Simple icon / flat suspicion (Among Us)
 [/simple icon|flat suspicion|icon shapes|social deduction|crewmate|impostor/i,'staging','flat icon staging: simplified readable shapes in social arrangement, suspicion shown through proximity and negative space, no texture complexity'],
 // Cozy village / rounded calm (Animal Crossing)
 [/cozy village|cozy.*pastel|cozy.*pixel|rounded calm|village pastel|seasonal.*warm|cozy.*farm/i,'motion','organic ease: motion breathes in gently and settles with village-calm rhythm, zero mechanical urgency'],
 [/cozy village|cozy.*pastel|rounded calm/i,'light','warm ambient fill: soft diffused daylight or lantern warmth, no hard shadows, every surface invites touch'],
 // Fantasy zone palette / readable world (WoW-type)
 [/fantasy zone|zone palette|readable world|zone.*color|world.*zone|area.*palette/i,'staging','zone-palette staging: each region reads as a distinct color world, readability above realism, depth built from layered saturated zones'],
 [/fantasy zone|zone palette|readable world/i,'light','zone-signature light: each zone has its own motivating source (sun angle, magical ambience, underground glow), colour is geography']
];

export const SUNO_MAP: Record<string, string> ={
 ANIMATION_EDU:'Narration-safe instrumental education motif, 92-100 BPM light swing; felted celesta or marimba lead, pizzicato strings, one soft woodwind, gentle shaker (no kick clipping the VO). Space: small warm room. Arc: one curious intro phrase, build at the concept reveal, single small peak on the transformation, warm resolve on a held note.',
 STYLIZED_PREMIUM:'Cinematic stylized bed, 70-90 BPM route-dependent; analog synth pads, low drones, bowed cello or processed taiko reserved for value turns, ONE designed pressure swell for the main reveal. Space: wide painted hall. Arc: tension intro, value-shift build, single committed peak, dark warm resolve.',
 ULTRAREAL_COMMERCIAL:'Premium commercial bed, 80-92 BPM; felt piano or muted synth pulse, sub-bass foundation, restrained warm strings, one designed signature tone reserved for the product/brand beat. Space: clean modern room.',
 PRODUCT_HERO:'Minimal product bed, 80-90 BPM; muted felt-piano pulse over sub-bass, ONE signature synth tone reserved only for the reveal, wide clean room, single hit on the logo beat, sustained low-note resolve.',
 LIVE_ACTION_CORPORATE:'Civic documentary score, 78-86 BPM; soft felt piano pulse, warm low strings, brushed percussion, room air. Space: human-scale natural room. Restrained midpoint rise, warm civic resolve, zero trailer language.',
 HUMAN_TESTIMONIAL:'Intimate underscore, 70-80 BPM; solo felt piano or fingerstyle guitar, faint string pad entering only between sentences, generous silence. Space: close room. The voice IS the lead instrument — score never competes.',
 DOCUMENTARY_REALISM:'Observational minimal score, 72-84 BPM; sparse piano notes, low cello drone, field-recording room tone welcome. Long passages of near-silence are correct.',
 FASHION_EDITORIAL:'Editorial pulse, 95-110 BPM; deep minimal house or downtempo pulse, sub-bass, airy texture pad, one metallic accent on pose turns. Space: vast dark studio. Confidence through restraint, no EDM drop.',
 FOOD_MACRO:'Sensory warm bed, 76-88 BPM; brushed kit ghost notes, upright bass, warm Rhodes or nylon guitar, one soft chime on the appetite peak (pour/cut/steam). Space: morning kitchen.',
 ARCHITECTURE_REAL_ESTATE:'Spatial calm score, 70-80 BPM; sustained piano with long pedal, ambient room reverb, slow string swells aligned to threshold reveals. Space: the architecture itself.',
 TECH_MEDICAL_PRECISION:'Precision pulse, 84-96 BPM; clean synth pluck grid, soft sine sub, one glass-tone accent on the result beat, surgical mix headroom. Space: treated studio. Credible, never sci-fi fantasy.',
 SOCIAL_REELS_REALISM:'Thumb-stop bed, 96-112 BPM; punchy but VO-safe: muted plucks, tight sub, finger snaps or soft perc, hook lands inside the first 2 seconds, clean loopable resolve.',
 AUTOMOTIVE_MOBILITY:'Kinetic premium bed, 88-104 BPM; deep sub pulse, filtered analog arps following the body-line passes, one engine-adjacent (never literal) swell on the stance beat. Space: night road width.',
 TOURISM_DESTINATION:'Place-led warm score, 76-90 BPM; nylon guitar or duduk-adjacent lead used sparingly, warm strings, light hand percussion, golden-hour swell aligned to the vista beat. Authentic, never stock-travel.',
 HEALTH_PUBLIC_SERVICE:'Care-grade underscore, 68-78 BPM; soft piano, warm viola, breath-paced phrasing, zero drama spikes. Dignity in the mix: VO pocket always open.',
 // Anime world overrides — world-specific briefs take priority over production-path fallback
 mappa_cinematic:'Dark cinematic anime score, 60-82 BPM; low cello drone under sparse piano, processed taiko hits timed to beat impacts, electric bass pulse in the low end, JJK-era dissonant string swells for tension beats, one restrained orchestral swell at the climax — never trailer brass. Space: wide reverb hall with close room layer. Arc: oppressive quiet intro, building dread, single committed peak, unresolved dark hold.',
 bones_action:'Precision action score, 88-108 BPM; clean orchestral strings driving the main rhythm, warm brass accents on peak hits, light electronic pulse underneath, clear dynamic breathing between action bursts. Space: medium concert hall with controlled reverb. Arc: purposeful intro establishing stakes, rhythmic build through the middle, decisive peak on the choreography apex, earned warm resolve.',
 toei_adventure:'Grand adventure score, 90-112 BPM; bright brass fanfare as the lead voice, full strings, triumphant percussion, one big thematic hook that lands on the adventure promise beat. Space: wide open air — big room. Arc: horizon-opening intro, joyful build, full ensemble peak on the reveal of scale or found-family moment, optimistic warm resolve. Never ironic, never subdued.'
};

export const VAR_LIGHT: string[] =['',' Light variant: trade the key one stop softer and let the accent colour carry the subject edge.',' Light variant: motivate the key from the opposite side and let the shadow mass lead the composition.'];

