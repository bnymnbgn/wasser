'use client';

import { useState, useMemo, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, LineChart, Star, Trash2, Share2, RefreshCw, Filter, Calendar, Search, ChevronDown, Edit3, Target, Sparkles } from 'lucide-react';
import { WaterScoreCard } from './WaterScoreCard';
import type { ScanResult, ProfileType } from '@/src/domain/types';
import { hapticLight } from '@/lib/capacitor';

const PROFILE_LABELS: Record<ProfileType, string> = {
  standard: 'Standard',
  baby: 'Baby',
  sport: 'Sport',
  blood_pressure: 'Blutdruck',
};

type SortOption = 'newest' | 'best' | 'worst' | 'brand';
type DateFilter = 'all' | 'week' | 'month';
type ScoreFilter = 'all' | 'high' | 'mid' | 'low';

interface HistoryListProps {
  initialScans: ScanResult[];
}

export default function HistoryList({ initialScans }: HistoryListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [profileFilter, setProfileFilter] = useState<'all' | ProfileType>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [undoQueue, setUndoQueue] = useState<{ scan: ScanResult; timer: NodeJS.Timeout } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ scan: ScanResult; x: number; y: number } | null>(null);
  const [detailScan, setDetailScan] = useState<ScanResult | null>(null);

  useEffect(() => {
    const storedFav = localStorage.getItem('history-favorites');
    const storedHidden = localStorage.getItem('history-hidden');
    if (storedFav) setFavorites(JSON.parse(storedFav));
    if (storedHidden) setHidden(JSON.parse(storedHidden));
  }, []);

  useEffect(() => {
    localStorage.setItem('history-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('history-hidden', JSON.stringify(hidden));
  }, [hidden]);

  const stats = useMemo(() => buildStats(initialScans, hidden), [initialScans, hidden]);

  const filteredScans = useMemo(() => {
    return initialScans
      .filter((scan) => !hidden[scan.id])
      .filter((scan) => (profileFilter === 'all' ? true : scan.profile === profileFilter))
      .filter((scan) => filterByDate(scan.timestamp, dateFilter))
      .filter((scan) => filterByScore(scan.score, scoreFilter))
      .filter((scan) => {
        if (!searchTerm.trim()) return true;
        const haystack = `${scan.productInfo?.brand ?? ''} ${scan.productInfo?.productName ?? ''}`.toLowerCase();
        return haystack.includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => sortScans(a, b, sortBy));
  }, [initialScans, hidden, profileFilter, dateFilter, scoreFilter, searchTerm, sortBy]);

  const groupedScans = useMemo(() => groupScans(filteredScans), [filteredScans]);

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
    const title = scan.productInfo?.brand ?? 'Wasseranalyse';
    const text = `Score ${scan.score?.toFixed(0) ?? '–'} (${scan.profile})`;
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, text, url });
    } else {
      await navigator.clipboard.writeText(`${title} – ${text} ${url}`);
      alert('Link kopiert!');
    }
  };

  const handleRescan = (scan: ScanResult, profile?: ProfileType) => {
    const query = new URLSearchParams({
      profile: profile ?? scan.profile,
    });
    if (scan.barcode) query.set('barcode', scan.barcode);
    router.push(`/scan?${query.toString()}`);
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
    <div className="space-y-5">
      <StatsHeader stats={stats} />

      <FilterToolbar
        profileFilter={profileFilter}
        setProfileFilter={setProfileFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        scoreFilter={scoreFilter}
        setScoreFilter={setScoreFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {!hasResults && <NoResults /> }

      {hasResults && (
        <div className="space-y-6">
          {groupedScans.map(({ label, items }) => (
            items ? (
            <div key={label} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-md-onSurface dark:text-md-dark-onSurface px-1">
                <Calendar className="w-4 h-4" />
                {label}
              </div>
              <div className="space-y-3">
                {items?.map((scan) => (
                  <SwipeableRow
                    key={scan.id}
                    onFavorite={() => handleFavorite(scan)}
                    onDelete={() => handleDelete(scan)}
                    isFavorite={Boolean(favorites[scan.id])}
                    onLongPress={handleLongPress}
                    scan={scan}
                  >
                    <HistoryCard
                      scan={scan}
                      isExpanded={expandedId === scan.id}
                      onToggleExpand={() => setExpandedId((prev) => (prev === scan.id ? null : scan.id))}
                      isFavorite={Boolean(favorites[scan.id])}
                    />
                  </SwipeableRow>
                ))}
              </div>
            </div>
            ) : null
          ))}
        </div>
      )}

      <AnimatePresence>
        {undoQueue && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="rounded-full bg-slate-900 text-white px-4 py-2 shadow-2xl flex items-center gap-3 text-sm">
              Scan entfernt
              <button onClick={undoDelete} className="text-emerald-300 font-semibold">
                Rückgängig
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {contextMenu && (
        <ContextMenu
          context={contextMenu}
          onClose={closeContextMenu}
          onShare={() => handleShare(contextMenu.scan)}
          onRescan={() => handleRescan(contextMenu.scan)}
          onProfileSwitch={(profile) => handleRescan(contextMenu.scan, profile)}
          onEdit={() => handleEditDetails(contextMenu.scan)}
          onFavorite={() => handleFavorite(contextMenu.scan)}
          isFavorite={Boolean(favorites[contextMenu.scan.id])}
        />
      )}

      {detailScan && (
        <DetailDialog scan={detailScan} onClose={() => setDetailScan(null)} />
      )}

    </div>
  );
}

function StatsHeader({ stats }: { stats: ReturnType<typeof buildStats> }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon={<LineChart className="w-5 h-5 text-water-accent" />}
        label="Scans gesamt"
        value={stats.total.toString()}
        description={`${stats.thisWeek} diese Woche`}
      />
      <StatCard
        icon={<Sparkles className="w-5 h-5 text-status-good" />}
        label="Durchschnitt"
        value={`${stats.avgScore ?? '–'}`}
        description={`Letzte 5: ${stats.lastScores.join(' · ') || '–'}`}
      />
      <StatCard
        icon={<Target className="w-5 h-5 text-water-primary" />}
        label="Lieblingsprofil"
        value={stats.topProfile ? PROFILE_LABELS[stats.topProfile] : '–'}
        description={`${stats.topCount} Scans`}
      />
      <StatCard
        icon={<Flame className="w-5 h-5 text-status-warning" />}
        label="Streak"
        value={`${stats.streak} Tage`}
        description={stats.streak > 0 ? 'Dranbleiben!' : 'Heute starten'}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="glass-panel p-4 text-white">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-white/60">{description}</div>
    </div>
  );
}

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
  setSearchTerm,
}: {
  profileFilter: 'all' | ProfileType;
  setProfileFilter: (value: 'all' | ProfileType) => void;
  dateFilter: DateFilter;
  setDateFilter: (value: DateFilter) => void;
  scoreFilter: ScoreFilter;
  setScoreFilter: (value: ScoreFilter) => void;
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}) {
  return (
    <div className="glass-panel space-y-4 text-white">
      <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
        <FilterChip
          icon={<Filter className="w-3.5 h-3.5" />}
          label="Alle"
          active={profileFilter === 'all'}
          onClick={() => setProfileFilter('all')}
        />
        {Object.entries(PROFILE_LABELS).map(([key, label]) => (
          <FilterChip
            key={key}
            label={label}
            active={profileFilter === key}
            onClick={() => setProfileFilter(key as ProfileType)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
        <FilterChip
          label="Alle Zeiträume"
          active={dateFilter === 'all'}
          onClick={() => setDateFilter('all')}
        />
        <FilterChip
          label="Diese Woche"
          active={dateFilter === 'week'}
          onClick={() => setDateFilter('week')}
        />
        <FilterChip
          label="Dieser Monat"
          active={dateFilter === 'month'}
          onClick={() => setDateFilter('month')}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
        <FilterChip label="Alle Scores" active={scoreFilter === 'all'} onClick={() => setScoreFilter('all')} />
        <FilterChip label="90+" active={scoreFilter === 'high'} onClick={() => setScoreFilter('high')} />
        <FilterChip label="70 – 89" active={scoreFilter === 'mid'} onClick={() => setScoreFilter('mid')} />
        <FilterChip label="< 70" active={scoreFilter === 'low'} onClick={() => setScoreFilter('low')} />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Marke oder Produkt suchen"
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-white/50 outline-none transition focus:border-water-accent/50 focus:ring-2 focus:ring-water-accent/30"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
          Sortierung:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-water-primary/60"
          >
            <option value="newest">Neueste</option>
            <option value="best">Beste Scores</option>
            <option value="worst">Niedrigste Scores</option>
            <option value="brand">Marke A–Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex items-center gap-1 rounded-full px-3 py-1 text-[11px] tracking-[0.2em] transition',
        active
          ? 'border-water-accent/60 bg-gradient-to-r from-water-primary/40 to-water-accent/30 text-white shadow-glow'
          : 'border-white/15 bg-white/5 text-white/70 hover:border-water-accent/40'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function HistoryCard({
  scan,
  isExpanded,
  onToggleExpand,
  isFavorite,
}: {
  scan: ScanResult;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isFavorite: boolean;
}) {
  return (
    <motion.div layout className="glass-panel text-white">
      <button onClick={onToggleExpand} className="w-full space-y-3 p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/60">{formatDate(new Date(scan.timestamp))}</div>
            <div className="text-sm font-semibold text-white">
              {scan.productInfo?.brand ?? (scan.barcode ? 'Unbekannte Marke' : 'OCR Scan')}
              {scan.productInfo?.productName ? ` · ${scan.productInfo.productName}` : ''}
            </div>
            <div className="text-xs text-white/50">
              {scan.barcode ? `Barcode: ${scan.barcode}` : 'Etikett-Analyse'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isFavorite && <Star className="h-4 w-4 text-status-warning drop-shadow" />}
            <div className={clsx('rounded-full px-3 py-1 text-xs font-semibold', scoreColor(scan.score))}>
              {scan.score?.toFixed(0) ?? '–'}
            </div>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
              <ChevronDown className="h-4 w-4 text-white/50" />
            </motion.div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-white/70">
          <span className="rounded-full bg-white/10 px-2 py-0.5">{scan.profile}</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5">{scoreLabel(scan.score)}</span>
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-4">
              <WaterScoreCard scanResult={scan} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SwipeableRow({
  children,
  onFavorite,
  onDelete,
  isFavorite,
  onLongPress,
  scan,
}: {
  children: React.ReactNode;
  onFavorite: () => void;
  onDelete: () => void;
  isFavorite: boolean;
  onLongPress: (scan: ScanResult, x: number, y: number) => void;
  scan: ScanResult;
}) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const reset = () => {
    setOffset(0);
    setIsDragging(false);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
    setIsDragging(true);
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      onLongPress(scan, e.clientX, e.clientY);
    }, 600);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const delta = e.clientX - startX.current;
    setOffset(Math.max(-120, Math.min(120, delta)));
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!isDragging) return;
    if (offset > 90) {
      onFavorite();
    } else if (offset < -90) {
      onDelete();
    }
    reset();
  };

  return (
    <div className="relative touch-pan-y select-none">
      <div
        className={clsx(
          'absolute inset-0 flex items-center justify-between rounded-3xl px-4 text-sm font-semibold text-white',
          offset > 0 ? 'bg-status-warning/80' : 'bg-status-bad/80'
        )}
      >
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4" />
          {isFavorite ? 'Favorit entfernen' : 'Favorisieren'}
        </div>
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Entfernen
        </div>
      </div>
      <motion.div
        className="relative"
        style={{ x: offset }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {children}
      </motion.div>
    </div>
  );
}

function ContextMenu({
  context,
  onClose,
  onShare,
  onRescan,
  onProfileSwitch,
  onEdit,
  onFavorite,
  isFavorite,
}: {
  context: { scan: ScanResult; x: number; y: number };
  onClose: () => void;
  onShare: () => void;
  onRescan: () => void;
  onProfileSwitch: (profile: ProfileType) => void;
  onEdit: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute w-60 rounded-2xl border border-white/10 bg-ocean-card/95 p-2 text-white shadow-glass backdrop-blur-xl"
        style={{ top: context.y, left: context.x }}
        onClick={(e) => e.stopPropagation()}
      >
        <ContextButton icon={<Star className="w-4 h-4" />} onClick={onFavorite}>
          {isFavorite ? 'Favorit entfernen' : 'Zu Favoriten'}
        </ContextButton>
        <ContextButton icon={<Share2 className="w-4 h-4" />} onClick={onShare}>
          Teilen
        </ContextButton>
        <ContextButton icon={<RefreshCw className="w-4 h-4" />} onClick={onRescan}>
          Erneut scannen
        </ContextButton>
        <div className="px-3 py-2">
          <div className="mb-2 text-xs text-white/70">Mit anderem Profil bewerten</div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PROFILE_LABELS).map((key) => (
              <button
                key={key}
                onClick={() => onProfileSwitch(key as ProfileType)}
                className="rounded-full bg-white/10 px-2 py-1 text-xs text-white hover:bg-water-primary/30"
              >
                {PROFILE_LABELS[key as ProfileType]}
              </button>
            ))}
          </div>
        </div>
        <ContextButton icon={<Edit3 className="w-4 h-4" />} onClick={onEdit}>
          Details bearbeiten
        </ContextButton>
        <ContextButton icon={<Trash2 className="w-4 h-4" />} onClick={onClose}>
          Schließen
        </ContextButton>
      </div>
    </div>
  );
}

function ContextButton({ icon, children, onClick }: { icon: ReactNode; children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white transition hover:bg-white/10"
    >
      {icon}
      {children}
    </button>
  );
}

function DetailDialog({ scan, onClose }: { scan: ScanResult; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur" onClick={onClose}>
      <div className="glass-panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-4 text-white" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Details bearbeiten</h3>
            <p className="text-sm text-white/70">Die Werte kannst du auf der Scan-Seite anpassen.</p>
          </div>
          <button className="rounded-full border border-white/10 p-2 hover:border-white/30" onClick={onClose}>
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4">
          <WaterScoreCard scanResult={scan} />
        </div>
        <Link
          href={`/scan?profile=${scan.profile}${scan.barcode ? `&barcode=${scan.barcode}` : ''}`}
          className="block rounded-2xl bg-gradient-to-r from-water-primary to-water-accent py-3 text-center font-semibold text-white shadow-glow"
        >
          In Scan-Seite öffnen
        </Link>
      </div>
    </div>
  );
}

function NoResults() {
  return (
    <div className="glass-panel border border-dashed border-white/20 p-6 text-center text-sm text-white/70">
      Keine Treffer für diese Filter. Passe Suche oder Filter an.
    </div>
  );
}

function EmptyState() {
  return (
    <div className="space-y-4 py-16 text-center text-white">
      <div className="text-5xl">💧</div>
      <h2 className="text-xl font-semibold">Noch keine Scans</h2>
      <p className="mx-auto max-w-sm text-sm text-white/70">
        Starte jetzt mit deinem ersten Scan und entdecke, wie dein Wasser abschneidet.
      </p>
      <Link
        href="/scan"
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-water-primary to-water-accent px-6 py-3 font-semibold text-white shadow-glow"
      >
        Scan starten
      </Link>
    </div>
  );
}

function buildStats(scans: ScanResult[], hidden: Record<string, boolean>) {
  const visible = scans.filter((scan) => !hidden[scan.id]);
  const total = visible.length;
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  const thisWeek = visible.filter((scan) => new Date(scan.timestamp) >= startOfWeek).length;
  const validScores = visible.map((s) => s.score).filter((score): score is number => typeof score === 'number');
  const avgScore = validScores.length
    ? (validScores.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(1)
    : null;
  const lastScores = visible
    .slice(0, 5)
    .map((s) => (s.score ? s.score.toFixed(0) : '–'));
  const profileCounts = visible.reduce<Record<ProfileType, number>>((acc, scan) => {
    acc[scan.profile] = (acc[scan.profile] ?? 0) + 1;
    return acc;
  }, {} as Record<ProfileType, number>);
  let topProfile: ProfileType | null = null;
  let topCount = 0;
  Object.entries(profileCounts).forEach(([profile, count]) => {
    if (count > topCount) {
      topProfile = profile as ProfileType;
      topCount = count;
    }
  });
  const streak = calculateStreak(visible);

  return { total, thisWeek, avgScore, lastScores, topProfile, topCount, streak };
}

function filterByDate(timestamp: string, filter: DateFilter) {
  if (filter === 'all') return true;
  const date = new Date(timestamp);
  if (filter === 'week') {
    return date >= getStartOfWeek(new Date());
  }
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  return date >= startOfMonth;
}

function filterByScore(score: number | undefined, filter: ScoreFilter) {
  if (filter === 'all') return true;
  if (score == null) return false;
  if (filter === 'high') return score >= 90;
  if (filter === 'mid') return score >= 70 && score < 90;
  return score < 70;
}

function sortScans(a: ScanResult, b: ScanResult, sortBy: SortOption) {
  if (sortBy === 'best') return (b.score ?? 0) - (a.score ?? 0);
  if (sortBy === 'worst') return (a.score ?? 0) - (b.score ?? 0);
  if (sortBy === 'brand') {
    const brandA = a.productInfo?.brand ?? '';
    const brandB = b.productInfo?.brand ?? '';
    return brandA.localeCompare(brandB);
  }
  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
}

function groupScans(scans: ScanResult[]) {
  const groups: Record<string, ScanResult[]> = {};
  scans.forEach((scan) => {
    const label = getGroupLabel(new Date(scan.timestamp));
    if (!groups[label]) groups[label] = [];
    groups[label].push(scan);
  });
  const order = ['Diese Woche', 'Letzter Monat', 'Älter'];
  return order
    .filter((label) => groups[label])
    .map((label) => ({ label, items: groups[label] }));
}

function getGroupLabel(date: Date) {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  if (date >= startOfWeek) return 'Diese Woche';
  const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  if (date >= firstOfPreviousMonth && date < firstOfCurrentMonth) return 'Letzter Monat';
  return 'Älter';
}

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateStreak(scans: ScanResult[]) {
  const dates = new Set(scans.map((scan) => new Date(scan.timestamp).toDateString()));
  let streak = 0;
  const current = new Date();
  while (dates.has(current.toDateString())) {
    streak++;
    current.setDate(current.getDate() - 1);
  }
  return streak;
}

function scoreLabel(score: number | undefined) {
  if (score == null) return 'unbekannt';
  if (score >= 80) return 'sehr gut';
  if (score >= 50) return 'okay';
  return 'kritisch';
}

function scoreColor(score: number | undefined) {
  if (score == null) return 'bg-white/10 text-white/70';
  if (score >= 80) return 'bg-status-good/15 text-status-good';
  if (score >= 50) return 'bg-status-warning/15 text-status-warning';
  return 'bg-status-bad/15 text-status-bad';
}

function formatDate(date: Date) {
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
