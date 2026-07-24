const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

// Replace forEach with just current
code = code.replace(/\/\/ Trigger background fetch for all items in queue\n\s*speechQueueRef\.current\.forEach\(i => fetchTTS\(i\)\);/, 
`// Only fetch the current item to avoid rate limits
    fetchTTS(speechQueueRef.current[0]);
    // Pre-fetch the next item if it exists
    if (speechQueueRef.current.length > 1) {
      setTimeout(() => fetchTTS(speechQueueRef.current[1]), 2000);
    }`);

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched fetch queue");
