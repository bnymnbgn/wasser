"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

import type { ProfileType, ScanResult, WaterAnalysisValues } from "@/src/domain/types";
import { WaterScoreCard } from "@/src/components/WaterScoreCard";
import { BarcodeScanner } from "@/src/components/BarcodeScanner";
import { ImageOCRScanner } from "@/src/components/ImageOCRScanner";
import { parseTextToAnalysis, validateValue } from "@/src/lib/ocrParsing";
import { hapticLight, hapticMedium, hapticSuccess, hapticError } from "@/lib/capacitor";

const METRIC_FIELDS = [
  { key: "ph", label: "pH-Wert" },
  { key: "calcium", label: "Calcium", unit: "mg/L" },
  { key: "magnesium", label: "Magnesium", unit: "mg/L" },
  { key: "sodium", label: "Natrium", unit: "mg/L" },
  { key: "potassium", label: "Kalium", unit: "mg/L" },
  { key: "chloride", label: "Chlorid", unit: "mg/L" },
  { key: "sulfate", label: "Sulfat", unit: "mg/L" },
  { key: "nitrate", label: "Nitrat", unit: "mg/L" },
  { key: "bicarbonate", label: "Hydrogencarbonat", unit: "mg/L" },
  { key: "totalDissolvedSolids", label: "Gesamtmineralisation", unit: "mg/L" },
] as const;

type MetricKey = (typeof METRIC_FIELDS)[number]["key"];
type ValueInputState = Record<MetricKey, string>;

const createEmptyValueState = (): ValueInputState =>
  METRIC_FIELDS.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {} as ValueInputState);

type Mode = "ocr" | "barcode";

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-md-background dark:bg-md-dark-background flex items-center justify-center">
          <div className="text-sm text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
            Scanner wird geladen…
          </div>
        </main>
      }
    >
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
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [valueInputs, setValueInputs] = useState<ValueInputState>(() =>
    createEmptyValueState()
  );

  const { numericValues, invalidFields } = useMemo(() => {
    const values: Partial<WaterAnalysisValues> = {};
    const invalid: Partial<Record<MetricKey, boolean>> = {};

    for (const field of METRIC_FIELDS) {
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
      const endpoint = mode === "ocr" ? "/api/scan/ocr" : "/api/scan/barcode";
      const body =
        mode === "ocr"
          ? { text: ocrText, profile, values: numericValues }
          : { barcode, profile };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        await hapticError();
        alert(data.error ?? "Fehler beim Scannen");
        return;
      }

      await hapticSuccess();
      setResult(data as ScanResult);
      setShowResults(true);
    } catch (err) {
      console.error(err);
      setLoading(false);
      await hapticError();
      alert("Unerwarteter Fehler bei der Analyse");
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
    }
  }

  function applyTextParsing(text: string) {
    if (!text.trim()) {
      setValueInputs(createEmptyValueState());
      return;
    }
    const parsed = parseTextToAnalysis(text);
    const nextValues = createEmptyValueState();
    METRIC_FIELDS.forEach((field) => {
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
    <main className="min-h-screen bg-md-background dark:bg-md-dark-background text-md-onBackground dark:text-md-dark-onBackground">
      <div className="mx-auto max-w-2xl px-4 py-4 safe-area-top">
        {/* Header */}
        <motion.header
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold tracking-tight text-md-onSurface dark:text-md-dark-onSurface mb-1">
            Wasser scannen
          </h1>
          <p className="text-sm text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
            Profil: <span className="font-medium">{profile}</span>
          </p>
        </motion.header>

        {/* Mode Tabs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex gap-2 p-1 bg-md-surface-container dark:bg-md-dark-surface-container rounded-md-lg">
            <button
              type="button"
              onClick={() => handleModeChange("ocr")}
              className={clsx(
                "flex-1 py-2.5 px-4 rounded-md-md text-sm font-medium transition-all touch-manipulation",
                mode === "ocr"
                  ? "bg-md-primary dark:bg-md-dark-primary text-white shadow-elevation-2"
                  : "text-md-onSurface-variant dark:text-md-dark-onSurface-variant"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Etikett
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("barcode")}
              className={clsx(
                "flex-1 py-2.5 px-4 rounded-md-md text-sm font-medium transition-all touch-manipulation",
                mode === "barcode"
                  ? "bg-md-primary dark:bg-md-dark-primary text-white shadow-elevation-2"
                  : "text-md-onSurface-variant dark:text-md-dark-onSurface-variant"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
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

                {/* Values Grid */}
                {hasAnyValues && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="md-card p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-md-onSurface dark:text-md-dark-onSurface">
                        Erkannte Werte
                      </h3>
                      <button
                        type="button"
                        onClick={async () => {
                          await hapticLight();
                          setValueInputs(createEmptyValueState());
                          setResult(null);
                        }}
                        className="text-xs text-md-primary dark:text-md-dark-primary font-medium touch-manipulation"
                      >
                        Leeren
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {METRIC_FIELDS.map((field) => {
                        const value = valueInputs[field.key];
                        if (!value) return null;

                        const warning = valueWarnings[field.key];
                        const invalid = invalidFields[field.key];

                        return (
                          <div
                            key={field.key}
                            className={clsx(
                              "p-2 rounded-md-md border",
                              invalid
                                ? "border-md-error dark:border-md-dark-error bg-md-error-container/10 dark:bg-md-dark-error-container/10"
                                : warning
                                ? "border-md-warning dark:border-md-dark-warning bg-md-warning-container/10 dark:bg-md-dark-warning-container/10"
                                : "border-md-surface-containerHigh dark:border-md-dark-surface-containerHigh bg-md-surface-containerLow dark:bg-md-dark-surface-containerLow"
                            )}
                          >
                            <label className="block">
                              <span className="text-[10px] text-md-onSurface-variant dark:text-md-dark-onSurface-variant uppercase tracking-wide">
                                {field.label}
                              </span>
                              <input
                                className={clsx(
                                  "mt-0.5 block w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0",
                                  invalid
                                    ? "text-md-error dark:text-md-dark-error"
                                    : "text-md-onSurface dark:text-md-dark-onSurface"
                                )}
                                value={value}
                                onChange={(e) => {
                                  setValueInputs((prev) => ({
                                    ...prev,
                                    [field.key]: e.target.value,
                                  }));
                                  setResult(null);
                                }}
                                placeholder="0"
                                inputMode="decimal"
                              />
                              {field.unit && (
                                <span className="text-[10px] text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
                                  {field.unit}
                                </span>
                              )}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
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
                <div className="md-card p-4">
                  <label className="block">
                    <span className="text-sm font-medium text-md-onSurface dark:text-md-dark-onSurface mb-2 block">
                      Barcode eingeben
                    </span>
                    <input
                      className="block w-full bg-md-surface-containerLow dark:bg-md-dark-surface-containerLow border border-md-surface-containerHigh dark:border-md-dark-surface-containerHigh rounded-md-md px-4 py-3 text-base focus:border-md-primary dark:focus:border-md-dark-primary focus:ring-2 focus:ring-md-primary/20 dark:focus:ring-md-dark-primary/20"
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
                <div className="md-card p-4">
                  <h3 className="text-xs font-medium text-md-onSurface-variant dark:text-md-dark-onSurface-variant mb-2">
                    Beispiel-Barcodes
                  </h3>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await hapticLight();
                        setBarcode("4008501011009");
                      }}
                      className="w-full text-left p-2 rounded-md-md bg-md-surface-containerLow dark:bg-md-dark-surface-containerLow hover:bg-md-surface-containerHigh dark:hover:bg-md-dark-surface-containerHigh transition touch-manipulation"
                    >
                      <code className="text-xs font-mono text-md-primary dark:text-md-dark-primary">
                        4008501011009
                      </code>
                      <p className="text-[10px] text-md-onSurface-variant dark:text-md-dark-onSurface-variant mt-0.5">
                        Gerolsteiner Naturell
                      </p>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={formDisabled}
            className="w-full btn-touch bg-md-primary dark:bg-md-dark-primary text-white font-semibold rounded-md-lg shadow-elevation-2 disabled:opacity-50 disabled:shadow-none"
            whileTap={{ scale: formDisabled ? 1 : 0.98 }}
            onClick={() => !formDisabled && hapticMedium()}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analysiere...
              </div>
            ) : (
              "Wasser analysieren"
            )}
          </motion.button>
        </form>

        {/* Results Bottom Sheet */}
        <AnimatePresence>
          {showResults && result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 flex items-end"
              onClick={() => setShowResults(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="bottom-sheet w-full overflow-y-auto custom-scrollbar pb-safe-bottom"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-md-surface dark:bg-md-dark-surface p-4 border-b border-md-surface-containerHigh dark:border-md-dark-surface-containerHigh">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-md-onSurface dark:text-md-dark-onSurface">
                      Analyse-Ergebnis
                    </h2>
                    <button
                      onClick={() => setShowResults(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-md-surface-containerHigh dark:hover:bg-md-dark-surface-containerHigh"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4">
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
