const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const targetMethod = `  const handleDeleteOperator = async (id: string) => {`;
const replacementMethod = `  const handleLogoutOperator = async (id: string) => {
    if (!confirm("Paksa logout operator ini?")) return;
    setLoading(true);
    try {
      const res = await fetch(\`/api/admin/operators/\${id}/logout\`, { method: "POST" });
      if (res.ok) {
        setSuccess("Operator berhasil dipaksa logout.");
        fetchOperators();
      } else {
        setError("Gagal logout operator.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOperator = async (id: string) => {`;
code = code.replace(targetMethod, replacementMethod);

const targetHeader = `                          <th className="px-4 py-3 font-bold text-slate-300 text-xs uppercase font-mono tracking-wider">Username</th>
                          <th className="px-4 py-3 font-bold text-slate-300 text-xs uppercase font-mono tracking-wider text-right">Aksi</th>`;
const replacementHeader = `                          <th className="px-4 py-3 font-bold text-slate-300 text-xs uppercase font-mono tracking-wider">Username</th>
                          <th className="px-4 py-3 font-bold text-slate-300 text-xs uppercase font-mono tracking-wider">Status</th>
                          <th className="px-4 py-3 font-bold text-slate-300 text-xs uppercase font-mono tracking-wider text-right">Aksi</th>`;
code = code.replace(targetHeader, replacementHeader);

const targetRow = `                              <td className="px-4 py-3 font-bold text-white">
                                {op.username}
                                {editingOpId === op.id && (`;
const replacementRow = `                              <td className="px-4 py-3 font-bold text-white">
                                {op.username}
                                {editingOpId === op.id && (`;
                                
const targetCol2 = `                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">`;
const replacementCol2 = `                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {op.token ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">Online</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">Offline</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">`;
code = code.replace(targetCol2, replacementCol2);

const targetAction = `                                  <button
                                    onClick={() => handleDeleteOperator(op.id)}
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>`;
const replacementAction = `                                  {op.token && (
                                    <button
                                      onClick={() => handleLogoutOperator(op.id)}
                                      className="p-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition"
                                      title="Paksa Logout"
                                    >
                                      <LogOut className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteOperator(op.id)}
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>`;
code = code.replace(targetAction, replacementAction);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard operators list");
