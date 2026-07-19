# Tutorial Setup PostgreSQL Lokal & Akses Website via IP (192.168.0.201)

Sistem sudah sepenuhnya saya konfigurasi agar **100% menggunakan PostgreSQL** dan akan berjalan pada **port 3000** di alamat IP lokal (0.0.0.0) sehingga dapat diakses oleh perangkat manapun pada jaringan LAN/WiFi.

Berikut langkah-langkah setup-nya:

---

## Bagian 1: Setup PostgreSQL Database

Anda dapat menggunakan salah satu dari 2 cara berikut: menggunakan **Installer Resmi** ATAU menggunakan **Laragon**.

### Opsi A: Menggunakan Laragon (Rekomendasi jika sudah pakai Laragon)

1. **Download PostgreSQL Binaries (Format ZIP)**
   - Kunjungi situs [EnterpriseDB PostgreSQL Binaries](https://www.enterprisedb.com/download-postgresql-binaries).
   - Unduh versi Windows x86-64 (format `.zip`, **bukan** installer `.exe`), misalnya versi 15 atau 16.

2. **Ekstrak ke Folder Laragon**
   - Buka direktori instalasi Laragon Anda (biasanya di `C:\laragon`).
   - Buka folder `bin`. Jika belum ada folder `postgresql`, buat folder baru dengan nama `postgresql` (huruf kecil semua).
   - Ekstrak isi file `.zip` yang diunduh ke dalam folder tersebut. Strukturnya akan menjadi seperti ini: `C:\laragon\bin\postgresql\pgsql-15...`

3. **Jalankan PostgreSQL di Laragon**
   - Buka aplikasi Laragon.
   - **Klik Kanan** pada area kosong di aplikasi Laragon -> arahkan ke menu **PostgreSQL** -> klik **Start PostgreSQL**.
   - *(Saat pertama kali dijalankan, Laragon akan otomatis membuatkan folder data dan menginisialisasi database).*
   - User default bawaan Laragon adalah `postgres` dan passwordnya biasanya `root` (atau kosong).

4. **Buat Database `silat_db` menggunakan HeidiSQL**
   - Di aplikasi Laragon, klik tombol **Database** (akan membuka HeidiSQL).
   - Klik **New** (Buat sesi baru).
   - Pada `Network type`, pilih **PostgreSQL (TCP/IP)**.
   - User: `postgres`
   - Password: `root` (jika gagal, coba kosongkan).
   - Klik **Open**.
   - Setelah masuk, klik kanan pada area kiri -> **Create new** -> **Database**. Beri nama `silat_db` lalu OK.

5. **Izinkan Koneksi Jaringan Lokal di Laragon**
   - Buka folder penyimpanan data PostgreSQL Laragon: `C:\laragon\data\postgresql` (atau buka dari menu Laragon -> PostgreSQL -> data dir).
   - Buka file `pg_hba.conf` menggunakan Notepad.
   - Tambahkan baris ini di paling bawah agar bisa diakses dari IP manapun di jaringan lokal:
     `host    all             all             0.0.0.0/0               trust`
   - Buka file `postgresql.conf` di folder yang sama, cari `#listen_addresses = 'localhost'` lalu ubah menjadi:
     `listen_addresses = '*'`
   - **Restart PostgreSQL** di Laragon (Klik Kanan -> PostgreSQL -> Stop, lalu Start lagi).


### Opsi B: Menggunakan Installer Resmi (Tanpa Laragon)
1. Unduh installer dari [Situs Resmi PostgreSQL](https://www.postgresql.org/download/windows/) dan install. Ingat Password superuser (`postgres`) yang Anda buat (misalnya: `admin123`).
2. Buka **pgAdmin 4**, login dengan password tadi. Klik kanan `Databases` > **Create** > **Database...** bernama `silat_db`.
3. Izinkan koneksi lokal: Buka folder instalasi PostgreSQL (Contoh: `C:\Program Files\PostgreSQL\15\data`).
   - Edit `pg_hba.conf`, tambahkan di bawah: `host all all 0.0.0.0/0 scram-sha-256`
   - Edit `postgresql.conf`, jadikan `listen_addresses = '*'`
   - Restart service PostgreSQL di Windows Services (`services.msc`).

---

## Bagian 2: Konfigurasi Website (Aplikasi Ini)

1. **Unduh Source Code (Ekspor)**
   - Di AI Studio, klik ikon **Settings** (Roda Gigi) pada kanan atas lalu pilih **Download as ZIP**.
   - Ekstrak folder ZIP tersebut di komputer server Anda (komputer yang IP-nya `192.168.0.201`).

2. **Install Node.js & Dependencies**
   - Pastikan [Node.js (versi 18+)](https://nodejs.org/) sudah terinstall.
   - Buka terminal/Command Prompt di dalam folder hasil ekstrak aplikasi tadi.
   - Jalankan perintah:
     `npm install`

3. **Setup File `.env` (PENTING)**
   - Ubah nama (rename) file `.env.example` menjadi `.env`.
   - Buka file `.env` menggunakan Notepad.
   - Isi baris `DATABASE_URL` dengan format berikut.
     **Jika pakai Laragon (password: root):**
     `DATABASE_URL="postgres://postgres:root@192.168.0.201:5432/silat_db"`
     **Jika pakai Installer Resmi (password buatan Anda, misal admin123):**
     `DATABASE_URL="postgres://postgres:admin123@192.168.0.201:5432/silat_db"`

4. **Build dan Jalankan Website**
   Di terminal pada folder aplikasi, jalankan:
   `npm run build`
   Setelah build selesai, jalankan:
   `npm start`

   *(Catatan: Aplikasi ini secara otomatis akan berjalan pada IP `0.0.0.0` di port `3000`).*

---

## Bagian 3: Akses dari Perangkat Lain (Wasit / Juri / Penonton)

1. Pastikan perangkat lain terhubung pada **jaringan WiFi / LAN yang sama** dengan komputer server.
2. Pastikan **Firewall** pada komputer server Windows Anda mengizinkan koneksi masuk untuk **Port 3000** (Jika tidak bisa, matikan Windows Defender Firewall untuk Private Network sementara).
3. Buka browser (Chrome/Safari) di perangkat Juri/Wasit/Penonton dan akses URL:
   `http://192.168.0.201:3000`

Sistem secara otomatis akan membuat tabel database saat pertama kali `npm start` dijalankan. Anda tidak perlu membuat tabel manual!
