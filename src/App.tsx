import React, { useState, useEffect } from "react";
import PublicDisplay from "./components/PublicDisplay";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  // Routing sederhana: "public" | "admin"
  // Ditentukan dari URL pathname atau hash agar terpisah sepenuhnya
  const [view, setView] = useState<"public" | "admin">(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.startsWith("/admin") || hash === "#admin") {
      return "admin";
    }
    return "public";
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        try {
          const res = await fetch("/api/admin/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token })
          });
          const data = await res.json();
          if (data.valid) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("adminToken");
          }
        } catch (e) {
          console.error("Auth check failed", e);
        }
      }
      setIsCheckingAuth(false);
    };
    checkAuth();

    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.startsWith("/admin") || hash === "#admin") {
        setView("admin");
      } else {
        setView("public");
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-neutral-950">
      
      {/* Main Content Router */}
      <div className={view === "public" ? "block" : "hidden"}>
        <PublicDisplay />
      </div>

      {view === "admin" && (
        isCheckingAuth ? (
          <div className="min-h-screen flex items-center justify-center text-white">Memeriksa sesi...</div>
        ) : !isAuthenticated ? (
          <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />
        ) : (
          <AdminDashboard onLogout={() => {
            localStorage.removeItem("adminToken");
            setIsAuthenticated(false);
          }} />
        )
      )}
    </div>
  );
}
