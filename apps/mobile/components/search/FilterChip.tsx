import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { filterChipSpec } from '@/theme/tokens';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: filterChipSpec.height,
    paddingHorizontal: filterChipSpec.paddingHorizontal,
    borderRadius: filterChipSpec.borderRadius,
    backgroundColor: filterChipSpec.inactive.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: filterChipSpec.active.backgroundColor,
  },
  label: {
    fontSize: filterChipSpec.fontSize,
    fontWeight: filterChipSpec.fontWeight,
    color: filterChipSpec.inactive.textColor,
  },
  labelActive: {
    color: filterChipSpec.active.textColor,
  },
});
