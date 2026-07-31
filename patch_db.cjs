const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Update pgPool table creation
code = code.replace(/arena INT2 DEFAULT 1,/g, "arena TEXT DEFAULT '1',");
code = code.replace(/arena INTEGER,/g, "arena TEXT,");

// Add ALTER TABLE for pgPool to change arena type
const alterRegex = /await pgPool\.query\(\`ALTER TABLE pengaturan_arena ADD COLUMN auto_next BOOLEAN DEFAULT true\`\);/g;
const alterReplacement = `await pgPool.query(\`ALTER TABLE pengaturan_arena ADD COLUMN auto_next BOOLEAN DEFAULT true\`);
    try {
      await pgPool.query(\`ALTER TABLE pesilat ALTER COLUMN arena TYPE TEXT USING arena::TEXT\`);
    } catch(e) {
      // Ignored if already text or column doesn't exist yet
    }`;
code = code.replace(alterRegex, alterReplacement);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts DB schema");
