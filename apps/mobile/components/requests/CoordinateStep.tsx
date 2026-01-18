import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  textColors,
  backgroundColors,
  shadows,
  radius,
  spacing,
  headingStyles,
  bodyStyles,
  fontWeight,
  semanticColors,
} from "@/theme/tokens";

interface CoordinateStepProps {
  name: string;
  phone: string;
  onCall: () => void;
  onMessage: () => void;
}

export function CoordinateStep({
  name,
  phone,
  onCall,
  onMessage,
}: CoordinateStepProps) {
  // Get initials from name
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    const firstPart = parts[0];
    const lastPart = parts[parts.length - 1];
    if (parts.length >= 2 && firstPart && lastPart) {
      return `${firstPart[0]}${lastPart[0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>STEP 1: COORDINATE</Text>
      <View style={styles.card}>
        <View style={styles.leftSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.subtitle}>Requester</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={onCall}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={onMessage}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing(4),
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
    color: textColors.secondary,
    letterSpacing: 0.5,
    marginBottom: spacing(2),
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: backgroundColors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    ...shadows.light,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing(3),
  },
  avatarText: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: textColors.secondary,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: headingStyles.cardTitle.fontSize,
    fontWeight: headingStyles.cardTitle.fontWeight,
    color: textColors.primary,
    lineHeight: headingStyles.cardTitle.lineHeight,
  },
  subtitle: {
    fontSize: bodyStyles.bodySmall.fontSize,
    fontWeight: bodyStyles.bodySmall.fontWeight,
    color: textColors.secondary,
    lineHeight: bodyStyles.bodySmall.lineHeight,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing(2),
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  callButton: {
    backgroundColor: semanticColors.success,
  },
  messageButton: {
    backgroundColor: semanticColors.info,
  },
});
