"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, ScanLine, History, BookOpen } from "lucide-react";
import { hapticLight } from "@/lib/capacitor";

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Start",
    path: "/dashboard",
    icon: Home,
  },
  {
    id: "scan",
    label: "Scannen",
    path: "/scan",
    icon: ScanLine,
  },
  {
    id: "history",
    label: "Verlauf",
    path: "/history",
    icon: History,
  },
  {
    id: "learn",
    label: "Lernen",
    path: "/onboarding",
    icon: BookOpen,
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = async (path: string) => {
    await hapticLight();
    router.push(path);
  };

  const scanItem = navItems.find((item) => item.id === "scan");
  const staticItems = navItems.filter((item) => item.id !== "scan");

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-4 z-40 pb-safe-bottom">
      <div className="mx-auto w-full max-w-xl px-4">
        <div className="pointer-events-auto relative flex items-center justify-between rounded-ocean-xl border border-ocean-border ocean-panel-strong px-4 py-3 ocean-shadow-4">
          {staticItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className="flex flex-col items-center gap-1 rounded-ocean-lg px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] text-ocean-tertiary transition hover:text-ocean-primary active:scale-95"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-ocean-lg border border-ocean-border ${
                    isActive ? "ocean-surface-elevated text-ocean-accent ocean-glow" : "ocean-surface"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className={isActive ? "text-ocean-accent" : ""}>{item.label}</span>
              </button>
            );
          })}

          {scanItem && (
            <button
              onClick={() => handleNavigation(scanItem.path)}
              className="absolute inset-x-0 -top-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-ocean-dark bg-gradient-to-br from-ocean-primary to-ocean-accent text-white shadow-ocean-glow transition active:scale-90"
              aria-label={scanItem.label}
            >
              <scanItem.icon className="h-7 w-7" strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
