"use client";

import { useRef, useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import type { WaterAnalysisValues } from "@/src/domain/types";
import { parseTextToAnalysis } from "@/src/lib/ocrParsing";
import { scanImageNative } from "@/src/lib/ocrService";
import { ScanValidationModal } from "@/src/components/ScanValidationModal";
import { BottleLoader } from "@/src/components/ui/BottleLoader";

interface ImageOCRScannerProps {
  onTextExtracted: (
    text: string,
    confidence?: number,
    info?: { brand?: string; productName?: string }
  ) => void;
}

export function ImageOCRScanner({ onTextExtracted }: ImageOCRScannerProps) {
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
      <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/70 p-4">
        <h3 className="text-sm font-medium text-slate-200 mb-1">Etikett scannen</h3>
        <p className="text-[11px] text-slate-400">
          OCR ist nur in der mobilen App verfügbar. Bitte teste auf dem Gerät.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/70 p-4 relative overflow-hidden">
      {isProcessing && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm pointer-events-none">
          <BottleLoader />
        </div>
      )}

      <div className="mb-3">
        <h3 className="text-sm font-medium text-slate-200 mb-1">Etikett fotografieren</h3>
        <p className="text-[11px] text-slate-400">
          Die App erkennt automatisch die Inhaltsstoffe vom Etikett (ML Kit).
        </p>
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-rose-500/15 px-3 py-2 text-xs text-rose-200">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={captureNativePhoto}
          disabled={isProcessing || isInitializing}
          className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-xs font-medium text-slate-50 hover:bg-slate-700 disabled:opacity-50"
        >
          📷 Kamera öffnen
        </button>
      </div>

      {previewUrl && (
        <div className="relative overflow-hidden rounded-md border border-slate-700 mb-3">
          <img
            src={previewUrl}
            alt="Preview"
            className="block w-full h-auto max-h-64 object-contain bg-slate-950"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 pointer-events-none">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                OCR liest dein Etikett …
              </div>
              <div className="w-32 h-32 border border-emerald-300/60 rounded-[28px] animate-pulse flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-[11px] text-emerald-100/90">Bitte warte einen Moment.</p>
            </div>
          )}
        </div>
      )}

      {confidence !== null && !isProcessing && (
        <div
          className={`rounded-md px-3 py-2 text-xs ${
            confidence >= 80
              ? "bg-emerald-500/15 text-emerald-200"
              : confidence >= 60
              ? "bg-amber-500/15 text-amber-200"
              : "bg-rose-500/15 text-rose-200"
          }`}
        >
          {confidence >= 80 ? "✓" : "⚠️"} OCR-Qualität: {Math.round(confidence)}%
          {confidence < 80 && " – Bitte Werte überprüfen"}
        </div>
      )}

      {showValidation && pendingValues && (
        <ScanValidationModal
          initialValues={pendingValues}
          onCancel={() => {
            setShowValidation(false);
            setPendingValues(null);
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
