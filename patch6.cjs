const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

code = code.replace(
  'const textData = await res.text();\n        let data;\n        try {\n          data = JSON.parse(textData);\n        } catch (e) {\n          console.error("Invalid JSON response: " + textData.substring(0, 100)); throw new Error("Invalid JSON response");\n        }',
  'const textData = await res.text();\n        let data;\n        try {\n          data = JSON.parse(textData);\n        } catch (e) {\n          console.warn("API returned invalid JSON:", textData.substring(0, 50));\n          return;\n        }'
);

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched 6!");
