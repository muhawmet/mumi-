const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// We are going to replace the `<div class="side" id="studio-sidebar">...</div>` with a proper navigation menu
const navMenu = `
  <div class="side" id="studio-sidebar">
     <div class="sidebar-header">
       <h1 class="sidebar-logo">MAMI<b>LAS</b> PRO</h1>
       <div class="health-status">
         <div id="health-dot" class="dot"></div>
         <span id="health-text" class="status-text">Connected</span>
       </div>
     </div>
     
     <nav class="nav">
        <div class="phaseLabel">1 BRIEF</div>
        <button class="nav-btn active" onclick="switchView('dashboard')">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
           Dashboard
        </button>
        <button class="nav-btn" onclick="switchView('ingest')">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
           Ingest Kaynak
        </button>
        
        <div class="phaseLabel">2 REÇETE</div>
        <button class="nav-btn" onclick="switchView('recipe')">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
           Dünya / Path
        </button>
        <button class="nav-btn" onclick="switchView('refdna')">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h4l2-9 4 18 2-9h6"></path></svg>
           Ref DNA
        </button>
        
        <div class="phaseLabel">3 ÜRETİM</div>
        <button class="nav-btn" onclick="switchView('timeline')">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
           Sahneler
        </button>
        <button class="nav-btn" onclick="switchView('promptlab')">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
           Prompt Lab
        </button>
     </nav>
  </div>
`;

// Replace the old side
html = html.replace(/<div class="side" id="studio-sidebar">[\s\S]*?<\/div>\s*<\/div>\s*<div id="brain-modal"/, navMenu + '\n  <div id="brain-modal"');

// Now, we need to wrap the existing timeline in the center in a view, and add the new views.
// The center is `<div class="main">`
const newViews = `
  <div class="main">
    <div class="inner">
      
      <!-- DASHBOARD VIEW -->
      <div id="view-dashboard" class="app-view active-view">
         <div class="pageHead">
           <span class="eyebrow">Aşama 1</span>
           <h1 class="title">Dashboard</h1>
         </div>
         <div class="grid g2">
           <div class="box">
             <div class="control-group">
                <label class="control-label" for="project-topic">Project topic</label>
                <input type="text" id="project-topic" class="studio-input" placeholder="e.g. Water cycle for 4th grade" value="Water cycle for 4th grade">
             </div>
             <div class="control-group">
                <label class="control-label" for="project-class">Class / ID</label>
                <input type="text" id="project-class" class="studio-input" placeholder="ALPHA_01" value="ALPHA_01">
             </div>
           </div>
           <div class="box">
             <div class="control-group">
                <label class="control-label">Cast</label>
                <div class="char-picker">
                   <button type="button" class="char-btn active" data-char="Aras">Aras</button>
                   <button type="button" class="char-btn" data-char="Defne">Defne</button>
                   <button type="button" class="char-btn" data-char="İkisi">Both</button>
                </div>
             </div>
             <div class="control-group">
                <label class="control-label" for="project-scenes">Scene count</label>
                <div class="slider-wrapper">
                   <input type="range" id="project-scenes" min="1" max="15" value="5">
                   <span id="scene-count-val" class="slider-val">5</span>
                </div>
             </div>
           </div>
         </div>
         <button class="btn primary" onclick="switchView('ingest')" style="margin-top: 24px; width: 100%;">İleri: Ingest</button>
      </div>

      <!-- INGEST VIEW -->
      <div id="view-ingest" class="app-view" style="display:none;">
         <div class="pageHead">
           <span class="eyebrow">Aşama 1.5</span>
           <h1 class="title">Ingest Kaynak</h1>
         </div>
         <div class="box">
            <p style="color: var(--muted); font-size: 14px; margin-bottom: 16px;">Müşteri briefini, kaynak metnini veya ses dökümünü buraya yapıştırın. Sistem sahnelere otomatik bölecektir.</p>
            <textarea class="studio-input" rows="8" placeholder="Kaynak metni..."></textarea>
            <button class="btn primary" style="margin-top:16px;" onclick="switchView('recipe')">İleri: Reçete Belirle</button>
         </div>
      </div>

      <!-- RECIPE VIEW -->
      <div id="view-recipe" class="app-view" style="display:none;">
         <div class="pageHead">
           <span class="eyebrow">Aşama 2</span>
           <h1 class="title">Reçete / Dünya</h1>
         </div>
         <div class="grid g2">
           <div class="box">
             <div class="control-group">
                <label class="control-label" for="cascade-world">Visual world</label>
                <select id="cascade-world" class="studio-select" aria-label="Select visual world">
                   <option value="arcane_painterly">Arcane Painterly</option>
                   <option value="pixar_dimensional">Pixar Dimensional</option>
                   <option value="ghibli_traditional">Ghibli Traditional</option>
                   <option value="spiderverse_comic">Spiderverse Comic</option>
                   <option value="klaus_lighting">Klaus Lighting</option>
                   <option value="mitchells_mixed">Mitchells Mixed</option>
                   <option value="edgerunners_neon">Edgerunners Neon</option>
                   <option value="pussinboots_painterly">Puss in Boots Painterly</option>
                   <option value="demonslayer_dynamic">Demon Slayer Dynamic</option>
                </select>
             </div>
           </div>
           <div class="box">
             <div class="control-group">
                <label class="control-label" for="cascade-prop">Prop Focus</label>
                <select id="cascade-prop" class="studio-select" aria-label="Select prop focus">
                   <option value="native_world">Native to World</option>
                   <option value="paper_diorama">Paper Diorama</option>
                   <option value="clay_diorama">Clay Sculpture</option>
                   <option value="wood_diorama">Wood Carving</option>
                   <option value="felt_diorama">Felt/Fabric</option>
                   <option value="shadow_puppet">Shadow Puppet</option>
                   <option value="book_theater">Pop-up Book</option>
                   <option value="stained_glass">Stained Glass</option>
                </select>
             </div>
           </div>
         </div>
         <button class="btn primary" onclick="switchView('refdna')" style="margin-top: 24px; width: 100%;">İleri: Ref DNA</button>
      </div>

      <!-- REF DNA VIEW -->
      <div id="view-refdna" class="app-view" style="display:none;">
         <div class="pageHead">
           <span class="eyebrow">Aşama 2.5</span>
           <h1 class="title">Referans DNA</h1>
         </div>
         <div class="box">
             <div class="control-group">
                <label class="control-label" for="cascade-reference">Reference / DNA Base</label>
                <select id="cascade-reference" class="studio-select" aria-label="Select reference DNA">
                   <!-- Populated via script -->
                </select>
             </div>
             <div class="control-group">
                <label class="control-label" for="cascade-palette">Palette Override</label>
                <select id="cascade-palette" class="studio-select" aria-label="Override color palette">
                   <option value="">(Inherit from Reference)</option>
                   <option value="vibrant_clean">Vibrant Clean</option>
                   <option value="moody_cinematic">Moody Cinematic</option>
                   <option value="monochrome_accent">Monochrome + Accent</option>
                   <option value="pastel_dream">Pastel Dream</option>
                   <option value="neon_cyber">Neon Cyber</option>
                   <option value="sepia_nostalgia">Sepia Nostalgia</option>
                </select>
             </div>
             <div class="control-group">
                <label class="control-label" for="cascade-music">Audio Profile</label>
                <select id="cascade-music" class="studio-select" aria-label="Select audio profile">
                   <option value="">(Inherit from Reference)</option>
                   <option value="epic_orchestral">Epic Orchestral</option>
                   <option value="warm_acoustic">Warm Acoustic</option>
                   <option value="hip_hop_beats">Hip Hop Beats</option>
                   <option value="synthwave_drive">Synthwave Drive</option>
                   <option value="dark_ambient">Dark Ambient</option>
                </select>
             </div>
         </div>
         <button class="btn primary" onclick="switchView('timeline'); document.getElementById('btn-batch-generate').click();" style="margin-top: 24px; width: 100%;">GENERATE: Sahneleri Üret</button>
         <button id="btn-batch-generate" style="display:none;">HIDDEN GEN</button>
      </div>

      <!-- TIMELINE VIEW -->
      <div id="view-timeline" class="app-view" style="display:none;">
`;

// Extract timeline HTML
const mainMatch = html.match(/<div class="main">[\s\S]*?<div class="pageHead">[\s\S]*?<\/div>([\s\S]*?)<\/div>\s*<\/div>\s*<div class="right">/);
const timelineHtml = mainMatch ? mainMatch[1] : '';

html = html.replace(/<div class="main">[\s\S]*?<\/div>\s*<\/div>\s*<div class="right">/, newViews + timelineHtml + '\n      </div>\n    </div>\n  </div>\n  <div class="right">');

fs.writeFileSync('public/index.html', html);
console.log("Layout refactored for SPA");
