const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const target = `          if (arenaItem && arenaItem.auto_next !== undefined) {
             setAutoNextMatch(arenaItem.auto_next);
          }`;

const replacement = `          if (arenaItem) {
             if (arenaItem.auto_next !== undefined) setAutoNextMatch(arenaItem.auto_next);
             if (arenaItem.jumlah_arena !== undefined) {
                setJumlahArena(arenaItem.jumlah_arena);
                // setInputJumlahArena(arenaItem.jumlah_arena); // Might interfere with currently typing admin, maybe don't update input
             }
             if (arenaItem.judul_aplikasi !== undefined) {
                setJudulAplikasi(arenaItem.judul_aplikasi);
             }
          }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/AdminDashboard.tsx', code);
    console.log("Patched AdminDashboard.tsx polling successfully");
} else {
    console.log("Could not find target in AdminDashboard.tsx");
}
