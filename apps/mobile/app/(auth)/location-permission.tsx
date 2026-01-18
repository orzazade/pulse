import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  typography,
  spacing,
  radius,
  buttonSpec,
} from "@/theme/tokens";

export default function LocationPermissionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const updateLocation = useMutation(api.users.updateLocation);
  const skipLocation = useMutation(api.users.skipLocation);
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableLocation = async () => {
    setIsLoading(true);
    try {
      // Request foreground location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission was denied. You can enable it later in your device settings.",
          [
            {
              text: "Continue Without Location",
              onPress: handleSkipLocation,
            },
          ]
        );
        setIsLoading(false);
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get city/region
      let city: string | undefined;
      let region: string | undefined;

      try {
        const [geocodeResult] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geocodeResult) {
          city = geocodeResult.city || geocodeResult.subregion || undefined;
          region = geocodeResult.region || geocodeResult.country || undefined;
        }
      } catch (geocodeError) {
        // Geocoding failed, but we still have coordinates
        console.warn("Reverse geocoding failed:", geocodeError);
      }

      // Save location to Convex
      await updateLocation({
        city,
        region,
        latitude,
        longitude,
      });

      // Navigate to tabs (or next onboarding step)
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert(
        "Location Error",
        "Unable to get your location. You can try again later.",
        [
          {
            text: "Continue Without Location",
            onPress: handleSkipLocation,
          },
          {
            text: "Try Again",
            onPress: () => setIsLoading(false),
          },
        ]
      );
    }
  };

  const handleSkipLocation = async () => {
    setIsLoading(true);
    try {
      await skipLocation();
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Skip location error:", error);
      setIsLoading(false);
    }
  };

  return (
    <View style={[
      styles.container,
      {
        paddingTop: 80 + insets.top,
        paddingBottom: Math.max(insets.bottom, spacing(12)),
      }
    ]}>
      {/* Large pink circle illustration */}
      <View style={styles.illustrationContainer}>
        <View style={styles.illustration} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Enable Location</Text>

      {/* Benefits as plain text paragraphs */}
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitText}>
          Find nearby blood donors within minutes when you need help
        </Text>

        <Text style={styles.benefitText}>
          Get notified about urgent requests in your area
        </Text>

        <Text style={styles.benefitText}>
          Your exact location is never shared publicly
        </Text>
      </View>

      {/* Spacer to push buttons to bottom */}
      <View style={styles.spacer} />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.enableButton, isLoading && styles.buttonDisabled]}
          onPress={handleEnableLocation}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.enableButtonText}>Enable Location</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipLocation}
          disabled={isLoading}
        >
          <Text style={styles.skipButtonText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing(6),
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: spacing(10),
  },
  illustration: {
    width: 160,
    height: 160,
    borderRadius: radius.full,
    backgroundColor: colors.pinkCircle,
  },
  title: {
    ...typography.pageTitle,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing(10),
  },
  benefitsContainer: {
    gap: spacing(8),
  },
  benefitText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  spacer: {
    flex: 1,
  },
  actions: {
    gap: spacing(3),
  },
  enableButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: buttonSpec.primary.backgroundColor,
    height: buttonSpec.primary.height,
    borderRadius: buttonSpec.primary.borderRadius,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  enableButtonText: {
    color: buttonSpec.primary.textColor,
    fontSize: buttonSpec.primary.fontSize,
    fontWeight: buttonSpec.primary.fontWeight,
  },
  skipButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing(4),
    minHeight: 48,
  },
  skipButtonText: {
    color: colors.secondary,
    fontSize: 16,
  },
});
