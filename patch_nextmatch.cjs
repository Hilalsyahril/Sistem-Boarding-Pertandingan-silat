const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const target = `    const arenaMatches = all.filter(match => match.arena === p.arena);
    const currentIndex = arenaMatches.findIndex(match => match.id === id);
    if (currentIndex !== -1 && currentIndex + 1 < arenaMatches.length) {
      const nextMatch = arenaMatches[currentIndex + 1];
      await updatePesilat(nextMatch.id, { is_playing: true, timer_running: true, timer_last_updated_at: Date.now(), is_done: false, timer_seconds_left: nextMatch.timer_seconds_left || nextMatch.timer_duration || 180 });
    }`;

  const replacement = `    const arenaMatches = all.filter(match => match.arena === p.arena);
    const currentIndex = arenaMatches.findIndex(match => match.id === id);
    if (currentIndex !== -1) {
      // Find the first match in the same arena after the current one that is not done and not playing
      const nextMatch = arenaMatches.slice(currentIndex + 1).find(m => !m.is_done && !m.is_playing);
      if (nextMatch) {
        await updatePesilat(nextMatch.id, { is_playing: true, timer_running: true, timer_last_updated_at: Date.now(), is_done: false, timer_seconds_left: nextMatch.timer_seconds_left || nextMatch.timer_duration || 180 });
      }
    }`;
    
  if (code.includes(target)) {
    code = code.replace(target, replacement);
  }
  
  fs.writeFileSync(file, code);
}

patchFile('server.ts');
