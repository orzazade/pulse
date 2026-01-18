import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  typography,
  spacing,
  radius,
  buttonSpec,
  inputSpec,
} from "@/theme/tokens";

export default function PhoneVerify() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const updatePhone = useMutation(api.users.updatePhone);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Format for Azerbaijan: +994 XX XXX XX XX
  const formatPhone = (text: string) => {
    // Strip non-digits
    const digits = text.replace(/\D/g, "");
    // Add +994 prefix if not present
    if (digits.length <= 12) {
      return digits;
    }
    return digits.slice(0, 12);
  };

  const validatePhone = (phone: string) => {
    // Azerbaijan phone: 9 digits after country code
    const digits = phone.replace(/\D/g, "");
    return digits.length === 12 && digits.startsWith("994");
  };

  const onSubmit = async () => {
    const formatted = formatPhone(phone);
    if (!validatePhone(formatted)) {
      setError("Please enter a valid Azerbaijan phone number");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await updatePhone({ phone: `+${formatted}` });
      router.replace("/location-permission");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save phone number";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Format display number with spaces: "50 000 00 00"
  const formatDisplayNumber = (digits: string) => {
    const localDigits = digits.replace(/^994/, "");
    if (localDigits.length === 0) return "";
    if (localDigits.length <= 2) return localDigits;
    if (localDigits.length <= 5) return `${localDigits.slice(0, 2)} ${localDigits.slice(2)}`;
    if (localDigits.length <= 7) return `${localDigits.slice(0, 2)} ${localDigits.slice(2, 5)} ${localDigits.slice(5)}`;
    return `${localDigits.slice(0, 2)} ${localDigits.slice(2, 5)} ${localDigits.slice(5, 7)} ${localDigits.slice(7, 9)}`;
  };

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top + spacing(10),
        paddingBottom: Math.max(insets.bottom, spacing(6)),
      }
    ]}>
      {/* Pink circle decoration */}
      <View style={styles.decoration} />

      {/* Title */}
      <Text style={styles.title}>What's your number?</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        We need this to verify your identity and connect you during emergencies.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Phone input container */}
      <View style={styles.phoneInputContainer}>
        {/* Flag and prefix section */}
        <View style={styles.prefixSection}>
          <Text style={styles.flag}>🇦🇿</Text>
          <Text style={styles.prefix}>+994</Text>
        </View>

        {/* Vertical separator */}
        <View style={styles.separator} />

        {/* Phone input */}
        <TextInput
          style={styles.input}
          placeholder="50 000 00 00"
          placeholderTextColor={colors.tertiary}
          value={formatDisplayNumber(phone)}
          onChangeText={(text) => {
            const digits = text.replace(/\D/g, "");
            setPhone("994" + digits.slice(0, 9));
          }}
          keyboardType="phone-pad"
          maxLength={12} // "50 000 00 00" with spaces
        />
      </View>

      {/* Privacy notice card */}
      <View style={styles.privacyCard}>
        <Text style={styles.privacyText}>
          Your phone number is kept private. We will only share it with a donor or seeker once you explicitly accept a request.
        </Text>
      </View>

      {/* Spacer to push button to bottom */}
      <View style={styles.spacer} />

      {/* Continue button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Continue"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing(6),
    backgroundColor: colors.background,
  },
  decoration: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.pinkCircle,
    marginBottom: spacing(8),
  },
  title: {
    ...typography.pageTitle,
    color: colors.primary,
    marginBottom: spacing(3),
  },
  subtitle: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing(8),
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.default,
    borderRadius: radius.lg,
    height: inputSpec.height,
    backgroundColor: colors.background,
    marginBottom: spacing(6),
  },
  prefixSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(4),
    gap: spacing(2),
  },
  flag: {
    fontSize: 20,
  },
  prefix: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "500",
  },
  separator: {
    width: 1,
    height: 28,
    backgroundColor: colors.default,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing(4),
    fontSize: 16,
    color: colors.text.primary,
    height: "100%",
  },
  privacyCard: {
    backgroundColor: "#F5F5F5",
    borderLeftWidth: 3,
    borderLeftColor: "#E0E0E0",
    borderRadius: radius.md,
    padding: spacing(4),
  },
  privacyText: {
    ...typography.bodySmall,
    color: colors.secondary,
    lineHeight: 20,
  },
  spacer: {
    flex: 1,
  },
  button: {
    backgroundColor: buttonSpec.primary.backgroundColor,
    height: buttonSpec.primary.height,
    borderRadius: buttonSpec.primary.borderRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: buttonSpec.primary.textColor,
    fontSize: buttonSpec.primary.fontSize,
    fontWeight: buttonSpec.primary.fontWeight,
  },
  error: {
    color: colors.error,
    marginBottom: spacing(4),
    fontSize: 14,
  },
});
