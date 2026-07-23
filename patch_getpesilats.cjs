const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldFunc = `async function getPesilats() {
  if (!pgPool) return [];
  const res = await pgPool.query("SELECT * FROM pesilat ORDER BY arena, CAST(NULLIF(regexp_replace(nomor_partai, '[^0-9]', '', 'g'), '') AS INTEGER)");
  return res.rows.map(mapPesilat);
}`;

const newFunc = `async function getPesilats() {
  if (!pgPool) return [];
  const res = await pgPool.query("SELECT * FROM pesilat");
  const rows = res.rows.map(mapPesilat);
  return rows.sort((a, b) => {
    if (a.arena !== b.arena) {
      return (Number(a.arena) || 0) - (Number(b.arena) || 0);
    }
    const numA = parseInt((a.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
    const numB = parseInt((b.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
    return numA - numB;
  });
}`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('server.ts', code);
console.log("Patched getPesilats");
