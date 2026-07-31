const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

let regexExcel = /const mappedItems = rawData\.map\(\(row: any\) => \{[\s\S]*?\}\)\.filter\(item => item\.nama_pesilat \|\| item\.nama_pesilat_biru\);/m;
let newExcelLogic = `const mappedItems = rawData.map((row: any) => {
          const keys = Object.keys(row);
          
          const findKeyExactOrIncludes = (exactMatches, includeMatches = [], excludeMatches = []) => {
            // First try exact match (case insensitive)
            const exact = keys.find(k => exactMatches.some(em => k.toLowerCase().trim() === em.toLowerCase()));
            if (exact) return exact;
            
            // Then try includes
            return keys.find(k => {
              const kLower = k.toLowerCase().replace(/[^a-z0-9]/g, "");
              const hasKeyword = includeMatches.some(kw => kLower.includes(kw));
              const hasExclude = excludeMatches.some(ex => kLower.includes(ex));
              return hasKeyword && !hasExclude;
            });
          };

          const nomorPartaiKey = findKeyExactOrIncludes(["Nomor Partai", "No Partai"], ["partai", "no", "nomor"]);
          const namaBiruKey = findKeyExactOrIncludes(["Sudut Biru (Nama Pesilat)", "Nama Pesilat Biru"], ["biru"], ["kontingen"]);
          const kontingenBiruKey = findKeyExactOrIncludes(["Sudut Biru (Kontingen)", "Kontingen Biru"], ["biru"], ["nama", "pesilat", "atlit"]);
          const namaMerahKey = findKeyExactOrIncludes(["Sudut Merah (Nama Pesilat)", "Nama Pesilat Merah"], ["merah"], ["kontingen"]);
          const kontingenMerahKey = findKeyExactOrIncludes(["Sudut Merah (Kontingen)", "Kontingen Merah"], ["merah"], ["nama", "pesilat", "atlit"]);
          
          const kelasKey = findKeyExactOrIncludes(["Kelas"], ["kelas"]);
          const kategoriKey = findKeyExactOrIncludes(["Kategori"], ["kategori"]);
          const genderKey = findKeyExactOrIncludes(["Gender", "Jenis Kelamin"], ["gender", "kelamin", "putra", "putri", "sex"]);
          const arenaKey = findKeyExactOrIncludes(["Arena", "Gelanggang"], ["arena", "gelanggang"]);
          const durationKey = findKeyExactOrIncludes(["Durasi Timer (Detik)", "Durasi Timer", "Timer"], ["durasi", "waktu", "timer", "detik"]);

          const arenaVal = arenaKey ? String(row[arenaKey]).trim() : "1";
          const nomorPartai = (nomorPartaiKey ? String(row[nomorPartaiKey]) : "01").trim();
          
          let namaMerah = (namaMerahKey ? String(row[namaMerahKey]) : "").trim();
          let kontingenMerah = (kontingenMerahKey ? String(row[kontingenMerahKey]) : "").trim();
          let namaBiru = (namaBiruKey ? String(row[namaBiruKey]) : "").trim();
          let kontingenBiru = (kontingenBiruKey ? String(row[kontingenBiruKey]) : "").trim();
          
          const normalizeEmpty = (val) => {
            if (!val || val === "-" || val.toUpperCase() === "NO PARTITION") return "";
            return val;
          };
          
          namaMerah = normalizeEmpty(namaMerah);
          kontingenMerah = normalizeEmpty(kontingenMerah);
          namaBiru = normalizeEmpty(namaBiru);
          kontingenBiru = normalizeEmpty(kontingenBiru);

          const kelas = (kelasKey ? String(row[kelasKey]) : "Kelas A").trim();
          const kategori = (kategoriKey ? String(row[kategoriKey]) : "Tanding").trim();
          const gender = (genderKey ? String(row[genderKey]) : "Putra").trim();
          
          let durationRaw = durationKey ? parseInt(String(row[durationKey]).replace(/\\D/g, ''), 10) : 0;
          if (isNaN(durationRaw)) durationRaw = 0;
          
          const duration = durationRaw || (kategori.toLowerCase().includes("tunggal") || kategori.toLowerCase().includes("ganda") || kategori.toLowerCase().includes("regu") || kategori.toLowerCase() === "seni" ? 180 : 120);

          return {
            arena: arenaVal,
            nomor_partai: nomorPartai,
            nama_pesilat: namaMerah,
            kontingen: kontingenMerah,
            nama_pesilat_biru: namaBiru,
            kontingen_biru: kontingenBiru,
            kelas: kelas,
            kategori: kategori,
            gender: gender,
            timer_duration: duration
          };
        }).filter(item => item.nama_pesilat || item.nama_pesilat_biru);`;

code = code.replace(regexExcel, newExcelLogic);

// Fix the badge G-{p.arena} to only show numbers
let regexBadge = /G-\{p\.arena\}/g;
let newBadge = `G-{parseInt(String(p.arena).replace(/\\D/g, ''), 10) || p.arena}`;
code = code.replace(regexBadge, newBadge);

// Fix setArena in edit mode
let regexSetArenaEdit = /setArena\(p\.arena\);/g;
let newSetArenaEdit = `setArena(p.arena ? (parseInt(String(p.arena).replace(/\\D/g, ''), 10) || String(p.arena)) : 1);`;
code = code.replace(regexSetArenaEdit, newSetArenaEdit);

// Fix payload arena
let regexPayloadArena = /arena: Number\(arena\),/g;
let newPayloadArena = `arena: arena,`;
code = code.replace(regexPayloadArena, newPayloadArena);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("AdminDashboard import mapping and arena fixes patched successfully.");
