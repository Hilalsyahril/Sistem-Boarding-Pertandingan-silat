const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// Remove the countdown logic
code = code.replace(/const \[autoNextCountdown, setAutoNextCountdown\] = useState<number>\(60\);\n\s*const countdownIntervalRef = useRef<NodeJS\.Timeout \| null>\(null\);\n\s*const pesilatListRef = useRef<Pesilat\[\]>\(\[\]\);\n\s*const jumlahArenaRef = useRef<number>\(3\);\n\s*const isAutoNextEnabledRef = useRef<boolean>\(false\);/, "");

const effect1 = `useEffect(() => {
    pesilatListRef.current = pesilatList;
  }, [pesilatList]);

  useEffect(() => {
    jumlahArenaRef.current = jumlahArena;
  }, [jumlahArena]);

  useEffect(() => {
    isAutoNextEnabledRef.current = isAutoNextEnabled;
  }, [isAutoNextEnabled]);`;
code = code.replace(effect1, "");

const effect2 = `const executeAutoNext = () => {
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
  }, [isAutoNextEnabled]);`;
code = code.replace(effect2, "");

// Add back localstorage saving for isAutoNextEnabled
const toggleTarget = `const toggleAutoNextMatch = () => {
    const newVal = !isAutoNextEnabled;
    setIsAutoNextEnabled(newVal);
    if (newVal) {
        console.log("Auto Next: ON - Timer Dimulai");
    } else {
        console.log("Auto Next: OFF - Timer Dihentikan");
    }
  };`;
const toggleReplacement = `useEffect(() => {
    const savedAutoNext = localStorage.getItem('isAutoNextEnabled');
    if (savedAutoNext !== null) {
      setIsAutoNextEnabled(savedAutoNext === 'true');
    }
  }, []);

  const toggleAutoNextMatch = () => {
    const newVal = !isAutoNextEnabled;
    setIsAutoNextEnabled(newVal);
    localStorage.setItem('isAutoNextEnabled', String(newVal));
  };`;
code = code.replace(toggleTarget, toggleReplacement);

// Remove timer UI display
const uiTarget = `{isAutoNextEnabled && (
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-900">
                        {autoNextCountdown}s
                      </span>
                    )}`;
code = code.replace(uiTarget, "");

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx");
