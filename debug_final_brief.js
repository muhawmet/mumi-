const fs = require('fs');
let app = fs.readFileSync('public/app.js', 'utf8');

app = app.replace(
  "const reference = (brainRefId && typeof BRAIN !== 'undefined' && BRAIN.taxonomy && BRAIN.taxonomy.refs) ? BRAIN.taxonomy.refs.find(ref => ref.id === brainRefId) : null;",
  "const reference = (brainRefId && typeof BRAIN !== 'undefined' && BRAIN.taxonomy && BRAIN.taxonomy.refs) ? BRAIN.taxonomy.refs.find(ref => ref.id === brainRefId) : null; console.log('DEBUG buildFinalBrief:', { brainRefId, hasBrain: typeof BRAIN !== 'undefined', hasTaxonomy: !!(typeof BRAIN !== 'undefined' && BRAIN.taxonomy), hasRefs: !!(typeof BRAIN !== 'undefined' && BRAIN.taxonomy && BRAIN.taxonomy.refs), refFound: !!reference, refId: reference?.id });"
);

fs.writeFileSync('public/app.js', app);
console.log('Injected debug console.log into buildFinalBrief!');
