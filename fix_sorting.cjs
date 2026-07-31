const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

// We will just replace all instances of `.sort((a, b) => {` where it checks `numA` and `numB` inside arenaMatches.

server = server.replace(/const arenaMatches = all\.filter\(match => Number\(match\.arena\) === Number\(p\.arena\)\)\.sort\([\s\S]*?\}\);\}\);/, `const arenaMatches = all.filter(match => Number(match.arena) === Number(p.arena)).sort((a, b) => {
      const numA = Number(a.nomor_urut) || 0;
      const numB = Number(b.nomor_urut) || 0;
      if (numA !== numB) return numA - numB;
      const pA = parseInt((a.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      const pB = parseInt((b.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      return pA - pB;
    });`);

server = server.replace(/const arenaMatches = all\.filter\(match => Number\(match\.arena\) === arenaNum\)\.sort\([\s\S]*?768-    \}\);/, `const arenaMatches = all.filter(match => Number(match.arena) === arenaNum).sort((a, b) => {
      const numA = Number(a.nomor_urut) || 0;
      const numB = Number(b.nomor_urut) || 0;
      if (numA !== numB) return numA - numB;
      const pA = parseInt((a.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      const pB = parseInt((b.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      return pA - pB;
    });`);
    
fs.writeFileSync('server.ts', server);
