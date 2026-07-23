const fs = require('fs');
const glob = require('fs').readdirSync('src/components').map(f => 'src/components/' + f);

glob.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Regex to replace fetch('/api/...', { method: 'PUT' })
  // We need to capture the URL and append ?_method=PUT
  content = content.replace(/fetch\((['"`])([^'"`]+)(['"`]),\s*\{\s*method:\s*(['"`])(PUT|DELETE)\4/g, (match, q1, url, q3, q4, method) => {
    const separator = url.includes('?') ? '&' : '?';
    return `fetch(${q1}${url}${separator}_method=${method}${q3}, { method: 'POST'`;
  });

  fs.writeFileSync(file, content);
});
console.log("Patched frontend fetches!");
