const fs = require('fs');
let content = fs.readFileSync('public/brain.js', 'utf8');

content = content.replace(/worlds:\s*\[[\s\S]*?\],\s*references:/, 'worlds: [],\n\n  references:');

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
console.log('brain.js safely updated.');
