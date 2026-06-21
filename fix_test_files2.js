const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, 'test');
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.mjs'));

for (const file of files) {
  const filePath = path.join(testDir, file);
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const brainSrc = readFileSync(path.join(ROOT, \'public/brain.js\')')) {
      lines[i] = "  const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\\nconst tax = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + '; BRAIN.taxonomy = tax; BRAIN.worlds = tax.worlds || tax;';";
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'));
}
console.log('Test files cleanly repaired!');
