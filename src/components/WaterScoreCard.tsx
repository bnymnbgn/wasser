"use client";

import type { ScanResult, WaterAnalysisValues, ProfileType } from "@/src/domain/types";
import type { ProfileFit } from "@/src/domain/waterInsights";
import { WaterScoreCircle } from "@/src/components/ui/WaterScoreCircle";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplet,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Columns,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useComparison } from "@/src/contexts/ComparisonContext";
import { useRouter } from "next/navigation";
import { WATER_METRIC_LABELS, WATER_METRIC_FIELDS } from "@/src/constants/waterMetrics";
import {
  computeWaterHardness,
  computeCalciumMagnesiumRatio,
  computeBufferCapacity,
  computeTasteBalance,
  computeSodiumPotassiumRatio,
  computePralValue,
  RDA_VALUES,
  computeRdaPercentage,
  computeTasteProfile,
} from "@/src/lib/waterMath";
import { VisualMetricBar } from "@/src/components/ui/VisualMetricBar";
import { TasteRadar } from "@/src/components/ui/TasteRadar";
import { ScoreExplanation, type ImpactFactor } from "@/src/components/ScoreExplanation";
import { PROFILE_TARGETS } from "@/src/constants/profileTargets";
import { ProMineralCard } from "@/src/components/ui/ProMineralCard";

function scoreToColor(score: number | undefined): "success" | "warning" | "error" {
  if (score == null) return "error";
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "error";
}

function scoreLabel(score: number | undefined) {
  if (score == null) return "unbekannt";
  if (score >= 80) return "Sehr gut";
  if (score >= 50) return "Okay";
  return "Kritisch";
}

function statusClasses(score: number | undefined) {
  if (score == null) return "bg-ocean-surface border-ocean-border text-ocean-secondary";
  if (score >= 80)
    return "bg-ocean-success-bg border-ocean-success/40 text-ocean-success";
  if (score >= 50)
    return "bg-ocean-warning-bg border-ocean-warning/40 text-ocean-warning";
  return "bg-ocean-error-bg border-ocean-error/40 text-ocean-error";
}

function MineralTooltip({
  mineral,
  info,
  profile,
  children,
}: {
  mineral: string;
  info?: {
    name: string;
    description?: string;
    optimal?: string;
    profiles?: Partial<Record<ProfileType, string>>;
  };
  profile: ProfileType;
  children: ReactNode;
}) {
  const [show, setShow] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    const handler = (e: TouchEvent | MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("touchstart", handler);
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("mousedown", handler);
    };
  }, [show]);

  if (!info) return <>{children}</>;
  const profileHint = info.profiles?.[profile];
  const bodyText = profileHint ?? info.description;
  const optimalText = (info as any).profileOptimal?.[profile] ?? info.optimal;
  return (
    <div ref={tooltipRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center -m-2 p-2 cursor-help active:bg-white/10 rounded-lg transition-colors"
        aria-label={info.name}
        aria-expanded={show}
      >
        {children}
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" aria-hidden="true" />
          <div
            className="
              fixed bottom-0 left-0 right-0 z-50
              md:absolute md:bottom-auto md:left-1/2 md:right-auto
              md:top-full md:-translate-x-1/2 md:mt-2
              w-full md:w-72
              rounded-t-3xl md:rounded-2xl
              border border-ocean-border
              bg-ocean-surface/95 backdrop-blur-xl
              shadow-2xl
              p-4 md:p-3
            "
          >
            <div className="w-10 h-1 bg-ocean-border rounded-full mx-auto mb-3 md:hidden" />
            <div className="text-sm font-semibold text-ocean-primary mb-1.5">{info.name}</div>
            {bodyText && (
              <p className="text-sm text-ocean-secondary leading-relaxed mb-3">{bodyText}</p>
            )}
            {optimalText && (
              <div className="text-sm text-ocean-success font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Optimal: {optimalText}
              </div>
            )}
            <button
              onClick={() => setShow(false)}
              className="mt-4 w-full py-3 rounded-xl bg-ocean-primary/10 text-ocean-primary font-medium text-sm md:hidden active:bg-ocean-primary/20"
            >
              Schließen
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface Props {
  scanResult: ScanResult;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="ocean-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center justify-between active:bg-white/5"
      >
        <h3 className="font-semibold text-ocean-primary">{title}</h3>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-ocean-tertiary" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4">{children}</div>
      </motion.div>
    </div>
  );
}

function MobileBottomSheet({
  isOpen,
  title,
  onClose,
  children,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const sheet = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-ocean-surface rounded-t-3xl border-t border-ocean-border shadow-2xl max-h-[85vh] overflow-hidden"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-ocean-border/60" />
            </div>
            <div className="px-5 pb-5 overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-ocean-primary text-center">{title}</h3>
              </div>
              {children}
              <button
                onClick={onClose}
                className="mt-4 w-full py-3 rounded-xl bg-ocean-primary/10 text-ocean-primary font-semibold active:scale-95 transition"
              >
                Schließen
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(sheet, document.body);
}

const GLOSSARY_ENTRIES = [
  {
    term: "Hydrogencarbonat",
    description:
      "Mineral, das als natürlicher Säurepuffer wirkt und Magen sowie Regeneration unterstützt.",
  },
  {
    term: "Sulfat",
    description: "Anion, das in höherer Konzentration verdauungsfördernd wirken kann.",
  },
  {
    term: "Natrium",
    description:
      "Elektrolyt, wichtig für Flüssigkeitshaushalt – bei Hypertonie sind niedrige Werte erwünscht.",
  },
  {
    term: "Magnesium",
    description:
      "Mineral für Muskel- und Nervenfunktion; hohe Werte unterstützen Regeneration.",
  },
  {
    term: "Calcium",
    description:
      "Zentrales Mineral für Knochen und Stoffwechsel, trägt auch zum Geschmack bei.",
  },
] as const;

const GLOSSARY_MAP = GLOSSARY_ENTRIES.reduce<
  Record<string, (typeof GLOSSARY_ENTRIES)[number]>
>((acc, entry) => {
  acc[entry.term.toLowerCase()] = entry;
  return acc;
}, {});

const glossaryRegex = new RegExp(
  `\\b(${GLOSSARY_ENTRIES.map((entry) => entry.term).join("|")})\\b`,
  "gi"
);

const MINERAL_INFO: Record<
  string,
  {
    name: string;
    description?: string;
    optimal?: string;
    profiles?: Partial<Record<ProfileType, string>>;
    profileOptimal?: Partial<Record<ProfileType, string>>;
  }
> = {
  calcium: {
    name: "Calcium",
    profiles: {
      baby: "Niedrig halten, weil Säuglinge empfindlich auf Mineralbelastung reagieren.",
      coffee: "Weiches Wasser (Ca:Mg ~1–1.5) verhindert flachen/sauren Geschmack.",
      kidney: "Niedrige Mineralisation entlastet die Niere.",
      blood_pressure: "Moderate Werte, da Ca neutral, aber Gesamt-TDS im Blick behalten.",
      standard: "Ausgewogen, Ca:Mg nahe 2:1 schmeckt rund.",
      sport: "Höhere Ca-Menge unterstützt Regeneration, aber Mg nicht vergessen.",
    },
    optimal: "Ca:Mg ~2:1",
  },
  magnesium: {
    name: "Magnesium",
    profiles: {
      sport: "Höherer Mg-Anteil unterstützt Muskel-/Nervenregeneration.",
      baby: "Nur moderat, um Mineralbelastung gering zu halten.",
      kidney: "So niedrig wie möglich, da Ausscheidung eingeschränkt.",
      coffee: "Moderate Mg-Anteile genügen; zu viel kann bitter wirken.",
      blood_pressure: "Moderate Werte ok; Fokus eher auf niedriges Na.",
      standard: "Ausgewogen für Geschmack und Versorgung.",
    },
    optimal: "Sport höher, Baby moderat",
  },
  sodium: {
    name: "Natrium",
    profiles: {
      blood_pressure: "So niedrig wie möglich, <20 mg/L ideal zur Druckentlastung.",
      kidney: "Sehr niedrig, <20 mg/L, um Natriumlast zu minimieren.",
      sport: "Etwas mehr ok (20–50 mg/L) für Elektrolyte beim Schwitzen.",
      baby: "Niedrig halten, da hohe Na-Werte ungeeignet für Säuglinge.",
      coffee: "Niedrige Na-Werte vermeiden salzigen Geschmack.",
      standard: "Moderate Werte, wenn kein spezielles Ziel.",
    },
    optimal: "<20 mg/L BP/Niere",
  },
  potassium: {
    name: "Kalium",
    profiles: {
      kidney: "Streng niedrig halten.",
      sport: "Moderate Werte ok.",
      blood_pressure: "Eher niedrig halten.",
      coffee: "Kein großer Faktor für Geschmack.",
      baby: "Niedrig halten, da Babys Kalium schwer ausscheiden können.",
      standard: "Moderate Werte ok, solange Na:K Verhältnis passt.",
    },
    profileOptimal: {
      kidney: "<5 mg/L",
      baby: "<5 mg/L",
      blood_pressure: "Niedrig",
      sport: "Moderate Werte ok",
      coffee: "Kein Schwerpunkt",
    },
  },
  bicarbonate: {
    name: "Hydrogencarbonat",
    profiles: {
      coffee: "40–120 mg/L puffert Säuren, besserer Geschmack.",
      sport: "Höher ok, unterstützt Regeneration und Magen.",
      baby: "Nicht zu hoch, um Belastung zu vermeiden.",
      blood_pressure: "Moderate bis höhere Werte entlasten Säurelast.",
      kidney: "Eher niedriger, um Gesamt-TDS klein zu halten.",
      standard: "Moderate Werte machen Wasser bekömmlich.",
    },
    optimal: "Kaffee 40–120",
  },
  sulfate: {
    name: "Sulfat",
    profiles: {
      coffee: "Niedrig für weniger Bitterkeit in der Tasse.",
      baby: "Niedrig halten, hohe Werte können laxativ wirken.",
      kidney: "Niedrig bevorzugt, um Last zu senken.",
      sport: "Moderate Werte ok; zu hoch kann abführend wirken.",
      blood_pressure: "Moderate Werte, Fokus bleibt Na niedrig.",
      standard: "Moderate Werte für neutralen Geschmack.",
    },
    optimal: "Niedrig–moderat",
  },
  chloride: {
    name: "Chlorid",
    profiles: {
      coffee: "Niedrig für klaren Geschmack; vermeidet salzige Noten.",
      kidney: "Niedrig bevorzugt, um Salzlast zu senken.",
      blood_pressure: "Niedrig, da meist mit Na gekoppelt.",
      baby: "Niedrig halten, um Mineralbelastung gering zu halten.",
      sport: "Moderate Werte ok.",
      standard: "Moderate Werte für ausgewogenen Geschmack.",
    },
    optimal: "Niedrig",
  },
  nitrate: {
    name: "Nitrat",
    profiles: {
      baby: "Unter 10 mg/L zwingend wegen Methämoglobinämie-Risiko.",
      kidney: "Sehr niedrig bevorzugt.",
      blood_pressure: "Niedrig halten.",
      sport: "Niedrig, da kein Nutzen und mögliches Risiko.",
      coffee: "Kein Geschmacksnutzen, niedrig halten.",
      standard: "Niedrig bevorzugt.",
    },
    optimal: "<10 mg/L Baby",
  },
  totalDissolvedSolids: {
    name: "TDS",
    profiles: {
      coffee: "50–150 mg/L optimal weich.",
      sport: "Höher (300–800) für Elektrolyte.",
      blood_pressure: "Mittel bis höher ok.",
      kidney: "Sehr niedrig <100 mg/L.",
      baby: "Niedrig bis moderat.",
      standard: "Mittelbereich schmeckt meist ausgewogen.",
    },
    optimal: "Profilabhängig",
  },
  fluoride: {
    name: "Fluorid",
    profiles: {
      baby: "Streng <0.7 mg/L.",
      coffee: "Geschmacklich kaum relevant.",
      standard: "Bei fehlender Angabe meist vernachlässigbar.",
      blood_pressure: "Kein Haupttreiber, aber niedrig unkritisch.",
      kidney: "Niedrig halten, vermeidet zusätzliche Last.",
      sport: "Kein wesentlicher Faktor.",
    },
    optimal: "<0.7 mg/L Baby",
  },
  ph: {
    name: "pH",
    profiles: {
      coffee: "Nahe neutral für gute Extraktion.",
    },
    description: "Neutraler pH schmeckt angenehmer und löst Mineralien gleichmäßig.",
    optimal: "6.5–8 (generisch für alle)",
  },
};

const MINERAL_BENEFITS: Partial<
  Record<
    string,
    Partial<Record<ProfileType | "default", string[]>>
  >
> = {
  calcium: {
    sport: [
      "Muskelkontraktion: Calcium triggert die Querbrückenbildung (Aktin/Myosin) – ohne Ca²⁺ sinkt Kraft und Ermüdung kommt früher.",
      "Krämpfe: Stabilisiert Membranpotenziale; zusammen mit Mg/Na weniger Wettkampf- oder Nachtkrämpfe.",
      "Knochen/Stressfrakturen: Belastung + Ca + Vitamin D erhöhen Knochendichte, senken Frakturrisiko bei hoher Lauf-/Sprunglast.",
      "Gerinnung/Healing: Unterstützt Blutgerinnung – relevant bei Mikroverletzungen und Regeneration.",
      "Ziel für intensive Athleten: oft 1.200–1.500 mg/Tag (Literatur), besonders bei Frauen/Jugend.",
    ],
    default: [
      "Struktur: zentral für Knochen/Zähne, trägt zur Mineralbalance bei.",
      "Muskel-/Nervenfunktion: nötig für Kontraktion und Signalweiterleitung.",
      "Regeneration: unterstützt Heilungsprozesse und Enzymfunktionen.",
    ],
  },
  magnesium: {
    sport: [
      "Energie/ATP: Co-Faktor in der ATP-Synthese – ohne Mg sinkt Leistungsfähigkeit.",
      "Muskelentspannung: Gegenspieler zu Calcium, senkt Krampfneigung.",
      "Nerven/Erholung: unterstützt Schlafqualität und Stress-Resilienz.",
    ],
    default: ["Nerven- und Muskelfunktion, Enzymaktivierung, kann Müdigkeit reduzieren."],
  },
  sodium: {
    sport: [
      "Hydration: Natrium hält Flüssigkeit intravasal, beugt Hyponatriämie bei langen Einheiten vor.",
      "Nerven/Muskel: essenziell für Aktionspotenziale, verringert Krämpfe zusammen mit Ca/Mg/K.",
    ],
    blood_pressure: ["Niedriges Na entlastet den Blutdruck; Zielbereich beachten."],
    default: ["Reguliert Flüssigkeitshaushalt und Nervenimpulse – Überschuss vermeiden."],
  },
  potassium: {
    sport: [
      "Repolarisation: wichtig für Muskel- und Nervenleitfähigkeit, schützt vor Übererregbarkeit.",
      "Glykogen: unterstützt Kohlenhydrat-Stoffwechsel, relevant für Ausdauer.",
    ],
    default: ["Elektrolyt für Herzrhythmus und Blutdruckbalance (Na/K-Verhältnis)."],
  },
  bicarbonate: {
    sport: [
      "Säurepuffer: kann Laktataufbau abmildern, unterstützt längere Intensität.",
      "Magenfreundlich: neutralisiert Säuren, besseres Bauchgefühl bei langen Sessions.",
    ],
    coffee: ["Puffert Säuren, macht Kaffee geschmacklich runder (60–120 mg/L optimal)."],
    default: ["Wirkt als natürlicher Puffer, macht Wasser bekömmlicher."],
  },
  sulfate: {
    sport: ["Kann Resorption von Mineralien fördern; zu hohe Werte wirken laxierend."],
    baby: ["Niedrig halten – zu hohe Werte können abführend wirken."],
    default: ["Geschmacks- und Verdauungseinfluss; moderat halten."],
  },
  chloride: {
    sport: ["Elektrolyt mit Natrium für Hydration; zu viel schmeckt salzig."],
    default: ["Teil des Elektrolythaushalts, beeinflusst Geschmack; moderat halten."],
  },
  nitrate: {
    sport: ["Vorstufe für NO – theoretisch vasodilatierend; in Wasser meist gering."],
    baby: ["Unter 10 mg/L wegen Methämoglobinämie-Risiko."],
    default: ["Niedrig halten, gesundheitlich und geschmacklich kein Nutzen."],
  },
};

export function WaterScoreCard({ scanResult }: Props) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [activeMineral, setActiveMineral] = useState<{
    key: string;
    info?: any;
    value?: number;
    unit?: string;
    score?: number;
  } | null>(null);
  const { addScan, removeScan, isSelected } = useComparison();
  const {
    score,
    metricScores,
    metricDetails,
    insights,
    ocrParsedValues,
    profile,
    warnings,
    userOverrides,
    productInfo,
    barcode,
  } = scanResult;

  // NEU: Wir zählen im UI, wie viele echte Datenpunkte wir haben (genau wie im Scoring)
  const validDataCount =
    metricDetails?.filter((m) => m.metric !== "dataQualityScore" && m.weight > 0)
      .length ?? 0;

  // NEU: Der Grenzwert für die Warnung (muss zur scoring.ts Logik passen <= 3)
  const isLowData = validDataCount <= 3;
  const mergedValues: Partial<WaterAnalysisValues> = {
    ...(ocrParsedValues ?? {}),
    ...(userOverrides ?? {}),
  };
  const hardness = insights?.hardness ?? computeWaterHardness(mergedValues) ?? undefined;
  const caMgRatio =
    insights?.calciumMagnesiumRatio ??
    computeCalciumMagnesiumRatio(mergedValues.calcium, mergedValues.magnesium) ??
    undefined;
  const bufferCapacity =
    insights?.bufferCapacity ?? computeBufferCapacity(mergedValues) ?? undefined;
  const tasteBalance =
    insights?.tastePalatability ?? computeTasteBalance(mergedValues) ?? undefined;
  const sodiumPotassiumRatio =
    insights?.sodiumPotassiumRatio ??
    computeSodiumPotassiumRatio(mergedValues.sodium, mergedValues.potassium) ??
    undefined;
  const pral = insights?.pral ?? computePralValue(mergedValues) ?? undefined;

  const tasteProfile = computeTasteProfile(mergedValues);

  const activeProfileFit: ProfileFit | undefined = insights?.profileFit?.[profile];

  const scoreColor = scoreToColor(score);
  const isInComparison = isSelected(scanResult.id);

  const handleComparisonToggle = () => {
    if (isInComparison) {
      removeScan(scanResult.id);
    } else {
      addScan(scanResult);
    }
  };

  const handleMissingDataClick = () => {
    router.push(`/scan?mode=ocr&profile=${profile}`);
  };

  const metricInsights = useMemo(() => {
    if (!metricDetails) return [];
    return metricDetails
      .map((detail) => ({
        ...detail,
        label: WATER_METRIC_LABELS[detail.metric] ?? detail.metric,
        impact: detail.weight * (detail.score - 50),
      }))
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }, [metricDetails]);

  const positiveImpacts = metricInsights.filter((item) => item.impact >= 5).slice(0, 3);
  const negativeImpacts = metricInsights.filter((item) => item.impact <= -5).slice(0, 3);

  const explanationFactors: ImpactFactor[] =
    (metricDetails
      ?.map((metric) => {
        if (metric.score >= 80) {
          return {
            label: WATER_METRIC_LABELS[metric.metric] ?? metric.metric,
            impact: "positive" as const,
            value: `${metric.score.toFixed(0)}/100`,
          };
        }
        if (metric.score <= 40) {
          return {
            label: WATER_METRIC_LABELS[metric.metric] ?? metric.metric,
            impact: "negative" as const,
            value: `${metric.score.toFixed(0)}/100`,
          };
        }
        return null;
      })
      .filter(Boolean) as ImpactFactor[]) ?? [];

  const explanationSummary =
    explanationFactors.length > 0
      ? `Besonders auffällig: ${explanationFactors
          .slice(0, 2)
          .map((f) => f.label)
          .join(", ")}.`
      : "Mineralprofile ausgeglichen – keine starken Ausreißer.";

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="ocean-panel-strong rounded-ocean-xl relative overflow-hidden p-6 flex flex-col items-center gap-4">
        <motion.div
          layoutId={`bottle-${scanResult.id}`}
          className="mx-auto flex h-16 w-16 items-center justify-center text-water-primary z-10"
          animate={{
            backgroundColor: "transparent",
            scale: 0.8,
            opacity: 0,
          }}
          transition={{
            delay: 0.6,
            duration: 0.3,
          }}
        >
          <motion.div
            initial={{ y: 0, scale: 1 }}
            animate={{
              y: 100,
              scale: 0,
            }}
            transition={{
              duration: 0.6,
              ease: "easeIn",
              delay: 0.2,
            }}
            className="text-3xl"
          >
            💧
          </motion.div>
        </motion.div>

        <WaterScoreCircle
          value={score ?? 0}
          size={200}
          strokeWidth={14}
          showValue={true}
          className="-mt-6"
          delay={0.7}
        />

        <div className="text-center space-y-2">
          <div
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ocean-success-bg ocean-success ${
              scoreColor === "success"
                ? ""
                : scoreColor === "warning"
                ? "ocean-warning-bg ocean-warning"
                : "ocean-error-bg ocean-error"
            }`}
          >
            {scoreLabel(score)}
          </div>
          <p className="text-base text-ocean-secondary">
            Profil: <span className="font-medium text-ocean-primary">{profile}</span>
          </p>
          <button
            type="button"
            onClick={handleComparisonToggle}
            className={`w-full max-w-xs inline-flex items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] ${
              isInComparison
                ? "ocean-success-bg ocean-success border-2 border-ocean-success/50"
                : "ocean-card text-ocean-secondary border-2 border-ocean-border hover:ocean-card-elevated"
            }`}
          >
            <Columns className="w-5 h-5" />
            {isInComparison ? "Im Vergleich ✓" : "Zum Vergleich hinzufügen"}
          </button>
        </div>
      </div>

      {/* Mineralwerte Card */}
      <div className="ocean-panel-strong rounded-ocean-xl p-5 space-y-3">
        <h3 className="font-semibold text-ocean-primary px-1">Mineralwerte</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WATER_METRIC_FIELDS.map((field) => {
            const metric = field.key;
            const value = mergedValues[metric];
            if (value == null) {
              // Show empty badge for pH so it’s visible even wenn fehlt
              if (metric === "ph") {
                return (
                  <div
                    key={field.key}
                    className="p-3 rounded-2xl border bg-ocean-surface border-ocean-border backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-ocean-secondary">
                        {WATER_METRIC_LABELS[metric]}
                      </p>
                      <span className="text-[10px] px-2 py-1 rounded-full font-semibold bg-white/10 text-ocean-tertiary">
                        –
                      </span>
                    </div>
                    <p className="text-lg font-bold text-ocean-tertiary">–</p>
                  </div>
                );
              }
              return null;
            }
            const unit = field.unit ?? (metric === "ph" ? "" : " mg/L");
            const metricScore = metricScores?.[metric];
            const info = MINERAL_INFO[metric];
            const targets = PROFILE_TARGETS[profile]?.[metric];

            // Nutze das neue ProMineralCard Layout mit Zielbereich + Marker. Fallback auf alte Karte, wenn keine Targets.
            if (targets) {
              return (
                <button
                  key={field.key}
                  onClick={() => setActiveMineral({ key: metric, info, value, unit, score: metricScore })}
                  className="text-left"
                >
                  <ProMineralCard
                    metric={metric}
                    label={WATER_METRIC_LABELS[metric]}
                    value={value}
                    unit={unit}
                    score={metricScore}
                    targets={targets}
                    symbol={metric}
                  />
                </button>
              );
            }

            const statusStyle = statusClasses(metricScore);

            return (
              <button
                key={field.key}
                onClick={() => setActiveMineral({ key: metric, info, value, unit, score: metricScore })}
                className={`p-4 rounded-2xl border ${statusStyle} backdrop-blur-sm active:scale-[0.98] transition-transform text-left`}
              >
                <div className="flex items-center justify-between mb-2">
                  <MineralTooltip mineral={metric} info={info} profile={profile}>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-ocean-secondary cursor-help">
                        {WATER_METRIC_LABELS[metric]}
                      </p>
                      <Info className="w-4 h-4 text-ocean-tertiary" />
                    </div>
                  </MineralTooltip>
                  {metricScore !== undefined && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white/20">
                      {metricScore.toFixed(0)}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl font-bold text-ocean-primary tabular-nums">
                    {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  {unit && <span className="text-sm text-ocean-secondary">{unit.trim()}</span>}
                </div>
              </button>
            );
          })}
        </div>
        {/* Warnung bei wenig Daten */}
        {isLowData && (
          <div className="pt-2">
            <button
              onClick={handleMissingDataClick}
              className="w-full group relative overflow-hidden rounded-2xl border border-ocean-warning/40 bg-ocean-warning/10 p-4 text-left transition-all hover:bg-ocean-warning/15 hover:border-ocean-warning/60 active:scale-[0.99]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean-warning/20 text-ocean-warning group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-ocean-primary">Analyse ungenau</h4>
                    <ArrowRight className="h-4 w-4 text-ocean-warning opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </div>
                  <p className="mt-1 text-sm text-ocean-secondary leading-relaxed">
                    Es sind nur{" "}
                    <span className="text-ocean-warning font-medium">
                      {validDataCount} Werte
                    </span>{" "}
                    bekannt. Das Wasser wird dadurch schlechter bewertet (max. 60 Punkte).
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-ocean-warning">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Werte vom Etikett nachtragen</span>
                  </div>
                </div>
              </div>

              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ocean-warning/10 blur-3xl transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none" />
            </button>
          </div>
        )}
      </div>

      {metricInsights.length > 0 && (
        <CollapsibleSection title="Warum dieser Score? (Stärken & Schwächen)" defaultOpen={false}>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-ocean-primary">
                Warum {score?.toFixed(0) ?? "–"} Punkte?
              </p>
              <p className="text-xs text-ocean-tertiary">
                Gewichtete Faktoren für das gewählte Profil
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase ocean-success">
                  Stärken
                </p>
                {positiveImpacts.length === 0 && (
                  <p className="text-xs text-ocean-tertiary">
                    Keine ausgeprägten Pluspunkte.
                  </p>
                )}
                <div className="space-y-3">
                  {positiveImpacts.map((item) => (
                    <div
                      key={`positive-${item.metric}`}
                      className="rounded-ocean-lg border border-ocean-success/50 ocean-success-bg p-3"
                    >
                      <div className="flex items-center justify-between text-sm font-semibold ocean-success">
                        <span>{item.label}</span>
                        <span>+{Math.round(item.impact)}</span>
                      </div>
                      <p className="mt-1 text-xs text-ocean-secondary/90">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase ocean-warning">
                  Potenzial
                </p>
                {negativeImpacts.length === 0 && (
                  <p className="text-xs text-ocean-tertiary">
                    Aktuell keine auffälligen Schwächen.
                  </p>
                )}
                <div className="space-y-3">
                  {negativeImpacts.map((item) => (
                    <div
                      key={`negative-${item.metric}`}
                      className="rounded-ocean-lg border border-ocean-warning/50 ocean-warning-bg p-3"
                    >
                      <div className="flex items-center justify-between text-sm font-semibold ocean-warning">
                        <span>{item.label}</span>
                        <span>-{Math.abs(Math.round(item.impact))}</span>
                      </div>
                      <p className="mt-1 text-xs text-ocean-secondary/90">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      )}

      <CollapsibleSection title="Score-Erklärung" defaultOpen={false}>
        <ScoreExplanation
          score={score ?? 0}
          textSummary={explanationSummary}
          factors={explanationFactors}
        />
      </CollapsibleSection>

      {/* Product Info */}
      {(productInfo || barcode) && (
        <div className="ocean-card p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-5 h-5 text-ocean-primary" />
            <h3 className="font-semibold text-ocean-primary">Produkt</h3>
          </div>
          {productInfo && (
            <>
              <p className="font-medium text-ocean-primary">
                {productInfo.brand ?? "Unbekannte Marke"}
                {productInfo.productName ? ` · ${productInfo.productName}` : ""}
              </p>
              {productInfo.origin && (
                <p className="text-sm text-ocean-secondary">
                  Herkunft: {productInfo.origin}
                </p>
              )}
            </>
          )}
          {barcode && <p className="text-xs font-mono text-ocean-muted">{barcode}</p>}
        </div>
      )}

      {/* Profile Fit */}
      {activeProfileFit && (
        <div
          className={`ocean-card p-4 border-2 ${
            activeProfileFit.status === "ideal"
              ? "border-ocean-success/50 ocean-success-bg"
              : activeProfileFit.status === "ok"
              ? "border-ocean-warning/50 ocean-warning-bg"
              : "border-ocean-error/50 ocean-error-bg"
          }`}
        >
          <div className="flex items-start gap-3">
            {activeProfileFit.status === "ideal" ? (
              <CheckCircle className="w-6 h-6 ocean-success flex-shrink-0" />
            ) : activeProfileFit.status === "avoid" ? (
              <AlertCircle className="w-6 h-6 ocean-error flex-shrink-0" />
            ) : (
              <Info className="w-6 h-6 ocean-warning flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-ocean-primary mb-1">
                {activeProfileFit.status === "ideal"
                  ? "Ideal"
                  : activeProfileFit.status === "ok"
                  ? "Geeignet"
                  : "Nicht empfohlen"}{" "}
                für {profile}
              </p>
              {activeProfileFit.reasons.length > 0 && (
                <ul className="space-y-1 text-sm text-ocean-secondary">
                  {activeProfileFit.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-ocean-tertiary">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Derived Metrics */}
      {(hardness !== undefined ||
        caMgRatio !== undefined ||
        bufferCapacity !== undefined ||
        tasteBalance !== undefined ||
        sodiumPotassiumRatio !== undefined ||
        pral !== undefined) && (
        <CollapsibleSection title="Abgeleitete Kennzahlen" defaultOpen={false}>
          <div className="grid gap-3 sm:grid-cols-2">
            {hardness !== undefined && (
              <VisualMetricBar
                label="Wasserhärte"
                value={hardness}
                min={0}
                max={24}
                idealMin={4}
                idealMax={12}
                unit="°dH"
              />
            )}
            {caMgRatio !== undefined && (
              <VisualMetricBar
                label="Ca:Mg Verhältnis"
                value={caMgRatio}
                min={0}
                max={5}
                idealMin={1.6}
                idealMax={2.4}
                unit=""
              />
            )}
            {sodiumPotassiumRatio !== undefined && (
              <VisualMetricBar
                label="Na:K Verhältnis"
                value={sodiumPotassiumRatio}
                min={0}
                max={10}
                idealMin={1}
                idealMax={4}
                unit=""
              />
            )}
            {bufferCapacity !== undefined && (
              <VisualMetricBar
                label="Pufferkapazität"
                value={bufferCapacity}
                min={0}
                max={30}
                idealMin={10}
                idealMax={25}
                unit="mVal/L"
              />
            )}
            {tasteBalance !== undefined && (
              <VisualMetricBar
                label="Geschmacksprofil HCO₃/(SO₄+Cl)"
                value={tasteBalance}
                min={0}
                max={3}
                idealMin={1}
                idealMax={2}
                unit=""
              />
            )}
            {pral !== undefined && (
              <VisualMetricBar
                label="PRAL-Wert (Säurelast)"
                value={pral}
                min={-15}
                max={2}
                idealMin={-20}
                idealMax={0}
                unit=" mEq/L"
              />
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* RDA Contribution */}
      <CollapsibleSection title="Deckung des Tagesbedarfs (1 Liter)" defaultOpen={false}>
        <div className="space-y-4">
          {[
            { label: "Calcium", value: mergedValues.calcium, rda: RDA_VALUES.calcium },
            {
              label: "Magnesium",
              value: mergedValues.magnesium,
              rda: RDA_VALUES.magnesium,
            },
            { label: "Kalium", value: mergedValues.potassium, rda: RDA_VALUES.potassium },
          ].map((item) => {
            if (item.value == null) return null;
            const percentage = computeRdaPercentage(item.value, item.rda);
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-ocean-secondary">{item.label}</span>
                  <span className="font-medium text-ocean-primary">
                    {percentage.toFixed(0)}%{" "}
                    <span className="text-xs text-ocean-tertiary">
                      ({item.value.toFixed(0)} mg)
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-ocean-surface overflow-hidden">
                  <div
                    className="h-full rounded-full ocean-info-bg"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Geschmacksprofil" defaultOpen={true}>
        <div className="text-center space-y-3">
          <p className="text-sm text-ocean-secondary">
            Visuelle Darstellung der geschmacklichen Nuancen.
          </p>
          <TasteRadar profile={tasteProfile} />
        </div>
      </CollapsibleSection>

      {/* Badges */}
      {insights?.badges && insights.badges.length > 0 && (
        <CollapsibleSection title="Kennzeichnungen" defaultOpen={false}>
          <div className="space-y-3">
            {insights.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-2xl border ${
                  badge.tone === "positive"
                    ? "ocean-success-bg border-ocean-success/50"
                    : badge.tone === "warning"
                    ? "ocean-warning-bg border-ocean-warning/50"
                    : "ocean-info-bg border-ocean-info/50"
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span
                    className={`flex-shrink-0 px-2 py-1 rounded-md text-xs font-semibold ${
                      badge.tone === "positive"
                        ? "ocean-success-bg ocean-success text-ocean-primary"
                        : badge.tone === "warning"
                        ? "ocean-warning-bg ocean-warning text-ocean-primary"
                        : "ocean-info-bg ocean-info text-ocean-primary"
                    }`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="text-sm text-ocean-secondary leading-relaxed">
                  <GlossaryText text={badge.description} />
                </p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Synergies */}
      {insights?.synergies && insights.synergies.length > 0 && (
        <CollapsibleSection title="Gesundheitliche Hinweise" defaultOpen={false}>
          <div className="space-y-2">
            {insights.synergies.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border ${
                  item.tone === "positive"
                    ? "ocean-success-bg border-ocean-success/50"
                    : item.tone === "warning"
                    ? "ocean-warning-bg border-ocean-warning/50"
                    : "ocean-info-bg border-ocean-info/50"
                }`}
              >
                <p className="text-sm font-semibold text-ocean-primary">{item.title}</p>
                <p className="text-sm text-ocean-secondary mt-1">
                  <GlossaryText text={item.description} />
                </p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="ocean-card p-4 border-2 border-ocean-warning/50 ocean-warning-bg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 ocean-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold ocean-warning mb-2">Warnungen</h3>
              <ul className="space-y-1 text-sm text-ocean-secondary">
                {warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Scoring Details */}
      {metricDetails && metricDetails.length > 0 && (
        <div className="ocean-card overflow-hidden">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full p-4 flex items-center justify-between hover:ocean-card-elevated transition-colors"
          >
            <h3 className="font-semibold text-ocean-primary">Bewertungs-Details</h3>
            {showDetails ? (
              <ChevronUp className="w-5 h-5 text-ocean-tertiary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-ocean-tertiary" />
            )}
          </button>

          {showDetails && (
            <div className="px-4 pb-4 space-y-3 border-t border-ocean-border pt-4">
              {metricDetails
                .filter((m) => m.score !== 50)
                .map((metric) => (
                  <div key={metric.metric} className="p-3 rounded-2xl ocean-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-ocean-primary capitalize">
                        {metric.metric}
                      </span>
                      <span className="text-sm font-mono text-ocean-secondary">
                        {metric.score.toFixed(0)}/100
                      </span>
                    </div>
                    <p className="text-sm text-ocean-secondary leading-relaxed">
                      {metric.explanation}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <MobileBottomSheet
        isOpen={!!activeMineral}
        onClose={() => setActiveMineral(null)}
        title={
          activeMineral
            ? WATER_METRIC_LABELS[activeMineral.key as keyof WaterAnalysisValues] ?? activeMineral.key
            : ""
        }
      >
        {activeMineral && (
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-ocean-primary">
                {activeMineral.value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              {activeMineral.unit && (
                <span className="text-lg text-ocean-secondary">{activeMineral.unit.trim()}</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              {activeMineral.score !== undefined && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-ocean-surface border border-ocean-border font-semibold">
                  Score {activeMineral.score.toFixed(0)}/100
                </span>
              )}
              {PROFILE_TARGETS[profile]?.[activeMineral.key] && (
                <span className="text-xs text-ocean-secondary">
                  Ziel: {PROFILE_TARGETS[profile]?.[activeMineral.key]?.optimalMin}–
                  {PROFILE_TARGETS[profile]?.[activeMineral.key]?.optimalMax} {activeMineral.unit ?? "mg/L"}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="space-y-1.5">
                <p className="text-sm text-ocean-secondary leading-relaxed">
                  {/* Profil-Nutzen zuerst, dann generische Beschreibung */}
                  {activeMineral.info?.profiles?.[profile] ??
                    activeMineral.info?.description ??
                    "Profil-Hinweis nicht vorhanden."}
                </p>
                {activeMineral.info?.description && activeMineral.info?.profiles?.[profile] && (
                  <p className="text-sm text-ocean-secondary/80 leading-relaxed">
                    {activeMineral.info.description}
                  </p>
                )}
              </div>

              {activeMineral.info?.optimal && (
                <div className="text-sm text-ocean-success font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Optimal: {activeMineral.info.optimal}
                </div>
              )}

              {metricDetails && (
                <p className="text-sm text-ocean-secondary leading-relaxed">
                  {metricDetails.find((m) => m.metric === activeMineral.key)?.explanation}
                </p>
              )}

              {/* Nutzen-Liste */}
              <div className="space-y-1 text-sm text-ocean-secondary">
                <div className="font-semibold text-ocean-primary">Was bringt das?</div>
                <ul className="list-disc list-inside space-y-1">
                  {(MINERAL_BENEFITS[activeMineral.key]?.[profile] ??
                    MINERAL_BENEFITS[activeMineral.key]?.default ??
                    []).map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  {PROFILE_TARGETS[profile]?.[activeMineral.key] && (
                    <li>
                      Bereich {PROFILE_TARGETS[profile]?.[activeMineral.key]?.min}–
                      {PROFILE_TARGETS[profile]?.[activeMineral.key]?.max} {activeMineral.unit ?? "mg/L"}{" "}
                      (ideal {PROFILE_TARGETS[profile]?.[activeMineral.key]?.optimalMin}–
                      {PROFILE_TARGETS[profile]?.[activeMineral.key]?.optimalMax})
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </MobileBottomSheet>
    </div>
  );
}

function GlossaryText({ text }: { text: string }) {
  const nodes = useMemo(() => {
    const parts: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const regex = new RegExp(glossaryRegex);

    while ((match = regex.exec(text)) !== null) {
      const [matched] = match;
      const start = match.index;
      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }
      parts.push(<GlossaryHint key={`${matched}-${start}`} display={matched} />);
      lastIndex = start + matched.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length ? parts : [text];
  }, [text]);

  return <>{nodes}</>;
}

function GlossaryHint({ display }: { display: string }) {
  const [open, setOpen] = useState(false);
  const normalized = display.toLowerCase();
  const entry = GLOSSARY_MAP[normalized];

  if (!entry) {
    return display;
  }

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center gap-1 ocean-info underline decoration-dotted decoration-2"
      >
        {display}
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <span className="absolute left-0 top-full mt-2 w-64 rounded-2xl ocean-panel-strong text-ocean-primary text-xs shadow-2xl p-3 z-20">
          <p className="font-semibold text-sm mb-1">{entry.term}</p>
          <p className="text-ocean-secondary/80">{entry.description}</p>
        </span>
      )}
    </span>
  );
}
