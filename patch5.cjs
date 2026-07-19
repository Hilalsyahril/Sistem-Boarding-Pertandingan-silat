const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const polling = `
  // Background polling to keep admin in sync with server timer
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(\`/api/pesilat?_t=\${Date.now()}\`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPesilatList(data);
          }
        }
      } catch (e) {
        // ignore
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);
`;

code = code.replace("// Local real-time timer countdown loop", polling + "\n  // Local real-time timer countdown loop");
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
