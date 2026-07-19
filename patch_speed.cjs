const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const target1 = `      source.playbackRate.value = 1.15; // Sedikit dipercepat tempo nya`;
  const replacement1 = `      // Normal tempo`;
  if (code.includes(target1)) code = code.replace(target1, replacement1);

  const target2 = `      const durationMs = ((audioBuffer.length / audioBuffer.sampleRate) * 1000) / 1.15;`;
  const replacement2 = `      const durationMs = (audioBuffer.length / audioBuffer.sampleRate) * 1000;`;
  if (code.includes(target2)) code = code.replace(target2, replacement2);

  fs.writeFileSync(file, code);
}

patchFile('src/components/PublicDisplay.tsx');
