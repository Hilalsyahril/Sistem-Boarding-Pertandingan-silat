
import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import pg from "pg";

// Prevent process crashes on cPanel Passenger
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]:', reason);
});

let DatabaseSync: any = null;
try {
  DatabaseSync = require("node:sqlite").DatabaseSync;
} catch {
  // node:sqlite not supported on Node < 22
}

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

const app = express();

app.use(express.json());

// Method override middleware for cPanel / ModSecurity blocking PUT/DELETE
app.use((req, res, next) => {
  if (req.query._method && req.method === 'POST') {
    req.method = (req.query._method as string).toUpperCase();
  }
  next();
});

let rawPool: mysql.Pool | null = null;
let realPgPool: pg.Pool | null = null;
let pgPool: any = null;

function createJsonFilePool() {
  const jsonPath = path.join(process.cwd(), "local_data.json");
  
  let store: {
    pengaturan_arena: any[];
    pesilat: any[];
    admin_users: any[];
    operator_users: any[];
  } = {
    pengaturan_arena: [{ id: '00000000-0000-0000-0000-000000000001', jumlah_arena: 3, judul_aplikasi: 'SISTEM BOARDING PENCAK SILAT', auto_next: true }],
    pesilat: [],
    admin_users: [{ id: '1', username: 'operatorDB', password: 'silat2026', token: null }],
    operator_users: []
  };

  try {
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed) {
        store = { ...store, ...parsed };
      }
    } else {
      fs.writeFileSync(jsonPath, JSON.stringify(store, null, 2));
    }
  } catch (e: any) {
    console.warn("[JSON DB] Error reading/writing json store:", e.message);
  }

  const saveStore = () => {
    try {
      fs.writeFileSync(jsonPath, JSON.stringify(store, null, 2));
    } catch (e: any) {
      console.warn("[JSON DB] Error saving store:", e.message);
    }
  };

  console.log("[DB] Initialized JSON File DB fallback at:", jsonPath);

  return {
    type: "json",
    query: async (text: string, params: any[] = []) => {
      const trimmed = text.trim();
      const upper = trimmed.toUpperCase();

      // SELECT queries
      if (upper.startsWith("SELECT")) {
        if (upper.includes("FROM PENGATURAN_ARENA")) {
          return { rows: store.pengaturan_arena, rowCount: store.pengaturan_arena.length };
        }
        if (upper.includes("FROM PESILAT")) {
          if (upper.includes("WHERE ID =")) {
            const idParam = params[0];
            const found = store.pesilat.filter(p => p.id == idParam);
            return { rows: found, rowCount: found.length };
          }
          if (upper.includes("WHERE ARENA =")) {
            const arenaParam = params[0];
            const found = store.pesilat.filter(p => p.arena == arenaParam);
            return { rows: found, rowCount: found.length };
          }
          return { rows: store.pesilat, rowCount: store.pesilat.length };
        }
        if (upper.includes("FROM ADMIN_USERS")) {
          if (upper.includes("WHERE USERNAME =") && upper.includes("AND PASSWORD =")) {
            const found = store.admin_users.filter(u => u.username === params[0] && u.password === params[1]);
            return { rows: found, rowCount: found.length };
          }
          if (upper.includes("WHERE USERNAME =")) {
            const found = store.admin_users.filter(u => u.username === params[0]);
            return { rows: found, rowCount: found.length };
          }
          if (upper.includes("WHERE TOKEN =")) {
            const found = store.admin_users.filter(u => u.token === params[0]);
            return { rows: found, rowCount: found.length };
          }
          return { rows: store.admin_users, rowCount: store.admin_users.length };
        }
        if (upper.includes("FROM OPERATOR_USERS")) {
          if (upper.includes("WHERE USERNAME =") && upper.includes("AND PASSWORD =")) {
            const found = store.operator_users.filter(u => u.username === params[0] && u.password === params[1]);
            return { rows: found, rowCount: found.length };
          }
          if (upper.includes("WHERE USERNAME =")) {
            const found = store.operator_users.filter(u => u.username === params[0]);
            return { rows: found, rowCount: found.length };
          }
          if (upper.includes("WHERE TOKEN =")) {
            const found = store.operator_users.filter(u => u.token === params[0]);
            return { rows: found, rowCount: found.length };
          }
          return { rows: store.operator_users, rowCount: store.operator_users.length };
        }
        return { rows: [], rowCount: 0 };
      }

      // INSERT queries
      if (upper.startsWith("INSERT")) {
        if (upper.includes("INTO PESILAT")) {
          const newPesilat: any = {
            id: params[0],
            nomor_partai: params[1],
            nama_pesilat: params[2],
            kontingen: params[3],
            nama_pesilat_biru: params[4],
            kontingen_biru: params[5],
            kelas: params[6],
            kategori: params[7],
            gender: params[8],
            arena: params[9],
            is_playing: params[10],
            timer_duration: params[11],
            timer_seconds_left: params[12],
            timer_running: params[13],
            timer_last_updated_at: params[14],
            is_done: params[15],
            nomor_urut: params[16] || 0
          };
          const idx = store.pesilat.findIndex(p => p.id == newPesilat.id);
          if (idx >= 0) store.pesilat[idx] = newPesilat;
          else store.pesilat.push(newPesilat);
          saveStore();
          return { rows: [newPesilat], rowCount: 1 };
        }
        if (upper.includes("INTO OPERATOR_USERS")) {
          const newOp = { id: params[0], username: params[1], password: params[2], token: null };
          store.operator_users.push(newOp);
          saveStore();
          return { rows: [newOp], rowCount: 1 };
        }
        if (upper.includes("INTO ADMIN_USERS")) {
          const newAdmin = { id: params[0], username: params[1], password: params[2], token: null };
          if (!store.admin_users.some(a => a.username === newAdmin.username)) {
            store.admin_users.push(newAdmin);
            saveStore();
          }
          return { rows: [newAdmin], rowCount: 1 };
        }
        if (upper.includes("INTO PENGATURAN_ARENA")) {
          const newConf = { id: params[0], jumlah_arena: params[1], judul_aplikasi: 'SISTEM BOARDING PENCAK SILAT', auto_next: true };
          if (!store.pengaturan_arena.some(c => c.id === newConf.id)) {
            store.pengaturan_arena.push(newConf);
            saveStore();
          }
          return { rows: [newConf], rowCount: 1 };
        }
      }

      // UPDATE queries
      if (upper.startsWith("UPDATE")) {
        if (upper.includes("PENGATURAN_ARENA")) {
          if (store.pengaturan_arena.length > 0) {
            store.pengaturan_arena[0].jumlah_arena = params[0];
            store.pengaturan_arena[0].judul_aplikasi = params[1];
            store.pengaturan_arena[0].auto_next = params[2];
            saveStore();
          }
          return { rows: store.pengaturan_arena, rowCount: 1 };
        }
        if (upper.includes("PESILAT")) {
          const id = params[params.length - 1];
          const item = store.pesilat.find(p => p.id == id);
          if (item) {
            if (upper.includes("IS_PLAYING =") && upper.includes("TIMER_SECONDS_LEFT =")) {
              item.is_playing = params[0];
              item.timer_seconds_left = params[1];
              item.timer_running = params[2];
              item.timer_last_updated_at = params[3];
            } else if (upper.includes("TIMER_SECONDS_LEFT =") && upper.includes("TIMER_RUNNING =")) {
              item.timer_seconds_left = params[0];
              item.timer_running = params[1];
              item.timer_last_updated_at = params[2];
            } else if (upper.includes("IS_DONE =")) {
              item.is_done = params[0];
              item.is_playing = params[1];
              item.timer_running = params[2];
            } else if (upper.includes("NOMOR_PARTAI =")) {
              item.nomor_partai = params[0];
              item.nama_pesilat = params[1];
              item.kontingen = params[2];
              item.nama_pesilat_biru = params[3];
              item.kontingen_biru = params[4];
              item.kelas = params[5];
              item.kategori = params[6];
              item.gender = params[7];
              item.arena = params[8];
              item.timer_duration = params[9];
              item.timer_seconds_left = params[10];
              if (params[11] !== undefined) item.nomor_urut = params[11];
            }
            saveStore();
            return { rows: [item], rowCount: 1 };
          }
        }
        if (upper.includes("ADMIN_USERS")) {
          if (upper.includes("SET TOKEN =")) {
            const u = store.admin_users.find(x => x.id == params[1]);
            if (u) u.token = params[0];
          } else if (upper.includes("SET PASSWORD =")) {
            const u = store.admin_users.find(x => x.username == params[1]);
            if (u) u.password = params[0];
          }
          saveStore();
          return { rows: [], rowCount: 1 };
        }
        if (upper.includes("OPERATOR_USERS")) {
          if (upper.includes("SET TOKEN =")) {
            const u = store.operator_users.find(x => x.id == params[1]);
            if (u) u.token = params[0];
          } else if (upper.includes("SET PASSWORD =")) {
            const u = store.operator_users.find(x => x.id == params[1]);
            if (u) u.password = params[0];
          }
          saveStore();
          return { rows: [], rowCount: 1 };
        }
      }

      // DELETE queries
      if (upper.startsWith("DELETE")) {
        if (upper.includes("FROM PESILAT")) {
          if (upper.includes("WHERE ID =")) {
            store.pesilat = store.pesilat.filter(p => p.id != params[0]);
          } else {
            store.pesilat = [];
          }
          saveStore();
          return { rows: [], rowCount: 1 };
        }
        if (upper.includes("FROM OPERATOR_USERS")) {
          if (upper.includes("WHERE ID =")) {
            store.operator_users = store.operator_users.filter(u => u.id != params[0]);
          }
          saveStore();
          return { rows: [], rowCount: 1 };
        }
      }

      return { rows: [], rowCount: 0 };
    }
  };
}

function createSqlitePool() {
  try {
    if (!DatabaseSync) {
      console.warn("[DB] node:sqlite is not supported on this Node.js runtime version.");
      return null;
    }
    const dbPath = path.join(process.cwd(), "local_data.sqlite");
    const sqliteDb = new DatabaseSync(dbPath);
    console.log("[DB] Using local SQLite database at:", dbPath);
    return {
      type: "sqlite",
      query: async (text: string, params: any[] = []) => {
        let sql = text.replace(/\$([0-9]+)/g, "?$1");
        
        sql = sql.replace(/VARCHAR\(255\)/g, 'TEXT');
        sql = sql.replace(/BIGINT/g, 'INTEGER');
        sql = sql.replace(/BOOLEAN DEFAULT false/g, 'INTEGER DEFAULT 0');
        sql = sql.replace(/BOOLEAN DEFAULT true/g, 'INTEGER DEFAULT 1');
        sql = sql.replace(/BOOLEAN/g, 'INTEGER');
        sql = sql.replace(/INSERT IGNORE INTO/g, 'INSERT OR IGNORE INTO');

        const trimmed = sql.trim().toUpperCase();
        const isSelect = trimmed.startsWith("SELECT") || sql.includes("RETURNING");

        const safeParams = params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);

        const stmt = sqliteDb.prepare(sql);
        if (isSelect) {
          const rows = stmt.all(...safeParams) as any[];
          return { rows, rowCount: rows.length };
        } else {
          const result = stmt.run(...safeParams);
          return { rows: [], rowCount: result.changes };
        }
      }
    };
  } catch (e: any) {
    console.error("[DB] Failed to create SQLite pool:", e.message || e);
    return null;
  }
}

async function setupDatabaseConnection() {
  dotenv.config({ path: path.join(__dirname, ".env") });
  dotenv.config({ path: path.join(process.cwd(), ".env") });

  const envDbUser = process.env.DB_USER || process.env.DB_USERNAME;
  const envDbPass = process.env.DB_PASS || process.env.DB_PASSWORD || "";
  const envDbName = process.env.DB_NAME || process.env.DB_DATABASE;
  const envDbHost = process.env.DB_HOST;
  const envDbPort = parseInt(process.env.DB_PORT || "3306", 10);
  const envDbUrl = process.env.DATABASE_URL || (envDbHost && envDbName && envDbUser ? `mysql://${envDbUser}:${envDbPass}@${envDbHost}:${envDbPort}/${envDbName}` : undefined);

  if (envDbUrl) {
    try {
      if (envDbUrl.startsWith('postgres://') || envDbUrl.startsWith('postgresql://')) {
        realPgPool = new pg.Pool({ connectionString: envDbUrl, connectionTimeoutMillis: 3000 });
        realPgPool.on('error', (err) => console.error('PostgreSQL Pool Error:', err.message));
        const client = await Promise.race([
          realPgPool.connect(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("connect ETIMEDOUT")), 3000))
        ]);
        client.release();
        pgPool = {
          type: "postgres",
          query: async (text: string, params: any[] = []) => realPgPool!.query(text, params)
        };
        console.log("Connected to PostgreSQL Database successfully.");
        return;
      } else {
        const poolConfig = {
          host: envDbHost || "localhost",
          port: envDbPort || 3306,
          user: envDbUser,
          password: envDbPass,
          database: envDbName,
          connectTimeout: 3000,
          waitForConnections: true,
          connectionLimit: 10
        };
        rawPool = mysql.createPool(poolConfig);
        rawPool.on('error', (err) => console.error('MySQL Pool Error:', err.message));

        await Promise.race([
          rawPool.query("SELECT 1"),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("connect ETIMEDOUT")), 3000))
        ]);

        pgPool = {
          type: "mysql",
          query: async (text: string, params: any[] = []) => {
            let newParams: any[] = [];
            let hasParams = false;
            let sql = text.replace(/\$([0-9]+)/g, (match, p1) => {
              hasParams = true;
              const index = parseInt(p1, 10) - 1;
              newParams.push(params[index]);
              return "?";
            });
            
            let finalParams = hasParams ? newParams : params;
            sql = sql.replace(/VARCHAR\(255\)/g, 'VARCHAR(255)');
            sql = sql.replace(/INSERT INTO/g, 'INSERT IGNORE INTO');
            sql = sql.replace(/ON CONFLICT[\s\S]*?DO NOTHING/g, '');
            sql = sql.replace(/CAST\(NULLIF\(regexp_replace\(nomor_partai, '\[\^0-9\]', '', 'g'\), ''\) AS INTEGER\)/g, "CAST(NULLIF(REGEXP_REPLACE(nomor_partai, '[^0-9]', ''), '') AS INTEGER)");
            
            const isUpdateReturning = sql.includes("RETURNING *");
            if (isUpdateReturning) {
               sql = sql.replace("RETURNING *", "");
            }

            const [result] = await rawPool!.query(sql, finalParams);
            
            if (Array.isArray(result)) {
              return { rows: result, rowCount: result.length };
            } else {
              const res = result as mysql.ResultSetHeader;
              let rows: any[] = [];
              if (isUpdateReturning && res.affectedRows > 0) {
                try {
                  const [selectResult] = await rawPool!.query("SELECT * FROM pesilat WHERE id = ?", [params[0]]);
                  rows = selectResult as any[];
                } catch {}
              }
              return { rows: rows, rowCount: res.affectedRows };
            }
          }
        };
        console.log("Connected to MySQL/MariaDB Database successfully.");
        return;
      }
    } catch (err: any) {
      console.warn(`[DB Connection Warning] Could not connect to MariaDB/MySQL (${err.message || err}). Falling back to local JSON store.`);
    }
  } else {
    console.log("No MySQL/MariaDB credentials set in env. Initializing local JSON store.");
  }

  pgPool = createSqlitePool() || createJsonFilePool();
}

async function initDb() {
  if (!pgPool) return;
  
  try {
    await pgPool.query(`CREATE TABLE IF NOT EXISTS pengaturan_arena (
        id VARCHAR(255) PRIMARY KEY,
        jumlah_arena INTEGER DEFAULT 3
      )`);
  } catch(e: any) { console.error("Create pengaturan_arena table error:", e.message); }

  try {
    await pgPool.query(`ALTER TABLE pengaturan_arena ADD COLUMN judul_aplikasi VARCHAR(255) DEFAULT 'SISTEM BOARDING PENCAK SILAT'`);
  } catch(e) {}
  try {
    await pgPool.query(`ALTER TABLE pengaturan_arena ADD COLUMN auto_next BOOLEAN DEFAULT true`);
  } catch(e) {}

  try {
    await pgPool.query(`CREATE TABLE IF NOT EXISTS pesilat (
        id VARCHAR(255) PRIMARY KEY,
        nomor_urut INTEGER DEFAULT 0,
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
      )`);
  } catch(e: any) { console.error("Create pesilat table error:", e.message); }

  try {
    await pgPool.query(`ALTER TABLE pesilat ADD COLUMN nomor_urut INTEGER DEFAULT 0`);
  } catch(e) {}

  try {
    await pgPool.query(`CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        token VARCHAR(255)
      )`);
  } catch(e: any) { console.error("Create admin_users error:", e.message); }

  try {
    await pgPool.query(`CREATE TABLE IF NOT EXISTS operator_users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        token VARCHAR(255)
      )`);
  } catch(e: any) { console.error("Create operator_users error:", e.message); }
  
  try {
    const existing = await pgPool.query(`SELECT * FROM pengaturan_arena WHERE id = $1`, ['00000000-0000-0000-0000-000000000001']);
    if (!existing.rows || existing.rows.length === 0) {
      if (pgPool.type === "sqlite") {
        await pgPool.query(`INSERT OR IGNORE INTO pengaturan_arena (id, jumlah_arena) VALUES ('00000000-0000-0000-0000-000000000001', 3);`);
      } else {
        await pgPool.query(`INSERT INTO pengaturan_arena (id, jumlah_arena) VALUES ('00000000-0000-0000-0000-000000000001', 3);`);
      }
    }
  } catch (e: any) { console.error("Insert default pengaturan_arena error:", e.message); }
  
  try {
    const adminCheck = await pgPool.query(`SELECT * FROM admin_users WHERE username = $1`, ['operatorDB']);
    if (!adminCheck.rows || adminCheck.rows.length === 0) {
      if (pgPool.type === "sqlite") {
        await pgPool.query(`INSERT OR IGNORE INTO admin_users (id, username, password) VALUES ('1', 'operatorDB', 'silat2026');`);
      } else {
        await pgPool.query(`INSERT INTO admin_users (id, username, password) VALUES ('1', 'operatorDB', 'silat2026');`);
      }
    }
  } catch (e: any) { console.error("Insert default admin user error:", e.message); }
}

// Convert SQLite integer booleans to true booleans
function mapPesilat(row: any) {
  if (!row) return null;
  const is_playing = Boolean(row.is_playing);
  const timer_running = Boolean(row.timer_running);
  let timer_seconds_left = row.timer_seconds_left;
  let timer_last_updated_at = row.timer_last_updated_at ? Number(row.timer_last_updated_at) : undefined;
  
  if (timer_running && timer_last_updated_at && timer_seconds_left > 0) {
    const elapsed = Math.floor((Date.now() - timer_last_updated_at) / 1000);
    timer_seconds_left = Math.max(0, timer_seconds_left - elapsed);
    timer_last_updated_at = Date.now();
  }

  return {
    ...row,
    is_playing,
    timer_running: timer_seconds_left > 0 ? timer_running : false,
    timer_seconds_left,
    is_done: Boolean(row.is_done),
    timer_last_updated_at
  };
}

async function getPengaturanArena() {
  if (!pgPool) return { jumlah_arena: 3, judul_aplikasi: 'SISTEM BOARDING PENCAK SILAT', auto_next: true };
  const res = await pgPool.query("SELECT jumlah_arena, judul_aplikasi, auto_next FROM pengaturan_arena WHERE id = '00000000-0000-0000-0000-000000000001'");
  return {
    jumlah_arena: res.rows[0]?.jumlah_arena || 3,
    judul_aplikasi: res.rows[0]?.judul_aplikasi || 'SISTEM BOARDING PENCAK SILAT',
    auto_next: res.rows[0]?.auto_next !== undefined ? (res.rows[0].auto_next === 1 || res.rows[0].auto_next === true || res.rows[0].auto_next === 'true') : true
  };
}

async function setPengaturanArena(val: number, judul: string, autoNext: boolean) {
  if (!pgPool) return;
  await pgPool.query("UPDATE pengaturan_arena SET jumlah_arena = $1, judul_aplikasi = $2, auto_next = $3 WHERE id = '00000000-0000-0000-0000-000000000001'", [val, judul, autoNext]);
}

async function getPesilats() {
  if (!pgPool) return [];
  const res = await pgPool.query("SELECT * FROM pesilat");
  const rows = res.rows.map(mapPesilat);
  return rows.sort((a, b) => {
    if (a.arena !== b.arena) {
      return (Number(a.arena) || 0) - (Number(b.arena) || 0);
    }
    const numA = Number(a.nomor_urut) || 0;
    const numB = Number(b.nomor_urut) || 0;
    if (numA !== numB) return numA - numB;
    
    // Fallback to nomor_partai
    const pA = parseInt((a.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
    const pB = parseInt((b.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
    return pA - pB;
  });
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

// API Endpoints
// Admin Auth Endpoints
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!pgPool) return res.status(200).json({ error: "Database not connected", is_500: true });
    
    const result = await pgPool.query("SELECT * FROM admin_users WHERE username = $1 AND password = $2", [username, password]);
    if (result.rows.length > 0) {
      const token = Date.now().toString() + Math.random().toString(36).substring(2);
      await pgPool.query("UPDATE admin_users SET token = $1 WHERE id = $2", [token, result.rows[0].id]);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: "Username atau Password salah" });
    }
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.post("/api/admin/verify", async (req, res) => {
  try {
    const { token } = req.body;
    if (!pgPool) return res.status(200).json({ error: "Database not connected", is_500: true });
    
    if (!token) return res.status(401).json({ error: "No token" });
    const result = await pgPool.query("SELECT * FROM admin_users WHERE token = $1", [token]);
    if (result.rows.length > 0) {
      res.json({ valid: true, username: result.rows[0].username });
    } else {
      res.status(401).json({ valid: false });
    }
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.post("/api/admin/change-password", async (req, res) => {
  try {
    const { token, oldPassword, newPassword } = req.body;
    if (!pgPool) return res.status(200).json({ error: "Database not connected", is_500: true });
    
    const result = await pgPool.query("SELECT * FROM admin_users WHERE token = $1 AND password = $2", [token, oldPassword]);
    if (result.rows.length > 0) {
      await pgPool.query("UPDATE admin_users SET password = $1 WHERE id = $2", [newPassword, result.rows[0].id]);
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Password lama salah" });
    }
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.get("/api/admin/operators", async (req, res) => {
  try {
    if (!pgPool) return res.status(200).json({ error: "Database not connected", is_500: true });
    const result = await pgPool.query("SELECT id, username FROM operator_users");
    res.json(result.rows);
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.post("/api/admin/operators", async (req, res) => {
  try {
    if (!pgPool) return res.status(200).json({ error: "Database not connected", is_500: true });
    const { username, password } = req.body;
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    await pgPool.query("INSERT INTO operator_users (id, username, password) VALUES ($1, $2, $3)", [id, username, password]);
    res.json({ success: true, id, username });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.delete("/api/admin/operators/:id", async (req, res) => {
  try {
    if (!pgPool) return res.status(200).json({ error: "Database not connected", is_500: true });
    await pgPool.query("DELETE FROM operator_users WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.put("/api/admin/operators/:id/password", async (req, res) => {
  try {
    if (!pgPool) return res.status(200).json({ error: "Database not connected", is_500: true });
    const { password } = req.body;
    await pgPool.query("UPDATE operator_users SET password = $1 WHERE id = $2", [password, req.params.id]);
    res.json({ success: true });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.post("/api/operator/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!pgPool) return res.status(200).json({ error: "Database not connected", is_500: true });
    
    const result = await pgPool.query("SELECT * FROM operator_users WHERE username = $1 AND password = $2", [username, password]);
    if (result.rows.length > 0) {
      const token = Date.now().toString() + Math.random().toString(36).substring(2);
      await pgPool.query("UPDATE operator_users SET token = $1 WHERE id = $2", [token, result.rows[0].id]);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: "Username atau password salah" });
    }
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.post("/api/operator/verify", async (req, res) => {
  try {
    const { token } = req.body;
    if (!pgPool) return res.status(200).json({ error: "Database not connected", is_500: true });
    
    if (!token) return res.status(401).json({ error: "No token" });
    const result = await pgPool.query("SELECT * FROM operator_users WHERE token = $1", [token]);
    if (result.rows.length > 0) {
      res.json({ valid: true, username: result.rows[0].username });
    } else {
      res.status(401).json({ valid: false });
    }
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.get("/api/config-status", (req, res) => {
  res.json({ configured: !!pgPool, supabaseUrl: null, supabaseAnonKey: null, mode: "postgres" });
});

app.get("/api/pesilat", async (req, res) => {
  try {
    const list = await getPesilats();
    res.json(list);
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.post("/api/pesilat", async (req, res) => {
  try {
    const newPesilat = { ...req.body, id: req.body.id || Date.now().toString(), timer_last_updated_at: Date.now() };
    await insertPesilat(newPesilat);
    res.json(newPesilat);
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.post("/api/pesilat/batch", async (req, res) => {
  try {
    const { items } = req.body;
    for (const item of items) {
      await insertPesilat({ ...item, id: item.id || Date.now().toString() + Math.random().toString(), timer_last_updated_at: Date.now() });
    }
    res.json(await getPesilats());
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.put("/api/pesilat/:id", async (req, res) => {
  try {
    await updatePesilat(req.params.id, req.body);
    res.json(await getPesilatById(req.params.id));
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.put("/api/pesilat/:id/play", async (req, res) => {
  try {
    const id = req.params.id;
    const p = await getPesilatById(id);
    if (!p) return res.status(404).json({ error: "Not found" });
    
    // Atomically set all other matches in this arena to not playing
    if (pgPool) {
      await pgPool.query(
        "UPDATE pesilat SET is_playing = false, timer_running = false, is_done = true WHERE arena = $1 AND id != $2 AND is_playing = true",
        [p.arena, id]
      );
    }
    
    const pengaturan = await getPengaturanArena();
    const autoNext = pengaturan.auto_next;

    await updatePesilat(id, { 
      is_playing: true, 
      timer_running: autoNext, 
      timer_last_updated_at: Date.now(), 
      is_done: false,
      timer_seconds_left: p.timer_seconds_left || p.timer_duration || 180
    });
    
    res.json(await getPesilatById(id));
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.put("/api/pesilat/:id/stop", async (req, res) => {
  try {
    await updatePesilat(req.params.id, { is_playing: false, timer_running: false, is_done: true, timer_seconds_left: 0 });
    res.json(await getPesilatById(req.params.id));
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.put("/api/pesilat/:id/timer", async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.timer_running === true) {
      updateData.timer_last_updated_at = Date.now();
    }
    await updatePesilat(req.params.id, updateData);
    res.json(await getPesilatById(req.params.id));
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.put("/api/pesilat/:id/timeout", async (req, res) => {
  try {
    const id = req.params.id;
    
    if (!pgPool) return res.status(200).json({ error: "Database not connected", is_500: true });
    
    // Atomic check-and-set to prevent race conditions from multiple clients triggering timeout concurrently
    
    const pengaturan = await getPengaturanArena();
    const dbAutoNext = pengaturan.auto_next;
    const autoNext = (req.query.autoNext !== "false") && dbAutoNext;
    let queryStr = "";
    if (autoNext) {
      queryStr = "UPDATE pesilat SET is_playing = false, timer_running = false, is_done = true, timer_seconds_left = 0 WHERE id = $1 AND is_playing = true RETURNING *";
    } else {
      queryStr = "UPDATE pesilat SET timer_running = false, timer_seconds_left = 0 WHERE id = $1 AND is_playing = true RETURNING *";
    }
    const updateRes = await pgPool.query(queryStr, [id]);


    if (updateRes.rowCount === 0) {
      // Already processed or not playing
      const currentP = await getPesilatById(id);
      if (!currentP) return res.status(404).json({ error: "Not found" });
      return res.json(currentP);
    }

    const p = mapPesilat(updateRes.rows[0]);

    const all = await getPesilats();
    const arenaMatches = all.filter(match => Number(match.arena) === Number(p.arena)).sort((a, b) => {
      const numA = Number(a.nomor_urut) || 0;
      const numB = Number(b.nomor_urut) || 0;
      if (numA !== numB) return numA - numB;
      const pA = parseInt((a.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      const pB = parseInt((b.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      return pA - pB;
    });
    const currentIndex = arenaMatches.findIndex(match => match.id === id);
    if (autoNext && currentIndex !== -1) {
      // Find the first match in the same arena after the current one that is not done and not playing
      const nextMatch = arenaMatches.slice(currentIndex + 1).find(m => !m.is_done && !m.is_playing);
      if (nextMatch) {
        await updatePesilat(nextMatch.id, { is_playing: true, timer_running: true, timer_last_updated_at: Date.now(), is_done: false, timer_seconds_left: nextMatch.timer_seconds_left || nextMatch.timer_duration || 180 });
      }
    }

    res.json(await getPesilatById(id));
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});


app.put("/api/pesilat/timer-all", async (req, res) => {
  try {
    const { timer_running } = req.body;
    if (pgPool) {
      if (timer_running) {
        await pgPool.query(
          "UPDATE pesilat SET timer_running = true, timer_last_updated_at = $1 WHERE is_playing = true",
          [Date.now()]
        );
      } else {
        await pgPool.query(
          "UPDATE pesilat SET timer_running = false WHERE is_playing = true"
        );
      }
    }
    res.json({ success: true });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.delete("/api/pesilat/:id", async (req, res) => {
  try {
    await deletePesilat(req.params.id);
    res.json({ success: true });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.delete("/api/pesilat", async (req, res) => {
  try {
    await deleteAllPesilat();
    res.json({ success: true });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.post("/api/pesilat/delete-batch", async (req, res) => {
  try {
    for (const id of req.body.ids || []) {
      await deletePesilat(id);
    }
    res.json({ success: true });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.get("/api/pengaturan_arena", async (req, res) => {
  try {
    const config = await getPengaturanArena();
    res.json([{ id: "00000000-0000-0000-0000-000000000001", ...config }]);
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.put("/api/pengaturan_arena", async (req, res) => {
  try {
    const autoNext = req.body.auto_next !== undefined ? req.body.auto_next : true;
    await setPengaturanArena(req.body.jumlah_arena || 3, req.body.judul_aplikasi || 'SISTEM BOARDING PENCAK SILAT', autoNext);
    const config = await getPengaturanArena();
    res.json({ id: "00000000-0000-0000-0000-000000000001", ...config });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const url = "https://tiktok-tts.weilnet.workers.dev/api/generation";
    const ttsRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        voice: "id_001"
      })
    });
    
    const data = await ttsRes.json();
    if (!data.success) throw new Error("TikTok TTS failed: " + data.error);
    
    res.json({ audio: data.data });
  } catch (error: any) {
    res.status(200).json({ error: error.message, is_500: true });
  }
});

let activeAnnouncements: any[] = [];

app.post("/api/announce", (req, res) => {
  try {
    const body = req.body || {};
    activeAnnouncements.push({ id: Date.now().toString(), ...body });
    res.json({ success: true });
  } catch (error: any) {
    res.status(200).json({ error: error.message, is_500: true });
  }
});

app.get("/api/announce", (req, res) => {
  try {
    res.json(activeAnnouncements || []);
  } catch (error: any) {
    res.status(200).json({ error: error.message, is_500: true });
  }
});

app.delete("/api/announce/:id", (req, res) => {
  try {
    activeAnnouncements = activeAnnouncements.filter(a => a && a.id !== req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(200).json({ error: error.message, is_500: true });
  }
});

app.get("/api/download-source", (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'source_code.zip');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'source_code.zip');
  } else {
    res.status(404).send('File not found');
  }
});

app.get("/api/download-zip", (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'deploy_cpanel.zip');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'deploy_cpanel.zip');
  } else {
    res.status(404).send('File not found');
  }
});

app.post("/api/arena/:arena/next", async (req, res) => {
  try {
    const arenaNum = parseInt(req.params.arena, 10);
    const all = await getPesilats();
    const arenaMatches = all.filter(match => Number(match.arena) === arenaNum).sort((a, b) => {
      const numA = Number(a.nomor_urut) || 0;
      const numB = Number(b.nomor_urut) || 0;
      if (numA !== numB) return numA - numB;
      const pA = parseInt((a.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      const pB = parseInt((b.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      return pA - pB;
    });
    
    const pengaturan = await getPengaturanArena();
    const autoNext = pengaturan.auto_next;

    // Find currently playing
    const currentPlaying = arenaMatches.find(m => m.is_playing);
    let currentIndex = -1;
    
    if (currentPlaying) {
       await updatePesilat(currentPlaying.id, { is_playing: false, timer_running: false, is_done: true, timer_seconds_left: 0 });
       currentIndex = arenaMatches.findIndex(m => m.id === currentPlaying.id);
    }
    
    // Find next match
    let nextMatch;
    if (currentIndex !== -1) {
       nextMatch = arenaMatches.slice(currentIndex + 1).find(m => !m.is_done && !m.is_playing);
    } else {
       nextMatch = arenaMatches.find(m => !m.is_done && !m.is_playing);
    }
    
    if (nextMatch) {
       await updatePesilat(nextMatch.id, { is_playing: true, timer_running: autoNext, timer_last_updated_at: Date.now(), is_done: false, timer_seconds_left: nextMatch.timer_seconds_left || nextMatch.timer_duration || 180 });
    }
    
    res.json({ success: true });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.post("/api/arena/:arena/undo", async (req, res) => {
  try {
    const arenaNum = parseInt(req.params.arena, 10);
    const all = await getPesilats();
    const arenaMatches = all.filter(match => Number(match.arena) === arenaNum).sort((a, b) => {
      const numA = Number(a.nomor_urut) || 0;
      const numB = Number(b.nomor_urut) || 0;
      if (numA !== numB) return numB - numA;
      const pA = parseInt((a.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      const pB = parseInt((b.nomor_partai || "").toString().replace(/[^0-9]/g, ''), 10) || 0;
      return pB - pA;
    });
    
    // Find currently playing
    const currentPlaying = arenaMatches.find(m => m.is_playing);
    
    // Find the last finished match
    const lastDoneMatch = arenaMatches.find(m => m.is_done);
    const pengaturan = await getPengaturanArena();
    const autoNext = pengaturan.auto_next !== undefined ? pengaturan.auto_next : true;

    if (currentPlaying) {
       // Revert currently playing to queue
       await updatePesilat(currentPlaying.id, { is_playing: false, timer_running: false, is_done: false });
    }
    
    if (lastDoneMatch) {
       // Set last done match back to playing
       await updatePesilat(lastDoneMatch.id, { is_playing: true, timer_running: autoNext, timer_last_updated_at: Date.now(), is_done: false, timer_seconds_left: lastDoneMatch.timer_duration || 120 });
    }
    
    res.json({ success: true });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === "production" || !fs.existsSync(path.join(process.cwd(), "vite.config.ts"));
  if (!isProd) {
    const viteModule = "vite";
    const { createServer: createViteServer } = await import(viteModule);
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = typeof __dirname !== "undefined" ? __dirname : path.join(process.cwd(), "dist");
    
    // Fallback static paths for robust cPanel deployment
    const rootPath = process.cwd();
    app.use(express.static(distPath));
    app.use(express.static(rootPath));
    app.use('/assets', express.static(path.join(distPath, 'assets')));
    app.use('/assets', express.static(path.join(rootPath, 'assets')));
    app.use('/assets', express.static(path.join(rootPath, 'dist', 'assets')));
    
    app.get("/api/debug-paths", (req, res) => {
      res.json({
        __dirname: typeof __dirname !== "undefined" ? __dirname : "undefined",
        cwd: process.cwd(),
        distPath,
        filesInDist: fs.existsSync(distPath) ? fs.readdirSync(distPath) : null,
        filesInAssets: fs.existsSync(path.join(distPath, 'assets')) ? fs.readdirSync(path.join(distPath, 'assets')) : null,
        filesInRootAssets: fs.existsSync(path.join(rootPath, 'assets')) ? fs.readdirSync(path.join(rootPath, 'assets')) : null
      });
    });

    // Fallback handler for unmatched /api/* routes so they NEVER return HTML index.html
    app.use("/api/*", (req, res) => {
      res.status(404).json({ error: "API route not found", path: req.originalUrl, is_500: false });
    });

    // Global Express JSON error handler to guarantee API errors return JSON instead of HTML
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error("[Global Server Error]:", err);
      if (res.headersSent) {
        return next(err);
      }
      res.status(200).json({ error: err?.message || "Internal Server Error", is_500: true });
    });

    app.get("*", (req, res) => {
      const p1 = path.join(distPath, "index.html");
      const p2 = path.join(distPath, "dist", "index.html");
      const p3 = path.join(process.cwd(), "dist", "index.html");
      const p4 = path.join(process.cwd(), "index.html");
      if (fs.existsSync(p1)) return res.sendFile(p1);
      if (fs.existsSync(p2)) return res.sendFile(p2);
      if (fs.existsSync(p3)) return res.sendFile(p3);
      if (fs.existsSync(p4)) return res.sendFile(p4);
      res.status(404).send("index.html not found");
    });
  }

  // Start HTTP server immediately
  if (process.env.PORT) {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port/socket ${process.env.PORT}`);
    });
  } else {
    app.listen(3000, "0.0.0.0", () => {
      console.log(`Server running at http://0.0.0.0:3000`);
    });
  }

  // Asynchronously setup DB connection and tables in background without blocking server startup
  setupDatabaseConnection()
    .then(() => initDb())
    .catch((err) => console.error("Database setup or init error:", err.message || err));
}

startServer();
