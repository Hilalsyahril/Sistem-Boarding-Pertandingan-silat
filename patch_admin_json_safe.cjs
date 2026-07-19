const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Fix line 500
  const target1 = `        const resData = await res.json();
        if (!res.ok) {
          throw new Error(resData.error || "Gagal menyimpan data import ke server.");
        }`;
  const replacement1 = `        let resData = {};
        try {
          resData = await res.json();
        } catch (e) {}
        if (!res.ok) {
          throw new Error(resData.error || "Gagal menyimpan data import ke server.");
        }`;
  if (code.includes(target1)) code = code.replace(target1, replacement1);

  // Fix line 703
  const target2 = `      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Gagal menyimpan data pesilat.");
      }`;
  const replacement2 = `      let responseData = {};
      try {
        responseData = await res.json();
      } catch (e) {}

      if (!res.ok) {
        throw new Error(responseData.error || "Gagal menyimpan data pesilat.");
      }`;
  if (code.includes(target2)) code = code.replace(target2, replacement2);

  // Fix line 788
  const target3 = `      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui jumlah arena.");
      }`;
  const replacement3 = `      let data = {};
      try {
        data = await res.json();
      } catch (e) {}

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui jumlah arena.");
      }`;
  if (code.includes(target3)) code = code.replace(target3, replacement3);

  fs.writeFileSync(file, code);
}

patchFile('src/components/AdminDashboard.tsx');
