const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const ttsRes = await fetch("https://tiktok-tts.weilnet.workers.dev/api/generation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: "id_001" })
    });
    
    const json = await ttsRes.json();
    if (json.success && json.data) {
      res.json({ audio: json.data });
    } else {
      throw new Error(json.error || "Failed to generate audio");
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});`;

const replacement = `app.post("/api/tts", async (req, res) => {
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

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
