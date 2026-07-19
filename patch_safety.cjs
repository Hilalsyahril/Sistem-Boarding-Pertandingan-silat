const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Fix estimatedDurationMs for fallback TTS
  const target1 = `      const estimatedDurationMs = Math.max(2000, (charCount * 80) + 500);
      safetyTimeout = setTimeout(() => {
        finishUtterance();
      }, estimatedDurationMs);`;
      
  const replacement1 = `      const estimatedDurationMs = Math.max(5000, (charCount * 150) + 2000);
      safetyTimeout = setTimeout(() => {
        finishUtterance();
      }, estimatedDurationMs);`;

  if (code.includes(target1)) code = code.replace(target1, replacement1);
  
  fs.writeFileSync(file, code);
}

patchFile('src/components/PublicDisplay.tsx');
