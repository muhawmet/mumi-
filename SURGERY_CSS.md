# MAMILAS CSS Architecture Report

## 1. Core Design Tokens (CSS Variables)
The application uses a dense, dark-themed color palette with "gold" as the primary accent color. Variables are defined in the `:root` scope and refined in a "QUANTUM RELEASE UI HARD POLISH" block.

**Backgrounds & Surfaces:**
- `--bg`: `#030407` (Deepest dark for body background)
- `--s1`: `#080a0f` (Layer 1 surfaces like sidebars)
- `--s2`: `#0d1018` (Layer 2 surfaces like cards on hover)
- `--s3`: `#151927` (Layer 3 interactive elements)
- `--s4`: `#202637` (Layer 4 hover states)

**Borders & Dividers:**
- `--line`: `#ffffff10`
- `--line2`: `#ffffff1c`
- `--line3`: `#ffffff34`

**Accents & Semantics:**
- `--gold`: `#f7c948` (Primary brand/accent color, glowing effects)
- `--gold2`: `#d99a2b`
- `--goldsoft`: `#f7c94814` (Soft highlighted backgrounds)
- `--green`: `#4df5a0` (Success / Locked states)
- `--red`: `#f54d6b`, `--cinema-red`: `#9f1d2f` (Danger / Errors)
- `--blue`: `#5b9fff`, `--purple`: `#a87dff`

**Typography:**
- `--mono`: `'JetBrains Mono', 'SF Mono', monospace` (Used for data, labels, code, UI metrics)
- `--sans`: `-apple-system, 'Inter', sans-serif` (Used for reading text, descriptions)

**Effects:**
- `--glass`: `rgba(255,255,255,.045)`
- `--glass2`: `rgba(255,255,255,.075)`
- `--r8`, `--r10`, `--r12`, `--r16`: Standardized border radii.

## 2. Global HTML Skeleton & Layout

The app employs a 3-column desktop layout that elegantly collapses into a mobile-friendly view.

**Desktop Skeleton (`.app`)**
- Uses CSS Grid (`display: grid; grid-template-columns: 238px minmax(0,1fr) 342px`).
- **`.side` (Left):** 238px sticky sidebar for navigation (`.nav`, `.logo`).
- **`.main` (Center):** Fluid central content area with a max-width inner wrapper (`.inner`).
- **`.right` (Right):** 342px sticky sidebar for tools, properties, or previews.

**Mobile Skeleton (`@media(max-width: 768px)`)**
- The `.app` becomes a flex column.
- Left `.side` is hidden (`display: none`).
- Right `.right` panel turns into a sliding drawer anchored to the bottom (`position: fixed; bottom: 60px; transform: translateY(110%)`), toggled via `.open`.
- Introduces `.mob-bar` (sticky top header) and `.mob-nav` (fixed bottom navigation).

## 3. Major UI Components & Classes

**Cards & Containers (`.card`, `.box`)**
- **Base Style:** Blurred glassmorphism background (`linear-gradient` with `backdrop-filter: blur(10px)`), 1px border (`var(--line2)`), and heavy drop shadows (`0 18px 70px rgba(0,0,0,.24)`).
- **Hover State:** Elevates with a glowing border (`var(--line3)`), brighter background (`var(--s2)`), and Y-axis transform.
- **Selected State (`.card.sel`):** Dominates visually with a bright gold border, heavy glowing box-shadow (`0 0 42px rgba(245,200,66,.10)`), and a gold-tinted gradient. Non-selected cards dim to `opacity: 0.4` when one is selected in a grid.

**Buttons (`.btn`)**
- **`.btn` (Base):** Subtle dark background (`--s3`), standardized font, minimal borders.
- **`.btn.primary`:** Vibrant vertical gold gradient (`#ffe27a` to `#c98c23`), dark text, heavy gold drop shadow.
- **`.btn.ghost`:** Transparent background, reveals a gold border on hover.
- Focus states universally add a gold ring outline (`box-shadow: 0 0 0 3px rgba(245,200,66,.10)`).

**Form Controls (`input`, `textarea`, `select`)**
- Unifying dark surface (`--s2`), muted text, smooth focus rings utilizing the gold accent.

**Previews & Visualizers (`.preview`)**
- Extremely rich structural elements mimicking physical screens or viewports.
- Combines multiple radial and linear gradients for a "studio lighting" and volumetric effect.
- Pseudo-elements (`::before`, `::after`) are used to overlay halftone (`.halftone`) and grain (`.grain`) textures, enhancing realism entirely in CSS.

**Typography Classes (`.eyebrow`, `.title`, `.qScore`)**
- **`.eyebrow`:** Small, tracked-out monospace text in gold with an inline glowing green dot indicator, used as section micro-headers.
- **`.title`:** Massive text, tightly tracked (`letter-spacing: -1.3px`), heavily shadowed.
- **`.qScore`:** Giant monospace numerals (64px) for scores, deeply glowing in gold.

**Reference Vault Previews (`.refCardPreview`)**
- A sprawling utility class system that uses CSS gradients to visually represent dozens of distinct visual styles (e.g., `.blade`, `.ship`, `.neon`, `.cyberpunk`, `.gothic`) within a tiny 86px tall preview strip, using CSS `::before` and `::after` elements for angular light rays, simulated horizons, and glowing orbs.
