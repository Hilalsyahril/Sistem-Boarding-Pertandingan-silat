const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');

const target = `    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: current.text })
      });`;

const replacement = `    try {
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: current.text }),
        signal: controller.signal
      });
      clearTimeout(fetchTimeout);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/PublicDisplay.tsx', code);
