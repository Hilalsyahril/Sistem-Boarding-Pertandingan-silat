const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Fix Web Audio safety timeout padding
  const webAudioTarget = `      const durationMs = ((audioBuffer.length / audioBuffer.sampleRate) * 1000) / 1.15;
      safetyTimeout = setTimeout(() => finishUtterance(), durationMs + 500);`;
  const webAudioReplacement = `      const durationMs = ((audioBuffer.length / audioBuffer.sampleRate) * 1000) / 1.15;
      safetyTimeout = setTimeout(() => finishUtterance(), durationMs + 5000); // 5000ms generous padding`;
  if (code.includes(webAudioTarget)) code = code.replace(webAudioTarget, webAudioReplacement);

  // Fix Chrome TTS garbage collection bug
  const ttsTarget = `      utterance.onend = finishUtterance;
      utterance.onerror = finishUtterance;
      
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        finishUtterance();
      }`;
  const ttsReplacement = `      utterance.onend = () => {
        activeUtterancesRef.current = activeUtterancesRef.current.filter(u => u !== utterance);
        finishUtterance();
      };
      utterance.onerror = () => {
        activeUtterancesRef.current = activeUtterancesRef.current.filter(u => u !== utterance);
        finishUtterance();
      };
      
      try {
        activeUtterancesRef.current.push(utterance);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        activeUtterancesRef.current = activeUtterancesRef.current.filter(u => u !== utterance);
        finishUtterance();
      }`;
  if (code.includes(ttsTarget)) code = code.replace(ttsTarget, ttsReplacement);

  fs.writeFileSync(file, code);
}

patchFile('src/components/PublicDisplay.tsx');
