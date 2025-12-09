/**
 * Native-feeling Bottom Sheet Component
 * Ersetzt Web-style Modals mit nativen Drawer
 */

'use client';

import { useEffect } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface NativeBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
  children: React.ReactNode;
  maxHeight?: string;
  showHandle?: boolean;
  disableSwipeToOpen?: boolean;
  fullHeight?: boolean;
}

export function NativeBottomSheet({
  open,
  onClose,
  onOpen,
  children,
  maxHeight = '90vh',
  showHandle = true,
  disableSwipeToOpen = true,
  fullHeight = false,
}: NativeBottomSheetProps) {
  // Haptic feedback on open
  useEffect(() => {
    if (open && Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Light });
    }
  }, [open]);

  const handleClose = async () => {
    // Haptic feedback on close
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    onClose();
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={handleClose}
      onOpen={onOpen || (() => {})}
      disableSwipeToOpen={disableSwipeToOpen}
      disableDiscovery
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: fullHeight ? '100vh' : maxHeight,
          // Ocean Dark Glassmorphism
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          // Edge-to-edge
          paddingBottom: 'var(--safe-area-inset-bottom, 0px)',
          // Prevent overscroll
          overscrollBehavior: 'contain',
        },
      }}
      ModalProps={{
        keepMounted: false, // Better performance
      }}
      sx={{
        // Backdrop
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      {/* Drawer Handle */}
      {showHandle && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '12px 0',
            cursor: 'grab',
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: 2,
            }}
          />
        </div>
      )}

      {/* Content */}
      <div
        style={{
          padding: '0 16px 16px',
          // Native momentum scrolling
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          // Max height accounting for handle
          maxHeight: `calc(${fullHeight ? '100vh' : maxHeight} - ${showHandle ? '40px' : '0px'} - var(--safe-area-inset-bottom, 0px))`,
        }}
      >
        {children}
      </div>
    </SwipeableDrawer>
  );
}

/**
 * Example Usage Component
 */
export function ExampleBottomSheetUsage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Sheet</button>

      <NativeBottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Bottom Sheet Title</h2>
          <p className="text-slate-300">
            This feels like a native Android bottom sheet!
          </p>

          {/* Long content for scrolling */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="p-4 bg-slate-700/40 rounded-xl"
            >
              Item {i + 1}
            </div>
          ))}
        </div>
      </NativeBottomSheet>
    </>
  );
}
