import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const BIOMETRIC_ENABLED_KEY = "biometric_enabled";

export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return false;

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch {
    // Some devices throw on biometric hardware queries — safe fallback
    return false;
  }
}

export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return value === "true";
  } catch {
    // SecureStore failure — assume biometric not enabled to avoid locking user out
    return false;
  }
}

export async function authenticateWithBiometric(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Authenticate to access Pulse",
    fallbackLabel: "Use passcode",
    cancelLabel: "Cancel",
    disableDeviceFallback: false,
  });

  return result.success;
}

export async function getBiometricType(): Promise<"fingerprint" | "facial" | "iris" | null> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return "facial";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "fingerprint";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "iris";
    }
    return null;
  } catch {
    return null;
  }
}
