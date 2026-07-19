# Tutorial Setup PostgreSQL Lokal & Akses Website via IP (192.168.0.201)

Sistem sudah sepenuhnya saya konfigurasi agar **100% menggunakan PostgreSQL** (tanpa SQLite atau Supabase) dan akan berjalan pada **port 3000** di alamat IP lokal (0.0.0.0) sehingga dapat diakses oleh perangkat manapun pada jaringan LAN/WiFi.

Berikut langkah-langkah setup-nya untuk server Windows/Linux Anda:

## Bagian 1: Setup PostgreSQL Database

1. **Install PostgreSQL**
   - Jika Anda menggunakan Windows, unduh installer dari [Situs Resmi PostgreSQL](https://www.postgresql.org/download/windows/) dan lakukan instalasi.
   - Pada saat instalasi, ingat **Password** superuser (`postgres`) yang Anda buat (misalnya: `admin123`).
   - Biarkan port default pada **5432**.

2. **Buat Database**
   Buka aplikasi **pgAdmin 4** (bawaan instalasi PostgreSQL):
   - Login menggunakan password `postgres` tadi.
   - Di panel kiri, klik kanan pada `Databases` > **Create** > **Database...**
   - Beri nama database, misalnya `silat_db`.
   - Klik **Save**.

3. **Izinkan Koneksi PostgreSQL di Jaringan Lokal (Khusus Windows)**
   Jika PostgreSQL Anda berjalan di komputer dengan IP `192.168.0.201`, pastikan database bisa menerima koneksi dari IP ini:
   - Buka folder instalasi PostgreSQL (Contoh: `C:\Program Files\PostgreSQL\15\data`)
   - Buka file `pg_hba.conf` dengan Notepad (Run as Administrator).
   - Tambahkan baris berikut di bagian paling bawah untuk mengizinkan seluruh IP jaringan lokal (atau spesifik 192.168.0.0/24):
     `host    all             all             0.0.0.0/0               scram-sha-256`
   - Buka file `postgresql.conf`, cari baris `#listen_addresses = 'localhost'` lalu ubah menjadi (hapus tanda pagar):
     `listen_addresses = '*'`
   - Buka **Services** pada Windows (`services.msc`), cari `postgresql-x64-15` lalu **Restart** service-nya.

## Bagian 2: Konfigurasi Website (Aplikasi Ini)

1. **Unduh Source Code (Ekspor)**
   - Di AI Studio, klik ikon **Settings** (Roda Gigi) pada kanan atas lalu pilih **Download as ZIP**.
   - Ekstrak folder ZIP tersebut di komputer server Anda (komputer yang IP-nya `192.168.0.201`).

2. **Install Node.js & Dependencies**
   - Pastikan [Node.js (versi 18+)](https://nodejs.org/) sudah terinstall di komputer tersebut.
   - Buka terminal/Command Prompt di dalam folder hasil ekstrak aplikasi tadi.
   - Jalankan perintah:
     `npm install`

3. **Setup File `.env` (PENTING)**
   - Di folder utama aplikasi, Anda akan menemukan file bernama `.env.example`.
   - Ubah nama (rename) file `.env.example` tersebut menjadi `.env`.
   - Buka file `.env` menggunakan Notepad.
   - Isi baris `DATABASE_URL` dengan format berikut (sesuaikan dengan username, password, dan nama database Anda):
     `DATABASE_URL="postgres://postgres:admin123@192.168.0.201:5432/silat_db"`

4. **Build dan Jalankan Website**
   Di terminal pada folder aplikasi, jalankan:
   `npm run build`
   Setelah build selesai, jalankan:
   `npm start`

   *(Catatan: Aplikasi ini secara bawaan telah diprogram untuk listen ke IP `0.0.0.0` pada port `3000` di dalam file `server.ts` yang tadi baru saja kita modifikasi).*

## Bagian 3: Akses dari Perangkat Lain (Wasit / Juri / Penonton)

1. Pastikan perangkat lain (HP, Tablet, Laptop Juri) terhubung pada **jaringan WiFi / LAN yang sama** dengan komputer server.
2. Pastikan **Firewall** pada komputer server Windows Anda mengizinkan koneksi masuk untuk **Port 3000** (Jika tidak bisa diakses, matikan Windows Defender Firewall untuk Private Network sementara).
3. Buka browser (Chrome/Safari) di perangkat Juri/Wasit/Layar Penonton dan akses URL:
   `http://192.168.0.201:3000`

Sistem secara otomatis akan membuat tabel database (seperti tabel `pesilat` dan `pengaturan_arena`) saat pertama kali `npm start` dijalankan, sehingga Anda tidak perlu membuat tabel manual!
