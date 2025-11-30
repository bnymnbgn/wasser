
import { describe, it, expect } from 'vitest';
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

describe('Scoring Logic', () => {
    it('should calculate scores for perfect water (Standard)', () => {
        const result = calculateScores(mockAnalysis, "standard");
        console.log(`Standard Total Score: ${result.totalScore}`);
        expect(result.totalScore).toBeGreaterThan(80);

        const fluorideScore = result.metrics.find(m => m.metric === "fluoride");
        expect(fluorideScore?.score).toBeGreaterThan(80);
    });

    it('should apply penalty for High Fluoride (Baby)', () => {
        const highFluoride = { ...mockAnalysis, fluoride: 2.0 };
        const result = calculateScores(highFluoride, "baby");
        console.log(`High Fluoride (Baby) Total Score: ${result.totalScore}`);

        // Penalty: Max Score 70
        expect(result.totalScore).toBeLessThanOrEqualTo(70);

        const fluorideScore = result.metrics.find(m => m.metric === "fluoride");
        expect(fluorideScore?.score).toBeLessThan(40); // Should be low
    });

    it('should apply penalty for High Nitrate (Baby)', () => {
        const highNitrate = { ...mockAnalysis, nitrate: 60 };
        const result = calculateScores(highNitrate, "baby");
        console.log(`High Nitrate (Baby) Total Score: ${result.totalScore}`);

        // Penalty: Max Score 70
        expect(result.totalScore).toBeLessThanOrEqualTo(70);
    });

    it('should apply penalty for High Sodium (Baby)', () => {
        const highSodium = { ...mockAnalysis, sodium: 300 };
        const result = calculateScores(highSodium, "baby");
        console.log(`High Sodium (Baby) Total Score: ${result.totalScore}`);

        // Penalty: Max Score 70
        expect(result.totalScore).toBeLessThanOrEqualTo(70);
    });
});
