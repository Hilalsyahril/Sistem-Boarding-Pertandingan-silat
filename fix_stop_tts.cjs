const fs = require('fs');
let content = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');

const stopAnnouncingFunction = `  const announceMatch = (arenaNum: number, p: Pesilat) => {`;
const stopAnnouncingNew = `  const stopAnnouncing = (pesilatId: string) => {
    if (!pesilatId) return;
    const current = speechQueueRef.current[0];
    speechQueueRef.current = speechQueueRef.current.filter(item => item.pesilatId !== pesilatId);
    if (isSpeakingRef.current && current && current.pesilatId === pesilatId) {
      if (activeSourceRef.current) {
        try { activeSourceRef.current.pause(); } catch(e) {}
        activeSourceRef.current = null;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      isSpeakingRef.current = false;
      setTimeout(() => processQueue(), 500);
    }
  };

  const announceMatch = (arenaNum: number, p: Pesilat) => {`;

content = content.replace(stopAnnouncingFunction, stopAnnouncingNew);

const playChangeOld = `      const currentPlayingId = playingPesilat ? playingPesilat.id : "";

      if (currentPlayingId && currentPlayingId !== prevPlayingId) {
        // Ada partai baru yang mulai bermain di arenaNum!
        announcedIdsRef.current[arenaNum] = currentPlayingId;`;

const playChangeNew = `      const currentPlayingId = playingPesilat ? playingPesilat.id : "";

      if (currentPlayingId && currentPlayingId !== prevPlayingId) {
        if (prevPlayingId) {
          stopAnnouncing(prevPlayingId);
        }
        // Ada partai baru yang mulai bermain di arenaNum!
        announcedIdsRef.current[arenaNum] = currentPlayingId;`;

content = content.replace(playChangeOld, playChangeNew);

const playEmptyOld = `      } else if (!currentPlayingId && prevPlayingId) {
        // Arena menjadi kosong/standby
        announcedIdsRef.current[arenaNum] = "";
      }`;

const playEmptyNew = `      } else if (!currentPlayingId && prevPlayingId) {
        // Arena menjadi kosong/standby
        stopAnnouncing(prevPlayingId);
        announcedIdsRef.current[arenaNum] = "";
      }`;

content = content.replace(playEmptyOld, playEmptyNew);

fs.writeFileSync('src/components/PublicDisplay.tsx', content);
console.log("Patched stop TTS!");
