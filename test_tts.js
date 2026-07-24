const text = "Halo testing tiktok tts";
fetch("https://tiktok-tts.weilnet.workers.dev/api/generation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        voice: "id_001"
      })
    }).then(res => res.json()).then(data => console.log(data)).catch(err => console.error(err));
