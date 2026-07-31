const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/timer_last_updated_at BIGINT,/g, "timer_last_updated_at BIGINT,\n      created_at BIGINT,");

const alterRegex = /await pgPool\.query\(\`ALTER TABLE pengaturan_arena ADD COLUMN auto_next BOOLEAN DEFAULT true\`\);/g;
const alterReplacement = `await pgPool.query(\`ALTER TABLE pengaturan_arena ADD COLUMN auto_next BOOLEAN DEFAULT true\`);
    try {
      await pgPool.query(\`ALTER TABLE pesilat ADD COLUMN created_at BIGINT\`);
    } catch(e) {}
    try {
      await pgPool.query(\`UPDATE pesilat SET created_at = 0 WHERE created_at IS NULL\`);
    } catch(e) {}`;
code = code.replace(alterRegex, alterReplacement);

fs.writeFileSync('server.ts', code);
console.log("Patched schema!");
