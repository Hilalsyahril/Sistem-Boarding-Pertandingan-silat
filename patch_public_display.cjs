const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

const replacement = `  const processQueue = async () => {
    if (!isAudioEnabledRef.current) {
      speechQueueRef.current = [];
      isSpeakingRef.current = false;
      return;
    }

    // Hanya pertahankan antrean untuk pesilat yang SAAT INI sedang bermain (menghindari penumpukan dan ketidaksesuaian tampilan)
    const currentPesilats = pesilatListRef.current;
    speechQueueRef.current = speechQueueRef.current.filter(item => {
      const p = currentPesilats.find(p => p.id === item.pesilatId);
      return p && p.is_playing;
    });

    if (speechQueueRef.current.length === 0) {
      isSpeakingRef.current = false;
      return;
    }

    if (isSpeakingRef.current) return;
    isSpeakingRef.current = true;
    const current = speechQueueRef.current[0];`;

code = code.replace(/  const processQueue = async \(\) => {[\s\S]*?const current = speechQueueRef\.current\[0\];/, replacement);
fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched processQueue");
