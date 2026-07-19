import re

with open('src/components/PublicDisplay.tsx', 'r') as f:
    code = f.read()

# Remove import
code = re.sub(
    r'import \{ createClient \} from "@supabase/supabase-js";\n?',
    '',
    code
)

# Replace the supabase setup block in useEffect with just the failsafe polling
# Find the start of useEffect block inside `useEffect(() => { ... initApp(); ...`
# Let's just find the supabase client creation and remove it.

code = re.sub(
    r'let supabaseClient: any = null;.*?// --- FAILSAFE BACKUP POLLING ---',
    '// --- LOCAL POLLING ---',
    code,
    flags=re.DOTALL
)

# Remove the cleanup of supabase subscriptions
code = re.sub(r'if \(arenaSubscription\) \{.*?\}', '', code, flags=re.DOTALL)
code = re.sub(r'if \(pesilatSubscription\) \{.*?\}', '', code, flags=re.DOTALL)

with open('src/components/PublicDisplay.tsx', 'w') as f:
    f.write(code)

with open('src/components/AdminDashboard.tsx', 'r') as f:
    code = f.read()

# Remove supabase import in admin dashboard if any
code = re.sub(
    r'import \{ createClient \} from "@supabase/supabase-js";\n?',
    '',
    code
)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(code)

print("Frontend patched")
