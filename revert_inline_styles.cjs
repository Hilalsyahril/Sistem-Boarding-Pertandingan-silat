const fs = require('fs');
let content = fs.readFileSync('src/components/PublicDisplay.tsx', 'utf8');

content = content.replace(
  `className="h-screen w-screen max-h-screen max-w-full overflow-hidden text-white font-sans p-2 sm:p-3 select-none flex flex-col justify-between" style={{ backgroundColor: "#0f172a", backgroundImage: "radial-gradient(circle at center, #0f172a, #020617)" }}`,
  `className="h-screen w-screen max-h-screen max-w-full overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 text-white font-sans p-2 sm:p-3 select-none flex flex-col justify-between"`
);

content = content.replace(
  `className="p-2.5 sm:p-3 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between border-b-2 sm:border-b-4 border-amber-600 shadow-xl mb-1.5 sm:mb-2.5 gap-2" style={{ backgroundColor: "#f59e0b", backgroundImage: "linear-gradient(to bottom right, #facc15, #f59e0b, #dc2626)" }}`,
  `className="bg-gradient-to-br from-yellow-400 via-amber-500 to-red-600 p-2.5 sm:p-3 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between border-b-2 sm:border-b-4 border-amber-600 shadow-xl mb-1.5 sm:mb-2.5 gap-2"`
);

content = content.replace(
  `// Arena Header Fallback Colors
              const headerStyle = playingPesilat 
                ? { backgroundColor: "#f59e0b", backgroundImage: "linear-gradient(to right, #facc15, #f59e0b, #dc2626)" }
                : { backgroundColor: "#334155" };`,
  `const arenaColor = playingPesilat ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-red-600" : "bg-slate-700";`
);

content = content.replace(
  `className="flex flex-col rounded-2xl border border-slate-850 shadow-xl overflow-hidden h-full min-h-0 hover:border-amber-600/30 hover:shadow-amber-500/10 transition duration-300"
                  style={{ backgroundColor: "#0f172a" }}`,
  `className="flex flex-col bg-slate-900 rounded-2xl border border-slate-850 shadow-xl overflow-hidden h-full min-h-0 hover:border-amber-600/30 hover:shadow-amber-500/10 transition duration-300"`
);

content = content.replace(
  `className={\`\${layout.headerPadding} text-center border-b border-white/10 relative flex items-center justify-center min-h-[36px] sm:min-h-[44px]\`} style={headerStyle}`,
  `className={\`\${arenaColor} \${layout.headerPadding} text-center border-b border-white/10 relative flex items-center justify-center min-h-[36px] sm:min-h-[44px]\`}`
);

fs.writeFileSync('src/components/PublicDisplay.tsx', content);
console.log("Reverted!");
