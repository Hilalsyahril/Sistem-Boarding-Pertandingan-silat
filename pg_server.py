with open('server.ts', 'r') as f:
    code = f.read()

# Replace top imports and initialization
import_repl = """import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { Pool } from "pg";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL is not set. Please set it to a valid PostgreSQL connection string in .env");
}

let pgPool: Pool | null = DB_URL ? new Pool({ connectionString: DB_URL }) : null;

if (pgPool) {
  console.log("Using PostgreSQL Database");
} else {
  console.log("Waiting for DATABASE_URL...");
}

async function initDb() {
  if (!pgPool) return;
  const schema = `
    CREATE TABLE IF NOT EXISTS pengaturan_arena (
      id VARCHAR(255) PRIMARY KEY,
      jumlah_arena INTEGER DEFAULT 3
    );
    CREATE TABLE IF NOT EXISTS pesilat (
      id VARCHAR(255) PRIMARY KEY,
      nomor_partai VARCHAR(255),
      nama_pesilat VARCHAR(255),
      kontingen VARCHAR(255),
      nama_pesilat_biru VARCHAR(255),
      kontingen_biru VARCHAR(255),
      kelas VARCHAR(255),
      kategori VARCHAR(255),
      gender VARCHAR(255),
      arena INTEGER,
      is_playing BOOLEAN DEFAULT false,
      timer_duration INTEGER,
      timer_seconds_left INTEGER,
      timer_running BOOLEAN DEFAULT false,
      timer_last_updated_at BIGINT,
      is_done BOOLEAN DEFAULT false
    );
  `;
  await pgPool.query(schema);
  await pgPool.query(`INSERT INTO pengaturan_arena (id, jumlah_arena) VALUES ('00000000-0000-0000-0000-000000000001', 3) ON CONFLICT (id) DO NOTHING;`);
}

// Convert SQLite integer booleans to true booleans
function mapPesilat(row: any) {
  if (!row) return null;
  return {
    ...row,
    is_playing: Boolean(row.is_playing),
    timer_running: Boolean(row.timer_running),
    is_done: Boolean(row.is_done),
    timer_last_updated_at: row.timer_last_updated_at ? Number(row.timer_last_updated_at) : undefined
  };
}

async function getJumlahArena() {
  if (!pgPool) return 3;
  const res = await pgPool.query("SELECT jumlah_arena FROM pengaturan_arena WHERE id = '00000000-0000-0000-0000-000000000001'");
  return res.rows[0]?.jumlah_arena || 3;
}

async function setJumlahArena(val: number) {
  if (!pgPool) return;
  await pgPool.query("UPDATE pengaturan_arena SET jumlah_arena = $1 WHERE id = '00000000-0000-0000-0000-000000000001'", [val]);
}

async function getPesilats() {
  if (!pgPool) return [];
  const res = await pgPool.query("SELECT * FROM pesilat ORDER BY arena, id");
  return res.rows.map(mapPesilat);
}

async function getPesilatById(id: string) {
  if (!pgPool) return null;
  const res = await pgPool.query("SELECT * FROM pesilat WHERE id = $1", [id]);
  return mapPesilat(res.rows[0]);
}

async function insertPesilat(p: any) {
  if (!pgPool) return;
  await pgPool.query(`
    INSERT INTO pesilat (
      id, nomor_partai, nama_pesilat, kontingen, nama_pesilat_biru, kontingen_biru,
      kelas, kategori, gender, arena, is_playing, timer_duration, timer_seconds_left,
      timer_running, timer_last_updated_at, is_done
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
  `, [
    p.id, p.nomor_partai, p.nama_pesilat, p.kontingen, p.nama_pesilat_biru || "", p.kontingen_biru || "",
    p.kelas, p.kategori, p.gender, p.arena, p.is_playing ? true : false, p.timer_duration, p.timer_seconds_left,
    p.timer_running ? true : false, p.timer_last_updated_at || null, p.is_done ? true : false
  ]);
}

async function updatePesilat(id: string, data: any) {
  if (!pgPool) return;
  const keys = Object.keys(data);
  if (keys.length === 0) return;
  
  const sets = keys.map((k, i) => `${k} = $${i + 2}`);
  const values = keys.map(k => data[k]);
  await pgPool.query(`UPDATE pesilat SET ${sets.join(", ")} WHERE id = $1`, [id, ...values]);
}

async function deletePesilat(id: string) {
  if (!pgPool) return;
  await pgPool.query("DELETE FROM pesilat WHERE id = $1", [id]);
}

async function deleteAllPesilat() {
  if (!pgPool) return;
  await pgPool.query("DELETE FROM pesilat");
}

// API Endpoints"""

import re
code = re.sub(
    r'^import express from "express";[\s\S]*?// API Endpoints',
    import_repl,
    code,
    flags=re.MULTILINE
)

# Update the config-status endpoint to return postgres mode
code = re.sub(
    r'mode: isPg \? "postgres" : "local_sqlite"',
    '"postgres"',
    code
)

# For config-status endpoint, change it
code = re.sub(
    r'app\.get\("/api/config-status", \(req, res\) => \{[\s\S]*?\}\);',
    '''app.get("/api/config-status", (req, res) => {
  res.json({ configured: !!pgPool, supabaseUrl: null, supabaseAnonKey: null, mode: "postgres" });
});''',
    code
)


with open('server.ts', 'w') as f:
    f.write(code)
