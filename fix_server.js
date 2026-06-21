const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

// The block starts around line 275
serverJs = serverJs.replace(
  /let VISUAL_WORLDS = \[\];\s*try \{\s*VISUAL_WORLDS = JSON\.parse\(fs\.readFileSync\(path\.join\(DATA_DIR, 'worlds\.json'\), 'utf8'\)\);\s*\} catch \(e\) \{/g,
  `let TAXONOMY = { worlds: [] };
let VISUAL_WORLDS = [];
try {
  TAXONOMY = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'worlds.json'), 'utf8'));
  VISUAL_WORLDS = TAXONOMY.worlds || [];
} catch (e) {`
);

// We must also update the /api/worlds endpoint around line 93
serverJs = serverJs.replace(
  /app\.get\('\/api\/worlds', \(req, res\) => \{\s*res\.json\(VISUAL_WORLDS\);\s*\}\);/g,
  `app.get('/api/worlds', (req, res) => {
  res.json(VISUAL_WORLDS);
});

app.get('/api/taxonomy', (req, res) => {
  res.json(TAXONOMY);
});`
);

fs.writeFileSync('server.js', serverJs);
console.log('Fixed server.js!');
