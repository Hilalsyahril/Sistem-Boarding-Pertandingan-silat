const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regexInsert = /INSERT INTO pesilat \([\s\S]*?VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11, \$12, \$13, \$14, \$15, \$16\)/;
const replacementInsert = `INSERT INTO pesilat (
      id, nomor_partai, nama_pesilat, kontingen, nama_pesilat_biru, kontingen_biru,
      kelas, kategori, gender, arena, is_playing, timer_duration, timer_seconds_left,
      timer_running, timer_last_updated_at, is_done, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`;
code = code.replace(regexInsert, replacementInsert);

const regexParams = /p\.timer_running \? true : false, p\.timer_last_updated_at \|\| null, p\.is_done \? true : false/;
const replacementParams = `p.timer_running ? true : false, p.timer_last_updated_at || null, p.is_done ? true : false, p.created_at || Date.now()`;
code = code.replace(regexParams, replacementParams);

// Also patch mapPesilat
const regexMapPesilat = /return \{\s*\.\.\.row,\s*is_playing,/;
code = code.replace(regexMapPesilat, `return {
    ...row,
    created_at: row.created_at ? Number(row.created_at) : 0,
    is_playing,`);

fs.writeFileSync('server.ts', code);
console.log("Patched insert and mapPesilat!");
