import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  backgroundColors,
  textColors,
  shadows,
  spacing,
  radius,
} from "@/theme/tokens";

interface RequesterCardProps {
  name: string;
  postedAt: number;
}

/**
 * Format timestamp to relative time (e.g., "25 minutes ago")
 */
function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
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
        <Text style={styles.postedTime}>Posted {formatTimeAgo(postedAt)}</Text>
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
