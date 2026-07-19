const fs = require('fs');
async function run() {
  const text = "Partai 1, Gelanggang 1. Tanding Putra kelas A. Sudut biru Budi dari Kontingen B, melawan sudut merah Andi dari Kontingen A. Bersiaplah.";
  const url = "https://tiktok-tts.weilnet.workers.dev/api/generation";
  const ttsRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: text,
      voice: "id_001"
    })
  });
  const data = await ttsRes.json();
  console.log("Success:", data.success);
  console.log("Data length:", data.data ? data.data.length : 0);
}
run();
