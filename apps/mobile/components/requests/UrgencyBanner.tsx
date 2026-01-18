import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { primaryColors, semanticColors, textColors, spacing } from "@/theme/tokens";

type UrgencyLevel = "critical" | "urgent" | "standard";

interface UrgencyBannerProps {
  urgency: UrgencyLevel;
}

const urgencyConfig: Record<
  UrgencyLevel,
  { backgroundColor: string; label: string }
> = {
  critical: {
    backgroundColor: primaryColors.primary, // #E53935 red
    label: "CRITICAL - Needed within hours",
  },
  urgent: {
    backgroundColor: semanticColors.warning, // #F59E0B orange
    label: "URGENT - Needed within 1-2 days",
  },
  standard: {
    backgroundColor: semanticColors.success, // #10B981 green
    label: "STANDARD - Scheduled transfusion",
  },
};

export function UrgencyBanner({ urgency }: UrgencyBannerProps) {
  const config = urgencyConfig[urgency] || urgencyConfig.standard;

  return (
    <View style={[styles.banner, { backgroundColor: config.backgroundColor }]}>
      <Text style={styles.label}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: "100%",
    paddingVertical: spacing(3), // 12px
    paddingHorizontal: spacing(5), // 20px
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24, // Pill shape as shown in mockup
  },
  label: {
    color: textColors.onPrimary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
