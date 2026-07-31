const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/const numA = parseFloat\(a\.nomor_partai\);[\s\S]*?sensitivity: "base" \}\);/g, 'return (Number(a.created_at) || 0) - (Number(b.created_at) || 0);');

fs.writeFileSync('server.ts', code);
