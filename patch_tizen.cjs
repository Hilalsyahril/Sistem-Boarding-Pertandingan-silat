const fs = require('fs');
let content = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');

const processQueueOld = `    const playFallbackTTS = () => {
      try {
        const url = \`https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=id&q=\${encodeURIComponent(current.text)}\`;
        const audio = audioRef.current || new Audio(url);
        if (audioRef.current) {
            audio.src = url;
            audio.volume = 1;
        }
        activeSourceRef.current = audio;
        audio.onended = () => finishUtterance();
        audio.onerror = (e) => {
          console.warn("Fallback TTS error", e);
          finishUtterance();
        };
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.warn("Fallback TTS play failed", e);
                finishUtterance();
            });
        }
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

const processQueueNew = `    const playFallbackTTS = () => {
      try {
        const url = \`https://translate.googleapis.com/translate_tts?client=tw-ob&ie=UTF-8&tl=id&q=\${encodeURIComponent(current.text)}\`;
        const audio = audioRef.current;
        if (audio) {
            audio.src = url;
            audio.volume = 1;
            audio.load();
        } else {
            finishUtterance();
            return;
        }
        activeSourceRef.current = audio;
        audio.onended = () => finishUtterance();
        audio.onerror = (e) => {
          console.warn("Fallback TTS error", e);
          finishUtterance();
        };
        
        setTimeout(() => {
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
        }, 150);

        if (safetyTimeout) clearTimeout(safetyTimeout);
        safetyTimeout = setTimeout(() => finishUtterance(), 20000);
      } catch (err) {
        finishUtterance();
      }
    };

    try {
      const isTizen = navigator.userAgent.toLowerCase().includes('tizen');
      
      if (!isTizen && 'speechSynthesis' in window && window.speechSynthesis.getVoices().length > 0) {
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

content = content.replace(processQueueOld.trim(), processQueueNew.trim());
fs.writeFileSync('src/components/PublicDisplay.tsx', content);
console.log("Patched Tizen!");
