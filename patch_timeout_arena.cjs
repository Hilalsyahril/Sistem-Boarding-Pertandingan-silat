const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const target = `    const arenaMatches = all.filter(match => match.arena === p.arena);`;
  const replacement = `    const arenaMatches = all.filter(match => Number(match.arena) === Number(p.arena));`;
    
  if (code.includes(target)) {
    code = code.replace(target, replacement);
  }
  
  fs.writeFileSync(file, code);
}

patchFile('server.ts');
