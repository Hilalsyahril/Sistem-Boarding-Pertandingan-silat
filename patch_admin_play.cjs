const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const target = `        return prev.map(p => {
          if (p.arena === arenaNum) {`;
  const replacement = `        return prev.map(p => {
          if (Number(p.arena) === Number(arenaNum)) {`;
    
  if (code.includes(target)) {
    code = code.replace(target, replacement);
  }
  
  fs.writeFileSync(file, code);
}

patchFile('src/components/AdminDashboard.tsx');
