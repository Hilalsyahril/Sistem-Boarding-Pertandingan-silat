const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const target = `        }).filter(item => item.nama_pesilat && item.kontingen); // Filter yang minimal punya nama merah & kontingen merah

        if (mappedItems.length === 0) {
          throw new Error("Format kolom Excel tidak cocok atau tidak ada baris data valid (kolom 'Sudut Merah (Nama Pesilat)' dan 'Sudut Merah (Kontingen)' wajib diisi).");
        }`;

const replacement = `        }).filter(item => item.nama_pesilat || item.nama_pesilat_biru);

        if (mappedItems.length === 0) {
          throw new Error("Format kolom Excel tidak cocok atau tidak ada baris data valid (salah satu nama atlet harus diisi).");
        }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/AdminDashboard.tsx', code);
    console.log("Patched import logic successfully");
} else {
    console.log("Could not find target in AdminDashboard.tsx");
}
