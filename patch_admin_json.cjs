const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const target = `      const res = await fetch(\`/api/config-status?_t=\${Date.now()}\`);
      const data = await res.json();`;
  const replacement = `      const res = await fetch(\`/api/config-status?_t=\${Date.now()}\`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();`;
    
  if (code.includes(target)) {
    code = code.replace(target, replacement);
  }
  
  fs.writeFileSync(file, code);
}

patchFile('src/components/AdminDashboard.tsx');
