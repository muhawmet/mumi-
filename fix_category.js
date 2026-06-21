const fs = require('fs');
let app = fs.readFileSync('public/app.js', 'utf8');

app = app.replace(/world\.category === 'tactile'/g, "(world.group || '').toLowerCase() === 'tactile'");
app = app.replace(/world\.category !== 'real'/g, "(world.group || '').toLowerCase() !== 'real'");
app = app.replace(/\$\{world\.category\}/g, "${(world.group || '').toLowerCase()}");

fs.writeFileSync('public/app.js', app);
console.log('Fixed world.category!');
