const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');

const pollAnnouncements = `
  // Polling announcements
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isAudioEnabled) return;
      try {
        const res = await fetch(\`/api/announce?_t=\${Date.now()}\`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          for (const ann of data) {
            // check if already queued to avoid double
            if (!speechQueueRef.current.some(item => item.pesilatId === ann.pesilatId)) {
              speechQueueRef.current.push({ text: ann.text, arenaNum: ann.arenaNum, pesilatId: ann.pesilatId });
              processQueue();
            }
            await fetch(\`/api/announce/\${ann.id}\`, { method: "DELETE" });
          }
        }
      } catch (err) {
        console.error("Gagal memuat pengumuman:", err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isAudioEnabled]);
`;

code = code.replace("// Local real-time timer countdown loop", pollAnnouncements + "\n  // Local real-time timer countdown loop");

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
