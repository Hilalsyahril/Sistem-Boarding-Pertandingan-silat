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

  useEffect(() => {
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
        !isAuthenticated ? (
          <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />
        ) : (
          <AdminDashboard onLogout={() => {
            setIsAuthenticated(false);
          }} />
        )
      )}
    </div>
  );
}
