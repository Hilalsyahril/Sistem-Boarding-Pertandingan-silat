import React, { useState, useEffect } from "react";
import PublicDisplay from "./components/PublicDisplay";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import OperatorLogin from "./components/OperatorLogin";
import OperatorDashboard from "./components/OperatorDashboard";

export default function App() {
  // Routing sederhana: "public" | "admin" | "operator"
  // Ditentukan dari URL pathname atau hash agar terpisah sepenuhnya
  const [view, setView] = useState<"public" | "admin" | "operator">(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.startsWith("/admin") || hash === "#admin") {
      return "admin";
    }
    if (path.startsWith("/operator") || hash === "#operator") {
      return "operator";
    }
    return "public";
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [operatorUsername, setOperatorUsername] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const currentView = window.location.pathname.startsWith("/admin") || window.location.hash === "#admin" 
                          ? "admin" 
                          : (window.location.pathname.startsWith("/operator") || window.location.hash === "#operator" 
                             ? "operator" 
                             : "public");

      if (currentView === "admin") {
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
      } else if (currentView === "operator") {
        const token = localStorage.getItem("operatorToken");
        if (token) {
          try {
            const res = await fetch("/api/operator/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token })
            });
            const data = await res.json();
            if (data.valid) {
              setIsAuthenticated(true);
              setOperatorUsername(data.username);
            } else {
              localStorage.removeItem("operatorToken");
            }
          } catch (e) {
            console.error("Operator auth check failed", e);
          }
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
      } else if (path.startsWith("/operator") || hash === "#operator") {
        setView("operator");
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

      {view === "operator" && (
        isCheckingAuth ? (
          <div className="min-h-screen flex items-center justify-center text-white">Memeriksa sesi...</div>
        ) : !isAuthenticated ? (
          <OperatorLogin onLoginSuccess={(username) => {
            setOperatorUsername(username);
            setIsAuthenticated(true);
          }} />
        ) : (
          <OperatorDashboard 
            username={operatorUsername}
            onLogout={() => {
              localStorage.removeItem("operatorToken");
              setIsAuthenticated(false);
              setOperatorUsername("");
            }} 
          />
        )
      )}
    </div>
  );
}
