const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const regex = /const arenaVal = Number\(arenaKey \? row\[arenaKey\] : 1\) \|\| 1;/;
const replacement = `const arenaVal = arenaKey ? String(row[arenaKey]).trim() : "1";`;
code = code.replace(regex, replacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard arena extraction");
