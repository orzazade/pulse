import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  backgroundColors,
  textColors,
  spacing,
  radius,
} from "@/theme/tokens";

interface TimelineInfoCardProps {
  neededBy: string;
  bloodType: string;
  units: number;
}

interface InfoItemProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={18} color={textColors.secondary} />
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text style={styles.itemValue}>{value}</Text>
    </View>
  );
}

/**
 * Get full blood type name
 */
function getBloodTypeName(bloodType: string): string {
  const typeMap: Record<string, string> = {
    "A+": "A+ (A Positive)",
    "A-": "A- (A Negative)",
    "B+": "B+ (B Positive)",
    "B-": "B- (B Negative)",
    "AB+": "AB+ (AB Positive)",
    "AB-": "AB- (AB Negative)",
    "O+": "O+ (O Positive)",
    "O-": "O- (O Negative)",
  };
  return typeMap[bloodType] || bloodType;
}

export function TimelineInfoCard({
  neededBy,
  bloodType,
  units,
}: TimelineInfoCardProps) {
  return (
    <View style={styles.card}>
      <InfoItem
        icon="calendar-outline"
        label="Needed by"
        value={neededBy}
      />
      <InfoItem
        icon="water-outline"
        label="Blood Type"
        value={getBloodTypeName(bloodType)}
      />
      <InfoItem
        icon="layers-outline"
        label="Units"
        value={`${units} unit${units !== 1 ? "s" : ""}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: backgroundColors.input, // Very subtle gray
    borderRadius: radius.lg, // 12px
    padding: spacing(4), // 16px
    width: "100%",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing(2), // 8px
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: backgroundColors.card,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing(3), // 12px
  },
  itemLabel: {
    fontSize: 12,
    color: textColors.secondary,
    width: 70,
  },
  itemValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: textColors.primary,
  },
});
