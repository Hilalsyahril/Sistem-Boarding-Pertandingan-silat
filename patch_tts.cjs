const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const target = `app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=id&client=tw-ob\`;
    const ttsRes = await fetch(url);
    if (!ttsRes.ok) throw new Error("Google TTS failed");
    
    const arrayBuffer = await ttsRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    res.json({ audio: base64 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});`;

  const replacement = `app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    // Split text into chunks of ~150 chars to avoid Google TTS limit (200)
    const words = text.split(' ');
    const chunks = [];
    let currentChunk = '';
    
    for (const word of words) {
      if ((currentChunk + word).length > 150) {
        chunks.push(currentChunk.trim());
        currentChunk = word + ' ';
      } else {
        currentChunk += word + ' ';
      }
    }
    if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());

    const audioBuffers = [];
    for (const chunk of chunks) {
      const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(chunk)}&tl=id&client=tw-ob\`;
      const ttsRes = await fetch(url);
      if (!ttsRes.ok) throw new Error("Google TTS failed for chunk: " + chunk);
      const arrayBuffer = await ttsRes.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuffer));
    }
    
    // Simple MP3 concatenation by joining buffers (works for basic playback in AudioContext)
    const combinedBuffer = Buffer.concat(audioBuffers);
    const base64 = combinedBuffer.toString('base64');
    res.json({ audio: base64 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});`;

  if (code.includes(target)) code = code.replace(target, replacement);
  
  fs.writeFileSync(file, code);
}

patchFile('server.ts');
