import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  bloodTypeChipSpec,
  spacing,
  textColors,
  fontWeight,
} from '@/theme/tokens';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

interface BloodTypeSelectorProps {
  value: string | null;
  onChange: (bloodType: string) => void;
}

/**
 * Blood Type Selector Grid
 *
 * 4x2 grid of blood type chips matching CreateBloodRequest.png design.
 * Active state: red border, light red background, red text
 * Inactive state: gray border, white background, dark text
 */
export function BloodTypeSelector({ value, onChange }: BloodTypeSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Blood Type Needed *</Text>
      <View style={styles.grid}>
        {BLOOD_TYPES.map((type) => {
          const isSelected = value === type;
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                isSelected ? styles.chipActive : styles.chipInactive,
              ]}
              onPress={() => onChange(type)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing(6),
  },
  label: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: textColors.primary,
    marginBottom: spacing(3),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
  },
  chip: {
    width: bloodTypeChipSpec.width,
    height: bloodTypeChipSpec.height,
    borderRadius: bloodTypeChipSpec.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInactive: {
    borderWidth: bloodTypeChipSpec.inactive.borderWidth,
    borderColor: bloodTypeChipSpec.inactive.borderColor,
    backgroundColor: bloodTypeChipSpec.inactive.backgroundColor,
  },
  chipActive: {
    borderWidth: bloodTypeChipSpec.active.borderWidth,
    borderColor: bloodTypeChipSpec.active.borderColor,
    backgroundColor: bloodTypeChipSpec.active.backgroundColor,
  },
  chipText: {
    fontSize: bloodTypeChipSpec.fontSize,
    fontWeight: bloodTypeChipSpec.fontWeight,
  },
  chipTextInactive: {
    color: bloodTypeChipSpec.inactive.textColor,
  },
  chipTextActive: {
    color: bloodTypeChipSpec.active.textColor,
  },
});
