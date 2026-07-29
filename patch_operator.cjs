const fs = require('fs');
let code = fs.readFileSync('src/components/OperatorDashboard.tsx', 'utf-8');

const target = `                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      {activePesilat.kategori !== "Tanding" ? (
                        <div className="col-span-2 bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-lg truncate">
                          <p className="font-black uppercase">{activePesilat.nama_pesilat}</p>
                          <p className="text-[9px] text-indigo-300 font-bold truncate mt-0.5">{activePesilat.kontingen}</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg truncate">
                            <p className="font-black uppercase text-red-100">{activePesilat.nama_pesilat}</p>
                            <p className="text-[9px] text-red-300 font-bold truncate mt-0.5">{activePesilat.kontingen}</p>
                          </div>
                          <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg truncate">
                            <p className="font-black uppercase text-blue-100">{activePesilat.nama_pesilat_biru}</p>
                            <p className="text-[9px] text-blue-300 font-bold truncate mt-0.5">{activePesilat.kontingen_biru}</p>
                          </div>
                        </>
                      )}
                    </div>`;

const replacement = `                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
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
                    </div>`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/OperatorDashboard.tsx', code);
    console.log("Patched OperatorDashboard.tsx successfully");
} else {
    console.log("Could not find target in OperatorDashboard.tsx");
}
