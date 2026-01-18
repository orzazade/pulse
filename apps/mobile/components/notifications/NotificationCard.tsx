import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  textColors,
  primaryColors,
  backgroundColors,
  shadows,
  spacing,
  radius,
} from "@/theme/tokens";
import { Id } from "@convex/_generated/dataModel";

type NotificationType =
  | "request_match"
  | "request_accepted"
  | "eligibility_reminder"
  | "thank_you"
  | "general";

interface NotificationData {
  _id: Id<"notifications">;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
  data?: {
    requestId?: Id<"requests">;
  };
}

interface NotificationCardProps {
  notification: NotificationData;
  onPress: () => void;
}

/**
 * Get timestamp display text
 * Shows relative time (e.g., "10 minutes ago", "2 hours ago")
 * or absolute time for older notifications
 */
function getTimeDisplay(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days === 1) {
    // Return time for yesterday
    const date = new Date(timestamp);
    return `Yesterday at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }
  // For older, return formatted date and time
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

/**
 * Get icon name based on notification type
 */
function getIconForType(type: NotificationType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "request_match":
      return "megaphone"; // Urgent request - megaphone icon (matching PNG)
    case "request_accepted":
      return "checkmark-circle"; // Green checkmark
    case "eligibility_reminder":
      return "shield-checkmark"; // Blue shield with check (Profile Verified)
    case "thank_you":
    case "general":
    default:
      return "information-circle"; // Blue info circle
  }
}

/**
 * Get icon color based on notification type
 */
function getIconColorForType(type: NotificationType): string {
  switch (type) {
    case "request_match":
      return "#DC2626"; // Red for urgent
    case "request_accepted":
      return "#10B981"; // Green for success
    case "eligibility_reminder":
      return "#3B82F6"; // Blue for info
    case "thank_you":
    case "general":
    default:
      return "#3B82F6"; // Blue for general
  }
}

/**
 * Get background color for icon container based on notification type
 */
function getIconBackgroundForType(type: NotificationType): string {
  switch (type) {
    case "request_match":
      return "#FEE2E2"; // Light red
    case "request_accepted":
      return "#D1FAE5"; // Light green
    case "eligibility_reminder":
      return "#DBEAFE"; // Light blue
    case "thank_you":
    case "general":
    default:
      return "#DBEAFE"; // Light blue
  }
}

/**
 * Notification card component matching Notifications.png design
 * - Left: Colored circular icon (44px)
 * - Center: Title (bold), Body (regular), Timestamp (caption)
 * - Right: Unread indicator (red dot, 8px)
 */
export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const isUnread = !notification.read;
  const iconName = getIconForType(notification.type);
  const iconColor = getIconColorForType(notification.type);
  const iconBackground = getIconBackgroundForType(notification.type);
  const timeDisplay = getTimeDisplay(notification.createdAt);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icon container */}
      <View style={[styles.iconContainer, { backgroundColor: iconBackground }]}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.body} numberOfLines={3}>
          {notification.body}
        </Text>
        <Text style={styles.timestamp}>{timeDisplay}</Text>
      </View>

      {/* Unread indicator */}
      {isUnread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: backgroundColors.card, // #FFFFFF
    borderRadius: radius.lg, // 12px
    padding: spacing(4), // 16px
    marginBottom: spacing(3), // 12px
    ...shadows.light,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22, // Full circle
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    marginLeft: spacing(3), // 12px
    marginRight: spacing(2), // 8px
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: textColors.primary, // #1F2937
    marginBottom: spacing(1), // 4px
  },
  body: {
    fontSize: 14,
    fontWeight: "400",
    color: textColors.secondary, // #6B7280
    lineHeight: 20,
    marginBottom: spacing(1), // 4px
  },
  timestamp: {
    fontSize: 12,
    fontWeight: "400",
    color: textColors.tertiary, // #9CA3AF
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: primaryColors.primary, // #E53935
    marginTop: spacing(1), // 4px offset from top
  },
});
