const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `                                {/* Stop Display */}
                                <button
                                  onClick={() => handleStopMatch(activePesilat.id)}
                                  className="p-1.5 bg-red-600/20 hover:bg-red-600/35 text-red-400 border border-red-600/30 rounded-lg transition cursor-pointer text-[10px] font-black font-mono tracking-widest uppercase px-2.5 py-1"
                                  title="Hentikan Display Monitor"
                                >
                                  MATIKAN
                                </button>`;

const replacement = `                                {/* Next Match / Selesai */}
                                <button
                                  onClick={() => handleTimeoutMatch(activePesilat.id)}
                                  className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-400 border border-indigo-600/30 rounded-lg transition cursor-pointer text-[10px] font-black font-mono tracking-widest uppercase px-2.5 py-1 flex items-center gap-1"
                                  title="Selesaikan & Pindah ke Partai Berikutnya"
                                >
                                  <SkipForward className="w-3.5 h-3.5" />
                                  <span>NEXT</span>
                                </button>
                                {/* Stop Display */}
                                <button
                                  onClick={() => handleStopMatch(activePesilat.id)}
                                  className="p-1.5 bg-red-600/20 hover:bg-red-600/35 text-red-400 border border-red-600/30 rounded-lg transition cursor-pointer text-[10px] font-black font-mono tracking-widest uppercase px-2.5 py-1"
                                  title="Hentikan Display Monitor"
                                >
                                  MATIKAN
                                </button>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
