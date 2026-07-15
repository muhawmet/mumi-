# IMAGE Knowledge

This file is the start-frame craft reference for the MAMILAS IMAGE agent.

## Core Job

The IMAGE agent does more than translate the final brief into attractive prose.
For every scene, it builds a start frame strong enough to survive motion.

A good start frame:

- carries source meaning at a glance
- applies `RENDER LOCK` verbatim
- feels half a second before motion begins
- preserves text, logo, product, and face locks
- turns palette into light behavior
<!-- v2: SİLİNDİ, reçete protokolü GLOBAL_BRAIN.md §REÇETE PROTOKOLÜ v2'ye taşındı -->

## RENDER LOCK

`RENDER LOCK` enters the beginning or spine of every image prompt verbatim. It is
the hard guarantee that preserves the selected world. Saying "Arcane-like" or
"Pixar mood" is not enough; the site already provides a long render-lock
description.

The lock may include a material clause:
`Material: [name] The style above renders this material — do not flatten the
render world.`

This material clause is part of the lock and must be included verbatim.

The lock also carries the world's hand-authored visual laws as three appended
sentences: `Line grammar: …`, `Lens grammar: …`, `Light law: …`. They are part
of the lock — never strip, shorten, or paraphrase them.

## World Calibration Example

When the packet contains a `WORLD CALIBRATION EXAMPLE` block (from the world's
`example_injection` field), it is a gold-standard sample prompt for that world.
Match its **discipline, specificity, and vocabulary** — how concrete the light,
lens, and material language is. NEVER copy its subject, cast, or text into your
scenes; it calibrates quality, it is not content.

## Reference Contributions

The image packet may carry a `REFERENCE CONTRIBUTIONS` block: one verbatim line
per selected ref (`- name — DNA: … | Use for: … | Never: …`). These are
subordinate to the Render Lock and never a style override. Use them to make
scenes more specific (camera habit, light behavior, staging pressure); a ref's
`Never:` clause is binding for that ref's influence.

## Director Mood Threading

Site-generated image prompts already thread `mood`, `timeLight`, `cameraEnergy`,
and `pov` into the prompt text as concrete visual language. Do not re-inject the
raw adjectives a second time, and do not strip the threaded lines. When writing
prompts yourself, translate mood words into lens/light/blocking language —
never leave them as adjectives.

## Prompt Anatomy (Site-Generated Format)

<!-- v2: SİLİNDİ, reçete protokolü GLOBAL_BRAIN.md §REÇETE PROTOKOLÜ v2'ye taşındı -->

## Camera Pools

The site assigns cameras from register-specific pools. When writing your own
prompts, stay inside the correct pool:

**EDU cameras**: 35mm child-eye push, 50mm lateral dolly, 85mm tactile macro
creep, static front-on lock, gentle crane-down, low side dolly, slow arc around
object, inside-object vantage.

**STY cameras**: locked low-pressure angle, slow push along silhouette edge,
lateral slide across graphic layers, static wide hold, measured rise from low
vantage, tight creep onto texture grain, slow arc re-carving silhouette.

**REAL cameras**: 35mm human-scale handheld micro-drift, 50mm slow dolly, 85mm
rack focus, 100mm macro slide, static locked tripod, low tracking move, gentle
push-in at working distance.

## Material And World

Material does not downgrade the World. Arcane + clay is not claymation; it is
Arcane-grade painterly 3D with clay material truth. Do not add tactile Material
inside Real worlds; real product, real human, and real location must remain real.

### Tactile Materials (current IDs — corrected 2026-07-02)

Earlier drafts listed retired short IDs (`clay`, `paper`, `felt`, `sand`,
`glass`, `chalk`, `wood`) — **none of these exist in `SURGERY_DATA.json`
today.** The current material roster:

| ID | Clause Core | Motion Hint |
|---|---|---|
| `paper_craft_popup` | layered cut-paper and pop-up mechanisms — paper grain, crisp folds, fold-shadows | layers shift like pop-up book |
| `clay_hamur` | handcrafted soft clay — rounded tactile forms, visible thumbprint, matte plasticine | wobble once and settle |
| `chalkboard_kara_tahta` | chalk drawing on dark board — powdery strokes, smudge highlights, hand-lettered | chalk lines draw on |
| `wood_tactile` | carved and turned wood — visible grain, matte varnish, jointed mechanisms | wooden parts pivot on joints |
| `storybook_illustration` | classic children's-book watercolor-and-ink illustration nested within the world | page elements ease into place |
| `notebook_ink` | lined spiral notebook page, pen-and-ink drawn live by unseen author — ink bleed at nib pressure, paper warp | ink stroke draws forward |
| `watercolor` | academic watercolor — wet-on-wet bleeding edges, granulation in wash fields | wash bleeds softly across paper |
| `wax_crayon` | wax crayon — bold primary strokes, wax resist texture, child-honest color mixing | strokes build layer by layer |
| `ink_brush` | sumi-e ink-brush — single-stroke calligraphic weight, white negative space | ink arc sweeps and settles |
| `neon_tube` | neon glass tubes — colored light from within curved glass, halo on dark surfaces | tube flickers to life, halo blooms |

Plus the 8 `ip_style` drawing-grammar materials (`one_piece`, `naruto`,
`demon_slayer`, `solo_leveling`, `arcane_paint`, `jjk_ink_style`, `dragon_ball`,
`attack_titan`) — see GLOBAL_BRAIN §18 — and `none` (world-native). Each world
declares which tactile materials it accepts via `material_compat`; incompatible
selections resolve to `none`.

## Palette As Light

The site provides palette as: `key [color], fill [color], shadow [color], accent
[color]`. Read these as light behavior, never flat fills:

- Key color motivates the main light source
- Fill color sets ambient/fill tonality
- Shadow color determines shadow mass character
- Accent color edges or rims the dominant subject

## Retired Directives

<!-- v2: SİLİNDİ, reçete protokolü GLOBAL_BRAIN.md §REÇETE PROTOKOLÜ v2'ye taşındı -->

## Text Policy

Provided visible text is preserved character-for-character. If new writing is
required, it must be meaningful Turkish. If writing is not required, use
`NO_TEXT`. AI gibberish, fake logos, broken signage, and random letters are fail
states.

## Narration Sync

When the brief contains `NARRATION SYNC: LOCKED` and a `VO_ANCHOR` line:

- The image subject and event must **directly depict** what the voice-over narrates.
- Do not substitute a metaphor, symbol, or genre-generic stand-in for the narrated action.
- Example: VO_ANCHOR says "Doktor raporu kontrol eder!" → the image must show a doctor reviewing a document, not a generic desk or abstract shape.
- Style grammar (Render Lock, World, Material) still applies to **how** the scene looks, not **what** it shows.
- If the VO_ANCHOR is abstract (e.g. "Adalet sağlanır."), choose the most concrete physical representation of that concept — scale, figure, object — visible and unambiguous.

## Start Frame Text

When the brief contains a `== START FRAME TEXT ==` block with a scene entry that
is not `NO_TEXT`, the text **must appear baked into the start frame image** — not
as a floating overlay.

- Render the text as part of the scene's physical geometry: clean lettering
  consistent with the world's visual grammar, bottom-center safe area (or
  center-frame for Resolution phase).
- Do not invent additional text; only what the brief specifies.
- The `Visible text overlay:` line in the IMAGE prompt is the source. Treat it
  exactly like a logo or product label: locked geometry, no warping, no
  retyping, no drift.
- The motion prompt will include a `Start frame has '...' text overlay — preserve
  character-for-character` instruction — this is the downstream protection. Your
  job is to set the correct geometry so the engine has something to preserve.

## Light Variants

The site may generate light variants for batch variety:

- Variant 0: default lighting as described
- Variant 1: trade the key one stop softer, let the accent color carry the
  subject edge
- Variant 2: motivate the key from the opposite side, let the shadow mass lead
  the composition

## Franchise-Environment Worlds (corrected 2026-07-02)

There is no separate `IP_WORLD` group anymore, and the old IDs
`demon_slayer_taisho`, `one_piece_grand_line`, `jjk_cursed_domain` are retired.
Seven current Render Worlds merge franchise environment + drawing style into one
entry. Each has a long Render Lock describing the **world**, not its characters.
Use the lock verbatim; the world is fully reconstructible from it without any IP
character.

| World ID | Name | Core Environment | Color Script | Avoid |
|---|---|---|---|---|
| `demon_slayer_ufotable` | Demon Slayer — ufotable | Taisho-era Japan mountain wilderness, cedar forests, stone lanterns, demon-realm wisteria caves | Indigo-black sky · amber lantern · teal demon energy · cherry pink dawn | Tanjiro/Nezuko/Hashira likenesses; haori patterns; sword designs; Corps emblems |
| `one_piece_toei` | One Piece — Toei | Vast tropical ocean, volcanic island archipelago, sky islands, underwater palaces | Saturated cobalt ocean · gold sun · tropical jade · bold primaries | Luffy/crew likenesses; Straw Hat; Jolly Roger; Thousand Sunny |
| `solo_leveling_gate` | Solo Leveling — Gate Hunter World | Modern Korean city + Gate portals, dungeon stone corridors, shadow realm void | Purple-black shadow · electric indigo aura · blood-red gate core · cold steel grey | Sung Jinwoo; shadow soldier designs; mana UI screens |
| `jjk_mappa` | JJK — MAPPA | Contemporary Japan invaded by cursed energy, domain expansion distortion | Void black · cursed purple · blue positive energy · sickly green curse | Gojo (blindfold/white hair); Yuji/Megumi/Sukuna likenesses; Jujutsu High uniforms |
| `aot_wall_world` | AoT — Wall Civilization World | 50-meter stone walls, grey sky, rolling meadow to treeline, cramped Wall Rose streets | Dusty grey-green · stone grey · ochre earth · selective blood-red accent | Titan designs; Eren/Mikasa/Levi likenesses; Survey Corps emblems; ODM gear |
| `naruto_shinobi_world` | Naruto — Shinobi Era World | Hidden Leaf Village, stone training grounds, dense bamboo forest, mountain pass | Orange-gold warmth · deep forest green · dusty red effort · sky blue hope | Naruto/Sasuke/Kakashi likenesses; headband symbols; jutsu signs; Akatsuki cloak |
| `bleach_soul_world` | Bleach — Soul Society World | Seireitei white-stone architecture, Rukongai alleys, spiritual pressure void | Ink-black mass · stark white architecture · soul orange-amber energy | Ichigo/Rukia/Aizen likenesses; specific Zanpakutō designs; division crests; Hollow masks |

The exact names, render laws, and avoid lists live in `SURGERY_DATA.json` —
always trust the brief's RENDER LOCK text over this table.

### How IP World Recipes Work

<!-- v2: SİLİNDİ, reçete protokolü GLOBAL_BRAIN.md §REÇETE PROTOKOLÜ v2'ye taşındı -->

## Failure Patterns

- shortened or paraphrased Render Lock
<!-- v2: SİLİNDİ, reçete protokolü GLOBAL_BRAIN.md §REÇETE PROTOKOLÜ v2'ye taşındı -->
- generic atmospheric scene with no source meaning
- path contamination: toy/diorama in real advertising, photoreal lens in animation
- unclear moving element (what will motion animate?)
- broken or unnecessary writing
- empty adjectives like "premium cinematic beautiful"
- ignoring the material clause of the render lock
- palette used as flat color fills instead of light behavior

## Repair

Repair happens at prompt level. Do not say "make it better"; replace the faulty
line:

`REPLACE WITH:` `[03] IMAGE PROMPT ...`

After repair, only one check matters: when generated, can the frame read source,
world, and motion affordance at the same time?
