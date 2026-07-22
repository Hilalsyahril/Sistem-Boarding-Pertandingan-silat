with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace('import fs from "fs";', 'const fs = require("fs");')

if 'const fs = require("fs");' in content:
    content = content.replace('const fs = require("fs");', 'import fs from "fs";', 1)
    
with open('server.ts', 'w') as f:
    # also we need to put it at the top
    pass

import re
with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace('import fs from "fs";\n  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.join(typeof __dirname !== "undefined" ? __dirname : process.cwd(), "index.html"));', 'const fs = await import("fs");\n  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.join(typeof __dirname !== "undefined" ? __dirname : process.cwd(), "index.html"));')

with open('server.ts', 'w') as f:
    f.write(content)
