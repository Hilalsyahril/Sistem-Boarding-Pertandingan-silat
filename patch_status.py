import re
with open('server.ts', 'r') as f:
    content = f.read()

# Replace all res.status(500).json(...) with res.status(200).json({ error: ..., is_500: true })
content = re.sub(
    r'res\.status\(500\)\.json\(\{ error: (.*?) \}\);',
    r'res.status(200).json({ error: \1, is_500: true });',
    content
)

with open('server.ts', 'w') as f:
    f.write(content)
