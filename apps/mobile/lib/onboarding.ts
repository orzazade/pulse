import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "pulse_has_seen_onboarding";

/**
 * Check if user has completed the onboarding flow
 * @returns Promise<boolean> - true if onboarding was completed
 */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === "true";
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    // Default to false if there's an error - user will see onboarding
    return false;
  }
}

/**
 * Mark onboarding as complete
 * Call this when user finishes the onboarding slides
 */
export async function markOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  } catch (error) {
    console.error("Error marking onboarding complete:", error);
    // Silently fail - user may see onboarding again but that's not critical
  }
}

/**
 * Reset onboarding status - for testing/development
 * This allows re-showing onboarding slides
 */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error("Error resetting onboarding:", error);
  }
}
