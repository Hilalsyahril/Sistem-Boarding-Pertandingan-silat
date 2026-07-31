const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

let regex = /p\.arena === arenaNum/g;
let replacement = `(parseInt(String(p.arena).replace(/\\D/g, ''), 10) === arenaNum || String(p.arena) === String(arenaNum))`;
code = code.replace(regex, replacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard arena UI logic");
