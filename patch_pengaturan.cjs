const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `app.put("/api/pengaturan_arena", async (req, res) => {
  try {
    const autoNext = req.body.auto_next !== undefined ? req.body.auto_next : true;
    await setPengaturanArena(req.body.jumlah_arena || 3, req.body.judul_aplikasi || 'SISTEM BOARDING PENCAK SILAT', autoNext);
    const config = await getPengaturanArena();
    res.json({ id: "00000000-0000-0000-0000-000000000001", ...config });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});`;

const replacement = `app.put("/api/pengaturan_arena", async (req, res) => {
  try {
    const currentConfig = await getPengaturanArena();
    const autoNext = req.body.auto_next !== undefined ? req.body.auto_next : currentConfig.auto_next;
    const jumlahArena = req.body.jumlah_arena !== undefined ? req.body.jumlah_arena : currentConfig.jumlah_arena;
    const judulAplikasi = req.body.judul_aplikasi !== undefined ? req.body.judul_aplikasi : currentConfig.judul_aplikasi;
    
    await setPengaturanArena(jumlahArena, judulAplikasi, autoNext);
    const config = await getPengaturanArena();
    res.json({ id: "00000000-0000-0000-0000-000000000001", ...config });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts pengaturan_arena");
