const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, 'test');
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.mjs'));

for (const file of files) {
  const filePath = path.join(testDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the broken string
  content = content.replace(/const brainSrc = readFileSync\(path\.join\(ROOT, 'public\/brain\.js'\), 'utf8'\) \+ '[\s\S]*?;/g, 
    "const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\\nconst tax = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + '; BRAIN.taxonomy = tax; BRAIN.worlds = tax.worlds || tax;';");
    
  // If it still has duplicates or weird things:
  // Actually, let's just make it very precise:
  content = content.replace(/const brainSrc = readFileSync\(path\.join\(ROOT, 'public\/brain\.js'\), 'utf8'\).*?;/g,
    "const brainSrc = readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\\nconst tax = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + '; BRAIN.taxonomy = tax; BRAIN.worlds = tax.worlds || tax;';");
    
  fs.writeFileSync(filePath, content);
}
console.log('Test files repaired!');
