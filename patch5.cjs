const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

// Replace the try block to set a fallback timeout immediately
code = code.replace(
  '    try {\n      if (current.useNativeFallback) {',
  '    let resumeTimeout: any;\n    try {\n      // Set a hard timeout in case any await (like resume) hangs indefinitely\n      resumeTimeout = setTimeout(() => {\n        console.warn("Audio processing hung, forcing finish");\n        finishUtterance();\n      }, 20000);\n\n      if (current.useNativeFallback) {'
);

// Clear the resume timeout in finishUtterance
code = code.replace(
  '      if (safetyTimeout) clearTimeout(safetyTimeout);',
  '      if (safetyTimeout) clearTimeout(safetyTimeout);\n      if (resumeTimeout) clearTimeout(resumeTimeout);'
);

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched 5!");
