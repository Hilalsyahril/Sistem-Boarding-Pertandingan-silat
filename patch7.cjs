const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const newApi = `
app.put("/api/pesilat/timer-all", async (req, res) => {
  try {
    const { timer_running } = req.body;
    if (pgPool) {
      if (timer_running) {
        await pgPool.query(
          "UPDATE pesilat SET timer_running = true, timer_last_updated_at = $1 WHERE is_playing = true",
          [Date.now()]
        );
      } else {
        await pgPool.query(
          "UPDATE pesilat SET timer_running = false WHERE is_playing = true"
        );
      }
    }
    res.json({ success: true });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.delete("/api/pesilat/:id", async (req, res) => {`;

code = code.replace('app.delete("/api/pesilat/:id", async (req, res) => {', newApi);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts!");
