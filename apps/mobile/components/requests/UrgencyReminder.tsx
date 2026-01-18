import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  primaryColors,
  textColors,
  spacing,
  radius,
  bodyStyles,
  fontWeight,
} from "@/theme/tokens";

type UrgencyLevel = "critical" | "urgent" | "normal" | "standard";

interface UrgencyReminderProps {
  urgency: UrgencyLevel;
  message?: string;
  arrivalTime?: string;
}

export function UrgencyReminder({
  urgency,
  message,
  arrivalTime,
}: UrgencyReminderProps) {
  // Default messages based on urgency level
  const getDefaultMessage = () => {
    if (arrivalTime) {
      return `Please arrive by ${arrivalTime}. Every minute counts.`;
    }
    switch (urgency) {
      case "critical":
        return "Remember: Please donate as soon as possible. The patient is in critical need.";
      case "urgent":
        return "Please try to donate within the next few hours if possible.";
      case "normal":
      case "standard":
      default:
        return "Thank you for your willingness to help. Please coordinate with the requester.";
    }
  };

  // Only show urgency reminder for urgent/critical
  if (urgency === "normal" || urgency === "standard") {
    return null;
  }

  const displayMessage = message || getDefaultMessage();

  return (
    <View style={styles.container}>
      <View style={styles.leftBorder} />
      <View style={styles.content}>
        <Ionicons
          name="time-outline"
          size={20}
          color={primaryColors.primary}
          style={styles.icon}
        />
        <Text style={styles.message}>{displayMessage}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: primaryColors.primaryLight,
    borderRadius: radius.md,
    overflow: "hidden",
    marginBottom: spacing(6),
  },
  leftBorder: {
    width: 4,
    backgroundColor: primaryColors.primary,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing(4),
    paddingLeft: spacing(3),
  },
  icon: {
    marginRight: spacing(2),
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: bodyStyles.bodySmall.fontSize,
    fontWeight: fontWeight.medium,
    color: primaryColors.primary,
    lineHeight: bodyStyles.body.lineHeight,
  },
});
