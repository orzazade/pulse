import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  spacing,
  textColors,
  primaryColors,
  borderColors,
  fontWeight,
  semanticColors,
} from '@/theme/tokens';

type UrgencyLevel = 'critical' | 'urgent' | 'standard';

interface UrgencyOption {
  value: UrgencyLevel;
  label: string;
  description: string;
  dotColor: string;
}

const URGENCY_OPTIONS: UrgencyOption[] = [
  {
    value: 'critical',
    label: 'Critical',
    description: 'Needed within hours',
    dotColor: semanticColors.error, // #EF4444
  },
  {
    value: 'urgent',
    label: 'Urgent',
    description: 'Needed within 24 hours',
    dotColor: semanticColors.warning, // #F59E0B
  },
  {
    value: 'standard',
    label: 'Standard',
    description: 'Needed within a few days',
    dotColor: semanticColors.success, // #10B981
  },
];

interface UrgencySelectorProps {
  value: UrgencyLevel;
  onChange: (urgency: UrgencyLevel) => void;
}

/**
 * Urgency Selector Component
 *
 * Three radio button options stacked vertically matching CreateBloodRequest.png.
 * Each option has: radio circle + label + description + colored indicator dot
 */
export function UrgencySelector({ value, onChange }: UrgencySelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Urgency *</Text>
      <View style={styles.options}>
        {URGENCY_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
              ]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                {/* Radio Circle */}
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>

                {/* Colored Dot */}
                <View style={[styles.colorDot, { backgroundColor: option.dotColor }]} />

                {/* Text Content */}
                <View style={styles.textContent}>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
              </View>
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
  options: {
    gap: spacing(3),
  },
  option: {
    borderWidth: 1,
    borderColor: borderColors.default,
    borderRadius: 12,
    padding: spacing(4),
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    borderColor: primaryColors.primary,
    borderWidth: 2,
    backgroundColor: primaryColors.primaryLight,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: borderColors.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing(3),
  },
  radioSelected: {
    borderColor: primaryColors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: primaryColors.primary,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing(3),
  },
  textContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: textColors.primary,
  },
  optionLabelSelected: {
    color: textColors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: textColors.secondary,
    marginTop: 2,
  },
});
