const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(/import\s*\{([^}]*)\}\s*from\s*"lucide-react";/, (match, p1) => {
  if (p1.includes('Download')) return match;
  return `import { ${p1}, Download } from "lucide-react";`;
});

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Import injected!");
