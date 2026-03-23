import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  textColors,
  primaryColors,
  backgroundColors,
  semanticColors,
  illustrationColors,
  shadows,
  spacing,
  radius,
  iconSpec,
} from "@/theme/tokens";
import { Id } from "@convex/_generated/dataModel";

type NotificationType =
  | "request_match"
  | "request_accepted"
  | "request_completed"
  | "request_cancelled"
  | "donor_withdrew"
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
      return "water"; // Blood drop for blood request
    case "request_accepted":
      return "checkmark-circle"; // Green checkmark
    case "request_completed":
      return "heart-circle"; // Completed donation
    case "request_cancelled":
    case "donor_withdrew":
      return "close-circle"; // Cancelled/withdrawn
    case "eligibility_reminder":
      return "calendar"; // Calendar for eligibility
    case "thank_you":
      return "heart"; // Heart for thank you
    case "general":
    default:
      return "notifications"; // Bell for general notifications
  }
}

/**
 * Get icon color based on notification type
 */
function getIconColorForType(type: NotificationType): string {
  switch (type) {
    case "request_match":
      return primaryColors.primary;
    case "request_accepted":
    case "request_completed":
      return semanticColors.success;
    case "request_cancelled":
    case "donor_withdrew":
      return semanticColors.warning;
    case "eligibility_reminder":
      return semanticColors.info;
    case "thank_you":
      return primaryColors.primary;
    case "general":
    default:
      return semanticColors.info;
  }
}

/**
 * Get background color for icon container based on notification type
 */
function getIconBackgroundForType(type: NotificationType): string {
  switch (type) {
    case "request_match":
      return primaryColors.primaryLight;
    case "request_accepted":
    case "request_completed":
      return illustrationColors.greenCircle;
    case "request_cancelled":
    case "donor_withdrew":
      return backgroundColors.chipInactive;
    case "eligibility_reminder":
      return backgroundColors.chipInactive;
    case "thank_you":
      return primaryColors.primaryLight;
    case "general":
    default:
      return backgroundColors.chipInactive;
  }
}

/**
 * Notification card component matching Notifications.png design
 * - Left: Colored circular icon (48px container, 24px icon)
 * - Center: Title (bold), Body (regular), Timestamp (caption)
 * - Right: Unread indicator (red dot, 10px with white border)
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
        <Ionicons name={iconName} size={iconSpec.md} color={iconColor} />
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
    borderRadius: radius.full,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: primaryColors.primary, // #E53935
    borderWidth: 2,
    borderColor: textColors.onPrimary,
    marginTop: spacing(1), // 4px offset from top
  },
});
