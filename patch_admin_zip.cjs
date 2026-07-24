const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const target = `                    {/* Download Template Button */}
                    <button
                      onClick={handleDownloadTemplate}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      title="Unduh Template File Excel"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Template Excel</span>
                    </button>`;

const replacement = `                    {/* Download Template Button */}
                    <button
                      onClick={handleDownloadTemplate}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      title="Unduh Template File Excel"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Template Excel</span>
                    </button>

                    {/* Download cPanel Build Button */}
                    <a
                      href="/api/download-zip"
                      download="deploy_cpanel.zip"
                      className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 rounded-xl text-emerald-300 hover:text-emerald-100 transition text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      title="Unduh file siap deploy ke cPanel"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Download cPanel ZIP</span>
                    </a>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx");
