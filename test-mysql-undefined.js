import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
const DB_URL = process.env.DATABASE_URL || `mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
const pool = mysql.createPool(DB_URL);
async function test() {
  try {
    const [result] = await pool.query("SELECT * FROM pesilat WHERE id = ?", [undefined]);
    console.log(result);
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}
test();
