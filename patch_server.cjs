const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetCode = `    if (currentIndex !== -1) {
      // Find the first match in the same arena after the current one that is not done and not playing
      const nextMatch = arenaMatches.slice(currentIndex + 1).find(m => !m.is_done && !m.is_playing);
      if (nextMatch) {
        await updatePesilat(nextMatch.id, { is_playing: true, timer_running: true, timer_last_updated_at: Date.now(), is_done: false, timer_seconds_left: nextMatch.timer_seconds_left || nextMatch.timer_duration || 180 });
      }
    }`;

const replacementCode = `    if (req.query.autoNext !== "false" && currentIndex !== -1) {
      // Find the first match in the same arena after the current one that is not done and not playing
      const nextMatch = arenaMatches.slice(currentIndex + 1).find(m => !m.is_done && !m.is_playing);
      if (nextMatch) {
        await updatePesilat(nextMatch.id, { is_playing: true, timer_running: true, timer_last_updated_at: Date.now(), is_done: false, timer_seconds_left: nextMatch.timer_seconds_left || nextMatch.timer_duration || 180 });
      }
    }`;

code = code.replace(targetCode, replacementCode);

const newApi = `
app.post("/api/arena/:arena/next", async (req, res) => {
  try {
    const arenaNum = parseInt(req.params.arena, 10);
    const all = await getPesilats();
    const arenaMatches = all.filter(match => Number(match.arena) === arenaNum);
    
    // Find currently playing
    const currentPlaying = arenaMatches.find(m => m.is_playing);
    let currentIndex = -1;
    
    if (currentPlaying) {
       await updatePesilat(currentPlaying.id, { is_playing: false, timer_running: false, is_done: true, timer_seconds_left: 0 });
       currentIndex = arenaMatches.findIndex(m => m.id === currentPlaying.id);
    }
    
    // Find next match
    let nextMatch;
    if (currentIndex !== -1) {
       nextMatch = arenaMatches.slice(currentIndex + 1).find(m => !m.is_done && !m.is_playing);
    } else {
       nextMatch = arenaMatches.find(m => !m.is_done && !m.is_playing);
    }
    
    if (nextMatch) {
       await updatePesilat(nextMatch.id, { is_playing: true, timer_running: true, timer_last_updated_at: Date.now(), is_done: false, timer_seconds_left: nextMatch.timer_seconds_left || nextMatch.timer_duration || 180 });
    }
    
    res.json({ success: true });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.listen(`;

code = code.replace('app.listen(', newApi);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts!");
