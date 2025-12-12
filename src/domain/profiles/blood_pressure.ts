import { HeartPulse } from "lucide-react";
import type { ProfileConfig } from "./types";

export const bloodPressureProfile: ProfileConfig = {
    id: "blood_pressure",
    label: "Blutdruck",
    subtitle: "Natriumarm für Hypertoniker",
    shortDescription: "Natriumarmes Wasser zur Unterstützung bei Bluthochdruck.",
    whenToUse: "Für Menschen mit Bluthochdruck oder Herz-Kreislauf-Erkrankungen.",
    chips: ["Natriumarm", "Herzgesund"],
    icon: HeartPulse,
    visual: {
        gradientFrom: "#ef4444", // red-500
        gradientTo: "#f97316", // orange-500
        colorClass: "bg-red-500",
        badge: "Herz",
    },
    wizard: {
        question: "Musst du auf deinen Blutdruck achten?",
        description: "Bei Bluthochdruck wird oft eine natriumarme Ernährung empfohlen.",
    },
    targets: {
        calcium: { min: 20, max: 200, optimalMin: 40, optimalMax: 120 },
        magnesium: { min: 5, max: 80, optimalMin: 10, optimalMax: 40 },
        sodium: { min: 0, max: 50, optimalMin: 0, optimalMax: 20 },
        potassium: { min: 0, max: 20, optimalMin: 1, optimalMax: 8 },
        bicarbonate: { min: 120, max: 500, optimalMin: 150, optimalMax: 350 },
        sulfate: { min: 0, max: 250, optimalMin: 0, optimalMax: 120 },
        chloride: { min: 0, max: 80, optimalMin: 0, optimalMax: 40 },
        nitrate: { min: 0, max: 25, optimalMin: 0, optimalMax: 10 },
    },
    scoringWeights: {
        sodium: 2,
    },
    scoringConditions: {
        strictSodium: true,
    },
    scoringFocus: [
        { metric: "natrium", label: "Natrium", weight: 1.0, tone: "avoid" },
        { metric: "kalium", label: "Kalium", weight: 0.5, tone: "moderate" },
        { metric: "magnesium", label: "Magnesium", weight: 0.4, tone: "positive" },
    ],
    metrics: [
        {
            metric: "sodium",
            label: "Natrium",
            importance: "kritisch",
            explanation: "Natriumarmes Wasser entlastet den Blutdruck.",
            hints: [
                "Unter 20 mg/L ist ideal.",
                "Achte auch auf natriumarme Ernährung insgesamt.",
            ],
        },
        {
            metric: "potassium",
            label: "Kalium",
            importance: "mittel",
            explanation: "Moderate Kaliumwerte sind meist unproblematisch.",
            hints: ["Bei gleichzeitiger Nierenerkrankung niedrig halten."],
        },
        {
            metric: "magnesium",
            label: "Magnesium",
            importance: "mittel",
            explanation: "Magnesium kann den Blutdruck leicht senken.",
            hints: ["Moderate bis höhere Werte sind positiv."],
        },
    ],
    wizardPriority: 3,
    immediateFinish: true,
};
