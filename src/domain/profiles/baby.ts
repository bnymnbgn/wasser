import { Baby } from "lucide-react";
import type { ProfileConfig } from "./types";

export const babyProfile: ProfileConfig = {
    id: "baby",
    label: "Baby",
    subtitle: "Für Säuglingsnahrung geeignet",
    shortDescription: "Strengste Kriterien für die Zubereitung von Säuglingsnahrung.",
    whenToUse: "Bei der Zubereitung von Babynahrung für Säuglinge unter 12 Monaten.",
    chips: ["Nitratarm", "Natriumarm"],
    icon: Baby,
    visual: {
        gradientFrom: "#ec4899", // pink-500
        gradientTo: "#f472b6", // pink-400
        colorClass: "bg-pink-500",
        badge: "Säugling",
    },
    wizard: {
        question: "Bereitest du regelmäßig Babynahrung zu?",
        description: "Säuglinge benötigen besonders natrium- und nitratarmes Wasser.",
    },
    targets: {
        calcium: { min: 20, max: 100, optimalMin: 30, optimalMax: 80 },
        magnesium: { min: 5, max: 50, optimalMin: 10, optimalMax: 30 },
        sodium: { min: 0, max: 20, optimalMin: 0, optimalMax: 10 },
        potassium: { min: 0, max: 10, optimalMin: 1, optimalMax: 5 },
        bicarbonate: { min: 100, max: 400, optimalMin: 150, optimalMax: 300 },
        sulfate: { min: 0, max: 200, optimalMin: 0, optimalMax: 50 },
        chloride: { min: 0, max: 50, optimalMin: 0, optimalMax: 20 },
        nitrate: { min: 0, max: 10, optimalMin: 0, optimalMax: 5 },
    },
    scoringWeights: {
        sodium: 2,
        nitrate: 2,
        fluoride: 1.5,
    },
    scoringConditions: {
        strictSodium: true,
        strictNitrate: true,
    },
    scoringFocus: [
        { metric: "nitrat", label: "Nitrat", weight: 1.0, tone: "avoid" },
        { metric: "natrium", label: "Natrium", weight: 0.9, tone: "avoid" },
        { metric: "fluorid", label: "Fluorid", weight: 0.8, tone: "avoid" },
        { metric: "sulfat", label: "Sulfat", weight: 0.5, tone: "avoid" },
    ],
    metrics: [
        {
            metric: "nitrate",
            label: "Nitrat",
            importance: "kritisch",
            explanation: "Nitrat kann bei Säuglingen Methämoglobinämie verursachen.",
            hints: [
                "Maximal 10 mg/L für Säuglingsnahrung.",
                "Wasser mit 'Für Säuglingsnahrung geeignet' bevorzugen.",
            ],
        },
        {
            metric: "sodium",
            label: "Natrium",
            importance: "sehr hoch",
            explanation: "Säuglingsnieren können hohe Natriummengen nicht verarbeiten.",
            hints: [
                "Unter 20 mg/L empfohlen.",
                "Muttermilch enthält bereits ausreichend Natrium.",
            ],
        },
        {
            metric: "fluoride",
            label: "Fluorid",
            importance: "hoch",
            explanation: "Zu viel Fluorid kann Zahnfluorose bei Säuglingen verursachen.",
            hints: ["Unter 0.7 mg/L für Säuglinge."],
        },
        {
            metric: "sulfate",
            label: "Sulfat",
            importance: "mittel",
            explanation: "Hohe Sulfatwerte können abführend wirken.",
            hints: ["Unter 200 mg/L bevorzugt."],
        },
    ],
    wizardPriority: 1, // Asked first
    immediateFinish: true,
};
