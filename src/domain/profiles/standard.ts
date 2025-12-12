import { Droplet } from "lucide-react";
import type { ProfileConfig } from "./types";

export const standardProfile: ProfileConfig = {
    id: "standard",
    label: "Standard",
    subtitle: "Ausgewogen für den Alltag",
    shortDescription: "Ausgewogene Bewertung für alltäglichen Wasserkonsum.",
    whenToUse: "Für Erwachsene ohne besondere Ernährungsziele.",
    chips: ["Balance", "Alltagstauglich"],
    icon: Droplet,
    visual: {
        gradientFrom: "#3b82f6", // blue-500
        gradientTo: "#06b6d4", // cyan-500
        colorClass: "bg-blue-500",
        badge: "Alltag",
    },
    wizard: {
        question: "", // Standard is fallback, no wizard question
        description: "",
    },
    targets: {
        calcium: { min: 40, max: 200, optimalMin: 60, optimalMax: 160 },
        magnesium: { min: 10, max: 100, optimalMin: 20, optimalMax: 60 },
        sodium: { min: 0, max: 100, optimalMin: 0, optimalMax: 50 },
        potassium: { min: 0, max: 20, optimalMin: 1, optimalMax: 10 },
        bicarbonate: { min: 80, max: 600, optimalMin: 120, optimalMax: 350 },
        sulfate: { min: 0, max: 400, optimalMin: 0, optimalMax: 150 },
        chloride: { min: 0, max: 150, optimalMin: 0, optimalMax: 80 },
        nitrate: { min: 0, max: 25, optimalMin: 0, optimalMax: 10 },
    },
    scoringWeights: {},
    scoringConditions: {},
    scoringFocus: [
        { metric: "calcium", label: "Calcium", weight: 0.5, tone: "positive" },
        { metric: "magnesium", label: "Magnesium", weight: 0.5, tone: "positive" },
        { metric: "natrium", label: "Natrium", weight: 0.4, tone: "moderate" },
    ],
    metrics: [
        {
            metric: "calcium",
            label: "Calcium",
            importance: "mittel",
            explanation: "Calcium trägt zu Knochen- und Zahngesundheit bei.",
            hints: ["50-150 mg/L sind üblich für Mineralwasser."],
        },
        {
            metric: "magnesium",
            label: "Magnesium",
            importance: "mittel",
            explanation: "Magnesium unterstützt Muskeln und Nerven.",
            hints: ["20-50 mg/L decken einen Teil des Tagesbedarfs."],
        },
        {
            metric: "sodium",
            label: "Natrium",
            importance: "niedrig",
            explanation: "Moderate Natriumwerte sind für die meisten Menschen unproblematisch.",
            hints: ["Unter 200 mg/L gilt als natriumarm."],
        },
    ],
    wizardPriority: null, // Standard is fallback, not in wizard
    immediateFinish: false,
};
