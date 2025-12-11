"use client";

import { Suspense, useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { IconButton, Slider, Alert, ButtonBase, Box, Button } from "@mui/material";
import {
  X,
  ChevronUp,
  Text as TextIcon,
  Barcode as BarcodeIcon,
  Flashlight,
  FlashlightOff
} from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Global } from "@emotion/react";
// REMOVED: SwipeableDrawer and Box (Heavy MUI components)
// import SwipeableDrawer from "@mui/material/SwipeableDrawer";
// import Box from "@mui/material/Box";

import type { ProfileType, ScanResult, WaterAnalysisValues } from "@/src/domain/types";
import { WaterScoreCard } from "@/src/components/WaterScoreCard";
import { BarcodeScanner, BarcodeScannerHandle } from "@/src/components/BarcodeScanner";
import { ImageOCRScanner, ImageOCRScannerHandle } from "@/src/components/ImageOCRScanner";
import { ManualScanForm } from "@/src/components/ManualScanForm";
import { SkeletonScoreCard } from "@/src/components/ui/SkeletonLoader";
import { parseTextToAnalysis } from "@/src/lib/ocrParsing";
import { hapticLight, hapticMedium, hapticSuccess, hapticError } from "@/lib/capacitor";
import { processBarcodeLocally, processOCRLocally, getBarcodeInfo } from "@/src/lib/scanProcessor";
import { WATER_METRIC_FIELDS } from "@/src/constants/waterMetrics";

// Helper to create empty values
type MetricKey = (typeof WATER_METRIC_FIELDS)[number]["key"];
type ValueInputState = Record<MetricKey, string>;

const createEmptyValueState = (): ValueInputState =>
  WATER_METRIC_FIELDS.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {} as ValueInputState);

const fillValuesFromAnalysis = (
  analysis?: Partial<WaterAnalysisValues> | null
): ValueInputState => {
  const base = createEmptyValueState();
  if (!analysis) return base;
  for (const field of WATER_METRIC_FIELDS) {
    const value = (analysis as any)?.[field.key];
    if (value !== null && value !== undefined) {
      base[field.key] = String(value);
    }
  }
  return base;
};

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
  const defaultProfile = (params.get("profile") ?? "standard") as ProfileType;
  const initialModeParam = params.get("mode");
  const initialMode: Mode = initialModeParam === "barcode" ? "barcode" : "ocr";

  const [profile] = useState<ProfileType>(defaultProfile);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number; id: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isTilted, setIsTilted] = useState(false);
  const pinchState = useRef<{ startDistance: number; startZoom: number } | null>(null);
  const [stability, setStability] = useState<"good" | "warning" | "bad">("good");
  const motionRaf = useRef<number | null>(null);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [showBarcodeSwitchPrompt, setShowBarcodeSwitchPrompt] = useState(false);

  // Initial values for the form (only updated when scanning happens)
  const [pendingValues, setPendingValues] = useState<ValueInputState>(createEmptyValueState);
  const [pendingBrand, setPendingBrand] = useState("");
  const [pendingProduct, setPendingProduct] = useState("");
  const [pendingBarcode, setPendingBarcode] = useState("");

  const [ocrText, setOcrText] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const ocrRef = useRef<ImageOCRScannerHandle>(null);
  const barcodeRef = useRef<BarcodeScannerHandle>(null);

  // --- Handlers ---

  const handleShutterPress = useCallback(async () => {
    await hapticMedium();
    if (mode === "ocr") {
      ocrRef.current?.capture();
    } else {
      barcodeRef.current?.startScan();
    }
  }, [mode]);

  const onBarcodeDetected = useCallback(async (code: string) => {
    setPendingBarcode(code);
    await hapticSuccess();
    setShowBarcodeSwitchPrompt(false);
    handleBarcodeAutoSubmit(code);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onTextExtracted = useCallback((text: string, confidence?: number, info?: { brand?: string; productName?: string }) => {
    setOcrText(text);
    if (text) {
      const parsed = parseTextToAnalysis(text);
      const nextValues = createEmptyValueState();
      WATER_METRIC_FIELDS.forEach((field) => {
        const maybe = parsed[field.key];
        nextValues[field.key] = maybe !== undefined ? String(maybe) : "";
      });

      setPendingValues(nextValues);
      setPendingBrand(info?.brand || "");
      setPendingProduct(info?.productName || "");

      hapticSuccess();
      setIsDrawerOpen(true);
    }
  }, []);

  async function handleBarcodeAutoSubmit(code: string) {
    setLoading(true);
    setResult(null);

    try {
      if (Capacitor.isNativePlatform()) {
        const info = await getBarcodeInfo(code);
        if (info?.analysis && Object.keys(info.analysis).length > 0) {
          const scanResult = await processBarcodeLocally(code, profile);
          finalizeResult(scanResult);
        } else {
          setLoading(false);
          setMode("ocr");
          setPendingBarcode(code);
          if (info?.source) {
            setPendingBrand(info.source.brand);
            setPendingProduct(info.source.productName);
            if (info.analysis) {
              const values: Partial<WaterAnalysisValues> = {};
              WATER_METRIC_FIELDS.forEach(({ key }) => {
                const val = (info.analysis as any)[key];
                if (val !== null && val !== undefined) values[key as keyof WaterAnalysisValues] = val;
              });
              setPendingValues(fillValuesFromAnalysis(values));
            }
          }
          setIsDrawerOpen(true);
        }
      } else {
        const res = await fetch("/api/scan/barcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ barcode: code, profile }),
        });
        if (!res.ok) throw new Error("Web API Error");
        const data = await res.json();
        finalizeResult(data);
      }
    } catch (err) {
      console.warn("Auto-submit failed, falling back to manual", err);
      setLoading(false);
      setMode("ocr");
      setPendingBarcode(code);
      setIsDrawerOpen(true);
      await hapticError();
    }
  }

  const handleManualSubmit = useCallback(async (data: {
    brandName: string;
    productName: string;
    barcode: string;
    numericValues: Partial<WaterAnalysisValues>;
  }) => {
    setLoading(true);
    setResult(null);

    try {
      let scanResult: ScanResult;

      if (Capacitor.isNativePlatform()) {
        scanResult = await processOCRLocally(
          ocrText,
          profile,
          data.numericValues,
          data.brandName || undefined,
          data.productName || undefined,
          data.barcode || undefined
        );
      } else {
        const res = await fetch("/api/scan/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: ocrText,
            profile,
            values: data.numericValues,
            brand: data.brandName || undefined,
            productName: data.productName || undefined,
            barcode: data.barcode || undefined
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error ?? "Fehler");
        }
        scanResult = await res.json();
      }

      await finalizeResult(scanResult);
      setIsDrawerOpen(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      await hapticError();
      alert(err instanceof Error ? err.message : "Fehler bei der Analyse");
    }
  }, [ocrText, profile]);

  async function finalizeResult(scanResult: ScanResult) {
    setLoading(false);
    await hapticSuccess();
    setResult(scanResult);
    setLastResult(scanResult);
    setShowResults(true);
  }

  const handleFocusTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFocusPoint({ x, y, id: Date.now() });
  }, []);

  const clampZoom = (value: number) => Math.min(2.5, Math.max(1, value));

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const first = e.touches.item(0);
      const second = e.touches.item(1);
      if (!first || !second) return;
      const dx = first.clientX - second.clientX;
      const dy = first.clientY - second.clientY;
      const distance = Math.hypot(dx, dy);
      pinchState.current = { startDistance: distance, startZoom: zoom };
    }
  }, [zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchState.current) {
      const first = e.touches.item(0);
      const second = e.touches.item(1);
      if (!first || !second) return;
      const dx = first.clientX - second.clientX;
      const dy = first.clientY - second.clientY;
      const distance = Math.hypot(dx, dy);
      const scale = distance / pinchState.current.startDistance;
      setZoom(clampZoom(pinchState.current.startZoom * scale));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    pinchState.current = null;
  }, []);

  const handleTilt = useCallback((event: DeviceOrientationEvent) => {
    const gamma = event.gamma ?? 0;
    const beta = event.beta ?? 0;
    const tilted = Math.abs(gamma) > 18 || Math.abs(beta) > 65;
    setIsTilted((prev) => (prev !== tilted ? tilted : prev));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return;
    try {
      window.addEventListener("deviceorientation", handleTilt, true);
    } catch (err) {
      console.warn("Device orientation not available:", err);
    }
    return () => {
      try {
        window.removeEventListener("deviceorientation", handleTilt, true);
      } catch {
        // ignore
      }
    };
  }, [handleTilt]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    setShowBarcodeSwitchPrompt(false);
    if (mode === "barcode" && !isDrawerOpen && !loading) {
      timer = setTimeout(() => setShowBarcodeSwitchPrompt(true), 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [mode, isDrawerOpen, loading]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (motionRaf.current) return;
      motionRaf.current = window.requestAnimationFrame(() => {
        motionRaf.current = null;
        const ax = event.accelerationIncludingGravity?.x ?? 0;
        const ay = event.accelerationIncludingGravity?.y ?? 0;
        const az = event.accelerationIncludingGravity?.z ?? 0;
        const magnitude = Math.sqrt(ax * ax + ay * ay + az * az);
        // Heuristic thresholds for handheld steadiness
        if (magnitude < 1.5) {
          setStability((prev) => (prev === "good" ? prev : "good"));
        } else if (magnitude < 3.5) {
          setStability((prev) => (prev === "warning" ? prev : "warning"));
        } else {
          setStability((prev) => (prev === "bad" ? prev : "bad"));
        }
      });
    };

    try {
      window.addEventListener("devicemotion", handleMotion, true);
    } catch (err) {
      console.warn("Device motion not available:", err);
    }

    return () => {
      if (motionRaf.current) {
        cancelAnimationFrame(motionRaf.current);
        motionRaf.current = null;
      }
      try {
        window.removeEventListener("devicemotion", handleMotion, true);
      } catch {
        // ignore
      }
    };
  }, []);

  return (
    <main className="fixed inset-0 bg-black text-white flex flex-col z-50">

      {/* Camera Viewfinder Area */}
      <div className="relative flex-1 bg-slate-900 rounded-b-[32px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-6 pt-safe-top flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <div>
            <h1 className="text-lg font-bold drop-shadow-md">Wasser scannen</h1>
            <p className="text-xs text-white/70 drop-shadow-md">Profil: {profile}</p>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <IconButton
              onClick={() => setTorchEnabled((prev) => !prev)}
              aria-label="Taschenlampe umschalten"
              sx={{
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.1)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                color: "white",
              }}
              size="small"
            >
              {torchEnabled ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
            </IconButton>
            <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest">
              {mode === 'ocr' ? 'Kamera' : 'Barcode'}
            </div>
          </div>
        </div>

        {/* Scanner Components - UNMOUNTED when drawer is open for max performance */}
        {!isDrawerOpen ? (
          <div
            className="flex-1 relative flex items-center justify-center"
            onClick={handleFocusTap}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="transition-transform duration-150"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
            >
              <ImageOCRScanner ref={ocrRef} onTextExtracted={onTextExtracted} flashMode={torchEnabled ? "on" : "auto"} />
              <BarcodeScanner ref={barcodeRef} onDetected={onBarcodeDetected} torchEnabled={torchEnabled} />
            </div>

            {focusPoint && (
              <div
                key={focusPoint.id}
                className="pointer-events-none absolute w-24 h-24 rounded-full border-2 border-white/70 animate-[ping_0.6s_ease-out]"
                style={{
                  left: focusPoint.x - 48,
                  top: focusPoint.y - 48,
                }}
                onAnimationEnd={() => setFocusPoint(null)}
              />
            )}

            {/* Viewfinder Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-64 h-64 border border-white/20 rounded-[32px] relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/80 rounded-tl-[24px]" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/80 rounded-tr-[24px]" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/80 rounded-bl-[24px]" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/80 rounded-br-[24px]" />

                {/* Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white/30">
                  <div className="absolute top-1/2 w-full h-[1px] bg-current" />
                  <div className="absolute left-1/2 h-full w-[1px] bg-current" />
                </div>
              </div>
              <p className="mt-8 text-sm font-medium text-white/60 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                {mode === 'ocr' ? 'Etikett im Rahmen platzieren' : 'Barcode scannen'}
              </p>
            </div>

            {/* Zoom Slider */}
            <div className="pointer-events-auto absolute right-4 bottom-4 flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-3 py-2 backdrop-blur-sm">
              <span className="text-[10px] uppercase font-bold text-white/60">Zoom</span>
              <Slider
                size="small"
                min={1}
                max={2.5}
                step={0.05}
                value={zoom}
                onChange={(_, value) => setZoom(clampZoom(value as number))}
                sx={{
                  width: 100,
                  color: "white",
                  "& .MuiSlider-thumb": { boxShadow: "0 0 0 4px rgba(255,255,255,0.15)" },
                }}
              />
            </div>

            {/* Tilt hint */}
            <AnimatePresence>
              {isTilted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 min-w-[220px]"
                >
                  <Alert
                    severity="info"
                    variant="filled"
                    sx={{
                      backgroundColor: "rgba(15,118,110,0.8)",
                      color: "white",
                      alignItems: "center",
                      ".MuiAlert-icon": { color: "white" },
                    }}
                  >
                    Halte das Gerät gerade für bessere OCR
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Barcode switch prompt */}
            <AnimatePresence>
              {showBarcodeSwitchPrompt && mode === "barcode" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="pointer-events-auto absolute left-1/2 -translate-x-1/2 bottom-6"
                >
                  <div className="bg-black/70 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm shadow-lg space-y-2">
                    <div className="text-xs text-white/80 font-medium">Kein Barcode erkannt?</div>
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => { setMode("ocr"); setShowBarcodeSwitchPrompt(false); }}
                        sx={{ color: "white", borderColor: "rgba(255,255,255,0.2)" }}
                      >
                        OCR nutzen
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => { setIsDrawerOpen(true); setMode("ocr"); setShowBarcodeSwitchPrompt(false); }}
                        sx={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", boxShadow: "none", "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" } }}
                      >
                        Manuell eingeben
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex-1 bg-slate-900 border-b border-white/5 flex items-center justify-center">
            <p className="text-white/20 text-sm font-medium">Kamera pausiert</p>
          </div>
        )}
      </div>

      {/* Bottom Controls Area */}
      <div className="h-44 bg-black flex flex-col items-center justify-end pb-safe-bottom relative">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-full py-2 flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors active:scale-95"
        >
          <ChevronUp className="w-5 h-5 animate-bounce" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Manuelle Eingabe</span>
        </button>

        {lastResult && (
          <div className="absolute left-6 bottom-16">
            <ButtonBase
              onClick={() => setShowResults(true)}
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="text-center text-[10px] leading-tight text-white/80 px-1">
                <div className="font-bold text-white line-clamp-1">{lastResult.productInfo?.brand ?? "Scan"}</div>
                <div className="text-white/70">{lastResult.score ? `${Math.round(lastResult.score)}` : "–"}</div>
              </div>
            </ButtonBase>
          </div>
        )}

        <div className="w-full flex items-center justify-around px-8 pb-8 pt-4">
          <button
            onClick={() => { setMode("barcode"); hapticLight(); }}
            className={clsx("p-3 rounded-full transition-all", mode === "barcode" ? "bg-white text-black" : "bg-white/10 text-white/50")}
          >
            <BarcodeIcon size={24} />
          </button>

          <ButtonBase
            onClick={handleShutterPress}
            sx={{
              position: "relative",
              width: 80,
              height: 80,
              borderRadius: "50%",
              borderWidth: 4,
              borderStyle: "solid",
              borderColor:
                stability === "good"
                  ? "rgba(16,185,129,0.9)"
                  : stability === "warning"
                  ? "rgba(251,191,36,0.9)"
                  : "rgba(248,113,113,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 120ms ease, border-color 200ms ease",
              "&:active": { transform: "scale(0.96)" },
              backgroundColor: "transparent",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "white",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 8,
                  borderRadius: "50%",
                  backgroundColor:
                    stability === "good"
                      ? "rgba(16,185,129,0.15)"
                      : stability === "warning"
                      ? "rgba(251,191,36,0.15)"
                      : "rgba(248,113,113,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor:
                    stability === "good"
                      ? "rgb(16,185,129)"
                      : stability === "warning"
                      ? "rgb(251,191,36)"
                      : "rgb(248,113,113)",
                  boxShadow:
                    stability === "good"
                      ? "0 0 12px rgba(16,185,129,0.6)"
                      : stability === "warning"
                      ? "0 0 12px rgba(251,191,36,0.6)"
                      : "0 0 12px rgba(248,113,113,0.6)",
                }}
              />
            </Box>
          </ButtonBase>

          <button
            onClick={() => { setMode("ocr"); hapticLight(); }}
            className={clsx("p-3 rounded-full transition-all", mode === "ocr" ? "bg-white text-black" : "bg-white/10 text-white/50")}
          >
            <TextIcon size={24} />
          </button>
        </div>
      </div>

      {/* Light-weight Custom Drawer using Animation (replaces MUI) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/60"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-white/10 rounded-t-[32px] h-[90vh] flex flex-col p-6 pb-safe-bottom shadow-2xl"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 shrink-0" />

              <div className="flex items-center justify-between mb-6 shrink-0">
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  Manuelle Eingabe
                </h2>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white/70" />
                </button>
              </div>

              <ManualScanForm
                initialBrand={pendingBrand}
                initialProduct={pendingProduct}
                initialBarcode={pendingBarcode}
                initialValues={pendingValues}
                loading={loading}
                onSubmit={handleManualSubmit}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Results Overlay */}
      <AnimatePresence>
        {showResults && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end md:items-center md:justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowResults(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-[32px] overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                <h3 className="font-bold text-white">Ergebnis</h3>
                <button onClick={() => setShowResults(false)} className="p-2 bg-slate-800 rounded-full"><X size={16} /></button>
              </div>
              <div className="p-4">
                <WaterScoreCard scanResult={result} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
