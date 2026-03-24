import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { hasSeenOnboarding } from "../lib/onboarding";
import { primaryColors, semanticColors, backgroundColors, textColors, radius, spacing } from "@/theme/tokens";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState(false);

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const seen = await hasSeenOnboarding();
        setHasCompletedOnboarding(seen);
      } catch {
        // AsyncStorage failure — assume onboarding completed to avoid blocking signed-in users
        setHasCompletedOnboarding(true);
      }
      setOnboardingChecked(true);
    };
    checkOnboarding();
  }, []);

  // Auto-create Convex user if signed in with Clerk but no Convex record
  useEffect(() => {
    const ensureUserExists = async () => {
      if (isSignedIn && clerkUser && convexUser === null && !creatingUser) {
        setCreatingUser(true);
        setCreateUserError(false);
        try {
          await getOrCreateUser({
            email: clerkUser.emailAddresses[0]?.emailAddress,
          });
        } catch (error) {
          console.error("Failed to create user:", error);
          setCreateUserError(true);
        }
        setCreatingUser(false);
      }
    };
    ensureUserExists();
  }, [isSignedIn, clerkUser, convexUser, creatingUser, getOrCreateUser]);

  // Show loading while Clerk or onboarding check initializes
  if (!isLoaded || !onboardingChecked) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={primaryColors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If not signed in and hasn't seen onboarding, show onboarding
  if (!isSignedIn && !hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // Redirect to sign-in if not authenticated but has seen onboarding
  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  // Show error state if user creation failed
  if (createUserError && !creatingUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Something went wrong setting up your profile.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setCreateUserError(false)}
        >
          <Text style={styles.retryText}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading while fetching user data or creating user
  if (convexUser === undefined || convexUser === null || creatingUser) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={primaryColors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Redirect to phone collection if user has no phone
  if (convexUser && !convexUser.phone) {
    return <Redirect href="/phone-verify" />;
  }

  // Redirect to blood type selection if user has no blood type
  if (convexUser && !convexUser.bloodType) {
    return <Redirect href="/blood-type" />;
  }

  // Redirect to location permission if user hasn't made a choice yet
  // locationGranted being undefined means no choice made
  // locationGranted being true or false means user made a decision
  if (convexUser && convexUser.locationGranted === undefined) {
    return <Redirect href="/location-permission" />;
  }

  // Redirect authenticated users to tabs
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: backgroundColors.background,
  },
  loadingText: {
    fontSize: 16,
    color: textColors.secondary,
    marginTop: spacing(4),
  },
  errorText: {
    fontSize: 16,
    color: semanticColors.error,
    textAlign: "center",
    marginBottom: spacing(4),
    paddingHorizontal: spacing(8),
  },
  retryButton: {
    backgroundColor: primaryColors.primary,
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    borderRadius: radius.md,
  },
  retryText: {
    color: textColors.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});
