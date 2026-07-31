const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /app\.post\("\/api\/pesilat\/batch", async \(req, res\) => \{[\s\S]*?\}\);\s*\}\s*res\.json\(await getPesilats\(\)\);\s*\} catch \(error: any\) \{ res\.status\(200\)\.json\(\{ error: error\.message, is_500: true \}\); \}\s*\}\);/m;

const replacement = `app.post("/api/pesilat/batch", async (req, res) => {
  try {
    const { items } = req.body;
    for (const item of items) {
      await insertPesilat({ ...item, id: item.id || Date.now().toString() + Math.random().toString(), timer_last_updated_at: Date.now() });
    }
    res.json({ success: true, count: items.length });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
console.log("Fixed server.ts batch API");
