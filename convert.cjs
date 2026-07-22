const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace('import { Pool } from "pg";', 'import mysql from "mysql2/promise";');

const wrapper = `
let rawPool: mysql.Pool | null = DB_URL ? mysql.createPool(DB_URL) : null;

const pgPool = rawPool ? {
  query: async (text: string, params: any[] = []) => {
    let sql = text.replace(/\\$[0-9]+/g, "?");
    
    // Postgres to MySQL specific fixes
    sql = sql.replace(/VARCHAR\\(255\\)/g, 'VARCHAR(255)');
    sql = sql.replace(/INSERT INTO/g, 'INSERT IGNORE INTO');
    sql = sql.replace(/ON CONFLICT[\\s\\S]*?DO NOTHING/g, '');
    sql = sql.replace(/CAST\\(NULLIF\\(regexp_replace\\(nomor_partai, '\\[\\^0-9\\]', '', 'g'\\), ''\\) AS INTEGER\\)/g, "CAST(NULLIF(REGEXP_REPLACE(nomor_partai, '[^0-9]', ''), '') AS INTEGER)");
    
    const isUpdateReturning = sql.includes("RETURNING *");
    if (isUpdateReturning) {
       sql = sql.replace("RETURNING *", "");
    }

    const [result] = await rawPool!.query(sql, params);
    
    if (Array.isArray(result)) {
      return { rows: result, rowCount: result.length };
    } else {
      const res = result as mysql.ResultSetHeader;
      let rows: any[] = [];
      if (isUpdateReturning && res.affectedRows > 0) {
        const [selectResult] = await rawPool!.query("SELECT * FROM pesilat WHERE id = ?", [params[0]]);
        rows = selectResult as any[];
      }
      return { rows: rows, rowCount: res.affectedRows };
    }
  }
} : null;
`;

code = code.replace('let pgPool: Pool | null = DB_URL ? new Pool({ connectionString: DB_URL }) : null;', wrapper);

fs.writeFileSync('server.ts', code);
console.log("Converted server.ts");
