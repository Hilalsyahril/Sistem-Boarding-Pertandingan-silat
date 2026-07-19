const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const target = `    const p = await getPesilatById(id);
    if (!p) return res.status(404).json({ error: "Not found" });

    await updatePesilat(id, { is_playing: false, timer_running: false, is_done: true, timer_seconds_left: 0 });`;

  const replacement = `    const p = await getPesilatById(id);
    if (!p) return res.status(404).json({ error: "Not found" });

    if (!p.is_playing) {
      return res.json(p);
    }

    await updatePesilat(id, { is_playing: false, timer_running: false, is_done: true, timer_seconds_left: 0 });`;
    
  if (code.includes(target)) {
    code = code.replace(target, replacement);
  }
  
  fs.writeFileSync(file, code);
}

patchFile('server.ts');
