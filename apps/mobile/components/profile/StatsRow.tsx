import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  primaryColors,
  textColors,
  borderColors,
  bodyStyles,
  fontWeight,
  spacing,
} from "@/theme/tokens";

interface StatsRowProps {
  donations: number;
  livesHelped: number;
  daysSince: number;
}

export function StatsRow({ donations, livesHelped, daysSince }: StatsRowProps) {
  return (
    <View style={styles.container}>
      {/* Donations - Red number */}
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, styles.primaryNumber]}>{donations}</Text>
        <Text style={styles.statLabel}>Donations</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Lives Helped */}
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{livesHelped}</Text>
        <Text style={styles.statLabel}>Lives Helped</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Days Since */}
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{daysSince}</Text>
        <Text style={styles.statLabel}>Days Since</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(4),
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: textColors.primary,
    marginBottom: spacing(1),
  },
  primaryNumber: {
    color: primaryColors.primary,
  },
  statLabel: {
    ...bodyStyles.caption,
    color: textColors.secondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: borderColors.default,
  },
});
