const fs = require('fs');

let src = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');

src = src.replace(/\.sort\(\(a, b\) => \{[\s\S]*?828-                \}\);/, `.sort((a, b) => {
                  const numA = Number(a.nomor_urut) || 0;
                  const numB = Number(b.nomor_urut) || 0;
                  if (numA !== numB) return numA - numB;
                  const pA = parseInt((a.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
                  const pB = parseInt((b.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
                  return pA - pB;
                });`);
                
// Let's use a simpler regex
