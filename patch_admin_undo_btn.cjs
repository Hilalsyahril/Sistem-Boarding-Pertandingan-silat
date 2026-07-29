const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const target = `                              {/* Next Partai */}
                              <button
                                onClick={() => handleNextPartai(arenaNum)}
                                className="p-1.5 px-2 bg-blue-500/20 hover:bg-blue-500/35 text-blue-400 border border-blue-500/30 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
                                title="Ganti ke Partai Berikutnya di Gelanggang Ini"
                              >
                                <SkipForward className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest font-mono">Next</span>
                              </button>`;

const replacement = `                              {/* Undo Partai */}
                              <button
                                onClick={() => handleUndoPartai(arenaNum)}
                                className="p-1.5 px-2 bg-slate-700/20 hover:bg-slate-700/40 text-slate-400 border border-slate-600/30 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
                                title="Kembali ke Partai Sebelumnya"
                              >
                                <Undo2 className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline text-[10px] font-black uppercase tracking-widest font-mono">Undo</span>
                              </button>
                              
                              {/* Next Partai */}
                              <button
                                onClick={() => handleNextPartai(arenaNum)}
                                className="p-1.5 px-2 bg-blue-500/20 hover:bg-blue-500/35 text-blue-400 border border-blue-500/30 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
                                title="Ganti ke Partai Berikutnya di Gelanggang Ini"
                              >
                                <SkipForward className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest font-mono">Next</span>
                              </button>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched button");
