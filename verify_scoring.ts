
import { calculateScores } from "./src/domain/scoring";
import { ProfileType, WaterAnalysisValues } from "./src/domain/types";

const mockAnalysis: Partial<WaterAnalysisValues> = {
    ph: 7.5,
    calcium: 80,
    magnesium: 30,
    sodium: 10,
    potassium: 5,
    chloride: 20,
    sulfate: 30,
    bicarbonate: 300,
    nitrate: 5,
    totalDissolvedSolids: 400,
    fluoride: 0.5,
};

function runTest(name: string, values: Partial<WaterAnalysisValues>, profile: ProfileType, expectedMaxScore?: number) {
    console.log(`--- Test: ${name} (${profile}) ---`);
    const result = calculateScores(values, profile);
    console.log(`Total Score: ${result.totalScore}`);

    const fluorideScore = result.metrics.find(m => m.metric === "fluoride");
    console.log(`Fluoride Score: ${fluorideScore?.score}`);

    const nitrateScore = result.metrics.find(m => m.metric === "nitrate");
    console.log(`Nitrate Score: ${nitrateScore?.score}`);

    if (expectedMaxScore !== undefined) {
        if (result.totalScore <= expectedMaxScore) {
            console.log("PASS: Score penalty applied correctly.");
        } else {
            console.error(`FAIL: Score ${result.totalScore} exceeds max ${expectedMaxScore}`);
        }
    }
    console.log("");
}

// Test 1: Perfect Water (Standard)
runTest("Perfect Water", mockAnalysis, "standard");

// Test 2: High Fluoride (Baby) - Should trigger penalty
const highFluoride = { ...mockAnalysis, fluoride: 2.0 };
runTest("High Fluoride (Baby)", highFluoride, "baby", 70);

// Test 3: High Nitrate (Baby) - Should trigger penalty
const highNitrate = { ...mockAnalysis, nitrate: 60 };
runTest("High Nitrate (Baby)", highNitrate, "baby", 70);

// Test 4: High Sodium (Baby) - Should trigger penalty
const highSodium = { ...mockAnalysis, sodium: 300 };
runTest("High Sodium (Baby)", highSodium, "baby", 70);
