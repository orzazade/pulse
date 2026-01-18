import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  backgroundColors,
  textColors,
  primaryColors,
  shadows,
  spacing,
  radius,
} from "@/theme/tokens";

interface LocationCardProps {
  location: string;
  city?: string;
}

export function LocationCard({ location, city }: LocationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="location-sharp"
          size={20}
          color={primaryColors.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.location}>{location}</Text>
        {city && <Text style={styles.city}>{city}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: backgroundColors.card,
    borderRadius: radius.lg, // 12px
    padding: spacing(4), // 16px
    ...shadows.medium,
    width: "100%",
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing(3), // 12px
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: textColors.secondary,
    marginBottom: spacing(1), // 4px
  },
  location: {
    fontSize: 16,
    fontWeight: "600",
    color: textColors.primary,
    marginBottom: spacing(1), // 4px
  },
  city: {
    fontSize: 14,
    color: textColors.secondary,
  },
});
