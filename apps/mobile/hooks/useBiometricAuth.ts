import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { AppState, AppStateStatus } from "react-native";
import {
  isBiometricAvailable,
  isBiometricEnabled,
  authenticateWithBiometric,
} from "../lib/biometric";

export function useBiometricAuth() {
  const { isSignedIn, signOut } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check biometric on mount if signed in
    const checkBiometric = async () => {
      if (!isSignedIn) {
        setIsChecking(false);
        return;
      }

      try {
        const available = await isBiometricAvailable();
        const enabled = await isBiometricEnabled();

        if (available && enabled) {
          setIsLocked(true);
          const success = await authenticateWithBiometric();
          if (!success) {
            // User cancelled or failed - stay locked
            // They can retry or sign out
          }
          setIsLocked(!success);
        }
      } catch {
        // Biometric check failed — don't lock the user out
        setIsLocked(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkBiometric();
  }, [isSignedIn]);

  // Re-lock when app comes to foreground after being backgrounded
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && isSignedIn) {
        try {
          const available = await isBiometricAvailable();
          const enabled = await isBiometricEnabled();

          if (available && enabled) {
            setIsLocked(true);
            const success = await authenticateWithBiometric();
            setIsLocked(!success);
          }
        } catch {
          // Biometric check failed on resume — don't lock the user out
          setIsLocked(false);
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [isSignedIn]);

  const unlock = async () => {
    try {
      const success = await authenticateWithBiometric();
      setIsLocked(!success);
      return success;
    } catch {
      // Authentication threw — unlock to prevent user being stuck
      setIsLocked(false);
      return false;
    }
  };

  return { isLocked, isChecking, unlock, signOut };
}
