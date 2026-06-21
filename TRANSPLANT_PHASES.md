# TRANSPLANT MASTER PLAN: Old UI -> New Modular Architecture

## Objective
Surgically graft the "QUANTUM RELEASE UI HARD POLISH" (from `SURGERY_CSS.md`) and the rich taxonomies (from `SURGERY_DATA.json`) into the new modular codebase (`public/index.html`, `public/style.css`, and `data/worlds.json`) while maintaining 100% compatibility with the existing queue system and automated tests.

## Phase 1: CSS Variable & Foundation Grafting
**Goal:** Establish the root design tokens without breaking current glassmorphism structural integrity.
- **Action:** Inject the dense dark-theme color palette (`--bg`, `--s1` to `--s4`, `--gold`, `--green`, `--red`) from `SURGERY_CSS.md` into `:root` in `public/style.css`.
- **Action:** Retain existing variables that the queue system relies on, mapping the aesthetic tokens (e.g., `--accent-primary` -> `--gold`).
- **Action:** Import `--mono` (JetBrains Mono) and `--sans` (Inter) typography definitions.

## Phase 2: HTML Skeleton Realignment (2-Column to 3-Column)
**Goal:** Transition the current `studio-layout` (Sidebar + Main) into the legacy 3-column desktop layout (`.side`, `.main`, `.right`) while keeping ID hooks intact.
- **Action:** Restructure `public/index.html` to wrap the UI in the `<div class="app">` container.
- **Action:** Map the existing `<aside id="studio-sidebar">` to the `.side` (Left) column.
- **Action:** Extract the `studio-timeline` and place it in the `.main` (Center) column as the primary fluid content area.
- **Action:** Extract the `.preview-player-area` (Scene Details/Prompts) and place it in the `.right` (Right) column, matching the old UI's tool/property panel layout.
- **Safety Check:** Ensure ALL interactive IDs (`#btn-batch-generate`, `#project-topic`, `#table-body`, `#detail-*`) remain untouched so `app.js` and `bundle.js` do not lose their DOM references.

## Phase 3: Component & Typography Porting
**Goal:** Apply the legacy "QUANTUM RELEASE" styling to the new DOM elements.
- **Action:** Port `.card`, `.box`, and `.card.sel` logic from `SURGERY_CSS.md`. Apply these classes to the timeline rows and detail containers.
- **Action:** Replace the current gradient buttons with the legacy `.btn.primary` (vertical gold gradient) and `.btn.ghost`. Update `#btn-batch-generate`.
- **Action:** Integrate `.eyebrow`, `.title`, and `.qScore` typography classes into the Scene Preview area (`#detail-title`, prompt labels).
- **Action:** Bring over the `.refCardPreview` utility classes for visual world dropdowns and selectors.

## Phase 4: Data Taxonomy Merging
**Goal:** Upgrade the simplistic `data/worlds.json` with the comprehensive hierarchies from `SURGERY_DATA.json`.
- **Action:** Map `SURGERY_DATA.json`'s rich `worlds` array into the new `data/worlds.json` structure.
- **Action:** Introduce the `paths` and `projects` hierarchies. Ensure dropdowns like `#cascade-world` and `#cascade-reference` are populated using this richer taxonomy.
- **Action:** Cross-reference `id` fields to ensure the queue system backend receives the exact string values it expects for model inference.

## Phase 5: Mobile Responsiveness Verification
**Goal:** Re-implement the sliding drawer mobile layout.
- **Action:** Translate the current `@media(max-width: 900px)` logic to match the old `@media(max-width: 768px)` rules.
- **Action:** Ensure `.side` hides, `.main` takes over, and `.right` becomes the fixed bottom drawer (`transform: translateY(110%)`).
- **Action:** Verify `#mobile-nav-toggle` correctly toggles the `.open` state on the drawer.

## Phase 6: QA & Queue System Stress Testing
**Goal:** Validate that the transplant did not reject the organs.
- **Action:** Run `node fix_tests.js` to verify all DOM hooks are still accessible.
- **Action:** Run `node stress_puppeteer.js` and `node stress_api.js` to ensure the queue system still generates, tracks, and completes scenes properly without UI-induced errors.
