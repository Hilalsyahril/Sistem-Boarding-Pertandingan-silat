with open('server.ts', 'r') as f:
    content = f.read()

# We need to move app.listen outside of startServer, or move await initDb inside a separate async IIFE.
# Wait, actually, let's just move app.listen out of startServer completely? 
# But we need to use vite async import...

content = content.replace('''  app.listen(PORT as number, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();''', '''}
app.listen(PORT as number, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
startServer();''')

with open('server.ts', 'w') as f:
    f.write(content)
