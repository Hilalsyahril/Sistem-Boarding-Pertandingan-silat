import re

with open('server.ts', 'r') as f:
    code = f.read()

code = re.sub(
    r'res\.json\(\{\s*configured: supabaseActive[\s\S]*?\}\);',
    'res.json({ configured: true, supabaseUrl: null, supabaseAnonKey: null, mode: "local_fallback" });',
    code
)

with open('server.ts', 'w') as f:
    f.write(code)

