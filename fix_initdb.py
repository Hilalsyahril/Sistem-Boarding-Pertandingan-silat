with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace(
    '  await initDb();',
    '  try {\n    await initDb();\n  } catch (err) {\n    console.error("Failed to initialize database:", err);\n  }'
)

with open('server.ts', 'w') as f:
    f.write(content)
