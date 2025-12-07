"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Home, ScanLine, History, BookOpen, Camera, Keyboard } from "lucide-react";
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
  const [showScanMenu, setShowScanMenu] = useState(false);

  const handleNavigation = async (path: string) => {
    await hapticLight();
    router.push(path);
  };

  const scanItem = navItems.find((item) => item.id === "scan");
  const staticItems = navItems.filter((item) => item.id !== "scan");

  return (
    <nav className="pointer-events-none z-40 w-full mt-4 pb-8 fixed bottom-0 left-0 right-0">
      <div className="mx-auto w-full max-w-xl px-4">
        <div className="pointer-events-auto relative flex items-center justify-between rounded-ocean-xl border border-white/10 bg-slate-900/60 backdrop-blur-xl px-4 py-3 shadow-2xl">
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
                  className={`flex h-10 w-10 items-center justify-center rounded-ocean-lg border border-ocean-border ${isActive ? "ocean-surface-elevated text-ocean-accent ocean-glow" : "ocean-surface"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className={isActive ? "text-ocean-accent" : ""}>{item.label}</span>
              </button>
            );
          })}

          {scanItem && (
            <div className="absolute inset-x-0 -top-12 mx-auto flex items-center justify-center">
              <button
                onClick={async () => {
                  await hapticLight();
                  setShowScanMenu((v) => !v);
                }}
                className="relative flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-ocean-dark bg-gradient-to-br from-ocean-primary to-ocean-accent text-white shadow-ocean-glow transition active:scale-90"
                aria-label={scanItem.label}
              >
                <motion.div animate={{ rotate: showScanMenu ? 45 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                  <scanItem.icon className="h-7 w-7" strokeWidth={2.4} />
                </motion.div>
              </button>

              <AnimatePresence>
                {showScanMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="absolute -top-44 right-0 flex flex-col gap-2"
                  >
                    <ScanOption
                      icon={<Camera className="w-4 h-4" />}
                      label="Foto (OCR)"
                      onClick={async () => {
                        await hapticLight();
                        setShowScanMenu(false);
                        router.push("/scan?mode=ocr");
                      }}
                    />
                    <ScanOption
                      icon={<ScanLine className="w-4 h-4" />}
                      label="Barcode"
                      onClick={async () => {
                        await hapticLight();
                        setShowScanMenu(false);
                        router.push("/scan?mode=barcode");
                      }}
                    />
                    <ScanOption
                      icon={<Keyboard className="w-4 h-4" />}
                      label="Manuell"
                      onClick={async () => {
                        await hapticLight();
                        setShowScanMenu(false);
                        router.push("/scan?mode=manual");
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      {showScanMenu && (
        <button
          className="fixed inset-0 z-30"
          aria-label="Schließen"
          onClick={() => setShowScanMenu(false)}
        />
      )}
    </nav>
  );
}

function ScanOption({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="pointer-events-auto flex items-center gap-2 rounded-xl border border-ocean-border bg-ocean-surface px-3 py-2 text-sm font-semibold text-ocean-primary shadow-lg hover:bg-ocean-surface-hover active:scale-95 transition"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
