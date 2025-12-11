'use client';
import { useSystemUI } from '@/src/hooks/useSystemUI';
import type { ReactNode } from 'react';
import { useAndroidBackButton } from '@/src/hooks/useAndroidBackButton';

export function AppContent({ children }: { children: ReactNode }) {
  useSystemUI();
  useAndroidBackButton();
  return <>{children}</>;
}
