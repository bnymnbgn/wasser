"use client";

import { useRef, useState } from "react";
import { createWorker } from "tesseract.js";

interface ImageOCRScannerProps {
  onTextExtracted: (text: string) => void;
}

export function ImageOCRScanner({ onTextExtracted }: ImageOCRScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  async function processImage(imageSource: string | File | Blob) {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const worker = await createWorker("deu+eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data } = await worker.recognize(imageSource);
      await worker.terminate();

      if (data.text.trim()) {
        onTextExtracted(data.text);
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
      setError(err?.message ?? "Kamera konnte nicht gestartet werden");
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

      {/* Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing || isCameraActive}
          className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-xs font-medium text-slate-50 hover:bg-slate-700 disabled:opacity-50"
        >
          📁 Foto hochladen
        </button>

        {!isCameraActive ? (
          <button
            type="button"
            onClick={startCamera}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-xs font-medium text-slate-50 hover:bg-slate-700 disabled:opacity-50"
          >
            📷 Kamera öffnen
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={capturePhoto}
              disabled={isProcessing}
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
      {isCameraActive && (
        <div className="overflow-hidden rounded-md border border-slate-700 mb-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="block w-full h-64 object-cover bg-black"
          />
        </div>
      )}

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
    </div>
  );
}
