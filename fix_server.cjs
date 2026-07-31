const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Find start of getPesilats
let startIndex = code.indexOf('async function getPesilats() {');
// Find start of updatePesilat
let endIndex = code.indexOf('async function updatePesilat(id: string, data: any) {');

if (startIndex > -1 && endIndex > -1) {
  let goodCode = `async function getPesilats() {
  if (!pgPool) return [];
  const res = await pgPool.query("SELECT * FROM pesilat");
  const rows = res.rows.map(mapPesilat);
  return rows.sort((a, b) => {
    if (a.arena !== b.arena) {
      return (Number(a.arena) || 0) - (Number(b.arena) || 0);
    }
    return (Number(a.created_at) || 0) - (Number(b.created_at) || 0);
  });
}

async function getPesilatById(id: string) {
  if (!pgPool) return null;
  const res = await pgPool.query("SELECT * FROM pesilat WHERE id = $1", [id]);
  return mapPesilat(res.rows[0]);
}

async function insertPesilat(p: any) {
  if (!pgPool) return;
  await pgPool.query(\`
    INSERT INTO pesilat (
      id, nomor_partai, nama_pesilat, kontingen, nama_pesilat_biru, kontingen_biru,
      kelas, kategori, gender, arena, is_playing, timer_duration, timer_seconds_left,
      timer_running, timer_last_updated_at, is_done, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
  \`, [
    p.id, p.nomor_partai, p.nama_pesilat, p.kontingen, p.nama_pesilat_biru || "", p.kontingen_biru || "",
    p.kelas, p.kategori, p.gender, p.arena, p.is_playing ? true : false, p.timer_duration, p.timer_seconds_left,
    p.timer_running ? true : false, p.timer_last_updated_at || null, p.is_done ? true : false, p.created_at || Date.now()
  ]);
}

`;
  code = code.substring(0, startIndex) + goodCode + code.substring(endIndex);
  fs.writeFileSync('server.ts', code);
  console.log("Fixed server.ts successfully");
} else {
  console.log("Could not find boundaries");
}
