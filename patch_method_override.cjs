const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const middleware = `
app.use(express.json());

// Method override middleware for cPanel / ModSecurity blocking PUT/DELETE
app.use((req, res, next) => {
  if (req.query._method && req.method === 'POST') {
    req.method = req.query._method.toUpperCase();
  }
  next();
});
`;

code = code.replace('app.use(express.json());', middleware);
fs.writeFileSync('server.ts', code);
