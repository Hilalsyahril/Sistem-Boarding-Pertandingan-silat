const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const timeoutRoute = `app.put("/api/pesilat/:id/timeout", async (req, res) => {
  try {
    const id = req.params.id;
    const p = await getPesilatById(id);
    if (!p) return res.status(404).json({ error: "Not found" });

    await updatePesilat(id, { is_playing: false, timer_running: false, is_done: true, timer_seconds_left: 0 });

    const all = await getPesilats();
    const arenaMatches = all.filter(match => match.arena === p.arena);
    const currentIndex = arenaMatches.findIndex(match => match.id === id);
    if (currentIndex !== -1 && currentIndex + 1 < arenaMatches.length) {
      const nextMatch = arenaMatches[currentIndex + 1];
      await updatePesilat(nextMatch.id, { is_playing: true, timer_running: false, is_done: false });
    }

    res.json(await getPesilatById(id));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});`;

code = code.replace(/app\.put\("\/api\/pesilat\/:id\/timeout", async \(req, res\) => \{[\s\S]*?\}\);/, timeoutRoute);

fs.writeFileSync('server.ts', code);
