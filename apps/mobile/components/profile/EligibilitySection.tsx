import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  primaryColors,
  backgroundColors,
  textColors,
  semanticColors,
  fontWeight,
  specialStyles,
  bodyStyles,
  spacing,
  radius,
  shadows,
} from "@/theme/tokens";

interface EligibilitySectionProps {
  isEligible: boolean;
  daysUntilEligible?: number;
  subtitle?: string;
}

export function EligibilitySection({
  isEligible,
  daysUntilEligible = 0,
  subtitle,
}: EligibilitySectionProps) {
  const title = isEligible ? "Eligible to Donate" : "Not Eligible Yet";
  const defaultSubtitle = isEligible
    ? "You can donate blood now"
    : `${daysUntilEligible} days until you can donate`;
  const displaySubtitle = subtitle || defaultSubtitle;
  const badgeText = isEligible ? "ELIGIBLE" : "NOT ELIGIBLE";

  return (
    <View style={styles.container}>
      {/* Status Dot */}
      <View
        style={[
          styles.statusDot,
          isEligible ? styles.dotEligible : styles.dotNotEligible,
        ]}
      />

      {/* Text Content */}
      <View style={styles.textContent}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{displaySubtitle}</Text>
      </View>

      {/* Status Badge */}
      <View
        style={[
          styles.badge,
          isEligible ? styles.badgeEligible : styles.badgeNotEligible,
        ]}
      >
        <Text style={styles.badgeText}>{badgeText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: backgroundColors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    ...shadows.light,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing(3),
  },
  dotEligible: {
    backgroundColor: semanticColors.success,
  },
  dotNotEligible: {
    backgroundColor: primaryColors.primary,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: fontWeight.semibold,
    color: textColors.primary,
    marginBottom: spacing(1),
  },
  subtitle: {
    ...bodyStyles.bodySmall,
    color: textColors.secondary,
  },
  badge: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: radius.sm,
  },
  badgeEligible: {
    backgroundColor: semanticColors.success,
  },
  badgeNotEligible: {
    backgroundColor: primaryColors.primary,
  },
  badgeText: {
    ...specialStyles.badge,
    color: textColors.onPrimary,
  },
});
