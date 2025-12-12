"use client";

import { useState, useMemo, useEffect, useRef, useCallback, type ReactNode, type TouchEvent } from "react";
import { useDebouncedCallback } from "use-debounce";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { Paper, Grid, Stack, Button, Chip, Divider, Box, Snackbar, Alert, SwipeableDrawer } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Card,
  CardActionArea,
  CardContent,
  IconButton,
} from "@mui/material";
import {
  Flame,
  LineChart,
  Star,
  Trash2,
  Share2,
  RefreshCw,
  Filter,
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  Edit3,
  Target,
  Sparkles,
  Check,
  X,
  ScanBarcode,
} from "lucide-react";
import { WaterScoreCard } from "./WaterScoreCard";
import type { ScanResult, ProfileType } from "@/src/domain/types";
import { calculateScores } from "@/src/domain/scoring";
import { deriveWaterInsights } from "@/src/domain/waterInsights";
import { hapticLight } from "@/lib/capacitor";

const PROFILE_LABELS: Record<ProfileType, string> = {
  standard: "Standard",
  baby: "Baby",
  sport: "Sport",
  blood_pressure: "Blutdruck",
  coffee: "Kaffee",
  kidney: "Nieren",
  pregnancy: "Schwangerschaft",
  seniors: "Senioren",
  diabetes: "Diabetes",
};

type SortOption = "newest" | "best" | "worst" | "brand";
type DateFilter = "all" | "week" | "month";
type ScoreFilter = "all" | "high" | "mid" | "low";

interface HistoryListProps {
  initialScans: ScanResult[];
}

// --- MINI SCORE RING (Für die Listenansicht) ---
function MiniScoreRing({
  score,
  size = 40,
}: {
  score: number | undefined;
  size?: number;
}) {
  if (score == null) return <div className="text-gray-400 font-mono text-xs">–</div>;

  const radius = size / 2 - 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let colorClass = "text-rose-500";
  if (score >= 50) colorClass = "text-amber-500";
  if (score >= 80) colorClass = "text-emerald-500";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Background Track */}
      <svg className="absolute inset-0 transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-slate-200 dark:text-slate-700 opacity-20"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={colorClass}
        />
      </svg>
      <span className={`text-[10px] font-bold ${colorClass}`}>{score.toFixed(0)}</span>
    </div>
  );
}

export default function HistoryList({ initialScans }: HistoryListProps) {
  const router = useRouter();
  const theme = useTheme();
  const [scans, setScans] = useState<ScanResult[]>(initialScans);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileFilter, setProfileFilter] = useState<"all" | ProfileType>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [undoQueue, setUndoQueue] = useState<{
    scan: ScanResult;
    timer: NodeJS.Timeout;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    scan: ScanResult;
    x: number;
    y: number;
  } | null>(null);
  const [detailScan, setDetailScan] = useState<ScanResult | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const pullStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearchTerm(value);
  }, 300);

  useEffect(() => {
    try {
      const storedFav = localStorage.getItem("history-favorites");
      const storedHidden = localStorage.getItem("history-hidden");
      if (storedFav) setFavorites(JSON.parse(storedFav));
      if (storedHidden) setHidden(JSON.parse(storedHidden));
    } catch (err) {
      console.warn("Failed to parse history preferences", err);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "history-favorites" && event.newValue) {
        try {
          setFavorites(JSON.parse(event.newValue));
        } catch (err) {
          console.warn("Failed to sync favorites from storage", err);
        }
      }
      if (event.key === "history-hidden" && event.newValue) {
        try {
          setHidden(JSON.parse(event.newValue));
        } catch (err) {
          console.warn("Failed to sync hidden from storage", err);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("history-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("history-hidden", JSON.stringify(hidden));
  }, [hidden]);

  // Keep state in sync with incoming props
  useEffect(() => {
    setScans(initialScans);
  }, [initialScans]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const stats = useMemo(() => buildStats(scans, hidden), [scans, hidden]);

  const filteredScans = useMemo(() => {
    return scans
      .filter((scan) => !hidden[scan.id])
      .filter((scan) => (profileFilter === "all" ? true : scan.profile === profileFilter))
      .filter((scan) => filterByDate(scan.timestamp, dateFilter))
      .filter((scan) => filterByScore(scan.score, scoreFilter))
      .filter((scan) => {
        if (!searchTerm.trim()) return true;
        const haystack = `${scan.productInfo?.brand ?? ""} ${scan.productInfo?.productName ?? ""
          }`.toLowerCase();
        return haystack.includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => sortScans(a, b, sortBy));
  }, [scans, hidden, profileFilter, dateFilter, scoreFilter, searchTerm, sortBy]);

  const groupedScans = useMemo(() => groupScans(filteredScans), [filteredScans]);
  const favoriteItems = useMemo(
    () => filteredScans.filter((s) => favorites[s.id]),
    [filteredScans, favorites]
  );
  const regularItems = useMemo(
    () => filteredScans.filter((s) => !favorites[s.id]),
    [filteredScans, favorites]
  );

  // Pagination Logic (Load more)
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(0);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [profileFilter, dateFilter, scoreFilter, searchTerm, hidden]);

  const showCount = useMemo(() => (page + 1) * ITEMS_PER_PAGE, [page]);
  const currentPageItems = useMemo(() => filteredScans.slice(0, showCount), [filteredScans, showCount]);
  const hasMore = filteredScans.length > currentPageItems.length;
  const pageFavorites = useMemo(
    () => currentPageItems.filter((s) => favorites[s.id]),
    [currentPageItems, favorites]
  );
  const pageRegulars = useMemo(
    () => currentPageItems.filter((s) => !favorites[s.id]),
    [currentPageItems, favorites]
  );

  const collapseToFirstPage = () => {
    setPage(0);
    if (listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setScans(data as ScanResult[]);
          setPage(0);
        }
      }
    } catch (err) {
      console.warn("Refresh failed", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const onTouchStart = (e: TouchEvent) => {
    if (!listRef.current) return;
    const touch = e.touches?.[0];
    if (!touch) return;
    if (listRef.current.scrollTop <= 0) {
      pullStartY.current = touch.clientY;
      setPullDistance(0);
    } else {
      pullStartY.current = null;
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (pullStartY.current == null) return;
    const touch = e.touches?.[0];
    if (!touch) return;
    const delta = touch.clientY - pullStartY.current;
    if (delta > 0) {
      e.preventDefault();
      setPullDistance(Math.min(delta, 120));
    } else {
      setPullDistance(0);
    }
  };

  const onTouchEnd = () => {
    const threshold = 60;
    if (pullDistance >= threshold) {
      void handleRefresh();
    }
    pullStartY.current = null;
    setPullDistance(0);
  };

  const handleFavorite = async (scan: ScanResult) => {
    await hapticLight();
    setFavorites((prev) => ({ ...prev, [scan.id]: !prev[scan.id] }));
  };

  const handleDelete = async (scan: ScanResult) => {
    await hapticLight();
    setHidden((prev) => ({ ...prev, [scan.id]: true }));
    if (undoQueue?.timer) clearTimeout(undoQueue.timer);

    const timer = setTimeout(() => {
      setUndoQueue(null);
    }, 5000);

    undoTimerRef.current = timer;
    setUndoQueue({ scan, timer });
  };

  const undoDelete = () => {
    if (undoQueue?.timer) clearTimeout(undoQueue.timer);
    if (undoQueue?.scan) {
      setHidden((prev) => {
        const next = { ...prev };
        delete next[undoQueue.scan.id];
        return next;
      });
    }
    setUndoQueue(null);
  };

  const openContextMenu = (scan: ScanResult, x: number, y: number) => {
    setContextMenu({ scan, x, y });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleShare = async (scan: ScanResult) => {
    const title = scan.productInfo?.brand ?? "Wasseranalyse";
    const text = `Score ${scan.score?.toFixed(0) ?? "–"} (${scan.profile})`;
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, text, url });
    } else {
      await navigator.clipboard.writeText(`${title} – ${text} ${url}`);
      alert("Link kopiert!");
    }
  };

  const handleProfileSwitch = (scan: ScanResult, nextProfile: ProfileType) => {
    const mergedValues = {
      ...(scan.ocrParsedValues ?? {}),
      ...(scan.userOverrides ?? {}),
    };
    const hasValues = Object.keys(mergedValues).length > 0;
    if (!hasValues) {
      setScans((prev) =>
        prev.map((s) => (s.id === scan.id ? { ...s, profile: nextProfile } : s))
      );
      return;
    }

    const scoreResult = calculateScores(mergedValues, nextProfile);
    const insights = deriveWaterInsights(mergedValues);
    const metricScoreMap = scoreResult.metrics.reduce<Record<string, number>>((acc, metric) => {
      acc[metric.metric] = metric.score;
      return acc;
    }, {});

    setScans((prev) =>
      prev.map((s) =>
        s.id === scan.id
          ? {
            ...s,
            profile: nextProfile,
            score: scoreResult.totalScore,
            metricDetails: scoreResult.metrics,
            metricScores: metricScoreMap,
            insights,
          }
          : s
      )
    );
  };

  const handleRescan = (scan: ScanResult, profile?: ProfileType) => {
    const query = new URLSearchParams({
      profile: profile ?? scan.profile,
    });
    if (scan.barcode) query.set("barcode", scan.barcode);
    router.push(`/scan?${query.toString()}`);
  };

  const handlePrefillConsumption = async (scan: ScanResult, volume: number = 500) => {
    await hapticLight();
    const mergedValues = {
      ...(scan.ocrParsedValues ?? {}),
      ...(scan.userOverrides ?? {}),
    };
    const payload = {
      id: scan.id,
      volumeMl: volume,
      brand: scan.productInfo?.brand ?? null,
      productName: scan.productInfo?.productName ?? null,
      values: mergedValues,
    };
    localStorage.setItem("consumption-prefill", JSON.stringify(payload));
    router.push("/dashboard?prefill=1");
  };

  const handleEditDetails = (scan: ScanResult) => {
    setDetailScan(scan);
  };

  const handleLongPress = (scan: ScanResult, x: number, y: number) => {
    openContextMenu(scan, x, y);
  };

  if (initialScans.length === 0) {
    return <EmptyState />;
  }

  const hasResults = filteredScans.length > 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        color: theme.palette.text.primary,
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Stats Header with Search Icon */}
      <div className="flex-none z-10">
        <StatsHeader
          stats={stats}
          theme={theme}
          onOpenFilter={() => setFilterSheetOpen(true)}
          hasActiveFilters={searchTerm !== "" || profileFilter !== "all" || dateFilter !== "all" || scoreFilter !== "all"}
        />
      </div>

      {/* Main Content Area (Paginated) */}
      <div className="flex-1 relative w-full overflow-hidden pb-16">
        {!hasResults ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-24 h-24 mb-4 rounded-3xl bg-ocean-surface-elevated border border-ocean-border flex items-center justify-center shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
              <Search className="w-10 h-10 text-ocean-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-ocean-primary">
              Keine Einträge
            </h3>
            <p className="text-sm text-ocean-secondary mt-2 max-w-[260px]">
              Noch nichts gescannt. Leg los und erfasse dein erstes Wasser.
            </p>
            <Link
              href="/scan"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-ocean-primary to-ocean-accent text-white font-semibold shadow-[0_8px_20px_rgba(14,165,233,0.3)] active:scale-95 transition"
              onClick={() => hapticLight()}
            >
              <span>Jetzt scannen</span>
              <Search className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Simple List Container */}
            <div className="flex-1 relative">
              <div
                ref={listRef}
                className="h-full overflow-y-auto scrollbar-hide"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <div
                  className="flex items-center justify-center transition-all duration-150"
                  style={{
                    height: pullDistance > 0 ? 36 : isRefreshing ? 36 : 0,
                    opacity: pullDistance > 0 || isRefreshing ? 1 : 0,
                  }}
                >
                  {/* Native-style spinner only, no text */}
                  <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div
                  className="pb-4 px-4 transition-transform duration-150"
                  style={{ transform: `translateY(${pullDistance}px)` }}
                >
                  <>
                    {/* Favoriten Section */}
                    {pageFavorites.length > 0 && (
                      <>
                        <div className="px-1 py-2 text-xs font-semibold text-sky-600 flex items-center gap-1">
                          <span role="img" aria-label="star">⭐</span> Favoriten
                        </div>
                        {pageFavorites.map((scan) => (
                          <SwipeableRow
                            key={scan.id}
                            onFavorite={() => handleFavorite(scan)}
                            onDelete={() => handleDelete(scan)}
                            onSwipeStart={closeContextMenu}
                            scan={scan}
                            onMore={(s: any, x: any, y: any) => openContextMenu(s, x, y)}
                            onShare={() => handleShare(scan)}
                            onRescan={() => handleRescan(scan)}
                            onEdit={() => handleEditDetails(scan)}
                            expanded={expandedId === scan.id}
                            onLongPress={handleLongPress}
                          >
                            <HistoryCard
                              scan={scan}
                              isExpanded={expandedId === scan.id}
                              onToggleExpand={() => {
                                setExpandedId((prev) => {
                                  const next = prev === scan.id ? null : scan.id;
                                  return next;
                                });
                              }}
                              isFavorite={Boolean(favorites[scan.id])}
                              onProfileChange={(p: ProfileType) => handleProfileSwitch(scan, p)}
                              onPrefillConsumption={handlePrefillConsumption}
                              theme={theme}
                            />
                          </SwipeableRow>
                        ))}
                      </>
                    )}

                    {/* Time-grouped Sections */}
                    {groupedScans.map((group) => {
                      // Filter out favorites from each group to avoid duplicates
                      const groupItems = group.items.filter((s) => !favorites[s.id]);
                      // Only show items that are in the current page
                      const visibleItems = groupItems.filter((s) =>
                        currentPageItems.some((item) => item.id === s.id)
                      );
                      if (visibleItems.length === 0) return null;

                      return (
                        <div key={group.label}>
                          <div className="px-1 py-2 text-xs font-semibold text-ocean-secondary uppercase tracking-wide">
                            {group.label}
                          </div>
                          {visibleItems.map((scan) => (
                            <SwipeableRow
                              key={scan.id}
                              onFavorite={() => handleFavorite(scan)}
                              onDelete={() => handleDelete(scan)}
                              onSwipeStart={closeContextMenu}
                              scan={scan}
                              onMore={(s: any, x: any, y: any) => openContextMenu(s, x, y)}
                              onShare={() => handleShare(scan)}
                              onRescan={() => handleRescan(scan)}
                              onEdit={() => handleEditDetails(scan)}
                              expanded={expandedId === scan.id}
                              onLongPress={handleLongPress}
                            >
                              <HistoryCard
                                scan={scan}
                                isExpanded={expandedId === scan.id}
                                onToggleExpand={() => {
                                  setExpandedId((prev) => {
                                    const next = prev === scan.id ? null : scan.id;
                                    return next;
                                  });
                                }}
                                isFavorite={Boolean(favorites[scan.id])}
                                onProfileChange={(p: ProfileType) => handleProfileSwitch(scan, p)}
                                onPrefillConsumption={handlePrefillConsumption}
                                theme={theme}
                              />
                            </SwipeableRow>
                          ))}
                        </div>
                      );
                    })}
                  </>
                </div>
              </div>
            </div>

            {(hasMore || page > 0) && (
              <div className="py-6 flex justify-center gap-3">
                {page > 0 && (
                  <button
                    onClick={collapseToFirstPage}
                    className="px-4 py-3 bg-ocean-surface border border-ocean-border text-ocean-primary rounded-full font-medium text-sm shadow-lg active:scale-95 flex items-center gap-2"
                  >
                    <ChevronUp className="w-4 h-4" />
                    Weniger anzeigen
                  </button>
                )}
                {hasMore && (
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-6 py-3 bg-sky-500 text-white rounded-full font-medium text-sm shadow-lg active:scale-95"
                  >
                    Mehr anzeigen ({filteredScans.length - currentPageItems.length} weitere)
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Undo Toast */}
        <Snackbar
          open={Boolean(undoQueue)}
          onClose={() => setUndoQueue(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          message="Scan entfernt"
          action={
            <Button color="success" size="small" onClick={undoDelete}>
              Rückgängig
            </Button>
          }
        />

        {/* Context Menu Portal */}
        {contextMenu && (
          <ContextMenu
            context={contextMenu}
            onClose={closeContextMenu}
            onShare={() => handleShare(contextMenu.scan)}
            onRescan={() => handleRescan(contextMenu.scan)}
            onProfileSwitch={(profile: ProfileType) =>
              handleRescan(contextMenu.scan, profile)
            }
            onEdit={() => handleEditDetails(contextMenu.scan)}
            onFavorite={() => handleFavorite(contextMenu.scan)}
            isFavorite={Boolean(favorites[contextMenu.scan.id])}
          />
        )}

        {detailScan && (
          <DetailDialog scan={detailScan} onClose={() => setDetailScan(null)} />
        )}
      </div>

      {/* Search & Filter Bottom Sheet */}
      <SwipeableDrawer
        anchor="bottom"
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        onOpen={() => setFilterSheetOpen(true)}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: "85vh",
            bgcolor: theme.palette.background.default,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Drag Handle */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: "divider" }} />
          </Box>

          {/* Search Field */}
          <TextField
            variant="outlined"
            fullWidth
            defaultValue={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Wasser suchen..."
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="w-5 h-5 text-ocean-tertiary" />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />

          {/* Filter Sections */}
          <Stack spacing={3}>
            {/* Profile Filter */}
            <Box>
              <Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, mb: 1, display: "block" }}>Profil</Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <FilterChip label="Alle" active={profileFilter === "all"} onClick={() => setProfileFilter("all")} />
                {Object.entries(PROFILE_LABELS).map(([key, label]) => (
                  <FilterChip key={key} label={label} active={profileFilter === key} onClick={() => setProfileFilter(key as ProfileType)} />
                ))}
              </Stack>
            </Box>

            {/* Time Filter */}
            <Box>
              <Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, mb: 1, display: "block" }}>Zeitraum</Box>
              <Stack direction="row" spacing={1}>
                <FilterChip label="Alle" active={dateFilter === "all"} onClick={() => setDateFilter("all")} />
                <FilterChip label="Woche" active={dateFilter === "week"} onClick={() => setDateFilter("week")} />
                <FilterChip label="Monat" active={dateFilter === "month"} onClick={() => setDateFilter("month")} />
              </Stack>
            </Box>

            {/* Score Filter */}
            <Box>
              <Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, mb: 1, display: "block" }}>Score</Box>
              <Stack direction="row" spacing={1}>
                <FilterChip label="Alle" active={scoreFilter === "all"} onClick={() => setScoreFilter("all")} />
                <FilterChip label="80+" active={scoreFilter === "high"} onClick={() => setScoreFilter("high")} />
                <FilterChip label="50-80" active={scoreFilter === "mid"} onClick={() => setScoreFilter("mid")} />
                <FilterChip label="0-50" active={scoreFilter === "low"} onClick={() => setScoreFilter("low")} />
              </Stack>
            </Box>

            <Divider />

            {/* Sort & Apply */}
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <CustomSortDropdown value={sortBy} onChange={setSortBy} />
              <Button
                variant="contained"
                onClick={() => setFilterSheetOpen(false)}
                sx={{ borderRadius: 2, px: 4 }}
              >
                Anwenden
              </Button>
            </Stack>
          </Stack>
        </Box>
      </SwipeableDrawer>
    </Box>
  );
}

// --- COMPACT STATS HEADER WITH SEARCH/FILTER ICONS ---
function StatsHeader({
  stats,
  theme,
  onOpenFilter,
  hasActiveFilters
}: {
  stats: ReturnType<typeof buildStats>;
  theme: any;
  onOpenFilter: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Box component="span" sx={{ fontSize: 14, color: "text.secondary" }}>
        <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>{stats.total}</Box> Scans
        {stats.avgScore && (
          <>
            <Box component="span" sx={{ mx: 1, color: "divider" }}>·</Box>
            <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>Ø {stats.avgScore}</Box>
          </>
        )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {stats.streak > 0 && (
          <Box component="span" sx={{ fontSize: 12, color: "warning.main", fontWeight: 500, mr: 1 }}>
            🔥 {stats.streak}
          </Box>
        )}
        <IconButton
          onClick={onOpenFilter}
          size="small"
          sx={{
            color: hasActiveFilters ? "primary.main" : "text.secondary",
            bgcolor: hasActiveFilters ? "rgba(14, 165, 233, 0.1)" : "transparent",
          }}
        >
          <Search className="w-5 h-5" />
        </IconButton>
      </Box>
    </Box>
  );
}

// --- REDESIGNED FILTER BAR (MUI Paper/Stack) ---
function FilterToolbar({
  profileFilter,
  setProfileFilter,
  dateFilter,
  setDateFilter,
  scoreFilter,
  setScoreFilter,
  sortBy,
  setSortBy,
  searchTerm,
  onSearchChange,
  theme,
}: {
  profileFilter: string;
  setProfileFilter: (p: any) => void;
  dateFilter: string;
  setDateFilter: (d: any) => void;
  scoreFilter: string;
  setScoreFilter: (s: any) => void;
  sortBy: string;
  setSortBy: (s: any) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  theme: any;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      sx={{
        p: 2,
        position: "sticky",
        top: 0,
        zIndex: 20,
        bgcolor: theme.palette.mode === "dark"
          ? "rgba(15, 23, 42, 0.85)"
          : "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
        <TextField
          variant="filled"
          fullWidth
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Suchen..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className="w-4 h-4 text-ocean-tertiary" />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: theme.palette.surface.muted,
              borderRadius: 999, // Pill shape
              "&:before, &:after": { borderBottom: "none !important" },
              "& input": { color: "#e2e8f0" },
            },
          }}
          sx={{
            "& .MuiFilledInput-root": {
              borderRadius: 999, // Pill shape
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#94a3b8",
              opacity: 1,
            },
          }}
          size="small"
        />
        <Button
          variant={expanded ? "contained" : "text"}
          startIcon={<Filter className="w-4 h-4" />}
          onClick={() => setExpanded(!expanded)}
          sx={{ borderRadius: 999 }}
        >
          Filter
        </Button>
      </Stack>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Box mt={2} p={1}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profil</span>
                  <FilterChip label="Alle" active={profileFilter === "all"} onClick={() => setProfileFilter("all")} />
                  {Object.entries(PROFILE_LABELS).map(([key, label]) => (
                    <FilterChip key={key} label={label} active={profileFilter === key} onClick={() => setProfileFilter(key)} />
                  ))}
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" flex={1}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Zeit</span>
                    <FilterChip label="Alle" active={dateFilter === "all"} onClick={() => setDateFilter("all")} />
                    <FilterChip label="Woche" active={dateFilter === "week"} onClick={() => setDateFilter("week")} />
                    <FilterChip label="Monat" active={dateFilter === "month"} onClick={() => setDateFilter("month")} />
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" flex={1}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Score</span>
                    <FilterChip label="Alle" active={scoreFilter === "all"} onClick={() => setScoreFilter("all")} />
                    <FilterChip label="80+" active={scoreFilter === "high"} onClick={() => setScoreFilter("high")} />
                    <FilterChip label="50-80" active={scoreFilter === "mid"} onClick={() => setScoreFilter("mid")} />
                    <FilterChip label="0-50" active={scoreFilter === "low"} onClick={() => setScoreFilter("low")} />
                  </Stack>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <CustomSortDropdown value={sortBy} onChange={setSortBy} />
                  <Button size="small" onClick={() => setExpanded(false)}>
                    Schließen
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

function FilterChip({ label, active, onClick }: any) {
  return (
    <Chip
      label={label}
      color={active ? "primary" : "default"}
      variant={active ? "filled" : "outlined"}
      size="small"
      onClick={onClick}
      sx={{
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.4,
      }}
    />
  );
}

function ProfileChip({ label, active, onClick }: any) {
  return (
    <Chip
      label={label}
      color={active ? "primary" : "default"}
      variant={active ? "filled" : "outlined"}
      onClick={onClick}
      size="small"
      sx={{ fontWeight: 700 }}
    />
  );
}

// --- REDESIGNED CARD ---
function HistoryCard({ scan, isExpanded, onToggleExpand, isFavorite, onProfileChange, onPrefillConsumption, theme }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
      <div className="bg-transparent">
        <CardActionArea onClick={onToggleExpand}>
          <CardContent sx={{ pb: 1.5 }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative shrink-0">
                  <MiniScoreRing score={scan.score} size={44} />
                  {isFavorite && (
                    <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5 border-2 border-white dark:border-slate-900">
                      <Star className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-bold text-ocean-primary truncate text-base leading-tight">
                      {scan.productInfo?.brand ?? "Unbekanntes Wasser"}
                    </h4>
                    {scan.productInfo?.productName && (
                      <span className="text-xs text-ocean-tertiary truncate hidden sm:inline">
                        · {scan.productInfo.productName}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ocean-secondary/80 flex items-center gap-1.5">
                    <span>{formatDate(new Date(scan.timestamp))}</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-ocean-border" />
                    <span className="capitalize text-sky-600 dark:text-sky-400 font-medium">
                      {PROFILE_LABELS[scan.profile as ProfileType] || scan.profile}
                    </span>
                  </div>
                </div>
              </div>
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-ocean-secondary shrink-0">
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </div>
          </CardContent>
        </CardActionArea>

        {/* EXPANDED CONTENT */}
        <AnimatePresence>
          {
            isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <CardContent sx={{ borderTop: "1px solid", borderColor: theme?.palette?.surface?.border, bgcolor: theme?.palette?.surface?.card }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                    {(["standard", "baby", "sport", "blood_pressure", "coffee", "kidney", "pregnancy", "seniors", "diabetes"] as ProfileType[]).map((p) => (
                      <ProfileChip key={p} label={PROFILE_LABELS[p]} active={scan.profile === p} onClick={() => onProfileChange?.(p)} />
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrefillConsumption(scan);
                      }}
                    >
                      + Konsum (500 ml)
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrefillConsumption(scan, 330);
                      }}
                    >
                      + Konsum (330 ml)
                    </Button>
                  </Stack>
                  <WaterScoreCard scanResult={scan} />
                </CardContent>
              </motion.div>
            )
          }
        </AnimatePresence >
      </div >
    </motion.div >
  );
}

// --- UPDATED SWIPEABLE ROW ---
function SwipeableRow({
  children,
  onFavorite,
  onDelete,
  onSwipeStart,
  scan,
  onShare,
  onRescan,
  onEdit,
  onMore,
  expanded,
}: any) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showActions, setShowActions] = useState<"left" | "right" | null>(null);
  const startX = useRef(0);
  const longPressTimer = useRef<any>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: any) => {
    if (expanded) return;
    // WICHTIG: Kontextmenü schließen
    if (onSwipeStart) onSwipeStart();

    setShowActions(null);
    startX.current = e.clientX;
    setIsDragging(true);
    // long press disabled for swipe to avoid modal
    longPressTimer.current = null;
  };

  const handlePointerMove = (e: any) => {
    if (expanded) return; // block swipe when card is expanded
    if (!isDragging) return;
    const delta = e.clientX - startX.current;
    // Limit swipe distance
    setOffset(Math.max(-100, Math.min(100, delta)));
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (offset > 60) {
      setShowActions("right");
      setOffset(110);
    } else if (offset < -60) {
      setShowActions("left");
      setOffset(-110);
    } else {
      setShowActions(null);
      setOffset(0);
    }
    setIsDragging(false);
  };

  const handleMoreClick = (e: any) => {
    e.stopPropagation();
    closeActions();
    if (onMore) {
      const rect = rowRef.current?.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : e.clientX;
      const y = rect ? rect.top + rect.height / 2 : e.clientY;
      onMore(scan, x, y);
    }
  };

  const closeActions = () => {
    setShowActions(null);
    setOffset(0);
  };

  const handleFavoriteClick = async (e?: any) => {
    if (e) e.stopPropagation();
    await onFavorite();
    closeActions();
  };

  const handleDeleteClick = async (e?: any) => {
    if (e) e.stopPropagation();
    await onDelete();
    closeActions();
  };

  return (
    <div className="relative touch-pan-y select-none group overflow-hidden" ref={rowRef}>
      {/* Hintergrund-Aktionen im Apple-Mail-Stil */}
      <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto h-full">
          <button
            onClick={handleFavoriteClick}
            className="flex items-center gap-2 h-full bg-amber-500 text-white px-4 text-xs font-bold"
          >
            <Star className="w-4 h-4 fill-white" />
            Favorit
          </button>
          <button
            onClick={handleMoreClick}
            className="flex items-center gap-1 h-full bg-slate-700 text-white px-4 text-xs font-bold"
          >
            <Edit3 className="w-4 h-4" />
            …
          </button>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto h-full">
          <button
            onClick={handleMoreClick}
            className="flex items-center gap-1 h-full bg-slate-700 text-white px-4 text-xs font-bold"
          >
            <Share2 className="w-4 h-4" />
            …
          </button>
          <button
            onClick={handleDeleteClick}
            className="flex items-center gap-2 h-full bg-rose-500 text-white px-4 text-xs font-bold"
          >
            <Trash2 className="w-4 h-4" />
            Löschen
          </button>
        </div>
      </div>

      {/* Vordergrund-Karte: MUSS einen festen Hintergrund haben! */}
      <motion.div
        style={{ x: offset }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        // WICHTIG: Festen Hintergrund setzen!
        className="relative bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
      >
        {children}

      </motion.div>
    </div>
  );
}

// --- HELPER FUNCTIONS ---

function buildStats(scans: ScanResult[], hidden: any) {
  const visible = scans.filter((scan) => !hidden[scan.id]);
  const total = visible.length;
  const thisWeek = visible.filter(
    (scan) => new Date(scan.timestamp) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const validScores = visible.map((s) => s.score).filter((s): s is number => s != null);
  const avgScore = validScores.length
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(0)
    : null;
  const streak = 0; // Platzhalter
  const profileCounts: any = {};
  visible.forEach(
    (s) => (profileCounts[s.profile] = (profileCounts[s.profile] || 0) + 1)
  );
  let topProfile = null;
  let topCount = 0;
  Object.entries(profileCounts).forEach(([p, c]: any) => {
    if (c > topCount) {
      topCount = c;
      topProfile = p;
    }
  });
  return { total, thisWeek, avgScore, streak, topProfile, topCount };
}

function filterByDate(ts: string, filter: string) {
  if (filter === "all") return true;
  const d = new Date(ts);
  const now = new Date();
  if (filter === "week") return d >= new Date(now.setDate(now.getDate() - 7));
  if (filter === "month") return d >= new Date(now.setMonth(now.getMonth() - 1));
  return true;
}

function filterByScore(score: number | undefined, filter: string) {
  if (filter === "all") return true;
  if (score == null) return false;
  if (filter === "high") return score >= 90;
  if (filter === "mid") return score >= 70 && score < 90;
  return score < 70;
}

function sortScans(a: ScanResult, b: ScanResult, sortBy: string) {
  if (sortBy === "newest")
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  if (sortBy === "best") return (b.score || 0) - (a.score || 0);
  if (sortBy === "worst") return (a.score || 0) - (b.score || 0);
  return (a.productInfo?.brand || "").localeCompare(b.productInfo?.brand || "");
}

function groupScans(scans: ScanResult[]) {
  if (!scans.length) return [];

  const groups: { label: string; items: ScanResult[] }[] = [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;

  const buckets = {
    today: [] as ScanResult[],
    yesterday: [] as ScanResult[],
    week: [] as ScanResult[],
    older: [] as ScanResult[],
  };

  scans.forEach((s) => {
    const t = new Date(s.timestamp).getTime();
    if (t >= todayStart) buckets.today.push(s);
    else if (t >= yesterdayStart) buckets.yesterday.push(s);
    else if (t >= weekStart) buckets.week.push(s);
    else buckets.older.push(s);
  });

  if (buckets.today.length) groups.push({ label: "Heute", items: buckets.today });
  if (buckets.yesterday.length) groups.push({ label: "Gestern", items: buckets.yesterday });
  if (buckets.week.length) groups.push({ label: "Diese Woche", items: buckets.week });
  if (buckets.older.length) groups.push({ label: "Älter", items: buckets.older });

  return groups;
}

function CustomSortDropdown({ value, onChange }: any) {
  return (
    <div className="flex items-center justify-between text-xs text-slate-500">
      <span>Sortierung</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent font-medium text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
      >
        <option value="newest">Neueste</option>
        <option value="best">Beste</option>
        <option value="worst">Schlechteste</option>
      </select>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function EmptyState() {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 2,
        p: 3,
        borderRadius: 3,
        borderColor: "divider",
        borderStyle: "dashed",
        opacity: 0.85,
      }}
    >
      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
        <Target className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
        Keine Scans gefunden
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mt-2">
        Scanne dein erstes Wasser, um hier eine Historie zu sehen.
      </p>
      <Button
        href="/scan"
        component={Link}
        variant="contained"
        startIcon={<ScanBarcode className="w-4 h-4" />}
        sx={{ borderRadius: 999 }}
      >
        Scannen
      </Button>
    </Paper>
  );
}

function ContextMenu({ context, onClose, onFavorite, onShare, onRescan, onEdit }: any) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center sm:justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="w-full sm:w-64 bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl p-2 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <ContextBtn
          icon={<Star className="w-4 h-4" />}
          label="Favorit"
          onClick={onFavorite}
        />
        <ContextBtn
          icon={<Share2 className="w-4 h-4" />}
          label="Teilen"
          onClick={onShare}
        />
        <ContextBtn
          icon={<RefreshCw className="w-4 h-4" />}
          label="Erneut scannen"
          onClick={onRescan}
        />
        <ContextBtn
          icon={<Edit3 className="w-4 h-4" />}
          label="Bearbeiten"
          onClick={onEdit}
        />
        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
        <ContextBtn
          icon={<X className="w-4 h-4" />}
          label="Abbrechen"
          onClick={onClose}
          danger
        />
      </motion.div>
    </div>,
    document.body
  );
}

function ContextBtn({ icon, label, onClick, danger }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl ${danger ? "text-rose-500" : "text-slate-700 dark:text-slate-200"
        }`}
    >
      {icon} {label}
    </button>
  );
}
function NoResults() {
  return <div className="p-8 text-center text-slate-400 text-sm">Nichts gefunden.</div>;
}
function DetailDialog({ scan, onClose }: any) {
  return null; /* Placeholder */
}
