import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
type BloodType = (typeof BLOOD_TYPES)[number];

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

  const handleDontKnow = () => {
    // Link to information about blood type testing
    Linking.openURL(
      "https://www.redcrossblood.org/donate-blood/blood-types.html"
    );
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
          <ActivityIndicator color="#fff" />
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
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 32,
    lineHeight: 24,
  },
  error: {
    color: "#dc2626",
    marginBottom: 16,
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    width: "22%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  typeButtonSelected: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  typeText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
  },
  typeTextSelected: {
    color: "#dc2626",
  },
  dontKnowButton: {
    alignItems: "center",
    marginBottom: 24,
  },
  dontKnowText: {
    color: "#6b7280",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  continueButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#fca5a5",
  },
  continueButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
