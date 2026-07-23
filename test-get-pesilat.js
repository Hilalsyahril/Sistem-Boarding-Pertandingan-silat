import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
const DB_URL = process.env.DATABASE_URL || `mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
const pool = mysql.createPool(DB_URL);
async function test() {
  const [result] = await pool.query("SELECT * FROM pesilat WHERE id = ?", ['1784818501868']);
  console.log(result);
  process.exit(0);
}
test();
