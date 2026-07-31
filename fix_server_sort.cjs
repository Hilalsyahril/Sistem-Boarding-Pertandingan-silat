const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace sort in getPesilats
let getPesilatsSortRegex = /return rows\.sort\(\(a, b\) => \{[\s\S]*?return numA - numB;\s*\}\);/g;
code = code.replace(getPesilatsSortRegex, `return rows.sort((a, b) => {
    if (a.arena !== b.arena) {
      return (Number(a.arena) || 0) - (Number(b.arena) || 0);
    }
    return (Number(a.created_at) || 0) - (Number(b.created_at) || 0);
  });`);

// Replace other sorts
let generalSortRegex = /const numA = parseFloat\(a\.nomor_partai\);\s*const numB = parseFloat\(b\.nomor_partai\);\s*const isNumA = !isNaN\(numA\) && isFinite\(numA\);\s*const isNumB = !isNaN\(numB\) && isFinite\(numB\);\s*if \(isNumA && isNumB\) return numA - numB;\s*if \(isNumA\) return -1;\s*if \(isNumB\) return 1;\s*return String\(a\.nomor_partai \|\| ""\)\.localeCompare\(String\(b\.nomor_partai \|\| ""\), undefined, \{ numeric: true, sensitivity: "base" \}\);/g;
code = code.replace(generalSortRegex, `return (Number(a.created_at) || 0) - (Number(b.created_at) || 0);`);

let descSortRegex = /const numA = parseFloat\(a\.nomor_partai\);\s*const numB = parseFloat\(b\.nomor_partai\);\s*const isNumA = !isNaN\(numA\) && isFinite\(numA\);\s*const isNumB = !isNaN\(numB\) && isFinite\(numB\);\s*if \(isNumA && isNumB\) return numB - numA;\s*\/\/\s*Sort descending to find the last done match\s*if \(isNumA\) return -1;\s*if \(isNumB\) return 1;\s*return String\(b\.nomor_partai \|\| ""\)\.localeCompare\(String\(a\.nomor_partai \|\| ""\), undefined, \{ numeric: true, sensitivity: "base" \}\);/g;
code = code.replace(descSortRegex, `return (Number(b.created_at) || 0) - (Number(a.created_at) || 0);`);

fs.writeFileSync('server.ts', code);
console.log("Server sort replaced!");
