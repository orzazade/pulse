import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, textColors, primaryColors } from "@/theme/tokens";

interface TermsCheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Callback when checkbox is toggled */
  onToggle: () => void;
}

/**
 * Terms Checkbox Component
 *
 * Custom checkbox for terms acceptance with styled links for
 * "Terms of Service" and "Privacy Policy".
 */
export function TermsCheckbox({ checked, onToggle }: TermsCheckboxProps) {
  const handleTermsPress = () => {
    // Placeholder - will link to actual Terms of Service later
    Alert.alert("Terms of Service", "Terms of Service will be available soon.");
  };

  const handlePrivacyPress = () => {
    // Placeholder - will link to actual Privacy Policy later
    Alert.alert("Privacy Policy", "Privacy Policy will be available soon.");
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && (
          <Ionicons name="checkmark" size={14} color={colors.onPrimary} />
        )}
      </View>
      <Text style={styles.text}>
        I agree to the{" "}
        <Text style={styles.link} onPress={handleTermsPress}>
          Terms of Service
        </Text>
        {" "}and{" "}
        <Text style={styles.link} onPress={handlePrivacyPress}>
          Privacy Policy
        </Text>
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing(4), // 16px
    paddingRight: spacing(4), // 16px for text wrapping
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: textColors.tertiary,
    borderRadius: radius.sm, // 4px
    marginRight: spacing(3), // 12px
    marginTop: 2, // Align with first line of text
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: primaryColors.primary,
    borderColor: primaryColors.primary,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: textColors.secondary,
    lineHeight: 20,
  },
  link: {
    color: primaryColors.primary,
    fontWeight: "500",
  },
});
