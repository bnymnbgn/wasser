import { Shield } from "lucide-react";
import type { ProfileConfig } from "./types";

export const kidneyProfile: ProfileConfig = {
    id: "kidney",
    label: "Nieren",
    subtitle: "Nierenfreundlich mineralisiert",
    shortDescription: "Niedrige Mineralisation zur Schonung der Nieren.",
    whenToUse: "Für Menschen mit eingeschränkter Nierenfunktion oder Nierenerkrankungen.",
    chips: ["Niedrige Mineralisation", "Schonend"],
    icon: Shield,
    visual: {
        gradientFrom: "#0ea5e9", // sky-500
        gradientTo: "#14b8a6", // teal-500
        colorClass: "bg-sky-600",
        badge: "Schonend",
    },
    wizard: {
        question: "Hast du Nierenprobleme oder eine eingeschränkte Nierenfunktion?",
        description: "Bei Nierenerkrankungen sollte die Mineralbelastung minimiert werden.",
    },
    targets: {
        calcium: { min: 0, max: 80, optimalMin: 0, optimalMax: 50 },
        magnesium: { min: 0, max: 40, optimalMin: 0, optimalMax: 25 },
        sodium: { min: 0, max: 20, optimalMin: 0, optimalMax: 10 },
        potassium: { min: 0, max: 10, optimalMin: 0, optimalMax: 5 },
        bicarbonate: { min: 50, max: 400, optimalMin: 80, optimalMax: 200 },
        sulfate: { min: 0, max: 150, optimalMin: 0, optimalMax: 50 },
        chloride: { min: 0, max: 50, optimalMin: 0, optimalMax: 20 },
        nitrate: { min: 0, max: 10, optimalMin: 0, optimalMax: 5 },
    },
    scoringWeights: {
        sodium: 2,
        potassium: 2,
    },
    scoringConditions: {
        strictSodium: true,
    },
    scoringFocus: [
        { metric: "kalium", label: "Kalium", weight: 1.0, tone: "avoid" },
        { metric: "natrium", label: "Natrium", weight: 0.9, tone: "avoid" },
        { metric: "phosphat", label: "Phosphat", weight: 0.8, tone: "avoid" },
        { metric: "calcium", label: "Calcium", weight: 0.6, tone: "moderate" },
    ],
    metrics: [
        {
            metric: "potassium",
            label: "Kalium",
            importance: "kritisch",
            explanation: "Kalium kann bei Niereninsuffizienz nicht ausreichend ausgeschieden werden.",
            hints: [
                "Unter 5 mg/L wichtig bei eingeschränkter Nierenfunktion.",
                "Bei Dialyse besonders streng beachten.",
            ],
        },
        {
            metric: "sodium",
            label: "Natrium",
            importance: "sehr hoch",
            explanation: "Natriumarm entlastet die Nieren und verhindert Wassereinlagerungen.",
            hints: [
                "Unter 20 mg/L empfohlen.",
                "Hilft auch bei Bluthochdruck.",
            ],
        },
        {
            metric: "calcium",
            label: "Calcium",
            importance: "mittel",
            explanation: "Moderate Calciumwerte, um die Nieren nicht zu belasten.",
            hints: ["Unter 80 mg/L bevorzugt."],
        },
    ],
    wizardPriority: 4,
    immediateFinish: true,
};
