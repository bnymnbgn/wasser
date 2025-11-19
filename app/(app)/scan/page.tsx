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
    <main className="relative min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20 pointer-events-none" />

      <div className="relative mx-auto max-w-2xl px-4 py-6 safe-area-top pb-[calc(var(--bottom-nav-height)+32px)]">
        {/* Header */}
        <motion.header
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-headline text-slate-900 dark:text-slate-100 mb-1">
            Wasser scannen
          </h1>
          <p className="text-body text-slate-600 dark:text-slate-400">
            Profil: <span className="font-medium text-blue-600 dark:text-blue-400">{profile}</span>
          </p>
        </motion.header>

        {/* Mode Tabs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="modern-card p-2 flex gap-2">
            <button
              type="button"
              onClick={() => handleModeChange("ocr")}
              className={clsx(
                "flex-1 py-3 px-4 rounded-[20px] text-sm font-semibold transition-all touch-manipulation relative overflow-hidden",
                mode === "ocr"
                  ? "bg-blue-500 dark:bg-blue-600 text-white shadow-lg"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <div className="flex items-center justify-center gap-2 relative z-10">
                <Camera className="w-5 h-5" />
                Etikett
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("barcode")}
              className={clsx(
                "flex-1 py-3 px-4 rounded-[20px] text-sm font-semibold transition-all touch-manipulation relative overflow-hidden",
                mode === "barcode"
                  ? "bg-blue-500 dark:bg-blue-600 text-white shadow-lg"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <div className="flex items-center justify-center gap-2 relative z-10">
                <Scan className="w-5 h-5" />
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
                  className="modern-card p-4 grid gap-3 sm:grid-cols-2"
                >
                  <label className="block">
                    <span className="text-label text-slate-700 dark:text-slate-300 mb-2 block">
                      Marke / Quelle
                    </span>
                    <input
                      className="w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all"
                      value={brandName}
                      onChange={(e) => {
                        setBrandName(e.target.value);
                        setResult(null);
                      }}
                      placeholder="z. B. Gerolsteiner"
                    />
                  </label>
                  <label className="block">
                    <span className="text-label text-slate-700 dark:text-slate-300 mb-2 block">
                      Barcode (optional)
                    </span>
                    <input
                      className="w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all"
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
                  className="modern-card p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        Mineralwerte
                      </h3>
                      <p className="text-caption">
                        Erkannt aus OCR oder manuell anpassen
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await hapticLight();
                        setValueInputs(createEmptyValueState());
                        setResult(null);
                      }}
                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors touch-manipulation"
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
                            "p-3 rounded-2xl border-2 transition-all",
                            invalid
                              ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
                              : warning
                              ? "border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                          )}
                        >
                          <label className="block">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                              {field.label}
                            </span>
                            <input
                              className={clsx(
                                "w-full bg-transparent border-none p-0 text-base font-semibold focus:ring-0 outline-none",
                                invalid
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-slate-900 dark:text-slate-100"
                              )}
                              value={value}
                              onChange={(e) => {
                                setValueInputs((prev) => ({
                                  ...prev,
                                  [field.key]: e.target.value,
                                }));
                                setResult(null);
                              }}
                              placeholder={unit ? `0 ${unit}` : "0"}
                              inputMode="decimal"
                            />
                            {unit && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {unit}
                              </span>
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
                <div className="modern-card p-5">
                  <label className="block">
                    <span className="text-label text-slate-700 dark:text-slate-300 mb-3 block">
                      Barcode eingeben
                    </span>
                    <input
                      className="block w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-5 py-4 text-base font-mono focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all"
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
                <div className="modern-card p-4">
                  <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                    Beispiel-Barcodes
                  </h3>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await hapticLight();
                        setBarcode("4008501011009");
                      }}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors touch-manipulation"
                    >
                      <code className="text-sm font-mono text-blue-600 dark:text-blue-400 block">
                        4008501011009
                      </code>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Gerolsteiner Naturell
                      </p>
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
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center p-4"
              onClick={() => setShowResults(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-[32px] md:rounded-[32px] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-5 rounded-t-[32px] flex items-center justify-between">
                  <h2 className="text-title text-slate-900 dark:text-slate-100">
                    Analyse-Ergebnis
                  </h2>
                  <button
                    onClick={() => setShowResults(false)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-5 pb-safe-bottom">
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
