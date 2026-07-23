let sql = `INSERT INTO pengaturan_arena (id, jumlah_arena) VALUES ('00000000-0000-0000-0000-000000000001', 3) ON CONFLICT (id) DO NOTHING;`;
sql = sql.replace(/INSERT INTO/g, 'INSERT IGNORE INTO');
sql = sql.replace(/ON CONFLICT[\s\S]*?DO NOTHING/g, '');
console.log(sql);
