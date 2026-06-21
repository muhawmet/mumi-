const fs = require('fs');

// --- 1. INDEX.HTML (B1, B2, B4) ---
let html = fs.readFileSync('public/index.html', 'utf8');

// B1: Timeline tooltips and table improvements.
// Add title attribute to status headers if missing, actually we'll do this in app.js
// But let's fix a11y (B4) in index.html.
// Replace `<input type="text" class="studio-input" id="project-topic"` with one that has aria-labelledby or properly matches the label's `for`.
// Wait, the labels already have `for="project-topic"`. That is perfectly fine for A11y!
// Maybe missing `role` on some buttons or custom elements? The custom chips `div.timeline-legend` has `aria-label`.
// Let's add standard `aria-label` where missing.

// B2: Right panel preview real component.
// Find the preview-content-wrapper and replace it with a much better layout.
const previewTarget = `<div class="preview-content-wrapper">`;
const previewReplacement = `<div class="preview-content-wrapper" id="preview-content-wrapper">
             <header class="scene-meta">
               <div class="scene-meta-main">
                 <div class="scene-meta-thumbnail" id="scene-meta-thumbnail"></div>
                 <div class="scene-meta-info">
                   <span id="scene-meta-index" class="scene-meta-index">—</span>
                   <span id="scene-meta-phase" class="scene-meta-phase-tag"></span>
                   <h2 id="detail-title"></h2>
                   <div class="scene-pacing-bar"><div id="scene-pacing-fill" class="pacing-fill"></div></div>
                 </div>
               </div>
               <div class="scene-actions">
                 <button id="btn-scene-regenerate" class="btn-mini" type="button" aria-label="Regenerate">Regenerate</button>
                 <button id="btn-scene-copy-all" class="btn-mini" type="button" aria-label="Copy all prompts">Copy all prompts</button>
                 <button id="btn-scene-mark-done" class="btn-mini" type="button" aria-label="Mark done">Mark done</button>
               </div>
             </header>
             <div id="scene-meta-tags" class="scene-meta-tags"></div>
             
             <!-- Prompts will be injected here -->
`;
html = html.replace(`<div class="preview-content-wrapper">\n             <header class="scene-meta">\n               <div class="scene-meta-main">\n                 <span id="scene-meta-index" class="scene-meta-index">—</span>\n                 <div>\n                   <h2 id="detail-title"></h2>\n                   <div id="scene-meta-tags" class="scene-meta-tags"></div>\n                 </div>\n               </div>\n               <div class="scene-actions">\n                 <button id="btn-scene-copy-all" class="btn-mini" type="button">Copy all prompts</button>\n                 <button id="btn-scene-mark-done" class="btn-mini" type="button">Mark done</button>\n               </div>\n             </header>`, previewReplacement);
fs.writeFileSync('public/index.html', html);


// --- 2. STYLE.CSS (B1, B2, B3, B4) ---
let css = fs.readFileSync('public/style.css', 'utf8');
const newCss = `
/* Phase B Additions */
.scene-meta-main { display: flex; align-items: center; gap: 16px; }
.scene-meta-thumbnail { width: 64px; height: 64px; background: var(--input-bg); border-radius: var(--radius-sm); border: 1px solid var(--glass-border); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--text-muted); }
.scene-meta-info { display: flex; flex-direction: column; gap: 4px; }
.scene-meta-phase-tag { font-size: 10px; font-weight: 700; background: var(--glass-bg); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--glass-border); width: fit-content; }
.scene-pacing-bar { width: 100px; height: 4px; background: var(--input-bg); border-radius: 2px; overflow: hidden; margin-top: 4px; }
.pacing-fill { height: 100%; background: var(--accent-primary); transition: width 0.3s ease; }
td.item-check { cursor: help; }
td.item-check:hover { color: var(--accent-primary); }

/* Mobile fixes (B3) */
@media (max-width: 768px) {
  .studio-layout { flex-direction: column; }
  .studio-sidebar { width: 100%; height: 50vh; border-right: none; border-bottom: 1px solid var(--glass-border); z-index: 100; position: relative; }
  .studio-main { height: 50vh; }
  .studio-timeline { display: none; /* timeline is hard to fit, or make it scroll */ }
  .studio-sidebar-overlay { z-index: 99; }
}
`;
if (!css.includes('Phase B Additions')) {
  css += newCss;
}
fs.writeFileSync('public/style.css', css);


// --- 3. APP.JS (B1, B2) ---
let appJs = fs.readFileSync('public/app.js', 'utf8');

// Tooltips in renderTable (B1)
appJs = appJs.replace(/<td class="item-check/g, '<td title="${scene.imageStatus}" class="item-check');

// Update renderDetailPanel to show intensity, phase, thumbnail (B2)
// Find renderDetailPanel
// Let's replace the top part of renderDetailPanel
appJs = appJs.replace(/document\.getElementById\('scene-meta-index'\)\.innerText = `Scene \$\{scene\.id\}`;/g, 
  `document.getElementById('scene-meta-index').innerText = \`Scene \$\{scene.id\}\`;
  
  const phaseEl = document.getElementById('scene-meta-phase');
  if (phaseEl) phaseEl.innerText = scene.phaseName || 'Neutral';
  
  const fillEl = document.getElementById('scene-pacing-fill');
  if (fillEl) fillEl.style.width = (scene.intensity || 0) + '%';
  
  const thumbEl = document.getElementById('scene-meta-thumbnail');
  if (thumbEl) thumbEl.innerHTML = scene.imageStatus === 'done' ? '🖼️' : '⏳';`);

fs.writeFileSync('public/app.js', appJs);

console.log('Phase B implemented.');
