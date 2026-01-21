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
        <Text style={styles.statNumber}>{donations}</Text>
        <Text style={styles.statLabel}>DONATIONS</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Lives Helped - Red number */}
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{livesHelped}</Text>
        <Text style={styles.statLabel}>LIVES HELPED</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Days Since - Red number */}
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{daysSince}</Text>
        <Text style={styles.statLabel}>DAYS SINCE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(4),
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: primaryColors.primary,
    marginBottom: spacing(1),
  },
  statLabel: {
    ...bodyStyles.caption,
    color: textColors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: borderColors.default,
  },
});
