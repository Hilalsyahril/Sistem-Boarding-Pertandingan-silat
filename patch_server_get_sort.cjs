const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/const numA = parseInt\(\(a\.nomor_partai || ""\)\.toString\(\)\.replace\(\/\[\^0-9\]\/g, ''\), 10\) \|\| 0;\s*const numB = parseInt\(\(b\.nomor_partai || ""\)\.toString\(\)\.replace\(\/\[\^0-9\]\/g, ''\), 10\) \|\| 0;\s*return numA - numB;/g, 'return (Number(a.created_at) || 0) - (Number(b.created_at) || 0);');

fs.writeFileSync('server.ts', code);
