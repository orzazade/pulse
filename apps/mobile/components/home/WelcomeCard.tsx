import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  primaryColors,
  backgroundColors,
  textColors,
  headingStyles,
  bodyStyles,
  shadows,
  radius,
  spacing,
  bloodTypeBadgeSpec,
} from '@/theme/tokens';

interface WelcomeCardProps {
  firstName: string;
  helpedCount: number;
  bloodType: string;
}

export function WelcomeCard({ firstName, helpedCount, bloodType }: WelcomeCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.welcomeText}>Welcome back, {firstName}</Text>
        <Text style={styles.helpedText}>You've helped {helpedCount} people</Text>
      </View>
      <View style={styles.bloodTypeBadge}>
        <Text style={styles.bloodTypeText}>{bloodType}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: backgroundColors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    ...shadows.light,
  },
  textContainer: {
    flex: 1,
  },
  welcomeText: {
    ...headingStyles.cardTitle,
    color: textColors.primary,
    marginBottom: spacing(1),
  },
  helpedText: {
    ...bodyStyles.bodySmall,
    color: textColors.secondary,
  },
  bloodTypeBadge: {
    width: bloodTypeBadgeSpec.standard.size,
    height: bloodTypeBadgeSpec.standard.size,
    borderRadius: bloodTypeBadgeSpec.standard.borderRadius,
    backgroundColor: bloodTypeBadgeSpec.standard.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodTypeText: {
    fontSize: bloodTypeBadgeSpec.standard.fontSize,
    fontWeight: bloodTypeBadgeSpec.standard.fontWeight,
    color: bloodTypeBadgeSpec.standard.textColor,
  },
});
