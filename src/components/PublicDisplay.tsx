import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Shield, Users, Award, Zap, AlertCircle, RefreshCw, Trophy } from "lucide-react";
import { Pesilat, ConfigStatus } from "../types";

export default function PublicDisplay() {
  const [pesilatList, setPesilatList] = useState<Pesilat[]>([]);
  const [jumlahArena, setJumlahArena] = useState<number>(3);
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const processingTimeoutRef = useRef<string | null>(null);

  const parseJumlahArena = (data: any): number => {
    if (!data) return 3;
    const raw = typeof data === "object" ? data.jumlah_arena : data;
    const parsed = Number(raw);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) {
      return parsed;
    }
    return 3;
  };

  const handleTimeoutMatch = async (id: string) => {
    try {
      const res = await fetch(`/api/pesilat/${id}/timeout`, { method: "PUT" });
      if (res.ok) {
        const pesilatRes = await fetch("/api/pesilat");
        const pesilatData = await pesilatRes.json();
        if (Array.isArray(pesilatData)) {
          setPesilatList(pesilatData);
        }
      }
    } catch (err) {
      console.error("Gagal memproses timeout otomatis di display:", err);
    } finally {
      if (processingTimeoutRef.current === id) {
        processingTimeoutRef.current = null;
      }
    }
  };

  // Local real-time timer countdown loop (smooth countdown syncing)
  useEffect(() => {
    const timer = setInterval(() => {
      setPesilatList(prevList => {
        let changed = false;
        const newList = prevList.map(p => {
          if (p.is_playing && p.timer_running && p.timer_seconds_left > 0) {
            changed = true;
            const newSeconds = p.timer_seconds_left - 1;
            
            // Jika waktu tanding habis, langsung ubah status secara optimistik ke selesai/standby
            if (newSeconds === 0) {
              if (processingTimeoutRef.current !== p.id) {
                processingTimeoutRef.current = p.id;
                console.log(`Partai ${p.nomor_partai} selesai dari loop utama. Mengaktifkan partai berikutnya...`);
                handleTimeoutMatch(p.id);
              }
              return {
                ...p,
                timer_seconds_left: 0,
                timer_running: false,
                is_playing: false, // langsung sembunyikan untuk mengembalikan gelanggang ke standby / menunggu
                is_done: true
              };
            }

            return {
              ...p,
              timer_seconds_left: newSeconds,
              timer_running: newSeconds > 0 ? p.timer_running : false
            };
          }
          return p;
        });
        return changed ? newList : prevList;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Ambil status konfigurasi dan data awal
  useEffect(() => {
    async function initApp() {
      try {
        setLoading(true);
        // Ambil konfigurasi Supabase dari backend
        const configRes = await fetch("/api/config-status");
        const configData: ConfigStatus = await configRes.json();
        setConfig(configData);

        // Ambil data jumlah arena awal
        const arenaRes = await fetch("/api/pengaturan_arena");
        const arenaData = await arenaRes.json();
        setJumlahArena(parseJumlahArena(arenaData));

        // Ambil data pesilat awal
        const pesilatRes = await fetch("/api/pesilat");
        const pesilatData = await pesilatRes.json();
        setPesilatList(Array.isArray(pesilatData) ? pesilatData : []);

        setLoading(false);
      } catch (err: any) {
        console.error("Inisialisasi gagal:", err);
        setError("Gagal memuat konfigurasi awal.");
        setLoading(false);
      }
    }

    initApp();
  }, []);

  // 2. Setup Real-time Listener (Supabase vs Fallback Polling)
  useEffect(() => {
    if (!config) return;

    let supabaseClient: any = null;
    let arenaSubscription: any = null;
    let pesilatSubscription: any = null;
    let fallbackInterval: any = null;

    // --- INTEGRASI SUPABASE REAL-TIME ---
    if (config.configured && config.supabaseUrl && config.supabaseAnonKey) {
      console.log("Supabase terkonfigurasi. Memulai listener Real-time client-side...");
      try {
        supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);

        // Mendengarkan perubahan di tabel 'pengaturan_arena'
        arenaSubscription = supabaseClient
          .channel("realtime-arena")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "pengaturan_arena" },
            (payload: any) => {
              console.log("Menerima update pengaturan_arena Real-time:", payload);
              if (payload.new) {
                setJumlahArena(parseJumlahArena(payload.new));
                setLastUpdated(new Date());
              }
            }
          )
          .subscribe((status: string) => {
            console.log("Status subscription arena:", status);
          });

        // Mendengarkan perubahan di tabel 'pesilat'
        pesilatSubscription = supabaseClient
          .channel("realtime-pesilat")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "pesilat" },
            () => {
              console.log("Menerima update tabel pesilat Real-time. Mengambil ulang data...");
              fetchLatestPesilat();
            }
          )
          .subscribe((status: string) => {
            console.log("Status subscription pesilat:", status);
          });

      } catch (err) {
        console.error("Gagal membuat koneksi real-time Supabase:", err);
      }
    }

    // --- FAILSAFE BACKUP POLLING ---
    // Kami selalu menjalankan polling ini secara berkala (setiap 3 detik) sebagai backup/failsafe.
    // Jika real-time Supabase gagal, mati, terputus, atau replication tidak diaktifkan pada tabel di Supabase Dashboard,
    // data pada display publik akan tetap ter-update secara otomatis secara berkala!
    console.log("Menjalankan failsafe background polling untuk kestabilan display...");
    fallbackInterval = setInterval(() => {
      fetchLatestDataFallback();
    }, 3000); // Polling setiap 3 detik

    // Fungsi untuk mengambil pesilat terbaru (digunakan oleh real-time callback)
    async function fetchLatestPesilat() {
      try {
        const res = await fetch("/api/pesilat");
        const data = await res.json();
        if (Array.isArray(data)) {
          setPesilatList(prev => {
            return data.map((newP: Pesilat) => {
              const oldP = prev.find(o => o.id === newP.id);
              if (oldP) {
                const runningEqual = oldP.timer_running === newP.timer_running;
                const timeDiff = Math.abs(oldP.timer_seconds_left - newP.timer_seconds_left);
                if (runningEqual && timeDiff <= 1) {
                  return {
                    ...newP,
                    timer_seconds_left: oldP.timer_seconds_left
                  };
                }
              }
              return newP;
            });
          });
        }
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Gagal memperbarui pesilat secara real-time:", err);
      }
    }

    // Fungsi polling gabungan jika tidak menggunakan Supabase
    async function fetchLatestDataFallback() {
      try {
        const [pesilatRes, arenaRes] = await Promise.all([
          fetch("/api/pesilat"),
          fetch("/api/pengaturan_arena")
        ]);
        const pesilatData = await pesilatRes.json();
        const arenaData = await arenaRes.json();

        if (Array.isArray(pesilatData)) {
          // Lakukan sinkronisasi timer secara cerdas
          setPesilatList(prev => {
            return pesilatData.map((newP: Pesilat) => {
              const oldP = prev.find(o => o.id === newP.id);
              if (oldP) {
                const runningEqual = oldP.timer_running === newP.timer_running;
                const timeDiff = Math.abs(oldP.timer_seconds_left - newP.timer_seconds_left);
                if (runningEqual && timeDiff <= 1) {
                  return {
                    ...newP,
                    timer_seconds_left: oldP.timer_seconds_left // Pertahankan local smooth countdown
                  };
                }
              }
              return newP;
            });
          });
        }
        
        setJumlahArena(parseJumlahArena(arenaData));
        setLastUpdated(new Date());
      } catch (err) {
        console.log("Gagal melakukan polling data fallback:", err);
      }
    }

    // Cleanup subscription/interval saat komponen unmount
    return () => {
      if (arenaSubscription) {
        supabaseClient.removeChannel(arenaSubscription);
      }
      if (pesilatSubscription) {
        supabaseClient.removeChannel(pesilatSubscription);
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [config]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
        <p className="text-neutral-400 font-medium">Memuat Sistem Boarding Pencak Silat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white px-4">
        <div className="bg-red-950/40 border border-red-800 text-red-200 p-6 rounded-xl max-w-md text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p className="text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Generate daftar arena berdasarkan jumlah_arena (1-indexed array: [1, 2, ...])
  const arenas = Array.from({ length: jumlahArena }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 text-white font-sans p-4 sm:p-6 select-none flex flex-col justify-between">
      {/* HEADER UTAMA - VIBRANT PALETTE INDIGO HEADER WITH WHITE ROTATING LOGO */}
      <header className="bg-indigo-700 p-6 rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between border-b-4 border-indigo-500 shadow-xl mb-6">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-lg">
            <div className="w-8 h-8 bg-indigo-700 rotate-45 flex items-center justify-center">
              <span className="text-white font-bold -rotate-45 text-xs">IPS</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-white font-display">
              SISTEM BOARDING <span className="text-amber-300">PENCAK SILAT</span>
            </h1>
            <p className="text-indigo-200 text-xs font-semibold tracking-widest uppercase mt-0.5">
              Live Boarding System • Real-time Monitoring
            </p>
          </div>
        </div>

        {/* Status Mode Real-time & Clock */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="text-left">
            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider font-mono">Waktu Pembaruan</p>
            <p className="text-sm font-mono font-bold text-white bg-indigo-850 px-3 py-1 rounded-lg mt-0.5 border border-indigo-600/50">{lastUpdated.toLocaleTimeString()}</p>
          </div>
          <div className="hidden md:block h-10 w-px bg-indigo-500/50"></div>

          {config?.mode === "supabase" ? (
            <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg font-bold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span>Supabase Live</span>
            </div>
          ) : (
            <div className="bg-amber-500 text-neutral-950 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg font-bold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 bg-neutral-950 rounded-full animate-pulse"></span>
              <span>Simulated Live</span>
            </div>
          )}
        </div>
      </header>

      {/* WARNING BANNER JIKA SUPABASE BELUM DIAKTIFKAN */}
      {!config?.configured && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-200">
            <span className="font-semibold">Info Demo:</span> Halaman ini saat ini berjalan dalam 
            <span className="font-semibold"> mode simulasi lokal</span> karena parameter Supabase belum dikonfigurasi. 
            Perubahan dari panel Admin tetap akan ter-update secara real-time. Masukkan kunci Supabase Anda di panel 
            pengaturan / berkas `.env` untuk mengaktifkan real-time cloud nyata lewat WebSockets.
          </div>
        </div>
      )}

      {/* DYNAMIC ARENA GRID */}
      <main className="flex-grow">
        {arenas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/60 border-2 border-slate-800 rounded-3xl">
            <Shield className="w-16 h-16 text-slate-700 mb-4" />
            <p className="text-slate-400 text-lg font-medium">Tidak ada arena aktif yang dikonfigurasi.</p>
            <p className="text-slate-500 text-sm mt-1">Ubah jumlah arena di dashboard admin untuk mengaktifkan display.</p>
          </div>
        ) : (
          <div 
            className="grid gap-6 h-full transition-all duration-500"
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`
            }}
          >
            {arenas.map((arenaNum) => {
              // Saring pesilat untuk arena ini
              const pesilatInArena = pesilatList.filter(p => Number(p.arena) === arenaNum);
              
              // Temukan atlet yang sedang 'is_playing' di arena ini
              const playingPesilat = pesilatInArena.find(p => p.is_playing);

              // Atlet lain di arena ini yang tidak is_playing dianggap daftar tunggu (antrean)
              const waitingQueue = pesilatInArena
                .filter(p => !p.is_playing)
                .sort((a, b) => {
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

              const colors = ["bg-rose-600", "bg-indigo-600", "bg-amber-500", "bg-emerald-600", "bg-sky-600", "bg-violet-600"];
              const arenaColor = playingPesilat ? colors[(arenaNum - 1) % colors.length] : "bg-slate-700";

              return (
                <div 
                  key={arenaNum}
                  id={`arena-${arenaNum}`}
                  className="flex flex-col bg-slate-900 rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/5 h-full min-h-[620px] hover:border-indigo-500/30 hover:shadow-indigo-500/5 transition duration-300"
                >
                  {/* Arena Header - Vibrant Palette */}
                  <div className={`${arenaColor} p-4 text-center border-b border-white/10 relative`}>
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white font-display">
                      Arena {arenaNum}
                    </h2>
                    <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-0.5 font-mono">
                      {playingPesilat ? (playingPesilat.nama_pesilat_biru ? "Tanding • Sudut Merah vs Biru" : "Seni • Tunggal / Solo Stage") : "Maintenance / Standby"}
                    </p>
                    {playingPesilat && (
                      <span className="absolute top-4 right-4 inline-flex items-center gap-1 bg-black/40 text-white border border-white/10 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase font-mono shadow-inner">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                        LIVE ON AIR
                      </span>
                    )}
                  </div>

                  {/* Inner Container */}
                  <div className="flex-1 p-5 flex flex-col gap-4 bg-slate-900/90 justify-between min-h-0">
                    
                    {!playingPesilat ? (
                      /* ARENA KOSONG / STANDBY SCREEN DENGAN DAFTAR TUNGGU */
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg mb-4 text-2xl">
                          ⏳
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs font-display">Gelanggang Standby / Kosong</p>
                        <p className="text-[10px] text-slate-500 mt-1.5 font-mono uppercase">Menunggu Aktivasi Partai oleh Admin</p>
                        
                        {waitingQueue.length > 0 && (
                          <div className="mt-6 w-full max-w-xs text-left bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4">
                            <p className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-wider mb-2">Partai Terjadwal di Arena Ini:</p>
                            <div className="space-y-1.5">
                              {waitingQueue.slice(0, 3).map((item, idx) => (
                                <div key={item.id} className="text-xs flex justify-between text-slate-300 font-medium">
                                  <span className="truncate">P-{item.nomor_partai} • {item.nama_pesilat}</span>
                                  <span className="text-[9px] text-indigo-400 font-mono uppercase shrink-0">G-{item.arena}</span>
                                </div>
                              ))}
                              {waitingQueue.length > 3 && (
                                <p className="text-[9px] text-slate-500 italic mt-1 font-mono">+ {waitingQueue.length - 3} partai lainnya</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* ADA MATCH AKTIF DENGAN TIMER CUSTOM */
                      <div className="space-y-4 flex flex-col min-h-0">
                        
                        {/* Match Category Info Box with Match Number */}
                        <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex justify-between items-center shadow-inner">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                              Kategori {playingPesilat.kategori} • {playingPesilat.gender}
                            </span>
                            <h3 className="text-base font-black mt-0.5 text-slate-100 uppercase tracking-tight font-display">
                              {playingPesilat.kelas}
                            </h3>
                          </div>
                          <div className="bg-amber-400/15 border border-amber-400/30 rounded-xl px-3.5 py-1.5 text-center shadow-lg">
                            <p className="text-[8px] text-amber-300 font-mono tracking-widest uppercase font-black">PARTAI</p>
                            <p className="font-mono text-base font-black text-amber-400">{playingPesilat.nomor_partai || "01"}</p>
                          </div>
                        </div>

                        {playingPesilat.nama_pesilat_biru ? (
                          /* KATEGORI TANDING: HEAD-TO-HEAD (SUDUT MERAH VS SUDUT BIRU) */
                          <div className="space-y-3.5 relative">
                            {/* Competitor A - Sudut Merah */}
                            <div className="bg-red-500/10 border-l-8 border-red-600 p-4 rounded-r-2xl shadow-lg ring-1 ring-red-500/5">
                              <span className="bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded font-mono text-[9px] font-black uppercase tracking-widest">
                                Sudut Merah
                              </span>
                              <h4 className="text-xl font-black text-white mt-1.5 uppercase line-clamp-1 font-display">
                                {playingPesilat.nama_pesilat}
                              </h4>
                              <p className="text-xs text-red-200/80 font-bold mt-0.5 tracking-wide truncate">
                                {playingPesilat.kontingen}
                              </p>
                            </div>

                            {/* VS Divider Badge */}
                            <div className="flex justify-center -my-2.5 relative z-10">
                              <div className="bg-slate-950 px-4 py-1.5 border-2 border-slate-800 rounded-full text-[10px] font-black font-mono text-amber-400 shadow-xl tracking-widest">
                                VS
                              </div>
                            </div>

                            {/* Competitor B - Sudut Biru */}
                            <div className="bg-blue-500/10 border-l-8 border-blue-600 p-4 rounded-r-2xl shadow-lg ring-1 ring-blue-500/5 text-right">
                              <span className="bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded font-mono text-[9px] font-black uppercase tracking-widest">
                                Sudut Biru
                              </span>
                              <h4 className="text-xl font-black text-white mt-1.5 uppercase line-clamp-1 font-display">
                                {playingPesilat.nama_pesilat_biru}
                              </h4>
                              <p className="text-xs text-blue-200/80 font-bold mt-0.5 tracking-wide truncate">
                                {playingPesilat.kontingen_biru}
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* KATEGORI TUNGGAL / SENI ATAU HANYA 1 FIGHTER (SOLO STAGE) */
                          <div className="flex flex-col items-center py-6 text-center bg-slate-950/40 border border-slate-850 rounded-2xl p-4">
                            <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg text-2xl mb-3 animate-pulse">
                              🥋
                            </div>
                            <h4 className="text-xl font-black tracking-tight text-white uppercase line-clamp-1 font-display">
                              {playingPesilat.nama_pesilat}
                            </h4>
                            <p className="text-sm text-amber-400 font-bold uppercase mt-1 tracking-wider">
                              {playingPesilat.kontingen}
                            </p>
                            <p className="text-xs text-slate-400 font-medium mt-1 font-mono uppercase">
                              {playingPesilat.gender} • {playingPesilat.kelas}
                            </p>
                          </div>
                        )}

                        {/* HIGH-CONTRAST DIGITAL COUNTDOWN TIMER DISPLAY */}
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner mt-2">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Sisa Waktu Pertandingan</p>
                          
                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono text-5xl font-black tracking-widest leading-none ${
                              playingPesilat.timer_seconds_left <= 10 && playingPesilat.timer_running
                                ? "text-red-500 animate-pulse drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                                : playingPesilat.timer_seconds_left === 0
                                  ? "text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                                  : "text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                            }`}>
                              {Math.floor(playingPesilat.timer_seconds_left / 60).toString().padStart(2, "0")}
                              :
                              {(playingPesilat.timer_seconds_left % 60).toString().padStart(2, "0")}
                            </span>
                          </div>

                          <div className="mt-2 text-center">
                            {playingPesilat.timer_seconds_left === 0 ? (
                              <span className="bg-amber-400/10 text-amber-400 px-3 py-1 border border-amber-400/25 rounded-full text-[9px] font-black uppercase tracking-widest font-mono">
                                🔔 WAKTU HABIS (TIMEOUT)
                              </span>
                            ) : !playingPesilat.timer_running ? (
                              <span className="bg-slate-900 text-slate-500 px-3 py-1 border border-slate-800 rounded-full text-[9px] font-bold uppercase tracking-widest font-mono">
                                ⏸️ PAUSED / BERHENTI
                              </span>
                            ) : (
                              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 border border-emerald-500/25 rounded-full text-[9px] font-black uppercase tracking-widest font-mono animate-pulse">
                                ⏳ LIVE COUNTDOWN
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Daftar Antrean Section (Waiting Queue) */}
                    {playingPesilat && (
                      <div className="mt-auto border-t border-slate-800/80 pt-3 flex flex-col min-h-0 justify-end">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                          Daftar Tunggu Arena ({waitingQueue.length})
                        </p>
                        <div className="space-y-1.5 overflow-y-auto max-h-[140px] pr-1 custom-scrollbar">
                          {waitingQueue.length === 0 ? (
                            <div className="text-[10px] text-slate-600 font-mono py-1.5 italic">
                              Tidak ada antrean berikutnya.
                            </div>
                          ) : (
                            waitingQueue.map((pesilat, idx) => (
                              <div 
                                key={pesilat.id} 
                                className="bg-slate-950/40 p-2 rounded-xl flex justify-between items-center text-xs border border-white/5 hover:bg-slate-950/70 transition"
                              >
                                <div className="min-w-0 pr-2">
                                  <span className="font-bold text-slate-300 line-clamp-1 uppercase text-[10px]">
                                    P-{pesilat.nomor_partai || "00"} • {pesilat.nama_pesilat}
                                  </span>
                                  {pesilat.nama_pesilat_biru && (
                                    <span className="text-[9px] text-slate-400 font-semibold block mt-0.5 uppercase truncate">
                                      vs {pesilat.nama_pesilat_biru}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[8px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-mono uppercase shrink-0">
                                  {pesilat.kelas.split(" ")[0] || pesilat.kelas}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Arena Footer Info */}
                    <div className="p-2.5 bg-slate-950/50 border border-slate-850 rounded-xl text-[9px] text-slate-500 font-mono flex items-center justify-between mt-2">
                      <span>IP-Arena: #10.0.0.{arenaNum}</span>
                      <span className="uppercase text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        GELANGGANG READY
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FOOTER INFORMASI BAWAH */}
      <footer className="mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
        <div>
          &copy; {new Date().getFullYear()} IPSI - Ikatan Pencak Silat Indonesia. All Rights Reserved.
        </div>
        <div className="flex items-center gap-3">
          <span>Sistem Boarding v1.0.0 • Live Display Board</span>
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-rose-500 border border-slate-950"></div>
            <div className="w-4 h-4 rounded-full bg-blue-500 border border-slate-950"></div>
            <div className="w-4 h-4 rounded-full bg-emerald-500 border border-slate-950"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
