const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Find the text assignment block
  const target1 = `    let text = "";
    if (cleanNamaBiru !== "") {
      text = \`Partai \${p.nomor_partai || ""}, Gelanggang \${arenaNum}. \${cleanKategori} \${cleanGender} \${cleanKelas}. Sudut biru \${cleanNamaBiru} dari \${cleanKontingenBiru}, melawan sudut merah \${cleanNamaMerah} dari \${cleanKontingenMerah}. Bersiaplah.\`;
    } else {
      text = \`Partai \${p.nomor_partai || ""}, Gelanggang \${arenaNum}. \${cleanKategori} \${cleanGender} \${cleanKelas}. Pesilat \${cleanNamaMerah} dari \${cleanKontingenMerah}. Bersiaplah.\`;
    }`;
    
  const replacement1 = `    const prefixKelas = cleanKelas.toLowerCase().includes("kelas") || cleanKelas === "" ? cleanKelas : \`kelas \${cleanKelas}\`;
    
    let text = "";
    if (cleanNamaBiru !== "") {
      text = \`Partai \${p.nomor_partai || ""}, Gelanggang \${arenaNum}. \${cleanKategori} \${cleanGender} \${prefixKelas}. Sudut biru \${cleanNamaBiru} dari \${cleanKontingenBiru}, melawan sudut merah \${cleanNamaMerah} dari \${cleanKontingenMerah}. Bersiaplah.\`;
    } else {
      text = \`Partai \${p.nomor_partai || ""}, Gelanggang \${arenaNum}. \${cleanKategori} \${cleanGender} \${prefixKelas}. Pesilat \${cleanNamaMerah} dari \${cleanKontingenMerah}. Bersiaplah.\`;
    }`;

  const target2 = `    let text = "";
    if (cleanNamaBiru !== "") {
      text = \`Partai \${p.nomor_partai || ""}, Gelanggang \${arenaNum}. \${cleanKategori} \${cleanGender} \${cleanKelas}. Sudut merah \${cleanNamaMerah} dari \${cleanKontingenMerah}, melawan sudut biru \${cleanNamaBiru} dari \${cleanKontingenBiru}. Bersiaplah.\`;
    } else {
      text = \`Partai \${p.nomor_partai || ""}, Gelanggang \${arenaNum}. \${cleanKategori} \${cleanGender} \${cleanKelas}. Pesilat \${cleanNamaMerah} dari \${cleanKontingenMerah}. Bersiaplah.\`;
    }`;
    
  const replacement2 = `    const prefixKelas = cleanKelas.toLowerCase().includes("kelas") || cleanKelas === "" ? cleanKelas : \`kelas \${cleanKelas}\`;
    
    let text = "";
    if (cleanNamaBiru !== "") {
      text = \`Partai \${p.nomor_partai || ""}, Gelanggang \${arenaNum}. \${cleanKategori} \${cleanGender} \${prefixKelas}. Sudut biru \${cleanNamaBiru} dari \${cleanKontingenBiru}, melawan sudut merah \${cleanNamaMerah} dari \${cleanKontingenMerah}. Bersiaplah.\`;
    } else {
      text = \`Partai \${p.nomor_partai || ""}, Gelanggang \${arenaNum}. \${cleanKategori} \${cleanGender} \${prefixKelas}. Pesilat \${cleanNamaMerah} dari \${cleanKontingenMerah}. Bersiaplah.\`;
    }`;

  if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
  } else if (code.includes(target2)) {
    code = code.replace(target2, replacement2);
  }
  
  fs.writeFileSync(file, code);
}

patchFile('src/components/PublicDisplay.tsx');
patchFile('src/components/AdminDashboard.tsx');
