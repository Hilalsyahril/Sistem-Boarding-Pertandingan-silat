import re

with open('server.ts', 'r') as f:
    code = f.read()

# Replace getSupabaseClient() call with null
code = re.sub(
    r'const client = getSupabaseClient\(\);',
    'const client = null;',
    code
)

# Remove the import
code = re.sub(
    r'import \{ createClient \} from "@supabase/supabase-js";\n?',
    'import Database from "better-sqlite3";\n',
    code
)

# Replace the supabase setup block
db_init = """
const db = new Database('local_fallback.db');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS pengaturan_arena (
    id TEXT PRIMARY KEY,
    jumlah_arena INTEGER DEFAULT 3
  );

  CREATE TABLE IF NOT EXISTS pesilat (
    id TEXT PRIMARY KEY,
    nomor_partai TEXT,
    nama_pesilat TEXT,
    kontingen TEXT,
    nama_pesilat_biru TEXT,
    kontingen_biru TEXT,
    kelas TEXT,
    kategori TEXT,
    gender TEXT,
    arena INTEGER,
    is_playing INTEGER,
    timer_duration INTEGER,
    timer_seconds_left INTEGER,
    timer_running INTEGER,
    timer_last_updated_at REAL,
    is_done INTEGER
  );
  
  INSERT OR IGNORE INTO pengaturan_arena (id, jumlah_arena) VALUES ('00000000-0000-0000-0000-000000000001', 3);
`);

console.log("=================================================");
console.log("SISTEM BOARDING PENCAK SILAT - STARTING BACKEND");
console.log(`Port: ${3000}`);
console.log(`Database: 100% LOKAL (SQLite + In-Memory Sinkronisasi)`);
console.log("=================================================");
"""

code = re.sub(
    r'// Validate Supabase environment variables[\s\S]*?console\.log\("================================================="\);',
    db_init,
    code,
    flags=re.DOTALL
)

# Remove getSupabaseClient and handleSupabaseError definition
code = re.sub(
    r'// Lazy loading Supabase client[\s\S]*?function handleSupabaseError\(error: any, context: string\) \{[\s\S]*?\n\}\n',
    '',
    code,
    flags=re.DOTALL
)

# Replace the helper functions block with SQLite syncing
sync_code = """
let localPesilatList: Pesilat[] = [];
let localJumlahArena = 3;

// Initialize from DB
try {
  const arenaRow = db.prepare("SELECT jumlah_arena FROM pengaturan_arena WHERE id = '00000000-0000-0000-0000-000000000001'").get() as any;
  if (arenaRow) localJumlahArena = arenaRow.jumlah_arena;
  
  const pesilatRows = db.prepare("SELECT * FROM pesilat").all() as any[];
  localPesilatList = pesilatRows.map(r => ({
    ...r,
    is_playing: Boolean(r.is_playing),
    timer_running: Boolean(r.timer_running),
    is_done: Boolean(r.is_done)
  }));
} catch(e) {
  console.error("Failed to load from DB", e);
}

function getLocalJumlahArena() { return localJumlahArena; }
function setLocalJumlahArena(val: number) { 
  localJumlahArena = val; 
  try {
    db.prepare("UPDATE pengaturan_arena SET jumlah_arena = ? WHERE id = '00000000-0000-0000-0000-000000000001'").run(val);
  } catch(e) {}
}

function getLocalPesilatList() { return localPesilatList; }
function setLocalPesilatList(list: Pesilat[]) { 
  localPesilatList = list; 
  try {
    db.exec("DELETE FROM pesilat");
    const stmt = db.prepare(`
      INSERT INTO pesilat (
        id, nomor_partai, nama_pesilat, kontingen, nama_pesilat_biru, kontingen_biru,
        kelas, kategori, gender, arena, is_playing, timer_duration, timer_seconds_left,
        timer_running, timer_last_updated_at, is_done
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    const insertMany = db.transaction((items) => {
      for (const item of items) {
        stmt.run(
          item.id, item.nomor_partai, item.nama_pesilat, item.kontingen, item.nama_pesilat_biru, item.kontingen_biru,
          item.kelas, item.kategori, item.gender, item.arena,
          item.is_playing ? 1 : 0, item.timer_duration, item.timer_seconds_left,
          item.timer_running ? 1 : 0, item.timer_last_updated_at || null, item.is_done ? 1 : 0
        );
      }
    });
    insertMany(list);
  } catch(e) {}
}

function addLocalPesilat(item: Pesilat) {
  localPesilatList.unshift(item);
  try {
    db.prepare(`
      INSERT INTO pesilat (
        id, nomor_partai, nama_pesilat, kontingen, nama_pesilat_biru, kontingen_biru,
        kelas, kategori, gender, arena, is_playing, timer_duration, timer_seconds_left,
        timer_running, timer_last_updated_at, is_done
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      item.id, item.nomor_partai, item.nama_pesilat, item.kontingen, item.nama_pesilat_biru, item.kontingen_biru,
      item.kelas, item.kategori, item.gender, item.arena,
      item.is_playing ? 1 : 0, item.timer_duration, item.timer_seconds_left,
      item.timer_running ? 1 : 0, item.timer_last_updated_at || null, item.is_done ? 1 : 0
    );
  } catch(e) {}
}

function addBatchLocalPesilat(items: Pesilat[]) {
  localPesilatList.unshift(...items);
  setLocalPesilatList(localPesilatList);
}

function deleteLocalPesilat(id: string) {
  localPesilatList = localPesilatList.filter(p => p.id !== id);
  try {
    db.prepare("DELETE FROM pesilat WHERE id = ?").run(id);
  } catch(e) {}
}

function deleteAllLocalPesilat() {
  localPesilatList = [];
  try {
    db.exec("DELETE FROM pesilat");
  } catch(e) {}
}

function deleteBatchLocalPesilat(ids: string[]) {
  localPesilatList = localPesilatList.filter(p => !ids.includes(p.id));
  if (ids.length === 0) return;
  try {
    const placeholders = ids.map(() => '?').join(',');
    db.prepare(`DELETE FROM pesilat WHERE id IN (${placeholders})`).run(...ids);
  } catch(e) {}
}
"""

code = re.sub(
    r'// Helper functions for fallback DB[\s\S]*?(?=\n\n// 1\. Config Status)',
    sync_code,
    code,
    flags=re.DOTALL
)

# Fix config status to return pure local mode always
code = re.sub(
    r'return res\.json\(\{[\s\S]*?mode: supabaseActive \? "supabase" : "local_fallback"[\s\S]*?\}\);',
    'return res.json({\n      configured: true,\n      supabaseUrl: null,\n      supabaseAnonKey: null,\n      mode: "local_fallback"\n    });',
    code,
    flags=re.DOTALL
)

with open('server.ts', 'w') as f:
    f.write(code)

