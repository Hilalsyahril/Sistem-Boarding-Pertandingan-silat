const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const targetButtons = `<div className="flex gap-2 w-full sm:w-auto">
                     <button onClick={() => handleTimerAll(false)} className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-colors">Matikan Timer All</button>
                     <button onClick={() => handleTimerAll(true)} className="flex-1 sm:flex-none bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[10px] px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-colors">Nyalakan Timer All</button>
                  </div>`;

const newSwitch = `<div className="flex items-center gap-3 w-full sm:w-auto bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Auto Next Partai by Timer</span>
                    <button 
                      onClick={toggleAutoNextMatch}
                      className={\`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none \${autoNextMatch ? 'bg-emerald-500' : 'bg-slate-700'}\`}
                    >
                      <span className={\`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform \${autoNextMatch ? 'translate-x-4' : 'translate-x-1'}\`} />
                    </button>
                  </div>`;

code = code.replace(targetButtons, newSwitch);

const nextPartaiFunc = `  const handleNextPartai = async (arena: number) => {
    try {
      const res = await fetch(\`/api/arena/\${arena}/next\`, { method: "POST" });
      if (res.ok) {
        await fetchInitialData(3, 1500, true);
      }
    } catch (err) {
      console.error("Gagal lanjut partai berikutnya:", err);
    }
  };

  const handleTimerAll =`;
  
code = code.replace('  const handleTimerAll =', nextPartaiFunc);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched buttons and next partai func!");
