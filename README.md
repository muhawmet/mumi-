# MAMILAS Pro OS

Creative director dashboard for AI-assisted video + design production.
Brief → Recipe → Timeline, with deterministic batch generation and downstream-ready handoff packets: IMAGE / MOTION / SUNO for video, IMAGE-only for static design.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite 8** | Fast HMR, sub-second prod builds |
| UI | **React 19.2** | Latest hooks + Suspense |
| Types | **TypeScript 6** strict | `bundler` module resolution, zero `any` in app code |
| State | **Zustand 5** + persist middleware | Single store, `setField` generic, localStorage survival |
| Motion | **Framer Motion 12** | AnimatePresence step transitions, scene list stagger |
| Icons | **Lucide React** | Crisp variable icons |
| Fonts | **@fontsource-variable/{inter,jetbrains-mono}** | Self-hosted, woff2-split |

No mock data, no boilerplate scaffolding — every file does real work.

## Run

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # prod bundle in dist/
npm run lint
npx tsc --noEmit
```

## Architecture

```
src/
├── main.tsx                       # React root + font side-effect imports
├── App.tsx                        # AnimatePresence step switcher
├── index.css                      # Dark/gold Quantum OS tokens
├── vite-env.d.ts                  # Module shims (CSS, JSON, fontsource)
│
├── store/
│   └── useStudioStore.ts          # Zustand + persist · 13 fields · setField<K> generic
│
├── core/
│   ├── pure.ts                    # PURE batch generator (no DOM, no globals)
│   │                              # - generateBatch(input): contract gate → scenes
│   │                              # - createSceneArchitecture / buildImagePrompt
│   │                              # - buildVoiceOver / buildSunoBrief / buildHandoffPackets
│   │                              # - deriveProductionPath / validateBriefCompatibility
│   │                              # - groupedWorlds / groupedRefs helpers
│   └── SURGERY_DATA.json          # 24 worlds × 140 refs × 17 palettes (canonical)
│
├── data/
│   └── presets.ts                 # Phase 0 quick-start library (8 video + 7 design)
│
├── components/Layout/
│   ├── AppLayout.tsx              # Sidebar nav + step indicator
│   └── PanelKit.tsx               # Panel / Field / Button / input+select primitives
│
└── pages/
    ├── Dashboard/DashboardStep.tsx    # Phase 0 cards + brief form
    ├── Recipe/RecipeStep.tsx          # World cards (gradient previews) + ref/palette/recipe
    └── Timeline/TimelineStep.tsx      # BATCH ÜRET → scene list + detail + copy + export
```

## The flow

1. **Brief (Dashboard)** — pick a Phase 0 preset or hand-fill topic / class / scene count / cast (Aras / Defne / İkisi).
2. **Recipe** — pick a visual world (24 gradient cards), optionally pin a Reference DNA, tactile recipe override, and palette. World always wins; reference DNA is subordinate.
3. **Timeline** — `BATCH ÜRET` runs `generateBatch()`. Pure, deterministic. Each scene gets:
   - Architecture (source beat, intent, dominant subject, event, image vantage, semantic fingerprint)
   - Image prompt (world render + brief context + palette + cast + global negatives)
   - Voice-over draft
   - Suno music brief
   - Pacing (Intro / Build-up / Climax / Resolution + duration)
   - Video: **3 handoff packets** (IMAGE / MOTION / SUNO); static design: **IMAGE-only**
4. **Export** — full timeline JSON or just the handoff packets bundle.

## State persistence

Brief, recipe choices, generated scenes, and current step all survive page refresh (Zustand `persist`, localStorage key `mamilas-studio-v1`). Transient flags (`isGenerating`, `lastError`) are excluded from the persisted slice.

## What `pure.ts` is for

The legacy vanilla `app.ts` was 1629 lines of `document.getElementById` + `window.STATE` mutation. Every business decision was tangled with DOM. `pure.ts` is the rewrite: same logic, every function takes its inputs as arguments and returns its result. No DOM. No globals. Trivially testable. The React components are thin shells that read the store, call `generateBatch()`, write the result back.

## What's intentionally not here

- No mock service worker, no fake API layer — `pure.ts` produces real data from `SURGERY_DATA.json`.
- No design tokens hardcoded in JSX — colors come from `--bg / --s1 / --gold / --text-muted` etc. in `index.css`.
- No vanilla-era files. The legacy `app.ts`, `brain.ts`, `references.ts`, `ui-sugar.ts` etc. were deleted; pure logic worth keeping lives in `pure.ts`.

## Editor experience

- `npx tsc --noEmit` → 0 errors
- `npm run lint` → 0 errors
- `npm run build` → ~450 KB JS (~144 KB gzip), <200 ms

## History

This codebase was started by Antigravity from the wreckage of a 1.3 MB vanilla HTML monolith, then completed by Claude (this session) — pure core, themed layout, all three steps wired, Phase 0 library, handoff packets, persistence, motion polish.
