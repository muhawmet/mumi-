const fs = require('fs');

let css = fs.readFileSync('public/style.css', 'utf-8');

// 1. Inject root CSS variables
const oldRoot = `  --bg:#030407;
  --s1:#080a0f;
  --s2:#0d1018;
  --s3:#151927;
  --s4:#202637;
  --line:#ffffff10;
  --line2:#ffffff1c;
  --line3:#ffffff34;
  --gold:#f7c948;
  --gold2:#d99a2b;
  --goldsoft:#f7c94814;
  --green:#4df5a0;
  --red:#f54d6b;
  --cinema-red:#9f1d2f;
  --glass:rgba(255,255,255,.045);
  --glass2:rgba(255,255,255,.075);
  --r8:8px; --r10:10px; --r12:12px; --r16:16px;`;

css = css.replace(/:root \{/, `:root {\n${oldRoot}\n`);

// Remap some old usage to new
css = css.replace(/--bg-dark/g, '--bg');
css = css.replace(/--accent-primary/g, '--gold');

// 2. Add structural CSS
const structuralCSS = `
/* Transplanted Structural CSS */
.app { display: grid; grid-template-columns: 340px minmax(0,1fr) 400px; min-height: 100vh; }
.side, .right { position: sticky; top: 0; height: 100vh; overflow: auto; background: linear-gradient(180deg,var(--s1),#08090d); }
.side { border-right: 1px solid var(--line); }
.right { border-left: 1px solid var(--line); }
.main { padding: 34px 42px 110px; min-height: 100vh; overflow: auto; }
.inner { max-width: 1220px; margin: 0 auto; }

/* Transplanted Typography & Cards */
.eyebrow{display:inline-flex;align-items:center;gap:8px;padding:5px 9px;border:1px solid rgba(245,200,66,.28);border-radius:999px;background:rgba(245,200,66,.06);font:900 11px var(--font-mono);color:var(--gold);text-transform:uppercase;}
.eyebrow:before{content:"";width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 14px var(--green);}
.title{font-size:37px;font-weight:900;letter-spacing:-1.3px;line-height:1.04;margin-bottom:10px;}
.qScore{font:900 64px var(--font-mono);letter-spacing:-4px;color:var(--gold);line-height:1;}
.card,.box { background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.018)),linear-gradient(180deg,#0b0d13,#07080c);border:1px solid var(--line2);border-radius:var(--r12);padding:16px;box-shadow:0 18px 70px rgba(0,0,0,.24);backdrop-filter: blur(10px); }
.card.sel { border-color:var(--gold);box-shadow:0 0 0 1px rgba(245,200,66,.85),0 0 42px rgba(245,200,66,.10);background:linear-gradient(180deg,var(--goldsoft),var(--s1)); }
`;
css = css + '\n' + structuralCSS;
fs.writeFileSync('public/style.css', css);


let html = fs.readFileSync('public/index.html', 'utf-8');

// Replace layout structure
// <div class="studio-layout"> -> <div class="app">
html = html.replace('<div class="studio-layout">', '<div class="app">');

// <aside id="studio-sidebar" class="studio-sidebar"> -> <div class="side" id="studio-sidebar">
html = html.replace('<aside id="studio-sidebar" class="studio-sidebar">', '<div class="side" id="studio-sidebar">');
html = html.replace('</aside>', '</div>');

// Move .studio-timeline to .main, and .preview-player-area to .right
const mainMatch = html.match(/<main class="studio-main">([\s\S]*?)<\/main>/);
if (mainMatch) {
  let mainContent = mainMatch[1];
  
  // Extract timeline and preview area
  const previewAreaMatch = mainContent.match(/<div class="preview-player-area">[\s\S]*?<!-- BOTTOM: Timeline Storyboard -->/);
  const timelineMatch = mainContent.match(/<footer class="studio-timeline">([\s\S]*?)<\/footer>/);
  
  if (previewAreaMatch && timelineMatch) {
    let previewHtml = previewAreaMatch[0].replace('<!-- BOTTOM: Timeline Storyboard -->', '');
    let timelineHtml = '<div class="studio-timeline">\n' + timelineMatch[1] + '\n</div>';
    
    let newStructure = `
  <div class="main">
    <div class="inner">
      <div class="pageHead">
         <span class="eyebrow">Studio</span>
         <h1 class="title">Quantum Timeline</h1>
      </div>
      ${timelineHtml}
    </div>
  </div>
  <div class="right">
    ${previewHtml}
  </div>
`;
    html = html.replace(mainMatch[0], newStructure);
  }
}

fs.writeFileSync('public/index.html', html);
console.log("Phase 1 & 2 applied successfully.");
