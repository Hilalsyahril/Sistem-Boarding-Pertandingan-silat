import re
with open('server.ts', 'r') as f:
    content = f.read()

content = re.sub(
    r'const isProd = process\.env\.NODE_ENV === "production" \|\| fs\.existsSync\(path\.join\(typeof __dirname !== "undefined" \? __dirname : process\.cwd\(\), "index\.html"\)\);',
    r'const isProd = process.env.NODE_ENV === "production" || !fs.existsSync(path.join(process.cwd(), "vite.config.ts"));',
    content
)

with open('server.ts', 'w') as f:
    f.write(content)
