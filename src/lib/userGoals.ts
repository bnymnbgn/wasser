import type { ProfileType } from "@/src/domain/types";

interface GoalInput {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: "male" | "female" | "other";
  activityLevel: "sedentary" | "moderate" | "active" | "very_active";
  profileType: ProfileType;
}

export function calculateDailyWaterNeed(input: GoalInput): number {
  const { weight, gender, activityLevel } = input;
  let baseWater = weight * 35; // ml per kg

  if (gender === "male") baseWater *= 1.1;
  if (gender === "female") baseWater *= 0.95;

  const multipliers: Record<string, number> = {
    sedentary: 1.0,
    moderate: 1.15,
    active: 1.3,
    very_active: 1.5,
  };

  baseWater *= multipliers[activityLevel] || 1.0;

  return Math.round(baseWater);
}

export function calculateNutrientGoals(input: GoalInput) {
  const { gender, age, profileType } = input;

  const goals = {
    calcium: 1000,
    magnesium: gender === "male" ? 400 : 310,
    potassium: 4000,
    sodium: 2000,
  };

  if (profileType === "sport") {
    goals.magnesium = Math.round(goals.magnesium * 1.5);
    goals.potassium = Math.round(goals.potassium * 1.3);
  }

  if (profileType === "blood_pressure") {
    goals.sodium = 1500;
  }

  if (profileType === "kidney") {
    goals.sodium = 1200;
    goals.potassium = 2500;
  }

  if (age > 50) {
    goals.calcium = 1200;
  }

  return goals;
}

export function calculateGoals(input: GoalInput) {
  const water = calculateDailyWaterNeed(input);
  const nutrients = calculateNutrientGoals(input);
  return {
    dailyWaterGoal: water,
    dailyCalciumGoal: nutrients.calcium,
    dailyMagnesiumGoal: nutrients.magnesium,
    dailyPotassiumGoal: nutrients.potassium,
    dailySodiumGoal: nutrients.sodium,
  };
}
