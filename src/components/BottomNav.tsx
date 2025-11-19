"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pb-safe-bottom">
      <div className="mx-auto w-full max-w-xl px-4 pb-2">
        <div className="relative rounded-[32px] border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40">
          {/* Glassmorphic overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-white/0 dark:from-slate-900/50 dark:to-slate-900/0 rounded-[32px] pointer-events-none" />

          <div className="relative grid grid-cols-4 gap-1 px-3 py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className="relative flex flex-col items-center gap-1 rounded-[20px] py-2.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:focus-visible:ring-blue-400/50 touch-manipulation overflow-hidden group"
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Active Background */}
                  {isActive && (
                    <motion.span
                      layoutId="navHighlight"
                      className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-blue-500/10 to-blue-600/15 dark:from-blue-400/15 dark:to-blue-500/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Ripple Effect on Press */}
                  <motion.span
                    className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-[20px]"
                    initial={{ opacity: 0, scale: 0 }}
                    whileTap={{ opacity: 0.2, scale: 1.5 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Icon */}
                  <motion.span
                    className={`relative z-10 flex items-center justify-center ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  </motion.span>

                  {/* Label */}
                  <span
                    className={`relative z-10 transition-all ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-slate-600 dark:text-slate-400 opacity-90"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full z-10"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
