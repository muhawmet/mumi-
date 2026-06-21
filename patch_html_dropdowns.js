const fs = require('fs');
const htmlFile = './public/index.html';
let html = fs.readFileSync(htmlFile, 'utf8');
const data = require('./data/worlds.json');

function replaceSelect(html, id, items) {
  const selectRegex = new RegExp(`(<select id="${id}"[^>]*>)[\\s\\S]*?(<\\/select>)`);
  const options = items.map(item => `               <option value="${item.id}">${item.name || item.id}</option>`).join('\n');
  return html.replace(selectRegex, `$1\n${options}\n            $2`);
}

html = replaceSelect(html, 'cascade-world', data.worlds);
html = replaceSelect(html, 'cascade-prop', data.paths || []);
html = replaceSelect(html, 'cascade-reference', data.refs);
html = replaceSelect(html, 'cascade-palette', data.palettes);
html = replaceSelect(html, 'cascade-music', [{id: 'epic_orchestral', name: 'Epic Orchestral'}, {id: 'warm_acoustic', name: 'Warm Acoustic'}, {id: 'hip_hop_beats', name: 'Hip Hop Beats'}, {id: 'synthwave_drive', name: 'Synthwave Drive'}, {id: 'dark_ambient', name: 'Dark Ambient'}]); // keep old for now

fs.writeFileSync(htmlFile, html);
console.log('HTML patched!');
