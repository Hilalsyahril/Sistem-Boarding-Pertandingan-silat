import re
with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace('''  const schema = `
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
  await pgPool.query(schema);''', '''  await pgPool.query(`CREATE TABLE IF NOT EXISTS pengaturan_arena (
      id VARCHAR(255) PRIMARY KEY,
      jumlah_arena INTEGER DEFAULT 3
    )`);
  await pgPool.query(`CREATE TABLE IF NOT EXISTS pesilat (
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
    )`);
  await pgPool.query(`CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      token VARCHAR(255)
    )`);''')

with open('server.ts', 'w') as f:
    f.write(content)
