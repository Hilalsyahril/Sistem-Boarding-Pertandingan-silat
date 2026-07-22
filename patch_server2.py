with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace('import fs from "fs";\\n  const isProd', 'const fs = await import("fs");\\n  const isProd')

with open('server.ts', 'w') as f:
    f.write(content)
