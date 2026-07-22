const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  'const DB_URL = process.env.DATABASE_URL;',
  `const DB_URL = process.env.DATABASE_URL || (process.env.DB_HOST ? \`mysql://\${process.env.DB_USER}:\${process.env.DB_PASS}@\${process.env.DB_HOST}/\${process.env.DB_NAME}\` : undefined);`
);
fs.writeFileSync('server.ts', code);
