const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const target = `                            <button
                              onClick={() => handleNextPartai(arenaNum)}
                              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg font-bold transition-colors uppercase tracking-wider"
                            >
                              Mulai Partai Berikutnya
                            </button>`;

const replacement = `                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleUndoPartai(arenaNum)}
                                className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700 text-slate-300 border border-slate-700/50 rounded-lg font-bold transition-colors uppercase tracking-wider flex items-center gap-1.5"
                              >
                                <Undo2 className="w-3.5 h-3.5" /> Undo
                              </button>
                              <button
                                onClick={() => handleNextPartai(arenaNum)}
                                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg font-bold transition-colors uppercase tracking-wider"
                              >
                                Mulai Partai Berikutnya
                              </button>
                            </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched standby button");
