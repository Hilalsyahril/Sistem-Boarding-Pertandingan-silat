const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(`    });
    });
    const currentIndex = arenaMatches.findIndex(match => match.id === id);`, `    });
    const currentIndex = arenaMatches.findIndex(match => match.id === id);`);
    
// Replace lines 752-767
server = server.replace(/const arenaMatches = all\.filter\(match => Number\(match\.arena\) === arenaNum\)\.sort\(\(a, b\) => \{[\s\S]*?767-      return String\(a\.nomor_partai \|\| ""\)\.localeCompare\(String\(b\.nomor_partai \|\| ""\), undefined, \{ numeric: true, sensitivity: "base" \}\);\n    \}\);/, `const arenaMatches = all.filter(match => Number(match.arena) === arenaNum).sort((a, b) => {
      const numA = Number(a.nomor_urut) || 0;
      const numB = Number(b.nomor_urut) || 0;
      if (numA !== numB) return numA - numB;
      const pA = parseInt((a.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      const pB = parseInt((b.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      return pA - pB;
    });`);

// We'll just replace the whole sort blocks.
fs.writeFileSync('server.ts', server);
