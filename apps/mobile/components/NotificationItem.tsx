import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "@convex/_generated/dataModel";

type NotificationType =
  | "request_match"
  | "request_accepted"
  | "eligibility_reminder";

interface NotificationItemProps {
  notification: {
    _id: Id<"notifications">;
    type: NotificationType;
    title: string;
    body: string;
    read: boolean;
    createdAt: number;
    data?: {
      requestId?: Id<"requests">;
    };
  };
  onPress: () => void;
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(timestamp).toLocaleDateString();
}

function getIconName(type: NotificationType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "request_match":
      return "water";
    case "request_accepted":
      return "checkmark-circle";
    case "eligibility_reminder":
      return "calendar";
    default:
      return "notifications";
  }
}

function getIconColor(type: NotificationType): string {
  switch (type) {
    case "request_match":
      return "#dc2626"; // red
    case "request_accepted":
      return "#22c55e"; // green
    case "eligibility_reminder":
      return "#3b82f6"; // blue
    default:
      return "#6b7280"; // gray
  }
}

export function NotificationItem({
  notification,
  onPress,
}: NotificationItemProps) {
  const timeAgo = getTimeAgo(notification.createdAt);
  const iconName = getIconName(notification.type);
  const iconColor = getIconColor(notification.type);
  const isUnread = !notification.read;

  return (
    <TouchableOpacity
      style={[styles.card, isUnread && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icon container */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: iconColor + "15" }, // 15% opacity background
        ]}
      >
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title and time */}
        <View style={styles.header}>
          <Text
            style={[styles.title, isUnread && styles.titleUnread]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
        </View>

        {/* Body */}
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>

      {/* Unread indicator */}
      {isUnread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    // Android shadow
    elevation: 1,
  },
  cardUnread: {
    backgroundColor: "#fef2f2", // Light red/pink tint for unread
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    flex: 1,
    marginRight: 8,
  },
  titleUnread: {
    fontWeight: "600",
    color: "#111827",
  },
  timeAgo: {
    fontSize: 12,
    color: "#9ca3af",
  },
  body: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dc2626",
  },
});
