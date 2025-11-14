"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";

import type { ProfileType, ScanResult } from "@/src/domain/types";
import { WaterScoreCard } from "@/src/components/WaterScoreCard";
import { BarcodeScanner } from "@/src/components/BarcodeScanner";
import { ImageOCRScanner } from "@/src/components/ImageOCRScanner";

type Mode = "ocr" | "barcode";

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
          <div className="text-sm text-slate-300">Scanner wird geladen…</div>
        </main>
      }
    >
      <ScanPageContent />
    </Suspense>
  );
}

function ScanPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const defaultProfile = (params.get("profile") ?? "standard") as ProfileType;

  const [profile] = useState<ProfileType>(defaultProfile);
  const [mode, setMode] = useState<Mode>("ocr");

  const [ocrText, setOcrText] = useState("");
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const endpoint = mode === "ocr" ? "/api/scan/ocr" : "/api/scan/barcode";
      const body =
        mode === "ocr" ? { text: ocrText, profile } : { barcode, profile };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.error ?? "Fehler beim Scannen");
        return;
      }

      setResult(data as ScanResult);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Unerwarteter Fehler bei der Analyse");
    }
  }

  const formDisabled =
    loading ||
    (mode === "ocr" ? !ocrText.trim() : !barcode.trim());

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Scan & Analyse</h1>
          <p className="text-sm text-slate-300 mb-4">
            Fotografiere das Etikett oder scanne den Barcode für eine automatische Analyse.
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-700 px-3 py-1 text-xs hover:border-slate-500 hover:bg-slate-900"
          >
            ← Zur Startseite
          </Link>
        </div>

        {/* Mode-Toggle */}
        <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900 p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode("ocr")}
            className={clsx(
              "px-3 py-1 text-xs font-medium rounded-md",
              mode === "ocr"
                ? "bg-slate-800 text-slate-50"
                : "text-slate-300 hover:text-slate-50"
            )}
          >
            📋 Etikett (OCR)
          </button>
          <button
            type="button"
            onClick={() => setMode("barcode")}
            className={clsx(
              "px-3 py-1 text-xs font-medium rounded-md",
              mode === "barcode"
                ? "bg-slate-800 text-slate-50"
                : "text-slate-300 hover:text-slate-50"
            )}
          >
            🔲 Barcode
          </button>
        </div>

        {/* Profil-Hinweis */}
        <div className="mb-6 text-xs text-slate-400">
          Aktives Profil: <span className="font-medium">{profile}</span>
          {" • "}
          <Link
            href={{ pathname: "/", query: { profile } }}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Profil ändern
          </Link>
        </div>

        {/* Formular */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          {mode === "ocr" ? (
            <>
              {/* OCR Scanner */}
              <ImageOCRScanner
                onTextExtracted={(text) => {
                  setOcrText(text);
                  setResult(null);
                }}
              />

              <div className="pt-4 border-t border-slate-800">
                <label className="block">
                  <span className="text-sm font-medium">
                    Erkannter Etikett-Text (bearbeitbar)
                  </span>
                  <textarea
                    className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 p-3 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                    rows={6}
                    value={ocrText}
                    onChange={(e) => setOcrText(e.target.value)}
                    placeholder="pH: 7.2, Kalzium: 100 mg/l, Magnesium: 30 mg/l, Natrium: 10 mg/l..."
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Sobald ein Foto ausgewertet wurde, erscheint der erkannte Text hier. Du kannst ihn vor dem Absenden noch korrigieren oder komplett manuell eingeben.
                  </p>
                </label>
              </div>
            </>
          ) : (
            <>
              <label className="block max-w-sm">
                <span className="text-sm font-medium">Barcode (EAN/GTIN)</span>
                <input
                  className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="z. B. 1234567890123"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Du kannst den Barcode manuell eingeben oder den Webcam-Scanner
                  unten verwenden.
                </p>
              </label>

              <BarcodeScanner
                onDetected={(code) => {
                  setBarcode(code);
                  setResult(null);
                }}
              />
            </>
          )}

          <button
            type="submit"
            disabled={formDisabled}
            className="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading
              ? "Wird analysiert..."
              : mode === "ocr"
              ? "Etikett analysieren"
              : "Barcode analysieren"}
          </button>
        </form>

        {/* Beispiel-Barcodes */}
        {mode === "barcode" && (
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 mb-6">
            <h3 className="text-xs font-medium text-slate-300 mb-2">Beispiel-Barcodes (MVP)</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <code className="bg-slate-800 px-2 py-1 rounded">1234567890123</code>
                <span className="text-slate-400">Beispielquelle Sprudel Classic</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <code className="bg-slate-800 px-2 py-1 rounded">4008501011009</code>
                <span className="text-slate-400">Gerolsteiner Naturell</span>
              </div>
            </div>
          </div>
        )}

        {result && (
          <section className="mt-6">
            <WaterScoreCard scanResult={result} />
          </section>
        )}
      </div>
    </main>
  );
}
