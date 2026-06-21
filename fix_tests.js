const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, 'test');
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.mjs'));

for (const file of files) {
  const filePath = path.join(testDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // We want to add BRAIN.worlds = JSON.parse(readFileSync('data/worlds.json')) to harness contexts.
  // Actually, easiest is to just find `readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8');`
  // and replace it with:
  // `readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';';`
  
  content = content.replace(
    /readFileSync\(\s*path\.join\(ROOT,\s*'public\/brain\.js'\),\s*'utf8'\s*\)/g,
    "readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\\nBRAIN.worlds = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + ';'"
  );
  
  fs.writeFileSync(filePath, content);
}
console.log('Tests patched to inject worlds.json into BRAIN.worlds!');
