const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /app\.post\("\/api\/pesilat\/batch", async \(req, res\) => \{[\s\S]*?\}\);\s*\}\s*res\.json\(\{ success: true, count: items\.length \}\);\s*\} catch \(error: any\) \{ res\.status\(200\)\.json\(\{ error: error\.message, is_500: true \}\); \}\s*\}\);/m;

const replacement = `app.post("/api/pesilat/batch", async (req, res) => {
  try {
    const { items } = req.body;
    const existingPesilats = await getPesilats();
    let insertedCount = 0;
    
    for (const item of items) {
      // Pengecekan krusial: Nomor Partai, Sudut Biru, Sudut Merah, Kelas, Arena
      const isDuplicate = existingPesilats.some(ep => 
        String(ep.nomor_partai).trim().toLowerCase() === String(item.nomor_partai).trim().toLowerCase() &&
        String(ep.nama_pesilat).trim().toLowerCase() === String(item.nama_pesilat).trim().toLowerCase() &&
        String(ep.nama_pesilat_biru).trim().toLowerCase() === String(item.nama_pesilat_biru).trim().toLowerCase() &&
        String(ep.kelas).trim().toLowerCase() === String(item.kelas).trim().toLowerCase() &&
        String(ep.arena).trim().toLowerCase() === String(item.arena).trim().toLowerCase()
      );
      
      if (!isDuplicate) {
        await insertPesilat({ ...item, id: item.id || Date.now().toString() + Math.random().toString(), timer_last_updated_at: Date.now() });
        insertedCount++;
      }
    }
    res.json({ success: true, count: insertedCount, skipped: items.length - insertedCount });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});`;

// Because the regex might fail if it's slightly different, let's just do a string replace of the function body
const oldBatchFunc = `app.post("/api/pesilat/batch", async (req, res) => {
  try {
    const { items } = req.body;
    for (const item of items) {
      await insertPesilat({ ...item, id: item.id || Date.now().toString() + Math.random().toString(), timer_last_updated_at: Date.now() });
    }
    res.json({ success: true, count: items.length });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});`;

if (code.includes(oldBatchFunc)) {
  code = code.replace(oldBatchFunc, replacement);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts batch API");
} else {
  console.log("Could not find the exact batch API function in server.ts");
}
