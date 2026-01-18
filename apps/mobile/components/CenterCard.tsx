import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CenterCardProps {
  center: {
    _id: string;
    name: string;
    address: string;
    city: string;
    phone?: string;
    hours?: string;
  };
  distance?: number;
  onPress?: () => void;
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

/**
 * Handle phone call action
 */
const handleCall = (phone: string) => {
  const phoneUrl = `tel:${phone.replace(/\s/g, "")}`;
  Linking.openURL(phoneUrl);
};

export function CenterCard({ center, distance, onPress }: CenterCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Hospital/Building icon badge */}
      <View style={styles.iconBadge}>
        <Ionicons name="business" size={24} color="#fff" />
      </View>

      {/* Center info */}
      <View style={styles.infoContainer}>
        <Text style={styles.nameText} numberOfLines={2}>
          {center.name}
        </Text>
        <Text style={styles.addressText} numberOfLines={1}>
          {center.address}, {center.city}
        </Text>
        {center.hours && (
          <Text style={styles.hoursText} numberOfLines={1}>
            {center.hours}
          </Text>
        )}
        {distance !== undefined && (
          <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
        )}
      </View>

      {/* Call button or chevron */}
      {center.phone ? (
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCall(center.phone!)}
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={20} color="#fff" />
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
      )}
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
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2563eb", // Blue for centers (different from red blood drop)
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 2,
  },
  hoursText: {
    fontSize: 13,
    color: "#6b7280",
  },
  distanceText: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#16a34a", // Green for call
    justifyContent: "center",
    alignItems: "center",
  },
});
