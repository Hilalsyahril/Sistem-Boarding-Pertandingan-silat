import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Validate Supabase environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Smart verification: Supabase keys are always JWTs (starting with "ey" and containing ".")
const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseUrl !== "" &&
  supabaseUrl.startsWith("https://") &&
  !supabaseUrl.includes("your-supabase-project") &&
  supabaseServiceKey &&
  supabaseServiceKey !== "" &&
  supabaseServiceKey.startsWith("ey") &&
  supabaseServiceKey.includes(".") &&
  !supabaseServiceKey.includes("your-service-role-key")
);

let supabaseActive = isSupabaseConfigured;

console.log("=================================================");
console.log("SISTEM BOARDING PENCAK SILAT - STARTING BACKEND");
console.log(`Port: ${PORT}`);
console.log(`Status Supabase: ${supabaseActive ? "TERHUBUNG (Real-time Cloud)" : "TIDAK TERKONFIGURASI (Menggunakan Memori Lokal Fallback)"}`);
if (!supabaseActive) {
  console.log("Tip: Atur SUPABASE_URL, SUPABASE_ANON_KEY, dan SUPABASE_SERVICE_ROLE_KEY di .env dengan kredensial yang valid.");
}
console.log("=================================================");

// Lazy loading Supabase client
let supabase: any = null;
function getSupabaseClient() {
  if (!supabaseActive) return null;
  if (!supabase) {
    try {
      supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
        auth: { persistSession: false }
      });
    } catch (e) {
      console.warn("Gagal menginisialisasi client Supabase, beralih ke memori lokal:", e);
      supabaseActive = false;
      return null;
    }
  }
  return supabase;
}

// Dynamic authentication or API key failure handling
function handleSupabaseError(error: any, context: string) {
  const isAuthError = 
    error.status === 401 || 
    error.status === 403 || 
    error.code === "PGRST301" ||
    (error.message && (
      error.message.includes("Invalid API key") || 
      error.message.includes("invalid API key") || 
      error.message.includes("JWT") || 
      error.message.includes("apiKey") ||
      error.message.includes("Invalid key")
    ));

  if (isAuthError) {
    console.warn(`[Supabase Auth Info] Kunci API tidak valid atau kedaluwarsa saat ${context}: ${error.message}. Mengalihkan secara dinamis ke mode memori lokal.`);
    supabaseActive = false;
  } else {
    console.warn(`[Supabase Info] Gagal ${context}: ${error.message}`);
  }
}

// In-Memory Data Store (Fallback jika Supabase belum dikonfigurasi)
interface Pesilat {
  id: string;
  nomor_partai: string;
  nama_pesilat: string; // Sudut Merah
  kontingen: string;    // Sudut Merah
  nama_pesilat_biru: string; // Sudut Biru
  kontingen_biru: string;    // Sudut Biru
  kelas: string;
  kategori: string;
  gender: string;
  arena: number;
  is_playing: boolean;
  timer_duration: number; // in seconds
  timer_seconds_left: number; // in seconds
  timer_running: boolean;
  timer_last_updated_at?: number;
  is_done?: boolean;
  created_at?: string;
}

let localPesilatList: Pesilat[] = [
  { id: "101", nomor_partai: "01", nama_pesilat: "Eko Prasetyo", kontingen: "Tapak Suci Surabaya", nama_pesilat_biru: "Ahmad Fauzi", kontingen_biru: "Perisai Diri Gresik", kelas: "Kelas A (45kg - 50kg)", kategori: "Tanding", gender: "Putra", arena: 1, is_playing: false, timer_duration: 120, timer_seconds_left: 120, timer_running: false },
  { id: "102", nomor_partai: "02", nama_pesilat: "Siti Aminah", kontingen: "Pagar Nusa Kediri", nama_pesilat_biru: "Dewi Sri", kontingen_biru: "Tapak Suci Malang", kelas: "Kelas B (50kg - 55kg)", kategori: "Tanding", gender: "Putri", arena: 1, is_playing: false, timer_duration: 120, timer_seconds_left: 120, timer_running: false },
  { id: "103", nomor_partai: "03", nama_pesilat: "Wawan Kurniawan", kontingen: "Perisai Diri Bandung", nama_pesilat_biru: "", kontingen_biru: "", kelas: "Seni Tunggal", kategori: "Tunggal", gender: "Putra", arena: 2, is_playing: false, timer_duration: 180, timer_seconds_left: 180, timer_running: false },
  { id: "104", nomor_partai: "04", nama_pesilat: "Rini Astuti", kontingen: "Persinas ASAD Solo", nama_pesilat_biru: "Santi Rahayu", kontingen_biru: "Merpati Putih DIY", kelas: "Kelas D (60kg - 65kg)", kategori: "Tanding", gender: "Putri", arena: 2, is_playing: false, timer_duration: 120, timer_seconds_left: 120, timer_running: false },
  { id: "105", nomor_partai: "05", nama_pesilat: "Budi Santoso", kontingen: "Merpati Putih Jakarta", nama_pesilat_biru: "Prabowo Subianto", kontingen_biru: "Seni Silat Bekasi", kelas: "Kelas A (45kg - 50kg)", kategori: "Tanding", gender: "Putra", arena: 3, is_playing: false, timer_duration: 120, timer_seconds_left: 120, timer_running: false },
  { id: "106", nomor_partai: "06", nama_pesilat: "Ayu Lestari", kontingen: "Kera Sakti Malang", nama_pesilat_biru: "", kontingen_biru: "", kelas: "Seni Tunggal", kategori: "Tunggal", gender: "Putri", arena: 3, is_playing: false, timer_duration: 180, timer_seconds_left: 180, timer_running: false }
];

let localJumlahArena = 3;

// API Endpoints

// 1. Status Konfigurasi
app.get("/api/config-status", (req, res) => {
  res.json({
    configured: supabaseActive,
    supabaseUrl: supabaseActive ? supabaseUrl : null,
    supabaseAnonKey: supabaseActive ? supabaseAnonKey : null, // Dibutuhkan frontend publik untuk subscribe real-time
    mode: supabaseActive ? "supabase" : "local_fallback"
  });
});

// 2. GET Semua Pesilat
app.get("/api/pesilat", async (req, res) => {
  try {
    const client = getSupabaseClient();
    let list: Pesilat[] = [];
    if (client) {
      const { data, error } = await client
        .from("pesilat")
        .select("*");

      if (error) {
        handleSupabaseError(error, "mengambil data pesilat");
        list = [...localPesilatList];
      } else {
        list = data || [];
      }
    } else {
      list = [...localPesilatList];
    }

    // Hitung sisa waktu secara dinamis untuk partai yang sedang berjalan
    list = list.map(p => {
      if (p.is_playing && p.timer_running && p.timer_last_updated_at) {
        const lastUpdated = typeof p.timer_last_updated_at === "string"
          ? new Date(p.timer_last_updated_at).getTime()
          : Number(p.timer_last_updated_at);
        
        if (!isNaN(lastUpdated)) {
          const elapsed = Math.floor((Date.now() - lastUpdated) / 1000);
          const newSecondsLeft = Math.max(0, p.timer_seconds_left - elapsed);
          return {
            ...p,
            timer_seconds_left: newSecondsLeft,
            timer_running: newSecondsLeft > 0 ? p.timer_running : false
          };
        }
      }
      return p;
    });

    // Urutkan secara konsisten: arena ascending, nomor_partai secara numerik ascending
    list.sort((a, b) => {
      if (a.arena !== b.arena) {
        return a.arena - b.arena;
      }
      const numA = parseFloat(a.nomor_partai);
      const numB = parseFloat(b.nomor_partai);
      const isNumA = !isNaN(numA) && isFinite(numA);
      const isNumB = !isNaN(numB) && isFinite(numB);
      if (isNumA && isNumB) {
        return numA - numB;
      }
      if (isNumA) return -1;
      if (isNumB) return 1;
      return a.nomor_partai.localeCompare(b.nomor_partai, undefined, { numeric: true, sensitivity: "base" });
    });

    return res.json(list);
  } catch (error: any) {
    console.error("Gagal mengambil data pesilat:", error.message);
    return res.json(localPesilatList);
  }
});

// 3. POST Pesilat Baru
app.post("/api/pesilat", async (req, res) => {
  const { 
    nama_pesilat, 
    kontingen, 
    kelas, 
    kategori, 
    gender, 
    arena, 
    nomor_partai, 
    nama_pesilat_biru, 
    kontingen_biru,
    timer_duration
  } = req.body;

  if (!nama_pesilat || !kontingen || !kelas || !kategori || !gender) {
    return res.status(400).json({ error: "Semua kolom input wajib diisi." });
  }

  const arenaNum = Number(arena) || 1;
  const nomorPartaiStr = nomor_partai || "00";
  const namaBiruStr = nama_pesilat_biru || "";
  const kontingenBiruStr = kontingen_biru || "";

  // Hitung durasi timer default berdasarkan kategori
  const defaultDuration = (kategori.toLowerCase().includes("tunggal") || 
                           kategori.toLowerCase().includes("ganda") || 
                           kategori.toLowerCase().includes("regu") ||
                           kategori.toLowerCase() === "seni") ? 180 : 120;
  
  const customDuration = Number(timer_duration) || defaultDuration;

  try {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client
        .from("pesilat")
        .insert([{
          nama_pesilat,
          kontingen,
          kelas,
          kategori,
          gender,
          arena: arenaNum,
          nomor_partai: nomorPartaiStr,
          nama_pesilat_biru: namaBiruStr,
          kontingen_biru: kontingenBiruStr,
          is_playing: false,
          timer_duration: customDuration,
          timer_seconds_left: customDuration,
          timer_running: false
        }])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, "menyimpan pesilat");
        const newPesilat: Pesilat = {
          id: Math.random().toString(36).substr(2, 9),
          nomor_partai: nomorPartaiStr,
          nama_pesilat,
          kontingen,
          nama_pesilat_biru: namaBiruStr,
          kontingen_biru: kontingenBiruStr,
          kelas,
          kategori,
          gender,
          arena: arenaNum,
          is_playing: false,
          timer_duration: customDuration,
          timer_seconds_left: customDuration,
          timer_running: false
        };
        localPesilatList.unshift(newPesilat);
        return res.status(201).json(newPesilat);
      }
      return res.status(201).json(data);
    } else {
      const newPesilat: Pesilat = {
        id: Math.random().toString(36).substr(2, 9),
        nomor_partai: nomorPartaiStr,
        nama_pesilat,
        kontingen,
        nama_pesilat_biru: namaBiruStr,
        kontingen_biru: kontingenBiruStr,
        kelas,
        kategori,
        gender,
        arena: arenaNum,
        is_playing: false,
        timer_duration: customDuration,
        timer_seconds_left: customDuration,
        timer_running: false
      };
      localPesilatList.unshift(newPesilat);
      return res.status(201).json(newPesilat);
    }
  } catch (error: any) {
    console.error("Gagal menyimpan pesilat:", error.message);
    const newPesilat: Pesilat = {
      id: Math.random().toString(36).substr(2, 9),
      nomor_partai: nomorPartaiStr,
      nama_pesilat,
      kontingen,
      nama_pesilat_biru: namaBiruStr,
      kontingen_biru: kontingenBiruStr,
      kelas,
      kategori,
      gender,
      arena: arenaNum,
      is_playing: false,
      timer_duration: customDuration,
      timer_seconds_left: customDuration,
      timer_running: false
    };
    localPesilatList.unshift(newPesilat);
    return res.status(201).json(newPesilat);
  }
});

// 3b. POST Batch Import Pesilat
app.post("/api/pesilat/batch", async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Data harus berupa array 'items'." });
  }

  const processedItems = items.map(item => {
    const arenaNum = Number(item.arena) || 1;
    const nomorPartaiStr = String(item.nomor_partai || "01");
    const namaPesilat = String(item.nama_pesilat || "").trim();
    const kontingen = String(item.kontingen || "").trim();
    const namaBiruStr = String(item.nama_pesilat_biru || "").trim();
    const kontingenBiruStr = String(item.kontingen_biru || "").trim();
    const kelas = String(item.kelas || "Kelas A (45kg - 50kg)").trim();
    const kategori = String(item.kategori || "Tanding").trim();
    const gender = String(item.gender || "Putra").trim();
    
    const defaultDuration = (kategori.toLowerCase().includes("tunggal") || 
                             kategori.toLowerCase().includes("ganda") || 
                             kategori.toLowerCase().includes("regu") ||
                             kategori.toLowerCase() === "seni") ? 180 : 120;
    const timerDuration = Number(item.timer_duration) || defaultDuration;

    return {
      nama_pesilat: namaPesilat,
      kontingen: kontingen,
      kelas: kelas,
      kategori: kategori,
      gender: gender,
      arena: arenaNum,
      nomor_partai: nomorPartaiStr,
      nama_pesilat_biru: namaBiruStr,
      kontingen_biru: kontingenBiruStr,
      is_playing: false,
      timer_duration: timerDuration,
      timer_seconds_left: timerDuration,
      timer_running: false,
      is_done: false
    };
  });

  // Validasi data minimal
  const invalid = processedItems.filter(p => !p.nama_pesilat || !p.kontingen);
  if (invalid.length > 0) {
    return res.status(400).json({ error: "Ada data yang nama pesilat (Sudut Merah) dan kontingennya kosong." });
  }

  try {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client
        .from("pesilat")
        .insert(processedItems)
        .select();

      if (error) {
        handleSupabaseError(error, "melakukan batch import pesilat");
        // Fallback local memory
        const localItems = processedItems.map(p => ({
          ...p,
          id: Math.random().toString(36).substr(2, 9)
        }));
        localPesilatList.unshift(...localItems);
        return res.status(201).json({ success: true, count: localItems.length, data: localItems, warning: "Disimpan di memori lokal karena error database." });
      }
      return res.status(201).json({ success: true, count: data ? data.length : processedItems.length, data });
    } else {
      const localItems = processedItems.map(p => ({
        ...p,
        id: Math.random().toString(36).substr(2, 9)
      }));
      localPesilatList.unshift(...localItems);
      return res.status(201).json({ success: true, count: localItems.length, data: localItems });
    }
  } catch (error: any) {
    console.error("Gagal melakukan batch import:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 4. PUT Update Pesilat
app.put("/api/pesilat/:id", async (req, res) => {
  const { id } = req.params;
  const { 
    nama_pesilat, 
    kontingen, 
    kelas, 
    kategori, 
    gender, 
    arena,
    nomor_partai,
    nama_pesilat_biru,
    kontingen_biru,
    timer_duration
  } = req.body;

  if (!nama_pesilat || !kontingen || !kelas || !kategori || !gender) {
    return res.status(400).json({ error: "Semua kolom input wajib diisi." });
  }

  const arenaNum = Number(arena) || 1;
  const nomorPartaiStr = nomor_partai || "00";
  const namaBiruStr = nama_pesilat_biru || "";
  const kontingenBiruStr = kontingen_biru || "";

  try {
    const client = getSupabaseClient();
    if (client) {
      const updatePayload: any = {
        nama_pesilat,
        kontingen,
        kelas,
        kategori,
        gender,
        arena: arenaNum,
        nomor_partai: nomorPartaiStr,
        nama_pesilat_biru: namaBiruStr,
        kontingen_biru: kontingenBiruStr
      };

      if (timer_duration !== undefined) {
        updatePayload.timer_duration = Number(timer_duration);
        updatePayload.timer_seconds_left = Number(timer_duration);
      }

      const { data, error } = await client
        .from("pesilat")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, "mengupdate pesilat");
        const index = localPesilatList.findIndex(p => p.id === id);
        if (index === -1) {
          return res.status(404).json({ error: "Pesilat tidak ditemukan." });
        }
        localPesilatList[index] = {
          ...localPesilatList[index],
          nomor_partai: nomorPartaiStr,
          nama_pesilat,
          kontingen,
          nama_pesilat_biru: namaBiruStr,
          kontingen_biru: kontingenBiruStr,
          kelas,
          kategori,
          gender,
          arena: arenaNum
        };
        if (timer_duration !== undefined) {
          localPesilatList[index].timer_duration = Number(timer_duration);
          localPesilatList[index].timer_seconds_left = Number(timer_duration);
        }
        return res.json(localPesilatList[index]);
      }
      return res.json(data);
    } else {
      const index = localPesilatList.findIndex(p => p.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Pesilat tidak ditemukan." });
      }
      localPesilatList[index] = {
        ...localPesilatList[index],
        nomor_partai: nomorPartaiStr,
        nama_pesilat,
        kontingen,
        nama_pesilat_biru: namaBiruStr,
        kontingen_biru: kontingenBiruStr,
        kelas,
        kategori,
        gender,
        arena: arenaNum
      };
      if (timer_duration !== undefined) {
        localPesilatList[index].timer_duration = Number(timer_duration);
        localPesilatList[index].timer_seconds_left = Number(timer_duration);
      }
      return res.json(localPesilatList[index]);
    }
  } catch (error: any) {
    console.error("Gagal mengupdate pesilat:", error.message);
    const index = localPesilatList.findIndex(p => p.id === id);
    if (index !== -1) {
      localPesilatList[index] = {
        ...localPesilatList[index],
        nomor_partai: nomorPartaiStr,
        nama_pesilat,
        kontingen,
        nama_pesilat_biru: namaBiruStr,
        kontingen_biru: kontingenBiruStr,
        kelas,
        kategori,
        gender,
        arena: arenaNum
      };
      return res.json(localPesilatList[index]);
    }
    res.status(500).json({ error: error.message });
  }
});

// Helper untuk mengupdate pesilat di Supabase dengan aman (mendukung fallback jika kolom is_done belum ada)
async function updatePesilatSafely(client: any, id: string, updateData: any) {
  const { data, error } = await client
    .from("pesilat")
    .update(updateData)
    .eq("id", id)
    .select();
  
  if (error && (error.code === "PGRST106" || (error.message && (error.message.includes("is_done") || error.message.includes("column"))))) {
    console.warn("[Supabase] Kolom 'is_done' belum ada di database Anda. Silakan jalankan query SQL berikut di editor SQL Supabase Anda:\n\nALTER TABLE public.pesilat ADD COLUMN IF NOT EXISTS is_done BOOLEAN DEFAULT false;\n\nSistem akan melanjutkan dengan fallback memori lokal untuk status 'done'.");
    const { is_done, ...safeData } = updateData;
    return await client.from("pesilat").update(safeData).eq("id", id).select();
  }
  return { data, error };
}

// 4a. PUT Play Pesilat (Menampilkan Atlit / Partai Secara Manual di Arena)
app.put("/api/pesilat/:id/play", async (req, res) => {
  const { id } = req.params;

  try {
    const client = getSupabaseClient();
    let allPesilats: Pesilat[] = [];

    if (client) {
      const { data, error } = await client.from("pesilat").select("*");
      if (!error && data) {
        allPesilats = data;
      } else {
        allPesilats = localPesilatList;
      }
    } else {
      allPesilats = localPesilatList;
    }

    // Cari pesilat yang mau diplay
    const nextItem = allPesilats.find(p => p.id === id);
    if (!nextItem) {
      return res.status(404).json({ error: "Pesilat tidak ditemukan." });
    }
    const arenaNum = nextItem.arena;

    // Cari pesilat yang saat ini sedang playing di arena yang sama dan bukan pesilat yang sama
    const prevPlaying = allPesilats.filter(p => p.arena === arenaNum && p.is_playing && p.id !== id);

    if (client) {
      // Ubah status pesilat yang digantikan ke done (tidak dihapus)
      if (prevPlaying.length > 0) {
        for (const prev of prevPlaying) {
          await updatePesilatSafely(client, prev.id, { is_playing: false, timer_running: false, is_done: true });
        }
      }

      // Matikan status playing pesilat lain di arena yang sama (jika ada sisa)
      await client.from("pesilat").update({ is_playing: false, timer_running: false }).eq("arena", arenaNum);

      // Aktifkan pesilat baru
      const { data, error } = await updatePesilatSafely(client, id, { is_playing: true, timer_running: true, timer_last_updated_at: Date.now(), is_done: false });

      // Sinkronisasi lokal memori: ubah status ke done
      prevPlaying.forEach(prev => {
        const idx = localPesilatList.findIndex(p => p.id === prev.id);
        if (idx !== -1) {
          localPesilatList[idx].is_playing = false;
          localPesilatList[idx].timer_running = false;
          localPesilatList[idx].is_done = true;
        }
      });

      // Set status play yang baru
      localPesilatList.forEach(p => {
        if (p.arena === arenaNum) {
          p.is_playing = (p.id === id);
          if (p.id === id) {
            p.timer_running = true;
            p.timer_last_updated_at = Date.now();
            p.is_done = false;
          } else if (p.id !== id && !p.is_done) {
            p.timer_running = false;
          }
        }
      });

      if (error) {
        handleSupabaseError(error, "mengaktifkan play pesilat");
        return res.json(localPesilatList.find(p => p.id === id));
      }
      return res.json(data ? (Array.isArray(data) ? data[0] : data) : localPesilatList.find(p => p.id === id));
    } else {
      // Sinkronisasi lokal memori fallback: ubah status ke done
      prevPlaying.forEach(prev => {
        const idx = localPesilatList.findIndex(p => p.id === prev.id);
        if (idx !== -1) {
          localPesilatList[idx].is_playing = false;
          localPesilatList[idx].timer_running = false;
          localPesilatList[idx].is_done = true;
        }
      });

      // Set status play yang baru
      localPesilatList.forEach(p => {
        if (p.arena === arenaNum) {
          p.is_playing = (p.id === id);
          if (p.id === id) {
            p.timer_running = true;
            p.timer_last_updated_at = Date.now();
            p.is_done = false;
          } else if (p.id !== id && !p.is_done) {
            p.timer_running = false;
          }
        }
      });

      return res.json(localPesilatList.find(p => p.id === id));
    }
  } catch (error: any) {
    console.error("Gagal mengaktifkan play:", error.message);
    return res.json(localPesilatList.find(p => p.id === id));
  }
});

// 4b. PUT Stop Pesilat Display (Menyembunyikan / Pause Display)
app.put("/api/pesilat/:id/stop", async (req, res) => {
  const { id } = req.params;

  try {
    const index = localPesilatList.findIndex(p => p.id === id);
    if (index !== -1) {
      localPesilatList[index].is_playing = false;
      localPesilatList[index].timer_running = false;
    }

    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client
        .from("pesilat")
        .update({ is_playing: false, timer_running: false })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, "menghentikan play pesilat");
        return res.json(localPesilatList[index]);
      }
      return res.json(data);
    } else {
      return res.json(localPesilatList[index]);
    }
  } catch (error: any) {
    console.error("Gagal menghentikan play:", error.message);
    return res.json(localPesilatList.find(p => p.id === id));
  }
});

// 4c. PUT Update Timer Pesilat (Mengatur countdown / waktu)
app.put("/api/pesilat/:id/timer", async (req, res) => {
  const { id } = req.params;
  const { timer_duration, timer_seconds_left, timer_running, is_done } = req.body;

  try {
    const index = localPesilatList.findIndex(p => p.id === id);
    if (index !== -1) {
      if (typeof timer_duration === "number") localPesilatList[index].timer_duration = timer_duration;
      if (typeof timer_seconds_left === "number") localPesilatList[index].timer_seconds_left = timer_seconds_left;
      if (typeof timer_running === "boolean") {
        localPesilatList[index].timer_running = timer_running;
        localPesilatList[index].timer_last_updated_at = Date.now();
      }
      if (typeof is_done === "boolean") {
        localPesilatList[index].is_done = is_done;
        if (is_done) {
          localPesilatList[index].is_playing = false;
          localPesilatList[index].timer_running = false;
        }
      }
    }

    const client = getSupabaseClient();
    if (client) {
      const updateData: any = {};
      if (typeof timer_duration === "number") updateData.timer_duration = timer_duration;
      if (typeof timer_seconds_left === "number") updateData.timer_seconds_left = timer_seconds_left;
      if (typeof timer_running === "boolean") {
        updateData.timer_running = timer_running;
        updateData.timer_last_updated_at = Date.now();
      }
      if (typeof is_done === "boolean") {
        updateData.is_done = is_done;
        if (is_done) {
          updateData.is_playing = false;
          updateData.timer_running = false;
        }
      }

      const { data, error } = await updatePesilatSafely(client, id, updateData);

      if (error) {
        handleSupabaseError(error, "mengupdate timer");
        return res.json(localPesilatList[index]);
      }
      return res.json(data ? (Array.isArray(data) ? data[0] : data) : localPesilatList[index]);
    } else {
      return res.json(localPesilatList[index]);
    }
  } catch (error: any) {
    console.error("Gagal mengupdate timer:", error.message);
    return res.json(localPesilatList.find(p => p.id === id));
  }
});

// 4d. PUT Handle Timeout & Auto-play next match in waiting list
app.put("/api/pesilat/:id/timeout", async (req, res) => {
  const { id } = req.params;

  try {
    let allPesilats: Pesilat[] = [];
    const client = getSupabaseClient();

    if (client) {
      const { data: fetchAll, error: fetchErr } = await client
        .from("pesilat")
        .select("*");
      if (!fetchErr && fetchAll) {
        allPesilats = fetchAll;
      } else {
        allPesilats = localPesilatList;
      }
    } else {
      allPesilats = localPesilatList;
    }

    const currentPesilat = allPesilats.find(p => p.id === id);
    if (!currentPesilat) {
      return res.status(404).json({ error: "Pesilat tidak ditemukan." });
    }

    // Hanya proses jika pesilat ini memang sedang bermain
    if (!currentPesilat.is_playing) {
      return res.json({ message: "Pesilat sudah tidak aktif bermain.", currentPesilat });
    }

    const arenaNum = currentPesilat.arena;

    // Cari daftar tunggu untuk arena ini (pesilat lain yang is_playing false)
    const waitingList = allPesilats.filter(p => p.arena === arenaNum && p.id !== id && !p.is_playing);

    // Urutkan daftar tunggu secara cerdas berdasarkan nomor_partai
    waitingList.sort((a, b) => {
      const numA = parseFloat(a.nomor_partai);
      const numB = parseFloat(b.nomor_partai);
      if (!isNaN(numA) && !isNaN(numB)) {
        if (numA !== numB) return numA - numB;
      }
      if (a.nomor_partai !== b.nomor_partai) {
        return a.nomor_partai.localeCompare(b.nomor_partai, undefined, { numeric: true, sensitivity: "base" });
      }
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeA - timeB;
    });

    const nextPesilat = waitingList[0];

    if (client) {
      // Set pesilat saat ini ke status done karena waktunya sudah habis (selesai)
      await updatePesilatSafely(client, id, { is_playing: false, timer_running: false, is_done: true, timer_seconds_left: 0 });

      // Sinkronisasi lokal memori: ubah status ke done
      const currIdx = localPesilatList.findIndex(p => p.id === id);
      if (currIdx !== -1) {
        localPesilatList[currIdx].is_playing = false;
        localPesilatList[currIdx].timer_running = false;
        localPesilatList[currIdx].timer_seconds_left = 0;
        localPesilatList[currIdx].is_done = true;
      }

      if (nextPesilat) {
        // Aktifkan pesilat berikutnya
        const { data, error } = await updatePesilatSafely(client, nextPesilat.id, { is_playing: true, timer_running: true, timer_last_updated_at: Date.now(), is_done: false });

        // Sinkronisasi lokal memori
        localPesilatList.forEach(p => {
          if (p.arena === arenaNum) {
            p.is_playing = false;
            p.timer_running = false;
          }
        });
        const nextIdx = localPesilatList.findIndex(p => p.id === nextPesilat.id);
        if (nextIdx !== -1) {
          localPesilatList[nextIdx].is_playing = true;
          localPesilatList[nextIdx].timer_running = true;
          localPesilatList[nextIdx].timer_last_updated_at = Date.now();
          localPesilatList[nextIdx].is_done = false;
        }

        return res.json({ message: "Timeout diproses. Partai lama dipindahkan ke daftar selesai. Partai berikutnya mulai tampil.", nextPesilat: data ? (Array.isArray(data) ? data[0] : data) : nextPesilat });
      } else {
        return res.json({ message: "Timeout diproses. Partai lama dipindahkan ke daftar selesai. Tidak ada partai berikutnya di daftar tunggu." });
      }
    } else {
      // Logika lokal fallback: ubah status ke done
      const currIdx = localPesilatList.findIndex(p => p.id === id);
      if (currIdx !== -1) {
        localPesilatList[currIdx].is_playing = false;
        localPesilatList[currIdx].timer_running = false;
        localPesilatList[currIdx].timer_seconds_left = 0;
        localPesilatList[currIdx].is_done = true;
      }

      if (nextPesilat) {
        localPesilatList.forEach(p => {
          if (p.arena === arenaNum) {
            p.is_playing = false;
            p.timer_running = false;
          }
        });
        const nextIdx = localPesilatList.findIndex(p => p.id === nextPesilat.id);
        if (nextIdx !== -1) {
          localPesilatList[nextIdx].is_playing = true;
          localPesilatList[nextIdx].timer_running = true;
          localPesilatList[nextIdx].timer_last_updated_at = Date.now();
          localPesilatList[nextIdx].is_done = false;
        }
        return res.json({ message: "Timeout lokal diproses. Partai lama dipindahkan ke daftar selesai. Partai berikutnya mulai.", nextPesilat });
      } else {
        return res.json({ message: "Timeout lokal diproses. Partai lama dipindahkan ke daftar selesai. Tidak ada partai berikutnya." });
      }
    }
  } catch (error: any) {
    console.error("Gagal memproses timeout:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 5. DELETE Pesilat
app.delete("/api/pesilat/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const client = getSupabaseClient();
    if (client) {
      const { error } = await client
        .from("pesilat")
        .delete()
        .eq("id", id);

      if (error) {
        handleSupabaseError(error, "menghapus pesilat");
        const index = localPesilatList.findIndex(p => p.id === id);
        if (index !== -1) {
          localPesilatList.splice(index, 1);
        }
        return res.json({ message: "Pesilat berhasil dihapus dari memori." });
      }
      return res.json({ message: "Pesilat berhasil dihapus." });
    } else {
      const index = localPesilatList.findIndex(p => p.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Pesilat tidak ditemukan." });
      }
      localPesilatList.splice(index, 1);
      return res.json({ message: "Pesilat berhasil dihapus dari memori." });
    }
  } catch (error: any) {
    console.error("Gagal menghapus pesilat:", error.message);
    const index = localPesilatList.findIndex(p => p.id === id);
    if (index !== -1) {
      localPesilatList.splice(index, 1);
      return res.json({ message: "Pesilat berhasil dihapus dari memori." });
    }
    res.status(500).json({ error: error.message });
  }
});

// 5a. DELETE All Pesilat (Hapus Semua)
app.delete("/api/pesilat", async (req, res) => {
  try {
    const client = getSupabaseClient();
    if (client) {
      const { error } = await client
        .from("pesilat")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) {
        handleSupabaseError(error, "menghapus semua pesilat");
        localPesilatList.length = 0;
        return res.json({ message: "Semua pesilat berhasil dihapus dari memori." });
      }
      localPesilatList.length = 0;
      return res.json({ message: "Semua pesilat berhasil dihapus." });
    } else {
      localPesilatList.length = 0;
      return res.json({ message: "Semua pesilat berhasil dihapus dari memori." });
    }
  } catch (error: any) {
    console.error("Gagal menghapus semua pesilat:", error.message);
    localPesilatList.length = 0;
    res.status(500).json({ error: error.message });
  }
});

// 5b. POST Delete Batch Pesilat (Hapus Ceklist / Terpilih)
app.post("/api/pesilat/delete-batch", async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: "Data 'ids' harus berupa array." });
  }

  try {
    const client = getSupabaseClient();
    if (client) {
      const { error } = await client
        .from("pesilat")
        .delete()
        .in("id", ids);

      if (error) {
        handleSupabaseError(error, "menghapus batch pesilat");
        ids.forEach(id => {
          const index = localPesilatList.findIndex(p => p.id === id);
          if (index !== -1) localPesilatList.splice(index, 1);
        });
        return res.json({ message: "Batch pesilat berhasil dihapus dari memori." });
      }
      ids.forEach(id => {
        const index = localPesilatList.findIndex(p => p.id === id);
        if (index !== -1) localPesilatList.splice(index, 1);
      });
      return res.json({ message: "Batch pesilat berhasil dihapus." });
    } else {
      ids.forEach(id => {
        const index = localPesilatList.findIndex(p => p.id === id);
        if (index !== -1) localPesilatList.splice(index, 1);
      });
      return res.json({ message: "Batch pesilat berhasil dihapus dari memori." });
    }
  } catch (error: any) {
    console.error("Gagal menghapus batch pesilat:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 6. GET Pengaturan Arena
app.get("/api/pengaturan_arena", async (req, res) => {
  try {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client
        .from("pengaturan_arena")
        .select("jumlah_arena")
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .maybeSingle();

      if (error) {
        handleSupabaseError(error, "mengambil pengaturan arena");
        return res.json({ jumlah_arena: localJumlahArena });
      }
      if (!data) {
        // Jika belum ada row, kembalikan default localJumlahArena
        return res.json({ jumlah_arena: localJumlahArena });
      }
      
      // Update local cache agar selalu sinkron
      if (data && typeof data.jumlah_arena === "number") {
        localJumlahArena = data.jumlah_arena;
      }
      return res.json(data);
    } else {
      return res.json({ jumlah_arena: localJumlahArena });
    }
  } catch (error: any) {
    console.error("Gagal mengambil pengaturan arena:", error.message);
    return res.json({ jumlah_arena: localJumlahArena });
  }
});

// 7. PUT/POST Update Pengaturan Arena
app.put("/api/pengaturan_arena", async (req, res) => {
  const { jumlah_arena } = req.body;
  const numArena = Number(jumlah_arena);

  if (isNaN(numArena) || numArena < 1 || numArena > 12) {
    return res.status(400).json({ error: "Jumlah arena tidak valid (harus antara 1 hingga 12)." });
  }

  // Selalu update cache lokal terlebih dahulu demi reaktivitas cepat
  localJumlahArena = numArena;

  try {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client
        .from("pengaturan_arena")
        .upsert({
          id: "00000000-0000-0000-0000-000000000001",
          jumlah_arena: numArena,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, "mengupdate pengaturan arena");
        return res.json({ id: "00000000-0000-0000-0000-000000000001", jumlah_arena: localJumlahArena });
      }
      return res.json(data);
    } else {
      return res.json({ id: "00000000-0000-0000-0000-000000000001", jumlah_arena: localJumlahArena });
    }
  } catch (error: any) {
    console.error("Gagal mengupdate pengaturan arena:", error.message);
    return res.json({ id: "00000000-0000-0000-0000-000000000001", jumlah_arena: localJumlahArena });
  }
});

// Server-side Vite or Production Static asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
