import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  primaryColors,
  textColors,
  shadows,
  radius,
  spacing,
  specialStyles,
} from '@/theme/tokens';

interface EmergencyBroadcastButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export function EmergencyBroadcastButton({ onPress, disabled = false }: EmergencyBroadcastButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="megaphone" size={20} color={textColors.onPrimary} />
      </View>
      <Text style={styles.text}>Emergency Broadcast</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primaryColors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(6),
    ...shadows.large,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  iconContainer: {
    marginRight: spacing(2),
  },
  text: {
    ...specialStyles.button,
    color: textColors.onPrimary,
  },
});
