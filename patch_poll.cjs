const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');

code = code.replace(
  /if \(\!speechQueueRef\.current\.some\(item => item\.pesilatId === ann\.pesilatId\)\) \{/g,
  'if (!speechQueueRef.current.some(item => item.annId === ann.id)) {'
);

code = code.replace(
  /speechQueueRef\.current\.push\(\{ text: ann\.text, arenaNum: ann\.arenaNum, pesilatId: ann\.pesilatId \}\);/g,
  'speechQueueRef.current.push({ text: ann.text, arenaNum: ann.arenaNum, pesilatId: ann.pesilatId, annId: ann.id });'
);

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
