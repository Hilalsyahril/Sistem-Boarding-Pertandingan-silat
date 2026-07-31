const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /const isPostgres = [^]*?mysql\.createPool\(DB_URL\);\s*\}\s*\}/;

const replacement = `const isPostgres = DB_URL ? DB_URL.startsWith('postgres://') || DB_URL.startsWith('postgresql://') : false;
const isMysql = DB_URL ? DB_URL.startsWith('mysql://') : false;
let rawPool: mysql.Pool | null = null;
let realPgPool: pg.Pool | null = null;

if (DB_URL) {
  if (isPostgres) {
    realPgPool = new pg.Pool({ connectionString: DB_URL });
  } else if (isMysql) {
    rawPool = mysql.createPool(DB_URL);
  } else {
    console.error("DATABASE_URL is not a valid postgres:// or mysql:// connection string.");
  }
}`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts successfully");
