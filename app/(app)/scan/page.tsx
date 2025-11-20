"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Camera, Scan, X, RotateCcw } from "lucide-react";
import { Capacitor } from "@capacitor/core";

import type { ProfileType, ScanResult, WaterAnalysisValues } from "@/src/domain/types";
import { WaterScoreCard } from "@/src/components/WaterScoreCard";
import { BarcodeScanner } from "@/src/components/BarcodeScanner";
import { ImageOCRScanner } from "@/src/components/ImageOCRScanner";
import { RippleButton } from "@/src/components/ui/RippleButton";
import { SkeletonScoreCard } from "@/src/components/ui/SkeletonLoader";
import { parseTextToAnalysis, validateValue } from "@/src/lib/ocrParsing";
import { hapticLight, hapticMedium, hapticSuccess, hapticError } from "@/lib/capacitor";
import { processBarcodeLocally, processOCRLocally } from "@/src/lib/scanProcessor";
import { WATER_METRIC_FIELDS } from "@/src/constants/waterMetrics";

type MetricKey = (typeof WATER_METRIC_FIELDS)[number]["key"];
type ValueInputState = Record<MetricKey, string>;

const createEmptyValueState = (): ValueInputState =>
  WATER_METRIC_FIELDS.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {} as ValueInputState);

type Mode = "ocr" | "barcode";

export default function ScanPage() {
  return (
    <Suspense fallback={<SkeletonScoreCard />}>
      <ScanPageContent />
    </Suspense>
  );
}

function ScanPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const defaultProfile = (params.get("profile") ?? "standard") as ProfileType;

  const [profile] = useState<ProfileType>(defaultProfile);
  const [mode, setMode] = useState<Mode>("ocr");

  const [ocrText, setOcrText] = useState("");
  const [barcode, setBarcode] = useState("");
  const [brandName, setBrandName] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [valueInputs, setValueInputs] = useState<ValueInputState>(() =>
    createEmptyValueState()
  );

  const { numericValues, invalidFields } = useMemo(() => {
    const values: Partial<WaterAnalysisValues> = {};
    const invalid: Partial<Record<MetricKey, boolean>> = {};

    for (const field of WATER_METRIC_FIELDS) {
      const raw = valueInputs[field.key];
      if (!raw.trim()) continue;
      const normalized = raw.replace(",", ".");
      const parsed = Number(normalized);
      if (Number.isFinite(parsed)) {
        values[field.key] = parsed;
      } else {
        invalid[field.key] = true;
      }
    }

    return { numericValues: values, invalidFields: invalid };
  }, [valueInputs]);

  const valueWarnings = useMemo(() => {
    const map: Partial<Record<MetricKey, string>> = {};
    Object.entries(numericValues).forEach(([metric, value]) => {
      const result = validateValue(metric as MetricKey, value as number);
      if (!result.valid && result.warning) {
        map[metric as MetricKey] = result.warning;
      }
    });
    return map;
  }, [numericValues]);

  const hasAnyValues = Object.keys(numericValues).length > 0;
  const hasInvalidInputs = Object.keys(invalidFields).length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let scanResult: ScanResult;

      // Use local SQLite for Capacitor builds, API for web builds
      if (Capacitor.isNativePlatform()) {
        // Local processing for mobile app
        if (mode === "barcode") {
          scanResult = await processBarcodeLocally(barcode, profile);
        } else {
          scanResult = await processOCRLocally(
            ocrText,
            profile,
            numericValues,
            brandName || undefined,
            barcode || undefined
          );
        }
      } else {
        // API processing for web app
        const endpoint = mode === "ocr" ? "/api/scan/ocr" : "/api/scan/barcode";
        const body =
          mode === "ocr"
            ? {
                text: ocrText,
                profile,
                values: numericValues,
                brand: brandName || undefined,
                barcode: barcode || undefined,
              }
            : { barcode, profile };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Fehler beim Scannen");
        }

        scanResult = await res.json();
      }

      setLoading(false);
      await hapticSuccess();
      setResult(scanResult);
      setShowResults(true);
    } catch (err) {
      console.error(err);
      setLoading(false);
      await hapticError();
      alert(err instanceof Error ? err.message : "Unerwarteter Fehler bei der Analyse");
    }
  }

  const formDisabled =
    loading ||
    (mode === "ocr" ? !hasAnyValues || hasInvalidInputs : !barcode.trim());

  async function handleModeChange(nextMode: Mode) {
    await hapticLight();
    setMode(nextMode);
    setResult(null);
    setShowResults(false);
    if (nextMode === "barcode") {
      setValueInputs(createEmptyValueState());
      setBrandName("");
      setOcrText("");
    }
    if (nextMode === "ocr") {
      setBarcode("");
    }
  }

  function applyTextParsing(text: string) {
    if (!text.trim()) {
      setValueInputs(createEmptyValueState());
      return;
    }
    const parsed = parseTextToAnalysis(text);
    const nextValues = createEmptyValueState();
    WATER_METRIC_FIELDS.forEach((field) => {
      const maybe = parsed[field.key];
      nextValues[field.key] = maybe !== undefined ? String(maybe) : "";
    });
    setValueInputs(nextValues);
  }

  function handleTextExtracted(text: string) {
    setOcrText(text);
    setResult(null);
    setShowResults(false);
    applyTextParsing(text);
  }

  return (
    <main className="relative min-h-screen bg-ocean-background text-ocean-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 -left-16 h-72 w-72 rounded-full ocean-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full ocean-accent/15 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8 safe-area-top pb-[calc(var(--bottom-nav-height)+48px)]">
        {/* Header */}
        <motion.header
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[11px] uppercase tracking-[0.4em] text-ocean-tertiary">
            Analyse
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ocean-primary">Wasser scannen</h1>
          <p className="text-sm text-ocean-secondary">
            Profil&nbsp;
            <span className="font-medium text-ocean-accent">{profile}</span>
          </p>
        </motion.header>

        {/* Mode Tabs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="ocean-panel flex gap-2 p-2">
            <button
              type="button"
              onClick={() => handleModeChange("ocr")}
              className={clsx(
                "relative flex-1 overflow-hidden rounded-2xl py-3 text-sm font-semibold transition",
                mode === "ocr"
                  ? "bg-gradient-to-r from-water-primary to-water-accent text-ocean-primary shadow-glow"
                  : "text-ocean-secondary hover:bg-ocean-surface-elevated"
              )}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <Camera className="h-5 w-5" />
                Etikett
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("barcode")}
              className={clsx(
                "relative flex-1 overflow-hidden rounded-2xl py-3 text-sm font-semibold transition",
                mode === "barcode"
                  ? "bg-gradient-to-r from-water-primary to-water-accent text-ocean-primary shadow-glow"
                  : "text-ocean-secondary hover:bg-ocean-surface-elevated"
              )}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <Scan className="h-5 w-5" />
                Barcode
              </div>
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === "ocr" ? (
              <motion.div
                key="ocr"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* OCR Scanner */}
                <ImageOCRScanner onTextExtracted={handleTextExtracted} />

                {/* Brand and Barcode */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ocean-panel grid gap-3 p-4 sm:grid-cols-2"
                >
                  <label className="block">
                    <span className="mb-2 block text-[11px] uppercase tracking-[0.3em] text-ocean-secondary">
                      Marke / Quelle
                    </span>
                    <input
                      className="w-full rounded-2xl border border-ocean-border ocean-panel px-4 py-3 text-sm text-ocean-primary placeholder-ocean-tertiary outline-none transition focus:border-water-primary/60 focus:ring-2 focus:ring-water-primary/20"
                      value={brandName}
                      onChange={(e) => {
                        setBrandName(e.target.value);
                        setResult(null);
                      }}
                      placeholder="z. B. Gerolsteiner"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] uppercase tracking-[0.3em] text-ocean-secondary">
                      Barcode (optional)
                    </span>
                    <input
                      className="w-full rounded-2xl border border-ocean-border ocean-panel px-4 py-3 text-sm text-ocean-primary placeholder-ocean-tertiary outline-none transition focus:border-water-primary/60 focus:ring-2 focus:ring-water-primary/20"
                      value={barcode}
                      onChange={(e) => {
                        setBarcode(e.target.value);
                        setResult(null);
                      }}
                      placeholder="z. B. 4008501011009"
                      inputMode="numeric"
                    />
                  </label>
                </motion.div>

                {/* Values Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ocean-panel p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-medium text-ocean-primary">Mineralwerte</h3>
                      <p className="text-xs text-ocean-secondary">Erkannt aus OCR oder manuell anpassen</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await hapticLight();
                        setValueInputs(createEmptyValueState());
                        setResult(null);
                      }}
                      className="flex items-center gap-1 text-xs font-medium text-ocean-accent transition hover:text-ocean-primary"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Zurücksetzen
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {WATER_METRIC_FIELDS.map((field) => {
                      const value = valueInputs[field.key];
                      const warning = valueWarnings[field.key];
                      const invalid = invalidFields[field.key];
                      const unit = "unit" in field ? field.unit : undefined;

                      return (
                        <div
                          key={field.key}
                          className={clsx(
                            "rounded-2xl border-2 p-3 transition-all",
                            invalid
                              ? "border-ocean-error/50 ocean-error-bg"
                              : warning
                              ? "border-ocean-warning/50 ocean-warning-bg"
                              : "border-ocean-border ocean-surface-elevated"
                          )}
                        >
                          <label className="block space-y-2">
                            <span className="block text-[10px] uppercase tracking-[0.3em] text-ocean-secondary">
                              {field.label}
                            </span>
                            <div className="relative">
                              <input
                                value={value}
                                onChange={(e) => {
                                  setValueInputs((prev) => ({
                                    ...prev,
                                    [field.key]: e.target.value,
                                  }));
                                  setResult(null);
                                }}
                                className={clsx(
                                  "w-full rounded-2xl border border-ocean-border bg-transparent px-3 py-2 text-base font-semibold text-ocean-primary placeholder-ocean-tertiary outline-none transition focus:border-water-primary/60 focus:ring-2 focus:ring-water-primary/25",
                                  invalid ? "ocean-error" : ""
                                )}
                                placeholder={unit ? `0 ${unit}` : "0"}
                                inputMode="decimal"
                              />
                              {unit && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-ocean-secondary">
                                  {unit}
                                </span>
                              )}
                            </div>
                            {warning && (
                              <span className="text-[10px] ocean-warning">{warning}</span>
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="barcode"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Manual Barcode Input */}
                <div className="ocean-panel p-5">
                  <label className="block space-y-3">
                    <span className="text-[11px] uppercase tracking-[0.3em] text-ocean-secondary">
                      Barcode eingeben
                    </span>
                    <input
                      className="block w-full rounded-2xl border border-ocean-border ocean-panel px-5 py-4 text-base font-mono text-ocean-primary placeholder-ocean-tertiary outline-none transition focus:border-water-primary/60 focus:ring-2 focus:ring-water-primary/25"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="z. B. 4008501011009"
                      inputMode="numeric"
                    />
                  </label>
                </div>

                {/* Barcode Scanner */}
                <BarcodeScanner
                  onDetected={async (code) => {
                    await hapticSuccess();
                    setBarcode(code);
                    setResult(null);
                  }}
                />

                {/* Example Barcodes */}
                <div className="ocean-panel p-4">
                  <h3 className="mb-3 text-sm font-medium text-ocean-secondary">Beispiel-Barcodes</h3>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await hapticLight();
                        setBarcode("4008501011009");
                      }}
                      className="w-full rounded-2xl border border-ocean-border ocean-surface-elevated p-3 text-left transition hover:border-water-accent/40"
                    >
                      <code className="block text-sm font-mono text-ocean-accent">
                        4008501011009
                      </code>
                      <p className="mt-1 text-xs text-ocean-secondary">Gerolsteiner Naturell</p>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <RippleButton
            type="submit"
            disabled={formDisabled}
            variant="primary"
            size="lg"
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => !formDisabled && hapticMedium()}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-ocean-tertiary/30 border-t-ocean-primary rounded-full animate-spin" />
                Analysiere...
              </div>
            ) : (
              "Wasser analysieren"
            )}
          </RippleButton>
        </form>

        {/* Results Modal */}
        <AnimatePresence>
          {showResults && result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end p-4 md:items-center md:justify-center bg-black/70 backdrop-blur"
              onClick={() => setShowResults(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-[32px] border border-ocean-border ocean-panel-strong text-ocean-primary shadow-glass md:rounded-[32px]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[32px] border-b border-ocean-border ocean-panel-strong p-5">
                  <h2 className="text-xl font-semibold text-ocean-primary">Analyse-Ergebnis</h2>
                  <button
                    onClick={() => setShowResults(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-ocean-border ocean-surface-elevated transition hover:border-ocean-border"
                  >
                    <X className="h-5 w-5 text-ocean-secondary" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-5 pb-safe-bottom text-ocean-primary">
                  <WaterScoreCard scanResult={result} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
