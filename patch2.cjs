const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

if (!code.includes('isAudioEnabledRef')) {
  code = code.replace(
    'const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);',
    'const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);\n  const isAudioEnabledRef = useRef(isAudioEnabled);\n  useEffect(() => { isAudioEnabledRef.current = isAudioEnabled; }, [isAudioEnabled]);'
  );
  
  // Replace !isAudioEnabled inside processQueue and announceMatch
  code = code.replace('const processQueue = async () => {\n    if (!isAudioEnabled) {', 'const processQueue = async () => {\n    if (!isAudioEnabledRef.current) {');
  
  code = code.replace('const announceMatch = (arenaNum: number, p: Pesilat) => {\n    if (!isAudioEnabled) return;', 'const announceMatch = (arenaNum: number, p: Pesilat) => {\n    if (!isAudioEnabledRef.current) return;');
  
  fs.writeFileSync('src/components/PublicDisplay.tsx', code);
  console.log("Patched!");
} else {
  console.log("Already patched");
}
