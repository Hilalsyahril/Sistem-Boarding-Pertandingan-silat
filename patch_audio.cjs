const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

const target1 = `if (activeSourceRef.current) {
        try { activeSourceRef.current.stop(); } catch (e) {}
        activeSourceRef.current = null;
      }`;
const replace1 = `if (activeSourceRef.current) {
        try { 
          if (activeSourceRef.current.stop) activeSourceRef.current.stop();
          if (activeSourceRef.current.pause) activeSourceRef.current.pause();
        } catch (e) {}
        activeSourceRef.current = null;
      }`;
code = code.replace(target1, replace1);

const target2 = `if (!globalAudioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        globalAudioCtx = new AudioContextClass();
      }
      if (globalAudioCtx.state === 'suspended') {
        await globalAudioCtx.resume();
      }
      const audioCtx = globalAudioCtx;
      
      const binaryString = atob(current.audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Decode MP3 audio data
      const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer);
      
      const source = audioCtx.createBufferSource();
      activeSourceRef.current = source;
      source.buffer = audioBuffer;
      // Normal tempo
      source.connect(audioCtx.destination);
      source.onended = () => {
        finishUtterance();
      };
      
      const durationMs = (audioBuffer.length / audioBuffer.sampleRate) * 1000;
      safetyTimeout = setTimeout(() => finishUtterance(), durationMs + 5000); // 5000ms generous padding
      source.start();`;
const replace2 = `const audio = new Audio("data:audio/mp3;base64," + current.audioData);
      activeSourceRef.current = audio;
      
      audio.onended = () => {
        finishUtterance();
      };
      
      audio.onerror = (e) => {
        console.warn("Audio element error", e);
        finishUtterance();
      };

      // 10 second fallback timeout
      safetyTimeout = setTimeout(() => finishUtterance(), 20000); 
      await audio.play();`;
code = code.replace(target2, replace2);

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched PublicDisplay.tsx to use HTML5 Audio");
