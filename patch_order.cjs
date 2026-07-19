const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const res = await pgPool.query("SELECT * FROM pesilat ORDER BY arena, id");',
  'const res = await pgPool.query("SELECT * FROM pesilat ORDER BY arena, CAST(NULLIF(regexp_replace(nomor_partai, \'[^0-9]\', \'\', \'g\'), \'\') AS INTEGER)");'
);

fs.writeFileSync('server.ts', code);
