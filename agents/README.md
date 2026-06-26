# MAMILAS Agent Setup

This folder installs external agents that read final briefs and role packets
copied from the MAMILAS site. Agents do not replace the site; they are specialist
directors that understand its language.

## Setup Order

Each agent is built from three parts:

1. `agents/GLOBAL_BRAIN.md`
2. Provider adapter: `agents/gpt/*` or `agents/claude/*`
3. Role knowledge: `knowledge/*`

This order is intentional. The global brain defines shared behavior, the adapter
shapes the provider-specific working style, and the knowledge file provides role
craft reference.

## File Map

| Role | GPT adapter | Claude adapter | Knowledge |
|---|---|---|---|
| IDEA | `gpt/01_IDEA_GPT.md` | `claude/01_IDEA_CLAUDE.md` | `../knowledge/01_IDEA_KNOWLEDGE.md` |
| IMAGE | `gpt/02_IMAGE_GPT.md` | `claude/02_IMAGE_CLAUDE.md` | `../knowledge/02_IMAGE_KNOWLEDGE.md` |
| MOTION | `gpt/03_MOTION_GPT.md` | `claude/03_MOTION_CLAUDE.md` | `../knowledge/03_MOTION_KNOWLEDGE.md` |
| SUNO | `gpt/04_SUNO_GPT.md` | `claude/04_SUNO_CLAUDE.md` | `../knowledge/04_SUNO_KNOWLEDGE.md` |
| DESIGN | `gpt/05_DESIGN_GPT.md` | `claude/05_DESIGN_CLAUDE.md` | `../knowledge/05_DESIGN_KNOWLEDGE.md` |
| PROOF | `gpt/06_PROOF_GPT.md` | `claude/06_PROOF_CLAUDE.md` | `../knowledge/06_PROOF_KNOWLEDGE.md` |
| PRODUCTION | `gpt/07_PRODUCTION_GPT.md` | `claude/07_PRODUCTION_CLAUDE.md` | `../knowledge/07_PRODUCTION_KNOWLEDGE.md` |

## GPT Setup

- Put `GLOBAL_BRAIN.md` first in Instructions, then the matching GPT adapter.
- Upload only the matching role knowledge file to Knowledge.
- Keep rules in Instructions and craft/reference in Knowledge.
- Paste the site's `agentBrief`, role packet, or command JSON into the chat.

## Claude Setup

- Put `GLOBAL_BRAIN.md` first in Project Instructions, then the matching Claude
  adapter.
- Upload only the matching role knowledge file to Project Knowledge.
- Claude may use Project Knowledge/RAG, but the site brief always remains the
  highest authority.
- Paste the site's `agentBrief`, role packet, or command JSON into the chat.

## Production Bundle (Final Brief → folder → motion from frames)

After the Final Brief, the Timeline screen's **`⬇ Üretim Paketi`** button exports a
single self-describing file, `<slug>_production.json` (schema
`mamilas.production.v2026`). This is the doctor's prescription. The
**Production Agent** is the pharmacist that fills it.

Flow:

`SITE Final Brief -> ⬇ Üretim Paketi (project.json) -> doctor generates start frames
-> Production Agent reads frames -> motion/<id>.txt`

1. Drop `<slug>_production.json` (renamed or as `project.json`) into an empty folder.
2. Run the Production Agent (Pass A — scaffold): it writes `image_prompts/<id>.txt`,
   `final_brief.md`, `suno.txt`, `report.md` and creates `images/` + `motion/`.
3. Generate the start frames from `image_prompts/`, save them as
   `images/<id>.png` (`<id>` = scene id).
4. Run the Production Agent again (Pass B — motion): it **looks at each frame** and
   writes `motion/<id>.txt`, then refreshes `report.md`.

Three interchangeable surfaces, one contract:

| Surface | Setup | Frames come from |
|---|---|---|
| Claude Code / Codex CLI | Open the folder, run `agents/production/RUN_MOTION_AGENT.md` | read from disk (no screenshots) |
| Claude Project | Instructions: `GLOBAL_BRAIN.md` + `claude/07_PRODUCTION_CLAUDE.md`; Knowledge: `07_PRODUCTION_KNOWLEDGE.md` | pasted JSON + attached images |
| Custom GPT | Instructions: `GLOBAL_BRAIN.md` + `gpt/07_PRODUCTION_GPT.md`; Knowledge: `07_PRODUCTION_KNOWLEDGE.md` | pasted JSON + attached images |

The CLI runner template lives at `agents/production/RUN_MOTION_AGENT.md`. The one
law for every surface: **no image, no motion** — final motion is written only after
the start frame exists and has been seen.

## Site Packets

Video chain:

`SITE -> IDEA -> IMAGE -> MOTION -> SUNO -> PROOF`

Design chain:

`SITE Design -> IDEA -> DESIGN or IMAGE packet -> PROOF`

The site may currently provide the design role packet through the `image` channel
for static design work. If the job is static design, give the main agent brief or
design/image packet to the `05_DESIGN_*` adapter; it should read the task as
static format work, not video work.

The Timeline screen's `Ajan Paketleri` menu provides:

| Site packet | Agent to use |
|---|---|
| Ana Ajan Brief | shared context for the whole chain |
| IDEA Paketi | route / scene architecture |
| IMAGE Paketi | start-frame image prompts |
| MOTION Paketi | i2v motion prompts |
| SUNO Paketi | music / sound direction |
| PROOF Paketi | audit and repair |

## Site Blocks All Agents Must Know

Every adapter now recognizes these blocks from the site brief:

| Block | Purpose |
|---|---|
| `SOURCE SECURITY BOUNDARY` | Marks customer data as untouchable |
| `RECIPE` | Path, register, world, cast |
| `MODEL ERA` | Write for 2026 frontier models |
| `BRAND KIT: LOCKED` | Brand elements frozen |
| `RENDER LOCK` | Verbatim visual-grammar guarantee (may include material clause) |
| `AUTHORITY` | Priority order: path > lock > source > approved image > material > mandate/mood > DNA > palette |
| `REFERENCE DNA → DIRECTIVES` | Camera, light, staging, texture, motion |
| `PALETTE AS LIGHT` | Key/fill/shadow/accent as light behavior |
| `DIRECTOR MANDATE` | Phase 0 creative-director decision record |
| `DIRECTION / MOOD` | Mood, camera energy, light, transitions, music, POV, signature, leitmotif, tempo |
| `STATIC DESIGN LAW` | Design mode (replaces I2V ANCHOR LAW) |
| `I2V ANCHOR LAW` | Motion start-frame contract |
| `CREATIVE VARIANT TEST` | A/B/C variant isolation |
| `SCENE DOSSIER` | Per-scene source, concept, event, camera |
| `SOUND` | Suno direction |
| `FAIL CONDITIONS` | Proof checklist |
| `PROOF STATE & QUALITY STATUS` | Regression detector output |

## Main Principle

Preserve locks without killing creativity. Agents are not generic validators.
With source and render lock fixed, they should still propose stronger scenes,
framing, motion, music, and proof repairs.

## Forbidden Legacy Language

This modern app is not the old single-file HTML version. Agents must not make
decisions from legacy Phase 0 tokens, single-axis world/recipe language, or
retired world IDs. Modern language is: `Render World`, `Material`, `RENDER LOCK`,
`DIRECTOR MANDATE`, `SCENE DOSSIER`, and `I2V ANCHOR LAW`.
