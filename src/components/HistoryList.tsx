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
        icon={<LineChart className="w-5 h-5" />}
        label="Scans gesamt"
        value={stats.total.toString()}
        description={`${stats.thisWeek} diese Woche`}
      />
      <StatCard
        icon={<Sparkles className="w-5 h-5" />}
        label="Durchschnitt"
        value={`${stats.avgScore ?? '–'}`}
        description={`Letzte 5: ${stats.lastScores.join(' · ') || '–'}`}
      />
      <StatCard
        icon={<Target className="w-5 h-5" />}
        label="Lieblingsprofil"
        value={stats.topProfile ? PROFILE_LABELS[stats.topProfile] : '–'}
        description={`${stats.topCount} Scans`}
      />
      <StatCard
        icon={<Flame className="w-5 h-5" />}
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
    <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/70 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</div>
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
    <div className="rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 p-4 space-y-4 shadow-sm">
      <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
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

      <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
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

      <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
        <FilterChip label="Alle Scores" active={scoreFilter === 'all'} onClick={() => setScoreFilter('all')} />
        <FilterChip label="90+" active={scoreFilter === 'high'} onClick={() => setScoreFilter('high')} />
        <FilterChip label="70 – 89" active={scoreFilter === 'mid'} onClick={() => setScoreFilter('mid')} />
        <FilterChip label="< 70" active={scoreFilter === 'low'} onClick={() => setScoreFilter('low')} />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Marke oder Produkt suchen"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          Sortierung:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none"
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
        'px-3 py-1 rounded-full border flex items-center gap-1 transition-colors',
        active
          ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300'
          : 'border-slate-200 dark:border-slate-700'
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
    <motion.div layout className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/80 shadow-sm">
      <button onClick={onToggleExpand} className="w-full p-4 text-left space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(new Date(scan.timestamp))}
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {scan.productInfo?.brand ?? (scan.barcode ? 'Unbekannte Marke' : 'OCR Scan')}
              {scan.productInfo?.productName ? ` · ${scan.productInfo.productName}` : ''}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {scan.barcode ? `Barcode: ${scan.barcode}` : 'Etikett-Analyse'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isFavorite && (
              <Star className="w-4 h-4 text-amber-400 fill-amber-300 drop-shadow" />
            )}
            <div className={clsx('px-3 py-1 rounded-full text-xs font-semibold', scoreColor(scan.score))}>
              {scan.score?.toFixed(0) ?? '–'}
            </div>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </motion.div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">{scan.profile}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {scoreLabel(scan.score)}
          </span>
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-200 dark:border-slate-800"
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
          'absolute inset-0 rounded-3xl flex items-center justify-between px-4 text-sm font-semibold text-white',
          offset > 0 ? 'bg-amber-500/80' : 'bg-rose-500/80'
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
        className="absolute bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-60 p-2"
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
          <div className="text-xs text-slate-500 mb-2">Mit anderem Profil bewerten</div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PROFILE_LABELS).map((key) => (
              <button
                key={key}
                onClick={() => onProfileSwitch(key as ProfileType)}
                className="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800"
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
      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-200"
    >
      {icon}
      {children}
    </button>
  );
}

function DetailDialog({ scan, onClose }: { scan: ScanResult; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Details bearbeiten</h3>
            <p className="text-sm text-slate-500">Die Werte kannst du auf der Scan-Seite anpassen.</p>
          </div>
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose}>
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">
          <WaterScoreCard scanResult={scan} />
        </div>
        <Link
          href={`/scan?profile=${scan.profile}${scan.barcode ? `&barcode=${scan.barcode}` : ''}`}
          className="block text-center rounded-2xl bg-blue-600 text-white py-3 font-semibold"
        >
          In Scan-Seite öffnen
        </Link>
      </div>
    </div>
  );
}

function NoResults() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/50 p-6 text-center text-sm text-slate-500">
      Keine Treffer für diese Filter. Passe Suche oder Filter an.
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center space-y-4 py-16">
      <div className="text-5xl">💧</div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Noch keine Scans</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        Starte jetzt mit deinem ersten Scan und entdecke, wie dein Wasser abschneidet.
      </p>
      <Link href="/scan" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg">
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
  if (score == null) return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200';
  if (score >= 80) return 'bg-emerald-100 text-emerald-700';
  if (score >= 50) return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
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
