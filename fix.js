const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// remove the injected part
const startMarker = '// --- PHASE D: JOB QUEUE SKELETON (NO ACTUAL API COSTS) ---';
const endMarker = '// ------------------------------------------------------------\n';

if (code.includes(startMarker)) {
  const startIndex = code.indexOf(startMarker);
  const endIndex = code.indexOf(endMarker) + endMarker.length;
  const skeleton = code.substring(startIndex, endIndex);
  
  code = code.substring(0, startIndex) + code.substring(endIndex);
  
  // now insert it AFTER const app = express();
  const insertMarker = 'const app = express();';
  const insertIndex = code.indexOf(insertMarker) + insertMarker.length;
  
  code = code.substring(0, insertIndex) + '\n\n' + skeleton + '\n' + code.substring(insertIndex);
  fs.writeFileSync('server.js', code);
  console.log('Fixed server.js');
}
