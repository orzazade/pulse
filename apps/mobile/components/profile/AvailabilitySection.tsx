import React from "react";
import { View, Text, Switch, StyleSheet, ActivityIndicator } from "react-native";
import {
  primaryColors,
  textColors,
  fontWeight,
  bodyStyles,
  spacing,
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
            trackColor={{ false: "#E5E7EB", true: primaryColors.primaryLight }}
            thumbColor={isAvailable ? primaryColors.primary : "#f4f3f4"}
            ios_backgroundColor="#E5E7EB"
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
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(4),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: fontWeight.semibold,
    color: textColors.primary,
  },
  subtitle: {
    ...bodyStyles.bodySmall,
    color: textColors.secondary,
    marginTop: spacing(1),
  },
});
