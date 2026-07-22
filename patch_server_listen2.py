import re
with open('server.ts', 'r') as f:
    content = f.read()

content = re.sub(
    r'  app\.listen\(PORT as number, "0\.0\.0\.0", \(\) => \{\n    console\.log\(`Server running at http://0\.0\.0\.0:\$\{PORT\}`\);\n  \}\);\n\}',
    r'}\n\napp.listen(PORT as number, "0.0.0.0", () => {\n  console.log(`Server running at http://0.0.0.0:${PORT}`);\n});',
    content
)

with open('server.ts', 'w') as f:
    f.write(content)
