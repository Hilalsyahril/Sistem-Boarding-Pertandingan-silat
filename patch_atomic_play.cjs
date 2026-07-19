const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const target = `    const all = await getPesilats();
    for (const other of all) {
      if (Number(other.arena) === Number(p.arena) && other.id !== id && other.is_playing) {
        await updatePesilat(other.id, { is_playing: false, timer_running: false, is_done: true });
      }
    }
    
    await updatePesilat(id, { 
      is_playing: true, 
      timer_running: true, 
      timer_last_updated_at: Date.now(), 
      is_done: false,
      timer_seconds_left: p.timer_seconds_left || p.timer_duration || 180
    });`;

  const replacement = `    // Atomically set all other matches in this arena to not playing
    if (pgPool) {
      await pgPool.query(
        "UPDATE pesilat SET is_playing = false, timer_running = false, is_done = true WHERE arena = $1 AND id != $2 AND is_playing = true",
        [p.arena, id]
      );
    }
    
    await updatePesilat(id, { 
      is_playing: true, 
      timer_running: true, 
      timer_last_updated_at: Date.now(), 
      is_done: false,
      timer_seconds_left: p.timer_seconds_left || p.timer_duration || 180
    });`;
    
  if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log("Patched successfully!");
  } else {
    console.log("Target not found!");
  }
  
  fs.writeFileSync(file, code);
}

patchFile('server.ts');
