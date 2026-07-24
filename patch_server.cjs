const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /const updateRes = await pgPool\.query\([\s\S]*?"UPDATE pesilat SET is_playing = false, timer_running = false, is_done = true, timer_seconds_left = 0 WHERE id = \$1 AND is_playing = true RETURNING \*",[\s\S]*?\[id\][\s\S]*?\);/;

const newLogic = `
    const autoNext = req.query.autoNext !== "false";
    let queryStr = "";
    if (autoNext) {
      queryStr = "UPDATE pesilat SET is_playing = false, timer_running = false, is_done = true, timer_seconds_left = 0 WHERE id = $1 AND is_playing = true RETURNING *";
    } else {
      queryStr = "UPDATE pesilat SET timer_running = false, timer_seconds_left = 0 WHERE id = $1 AND is_playing = true RETURNING *";
    }
    const updateRes = await pgPool.query(queryStr, [id]);
`;

code = code.replace(regex, newLogic);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
