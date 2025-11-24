import React from "react";
import { WaterFilledCircle } from "./WaterFilledCircle";

export function BottleLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      <WaterFilledCircle size={120} fillDuration={3} />
      <span className="text-sm font-medium text-white/90 animate-pulse">Analysiere Wasser ...</span>
    </div>
  );
}

