const fs = require('fs');
let app = fs.readFileSync('test/app.test.mjs', 'utf8');

app = app.replace(
  "assert.ok(scene.imagePrompt.indexOf('Reference DNA (subordinate):') < scene.imagePrompt.indexOf('Palette accent:'));",
  "console.log('imagePrompt:', scene.imagePrompt); assert.ok(scene.imagePrompt.indexOf('Reference DNA (subordinate):') < scene.imagePrompt.indexOf('Palette accent:'));"
);

fs.writeFileSync('test/app.test.mjs', app);
console.log('Injected prompt console.log into test!');
