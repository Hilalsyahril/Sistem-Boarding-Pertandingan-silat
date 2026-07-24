const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
const target = `app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));`;
const replacement = `app.get("*", (req, res) => {
      const p1 = path.join(distPath, "index.html");
      const p2 = path.join(distPath, "dist", "index.html");
      const p3 = path.join(process.cwd(), "dist", "index.html");
      const p4 = path.join(process.cwd(), "index.html");
      if (fs.existsSync(p1)) return res.sendFile(p1);
      if (fs.existsSync(p2)) return res.sendFile(p2);
      if (fs.existsSync(p3)) return res.sendFile(p3);
      if (fs.existsSync(p4)) return res.sendFile(p4);
      res.status(404).send("index.html not found");
    });`;
code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched index.html fallback");
