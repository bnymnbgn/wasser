'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { hapticLight } from '@/lib/capacitor';

interface NavItem {
  id: string;
  label: string;
  icon: JSX.Element;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Start',
    path: '/',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'scan',
    label: 'Scannen',
    path: '/scan',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'Verlauf',
    path: '/history',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'learn',
    label: 'Lernen',
    path: '/onboarding',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom bg-md-surface-container dark:bg-md-dark-surface-container border-t border-md-surface-containerHigh/20 dark:border-md-dark-surface-containerHigh/30"
      style={{ height: 'var(--bottom-nav-height)' }}
    >
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className="relative flex flex-col items-center justify-center flex-1 h-full min-w-touch touch-manipulation no-tap-highlight"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator background */}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-8 bg-md-secondary-container dark:bg-md-dark-secondary-container rounded-md-lg"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}

              {/* Icon and label */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <motion.div
                  className={`transition-colors ${
                    isActive
                      ? 'text-md-onSecondary-container dark:text-md-dark-onSecondary-container'
                      : 'text-md-onSurface-variant dark:text-md-dark-onSurface-variant'
                  }`}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  {item.icon}
                </motion.div>

                <span
                  className={`text-xs font-medium transition-all ${
                    isActive
                      ? 'text-md-onSecondary-container dark:text-md-dark-onSecondary-container scale-100 opacity-100'
                      : 'text-md-onSurface-variant dark:text-md-dark-onSurface-variant scale-90 opacity-70'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
