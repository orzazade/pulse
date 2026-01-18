import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, radius, borderColors, textColors } from "@/theme/tokens";

interface SocialLoginSectionProps {
  /** "signin" or "signup" to display appropriate text */
  variant: "signin" | "signup";
}

/**
 * Social Login Section Component
 *
 * Displays a divider with "Or sign in/up with" text and two placeholder
 * rectangular buttons for future social login integration.
 */
export function SocialLoginSection({ variant }: SocialLoginSectionProps) {
  const text = variant === "signin" ? "Or sign in with" : "Or sign up with";

  return (
    <View style={styles.container}>
      {/* Divider with text */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{text}</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Placeholder social login buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.socialButton} disabled>
          {/* Empty placeholder for future social icon */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} disabled>
          {/* Empty placeholder for future social icon */}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing(6), // 24px
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing(4), // 16px
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: borderColors.default,
  },
  dividerText: {
    paddingHorizontal: spacing(3), // 12px
    fontSize: 14,
    color: textColors.secondary,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing(4), // 16px between buttons
  },
  socialButton: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: borderColors.default,
    borderRadius: radius.lg, // 12px - matches design
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
