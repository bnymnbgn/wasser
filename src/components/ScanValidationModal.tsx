import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import type { WaterAnalysisValues } from "@/src/domain/types";

interface ScanValidationModalProps {
  initialValues: Partial<WaterAnalysisValues>;
  onConfirm: (values: Partial<WaterAnalysisValues>, info?: { brand?: string; productName?: string }) => void;
  onCancel: () => void;
}

const FIELDS: Array<keyof WaterAnalysisValues> = [
  "calcium",
  "magnesium",
  "sodium",
  "potassium",
  "bicarbonate",
  "nitrate",
];

export function ScanValidationModal({
  initialValues,
  onConfirm,
  onCancel,
}: ScanValidationModalProps) {
  const [values, setValues] = useState<Partial<WaterAnalysisValues>>(initialValues);
  const [brand, setBrand] = useState("");
  const [productName, setProductName] = useState("");

  const handleChange = (key: keyof WaterAnalysisValues, input: string) => {
    const normalized = input.replace(",", ".");
    const num = Number(normalized);
    setValues((prev) => ({
      ...prev,
      [key]: Number.isFinite(num) ? num : undefined,
    }));
  };

  const hasAnyValue = FIELDS.some((field) => values[field] != null);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-white/10 shadow-2xl p-6 space-y-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Werte prüfen</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Bitte ergänze den Namen und korrigiere die wichtigsten Werte.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Marke"
            variant="filled"
            fullWidth
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="z.B. Gerolsteiner"
            InputProps={{
              sx: {
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 2,
                "&:before, &:after": { borderBottom: "none !important" },
                "& input": { color: "#e2e8f0" },
              },
            }}
            InputLabelProps={{ shrink: true, sx: { color: "#94a3b8" } }}
          />
          <TextField
            label="Produkt (Optional)"
            variant="filled"
            fullWidth
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="z.B. Naturell"
            InputProps={{
              sx: {
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 2,
                "&:before, &:after": { borderBottom: "none !important" },
                "& input": { color: "#e2e8f0" },
              },
            }}
            InputLabelProps={{ shrink: true, sx: { color: "#94a3b8" } }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {FIELDS.map((field) => (
            <TextField
              key={field}
              label={field}
              variant="filled"
              fullWidth
              type="number"
              value={values[field] ?? ""}
              onChange={(e) => handleChange(field, e.target.value)}
              inputProps={{ step: "0.1", inputMode: "decimal" }}
              InputProps={{
                sx: {
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 2,
                  "&:before, &:after": { borderBottom: "none !important" },
                  "& input": { color: "#e2e8f0", fontFamily: "monospace" },
                },
              }}
              InputLabelProps={{ shrink: true, sx: { color: "#94a3b8" } }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Abbrechen
          </button>
          <button
            type="button"
            disabled={!hasAnyValue}
            onClick={() => onConfirm(values, { brand, productName })}
            className="flex-1 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bestätigen
          </button>
        </div>
      </div>
    </div>
  );
}
