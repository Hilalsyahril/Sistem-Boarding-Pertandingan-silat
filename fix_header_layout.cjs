const fs = require('fs');
let content = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');

// Fix header
content = content.replace(
  'space-x-2 space-y-2" style={{ backgroundColor:',
  'gap-3" style={{ backgroundColor:'
);

// Fix title area
content = content.replace(
  'className="flex items-center space-x-3 space-y-3"',
  'className="flex items-center gap-3"'
);

// Fix right area
content = content.replace(
  'className="flex flex-wrap items-center space-x-2 space-y-2 sm:space-x-3 space-y-3 text-[10px] sm:text-xs"',
  'className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs"'
);

// Fix Update div
content = content.replace(
  'className="text-left flex items-center space-x-1 space-y-1.5"',
  'className="text-left flex items-center gap-1.5"'
);

// Fix Audio toggle button
content = content.replace(
  'className={`flex items-center space-x-1 space-y-1.5 px-2.5 py-1',
  'className={`flex items-center gap-1.5 px-2.5 py-1'
);

// Fix Live/Terputus div (emerald)
content = content.replace(
  'className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg flex items-center space-x-1 space-y-1.5 shadow-lg',
  'className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg'
);

// Fix Live/Terputus div (rose)
content = content.replace(
  'className="bg-rose-600 text-white px-2.5 py-1 rounded-lg flex items-center space-x-1 space-y-1.5 shadow-lg',
  'className="bg-rose-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg'
);

fs.writeFileSync('src/components/PublicDisplay.tsx', content);
console.log("Fixed layout!");
