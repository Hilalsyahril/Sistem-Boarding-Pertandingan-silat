const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

let targetGender = `<select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl px-2 py-2.5 outline-none transition text-xs sm:text-sm"
                        >
                          {opsiGender.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>`;
                        
let replacementGender = `<input
                          type="text"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl px-2 py-2.5 outline-none transition text-xs sm:text-sm"
                          placeholder="Ketik Gender..."
                        />`;
code = code.replace(targetGender, replacementGender);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("AdminDashboard gender patched.");
