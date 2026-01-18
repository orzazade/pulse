import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "@convex/_generated/dataModel";

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
      return "#3b82f6"; // blue
    case "accepted":
      return "#22c55e"; // green
    case "cancelled":
      return "#6b7280"; // gray
    case "completed":
      return "#8b5cf6"; // purple
    default:
      return "#6b7280";
  }
}

export function RequestCard({ request, variant, onPress }: RequestCardProps) {
  const isUrgent = request.urgency === "urgent";
  const timeAgo = getTimeAgo(request.createdAt);

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
        {/* Top row: urgency + time */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.urgencyBadge,
              isUrgent ? styles.urgencyBadgeUrgent : styles.urgencyBadgeNormal,
            ]}
          >
            <Text
              style={[
                styles.urgencyText,
                isUrgent ? styles.urgencyTextUrgent : styles.urgencyTextNormal,
              ]}
            >
              {isUrgent ? "URGENT" : "Normal"}
            </Text>
          </View>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
        </View>

        {/* City if provided */}
        {request.city && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text style={styles.locationText}>{request.city}</Text>
          </View>
        )}

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

        {/* Donor variant: show seeker city if available */}
        {variant === "donor" && request.seeker?.city && (
          <Text style={styles.seekerCity}>Seeker in {request.seeker.city}</Text>
        )}
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
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
    backgroundColor: "#dc2626",
  },
  bloodTypeBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },
  bloodTypeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    marginLeft: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgencyBadgeUrgent: {
    backgroundColor: "#fef2f2",
  },
  urgencyBadgeNormal: {
    backgroundColor: "#f3f4f6",
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  urgencyTextUrgent: {
    color: "#dc2626",
  },
  urgencyTextNormal: {
    color: "#6b7280",
  },
  timeAgo: {
    fontSize: 12,
    color: "#9ca3af",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  donorFoundText: {
    fontSize: 13,
    color: "#22c55e",
    fontWeight: "500",
    marginLeft: 8,
  },
  seekerCity: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
});
