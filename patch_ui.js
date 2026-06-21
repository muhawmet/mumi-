const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

// Add mobile bar and nav
if (!html.includes('class="mob-bar"')) {
  const mobBar = `<header class="mob-bar"><div class="mob-logo"><b>MAMI</b>LAS</div><div class="mob-spacer"></div><button class="mob-icon" aria-label="Toggle preview panel" onclick="document.getElementById('studio-sidebar').classList.toggle('open')">☰</button></header>`;
  html = html.replace('<body>', '<body>\n' + mobBar);
}

// Convert selects to use a custom visual wrapper in a script!
// Actually, let's inject a JS function into app.js that hides selects and builds custom UI.
fs.writeFileSync('public/index.html', html);
console.log('HTML updated');
