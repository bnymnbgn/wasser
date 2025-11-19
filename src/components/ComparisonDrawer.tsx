'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Columns, Trash2, X } from 'lucide-react';
import { useComparison } from '@/src/contexts/ComparisonContext';
import { WATER_METRIC_FIELDS, DERIVED_WATER_METRICS } from '@/src/constants/waterMetrics';

export function ComparisonDrawer() {
  const { items, removeScan, clearAll } = useComparison();
  const [isOpen, setIsOpen] = useState(false);
  const hasItems = items.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-[calc(var(--bottom-nav-height)+2.5rem)] z-40 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-blue-500/40 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
      >
        <Columns className="w-4 h-4" />
        Vergleichen
        {items.length > 0 && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
            {items.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-t-[32px] bg-white p-6 text-slate-900 shadow-2xl dark:bg-slate-950 dark:text-slate-50 md:rounded-[32px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Wasser vergleichen</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Maximal vier Analysen nebeneinander vergleichen.
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {hasItems && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                      Liste leeren
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {!hasItems && (
                <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Noch keine Analysen ausgewählt. Öffne ein Ergebnis und tippe auf „Zum Vergleich hinzufügen“.
                  </p>
                </div>
              )}

              {hasItems && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-1 min-w-[220px] items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-900/60"
                      >
                        <div>
                          <p className="text-xs uppercase text-slate-500 dark:text-slate-400">
                            {item.profile}
                          </p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Score: {item.score?.toFixed(0) ?? '–'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeScan(item.id)}
                          className="rounded-full p-2 text-slate-500 transition hover:bg-white/60 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                      <thead className="bg-slate-50/70 dark:bg-slate-900/70">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-500">
                            Kennzahl
                          </th>
                          {items.map((item) => (
                            <th key={item.id} className="px-4 py-3 text-left font-semibold text-slate-500">
                              <div className="text-xs uppercase text-slate-400">{item.profile}</div>
                              <div className="text-sm text-slate-900 dark:text-slate-100">
                                {item.label}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Gesamt-Score
                          </td>
                          {items.map((item) => (
                            <td key={`${item.id}-score`} className="px-4 py-3 text-slate-900 dark:text-slate-100">
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                                {item.score?.toFixed(0) ?? '–'}
                              </span>
                            </td>
                          ))}
                        </tr>
                        {WATER_METRIC_FIELDS.map((metric) => (
                          <tr key={metric.key}>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                              <div className="font-medium text-slate-800 dark:text-slate-100">
                                {metric.label}
                              </div>
                              <div className="text-xs text-slate-400">{metric.unit ?? ''}</div>
                            </td>
                            {items.map((item) => {
                              const rawValue = item.values?.[metric.key];
                              const metricScore = item.metricScores?.[metric.key];
                              return (
                                <td key={`${item.id}-${metric.key}`} className="px-4 py-3 align-top">
                                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                    {typeof rawValue === 'number'
                                      ? `${rawValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${metric.unit ?? ''}`
                                      : '–'}
                                  </div>
                                  {metricScore !== undefined && (
                                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                      Score: {metricScore.toFixed(0)}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        {DERIVED_WATER_METRICS.map((metric) => (
                          <tr key={metric.key}>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                              <div className="font-medium text-slate-800 dark:text-slate-100">
                                {metric.label}
                              </div>
                              {metric.unit && (
                                <div className="text-xs text-slate-400">{metric.unit}</div>
                              )}
                            </td>
                            {items.map((item) => {
                              const value = item.values?.[metric.key];
                              return (
                                <td key={`${item.id}-${metric.key}`} className="px-4 py-3 align-top">
                                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                    {typeof value === 'number'
                                      ? `${value.toFixed(metric.key === 'hardness' ? 1 : 2)}${metric.unit ? ` ${metric.unit}` : ''}`
                                      : '–'}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
