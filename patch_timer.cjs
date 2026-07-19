const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // In AdminDashboard.tsx
  if (file.includes('AdminDashboard')) {
    code = code.replace(/is_playing: true, timer_running: false, is_done: false/g, 'is_playing: true, timer_running: true, is_done: false');
  }

  // In server.ts
  if (file.includes('server.ts')) {
    const playTarget = `    await updatePesilat(id, { 
      is_playing: true, 
      timer_running: false, 
      timer_last_updated_at: Date.now(), 
      is_done: false,
      timer_seconds_left: p.timer_seconds_left || p.timer_duration || 180
    });`;
    const playReplacement = `    await updatePesilat(id, { 
      is_playing: true, 
      timer_running: true, 
      timer_last_updated_at: Date.now(), 
      is_done: false,
      timer_seconds_left: p.timer_seconds_left || p.timer_duration || 180
    });`;
    if (code.includes(playTarget)) code = code.replace(playTarget, playReplacement);

    const timeoutTarget = `      await updatePesilat(nextMatch.id, { is_playing: true, timer_running: false, is_done: false, timer_seconds_left: nextMatch.timer_seconds_left || nextMatch.timer_duration || 180 });`;
    const timeoutReplacement = `      await updatePesilat(nextMatch.id, { is_playing: true, timer_running: true, is_done: false, timer_seconds_left: nextMatch.timer_seconds_left || nextMatch.timer_duration || 180 });`;
    if (code.includes(timeoutTarget)) code = code.replace(timeoutTarget, timeoutReplacement);
  }
  
  fs.writeFileSync(file, code);
}

patchFile('src/components/AdminDashboard.tsx');
patchFile('server.ts');
