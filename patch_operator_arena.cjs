const fs = require('fs');
let code = fs.readFileSync('src/components/OperatorDashboard.tsx', 'utf-8');

const target = `          if (arenaItem && arenaItem.auto_next !== undefined) {
             setAutoNextMatch(arenaItem.auto_next);
          }`;

const replacement = `          if (arenaItem) {
             if (arenaItem.auto_next !== undefined) setAutoNextMatch(arenaItem.auto_next);
             if (arenaItem.jumlah_arena !== undefined) setJumlahArena(arenaItem.jumlah_arena);
          }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/OperatorDashboard.tsx', code);
    console.log("Patched OperatorDashboard.tsx polling successfully");
} else {
    console.log("Could not find target in OperatorDashboard.tsx");
}
