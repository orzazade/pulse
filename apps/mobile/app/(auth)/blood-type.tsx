import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BLOOD_TYPES, BloodType } from "@convex/lib/bloodType";
import {
  backgroundColors,
  textColors,
  primaryColors,
  semanticColors,
  borderColors,
  spacing,
  radius,
  headingStyles,
  bodyStyles,
} from "@/theme/tokens";

export default function BloodTypeSelection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const updateBloodType = useMutation(api.users.updateBloodType);
  const [selected, setSelected] = useState<BloodType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!selected) return;

    setLoading(true);
    setError("");
    try {
      await updateBloodType({ bloodType: selected });
      router.replace("/location-permission");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save blood type";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDontKnow = async () => {
    const url = "https://www.redcrossblood.org/donate-blood/blood-types.html";
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Cannot Open Link", "Unable to open the browser on this device.");
      }
    } catch {
      Alert.alert("Cannot Open Link", "Unable to open the browser on this device.");
    }
  };

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 24),
      }
    ]}>
      <Text style={styles.title}>What's your blood type?</Text>
      <Text style={styles.subtitle}>
        Your blood type helps us match you with compatible donors and seekers.
        Accurate blood type is essential for safe transfusions.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.grid}>
        {BLOOD_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              selected === type && styles.typeButtonSelected,
            ]}
            onPress={() => setSelected(type)}
          >
            <Text
              style={[
                styles.typeText,
                selected === type && styles.typeTextSelected,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handleDontKnow} style={styles.dontKnowButton}>
        <Text style={styles.dontKnowText}>I don't know my blood type</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!selected || loading) && styles.continueButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={!selected || loading}
      >
        {loading ? (
          <ActivityIndicator color={textColors.onPrimary} />
        ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing(6),
    backgroundColor: backgroundColors.background,
    justifyContent: "center",
  },
  title: {
    ...headingStyles.pageTitle,
    marginBottom: spacing(3),
    color: textColors.primary,
  },
  subtitle: {
    ...bodyStyles.body,
    color: textColors.secondary,
    marginBottom: spacing(8),
  },
  error: {
    color: semanticColors.error,
    marginBottom: spacing(4),
    ...bodyStyles.bodySmall,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing(3),
    marginBottom: spacing(6),
  },
  typeButton: {
    width: "22%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: borderColors.default,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: backgroundColors.background,
  },
  typeButtonSelected: {
    borderColor: primaryColors.primary,
    backgroundColor: primaryColors.primaryLight,
  },
  typeText: {
    fontSize: 20,
    fontWeight: "600",
    color: textColors.primary,
  },
  typeTextSelected: {
    color: primaryColors.primary,
  },
  dontKnowButton: {
    alignItems: "center",
    marginBottom: spacing(6),
  },
  dontKnowText: {
    color: textColors.secondary,
    ...bodyStyles.bodySmall,
    textDecorationLine: "underline",
  },
  continueButton: {
    backgroundColor: primaryColors.primary,
    paddingVertical: spacing(4),
    borderRadius: radius.lg,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: textColors.onPrimary,
    fontWeight: "bold",
    fontSize: 16,
  },
});
