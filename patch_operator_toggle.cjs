const fs = require('fs');
let code = fs.readFileSync('src/components/OperatorDashboard.tsx', 'utf-8');

code = code.replace(
  `body: JSON.stringify({ jumlah_arena: jumlahArena, auto_next: newVal })`,
  `body: JSON.stringify({ auto_next: newVal })`
);

fs.writeFileSync('src/components/OperatorDashboard.tsx', code);
console.log("Patched operator toggle");
