"use client";

import { useEffect, useRef, useState } from "react";
import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from "@zxing/browser";
import { Capacitor } from "@capacitor/core";

interface BarcodeScannerProps {
  onDetected: (value: string) => void;
}

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onDetectedRef = useRef(onDetected);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const permissionRequestedRef = useRef(false);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (!active) return;
    if (typeof window === "undefined") return;
    if (!videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();
    let controlsRef: IScannerControls | null = null;
    let canceled = false;

    async function ensureCameraPermission() {
      if (permissionRequestedRef.current) return;
      permissionRequestedRef.current = true;

      // Capacitor native build: ensure permission via Capacitor bridge
      if (Capacitor.isNativePlatform()) {
        try {
          const { Camera } = await import("@capacitor/camera");
          await Camera.requestPermissions({ permissions: ["camera"] });
          return;
        } catch (err) {
          // Fallback to web prompt if Camera plugin isn't available
          console.warn("Capacitor camera permission request failed, falling back to web API", err);
        }
      }

      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
    }

    async function start() {
      try {
        setError(null);
        setScanning(true);
        await ensureCameraPermission();
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();

        // Bevorzuge Rückkamera (environment) wenn verfügbar
        const backCamera = devices.find(d =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        );
        const deviceId = backCamera?.deviceId ?? devices[0]?.deviceId;

        controlsRef = await codeReader.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          (result, err, controls) => {
            if (canceled) return;

            if (result) {
              const text = result.getText();
              setLastCode(text);
              setScanning(false);
              onDetectedRef.current?.(text);
              // nach erfolgreichem Scan stoppen
              controls.stop();
              setActive(false);
            }
          }
        );
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Kamera konnte nicht gestartet werden.");
        setScanning(false);
        setActive(false);
      }
    }

    start();

    return () => {
      canceled = true;
      controlsRef?.stop();
    };
  }, [active]);

  return (
    <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/70 p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <div className="text-xs font-medium text-slate-200">
            Webcam-Scanner
          </div>
          <div className="text-[11px] text-slate-400">
            Richte das Etikett mit Barcode in den Rahmen.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ${
            active
              ? "bg-rose-500 text-black hover:bg-rose-400"
              : "bg-slate-800 text-slate-50 hover:bg-slate-700"
          }`}
        >
          {active ? "Kamera stoppen" : "Kamera starten"}
        </button>
      </div>

      {error && (
        <div className="mb-2 rounded-md bg-rose-500/15 px-2 py-1 text-[11px] text-rose-200">
          {error}
        </div>
      )}

      {active && (
        <div className="relative overflow-hidden rounded-md border border-slate-700">
          <video
            ref={videoRef}
            className="block h-52 w-full object-cover"
            muted
            autoPlay
            playsInline
          />
          {scanning && (
            <>
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] pointer-events-none" />
              <div className="absolute inset-4 rounded-3xl border-2 border-emerald-400/70 animate-pulse pointer-events-none" />
              <div className="absolute inset-x-6 top-4 flex items-center justify-between text-[11px] font-semibold text-emerald-100 drop-shadow-sm pointer-events-none">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                  Suche Barcode…
                </span>
                <span className="text-emerald-200/80 font-normal">Gerät ruhig halten</span>
              </div>
              <div className="absolute inset-x-6 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent animate-scan-line pointer-events-none" />
              <style jsx>{`
                @keyframes scan-line {
                  0% {
                    transform: translateY(-50px);
                  }
                  50% {
                    transform: translateY(50px);
                  }
                  100% {
                    transform: translateY(-50px);
                  }
                }
                .animate-scan-line {
                  animation: scan-line 1.5s ease-in-out infinite;
                }
              `}</style>
            </>
          )}
        </div>
      )}

      {lastCode && (
        <div className="mt-2 text-[11px] text-slate-300">
          Letzter Scan:{" "}
          <span className="font-mono text-emerald-300">{lastCode}</span>
        </div>
      )}
    </div>
  );
}
