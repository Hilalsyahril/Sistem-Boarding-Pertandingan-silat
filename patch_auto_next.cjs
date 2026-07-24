const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// Replace autoNextMatch with isAutoNextEnabled
code = code.replace(/const \[autoNextMatch, setAutoNextMatch\] = useState<boolean>\(true\);/, `const [isAutoNextEnabled, setIsAutoNextEnabled] = useState<boolean>(false);
  const [autoNextCountdown, setAutoNextCountdown] = useState<number>(60);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pesilatListRef = useRef<Pesilat[]>([]);
  const jumlahArenaRef = useRef<number>(3);
  const isAutoNextEnabledRef = useRef<boolean>(false);`);

// We need to make sure we also add useRef import if missing, but it's probably there.
// Let's replace the useEffect for autoNextMatch
code = code.replace(/useEffect\(\(\) => \{\n\s*const savedAutoNext = localStorage.getItem\('autoNextMatch'\);\n\s*if \(savedAutoNext !== null\) \{\n\s*setAutoNextMatch\(savedAutoNext === 'true'\);\n\s*\}\n\s*\}, \[\]\);/, `useEffect(() => {
    pesilatListRef.current = pesilatList;
  }, [pesilatList]);

  useEffect(() => {
    jumlahArenaRef.current = jumlahArena;
  }, [jumlahArena]);

  useEffect(() => {
    isAutoNextEnabledRef.current = isAutoNextEnabled;
  }, [isAutoNextEnabled]);

  const executeAutoNext = () => {
    // Validasi Akhir: pastikan fitur masih ON
    if (!isAutoNextEnabledRef.current) return;
    
    console.log("Auto Next: Mengeksekusi perpindahan partai otomatis...");
    
    // Periksa semua arena
    for (let i = 1; i <= jumlahArenaRef.current; i++) {
        const activePesilat = pesilatListRef.current.find(p => p.arena === i && p.is_playing);
        if (!activePesilat) {
            console.log("Auto Next: Mengaktifkan partai berikutnya untuk Gelanggang " + i);
            handleNextPartai(i);
        }
    }
  };

  useEffect(() => {
    if (isAutoNextEnabled) {
        // Mencegah Multiple Timers: bersihkan timer lama jika ada
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
        }
        
        setAutoNextCountdown(60);
        
        countdownIntervalRef.current = setInterval(() => {
             setAutoNextCountdown(prev => {
                 if (prev <= 1) {
                     executeAutoNext();
                     return 60; // reset
                 }
                 return prev - 1;
             });
        }, 1000);
    } else {
        // Bersihkan timer jika di-OFF-kan
        if (countdownIntervalRef.current) {
             clearInterval(countdownIntervalRef.current);
             countdownIntervalRef.current = null;
        }
    }
    
    return () => {
        if (countdownIntervalRef.current) {
             clearInterval(countdownIntervalRef.current);
             countdownIntervalRef.current = null;
        }
    };
  }, [isAutoNextEnabled]);`);

// Replace toggleAutoNextMatch
code = code.replace(/const toggleAutoNextMatch = \(\) => \{\n\s*const newVal = !autoNextMatch;\n\s*setAutoNextMatch\(newVal\);\n\s*localStorage.setItem\('autoNextMatch', String\(newVal\)\);\n\s*\};/, `const toggleAutoNextMatch = () => {
    const newVal = !isAutoNextEnabled;
    setIsAutoNextEnabled(newVal);
    if (newVal) {
        console.log("Auto Next: ON - Timer Dimulai");
    } else {
        console.log("Auto Next: OFF - Timer Dihentikan");
    }
  };`);

// Replace timeout backend call argument
code = code.replace(/autoNext=\$\{autoNextMatch\}/, `autoNext=\$\{isAutoNextEnabled\}`);

// Replace UI occurrences
code = code.replace(/autoNextMatch \? 'bg-emerald-500' : 'bg-slate-700'/g, `isAutoNextEnabled ? 'bg-emerald-500' : 'bg-slate-700'`);
code = code.replace(/autoNextMatch \? 'translate-x-4' : 'translate-x-1'/g, `isAutoNextEnabled ? 'translate-x-4' : 'translate-x-1'`);

// Add the countdown display to the UI
const uiTarget = `<div className="flex items-center gap-3 w-full sm:w-auto bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Auto Next Partai by Timer</span>`;
const uiReplacement = `<div className="flex items-center gap-3 w-full sm:w-auto bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Auto Next Partai by Timer</span>
                    {isAutoNextEnabled && (
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-900">
                        {autoNextCountdown}s
                      </span>
                    )}`;

code = code.replace(uiTarget, uiReplacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx successfully");
