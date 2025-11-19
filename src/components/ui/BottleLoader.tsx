import React from "react";

export function BottleLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative w-12 h-28 rounded-[1rem] border-4 border-white/70 bg-white/5 backdrop-blur-md overflow-hidden shadow-lg">
        <div className="absolute inset-x-2 top-0 h-3 rounded-b-full bg-white/60" />
        <div className="absolute bottom-0 left-0 w-full bg-blue-500/80 animate-fill-bottle">
          <div className="w-full h-2 bg-blue-300/60 animate-pulse" />
        </div>
      </div>
      <span className="text-sm font-medium text-white/90 animate-pulse">Analysiere Wasser ...</span>
    </div>
  );
}

