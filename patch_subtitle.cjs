const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Replace each headerTitle with headerTitle + headerSubtitle
  code = code.replace(
    'headerTitle: "text-2xl sm:text-3xl md:text-4xl",',
    'headerTitle: "text-2xl sm:text-3xl md:text-4xl",\n        headerSubtitle: "text-sm sm:text-base md:text-lg",'
  );

  code = code.replace(
    'headerTitle: "text-xl sm:text-2xl md:text-3xl",',
    'headerTitle: "text-xl sm:text-2xl md:text-3xl",\n        headerSubtitle: "text-xs sm:text-sm md:text-base",'
  );

  code = code.replace(
    'headerTitle: "text-lg sm:text-xl md:text-2xl",',
    'headerTitle: "text-lg sm:text-xl md:text-2xl",\n        headerSubtitle: "text-[10px] sm:text-xs md:text-sm",'
  );

  code = code.replace(
    'headerTitle: "text-sm sm:text-base md:text-lg",',
    'headerTitle: "text-sm sm:text-base md:text-lg",\n        headerSubtitle: "text-[9px] sm:text-[10px] md:text-xs",'
  );

  code = code.replace(
    'headerTitle: "text-xs sm:text-sm",',
    'headerTitle: "text-xs sm:text-sm",\n        headerSubtitle: "text-[8px] sm:text-[9px]",'
  );

  code = code.replace(
    'headerTitle: "text-xs sm:text-sm md:text-base",',
    'headerTitle: "text-xs sm:text-sm md:text-base",\n      headerSubtitle: "text-[8px] sm:text-[9px] md:text-[10px]",'
  );

  // Now replace the <p> tag classes in the render
  const targetP = '<p className="text-white/80 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest mt-0.5 font-mono">';
  const replacementP = '<p className={`text-white/80 ${layout.headerSubtitle} font-bold uppercase tracking-widest mt-0.5 font-mono`}>';
  
  if (code.includes(targetP)) {
    code = code.replace(targetP, replacementP);
    console.log("Patched successfully");
  } else {
    console.log("Target P not found");
  }

  fs.writeFileSync(file, code);
}

patchFile('src/components/PublicDisplay.tsx');
