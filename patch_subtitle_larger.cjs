const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Replace each headerSubtitle with slightly larger text
  code = code.replace(
    'headerSubtitle: "text-sm sm:text-base md:text-lg",',
    'headerSubtitle: "text-base sm:text-lg md:text-xl",'
  );

  code = code.replace(
    'headerSubtitle: "text-xs sm:text-sm md:text-base",',
    'headerSubtitle: "text-sm sm:text-base md:text-lg",'
  );

  code = code.replace(
    'headerSubtitle: "text-[10px] sm:text-xs md:text-sm",',
    'headerSubtitle: "text-xs sm:text-sm md:text-base",'
  );

  code = code.replace(
    'headerSubtitle: "text-[9px] sm:text-[10px] md:text-xs",',
    'headerSubtitle: "text-[10px] sm:text-xs md:text-sm",'
  );

  code = code.replace(
    'headerSubtitle: "text-[8px] sm:text-[9px]",',
    'headerSubtitle: "text-[9px] sm:text-[10px]",'
  );

  code = code.replace(
    'headerSubtitle: "text-[8px] sm:text-[9px] md:text-[10px]",',
    'headerSubtitle: "text-[9px] sm:text-[10px] md:text-xs",'
  );

  fs.writeFileSync(file, code);
  console.log("Patched successfully");
}

patchFile('src/components/PublicDisplay.tsx');
