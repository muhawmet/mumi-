const fs = require('fs');

let content = fs.readFileSync('public/brain.js', 'utf8');

// The file starts with:
// const BRAIN = {
//   worlds: [
//     ...
//   ],
//
//   negativeLibrary: {

// We want to replace the `worlds` array with an empty array.
// Since it's a JS object, we can use a regex to match from `worlds: [` until `negativeLibrary: {`
content = content.replace(/worlds:\s*\[[\s\S]*?\],\s*negativeLibrary:/, 'worlds: [],\n\n  negativeLibrary:');

// Add window.loadWorlds function at the end
content += `\n\nwindow.loadWorlds = async function() {
  if (BRAIN.worlds && BRAIN.worlds.length > 0) return;
  try {
    const res = await fetch('/api/worlds');
    BRAIN.worlds = await res.json();
  } catch(e) {
    console.error('Failed to load worlds', e);
  }
};
`;

fs.writeFileSync('public/brain.js', content);
console.log('brain.js updated.');
