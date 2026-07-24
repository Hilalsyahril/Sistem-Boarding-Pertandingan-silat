const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

code = code.replace(/waitingQueue\.slice\(0, 3\)/g, 'waitingQueue.slice(0, 2)');

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched queue to 2");
