'use client';
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';
import type { ScanResult } from '@/src/domain/types';

interface Props {
  scans: ScanResult[];
}

function toneFromScore(score: number | undefined) {
  if (score == null) return 'error';
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
}

export function HistoryListVirtualized({ scans }: Props) {
  const router = useRouter();
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: scans.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 6,
  });

  if (scans.length === 0) {
    return <div className="p-4 text-center text-ocean-secondary">Noch keine Scans.</div>;
  }

  return (
    <div
      ref={parentRef}
      className="h-full w-full overflow-auto hide-scrollbar"
      style={{ scrollbarWidth: 'none' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const scan = scans[virtualRow.index];
          if (!scan) return null;
          const tone = toneFromScore(scan.score);
          const toneClass =
            tone === 'success'
              ? 'text-ocean-success bg-ocean-success-bg/30'
              : tone === 'warning'
              ? 'text-ocean-warning bg-ocean-warning-bg/30'
              : 'text-ocean-error bg-ocean-error-bg/30';

          return (
            <div
              key={scan.id}
              onClick={() => router.push(`/scan?id=${scan.id}`)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="px-4 py-2"
            >
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-ocean-surface border border-ocean-border active:scale-[0.98] transition-transform">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${toneClass}`}>
                  <span className="font-bold text-sm">{scan.score?.toFixed(0) ?? '–'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-ocean-primary truncate">
                    {scan.productInfo?.brand || 'Unbekanntes Wasser'}
                  </h4>
                  <p className="text-xs text-ocean-secondary">
                    {format(new Date(scan.timestamp), 'dd. MMM, HH:mm', { locale: de })}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-ocean-border" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
