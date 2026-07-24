const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

code = code.replace(
  'useEffect(() => { isAudioEnabledRef.current = isAudioEnabled; }, [isAudioEnabled]);',
  'useEffect(() => { isAudioEnabledRef.current = isAudioEnabled; if (!isAudioEnabled) { isSpeakingRef.current = false; speechQueueRef.current = []; } }, [isAudioEnabled]);'
);

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched 3!");
