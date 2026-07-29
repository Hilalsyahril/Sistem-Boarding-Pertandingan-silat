const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

const target1 = `<span className="truncate">P-{item.nomor_partai} • {item.nama_pesilat}</span>`;
const replacement1 = `<span className="truncate">P-{item.nomor_partai} • {item.nama_pesilat && item.nama_pesilat_biru ? \`\${item.nama_pesilat} vs \${item.nama_pesilat_biru}\` : item.nama_pesilat || item.nama_pesilat_biru}</span>`;

const target2 = `P-{pesilat.nomor_partai || "00"} • {pesilat.nama_pesilat} {pesilat.nama_pesilat_biru ? \`vs \${pesilat.nama_pesilat_biru}\` : ""}`;
const replacement2 = `P-{pesilat.nomor_partai || "00"} • {pesilat.nama_pesilat && pesilat.nama_pesilat_biru ? \`\${pesilat.nama_pesilat} vs \${pesilat.nama_pesilat_biru}\` : pesilat.nama_pesilat || pesilat.nama_pesilat_biru}`;

let patched = false;
if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
    patched = true;
}

if (code.includes(target2)) {
    code = code.replace(target2, replacement2);
    patched = true;
}

if (patched) {
    fs.writeFileSync('src/components/PublicDisplay.tsx', code);
    console.log("Patched PublicDisplay.tsx queue successfully");
}
