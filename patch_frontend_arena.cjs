const fs = require('fs');
let opCode = fs.readFileSync('src/components/OperatorDashboard.tsx', 'utf-8');

let regex = /p\.arena === arenaNum/g;
let replacement = `(parseInt(String(p.arena).replace(/\\D/g, ''), 10) === arenaNum || String(p.arena) === String(arenaNum))`;
opCode = opCode.replace(regex, replacement);

fs.writeFileSync('src/components/OperatorDashboard.tsx', opCode);

let pubCode = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');
pubCode = pubCode.replace(regex, replacement);
fs.writeFileSync('src/components/PublicDisplay.tsx', pubCode);

console.log("Patched Operator & Public frontend arena comparison");
