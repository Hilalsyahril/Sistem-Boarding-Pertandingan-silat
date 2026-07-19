const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const target = `        const res = await fetch(\`/api/announce?_t=\${Date.now()}\`);
        const data = await res.json();`;
  const replacement = `        const res = await fetch(\`/api/announce?_t=\${Date.now()}\`);
        if (!res.ok) throw new Error("Server Error " + res.status);
        const textData = await res.text();
        let data;
        try {
          data = JSON.parse(textData);
        } catch (e) {
          throw new Error("Invalid JSON response");
        }`;
    
  if (code.includes(target)) {
    code = code.replace(target, replacement);
  }
  
  fs.writeFileSync(file, code);
}

patchFile('src/components/PublicDisplay.tsx');
