const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const target = `app.put("/api/pesilat/:id/timeout", async (req, res) => {
  try {
    const id = req.params.id;
    const p = await getPesilatById(id);
    if (!p) return res.status(404).json({ error: "Not found" });

    if (!p.is_playing) {
      return res.json(p);
    }

    await updatePesilat(id, { is_playing: false, timer_running: false, is_done: true, timer_seconds_left: 0 });

    const all = await getPesilats();`;

  const replacement = `app.put("/api/pesilat/:id/timeout", async (req, res) => {
  try {
    const id = req.params.id;
    
    if (!pgPool) return res.status(500).json({ error: "Database not connected" });
    
    // Atomic check-and-set to prevent race conditions from multiple clients triggering timeout concurrently
    const updateRes = await pgPool.query(
      "UPDATE pesilat SET is_playing = false, timer_running = false, is_done = true, timer_seconds_left = 0 WHERE id = $1 AND is_playing = true RETURNING *",
      [id]
    );

    if (updateRes.rowCount === 0) {
      // Already processed or not playing
      const currentP = await getPesilatById(id);
      if (!currentP) return res.status(404).json({ error: "Not found" });
      return res.json(currentP);
    }

    const p = mapPesilat(updateRes.rows[0]);

    const all = await getPesilats();`;
    
  if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log("Patched successfully!");
  } else {
    console.log("Target not found!");
  }
  
  fs.writeFileSync(file, code);
}

patchFile('server.ts');
