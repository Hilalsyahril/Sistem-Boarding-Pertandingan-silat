const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regex = /Simpan Pengaturan Arena\s*<\/button>\s*<\/form>\s*<\/div>\s*\)\}\s*\{\/\* Tab 3: KELOLA OPERATOR \*\//;
const replacement = `Simpan Pengaturan Arena
              </button>
            </form>
            <div className="mt-8 border-t border-slate-800 pt-6">
              <h3 className="text-sm font-black text-white font-display tracking-wider mb-2">Build Deployment CPanel</h3>
              <p className="text-xs text-slate-400 mb-4">Download file ZIP untuk diupload ke server CPanel (file akan selalu berisi build terbaru).</p>
              <a 
                href="/deploy_cpanel.zip" 
                download
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition duration-200"
              >
                <Download className="w-4 h-4" /> Download deploy_cpanel.zip
              </a>
            </div>
          </div>
        )}

        {/* Tab 3: KELOLA OPERATOR */`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Button injected!");
