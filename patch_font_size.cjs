const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Case 1
  code = code.replace(
    'headerTitle: "text-2xl sm:text-3xl md:text-4xl",',
    'headerTitle: "text-3xl sm:text-4xl md:text-5xl",'
  );
  code = code.replace(
    'headerSubtitle: "text-base sm:text-lg md:text-xl",',
    'headerSubtitle: "text-lg sm:text-xl md:text-2xl",'
  );

  // Case 2
  code = code.replace(
    'headerTitle: "text-xl sm:text-2xl md:text-3xl",',
    'headerTitle: "text-2xl sm:text-3xl md:text-4xl",'
  );
  code = code.replace(
    'headerSubtitle: "text-sm sm:text-base md:text-lg",',
    'headerSubtitle: "text-base sm:text-lg md:text-xl",'
  );

  // Case 3
  code = code.replace(
    'headerTitle: "text-lg sm:text-xl md:text-2xl",',
    'headerTitle: "text-xl sm:text-2xl md:text-3xl",'
  );
  code = code.replace(
    'headerSubtitle: "text-xs sm:text-sm md:text-base",',
    'headerSubtitle: "text-sm sm:text-base md:text-lg",'
  );

  // Case 4
  code = code.replace(
    'headerTitle: "text-sm sm:text-base md:text-lg",',
    'headerTitle: "text-base sm:text-lg md:text-xl",'
  );
  code = code.replace(
    'headerSubtitle: "text-[10px] sm:text-xs md:text-sm",',
    'headerSubtitle: "text-xs sm:text-sm md:text-base",'
  );

  // Case 5
  code = code.replace(
    'headerTitle: "text-xs sm:text-sm",',
    'headerTitle: "text-sm sm:text-base",'
  );
  code = code.replace(
    'headerSubtitle: "text-[9px] sm:text-[10px]",',
    'headerSubtitle: "text-[10px] sm:text-xs",'
  );

  // Case 6
  code = code.replace(
    'headerTitle: "text-xs sm:text-sm md:text-base",',
    'headerTitle: "text-sm sm:text-base md:text-lg",'
  );
  code = code.replace(
    'headerSubtitle: "text-[9px] sm:text-[10px] md:text-xs",',
    'headerSubtitle: "text-[10px] sm:text-xs md:text-sm",'
  );

  fs.writeFileSync(file, code);
  console.log("Patched successfully");
}

patchFile('src/components/PublicDisplay.tsx');
