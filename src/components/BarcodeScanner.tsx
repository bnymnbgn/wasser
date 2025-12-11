"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Capacitor } from "@capacitor/core";

export interface BarcodeScannerHandle {
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
}

interface BarcodeScannerProps {
  onDetected: (value: string) => void;
  torchEnabled?: boolean;
}

export const BarcodeScanner = forwardRef<BarcodeScannerHandle, BarcodeScannerProps>(
  ({ onDetected, torchEnabled = false }, ref) => {
    const [error, setError] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [moduleState, setModuleState] = useState<"idle" | "preparing" | "ready" | "error">("idle");
    const isCapacitor = Capacitor.isNativePlatform();
    const googleModuleReadyRef = useRef(false);
    const moduleInstallPromiseRef = useRef<Promise<void> | null>(null);

    useImperativeHandle(ref, () => ({
      startScan: startNativeScan,
      stopScan: async () => { /* No-op for Google Scanner as it's a modal */ }
    }));

    async function ensureGoogleBarcodeScannerModule(
      BarcodeScanner: any,
      GoogleBarcodeScannerModuleInstallState: any
    ) {
      if (googleModuleReadyRef.current) {
        setModuleState("ready");
        return;
      }

      if (Capacitor.getPlatform() !== "android") {
        googleModuleReadyRef.current = true;
        setModuleState("ready");
        return;
      }

      if (typeof BarcodeScanner.isGoogleBarcodeScannerModuleAvailable !== "function") {
        googleModuleReadyRef.current = true;
        setModuleState("ready");
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
        setModuleState("ready");
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
                  setModuleState("ready");
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

      setModuleState("preparing");
      await moduleInstallPromiseRef.current.catch(() => {
        setModuleState("error");
      });

      const availableAfterInstall = await checkAvailability();
      googleModuleReadyRef.current = availableAfterInstall;

      if (!availableAfterInstall) {
        setModuleState("error");
        throw new Error("Google Barcode Scanner Modul konnte nicht installiert werden.");
      }

      setModuleState("ready");
    }

    // Preload the Google barcode module early to avoid first-scan wait
    useEffect(() => {
      if (!isCapacitor) return;
      let cancelled = false;
      const preload = async () => {
        try {
          setModuleState((prev) => (prev === "ready" ? prev : "preparing"));
          const { BarcodeScanner, GoogleBarcodeScannerModuleInstallState } = await import(
            "@capacitor-mlkit/barcode-scanning"
          );
          if (!cancelled) {
            await ensureGoogleBarcodeScannerModule(BarcodeScanner, GoogleBarcodeScannerModuleInstallState);
          }
        } catch (err) {
          console.warn("Preloading Google Barcode module failed", err);
          if (!cancelled) setModuleState("error");
        }
      };
      preload();
      return () => {
        cancelled = true;
      };
    }, [isCapacitor]);

    async function startNativeScan() {
      try {
        setError(null);
        setScanning(true);
        if (moduleState !== "ready") {
          setModuleState("preparing");
        }

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
        // Try to toggle torch if plugin supports it
        try {
          if (torchEnabled && typeof (BarcodeScanner as any).enableTorch === "function") {
            await (BarcodeScanner as any).enableTorch(true);
          } else if (!torchEnabled && typeof (BarcodeScanner as any).disableTorch === "function") {
            await (BarcodeScanner as any).disableTorch();
          }
        } catch (torchErr) {
          console.warn("Torch toggle not available:", torchErr);
        }

        const result = await BarcodeScanner.scan();

        if (result.barcodes && result.barcodes.length > 0) {
          const barcode = result.barcodes[0];
          onDetected(barcode?.rawValue || "");
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
        <div className="hidden">
          {/* Logic only component now, handled by parent shutter button */}
        </div>
      );
    }

    // Web fallback - show message that camera scanner is not available
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <span className="text-2xl">📱</span>
        </div>
        <h3 className="text-sm font-medium text-slate-200 mb-2">Web Scanner</h3>
        <p className="text-xs text-slate-400 max-w-[200px]">
          Barcode-Scanner ist nur auf dem Gerät verfügbar.
        </p>
      </div>
    );
  }
);

BarcodeScanner.displayName = "BarcodeScanner";
