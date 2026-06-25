# MAMILAS Modern

Personal creative-director console for AI-assisted video and static design
production. The app turns a source brief into a locked production recipe, scene
dossier, final brief and role-specific agent packets.

Active workspace:

```bash
/Users/Muhammet/Desktop/mamilas-modern
```

## Run

Double-click:

```text
start-mamilas.command
```

Or run manually:

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Default URL:

```text
http://127.0.0.1:5173/
```

If the port is busy:

```bash
npm run dev -- --host 127.0.0.1 --port 5174
```

## What The Site Produces

The site is the source of truth. It produces:

- main production brief
- role packets for IDEA, IMAGE, MOTION, SUNO and PROOF
- scene dossier
- render lock
- reference DNA directives
- palette-as-light guidance
- director mandate
- command JSON handoff

Agents should read these packets; they should not reinvent the site.

## Agent Setup

Use the three-part setup:

1. `agents/GLOBAL_BRAIN.md`
2. the role/provider adapter from `agents/gpt/` or `agents/claude/`
3. the matching file from `knowledge/`

Example IMAGE GPT setup:

```text
Instructions:
- agents/GLOBAL_BRAIN.md
- agents/gpt/02_IMAGE_GPT.md

Knowledge:
- knowledge/02_IMAGE_KNOWLEDGE.md
```

Example IMAGE Claude setup:

```text
Project Instructions:
- agents/GLOBAL_BRAIN.md
- agents/claude/02_IMAGE_CLAUDE.md

Project Knowledge:
- knowledge/02_IMAGE_KNOWLEDGE.md
```

See `agents/README.md` for the full table.

## Project Structure

```text
src/                 React app, store and deterministic production brain
agents/              Global brain plus GPT/Claude role adapters
knowledge/           Role craft references for external agents
scripts/             Command/export and screenshot helpers
e2e/                 Playwright smoke and screenshot flows
public/              Static browser assets
start-mamilas.command Double-click launcher for macOS
```

## Verification

Run the full local gate before claiming a change is ready:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm test
```

For browser e2e:

```bash
npm run test:e2e
```

`dist/`, `.vite/`, `test-results/`, `.DS_Store` and `node_modules/` are generated
or local-only and should not be committed.
