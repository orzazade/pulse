import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "@convex/_generated/dataModel";
import {
  primaryColors,
  backgroundColors,
  textColors,
  semanticColors,
  headingStyles,
  bodyStyles,
  shadows,
  radius,
  spacing,
} from "@/theme/tokens";

type RequestStatus = "open" | "accepted" | "cancelled" | "completed";

interface RequestCardProps {
  request: {
    _id: Id<"requests">;
    bloodType: string;
    urgency: "normal" | "urgent";
    city?: string;
    notes?: string;
    status: RequestStatus;
    createdAt: number;
    seeker?: {
      _id: Id<"users">;
      city?: string;
    } | null;
    acceptedDonor?: {
      _id: Id<"users">;
      bloodType?: string;
      city?: string;
    } | null;
  };
  variant: "seeker" | "donor";
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

function getStatusLabel(status: RequestStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "accepted":
      return "Accepted";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

function getStatusColor(status: RequestStatus): string {
  switch (status) {
    case "open":
      return semanticColors.info; // blue
    case "accepted":
      return semanticColors.success; // green
    case "cancelled":
      return textColors.tertiary; // gray
    case "completed":
      return "#8b5cf6"; // purple (no token for this yet)
    default:
      return textColors.tertiary;
  }
}

export function RequestCard({ request, variant, onPress }: RequestCardProps) {
  const isUrgent = request.urgency === "urgent";
  const timeAgo = getTimeAgo(request.createdAt);

  // Generate title to match design: "Urgent: B- Needed" or "O+ Needed"
  const title = isUrgent
    ? `Urgent: ${request.bloodType} Needed`
    : `${request.bloodType} Needed`;

  // Get location display text
  const locationText = request.city || request.seeker?.city || null;

  return (
    <TouchableOpacity
      style={[styles.card, isUrgent && styles.cardUrgent]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Urgent indicator border */}
      {isUrgent && <View style={styles.urgentBorder} />}

      {/* Blood type badge */}
      <View style={styles.bloodTypeBadge}>
        <Text style={styles.bloodTypeText}>{request.bloodType}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title row with urgency indicator */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {isUrgent && <View style={styles.urgentDot} />}
        </View>

        {/* Location */}
        {locationText && (
          <Text style={styles.location}>{locationText}</Text>
        )}

        {/* Time/distance row */}
        <Text style={styles.meta}>Posted {timeAgo}</Text>

        {/* Seeker variant: show status */}
        {variant === "seeker" && (
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(request.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(request.status) },
                ]}
              >
                {getStatusLabel(request.status)}
              </Text>
            </View>
            {request.status === "accepted" && (
              <Text style={styles.donorFoundText}>Donor found!</Text>
            )}
          </View>
        )}

      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={24} color={textColors.tertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: backgroundColors.card,
    borderRadius: radius.lg,
    padding: spacing(4), // 16px
    marginBottom: spacing(3), // 12px
    ...shadows.medium, // Consistent shadow with design tokens
    overflow: "hidden",
  },
  cardUrgent: {
    // Subtle background tint for urgent requests
  },
  urgentBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: primaryColors.primary, // Use primary red
  },
  bloodTypeBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: primaryColors.primary, // Use primary red
    justifyContent: "center",
    alignItems: "center",
  },
  bloodTypeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: textColors.onPrimary, // White text
  },
  content: {
    flex: 1,
    marginLeft: spacing(4), // 16px
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing(0.5), // 2px
  },
  title: {
    ...headingStyles.cardTitle, // 16px semibold
    color: textColors.primary,
    flex: 1,
  },
  urgentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: primaryColors.primary, // Use primary red
    marginLeft: spacing(2), // 8px
  },
  location: {
    ...bodyStyles.bodySmall, // 14px
    color: textColors.secondary,
    marginBottom: spacing(0.5), // 2px
  },
  meta: {
    ...bodyStyles.caption, // 12px
    color: textColors.tertiary,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing(2), // 8px
  },
  statusBadge: {
    paddingHorizontal: spacing(2), // 8px
    paddingVertical: spacing(0.75), // 3px
    borderRadius: radius.sm, // 4px
  },
  statusText: {
    ...bodyStyles.caption, // 12px
    fontWeight: "600",
  },
  donorFoundText: {
    fontSize: 13,
    color: semanticColors.success, // Green
    fontWeight: "500",
    marginLeft: spacing(2), // 8px
  },
});
