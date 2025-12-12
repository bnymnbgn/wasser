import type { LucideIcon } from "lucide-react";

/**
 * Target range for a mineral metric (for visualization bars)
 */
export interface TargetRange {
    min: number;
    max: number;
    optimalMin: number;
    optimalMax: number;
}

/**
 * Scoring focus item for a profile
 */
export interface ScoringFocus {
    metric: string;
    label: string;
    weight: number;
    tone: "positive" | "avoid" | "moderate" | "neutral";
}

/**
 * Metric info for profile cheatsheet
 */
export interface MetricInfo {
    metric: string;
    label: string;
    importance: "kritisch" | "sehr hoch" | "hoch" | "mittel" | "niedrig";
    explanation: string;
    hints: string[];
}

/**
 * Wizard step configuration
 */
export interface WizardConfig {
    question: string;
    description: string;
}

/**
 * Visual presentation configuration
 */
export interface VisualConfig {
    gradientFrom: string;
    gradientTo: string;
    colorClass: string;
    badge?: string;
}

/**
 * Scoring weights for this profile
 */
export interface ScoringWeights {
    calcium?: number;
    magnesium?: number;
    sodium?: number;
    potassium?: number;
    nitrate?: number;
    fluoride?: number;
    bicarbonate?: number;
    sulfate?: number;
    chloride?: number;
}

/**
 * Special scoring conditions (e.g., "use baby thresholds for nitrate")
 */
export interface ScoringConditions {
    /** Use stricter sodium thresholds (like baby/blood_pressure) */
    strictSodium?: boolean;
    /** Use stricter nitrate thresholds (like baby) */
    strictNitrate?: boolean;
    /** Auto-set gender to female in wizard */
    autoSetFemale?: boolean;
    /** Hide male gender option in wizard */
    hideMaleGender?: boolean;
}

/**
 * Complete profile configuration - all data in one place
 */
export interface ProfileConfig {
    /** Unique identifier (matches ProfileType) */
    id: string;

    /** Display label (e.g., "Schwangerschaft") */
    label: string;

    /** Short subtitle for wizard (e.g., "Schonend für Mutter & Kind") */
    subtitle: string;

    /** Short description for cheatsheet */
    shortDescription: string;

    /** When to use this profile */
    whenToUse: string;

    /** Chips shown in wizard/selector */
    chips: string[];

    /** Lucide icon component */
    icon: LucideIcon;

    /** Visual presentation (colors, badge) */
    visual: VisualConfig;

    /** Wizard step configuration */
    wizard: WizardConfig;

    /** Target ranges for visualization bars */
    targets: Partial<Record<string, TargetRange>>;

    /** Scoring weights (default is 1) */
    scoringWeights: ScoringWeights;

    /** Special scoring conditions */
    scoringConditions: ScoringConditions;

    /** Scoring focus items */
    scoringFocus: ScoringFocus[];

    /** Metric information for cheatsheet */
    metrics: MetricInfo[];

    /** Priority for wizard flow (lower = asked earlier, null = not in wizard) */
    wizardPriority: number | null;

    /** If true, immediately finish wizard when answered "yes" */
    immediateFinish?: boolean;
}

/**
 * Profile type union - matches domain/types.ts ProfileType
 */
export type ProfileId =
    | "standard"
    | "baby"
    | "sport"
    | "blood_pressure"
    | "coffee"
    | "kidney"
    | "pregnancy"
    | "seniors"
    | "diabetes";
