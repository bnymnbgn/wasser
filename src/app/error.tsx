"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
      <div className="p-4 rounded-full bg-ocean-error-bg text-ocean-error">
        <AlertTriangle size={48} />
      </div>
      <h2 className="text-xl font-bold text-ocean-primary">Upps, etwas ging schief!</h2>
      <p className="text-sm text-ocean-secondary">Wir konnten diese Ansicht nicht laden.</p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-6 py-3 mt-4 text-white rounded-full bg-ocean-primary hover:opacity-90 transition-opacity"
      >
        <RotateCcw size={18} />
        Erneut versuchen
      </button>
    </div>
  );
}
