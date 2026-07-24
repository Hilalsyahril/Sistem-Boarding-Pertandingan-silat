const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const newEndpoint = `
app.get("/api/download-zip", (req, res) => {
  const filePath = require('path').join(process.cwd(), 'public', 'deploy_cpanel.zip');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'deploy_cpanel.zip');
  } else {
    res.status(404).send('File not found');
  }
});
`;

if (!code.includes('/api/download-zip')) {
  code = code.replace('const isProd = process.env.NODE_ENV', newEndpoint + '\n  const isProd = process.env.NODE_ENV');
  fs.writeFileSync('server.ts', code);
  console.log('Added /api/download-zip');
} else {
  console.log('Endpoint already exists');
}
