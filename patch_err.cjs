const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');

code = code.replace(
  'console.error("Gagal memuat pengumuman:", err);',
  'if (err.message !== "Failed to fetch") console.error("Gagal memuat pengumuman:", err);'
);

code = code.replace(
  'console.error("Gagal memproses timeout otomatis di display:", err);',
  'if (err.message !== "Failed to fetch") console.error("Gagal memproses timeout otomatis di display:", err);'
);

code = code.replace(
  'console.error("Gagal memperbarui pesilat secara real-time:", err);',
  'if (err.message !== "Failed to fetch") console.error("Gagal memperbarui pesilat secara real-time:", err);'
);

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
