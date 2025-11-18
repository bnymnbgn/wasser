'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';

/**
 * Redirects Capacitor (native) apps to the main app route
 * Landing page should only be shown in browsers
 */
export function CapacitorRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if running in a native Capacitor environment
    if (Capacitor.isNativePlatform()) {
      console.log('[CapacitorRedirect] Native app detected, redirecting to /scan');
      // Redirect to scan page immediately
      router.replace('/scan');
    }
  }, [router]);

  // This component renders nothing
  return null;
}
