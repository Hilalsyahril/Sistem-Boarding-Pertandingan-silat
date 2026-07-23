const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `const pgPool = rawPool ? {
  query: async (text: string, params: any[] = []) => {
    let sql = text.replace(/\\$[0-9]+/g, "?");
    
    // Postgres to MySQL specific fixes`;

const newCode = `const pgPool = rawPool ? {
  query: async (text: string, params: any[] = []) => {
    let newParams: any[] = [];
    let hasParams = false;
    let sql = text.replace(/\\$([0-9]+)/g, (match, p1) => {
      hasParams = true;
      const index = parseInt(p1, 10) - 1;
      newParams.push(params[index]);
      return "?";
    });
    
    let finalParams = hasParams ? newParams : params;
    
    // Postgres to MySQL specific fixes`;

code = code.replace(oldCode, newCode);

// We also need to replace the query execution line
const oldExec = `const [result] = await rawPool!.query(sql, params);`;
const newExec = `const [result] = await rawPool!.query(sql, finalParams);`;

code = code.replace(oldExec, newExec);

fs.writeFileSync('server.ts', code);
console.log("Patched pgPool params order");
