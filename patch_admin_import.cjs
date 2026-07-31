const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regex = /const namaBiruKey = findKeyExactOrIncludes\(\["Sudut Biru \(Nama Pesilat\)", "Nama Pesilat Biru"\], \["biru"\], \["kontingen"\]\);\s*const kontingenBiruKey = findKeyExactOrIncludes\(\["Sudut Biru \(Kontingen\)", "Kontingen Biru"\], \["biru"\], \["nama", "pesilat", "atlit"\]\);\s*const namaMerahKey = findKeyExactOrIncludes\(\["Sudut Merah \(Nama Pesilat\)", "Nama Pesilat Merah"\], \["merah"\], \["kontingen"\]\);\s*const kontingenMerahKey = findKeyExactOrIncludes\(\["Sudut Merah \(Kontingen\)", "Kontingen Merah"\], \["merah"\], \["nama", "pesilat", "atlit"\]\);/g;

const replacement = `const namaMerahKey = findKeyExactOrIncludes(["Sudut Merah (Nama Pesilat)", "Nama Pesilat Merah", "Nama Pesilat", "Nama Atlit", "Nama Atlet", "Nama"], ["merah", "nama pesilat", "nama atlit", "nama"], ["kontingen", "biru", "asal"]);
          const kontingenMerahKey = findKeyExactOrIncludes(["Sudut Merah (Kontingen)", "Kontingen Merah", "Kontingen", "Asal"], ["merah", "kontingen", "asal"], ["nama", "pesilat", "atlit", "biru"]);
          const namaBiruKey = findKeyExactOrIncludes(["Sudut Biru (Nama Pesilat)", "Nama Pesilat Biru", "Nama Pesilat 2", "Nama 2"], ["biru", "nama pesilat 2"], ["kontingen", "merah", "asal"]);
          const kontingenBiruKey = findKeyExactOrIncludes(["Sudut Biru (Kontingen)", "Kontingen Biru", "Kontingen 2", "Asal 2"], ["biru", "kontingen 2"], ["nama", "pesilat", "atlit", "merah"]);`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Import matching patched!");
