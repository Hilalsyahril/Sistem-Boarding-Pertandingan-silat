import re

with open('server.ts', 'r') as f:
    code = f.read()

# 1. Remove handleSupabaseError calls
code = re.sub(r'handleSupabaseError\(.*?\);\n', '', code)

# 2. Fix config status block
# It looks like:
# return res.json({
#   configured: supabaseActive,
#   ...
# });
code = re.sub(
    r'return res\.json\(\{\s*configured: supabaseActive,.*?\}\);',
    'return res.json({ configured: true, supabaseUrl: null, supabaseAnonKey: null, mode: "local_fallback" });',
    code,
    flags=re.DOTALL
)

# 3. Add `let fallbackInterval: any = null;` to PublicDisplay.tsx
with open('src/components/PublicDisplay.tsx', 'r') as f:
    frontend_code = f.read()

frontend_code = re.sub(r'// --- LOCAL POLLING ---', '// --- LOCAL POLLING ---\n    let fallbackInterval: any = null;', frontend_code)

with open('server.ts', 'w') as f:
    f.write(code)

with open('src/components/PublicDisplay.tsx', 'w') as f:
    f.write(frontend_code)

print("Fixed syntax errors")
