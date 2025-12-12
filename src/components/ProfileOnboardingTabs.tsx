"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import { useTheme } from "@mui/material/styles";
import { PROFILE_CHEATSHEET, type ProfileId } from "@/src/domain/profileCheatsheet";
import { hapticLight } from "@/lib/capacitor";
import {
  User,
  Baby,
  Zap,
  Heart,
  Coffee,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Droplet,
  Info,
  PersonStanding,
  UserRound,
  Syringe,
} from "lucide-react";

const PROFILE_ORDER: ProfileId[] = ["standard", "baby", "sport", "blood_pressure", "coffee", "kidney", "pregnancy", "seniors", "diabetes"];

const PROFILE_ICONS: Record<ProfileId, React.ElementType> = {
  standard: User,
  baby: Baby,
  sport: Zap,
  blood_pressure: Heart,
  coffee: Coffee,
  kidney: Shield,
  pregnancy: PersonStanding,
  seniors: UserRound,
  diabetes: Syringe,
};

const IMPORTANCE_COLORS: Record<string, { bg: string; text: string }> = {
  "kritisch": { bg: 'error.light', text: 'error.dark' },
  "sehr hoch": { bg: 'error.light', text: 'error.dark' },
  "hoch": { bg: 'warning.light', text: 'warning.dark' },
  "mittel": { bg: 'info.light', text: 'info.dark' },
  "niedrig": { bg: 'action.selected', text: 'text.secondary' },
};

export function ProfileOnboardingTabs() {
  const theme = useTheme();
  const [active, setActive] = useState<ProfileId>("standard");
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const activeProfile = PROFILE_CHEATSHEET[active];

  const handleTabChange = (_: React.SyntheticEvent, newValue: ProfileId) => {
    hapticLight();
    setActive(newValue);
    setExpandedMetric(null);
  };

  const toggleMetric = (metricId: string) => {
    hapticLight();
    setExpandedMetric(expandedMetric === metricId ? null : metricId);
  };

  const ActiveIcon = PROFILE_ICONS[active];

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
        Profile im Detail
      </Typography>

      {/* Tabs */}
      <Tabs
        value={active}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          minHeight: 40,
          mb: 3,
          '& .MuiTab-root': {
            minHeight: 40,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: 13,
            px: 1.5,
            minWidth: 'auto',
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: 1.5,
          }
        }}
      >
        {PROFILE_ORDER.map((id) => {
          const p = PROFILE_CHEATSHEET[id];
          const Icon = PROFILE_ICONS[id];
          return (
            <Tab
              key={id}
              value={id}
              icon={<Icon className="w-4 h-4" />}
              iconPosition="start"
              label={p.label.split(' ')[0]}
            />
          );
        })}
      </Tabs>

      {/* Profile Header */}
      <Box sx={{
        p: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ActiveIcon className="w-6 h-6 text-white" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {activeProfile.label}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
              {activeProfile.shortDescription}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            <strong>Wann nutzen:</strong> {activeProfile.whenToUse}
          </Typography>
        </Box>
      </Box>

      {/* Scoring Focus */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 1 }}>
          Bewertungsfokus
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {activeProfile.scoringFocus.map((item) => (
            <Chip
              key={item.metric}
              label={`${item.label}: ${Math.round(item.weight * 100)}%`}
              size="small"
              color={item.tone === 'critical' ? 'error' : item.tone === 'positive' ? 'success' : 'default'}
              variant="outlined"
              sx={{ fontSize: 11 }}
            />
          ))}
        </Box>
      </Box>

      {/* Warning */}
      <Box sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 2,
        bgcolor: 'warning.main',
        borderRadius: 2,
        mb: 3,
      }}>
        <AlertTriangle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
        <Typography variant="caption" sx={{ color: 'white', lineHeight: 1.6 }}>
          <strong>Wichtig:</strong> Die Bewertungen ersetzen keine medizinische Beratung und orientieren
          sich an typischen Richtbereichen. Sie helfen, Etiketten besser einzuordnen.
        </Typography>
      </Box>

      {/* Metrics Details */}
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
        Wichtige Werte im Detail
      </Typography>

      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        {activeProfile.metrics.map((metric, index) => {
          const isExpanded = expandedMetric === metric.metric;
          const importanceStyle = IMPORTANCE_COLORS[metric.importance] || IMPORTANCE_COLORS['mittel'];

          return (
            <Box key={metric.metric}>
              {/* Metric Header - Clickable */}
              <Box
                onClick={() => toggleMetric(metric.metric)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  cursor: 'pointer',
                  bgcolor: isExpanded ? 'action.selected' : 'background.paper',
                  borderBottom: index < activeProfile.metrics.length - 1 ? 1 : 0,
                  borderColor: 'divider',
                  '&:active': { bgcolor: 'action.selected' }
                }}
              >
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: isExpanded ? 'primary.main' : 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Droplet className="w-4 h-4" style={{ color: isExpanded ? 'white' : theme.palette.text.secondary }} />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: 14 }}>
                    {metric.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
                    {metric.metric}
                  </Typography>
                </Box>

                <Chip
                  label={metric.importance}
                  size="small"
                  sx={{
                    bgcolor: importanceStyle?.bg ?? 'action.hover',
                    color: importanceStyle?.text ?? 'text.primary',
                    fontSize: 10,
                    height: 22,
                    textTransform: 'capitalize'
                  }}
                />

                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" style={{ color: theme.palette.text.secondary }} />
                ) : (
                  <ChevronDown className="w-4 h-4" style={{ color: theme.palette.text.secondary }} />
                )}
              </Box>

              {/* Expanded Content */}
              <Collapse in={isExpanded}>
                <Box sx={{
                  p: 2,
                  bgcolor: 'action.hover',
                  borderBottom: index < activeProfile.metrics.length - 1 ? 1 : 0,
                  borderColor: 'divider'
                }}>
                  {/* Explanation */}
                  <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6, mb: 2 }}>
                    {metric.explanation}
                  </Typography>

                  {/* Hints */}
                  {Array.isArray((metric as any).hints) && (metric as any).hints.length > 0 && (
                    <Box>
                      {(metric as any).hints.map((hint: string, hintIndex: number) => (
                        <Box
                          key={hintIndex}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1,
                            mb: hintIndex < (metric as any).hints.length - 1 ? 1 : 0
                          }}
                        >
                          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: theme.palette.primary.main }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                            {hint}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
