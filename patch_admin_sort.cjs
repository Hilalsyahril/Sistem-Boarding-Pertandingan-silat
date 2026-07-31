const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Add created_at in mappedItems
let mapItemsRegex = /const mappedItems = rawData\.map\(\(row: any\) => \{/g;
code = code.replace(mapItemsRegex, `const baseTime = Date.now();\n        const mappedItems = rawData.map((row: any, index: number) => {`);

let returnMapRegex = /timer_duration: duration\s*\};/g;
code = code.replace(returnMapRegex, `timer_duration: duration,\n            created_at: baseTime + index\n          };`);

// Replace sorting in AdminDashboard
let sortRegex = /const numA = parseFloat\(a\.nomor_partai\);\s*const numB = parseFloat\(b\.nomor_partai\);\s*const isNumA = !isNaN\(numA\) && isFinite\(numA\);\s*const isNumB = !isNaN\(numB\) && isFinite\(numB\);\s*if \(isNumA && isNumB\) \{\s*return numA - numB;\s*\}\s*if \(isNumA\) return -1;\s*if \(isNumB\) return 1;\s*return String\(a\.nomor_partai \|\| ""\)\.localeCompare\(String\(b\.nomor_partai \|\| ""\)\);/g;
code = code.replace(sortRegex, `return (Number(a.created_at) || 0) - (Number(b.created_at) || 0);`);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Admin Dashboard sorted");
