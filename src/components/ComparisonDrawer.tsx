'use client';

import { useEffect, useState } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import { Columns, Trash2, X, Plus, Check } from 'lucide-react';
import { useComparison } from '@/src/contexts/ComparisonContext';
import { WATER_METRIC_FIELDS, DERIVED_WATER_METRICS } from '@/src/constants/waterMetrics';
import { Capacitor } from '@capacitor/core';
import { sqliteService } from '@/lib/sqlite';
import type { ScanResult } from '@/src/domain/types';

export function ComparisonDrawer() {
  const { items, addScan, removeScan, clearAll, isSelected } = useComparison();
  const [isOpen, setIsOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [availableScans, setAvailableScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const hasItems = items.length > 0;
  const theme = useTheme();

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("open-comparison", handler as EventListener);
    return () => window.removeEventListener("open-comparison", handler as EventListener);
  }, []);

  // Load available scans when picker opens
  useEffect(() => {
    if (!showPicker) return;

    const loadScans = async () => {
      setLoading(true);
      try {
        if (Capacitor.isNativePlatform()) {
          const scans = await sqliteService.getScanHistory(20);
          // getScanHistory already returns correctly shaped objects
          const results: ScanResult[] = scans.map((scan: any) => ({
            id: scan.id,
            timestamp: scan.timestamp,
            profile: scan.profile || 'standard',
            score: scan.score,
            barcode: scan.barcode,
            ocrParsedValues: typeof scan.ocrParsedValues === 'string'
              ? JSON.parse(scan.ocrParsedValues)
              : scan.ocrParsedValues,
            productInfo: scan.productInfo,
            metricScores: typeof scan.metricScores === 'string'
              ? JSON.parse(scan.metricScores)
              : scan.metricScores,
          }));
          setAvailableScans(results);
        } else {
          // Web: fetch from API
          const response = await fetch('/api/scans');
          if (response.ok) {
            const data = await response.json();
            setAvailableScans(data.scans || []);
          }
        }
      } catch (err) {
        console.error('[ComparisonDrawer] Failed to load scans:', err);
      } finally {
        setLoading(false);
      }
    };

    loadScans();
  }, [showPicker]);

  const handleClose = () => {
    setIsOpen(false);
    setShowPicker(false);
  };

  const handleAddScan = (scan: ScanResult) => {
    addScan(scan);
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={isOpen}
      onClose={handleClose}
      onOpen={() => setIsOpen(true)}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          bgcolor: 'background.default',
          maxHeight: '85vh',
        }
      }}
    >
      {/* Drag Handle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 1 }}>
        <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {showPicker ? 'Scan auswählen' : 'Wasser vergleichen'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {showPicker ? 'Tippe auf einen Scan zum Hinzufügen' : `${items.length}/4 ausgewählt`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!showPicker && items.length < 4 && (
            <Button
              size="small"
              variant="contained"
              startIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowPicker(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontSize: 12 }}
            >
              Hinzufügen
            </Button>
          )}
          {!showPicker && hasItems && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Trash2 className="w-4 h-4" />}
              onClick={clearAll}
              sx={{ borderRadius: 2, textTransform: 'none', fontSize: 12 }}
            >
              Leeren
            </Button>
          )}
          {showPicker && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setShowPicker(false)}
              sx={{ borderRadius: 2, textTransform: 'none', fontSize: 12 }}
            >
              Zurück
            </Button>
          )}
          <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
            <X className="w-5 h-5" />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2, py: 2, overflowY: 'auto' }}>
        {/* Scan Picker View */}
        {showPicker && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            {!loading && availableScans.length === 0 && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                  Keine Scans vorhanden
                </Typography>
              </Box>
            )}
            {!loading && availableScans.map((scan) => {
              const selected = isSelected(scan.id);
              const label = scan.productInfo?.brand ?? scan.productInfo?.productName ?? (scan.barcode ? `Scan ${scan.barcode}` : 'Etikett-Scan');
              return (
                <Box
                  key={scan.id}
                  component="button"
                  onClick={() => !selected && handleAddScan(scan)}
                  disabled={selected || items.length >= 4}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: selected ? 'primary.main' : 'divider',
                    bgcolor: selected ? 'primary.main' : 'background.paper',
                    cursor: selected ? 'default' : 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    opacity: items.length >= 4 && !selected ? 0.5 : 1,
                    '&:active': { bgcolor: selected ? 'primary.main' : 'action.selected' }
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: selected ? 'white' : 'text.primary' }}>
                      {label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: selected ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                      Score: {scan.score?.toFixed(0) ?? '–'} • {scan.profile}
                    </Typography>
                  </Box>
                  {selected && <Check className="w-5 h-5 text-white" />}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Main Comparison View */}
        {!showPicker && (
          <>
            {!hasItems && (
              <Box sx={{ py: 4, textAlign: 'center', border: 1, borderStyle: 'dashed', borderColor: 'divider', borderRadius: 2 }}>
                <Columns className="w-8 h-8 mx-auto mb-2" style={{ color: theme.palette.text.secondary }} />
                <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 1 }}>
                  Noch keine Analysen ausgewählt
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowPicker(true)}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Scans auswählen
                </Button>
              </Box>
            )}

            {hasItems && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Selected Items */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {items.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        flex: '1 1 calc(50% - 4px)',
                        minWidth: 140,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        border: 1,
                        borderColor: 'divider'
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: 10 }}>
                          {item.profile}
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          Score: {item.score?.toFixed(0) ?? '–'}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => removeScan(item.id)} sx={{ color: 'text.secondary' }}>
                        <X className="w-4 h-4" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>

                {/* Comparison Table */}
                <TableContainer sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 12 }}>Kennzahl</TableCell>
                        {items.map((item) => (
                          <TableCell key={item.id} sx={{ fontWeight: 600, color: 'text.primary', fontSize: 12 }}>
                            {item.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Total Score Row */}
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: 13 }}>Gesamt-Score</TableCell>
                        {items.map((item) => (
                          <TableCell key={`${item.id}-score`}>
                            <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.5, borderRadius: 1, bgcolor: 'primary.main', color: 'white', fontSize: 12, fontWeight: 600 }}>
                              {item.score?.toFixed(0) ?? '–'}
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>

                      {/* Metric Rows */}
                      {WATER_METRIC_FIELDS.map((metric) => (
                        <TableRow key={metric.key}>
                          <TableCell>
                            <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{metric.label}</Typography>
                            {metric.unit && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{metric.unit}</Typography>}
                          </TableCell>
                          {items.map((item) => {
                            const rawValue = item.values?.[metric.key];
                            const metricScore = item.metricScores?.[metric.key];
                            return (
                              <TableCell key={`${item.id}-${metric.key}`}>
                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>
                                  {typeof rawValue === 'number'
                                    ? `${rawValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${metric.unit ?? ''}`
                                    : '–'}
                                </Typography>
                                {metricScore !== undefined && (
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Score: {metricScore.toFixed(0)}
                                  </Typography>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}

                      {/* Derived Metrics */}
                      {DERIVED_WATER_METRICS.map((metric) => (
                        <TableRow key={metric.key}>
                          <TableCell>
                            <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{metric.label}</Typography>
                            {metric.unit && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{metric.unit}</Typography>}
                          </TableCell>
                          {items.map((item) => {
                            const value = item.values?.[metric.key];
                            return (
                              <TableCell key={`${item.id}-${metric.key}`}>
                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>
                                  {typeof value === 'number'
                                    ? `${value.toFixed(metric.key === 'hardness' ? 1 : 2)}${metric.unit ? ` ${metric.unit}` : ''}`
                                    : '–'}
                                </Typography>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Safe area padding */}
      <Box sx={{ height: 'env(safe-area-inset-bottom)', minHeight: 16 }} />
    </SwipeableDrawer>
  );
}
