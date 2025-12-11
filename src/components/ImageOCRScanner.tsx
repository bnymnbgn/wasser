"use client";

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Capacitor } from "@capacitor/core";
import type { WaterAnalysisValues } from "@/src/domain/types";
import { parseTextToAnalysis } from "@/src/lib/ocrParsing";
import { scanImageNative } from "@/src/lib/ocrService";
import { ScanValidationModal } from "@/src/components/ScanValidationModal";
import { BottleLoader } from "@/src/components/ui/BottleLoader";

export interface ImageOCRScannerHandle {
  capture: () => Promise<void>;
}

interface ImageOCRScannerProps {
  onTextExtracted: (
    text: string,
    confidence?: number,
    info?: { brand?: string; productName?: string }
  ) => void;
  flashMode?: "auto" | "on" | "off";
}

export const ImageOCRScanner = forwardRef<ImageOCRScannerHandle, ImageOCRScannerProps>(
  ({ onTextExtracted, flashMode = "auto" }, ref) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [confidence, setConfidence] = useState<number | null>(null);
    const [pendingValues, setPendingValues] = useState<Partial<WaterAnalysisValues> | null>(null);
    const [showValidation, setShowValidation] = useState(false);
    const previewUrlRef = useRef<string | null>(null);
    const isNativeApp = Capacitor.isNativePlatform();

    useEffect(() => {
      return () => {
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
      };
    }, []);

    useEffect(() => {
      if (previewUrl) {
        if (previewUrlRef.current && previewUrlRef.current !== previewUrl) {
          URL.revokeObjectURL(previewUrlRef.current);
        }
        previewUrlRef.current = previewUrl;
        return () => {
          if (previewUrlRef.current === previewUrl) {
            URL.revokeObjectURL(previewUrl);
            previewUrlRef.current = null;
          }
        };
      }
    }, [previewUrl]);

    useImperativeHandle(ref, () => ({
      capture: captureNativePhoto
    }));

    // Native-only: use ML Kit via scanImageNative
    async function handleNativeScan(photoUrl: string) {
      setIsProcessing(true);
      setError(null);
      setConfidence(null);
      try {
        const scanResult = await scanImageNative(photoUrl);
        const normalizedText = scanResult.text.trim();
        setConfidence(normalizedText ? 92 : 0);
        if (normalizedText) {
          const parsedValues = parseTextToAnalysis(normalizedText);
          setPendingValues(parsedValues);
          setShowValidation(true);
        } else {
          setError("Kein Text erkannt. Bitte versuche ein klareres Foto.");
        }
      } catch (ocrError: unknown) {
        console.error("Native OCR Error:", ocrError);
        const message = ocrError instanceof Error ? ocrError.message : "Fehler bei der Texterkennung";
        setError(message);
      } finally {
        setIsProcessing(false);
      }
    }

    async function captureNativePhoto() {
      setError(null);
      setIsInitializing(true);
      try {
        const { Camera, CameraResultType, CameraDirection } = await import("@capacitor/camera");
        const photo = await Camera.getPhoto({
          resultType: CameraResultType.Uri,
          direction: CameraDirection.Rear,
          quality: 90,
          saveToGallery: false,
          // Some platforms support flash in getPhoto, others ignore it; keep optional
          ...(flashMode ? { flash: flashMode as any } : {}),
        });

        const convert = (Capacitor as any).convertFileSrc as ((path: string) => string) | undefined;
        const photoUrl =
          photo.webPath ?? (photo.path ? (convert ? convert(photo.path) : photo.path) : null);
        if (!photoUrl) {
          throw new Error("Konnte kein Foto aus der Kamera laden.");
        }

        // Preview
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);

        await handleNativeScan(photoUrl);
      } catch (cameraError: unknown) {
        const errorMessage = cameraError instanceof Error ? cameraError.message : String(cameraError);
        if (errorMessage.toLowerCase().includes("permission")) {
          setError("📷 Kamerazugriff wurde verweigert. Bitte erlaube den Zugriff in den Systemeinstellungen.");
        } else if (errorMessage.includes("No activity")) {
          setError("📷 Kamera-App nicht gefunden. Bitte installiere eine Kamera-App.");
        } else if (errorMessage === "User cancelled photos app") {
          return;
        } else {
          setError(`Kamera-Fehler: ${errorMessage}`);
        }
      } finally {
        setIsInitializing(false);
      }
    }

    if (!isNativeApp) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 rounded-3xl border border-white/5 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <span className="text-2xl">📸</span>
          </div>
          <h3 className="text-sm font-medium text-slate-200 mb-2">Web Vorschau</h3>
          <p className="text-xs text-slate-400 max-w-[200px]">
            Die OCR-Kamera funktioniert nur auf deinem Smartphone.
          </p>
        </div>
      );
    }

    // Native view remains minimal/hidden as controls are external
    return (
      <div className="relative">
        {isProcessing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl">
            <BottleLoader />
            <p className="mt-4 text-xs font-medium text-white/80 animate-pulse">Analysiere...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs text-rose-200">
            {error}
          </div>
        )}

        {previewUrl && (
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl mb-4 aspect-[3/4] bg-black">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
              </div>
            )}

            {confidence !== null && !isProcessing && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border ${confidence >= 80 ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-200" : "bg-amber-500/20 border-amber-500/30 text-amber-200"
                  }`}>
                  {confidence >= 80 ? "✓" : "⚠️"} Qualität: {Math.round(confidence)}%
                </div>
              </div>
            )}
          </div>
        )}

        {showValidation && pendingValues && (
          <ScanValidationModal
            initialValues={pendingValues}
            onCancel={() => {
              setShowValidation(false);
              setPendingValues(null);
              setPreviewUrl(null);
            }}
            onConfirm={(values, info) => {
              setShowValidation(false);
              setPendingValues(null);
              onTextExtracted(
                Object.entries(values)
                  .map(([key, val]) => `${key}: ${val}`)
                  .join("\n"),
                confidence ?? undefined,
                info
              );
            }}
          />
        )}
      </div>
    );
  }
);

ImageOCRScanner.displayName = "ImageOCRScanner";
