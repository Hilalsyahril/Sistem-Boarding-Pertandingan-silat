const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Replace text generation block
  const target1 = `    if (cleanNamaBiru !== "") {
      text = \`Panggilan kepada partai nomor \${p.nomor_partai || ""}, di Gelanggang \${arenaNum}. Kategori \${cleanKategori}, \${cleanGender}, \${cleanKelas}. Di sudut biru, \${cleanNamaBiru} dari \${cleanKontingenBiru}, melawan di sudut merah, \${cleanNamaMerah} dari \${cleanKontingenMerah}. Selamat bertanding.\`;
    } else {
      text = \`Panggilan kepada partai nomor \${p.nomor_partai || ""}, di Gelanggang \${arenaNum}. Kategori \${cleanKategori}, \${cleanGender}, \${cleanKelas}. Pesilat, \${cleanNamaMerah} dari \${cleanKontingenMerah}. Selamat bertanding.\`;
    }`;
    
  const replacement1 = `    if (cleanNamaBiru !== "") {
      text = \`Partai \${p.nomor_partai || ""}, Gelanggang \${arenaNum}. \${cleanKategori} \${cleanGender} \${cleanKelas}. Sudut biru \${cleanNamaBiru} dari \${cleanKontingenBiru}, melawan sudut merah \${cleanNamaMerah} dari \${cleanKontingenMerah}. Bersiaplah.\`;
    } else {
      text = \`Partai \${p.nomor_partai || ""}, Gelanggang \${arenaNum}. \${cleanKategori} \${cleanGender} \${cleanKelas}. Pesilat \${cleanNamaMerah} dari \${cleanKontingenMerah}. Bersiaplah.\`;
    }`;

  const target2 = `    if (cleanNamaBiru !== "") {
      text = \`Panggilan kepada partai nomor \${p.nomor_partai || ""}, di Gelanggang \${arenaNum}. Kategori \${cleanKategori}, \${cleanGender}, \${cleanKelas}. Di sudut merah, \${cleanNamaMerah} dari \${cleanKontingenMerah}, melawan di sudut biru, \${cleanNamaBiru} dari \${cleanKontingenBiru}. Selamat bertanding.\`;
    } else {
      text = \`Panggilan kepada partai nomor \${p.nomor_partai || ""}, di Gelanggang \${arenaNum}. Kategori \${cleanKategori}, \${cleanGender}, \${cleanKelas}. Pesilat, \${cleanNamaMerah} dari \${cleanKontingenMerah}. Selamat bertanding.\`;
    }`;
    
  const replacement2 = `    if (cleanNamaBiru !== "") {
      text = \`Partai \${p.nomor_partai || ""}, Gelanggang \${arenaNum}. \${cleanKategori} \${cleanGender} \${cleanKelas}. Sudut merah \${cleanNamaMerah} dari \${cleanKontingenMerah}, melawan sudut biru \${cleanNamaBiru} dari \${cleanKontingenBiru}. Bersiaplah.\`;
    } else {
      text = \`Partai \${p.nomor_partai || ""}, Gelanggang \${arenaNum}. \${cleanKategori} \${cleanGender} \${cleanKelas}. Pesilat \${cleanNamaMerah} dari \${cleanKontingenMerah}. Bersiaplah.\`;
    }`;

  if (code.includes(target1)) code = code.replace(target1, replacement1);
  if (code.includes(target2)) code = code.replace(target2, replacement2);
  
  fs.writeFileSync(file, code);
}

patchFile('src/components/PublicDisplay.tsx');
patchFile('src/components/AdminDashboard.tsx');
