'use client';
import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { Home, ScanBarcode, History, Settings, Columns } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  const getValue = () => {
    if (pathname === '/') return 0;
    if (pathname.includes('/scan')) return 1;
    if (pathname.includes('/history')) return 2;
    if (pathname.includes('/profile')) return 4;
    return 0;
  };

  const handleHome = React.useCallback(() => {
    if (typeof window === 'undefined') {
      router.push('/dashboard');
      return;
    }
    const start = localStorage.getItem('wasserscan-start-screen');
    if (start === 'scan') {
      router.push('/scan');
    } else {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={getValue()}
        onChange={(_, newValue) => {
          switch (newValue) {
            case 0:
              handleHome();
              break;
            case 1:
              router.push('/scan');
              break;
            case 2:
              router.push('/history');
              break;
            case 3:
              window.dispatchEvent(new Event("open-comparison"));
              break;
            case 4:
              router.push('/profile');
              break;
          }
        }}
        sx={{
          background: 'transparent',
          height: 65,
          '& .Mui-selected': {
            color: 'primary.main',
          },
        }}
      >
        <BottomNavigationAction label="Home" icon={<Home size={24} />} />
        <BottomNavigationAction label="Scan" icon={<ScanBarcode size={24} />} />
        <BottomNavigationAction label="Verlauf" icon={<History size={24} />} />
        <BottomNavigationAction label="Vergleich" icon={<Columns size={24} />} />
        <BottomNavigationAction label="Profil" icon={<Settings size={24} />} />
      </BottomNavigation>
    </Paper>
  );
}
