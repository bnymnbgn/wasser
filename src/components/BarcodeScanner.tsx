"use client";

import { useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";

interface BarcodeScannerProps {
  onDetected: (value: string) => void;
}

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const isCapacitor = Capacitor.isNativePlatform();
  const googleModuleReadyRef = useRef(false);
  const moduleInstallPromiseRef = useRef<Promise<void> | null>(null);

  async function ensureGoogleBarcodeScannerModule(
    BarcodeScanner: any,
    GoogleBarcodeScannerModuleInstallState: any
  ) {
    if (googleModuleReadyRef.current) {
      return;
    }

    if (Capacitor.getPlatform() !== "android") {
      googleModuleReadyRef.current = true;
      return;
    }

    if (typeof BarcodeScanner.isGoogleBarcodeScannerModuleAvailable !== "function") {
      googleModuleReadyRef.current = true;
      return;
    }

    const checkAvailability = async () => {
      try {
        const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
        return available as boolean;
      } catch (availabilityErr) {
        console.warn("Konnte Google Barcode Modul nicht prüfen:", availabilityErr);
        return false;
      }
    };

    const alreadyAvailable = await checkAvailability();
    if (alreadyAvailable) {
      googleModuleReadyRef.current = true;
      return;
    }

    if (!moduleInstallPromiseRef.current) {
      moduleInstallPromiseRef.current = new Promise<void>(async (resolve, reject) => {
        let listenerHandle: { remove: () => Promise<void> } | null = null;

        const cleanup = async () => {
          if (listenerHandle) {
            await listenerHandle.remove();
            listenerHandle = null;
          }
        };

        try {
          listenerHandle = await BarcodeScanner.addListener(
            "googleBarcodeScannerModuleInstallProgress",
            (event: { state: number }) => {
              if (event.state === GoogleBarcodeScannerModuleInstallState.COMPLETED) {
                cleanup().then(resolve);
              } else if (
                event.state === GoogleBarcodeScannerModuleInstallState.FAILED ||
                event.state === GoogleBarcodeScannerModuleInstallState.CANCELED
              ) {
                cleanup().then(() =>
                  reject(
                    new Error(
                      event.state === GoogleBarcodeScannerModuleInstallState.CANCELED
                        ? "Installation des Barcode-Moduls wurde abgebrochen."
                        : "Installation des Barcode-Moduls fehlgeschlagen."
                    )
                  )
                );
              }
            }
          );
        } catch (listenerError) {
          await cleanup();
          reject(listenerError);
          return;
        }

        try {
          await BarcodeScanner.installGoogleBarcodeScannerModule();
        } catch (installError: any) {
          await cleanup();
          if (
            typeof installError?.message === "string" &&
            installError.message.includes("already installed")
          ) {
            resolve();
            return;
          }
          reject(installError);
          return;
        }
      }).finally(() => {
        moduleInstallPromiseRef.current = null;
      });
    }

    await moduleInstallPromiseRef.current;

    const availableAfterInstall = await checkAvailability();
    googleModuleReadyRef.current = availableAfterInstall;

    if (!availableAfterInstall) {
      throw new Error("Google Barcode Scanner Modul konnte nicht installiert werden.");
    }
  }

  async function startNativeScan() {
    try {
      setError(null);
      setScanning(true);

      // Import the ML Kit barcode scanner plugin
      const { BarcodeScanner, GoogleBarcodeScannerModuleInstallState } = await import(
        "@capacitor-mlkit/barcode-scanning"
      );

      await ensureGoogleBarcodeScannerModule(BarcodeScanner, GoogleBarcodeScannerModuleInstallState);

      // Request camera permissions
      const { camera } = await BarcodeScanner.requestPermissions();

      if (camera !== 'granted') {
        setError("Kamera-Berechtigung wurde verweigert");
        return;
      }

      // Scan for barcodes
      const result = await BarcodeScanner.scan();

      if (result.barcodes && result.barcodes.length > 0) {
        const barcode = result.barcodes[0];
        onDetected(barcode.rawValue || "");
      } else {
        setError("Kein Barcode erkannt. Bitte versuche es erneut.");
      }
    } catch (err) {
      console.error("Native barcode scan error:", err);
      setError(err instanceof Error ? err.message : "Fehler beim Scannen");
    } finally {
      setScanning(false);
    }
  }

  // Native scanner for Capacitor
  if (isCapacitor) {
    return (
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
            onClick={startNativeScan}
            disabled={scanning}
            className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ${
              scanning
                ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {scanning ? "Scannt..." : "Kamera öffnen"}
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
