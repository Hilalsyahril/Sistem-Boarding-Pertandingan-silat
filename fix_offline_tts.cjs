const fs = require('fs');
let content = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');

const processQueueOld = `        const voices = window.speechSynthesis.getVoices();
        let idVoice = voices.find(v => 
          (v.lang.includes('id') || v.lang.includes('ID')) && 
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('perempuan') || v.name.toLowerCase().includes('cewek') || v.name.toLowerCase().includes('google bahasa indonesia'))
        );
        
        if (!idVoice) {
          idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
        }`;

const processQueueNew = `        const voices = window.speechSynthesis.getVoices();
        
        const isIndo = (v) => {
            const l = v.lang.toLowerCase();
            const n = v.name.toLowerCase();
            return l.startsWith('id') || l === 'in' || l.startsWith('in-id') || l.includes('indonesia') || n.includes('indonesia') || n.includes('bahasa') || n.includes('gadis') || n.includes('andika') || n.includes('ar-'); // Some systems might have weird codes
        };
        
        let idVoice = voices.find(v => 
          isIndo(v) && 
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('perempuan') || v.name.toLowerCase().includes('cewek') || v.name.toLowerCase().includes('gadis'))
        );
        
        if (!idVoice) {
          idVoice = voices.find(isIndo);
        }`;

content = content.replace(processQueueOld, processQueueNew);
fs.writeFileSync('src/components/PublicDisplay.tsx', content);
console.log("Patched offline TTS voice selection!");
