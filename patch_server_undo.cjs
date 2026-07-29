const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `    if (lastDoneMatch) {
       // Set last done match back to playing
       await updatePesilat(lastDoneMatch.id, { is_playing: true, timer_running: autoNext, timer_last_updated_at: Date.now(), is_done: false });
    }`;

const replacement = `    if (lastDoneMatch) {
       // Set last done match back to playing
       await updatePesilat(lastDoneMatch.id, { is_playing: true, timer_running: autoNext, timer_last_updated_at: Date.now(), is_done: false, timer_seconds_left: lastDoneMatch.timer_duration || 120 });
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched server undo");
