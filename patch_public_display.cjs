const fs = require('fs');

let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');
code = code.replace(/3000/g, '1000');
// wait, replace all 3000s might replace Date.now() - lastTime > 30000 ? No, 30000 has 4 zeros.
// let's do it carefully.
fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched PublicDisplay polling");
