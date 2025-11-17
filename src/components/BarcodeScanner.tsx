"use client";

import { useState } from "react";
import { Capacitor } from "@capacitor/core";

interface BarcodeScannerProps {
  onDetected: (value: string) => void;
}

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const isCapacitor = Capacitor.isNativePlatform();

  async function startNativeScan() {
    try {
      setError(null);
      setScanning(true);

      // Import the native barcode scanner plugin
      const { BarcodeScanner } = await import("@capacitor-community/barcode-scanner");

      // Check permission
      const status = await BarcodeScanner.checkPermission({ force: true });

      if (!status.granted) {
        setError("Kamera-Berechtigung wurde verweigert");
        setScanning(false);
        return;
      }

      // Prepare for scanning (makes webview transparent)
      await BarcodeScanner.prepare();

      // Hide app UI elements
      document.body.classList.add("barcode-scanner-active");

      // Start scanning
      const result = await BarcodeScanner.startScan();

      // Clean up
      document.body.classList.remove("barcode-scanner-active");
      setScanning(false);

      if (result.hasContent) {
        onDetected(result.content || "");
      }
    } catch (err) {
      console.error("Native barcode scan error:", err);
      setError(err instanceof Error ? err.message : "Fehler beim Scannen");
      setScanning(false);
      document.body.classList.remove("barcode-scanner-active");
    }
  }

  async function stopNativeScan() {
    try {
      const { BarcodeScanner } = await import("@capacitor-community/barcode-scanner");
      await BarcodeScanner.stopScan();
      document.body.classList.remove("barcode-scanner-active");
      setScanning(false);
    } catch (err) {
      console.error("Error stopping scan:", err);
    }
  }

  // Native scanner for Capacitor
  if (isCapacitor) {
    return (
      <>
        <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/70 p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <div className="text-xs font-medium text-slate-200">
                Barcode-Scanner
              </div>
              <div className="text-[11px] text-slate-400">
                Kamera verwenden um Barcode zu scannen
              </div>
            </div>

            <button
              type="button"
              onClick={scanning ? stopNativeScan : startNativeScan}
              className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ${
                scanning
                  ? "bg-rose-500 text-black hover:bg-rose-400"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {scanning ? "Abbrechen" : "Kamera öffnen"}
            </button>
          </div>

          {error && (
            <div className="mb-2 rounded-md bg-rose-500/15 px-2 py-1 text-[11px] text-rose-200">
              {error}
            </div>
          )}

          {scanning && (
            <div className="mt-2 text-[11px] text-emerald-300 animate-pulse">
              Scanner aktiv - Richte die Kamera auf den Barcode...
            </div>
          )}
        </div>

        {/* Global CSS for barcode scanner - hides app UI during scan */}
        <style jsx global>{`
          body.barcode-scanner-active {
            background: transparent !important;
          }
          body.barcode-scanner-active > div {
            display: none;
          }
        `}</style>
      </>
    );
  }

  // Web fallback - show message that camera scanner is not available
  return (
    <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/70 p-3">
      <div className="text-xs font-medium text-slate-200 mb-1">
        Barcode-Scanner
      </div>
      <div className="text-[11px] text-slate-400">
        Barcode-Scanner ist nur in der mobilen App verfügbar. Im Browser kannst du den Barcode manuell eingeben.
      </div>
    </div>
  );
}
