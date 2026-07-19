const fs = require('fs');
function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const refTarget = `  const speechQueueRef = useRef<{ text: string; arenaNum: number; pesilatId: string; annId?: string }[]>([]);`;
  const refReplacement = `  const speechQueueRef = useRef<{ text: string; arenaNum: number; pesilatId: string; annId?: string; fetching?: boolean; audioData?: string; failed?: boolean }[]>([]);`;
  if (code.includes(refTarget)) code = code.replace(refTarget, refReplacement);

  const target = `  const processQueue = async () => {
    if (!isAudioEnabled) {
      speechQueueRef.current = [];
      isSpeakingRef.current = false;
      return;
    }
    if (isSpeakingRef.current) return;
    if (speechQueueRef.current.length === 0) return;

    const current = speechQueueRef.current[0];
    isSpeakingRef.current = true;

    let isDone = false;
    let safetyTimeout: any;

    const finishUtterance = () => {
      if (isDone) return;
      isDone = true;
      if (safetyTimeout) clearTimeout(safetyTimeout);
      isSpeakingRef.current = false;
      speechQueueRef.current.shift();
      setTimeout(() => {
        processQueue();
      }, 150);
    };

    try {
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: current.text }),
        signal: controller.signal
      });
      clearTimeout(fetchTimeout);
      if (!res.ok) throw new Error("TTS Backend failed");
      const data = await res.json();
      if (!data.audio) throw new Error("No audio returned");

      if (!globalAudioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        globalAudioCtx = new AudioContextClass();
      }
      if (globalAudioCtx.state === 'suspended') {
        await globalAudioCtx.resume();
      }
      const audioCtx = globalAudioCtx;
      
      const binaryString = atob(data.audio);`;

  const replacement = `  const fetchTTS = async (item: any) => {
    if (item.audioData || item.fetching || item.failed) return;
    item.fetching = true;
    try {
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: item.text }),
        signal: controller.signal
      });
      clearTimeout(fetchTimeout);
      if (!res.ok) throw new Error("TTS Backend failed");
      const data = await res.json();
      if (data.audio) {
        item.audioData = data.audio;
      } else {
        item.failed = true;
      }
    } catch(e) {
      console.warn("TTS fetch failed", e);
      item.failed = true;
    }
    processQueue();
  };

  const processQueue = async () => {
    if (!isAudioEnabled) {
      speechQueueRef.current = [];
      isSpeakingRef.current = false;
      return;
    }
    if (speechQueueRef.current.length === 0) return;
    
    // Trigger background fetch for all items in queue
    speechQueueRef.current.forEach(i => fetchTTS(i));

    const current = speechQueueRef.current[0];
    
    // Wait for the current item to finish fetching
    if (!current.audioData && !current.failed) {
      return;
    }

    if (isSpeakingRef.current) return;
    isSpeakingRef.current = true;

    let isDone = false;
    let safetyTimeout: any;

    const finishUtterance = () => {
      if (isDone) return;
      isDone = true;
      if (safetyTimeout) clearTimeout(safetyTimeout);
      isSpeakingRef.current = false;
      speechQueueRef.current.shift();
      setTimeout(() => {
        processQueue();
      }, 150);
    };

    try {
      if (current.failed || !current.audioData) throw new Error("Audio data not available");

      if (!globalAudioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        globalAudioCtx = new AudioContextClass();
      }
      if (globalAudioCtx.state === 'suspended') {
        await globalAudioCtx.resume();
      }
      const audioCtx = globalAudioCtx;
      
      const binaryString = atob(current.audioData);`;
    
  if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log("Patched successfully!");
  } else {
    console.log("Target not found");
  }
  
  fs.writeFileSync(file, code);
}

patchFile('src/components/PublicDisplay.tsx');
