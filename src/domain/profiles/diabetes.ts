import { Syringe } from "lucide-react";
import type { ProfileConfig } from "./types";

export const diabetesProfile: ProfileConfig = {
    id: "diabetes",
    label: "Diabetes",
    subtitle: "Magnesiumreich für Insulinsensitivität",
    shortDescription: "Magnesiumreiche, natriumarme Versorgung zur Unterstützung der Insulinsensitivität.",
    whenToUse: "Für Menschen mit Diabetes Typ 1 oder Typ 2, die ihre Mineralstoffversorgung optimieren möchten.",
    chips: ["Viel Mg", "Moderates Na"],
    icon: Syringe,
    visual: {
        gradientFrom: "#f97316", // orange-500
        gradientTo: "#f59e0b", // amber-500
        colorClass: "bg-orange-500",
        badge: "Diabetes",
    },
    wizard: {
        question: "Hast du Diabetes (Typ 1 oder Typ 2)?",
        description: "Magnesium unterstützt die Insulinsensitivität und hilft bei häufigen Begleiterscheinungen.",
    },
    targets: {
        magnesium: { min: 30, max: 150, optimalMin: 50, optimalMax: 100 },
        calcium: { min: 50, max: 180, optimalMin: 80, optimalMax: 150 },
        sodium: { min: 0, max: 80, optimalMin: 0, optimalMax: 50 },
        potassium: { min: 0, max: 15, optimalMin: 1, optimalMax: 10 },
        bicarbonate: { min: 200, max: 1000, optimalMin: 300, optimalMax: 800 },
        sulfate: { min: 0, max: 250, optimalMin: 0, optimalMax: 150 },
        chloride: { min: 0, max: 100, optimalMin: 0, optimalMax: 50 },
        nitrate: { min: 0, max: 25, optimalMin: 0, optimalMax: 10 },
    },
    scoringWeights: {
        magnesium: 1.5,
    },
    scoringConditions: {},
    scoringFocus: [
        { metric: "magnesium", label: "Magnesium", weight: 0.9, tone: "positive" },
        { metric: "bicarbonate", label: "Hydrogencarbonat", weight: 0.6, tone: "positive" },
        { metric: "calcium", label: "Calcium", weight: 0.5, tone: "positive" },
        { metric: "natrium", label: "Natrium", weight: 0.6, tone: "avoid" },
        { metric: "kalium", label: "Kalium", weight: 0.4, tone: "moderate" },
    ],
    metrics: [
        {
            metric: "magnesium",
            label: "Magnesium",
            importance: "sehr hoch",
            explanation: "Magnesium ist besonders wichtig bei Diabetes - es unterstützt die Insulinsensitivität und Muskelgesundheit.",
            hints: [
                "Werte von 50-100 mg/L sind optimal.",
                "Diabetiker haben oft niedrigere Magnesiumspiegel.",
                "Kann Wadenkrämpfe reduzieren.",
            ],
        },
        {
            metric: "bicarbonate",
            label: "Hydrogencarbonat",
            importance: "hoch",
            explanation: "Hydrogencarbonat unterstützt den Säure-Basen-Haushalt, der bei Diabetes oft gestört ist.",
            hints: [
                "Werte von 300-800 mg/L sind empfehlenswert.",
                "Macht Wasser bekömmlicher.",
            ],
        },
        {
            metric: "calcium",
            label: "Calcium",
            importance: "mittel",
            explanation: "Calcium ist wichtig für Knochen - Diabetes erhöht das Osteoporoserisiko.",
            hints: ["Werte von 80-150 mg/L sind gut."],
        },
        {
            metric: "sodium",
            label: "Natrium",
            importance: "mittel",
            explanation: "Natriumarm bevorzugt, da Diabetes das Herz-Kreislauf-Risiko erhöht.",
            hints: [
                "Unter 50 mg/L empfehlenswert.",
                "Besonders wichtig bei Bluthochdruck.",
            ],
        },
    ],
    wizardPriority: 9,
    immediateFinish: false,
};
