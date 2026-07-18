import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Shield, Users, Award, Zap, AlertCircle, RefreshCw, Trophy, Volume2, VolumeX } from "lucide-react";
import { Pesilat, ConfigStatus } from "../types";

export default function PublicDisplay() {
  const [pesilatList, setPesilatList] = useState<Pesilat[]>([]);
  const [jumlahArena, setJumlahArena] = useState<number>(3);
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const announcedIdsRef = useRef<Record<number, string>>({});
  const processingTimeoutRef = useRef<string | null>(null);
  const activeUtterancesRef = useRef<any[]>([]);
  const speechQueueRef = useRef<{ text: string; arenaNum: number; pesilatId: string }[]>([]);
  const isSpeakingRef = useRef<boolean>(false);

  // Monitor first user interaction to unlock SpeechSynthesis restriction in browsers
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          console.warn(e);
        }
      }
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  // Pre-load / warm up SpeechSynthesis voices list
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  // Process speech queue sequentially to prevent overlap and lockouts
  const processQueue = () => {
    if (!isAudioEnabled) {
      speechQueueRef.current = [];
      isSpeakingRef.current = false;
      return;
    }
    if (isSpeakingRef.current) return;
    if (speechQueueRef.current.length === 0) return;

    const current = speechQueueRef.current[0];
    isSpeakingRef.current = true;

    if (!("speechSynthesis" in window)) {
      isSpeakingRef.current = false;
      speechQueueRef.current.shift();
      return;
    }

    // Pastikan engine tidak ter-pause
    try {
      window.speechSynthesis.resume();
    } catch (e) {
      console.warn("Gagal resume speech:", e);
    }

    const utterance = new SpeechSynthesisUtterance(current.text);
    
    // Gunakan suara Bahasa Indonesia jika ada
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(voice => voice.lang.startsWith("id") || voice.lang.includes("ID") || voice.lang.includes("id-ID"));
    if (idVoice) {
      utterance.voice = idVoice;
    }
    
    utterance.lang = "id-ID";
    utterance.rate = 0.85; // Sedikit santai agar terdengar berwibawa
    utterance.pitch = 1.0;

    // Hitung estimasi waktu bicara (misal 1 karakter ~75ms) ditambah buffer keamanan
    const charCount = current.text.length;
    const estimatedDurationMs = Math.max(4000, (charCount * 75) + 2000);

    let isDone = false;
    const finishUtterance = () => {
      if (isDone) return;
      isDone = true;
      clearTimeout(safetyTimeout);
      activeUtterancesRef.current = activeUtterancesRef.current.filter(u => u !== utterance);
      isSpeakingRef.current = false;
      speechQueueRef.current.shift();
      // Sedikit jeda antar panggilan agar lebih berwibawa dan teratur
      setTimeout(() => {
        processQueue();
      }, 1000);
    };

    // Safety timeout to reset speech queue if synthesis gets stuck in browser engine
    const safetyTimeout = setTimeout(() => {
      console.warn("SpeechSynthesis stuck, forcing queue skip...");
      finishUtterance();
    }, estimatedDurationMs);

    activeUtterancesRef.current.push(utterance);

    utterance.onend = () => {
      console.log("Speech finished normally");
      finishUtterance();
    };

    utterance.onerror = (e) => {
      console.warn("Speech error:", e);
      finishUtterance();
    };
    
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Gagal memanggil speechSynthesis.speak:", err);
      finishUtterance();
    }
  };

  const announceMatch = (arenaNum: number, p: Pesilat) => {
    if (!isAudioEnabled) return;
    if (!("speechSynthesis" in window)) {
      console.warn("Speech Synthesis tidak didukung di browser ini.");
      return;
    }

    const cleanKategori = p.kategori || "Tanding";
    const cleanKelas = (p.kelas || "")
      .replace(/kg/gi, " kilogram")
      .replace(/\(/g, " ")
      .replace(/\)/g, " ")
      .replace(/-/g, " sampai ");
    
    const cleanGender = p.gender || "Putra";
    const cleanNamaMerah = p.nama_pesilat ? p.nama_pesilat.trim() : "";
    const cleanKontingenMerah = p.kontingen ? p.kontingen.trim() : "";
    const cleanNamaBiru = p.nama_pesilat_biru ? p.nama_pesilat_biru.trim() : "";
    const cleanKontingenBiru = p.kontingen_biru ? p.kontingen_biru.trim() : "";

    let text = "";
    if (cleanNamaBiru !== "") {
      text = `Panggilan kepada partai nomor ${p.nomor_partai || ""}, di Gelanggang ${arenaNum}. Kategori ${cleanKategori}, ${cleanGender}, ${cleanKelas}. Di sudut merah, ${cleanNamaMerah} dari ${cleanKontingenMerah}, melawan di sudut biru, ${cleanNamaBiru} dari ${cleanKontingenBiru}. Selamat bertanding.`;
    } else {
      text = `Panggilan kepada partai nomor ${p.nomor_partai || ""}, di Gelanggang ${arenaNum}. Kategori ${cleanKategori}, ${cleanGender}, ${cleanKelas}. Pesilat, ${cleanNamaMerah} dari ${cleanKontingenMerah}. Selamat bertanding.`;
    }

    console.log("Enqueueing speech announcement:", text);

    // Hindari double-enqueueing untuk partai yang sama persis di antrean
    const isAlreadyQueued = speechQueueRef.current.some(item => item.pesilatId === p.id);
    if (!isAlreadyQueued) {
      speechQueueRef.current.push({ text, arenaNum, pesilatId: p.id });
      processQueue();
    }
  };

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
  const initApp = async (retriesLeft = 3, delayMs = 1500) => {
    try {
      setLoading(true);
      setError("");
      
      // Ambil konfigurasi Supabase dari backend
      const configRes = await fetch("/api/config-status");
      const configData: ConfigStatus = await configRes.json();
      setConfig(configData);

      // Ambil data jumlah arena awal
      const arenaRes = await fetch("/api/pengaturan_arena");
      const arenaData = await arenaRes.json();
      const initialArenasCount = parseJumlahArena(arenaData);
      setJumlahArena(initialArenasCount);

      // Ambil data pesilat awal
      const pesilatRes = await fetch("/api/pesilat");
      const pesilatData = await pesilatRes.json();
      const initialPesilats = Array.isArray(pesilatData) ? pesilatData : [];
      setPesilatList(initialPesilats);

      // Pre-populate announcedIdsRef dengan pesilat yang sedang bermain saat ini agar tidak berisik saat pertama load
      const initialAnnounced: Record<number, string> = {};
      for (let i = 1; i <= initialArenasCount; i++) {
        const currentPlaying = initialPesilats.find(p => Number(p.arena) === i && p.is_playing);
        if (currentPlaying) {
          initialAnnounced[i] = currentPlaying.id;
        }
      }
      announcedIdsRef.current = initialAnnounced;

      setLoading(false);
    } catch (err: any) {
      console.error(`Inisialisasi gagal (${retriesLeft} percobaan tersisa):`, err);
      if (retriesLeft > 0) {
        setTimeout(() => {
          initApp(retriesLeft - 1, delayMs * 1.5);
        }, delayMs);
      } else {
        setError(`Gagal memuat konfigurasi awal dari server: ${err.message || err}`);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  // 1.5. Monitor transisi partai tanding di setiap arena untuk membunyikan suara panggilan otomatis
  useEffect(() => {
    if (loading || error || pesilatList.length === 0) return;

    const arenas = Array.from({ length: jumlahArena }, (_, i) => i + 1);
    arenas.forEach(arenaNum => {
      const pesilatInArena = pesilatList.filter(p => Number(p.arena) === arenaNum);
      const playingPesilat = pesilatInArena.find(p => p.is_playing);

      const prevPlayingId = announcedIdsRef.current[arenaNum] || "";
      const currentPlayingId = playingPesilat ? playingPesilat.id : "";

      if (currentPlayingId && currentPlayingId !== prevPlayingId) {
        // Ada partai baru yang mulai bermain di arenaNum!
        announcedIdsRef.current[arenaNum] = currentPlayingId;
        
        // Panggil suara pengumuman
        announceMatch(arenaNum, playingPesilat);
      } else if (!currentPlayingId && prevPlayingId) {
        // Arena menjadi kosong/standby
        announcedIdsRef.current[arenaNum] = "";
      }
    });
  }, [pesilatList, jumlahArena, loading, error]);

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
            onClick={() => initApp()} 
            className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium cursor-pointer"
          >
            Coba Hubungkan Kembali
          </button>
        </div>
      </div>
    );
  }

  // Generate daftar arena berdasarkan jumlah_arena (1-indexed array: [1, 2, ...])
  const arenas = Array.from({ length: jumlahArena }, (_, i) => i + 1);

  // Dynamic layout settings based on jumlah_arena to fit one screen perfectly without scrolling
  const getArenaSizeConfig = (count: number) => {
    if (count === 1) {
      return {
        gridCols: "grid-cols-1",
        gridRows: "grid-rows-1",
        cardPadding: "p-4 sm:p-5 gap-3 sm:gap-4",
        headerPadding: "p-3 sm:p-4",
        headerTitle: "text-2xl sm:text-3xl md:text-4xl",
        partySize: "text-[9rem] sm:text-[11rem] md:text-[13rem] lg:text-[16rem]",
        metaTextSize: "text-xs sm:text-sm px-2.5 py-1",
        competitorText: "text-base sm:text-lg md:text-xl font-bold",
        competitorPadding: "p-3 sm:p-4 border-l-4 sm:border-l-8",
        timerText: "text-base sm:text-xl md:text-2xl",
        queueMaxHeight: "max-h-[64px]",
        queueItemPadding: "py-1 px-2",
        hideQueue: false,
        hideFooter: false
      };
    }
    if (count === 2) {
      return {
        gridCols: "grid-cols-1 md:grid-cols-2",
        gridRows: "grid-rows-2 md:grid-rows-1",
        cardPadding: "p-3 sm:p-4 gap-2.5 sm:gap-3",
        headerPadding: "p-2.5 sm:p-3",
        headerTitle: "text-xl sm:text-2xl md:text-3xl",
        partySize: "text-[7rem] sm:text-[8.5rem] md:text-[10rem] lg:text-[12rem]",
        metaTextSize: "text-[10px] sm:text-xs px-2 py-0.5",
        competitorText: "text-sm sm:text-base md:text-lg",
        competitorPadding: "p-2 sm:p-3 border-l-4",
        timerText: "text-sm sm:text-base md:text-lg",
        queueMaxHeight: "max-h-[50px]",
        queueItemPadding: "py-0.5 px-2",
        hideQueue: false,
        hideFooter: false
      };
    }
    if (count === 3) {
      return {
        gridCols: "grid-cols-1 md:grid-cols-3",
        gridRows: "grid-rows-3 md:grid-rows-1",
        cardPadding: "p-2 sm:p-3 gap-2",
        headerPadding: "p-2 sm:p-2.5",
        headerTitle: "text-lg sm:text-xl md:text-2xl",
        partySize: "text-[5.5rem] sm:text-[6.5rem] md:text-[7.5rem] lg:text-[8.5rem]",
        metaTextSize: "text-[9px] sm:text-[10px] px-1.5 py-0.5",
        competitorText: "text-xs sm:text-sm md:text-base",
        competitorPadding: "p-1.5 sm:p-2 border-l-2 sm:border-l-4",
        timerText: "text-xs sm:text-sm md:text-base",
        queueMaxHeight: "max-h-[36px]",
        queueItemPadding: "py-0.5 px-1.5",
        hideQueue: false,
        hideFooter: true
      };
    }
    if (count === 4) {
      return {
        gridCols: "grid-cols-1 sm:grid-cols-2",
        gridRows: "grid-rows-4 sm:grid-rows-2",
        cardPadding: "p-2 gap-1.5 sm:gap-2",
        headerPadding: "p-1.5 sm:p-2",
        headerTitle: "text-sm sm:text-base md:text-lg",
        partySize: "text-[4.5rem] sm:text-[5rem] md:text-[6rem] lg:text-[6.5rem]",
        metaTextSize: "text-[8px] sm:text-[9px] px-1 py-0.5",
        competitorText: "text-[10px] sm:text-xs md:text-sm",
        competitorPadding: "p-1 sm:p-1.5 border-l-2",
        timerText: "text-[10px] sm:text-xs md:text-sm",
        queueMaxHeight: "max-h-[30px]",
        queueItemPadding: "p-0.5",
        hideQueue: true,
        hideFooter: true
      };
    }
    // 5 atau lebih arena
    return {
      gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      gridRows: "grid-rows-6 sm:grid-rows-3 lg:grid-rows-2",
      cardPadding: "p-1.5 gap-1",
      headerPadding: "p-1 sm:p-1.5",
      headerTitle: "text-xs sm:text-sm md:text-base",
      partySize: "text-[3.5rem] sm:text-[4rem] md:text-[4.5rem] lg:text-[5rem]",
      metaTextSize: "text-[8px] px-1 py-0.25",
      competitorText: "text-[9px] sm:text-[10px] md:text-xs",
      competitorPadding: "p-1 border-l",
      timerText: "text-[9px] sm:text-[10px]",
      queueMaxHeight: "max-h-[30px]",
      queueItemPadding: "p-0.5",
      hideQueue: true,
      hideFooter: true
    };
  };

  const layout = getArenaSizeConfig(jumlahArena);

  return (
    <div className="h-screen w-screen max-h-screen max-w-full overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 text-white font-sans p-2 sm:p-3 select-none flex flex-col justify-between">
      {/* HEADER UTAMA - VIBRANT PALETTE INDIGO HEADER WITH WHITE ROTATING LOGO */}
      <header className="bg-indigo-700 p-2.5 sm:p-3 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between border-b-2 sm:border-b-4 border-indigo-500 shadow-xl mb-1.5 sm:mb-2.5 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0 shadow-lg">
            <div className="w-6 h-6 bg-indigo-700 rotate-45 flex items-center justify-center">
              <span className="text-white font-bold -rotate-45 text-[10px]">IPS</span>
            </div>
          </div>
          <div>
            <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight uppercase text-white font-display">
              SISTEM BOARDING <span className="text-amber-300">PENCAK SILAT</span>
            </h1>
            <p className="text-indigo-200 text-[8px] sm:text-[10px] font-semibold tracking-widest uppercase">
              Live Boarding System • Real-time Monitoring
            </p>
          </div>
        </div>

        {/* Status Mode Real-time & Clock */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
          <div className="text-left flex items-center gap-1.5">
            <span className="text-[8px] text-indigo-300 font-bold uppercase tracking-wider font-mono hidden xs:inline">Update:</span>
            <span className="font-mono font-bold text-white bg-indigo-850 px-2 py-0.5 rounded border border-indigo-600/50">{lastUpdated.toLocaleTimeString()}</span>
          </div>
          
          <div className="hidden md:block h-6 w-px bg-indigo-500/50"></div>

          {/* AUDIO CONTROLLER TOGGLE */}
          <button
            onClick={() => setIsAudioEnabled(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[9px] sm:text-[10px] uppercase tracking-wider transition cursor-pointer shadow-md border ${
              isAudioEnabled 
                ? "bg-amber-400 text-neutral-950 border-amber-300 hover:bg-amber-300" 
                : "bg-slate-850 text-slate-400 border-slate-700/50 hover:bg-slate-800"
            }`}
            title={isAudioEnabled ? "Matikan suara panggilan otomatis" : "Aktifkan suara panggilan otomatis"}
          >
            {isAudioEnabled ? (
              <>
                <Volume2 className="w-3 h-3 text-neutral-950 shrink-0" />
                <span>Suara: Aktif</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Suara: Senyap</span>
              </>
            )}
          </button>

          <div className="hidden md:block h-6 w-px bg-indigo-500/50"></div>

          {config?.mode === "supabase" ? (
            <div className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg font-bold text-[9px] sm:text-[10px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              <span>Supabase Live</span>
            </div>
          ) : (
            <div className="bg-amber-500 text-neutral-950 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg font-bold text-[9px] sm:text-[10px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-neutral-950 rounded-full animate-pulse"></span>
              <span>Simulated Live</span>
            </div>
          )}
        </div>
      </header>

      {/* BANNER AKTIVASI AUDIO INTERAKSI PERTAMA */}
      {!hasInteracted && isAudioEnabled && (
        <div 
          onClick={() => {
            setHasInteracted(true);
            if ("speechSynthesis" in window) {
              window.speechSynthesis.cancel();
              const welcome = new SpeechSynthesisUtterance("Fitur suara aktif");
              const voices = window.speechSynthesis.getVoices();
              const idVoice = voices.find(voice => voice.lang.startsWith("id") || voice.lang.includes("ID") || voice.lang.includes("id-ID"));
              if (idVoice) welcome.voice = idVoice;
              welcome.lang = "id-ID";
              welcome.rate = 1.0;
              window.speechSynthesis.speak(welcome);
            }
          }}
          className="mb-1.5 sm:mb-2 bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 rounded-xl p-2 flex flex-col sm:flex-row items-center justify-between gap-2 cursor-pointer hover:brightness-105 transition shadow-lg border border-amber-300"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 shrink-0 text-neutral-950 animate-bounce" />
            <div>
              <p className="font-black text-[10px] uppercase tracking-wide">🔉 Klik untuk mengaktifkan suara otomatis!</p>
              <p className="text-[8px] font-semibold text-neutral-900 mt-0.5">Browser memblokir suara sebelum diklik.</p>
            </div>
          </div>
          <button className="bg-neutral-950 hover:bg-neutral-900 text-amber-300 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition shrink-0 shadow-md cursor-pointer">
            Mulai Suara
          </button>
        </div>
      )}

      {/* WARNING BANNER JIKA SUPABASE BELUM DIAKTIFKAN */}
      {!config?.configured && (
        <div className="mb-1.5 sm:mb-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[8px] sm:text-[10px] text-amber-200">
            <span className="font-semibold">Info Demo:</span> Mode simulasi lokal aktif. Masukkan kunci Supabase Anda di panel pengaturan admin atau berkas `.env` untuk real-time cloud.
          </div>
        </div>
      )}

      {/* DYNAMIC ARENA GRID */}
      <main className="flex-1 min-h-0 h-full overflow-hidden flex flex-col">
        {arenas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/60 border-2 border-slate-800 rounded-3xl">
            <Shield className="w-16 h-16 text-slate-700 mb-4" />
            <p className="text-slate-400 text-lg font-medium">Tidak ada arena aktif yang dikonfigurasi.</p>
            <p className="text-slate-500 text-sm mt-1">Ubah jumlah arena di dashboard admin untuk mengaktifkan display.</p>
          </div>
        ) : (
          <div className={`grid gap-2 sm:gap-3 h-full w-full min-h-0 ${layout.gridCols} ${layout.gridRows}`}>
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
                  className="flex flex-col bg-slate-900 rounded-2xl border border-slate-850 shadow-xl overflow-hidden h-full min-h-0 hover:border-indigo-500/30 hover:shadow-indigo-500/5 transition duration-300"
                >
                  {/* Arena Header - Vibrant Palette */}
                  <div className={`${arenaColor} ${layout.headerPadding} text-center border-b border-white/10 relative flex items-center justify-center min-h-[36px] sm:min-h-[44px]`}>
                    <div>
                      <h2 className={`${layout.headerTitle} font-black uppercase tracking-tighter italic text-white font-display`}>
                        Arena {arenaNum}
                      </h2>
                      <p className="text-white/80 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest mt-0.5 font-mono">
                        {playingPesilat ? (playingPesilat.kategori || "Tanding") : "Maintenance / Standby"}
                      </p>
                    </div>

                    {playingPesilat && (
                      <span className="absolute right-2 sm:right-4 inline-flex items-center gap-1 bg-black/40 text-white border border-white/10 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black tracking-widest uppercase font-mono shadow-inner">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-500 animate-ping"></span>
                        <span className="hidden xs:inline">LIVE</span> ON AIR
                      </span>
                    )}
                  </div>

                  {/* Inner Container */}
                  <div className={`flex-1 ${layout.cardPadding} flex flex-col bg-slate-900/90 justify-between min-h-0 overflow-hidden`}>
                    
                    {!playingPesilat ? (
                      /* ARENA KOSONG / STANDBY SCREEN DENGAN DAFTAR TUNGGU */
                      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center min-h-0">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center shadow-lg mb-2 sm:mb-3 text-lg sm:text-2xl">
                          ⏳
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-xs font-display">Gelanggang Standby</p>
                        <p className="text-[8px] sm:text-[10px] text-slate-500 mt-1 font-mono uppercase">Menunggu Aktivasi Partai</p>
                        
                        {waitingQueue.length > 0 && !layout.hideQueue && (
                          <div className="mt-3 sm:mt-4 w-full max-w-xs text-left bg-slate-950/40 border border-slate-850 rounded-xl p-2 sm:p-3">
                            <p className="text-[8px] sm:text-[9px] font-bold text-indigo-400 font-mono uppercase tracking-wider mb-1">Partai Terjadwal:</p>
                            <div className="space-y-1">
                              {waitingQueue.slice(0, 2).map((item) => (
                                <div key={item.id} className="text-[9px] sm:text-xs flex justify-between text-slate-300 font-medium truncate">
                                  <span className="truncate">P-{item.nomor_partai} • {item.nama_pesilat}</span>
                                  <span className="text-[8px] sm:text-[9px] text-indigo-400 font-mono uppercase shrink-0 ml-1">G-{item.arena}</span>
                                </div>
                              ))}
                              {waitingQueue.length > 2 && (
                                <p className="text-[8px] text-slate-500 italic font-mono mt-0.5">+ {waitingQueue.length - 2} partai</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* ADA MATCH AKTIF DENGAN TATA LETAK WIREFRAME: PARTAI RAKSASA DI TENGAH, DETAIL DI BAWAH */
                      <div className="flex-1 flex flex-col justify-between gap-1.5 sm:gap-3 min-h-0 overflow-hidden">
                        
                        {/* 1. NOMOR PARTAI UTAMA RAKSASA (CENTERED) */}
                        <div className="flex-1 flex flex-col items-center justify-center relative py-1 sm:py-3 min-h-0">
                          {/* Label Kecil di Atas Angka */}
                          <span className="text-[8px] sm:text-[10px] font-mono font-black text-indigo-400/80 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                            PARTAI UTAMA
                          </span>
                          
                          {/* Angka Raksasa */}
                          <div className={`${layout.partySize} font-mono font-black leading-none text-amber-400 tracking-tighter drop-shadow-[0_4px_15px_rgba(245,158,11,0.25)] select-none`}>
                            {playingPesilat.nomor_partai || "01"}
                          </div>
                        </div>

                        {/* 2. DETAIL INFORMASI DI BAWAH NOMOR PARTAI */}
                        <div className="bg-slate-950/80 border border-slate-850 p-2 sm:p-3 rounded-xl space-y-1.5 sm:space-y-2 shadow-inner min-h-0">
                          
                          {/* Metadata: Gender, Kategori & Kelas */}
                          <div className="flex flex-wrap items-center justify-center gap-1 border-b border-slate-900 pb-1 text-center">
                            <span className={`bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 ${layout.metaTextSize} rounded font-mono uppercase font-bold tracking-wider`}>
                              {playingPesilat.kategori}
                            </span>
                            <span className="text-slate-600 font-mono text-[8px]">•</span>
                            <span className={`bg-pink-500/10 text-pink-400 border border-pink-500/20 ${layout.metaTextSize} rounded font-mono uppercase font-bold tracking-wider`}>
                              {playingPesilat.gender}
                            </span>
                            <span className="text-slate-600 font-mono text-[8px]">•</span>
                            <span className={`bg-amber-400/10 text-amber-400 border border-amber-400/20 ${layout.metaTextSize} rounded font-mono uppercase font-bold tracking-wider`}>
                              {playingPesilat.kelas}
                            </span>
                          </div>

                          {playingPesilat.nama_pesilat_biru ? (
                            /* KATEGORI TANDING: SUDUT BIRU (KIRI) vs SUDUT MERAH (KANAN) DENGAN TIMER DI TENGAH */
                            <div className="grid grid-cols-12 gap-1 sm:gap-2 items-center">
                              
                              {/* Kiri: Sudut Biru */}
                              <div className={`col-span-5 bg-blue-600/10 ${layout.competitorPadding} border-blue-600 rounded-r-lg min-w-0 shadow-md`}>
                                <span className="text-blue-400 font-mono text-[7px] sm:text-[9px] font-black uppercase tracking-widest block mb-0.5">
                                  Biru
                                </span>
                                <h4 className={`${layout.competitorText} text-white uppercase truncate font-display leading-tight`}>
                                  {playingPesilat.nama_pesilat_biru}
                                </h4>
                                <p className="text-[8px] sm:text-[10px] text-blue-200/80 font-bold mt-0.5 truncate uppercase tracking-wider font-mono">
                                  {playingPesilat.kontingen_biru}
                                </p>
                              </div>

                              {/* Tengah: Timer */}
                              <div className="col-span-2 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-lg py-1 px-0.5 text-center min-w-[40px]">
                                <div className={`font-mono ${layout.timerText} font-black leading-none ${
                                  playingPesilat.timer_seconds_left <= 10 && playingPesilat.timer_running
                                    ? "text-red-500 animate-pulse drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                                    : "text-emerald-400"
                                }`}>
                                  {Math.floor(playingPesilat.timer_seconds_left / 60).toString().padStart(2, "0")}
                                  :
                                  {(playingPesilat.timer_seconds_left % 60).toString().padStart(2, "0")}
                                </div>
                                <span className="text-[5px] sm:text-[6px] text-slate-500 font-mono font-bold uppercase tracking-wider scale-90 mt-0.5">
                                  {playingPesilat.timer_running ? "RUN" : "PAUSE"}
                                </span>
                              </div>

                              {/* Kanan: Sudut Merah */}
                              <div className={`col-span-5 bg-red-600/10 ${layout.competitorPadding} border-red-600 rounded-l-lg min-w-0 text-right shadow-md`}>
                                <span className="text-red-400 font-mono text-[7px] sm:text-[9px] font-black uppercase tracking-widest block mb-0.5">
                                  Merah
                                </span>
                                <h4 className={`${layout.competitorText} text-white uppercase truncate font-display leading-tight`}>
                                  {playingPesilat.nama_pesilat}
                                </h4>
                                <p className="text-[8px] sm:text-[10px] text-red-200/80 font-bold mt-0.5 truncate uppercase tracking-wider font-mono">
                                  {playingPesilat.kontingen}
                                </p>
                              </div>

                            </div>
                          ) : (
                            /* KATEGORI TUNGGAL/SENI/SOLO: ATLET UTAMA DENGAN TIMER DI KANAN */
                            <div className="grid grid-cols-12 gap-1 sm:gap-2 items-center">
                              
                              {/* Kiri/Tengah: Detail Atlet */}
                              <div className={`col-span-9 bg-indigo-600/10 ${layout.competitorPadding} border-indigo-500 rounded-r-lg min-w-0 shadow-md`}>
                                <span className="text-indigo-400 font-mono text-[7px] sm:text-[9px] font-black uppercase tracking-widest block mb-0.5">
                                  Pesilat Solo
                                </span>
                                <h4 className={`${layout.competitorText} text-white uppercase truncate font-display leading-tight`}>
                                  {playingPesilat.nama_pesilat}
                                </h4>
                                <p className="text-[8px] sm:text-[10px] text-indigo-200/80 font-bold mt-0.5 truncate uppercase tracking-wider font-mono">
                                  {playingPesilat.kontingen}
                                </p>
                              </div>

                              {/* Kanan: Timer */}
                              <div className="col-span-3 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-lg py-1 sm:py-2 px-1 text-center">
                                <div className={`font-mono ${layout.timerText} font-black leading-none ${
                                  playingPesilat.timer_seconds_left <= 10 && playingPesilat.timer_running
                                    ? "text-red-500 animate-pulse drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                                    : "text-emerald-400"
                                }`}>
                                  {Math.floor(playingPesilat.timer_seconds_left / 60).toString().padStart(2, "0")}
                                  :
                                  {(playingPesilat.timer_seconds_left % 60).toString().padStart(2, "0")}
                                </div>
                                <span className="text-[5px] sm:text-[7px] text-slate-500 font-mono font-bold uppercase tracking-wider mt-0.5">
                                  {playingPesilat.timer_running ? "RUN" : "PAUSE"}
                                </span>
                              </div>

                            </div>
                          )}

                        </div>

                      </div>
                    )}

                    {/* Daftar Antrean Section (Waiting Queue) */}
                    {playingPesilat && !layout.hideQueue && (
                      <div className="mt-auto border-t border-slate-800/80 pt-1 flex flex-col min-h-0 justify-end">
                        <p className="text-[7px] sm:text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 font-mono">
                          Antrean ({waitingQueue.length})
                        </p>
                        <div className={`space-y-0.5 overflow-y-auto ${layout.queueMaxHeight} pr-1 custom-scrollbar`}>
                          {waitingQueue.length === 0 ? (
                            <div className="text-[7px] sm:text-[8px] text-slate-600 font-mono py-0.5 italic">
                              Tidak ada antrean berikutnya.
                            </div>
                          ) : (
                            waitingQueue.slice(0, 2).map((pesilat) => (
                              <div 
                                key={pesilat.id} 
                                className={`bg-slate-950/20 ${layout.queueItemPadding} rounded flex justify-between items-center text-[7px] sm:text-[8px] border border-white/5`}
                              >
                                <span className="font-bold text-slate-400 truncate max-w-[80%] uppercase">
                                  P-{pesilat.nomor_partai || "00"} • {pesilat.nama_pesilat} {pesilat.nama_pesilat_biru ? `vs ${pesilat.nama_pesilat_biru}` : ""}
                                </span>
                                <span className="text-[6px] text-indigo-400 font-mono font-bold uppercase shrink-0">
                                  {pesilat.kelas.split(" ")[0] || pesilat.kelas}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Arena Footer Info */}
                    {!layout.hideFooter && (
                      <div className="p-1.5 bg-slate-950/50 border border-slate-850 rounded-lg text-[8px] text-slate-500 font-mono flex items-center justify-between">
                        <span>IP-Arena: #10.0.0.{arenaNum}</span>
                        <span className="uppercase text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
                          GELANGGANG READY
                        </span>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FOOTER INFORMASI BAWAH */}
      <footer className="mt-2 border-t border-slate-850 pt-2 flex flex-row items-center justify-between text-[9px] text-slate-600 font-mono py-1">
        <div>
          &copy; {new Date().getFullYear()} IPSI.
        </div>
        <div className="flex items-center gap-2">
          <span>Boarding v1.0.0</span>
          <div className="flex -space-x-1">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

