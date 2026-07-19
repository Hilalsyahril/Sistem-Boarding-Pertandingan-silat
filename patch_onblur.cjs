const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `                                  onBlur={(e) => {
                                    const secs = parseInt(e.target.value) || 120;
                                    handleUpdateTimer(activePesilat.id, secs, secs, false);
                                  }}`;

code = code.replace(target, '');
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
