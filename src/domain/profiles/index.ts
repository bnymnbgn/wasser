/**
 * Centralized Profile Configuration
 * 
 * All profile data is now consolidated in individual profile files.
 * This index exports everything and provides backward-compatible helpers.
 */

import type { ProfileConfig, ProfileId, TargetRange, ScoringFocus, MetricInfo } from "./types";
import type { LucideIcon } from "lucide-react";

// Import all profiles
import { standardProfile } from "./standard";
import { babyProfile } from "./baby";
import { sportProfile } from "./sport";
import { bloodPressureProfile } from "./blood_pressure";
import { coffeeProfile } from "./coffee";
import { kidneyProfile } from "./kidney";
import { pregnancyProfile } from "./pregnancy";
import { seniorsProfile } from "./seniors";
import { diabetesProfile } from "./diabetes";

// Re-export types
export type { ProfileConfig, ProfileId, TargetRange, ScoringFocus, MetricInfo } from "./types";

// =============================================================================
// MASTER PROFILES RECORD
// =============================================================================

/**
 * All profiles as a single record - the source of truth
 */
export const PROFILES: Record<ProfileId, ProfileConfig> = {
    standard: standardProfile,
    baby: babyProfile,
    sport: sportProfile,
    blood_pressure: bloodPressureProfile,
    coffee: coffeeProfile,
    kidney: kidneyProfile,
    pregnancy: pregnancyProfile,
    seniors: seniorsProfile,
    diabetes: diabetesProfile,
};

/**
 * All profile IDs as an array
 */
export const PROFILE_IDS: ProfileId[] = Object.keys(PROFILES) as ProfileId[];

/**
 * Get a profile by ID
 */
export function getProfile(id: ProfileId): ProfileConfig {
    return PROFILES[id];
}

// =============================================================================
// BACKWARD-COMPATIBLE EXPORTS
// =============================================================================

/**
 * Profile labels (for HistoryList, etc.)
 * @deprecated Use PROFILES[id].label instead
 */
export const PROFILE_LABELS: Record<ProfileId, string> = Object.fromEntries(
    PROFILE_IDS.map((id) => [id, PROFILES[id].label])
) as Record<ProfileId, string>;

/**
 * Profile icons (for ProfileOnboardingTabs, etc.)
 * @deprecated Use PROFILES[id].icon instead
 */
export const PROFILE_ICONS: Record<ProfileId, LucideIcon> = Object.fromEntries(
    PROFILE_IDS.map((id) => [id, PROFILES[id].icon])
) as Record<ProfileId, LucideIcon>;

/**
 * Profile meta (for ProfileWizard)
 * @deprecated Use PROFILES[id] directly
 */
export const PROFILE_META: Record<ProfileId, {
    label: string;
    subtitle: string;
    chips: string[];
    icon: LucideIcon;
}> = Object.fromEntries(
    PROFILE_IDS.map((id) => [id, {
        label: PROFILES[id].label,
        subtitle: PROFILES[id].subtitle,
        chips: PROFILES[id].chips,
        icon: PROFILES[id].icon,
    }])
) as Record<ProfileId, { label: string; subtitle: string; chips: string[]; icon: LucideIcon }>;

/**
 * Profile presentation (for ProfileSelector)
 * @deprecated Use PROFILES[id].visual instead
 */
export const PROFILE_PRESENTATION: Record<ProfileId, {
    icon: LucideIcon;
    gradientFrom: string;
    gradientTo: string;
    colorClass: string;
    badge?: string;
}> = Object.fromEntries(
    PROFILE_IDS.map((id) => [id, {
        icon: PROFILES[id].icon,
        gradientFrom: PROFILES[id].visual.gradientFrom,
        gradientTo: PROFILES[id].visual.gradientTo,
        colorClass: PROFILES[id].visual.colorClass,
        badge: PROFILES[id].visual.badge,
    }])
) as Record<ProfileId, { icon: LucideIcon; gradientFrom: string; gradientTo: string; colorClass: string; badge?: string }>;

/**
 * Profile targets (for WaterScoreCard visualization)
 * @deprecated Use PROFILES[id].targets instead
 */
export const PROFILE_TARGETS: Record<ProfileId, Partial<Record<string, TargetRange>>> = Object.fromEntries(
    PROFILE_IDS.map((id) => [id, PROFILES[id].targets])
) as Record<ProfileId, Partial<Record<string, TargetRange>>>;

/**
 * Wizard steps sorted by priority
 */
export const WIZARD_STEPS = PROFILE_IDS
    .filter((id) => PROFILES[id].wizardPriority !== null)
    .sort((a, b) => (PROFILES[a].wizardPriority ?? 999) - (PROFILES[b].wizardPriority ?? 999))
    .map((id) => ({
        id,
        question: PROFILES[id].wizard.question,
        description: PROFILES[id].wizard.description,
        icon: PROFILES[id].icon,
    }));

/**
 * Profiles that should immediately finish the wizard when selected
 */
export const IMMEDIATE_FINISH_PROFILES: ProfileId[] = PROFILE_IDS.filter(
    (id) => PROFILES[id].immediateFinish
);

// =============================================================================
// PROFILE CHEATSHEET (for scoring display)
// =============================================================================

/**
 * Profile cheatsheet data (for ScoreBreakdown, etc.)
 * @deprecated Use PROFILES[id].scoringFocus and PROFILES[id].metrics instead
 */
export const PROFILE_CHEATSHEET: Record<ProfileId, {
    id: string;
    label: string;
    shortDescription: string;
    whenToUse: string;
    scoringFocus: ScoringFocus[];
    metrics: MetricInfo[];
}> = Object.fromEntries(
    PROFILE_IDS.map((id) => [id, {
        id: PROFILES[id].id,
        label: PROFILES[id].label,
        shortDescription: PROFILES[id].shortDescription,
        whenToUse: PROFILES[id].whenToUse,
        scoringFocus: PROFILES[id].scoringFocus,
        metrics: PROFILES[id].metrics,
    }])
) as Record<ProfileId, {
    id: string;
    label: string;
    shortDescription: string;
    whenToUse: string;
    scoringFocus: ScoringFocus[];
    metrics: MetricInfo[];
}>;

// =============================================================================
// SCORING HELPERS
// =============================================================================

/**
 * Check if a profile uses strict sodium thresholds
 */
export function usesStrictSodium(profileId: ProfileId): boolean {
    return PROFILES[profileId].scoringConditions.strictSodium ?? false;
}

/**
 * Check if a profile uses strict nitrate thresholds
 */
export function usesStrictNitrate(profileId: ProfileId): boolean {
    return PROFILES[profileId].scoringConditions.strictNitrate ?? false;
}

/**
 * Get scoring weight for a specific metric and profile
 */
export function getScoringWeight(profileId: ProfileId, metric: string): number {
    const weights = PROFILES[profileId].scoringWeights;
    return (weights as Record<string, number>)[metric] ?? 1;
}

/**
 * Check if male gender should be hidden for this profile
 */
export function shouldHideMaleGender(profileId: ProfileId): boolean {
    return PROFILES[profileId].scoringConditions.hideMaleGender ?? false;
}

/**
 * Check if female gender should be auto-set for this profile
 */
export function shouldAutoSetFemale(profileId: ProfileId): boolean {
    return PROFILES[profileId].scoringConditions.autoSetFemale ?? false;
}
