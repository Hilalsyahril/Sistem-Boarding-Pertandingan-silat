import re
with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'import { createServer as createViteServer } from "vite";\n',
    ''
)

content = content.replace(
    'const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });',
    'const { createServer: createViteServer } = await import("vite");\n    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });'
)

with open('server.ts', 'w') as f:
    f.write(content)
