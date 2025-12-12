'use client';

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle } from "lucide-react";
import type { ProfileType } from "@/src/domain/types";

interface MineralTooltipProps {
  mineral: string;
  info?: {
    name: string;
    description?: string;
    optimal?: string;
    profiles?: Partial<Record<ProfileType, string>>;
    profileOptimal?: Partial<Record<ProfileType, string>>;
  };
  profile: ProfileType;
  children: ReactNode;
}

export function MineralTooltip({ info, profile, children }: MineralTooltipProps) {
  const [show, setShow] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    const handler = (e: TouchEvent | MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("touchstart", handler);
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("mousedown", handler);
    };
  }, [show]);

  if (!info) return <>{children}</>;
  const profileHint = info.profiles?.[profile];
  const bodyText = profileHint ?? info.description;
  const optimalText = (info as any).profileOptimal?.[profile] ?? info.optimal;

  return (
    <div ref={tooltipRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center -m-2 p-2 cursor-help active:bg-white/10 rounded-lg transition-colors"
        aria-label={info.name}
        aria-expanded={show}
      >
        {children}
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" aria-hidden="true" />
          <div
            className="
              fixed bottom-0 left-0 right-0 z-50
              md:absolute md:bottom-auto md:left-1/2 md:right-auto
              md:top-full md:-translate-x-1/2 md:mt-2
              w-full md:w-72
              rounded-t-3xl md:rounded-2xl
              border border-ocean-border
              bg-ocean-surface/95 backdrop-blur-xl
              px-4 py-4
            "
          >
            <div className="w-10 h-1 bg-ocean-border rounded-full mx-auto mb-3 md:hidden" />
            <div className="text-sm font-semibold text-ocean-primary mb-1.5">{info.name}</div>
            {bodyText && (
              <p className="text-sm text-ocean-secondary leading-relaxed mb-3">{bodyText}</p>
            )}
            {optimalText && (
              <div className="text-sm text-ocean-success font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Optimal: {optimalText}
              </div>
            )}
            <button
              onClick={() => setShow(false)}
              className="mt-4 w-full py-3 rounded-xl bg-ocean-primary/10 text-ocean-primary font-medium text-sm md:hidden active:bg-ocean-primary/20"
            >
              Schließen
            </button>
          </div>
        </>
      )}
    </div>
  );
}
