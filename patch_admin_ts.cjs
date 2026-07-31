const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(/const \[arena, setArena\] = useState<number>\(1\);/g, 'const [arena, setArena] = useState<number | string>(1);');
code = code.replace(/onChange=\{\(e\) => setArena\(Number\(e\.target\.value\)\)\}/g, 'onChange={(e) => setArena(e.target.value)}');

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched setArena type");
