const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const target1 = `                              {/* Sudut Biru vs Sudut Merah display */}
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
                              </div>`;

const replacement1 = `                              {/* Sudut Biru vs Sudut Merah display */}
                              <div className={\`grid \${activePesilat.nama_pesilat_biru && activePesilat.nama_pesilat ? 'grid-cols-2' : 'grid-cols-1'} gap-2 text-center text-xs mt-3\`}>
                                {activePesilat.nama_pesilat_biru && (
                                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-200">
                                    <p className="font-mono text-[9px] text-blue-400 font-bold tracking-widest uppercase mb-0.5">BIRU</p>
                                    <p className="font-black truncate text-xs">{activePesilat.nama_pesilat_biru}</p>
                                    <p className="text-[9px] text-blue-300/70 truncate mt-0.5 font-medium">{activePesilat.kontingen_biru}</p>
                                  </div>
                                )}
                                {activePesilat.nama_pesilat && (
                                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-200">
                                    <p className="font-mono text-[9px] text-red-400 font-bold tracking-widest uppercase mb-0.5">MERAH</p>
                                    <p className="font-black truncate text-xs">{activePesilat.nama_pesilat}</p>
                                    <p className="text-[9px] text-red-300/70 truncate mt-0.5 font-medium">{activePesilat.kontingen}</p>
                                  </div>
                                )}
                              </div>`;

const target2 = `                                  {/* Merah Corner */}
                                  <div className={\`flex items-center gap-1 min-w-0 \${p.nama_pesilat_biru ? "border-t border-slate-800/50 pt-1" : ""}\`}>
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                                    <span className="font-bold text-white uppercase truncate text-[11px] sm:text-xs block max-w-[80px] xs:max-w-[120px] sm:max-w-none">{p.nama_pesilat}</span>
                                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate shrink-0">({p.kontingen})</span>
                                  </div>`;

const replacement2 = `                                  {/* Merah Corner */}
                                  {p.nama_pesilat && (
                                    <div className={\`flex items-center gap-1 min-w-0 \${p.nama_pesilat_biru ? "border-t border-slate-800/50 pt-1" : ""}\`}>
                                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                                      <span className="font-bold text-white uppercase truncate text-[11px] sm:text-xs block max-w-[80px] xs:max-w-[120px] sm:max-w-none">{p.nama_pesilat}</span>
                                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate shrink-0">({p.kontingen})</span>
                                    </div>
                                  )}`;

let patched = false;
if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
    patched = true;
} else {
    console.log("Could not find target1 in AdminDashboard.tsx");
}

if (code.includes(target2)) {
    code = code.replace(target2, replacement2);
    patched = true;
} else {
    console.log("Could not find target2 in AdminDashboard.tsx");
}

if (patched) {
    fs.writeFileSync('src/components/AdminDashboard.tsx', code);
    console.log("Patched AdminDashboard.tsx successfully");
}
