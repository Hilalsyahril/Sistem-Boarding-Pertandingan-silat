-- ====================================================================
-- QUERY SQL UNTUK SETUP DATABASE SUPABASE (SISTEM BOARDING PENCAK SILAT)
-- Jalankan query ini di SQL Editor pada Dashboard Supabase Anda.
-- ====================================================================

-- 1. Buat Tabel pesilat
CREATE TABLE IF NOT EXISTS public.pesilat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_partai TEXT DEFAULT '01',
    nama_pesilat TEXT NOT NULL,       -- Sudut Merah
    kontingen TEXT NOT NULL,          -- Sudut Merah
    nama_pesilat_biru TEXT DEFAULT '',-- Sudut Biru
    kontingen_biru TEXT DEFAULT '',   -- Sudut Biru
    kelas TEXT NOT NULL,              -- Contoh: Kelas A, Kelas B, dll.
    kategori TEXT NOT NULL,           -- Contoh: Tanding, Tunggal, Ganda, Regu
    gender TEXT NOT NULL,             -- Contoh: Putra, Putri
    arena INT2 DEFAULT 1,             -- Menentukan pesilat sedang bertanding di arena mana (1, 2, 3, dsb.)
    is_playing BOOLEAN DEFAULT false,
    timer_duration INT4 DEFAULT 120,  -- Durasi default dalam detik
    timer_seconds_left INT4 DEFAULT 120,-- Sisa detik default
    timer_running BOOLEAN DEFAULT false,
    timer_last_updated_at INT8,       -- Timestamp milidetik
    is_done BOOLEAN DEFAULT false,    -- Menandai jika partai selesai/done
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Buat Tabel pengaturan_arena
CREATE TABLE IF NOT EXISTS public.pengaturan_arena (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jumlah_arena INT2 NOT NULL DEFAULT 2, -- Jumlah arena default adalah 2
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Masukkan data pengaturan_arena default (jika belum ada)
-- Gunakan ID statis agar mudah di-update oleh server Express
INSERT INTO public.pengaturan_arena (id, jumlah_arena)
VALUES ('00000000-0000-0000-0000-000000000001', 2)
ON CONFLICT (id) DO UPDATE SET jumlah_arena = EXCLUDED.jumlah_arena;

-- 4. Aktifkan fitur Real-time publication pada tabel pesilat dan pengaturan_arena
-- Supabase menggunakan replikasi PostgreSQL untuk mengirimkan update secara real-time.
-- Pastikan tabel ini ditambahkan ke publikasi 'supabase_realtime'.
alter publication supabase_realtime add table public.pesilat;
alter publication supabase_realtime add table public.pengaturan_arena;
