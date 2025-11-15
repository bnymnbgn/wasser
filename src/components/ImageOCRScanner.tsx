"use client";

import { useRef, useState, useEffect } from "react";
import { createWorker, type Worker } from "tesseract.js";

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

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

  /**
   * Preprocesses an image for better OCR quality:
   * - Converts to grayscale
   * - Increases contrast
   * - Optimizes resolution
   */
  async function preprocessImage(blob: Blob): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      img.onload = () => {
        // Optimize size for OCR (target ~2000px width for good balance)
        const targetWidth = 2000;
        const scale = Math.min(1, targetWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Apply image enhancements
        ctx.filter = "grayscale(100%) contrast(150%) brightness(110%)";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (processedBlob) => {
            resolve(processedBlob || blob);
          },
          "image/jpeg",
          0.95
        );
      };

      img.src = URL.createObjectURL(blob);
    });
  }

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
      let processedSource = imageSource;
      if (imageSource instanceof Blob || imageSource instanceof File) {
        processedSource = await preprocessImage(imageSource);
      }

      const { data } = await workerRef.current.recognize(processedSource);

      // Store confidence score
      setConfidence(data.confidence);

      if (data.text.trim()) {
        // Check confidence and warn user if low
        if (data.confidence < 60) {
          setError(
            `⚠️ Texterkennung unsicher (${Math.round(data.confidence)}% Genauigkeit). ` +
            `Bitte versuche ein klareres Foto oder gebe die Werte manuell ein.`
          );
          // Still pass the text for manual correction
          onTextExtracted(data.text, data.confidence);
        } else if (data.confidence < 80) {
          // Low confidence warning but usable
          onTextExtracted(data.text, data.confidence);
        } else {
          // Good confidence
          onTextExtracted(data.text, data.confidence);
        }
      } else {
        setError("Kein Text erkannt. Bitte versuche ein klareres Foto.");
      }
    } catch (err: any) {
      console.error("OCR Error:", err);
      setError(err?.message ?? "Fehler bei der Texterkennung");
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

  async function startCamera() {
    setError(null);
    try {
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
    } catch (err: any) {
      console.error("Camera Error:", err);
      // Improved error messages
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError(
          "📷 Kamerazugriff wurde verweigert. Bitte erlaube den Kamerazugriff in deinen Browser-Einstellungen."
        );
      } else if (err.name === "NotFoundError") {
        setError("📷 Keine Kamera gefunden. Bitte verwende den Upload-Button.");
      } else if (err.name === "NotReadableError") {
        setError(
          "📷 Kamera wird bereits verwendet. Bitte schließe andere Apps, die auf die Kamera zugreifen."
        );
      } else {
        setError(`Kamera-Fehler: ${err.message}`);
      }
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }

  async function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Canvas auf Video-Größe setzen
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Video-Frame auf Canvas zeichnen
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Canvas als Blob für OCR
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      stopCamera();

      await processImage(blob);
    }, "image/jpeg", 0.9);
  }

  return (
    <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/70 p-4">
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
        className={`overflow-hidden rounded-md border border-slate-700 mb-3 ${
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
      </div>

      {/* Canvas (hidden, nur für Capture) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Image Preview */}
      {previewUrl && !isCameraActive && (
        <div className="overflow-hidden rounded-md border border-slate-700 mb-3">
          <img
            src={previewUrl}
            alt="Preview"
            className="block w-full h-auto max-h-64 object-contain bg-slate-950"
          />
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <div className="rounded-md bg-slate-800/60 px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-300">Texterkennung läuft...</span>
            <span className="text-xs font-mono text-slate-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
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
    </div>
  );
}
