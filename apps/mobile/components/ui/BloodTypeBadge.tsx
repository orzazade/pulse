/**
 * BloodTypeBadge Component - Circular blood type indicator
 *
 * Features:
 * - Circular shape (full border radius)
 * - Primary red background (#E53935)
 * - Bold white text centered
 * - Two sizes: standard (44px) and large (50px)
 */

import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import {
  colors,
  fontWeight,
  bloodTypeBadgeSpec,
} from '../../theme';

// =============================================================================
// TYPES
// =============================================================================

export type BloodType =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';

export type BadgeSize = 'standard' | 'large';

export interface BloodTypeBadgeProps {
  /** Blood type to display */
  bloodType: BloodType | string;
  /** Badge size */
  size?: BadgeSize;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BloodTypeBadge({
  bloodType,
  size = 'standard',
  style,
}: BloodTypeBadgeProps) {
  const spec = size === 'large'
    ? bloodTypeBadgeSpec.large
    : bloodTypeBadgeSpec.standard;

  return (
    <View
      style={[
        styles.container,
        {
          width: spec.size,
          height: spec.size,
          borderRadius: spec.borderRadius,
          backgroundColor: spec.backgroundColor,
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Blood type ${bloodType}`}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: spec.fontSize,
          },
        ]}
      >
        {bloodType}
      </Text>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    color: colors.onPrimary,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
});

export default BloodTypeBadge;
