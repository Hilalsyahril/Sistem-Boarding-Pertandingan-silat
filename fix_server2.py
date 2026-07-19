with open('server.ts', 'r') as f:
    code = f.read()

# Add dummy variables
code = code.replace(
    'const PORT = 3000;',
    'const PORT = 3000;\nconst supabaseActive = false;\nconst supabaseUrl = null;\nconst supabaseAnonKey = null;'
)

with open('server.ts', 'w') as f:
    f.write(code)

print("Added variables")
