const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');
const target = `body: JSON.stringify({ jumlah_arena: inputJumlahArena, judul_aplikasi: inputJudulAplikasi, auto_next: newVal })`;
const replacement = `body: JSON.stringify({ jumlah_arena: jumlahArena, judul_aplikasi: judulAplikasi, auto_next: newVal })`;
code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard toggle");
