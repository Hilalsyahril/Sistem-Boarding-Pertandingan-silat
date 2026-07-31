const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(/\}\)\.filter\(item => item\.nama_pesilat \|\| item\.nama_pesilat_biru\);/g, `}); // Removed filter so it can import even if mapping is slightly off`);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Filter removed!");
