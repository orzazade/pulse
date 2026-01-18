/**
 * Button Component - Styled according to PNG specifications
 *
 * Variants:
 * - Primary: Red background (#E53935), white text, 52px height
 * - Secondary: Outlined/ghost, 48px height
 *
 * Features:
 * - Loading state with spinner
 * - Disabled state
 * - Touch feedback (opacity change)
 * - Full-width by default
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { colors, radius, spacing, fontWeight, shadows } from '../../theme';

// =============================================================================
// TYPES
// =============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'default' | 'small';

export interface ButtonProps {
  /** Button label text */
  children: string;
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Loading state - shows spinner */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Press handler */
  onPress?: () => void;
  /** Full width (default true) */
  fullWidth?: boolean;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Custom text style */
  textStyle?: StyleProp<TextStyle>;
  /** Accessibility label */
  accessibilityLabel?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  onPress,
  fullWidth = true,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Get styles based on variant
  const containerStyle = [
    styles.base,
    size === 'small' ? styles.small : styles.default,
    fullWidth && styles.fullWidth,
    variant === 'primary' && styles.primaryContainer,
    variant === 'secondary' && styles.secondaryContainer,
    variant === 'ghost' && styles.ghostContainer,
    isDisabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    size === 'small' && styles.labelSmall,
    variant === 'primary' && styles.primaryLabel,
    variant === 'secondary' && styles.secondaryLabel,
    variant === 'ghost' && styles.ghostLabel,
    isDisabled && styles.disabledLabel,
    textStyle,
  ];

  const spinnerColor =
    variant === 'primary' ? colors.onPrimary : colors.primary;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || children}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <Text style={labelStyle}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // Base styles
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg, // 12px
    paddingHorizontal: spacing[6], // 24px
  },

  // Size variations
  default: {
    height: 52,
  },
  small: {
    height: 44,
  },
  fullWidth: {
    width: '100%',
  },

  // Primary variant
  primaryContainer: {
    backgroundColor: colors.primary,
    ...shadows.medium,
  },
  primaryLabel: {
    color: colors.onPrimary,
  },

  // Secondary variant (outlined)
  secondaryContainer: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.default,
  },
  secondaryLabel: {
    color: colors.primary,
  },

  // Ghost variant (no border)
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostLabel: {
    color: colors.primary,
  },

  // Label styles
  label: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  labelSmall: {
    fontSize: 14,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  disabledLabel: {
    opacity: 0.8,
  },
});

export default Button;
