const fs = require('fs');

let css = fs.readFileSync('public/style.css', 'utf-8');

// Remove old 900px block
css = css.replace(/@media \(max-width: 900px\) \{[\s\S]*?\n\}\n/g, '');
// Remove old 768px block
css = css.replace(/@media \(max-width: 768px\) \{[\s\S]*?\n\}\n/g, '');

const newMobileCSS = `
/* --- PHASE 5: MOBILE RESPONSIVENESS --- */
@media (max-width: 900px) {
  body { overflow: auto; height: auto; min-height: 100vh; }
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  .side {
    width: 100%;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 999;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    max-width: 360px;
    box-shadow: 30px 0 60px rgba(0,0,0,0.5);
  }
  .side.open { transform: translateX(0); }
  .side .sidebar-header { padding-left: 72px; }
  .mobile-nav-toggle { z-index: 1001; display: flex; }
  .main {
    width: 100%;
    margin-top: 64px;
    padding: 16px;
    min-height: auto;
  }
  .right {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 60vh;
    z-index: 900;
    transform: translateY(110%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 -20px 60px rgba(0,0,0,0.6);
    border-top: 1px solid var(--gold);
    border-radius: 24px 24px 0 0;
  }
  .right.open {
    transform: translateY(0);
  }
  .studio-timeline { height: auto; max-height: 340px; }
  .prompt-group-half { grid-template-columns: 1fr; }
}
`;

css += '\n' + newMobileCSS;
fs.writeFileSync('public/style.css', css);

let appJs = fs.readFileSync('public/app.js', 'utf-8');
if (!appJs.includes('mobile-nav-toggle')) {
    // We need to ensure the mobile toggle works for .side
    const toggleLogic = `
// Mobile Drawer Toggles
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('mobile-nav-toggle');
    const side = document.querySelector('.side');
    if (navToggle && side) {
        navToggle.addEventListener('click', () => {
            side.classList.toggle('open');
        });
    }
});
`;
    appJs += '\n' + toggleLogic;
    fs.writeFileSync('public/app.js', appJs);
}

console.log("✅ Phase 5: Mobile responsiveness fixed.");
