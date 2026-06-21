const fs = require('fs');
let css = fs.readFileSync('public/style.css', 'utf8');

// Remove `text-transform: uppercase;`
css = css.replace(/text-transform:\s*uppercase;?/g, '');

// Emojis in CSS comments:
// We can just remove all emojis using a regex.
// Regex for emojis (basic blocks)
const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
css = css.replace(emojiRegex, '');

fs.writeFileSync('public/style.css', css);
console.log('style.css cleaned from uppercase and emojis');
