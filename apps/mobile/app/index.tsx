import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { hasSeenOnboarding } from "../lib/onboarding";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await hasSeenOnboarding();
      setHasCompletedOnboarding(seen);
      setOnboardingChecked(true);
    };
    checkOnboarding();
  }, []);

  // Auto-create Convex user if signed in with Clerk but no Convex record
  useEffect(() => {
    const ensureUserExists = async () => {
      if (isSignedIn && clerkUser && convexUser === null && !creatingUser) {
        setCreatingUser(true);
        try {
          await getOrCreateUser({
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress,
          });
        } catch (error) {
          console.error("Failed to create user:", error);
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
        <ActivityIndicator size="large" color="#dc2626" />
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

  // Show loading while fetching user data or creating user
  if (convexUser === undefined || convexUser === null || creatingUser) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#dc2626" />
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
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 16,
  },
});
