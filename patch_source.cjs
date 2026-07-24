const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const newEndpoint = `
app.get("/api/download-source", (req, res) => {
  const filePath = require('path').join(process.cwd(), 'public', 'source_code.zip');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'source_code.zip');
  } else {
    res.status(404).send('File not found');
  }
});
`;

if (!code.includes('/api/download-source')) {
  code = code.replace('app.get("/api/download-zip"', newEndpoint + '\n  app.get("/api/download-zip"');
  fs.writeFileSync('server.ts', code);
  console.log('Added /api/download-source');
} else {
  console.log('Endpoint already exists');
}
