const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf-8');
const target = `    // Find the last finished match
    const lastDoneMatch = arenaMatches.find(m => m.is_done);

    if (currentPlaying) {
       // Revert currently playing to queue
       await updatePesilat(currentPlaying.id, { is_playing: false, timer_running: false, is_done: false });
    }
    
    if (lastDoneMatch) {
       // Set last done match back to playing
       await updatePesilat(lastDoneMatch.id, { is_playing: true, timer_running: false, timer_last_updated_at: Date.now(), is_done: false });
    }`;

const replacement = `    // Find the last finished match
    const lastDoneMatch = arenaMatches.find(m => m.is_done);
    const pengaturan = await getPengaturanArena();
    const autoNext = pengaturan.auto_next !== undefined ? pengaturan.auto_next : true;

    if (currentPlaying) {
       // Revert currently playing to queue
       await updatePesilat(currentPlaying.id, { is_playing: false, timer_running: false, is_done: false });
    }
    
    if (lastDoneMatch) {
       // Set last done match back to playing
       await updatePesilat(lastDoneMatch.id, { is_playing: true, timer_running: autoNext, timer_last_updated_at: Date.now(), is_done: false });
    }`;
code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts for undo");
