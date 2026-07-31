const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// 1. Remove datalist for Kelas
let targetKelas = `<input
                        type="text"
                        list="opsiKelasList"
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl px-2.5 py-2.5 outline-none transition text-xs sm:text-sm"
                        placeholder="Pilih/Ketik Kelas..."
                      />
                      <datalist id="opsiKelasList">
                        {opsiKelas.map((k) => (
                          <option key={k} value={k} />
                        ))}
                      </datalist>`;
                      
let replacementKelas = `<input
                        type="text"
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl px-2.5 py-2.5 outline-none transition text-xs sm:text-sm"
                        placeholder="Ketik Kelas..."
                      />`;
code = code.replace(targetKelas, replacementKelas);

// 2. Remove datalist for Kategori
let targetKategori = `<input
                          type="text"
                          list="opsiKategoriList"
                          value={kategori}
                          onChange={(e) => setKategori(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl px-2 py-2.5 outline-none transition text-xs sm:text-sm"
                          placeholder="Pilih/Ketik Kategori..."
                        />
                        <datalist id="opsiKategoriList">
                          {opsiKategori.map((k) => (
                            <option key={k} value={k} />
                          ))}
                        </datalist>`;
                        
let replacementKategori = `<input
                          type="text"
                          value={kategori}
                          onChange={(e) => setKategori(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl px-2 py-2.5 outline-none transition text-xs sm:text-sm"
                          placeholder="Ketik Kategori..."
                        />`;
code = code.replace(targetKategori, replacementKategori);


// 3. Update getValStr and Excel logic in handleImportExcel
let regexExcel = /const mappedItems = rawData\.map\(\(row: any\) => \{[\s\S]*?\}\)\.filter\(item => item\.nama_pesilat \|\| item\.nama_pesilat_biru\);/m;

let newExcelLogic = `const mappedItems = rawData.map((row: any) => {
          const keys = Object.keys(row);
          
          const findKey = (keywords: string[], exclude: string[] = []) => {
            return keys.find(k => {
              const kLower = k.toLowerCase().replace(/[^a-z0-9]/g, "");
              const hasKeyword = keywords.some(kw => kLower.includes(kw));
              const hasExclude = exclude.some(ex => kLower.includes(ex));
              return hasKeyword && !hasExclude;
            });
          };

          const arenaKey = findKey(["arena", "gelanggang"]);
          const nomorPartaiKey = findKey(["partai", "no", "nomor"]);
          
          // Merah
          const namaMerahKey = findKey(["merah"], ["kontingen"]) || findKey(["pesilat", "nama", "atlit"], ["biru", "kontingen"]); 
          const kontingenMerahKey = findKey(["merah"], ["nama", "pesilat", "atlit"]) || findKey(["kontingen"], ["biru"]);
          
          // Biru
          const namaBiruKey = findKey(["biru"], ["kontingen"]) || findKey(["pesilatbiru", "namabiru", "atlitbiru"]);
          const kontingenBiruKey = findKey(["biru"], ["nama", "pesilat", "atlit"]) || findKey(["kontingenbiru"]);
          
          const kelasKey = findKey(["kelas"]);
          const kategoriKey = findKey(["kategori"]);
          const genderKey = findKey(["gender", "kelamin", "putra", "putri", "sex"]);
          const durationKey = findKey(["durasi", "waktu", "timer", "detik"]);

          const arenaVal = Number(arenaKey ? row[arenaKey] : 1) || 1;
          const nomorPartai = (nomorPartaiKey ? String(row[nomorPartaiKey]) : "01").trim();
          
          const namaMerah = (namaMerahKey ? String(row[namaMerahKey]) : "").trim();
          const kontingenMerah = (kontingenMerahKey ? String(row[kontingenMerahKey]) : "").trim();
          
          const namaBiru = (namaBiruKey ? String(row[namaBiruKey]) : "").trim();
          const kontingenBiru = (kontingenBiruKey ? String(row[kontingenBiruKey]) : "").trim();
          
          const kelas = (kelasKey ? String(row[kelasKey]) : "Kelas A").trim();
          const kategori = (kategoriKey ? String(row[kategoriKey]) : "Tanding").trim();
          const gender = (genderKey ? String(row[genderKey]) : "Putra").trim();
          const durationRaw = durationKey ? Number(row[durationKey]) : 0;
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

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("AdminDashboard patched successfully.");
