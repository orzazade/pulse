import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  textColors,
  backgroundColors,
  borderColors,
  shadows,
  radius,
  spacing,
  headingStyles,
  bodyStyles,
  fontWeight,
  primaryColors,
} from "@/theme/tokens";

interface NavigateStepProps {
  location: string;
  address: string;
  onGetDirections: () => void;
}

export function NavigateStep({
  location,
  address,
  onGetDirections,
}: NavigateStepProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>STEP 2: NAVIGATE</Text>
      <View style={styles.card}>
        <View style={styles.locationRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="location" size={24} color={primaryColors.primary} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{location}</Text>
            <Text style={styles.locationAddress}>{address}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={onGetDirections}
          activeOpacity={0.7}
        >
          <Ionicons name="navigate-outline" size={18} color={textColors.primary} />
          <Text style={styles.directionsButtonText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing(4),
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
    color: textColors.secondary,
    letterSpacing: 0.5,
    marginBottom: spacing(2),
  },
  card: {
    backgroundColor: backgroundColors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    ...shadows.light,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing(4),
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing(3),
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: headingStyles.cardTitle.fontSize,
    fontWeight: headingStyles.cardTitle.fontWeight,
    color: textColors.primary,
    lineHeight: headingStyles.cardTitle.lineHeight,
    marginBottom: spacing(1),
  },
  locationAddress: {
    fontSize: bodyStyles.bodySmall.fontSize,
    fontWeight: bodyStyles.bodySmall.fontWeight,
    color: textColors.secondary,
    lineHeight: bodyStyles.bodySmall.lineHeight,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: borderColors.default,
    backgroundColor: backgroundColors.background,
    gap: spacing(2),
  },
  directionsButtonText: {
    fontSize: bodyStyles.body.fontSize,
    fontWeight: fontWeight.medium,
    color: textColors.primary,
  },
});
