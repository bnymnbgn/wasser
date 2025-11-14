"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerProps {
  onDetected: (value: string) => void;
}

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCode, setLastCode] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    if (typeof window === "undefined") return;
    if (!videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();
    let canceled = false;

    async function start() {
      try {
        setError(null);
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const deviceId = devices[0]?.deviceId;

        await codeReader.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          (result, err, controls) => {
            if (canceled) return;

            if (result) {
              const text = result.getText();
              setLastCode(text);
              onDetected(text);
              // nach erfolgreichem Scan stoppen
              controls.stop();
              setActive(false);
            }
          }
        );
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Kamera konnte nicht gestartet werden.");
        setActive(false);
      }
    }

    start();

    return () => {
      canceled = true;
      codeReader.reset();
    };
  }, [active, onDetected]);

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
        <div className="overflow-hidden rounded-md border border-slate-700">
          <video
            ref={videoRef}
            className="block h-52 w-full object-cover"
            muted
            autoPlay
            playsInline
          />
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