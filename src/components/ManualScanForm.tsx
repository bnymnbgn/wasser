"use client";

import { useState, useEffect, useRef, memo } from "react";
import clsx from "clsx";
import { RotateCcw, Check, AlertCircle } from "lucide-react";
import { TextField, Button, Tooltip, InputAdornment, Box } from "@mui/material";
import { validateValue } from "@/src/lib/ocrParsing";
import { WATER_METRIC_FIELDS } from "@/src/constants/waterMetrics";
import { WaterAnalysisValues } from "@/src/domain/types";

type MetricKey = (typeof WATER_METRIC_FIELDS)[number]["key"];
type ValueInputState = Record<MetricKey, string>;

const createEmptyValueState = (): ValueInputState =>
    WATER_METRIC_FIELDS.reduce((acc, field) => {
        acc[field.key] = "";
        return acc;
    }, {} as ValueInputState);

interface ManualScanFormProps {
    initialBrand?: string;
    initialProduct?: string;
    initialBarcode?: string;
    initialValues?: ValueInputState;
    loading: boolean;
    onSubmit: (data: {
        brandName: string;
        productName: string;
        barcode: string;
        numericValues: Partial<WaterAnalysisValues>;
    }) => void;
}

export const ManualScanForm = memo(function ManualScanForm({
    initialBrand = "",
    initialProduct = "",
    initialBarcode = "",
    initialValues,
    loading,
    onSubmit,
}: ManualScanFormProps) {
    // We use Refs for inputs to avoid re-renders on every keystroke (Performance Critical)
    const brandRef = useRef<HTMLInputElement>(null);
    const barcodeRef = useRef<HTMLInputElement>(null);
    const valuesRef = useRef<ValueInputState>(createEmptyValueState());
    const metricRefs = useRef<Record<MetricKey, HTMLInputElement | null>>({} as Record<MetricKey, HTMLInputElement | null>);
    const submitRef = useRef<HTMLButtonElement>(null);

    // We only track "invalid" fields in state to show visual feedback on Blur
    const [invalidFields, setInvalidFields] = useState<Partial<Record<MetricKey, boolean>>>({});
    const [validationState, setValidationState] = useState<Partial<Record<MetricKey, { status: "valid" | "warning" | "invalid"; message?: string }>>>({});
    const [forceUpdateKey, setForceUpdateKey] = useState(0); // To reset form visually

    // Initialize refs when props change (only if form is reset/re-opened)
    useEffect(() => {
        if (brandRef.current) brandRef.current.value = initialBrand;
        if (barcodeRef.current) barcodeRef.current.value = initialBarcode;

        const startValues = initialValues || createEmptyValueState();
        valuesRef.current = { ...startValues };

        // Manually update input DOM nodes for metrics
        WATER_METRIC_FIELDS.forEach(field => {
            const el = document.getElementById("field-" + field.key) as HTMLInputElement;
            if (el) el.value = startValues[field.key] || "";
            if (startValues[field.key]) {
                updateValidation(field.key, startValues[field.key]!);
            }
        });

        setInvalidFields({});
        setValidationState({});
    }, [initialBrand, initialBarcode, initialValues, forceUpdateKey]);

    const updateValidation = (key: MetricKey, value: string) => {
        const trimmed = value.trim();
        if (!trimmed) {
            setInvalidFields(prev => ({ ...prev, [key]: false }));
            setValidationState(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
            return;
        }

        const num = Number(trimmed.replace(",", "."));
        if (!Number.isFinite(num)) {
            setInvalidFields(prev => ({ ...prev, [key]: true }));
            setValidationState(prev => ({ ...prev, [key]: { status: "invalid", message: "Keine Zahl" } }));
            return;
        }

        // Unrealistic hard cap check
        if (num > 10000) {
            setInvalidFields(prev => ({ ...prev, [key]: true }));
            setValidationState(prev => ({ ...prev, [key]: { status: "invalid", message: `${key} > 10.000 mg/l? Bitte prüfen.` } }));
            return;
        }

        const validation = validateValue(key, num);
        if (!validation.valid) {
            setInvalidFields(prev => ({ ...prev, [key]: false }));
            setValidationState(prev => ({ ...prev, [key]: { status: "warning", message: validation.warning } }));
            return;
        }

        setInvalidFields(prev => ({ ...prev, [key]: false }));
        setValidationState(prev => ({ ...prev, [key]: { status: "valid" } }));
    };

    const handleClear = () => {
        valuesRef.current = createEmptyValueState();
        setForceUpdateKey(p => p + 1); // Triggers effect to clear inputs
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numericValues: Partial<WaterAnalysisValues> = {};
        const currentValues = valuesRef.current;

        for (const field of WATER_METRIC_FIELDS) {
            const raw = currentValues[field.key];
            if (!raw.trim()) continue;
            const normalized = raw.replace(",", ".");
            const parsed = Number(normalized);
            if (Number.isFinite(parsed)) {
                numericValues[field.key] = parsed;
            }
        }

        onSubmit({
            brandName: brandRef.current?.value || "",
            productName: "",
            barcode: barcodeRef.current?.value || "",
            numericValues,
        });
    };

    const focusOrder: Array<MetricKey | "brand" | "barcode" | "submit"> = [
        "brand",
        "barcode",
        ...WATER_METRIC_FIELDS.map((f) => f.key),
        "submit",
    ];

    const focusNext = (current: MetricKey | "brand" | "barcode") => {
        const idx = focusOrder.indexOf(current);
        const next = focusOrder[idx + 1];
        if (!next) return;
        if (next === "brand") {
            brandRef.current?.focus();
        } else if (next === "barcode") {
            barcodeRef.current?.focus();
        } else if (next === "submit") {
            submitRef.current?.focus();
        } else {
            metricRefs.current[next]?.focus();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 px-1">
            <div className="space-y-4">
                <TextField
                    label="Marke / Produkt"
                    variant="filled"
                    fullWidth
                    inputRef={brandRef}
                    defaultValue={initialBrand}
                    placeholder="z.B. Gerolsteiner"
                    inputProps={{ enterKeyHint: "next" }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            focusNext("brand");
                        }
                    }}
                    InputLabelProps={{ sx: { color: "#94a3b8" } }}
                    InputProps={{
                        sx: {
                            backgroundColor: "rgba(255,255,255,0.05)",
                            borderRadius: 2,
                            color: "white",
                            "&:before, &:after": { borderBottom: "none !important" },
                        },
                    }}
                />
                <TextField
                    label="Barcode (Optional)"
                    variant="filled"
                    fullWidth
                    inputRef={barcodeRef}
                    defaultValue={initialBarcode}
                    placeholder="Scannen oder eingeben"
                    inputMode="numeric"
                    inputProps={{ enterKeyHint: "next" }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            focusNext("barcode");
                        }
                    }}
                    InputLabelProps={{ sx: { color: "#94a3b8" } }}
                    InputProps={{
                        sx: {
                            backgroundColor: "rgba(255,255,255,0.05)",
                            borderRadius: 2,
                            color: "white",
                            fontFamily: "monospace",
                            "&:before, &:after": { borderBottom: "none !important" },
                        },
                    }}
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Mineralien (mg/l)</span>
                    <Button
                        type="button"
                        size="small"
                        color="info"
                        onClick={handleClear}
                        startIcon={<RotateCcw size={12} />}
                        sx={{ textTransform: "uppercase", fontSize: "10px", fontWeight: 700 }}
                    >
                        Leeren
                    </Button>
                </div>
                <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={1.5}>
                    {WATER_METRIC_FIELDS.map((field) => {
                        const invalid = invalidFields[field.key];

                        return (
                            <Box key={field.key}>
                                <TextField
                                    id={"field-" + field.key}
                                    label={field.label}
                                    variant="filled"
                                    fullWidth
                                    defaultValue={initialValues?.[field.key] || ""}
                                    onChange={(e) => {
                                        valuesRef.current[field.key] = e.target.value;
                                        updateValidation(field.key, e.target.value);
                                    }}
                                    onBlur={(e) => updateValidation(field.key, e.target.value)}
                                    placeholder="0"
                                    inputMode="decimal"
                                    inputRef={(el) => { metricRefs.current[field.key] = el; }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            focusNext(field.key);
                                        }
                                    }}
                                    inputProps={{ enterKeyHint: field.key === WATER_METRIC_FIELDS[(WATER_METRIC_FIELDS.length - 1)]?.key ? "done" : "next" }}
                                    error={Boolean(invalid) || validationState[field.key]?.status === "invalid"}
                                    helperText={validationState[field.key]?.message || " "}
                                    InputLabelProps={{ sx: { color: "#94a3b8", fontSize: "11px", textTransform: "uppercase" } }}
                                    InputProps={{
                                        sx: {
                                            backgroundColor: "rgba(255,255,255,0.04)",
                                            borderRadius: 2,
                                            color: "white",
                                            fontWeight: 700,
                                            "&:before, &:after": { borderBottom: "none !important" },
                                        },
                                        endAdornment: (
                                            <InputAdornment position="end" sx={{ color: "white" }}>
                                                {"unit" in field && (
                                                    <span className="text-[10px] text-slate-400 mr-2">{field.unit}</span>
                                                )}
                                                {validationState[field.key]?.status === "valid" && (
                                                    <Tooltip title="Wert plausibel">
                                                        <Check className="w-4 h-4 text-emerald-400" />
                                                    </Tooltip>
                                                )}
                                                {validationState[field.key]?.status === "warning" && (
                                                    <Tooltip title={validationState[field.key]?.message || "Bitte prüfen"}>
                                                        <AlertCircle className="w-4 h-4 text-amber-400" />
                                                    </Tooltip>
                                                )}
                                                {validationState[field.key]?.status === "invalid" && (
                                                    <Tooltip title={validationState[field.key]?.message || "Ungültiger Wert"}>
                                                        <AlertCircle className="w-4 h-4 text-rose-400" />
                                                    </Tooltip>
                                                )}
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        );
                    })}
                </Box>
            </div>

            <div className="pt-4">
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={loading}
                    ref={submitRef}
                    sx={{ fontWeight: 700, borderRadius: 3, textTransform: "none" }}
                >
                    {loading ? "Analysiere..." : "Speichern"}
                </Button>
            </div>
        </form>
    );
});
