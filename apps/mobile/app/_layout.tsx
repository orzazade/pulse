import { ClerkProvider, ClerkLoaded, useUser } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { ConvexClientProvider } from "../convex/ConvexClientProvider";
import { ModeProvider } from "../contexts/ModeContext";
import { useBiometricAuth } from "../hooks/useBiometricAuth";
import { getBiometricType } from "../lib/biometric";
import { primaryColors, backgroundColors, textColors, spacing, radius } from "../theme/tokens";
import { registerForPushNotificationsAsync } from "../lib/notifications";
import React, { useEffect, useState, useRef } from "react";

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      console.error("SecureStore getToken failed for key:", key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      console.error("SecureStore saveToken failed for key:", key);
    }
  },
  async clearToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      console.error("SecureStore clearToken failed for key:", key);
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn(
    "Clerk not configured. Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env.local"
  );
}

function LockScreen({ onUnlock, onSignOut }: { onUnlock: () => void; onSignOut: () => void }) {
  const [biometricType, setBiometricType] = useState<"fingerprint" | "facial" | "iris" | null>(null);

  useEffect(() => {
    getBiometricType().then(setBiometricType).catch(() => {
      // Fallback to generic label if biometric detection fails
      setBiometricType(null);
    });
  }, []);

  const biometricLabel = biometricType === "facial" ? "Face ID" : biometricType === "fingerprint" ? "Touch ID" : "Biometric";
  const biometricIcon = biometricType === "facial" ? "scan" : "finger-print";

  return (
    <View style={lockStyles.container}>
      <View style={lockStyles.logoContainer}>
        <Ionicons name="water" size={80} color={primaryColors.primary} />
        <Text style={lockStyles.title}>Pulse</Text>
      </View>

      <TouchableOpacity style={lockStyles.unlockButton} onPress={onUnlock}>
        <Ionicons name={biometricIcon} size={32} color={textColors.onPrimary} />
        <Text style={lockStyles.unlockText}>Unlock with {biometricLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={lockStyles.signOutButton} onPress={onSignOut}>
        <Text style={lockStyles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const lockStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: backgroundColors.background,
    padding: spacing(5),
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing(15),
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: primaryColors.primary,
    marginTop: 10,
  },
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: primaryColors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: radius.lg,
    gap: spacing(3),
  },
  unlockText: {
    color: textColors.onPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  signOutButton: {
    marginTop: 30,
    padding: 10,
  },
  signOutText: {
    color: textColors.secondary,
    fontSize: 16,
  },
});

/**
 * Registers push notification token when user is signed in
 * Runs once on sign-in and stores token in Convex
 */
function PushNotificationRegistrar() {
  const { isSignedIn } = useUser();
  const updatePushToken = useMutation(api.users.updatePushToken);
  const hasRegistered = useRef(false);

  useEffect(() => {
    // Only run when signed in and not already registered this session
    if (!isSignedIn || hasRegistered.current) return;

    const registerToken = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await updatePushToken({ pushToken: token });
          hasRegistered.current = true;
          console.warn("Push token registered successfully");
        }
      } catch (error) {
        // Log but don't crash - push notifications are not critical
        console.error("Failed to register push token:", error);
      }
    };

    registerToken();
  }, [isSignedIn, updatePushToken]);

  return null; // This component doesn't render anything
}

function BiometricGate({ children }: { children: React.ReactNode }) {
  const { isLocked, isChecking, unlock, signOut } = useBiometricAuth();

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: backgroundColors.background }}>
        <ActivityIndicator size="large" color={primaryColors.primary} />
      </View>
    );
  }

  if (isLocked) {
    return <LockScreen onUnlock={unlock} onSignOut={signOut} />;
  }

  return <>{children}</>;
}

function AppContent() {
  return (
    <BiometricGate>
      <PushNotificationRegistrar />
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </BiometricGate>
  );
}

export default function RootLayout() {
  // Render without Clerk if not configured (development setup)
  if (!publishableKey) {
    return (
      <ConvexClientProvider>
        <ModeProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </ModeProvider>
      </ConvexClientProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexClientProvider>
          <ModeProvider>
            <AppContent />
          </ModeProvider>
        </ConvexClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
