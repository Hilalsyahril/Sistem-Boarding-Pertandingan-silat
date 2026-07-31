const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regex = /<div className="mt-8 border-t border-slate-800 pt-6">[\s\S]*?<a\s+href="\/deploy_cpanel\.zip"[\s\S]*?<\/a>\s*<\/div>/g;
code = code.replace(regex, '');

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Removed CPanel button!");
