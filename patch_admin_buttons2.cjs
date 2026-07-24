const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const targetButtonsGroup = `                                {/* Stop Display */}
                                <button
                                  onClick={() => handleStopMatch(activePesilat.id)}
                                  className="p-1.5 bg-red-600/20 hover:bg-red-600/35 text-red-400 border border-red-600/30 rounded-lg transition cursor-pointer text-[10px] font-black font-mono tracking-widest uppercase px-2.5 py-1"
                                  title="Hentikan Display Monitor"
                                >
                                  MATIKAN
                                </button>
                              </div>`;

const newButtonsGroup = `                                {/* Next Partai */}
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

code = code.replace(targetButtonsGroup, newButtonsGroup);

const targetStandby = `                        ) : (
                          <div className="py-6 text-center text-slate-600 font-mono text-[10px] border border-dashed border-slate-800 rounded-xl">
                            <p>Gelanggang Standby.</p>
                            <p className="text-[9px] text-slate-500 mt-1">Aktifkan atlet dengan menekan tombol <strong className="text-indigo-400">TAMPIL</strong> pada daftar di bawah.</p>
                          </div>
                        )}`;

const newStandby = `                        ) : (
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
                        )}`;

code = code.replace(targetStandby, newStandby);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched next buttons in Live Display!");
