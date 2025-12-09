/**
 * Material Design Bottom Navigation
 * Ersetzt die aktuelle BottomNav mit nativer Material-Komponente
 */

'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Fab from '@mui/material/Fab';
import { Home, History, Settings, ScanLine, BarChart3 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const NAV_ITEMS = [
  {
    label: 'Home',
    value: '/dashboard',
    icon: Home,
  },
  {
    label: 'Verlauf',
    value: '/history',
    icon: History,
  },
  {
    label: 'Vergleich',
    value: '/comparison',
    icon: BarChart3,
  },
  {
    label: 'Einstellungen',
    value: '/settings',
    icon: Settings,
  },
];

export function BottomNavMaterial() {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(pathname);

  // Update value when pathname changes
  useEffect(() => {
    setValue(pathname);
  }, [pathname]);

  const handleChange = async (_event: React.SyntheticEvent, newValue: string) => {
    // Haptic feedback
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }

    setValue(newValue);
    router.push(newValue);
  };

  const handleScan = async () => {
    // Haptic feedback - medium for primary action
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }

    router.push('/scan');
  };

  return (
    <>
      {/* Floating Action Button für Scan */}
      <Fab
        color="primary"
        aria-label="scan"
        onClick={handleScan}
        sx={{
          position: 'fixed',
          bottom: {
            xs: 72, // 64px nav height + 8px margin
            sm: 80,
          },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1300, // Above bottom nav
          width: 64,
          height: 64,
          boxShadow: '0 4px 12px 0 rgba(14, 165, 233, 0.4)',
          // Edge-to-edge with safe area
          marginBottom: 'var(--safe-area-inset-bottom, 0px)',
        }}
      >
        <ScanLine size={28} />
      </Fab>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 1200,
          // Ocean Dark Glassmorphism
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          // Safe area handling
          paddingBottom: 'var(--safe-area-inset-bottom, 0px)',
          // Edge-to-edge
          paddingLeft: 'var(--safe-area-inset-left, 0px)',
          paddingRight: 'var(--safe-area-inset-right, 0px)',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              value={item.value}
              icon={<Icon size={24} />}
              sx={{
                minWidth: 64,
                color: 'rgba(255, 255, 255, 0.6)',
                '&.Mui-selected': {
                  color: '#0EA5E9', // ocean-primary
                },
                // Material ripple effect
                '&:active': {
                  backgroundColor: 'rgba(14, 165, 233, 0.12)',
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  marginTop: '4px',
                  '&.Mui-selected': {
                    fontSize: '0.75rem',
                  },
                },
              }}
            />
          );
        })}
      </BottomNavigation>

      {/* Spacer to prevent content from being hidden behind nav */}
      <div
        style={{
          height: 'calc(64px + var(--safe-area-inset-bottom, 0px))',
        }}
      />
    </>
  );
}
