const fs = require('fs');
let app = fs.readFileSync('public/app.js', 'utf8');

// Replace MASTER_REFERENCES
app = app.replace(/MASTER_REFERENCES/g, '(BRAIN.taxonomy.refs || [])');

// Replace .category with .(r.category || r.cat)
// But we need to do it precisely.
app = app.replace(/r\.category/g, '(r.category || r.cat)');

fs.writeFileSync('public/app.js', app);
console.log('Fixed refs in app.js!');
