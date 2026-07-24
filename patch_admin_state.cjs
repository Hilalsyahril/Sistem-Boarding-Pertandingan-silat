const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const targetState = `  const [filterStatus, setFilterStatus] = useState<"queue" | "done" | "all">("queue");`;
const newState = `  const [filterStatus, setFilterStatus] = useState<"queue" | "done" | "all">("queue");
  const [autoNextMatch, setAutoNextMatch] = useState<boolean>(true);

  useEffect(() => {
    const savedAutoNext = localStorage.getItem('autoNextMatch');
    if (savedAutoNext !== null) {
      setAutoNextMatch(savedAutoNext === 'true');
    }
  }, []);

  const toggleAutoNextMatch = () => {
    const newVal = !autoNextMatch;
    setAutoNextMatch(newVal);
    localStorage.setItem('autoNextMatch', String(newVal));
  };`;
code = code.replace(targetState, newState);

const targetTimeout = `  const handleTimeoutMatch = async (id: string) => {
    try {
      const res = await fetch(\`/api/pesilat/\${id}/timeout?_method=PUT\`, { method: 'POST' });`;
const newTimeout = `  const handleTimeoutMatch = async (id: string) => {
    try {
      const res = await fetch(\`/api/pesilat/\${id}/timeout?_method=PUT&autoNext=\${autoNextMatch}\`, { method: 'POST' });`;
code = code.replace(targetTimeout, newTimeout);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched state and timeout logic!");
