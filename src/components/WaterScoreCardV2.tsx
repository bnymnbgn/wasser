'use client';

import { useState } from "react";
import type { ScanResult } from "@/src/domain/types";
import { WaterScoreCircle } from "./ui/WaterScoreCircle";
import {
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Info,
  Droplet,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { WATER_METRIC_LABELS } from "@/src/constants/waterMetrics";

interface Props {
  scanResult: ScanResult;
}

/**
 * REDESIGN: Fokussiert, hierarchisch, mobile-optimiert
 *
 * STRUKTUR:
 * 1. Hero: Score Circle (groß, prominent)
 * 2. Quick Summary: Top 3 Insights (1 Blick)
 * 3. Expandables: Details on-demand
 */
export function WaterScoreCardV2({ scanResult }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { score, metricDetails, insights, profile, productInfo } = scanResult;

  // Top 3 positive impacts
  const topStrengths = metricDetails
    ?.filter(m => m.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3) ?? [];

  // Top 3 negative impacts
  const topWeaknesses = metricDetails
    ?.filter(m => m.score < 50)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3) ?? [];

  const scoreColor = score >= 80 ? "success" : score >= 50 ? "warning" : "error";
  const scoreLabel = score >= 80 ? "Sehr gut" : score >= 50 ? "Okay" : "Kritisch";

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-6">

      {/* === HERO: Score === */}
      <div className="text-center py-8">
        <WaterScoreCircle
          value={score ?? 0}
          size={200}
          strokeWidth={14}
          showValue={true}
        />

        <div className="mt-6 space-y-2">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold
            ${scoreColor === 'success' ? 'bg-green-500/20 text-green-400' : ''}
            ${scoreColor === 'warning' ? 'bg-amber-500/20 text-amber-400' : ''}
            ${scoreColor === 'error' ? 'bg-red-500/20 text-red-400' : ''}
          `}>
            {scoreLabel}
          </div>

          <p className="text-sm text-ocean-secondary">
            Profil: <span className="font-medium text-ocean-primary">{profile}</span>
          </p>

          {productInfo && (
            <p className="text-xs text-ocean-tertiary">
              {productInfo.brand} {productInfo.productName}
            </p>
          )}
        </div>
      </div>

      {/* === QUICK SUMMARY: Top Insights === */}
      {(topStrengths.length > 0 || topWeaknesses.length > 0) && (
        <div className="ocean-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-ocean-primary flex items-center gap-2">
            <Droplet className="w-5 h-5 text-ocean-accent" />
            Auf einen Blick
          </h3>

          {/* Strengths */}
          {topStrengths.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-green-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Stärken
              </p>
              {topStrengths.map(m => (
                <div key={m.metric} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ocean-primary">
                      {WATER_METRIC_LABELS[m.metric]}
                    </p>
                    <p className="text-xs text-ocean-secondary mt-1 line-clamp-2">
                      {m.explanation}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-green-400 flex-shrink-0">
                    {m.score.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Weaknesses */}
          {topWeaknesses.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-amber-400 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Verbesserungspotenzial
              </p>
              {topWeaknesses.map(m => (
                <div key={m.metric} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ocean-primary">
                      {WATER_METRIC_LABELS[m.metric]}
                    </p>
                    <p className="text-xs text-ocean-secondary mt-1 line-clamp-2">
                      {m.explanation}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-amber-400 flex-shrink-0">
                    {m.score.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === EXPANDABLE SECTIONS === */}

      {/* All Minerals */}
      {metricDetails && metricDetails.length > 0 && (
        <ExpandableSection
          id="minerals"
          title="Alle Mineralwerte"
          subtitle={`${metricDetails.length} Metriken analysiert`}
          isExpanded={expandedSection === "minerals"}
          onToggle={() => toggleSection("minerals")}
        >
          <div className="grid gap-3">
            {metricDetails.map(m => (
              <div key={m.metric} className="flex items-center justify-between p-3 rounded-lg bg-ocean-surface-elevated">
                <span className="text-sm text-ocean-primary">
                  {WATER_METRIC_LABELS[m.metric]}
                </span>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-mono
                    ${m.score >= 80 ? 'text-green-400' : ''}
                    ${m.score >= 50 && m.score < 80 ? 'text-amber-400' : ''}
                    ${m.score < 50 ? 'text-red-400' : ''}
                  `}>
                    {m.score.toFixed(0)}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Health Insights */}
      {insights?.synergies && insights.synergies.length > 0 && (
        <ExpandableSection
          id="health"
          title="Gesundheitliche Hinweise"
          subtitle={`${insights.synergies.length} Insights`}
          isExpanded={expandedSection === "health"}
          onToggle={() => toggleSection("health")}
        >
          <div className="space-y-3">
            {insights.synergies.map(s => (
              <div key={s.id} className={`p-4 rounded-lg border
                ${s.tone === 'positive' ? 'bg-green-500/10 border-green-500/20' : ''}
                ${s.tone === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : ''}
                ${s.tone === 'info' ? 'bg-blue-500/10 border-blue-500/20' : ''}
              `}>
                <p className="text-sm font-semibold text-ocean-primary mb-1">{s.title}</p>
                <p className="text-xs text-ocean-secondary">{s.description}</p>
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Badges */}
      {insights?.badges && insights.badges.length > 0 && (
        <ExpandableSection
          id="badges"
          title="Kennzeichnungen"
          subtitle={`${insights.badges.length} Labels`}
          isExpanded={expandedSection === "badges"}
          onToggle={() => toggleSection("badges")}
        >
          <div className="flex flex-wrap gap-2">
            {insights.badges.map(b => (
              <span key={b.id} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                ${b.tone === 'positive' ? 'bg-green-500/20 text-green-400' : ''}
                ${b.tone === 'warning' ? 'bg-amber-500/20 text-amber-400' : ''}
                ${b.tone === 'info' ? 'bg-blue-500/20 text-blue-400' : ''}
              `}>
                {b.label}
              </span>
            ))}
          </div>
        </ExpandableSection>
      )}

    </div>
  );
}

// Reusable Expandable Section
function ExpandableSection({
  id,
  title,
  subtitle,
  isExpanded,
  onToggle,
  children
}: {
  id: string;
  title: string;
  subtitle?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="ocean-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-ocean-surface-elevated transition-colors"
      >
        <div className="text-left">
          <h3 className="text-sm font-semibold text-ocean-primary">{title}</h3>
          {subtitle && (
            <p className="text-xs text-ocean-tertiary mt-0.5">{subtitle}</p>
          )}
        </div>
        <ChevronRight className={`w-5 h-5 text-ocean-secondary transition-transform
          ${isExpanded ? 'rotate-90' : ''}
        `} />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-ocean-border pt-4">
          {children}
        </div>
      )}
    </div>
  );
}
