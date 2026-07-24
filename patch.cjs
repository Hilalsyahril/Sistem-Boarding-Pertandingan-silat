const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');
code = code.replace(
  '{activePesilat.timer_running ? <><Pause className="w-3.5 h-3.5" /> Jeda</span></> : <><Play className="w-3.5 h-3.5" /> Mulai</span></>}',
  '{activePesilat.timer_running ? <><Pause className="w-3.5 h-3.5" /><span className="text-xs font-semibold ml-1">Jeda</span></> : <><Play className="w-3.5 h-3.5" /><span className="text-xs font-semibold ml-1">Mulai</span></>}'
);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
