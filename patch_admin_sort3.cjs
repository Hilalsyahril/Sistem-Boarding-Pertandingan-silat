const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regex = /const numA = parseFloat\(a\.nomor_partai\);[\s\S]*?sensitivity: "base" \}\);/g;
code = code.replace(regex, `return (Number(a.created_at) || 0) - (Number(b.created_at) || 0);`);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Replaced sort admin 3");
