import React, { useState, useEffect, useRef } from "react";

import { X,  
  Users, Settings, LogOut, Plus, Trash2, Edit2, ShieldAlert, CheckCircle, 
  UserPlus, RefreshCw, Layers, Award, UsersRound, HelpCircle, LayoutGrid,
  Play, Pause, RotateCcw, Tv, Clock, Timer, FileSpreadsheet, Upload, Download, Volume2, SkipForward, Square
} from "lucide-react";
import * as XLSX from "xlsx";
import { Pesilat, ConfigStatus } from "../types";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"pesilat" | "arena">("pesilat");
  const [pesilatList, setPesilatList] = useState<Pesilat[]>([]);
  const [jumlahArena, setJumlahArena] = useState<number>(3);
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [filterStatus, setFilterStatus] = useState<"queue" | "done" | "all">("queue");
  const [isAutoNextEnabled, setIsAutoNextEnabled] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  

  

  

  useEffect(() => {
    const savedAutoNext = localStorage.getItem('isAutoNextEnabled');
    if (savedAutoNext !== null) {
      setIsAutoNextEnabled(savedAutoNext === 'true');
    }
  }, []);

  const toggleAutoNextMatch = () => {
    const newVal = !isAutoNextEnabled;
    setIsAutoNextEnabled(newVal);
    localStorage.setItem('isAutoNextEnabled', String(newVal));
  };
  
  // Form States - Pesilat
  const [pesilatId, setPesilatId] = useState<string>(""); // Hanya untuk edit
  const [nomorPartai, setNomorPartai] = useState<string>("01");
  const [namaPesilat, setNamaPesilat] = useState<string>(""); // Sudut Merah
  const [kontingen, setKontingen] = useState<string>("");     // Sudut Merah
  const [namaPesilatBiru, setNamaPesilatBiru] = useState<string>(""); // Sudut Biru
  const [kontingenBiru, setKontingenBiru] = useState<string>("");     // Sudut Biru
  const [kelas, setKelas] = useState<string>("Kelas A");
  const [kategori, setKategori] = useState<string>("Tanding");
  const [gender, setGender] = useState<string>("Putra");
  const [arena, setArena] = useState<number>(1);
  const [timerDuration, setTimerDuration] = useState<number>(120);
  const [timerInputStr, setTimerInputStr] = useState<string>("00:02:00");
  const [isTimerInputFocused, setIsTimerInputFocused] = useState<boolean>(false);

  // Helper to convert seconds to hh:mm:ss
  const formatSecondsToTime = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper to convert hh:mm:ss to seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    const cleanStr = timeStr.replace(/[^\d:]/g, "");
    const parts = cleanStr.split(":");
    
    if (parts.length === 3) {
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      const s = parseInt(parts[2], 10) || 0;
      return h * 3600 + m * 60 + s;
    } else if (parts.length === 2) {
      const m = parseInt(parts[0], 10) || 0;
      const s = parseInt(parts[1], 10) || 0;
      return m * 60 + s;
    } else if (parts.length === 1) {
      return parseInt(parts[0], 10) || 0;
    }
    return 0;
  };

  useEffect(() => {
    if (!isTimerInputFocused) {
      setTimerInputStr(formatSecondsToTime(timerDuration));
    }
  }, [timerDuration, isTimerInputFocused]);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const processedTimeoutsRef = useRef<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<'all' | 'selected' | 'single' | null>(null);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<{ id: string, nama: string } | null>(null);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleToggleSelectAll = (visibleItems: Pesilat[]) => {
    const visibleIds = visibleItems.map(p => p.id);
    setSelectedIds(prev => {
      const allSelected = visibleIds.length > 0 && visibleIds.every(id => prev.includes(id));
      if (allSelected) {
        return prev.filter(id => !visibleIds.includes(id));
      } else {
        const newIds = visibleIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteConfirm('selected');
  };

  const handleDeleteAll = () => {
    setShowDeleteConfirm('all');
  };

  const executeDeleteAll = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    setShowDeleteConfirm(null);
    try {
      const res = await fetch('/api/pesilat?_method=DELETE', { method: 'POST' });
      if (!res.ok) {
        throw new Error("Gagal menghapus semua data");
      }
      setSuccess("Berhasil menghapus semua data pesilat.");
      setSelectedIds([]);
      fetchInitialData(3, 1500, true);
    } catch (err: any) {
      setError(err.message || "Gagal menghapus semua data");
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteSelected = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    setShowDeleteConfirm(null);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/pesilat/${id}?_method=DELETE`, { method: 'POST' });
      }
      setSuccess("Berhasil menghapus data pesilat yang dipilih.");
      setSelectedIds([]);
      fetchInitialData(3, 1500, true);
    } catch (err: any) {
      setError(err.message || "Gagal menghapus data");
    } finally {
      setLoading(false);
    }
  };

    const announceMatch = async (arenaNum: number, p: Pesilat) => {
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

    const prefixKelas = cleanKelas.toLowerCase().includes("kelas") || cleanKelas === "" ? cleanKelas : `kelas ${cleanKelas}`;
    
    let text = "";
    if (cleanNamaBiru !== "") {
      text = `Partai ${p.nomor_partai || ""}, Gelanggang ${arenaNum}. ${cleanKategori} ${cleanGender} ${prefixKelas}. Sudut biru ${cleanNamaBiru} dari ${cleanKontingenBiru}, melawan sudut merah ${cleanNamaMerah} dari ${cleanKontingenMerah}. Segera mempersiapkan diri.`;
    } else {
      text = `Partai ${p.nomor_partai || ""}, Gelanggang ${arenaNum}. ${cleanKategori} ${cleanGender} ${prefixKelas}. Pesilat ${cleanNamaMerah} dari ${cleanKontingenMerah}. Segera mempersiapkan diri.`;
    }

    try {
      await fetch("/api/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, arenaNum, pesilatId: p.id })
      });
    } catch (err) {
      if (err.message !== "Failed to fetch") console.error("Gagal mengirim pengumuman", err);
    }
  };

  // Form States - Arena Setting
  const [inputJumlahArena, setInputJumlahArena] = useState<number>(3);

  // Status & Feedback States
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dropdown Options
  const opsiKelas = [
    "Kelas A",
    "Kelas B",
    "Kelas C",
    "Kelas D",
    "Kelas E",
    "Kelas F",
    "Kelas G",
    "Kelas H",
    "Kelas I",
    "Kelas J",
    "Kelas K",
    "Kelas L",
    "Kelas M",
    "Kelas N",
    "Seni Tunggal",
    "Seni Ganda",
    "Seni Regu",
    "Seni Solo Kreatif"
  ];
  
  const opsiKategori = ["Tanding", "Tunggal", "Ganda", "Regu"];
  const opsiGender = ["Putra", "Putri"];

  // 1. Fetch data on mount
  useEffect(() => {
    fetchConfig();
    fetchInitialData();
  }, []);

  const fetchConfig = async (retriesLeft = 3, delayMs = 1500) => {
    try {
      const res = await fetch(`/api/config-status?_t=${Date.now()}`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      console.error(`Gagal mengambil konfigurasi (${retriesLeft} sisa):`, err);
      if (retriesLeft > 0) {
        setTimeout(() => fetchConfig(retriesLeft - 1, delayMs * 1.5), delayMs);
      }
    }
  };

  const fetchInitialData = async (retriesLeft = 3, delayMs = 1500, silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (!silent) setError(null);
      // Ambil Pesilat
      const pesilatRes = await fetch(`/api/pesilat?_t=${Date.now()}`);
      const pesilatData = await pesilatRes.json();
      setPesilatList(Array.isArray(pesilatData) ? pesilatData : []);

      // Ambil Jumlah Arena
      const arenaRes = await fetch(`/api/pengaturan_arena?_t=${Date.now()}`);
      const arenaData = await arenaRes.json();
      const arenaItem = Array.isArray(arenaData) ? arenaData[0] : arenaData;
      const count = arenaItem && typeof arenaItem.jumlah_arena === "number" ? arenaItem.jumlah_arena : 3;
      setJumlahArena(count);
      setInputJumlahArena(count);
      if (!silent) setLoading(false);
    } catch (err: any) {
      console.error(`Gagal memuat data awal (${retriesLeft} sisa):`, err);
      if (retriesLeft > 0) {
        setTimeout(() => fetchInitialData(retriesLeft - 1, delayMs * 1.5, silent), delayMs);
      } else {
        if (!silent) {
          setError("Gagal memuat data dari API Express setelah beberapa percobaan. Silakan coba klik tombol hubungkan kembali.");
          setPesilatList([]);
          setLoading(false);
        }
      }
    }
  };

  
  // Background polling to keep admin in sync with server timer
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pesilat?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPesilatList(data);
          }
        }
      } catch (e) {
        // ignore
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Local real-time timer countdown loop (so countdown is buttery smooth on screen!)
  useEffect(() => {
    const timer = setInterval(() => {
      setPesilatList(prevList => {
        let changed = false;
        const newList = prevList.map(p => {
          if (p.timer_running && p.timer_seconds_left > 0) {
            changed = true;
            const newSeconds = p.timer_seconds_left - 1;
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

  // Handler jika timer habis, akan dipanggil otomatis
  const handleTimeoutMatch = async (id: string) => {
    try {
      const res = await fetch(`/api/pesilat/${id}/timeout?_method=PUT&autoNext=${isAutoNextEnabled}`, { method: 'POST' });
      if (res.ok) {
        await fetchInitialData(3, 1500, true);
      }
    } catch (err) {
      if (err.message !== "Failed to fetch") console.error("Gagal memproses timeout:", err);
      await fetchInitialData(3, 1500, true);
    }
  };

  // Monitor timer yang habis untuk pemicu otomatis partai berikutnya
  useEffect(() => {
    pesilatList.forEach(p => {
      if (p.is_playing && p.timer_seconds_left === 0) {
        if (!processedTimeoutsRef.current.has(p.id)) {
          processedTimeoutsRef.current.add(p.id);
          console.log(`Partai ${p.nomor_partai} selesai. Mengaktifkan partai berikutnya...`);
          handleTimeoutMatch(p.id);
        }
      } else if (p.timer_seconds_left > 0) {
        processedTimeoutsRef.current.delete(p.id);
      }
    });
  }, [pesilatList]);

  // Set durasi standar saat merubah kategori di form (jika bukan mode edit)
  useEffect(() => {
    if (!isEditMode) {
      const isSeni = (kategori.toLowerCase().includes("tunggal") || 
                      kategori.toLowerCase().includes("ganda") || 
                      kategori.toLowerCase().includes("regu") ||
                      kategori.toLowerCase() === "seni");
      setTimerDuration(isSeni ? 180 : 120);
    }
  }, [kategori, isEditMode]);

  // API triggers for playing & controlling matches manually
  const handlePlayMatch = async (id: string) => {
    try {
      // Optimistic UI
      setPesilatList(prev => {
        const matchingItem = prev.find(item => item.id === id);
        const arenaNum = matchingItem ? matchingItem.arena : 1;
        return prev.map(p => {
          if (Number(p.arena) === Number(arenaNum)) {
            if (p.id === id) {
              return { ...p, is_playing: true, timer_running: true, is_done: false };
            } else if (p.is_playing) {
              // Otomatis pindahkan partai lama di arena ini ke daftar Selesai
              return { ...p, is_playing: false, timer_running: false, is_done: true };
            }
          }
          return p;
        });
      });

      const res = await fetch(`/api/pesilat/${id}/play?_method=PUT`, { method: 'POST' });
      if (res.ok) {
        fetchInitialData(3, 1500, true);
      }
    } catch (err) {
      console.error("Gagal mengaktifkan play:", err);
      fetchInitialData(3, 1500, true);
    }
  };

  const handleStopMatch = async (id: string) => {
    try {
      // Optimistic UI
      setPesilatList(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, is_playing: false, timer_running: false };
        }
        return p;
      }));

      const res = await fetch(`/api/pesilat/${id}/stop?_method=PUT`, { method: 'POST' });
      if (res.ok) {
        fetchInitialData(3, 1500, true);
      }
    } catch (err) {
      console.error("Gagal menonaktifkan play:", err);
      fetchInitialData(3, 1500, true);
    }
  };

  const handleToggleDone = async (id: string, currentDoneStatus: boolean) => {
    try {
      // Optimistic UI
      setPesilatList(prev => prev.map(p => {
        if (p.id === id) {
          return { 
            ...p, 
            is_done: !currentDoneStatus,
            ...(!currentDoneStatus && { is_playing: false, timer_running: false })
          };
        }
        return p;
      }));

      const res = await fetch(`/api/pesilat/${id}/timer?_method=PUT`, { method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_done: !currentDoneStatus })
      });
      if (res.ok) {
        fetchInitialData(3, 1500, true);
      }
    } catch (err) {
      console.error("Gagal mengubah status selesai:", err);
      fetchInitialData(3, 1500, true);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Ambil data dalam format array of objects
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);
        
        if (!rawData || rawData.length === 0) {
          throw new Error("File Excel kosong atau tidak terbaca.");
        }

        // Map header excel ke model Pesilat
        // Kita dukung nama kolom bahasa Indonesia/Inggris
        const mappedItems = rawData.map((row: any) => {
          // Cari property dengan membandingkan lowercase & hanya menyisakan karakter alfanumerik (menghilangkan spasi, tanda kurung, dsb.)
          const getVal = (keys: string[]) => {
            const foundKey = Object.keys(row).find(k => 
              keys.some(key => k.toLowerCase().replace(/[^a-z0-9]/g, "") === key.toLowerCase().replace(/[^a-z0-9]/g, ""))
            );
            return foundKey ? row[foundKey] : undefined;
          };

          const getValStr = (keys: string[], defaultVal = "") => {
            const val = getVal(keys);
            if (val === undefined || val === null) return defaultVal;
            return String(val).trim();
          };

          const arenaVal = Number(getVal(["arena", "gelanggang"])) || 1;
          const nomorPartai = getValStr(["nomorpartai", "partai", "nopartai", "no", "number", "nomor_partai"], "01");
          const namaMerah = getValStr(["sudutmerahnamapesilat", "nama_pesilat", "namapesilat", "pesilat", "nama_merah", "merah_nama", "sudut_merah", "pesilat_merah", "sudutmerahnama"]);
          const kontingenMerah = getValStr(["sudutmerahkontingen", "kontingen", "kontingen_merah", "sudut_merah_kontingen", "merah_kontingen", "kontingen_merah", "sudutmerahkontingen"]);
          const namaBiru = getValStr(["sudutbirunamapesilat", "nama_pesilat_biru", "namapesilatbiru", "pesilat_biru", "nama_biru", "biru_nama", "sudut_biru", "pesilat_biru", "sudutbirunama"]);
          const kontingenBiru = getValStr(["sudutbirukontingen", "kontingen_biru", "sudut_biru_kontingen", "biru_kontingen", "sudutbirukontingen"]);
          const kelas = getValStr(["kelas", "kelas_tanding", "kelastanding"], "Kelas A");
          const kategori = getValStr(["kategori", "kategori_tanding", "kategoritanding"], "Tanding");
          const gender = getValStr(["gender", "jenis_kelamin", "putra_putri", "sex", "putraputri", "jeniskelamin"], "Putra");
          const duration = Number(getVal(["timer_duration", "durasi", "waktu", "duration", "durasitimerdetik", "durasitimer"])) || (kategori.toLowerCase().includes("tunggal") || kategori.toLowerCase().includes("ganda") || kategori.toLowerCase().includes("regu") || kategori.toLowerCase() === "seni" ? 180 : 120);

          return {
            arena: arenaVal,
            nomor_partai: nomorPartai,
            nama_pesilat: namaMerah,
            kontingen: kontingenMerah,
            nama_pesilat_biru: namaBiru,
            kontingen_biru: kontingenBiru,
            kelas: kelas,
            kategori: kategori,
            gender: gender,
            timer_duration: duration
          };
        }).filter(item => item.nama_pesilat && item.kontingen); // Filter yang minimal punya nama merah & kontingen merah

        if (mappedItems.length === 0) {
          throw new Error("Format kolom Excel tidak cocok atau tidak ada baris data valid (kolom 'Sudut Merah (Nama Pesilat)' dan 'Sudut Merah (Kontingen)' wajib diisi).");
        }

        const res = await fetch("/api/pesilat/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: mappedItems })
        });

        let resData = {};
        try {
          resData = await res.json();
        } catch (e) {}
        if (!res.ok) {
          throw new Error((resData as any).error || "Gagal menyimpan data import ke server.");
        }

        setSuccess(`Berhasil mengimpor ${(resData as any).count} data partai/pesilat dari Excel!`);
        fetchInitialData();
      } catch (err: any) {
        setError(err.message || "Gagal mengimpor file Excel.");
      } finally {
        setLoading(false);
        // Reset file input agar bisa upload file yang sama lagi
        if (e.target) e.target.value = "";
      }
    };

    reader.onerror = () => {
      setError("Gagal membaca file.");
      setLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    // 1. Buat data dummy sebagai contoh pengisian
    const templateData = [
      {
        "Nomor Partai": "01",
        "Sudut Biru (Nama Pesilat)": "Zainal Abidin",
        "Sudut Biru (Kontingen)": "Tapak Suci Bandung",
        "Sudut Merah (Nama Pesilat)": "Hilal Syahril",
        "Sudut Merah (Kontingen)": "PBR Jakarta",
        "Kelas": "Kelas A",
        "Kategori": "Tanding",
        "Gender": "Putra",
        "Arena": 1,
        "Durasi Timer (Detik)": 120
      },
      {
        "Nomor Partai": "02",
        "Sudut Biru (Nama Pesilat)": "Dewi Sartika",
        "Sudut Biru (Kontingen)": "Siliwangi Bogor",
        "Sudut Merah (Nama Pesilat)": "Siti Aminah",
        "Sudut Merah (Kontingen)": "Kera Sakti Surabaya",
        "Kelas": "Kelas B",
        "Kategori": "Tanding",
        "Gender": "Putri",
        "Arena": 2,
        "Durasi Timer (Detik)": 120
      },
      {
        "Nomor Partai": "03",
        "Sudut Biru (Nama Pesilat)": "",
        "Sudut Biru (Kontingen)": "",
        "Sudut Merah (Nama Pesilat)": "Grup Seni Tunggal Pria",
        "Sudut Merah (Kontingen)": "Seni DKI Jakarta",
        "Kelas": "Seni Tunggal",
        "Kategori": "Tunggal",
        "Gender": "Putra",
        "Arena": 3,
        "Durasi Timer (Detik)": 180
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);

    // Atur lebar kolom agar rapi
    ws["!cols"] = [
      { wch: 15 }, // Nomor Partai
      { wch: 30 }, // Sudut Biru (Nama Pesilat)
      { wch: 25 }, // Sudut Biru (Kontingen)
      { wch: 30 }, // Sudut Merah (Nama Pesilat)
      { wch: 25 }, // Sudut Merah (Kontingen)
      { wch: 20 }, // Kelas
      { wch: 15 }, // Kategori
      { wch: 10 }, // Gender
      { wch: 10 }, // Arena
      { wch: 20 }  // Durasi Timer
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Import");
    XLSX.writeFile(wb, "template_import_pesilat.xlsx");
  };

  const handleExportExcel = () => {
    if (pesilatList.length === 0) {
      alert("Tidak ada data pesilat untuk diekspor.");
      return;
    }

    const exportData = pesilatList.map(p => ({
      "Nomor Partai": p.nomor_partai || "00",
      "Sudut Biru (Nama Pesilat)": p.nama_pesilat_biru || "",
      "Sudut Biru (Kontingen)": p.kontingen_biru || "",
      "Sudut Merah (Nama Pesilat)": p.nama_pesilat || "",
      "Sudut Merah (Kontingen)": p.kontingen || "",
      "Kelas": p.kelas || "",
      "Kategori": p.kategori || "",
      "Gender": p.gender || "",
      "Arena": p.arena || 1,
      "Durasi Timer (Detik)": p.timer_duration || 120,
      "Status": p.is_done ? "Selesai" : (p.is_playing ? "Sedang Tanding" : "Antrean")
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    ws["!cols"] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 25 },
      { wch: 30 },
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Pesilat");
    XLSX.writeFile(wb, "data_pesilat_silatboard.xlsx");
  };

  const handleUpdateTimer = async (id: string, duration?: number, secondsLeft?: number, running?: boolean) => {
    try {
      const payload: any = {};
      if (duration !== undefined) payload.timer_duration = duration;
      if (secondsLeft !== undefined) payload.timer_seconds_left = secondsLeft;
      if (running !== undefined) payload.timer_running = running;

      // Optimistic UI
      setPesilatList(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            ...(duration !== undefined && { timer_duration: duration }),
            ...(secondsLeft !== undefined && { timer_seconds_left: secondsLeft }),
            ...(running !== undefined && { timer_running: running })
          };
        }
        return p;
      }));

      const res = await fetch(`/api/pesilat/${id}/timer?_method=PUT`, { method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        fetchInitialData(3, 1500, true);
      }
    } catch (err) {
      console.error("Gagal mengupdate timer:", err);
      fetchInitialData(3, 1500, true);
    }
  };

  // 2. Submit Form Pesilat (Add / Update)

  const handleNextPartai = async (arena: number) => {
    try {
      const res = await fetch(`/api/arena/${arena}/next`, { method: "POST" });
      if (res.ok) {
        await fetchInitialData(3, 1500, true);
      }
    } catch (err) {
      console.error("Gagal lanjut partai berikutnya:", err);
    }
  };

  const handleTimerAll = async (timer_running: boolean) => {
    try {
      const res = await fetch("/api/pesilat/timer-all", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timer_running })
      });
      if (res.ok) {
        await fetchInitialData(3, 1500, true);
      }
    } catch (err) {
      console.error("Gagal mengupdate timer all:", err);
    }
  };

  const handleSubmitPesilat = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!namaPesilat.trim() || !kontingen.trim()) {
      setError("Nama pesilat (Sudut Merah) dan kontingen wajib diisi.");
      return;
    }

    const payload = {
      nomor_partai: nomorPartai,
      nama_pesilat: namaPesilat,
      kontingen,
      nama_pesilat_biru: namaPesilatBiru,
      kontingen_biru: kontingenBiru,
      kelas,
      kategori,
      gender,
      arena: Number(arena),
      timer_duration: timerDuration
    };

    try {
      let res;
      if (isEditMode) {
        // Edit Pesilat
        res = await fetch(`/api/pesilat/${pesilatId}?_method=PUT`, { method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        // Tambah Pesilat Baru
        res = await fetch("/api/pesilat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      let responseData = {};
      try {
        responseData = await res.json();
      } catch (e) {}

      if (!res.ok) {
        throw new Error((responseData as any).error || "Gagal menyimpan data pesilat.");
      }

      setSuccess(isEditMode ? "Data pesilat berhasil diperbarui!" : "Pesilat/partai baru berhasil ditambahkan!");
      resetFormPesilat();
      fetchInitialData(3, 1500, true); // Refresh list
    } catch (err: any) {
      setError(err.message || "Gagal memproses aksi.");
    }
  };

  // 3. Edit Handler - Masukkan ke Form
  const handleEditClick = (p: Pesilat) => {
    setIsEditMode(true);
    setPesilatId(p.id);
    setNomorPartai(p.nomor_partai || "");
    setNamaPesilat(p.nama_pesilat || "");
    setKontingen(p.kontingen || "");
    setNamaPesilatBiru(p.nama_pesilat_biru || "");
    setKontingenBiru(p.kontingen_biru || "");
    setKelas(p.kelas);
    setKategori(p.kategori);
    setGender(p.gender);
    setArena(p.arena);
    setTimerDuration(p.timer_duration || 120);
    setIsFormModalOpen(true);
    
    // Scroll to form on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Delete Handler
  const handleDeleteClick = (id: string, nama: string) => {
    setSingleDeleteTarget({ id, nama });
    setShowDeleteConfirm('single');
  };

  const executeDeleteSingle = async () => {
    if (!singleDeleteTarget) return;
    const { id, nama } = singleDeleteTarget;
    
    setError(null);
    setSuccess(null);
    setLoading(true);
    setShowDeleteConfirm(null);
    setSingleDeleteTarget(null);

    try {
      const res = await fetch(`/api/pesilat/${id}?_method=DELETE`, { method: 'POST'
      });

      if (!res.ok) {
        throw new Error("Gagal menghapus pesilat.");
      }

      setSuccess(`Pesilat "${nama}" berhasil dihapus.`);
      fetchInitialData(3, 1500, true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Submit Update Pengaturan Arena
  const handleSubmitArena = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (inputJumlahArena < 1 || inputJumlahArena > 12) {
      setError("Jumlah arena minimal 1 dan maksimal 12.");
      return;
    }

    try {
      const res = await fetch("/api/pengaturan_arena?_method=PUT", { method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jumlah_arena: inputJumlahArena })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (e) {}

      if (!res.ok) {
        throw new Error((data as any).error || "Gagal memperbarui jumlah arena.");
      }

      setJumlahArena(inputJumlahArena);
      setSuccess(`Pengaturan arena berhasil diperbarui menjadi ${inputJumlahArena} Gelanggang!`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Helper reset
  const resetFormPesilat = () => {
    setIsEditMode(false);
    setPesilatId("");
    setNomorPartai("01");
    setNamaPesilat("");
    setKontingen("");
    setNamaPesilatBiru("");
    setKontingenBiru("");
    setKelas("Kelas A");
    setKategori("Tanding");
    setGender("Putra");
    setArena(1);
    setTimerDuration(120);
    setIsFormModalOpen(false);
  };

  const filteredPesilatList = [...pesilatList]
    .filter(p => {
      if (filterStatus === "queue") return !p.is_done;
      if (filterStatus === "done") return p.is_done;
      return true;
    })
    .sort((a, b) => {
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 text-white font-sans">
      
      {/* Top Navbar */}
      <nav className="bg-indigo-700 px-4 py-4 sm:px-6 flex items-center justify-between shadow-xl border-b-4 border-indigo-500">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm sm:text-base font-black font-display uppercase tracking-wider text-white">
              PANEL ADMIN <span className="text-amber-300 font-black">BOARDING</span>
            </h1>
            <p className="text-[9px] text-indigo-200 font-semibold uppercase tracking-widest">SISTEM MONITOR GELANGGANG</p>
          </div>
        </div>

        {/* Database Mode Status */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          {config?.configured ? (
            <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider shadow flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              Database: Live (Terhubung)
            </span>
          ) : (
            <span className="bg-rose-600 text-white px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider shadow flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Database: Terputus
            </span>
          )}
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white border-b-2 border-rose-800 hover:border-rose-900 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer font-display uppercase tracking-wider"
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        
        {/* Banner Status Database */}
        {!config?.configured && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-200">
              <span className="font-bold">Database Belum Terhubung:</span> Berkas lingkungan `.env` Anda belum memiliki pengaturan DATABASE_URL yang valid. Harap tambahkan DATABASE_URL PostgreSQL Anda (misalnya: postgres://user:pass@192.168.0.201:5432/dbname) di berkas .env untuk mengaktifkan penyimpanan data.
            </div>
          </div>
        )}

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 bg-rose-950/40 border border-rose-800 text-rose-200 text-sm p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => { fetchConfig(); fetchInitialData(); }}
              className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-white rounded-lg transition text-xs font-bold cursor-pointer shrink-0"
            >
              Hubungkan Kembali
            </button>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-sm p-4 rounded-2xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 mb-6 gap-2">
          <button
            onClick={() => { setActiveTab("pesilat"); setError(null); setSuccess(null); }}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold transition rounded-t-2xl ${
              activeTab === "pesilat"
                ? "bg-indigo-500/10 border-b-2 border-indigo-500 text-indigo-400"
                : "border-b-2 border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Kelola Pesilat
          </button>
          <button
            onClick={() => { setActiveTab("arena"); setError(null); setSuccess(null); }}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold transition rounded-t-2xl ${
              activeTab === "arena"
                ? "bg-indigo-500/10 border-b-2 border-indigo-500 text-indigo-400"
                : "border-b-2 border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800"
            }`}
          >
            <Settings className="w-4 h-4" />
            Pengaturan Arena
          </button>
        </div>

        {/* Tab 1: KELOLA PESILAT */}
        {activeTab === "pesilat" && (
          <div className="flex flex-col gap-6">
            
            {/* Form Input Pesilat Modal */}
            {isFormModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-slate-900 border-2 border-slate-800 p-5 rounded-3xl shadow-2xl w-full max-w-lg my-auto ring-1 ring-white/5 relative">
                  <button 
                    type="button"
                    onClick={resetFormPesilat} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-black text-white font-display uppercase tracking-wider">
                  {isEditMode ? "Ubah Data Pesilat" : "Tambah Pesilat"}
                </h3>
              </div>

              <form onSubmit={handleSubmitPesilat} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-400 mb-1.5 uppercase tracking-widest font-mono">
                    Nomor Partai / Pertandingan
                  </label>
                  <input
                    type="text"
                    value={nomorPartai}
                    onChange={(e) => setNomorPartai(e.target.value)}
                    placeholder="Contoh: 01, A-12, dll."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl px-3 py-2.5 outline-none transition font-bold"
                    required
                  />
                </div>

                {/* SUDUT BIRU GROUP */}
                <div className="border-l-4 border-blue-500 pl-3 py-2.5 bg-blue-500/5 rounded-r-xl space-y-3">
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest font-mono">
                    SUDUT BIRU
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest font-mono">
                      Nama Pesilat Biru
                    </label>
                    <input
                      type="text"
                      value={namaPesilatBiru}
                      onChange={(e) => setNamaPesilatBiru(e.target.value)}
                      placeholder="Nama lengkap atlet sudut biru (opsional)"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-xl px-3 py-2 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest font-mono">
                      Kontingen Biru
                    </label>
                    <input
                      type="text"
                      value={kontingenBiru}
                      onChange={(e) => setKontingenBiru(e.target.value)}
                      placeholder="Asal Kontingen / Perguruan (opsional)"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-xl px-3 py-2 outline-none transition"
                    />
                  </div>
                </div>

                {/* SUDUT MERAH GROUP */}
                <div className="border-l-4 border-red-500 pl-3 py-2.5 bg-red-500/5 rounded-r-xl space-y-3">
                  <div className="text-[10px] font-black text-red-400 uppercase tracking-widest font-mono">
                    SUDUT MERAH
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest font-mono">
                      Nama Pesilat Merah (Wajib)
                    </label>
                    <input
                      type="text"
                      value={namaPesilat}
                      onChange={(e) => setNamaPesilat(e.target.value)}
                      placeholder="Nama lengkap atlet sudut merah"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white rounded-xl px-3 py-2 outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest font-mono">
                      Kontingen Merah (Wajib)
                    </label>
                    <input
                      type="text"
                      value={kontingen}
                      onChange={(e) => setKontingen(e.target.value)}
                      placeholder="Asal Kontingen / Perguruan"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white rounded-xl px-3 py-2 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest font-mono">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl px-2 py-2.5 outline-none transition text-xs sm:text-sm"
                    >
                      {opsiGender.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest font-mono">
                      Kategori
                    </label>
                    <select
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl px-2 py-2.5 outline-none transition text-xs sm:text-sm"
                    >
                      {opsiKategori.map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest font-mono">
                    Kelas Tanding / Seni
                  </label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl px-2.5 py-2.5 outline-none transition text-xs sm:text-sm"
                  >
                    {opsiKelas.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                  <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest font-mono">
                    Durasi Pertandingan (jam:menit:detik)
                  </label>
                  <input
                    type="text"
                    value={timerInputStr}
                    onChange={(e) => {
                      setTimerInputStr(e.target.value);
                      const secs = parseTimeToSeconds(e.target.value);
                      setTimerDuration(secs);
                    }}
                    onFocus={() => setIsTimerInputFocused(true)}
                    onBlur={() => {
                      setIsTimerInputFocused(false);
                      setTimerInputStr(formatSecondsToTime(timerDuration));
                    }}
                    placeholder="Contoh: 00:02:00 atau 02:00"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl px-3 py-2.5 outline-none transition font-bold"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-wide">
                    Atur durasi kustom (Format: JJ:MM:DD / MM:DD). Tersimpan: {timerDuration} detik.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest font-mono">
                    Ditempatkan di Arena (Gelanggang)
                  </label>
                  <select
                    value={arena}
                    onChange={(e) => setArena(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl px-2.5 py-2.5 outline-none transition font-semibold text-xs sm:text-sm"
                  >
                    {Array.from({ length: jumlahArena }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>Gelanggang {num}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-wide">
                    Hanya menampilkan Gelanggang yang aktif.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl transition text-xs uppercase tracking-wider font-display shadow-lg shadow-indigo-600/10"
                  >
                    {isEditMode ? "Simpan Perubahan" : "Simpan Pesilat"}
                  </button>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={resetFormPesilat}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl transition text-xs uppercase font-mono tracking-wider"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
                </div>
              </div>
            )}

            {/* List Daftar Pesilat & Kontrol Gelanggang */}
            <div className="flex flex-col gap-6 min-w-0">
              
              {/* PANEL KONTROL GELANGGANG (LIVE CONTROL ROOM) */}
              <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 shadow-2xl ring-1 ring-white/5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-black text-white font-display uppercase tracking-wider">
                        Panel Kontrol Gelanggang Aktif (Live Display)
                      </h4>
                      <p className="text-[10px] text-slate-400">Kelola dan pantau partai yang sedang tampil secara langsung</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Auto Next Partai by Timer</span>
                    
                    <button 
                      onClick={toggleAutoNextMatch}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isAutoNextEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isAutoNextEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: jumlahArena }, (_, idx) => {
                    const arenaNum = idx + 1;
                    // Temukan pesilat yang is_playing === true di arena ini
                    const activePesilat = pesilatList.find(p => p.arena === arenaNum && p.is_playing);

                    return (
                      <div 
                        key={arenaNum} 
                        className={`rounded-2xl p-4 border transition ${
                          activePesilat 
                            ? "bg-slate-950 border-indigo-500/40 shadow-indigo-950/50 shadow-xl ring-1 ring-indigo-500/10" 
                            : "bg-slate-950/40 border-slate-800/80"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-indigo-500/20">
                            Gelanggang {arenaNum}
                          </span>
                          {activePesilat ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest font-mono">LIVE ON MONITOR</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">STANDBY / MATI</span>
                          )}
                        </div>

                        {activePesilat ? (
                          <div className="space-y-3">
                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-black font-mono border border-amber-400/20">
                                    PARTAI {activePesilat.nomor_partai || "00"}
                                  </span>
                                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide">
                                    {activePesilat.kelas} ({activePesilat.kategori})
                                  </p>
                                </div>
                                <span className="bg-slate-850 text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono">
                                  {activePesilat.gender}
                                </span>
                              </div>

                              {/* Sudut Biru vs Sudut Merah display */}
                              <div className="grid grid-cols-2 gap-2 text-center text-xs mt-3">
                                {activePesilat.nama_pesilat_biru ? (
                                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-200">
                                    <p className="font-mono text-[9px] text-blue-400 font-bold tracking-widest uppercase mb-0.5">BIRU</p>
                                    <p className="font-black truncate text-xs">{activePesilat.nama_pesilat_biru}</p>
                                    <p className="text-[9px] text-blue-300/70 truncate mt-0.5 font-medium">{activePesilat.kontingen_biru}</p>
                                  </div>
                                ) : (
                                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 flex flex-col items-center justify-center font-mono text-[9px] uppercase tracking-wider font-bold">
                                    <span>SENI</span>
                                    <span>TUNGGAL</span>
                                  </div>
                                )}
                                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-200">
                                  <p className="font-mono text-[9px] text-red-400 font-bold tracking-widest uppercase mb-0.5">MERAH</p>
                                  <p className="font-black truncate text-xs">{activePesilat.nama_pesilat}</p>
                                  <p className="text-[9px] text-red-300/70 truncate mt-0.5 font-medium">{activePesilat.kontingen}</p>
                                </div>
                              </div>
                            </div>

                            {/* TIMER CONTROLS */}
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-800">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400 animate-pulse" />
                                <span className="font-mono text-base font-black text-white tracking-widest">
                                  {Math.floor(activePesilat.timer_seconds_left / 60).toString().padStart(2, "0")}
                                  :
                                  {(activePesilat.timer_seconds_left % 60).toString().padStart(2, "0")}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 mt-2 lg:mt-0 w-full lg:w-auto">
                                {/* Start/Pause */}
                                <button
                                  onClick={() => handleUpdateTimer(activePesilat.id, undefined, activePesilat.timer_seconds_left, !activePesilat.timer_running)}
                                  className={`p-1.5 px-2.5 rounded-lg transition cursor-pointer flex items-center justify-center min-w-[75px] ${
                                    activePesilat.timer_running
                                      ? "bg-amber-500/20 hover:bg-amber-500/35 text-amber-400 border border-amber-500/30"
                                      : "bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 border border-emerald-500/30"
                                  }`}
                                  title={activePesilat.timer_running ? "Pause Waktu" : "Mulai Waktu"}
                                >
                                  {activePesilat.timer_running ? (
                                    <div className="flex items-center gap-1.5"><Pause className="w-3.5 h-3.5" /><span className="text-[10px] font-black uppercase tracking-widest font-mono">Jeda</span></div>
                                  ) : (
                                    <div className="flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /><span className="text-[10px] font-black uppercase tracking-widest font-mono">Mulai</span></div>
                                  )}
                                </button>
                                {/* Reset Timer */}
                                <button
                                  onClick={() => handleUpdateTimer(activePesilat.id, undefined, activePesilat.timer_duration, false)}
                                  className="p-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                                  title="Reset Waktu"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span className="hidden xl:inline text-[10px] font-black uppercase tracking-widest font-mono">Reset</span>
                                </button>
                                {/* Panggil */}
                                <button
                                  onClick={() => announceMatch(arenaNum, activePesilat)}
                                  className="p-1.5 px-2 bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-400 border border-indigo-500/30 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                                  title="Panggil Suara Pengumuman Atlit"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest font-mono">Panggil</span>
                                </button>
                                {/* Next Partai */}
                                <button
                                  onClick={() => handleNextPartai(arenaNum)}
                                  className="p-1.5 px-2 bg-blue-500/20 hover:bg-blue-500/35 text-blue-400 border border-blue-500/30 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                                  title="Ganti ke Partai Berikutnya di Gelanggang Ini"
                                >
                                  <SkipForward className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest font-mono">Next</span>
                                </button>
                                {/* Stop Display */}
                                <button
                                  onClick={() => handleStopMatch(activePesilat.id)}
                                  className="p-1.5 px-2 bg-red-500/20 hover:bg-red-500/35 text-red-400 border border-red-500/30 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                                  title="Hentikan Display Monitor"
                                >
                                  <Square className="w-3.5 h-3.5" />
                                  <span className="hidden xl:inline text-[10px] font-black uppercase tracking-widest font-mono">Mati</span>
                                </button>
                              </div>
                            </div>

                            {/* CUSTOM TIMER FORM */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                              <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1">
                                <Timer className="w-3 h-3 text-indigo-400" />
                                Atur Durasi Baru:
                              </span>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  placeholder="Detik"
                                  defaultValue={activePesilat.timer_duration}

                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const target = e.currentTarget;
                                      const secs = parseInt(target.value) || 120;
                                      handleUpdateTimer(activePesilat.id, secs, secs, false);
                                      target.blur();
                                    }
                                  }}
                                  className="w-16 bg-slate-900 border border-slate-800 text-center font-bold text-[10px] text-white rounded-lg py-1 outline-none focus:border-indigo-500 transition"
                                  title="Tekan enter untuk menyimpan"
                                />
                                <span className="text-[10px] text-slate-400 font-mono">detik</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-6 text-center text-slate-600 font-mono text-[10px] border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2">
                            <p>Gelanggang Standby.</p>
                            <button
                              onClick={() => handleNextPartai(arenaNum)}
                              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg font-bold transition-colors uppercase tracking-wider"
                            >
                              Mulai Partai Berikutnya
                            </button>
                            <p className="text-[9px] text-slate-500 mt-1">Atau aktifkan atlet dari tombol <strong className="text-indigo-400">TAMPIL</strong> di bawah.</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TABLE LIST */}
              <div className="bg-slate-900 border-2 border-slate-800 p-5 rounded-3xl shadow-2xl flex flex-col min-w-0 ring-1 ring-white/5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <UsersRound className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-base font-black text-white font-display uppercase tracking-wider">
                      Daftar Pesilat Terdaftar ({pesilatList.length})
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setIsFormModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition"
                    >
                      <UserPlus className="w-4 h-4" /> Tambah Pesilat
                    </button>
                    {/* Hidden input file for Import */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportExcel}
                      accept=".xlsx, .xls"
                      className="hidden"
                    />

                    {/* Download Template Button */}
                    <button
                      onClick={handleDownloadTemplate}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      title="Unduh Template File Excel"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Template Excel</span>
                    </button>

                    {/* Import Excel Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-indigo-950/40 border border-indigo-500/20 hover:border-indigo-500/50 rounded-xl text-indigo-300 hover:text-indigo-200 transition text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      title="Impor dari File Excel"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Impor Excel</span>
                    </button>

                    {/* Export Excel Button */}
                    <button
                      onClick={handleExportExcel}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl text-emerald-300 hover:text-emerald-200 transition text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      title="Ekspor Data ke Excel"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ekspor Excel</span>
                    </button>

                    {/* Refresh Button */}
                    <button
                      onClick={fetchInitialData}
                      className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer border border-slate-800"
                      title="Refresh Data"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status Filter Tabs & Bulk Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 w-fit">
                    <button
                      onClick={() => setFilterStatus("queue")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                        filterStatus === "queue"
                          ? "bg-indigo-600 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Antrean ({pesilatList.filter(p => !p.is_done).length})
                    </button>
                    <button
                      onClick={() => setFilterStatus("done")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                        filterStatus === "done"
                          ? "bg-indigo-600 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Selesai ({pesilatList.filter(p => p.is_done).length})
                    </button>
                    <button
                      onClick={() => setFilterStatus("all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                        filterStatus === "all"
                          ? "bg-indigo-600 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Semua ({pesilatList.length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        className="px-3 py-1.5 bg-red-950/40 hover:bg-red-950/80 border border-red-500/30 hover:border-red-500 text-red-200 transition text-xs font-black flex items-center gap-1.5 rounded-xl cursor-pointer shadow-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Hapus Ceklist ({selectedIds.length})</span>
                      </button>
                    )}
                    <button
                      onClick={handleDeleteAll}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-red-950/20 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition text-xs font-black flex items-center gap-1.5 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
                      <span>Hapus Semua</span>
                    </button>
                  </div>
                </div>

                {/* Responsive Table Wrapper with hidden overflow to fit the screen without scrollbars */}
                <div className="overflow-hidden rounded-2xl border border-slate-800">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm table-fixed">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[9px] sm:text-[10px] uppercase tracking-wider">
                        <th className="p-2 sm:p-3 w-[8%] sm:w-[7%] text-center">
                          <input
                            type="checkbox"
                            checked={filteredPesilatList.length > 0 && filteredPesilatList.every(p => selectedIds.includes(p.id))}
                            onChange={() => handleToggleSelectAll(filteredPesilatList)}
                            className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
                            title="Pilih/Batal Pilih Semua"
                          />
                        </th>
                        <th className="p-2 sm:p-3 w-[27%] sm:w-[31%]">Nama / Kontingen (Sudut)</th>
                        <th className="p-2 sm:p-3 w-[15%] sm:w-[14%]">Gender/Kat</th>
                        <th className="p-2 sm:p-3 w-[14%] sm:w-[13%]">Kelas</th>
                        <th className="p-2 sm:p-3 text-center w-[11%] sm:w-[10%]">Arena</th>
                        <th className="p-2 sm:p-3 text-right w-[25%] sm:w-[25%]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500">
                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                            Memuat data pesilat...
                          </td>
                        </tr>
                      ) : (() => {
                        if (filteredPesilatList.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                                {filterStatus === "queue"
                                  ? "Tidak ada partai dalam antrean."
                                  : filterStatus === "done"
                                    ? "Belum ada partai yang selesai."
                                    : "Belum ada data pesilat terdaftar."}
                              </td>
                            </tr>
                          );
                        }

                        return filteredPesilatList.map((p) => (
                          <tr key={p.id} className={`hover:bg-slate-850/40 transition ${p.is_playing ? "bg-indigo-500/5" : ""} ${selectedIds.includes(p.id) ? "bg-slate-800/20" : ""}`}>
                            <td className="p-2 sm:p-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(p.id)}
                                onChange={() => handleToggleSelect(p.id)}
                                className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950 cursor-pointer"
                              />
                            </td>
                            <td className="p-2 sm:p-3 min-w-0">
                              <div className="flex items-start gap-1.5 sm:gap-2.5 min-w-0">
                                <span className="bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded font-mono font-black text-[9px] sm:text-[10px] border border-indigo-500/20 uppercase shrink-0 mt-0.5">
                                  P-{p.nomor_partai || "01"}
                                </span>
                                <div className="space-y-1 min-w-0 flex-1">
                                  {/* Biru Corner */}
                                  {p.nama_pesilat_biru && (
                                    <div className="flex items-center gap-1 min-w-0">
                                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                                      <span className="font-bold text-slate-300 uppercase truncate text-[11px] sm:text-xs block max-w-[80px] xs:max-w-[120px] sm:max-w-none">{p.nama_pesilat_biru}</span>
                                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate shrink-0">({p.kontingen_biru})</span>
                                    </div>
                                  )}
                                  
                                  {/* Merah Corner */}
                                  <div className={`flex items-center gap-1 min-w-0 ${p.nama_pesilat_biru ? "border-t border-slate-800/50 pt-1" : ""}`}>
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                                    <span className="font-bold text-white uppercase truncate text-[11px] sm:text-xs block max-w-[80px] xs:max-w-[120px] sm:max-w-none">{p.nama_pesilat}</span>
                                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate shrink-0">({p.kontingen})</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 sm:p-3 min-w-0">
                              <span className="text-slate-300 font-medium text-[11px] sm:text-xs block truncate leading-none">{p.gender}</span>
                              <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1 py-0.5 rounded font-mono text-[8px] sm:text-[9px] uppercase font-bold mt-1 leading-none">
                                {p.kategori}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 text-slate-300 text-[11px] sm:text-xs truncate max-w-[70px] sm:max-w-none">
                              {p.kelas}
                            </td>
                            <td className="p-2 sm:p-3 text-center shrink-0">
                              <span className="bg-slate-950 text-indigo-400 border border-slate-800 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded font-mono font-bold text-[10px] sm:text-xs shadow-inner">
                                G-{p.arena}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 text-right">
                              <div className="flex justify-end items-center gap-0.5 sm:gap-1.5">
                                {p.is_done ? (
                                  <button
                                    onClick={() => handleToggleDone(p.id, true)}
                                    className="px-1 sm:px-2 py-0.5 sm:py-1 bg-slate-950 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg transition text-[9px] uppercase font-mono tracking-widest cursor-pointer flex items-center gap-1 shrink-0"
                                    title="Kembalikan Partai ke Antrean"
                                  >
                                    <RefreshCw className="w-2.5 h-2.5" />
                                    <span className="hidden sm:inline">RESTORE</span>
                                  </button>
                                ) : (
                                  <>
                                    {p.is_playing ? (
                                      <>
                                        <button
                                          onClick={() => announceMatch(p.arena, p)}
                                          className="px-1 sm:px-2 py-0.5 sm:py-1 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-lg transition text-[9px] uppercase font-mono tracking-widest flex items-center gap-1 cursor-pointer shadow-lg shadow-amber-500/10 shrink-0"
                                          title="Panggil Suara Pengumuman Atlit"
                                        >
                                          <Volume2 className="w-2.5 h-2.5" />
                                          <span className="hidden sm:inline">PANGGIL</span>
                                        </button>
                                        <button
                                          onClick={() => handleStopMatch(p.id)}
                                          className="px-1 sm:px-2 py-0.5 sm:py-1 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg transition text-[9px] uppercase font-mono tracking-widest flex items-center gap-1 cursor-pointer shadow-lg shadow-red-600/10 animate-pulse shrink-0"
                                          title="Hentikan Display Monitor"
                                        >
                                          <Tv className="w-2.5 h-2.5" />
                                          <span className="hidden sm:inline text-[8px] sm:text-[9px]">ON AIR</span>
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => handlePlayMatch(p.id)}
                                        className="px-1 sm:px-2 py-0.5 sm:py-1 bg-slate-950 hover:bg-emerald-600/20 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 rounded-lg transition text-[9px] uppercase font-mono tracking-widest cursor-pointer flex items-center gap-1 shrink-0"
                                        title="Tampilkan di Monitor"
                                      >
                                        <Play className="w-2.5 h-2.5" />
                                        <span className="hidden sm:inline">PLAY</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleToggleDone(p.id, false)}
                                      className="p-1 sm:p-1.5 bg-slate-950 hover:bg-emerald-600/20 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 rounded-lg transition cursor-pointer flex items-center justify-center shrink-0"
                                      title="Tandai Selesai"
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleEditClick(p)}
                                  className="p-1 sm:p-1.5 bg-slate-950 hover:bg-indigo-500/25 text-slate-400 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/30 rounded-lg transition cursor-pointer flex items-center justify-center shrink-0"
                                  title="Edit Partai"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(p.id, p.nama_pesilat)}
                                  className="p-1 sm:p-1.5 bg-slate-950 hover:bg-rose-500/25 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 rounded-lg transition cursor-pointer flex items-center justify-center shrink-0"
                                  title="Hapus Partai"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: PENGATURAN ARENA */}
        {activeTab === "arena" && (
          <div className="max-w-xl mx-auto bg-slate-900 border-2 border-slate-800 p-6 rounded-3xl shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center gap-2.5 mb-4 border-b border-slate-800 pb-4">
              <LayoutGrid className="w-6 h-6 text-indigo-400" />
              <div>
                <h3 className="text-base font-black text-white font-display uppercase tracking-wider">
                  Pengaturan Jumlah Arena
                </h3>
                <p className="text-xs text-slate-400">Atur kapasitas Gelanggang yang ditampilkan secara publik</p>
              </div>
            </div>

            <form onSubmit={handleSubmitArena} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
                  Jumlah Arena Gelanggang Aktif
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={inputJumlahArena}
                    onChange={(e) => setInputJumlahArena(parseInt(e.target.value) || 1)}
                    className="w-24 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-center font-bold text-lg text-white rounded-xl py-2.5 outline-none transition"
                  />
                  <div className="text-xs text-slate-400">
                    <p className="font-semibold text-slate-300">Skala Display: 1 s.d. 12 Gelanggang</p>
                    <p>Halaman display publik akan langsung membagi tata letak kolom secara instan.</p>
                  </div>
                </div>
              </div>

              {/* Slider helper for easier UI */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Slide Arena Selector
                </span>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={inputJumlahArena}
                  onChange={(e) => setInputJumlahArena(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer border border-slate-800"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 Gelanggang</span>
                  <span>4</span>
                  <span>8</span>
                  <span>12 Gelanggang</span>
                </div>
              </div>

              {/* Preview simulated columns */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800">
                <p className="text-[10px] text-slate-400 mb-2.5 font-bold font-mono uppercase tracking-widest">
                  Simulasi Tampilan Display Publik:
                </p>
                <div 
                  className="grid gap-1.5 h-16 bg-slate-900 p-2 rounded-xl border border-slate-800/80"
                  style={{
                    gridTemplateColumns: `repeat(${inputJumlahArena}, 1fr)`
                  }}
                >
                  {Array.from({ length: inputJumlahArena }).map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-[10px] font-mono text-indigo-400 font-bold"
                    >
                      G{i + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/50">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition text-xs uppercase tracking-wider font-display shadow-lg shadow-indigo-600/20"
                >
                  Perbarui Jumlah Arena Sekarang
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <ShieldAlert className="w-8 h-8" />
              <h3 className="font-display font-black text-lg text-white">Konfirmasi Penghapusan</h3>
            </div>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {showDeleteConfirm === 'all' 
                ? "Apakah Anda yakin ingin menghapus SEMUA data pesilat/partai? Tindakan ini tidak dapat dibatalkan."
                : showDeleteConfirm === 'selected'
                ? `Apakah Anda yakin ingin menghapus ${selectedIds.length} data pesilat/partai yang terpilih? Tindakan ini tidak dapat dibatalkan.`
                : `Apakah Anda yakin ingin menghapus pesilat "${singleDeleteTarget?.nama}"? Tindakan ini tidak dapat dibatalkan.`
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Batal
              </button>
              <button
                onClick={showDeleteConfirm === 'all' ? executeDeleteAll : showDeleteConfirm === 'selected' ? executeDeleteSelected : executeDeleteSingle}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
