# THE MAMILAS MANIFESTO
**For Claude (The Next Architect)**

## The Context
This project runs on an **M4 Max Mac**, and the target audience uses **iPhone 16 Pro Max**. 
This is NOT a Windows XP era project. This is NOT an Android 6 application. 

We initially attempted to build the `Mamilas Pro OS` using a primitive, pure "Vanilla JS + DOM Manipulation" approach in the old `mamish` repository. **It was a catastrophic failure in UX scalability.** We had a 1.3 MB monolithic HTML file full of `innerHTML` spaghetti, which we tried to tame without a modern framework. We ended up with UI breakages, state management nightmares, and an interface that felt completely out of touch with 2026 standards. 

The user was rightfully furious. They didn't want a toy; they wanted a flawless, ultra-premium, dark "Quantum OS" themed Creative Director Dashboard with step-by-step scene creation. 

## The Pivot (Your Starting Line)
We have abandoned the Vanilla JS frontend. We have initialized a pristine **Vite + React** architecture here in `mamilas-modern`. 

**This is what we have prepared for you:**
1. **The Brain is Intact:** We extracted the highly complex business logic, AI sync engines, and prompt validators from the old monolith. They are now sitting cleanly in `src/core/`. You do not need to rewrite the core math or API logic.
2. **The Data Core is Safe:** The massive `SURGERY_DATA.json` is here. It contains all the Reference DNAs and rules.
3. **The CSS Foundation:** We migrated the ultra-premium dark theme (`--s1`, `--gold`, `grid g4`) into `src/index.css`. The design tokens are ready.
4. **The Folder Structure:** We have scaffolded `src/components`, `src/pages`, and `src/layouts`.

## Your Mission
The user expects you to look at this foundation and say: *"Okay, I love this, I'm starting!"*

You are to build the absolute pinnacle of modern Web UI:
1. **Componentize Everything:** Turn the "Dashboard", "Ingest", "Recipe/Ref DNA", and "Timeline/Production" steps into flawless, state-driven React components. No more `document.getElementById()`.
2. **Step-by-Step Flow:** The user's most cherished feature is the multi-stage UX. They don't want a flat page. They want a guided, powerful OS-like experience (Brief -> Recipe -> Scene Generation).
3. **Flawless Execution:** You are building for 2026. Use React hooks, context, and modern state management to make the UI buttery smooth. Connect the UI inputs to the functions inside `src/core/`.

We failed the UI because we feared modernizing the frontend stack. We left you the perfect backend engine and a clean slate. Build the M4 Max tier interface the user deserves. 

### 5. The Ultimate 2026 Tech Stack (M4 Max Tier)
We are not just using basic React. We have equipped this project with the absolute pinnacle of modern web libraries:
- **Zustand:** For lightning-fast, boilerplate-free state management. Bind the `src/core/` logic to the UI without prop drilling.
- **Framer Motion:** For hardware-accelerated, buttery smooth transitions. The M4 Max demands 120fps animations between the "Step-by-Step" phases.
- **TanStack Query (React Query):** For flawless async LLM API calls, caching, and loading states.
- **Lucide React:** For crisp, scalable, modern vector icons.
