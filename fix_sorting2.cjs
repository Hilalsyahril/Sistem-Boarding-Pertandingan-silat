const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(/const arenaMatches = all\.filter\(match => Number\(match\.arena\) === Number\(p\.arena\)\)\.sort\(\(a, b\) => \{[\s\S]*?const currentIndex = arenaMatches\.findIndex\(match => match\.id === id\);/g, `const arenaMatches = all.filter(match => Number(match.arena) === Number(p.arena)).sort((a, b) => {
      const numA = Number(a.nomor_urut) || 0;
      const numB = Number(b.nomor_urut) || 0;
      if (numA !== numB) return numA - numB;
      const pA = parseInt((a.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      const pB = parseInt((b.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      return pA - pB;
    });
    const currentIndex = arenaMatches.findIndex(match => match.id === id);`);


server = server.replace(/const arenaMatches = all\.filter\(match => Number\(match\.arena\) === arenaNum\)\.sort\(\(a, b\) => \{[\s\S]*?const pengaturan = await getPengaturanArena\(\);/g, function(match) {
    if (match.includes('return numB - numA;')) {
        return `const arenaMatches = all.filter(match => Number(match.arena) === arenaNum).sort((a, b) => {
      const numA = Number(a.nomor_urut) || 0;
      const numB = Number(b.nomor_urut) || 0;
      if (numA !== numB) return numB - numA;
      const pA = parseInt((a.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      const pB = parseInt((b.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      return pB - pA;
    });
    
    // Find currently playing
    const currentPlaying = arenaMatches.find(m => m.is_playing);
    
    // Find the last finished match
    const lastDoneMatch = arenaMatches.find(m => m.is_done);
    const pengaturan = await getPengaturanArena();`;
    } else {
        return `const arenaMatches = all.filter(match => Number(match.arena) === arenaNum).sort((a, b) => {
      const numA = Number(a.nomor_urut) || 0;
      const numB = Number(b.nomor_urut) || 0;
      if (numA !== numB) return numA - numB;
      const pA = parseInt((a.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      const pB = parseInt((b.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      return pA - pB;
    });
    
    const pengaturan = await getPengaturanArena();`;
    }
});

fs.writeFileSync('server.ts', server);
