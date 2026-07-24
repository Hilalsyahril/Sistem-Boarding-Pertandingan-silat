const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const targetButtons = `<div className="flex items-center gap-1.5">
                                {/* Start/Pause */}
                                <button
                                  onClick={() => handleUpdateTimer(activePesilat.id, undefined, activePesilat.timer_seconds_left, !activePesilat.timer_running)}
                                  className={\`p-1.5 rounded-lg transition cursor-pointer \${
                                    activePesilat.timer_running
                                      ? "bg-amber-600/20 hover:bg-amber-600/35 text-amber-400 border border-amber-600/30"
                                      : "bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-400 border border-emerald-600/30"
                                  }\`}
                                  title={activePesilat.timer_running ? "Pause Waktu" : "Mulai Waktu"}
                                >
                                  {activePesilat.timer_running ? <><Pause className="w-3.5 h-3.5" /><span className="text-xs font-semibold ml-1">Jeda</span></> : <><Play className="w-3.5 h-3.5" /><span className="text-xs font-semibold ml-1">Mulai</span></>}
                                </button>
                                {/* Reset Timer */}
                                <button
                                  onClick={() => handleUpdateTimer(activePesilat.id, undefined, activePesilat.timer_duration, false)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition cursor-pointer"
                                  title="Reset Waktu"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                                {/* Panggil */}
                                <button
                                  onClick={() => announceMatch(arenaNum, activePesilat)}
                                  className="p-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black border border-amber-400/50 rounded-lg transition cursor-pointer text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 flex items-center gap-1"
                                  title="Panggil Suara Pengumuman Atlit"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">PANGGIL</span>
                                </button>
                                {/* Next Partai */}
                                <button
                                  onClick={() => handleNextPartai(arenaNum)}
                                  className="p-1.5 bg-blue-600/20 hover:bg-blue-600/35 text-blue-400 border border-blue-600/30 rounded-lg transition cursor-pointer text-[10px] font-black font-mono tracking-widest uppercase px-2.5 py-1"
                                  title="Ganti ke Partai Berikutnya di Gelanggang Ini"
                                >
                                  NEXT
                                </button>
                                {/* Stop Display */}
                                <button
                                  onClick={() => handleStopMatch(activePesilat.id)}
                                  className="p-1.5 bg-red-600/20 hover:bg-red-600/35 text-red-400 border border-red-600/30 rounded-lg transition cursor-pointer text-[10px] font-black font-mono tracking-widest uppercase px-2.5 py-1"
                                  title="Hentikan Display Monitor"
                                >
                                  MATIKAN
                                </button>
                              </div>`;

const newButtons = `<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 md:mt-0">
                                {/* Start/Pause */}
                                <button
                                  onClick={() => handleUpdateTimer(activePesilat.id, undefined, activePesilat.timer_seconds_left, !activePesilat.timer_running)}
                                  className={\`p-1.5 px-2.5 rounded-lg transition cursor-pointer flex items-center justify-center min-w-[75px] \${
                                    activePesilat.timer_running
                                      ? "bg-amber-500/20 hover:bg-amber-500/35 text-amber-400 border border-amber-500/30"
                                      : "bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 border border-emerald-500/30"
                                  }\`}
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
                              </div>`;

code = code.replace(targetButtons, newButtons);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx successfully!");
