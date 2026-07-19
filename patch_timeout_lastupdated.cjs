const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const timeoutTarget = `      await updatePesilat(nextMatch.id, { is_playing: true, timer_running: true, is_done: false, timer_seconds_left: nextMatch.timer_seconds_left || nextMatch.timer_duration || 180 });`;
  const timeoutReplacement = `      await updatePesilat(nextMatch.id, { is_playing: true, timer_running: true, timer_last_updated_at: Date.now(), is_done: false, timer_seconds_left: nextMatch.timer_seconds_left || nextMatch.timer_duration || 180 });`;
  
  if (code.includes(timeoutTarget)) {
    code = code.replace(timeoutTarget, timeoutReplacement);
  } else {
    console.log("Target not found!");
  }
  
  fs.writeFileSync(file, code);
}

patchFile('server.ts');
