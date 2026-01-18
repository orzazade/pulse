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
      setIsChecking(false);
    };

    checkBiometric();
  }, [isSignedIn]);

  // Re-lock when app comes to foreground after being backgrounded
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && isSignedIn) {
        const available = await isBiometricAvailable();
        const enabled = await isBiometricEnabled();

        if (available && enabled) {
          setIsLocked(true);
          const success = await authenticateWithBiometric();
          setIsLocked(!success);
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [isSignedIn]);

  const unlock = async () => {
    const success = await authenticateWithBiometric();
    setIsLocked(!success);
    return success;
  };

  return { isLocked, isChecking, unlock, signOut };
}
