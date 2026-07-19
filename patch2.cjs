const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target1 = `                                </button>
                                {/* Stop Display */}
                                <button`;
const replacement1 = `                                </button>
                                {/* Panggil */}
                                <button
                                  onClick={() => announceMatch(arenaNum, activePesilat)}
                                  className="p-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black border border-amber-400/50 rounded-lg transition cursor-pointer text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 flex items-center gap-1"
                                  title="Panggil Suara Pengumuman Atlit"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>PANGGIL</span>
                                </button>
                                {/* Stop Display */}
                                <button`;

code = code.replace(target1, replacement1);

const target2 = `                                        <button
                                          onClick={() => handleStopMatch(p.id)}
                                          className="px-1 sm:px-2 py-0.5 sm:py-1 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg transition text-[9px] uppercase font-mono tracking-widest flex items-center gap-1 cursor-pointer shadow-lg shadow-red-600/10 animate-pulse shrink-0"`;

const replacement2 = `                                        <button
                                          onClick={() => announceMatch(p.arena, p)}
                                          className="px-1 sm:px-2 py-0.5 sm:py-1 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-lg transition text-[9px] uppercase font-mono tracking-widest flex items-center gap-1 cursor-pointer shadow-lg shadow-amber-500/10 shrink-0"
                                          title="Panggil Suara Pengumuman Atlit"
                                        >
                                          <Volume2 className="w-2.5 h-2.5" />
                                          <span className="hidden sm:inline">PANGGIL</span>
                                        </button>
                                        <button
                                          onClick={() => handleStopMatch(p.id)}
                                          className="px-1 sm:px-2 py-0.5 sm:py-1 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg transition text-[9px] uppercase font-mono tracking-widest flex items-center gap-1 cursor-pointer shadow-lg shadow-red-600/10 animate-pulse shrink-0"`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
