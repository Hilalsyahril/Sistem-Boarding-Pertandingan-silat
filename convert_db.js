const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Replace imports
code = code.replace('import { Pool } from "pg";', 'import mysql from "mysql2/promise";');

// Replace Pool init
code = code.replace('let pgPool: Pool | null = DB_URL ? new Pool({ connectionString: DB_URL }) : null;', 'let pgPool: mysql.Pool | null = DB_URL ? mysql.createPool(DB_URL) : null;');

// Replace queries (postgres to mysql)
// 1. CREATE TABLE
code = code.replace(/CREATE TABLE IF NOT EXISTS pengaturan_arena \([\\s\\S]*?\);/g, (match) => {
    return match.replace(/VARCHAR\(255\)/g, 'VARCHAR(255)');
});

// Replace INSERT ... ON CONFLICT
code = code.replace(/INSERT INTO pengaturan_arena(.*?) ON CONFLICT \(id\) DO NOTHING;/g, "INSERT IGNORE INTO pengaturan_arena$1;");
code = code.replace(/INSERT INTO admin_users(.*?) ON CONFLICT \(username\) DO NOTHING;/g, "INSERT IGNORE INTO admin_users$1;");

// Replace Regex
code = code.replace(/CAST\(NULLIF\(regexp_replace\(nomor_partai, '\\[\^0-9\\]', '', 'g'\), ''\) AS INTEGER\)/g, "CAST(NULLIF(REGEXP_REPLACE(nomor_partai, '[^0-9]', ''), '') AS INTEGER)");

// Replace parameter placeholders
code = code.replace(/\$([0-9]+)/g, "?");

// Replace update with returning
code = code.replace(/const updateRes = await pgPool\.query\([\s\S]*?UPDATE pesilat(.*?)RETURNING \*"[\s\S]*?\[id\]\s*\);/g, 
`const [updateRes] = await pgPool.query<mysql.ResultSetHeader>(
      "UPDATE pesilat $1",
      [id]
    );`);

code = code.replace(/if \(updateRes\.rowCount === 0\)/g, "if ((updateRes as mysql.ResultSetHeader).affectedRows === 0)");

// Replace pgPool.query returns. pg returns { rows: [] }. mysql2 returns [rows, fields]
// We can use a regex to replace `const result = await pgPool.query(...)` with `const [rows] = await pgPool.query(...)`
// But wait, there are many variations.
// It's easier to create a wrapper around mysql2 pool that simulates pg pool behavior!

