const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');
code = code.replace('setTimeout(() => controller.abort(), 5000)', 'setTimeout(() => controller.abort(), 15000)');
fs.writeFileSync('src/components/PublicDisplay.tsx', code);
