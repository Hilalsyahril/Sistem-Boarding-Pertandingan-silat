const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

// Count 1
code = code.replace(/headerTitle: "text-3xl sm:text-4xl md:text-5xl",\n\s*headerSubtitle: "text-lg sm:text-xl md:text-2xl",/,
`headerTitle: "text-5xl sm:text-6xl md:text-7xl",
        headerSubtitle: "text-2xl sm:text-3xl md:text-4xl",`);

// Count 2
code = code.replace(/headerTitle: "text-2xl sm:text-3xl md:text-4xl",\n\s*headerSubtitle: "text-base sm:text-lg md:text-xl",/,
`headerTitle: "text-4xl sm:text-5xl md:text-6xl",
        headerSubtitle: "text-xl sm:text-2xl md:text-3xl",`);

// Count 3
code = code.replace(/headerTitle: "text-xl sm:text-2xl md:text-3xl",\n\s*headerSubtitle: "text-sm sm:text-base md:text-lg",/,
`headerTitle: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
        headerSubtitle: "text-lg sm:text-xl md:text-2xl",`);

// Count 4
code = code.replace(/headerTitle: "text-base sm:text-lg md:text-xl",\n\s*headerSubtitle: "text-xs sm:text-sm md:text-base",/,
`headerTitle: "text-2xl sm:text-3xl md:text-4xl",
        headerSubtitle: "text-base sm:text-lg md:text-xl",`);

// Count > 6
code = code.replace(/headerTitle: "text-sm sm:text-base",\n\s*headerSubtitle: "text-\[10px\] sm:text-xs",/,
`headerTitle: "text-lg sm:text-xl md:text-2xl",
        headerSubtitle: "text-sm sm:text-base",`);

// Count 5-6
code = code.replace(/headerTitle: "text-sm sm:text-base md:text-lg",\n\s*headerSubtitle: "text-\[10px\] sm:text-xs md:text-sm",/,
`headerTitle: "text-xl sm:text-2xl md:text-3xl",
      headerSubtitle: "text-sm sm:text-base md:text-lg",`);

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched font size");
