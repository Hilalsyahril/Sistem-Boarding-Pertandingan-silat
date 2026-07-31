const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

const targetPoll = `            // check if already queued to avoid double
            if (!speechQueueRef.current.some(item => item.annId === ann.id)) {
              speechQueueRef.current.push({ text: ann.text, arenaNum: ann.arenaNum, pesilatId: ann.pesilatId, annId: ann.id });
              processQueue();
            }`;

const replacementPoll = `            // check if already queued to avoid double (mencegah penumpukan pesilatId yang sama di antrean)
            if (!speechQueueRef.current.some(item => item.annId === ann.id || item.pesilatId === ann.pesilatId)) {
              speechQueueRef.current.push({ text: ann.text, arenaNum: ann.arenaNum, pesilatId: ann.pesilatId, annId: ann.id });
              processQueue();
            }`;

code = code.replace(targetPoll, replacementPoll);
fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched polling check");
