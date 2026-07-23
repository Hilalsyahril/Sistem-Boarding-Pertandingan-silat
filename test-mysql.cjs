const mysql = require("mysql2/promise");
async function run() {
  try {
    const rawPool = mysql.createPool("mysql://hilalsyahril86_db_boarding:LNCPmTxJZmYtHER4kSYd@localhost/hilalsyahril86_db_boarding");
    const schema = `
      CREATE TABLE IF NOT EXISTS pengaturan_arena (
        id VARCHAR(255) PRIMARY KEY,
        jumlah_arena INTEGER DEFAULT 3
      );
      CREATE TABLE IF NOT EXISTS pesilat (
        id VARCHAR(255) PRIMARY KEY
      );
    `;
    await rawPool.query(schema);
    console.log("Success");
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
