const fs = require('fs');

let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

const target = `                            {playingPesilat.nama_pesilat_biru ? (
                              /* KATEGORI TANDING: SUDUT BIRU (KIRI) vs SUDUT MERAH (KANAN) DENGAN TIMER DI TENGAH */
                              <div className="grid grid-cols-12 gap-1 sm:gap-2 items-center">
                                
                                {/* Kiri: Sudut Biru */}
                                <div className={\`col-span-5 bg-blue-600/10 \${layout.competitorPadding} border-blue-600 rounded-r-lg min-w-0 shadow-md\`}>
                                  <span className="text-blue-400 font-mono text-[7px] sm:text-[9px] font-black uppercase tracking-widest block mb-0.5">
                                    Biru
                                  </span>
                                  <h4 className={\`\${layout.competitorText} text-white uppercase truncate font-display leading-tight\`}>
                                    {playingPesilat.nama_pesilat_biru}
                                  </h4>
                                  <p className="text-[8px] sm:text-[10px] text-blue-200/80 font-bold mt-0.5 truncate uppercase tracking-wider font-mono">
                                    {playingPesilat.kontingen_biru}
                                  </p>
                                </div>

                                {/* Tengah: Timer */}
                                <div className="col-span-2 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-lg py-1 px-0.5 text-center min-w-[40px]">
                                  {autoNextMatch ? (
                                    <>
                                      <div className={\`font-mono \${layout.timerText} font-black leading-none \${
                                        playingPesilat.timer_seconds_left <= 10 && playingPesilat.timer_running
                                          ? "text-red-500 animate-pulse drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                                          : "text-emerald-400"
                                      }\`}>
                                        {Math.floor(playingPesilat.timer_seconds_left / 60).toString().padStart(2, "0")}
                                        :
                                        {(playingPesilat.timer_seconds_left % 60).toString().padStart(2, "0")}
                                      </div>
                                      <span className="text-[5px] sm:text-[6px] text-slate-500 font-mono font-bold uppercase tracking-wider scale-90 mt-0.5">
                                        {playingPesilat.timer_running ? "RUN" : "PAUSE"}
                                      </span>
                                    </>
                                  ) : (
                                    <div className={\`font-mono \${layout.timerText} font-black text-slate-600 leading-none\`}>
                                      VS
                                    </div>
                                  )}
                                </div>

                                {/* Kanan: Sudut Merah */}
                                <div className={\`col-span-5 bg-red-600/10 \${layout.competitorPadding} border-red-600 rounded-l-lg min-w-0 text-right shadow-md\`}>
                                  <span className="text-red-400 font-mono text-[7px] sm:text-[9px] font-black uppercase tracking-widest block mb-0.5">
                                    Merah
                                  </span>
                                  <h4 className={\`\${layout.competitorText} text-white uppercase truncate font-display leading-tight\`}>
                                    {playingPesilat.nama_pesilat}
                                  </h4>
                                  <p className="text-[8px] sm:text-[10px] text-red-200/80 font-bold mt-0.5 truncate uppercase tracking-wider font-mono">
                                    {playingPesilat.kontingen}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              /* KATEGORI TUNGGAL/SENI/SOLO: ATLET UTAMA DENGAN TIMER DI KANAN */
                              <div className="grid grid-cols-12 gap-1 sm:gap-2 items-center">
                                
                                {/* Kiri/Tengah: Detail Atlet */}
                                <div className={\`\${autoNextMatch ? 'col-span-9' : 'col-span-12'} bg-indigo-600/10 \${layout.competitorPadding} border-amber-600 rounded-r-lg min-w-0 shadow-md\`}>
                                  <span className="text-indigo-400 font-mono text-[7px] sm:text-[9px] font-black uppercase tracking-widest block mb-0.5">
                                    Pesilat Solo
                                  </span>
                                  <h4 className={\`\${layout.competitorText} text-white uppercase truncate font-display leading-tight\`}>
                                    {playingPesilat.nama_pesilat}
                                  </h4>
                                  <p className="text-[8px] sm:text-[10px] text-indigo-200/80 font-bold mt-0.5 truncate uppercase tracking-wider font-mono">
                                    {playingPesilat.kontingen}
                                  </p>
                                </div>

                                {/* Kanan: Timer */}
                                {autoNextMatch && (
                                  <div className="col-span-3 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-lg py-1 sm:py-2 px-1 text-center">
                                    <div className={\`font-mono \${layout.timerText} font-black leading-none \${
                                      playingPesilat.timer_seconds_left <= 10 && playingPesilat.timer_running
                                        ? "text-red-500 animate-pulse drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                                        : "text-emerald-400"
                                    }\`}>
                                      {Math.floor(playingPesilat.timer_seconds_left / 60).toString().padStart(2, "0")}
                                      :
                                      {(playingPesilat.timer_seconds_left % 60).toString().padStart(2, "0")}
                                    </div>
                                    <span className="text-[5px] sm:text-[7px] text-slate-500 font-mono font-bold uppercase tracking-wider mt-0.5">
                                      {playingPesilat.timer_running ? "RUN" : "PAUSE"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}`;
                            
const replacement = `                            {playingPesilat.nama_pesilat_biru && playingPesilat.nama_pesilat ? (
                              /* KATEGORI TANDING: SUDUT BIRU (KIRI) vs SUDUT MERAH (KANAN) DENGAN TIMER DI TENGAH */
                              <div className="grid grid-cols-12 gap-1 sm:gap-2 items-center">
                                
                                {/* Kiri: Sudut Biru */}
                                <div className={\`col-span-5 bg-blue-600/10 \${layout.competitorPadding} border-blue-600 rounded-r-lg min-w-0 shadow-md\`}>
                                  <span className="text-blue-400 font-mono text-[7px] sm:text-[9px] font-black uppercase tracking-widest block mb-0.5">
                                    Biru
                                  </span>
                                  <h4 className={\`\${layout.competitorText} text-white uppercase truncate font-display leading-tight\`}>
                                    {playingPesilat.nama_pesilat_biru}
                                  </h4>
                                  <p className="text-[8px] sm:text-[10px] text-blue-200/80 font-bold mt-0.5 truncate uppercase tracking-wider font-mono">
                                    {playingPesilat.kontingen_biru}
                                  </p>
                                </div>

                                {/* Tengah: Timer */}
                                <div className="col-span-2 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-lg py-1 px-0.5 text-center min-w-[40px]">
                                  {autoNextMatch ? (
                                    <>
                                      <div className={\`font-mono \${layout.timerText} font-black leading-none \${
                                        playingPesilat.timer_seconds_left <= 10 && playingPesilat.timer_running
                                          ? "text-red-500 animate-pulse drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                                          : "text-emerald-400"
                                      }\`}>
                                        {Math.floor(playingPesilat.timer_seconds_left / 60).toString().padStart(2, "0")}
                                        :
                                        {(playingPesilat.timer_seconds_left % 60).toString().padStart(2, "0")}
                                      </div>
                                      <span className="text-[5px] sm:text-[6px] text-slate-500 font-mono font-bold uppercase tracking-wider scale-90 mt-0.5">
                                        {playingPesilat.timer_running ? "RUN" : "PAUSE"}
                                      </span>
                                    </>
                                  ) : (
                                    <div className={\`font-mono \${layout.timerText} font-black text-slate-600 leading-none\`}>
                                      VS
                                    </div>
                                  )}
                                </div>

                                {/* Kanan: Sudut Merah */}
                                <div className={\`col-span-5 bg-red-600/10 \${layout.competitorPadding} border-red-600 rounded-l-lg min-w-0 text-right shadow-md\`}>
                                  <span className="text-red-400 font-mono text-[7px] sm:text-[9px] font-black uppercase tracking-widest block mb-0.5">
                                    Merah
                                  </span>
                                  <h4 className={\`\${layout.competitorText} text-white uppercase truncate font-display leading-tight\`}>
                                    {playingPesilat.nama_pesilat}
                                  </h4>
                                  <p className="text-[8px] sm:text-[10px] text-red-200/80 font-bold mt-0.5 truncate uppercase tracking-wider font-mono">
                                    {playingPesilat.kontingen}
                                  </p>
                                </div>
                              </div>
                            ) : playingPesilat.nama_pesilat_biru ? (
                              /* SOLO BIRU */
                              <div className="grid grid-cols-12 gap-1 sm:gap-2 items-center">
                                {/* Kiri/Tengah: Detail Atlet Biru */}
                                <div className={\`\${autoNextMatch ? 'col-span-9' : 'col-span-12'} bg-blue-600/10 \${layout.competitorPadding} border-blue-600 rounded-r-lg min-w-0 shadow-md\`}>
                                  <span className="text-blue-400 font-mono text-[7px] sm:text-[9px] font-black uppercase tracking-widest block mb-0.5">
                                    Pesilat Biru
                                  </span>
                                  <h4 className={\`\${layout.competitorText} text-white uppercase truncate font-display leading-tight\`}>
                                    {playingPesilat.nama_pesilat_biru}
                                  </h4>
                                  <p className="text-[8px] sm:text-[10px] text-blue-200/80 font-bold mt-0.5 truncate uppercase tracking-wider font-mono">
                                    {playingPesilat.kontingen_biru}
                                  </p>
                                </div>
                                {/* Kanan: Timer */}
                                {autoNextMatch && (
                                  <div className="col-span-3 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-lg py-1 sm:py-2 px-1 text-center">
                                    <div className={\`font-mono \${layout.timerText} font-black leading-none \${
                                      playingPesilat.timer_seconds_left <= 10 && playingPesilat.timer_running
                                        ? "text-red-500 animate-pulse drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                                        : "text-emerald-400"
                                    }\`}>
                                      {Math.floor(playingPesilat.timer_seconds_left / 60).toString().padStart(2, "0")}
                                      :
                                      {(playingPesilat.timer_seconds_left % 60).toString().padStart(2, "0")}
                                    </div>
                                    <span className="text-[5px] sm:text-[7px] text-slate-500 font-mono font-bold uppercase tracking-wider mt-0.5">
                                      {playingPesilat.timer_running ? "RUN" : "PAUSE"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* SOLO MERAH */
                              <div className="grid grid-cols-12 gap-1 sm:gap-2 items-center">
                                {/* Kiri/Tengah: Detail Atlet Merah */}
                                <div className={\`\${autoNextMatch ? 'col-span-9' : 'col-span-12'} bg-red-600/10 \${layout.competitorPadding} border-red-600 rounded-r-lg min-w-0 shadow-md\`}>
                                  <span className="text-red-400 font-mono text-[7px] sm:text-[9px] font-black uppercase tracking-widest block mb-0.5">
                                    Pesilat Merah
                                  </span>
                                  <h4 className={\`\${layout.competitorText} text-white uppercase truncate font-display leading-tight\`}>
                                    {playingPesilat.nama_pesilat}
                                  </h4>
                                  <p className="text-[8px] sm:text-[10px] text-red-200/80 font-bold mt-0.5 truncate uppercase tracking-wider font-mono">
                                    {playingPesilat.kontingen}
                                  </p>
                                </div>
                                {/* Kanan: Timer */}
                                {autoNextMatch && (
                                  <div className="col-span-3 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-lg py-1 sm:py-2 px-1 text-center">
                                    <div className={\`font-mono \${layout.timerText} font-black leading-none \${
                                      playingPesilat.timer_seconds_left <= 10 && playingPesilat.timer_running
                                        ? "text-red-500 animate-pulse drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                                        : "text-emerald-400"
                                    }\`}>
                                      {Math.floor(playingPesilat.timer_seconds_left / 60).toString().padStart(2, "0")}
                                      :
                                      {(playingPesilat.timer_seconds_left % 60).toString().padStart(2, "0")}
                                    </div>
                                    <span className="text-[5px] sm:text-[7px] text-slate-500 font-mono font-bold uppercase tracking-wider mt-0.5">
                                      {playingPesilat.timer_running ? "RUN" : "PAUSE"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/PublicDisplay.tsx', code);
    console.log("Patched PublicDisplay.tsx successfully");
} else {
    console.log("Could not find target in PublicDisplay.tsx");
}
