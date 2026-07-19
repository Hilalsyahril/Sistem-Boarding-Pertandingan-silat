const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  const target = `    } catch (err) {
      console.warn("High-quality TTS failed, falling back to browser synthesis:", err);
      if (!("speechSynthesis" in window)) {
        finishUtterance();
        return;
      }
      
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(current.text);
      const voices = window.speechSynthesis.getVoices();
      let idVoice = voices.find(v => (v.lang.includes("id") || v.lang.includes("ID")) && (v.name.includes("Natural") || v.name.includes("Online")));
      if (!idVoice) idVoice = voices.find(v => (v.lang.includes("id") || v.lang.includes("ID")) && v.name.includes("Premium"));
      if (!idVoice) idVoice = voices.find(v => (v.lang.includes("id") || v.lang.includes("ID")) && v.name.includes("Google"));
      if (!idVoice) idVoice = voices.find(v => (v.lang.includes("id") || v.lang.includes("ID")));
      if (idVoice) utterance.voice = idVoice;
      utterance.lang = "id-ID";
      utterance.rate = 0.82;
      utterance.pitch = 0.95;

      const charCount = current.text.length;
      const estimatedDurationMs = Math.max(5000, (charCount * 150) + 2000);
      safetyTimeout = setTimeout(() => {
        finishUtterance();
      }, estimatedDurationMs);

      utterance.onend = () => {
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
      }
    }`;
    
  const replacement = `    } catch (err) {
      console.warn("TTS failed:", err);
      finishUtterance();
    }`;

  if (code.includes(target)) code = code.replace(target, replacement);
  
  const announceMatchTarget1 = `  const announceMatch = (arenaNum: number, p: Pesilat) => {
    if (!isAudioEnabled) return;
    if (!("speechSynthesis" in window)) {
      console.warn("Speech Synthesis tidak didukung di browser ini.");
      return;
    }`;
  const announceMatchReplacement1 = `  const announceMatch = (arenaNum: number, p: Pesilat) => {
    if (!isAudioEnabled) return;`;
  
  if (code.includes(announceMatchTarget1)) code = code.replace(announceMatchTarget1, announceMatchReplacement1);

  fs.writeFileSync(file, code);
}

patchFile('src/components/PublicDisplay.tsx');
