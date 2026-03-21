import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  backgroundColors,
  textColors,
  shadows,
  spacing,
  radius,
} from "@/theme/tokens";
import { getTimeAgo } from "@/lib/timeFormat";

interface RequesterCardProps {
  name: string;
  postedAt: number;
}

/**
 * Get initials from a name (e.g., "Anar M." -> "AM")
 */
function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function RequesterCard({ name, postedAt }: RequesterCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(name)}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name}>Requested by {name}</Text>
        <Text style={styles.postedTime}>Posted {getTimeAgo(postedAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: backgroundColors.card,
    borderRadius: radius.lg, // 12px
    padding: spacing(4), // 16px
    ...shadows.medium,
    width: "100%",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB", // Gray placeholder
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing(3), // 12px
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: textColors.secondary,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: textColors.primary,
    marginBottom: spacing(1), // 4px
  },
  postedTime: {
    fontSize: 14,
    color: textColors.secondary,
  },
});
