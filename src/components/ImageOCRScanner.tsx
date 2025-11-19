"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { createWorker, type Worker } from "tesseract.js";
import { Capacitor } from "@capacitor/core";
import type { WaterAnalysisValues } from "@/src/domain/types";
import { parseTextToAnalysis } from "@/src/lib/ocrParsing";
import { scanImageNative } from "@/src/lib/ocrService";
import { captureEnhancedFrame, enhanceImageBlob } from "@/src/lib/imageProcessing";
import { ScanValidationModal } from "@/src/components/ScanValidationModal";
import { BottleLoader } from "@/src/components/ui/BottleLoader";

interface ImageOCRScannerProps {
  onTextExtracted: (text: string, confidence?: number) => void;
}

export function ImageOCRScanner({ onTextExtracted }: ImageOCRScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [pendingValues, setPendingValues] = useState<Partial<WaterAnalysisValues> | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const isNativeApp = Capacitor.isNativePlatform();

  // Cache the Tesseract worker for reuse
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker once on mount
  useEffect(() => {
    const initWorker = async () => {
      try {
        setIsInitializing(true);
        const worker = await createWorker("deu+eng", 1, {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setProgress(Math.round(m.progress * 100));
            }
          },
        });
        workerRef.current = worker;
        setIsInitializing(false);
      } catch (err) {
        console.error("Failed to initialize OCR worker:", err);
        setError("OCR-Engine konnte nicht geladen werden. Bitte Seite neu laden.");
        setIsInitializing(false);
      }
    };

    initWorker();

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  async function processImage(imageSource: string | File | Blob) {
    if (!workerRef.current) {
      setError("OCR-Engine wird noch initialisiert. Bitte kurz warten...");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setConfidence(null);

    try {
      // Preprocess image if it's a Blob/File
      let processedSource: string | Blob = imageSource;
      if (typeof Blob !== "undefined" && imageSource instanceof Blob) {
        processedSource = await enhanceImageBlob(imageSource);
      }

      const { data } = await workerRef.current.recognize(processedSource);

      // Store confidence score
      setConfidence(data.confidence);

      const sanitizedText = data.text.trim();
      if (sanitizedText) {
        const parsedValues = parseTextToAnalysis(sanitizedText);
        setPendingValues(parsedValues);
        setShowValidation(true);
      } else {
        setError("Kein Text erkannt. Bitte versuche ein klareres Foto.");
      }
    } catch (err: unknown) {
      console.error("OCR Error:", err);
      const message = err instanceof Error ? err.message : "Fehler bei der Texterkennung";
      setError(message);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview erstellen
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // OCR durchführen
    await processImage(file);
  }

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [stopCamera]);

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

  const cameraPermissionRef = useRef(false);

  async function ensureCameraPermission() {
    if (cameraPermissionRef.current) return;
    cameraPermissionRef.current = true;

    if (isNativeApp) {
      try {
        const { Camera } = await import("@capacitor/camera");
        await Camera.requestPermissions({ permissions: ["camera"] });
        return;
      } catch (err) {
        console.warn("Capacitor camera permission request failed, falling back to web API", err);
      }
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((track) => track.stop());
  }

  async function captureNativePhoto() {
    try {
      const { Camera, CameraResultType, CameraDirection } = await import("@capacitor/camera");
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        direction: CameraDirection.Rear,
        quality: 90,
        saveToGallery: false,
      });

      const photoUrl = photo.webPath ?? (photo.path ? Capacitor.convertFileSrc(photo.path) : null);
      if (!photoUrl) {
        throw new Error("Konnte kein Foto aus der Kamera laden.");
      }

      // Create preview
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);

      setIsProcessing(true);
      setProgress(0);
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
        setProgress(0);
      }
    } catch (cameraError: unknown) {
      const errorMessage = cameraError instanceof Error ? cameraError.message : String(cameraError);
      if (errorMessage.toLowerCase().includes("permission")) {
        setError("📷 Kamerazugriff wurde verweigert. Bitte erlaube den Zugriff in den Systemeinstellungen.");
      } else if (errorMessage.includes("No activity")) {
        setError("📷 Kamera-App nicht gefunden. Bitte installiere eine Kamera-App oder nutze den Upload.");
      } else if (errorMessage === "User cancelled photos app") {
        // Benutzer hat Dialog geschlossen -> kein Fehler anzeigen.
        return;
      } else {
        setError(`Kamera-Fehler: ${errorMessage}`);
      }
    }
  }

  async function startCamera() {
    setError(null);
    if (isNativeApp) {
      await captureNativePhoto();
      return;
    }

    try {
      await ensureCameraPermission();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Rückkamera bevorzugen
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Unable to start video preview automatically.", playErr);
        }
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err: unknown) {
      console.error("Camera Error:", err);
      // Improved error messages
      if (err instanceof Error) {
        const errorName = (err as DOMException).name;
        if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
          setError(
            "📷 Kamerazugriff wurde verweigert. Bitte erlaube den Kamerazugriff in deinen Browser-Einstellungen."
          );
        } else if (errorName === "NotFoundError") {
          setError("📷 Keine Kamera gefunden. Bitte verwende den Upload-Button.");
        } else if (errorName === "NotReadableError") {
          setError(
            "📷 Kamera wird bereits verwendet. Bitte schließe andere Apps, die auf die Kamera zugreifen."
          );
        } else {
          setError(`Kamera-Fehler: ${err.message}`);
        }
      } else if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setError("📷 Live-Vorschau wird von dieser Plattform nicht unterstützt. Bitte nutze den Foto-Upload.");
      } else {
        setError("Kamera-Fehler: Unbekannter Fehler");
      }
    }
  }

  async function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const blob = await captureEnhancedFrame(videoRef.current, canvasRef.current);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      stopCamera();

      await processImage(blob);
    } catch (frameError) {
      console.error("Frame capture failed:", frameError);
      setError("Foto konnte nicht verarbeitet werden. Bitte erneut versuchen.");
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/70 p-4 relative overflow-hidden">
      {isProcessing && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm pointer-events-none">
          <BottleLoader />
        </div>
      )}
      <div className="mb-3">
        <h3 className="text-sm font-medium text-slate-200 mb-1">
          Etikett fotografieren oder hochladen
        </h3>
        <p className="text-[11px] text-slate-400">
          Die App erkennt automatisch die Inhaltsstoffe vom Etikett.
        </p>
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-rose-500/15 px-3 py-2 text-xs text-rose-200">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isInitializing && (
        <div className="mb-3 rounded-md bg-blue-500/15 px-3 py-2 text-xs text-blue-200">
          ⏳ OCR-Engine wird geladen...
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing || isCameraActive || isInitializing}
          className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-xs font-medium text-slate-50 hover:bg-slate-700 disabled:opacity-50"
        >
          📁 Foto hochladen
        </button>

        {!isCameraActive ? (
          <button
            type="button"
            onClick={startCamera}
            disabled={isProcessing || isInitializing}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-xs font-medium text-slate-50 hover:bg-slate-700 disabled:opacity-50"
          >
            📷 Kamera öffnen
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={capturePhoto}
              disabled={isProcessing || isInitializing}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-xs font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
            >
              📸 Foto aufnehmen
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-xs font-medium text-black hover:bg-rose-400"
            >
              ✕ Abbrechen
            </button>
          </>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera Preview */}
      <div
        className={`relative overflow-hidden rounded-md border border-slate-700 mb-3 ${
          isCameraActive ? "" : "hidden"
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="block w-full h-64 object-cover bg-black"
        />
        {isCameraActive && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none text-white">
            <div className="w-full flex-1 bg-black/60 backdrop-blur-sm" />
            <div className="flex w-full">
              <div className="flex-1 bg-black/60 backdrop-blur-sm" />
              <div className="relative w-[85%] aspect-[3/4] border-2 border-white/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1" />
                <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-300 shadow-[0_0_15px_rgba(16,185,129,1)] animate-scan-down opacity-90" />
                <div className="absolute bottom-4 left-0 w-full text-center">
                  <span className="bg-black/50 text-white text-xs px-2 py-1 rounded font-medium tracking-wide">
                    Werte hier platzieren
                  </span>
                </div>
              </div>
              <div className="flex-1 bg-black/60 backdrop-blur-sm" />
            </div>
            <div className="w-full flex-1 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-8 text-[11px] font-medium tracking-wide">
              Halte die Kamera ruhig &amp; parallel
            </div>
          </div>
        )}
      </div>

      {/* Canvas (hidden, nur für Capture) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Image Preview */}
      {previewUrl && !isCameraActive && (
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

      {/* Progress */}
      {isProcessing && (
        <div className="rounded-md bg-slate-800/80 px-3 py-3 space-y-2 relative overflow-hidden mt-3">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-1 rounded-2xl border border-emerald-400/40 animate-slow-pulse" />
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-emerald-200 relative z-10">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Texterkennung läuft …
            </span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden relative z-10">
            <div
              className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 h-1.5 animate-progress-bar"
              style={{ width: `${Math.max(progress, 10)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-300 relative z-10">
            Halte das Foto ruhig – die OCR analysiert Zeile für Zeile.
          </div>
              <style jsx>{`
            @keyframes progress-bar {
              0% {
                opacity: 0.6;
              }
              50% {
                opacity: 1;
              }
              100% {
                opacity: 0.6;
              }
            }
            .animate-progress-bar {
              animation: progress-bar 1.2s ease-in-out infinite;
            }
            @keyframes slow-pulse {
              0% {
                opacity: 0.2;
              }
              50% {
                opacity: 0.6;
              }
              100% {
                opacity: 0.2;
              }
            }
            .animate-slow-pulse {
              animation: slow-pulse 2s ease-in-out infinite;
            }
          `}</style>
        </div>
      )}

      {/* Confidence Score Display */}
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
          onConfirm={(values) => {
            setShowValidation(false);
            setPendingValues(null);
            onTextExtracted(
              Object.entries(values)
                .map(([key, val]) => `${key}: ${val}`)
                .join("\n"),
              confidence ?? undefined
            );
          }}
        />
      )}
    </div>
  );
}
