"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";

import type { ProfileType, ScanResult, WaterAnalysisValues } from "@/src/domain/types";
import { WaterScoreCard } from "@/src/components/WaterScoreCard";
import { BarcodeScanner } from "@/src/components/BarcodeScanner";
import { ImageOCRScanner } from "@/src/components/ImageOCRScanner";
import { parseTextToAnalysis, validateValue } from "@/src/lib/ocrParsing";

const METRIC_FIELDS = [
  { key: "ph", label: "pH-Wert" },
  { key: "calcium", label: "Calcium", unit: "mg/L" },
  { key: "magnesium", label: "Magnesium", unit: "mg/L" },
  { key: "sodium", label: "Natrium", unit: "mg/L" },
  { key: "potassium", label: "Kalium", unit: "mg/L" },
  { key: "chloride", label: "Chlorid", unit: "mg/L" },
  { key: "sulfate", label: "Sulfat", unit: "mg/L" },
  { key: "nitrate", label: "Nitrat", unit: "mg/L" },
  { key: "bicarbonate", label: "Hydrogencarbonat", unit: "mg/L" },
  { key: "totalDissolvedSolids", label: "Gesamtmineralisation", unit: "mg/L" },
] as const;

type MetricKey = (typeof METRIC_FIELDS)[number]["key"];
type ValueInputState = Record<MetricKey, string>;

const createEmptyValueState = (): ValueInputState =>
  METRIC_FIELDS.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {} as ValueInputState);

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
  const [resultWarnings, setResultWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [valueInputs, setValueInputs] = useState<ValueInputState>(() =>
    createEmptyValueState()
  );

  const { numericValues, invalidFields } = useMemo(() => {
    const values: Partial<WaterAnalysisValues> = {};
    const invalid: Partial<Record<MetricKey, boolean>> = {};

    for (const field of METRIC_FIELDS) {
      const raw = valueInputs[field.key];
      if (!raw.trim()) continue;
      const normalized = raw.replace(",", ".");
      const parsed = Number(normalized);
      if (Number.isFinite(parsed)) {
        values[field.key] = parsed;
      } else {
        invalid[field.key] = true;
      }
    }

    return { numericValues: values, invalidFields: invalid };
  }, [valueInputs]);

  const valueWarnings = useMemo(() => {
    const map: Partial<Record<MetricKey, string>> = {};
    Object.entries(numericValues).forEach(([metric, value]) => {
      const result = validateValue(metric as MetricKey, value as number);
      if (!result.valid && result.warning) {
        map[metric as MetricKey] = result.warning;
      }
    });
    return map;
  }, [numericValues]);

  const hasAnyValues = Object.keys(numericValues).length > 0;
  const hasInvalidInputs = Object.keys(invalidFields).length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setResultWarnings([]);

    try {
      const endpoint = mode === "ocr" ? "/api/scan/ocr" : "/api/scan/barcode";
      const body =
        mode === "ocr"
          ? { text: ocrText, profile, values: numericValues }
          : { barcode, profile };

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
      if (Array.isArray(data.warnings)) {
        setResultWarnings(data.warnings);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Unerwarteter Fehler bei der Analyse");
    }
  }

  const formDisabled =
    loading ||
    (mode === "ocr" ? !hasAnyValues || hasInvalidInputs : !barcode.trim());

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    setResult(null);
    setResultWarnings([]);
    if (nextMode === "barcode") {
      setValueInputs(createEmptyValueState());
    }
  }

  function applyTextParsing(text: string) {
    if (!text.trim()) {
      setValueInputs(createEmptyValueState());
      return;
    }
    const parsed = parseTextToAnalysis(text);
    const nextValues = createEmptyValueState();
    METRIC_FIELDS.forEach((field) => {
      const maybe = parsed[field.key];
      nextValues[field.key] = maybe !== undefined ? String(maybe) : "";
    });
    setValueInputs(nextValues);
  }

  function handleTextExtracted(text: string) {
    setOcrText(text);
    setResult(null);
    setResultWarnings([]);
    applyTextParsing(text);
  }

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
            onClick={() => handleModeChange("ocr")}
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
            onClick={() => handleModeChange("barcode")}
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
                onTextExtracted={handleTextExtracted}
              />

              <div className="pt-4 border-t border-slate-800">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">Erkannte Werte (bearbeitbar)</p>
                    <p className="text-xs text-slate-400">
                      Alle Angaben in mg/L, pH ist dimensionslos. Ergänze oder korrigiere die Zahlen nach Bedarf.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setValueInputs(createEmptyValueState());
                        setResult(null);
                        setResultWarnings([]);
                      }}
                      className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
                    >
                      Felder leeren
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        applyTextParsing(ocrText);
                        setResult(null);
                        setResultWarnings([]);
                      }}
                      disabled={!ocrText.trim()}
                      className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500 disabled:opacity-40"
                    >
                      Text neu parsen
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {METRIC_FIELDS.map((field) => {
                    const warning = valueWarnings[field.key];
                    const invalid = invalidFields[field.key];
                    return (
                      <label
                        key={field.key}
                        className="block rounded-lg border border-slate-800 bg-slate-900/50 p-3"
                      >
                        <span className="text-xs font-medium text-slate-200 flex items-center justify-between">
                          {field.label}
                          {field.unit ? (
                            <span className="text-[10px] text-slate-400">{field.unit}</span>
                          ) : null}
                        </span>
                        <input
                          className={clsx(
                            "mt-1 block w-full rounded-md border bg-slate-950 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500",
                            invalid
                              ? "border-rose-500 text-rose-100"
                              : warning
                              ? "border-amber-500"
                              : "border-slate-800"
                          )}
                          value={valueInputs[field.key]}
                          onChange={(e) => {
                            const nextValue = e.target.value;
                            setValueInputs((prev) => ({
                              ...prev,
                              [field.key]: nextValue,
                            }));
                            setResult(null);
                            setResultWarnings([]);
                          }}
                          placeholder={field.unit ? "z. B. 80" : "z. B. 7.3"}
                          inputMode="decimal"
                        />
                        {invalid && (
                          <p className="mt-1 text-[11px] text-rose-400">
                            Bitte eine gültige Zahl eingeben.
                          </p>
                        )}
                        {!invalid && warning && (
                          <p className="mt-1 text-[11px] text-amber-400">{warning}</p>
                        )}
                      </label>
                    );
                  })}
                </div>

                {ocrText && (
                  <details className="mt-4 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                    <summary className="cursor-pointer text-xs font-medium text-slate-200">
                      Erkannter Text anzeigen
                    </summary>
                    <div className="mt-3 space-y-2">
                      <textarea
                        className="block w-full rounded-md border border-slate-800 bg-slate-950 p-3 text-xs focus:border-emerald-500 focus:ring-emerald-500"
                        rows={5}
                        value={ocrText}
                        onChange={(e) => setOcrText(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            applyTextParsing(ocrText);
                            setResult(null);
                            setResultWarnings([]);
                          }}
                          className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
                        >
                          Werte aus Text übernehmen
                        </button>
                      </div>
                    </div>
                  </details>
                )}
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
          <section className="mt-6 space-y-4">
            <WaterScoreCard scanResult={result} />
            {resultWarnings.length > 0 && (
              <div className="rounded-lg border border-amber-600/40 bg-amber-500/5 p-4">
                <h3 className="text-sm font-semibold text-amber-300">Hinweise zur Eingabe</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-200">
                  {resultWarnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
