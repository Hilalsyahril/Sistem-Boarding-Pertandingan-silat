const fs = require('fs');
let content = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');

// 1. Add audioRef
if (!content.includes('const audioRef = useRef<HTMLAudioElement | null>(null);')) {
    content = content.replace(
        'const activeSourceRef = useRef<any>(null);',
        'const activeSourceRef = useRef<any>(null);\n  const audioRef = useRef<HTMLAudioElement | null>(null);'
    );
}

// 2. Add audio element to DOM
if (!content.includes('<audio ref={audioRef} className="hidden" />')) {
    content = content.replace(
        '{/* HEADER UTAMA',
        '<audio ref={audioRef} className="hidden" preload="auto" />\n      {/* HEADER UTAMA'
    );
}

// 3. Update handleInteraction to unlock audio
const handleInteractionOld = `const handleInteraction = () => {
    setHasInteracted(true);
  };`;

const handleInteractionNew = `const handleInteraction = () => {
    setHasInteracted(true);
    if (audioRef.current) {
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        audioRef.current.pause();
        audioRef.current.volume = 1;
      }).catch(() => {});
    }
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  };`;

if (content.includes(handleInteractionOld)) {
    content = content.replace(handleInteractionOld, handleInteractionNew);
} else {
    // try a more fuzzy replace
    content = content.replace(
        /const handleInteraction = \(\) => \{\s*setHasInteracted\(true\);\s*\};/g,
        handleInteractionNew
    );
}

// 4. Update playFallbackTTS to use audioRef and alternative TTS url
const fallbackOld = `const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(current.text)}&tl=id&client=tw-ob\`;
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
        });`;

const fallbackNew = `const url = \`https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=id&q=\${encodeURIComponent(current.text)}\`;
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
        }`;

content = content.replace(fallbackOld, fallbackNew);

fs.writeFileSync('src/components/PublicDisplay.tsx', content);
console.log("Audio fixed for TV!");
