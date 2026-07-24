const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

// Replace native fallback logic
code = code.replace(/catch\(e\) \{\n\s*console\.warn\("TTS fetch failed, falling back to native browser TTS", e\);\n\s*item\.useNativeFallback = true;\n\s*\}/, 
`catch(e) {
      console.warn("TTS fetch failed", e);
      item.failed = true;
    }`);

code = code.replace(/if \(!current\.audioData && !current\.failed && !current\.useNativeFallback\) \{/,
`if (!current.audioData && !current.failed) {`);

const nativeFallbackStart = code.indexOf('if (current.useNativeFallback) {');
const nativeFallbackEndRegex = /if \(current\.failed \|\| !current\.audioData\) throw new Error\("Audio data not available"\);/;
const matchEnd = code.match(nativeFallbackEndRegex);

if (nativeFallbackStart > -1 && matchEnd) {
    const endIdx = matchEnd.index;
    const toRemove = code.substring(nativeFallbackStart, endIdx);
    code = code.replace(toRemove, "");
}

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched PublicDisplay.tsx (TTS)");
