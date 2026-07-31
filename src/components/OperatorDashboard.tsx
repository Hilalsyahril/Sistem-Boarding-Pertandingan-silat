import React, { useState, useEffect } from 'react';
import { LogOut, Play, Pause, SkipForward, Square, RotateCcw, Zap, Tv, Info, Undo2 } from 'lucide-react';
import { Pesilat, ConfigStatus } from "../types";

export default function OperatorDashboard({ onLogout, username }: { onLogout: () => void, username: string }) {
  const [pesilatList, setPesilatList] = useState<Pesilat[]>([]);
  const [jumlahArena, setJumlahArena] = useState<number>(3);
  const [autoNextMatch, setAutoNextMatch] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = async () => {
    try {
      const configRes = await fetch(`/api/pengaturan_arena?_t=${Date.now()}`);
      const configData = await configRes.json();
      if (configData && configData.length > 0) {
        setJumlahArena(configData[0].jumlah_arena || 3);
        if (configData[0].auto_next !== undefined) {
          setAutoNextMatch(configData[0].auto_next);
        }
      }

      const pRes = await fetch(`/api/pesilat?_t=${Date.now()}`);
      if (pRes.ok) {
        setPesilatList(await pRes.json());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pesilat?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setPesilatList(data);
        }
        
        const arenaRes = await fetch(`/api/pengaturan_arena?_t=${Date.now()}`);
        if (arenaRes.ok) {
          const arenaData = await arenaRes.json();
          const arenaItem = Array.isArray(arenaData) ? arenaData[0] : arenaData;
          if (arenaItem) {
             if (arenaItem.auto_next !== undefined) setAutoNextMatch(arenaItem.auto_next);
             if (arenaItem.jumlah_arena !== undefined) setJumlahArena(arenaItem.jumlah_arena);
          }
        }
      } catch (e) {
        // ignore
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const toggleAutoNextMatch = async () => {
    const newVal = !autoNextMatch;
    setAutoNextMatch(newVal);
    try {
      await fetch("/api/pengaturan_arena", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auto_next: newVal })
      });
      if (!newVal) {
        await fetch("/api/pesilat/timer-all", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timer_running: false })
        });
        fetchInitialData();
      }
    } catch (e) {
      console.warn("Gagal mengupdate auto_next");
    }
  };

  const handleUpdateTimer = async (id: string, duration?: number, secondsLeft?: number, running?: boolean) => {
    try {
      const payload: any = {};
      if (duration !== undefined) payload.timer_duration = duration;
      if (secondsLeft !== undefined) payload.timer_seconds_left = secondsLeft;
      if (running !== undefined) payload.timer_running = running;

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

      const res = await fetch(`/api/pesilat/${id}/timer?_method=PUT`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchInitialData();
      }
    } catch (err) {
      console.error("Gagal mengupdate timer:", err);
      fetchInitialData();
    }
  };

  const handleNextPartai = async (arena: number) => {
    try {
      const res = await fetch(`/api/arena/${arena}/next`, { method: "POST" });
      if (res.ok) fetchInitialData();
    } catch (err) {
      console.error("Gagal lanjut partai berikutnya:", err);
    }
  };

  const handleUndoPartai = async (arena: number) => {
    try {
      const res = await fetch(`/api/arena/${arena}/undo`, { method: "POST" });
      if (res.ok) fetchInitialData();
    } catch (err) {
      console.error("Gagal undo partai:", err);
    }
  };

  const handleStopMatch = async (id: string) => {
    try {
      setPesilatList(prev => prev.map(p => {
        if (p.id === id) return { ...p, is_playing: false, timer_running: false };
        return p;
      }));
      const res = await fetch(`/api/pesilat/${id}/stop?_method=PUT`, { method: 'POST' });
      if (res.ok) fetchInitialData();
    } catch (err) {
      console.error("Gagal menghentikan:", err);
      fetchInitialData();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white bg-neutral-950 font-sans">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-white pb-8">
      {/* HEADER (Small/Sticky) */}
      <div className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-3 sm:px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black uppercase font-display tracking-widest text-white leading-tight">Operator</h1>
            <span className="text-[9px] text-slate-400 font-mono tracking-wider">{username}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right flex flex-col items-end">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Arena Aktif</span>
            <span className="text-xs font-black font-mono text-indigo-400">{jumlahArena}</span>
          </div>
          <button onClick={onLogout} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition ml-2">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-3 mt-4 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs font-bold">
            {error}
          </div>
        )}

        {/* Global Autoplay Toggle */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white mb-0.5">Mode Autoplay Timer</h2>
              <p className="text-[10px] text-slate-400 leading-tight">Jika OFF, timer mati dan pindah partai secara manual.</p>
            </div>
            <button 
              onClick={toggleAutoNextMatch}
              className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none shadow-inner ${autoNextMatch ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-slate-700'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${autoNextMatch ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Arena Cards */}
        <div className="space-y-4">
          {Array.from({ length: jumlahArena }, (_, idx) => {
            const arenaNum = idx + 1;
            const activePesilat = pesilatList.find(p => (parseInt(String(p.arena).replace(/\D/g, ''), 10) === arenaNum || String(p.arena) === String(arenaNum)) && p.is_playing);

            return (
              <div key={arenaNum} className={`rounded-2xl p-4 border-2 transition shadow-xl ${
                activePesilat ? "bg-slate-900 border-indigo-500/40 shadow-indigo-950/40" : "bg-slate-900/50 border-slate-800/80"
              }`}>
                {/* Arena Header */}
                <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Tv className={`w-4 h-4 ${activePesilat ? "text-indigo-400" : "text-slate-500"}`} />
                    <h3 className="font-black text-sm uppercase tracking-wider text-white">Arena {arenaNum}</h3>
                  </div>
                  {activePesilat ? (
                    <div className="bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                      <span className="text-[9px] font-bold text-indigo-300 font-mono">Partai: {activePesilat.nomor_partai}</span>
                    </div>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-500 font-mono uppercase">Kosong</span>
                  )}
                </div>

                {activePesilat ? (
                  <div className="space-y-4">
                    {/* INFO PESILAT */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      {activePesilat.nama_pesilat_biru && !activePesilat.nama_pesilat ? (
                        <div className="col-span-2 bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg truncate">
                          <p className="font-black uppercase text-blue-100">{activePesilat.nama_pesilat_biru}</p>
                          <p className="text-[9px] text-blue-300 font-bold truncate mt-0.5">{activePesilat.kontingen_biru}</p>
                        </div>
                      ) : activePesilat.nama_pesilat && !activePesilat.nama_pesilat_biru ? (
                        <div className="col-span-2 bg-red-500/10 border border-red-500/20 p-2 rounded-lg truncate">
                          <p className="font-black uppercase text-red-100">{activePesilat.nama_pesilat}</p>
                          <p className="text-[9px] text-red-300 font-bold truncate mt-0.5">{activePesilat.kontingen}</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg truncate">
                            <p className="font-black uppercase text-blue-100">{activePesilat.nama_pesilat_biru}</p>
                            <p className="text-[9px] text-blue-300 font-bold truncate mt-0.5">{activePesilat.kontingen_biru}</p>
                          </div>
                          <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg truncate">
                            <p className="font-black uppercase text-red-100">{activePesilat.nama_pesilat}</p>
                            <p className="text-[9px] text-red-300 font-bold truncate mt-0.5">{activePesilat.kontingen}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* TIMER */}
                    {autoNextMatch && (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                        <div className="font-mono text-2xl font-black text-white tracking-widest leading-none">
                          {Math.floor(activePesilat.timer_seconds_left / 60).toString().padStart(2, "0")}:
                          {(activePesilat.timer_seconds_left % 60).toString().padStart(2, "0")}
                        </div>
                        <button
                          onClick={() => handleUpdateTimer(activePesilat.id, undefined, activePesilat.timer_seconds_left, !activePesilat.timer_running)}
                          className={`p-3 rounded-xl transition cursor-pointer flex items-center justify-center shadow-lg ${
                            activePesilat.timer_running
                              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                              : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                          }`}
                        >
                          {activePesilat.timer_running ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </button>
                      </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleUndoPartai(arenaNum)}
                        className="col-span-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition"
                      >
                        <Undo2 className="w-5 h-5" />
                        <span className="text-[9px] uppercase tracking-widest font-mono mt-0.5">Undo</span>
                      </button>
                      
                      <button
                        onClick={() => handleNextPartai(arenaNum)}
                        className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition shadow-lg shadow-blue-600/20"
                      >
                        <SkipForward className="w-5 h-5" />
                        <span className="text-[9px] uppercase tracking-widest font-mono mt-0.5">Next Partai</span>
                      </button>

                      <button
                        onClick={() => handleStopMatch(activePesilat.id)}
                        className="col-span-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-black py-2.5 rounded-xl flex items-center justify-center gap-2 transition mt-1"
                      >
                        <Square className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-mono">Stop Display</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500 flex flex-col items-center justify-center border border-dashed border-slate-700/50 rounded-xl">
                    <Info className="w-6 h-6 mb-2 opacity-50" />
                    <p className="text-[10px] font-mono uppercase tracking-widest font-bold">Tidak Ada Partai Aktif</p>
                    <button
                        onClick={() => handleNextPartai(arenaNum)}
                        className="mt-4 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 font-black px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
                      >
                        <Play className="w-3 h-3" />
                        <span className="text-[10px] uppercase tracking-widest font-mono">Mulai Partai Pertama</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
