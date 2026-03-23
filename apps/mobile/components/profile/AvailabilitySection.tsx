import React from "react";
import { View, Text, Switch, StyleSheet, ActivityIndicator } from "react-native";
import {
  primaryColors,
  backgroundColors,
  borderColors,
  textColors,
  fontWeight,
  bodyStyles,
  spacing,
  radius,
  shadows,
} from "@/theme/tokens";

interface AvailabilitySectionProps {
  isAvailable: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

export function AvailabilitySection({
  isAvailable,
  onToggle,
  isLoading = false,
}: AvailabilitySectionProps) {
  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Available for Donation</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color={primaryColors.primary} />
        ) : (
          <Switch
            value={isAvailable}
            onValueChange={onToggle}
            trackColor={{ false: borderColors.default, true: primaryColors.primaryLight }}
            thumbColor={isAvailable ? primaryColors.primary : backgroundColors.chipInactive}
            ios_backgroundColor={borderColors.default}
          />
        )}
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        When on, you'll receive requests matching your blood type
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: backgroundColors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    ...shadows.light,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...bodyStyles.body,
    fontWeight: fontWeight.semibold,
    color: textColors.primary,
  },
  subtitle: {
    ...bodyStyles.caption,
    color: textColors.secondary,
    marginTop: spacing(1),
  },
});
