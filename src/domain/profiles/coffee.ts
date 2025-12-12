import { Coffee } from "lucide-react";
import type { ProfileConfig } from "./types";

export const coffeeProfile: ProfileConfig = {
    id: "coffee",
    label: "Kaffee",
    subtitle: "Weiches Wasser für Aromen",
    shortDescription: "Optimiert für Kaffee- und Teezubereitung.",
    whenToUse: "Für Kaffee- und Teeliebhaber, die das Aroma optimieren möchten.",
    chips: ["Weiches Wasser", "Aroma"],
    icon: Coffee,
    visual: {
        gradientFrom: "#78350f", // amber-900
        gradientTo: "#92400e", // amber-800
        colorClass: "bg-amber-800",
        badge: "Aroma",
    },
    wizard: {
        question: "Trinkst du leidenschaftlich gerne Kaffee oder Tee?",
        description: "Weiches Wasser ist entscheidend für die Entfaltung feiner Aromen.",
    },
    targets: {
        calcium: { min: 40, max: 120, optimalMin: 50, optimalMax: 90 },
        magnesium: { min: 10, max: 60, optimalMin: 15, optimalMax: 40 },
        sodium: { min: 0, max: 50, optimalMin: 0, optimalMax: 20 },
        potassium: { min: 0, max: 20, optimalMin: 1, optimalMax: 10 },
        bicarbonate: { min: 40, max: 200, optimalMin: 60, optimalMax: 120 },
        sulfate: { min: 0, max: 80, optimalMin: 0, optimalMax: 30 },
        chloride: { min: 0, max: 80, optimalMin: 0, optimalMax: 30 },
        nitrate: { min: 0, max: 25, optimalMin: 0, optimalMax: 10 },
    },
    scoringWeights: {
        calcium: 1.5, // Higher weight for coffee profile
    },
    scoringConditions: {},
    scoringFocus: [
        { metric: "calcium", label: "Calcium", weight: 0.8, tone: "avoid" },
        { metric: "bicarbonate", label: "Hydrogencarbonat", weight: 0.7, tone: "moderate" },
        { metric: "sulfat", label: "Sulfat", weight: 0.5, tone: "avoid" },
    ],
    metrics: [
        {
            metric: "calcium",
            label: "Calcium",
            importance: "sehr hoch",
            explanation: "Weiches Wasser (wenig Calcium) ist entscheidend für Kaffeearoma.",
            hints: [
                "Unter 80 mg/L für optimale Extraktion.",
                "Zu hartes Wasser macht Kaffee flach.",
            ],
        },
        {
            metric: "bicarbonate",
            label: "Hydrogencarbonat",
            importance: "hoch",
            explanation: "Moderate Werte puffern Säuren und verbessern den Geschmack.",
            hints: [
                "60-120 mg/L optimal für Kaffee.",
                "Zu wenig = zu sauer, zu viel = zu flach.",
            ],
        },
        {
            metric: "sulfate",
            label: "Sulfat",
            importance: "mittel",
            explanation: "Niedrige Sulfatwerte vermeiden Bitterkeit.",
            hints: ["Unter 50 mg/L bevorzugt."],
        },
    ],
    wizardPriority: 6,
    immediateFinish: false,
};
