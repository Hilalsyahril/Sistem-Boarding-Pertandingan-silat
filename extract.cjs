const fs = require('fs');
const mapData = JSON.parse(fs.readFileSync('dist/server.cjs.map', 'utf8'));
const idx = mapData.sources.indexOf('../server.ts');
if (idx !== -1) {
  fs.writeFileSync('server.ts', mapData.sourcesContent[idx]);
  console.log('Restored server.ts!');
} else {
  console.log('server.ts not found in sourcemap');
}
