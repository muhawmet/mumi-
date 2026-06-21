const fs = require('fs');

let content = fs.readFileSync('public/app.js', 'utf8');

// The original line is:
// document.addEventListener('DOMContentLoaded', () => {
// We want to replace it with:
// document.addEventListener('DOMContentLoaded', () => {
//   const initApp = () => {
content = content.replace("document.addEventListener('DOMContentLoaded', () => {", 
`document.addEventListener('DOMContentLoaded', () => {
  const initApp = () => {`);

// Now we need to find the matching closing bracket for DOMContentLoaded, which is the very last "});" in the file.
// Or we can just find the end of the file. Actually it's easier to find:
//   // Render scenes if loaded
//   if (STATE.scenes && STATE.scenes.length > 0) {
//     renderTable();
//     renderDetailPanel();
//   }
// });

// Wait, the end of the DOMContentLoaded is the last `});` ? Yes.
// Let's replace the last `});` with:
//   };
//   if (typeof BRAIN !== 'undefined' && BRAIN.worlds && BRAIN.worlds.length > 0) {
//     initApp();
//   } else if (window.loadWorlds) {
//     window.loadWorlds().then(initApp);
//   } else {
//     initApp();
//   }
// });
const lastBracketIndex = content.lastIndexOf('});');
content = content.substring(0, lastBracketIndex) + `  };
  if (typeof BRAIN !== 'undefined' && BRAIN.worlds && BRAIN.worlds.length > 0) {
    initApp();
  } else if (window.loadWorlds) {
    window.loadWorlds().then(initApp);
  } else {
    initApp();
  }
});
` + content.substring(lastBracketIndex + 3);

fs.writeFileSync('public/app.js', content);
console.log('app.js patched correctly.');
