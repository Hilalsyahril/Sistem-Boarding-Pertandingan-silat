const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const fetchTarget = `      if (data.audio) {
        item.audioData = data.audio;
      } else {
        item.failed = true;
      }
    } catch(e) {
      console.warn("TTS fetch failed", e);
      item.failed = true;
    }`;
  
  const fetchReplacement = `      if (data.audio) {
        item.audioData = data.audio;
      } else {
        throw new Error("No audio returned");
      }
    } catch(e) {
      console.warn("TTS fetch failed, falling back to native browser TTS", e);
      item.useNativeFallback = true;
    }`;

  if (code.includes(fetchTarget)) code = code.replace(fetchTarget, fetchReplacement);

  const refTarget = `annId?: string; fetching?: boolean; audioData?: string; failed?: boolean }[]>([])`;
  const refReplacement = `annId?: string; fetching?: boolean; audioData?: string; failed?: boolean; useNativeFallback?: boolean }[]>([])`;
  if (code.includes(refTarget)) code = code.replace(refTarget, refReplacement);


  const waitTarget = `    // Wait for the current item to finish fetching
    if (!current.audioData && !current.failed) {
      return;
    }`;
  const waitReplacement = `    // Wait for the current item to finish fetching
    if (!current.audioData && !current.failed && !current.useNativeFallback) {
      return;
    }`;
  if (code.includes(waitTarget)) code = code.replace(waitTarget, waitReplacement);

  const playTarget = `    try {
      if (current.failed || !current.audioData) throw new Error("Audio data not available");

      if (!globalAudioCtx) {`;
  const playReplacement = `    try {
      if (current.useNativeFallback) {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(current.text);
          utterance.lang = 'id-ID';
          
          // Try to find Indonesian voice
          const voices = window.speechSynthesis.getVoices();
          const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
          if (idVoice) utterance.voice = idVoice;

          utterance.onend = () => finishUtterance();
          utterance.onerror = (e) => {
            console.warn("Native TTS error", e);
            finishUtterance();
          };
          window.speechSynthesis.speak(utterance);
          
          // Safety timeout
          safetyTimeout = setTimeout(() => finishUtterance(), 15000);
          return;
        } else {
          throw new Error("Native Web Speech API not supported");
        }
      }

      if (current.failed || !current.audioData) throw new Error("Audio data not available");

      if (!globalAudioCtx) {`;
  if (code.includes(playTarget)) code = code.replace(playTarget, playReplacement);

  fs.writeFileSync(file, code);
  console.log("Patched TTS fallback");
}

patchFile('src/components/PublicDisplay.tsx');
