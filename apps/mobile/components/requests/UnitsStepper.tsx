import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  spacing,
  textColors,
  borderColors,
  fontWeight,
  headingStyles,
} from '@/theme/tokens';

interface UnitsStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/**
 * Units Stepper Component
 *
 * Horizontal stepper with minus/plus buttons matching CreateBloodRequest.png.
 * Shows "Units Needed" label above the stepper controls.
 */
export function UnitsStepper({
  value,
  onChange,
  min = 1,
  max = 10,
}: UnitsStepperProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  const handleDecrement = () => {
    if (canDecrement) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (canIncrement) {
      onChange(value + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Units Needed *</Text>
      <View style={styles.stepper}>
        <TouchableOpacity
          style={[styles.button, !canDecrement && styles.buttonDisabled]}
          onPress={handleDecrement}
          disabled={!canDecrement}
          activeOpacity={0.7}
        >
          <Ionicons
            name="remove"
            size={24}
            color={canDecrement ? textColors.primary : textColors.tertiary}
          />
        </TouchableOpacity>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, !canIncrement && styles.buttonDisabled]}
          onPress={handleIncrement}
          disabled={!canIncrement}
          activeOpacity={0.7}
        >
          <Ionicons
            name="add"
            size={24}
            color={canIncrement ? textColors.primary : textColors.tertiary}
          />
        </TouchableOpacity>
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
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: borderColors.default,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  valueContainer: {
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(4),
  },
  value: {
    fontSize: headingStyles.sectionTitle.fontSize,
    fontWeight: fontWeight.semibold,
    color: textColors.primary,
  },
});
