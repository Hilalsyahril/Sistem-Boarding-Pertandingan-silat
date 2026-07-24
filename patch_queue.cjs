const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf-8');

// For count === 4
code = code.replace(/queueMaxHeight: "max-h-\[30px\]",\n\s*queueItemPadding: "p-0.5",\n\s*hideQueue: true/g, 
`queueMaxHeight: "max-h-[60px]",
        queueItemPadding: "p-0.5",
        hideQueue: false`);

// For 5-6 arenas
code = code.replace(/hideQueue: true,\n\s*hideFooter: true,\n\s*onlyShowParty: false/g, 
`hideQueue: false,
      hideFooter: true,
      onlyShowParty: false`);

// For > 6 arenas
code = code.replace(/queueMaxHeight: "max-h-\[20px\]",\n\s*queueItemPadding: "p-0.5",\n\s*hideQueue: true/g,
`queueMaxHeight: "max-h-[40px]",
        queueItemPadding: "p-0.5",
        hideQueue: false`);

// Increase queue slice
code = code.replace(/waitingQueue\.slice\(0, 2\)/g, 'waitingQueue.slice(0, 3)');

fs.writeFileSync('src/components/PublicDisplay.tsx', code);
console.log("Patched queue visibility");
