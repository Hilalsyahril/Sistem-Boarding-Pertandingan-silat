// Entry point for cPanel Node.js Selector (Phusion Passenger)
const fs = require('fs');
const http = require('http');

process.on('uncaughtException', (err) => {
    try { fs.appendFileSync('startup_error.log', new Date().toISOString() + ' Uncaught Exception: ' + (err.stack || err) + '\n'); } catch (e) {}
});

process.on('unhandledRejection', (reason, promise) => {
    try { fs.appendFileSync('startup_error.log', new Date().toISOString() + ' Unhandled Rejection: ' + String(reason) + '\n'); } catch (e) {}
});

try {
    require('./dist/server.cjs');
} catch (e) {
    try { fs.appendFileSync('startup_error.log', new Date().toISOString() + ' Sync Error: ' + (e.stack || String(e)) + '\n'); } catch (e) {}
    
    // Start a fallback server so Passenger doesn't show the generic error page
    const port = process.env.PORT || 3000;
    const server = http.createServer((req, res) => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end("Startup Error (Check startup_error.log):\n" + (e.stack || String(e)));
    });
    server.listen(port);
}
