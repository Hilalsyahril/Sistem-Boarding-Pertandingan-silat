const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const targetCode = `<div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                  <Tv className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="text-sm font-black text-white font-display uppercase tracking-wider">
                      Panel Kontrol Gelanggang Aktif (Live Display)
                    </h4>
                    <p className="text-[10px] text-slate-400">Kelola dan pantau partai yang sedang tampil secara langsung</p>
                  </div>
                </div>`;

const replacementCode = `<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-black text-white font-display uppercase tracking-wider">
                        Panel Kontrol Gelanggang Aktif (Live Display)
                      </h4>
                      <p className="text-[10px] text-slate-400">Kelola dan pantau partai yang sedang tampil secara langsung</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                     <button onClick={() => handleTimerAll(false)} className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-colors">Matikan Timer All</button>
                     <button onClick={() => handleTimerAll(true)} className="flex-1 sm:flex-none bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[10px] px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-colors">Nyalakan Timer All</button>
                  </div>
                </div>`;

code = code.replace(targetCode, replacementCode);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx part 2!");
