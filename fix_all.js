const fs = require('fs');

// 1. Fix server.js
let serverJs = fs.readFileSync('server.js', 'utf8');
serverJs = serverJs.replace(
  /let VISUAL_WORLDS = \[\];\n\ntry \{\n  VISUAL_WORLDS = JSON\.parse\(fs\.readFileSync\(path\.join\(DATA_DIR, 'worlds\.json'\), 'utf8'\)\);\n\} catch \(e\) \{/,
  `let TAXONOMY = { worlds: [] };
let VISUAL_WORLDS = [];

try {
  TAXONOMY = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'worlds.json'), 'utf8'));
  VISUAL_WORLDS = TAXONOMY.worlds || TAXONOMY; // Fallback
} catch (e) {`
);

serverJs = serverJs.replace(
  /app\.get\('\/api\/worlds', \(req, res\) => \{\n  res\.json\(VISUAL_WORLDS\);\n\}\);/,
  `app.get('/api/worlds', (req, res) => {
  res.json(VISUAL_WORLDS);
});

// GET /api/taxonomy — full taxonomy (worlds, projects, palettes, paths)
app.get('/api/taxonomy', (req, res) => {
  res.json(TAXONOMY);
});`
);
fs.writeFileSync('server.js', serverJs);

// 2. Fix public/brain.js
let brainJs = fs.readFileSync('public/brain.js', 'utf8');
brainJs = brainJs.replace(
  /const res = await fetch\('\/api\/worlds'\);\n    const data = await res\.json\(\);\n    BRAIN\.worlds = data\.worlds \|\| data;\n    BRAIN\.taxonomy = data;/,
  `const res = await fetch('/api/taxonomy');
    const data = await res.json();
    BRAIN.taxonomy = data;
    BRAIN.worlds = data.worlds || data;`
);
// In case the replacement failed because of previous state:
if (!brainJs.includes('/api/taxonomy')) {
    brainJs = brainJs.replace(
      /const res = await fetch\('\/api\/worlds'\);\n    BRAIN\.worlds = await res\.json\(\);/,
      `const res = await fetch('/api/taxonomy');
    const data = await res.json();
    BRAIN.taxonomy = data;
    BRAIN.worlds = data.worlds || data;`
    );
}
fs.writeFileSync('public/brain.js', brainJs);

// 3. Fix fix_tests.js
let fixTestsJs = fs.readFileSync('fix_tests.js', 'utf8');
fixTestsJs = fixTestsJs.replace(
  /readFileSync\(path\.join\(ROOT, 'public\/brain\.js'\), 'utf8'\) \+ '\\\\nBRAIN\.worlds = ' \+ readFileSync\(path\.join\(ROOT, 'data\/worlds\.json'\), 'utf8'\) \+ ';'/g,
  "readFileSync(path.join(ROOT, 'public/brain.js'), 'utf8') + '\\nconst tax = ' + readFileSync(path.join(ROOT, 'data/worlds.json'), 'utf8') + '; BRAIN.taxonomy = tax; BRAIN.worlds = tax.worlds || tax;'"
);
fs.writeFileSync('fix_tests.js', fixTestsJs);

console.log("✅ Fixed taxonomy issues in server, brain, and test harnesses!");
