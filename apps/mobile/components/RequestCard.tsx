import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "@convex/_generated/dataModel";
import { getTimeAgo } from "@/lib/timeFormat";
import {
  primaryColors,
  backgroundColors,
  textColors,
  semanticColors,
  shadows,
  radius,
  spacing,
  bloodTypeBadgeSpec,
} from "@/theme/tokens";

type RequestStatus = "open" | "accepted" | "cancelled" | "completed";

interface RequestCardProps {
  request: {
    _id: Id<"requests">;
    bloodType: string;
    urgency: string;
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
      return semanticColors.info;
    case "accepted":
      return semanticColors.success;
    case "cancelled":
      return textColors.secondary;
    case "completed":
      return textColors.secondary;
    default:
      return textColors.secondary;
  }
}

export function RequestCard({ request, variant, onPress }: RequestCardProps) {
  const isUrgent = request.urgency === "urgent" || request.urgency === "critical";
  const timeAgo = getTimeAgo(request.createdAt);

  // Generate title to match design: "Critical: B- Needed", "Urgent: B- Needed", or "O+ Needed"
  const title = request.urgency === "critical"
    ? `Critical: ${request.bloodType} Needed`
    : isUrgent
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
    padding: spacing(4),
    marginBottom: spacing(3),
    ...shadows.medium,
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
    backgroundColor: primaryColors.primary,
  },
  bloodTypeBadge: {
    width: bloodTypeBadgeSpec.large.size,
    height: bloodTypeBadgeSpec.large.size,
    borderRadius: bloodTypeBadgeSpec.large.borderRadius,
    backgroundColor: bloodTypeBadgeSpec.large.backgroundColor,
    justifyContent: "center",
    alignItems: "center",
  },
  bloodTypeText: {
    fontSize: bloodTypeBadgeSpec.large.fontSize,
    fontWeight: bloodTypeBadgeSpec.large.fontWeight,
    color: bloodTypeBadgeSpec.large.textColor,
  },
  content: {
    flex: 1,
    marginLeft: spacing(4),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: textColors.primary,
    flex: 1,
  },
  urgentDot: {
    width: spacing(2),
    height: spacing(2),
    borderRadius: radius.sm,
    backgroundColor: primaryColors.primary,
    marginLeft: spacing(2),
  },
  location: {
    fontSize: 14,
    color: textColors.secondary,
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: textColors.tertiary,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing(2),
  },
  statusBadge: {
    paddingHorizontal: spacing(2),
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  donorFoundText: {
    fontSize: 13,
    color: semanticColors.success,
    fontWeight: "500",
    marginLeft: spacing(2),
  },
});
