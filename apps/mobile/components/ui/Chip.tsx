/**
 * Chip Component - Pill-shaped filter/selection chip
 *
 * Features:
 * - Active/inactive states with different colors
 * - Pill shape (large border radius)
 * - Touch feedback
 * - Various sizes (default, small)
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

import {
  colors,
  spacing,
  fontWeight,
  filterChipSpec,
  touchTargetSpec,
} from '../../theme';

// =============================================================================
// TYPES
// =============================================================================

export type ChipSize = 'default' | 'small';

export interface ChipProps {
  /** Chip label text */
  children: string;
  /** Active/selected state */
  active?: boolean;
  /** Chip size */
  size?: ChipSize;
  /** Press handler */
  onPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Custom text style */
  textStyle?: StyleProp<TextStyle>;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Chip({
  children,
  active = false,
  size = 'default',
  onPress,
  disabled = false,
  style,
  textStyle,
}: ChipProps) {
  const containerStyle = [
    styles.container,
    size === 'small' ? styles.small : styles.default,
    active ? styles.active : styles.inactive,
    disabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    size === 'small' && styles.labelSmall,
    active ? styles.labelActive : styles.labelInactive,
    textStyle,
  ];

  // Calculate hitSlop to meet 44px minimum touch target
  // Current height is 36px (default) or 28px (small)
  // Add 4px top/bottom for default (36 + 8 = 44), 8px for small (28 + 16 = 44)
  const hitSlop = size === 'small'
    ? { top: 8, bottom: 8, left: 4, right: 4 }
    : { top: 4, bottom: 4, left: 4, right: 4 };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
    >
      <Text style={labelStyle}>{children}</Text>
    </TouchableOpacity>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: filterChipSpec.borderRadius, // 18px (pill shape)
    paddingHorizontal: filterChipSpec.paddingHorizontal, // 12px
  },

  // Sizes
  default: {
    height: filterChipSpec.height, // 36px
  },
  small: {
    height: 28,
    paddingHorizontal: spacing[2], // 8px
  },

  // States
  active: {
    backgroundColor: filterChipSpec.active.backgroundColor, // primary red
  },
  inactive: {
    backgroundColor: filterChipSpec.inactive.backgroundColor, // light gray
  },

  disabled: {
    opacity: 0.5,
  },

  // Labels
  label: {
    fontSize: filterChipSpec.fontSize, // 14px
    fontWeight: filterChipSpec.fontWeight, // medium
  },
  labelSmall: {
    fontSize: 12,
  },
  labelActive: {
    color: filterChipSpec.active.textColor, // white
  },
  labelInactive: {
    color: filterChipSpec.inactive.textColor, // dark gray
  },
});

export default Chip;
