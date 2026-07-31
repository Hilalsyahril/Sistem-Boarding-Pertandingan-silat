const fs = require('fs');
try {
  const mapData = JSON.parse(fs.readFileSync('tmp3/dist/server.cjs.map', 'utf8'));
  const idx = mapData.sources.findIndex(s => s.includes('server.ts'));
  if (idx > -1) {
    fs.writeFileSync('extracted_server.ts', mapData.sourcesContent[idx]);
    console.log("Extracted!");
  } else {
    console.log("Not found in sources:", mapData.sources);
  }
} catch (e) {
  console.log(e);
}
