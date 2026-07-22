const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `                <div className="flex items-center gap-3">
                    type="number"
                    min={1}
                    max={12}
                    value={inputJumlahArena}
                    onChange={(e) => setInputJumlahArena(parseInt(e.target.value) || 1)}
                    className="w-24 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-center font-bold text-lg text-white rounded-xl py-2.5 outline-none transition"
                  />
                  <div className="flex items-center gap-3"><input type="number" min={1} max={12} value={inputJumlahArena} onChange={(e) => setInputJumlahArena(parseInt(e.target.value) || 1)} className="w-24 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-center font-bold text-lg text-white rounded-xl py-2.5 outline-none transition" /><div className="text-xs text-slate-400">`;

const replacement = `                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={inputJumlahArena}
                    onChange={(e) => setInputJumlahArena(parseInt(e.target.value) || 1)}
                    className="w-24 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-center font-bold text-lg text-white rounded-xl py-2.5 outline-none transition"
                  />
                  <div className="text-xs text-slate-400">`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', content);
