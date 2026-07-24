const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// 1. Import X icon
code = code.replace(/import \{/, 'import { X, ');

// 2. Add state
code = code.replace(/const \[isAutoNextEnabled, setIsAutoNextEnabled\] = useState<boolean>\(false\);/, 
`const [isAutoNextEnabled, setIsAutoNextEnabled] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);`);

// 3. Update handleEditClick
code = code.replace(/setTimerDuration\(p\.timer_duration \|\| 120\);/,
`setTimerDuration(p.timer_duration || 120);
    setIsFormModalOpen(true);`);

// 4. Update resetFormPesilat
code = code.replace(/setTimerDuration\(120\);/,
`setTimerDuration(120);
    setIsFormModalOpen(false);`);

// 5. Modify layout container
code = code.replace(
  /<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">/,
  `<div className="flex flex-col gap-6">`
);

// 6. Wrap form in modal
const formTarget = `{/* Form Input Pesilat */}
            <div className="lg:col-span-4 bg-slate-900 border-2 border-slate-800 p-5 rounded-3xl shadow-2xl h-fit ring-1 ring-white/5">`;
const formReplacement = `{/* Form Input Pesilat Modal */}
            {isFormModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-slate-900 border-2 border-slate-800 p-5 rounded-3xl shadow-2xl w-full max-w-lg my-auto ring-1 ring-white/5 relative">
                  <button 
                    type="button"
                    onClick={resetFormPesilat} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>`;
code = code.replace(formTarget, formReplacement);

// 7. Close modal div
const formEndTarget = `              </form>
            </div>

            {/* List Daftar Pesilat & Kontrol Gelanggang */}
            <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">`;
const formEndReplacement = `              </form>
                </div>
              </div>
            )}

            {/* List Daftar Pesilat & Kontrol Gelanggang */}
            <div className="flex flex-col gap-6 min-w-0">`;
code = code.replace(formEndTarget, formEndReplacement);

// 8. Add Tambah Pesilat button
const btnTarget = `<div className="flex items-center gap-2 flex-wrap">
                    {/* Hidden input file for Import */}
                    <input`;
const btnReplacement = `<div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setIsFormModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition"
                    >
                      <UserPlus className="w-4 h-4" /> Tambah Pesilat
                    </button>
                    {/* Hidden input file for Import */}
                    <input`;
code = code.replace(btnTarget, btnReplacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx successfully");
