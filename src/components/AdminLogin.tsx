import React, { useState, useEffect } from "react";
import { Lock, User, ShieldAlert, Award, KeyRound, Info } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [mode, setMode] = useState<"login" | "edit" | "forgot">("login");
  
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  // Edit Password fields
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize default credentials
  useEffect(() => {
    if (!localStorage.getItem("adminUsername")) {
      localStorage.setItem("adminUsername", "operatorDB");
    }
    if (!localStorage.getItem("adminPassword")) {
      localStorage.setItem("adminPassword", "silat2026");
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validUser = localStorage.getItem("adminUsername") || "operatorDB";
    const validPass = localStorage.getItem("adminPassword") || "silat2026";
    
    if (username === validUser && password === validPass) {
      setError(null);
      onLoginSuccess();
    } else {
      setError("Username atau Password salah!");
    }
  };

  const handleEditPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const validUser = localStorage.getItem("adminUsername") || "operatorDB";
    const validPass = localStorage.getItem("adminPassword") || "silat2026";
    
    if (username !== validUser || oldPassword !== validPass) {
      setError("Username atau Password Lama salah!");
      setSuccess(null);
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter!");
      setSuccess(null);
      return;
    }

    localStorage.setItem("adminPassword", newPassword);
    setSuccess("Password berhasil diubah! Silakan login.");
    setError(null);
    setMode("login");
    setPassword("");
    setOldPassword("");
    setNewPassword("");
  };

  const switchMode = (newMode: "login" | "edit" | "forgot") => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    setUsername("");
    setPassword("");
    setOldPassword("");
    setNewPassword("");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"></div>

        {/* Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/20 rotate-12">
            <Award className="w-7 h-7 text-white -rotate-12" />
          </div>
          <h2 className="text-xl font-black text-white font-display uppercase tracking-wider">
            ADMIN LOGIN PORTAL
          </h2>
          <p className="text-xs text-indigo-300 mt-1 font-semibold">
            Sistem Boarding Pencak Silat • Live Display
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-rose-950/40 border border-rose-800 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs p-3 rounded-xl flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Dynamic Content */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl transition duration-200 text-sm shadow-lg shadow-indigo-600/20 mt-2 font-display uppercase tracking-wider"
            >
              Masuk ke Dashboard
            </button>

            <div className="flex justify-between items-center mt-4 text-[10px] sm:text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-slate-400 hover:text-indigo-400 transition"
              >
                Lupa Password?
              </button>
              <button
                type="button"
                onClick={() => switchMode("edit")}
                className="text-slate-400 hover:text-indigo-400 transition"
              >
                Edit Password
              </button>
            </div>
          </form>
        )}

        {mode === "edit" && (
          <form onSubmit={handleEditPassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                Password Lama
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password lama"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                Password Baru
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-2.5 rounded-xl transition duration-200 text-sm shadow-lg shadow-amber-600/20 mt-2 font-display uppercase tracking-wider"
            >
              Simpan Password Baru
            </button>
            
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="w-full text-slate-400 hover:text-white font-bold py-2 rounded-xl transition duration-200 text-[10px] sm:text-xs uppercase tracking-wider"
            >
              Kembali ke Login
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <Info className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-white font-bold mb-2">Lupa Password?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Untuk alasan keamanan, sistem ini tidak memiliki fitur pemulihan password otomatis. Silakan hubungi Administrator IT atau Penanggung Jawab Sistem (IT Support) di lokasi untuk mengatur ulang kredensial Anda.
            </p>
            
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-2.5 rounded-xl transition duration-200 text-sm uppercase tracking-wider"
            >
              Kembali
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
