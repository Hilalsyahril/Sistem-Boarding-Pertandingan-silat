const fs = require('fs');

let adminCode = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');
const adminTarget = `    const interval = setInterval(async () => {
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
      }`;

const adminReplacement = `    const interval = setInterval(async () => {
      try {
        const res = await fetch(\`/api/pesilat?_t=\${Date.now()}\`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPesilatList(data);
          }
        }
        
        const arenaRes = await fetch(\`/api/pengaturan_arena?_t=\${Date.now()}\`);
        if (arenaRes.ok) {
          const arenaData = await arenaRes.json();
          const arenaItem = Array.isArray(arenaData) ? arenaData[0] : arenaData;
          if (arenaItem && arenaItem.auto_next !== undefined) {
             setAutoNextMatch(arenaItem.auto_next);
          }
        }
      } catch (e) {
        // ignore
      }`;
adminCode = adminCode.replace(adminTarget, adminReplacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', adminCode);

let opCode = fs.readFileSync('src/components/OperatorDashboard.tsx', 'utf-8');
const opTarget = `    const interval = setInterval(async () => {
      try {
        const res = await fetch(\`/api/pesilat?_t=\${Date.now()}\`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setPesilatList(data);
        }
      } catch (e) {
        // ignore
      }`;
const opReplacement = `    const interval = setInterval(async () => {
      try {
        const res = await fetch(\`/api/pesilat?_t=\${Date.now()}\`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setPesilatList(data);
        }
        
        const arenaRes = await fetch(\`/api/pengaturan_arena?_t=\${Date.now()}\`);
        if (arenaRes.ok) {
          const arenaData = await arenaRes.json();
          const arenaItem = Array.isArray(arenaData) ? arenaData[0] : arenaData;
          if (arenaItem && arenaItem.auto_next !== undefined) {
             setAutoNextMatch(arenaItem.auto_next);
          }
        }
      } catch (e) {
        // ignore
      }`;
opCode = opCode.replace(opTarget, opReplacement);
fs.writeFileSync('src/components/OperatorDashboard.tsx', opCode);
console.log("Patched intervals");
