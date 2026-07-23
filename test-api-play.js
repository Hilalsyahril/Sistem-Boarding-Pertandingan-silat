import fetch from "node-fetch";

async function run() {
  const res = await fetch("http://localhost:3000/api/pesilat");
  const data = await res.json();
  console.log("pesilats:", data);
  if (data.length > 0) {
    const id = data[0].id;
    console.log("Playing ID:", id);
    const playRes = await fetch(`http://localhost:3000/api/pesilat/${id}/play?_method=PUT`, { method: "POST" });
    const playData = await playRes.text();
    console.log("playRes:", playData);
  }
}
run();
