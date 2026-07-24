const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

// Change default to false
code = code.replace(/const \[isAudioEnabled, setIsAudioEnabled\] = useState<boolean>\(true\);/, "const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);");
code = code.replace(/const isAudioEnabledRef = useRef<boolean>\(true\);/, "const isAudioEnabledRef = useRef<boolean>(false);");

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched audio default");
