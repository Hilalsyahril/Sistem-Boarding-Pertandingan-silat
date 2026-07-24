const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

// Count 1
code = code.replace(/headerTitle: "text-5xl sm:text-6xl md:text-7xl",\n\s*headerSubtitle: "text-2xl sm:text-3xl md:text-4xl",/,
`headerTitle: "text-6xl sm:text-7xl md:text-8xl lg:text-[7rem]",
        headerSubtitle: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",`);

// Count 2
code = code.replace(/headerTitle: "text-4xl sm:text-5xl md:text-6xl",\n\s*headerSubtitle: "text-xl sm:text-2xl md:text-3xl",/,
`headerTitle: "text-5xl sm:text-6xl md:text-7xl lg:text-[5rem]",
        headerSubtitle: "text-2xl sm:text-3xl md:text-4xl lg:text-[3rem]",`);

// Count 3
code = code.replace(/headerTitle: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",\n\s*headerSubtitle: "text-lg sm:text-xl md:text-2xl",/,
`headerTitle: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
        headerSubtitle: "text-xl sm:text-2xl md:text-3xl lg:text-4xl",`);

// Count 4
code = code.replace(/headerTitle: "text-2xl sm:text-3xl md:text-4xl",\n\s*headerSubtitle: "text-base sm:text-lg md:text-xl",/,
`headerTitle: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
        headerSubtitle: "text-lg sm:text-xl md:text-2xl lg:text-3xl",`);

// Count 5-6
code = code.replace(/headerTitle: "text-xl sm:text-2xl md:text-3xl",\n\s*headerSubtitle: "text-sm sm:text-base md:text-lg",/,
`headerTitle: "text-2xl sm:text-3xl md:text-4xl",
      headerSubtitle: "text-base sm:text-lg md:text-xl",`);

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched font size again");
