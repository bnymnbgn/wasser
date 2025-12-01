import { useMemo } from "react";
import { calculateGoals } from "@/src/lib/userGoals";
import { useDatabaseContext } from "@/src/contexts/DatabaseContext";
import type { ProfileType } from "@/src/domain/types";

export function useUserProfile() {
  const { userProfile, saveUserProfile } = useDatabaseContext();

  const goals = useMemo(() => {
    if (!userProfile) return null;
    return calculateGoals({
      weight: userProfile.weight,
      height: userProfile.height,
      age: userProfile.age,
      gender: userProfile.gender as any,
      activityLevel: userProfile.activityLevel as any,
      profileType: userProfile.profileType as ProfileType,
    });
  }, [userProfile]);

  return { userProfile, goals, saveUserProfile };
}
