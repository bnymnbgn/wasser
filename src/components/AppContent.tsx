'use client';
import { useSystemUI } from '@/src/hooks/useSystemUI';
import type { ReactNode } from 'react';

export function AppContent({ children }: { children: ReactNode }) {
  useSystemUI();
  return <>{children}</>;
}
