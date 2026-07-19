const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const target = `    const all = await getPesilats();
    for (const other of all) {
      if (other.arena === p.arena && other.id !== id && other.is_playing) {
        await updatePesilat(other.id, { is_playing: false, timer_running: false, is_done: true });
      }
    }`;

  const replacement = `    const all = await getPesilats();
    for (const other of all) {
      if (Number(other.arena) === Number(p.arena) && other.id !== id && other.is_playing) {
        await updatePesilat(other.id, { is_playing: false, timer_running: false, is_done: true });
      }
    }`;
    
  if (code.includes(target)) {
    code = code.replace(target, replacement);
  }
  
  fs.writeFileSync(file, code);
}

patchFile('server.ts');
