const fs = require('fs');
let content = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');

const processQueueOld = `
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(current.text);
        utterance.lang = 'id-ID';
        
        const voices = window.speechSynthesis.getVoices();
        
        // Priority 1: explicitly indonesian + female / cewek / perempuan
        let idVoice = voices.find(v => 
          (v.lang.includes('id') || v.lang.includes('ID')) && 
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('perempuan') || v.name.toLowerCase().includes('cewek') || v.name.toLowerCase().includes('google bahasa indonesia'))
        );
        
        // Priority 2: any indonesian voice
        if (!idVoice) {
          idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
        }
        
        if (idVoice) {
          utterance.voice = idVoice;
        }

        // Slight adjustments for more natural voice if possible
        utterance.rate = 0.9;
        utterance.pitch = 1.1;

        utterance.onend = () => finishUtterance();
        utterance.onerror = (e) => {
          console.warn("Native TTS error", e);
          finishUtterance();
        };

        window.speechSynthesis.speak(utterance);
        
        // Safety timeout in case onend never fires
        safetyTimeout = setTimeout(() => finishUtterance(), 20000);
      } else {
        throw new Error("Native Web Speech API not supported");
      }
    } catch (err) {
      console.warn("TTS failed:", err);
      finishUtterance();
    }
`;

const processQueueNew = `
    const playFallbackTTS = () => {
      try {
        const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(current.text)}&tl=id&client=tw-ob\`;
        const audio = new Audio(url);
        activeSourceRef.current = audio;
        audio.onended = () => finishUtterance();
        audio.onerror = (e) => {
          console.warn("Fallback TTS error", e);
          finishUtterance();
        };
        audio.play().catch(e => {
          console.warn("Fallback TTS play failed", e);
          finishUtterance();
        });
        if (safetyTimeout) clearTimeout(safetyTimeout);
        safetyTimeout = setTimeout(() => finishUtterance(), 20000);
      } catch (err) {
        finishUtterance();
      }
    };

    try {
      if ('speechSynthesis' in window && window.speechSynthesis.getVoices().length > 0) {
        const utterance = new SpeechSynthesisUtterance(current.text);
        utterance.lang = 'id-ID';
        
        const voices = window.speechSynthesis.getVoices();
        let idVoice = voices.find(v => 
          (v.lang.includes('id') || v.lang.includes('ID')) && 
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('perempuan') || v.name.toLowerCase().includes('cewek') || v.name.toLowerCase().includes('google bahasa indonesia'))
        );
        
        if (!idVoice) {
          idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
        }
        
        if (idVoice) {
          utterance.voice = idVoice;
        }

        utterance.rate = 0.9;
        utterance.pitch = 1.1;

        utterance.onend = () => finishUtterance();
        utterance.onerror = (e) => {
          console.warn("Native TTS error", e);
          if (safetyTimeout) clearTimeout(safetyTimeout);
          playFallbackTTS();
        };

        window.speechSynthesis.speak(utterance);
        safetyTimeout = setTimeout(() => finishUtterance(), 20000);
      } else {
        playFallbackTTS();
      }
    } catch (err) {
      console.warn("TTS failed:", err);
      playFallbackTTS();
    }
`;

if (content.includes("throw new Error(\"Native Web Speech API not supported\");")) {
    content = content.replace(processQueueOld.trim(), processQueueNew.trim());
    fs.writeFileSync('src/components/PublicDisplay.tsx', content);
    console.log("Replaced!");
} else {
    console.log("Not found or already replaced.");
}
