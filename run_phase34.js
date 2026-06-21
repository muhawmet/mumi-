const fs = require('fs');

console.log("--- STARTING PHASE 3 & 4 ---");

// 1. EXTRACT EXACT CSS FOR PREVIEWS FROM OLD SITE
let oldHtml = fs.readFileSync('/Users/Muhammet/Desktop/mamilas_work_current/mamilas.html', 'utf-8');
let styleMatch = oldHtml.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
    let oldCss = styleMatch[1];
    
    // Extract .refCardPreview blocks
    let refVaultMatch = oldCss.match(/\/\* MAMILAS CLEAN REFERENCE VAULT \*\/([\s\S]*?)\/\* MAMILAS Golden Standard Library \*\//);
    let refCssToInject = "";
    if (refVaultMatch) {
        refCssToInject = "\n/* --- TRANSPLANTED REFERENCE VAULT --- */\n" + refVaultMatch[1];
    }
    
    // Inject into style.css
    let currentCss = fs.readFileSync('public/style.css', 'utf-8');
    if (!currentCss.includes("TRANSPLANTED REFERENCE VAULT")) {
        fs.writeFileSync('public/style.css', currentCss + refCssToInject);
        console.log("✅ Phase 3: Injected advanced CSS classes (.refCardPreview, etc.)");
    }
}

// 2. HTML COMPONENT PORTING (Buttons & Typography)
let html = fs.readFileSync('public/index.html', 'utf-8');
// Replace btn-generate with the legacy btn primary
html = html.replace('class="btn-generate"', 'class="btn primary" style="width: 100%; margin-top:16px;"');
// Replace studio-input and studio-select classes with the legacy styles?
// The old site just used raw `input`, `textarea`, `select` without classes, but they had CSS.
// Let's add .card to the prompt boxes
html = html.replace(/class="prompt-box"/g, 'class="prompt-box box"');
html = html.replace(/class="prompt-box mono"/g, 'class="prompt-box box mono"');
// Update detail title typography
html = html.replace('<h2 id="detail-title"></h2>', '<h2 id="detail-title" class="title" style="font-size: 28px; margin-bottom: 4px;"></h2>');
html = html.replace('class="scene-meta-index"', 'class="scene-meta-index qScore" style="background:transparent; border:none; box-shadow:none; align-items:flex-start; margin-right:12px;"');
fs.writeFileSync('public/index.html', html);
console.log("✅ Phase 3: Applied Component & Typography HTML updates.");


// 3. PHASE 4: DATA TAXONOMY MERGING
let surgeryData = JSON.parse(fs.readFileSync('SURGERY_DATA.json', 'utf-8'));
let newWorlds = {
    paths: surgeryData.paths || [],
    projects: surgeryData.projects || [],
    worlds: surgeryData.worlds || [],
    palettes: surgeryData.palettes || []
};
fs.writeFileSync('data/worlds.json', JSON.stringify(newWorlds, null, 2));
console.log("✅ Phase 4: Migrated 90KB taxonomy into data/worlds.json.");

console.log("--- PHASE 3 & 4 COMPLETE ---");
