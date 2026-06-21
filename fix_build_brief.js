const fs = require('fs');
let app = fs.readFileSync('public/app.js', 'utf8');

app = app.replace(
  /const reference = \(brainRefId && typeof BRAIN !== 'undefined' && BRAIN\.references\)\s*\n\s*\? BRAIN\.references\.find\(ref => ref\.id === brainRefId\)\s*\n\s*: null;/,
  "const reference = (brainRefId && typeof BRAIN !== 'undefined' && BRAIN.taxonomy && BRAIN.taxonomy.refs) ? BRAIN.taxonomy.refs.find(ref => ref.id === brainRefId) : null;"
);

app = app.replace(
  /const compatibleReference = reference && reference\.worldId === world\.id \? reference : null;/,
  "const compatibleReference = reference && (!reference.worldId || reference.worldId === world.id) ? reference : null;"
);

fs.writeFileSync('public/app.js', app);
console.log('Fixed buildFinalBrief reference check!');
