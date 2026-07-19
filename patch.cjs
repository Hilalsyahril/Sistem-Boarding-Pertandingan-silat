const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const announceFunc = `  const announceMatch = async (arenaNum: number, p: Pesilat) => {
    const cleanKategori = p.kategori || "Tanding";
    const cleanKelas = (p.kelas || "")
      .replace(/kg/gi, " kilogram")
      .replace(/\\(/g, " ")
      .replace(/\\)/g, " ")
      .replace(/-/g, " sampai ");
    const cleanGender = p.gender || "Putra";
    const cleanNamaMerah = p.nama_pesilat ? p.nama_pesilat.trim() : "";
    const cleanKontingenMerah = p.kontingen ? p.kontingen.trim() : "";
    const cleanNamaBiru = p.nama_pesilat_biru ? p.nama_pesilat_biru.trim() : "";
    const cleanKontingenBiru = p.kontingen_biru ? p.kontingen_biru.trim() : "";

    let text = "";
    if (cleanNamaBiru !== "") {
      text = \`Panggilan kepada partai nomor \${p.nomor_partai || ""}, di Gelanggang \${arenaNum}. Kategori \${cleanKategori}, \${cleanGender}, \${cleanKelas}. Di sudut merah, \${cleanNamaMerah} dari \${cleanKontingenMerah}, melawan di sudut biru, \${cleanNamaBiru} dari \${cleanKontingenBiru}. Selamat bertanding.\`;
    } else {
      text = \`Panggilan kepada partai nomor \${p.nomor_partai || ""}, di Gelanggang \${arenaNum}. Kategori \${cleanKategori}, \${cleanGender}, \${cleanKelas}. Pesilat, \${cleanNamaMerah} dari \${cleanKontingenMerah}. Selamat bertanding.\`;
    }

    try {
      await fetch("/api/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, arenaNum, pesilatId: p.id })
      });
    } catch (err) {
      console.error("Gagal mengirim pengumuman", err);
    }
  };
`;

code = code.replace("// Form States - Arena Setting", announceFunc + "\n  // Form States - Arena Setting");

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
