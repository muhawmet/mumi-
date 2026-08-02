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

<!-- bag-yok: silinmiş eski yapı bilerek anılıyor, okuyan neyin kalktığını bilsin -->
The three-part `GLOBAL_BRAIN` + `agents/gpt/` + `knowledge/` layout described here until
2026-08-02 no longer exists; those paths were removed and the README was never updated.
The current contract is two files plus a thin provider adapter:

1. `agents/PROTOCOL.md` — the only agent decision law, content-hashed into every command
2. `agents/PROMPT-YASASI.md` — the production and prompt law (start-frame / motion / reference)
3. the provider adapter: `agents/adapters/claude.md` or `agents/adapters/codex.md` — provider I/O only

Entry contracts: `CLAUDE.md` (Claude) and `AGENTS.md` (Codex). Both import the active phase
profile `docs/ai/faz-icraat.md`. Per-directory laws live in `.claude/rules/` and load on touch.

See `agents/README.md` for the role table.

## Project Structure

```text
src/                 React app, store and deterministic production brain
agents/              PROTOCOL + PROMPT-YASASI, roles, adapters, COMMAND-INBOX deliveries
docs/ai/             Phase profiles, system map, model routing, work list
scripts/             Measurement and delivery tooling (prompt-lint, baglar, kaba-kurgu, …)
.claude/             Hooks, skills, path-scoped rules, settings
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
