const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');
const target = `{/* Export Excel Button */}`;
const replacement = `                    {/* Download cPanel Build Button */}
                    <a
                      href="/deploy_cpanel.zip"
                      download="deploy_cpanel.zip"
                      className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-800 rounded-xl text-amber-300 hover:text-amber-100 transition text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      title="Unduh file siap deploy ke cPanel"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Download cPanel</span>
                    </a>
                    
                    {/* Export Excel Button */}`;
code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Restored button");
