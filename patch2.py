import re
import sys

with open('server.ts', 'r') as f:
    code = f.read()

# Replace the block
old_block = """let localPesilatList: Pesilat[] = [
  { id: "101", nomor_partai: "01", nama_pesilat: "Eko Prasetyo", kontingen: "Tapak Suci Surabaya", nama_pesilat_biru: "Ahmad Fauzi", kontingen_biru: "Perisai Diri Gresik", kelas: "Kelas A (45kg - 50kg)", kategori: "Tanding", gender: "Putra", arena: 1, is_playing: false, timer_duration: 120, timer_seconds_left: 120, timer_running: false },
  { id: "102", nomor_partai: "02", nama_pesilat: "Siti Aminah", kontingen: "Pagar Nusa Kediri", nama_pesilat_biru: "Dewi Sri", kontingen_biru: "Tapak Suci Malang", kelas: "Kelas B (50kg - 55kg)", kategori: "Tanding", gender: "Putri", arena: 1, is_playing: false, timer_duration: 120, timer_seconds_left: 120, timer_running: false },
  { id: "103", nomor_partai: "03", nama_pesilat: "Wawan Kurniawan", kontingen: "Perisai Diri Bandung", nama_pesilat_biru: "", kontingen_biru: "", kelas: "Seni Tunggal", kategori: "Tunggal", gender: "Putra", arena: 2, is_playing: false, timer_duration: 180, timer_seconds_left: 180, timer_running: false },
  { id: "104", nomor_partai: "04", nama_pesilat: "Rini Astuti", kontingen: "Persinas ASAD Solo", nama_pesilat_biru: "Santi Rahayu", kontingen_biru: "Merpati Putih DIY", kelas: "Kelas D (60kg - 65kg)", kategori: "Tanding", gender: "Putri", arena: 2, is_playing: false, timer_duration: 120, timer_seconds_left: 120, timer_running: false },
  { id: "105", nomor_partai: "05", nama_pesilat: "Budi Santoso", kontingen: "Merpati Putih Jakarta", nama_pesilat_biru: "Prabowo Subianto", kontingen_biru: "Seni Silat Bekasi", kelas: "Kelas A (45kg - 50kg)", kategori: "Tanding", gender: "Putra", arena: 3, is_playing: false, timer_duration: 120, timer_seconds_left: 120, timer_running: false },
  { id: "106", nomor_partai: "06", nama_pesilat: "Ayu Lestari", kontingen: "Kera Sakti Malang", nama_pesilat_biru: "", kontingen_biru: "", kelas: "Seni Tunggal", kategori: "Tunggal", gender: "Putri", arena: 3, is_playing: false, timer_duration: 180, timer_seconds_left: 180, timer_running: false }
];

let localJumlahArena = 3;"""

db_init = """
const db = new Database('local_fallback.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS pengaturan_arena (
    id TEXT PRIMARY KEY,
    jumlah_arena INTEGER
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
    timer_last_updated_at TEXT,
    is_done INTEGER
  );
`);
db.prepare("INSERT OR IGNORE INTO pengaturan_arena (id, jumlah_arena) VALUES ('00000000-0000-0000-0000-000000000001', 3)").run();

// Helper functions for fallback DB
function getLocalJumlahArena() {
  const row = db.prepare("SELECT jumlah_arena FROM pengaturan_arena WHERE id = '00000000-0000-0000-0000-000000000001'").get();
  return row ? row.jumlah_arena : 4;
}
function setLocalJumlahArena(val) {
  db.prepare("UPDATE pengaturan_arena SET jumlah_arena = ? WHERE id = '00000000-0000-0000-0000-000000000001'").run(val);
}
function getLocalPesilatList() {
  const rows = db.prepare("SELECT * FROM pesilat").all();
  return rows.map(r => ({
    ...r,
    is_playing: Boolean(r.is_playing),
    timer_running: Boolean(r.timer_running),
    is_done: Boolean(r.is_done)
  }));
}
function setLocalPesilatList(list) {
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
}
function addLocalPesilat(item) {
  const list = getLocalPesilatList();
  list.unshift(item);
  setLocalPesilatList(list);
}
function addBatchLocalPesilat(items) {
  const list = getLocalPesilatList();
  list.unshift(...items);
  setLocalPesilatList(list);
}
function deleteLocalPesilat(id) {
  db.prepare("DELETE FROM pesilat WHERE id = ?").run(id);
}
function deleteAllLocalPesilat() {
  db.exec("DELETE FROM pesilat");
}
function deleteBatchLocalPesilat(ids) {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM pesilat WHERE id IN (${placeholders})`).run(...ids);
}
"""

code = code.replace(old_block, db_init)

with open('server.ts', 'w') as f:
    f.write(code)

print("Patch 2 applied.")
