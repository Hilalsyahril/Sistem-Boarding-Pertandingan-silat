const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const handleTimerAllCode = `
  const handleTimerAll = async (timer_running: boolean) => {
    try {
      const res = await fetch("/api/pesilat/timer-all", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timer_running })
      });
      if (res.ok) {
        await fetchInitialData(3, 1500, true);
      }
    } catch (err) {
      console.error("Gagal mengupdate timer all:", err);
    }
  };

  const handleSubmitPesilat`;

code = code.replace('  const handleSubmitPesilat', handleTimerAllCode);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx part 1!");
