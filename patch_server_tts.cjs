const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/const data = await ttsRes\.json\(\);\n\s*if \(!data\.success\) throw new Error\("TikTok TTS failed: " \+ data\.error\);/, 
`const data = await ttsRes.json();
    console.log("TTS Response Data:", JSON.stringify(data).substring(0, 100));
    if (!data.success) throw new Error("TikTok TTS failed: " + data.error);`);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
