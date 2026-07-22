with open('server.ts', 'r') as f:
    content = f.read()

# Add import fs from "fs" after import express
content = content.replace('import express from "express";', 'import express from "express";\nimport fs from "fs";')

# Replace first require("fs") and require("path")
content = content.replace(
    'const isProd = process.env.NODE_ENV === "production" || require("fs").existsSync(require("path").join(typeof __dirname !== "undefined" ? __dirname : process.cwd(), "index.html"));',
    'const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.join(typeof __dirname !== "undefined" ? __dirname : process.cwd(), "index.html"));'
)

# Replace second require('fs')
content = content.replace("const fs = require('fs');", "")

with open('server.ts', 'w') as f:
    f.write(content)
