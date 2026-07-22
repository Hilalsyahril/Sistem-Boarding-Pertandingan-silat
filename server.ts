
import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

const DB_URL = process.env.DATABASE_URL || (process.env.DB_HOST ? `mysql://${process.env.DB_USER || "root"}:${process.env.DB_PASS || ""}@${process.env.DB_HOST}/${process.env.DB_NAME || "test"}` : undefined);
if (!DB_URL) {
  console.error("DATABASE_URL is not set. Please set it to a valid PostgreSQL connection string in .env");
}


let rawPool: mysql.Pool | null = DB_URL ? mysql.createPool(DB_URL) : null;

const pgPool = rawPool ? {
  query: async (text: string, params: any[] = []) => {
    let sql = text.replace(/\$[0-9]+/g, "?");
    
    // Postgres to MySQL specific fixes
    sql = sql.replace(/VARCHAR\(255\)/g, 'VARCHAR(255)');
    sql = sql.replace(/INSERT INTO/g, 'INSERT IGNORE INTO');
    sql = sql.replace(/ON CONFLICT[\s\S]*?DO NOTHING/g, '');
    sql = sql.replace(/CAST\(NULLIF\(regexp_replace\(nomor_partai, '\[\^0-9\]', '', 'g'\), ''\) AS INTEGER\)/g, "CAST(NULLIF(REGEXP_REPLACE(nomor_partai, '[^0-9]', ''), '') AS INTEGER)");
    
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
    CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      token VARCHAR(255)
    );
  `;
  await pgPool.query(schema);
  await pgPool.query(`INSERT INTO pengaturan_arena (id, jumlah_arena) VALUES ('00000000-0000-0000-0000-000000000001', 3) ON CONFLICT (id) DO NOTHING;`);
  
  // Seed default admin user
  const adminCheck = await pgPool.query(`SELECT * FROM admin_users WHERE username = 'operatorDB'`);
  if (adminCheck.rows.length === 0) {
    await pgPool.query(`INSERT INTO admin_users (id, username, password) VALUES ('1', 'operatorDB', 'silat2026') ON CONFLICT (username) DO NOTHING;`);
  }
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
  const res = await pgPool.query("SELECT * FROM pesilat ORDER BY arena, CAST(NULLIF(regexp_replace(nomor_partai, '[^0-9]', '', 'g'), '') AS INTEGER)");
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

// API Endpoints
// Admin Auth Endpoints
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!pgPool) return res.status(500).json({ error: "Database not connected" });
    
    const result = await pgPool.query("SELECT * FROM admin_users WHERE username = $1 AND password = $2", [username, password]);
    if (result.rows.length > 0) {
      const token = Date.now().toString() + Math.random().toString(36).substring(2);
      await pgPool.query("UPDATE admin_users SET token = $1 WHERE id = $2", [token, result.rows[0].id]);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: "Username atau Password salah" });
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post("/api/admin/verify", async (req, res) => {
  try {
    const { token } = req.body;
    if (!pgPool) return res.status(500).json({ error: "Database not connected" });
    
    if (!token) return res.status(401).json({ error: "No token" });
    const result = await pgPool.query("SELECT * FROM admin_users WHERE token = $1", [token]);
    if (result.rows.length > 0) {
      res.json({ valid: true, username: result.rows[0].username });
    } else {
      res.status(401).json({ valid: false });
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post("/api/admin/change-password", async (req, res) => {
  try {
    const { token, oldPassword, newPassword } = req.body;
    if (!pgPool) return res.status(500).json({ error: "Database not connected" });
    
    const result = await pgPool.query("SELECT * FROM admin_users WHERE token = $1 AND password = $2", [token, oldPassword]);
    if (result.rows.length > 0) {
      await pgPool.query("UPDATE admin_users SET password = $1 WHERE id = $2", [newPassword, result.rows[0].id]);
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Password lama salah" });
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.get("/api/config-status", (req, res) => {
  res.json({ configured: !!pgPool, supabaseUrl: null, supabaseAnonKey: null, mode: "postgres" });
});

app.get("/api/pesilat", async (req, res) => {
  try {
    const list = await getPesilats();
    res.json(list);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post("/api/pesilat", async (req, res) => {
  try {
    const newPesilat = { ...req.body, id: req.body.id || Date.now().toString(), timer_last_updated_at: Date.now() };
    await insertPesilat(newPesilat);
    res.json(newPesilat);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post("/api/pesilat/batch", async (req, res) => {
  try {
    const { items } = req.body;
    for (const item of items) {
      await insertPesilat({ ...item, id: item.id || Date.now().toString() + Math.random().toString(), timer_last_updated_at: Date.now() });
    }
    res.json(await getPesilats());
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.put("/api/pesilat/:id", async (req, res) => {
  try {
    await updatePesilat(req.params.id, req.body);
    res.json(await getPesilatById(req.params.id));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
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
    
    await updatePesilat(id, { 
      is_playing: true, 
      timer_running: true, 
      timer_last_updated_at: Date.now(), 
      is_done: false,
      timer_seconds_left: p.timer_seconds_left || p.timer_duration || 180
    });
    
    res.json(await getPesilatById(id));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.put("/api/pesilat/:id/stop", async (req, res) => {
  try {
    await updatePesilat(req.params.id, { is_playing: false, timer_running: false, is_done: true, timer_seconds_left: 0 });
    res.json(await getPesilatById(req.params.id));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.put("/api/pesilat/:id/timer", async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.timer_running === true) {
      updateData.timer_last_updated_at = Date.now();
    }
    await updatePesilat(req.params.id, updateData);
    res.json(await getPesilatById(req.params.id));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.put("/api/pesilat/:id/timeout", async (req, res) => {
  try {
    const id = req.params.id;
    
    if (!pgPool) return res.status(500).json({ error: "Database not connected" });
    
    // Atomic check-and-set to prevent race conditions from multiple clients triggering timeout concurrently
    const updateRes = await pgPool.query(
      "UPDATE pesilat SET is_playing = false, timer_running = false, is_done = true, timer_seconds_left = 0 WHERE id = $1 AND is_playing = true RETURNING *",
      [id]
    );

    if (updateRes.rowCount === 0) {
      // Already processed or not playing
      const currentP = await getPesilatById(id);
      if (!currentP) return res.status(404).json({ error: "Not found" });
      return res.json(currentP);
    }

    const p = mapPesilat(updateRes.rows[0]);

    const all = await getPesilats();
    const arenaMatches = all.filter(match => Number(match.arena) === Number(p.arena));
    const currentIndex = arenaMatches.findIndex(match => match.id === id);
    if (currentIndex !== -1) {
      // Find the first match in the same arena after the current one that is not done and not playing
      const nextMatch = arenaMatches.slice(currentIndex + 1).find(m => !m.is_done && !m.is_playing);
      if (nextMatch) {
        await updatePesilat(nextMatch.id, { is_playing: true, timer_running: true, timer_last_updated_at: Date.now(), is_done: false, timer_seconds_left: nextMatch.timer_seconds_left || nextMatch.timer_duration || 180 });
      }
    }

    res.json(await getPesilatById(id));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.delete("/api/pesilat/:id", async (req, res) => {
  try {
    await deletePesilat(req.params.id);
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.delete("/api/pesilat", async (req, res) => {
  try {
    await deleteAllPesilat();
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post("/api/pesilat/delete-batch", async (req, res) => {
  try {
    for (const id of req.body.ids || []) {
      await deletePesilat(id);
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.get("/api/pengaturan_arena", async (req, res) => {
  try {
    res.json([{ id: "00000000-0000-0000-0000-000000000001", jumlah_arena: await getJumlahArena() }]);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.put("/api/pengaturan_arena", async (req, res) => {
  try {
    await setJumlahArena(req.body.jumlah_arena || 3);
    res.json({ id: "00000000-0000-0000-0000-000000000001", jumlah_arena: await getJumlahArena() });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
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
    res.status(500).json({ error: error.message });
  }
});

let activeAnnouncements: any[] = [];

app.post("/api/announce", (req, res) => {
  activeAnnouncements.push({ id: Date.now().toString(), ...req.body });
  res.json({ success: true });
});

app.get("/api/announce", (req, res) => {
  res.json(activeAnnouncements);
});

app.delete("/api/announce/:id", (req, res) => {
  activeAnnouncements = activeAnnouncements.filter(a => a.id !== req.params.id);
  res.json({ success: true });
});

async function startServer() {
  try {
    await initDb();
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }
  
  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.join(typeof __dirname !== "undefined" ? __dirname : process.cwd(), "index.html"));
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = typeof __dirname !== "undefined" ? __dirname : path.join(process.cwd(), "dist");
    
    // Fallback static paths for robust cPanel deployment
    const rootPath = process.cwd();
    app.use(express.static(distPath));
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

    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

}

app.listen(PORT as number, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

startServer();
