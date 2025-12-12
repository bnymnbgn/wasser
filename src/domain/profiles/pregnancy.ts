import { PersonStanding } from "lucide-react";
import type { ProfileConfig } from "./types";

export const pregnancyProfile: ProfileConfig = {
    id: "pregnancy",
    label: "Schwangerschaft",
    subtitle: "Schonend für Mutter & Kind",
    shortDescription: "Schonende Mineralisation mit erhöhtem Calcium-/Magnesiumbedarf.",
    whenToUse: "Für Schwangere und Stillende mit besonderen Mineralstoffbedürfnissen.",
    chips: ["Nitratarm", "Mehr Ca/Mg"],
    icon: PersonStanding,
    visual: {
        gradientFrom: "#a855f7", // purple-500
        gradientTo: "#ec4899", // pink-500
        colorClass: "bg-purple-500",
        badge: "Mutter & Kind",
    },
    wizard: {
        question: "Bist du schwanger oder planst eine Schwangerschaft?",
        description: "Für Mutter & Kind gelten ähnlich strenge Kriterien wie beim Baby, plus erhöhter Calcium-/Magnesiumbedarf.",
    },
    targets: {
        calcium: { min: 50, max: 200, optimalMin: 100, optimalMax: 200 },
        magnesium: { min: 20, max: 100, optimalMin: 50, optimalMax: 80 },
        sodium: { min: 0, max: 30, optimalMin: 0, optimalMax: 20 },
        potassium: { min: 0, max: 15, optimalMin: 1, optimalMax: 8 },
        bicarbonate: { min: 200, max: 1500, optimalMin: 400, optimalMax: 1000 },
        sulfate: { min: 0, max: 200, optimalMin: 0, optimalMax: 100 },
        chloride: { min: 0, max: 80, optimalMin: 0, optimalMax: 40 },
        nitrate: { min: 0, max: 10, optimalMin: 0, optimalMax: 5 },
        fluoride: { min: 0, max: 1.0, optimalMin: 0, optimalMax: 0.5 },
    },
    scoringWeights: {
        sodium: 2,
        nitrate: 2,
        calcium: 1.5,
        magnesium: 1.5,
        fluoride: 1.2,
    },
    scoringConditions: {
        strictSodium: true,
        strictNitrate: true,
        autoSetFemale: true,
        hideMaleGender: true,
    },
    scoringFocus: [
        { metric: "nitrat", label: "Nitrat", weight: 0.9, tone: "avoid" },
        { metric: "natrium", label: "Natrium", weight: 0.8, tone: "avoid" },
        { metric: "calcium", label: "Calcium", weight: 0.8, tone: "positive" },
        { metric: "magnesium", label: "Magnesium", weight: 0.7, tone: "positive" },
    ],
    metrics: [
        {
            metric: "nitrate",
            label: "Nitrat",
            importance: "kritisch",
            explanation: "Nitrat sollte in der Schwangerschaft sehr niedrig gehalten werden.",
            hints: [
                "Unter 10 mg/L empfohlen.",
                "Ähnliche Kriterien wie für Säuglinge.",
            ],
        },
        {
            metric: "calcium",
            label: "Calcium",
            importance: "sehr hoch",
            explanation: "Erhöhter Calciumbedarf für die Knochenentwicklung des Kindes.",
            hints: [
                "100-200 mg/L optimal.",
                "Unterstützt auch die mütterliche Knochengesundheit.",
            ],
        },
        {
            metric: "magnesium",
            label: "Magnesium",
            importance: "sehr hoch",
            explanation: "Magnesium unterstützt Muskulatur und kann Wadenkrämpfe reduzieren.",
            hints: [
                "50-100 mg/L empfohlen.",
                "Wichtig für Nervenfunktion und Schlaf.",
            ],
        },
        {
            metric: "sodium",
            label: "Natrium",
            importance: "hoch",
            explanation: "Natriumarm, um Wassereinlagerungen zu minimieren.",
            hints: ["Unter 20 mg/L bevorzugt."],
        },
    ],
    wizardPriority: 2,
    immediateFinish: true,
};
