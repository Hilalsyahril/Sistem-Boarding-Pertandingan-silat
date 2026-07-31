const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  `body: JSON.stringify({ jumlah_arena: jumlahArena, judul_aplikasi: judulAplikasi, auto_next: newVal })`,
  `body: JSON.stringify({ auto_next: newVal })`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched admin toggle");
