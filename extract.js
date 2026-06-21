const fs = require('fs');

// We can read brain.js, put it in a function and evaluate it to get BRAIN
let content = fs.readFileSync('public/brain.js', 'utf8');
// remove the "const BRAIN = " and just evaluate the object
let jsObj = content.replace('const BRAIN =', 'return');

let func = new Function(jsObj);
let BRAIN = func();

fs.writeFileSync('data/worlds.json', JSON.stringify(BRAIN.worlds, null, 2));
console.log('worlds.json extracted. Length:', BRAIN.worlds.length);
