const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'await updatePesilat(nextMatch.id, { is_playing: true, timer_running: false, is_done: false });',
  'await updatePesilat(nextMatch.id, { is_playing: true, timer_running: false, is_done: false, timer_seconds_left: nextMatch.timer_seconds_left || nextMatch.timer_duration || 180 });'
);

fs.writeFileSync('server.ts', code);
