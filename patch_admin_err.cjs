const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  'console.error("Gagal memproses timeout:", err);',
  'if (err.message !== "Failed to fetch") console.error("Gagal memproses timeout:", err);'
);

code = code.replace(
  'console.error("Gagal mengirim pengumuman", err);',
  'if (err.message !== "Failed to fetch") console.error("Gagal mengirim pengumuman", err);'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
