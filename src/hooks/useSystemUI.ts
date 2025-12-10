'use client';
import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export function useSystemUI() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const applySystemUI = async () => {
        try {
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.setStyle({ style: Style.Dark });
        } catch (e) {
          console.error('System UI Error:', e);
        }
      };
      applySystemUI();
    }
  }, []);
}
