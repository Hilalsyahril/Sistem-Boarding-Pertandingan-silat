const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const target = `                      <select
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl px-2.5 py-2.5 outline-none transition text-xs sm:text-sm"
                      >
                        {opsiKelas.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>`;

const replacement = `                      <input
                        type="text"
                        list="opsiKelasList"
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl px-2.5 py-2.5 outline-none transition text-xs sm:text-sm"
                        placeholder="Pilih/Ketik Kelas..."
                      />
                      <datalist id="opsiKelasList">
                        {opsiKelas.map((k) => (
                          <option key={k} value={k} />
                        ))}
                      </datalist>`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/AdminDashboard.tsx', code);
    console.log("Patched AdminDashboard.tsx kelas successfully");
} else {
    console.log("Could not find target in AdminDashboard.tsx");
}
