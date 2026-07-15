// AUTO-EXTRACTED verbatim from legacy mamilas.html concept/DNA/suno engine.
// Pure data literals — no state, no DOM. Do not hand-edit; regenerate from source.
/* eslint-disable */

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
 // KÖK (T5 FIX-1): `.*` cümle sınırını aşıp iki AYRI negasyonu ("never hard-black" … "no teal-orange")
 // pozitif high-contrast sinyaline birleştiriyordu. Bitişiklik iste — gerçek "black-orange" grade'i yakala.
 [/high[- ]?contrast black|black[- ]?orange|orange[- ]?black|black[- ]?white contrast/i,'light','extreme high-contrast: dominant shadow mass with single warm accent cut — no ambient fill, no grey zones'],
 // Portrait / intimate face: missing camera + staging + motion
 [/portrait|intimate.*face|dignified.*face|human.*clarity|face.*expression|human dignity/i,'camera','intimate focal compression: moderate telephoto equivalent, face fills the emotional center, one geometry-respecting reframe only'],
 [/portrait|dignified|prestige|national.*prestige|archive.*warm|respectful.*symbol/i,'staging','full-presence dignified composition: subject given the whole frame, surroundings confirm without competing'],
 [/portrait|\bface\b.*light|dignified.*hold|gentle.*\bface\b|intimate.*still/i,'motion','anchored stillness: subject holds position with one breath-scale micro-settle, no mechanical movement'],
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
 // KÖK (T5 FIX-5): `speed.*grammar` bir simetri-dünya reçetesinde kubrick "Super Speed" lens'ini
 // severance "severed-floor grammar"ına `.*` ile bağlıyıp saat/koridor makrosuna "road perspective"
 // enjekte ediyordu (off-register). Bitişik ifade iste — gerçek automotive speed-grammar'ı yakala.
 // FINAL (whole-branch): `metal.*reflect` de over-broad'du — `.*` cümle-boyu span'la
 // luxury_watch_macro / apple_object_worship (Product/Macro) DNA'sındaki "metal … reflection"
 // ifadesini eşliyıp siyah-zemin saat makrosuna "road perspective" enjekte ediyordu. Token
 // kaldırıldı ("metal reflection" jenerik, automotive-özel değil); entry gerçek speed grammar /
 // road pass / body line / low tracking ile automotive'i yakalamaya devam eder.
 [/speed grammar|low.*tracking|body.*line.*pass|road.*pass/i,'staging','ground-level stance: low camera line, subject form against open depth or road perspective, horizon confirms scale'],
 // Architecture / spatial / window light
 [/window.*light|spatial.*depth|threshold.*reveal|material.*calm|space.*depth/i,'camera','spatial reveal: one slow dolly through threshold or along the depth axis, camera arrives and holds'],
 [/spatial.*reveal|window.*light|threshold.*entry|architecture.*reveal/i,'motion','spatial drift: camera or light drifts through one threshold, lands and holds in the destination quality'],
 // System / hierarchy / clarity (Kurzgesagt-type)
 [/system|hierarchy|cause.*effect|explanatory|readable.*flow|information.*design/i,'camera','overhead or neutral mid-distance locked reveal: concept fully visible in a clean field, one deliberate expand-and-settle move'],
 [/system|hierarchy|cause.*effect|explanatory|readable.*flow|information.*design/i,'staging','logical hierarchy: components spatially ranked by importance, reading line clear, negative space guides the eye'],
 // --- Standard cinematography entries ---
 [/kinetic|leap|fall|speed|chase|action|impact|rebellion/i,'camera','one bolder committed camera travel is allowed — never two moves'],
 [/handheld|documentary|observational|street/i,'camera','documentary handheld micro-drift at operator walking pace'],
 // cinedna_handheld's unique token: without a motion-channel entry the ref is dead
 // weight in documentary combos whose camera slots are already full (KÖK 7d).
 [/real-place drift/i,'motion','unbroken observational take: the event breathes at real duration, operator sway legible, no cut-rhythm energy'],
 [/macro|surface|reflection choreography|edge light|precision/i,'camera','macro/close vantage favoured, geometry-respecting moves only'],
 [/symmetr|one-point|centered|editorial|negative space|staging|composition/i,'staging','strict composition — centered or negative-space led, frame edges intentional'],
 // KÖK (T5 FIX-1): çıplak `silhouette` biçim tokenidir (ışık değil) — "appeal-geometry silhouette"
 // (pixar dimensional-clarity) chiaroscuro ışık direktifini yanlış ateşliyordu. Işık-bağlamı iste.
 [/silhouette[^.;—]*(shadow|value|key light)|value separation|contrast|shadow mass|chiaroscuro|noir/i,'light','hard value separation: one strong key, deep readable shadow shapes'],
 [/warm|amber|gold|lantern|sunlight|golden|marigold/i,'light','warm motivated key with a named source (window, lamp, low sun)'],
 [/neon|cyan|magenta|rain-?slick/i,'light','contained neon accents, one colour pairing, never spray glow'],
 [/reflection|reflective|refraction/i,'light','controlled reflection passes — every highlight motivated, disciplined and geometry-true'],
 [/rim|backlit|backlight/i,'light','single rim/backlight accent carving the dominant subject edge'],
 [/halftone|grain|painterly|brush|woodblock|texture|tactile|stop-motion|handmade|fabric|clay|ink/i,'texture','texture'],
 // (?<!human-) — "human-scale" is the OPPOSITE of giant-scale staging and must not trip this entry.
 [/(?<!human-)\bscale\b|colossal|monumental|vast|tiny figure|huge|dread/i,'staging','scale contrast: small subject against large world, honest perspective'],
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
 [/white city|\bred\s+motion\b|clean.*city|parkour.*geometric|white.*urban|runner.*city/i,'staging','graphic city staging: the running line is the architecture, white negative space confirms freedom, one red accent marks the route'],
 [/white city|\bred\s+motion\b|clean.*city/i,'motion','route-line motion: camera follows the body line through the city, one continuous committed trajectory, zero hesitation'],
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

