/**
 * Native Features Hooks für Android/iOS Integration
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { Share } from '@capacitor/share';

/**
 * Adaptive Status Bar Hook
 * Passt Status Bar automatisch an Content an
 */
export function useAdaptiveStatusBar(darkContent = false) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setupStatusBar = async () => {
      try {
        // Transparent für edge-to-edge
        await StatusBar.setOverlaysWebView({ overlay: true });

        // Text color basierend auf Hintergrund
        await StatusBar.setStyle({
          style: darkContent ? Style.Dark : Style.Light,
        });

        // Android: Status bar color
        if (Capacitor.getPlatform() === 'android') {
          await StatusBar.setBackgroundColor({
            color: '#0B112000', // Transparent
          });
        }
      } catch (error) {
        console.error('Status Bar setup failed:', error);
      }
    };

    setupStatusBar();
  }, [darkContent]);
}

/**
 * Android Back Button Hook
 * Ermöglicht Custom Back Button Handling
 */
export function useAndroidBackButton(
  onBack?: () => boolean // Return true to prevent default
) {
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return;

    const listener = App.addListener('backButton', ({ canGoBack }) => {
      // Custom handler first
      if (onBack && onBack()) {
        return; // Prevented
      }

      // Default behavior
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    return () => {
      listener.remove();
    };
  }, [onBack]);
}

/**
 * Keyboard Handling Hook
 * Managed native keyboard behavior
 */
export function useKeyboardResize() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setupKeyboard = async () => {
      // Native resize mode
      await Keyboard.setResizeMode({ mode: KeyboardResize.Native });

      // Accessory bar for iOS
      await Keyboard.setAccessoryBarVisible({ isVisible: true });
    };

    const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
      setKeyboardHeight(info.keyboardHeight);
      setIsKeyboardVisible(true);

      // Scroll active input into view
      const activeElement = document.activeElement;
      if (activeElement && activeElement instanceof HTMLElement) {
        setTimeout(() => {
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 100);
      }
    });

    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    setupKeyboard();

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return { keyboardHeight, isKeyboardVisible };
}

/**
 * Native Share Hook
 * Verwendet native Share Sheet
 */
export function useNativeShare() {
  const share = useCallback(async (options: {
    title: string;
    text: string;
    url?: string;
    dialogTitle?: string;
  }) => {
    if (!Capacitor.isNativePlatform()) {
      // Web Share API fallback
      if (navigator.share) {
        try {
          await navigator.share(options);
          return true;
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            console.error('Share failed:', error);
          }
          return false;
        }
      }
      return false;
    }

    try {
      await Share.share({
        title: options.title,
        text: options.text,
        url: options.url,
        dialogTitle: options.dialogTitle || 'Teilen',
      });
      return true;
    } catch (error) {
      console.error('Native share failed:', error);
      return false;
    }
  }, []);

  return { share };
}

/**
 * App State Hook
 * Tracked app lifecycle (active/background/etc.)
 */
export function useAppState() {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const stateListener = App.addListener('appStateChange', ({ isActive }) => {
      setIsActive(isActive);
    });

    return () => {
      stateListener.remove();
    };
  }, []);

  return { isActive };
}

/**
 * Long Press Hook
 * Native-feeling long press with haptic feedback
 */
export function useLongPress(
  onLongPress: () => void,
  {
    delay = 500,
    onStart,
    onFinish,
  }: {
    delay?: number;
    onStart?: () => void;
    onFinish?: () => void;
  } = {}
) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useState<NodeJS.Timeout | null>(null)[0];
  const target = useState<EventTarget | null>(null)[0];

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (onStart) onStart();

      const timeoutId = setTimeout(() => {
        // Haptic feedback
        if (Capacitor.isNativePlatform()) {
          import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
            Haptics.impact({ style: ImpactStyle.Medium });
          });
        }

        onLongPress();
        setLongPressTriggered(true);
      }, delay);

      return timeoutId;
    },
    [onLongPress, delay, onStart]
  );

  const clear = useCallback(
    (shouldTriggerFinish = true) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (shouldTriggerFinish && onFinish) {
        onFinish();
      }
      setLongPressTriggered(false);
    },
    [timeout, onFinish]
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onMouseUp: () => clear(),
    onMouseLeave: () => clear(false),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onTouchEnd: () => clear(),
    longPressTriggered,
  };
}

/**
 * Pull to Refresh Hook
 * Implementiert Pull-to-Refresh Pattern
 */
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Web-based pull to refresh
    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger at top of scroll
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;

      currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;

      // Trigger refresh if pulled down > 80px
      if (pullDistance > 80) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      const pullDistance = currentY - startY;

      if (pullDistance > 80) {
        setIsRefreshing(true);

        // Haptic feedback
        if (Capacitor.isNativePlatform()) {
          import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
            Haptics.impact({ style: ImpactStyle.Light });
          });
        }

        await onRefresh();
        setIsRefreshing(false);
      }

      isPulling = false;
      startY = 0;
      currentY = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh]);

  return { isRefreshing };
}

/**
 * Swipe Back Hook
 * iOS-style swipe-to-go-back gesture
 */
export function useSwipeBack(onSwipeBack?: () => void) {
  useEffect(() => {
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger from left edge (< 50px)
      if (e.touches[0].clientX < 50) {
        startX = e.touches[0].clientX;
        isSwiping = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping) return;
      currentX = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      if (!isSwiping) return;

      const swipeDistance = currentX - startX;

      // Swipe right > 150px = go back
      if (swipeDistance > 150) {
        // Haptic feedback
        if (Capacitor.isNativePlatform()) {
          import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
            Haptics.impact({ style: ImpactStyle.Light });
          });
        }

        if (onSwipeBack) {
          onSwipeBack();
        } else {
          window.history.back();
        }
      }

      isSwiping = false;
      startX = 0;
      currentX = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeBack]);
}
