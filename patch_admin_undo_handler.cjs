const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const target = `  const handleNextPartai = async (arena: number) => {
    try {
      const res = await fetch(\`/api/arena/\${arena}/next\`, { method: "POST" });
      if (res.ok) {
        await fetchInitialData(3, 1500, true);
      }
    } catch (err) {
      console.error("Gagal lanjut partai berikutnya:", err);
    }
  };`;

const replacement = `  const handleUndoPartai = async (arena: number) => {
    try {
      const res = await fetch(\`/api/arena/\${arena}/undo\`, { method: "POST" });
      if (res.ok) {
        await fetchInitialData(3, 1500, true);
      }
    } catch (err) {
      console.error("Gagal undo partai:", err);
    }
  };

  const handleNextPartai = async (arena: number) => {
    try {
      const res = await fetch(\`/api/arena/\${arena}/next\`, { method: "POST" });
      if (res.ok) {
        await fetchInitialData(3, 1500, true);
      }
    } catch (err) {
      console.error("Gagal lanjut partai berikutnya:", err);
    }
  };`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched handler");
