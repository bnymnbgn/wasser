'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WaterScoreCard } from './WaterScoreCard';
import type { ScanResult } from '@/src/domain/types';
import { hapticLight } from '@/lib/capacitor';
import Link from 'next/link';

function scoreLabel(score: number | undefined) {
  if (score == null) return 'unbekannt';
  if (score >= 80) return 'sehr gut';
  if (score >= 50) return 'okay';
  return 'kritisch';
}

function scoreColor(score: number | undefined) {
  if (score == null) return 'bg-md-surface-containerHigh dark:bg-md-dark-surface-containerHigh text-md-onSurface dark:text-md-dark-onSurface';
  if (score >= 80) return 'bg-md-success-container dark:bg-md-dark-success-container text-md-onSuccess-container dark:text-md-dark-onSuccess-container';
  if (score >= 50) return 'bg-md-warning-container dark:bg-md-dark-warning-container text-md-onWarning-container dark:text-md-dark-onWarning-container';
  return 'bg-md-error-container dark:bg-md-dark-error-container text-md-onError-container dark:text-md-dark-onError-container';
}

interface HistoryListProps {
  initialScans: ScanResult[];
}

export default function HistoryList({ initialScans }: HistoryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await hapticLight();

    // Trigger page reload
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const toggleExpand = async (id: string) => {
    await hapticLight();
    setExpandedId(expandedId === id ? null : id);
  };

  if (initialScans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="md-card p-8 text-center"
      >
        <svg className="w-16 h-16 mx-auto mb-4 text-md-onSurface-variant dark:text-md-dark-onSurface-variant opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-md-onSurface-variant dark:text-md-dark-onSurface-variant mb-4">
          Noch keine Scans vorhanden
        </p>
        <Link href="/scan">
          <motion.button
            className="btn-touch bg-md-primary dark:bg-md-dark-primary text-white font-semibold rounded-md-lg px-6"
            whileTap={{ scale: 0.95 }}
            onClick={() => hapticLight()}
          >
            Ersten Scan starten
          </motion.button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Pull to Refresh Indicator */}
      {refreshing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center py-2"
        >
          <svg className="animate-spin w-5 h-5 text-md-primary dark:text-md-dark-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </motion.div>
      )}

      {/* Scan List */}
      {initialScans.map((scan, index) => {
        const isExpanded = expandedId === scan.id;

        return (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <motion.div
              className="md-card overflow-hidden"
              layout
            >
              {/* Header - Always Visible */}
              <button
                onClick={() => toggleExpand(scan.id)}
                className="w-full p-4 text-left touch-manipulation"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-xs text-md-onSurface-variant dark:text-md-dark-onSurface-variant mb-1">
                      {new Date(scan.timestamp).toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-sm font-medium text-md-onSurface dark:text-md-dark-onSurface">
                      {scan.barcode ? `Barcode: ${scan.barcode}` : 'OCR Scan'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${scoreColor(scan.score)}`}>
                      {scan.score?.toFixed(0) ?? '–'}
                    </div>
                    <motion.svg
                      className="w-5 h-5 text-md-onSurface-variant dark:text-md-dark-onSurface-variant"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
                  <span className="px-2 py-0.5 rounded-full bg-md-surface-containerHigh dark:bg-md-dark-surface-containerHigh">
                    {scan.profile}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-md-surface-containerHigh dark:bg-md-dark-surface-containerHigh">
                    {scoreLabel(scan.score)}
                  </span>
                </div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-md-surface-containerHigh dark:border-md-dark-surface-containerHigh"
                  >
                    <div className="p-4">
                      <WaterScoreCard scanResult={scan} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
