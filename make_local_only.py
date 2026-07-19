import re

with open('server.ts', 'r') as f:
    code = f.read()

# 1. Force supabaseActive to false always
# Replace the old logic with a simple false
code = re.sub(
    r'const isSupabaseConfigured = !!\(.*?\);[\s\S]*?let supabaseActive = isSupabaseConfigured;',
    'const isSupabaseConfigured = false;\nlet supabaseActive = false;',
    code,
    flags=re.DOTALL
)

# 2. To be completely sure, replace the getSupabaseClient function to always return null
code = re.sub(
    r'function getSupabaseClient\(\) \{[\s\S]*?\n\}',
    'function getSupabaseClient() {\n  return null;\n}',
    code,
    flags=re.DOTALL
)

# 3. Remove supabase-js import just in case
code = re.sub(
    r'import \{ createClient \} from "@supabase/supabase-js";\n?',
    '',
    code
)

with open('server.ts', 'w') as f:
    f.write(code)

print("Server is now 100% local database")
