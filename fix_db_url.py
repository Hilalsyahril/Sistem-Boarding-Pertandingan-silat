with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'const DB_URL = process.env.DATABASE_URL || (process.env.DB_HOST ? `mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}` : undefined);',
    'const DB_URL = process.env.DATABASE_URL || (process.env.DB_HOST ? `mysql://${process.env.DB_USER || "root"}:${process.env.DB_PASS || ""}@${process.env.DB_HOST}/${process.env.DB_NAME || "test"}` : undefined);'
)

with open('server.ts', 'w') as f:
    f.write(content)
