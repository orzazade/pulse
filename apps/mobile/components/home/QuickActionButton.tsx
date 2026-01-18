import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  backgroundColors,
  textColors,
  illustrationColors,
  bodyStyles,
  shadows,
  radius,
  spacing,
} from '@/theme/tokens';

interface QuickActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}

export function QuickActionButton({ label, icon, onPress }: QuickActionButtonProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconCircle}>
        {icon}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    alignItems: 'center',
    ...shadows.light,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: illustrationColors.pinkCircle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  label: {
    ...bodyStyles.bodySmall,
    color: textColors.primary,
    textAlign: 'center',
  },
});
