-- ====================================================================
-- QUERY SQL UNTUK SETUP DATABASE SUPABASE (SISTEM BOARDING PENCAK SILAT)
-- Project: https://pgqsknkwpoymvbilnnip.supabase.co
-- Jalankan query ini di SQL Editor pada Dashboard Supabase Anda.
-- ====================================================================

-- 1. Buat Tabel pesilat
CREATE TABLE IF NOT EXISTS public.pesilat (
    id VARCHAR(255) PRIMARY KEY,
    nomor_urut INTEGER DEFAULT 0,
    nomor_partai VARCHAR(255) DEFAULT '01',
    nama_pesilat VARCHAR(255) NOT NULL,       -- Sudut Merah
    kontingen VARCHAR(255) NOT NULL,          -- Sudut Merah
    nama_pesilat_biru VARCHAR(255) DEFAULT '',-- Sudut Biru
    kontingen_biru VARCHAR(255) DEFAULT '',   -- Sudut Biru
    kelas VARCHAR(255) NOT NULL,              -- Contoh: Kelas A, Kelas B, dll.
    kategori VARCHAR(255) NOT NULL,           -- Contoh: Tanding, Tunggal, Ganda, Regu
    gender VARCHAR(255) NOT NULL,             -- Contoh: Putra, Putri
    arena INTEGER DEFAULT 1,                  -- Arena (1, 2, 3, dsb.)
    is_playing BOOLEAN DEFAULT false,
    timer_duration INTEGER DEFAULT 120,       -- Durasi default dalam detik
    timer_seconds_left INTEGER DEFAULT 120,   -- Sisa detik default
    timer_running BOOLEAN DEFAULT false,
    timer_last_updated_at BIGINT,             -- Timestamp milidetik
    is_done BOOLEAN DEFAULT false,            -- Selesai/done
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Buat Tabel pengaturan_arena
CREATE TABLE IF NOT EXISTS public.pengaturan_arena (
    id VARCHAR(255) PRIMARY KEY,
    jumlah_arena INTEGER NOT NULL DEFAULT 3,
    judul_aplikasi VARCHAR(255) DEFAULT 'SISTEM BOARDING PENCAK SILAT',
    auto_next BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Buat Tabel admin_users & operator_users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    token VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS public.operator_users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    token VARCHAR(255)
);

-- 4. Seed Data Default
INSERT INTO public.pengaturan_arena (id, jumlah_arena, judul_aplikasi, auto_next)
VALUES ('00000000-0000-0000-0000-000000000001', 3, 'SISTEM BOARDING PENCAK SILAT', true)
ON CONFLICT (id) DO UPDATE SET 
    jumlah_arena = EXCLUDED.jumlah_arena,
    judul_aplikasi = EXCLUDED.judul_aplikasi,
    auto_next = EXCLUDED.auto_next;

INSERT INTO public.admin_users (id, username, password)
VALUES ('1', 'operatorDB', 'silat2026')
ON CONFLICT (username) DO NOTHING;

-- 5. Aktifkan fitur Real-time publication pada Supabase
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pesilat, public.pengaturan_arena, public.admin_users, public.operator_users;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Abaikan jika tabel sudah terdaftar
END $$;
