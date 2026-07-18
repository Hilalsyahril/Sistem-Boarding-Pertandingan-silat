import React, { useState } from "react";
import { Lock, User, ShieldAlert, Award } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Hardcoded credentials for prototype
  const HARDCODED_USER = "admin";
  const HARDCODED_PASS = "silat2026";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === HARDCODED_USER && password === HARDCODED_PASS) {
      setError(null);
      onLoginSuccess();
    } else {
      setError("Username atau Password salah!");
    }
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

        {/* Alert Error */}
        {error && (
          <div className="mb-4 bg-rose-950/40 border border-rose-800 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
        </form>

        {/* Demo Credentials Helper */}
        <div className="mt-6 border-t border-slate-800 pt-4">
          <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-300 mb-1 font-mono uppercase tracking-wider text-[9px]">Kredensial Demo:</p>
            <div className="grid grid-cols-2 gap-1 font-mono">
              <div>Username: <span className="text-amber-400 font-bold">{HARDCODED_USER}</span></div>
              <div>Password: <span className="text-amber-400 font-bold">{HARDCODED_PASS}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
