import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { textColors, bodyStyles, spacing } from "@/theme/tokens";

interface SectionHeaderProps {
  title: string;
}

/**
 * Section header for notification list groupings (Today, Yesterday, dates)
 * Displays a simple label text with proper spacing
 */
export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing(5), // 20px
    paddingVertical: spacing(3), // 12px
    backgroundColor: "transparent",
  },
  title: {
    ...bodyStyles.label,
    fontWeight: "600",
    color: textColors.secondary, // #6B7280
  },
});
