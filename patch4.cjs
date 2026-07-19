const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');

code = code.replace(/const timeDiff = Math\.abs\(oldP\.timer_seconds_left - newP\.timer_seconds_left\);\n\s*if \(runningEqual && timeDiff <= 1\) {\n\s*return {\n\s*\.\.\.newP,\n\s*timer_seconds_left: oldP\.timer_seconds_left.*?\n\s*};\n\s*}/g, 'return newP;');

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
