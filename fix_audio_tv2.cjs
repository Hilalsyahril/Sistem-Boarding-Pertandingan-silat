const fs = require('fs');
let content = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');

const oldHandleInteraction = `  const handleInteraction = () => {
    setHasInteracted(true);
    
    // Unlock Web Audio API
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!globalAudioCtx) {
        globalAudioCtx = new AudioContextClass();
      }
      if (globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
      }
    } catch (e) {
      console.warn("Failed to initialize AudioContext", e);
    }
  };`;

const newHandleInteraction = `  const handleInteraction = () => {
    setHasInteracted(true);
    
    // Unlock Web Audio API & HTML5 Audio
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!globalAudioCtx) {
        globalAudioCtx = new AudioContextClass();
      }
      if (globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
      }
    } catch (e) {
      console.warn("Failed to initialize AudioContext", e);
    }

    if (audioRef.current) {
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        audioRef.current.pause();
        audioRef.current.volume = 1;
      }).catch(() => {});
    }
    
    if ('speechSynthesis' in window) {
      try {
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }
  };`;

content = content.replace(oldHandleInteraction, newHandleInteraction);
fs.writeFileSync('src/components/PublicDisplay.tsx', content);
console.log("Updated handleInteraction!");
