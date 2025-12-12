import { UserRound } from "lucide-react";
import type { ProfileConfig } from "./types";

export const seniorsProfile: ProfileConfig = {
    id: "seniors",
    label: "Senioren",
    subtitle: "Knochengesundheit & altersgerechte Versorgung",
    shortDescription: "Ausgewogene Mineralversorgung für Knochengesundheit und altersgerechte Hydration.",
    whenToUse: "Für Menschen ab 60+, die auf Knochengesundheit, Herzfunktion und ausreichende Flüssigkeitszufuhr achten.",
    chips: ["Viel Ca/Mg", "Moderates Na"],
    icon: UserRound,
    visual: {
        gradientFrom: "#14b8a6", // teal-500
        gradientTo: "#06b6d4", // cyan-500
        colorClass: "bg-teal-500",
        badge: "60+",
    },
    wizard: {
        question: "Bist du 60 Jahre oder älter?",
        description: "Im Alter sind Knochengesundheit und ausreichende Flüssigkeitszufuhr besonders wichtig.",
    },
    targets: {
        calcium: { min: 60, max: 200, optimalMin: 100, optimalMax: 150 },
        magnesium: { min: 30, max: 120, optimalMin: 50, optimalMax: 100 },
        sodium: { min: 0, max: 80, optimalMin: 0, optimalMax: 50 },
        potassium: { min: 0, max: 15, optimalMin: 1, optimalMax: 10 },
        bicarbonate: { min: 200, max: 800, optimalMin: 300, optimalMax: 600 },
        sulfate: { min: 0, max: 250, optimalMin: 0, optimalMax: 150 },
        chloride: { min: 0, max: 100, optimalMin: 0, optimalMax: 50 },
        nitrate: { min: 0, max: 25, optimalMin: 0, optimalMax: 10 },
    },
    scoringWeights: {
        calcium: 1.5,
        magnesium: 1.5,
    },
    scoringConditions: {},
    scoringFocus: [
        { metric: "calcium", label: "Calcium", weight: 0.8, tone: "positive" },
        { metric: "magnesium", label: "Magnesium", weight: 0.8, tone: "positive" },
        { metric: "bicarbonate", label: "Hydrogencarbonat", weight: 0.6, tone: "positive" },
        { metric: "natrium", label: "Natrium", weight: 0.5, tone: "avoid" },
        { metric: "kalium", label: "Kalium", weight: 0.4, tone: "moderate" },
    ],
    metrics: [
        {
            metric: "calcium",
            label: "Calcium",
            importance: "sehr hoch",
            explanation: "Calcium ist entscheidend für die Knochengesundheit im Alter und zur Osteoporose-Prävention.",
            hints: [
                "Werte von 100-150 mg/L sind optimal für Senioren.",
                "Calciumreiches Wasser kann die Ernährung gut ergänzen.",
            ],
        },
        {
            metric: "magnesium",
            label: "Magnesium",
            importance: "sehr hoch",
            explanation: "Magnesium unterstützt Herzgesundheit, Muskelentspannung und reduziert Wadenkrämpfe.",
            hints: [
                "Werte von 50-100 mg/L sind ideal.",
                "Wichtig für Herzrhythmus und Schlafqualität.",
            ],
        },
        {
            metric: "bicarbonate",
            label: "Hydrogencarbonat",
            importance: "hoch",
            explanation: "Hydrogencarbonat hilft bei Verdauungsproblemen und Sodbrennen - beides häufig im Alter.",
            hints: ["Werte von 300-600 mg/L sind angenehm für den Magen."],
        },
        {
            metric: "sodium",
            label: "Natrium",
            importance: "mittel",
            explanation: "Natriumarm bevorzugt, da viele Senioren Bluthochdruck haben.",
            hints: [
                "Unter 50 mg/L ist empfehlenswert.",
                "Bei Herzmedikation besonders wichtig.",
            ],
        },
    ],
    wizardPriority: 8,
    immediateFinish: false,
};
