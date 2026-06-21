# MAMILAS PRO OS - THE ULTIMATE BLUEPRINT (2026 EDITION)

## Mission Statement
The target is a flawless, ultra-premium "Quantum OS" themed Creative Director Dashboard running on an M4 Max architecture and scaled for iPhone 16 Pro Max screens. This is a complete paradigm shift from the old "Vanilla JS spaghetti" to an enterprise-grade React application.

## The Architecture Stack
1. **Frontend:** Vite + React + TypeScript (optional, but typed data is recommended).
2. **State Management:** Zustand (replacing the global `window.STATE`).
3. **Animations:** Framer Motion (buttery smooth 120fps transitions for the multi-step flow).
4. **Data Sync:** TanStack Query (React Query) for handling async LLM generation requests.
5. **CSS:** Modern Vanilla CSS using Grid/Flexbox and CSS Variables (`src/index.css`), keeping maximum design control.

## The State Store (Zustand)
Create `src/store/useStudioStore.js`:
```javascript
import { create } from "zustand"

export const useStudioStore = create((set) => ({
  // Stage 1: Brief
  projectTopic: "Su Döngüsü",
  projectClass: "EĞİTİM_01",
  sceneCount: 5,
  cast: "İkisi",
  
  // Stage 2: Recipe
  selectedWorldId: "pixar_dimensional",
  selectedProp: "native_world",
  selectedRefId: "ref_001",
  
  // Stage 3: Production
  scenes: [],
  isGenerating: false,

  // Actions
  setField: (field, value) => set({ [field]: value }),
  setScenes: (scenes) => set({ scenes })
}))
```

## The Step-by-Step UI Component Tree
- `App.jsx` (Holds the Layout)
  - `Sidebar.jsx` (Navigation Menu: Brief -> Recipe -> Timeline)
  - `MainContent.jsx` (Framer Motion `AnimatePresence` wrapper)
    - `DashboardStep.jsx` (Inputs for Topic, Class, Cast, Scene Count)
    - `RecipeStep.jsx` (Selectors for World, Prop, Reference DNA)
    - `TimelineStep.jsx` (Generates and displays the `scenes` array)

## Connecting to the Core API
The React components must NEVER mutate the DOM directly. Instead, they call the pure functions preserved in `src/core/app.js` and `src/core/brief-generator.js`.

**Example Integration in TimelineStep.jsx:**
```javascript
import { createSceneArchitecture, buildImagePrompt, buildVoiceOver } from "../core/app.js";
import { useStudioStore } from "../store/useStudioStore.js";

// When "Generate" is clicked:
const generateScenes = async () => {
    const { projectTopic, sceneCount, selectedWorldId } = useStudioStore.getState();
    const newScenes = [];
    
    for(let i=1; i<=sceneCount; i++) {
       const arch = createSceneArchitecture(projectTopic, i, selectedWorldId);
       const prompt = buildImagePrompt(projectTopic, i, sceneCount, arch, ...);
       const vo = buildVoiceOver(i, projectTopic);
       newScenes.push({ id: i, architecture: arch, prompt, vo });
    }
    
    useStudioStore.getState().setScenes(newScenes);
}
```

## Final Directives for Claude
1. Read this blueprint carefully.
2. Initialize the components in `src/components` and pages in `src/pages`.
3. Wire the Zustand store.
4. Hook the UI to the pure functions in `src/core/`.
5. Apply Framer Motion to make the step transitions incredibly smooth.

## Data Schema Details (from SURGERY_DATA.json)
The JSON file contains a single root object with the following top-level keys:
1. `paths`: Production paths (id, name, icon, group, desc, required, forbidden, gate).
2. `projects`: Project presets (id, name, tag, icon, category, path, world, ref, palette, desc, tone, chars, tip).
3. `worlds`: Visual worlds (id, group, name, formula, render, motion, best, avoid, colors).
4. `refs`: Reference visual DNAs (id, name, cat, use, avoid, dna, preview, anchor).
5. `palettes`: Color palettes (id, name, colors, c0, c1, c2, c3, use, avoid).
6. `agents`: System agents (id, name, icon, role, summary).
7. `golden`: Golden prompt benchmarks (id, name, agent, path, score, bad, why_bad, gold, qa).
8. `regression`: Regression test cases.

Use these keys to map options into the Select/Dropdown React components (e.g., `<select>` mapping over `SURGERY_DATA.worlds`).

## CRITICAL HANDOFF NOTE FOR CLAUDE
Due to context length limits, the final step of converting `src/core/app.ts`, `src/core/audio-engine.ts`, and `src/core/brief-generator.ts` into PURE functions (removing `document.getElementById` and `window.STATE` references) was aborted mid-flight. 
**YOUR FIRST TASK IN THE NEW CONVERSATION:** Go into `src/core/` and refactor those files so they only take arguments (from Zustand) and return pure data. Do NOT let them touch the DOM. Once done, build out the React UI step-by-step.
