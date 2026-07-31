const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetGet = `    const result = await pgPool.query("SELECT id, username FROM operator_users");`;
const replacementGet = `    const result = await pgPool.query("SELECT id, username, token FROM operator_users");`;
code = code.replace(targetGet, replacementGet);

const targetPut = `app.put("/api/admin/operators/:id/password", async (req, res) => {`;
const replacementPut = `app.post("/api/admin/operators/:id/logout", async (req, res) => {
  try {
    if (!pgPool) return res.status(200).json({ error: "Database not connected", is_500: true });
    await pgPool.query("UPDATE operator_users SET token = NULL WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) { res.status(200).json({ error: error.message, is_500: true }); }
});

app.put("/api/admin/operators/:id/password", async (req, res) => {`;
code = code.replace(targetPut, replacementPut);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts for operator logout");
