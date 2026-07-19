const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `                                {/* Next Match / Selesai */}
                                <button
                                  onClick={() => handleTimeoutMatch(activePesilat.id)}
                                  className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-400 border border-indigo-600/30 rounded-lg transition cursor-pointer text-[10px] font-black font-mono tracking-widest uppercase px-2.5 py-1 flex items-center gap-1"
                                  title="Selesaikan & Pindah ke Partai Berikutnya"
                                >
                                  <SkipForward className="w-3.5 h-3.5" />
                                  <span>NEXT</span>
                                </button>`;

code = code.replace(target, '');
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
