import { Activity } from "lucide-react";
import type { ProfileConfig } from "./types";

export const sportProfile: ProfileConfig = {
    id: "sport",
    label: "Sport",
    subtitle: "Für aktive Menschen",
    shortDescription: "Optimiert für Elektrolyte und Regeneration bei sportlicher Aktivität.",
    whenToUse: "Für Sportler und körperlich aktive Menschen.",
    chips: ["Elektrolyte", "Regeneration"],
    icon: Activity,
    visual: {
        gradientFrom: "#22c55e", // green-500
        gradientTo: "#84cc16", // lime-500
        colorClass: "bg-green-500",
        badge: "Aktiv",
    },
    wizard: {
        question: "Treibst du viel Sport?",
        description: "Aktive Menschen profitieren von mehr Magnesium und Natrium.",
    },
    targets: {
        calcium: { min: 50, max: 400, optimalMin: 150, optimalMax: 300 },
        magnesium: { min: 20, max: 200, optimalMin: 80, optimalMax: 150 },
        sodium: { min: 20, max: 200, optimalMin: 50, optimalMax: 150 },
        potassium: { min: 5, max: 50, optimalMin: 10, optimalMax: 30 },
        bicarbonate: { min: 200, max: 2000, optimalMin: 600, optimalMax: 1500 },
        sulfate: { min: 0, max: 500, optimalMin: 0, optimalMax: 200 },
        chloride: { min: 0, max: 200, optimalMin: 20, optimalMax: 100 },
        nitrate: { min: 0, max: 50, optimalMin: 0, optimalMax: 10 },
    },
    scoringWeights: {
        calcium: 1.5,
        magnesium: 1.5,
    },
    scoringConditions: {},
    scoringFocus: [
        { metric: "magnesium", label: "Magnesium", weight: 0.9, tone: "positive" },
        { metric: "calcium", label: "Calcium", weight: 0.8, tone: "positive" },
        { metric: "natrium", label: "Natrium", weight: 0.6, tone: "positive" },
        { metric: "bicarbonate", label: "Hydrogencarbonat", weight: 0.5, tone: "positive" },
    ],
    metrics: [
        {
            metric: "magnesium",
            label: "Magnesium",
            importance: "sehr hoch",
            explanation: "Magnesium ist essentiell für Muskelkontraktion und Krampfprävention.",
            hints: [
                "80-150 mg/L optimal für Sportler.",
                "Unterstützt ATP-Synthese und Regeneration.",
            ],
        },
        {
            metric: "calcium",
            label: "Calcium",
            importance: "sehr hoch",
            explanation: "Calcium ist wichtig für Muskelkontraktion und Knochengesundheit.",
            hints: [
                "150-300 mg/L unterstützen die Regeneration.",
                "Wichtig bei hoher Trainingsbelastung.",
            ],
        },
        {
            metric: "sodium",
            label: "Natrium",
            importance: "hoch",
            explanation: "Natrium gleicht Schweißverluste aus und verhindert Hyponatriämie.",
            hints: [
                "50-150 mg/L für intensive Einheiten.",
                "Besonders wichtig bei langen Ausdauereinheiten.",
            ],
        },
        {
            metric: "bicarbonate",
            label: "Hydrogencarbonat",
            importance: "mittel",
            explanation: "Puffert Milchsäure und unterstützt die Regeneration.",
            hints: ["600-1500 mg/L für optimale Pufferung."],
        },
    ],
    wizardPriority: 7, // Asked late
    immediateFinish: false,
};
