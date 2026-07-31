const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /Number\(match\.arena\) === Number\(p\.arena\)/g;
const replacement = `(parseInt(String(match.arena).replace(/\\D/g, ''), 10) || match.arena) === (parseInt(String(p.arena).replace(/\\D/g, ''), 10) || p.arena)`;
code = code.replace(regex, replacement);

const regex2 = /Number\(match\.arena\) === arenaNum/g;
const replacement2 = `(parseInt(String(match.arena).replace(/\\D/g, ''), 10) === arenaNum || String(match.arena) === String(arenaNum))`;
code = code.replace(regex2, replacement2);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts arena filter logic");
