"use client";

import { usePathname } from "next/navigation";
import { LivingBackground } from "@/src/components/ui/LivingBackground";

/**
 * Disable the heavy animated background on scan to keep input responsive.
 */
export function AppBackgroundToggle() {
  const pathname = usePathname();

  if (pathname?.startsWith("/scan") || pathname?.startsWith("/history") || pathname?.startsWith("/settings") || pathname?.startsWith("/profile") || pathname?.startsWith("/dashboard") || pathname?.startsWith("/onboarding")) {
    return null;
  }

  return <LivingBackground />;
}
