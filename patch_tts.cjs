const fs = require('fs');

let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');
const targetTTS = `        setTimeout(() => {
            try {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.warn("Fallback TTS play failed", e);
                        finishUtterance();
                    });
                }
            } catch (e) {
                finishUtterance();
            }
        }, 50);`;

const replacementTTS = `        setTimeout(() => {
            if (!isSpeakingRef.current || speechQueueRef.current[0] !== current) return;
            try {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.warn("Fallback TTS play failed", e);
                        finishUtterance();
                    });
                }
            } catch (e) {
                finishUtterance();
            }
        }, 50);`;
        
code = code.replace(targetTTS, replacementTTS);
fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched TTS fallback delay");
