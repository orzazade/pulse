import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "@convex/_generated/dataModel";

interface DonorCardProps {
  donor: {
    _id: Id<"users">;
    bloodType?: string;
    city?: string;
    region?: string;
  };
  onPress: () => void;
  distance?: number; // Distance in meters (for nearby search)
}

/**
 * Format distance for display
 * Shows km if >= 1000m, otherwise meters
 */
const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km away`;
  }
  return `${Math.round(meters)}m away`;
};

export function DonorCard({ donor, onPress, distance }: DonorCardProps) {
  const locationText =
    donor.city && donor.region
      ? `${donor.city}, ${donor.region}`
      : donor.city || donor.region || "Location not specified";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Blood type badge */}
      <View style={styles.bloodTypeBadge}>
        <Text style={styles.bloodTypeText}>{donor.bloodType || "?"}</Text>
      </View>

      {/* Location info */}
      <View style={styles.infoContainer}>
        <Text style={styles.locationText}>{locationText}</Text>
        {distance !== undefined && (
          <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
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
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  locationText: {
    fontSize: 16,
    color: "#374151",
  },
  distanceText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
});
