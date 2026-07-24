const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

code = code.replace(
  'const isSpeakingRef = useRef<boolean>(false);',
  'const isSpeakingRef = useRef<boolean>(false);\n  const activeSourceRef = useRef<any>(null);'
);

code = code.replace(
  'useEffect(() => { isAudioEnabledRef.current = isAudioEnabled; if (!isAudioEnabled) { isSpeakingRef.current = false; speechQueueRef.current = []; } }, [isAudioEnabled]);',
  'useEffect(() => {\n    isAudioEnabledRef.current = isAudioEnabled;\n    if (!isAudioEnabled) {\n      isSpeakingRef.current = false;\n      speechQueueRef.current = [];\n      if (activeSourceRef.current) {\n        try { activeSourceRef.current.stop(); } catch (e) {}\n        activeSourceRef.current = null;\n      }\n      if ("speechSynthesis" in window) {\n        window.speechSynthesis.cancel();\n      }\n    }\n  }, [isAudioEnabled]);'
);

code = code.replace(
  '      isSpeakingRef.current = false;\n      speechQueueRef.current.shift();',
  '      isSpeakingRef.current = false;\n      if (speechQueueRef.current[0] === current) {\n        speechQueueRef.current.shift();\n      }'
);

code = code.replace(
  '      const source = audioCtx.createBufferSource();',
  '      const source = audioCtx.createBufferSource();\n      activeSourceRef.current = source;'
);

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched 4!");
