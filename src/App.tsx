import React, { useState } from "react";
import PublicDisplay from "./components/PublicDisplay";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import { Shield, Eye, Lock } from "lucide-react";

export default function App() {
  // Routing sederhana: "public" | "admin"
  const [view, setView] = useState<"public" | "admin">("public");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  return (
    <div className="relative min-h-screen bg-neutral-950">
      
      {/* Floating View Switcher Button (Tersedia untuk mempermudah perpindahan halaman di preview) */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {view === "public" ? (
          <button
            onClick={() => setView("admin")}
            className="flex items-center gap-1.5 bg-neutral-900/90 hover:bg-amber-500 hover:text-neutral-950 text-neutral-400 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg backdrop-blur transition cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            Panel Admin
          </button>
        ) : (
          <button
            onClick={() => setView("public")}
            className="flex items-center gap-1.5 bg-neutral-900/90 hover:bg-amber-500 hover:text-neutral-950 text-neutral-400 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg backdrop-blur transition cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            Display Publik
          </button>
        )}
      </div>

      {/* Main Content Router */}
      <div className={view === "public" ? "block" : "hidden"}>
        <PublicDisplay />
      </div>

      {view === "admin" && (
        !isAuthenticated ? (
          <div className="relative">
            {/* Tambahan tombol kembali khusus di halaman login */}
            <div className="absolute top-6 left-6 z-10">
              <button
                onClick={() => setView("public")}
                className="text-xs text-neutral-400 hover:text-white font-medium flex items-center gap-1"
              >
                &larr; Kembali ke Display Publik
              </button>
            </div>
            <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />
          </div>
        ) : (
          <AdminDashboard onLogout={() => {
            setIsAuthenticated(false);
            setView("public");
          }} />
        )
      )}
    </div>
  );
}
